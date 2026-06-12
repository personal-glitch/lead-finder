// SERVER-ONLY: Such-/OSM-Tags pro Branche + Kontakt-Rollen-Priorität.
// Diese Datei ist ein BETRIEBSGEHEIMNIS und darf NIEMALS in eine Client-Komponente
// importiert werden – `import "server-only"` erzwingt das beim Build.
// Client-Komponenten nutzen stattdessen `branchen-catalog.ts` (nur Namen/Kategorien).
import "server-only";
import { ALLE_BRANCHEN, type BrancheKey } from "./branchen-catalog";

export { ALLE_BRANCHEN, isBrancheKey } from "./branchen-catalog";
export type { BrancheKey, BrancheKategorie } from "./branchen-catalog";
export { BRANCHEN_KATEGORIEN } from "./branchen-catalog";

export interface OsmTag {
  key: string;
  value: string;
}

interface BrancheDef {
  tags: OsmTag[];
  roleTiers: string[][];
}

const t = (...pairs: string[]): OsmTag[] => {
  const out: OsmTag[] = [];
  for (let i = 0; i < pairs.length; i += 2) out.push({ key: pairs[i], value: pairs[i + 1] });
  return out;
};

// ── Rollen-Prioritäten je Branchen-Typ ──
const ROLLEN_PRAXIS = [
  ["Praxismanager", "Praxismanagerin", "Praxisleitung", "Praxiskoordinator", "Praxiskoordinatorin"],
  ["Praxisinhaber", "Praxisinhaberin", "niedergelassener Arzt", "niedergelassene Ärztin"],
  ["Empfang", "Anmeldung"],
];
const ROLLEN_HAUSVERWALTUNG = [
  ["Hausverwalter", "Hausverwalterin", "WEG-Verwalter", "Objektverwalter", "Immobilienverwalter"],
  ["Objektmanager", "Facility-Manager", "Property-Manager", "Property Manager"],
  ["Geschäftsführung", "Geschäftsführer", "Geschäftsführerin"],
];
const ROLLEN_BUERO = [
  ["Office-Manager", "Office Manager", "Büroleitung", "Assistenz der Geschäftsführung"],
  ["Verwaltungsleitung", "Sekretariat"],
  ["Inhaber", "Inhaberin", "Geschäftsführung", "Geschäftsführer", "Geschäftsführerin"],
];
const ROLLEN_GF = [
  ["Inhaber", "Inhaberin", "Geschäftsführer", "Geschäftsführerin", "Geschäftsführung"],
  ["Betriebsleiter", "Betriebsleiterin", "Niederlassungsleiter", "Standortleiter"],
  ["Sekretariat", "Verwaltung", "Büro"],
];
const ROLLEN_HANDWERK = [
  ["Inhaber", "Inhaberin", "Meister", "Geschäftsführer", "Geschäftsführerin"],
  ["Betriebsleiter", "Bauleiter", "Projektleiter"],
  ["Büro", "Geschäftsführung"],
];
const ROLLEN_GASTRO = [
  ["Inhaber", "Inhaberin", "Betriebsleiter", "Restaurantleiter", "Restaurantleitung"],
  ["Geschäftsführer", "Pächter", "Wirt", "Küchenchef"],
  ["Geschäftsführung"],
];
const ROLLEN_HOTEL = [
  ["Hoteldirektor", "Hoteldirektorin", "Hotelleitung", "General Manager", "Direktion"],
  ["Empfang", "Rezeption", "Reservierung"],
  ["Inhaber", "Geschäftsführung"],
];
const ROLLEN_HANDEL = [
  ["Inhaber", "Inhaberin", "Filialleiter", "Filialleitung", "Marktleiter", "Marktleitung", "Store Manager"],
  ["Geschäftsführer", "Geschäftsführung", "Verkaufsleitung"],
  ["Ansprechpartner"],
];
const ROLLEN_BEAUTY = [
  ["Inhaber", "Inhaberin", "Studioleitung", "Studioleiter", "Salonleitung", "Salonleiter"],
  ["Geschäftsführer", "Geschäftsführung"],
];
const ROLLEN_BILDUNG = [
  ["Leitung", "Schulleitung", "Kita-Leitung", "Einrichtungsleitung", "Geschäftsführung"],
  ["Sekretariat", "Verwaltung"],
];

