// Kalkulator-Logik (geteilt von öffentlichem Köder /rechner und In-App /kalkulator).
// Transparente, branchenübliche Formeln mit recherchierten Richtwerten (2026):
// Tariflohn Gebäudereinigung Lohngruppe 1 = 15,00 €/h, Glas/Fassade LG 6 = 18,40 €/h;
// Flächenleistungen je Bereich (RAL-Richtwerte); m²-Preise Unterhalt ~0,20–0,50 €/m².
// Ergebnisse sind Richtwerte, keine verbindliche Kalkulation.

export type KalkModus = "reinigung" | "handwerk" | "agentur";

const round2 = (n: number) => Math.round(n * 100) / 100;
const clampNum = (n: unknown, fallback = 0) => {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
};

// ───────────────────────── Gebäudereinigung ─────────────────────────
// Auswahllisten (klickbar im UI). Flächenleistung = Richtwert m²/h bei mittlerer
// Verschmutzung; wird mit Reinigungsart- und Verschmutzungsfaktor verrechnet.
// Leistungs-Katalog: jede Position hat eine Flächenleistung (m²/h bei mittlerer
// Verschmutzung) und eine marktübliche €/m²-Spanne je Reinigung.
export const LEISTUNGEN = [
  { key: "unterhalt_buero", label: "Unterhaltsreinigung · Büro", leistung: 200, marktMin: 0.2, marktMax: 0.45 },
  { key: "unterhalt_praxis", label: "Unterhaltsreinigung · Praxis/Kanzlei", leistung: 170, marktMin: 0.25, marktMax: 0.55 },
  { key: "unterhalt_schule", label: "Unterhaltsreinigung · Schule/Kita", leistung: 180, marktMin: 0.2, marktMax: 0.5 },
  { key: "treppenhaus", label: "Treppenhausreinigung", leistung: 220, marktMin: 0.15, marktMax: 0.4 },
  { key: "sanitaer", label: "Sanitärreinigung", leistung: 90, marktMin: 0.4, marktMax: 1.0 },
  { key: "fenster", label: "Fenster- & Rahmenreinigung", leistung: 70, marktMin: 0.8, marktMax: 2.5 },
  { key: "glas_fassade", label: "Glas-/Fassadenreinigung", leistung: 80, marktMin: 0.8, marktMax: 2.5 },
  { key: "verkauf", label: "Verkaufsfläche / Laden", leistung: 230, marktMin: 0.2, marktMax: 0.5 },
  { key: "industrie", label: "Industrie- / Hallenreinigung", leistung: 300, marktMin: 0.1, marktMax: 0.35 },
  { key: "grund", label: "Grundreinigung (einmalig)", leistung: 70, marktMin: 1.5, marktMax: 4.0 },
  { key: "bauend", label: "Bauend-/Baustellenreinigung", leistung: 90, marktMin: 1.0, marktMax: 3.0 },
] as const;

export const REINIGUNG_ABRECHNUNG = [
  { key: "kalk", label: "Kalkuliert (SVS)" },
  { key: "pauschal", label: "Pauschalpreis" },
] as const;

export const VERSCHMUTZUNG = [
  { key: "leicht", label: "Leicht", factor: 1.2 },
  { key: "mittel", label: "Mittel", factor: 1.0 },
  { key: "stark", label: "Stark", factor: 0.75 },
] as const;

export const LOHNBASIS = [
  { key: "tarif1", label: "Tariflohn 2026 · 15,00 €", lohn: 15.0 },
  { key: "tarif6", label: "Glas/Fassade · 18,40 €", lohn: 18.4 },
  { key: "eigen", label: "Eigener Satz", lohn: null },
] as const;

export const FREQUENZEN = [
  { key: "w5", label: "5×/Woche", proWoche: 5 },
  { key: "w3", label: "3×/Woche", proWoche: 3 },
  { key: "w2", label: "2×/Woche", proWoche: 2 },
  { key: "w1", label: "1×/Woche", proWoche: 1 },
  { key: "m2", label: "2×/Monat", proWoche: 0.46 },
  { key: "m1", label: "1×/Monat", proWoche: 0.23 },
] as const;

