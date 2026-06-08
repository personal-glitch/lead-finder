// Punkt 2 + 3: Impressum-Scraping (reines fetch + Regex, KEIN cheerio) und
// findBestContact (Rollen-Priorität pro Branche).
//
// Telefon wird bewusst über den vorhandenen DE-Parser ermittelt (nicht über die
// einfache Spec-Regex), weil der HRB-/USt-/Steuer-Nummern aussortiert.
import { config } from "@/lib/config";
import { extractPhoneNumbers, pickBestPhone } from "@/lib/phone/parse-de";
import { BRANCHEN, type BrancheKey } from "./branchen";

export interface ImpressumResult {
  impressumUrl: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  contactRole: string | null;
}

const EMPTY: ImpressumResult = {
  impressumUrl: null, phone: null, email: null, contactName: null, contactRole: null,
};

// Pfade laut Vorgabe (Reihenfolge = Priorität).
const STANDARD_PATHS = [
  "/impressum", "/impressum/", "/impressum.html", "/impressum.php",
  "/imprint", "/legal/impressum", "/de/impressum",
  "/kontakt/impressum", "/footer/impressum",
];

// Kontakt-/Team-Seiten, auf denen Ansprechpersonen oft stehen (Fallback, wenn
// das Impressum keinen Namen hergibt).
const CONTACT_PATHS = [
  "/kontakt", "/kontakt/", "/team", "/ueber-uns", "/ueber-uns/",
  "/ansprechpartner", "/unternehmen", "/ueber-mich",
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).toString();
  } catch {
    return null;
  }
}

async function fetchText(url: string, timeoutMs = config.enrich.fetchTimeoutMs): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": config.osm.userAgent, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (ct && !/text\/html|xhtml|text\/plain/i.test(ct)) return null;
    return (await res.text()).slice(0, config.enrich.maxHtmlBytes);
  } catch {
    return null; // Timeout / DNS / TLS – höflich ignorieren
  }
}

/** Ersten Link finden, dessen href den Suchbegriff (Regex-Alternation) enthält. */
function findHref(html: string, base: string, pattern: string): string | null {
  const m = html.match(new RegExp(`href=["']([^"']*(?:${pattern})[^"']*)["']`, "i"));
  if (!m) return null;
  try { return new URL(m[1], base).toString(); } catch { return null; }
}
function findImpressumHref(html: string, base: string): string | null {
  return findHref(html, base, "impressum|imprint");
}

function isImpressum(html: string, url: string): boolean {
  if (/impressum|imprint/i.test(url)) return true;
  return /impressum|vertreten durch|angaben gem(?:ä|ae)ß\s*§?\s*5|§\s*5\s*tmg/i.test(html);
}

/** HTML → Text mit grober Zeilenstruktur (für die Regex-Heuristiken). */
function toText(html: string): string {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|tr|h[1-6]|address|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  s = s
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&auml;/gi, "ä").replace(/&ouml;/gi, "ö").replace(/&uuml;/gi, "ü")
    .replace(/&Auml;/g, "Ä").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/gi, "ß")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  return s.replace(/[ \t ]+/g, " ").replace(/\n{2,}/g, "\n").trim();
}

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
// Generische Postfächer (keine konkrete Person) – nachrangig.
const GENERIC_LOCAL =
  /^(?:info|kontakt|contact|office|mail|e?mail|post|service|hallo|hello|welcome|team|zentrale|empfang|sekretariat|buchhaltung|rechnung|newsletter|no-?reply|noreply|webmaster|admin|support|praxis|kanzlei)\b/i;
function emailScore(e: string): number {
  const local = e.split("@")[0];
  if (GENERIC_LOCAL.test(local)) return 0; // info@, kontakt@ …
  if (/[._-]/.test(local)) return 2; // vorname.nachname@ – wahrscheinlich Person
  return 1;
}
function extractEmail(text: string): string | null {
  const all = text.match(EMAIL_RE) ?? [];
  const good = all
    .map((e) => e.toLowerCase())
    .filter((e) => !/(example\.|sentry|wixpress|\.png|\.jpe?g|@2x|@sentry|\.gif)/.test(e));
  if (good.length === 0) return null;
  // Persönliche Adressen bevorzugen; bei Gleichstand erste Fundstelle (stabil).
  return [...new Set(good)].sort((a, b) => emailScore(b) - emailScore(a))[0] ?? null;
}

function cleanName(raw: string): string | null {
  let s = raw.split(
    /\b(?:Tel\.?|Telefon|Fax|E-?Mail|Mail|USt|HRB|HRA|Registergericht|Amtsgericht|Handelsregister|Steuernummer)\b|[,;·|•\n]/i,
  )[0].trim();
  // Anreden/Titel mehrfach entfernen
  s = s.replace(/^(?:(?:Herr|Frau|Dr\.?|Prof\.?|Dipl\.[-\w]*|med\.?|Rechtsanw\w*|RA)\s+)+/i, "").trim();
  s = s.replace(/[\s.,;:–-]+$/u, "").trim();
  if (s.length < 2 || s.length > 60) return null;
  if (!/[A-Za-zÄÖÜäöüß]/.test(s)) return null;
  if (/^\d+$/.test(s)) return null;
  return s;
}

