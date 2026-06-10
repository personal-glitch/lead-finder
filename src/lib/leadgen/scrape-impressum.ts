// Punkt 2 + 3: Impressum-Scraping (reines fetch + Regex, KEIN cheerio) und
// findBestContact (Rollen-Priorität pro Branche).
//
// Telefon wird bewusst über den vorhandenen DE-Parser ermittelt (nicht über die
// einfache Spec-Regex), weil der HRB-/USt-/Steuer-Nummern aussortiert.
import { config } from "@/lib/config";
import { extractPhoneNumbers, pickBestPhone } from "@/lib/phone/parse-de";
import { BRANCHEN, type BrancheKey } from "./branchen";

export interface ImpressumContact {
  name: string;
  role: string | null;
}
export interface ImpressumPhone {
  number: string;
  e164: string | null;
  label: "tel" | "mobil" | "fax" | null;
}

export interface ImpressumResult {
  impressumUrl: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  contactRole: string | null;
  // v2: alle gefundenen Kontaktwege (für das Detail-Fenster).
  emails: string[];
  phones: ImpressumPhone[];
  contacts: ImpressumContact[];
}

const EMPTY: ImpressumResult = {
  impressumUrl: null, phone: null, email: null, contactName: null, contactRole: null,
  emails: [], phones: [], contacts: [],
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
function cleanEmails(text: string): string[] {
  const all = text.match(EMAIL_RE) ?? [];
  const good = all
    .map((e) => e.toLowerCase())
    .filter((e) => !/(example\.|sentry|wixpress|\.png|\.jpe?g|@2x|@sentry|\.gif|\.webp|\.svg)/.test(e));
  // Persönliche Adressen zuerst (vorname.nachname@), generische (info@) danach.
  return [...new Set(good)].sort((a, b) => emailScore(b) - emailScore(a));
}
/** ALLE E-Mails aus mehreren Texten, dedupliziert, persönliche zuerst. Cap 8. */
function extractAllEmails(texts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of texts.flatMap(cleanEmails)) {
    if (!seen.has(e)) { seen.add(e); out.push(e); }
  }
  return out
    .sort((a, b) => emailScore(b) - emailScore(a))
    .slice(0, 8);
}

// Menü-/Navigations- & Seitenwörter, die KEINE Personennamen sind.
const NAME_JUNK = new Set([
  "faq", "kontakt", "impressum", "datenschutz", "startseite", "home", "leistungen",
  "leistung", "über uns", "ueber uns", "team", "aktuelles", "news", "anfahrt",
  "öffnungszeiten", "galerie", "jobs", "karriere", "angebot", "angebote", "service",
  "services", "produkte", "shop", "blog", "presse", "downloads", "sitemap", "cookie",
  "cookies", "agb", "navigation", "menü", "menu", "suche", "login", "anmelden",
  "termin", "termine", "online", "mehr", "weiterlesen", "willkommen", "herzlich",
  "aktuell", "standort", "standorte", "filiale", "filialen", "newsletter",
]);
// Wörter, die auf einen Satz statt einen Namen hindeuten.
const SENTENCE_WORDS = new Set([
  "sie", "uns", "unter", "wir", "ihnen", "ihre", "ihren", "ihr", "bitte", "hier",
  "und", "oder", "der", "die", "das", "mit", "für", "von", "zur", "zum", "im",
  "am", "auf", "ist", "sind", "wird", "werden", "haben", "können", "gerne",
]);

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
  if (NAME_JUNK.has(s.toLowerCase())) return null;

  // Ein Personenname besteht aus mind. 2 Wörtern (Vor- + Nachname), beide
  // großgeschrieben. Das filtert „FAQ", „Kontakt", Satzfragmente etc. zuverlässig.
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return null;
  if (tokens.some((w) => SENTENCE_WORDS.has(w.toLowerCase()) || NAME_JUNK.has(w.toLowerCase()))) return null;
  const looksName = (w: string) => /^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.'-]+$/.test(w);
  if (!looksName(tokens[0]) || !looksName(tokens[tokens.length - 1])) return null;
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
  // Hinweis: bewusst KEINE generische „Kontakt"-Stufe mehr – die griff Menü-
  // Einträge („Kontakt", „FAQ") statt echter Namen.
  const tiers = [...(def?.roleTiers ?? []), GENERIC_FALLBACK];
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
 * Sammelt MEHRERE Ansprechpersonen (Name + Rolle) aus dem Text – für das
 * Detail-Fenster. Reihenfolge nach Rollen-Priorität; Dubletten (gleicher Name)
 * werden zusammengeführt. Cap 6.
 */
