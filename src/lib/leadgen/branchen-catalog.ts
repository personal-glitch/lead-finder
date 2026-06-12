// CLIENT-SICHERER Katalog: NUR Anzeige-Daten (Branchen-Namen + Kategorien).
// Enthält BEWUSST KEINE Such-/OSM-Tags – diese sind ein Betriebsgeheimnis und
// liegen ausschließlich server-seitig in `branchen.ts` (import "server-only").
// Dieser File darf in Client-Komponenten importiert werden.
import type { IconName } from "@/components/icons";

export type BrancheKey =
  // Gesundheit & Pflege
  | "Arztpraxis"
  | "Zahnarztpraxis"
  | "Physiotherapie"
  | "Tierarztpraxis"
  | "Apotheke"
  | "Pflege & Senioren"
  | "Heilpraktiker & Therapie"
  // Immobilien & Bau
  | "Hausverwaltung"
  | "Immobilienmakler"
  | "Architekturbüro"
  | "Bauunternehmen"
  // Recht & Finanzen
  | "Steuerberater"
  | "Versicherungsbüro"
  | "Finanzberatung"
  | "Unternehmensberatung"
  // IT & Medien
  | "IT- & Software-Firma"
  | "Werbe- & Marketingagentur"
  | "Foto- & Videostudio"
  // Gastronomie & Hotel
  | "Restaurant"
  | "Café & Bäckerei"
  | "Bar & Kneipe"
  | "Hotel & Pension"
  | "Catering"
  // Handel & Geschäfte
  | "Supermarkt & Lebensmittel"
  | "Mode & Bekleidung"
  | "Möbel & Einrichtung"
  | "Baumarkt & Garten"
  | "Elektronik & Technik"
  | "Optiker & Schmuck"
  // Auto & Verkehr
  | "Autohaus"
  | "KFZ-Werkstatt"
  | "Tankstelle"
  | "Fahrschule"
  | "Spedition & Logistik"
  // Beauty & Wellness
  | "Friseursalon"
  | "Kosmetik & Nagelstudio"
  | "Massage & Spa"
  | "Tattoo & Piercing"
  // Sport & Freizeit
  | "Fitnessstudio"
  | "Yoga- & Tanzstudio"
  | "Sportanlage & Verein"
  // Bildung
  | "Kita & Kindergarten"
  | "Schule"
  | "Nachhilfe & Sprachschule"
  // Handwerk
  | "Maler & Lackierer"
  | "Elektriker"
  | "Sanitär & Heizung"
  | "Tischler & Schreiner"
  | "Dachdecker"
  | "Garten- & Landschaftsbau"
  | "Gebäudereinigung"
  // Allgemein (catch-all, bewusst zuletzt)
  | "Handwerksbetrieb"
  | "Büro & Unternehmen";

export interface BrancheKategorie {
  label: string;
  icon: IconName;
  branchen: BrancheKey[];
}

export const BRANCHEN_KATEGORIEN: BrancheKategorie[] = [
  { label: "Gesundheit & Pflege", icon: "health", branchen: ["Arztpraxis", "Zahnarztpraxis", "Physiotherapie", "Tierarztpraxis", "Apotheke", "Pflege & Senioren", "Heilpraktiker & Therapie"] },
  { label: "Immobilien & Bau", icon: "key", branchen: ["Hausverwaltung", "Immobilienmakler", "Architekturbüro", "Bauunternehmen"] },
  { label: "Steuer & Finanzen", icon: "building", branchen: ["Steuerberater", "Versicherungsbüro", "Finanzberatung", "Unternehmensberatung"] },
  { label: "IT & Medien", icon: "bolt", branchen: ["IT- & Software-Firma", "Werbe- & Marketingagentur", "Foto- & Videostudio"] },
  { label: "Gastronomie & Hotel", icon: "utensils", branchen: ["Restaurant", "Café & Bäckerei", "Bar & Kneipe", "Hotel & Pension", "Catering"] },
  { label: "Handel & Geschäfte", icon: "cart", branchen: ["Supermarkt & Lebensmittel", "Mode & Bekleidung", "Möbel & Einrichtung", "Baumarkt & Garten", "Elektronik & Technik", "Optiker & Schmuck"] },
  { label: "Auto & Verkehr", icon: "truck", branchen: ["Autohaus", "KFZ-Werkstatt", "Tankstelle", "Fahrschule", "Spedition & Logistik"] },
  { label: "Beauty & Wellness", icon: "user", branchen: ["Friseursalon", "Kosmetik & Nagelstudio", "Massage & Spa", "Tattoo & Piercing"] },
  { label: "Sport & Freizeit", icon: "play", branchen: ["Fitnessstudio", "Yoga- & Tanzstudio", "Sportanlage & Verein"] },
  { label: "Bildung", icon: "school", branchen: ["Kita & Kindergarten", "Schule", "Nachhilfe & Sprachschule"] },
  { label: "Handwerk & Dienstleistung", icon: "wrench", branchen: ["Maler & Lackierer", "Elektriker", "Sanitär & Heizung", "Tischler & Schreiner", "Dachdecker", "Garten- & Landschaftsbau", "Gebäudereinigung", "Handwerksbetrieb"] },
  { label: "Allgemein", icon: "building", branchen: ["Büro & Unternehmen"] },
];

// Flache Liste in Zuordnungs-Reihenfolge (spezifisch → Catch-alls zuletzt).
export const ALLE_BRANCHEN: BrancheKey[] = BRANCHEN_KATEGORIEN.flatMap((c) => c.branchen);

const KEYSET = new Set<string>(ALLE_BRANCHEN);
export function isBrancheKey(v: string): v is BrancheKey {
  return KEYSET.has(v);
}