// Generische Rollen (weibliche/spezifische Form zuerst, damit „…in" nicht
// fälschlich abgeschnitten wird). Werden nach den branchenspezifischen Tiers
// versucht; „Kontakt" ganz zuletzt als schwächstes Signal.
const GENERIC_FALLBACK = [
  "Ansprechpartnerin", "Ansprechpartner",
  "Geschäftsführerin", "Geschäftsführer", "Geschäftsführung",
  "Inhaberin", "Inhaber", "Praxisinhaberin", "Praxisinhaber",
  "Geschäftsinhaberin", "Geschäftsinhaber",
  "Eigentümerin", "Eigentümer",
  "Gesellschafterin", "Gesellschafter",
  "Niederlassungsleiterin", "Niederlassungsleiter", "Betriebsleiterin", "Betriebsleiter",
  "vertreten durch",
];

// Mehrwort-Name (Vor- + Nachname, optional weitere Bestandteile).
const NAME_CORE = "[A-ZÄÖÜ][\\wäöüß.'-]+(?:\\s+[A-ZÄÖÜ][\\wäöüß.'-]+){1,3}";

/**
 * Wendet die Rollen-Priorität der Branche an. Für jede Rolle werden zwei
 * Schreibweisen geprüft: „Rolle: Name" und „Name, Rolle". Erster Treffer gewinnt.
 */
export function findBestContact(
  text: string,
  branche: BrancheKey | string,
): { name: string; role: string } | null {
  // branche kann auch ein freies Stichwort (Joker) sein → dann nur generische Rollen.
  const def = BRANCHEN[branche as BrancheKey];
  const tiers = [...(def?.roleTiers ?? []), GENERIC_FALLBACK, ["Kontakt"]];
  for (const tier of tiers) {
    for (const role of tier) {
      const r = escapeRe(role);
      // (a) Rolle vor dem Namen: „Geschäftsführer: Max Mustermann"
      let m = text.match(new RegExp(`${r}[ \\t:.\\-–]*\\n?[ \\t]*([A-ZÄÖÜ][\\wäöüß.\\-' ]{2,80})`, "i"));
      let name = m ? cleanName(m[1]) : null;
      // (b) Name vor der Rolle: „Max Mustermann, Geschäftsführer" / „… (Inhaber)"
      if (!name) {
        const m2 = text.match(new RegExp(`(${NAME_CORE})\\s*[,(\\-–]+\\s*${r}\\b`, "i"));
        name = m2 ? cleanName(m2[1]) : null;
      }
      if (name) return { name, role };
    }
  }
  return null;
}

/**
 * Holt das Impressum (probiert Standardpfade + entdeckten Footer-Link) und
 * extrahiert Telefon, E-Mail und – bei gegebener Branche – die beste Ansprechperson.
 */
export async function scrapeImpressum(
  websiteUrl: string,
  branche?: BrancheKey | string,
): Promise<ImpressumResult> {
  const base = normalizeUrl(websiteUrl);
  if (!base) return EMPTY;
  const origin = new URL(base).origin;

  // Startseite holen → Footer-Link zum Impressum entdecken.
  const home = await fetchText(base);
  const candidates: string[] = [];
  if (home) {
    const discovered = findImpressumHref(home, base);
    if (discovered) candidates.push(discovered);
  }
  for (const p of STANDARD_PATHS) candidates.push(origin + p);

  // Höflich: max. ~5 Kandidaten, parallel; ersten gültigen in Prioritätsreihenfolge nehmen.
  const unique = [...new Set(candidates)].slice(0, 5);
  const pages = await Promise.all(unique.map(async (url) => ({ url, html: await fetchText(url) })));
  let impressum = pages.find((p) => p.html && isImpressum(p.html, p.url));

  // Manche kleine Sites haben das Impressum auf der Startseite.
  if (!impressum && home && isImpressum(home, base)) impressum = { url: base, html: home };
  if (!impressum?.html) return EMPTY;

  const brancheKey = branche ?? "Büro & Unternehmen";
  const text = toText(impressum.html);
  let phone = pickBestPhone(extractPhoneNumbers(text))?.normalized ?? null;
  let email = extractEmail(text);
  let contact = findBestContact(text, brancheKey);

  // Startseite ist oft die beste Quelle für Telefon (steht prominent im Header/Footer).
  if (home && (!phone || !email)) {
    const htext = toText(home);
    if (!phone) phone = pickBestPhone(extractPhoneNumbers(htext))?.normalized ?? null;
    if (!email) email = extractEmail(htext);
  }

  // Fehlt noch etwas (Name/Telefon/E-Mail), Kontakt-/Team-/Über-uns-Seiten nachladen.
  if (!contact || !phone || !email) {
    const more: string[] = [];
    if (home) {
      const h = findHref(home, base, "kontakt|team|ueber-uns|über-uns|ansprechpartner|unternehmen");
      if (h) more.push(h);
    }
    for (const p of CONTACT_PATHS) more.push(origin + p);
    const extra = [...new Set(more)].filter((u) => u !== impressum.url).slice(0, 3);
    const extraPages = await Promise.all(extra.map((u) => fetchText(u)));
    for (const h of extraPages) {
      if (!h) continue;
      const t2 = toText(h);
      if (!contact) contact = findBestContact(t2, brancheKey);
      if (!phone) phone = pickBestPhone(extractPhoneNumbers(t2))?.normalized ?? null;
      if (!email) email = extractEmail(t2);
      if (contact && phone && email) break;
    }
  }

  return {
    impressumUrl: impressum.url,
    phone,
    email,
    contactName: contact?.name ?? null,
    contactRole: contact?.role ?? null,
  };
}
