// Objekttyp-Presets: Mapping von UI-Auswahl auf OSM-Filter (Overpass) sowie
// eine Heuristik, um aus den Tags eines Treffers einen lesbaren Typ abzuleiten.

export type PresetKey =
  | "buero"
  | "praxis"
  | "pflege"
  | "sport"
  | "hotel"
  | "schule"
  | "hausverwaltung"
  | "gastro"
  | "industrie";

export interface ObjektPreset {
  key: PresetKey;
  label: string;
  /** Overpass-Filter ohne den (around:…)-Teil – der wird zur Laufzeit ergänzt. */
  filters: string[];
  /** Erkennt anhand der Tags, ob ein Treffer zu diesem Preset gehört. */
  match: (tags: Record<string, string>) => boolean;
}

const inSet = (v: string | undefined, set: string[]) =>
  v != null && set.includes(v);

// Reihenfolge = Priorität bei der Typ-Ableitung: spezifische Presets zuerst,
// das generische "Büro" (matcht jedes office=*) zuletzt.
export const PRESETS: ObjektPreset[] = [
  {
    key: "praxis",
    label: "Arzt- & Zahnarztpraxis",
    filters: [
      'nwr["amenity"~"^(doctors|dentist|clinic)$"]',
      'nwr["healthcare"]',
    ],
    match: (t) =>
      inSet(t.amenity, ["doctors", "dentist", "clinic"]) ||
      t.healthcare != null,
  },
  {
    key: "pflege",
    label: "Pflege / Soziales",
    filters: [
      'nwr["amenity"="social_facility"]',
      'nwr["healthcare"~"^(nursing|hospice|centre)$"]',
      'nwr["social_facility"]',
    ],
    match: (t) =>
      t.amenity === "social_facility" ||
      t.social_facility != null ||
      ["nursing", "hospice"].includes(t.healthcare ?? ""),
  },
  {
    key: "sport",
    label: "Sporthalle / Fitness",
    filters: ['nwr["leisure"~"^(sports_centre|fitness_centre)$"]'],
    match: (t) => inSet(t.leisure, ["sports_centre", "fitness_centre"]),
  },
  {
    key: "hotel",
    label: "Hotel",
    filters: ['nwr["tourism"="hotel"]'],
    match: (t) => t.tourism === "hotel",
  },
  {
    key: "schule",
    label: "Schule / Kita",
    filters: ['nwr["amenity"~"^(school|kindergarten|college|university)$"]'],
    match: (t) =>
      inSet(t.amenity, ["school", "kindergarten", "college", "university"]),
  },
  {
    key: "gastro",
    label: "Gastronomie",
    filters: ['nwr["amenity"~"^(restaurant|cafe|fast_food)$"]'],
    match: (t) => inSet(t.amenity, ["restaurant", "cafe", "fast_food"]),
  },
  {
    // HINWEIS: Hausverwaltungen/Makler sind in OSM oft schlecht getaggt – die
    // Trefferquote ist hier erfahrungsgemäß dünn. Wenn das stört, sollte später
    // eine zusätzliche Quelle (z. B. ein Branchenverzeichnis) ergänzt werden.
    // Bewusst NICHT Teil dieser Iteration – nur vermerkt. Steht vor "buero",
    // weil estate_agent/property_management ebenfalls office=* sind.
    key: "hausverwaltung",
    label: "Hausverwaltung / Makler",
    filters: ['nwr["office"~"^(estate_agent|property_management)$"]'],
    match: (t) => inSet(t.office, ["estate_agent", "property_management"]),
  },
  {
    key: "industrie",
    label: "Industrie / Produktion",
    filters: [
      'nwr["man_made"="works"]',
      'nwr["building"="industrial"]',
      'nwr["building"="warehouse"]',
      'nwr["industrial"]',
      'nwr["office"="company"]',
    ],
    // Beim Labeln konservativ: office=company nicht als Industrie werten.
    match: (t) =>
      t.man_made === "works" ||
      ["industrial", "warehouse"].includes(t.building ?? "") ||
      t.industrial != null,
  },
  {
    key: "buero",
    label: "Büro / Firma",
    filters: ['nwr["office"]', 'nwr["building"="office"]'],
    match: (t) => t.office != null || t.building === "office",
  },
];

const BY_KEY = new Map(PRESETS.map((p) => [p.key, p]));

export function getPreset(key: PresetKey): ObjektPreset | undefined {
  return BY_KEY.get(key);
}

export function isPresetKey(v: string): v is PresetKey {
  return BY_KEY.has(v as PresetKey);
}

/**
 * Leitet einen lesbaren Objekttyp aus den Tags ab. Es werden bevorzugt die vom
 * Nutzer ausgewählten Presets berücksichtigt; sonst alle.
 */
export function deriveObjektTyp(
  tags: Record<string, string>,
  selected: PresetKey[],
): string | null {
  const order =
    selected.length > 0
      ? PRESETS.filter((p) => selected.includes(p.key))
      : PRESETS;
  for (const p of order) {
    if (p.match(tags)) return p.label;
  }
  // Fallback: irgendein Preset matcht (z. B. office bei reiner Schule-Suche).
  for (const p of PRESETS) {
    if (p.match(tags)) return p.label;
  }
  return null;
}
