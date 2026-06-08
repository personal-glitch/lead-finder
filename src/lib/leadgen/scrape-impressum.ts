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

function findImpressumHref(html: string, base: string): string | null {
  const m = html.match(/href=["']([^"']*(?:impressum|imprint)[^"']*)["']/i);
  if (!m) return null;
  try { return new URL(m[1], base).toString(); } catch { return null; }
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
function extractEmail(text: string): string | null {
  const all = text.match(EMAIL_RE) ?? [];
  const good = all
    .map((e) => e.toLowerCase())
    .filter((e) => !/(example\.|sentry|wixpress|\.png|\.jpe?g|@2x|@sentry)/.test(e));
  return good[0] ?? null;
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

const GENERIC_FALLBACK = ["Geschäftsführer", "Geschäftsführung", "vertreten durch", "Inhaber", "Praxisinhaber"];

/**
 * Wendet die Rollen-Priorität der Branche an: sucht Tier für Tier nach einer
 * Rolle und greift den unmittelbar folgenden Namen ab. Erster Treffer gewinnt.
 */
export function findBestContact(
  text: string,
  branche: BrancheKey | string,
): { name: string; role: string } | null {
  // branche kann auch ein freies Stichwort (Joker) sein → dann nur generische Rollen.
  const def = BRANCHEN[branche as BrancheKey];
  const tiers = [...(def?.roleTiers ?? []), GENERIC_FALLBACK];
  for (const tier of tiers) {
    for (const role of tier) {
      // Rolle, dann (auf gleicher Zeile oder direkt darunter) ein Name.
      const re = new RegExp(
        `${escapeRe(role)}[ \\t:.\\-]*\\n?[ \\t]*([A-ZÄÖÜ][\\wäöüß.\\-' ]{2,80})`,
        "i",
      );
      const m = text.match(re);
      if (m) {
        const name = cleanName(m[1]);
        if (name) return { name, role };
      }
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

  const text = toText(impressum.html);
  const phone = pickBestPhone(extractPhoneNumbers(text))?.normalized ?? null;
  const contact = findBestContact(text, branche ?? "Büro & Unternehmen");

  return {
    impressumUrl: impressum.url,
    phone,
    email: extractEmail(text),
    contactName: contact?.name ?? null,
    contactRole: contact?.role ?? null,
  };
}