// Generische Catch-alls (Handwerksbetrieb, Büro & Unternehmen) stehen in
// ALLE_BRANCHEN bereits zuletzt → brancheForTags bevorzugt spezifische Branchen.
export const BRANCHEN: Record<BrancheKey, BrancheDef> = {
  Arztpraxis: { tags: t("amenity", "doctors", "healthcare", "doctor", "healthcare", "centre"), roleTiers: ROLLEN_PRAXIS },
  Zahnarztpraxis: { tags: t("healthcare", "dentist", "amenity", "dentist"), roleTiers: ROLLEN_PRAXIS },
  Physiotherapie: { tags: t("healthcare", "physiotherapist"), roleTiers: ROLLEN_PRAXIS },
  Tierarztpraxis: { tags: t("amenity", "veterinary"), roleTiers: ROLLEN_PRAXIS },
  Apotheke: { tags: t("amenity", "pharmacy"), roleTiers: ROLLEN_HANDEL },
  "Pflege & Senioren": { tags: t("amenity", "nursing_home", "healthcare", "nursing_home", "social_facility", "nursing_home"), roleTiers: ROLLEN_GF },
  "Heilpraktiker & Therapie": { tags: t("healthcare", "alternative", "healthcare", "psychotherapist"), roleTiers: ROLLEN_PRAXIS },

  Hausverwaltung: { tags: t("office", "property_management"), roleTiers: ROLLEN_HAUSVERWALTUNG },
  Immobilienmakler: { tags: t("office", "estate_agent"), roleTiers: ROLLEN_HAUSVERWALTUNG },
  Architekturbüro: { tags: t("office", "architect"), roleTiers: ROLLEN_BUERO },
  Bauunternehmen: { tags: t("office", "construction_company", "craft", "builder"), roleTiers: ROLLEN_HANDWERK },

  Steuerberater: { tags: t("office", "tax_advisor", "office", "accountant"), roleTiers: ROLLEN_BUERO },
  Versicherungsbüro: { tags: t("office", "insurance"), roleTiers: ROLLEN_BUERO },
  Finanzberatung: { tags: t("office", "financial", "office", "financial_advisor"), roleTiers: ROLLEN_BUERO },
  Unternehmensberatung: { tags: t("office", "consulting"), roleTiers: ROLLEN_BUERO },

  "IT- & Software-Firma": { tags: t("office", "it", "office", "telecommunication"), roleTiers: ROLLEN_BUERO },
  "Werbe- & Marketingagentur": { tags: t("office", "advertising_agency"), roleTiers: ROLLEN_BUERO },
  "Foto- & Videostudio": { tags: t("craft", "photographer", "shop", "photo"), roleTiers: ROLLEN_GF },

  Restaurant: { tags: t("amenity", "restaurant"), roleTiers: ROLLEN_GASTRO },
  "Café & Bäckerei": { tags: t("amenity", "cafe", "shop", "bakery", "craft", "bakery"), roleTiers: ROLLEN_GASTRO },
  "Bar & Kneipe": { tags: t("amenity", "bar", "amenity", "pub"), roleTiers: ROLLEN_GASTRO },
  "Hotel & Pension": { tags: t("tourism", "hotel", "tourism", "guest_house"), roleTiers: ROLLEN_HOTEL },
  Catering: { tags: t("craft", "caterer"), roleTiers: ROLLEN_GASTRO },

  "Supermarkt & Lebensmittel": { tags: t("shop", "supermarket", "shop", "convenience"), roleTiers: ROLLEN_HANDEL },
  "Mode & Bekleidung": { tags: t("shop", "clothes", "shop", "shoes"), roleTiers: ROLLEN_HANDEL },
  "Möbel & Einrichtung": { tags: t("shop", "furniture", "shop", "interior_decoration"), roleTiers: ROLLEN_HANDEL },
  "Baumarkt & Garten": { tags: t("shop", "doityourself", "shop", "hardware", "shop", "garden_centre"), roleTiers: ROLLEN_HANDEL },
  "Elektronik & Technik": { tags: t("shop", "electronics", "shop", "computer", "shop", "mobile_phone"), roleTiers: ROLLEN_HANDEL },
  "Optiker & Schmuck": { tags: t("shop", "optician", "shop", "jewelry"), roleTiers: ROLLEN_HANDEL },

  Autohaus: { tags: t("shop", "car"), roleTiers: ROLLEN_HANDEL },
  "KFZ-Werkstatt": { tags: t("shop", "car_repair", "craft", "car_repair"), roleTiers: ROLLEN_HANDWERK },
  Tankstelle: { tags: t("amenity", "fuel"), roleTiers: ROLLEN_HANDEL },
  Fahrschule: { tags: t("amenity", "driving_school"), roleTiers: ROLLEN_GF },
  "Spedition & Logistik": { tags: t("office", "logistics"), roleTiers: ROLLEN_GF },

  Friseursalon: { tags: t("shop", "hairdresser"), roleTiers: ROLLEN_BEAUTY },
  "Kosmetik & Nagelstudio": { tags: t("shop", "beauty"), roleTiers: ROLLEN_BEAUTY },
  "Massage & Spa": { tags: t("shop", "massage", "leisure", "spa"), roleTiers: ROLLEN_BEAUTY },
  "Tattoo & Piercing": { tags: t("shop", "tattoo"), roleTiers: ROLLEN_BEAUTY },

  Fitnessstudio: { tags: t("leisure", "fitness_centre"), roleTiers: ROLLEN_BEAUTY },
  "Yoga- & Tanzstudio": { tags: t("leisure", "dance"), roleTiers: ROLLEN_BEAUTY },
  "Sportanlage & Verein": { tags: t("leisure", "sports_centre"), roleTiers: ROLLEN_GF },

  "Kita & Kindergarten": { tags: t("amenity", "kindergarten"), roleTiers: ROLLEN_BILDUNG },
  Schule: { tags: t("amenity", "school"), roleTiers: ROLLEN_BILDUNG },
  "Nachhilfe & Sprachschule": { tags: t("amenity", "language_school", "office", "educational_institution"), roleTiers: ROLLEN_BILDUNG },

  "Maler & Lackierer": { tags: t("craft", "painter"), roleTiers: ROLLEN_HANDWERK },
  Elektriker: { tags: t("craft", "electrician"), roleTiers: ROLLEN_HANDWERK },
  "Sanitär & Heizung": { tags: t("craft", "plumber", "craft", "hvac"), roleTiers: ROLLEN_HANDWERK },
  "Tischler & Schreiner": { tags: t("craft", "carpenter", "craft", "joiner"), roleTiers: ROLLEN_HANDWERK },
  Dachdecker: { tags: t("craft", "roofer"), roleTiers: ROLLEN_HANDWERK },
  "Garten- & Landschaftsbau": { tags: t("craft", "gardener"), roleTiers: ROLLEN_HANDWERK },
  // In OSM kaum sauber getaggt – die eigentliche Treffer-Power kommt aus der
  // Namens-Suche (Synonyme: Gebäudereiniger/Facility/…) in overpass-search.ts.
  Gebäudereinigung: { tags: t("craft", "cleaning"), roleTiers: ROLLEN_HANDWERK },

  Handwerksbetrieb: { tags: t("craft", "yes"), roleTiers: ROLLEN_HANDWERK },
  "Büro & Unternehmen": { tags: t("office", "company", "office", "administrative", "office", "yes"), roleTiers: ROLLEN_BUERO },
};

/** Overpass-Filter (nwr["k"="v"]) für die gewählten Branchen. */
export function brancheSelectors(branchen: BrancheKey[]): string[] {
  return branchen.flatMap((b) =>
    BRANCHEN[b].tags.map((tag) => `nwr["${tag.key}"="${tag.value}"]`),
  );
}

/** Ordnet einem Treffer eine Branche zu (spezifisch vor den Catch-alls). */
export function brancheForTags(
  tags: Record<string, string>,
  selected: BrancheKey[],
): BrancheKey | null {
  for (const b of ALLE_BRANCHEN) {
    if (!selected.includes(b)) continue;
    if (BRANCHEN[b].tags.some((tag) => tags[tag.key] === tag.value)) return b;
  }
  return null;
}