export function findAllContacts(
  text: string,
  branche: BrancheKey | string,
): { name: string; role: string }[] {
  const def = BRANCHEN[branche as BrancheKey];
  const tiers = [...(def?.roleTiers ?? []), GENERIC_FALLBACK];
  const byName = new Map<string, { name: string; role: string }>();
  for (const tier of tiers) {
    for (const role of tier) {
      const r = escapeRe(role);
      // (a) Rolle vor dem Namen
      const reA = new RegExp(`${r}[ \\t:.\\-–]*\\n?[ \\t]*([A-ZÄÖÜ][\\wäöüß.\\-' ]{2,80})`, "gi");
      // (b) Name vor der Rolle
      const reB = new RegExp(`(${NAME_CORE})\\s*[,(\\-–]+\\s*${r}\\b`, "gi");
      for (const m of text.matchAll(reA)) {
        const name = cleanName(m[1]);
        if (name && !byName.has(name.toLowerCase())) byName.set(name.toLowerCase(), { name, role });
      }
      for (const m of text.matchAll(reB)) {
        const name = cleanName(m[1]);
        if (name && !byName.has(name.toLowerCase())) byName.set(name.toLowerCase(), { name, role });
      }
      if (byName.size >= 6) break;
    }
    if (byName.size >= 6) break;
  }
  return [...byName.values()].slice(0, 6);
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

  // Texte aller relevanten Seiten sammeln: Impressum + Startseite + Kontakt/Team.
  // (Kontakt-/Team-Seiten IMMER mitnehmen → mehr Ansprechpartner/Kontaktwege.)
  const pageTexts: string[] = [toText(impressum.html)];
  if (home && home !== impressum.html) pageTexts.push(toText(home));

  const more: string[] = [];
  if (home) {
    const h = findHref(home, base, "kontakt|team|ueber-uns|über-uns|ansprechpartner|unternehmen");
    if (h) more.push(h);
  }
  for (const p of CONTACT_PATHS) more.push(origin + p);
  const extra = [...new Set(more)].filter((u) => u !== impressum.url).slice(0, 3);
  const extraPages = await Promise.all(extra.map((u) => fetchText(u)));
  for (const h of extraPages) if (h) pageTexts.push(toText(h));

  // ── Listen über alle Seiten berechnen ──
  const emails = extractAllEmails(pageTexts);

  // Telefon/Mobil/Fax: über alle Seiten, dedupliziert (nach E.164), Tel zuerst.
  const seenPhone = new Set<string>();
  const phoneParsed = pageTexts.flatMap(extractPhoneNumbers).filter((p) => {
    const k = p.e164 ?? p.normalized;
    if (seenPhone.has(k)) return false;
    seenPhone.add(k);
    return true;
  });
  const rank = (l: ImpressumPhone["label"]) => (l === "tel" ? 0 : l == null ? 1 : l === "mobil" ? 2 : 3);
  phoneParsed.sort((a, b) => rank(a.label) - rank(b.label));
  const phones: ImpressumPhone[] = phoneParsed
    .slice(0, 6)
    .map((p) => ({ number: p.normalized, e164: p.e164, label: p.label }));

  // Mehrere Ansprechpersonen über alle Seiten.
  const contactsMap = new Map<string, { name: string; role: string }>();
  for (const t of pageTexts) {
    for (const c of findAllContacts(t, brancheKey)) {
      if (!contactsMap.has(c.name.toLowerCase())) contactsMap.set(c.name.toLowerCase(), c);
    }
  }
  const contacts = [...contactsMap.values()].slice(0, 6);

  // „Beste" Einzelwerte (primäre Anzeige / Abwärtskompatibilität).
  const phone = pickBestPhone(phoneParsed)?.normalized ?? null;
  const email = emails[0] ?? null;
  const bestContact = contacts[0] ?? null;

  return {
    impressumUrl: impressum.url,
    phone,
    email,
    contactName: bestContact?.name ?? null,
    contactRole: bestContact?.role ?? null,
    emails,
    phones,
    contacts: contacts.map((c) => ({ name: c.name, role: c.role })),
  };
}
