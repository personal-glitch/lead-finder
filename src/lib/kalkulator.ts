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
export const REINIGUNGSARTEN = [
  { key: "unterhalt", label: "Unterhaltsreinigung", factor: 1.0, marktMinM2: 0.2, marktMaxM2: 0.5 },
  { key: "grund", label: "Grundreinigung", factor: 0.38, marktMinM2: 1.5, marktMaxM2: 4.0 },
  { key: "glas", label: "Glas & Fassade", factor: 0.45, marktMinM2: 0.8, marktMaxM2: 2.5 },
  { key: "bauend", label: "Bauend-/Baustellenreinigung", factor: 0.5, marktMinM2: 1.0, marktMaxM2: 3.0 },
] as const;

export const OBJEKTARTEN = [
  { key: "buero", label: "Büro", leistung: 200 },
  { key: "praxis", label: "Praxis / Kanzlei", leistung: 170 },
  { key: "treppenhaus", label: "Treppenhaus / Wohnhaus", leistung: 220 },
  { key: "schule", label: "Schule / Kita", leistung: 180 },
  { key: "laden", label: "Verkaufsfläche / Laden", leistung: 230 },
  { key: "industrie", label: "Industrie / Halle", leistung: 300 },
  { key: "sanitaer", label: "Sanitärbereich", leistung: 90 },
  { key: "fitness", label: "Fitness / Studio", leistung: 200 },
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

export interface ReinigungInput {
  flaecheM2: number;
  objektLeistung: number;      // m²/h Basis (aus Objektart)
  reinigungsartFactor: number; // aus Reinigungsart
  verschmutzungFactor: number; // aus Verschmutzung
  lohnProStd: number;          // Lohnbasis (€/h)
  zuschlagProzent: number;     // Lohnnebenkosten + Gemeinkosten %
  margeProzent: number;        // Gewinnaufschlag %
  einsaetzeProWoche: number;
  anfahrtProEinsatz: number;
  materialProEinsatz: number;
  marktMinM2: number;          // Marktspanne €/m² je Reinigung (aus Reinigungsart)
  marktMaxM2: number;
}
export interface ReinigungResult {
  leistung: number; stundenProEinsatz: number; selbstkostenProStd: number;
  kostenProEinsatz: number; preisProEinsatz: number; preisMin: number; preisMax: number;
  preisProMonat: number; preisProJahr: number; preisProM2: number;
  marktMin: number; marktMax: number;
}
export function calcReinigung(i: ReinigungInput): ReinigungResult {
  const flaeche = clampNum(i.flaecheM2);
  const leistung = Math.max(10, clampNum(i.objektLeistung, 200) * clampNum(i.reinigungsartFactor, 1) * clampNum(i.verschmutzungFactor, 1));
  const stundenProEinsatz = flaeche / leistung;
  const lohn = clampNum(i.lohnProStd, 15);
  const selbstkostenProStd = lohn * (1 + clampNum(i.zuschlagProzent, 70) / 100);
  const kostenProEinsatz = stundenProEinsatz * selbstkostenProStd + clampNum(i.anfahrtProEinsatz) + clampNum(i.materialProEinsatz);
  const preisProEinsatz = kostenProEinsatz * (1 + clampNum(i.margeProzent, 15) / 100);
  const einsaetze = clampNum(i.einsaetzeProWoche, 5);
  const preisProMonat = preisProEinsatz * einsaetze * 4.33;
  return {
    leistung: round2(leistung),
    stundenProEinsatz: round2(stundenProEinsatz),
    selbstkostenProStd: round2(selbstkostenProStd),
    kostenProEinsatz: round2(kostenProEinsatz),
    preisProEinsatz: round2(preisProEinsatz),
    preisMin: round2(preisProEinsatz * 0.9),
    preisMax: round2(preisProEinsatz * 1.1),
    preisProMonat: round2(preisProMonat),
    preisProJahr: round2(preisProMonat * 12),
    preisProM2: flaeche > 0 ? round2(preisProEinsatz / flaeche) : 0,
    marktMin: clampNum(i.marktMinM2),
    marktMax: clampNum(i.marktMaxM2),
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