export interface ReinigungPosition { leistungM2h: number; flaeche: number; anzahl: number; marktMin: number; marktMax: number }
export interface ReinigungInput {
  positionen: ReinigungPosition[];
  verschmutzungFactor: number;
  lohnProStd: number;
  zuschlagProzent: number;
  margeProzent: number;
  einsaetzeProWoche: number;
  anfahrtProEinsatz: number;
  materialProEinsatz: number;
  pauschal: boolean;
  pauschalPreis: number; // Pauschalpreis pro Einsatz (nur wenn pauschal)
}
export interface ReinigungResult {
  totalFlaeche: number; totalStunden: number; selbstkostenProStd: number;
  kostenProEinsatz: number; preisProEinsatz: number; preisMin: number; preisMax: number;
  preisProMonat: number; preisProJahr: number; preisProM2: number;
  marktMin: number; marktMax: number;
  impliedMarge: number; impliedStundensatz: number; pauschal: boolean;
}
export function calcReinigung(i: ReinigungInput): ReinigungResult {
  const vf = clampNum(i.verschmutzungFactor, 1) || 1;
  let totalFlaeche = 0, totalStunden = 0, marktMinSum = 0, marktMaxSum = 0;
  for (const p of i.positionen ?? []) {
    const fl = clampNum(p.flaeche) * Math.max(1, clampNum(p.anzahl, 1));
    const leistung = Math.max(10, clampNum(p.leistungM2h, 200) * vf);
    totalFlaeche += fl;
    totalStunden += fl / leistung;
    marktMinSum += fl * clampNum(p.marktMin);
    marktMaxSum += fl * clampNum(p.marktMax);
  }
  const lohn = clampNum(i.lohnProStd, 15);
  const selbstkostenProStd = lohn * (1 + clampNum(i.zuschlagProzent, 70) / 100);
  const kostenProEinsatz = totalStunden * selbstkostenProStd + clampNum(i.anfahrtProEinsatz) + clampNum(i.materialProEinsatz);
  const kalkPreis = kostenProEinsatz * (1 + clampNum(i.margeProzent, 15) / 100);
  const preisProEinsatz = i.pauschal ? clampNum(i.pauschalPreis) : kalkPreis;
  const einsaetze = clampNum(i.einsaetzeProWoche, 5);
  const preisProMonat = preisProEinsatz * einsaetze * 4.33;
  const impliedMarge = kostenProEinsatz > 0 ? ((preisProEinsatz - kostenProEinsatz) / kostenProEinsatz) * 100 : 0;
  const impliedStundensatz = totalStunden > 0 ? preisProEinsatz / totalStunden : 0;
  return {
    totalFlaeche: round2(totalFlaeche),
    totalStunden: round2(totalStunden),
    selbstkostenProStd: round2(selbstkostenProStd),
    kostenProEinsatz: round2(kostenProEinsatz),
    preisProEinsatz: round2(preisProEinsatz),
    preisMin: round2(preisProEinsatz * 0.9),
    preisMax: round2(preisProEinsatz * 1.1),
    preisProMonat: round2(preisProMonat),
    preisProJahr: round2(preisProMonat * 12),
    preisProM2: totalFlaeche > 0 ? round2(preisProEinsatz / totalFlaeche) : 0,
    marktMin: totalFlaeche > 0 ? round2(marktMinSum / totalFlaeche) : 0,
    marktMax: totalFlaeche > 0 ? round2(marktMaxSum / totalFlaeche) : 0,
    impliedMarge: round2(impliedMarge),
    impliedStundensatz: round2(impliedStundensatz),
    pauschal: i.pauschal,
  };
}

// ───────────────────────── Handwerk ─────────────────────────
// HWK-Modell: Stundenverrechnungssatz = Lohn × (1 + Gemeinkostenzuschlag) × (1 + Gewinn).
// Marktspannen (netto €/h) je Gewerk aus recherchierten Richtwerten 2025/2026.
export const GEWERKE = [
  { key: "elektro", label: "Elektro", lohn: 28, marktMin: 55, marktMax: 80 },
  { key: "shk", label: "Sanitär / Heizung", lohn: 29, marktMin: 60, marktMax: 85 },
  { key: "maler", label: "Maler & Lackierer", lohn: 24, marktMin: 48, marktMax: 62 },
  { key: "tischler", label: "Tischler / Schreiner", lohn: 26, marktMin: 55, marktMax: 75 },
  { key: "dachdecker", label: "Dachdecker", lohn: 27, marktMin: 55, marktMax: 80 },
  { key: "galabau", label: "Garten- & Landschaftsbau", lohn: 23, marktMin: 45, marktMax: 65 },
  { key: "kfz", label: "KFZ", lohn: 27, marktMin: 80, marktMax: 130 },
  { key: "sonstige", label: "Sonstiges Handwerk", lohn: 26, marktMin: 50, marktMax: 70 },
] as const;

