// Kalkulator-Logik (geteilt von öffentlichem Köder /rechner und In-App /kalkulator).
// Bewusst transparente, branchenübliche Formeln. Ergebnisse sind Richtwerte,
// keine verbindliche Kalkulation – das wird im UI deutlich gemacht.

export type KalkModus = "reinigung" | "handwerk" | "agentur";

export const MODI: { key: KalkModus; label: string; hint: string }[] = [
  { key: "reinigung", label: "Gebäudereinigung", hint: "Angebotspreis pro Einsatz & Monat" },
  { key: "handwerk", label: "Handwerk", hint: "Kostendeckender Stundenverrechnungssatz" },
  { key: "agentur", label: "Agentur / Dienstleistung", hint: "Nötiger Stundensatz für dein Ziel" },
];

const round2 = (n: number) => Math.round(n * 100) / 100;
const clampNum = (n: unknown, fallback = 0) => {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
};

// ── Gebäudereinigung: Unterhaltsreinigung ──
export interface ReinigungInput {
  flaecheM2: number;          // zu reinigende Fläche
  leistungM2ProStd: number;   // Reinigungsleistung (m²/h), z. B. 200
  stundensatz: number;        // interner Stundensatz (€), z. B. 30
  einsaetzeProWoche: number;  // z. B. 5
  anfahrtProEinsatz: number;  // €
  materialProEinsatz: number; // €
  margeProzent: number;       // Gewinnaufschlag %
}
export interface ReinigungResult {
  stundenProEinsatz: number; kostenProEinsatz: number; preisProEinsatz: number;
  preisProMonat: number; preisProJahr: number;
}
export function calcReinigung(i: ReinigungInput): ReinigungResult {
  const flaeche = clampNum(i.flaecheM2);
  const leistung = Math.max(1, clampNum(i.leistungM2ProStd, 200));
  const satz = clampNum(i.stundensatz, 30);
  const einsaetze = clampNum(i.einsaetzeProWoche, 5);
  const marge = clampNum(i.margeProzent, 15);
  const stundenProEinsatz = flaeche / leistung;
  const lohn = stundenProEinsatz * satz;
  const kostenProEinsatz = lohn + clampNum(i.anfahrtProEinsatz) + clampNum(i.materialProEinsatz);
  const preisProEinsatz = kostenProEinsatz * (1 + marge / 100);
  const preisProMonat = preisProEinsatz * einsaetze * 4.33;
  return {
    stundenProEinsatz: round2(stundenProEinsatz),
    kostenProEinsatz: round2(kostenProEinsatz),
    preisProEinsatz: round2(preisProEinsatz),
    preisProMonat: round2(preisProMonat),
    preisProJahr: round2(preisProMonat * 12),
  };
}

// ── Handwerk: Stundenverrechnungssatz ──
export interface HandwerkInput {
  bruttolohnProStd: number;       // Lohnkosten produktiv (€/h)
  produktiveStundenProJahr: number; // verrechenbare Std./Jahr/Mitarbeiter (z. B. 1500)
  mitarbeiter: number;            // Anzahl produktive Mitarbeiter
  gemeinkostenProJahr: number;    // Fixkosten/Overhead (€/Jahr gesamt)
  gewinnProzent: number;          // Gewinnaufschlag %
}
export interface HandwerkResult {
  gemeinkostenProStd: number; selbstkostenProStd: number; verrechnungssatz: number;
}
export function calcHandwerk(i: HandwerkInput): HandwerkResult {
  const lohn = clampNum(i.bruttolohnProStd, 25);
  const stdJahr = Math.max(1, clampNum(i.produktiveStundenProJahr, 1500));
  const ma = Math.max(1, clampNum(i.mitarbeiter, 1));
  const gemein = clampNum(i.gemeinkostenProJahr, 30000);
  const gewinn = clampNum(i.gewinnProzent, 12);
  const gemeinkostenProStd = gemein / (stdJahr * ma);
  const selbstkostenProStd = lohn + gemeinkostenProStd;
  const verrechnungssatz = selbstkostenProStd * (1 + gewinn / 100);
  return {
    gemeinkostenProStd: round2(gemeinkostenProStd),
    selbstkostenProStd: round2(selbstkostenProStd),
    verrechnungssatz: round2(verrechnungssatz),
  };
}

// ── Agentur / Dienstleistung: nötiger Stundensatz ──
export interface AgenturInput {
  zielJahresgewinn: number;          // Wunsch-Gewinn/Gehalt (€/Jahr)
  abrechenbareStundenProMonat: number; // theoretisch fakturierbar
  auslastungProzent: number;         // realistische Auslastung %
  gemeinkostenProMonat: number;      // Fixkosten (€/Monat)
}
export interface AgenturResult {
  effektivStundenProMonat: number; benoetigterUmsatzProMonat: number; stundensatz: number;
}
export function calcAgentur(i: AgenturInput): AgenturResult {
  const ziel = clampNum(i.zielJahresgewinn, 60000);
  const std = clampNum(i.abrechenbareStundenProMonat, 100);
  const ausl = Math.min(100, Math.max(1, clampNum(i.auslastungProzent, 70)));
  const gemein = clampNum(i.gemeinkostenProMonat, 3000);
  const effektivStundenProMonat = std * (ausl / 100);
  const benoetigterUmsatzProMonat = ziel / 12 + gemein;
  const stundensatz = effektivStundenProMonat > 0 ? benoetigterUmsatzProMonat / effektivStundenProMonat : 0;
  return {
    effektivStundenProMonat: round2(effektivStundenProMonat),
    benoetigterUmsatzProMonat: round2(benoetigterUmsatzProMonat),
    stundensatz: round2(stundensatz),
  };
}

export const eur = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
