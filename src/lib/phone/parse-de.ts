// Erkennung deutscher Telefonnummern aus freiem Text (z. B. Impressen).
//
// Strategie (wichtig gegen False Positives):
//   1. ZUERST den Kontext maskieren: Handelsregister-, Steuer-, USt-, IBAN-,
//      Datums- und PLZ-ähnliche Fragmente werden durch Leerzeichen ersetzt.
//   2. DANN erst die Telefon-Regex auf den bereinigten Text anwenden.
//   3. Treffer normalisieren (Trennzeichen vereinheitlichen) + E.164 ableiten.
//
// Es werden NUR echte Rufnummern erkannt – niemals HRB/HRA/Steuer-/USt-Nummern.

export type PhoneLabel = "tel" | "mobil" | "fax" | null;

export interface ParsedPhone {
  /** Wie im Text gefunden (getrimmt). */
  raw: string;
  /** Vereinheitlichte Schreibweise, Trennzeichen → einzelnes Leerzeichen. */
  normalized: string;
  /** E.164-Form (+49…) oder null, falls keine gültige Länge. */
  e164: string | null;
  /** Aus dem unmittelbaren Kontext erkanntes Label (Tel/Mobil/Fax). */
  label: PhoneLabel;
}

// ── Maskierung von Nicht-Telefon-Fragmenten ─────────────────────────────────

// USt-IdNr.: DE + 9 Ziffern (optional mit Leerzeichen/Punkten gruppiert).
const VAT_ID = /\bDE[\s.]?\d(?:[\s.]?\d){8}\b/gi;

// Deutsche IBAN: DE + 2 Prüfziffern + 18 Stellen (mit/ohne Leerzeichen).
const IBAN_DE = /\bDE\d{2}(?:\s?\d){18}\b/gi;

// Datum mit vierstelligem Jahr (19xx/20xx). Tage wie 07.08.2023 beginnen mit 0
// und sähen sonst wie eine Rufnummer aus.
const DATE_FULL = /\b[0-3]?\d\.[01]?\d\.(?:19|20)\d{2}\b/g;

// Marker, deren unmittelbar folgende Ziffernfolge KEINE Telefonnummer ist.
// Hinweis: Reihenfolge mit langen Alternativen zuerst (z. B. "Steuernummer"
// vor "Steuer-Nr"), damit die Regex möglichst viel des Markers frisst.
const REGISTER_MARKERS = new RegExp(
  "(?:" +
    [
      "HRB",
      "HRA",
      "Handelsregister(?:nummer)?",
      "Registergericht",
      "Amtsgericht",
      "Steuernummer",
      "Steuer-?Nr\\.?",
      "St\\.?-?Nr\\.?",
      "USt-?IdNr\\.?",
      "USt\\.?-?ID",
      "Umsatzsteuer(?:-?Identifikationsnummer)?",
      "Gläubiger-?(?:ID|Identifikationsnummer)",
      "IBAN",
      "BIC",
      "Bankverbindung",
      "Kontonummer",
      "Konto",
      "Kto\\.?",
      "BLZ",
    ].join("|") +
    ")" +
    // optionaler Doppelpunkt/Gleich/Punkt, dann eine Ziffernfolge
    "\\s*[:.=]?\\s*\\d[\\d\\s./()+-]*",
  "gi",
);

/** Ersetzt alle Treffer eines Musters durch gleich lange Leerraum-Strings,
 *  damit Zeichen-Indizes (für die Label-Erkennung) erhalten bleiben. */
function blank(text: string, re: RegExp): string {
  return text.replace(re, (m) => " ".repeat(m.length));
}

export function maskExclusions(text: string): string {
  let t = text;
  t = blank(t, IBAN_DE); // vor VAT_ID – sonst bliebe ein langer Ziffernrest
  t = blank(t, VAT_ID);
  t = blank(t, DATE_FULL);
  t = blank(t, REGISTER_MARKERS);
  return t;
}

// ── Telefon-Erkennung ───────────────────────────────────────────────────────

// Prefix +49 / 0049 / 0, danach 6–14 Ziffern mit erlaubten Trennzeichen.
// - Trennzeichen-Klasse OHNE Zeilenumbruch: Nummern auf getrennten Zeilen
//   verschmelzen so nicht zu einer.
// - "*" (statt "?") erlaubt mehrere Trennzeichen am Stück, z. B. ") " in
//   "(0221) 123 45 67".
// - (?<!\d)/(?!\d) verhindern Treffer mitten in längeren Ziffernketten.
const PHONE_RE =
  /(?<!\d)(?:\+49|0049|0)(?:[ \t/().+-]*\d){6,14}(?!\d)/g;

