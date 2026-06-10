// Website-Finder: ermittelt die offizielle Firmen-Website per keyless Web-Suche,
// wenn OpenStreetMap/Nominatim keine Website kennt. Danach kann das vorhandene
// Impressum-Scraping (scrape-impressum.ts) Telefon/E-Mail/Ansprechpartner auslesen.
//
// Strategie (kostenlos, ohne API-Key, von Vercel erreichbar):
//   1. DuckDuckGo HTML  (html.duckduckgo.com/html)
//   2. DuckDuckGo Lite  (lite.duckduckgo.com/lite)
//   3. Bing             (www.bing.com/search)
// Aus den organischen Treffern wird die erste plausible FIRMEN-Domain genommen –
// Branchenverzeichnisse, Karten und Social-Media werden ausgefiltert.

// Browser-ähnlicher User-Agent: Suchmaschinen blocken Bot-UAs eher.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Verzeichnisse, Karten, Social, Bewertungs- & Jobportale: KEINE eigene Firmenseite.
const BLOCKLIST = [
  "facebook.com", "instagram.com", "linkedin.com", "xing.com", "youtube.com",
  "youtu.be", "twitter.com", "x.com", "tiktok.com", "pinterest.de", "pinterest.com",
  "yelp.com", "yelp.de", "gelbeseiten.de", "11880.com", "dasoertliche.de",
  "dastelefonbuch.de", "das-telefonbuch.de", "telefonbuch.de", "wlw.de",
  "europages.de", "cylex.de", "cylex-branchenbuch.de", "golocal.de",
  "meinestadt.de", "kennstdueinen.de", "firmenwissen.de", "firmeneintrag.de",
  "northdata.de", "companyhouse.de", "unternehmensregister.de", "handelsregister.de",
  "wikipedia.org", "wikidata.org", "google.com", "google.de", "bing.com",
  "duckduckgo.com", "amazon.de", "amazon.com", "ebay.de", "kleinanzeigen.de",
  "ebay-kleinanzeigen.de", "indeed.com", "stepstone.de", "kununu.com",
  "trustpilot.com", "provenexpert.com", "jameda.de", "immobilienscout24.de",
  "openstreetmap.org", "apple.com", "booking.com", "tripadvisor.de", "tripadvisor.com",
  "branchenbuch24.com", "marktplatz-mittelstand.de", "werkenntdenbesten.de",
  "yellowmap.de", "stadtbranchenbuch.com", "go-yp.com", "hotfrog.de",
];

function isAggregator(host: string): boolean {
  const h = host.replace(/^www\./i, "").toLowerCase();
  return BLOCKLIST.some((b) => h === b || h.endsWith("." + b));
}

/** Liefert die registrierbare Host-Domain einer URL (ohne www), oder null. */
function hostOf(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

/** DuckDuckGo-Redirect (…/l/?uddg=ENCODED) auf die Ziel-URL auflösen. */
function resolveDdg(href: string): string | null {
  try {
    const u = new URL(href.startsWith("//") ? "https:" + href : href, "https://duckduckgo.com");
    if (/duckduckgo\.com$/i.test(u.host.replace(/^www\./i, "")) && u.searchParams.get("uddg")) {
      return u.searchParams.get("uddg");
    }
    if (/^https?:$/i.test(u.protocol)) return u.toString();
    return null;
  } catch {
    return null;
  }
}

async function fetchSearch(url: string, body?: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "de-DE,de;q=0.9",
        ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      },
      body,
      signal: AbortSignal.timeout(8_000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Alle href-Werte in Reihenfolge aus einem HTML extrahieren (nur http/https-relevante). */
function hrefs(html: string): string[] {
  const out: string[] = [];
  const re = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

/** Erste plausible Firmen-URL aus einer Trefferliste auswählen. */
function pickCompany(urls: string[]): string | null {
  for (const raw of urls) {
    const resolved = resolveDdg(raw) ?? raw;
    const host = hostOf(resolved);
    if (!host) continue;
    if (isAggregator(host)) continue;
    if (!/^https?:\/\//i.test(resolved)) continue;
    return resolved;
  }
  return null;
}

async function viaDuckDuckGoHtml(q: string): Promise<string | null> {
  const html = await fetchSearch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q));
  if (!html) return null;
  // Nur die organischen Ergebnis-Links (class="result__a") betrachten.
  const links: string[] = [];
  const re = /class="result__a"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="result__a"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) links.push(m[1] ?? m[2]);
  return pickCompany(links.length ? links : hrefs(html));
}

async function viaDuckDuckGoLite(q: string): Promise<string | null> {
  const html = await fetchSearch("https://lite.duckduckgo.com/lite/", "q=" + encodeURIComponent(q));
  if (!html) return null;
  return pickCompany(hrefs(html));
}

async function viaBing(q: string): Promise<string | null> {
  const html = await fetchSearch("https://www.bing.com/search?setlang=de&q=" + encodeURIComponent(q));
  if (!html) return null;
  // Bing-Organik: <h2><a href="…"> innerhalb von li.b_algo.
  const links: string[] = [];
  const re = /<h2>\s*<a[^>]*href="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) links.push(m[1]);
  return pickCompany(links.length ? links : hrefs(html));
}

// Prozess-weiter Cache (pro Server-Instanz), um dieselbe Firma in einem
// Batch-Lauf nicht mehrfach zu suchen. Key = name|ort (klein).
const memo = new Map<string, string | null>();

/**
 * Sucht die offizielle Website einer Firma. Gibt die URL zurück oder null,
 * wenn nichts Plausibles gefunden wurde. Niemals werfend – Anreicherung
 * funktioniert auch ohne Fund weiter.
 */
export async function discoverWebsite(
  name: string | null | undefined,
  ort: string | null | undefined,
): Promise<string | null> {
  const n = (name ?? "").trim();
  if (n.length < 3) return null;
  const key = `${n}|${(ort ?? "").trim()}`.toLowerCase();
  if (memo.has(key)) return memo.get(key) ?? null;

  const q = [n, (ort ?? "").trim(), "Impressum"].filter(Boolean).join(" ");

  let url: string | null = null;
  for (const engine of [viaDuckDuckGoHtml, viaDuckDuckGoLite, viaBing]) {
    try {
      url = await engine(q);
    } catch {
      url = null;
    }
    if (url) break;
  }

  // Plausibilitätscheck: Domain sollte einen Wortbestandteil des Firmennamens
  // enthalten ODER zumindest keine offensichtliche Fremd-Domain sein. Wir sind
  // bewusst großzügig (kleine Firmen haben oft kryptische Domains), filtern aber
  // grobe Fehlgriffe über die Aggregator-Blockliste (bereits in pickCompany).
  memo.set(key, url);
  return url;
}