// Gemeinkostenzuschlag auf die Lohnkosten (HWK-Empfehlung 70–100 %).
export const HANDWERK_GEMEINKOSTEN = [
  { key: "niedrig", label: "Schlank · 70 %", zuschlag: 70 },
  { key: "mittel", label: "Üblich · 85 %", zuschlag: 85 },
  { key: "hoch", label: "Hoch · 100 %", zuschlag: 100 },
] as const;

// Regionaler Aufschlag auf die Marktspanne (±15–30 %).
export const HANDWERK_REGION = [
  { key: "schnitt", label: "Bundesschnitt", factor: 1.0 },
  { key: "stadt", label: "Stadt / Süd-West", factor: 1.15 },
  { key: "land", label: "Ländlich / Ost", factor: 0.87 },
] as const;

export interface HandwerkInput {
  lohnProStd: number; gemeinZuschlagProzent: number; gewinnProzent: number;
  marktMin: number; marktMax: number; regionFactor: number;
}
export interface HandwerkResult {
  selbstkostenProStd: number; verrechnungssatz: number;
  marktMin: number; marktMax: number;
}
export function calcHandwerk(i: HandwerkInput): HandwerkResult {
  const lohn = clampNum(i.lohnProStd, 26);
  const zuschlag = clampNum(i.gemeinZuschlagProzent, 85);
  const gewinn = clampNum(i.gewinnProzent, 10);
  const region = clampNum(i.regionFactor, 1) || 1;
  const selbstkostenProStd = lohn * (1 + zuschlag / 100);
  const verrechnungssatz = selbstkostenProStd * (1 + gewinn / 100);
  return {
    selbstkostenProStd: round2(selbstkostenProStd),
    verrechnungssatz: round2(verrechnungssatz),
    marktMin: round2(clampNum(i.marktMin) * region),
    marktMax: round2(clampNum(i.marktMax) * region),
  };
}

// ───────────────────────── Agentur / Dienstleistung ─────────────────────────
// Marktspannen (netto €/h, Mid-Level) je Disziplin – recherchierte Richtwerte 2025/26.
export const DISZIPLINEN = [
  { key: "web", label: "Web-Entwicklung / Webdesign", min: 80, max: 110 },
  { key: "marketing", label: "Online-Marketing / SEO", min: 90, max: 140 },
  { key: "social", label: "Social Media", min: 70, max: 110 },
  { key: "design", label: "Grafik / UX-UI-Design", min: 75, max: 115 },
  { key: "content", label: "Text / Content", min: 60, max: 100 },
  { key: "foto", label: "Foto / Video", min: 80, max: 130 },
  { key: "beratung", label: "Beratung / Strategie", min: 120, max: 200 },
  { key: "sonstige", label: "Sonstige Dienstleistung", min: 70, max: 120 },
] as const;

export const SENIORITAET = [
  { key: "junior", label: "Junior", factor: 0.75 },
  { key: "mid", label: "Mid-Level", factor: 1.0 },
  { key: "senior", label: "Senior", factor: 1.4 },
] as const;

export const ABRECHNUNG = [
  { key: "stunde", label: "Stundensatz" },
  { key: "tag", label: "Tagessatz" },
] as const;

export interface AgenturInput {
  zielJahresgewinn: number; abrechenbareStundenProMonat: number;
  auslastungProzent: number; gemeinkostenProMonat: number;
}
export interface AgenturResult {
  effektivStundenProMonat: number; benoetigterUmsatzProMonat: number;
  stundensatz: number; tagessatz: number;
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
    tagessatz: round2(stundensatz * 8),
  };
}

export const eur = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