function detectLabel(before: string): PhoneLabel {
  const ctx = before.toLowerCase();
  if (/fax/.test(ctx)) return "fax"; // "Telefax" zählt als Fax
  if (/mobil|handy|mob\b/.test(ctx)) return "mobil";
  if (/tel|fon|phone|ruf|☎|📞/.test(ctx)) return "tel";
  return null;
}

/**
 * Normalisiert einen einzelnen Kandidaten und leitet die E.164-Form ab.
 * Gibt null zurück, wenn die nationale Rufnummernlänge unplausibel ist.
 */
export function parseGermanPhone(candidate: string): ParsedPhone | null {
  const raw = candidate.trim();
  if (!raw) return null;

  // "(0)" = optionaler Verkehrsausscheidungs-0 in internationaler Schreibweise.
  const normalized = raw
    .replace(/\(\s*0\s*\)/g, " ")
    .replace(/[()]/g, " ")
    .replace(/[\s/.+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    // führendes "+" wieder herstellen, falls vorhanden
    .replace(/^49\b/, "+49");

  const hasPlus = /^\s*\+/.test(raw.replace(/\(\s*0\s*\)/g, ""));
  const digits = raw.replace(/\(\s*0\s*\)/g, "").replace(/\D/g, "");

  let nsn: string; // nationale Rufnummer ohne Länder-/Verkehrsausscheidungsziffer
  if (hasPlus && digits.startsWith("49")) nsn = digits.slice(2);
  else if (digits.startsWith("0049")) nsn = digits.slice(4);
  else if (digits.startsWith("0")) nsn = digits.replace(/^0+/, "");
  else nsn = digits;

  // Falls nach Länderkennung noch eine Verkehrs-0 steht: entfernen.
  nsn = nsn.replace(/^0+/, "");

  // Plausible nationale Länge in DE (grob 4–13 Stellen).
  const e164 = /^\d{4,13}$/.test(nsn) ? `+49${nsn}` : null;
  if (!e164) return null;

  // Aufzählungen / fortlaufende Ziffernfolgen (z. B. „0 1 2 3 4 5 …") sind keine
  // Rufnummern, auch wenn die Länge passt.
  if (/0123456789|1234567890|2345678901|3456789012|9876543210/.test(digits)) return null;

  return { raw, normalized, e164, label: null };
}

/**
 * Extrahiert alle plausiblen Telefonnummern aus einem Text.
 * Dubletten (gleiche E.164) werden zusammengeführt; das Label wird aus dem
 * unmittelbar vorangehenden Kontext (max. 18 Zeichen) bestimmt.
 */
export function extractPhoneNumbers(text: string): ParsedPhone[] {
  if (!text) return [];
  const masked = maskExclusions(text);

  const out: ParsedPhone[] = [];
  const seen = new Set<string>();

  for (const m of masked.matchAll(PHONE_RE)) {
    // Viele einzelne, durch Trenner getrennte Einzelziffern → Aufzählung,
    // keine Telefonnummer (z. B. „0 1 2 3 4 5 6 7 8 9 10 11").
    const grp = m[0].trim().split(/\D+/).filter(Boolean);
    if (grp.length >= 7 && grp.filter((g) => g.length === 1).length >= Math.ceil(grp.length * 0.6)) continue;

    const parsed = parseGermanPhone(m[0]);
    if (!parsed || !parsed.e164) continue;

    const start = m.index ?? 0;
    const before = masked.slice(Math.max(0, start - 18), start);
    parsed.label = detectLabel(before);

    const key = parsed.e164;
    if (seen.has(key)) {
      // Bereits gesehen – aber ein konkreteres Label (tel/mobil) bevorzugen.
      const existing = out.find((p) => p.e164 === key);
      if (existing && existing.label === "fax" && parsed.label && parsed.label !== "fax") {
        existing.label = parsed.label;
      }
      continue;
    }
    seen.add(key);
    out.push(parsed);
  }

  return out;
}

/**
 * Wählt die für den Vertrieb beste (anrufbare) Nummer:
 * Tel/ohne Label/Mobil bevorzugt, Fax nur als letzte Wahl.
 */
export function pickBestPhone(phones: ParsedPhone[]): ParsedPhone | null {
  if (phones.length === 0) return null;
  const rank = (l: PhoneLabel) => (l === "tel" ? 0 : l === null ? 1 : l === "mobil" ? 2 : 3);
  return [...phones].sort((a, b) => rank(a.label) - rank(b.label))[0];
}

/** Bequemer Einzelaufruf: erste/beste Nummer aus einem Text. */
export function firstGermanPhone(text: string): ParsedPhone | null {
  return pickBestPhone(extractPhoneNumbers(text));
}
