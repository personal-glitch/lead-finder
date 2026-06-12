import "server-only";
// Kategorie-Suche über Overpass (OpenStreetMap). Anders als die Nominatim-
// Namenssuche findet Overpass Firmen anhand ihrer TAGS (amenity=doctors,
// office=lawyer, shop=*, craft=* …) – also nach Tätigkeit, NICHT nach Name.
// Eine „Arztpraxis Dr. Krause" wird so gefunden, obwohl „Arztpraxis" nicht im
// Namen steht. Zusätzlich: Namens-Regex für Stichwörter & namensbasierte Nischen
// (z. B. Gebäudereinigung), die in OSM kaum sauber getaggt sind.
import { config } from "@/lib/config";
import { firstGermanPhone } from "@/lib/phone/parse-de";
import type { LeadInput } from "@/lib/types";
import type { GeoPoint } from "@/lib/osm/geocode";
import { runOverpass, type OverpassElement } from "@/lib/osm/overpass";
import { BRANCHEN, ALLE_BRANCHEN, brancheForTags, type BrancheKey } from "./branchen";

// Catch-all-Branchen: nicht der exakte Tag-Wert, sondern „Tag überhaupt
// vorhanden" zählt. „Büro & Unternehmen" → JEDES office=* (alle Firmen mit Büro),
// „Handwerksbetrieb" → JEDES craft=*.
const CATCHALL_KEY: Partial<Record<BrancheKey, string>> = {
  "Büro & Unternehmen": "office",
  Handwerksbetrieb: "craft",
};

// Synonym-Gruppen für die Namens-Suche (Stichwort-Joker & namensbasierte
// Branchen). Wer „Reinigung" sucht, findet auch Gebäudereiniger, Facility usw.
const SYN_GROUPS: { label: string; terms: string[] }[] = [
  {
    label: "Gebäudereinigung",
    terms: [
      "reinigung", "gebäudereiniger", "gebäudereinigung", "gebäudeservice",
      "gebäudemanagement", "facility", "unterhaltsreinigung", "reinigungsservice",
      "glasreinigung", "gebäudedienst",
    ],
  },
  { label: "Hausmeisterservice", terms: ["hausmeister", "hausmeisterservice", "hauswartung"] },
  { label: "Sicherheitsdienst", terms: ["sicherheitsdienst", "security", "bewachung", "wachdienst"] },
  { label: "Umzug & Logistik", terms: ["umzug", "umzüge", "spedition", "logistik"] },
];

// Branchen, die wir bewusst über den Namen suchen (schlechte Tag-Abdeckung).
const NAME_BASED_BRANCHE: Partial<Record<BrancheKey, string[]>> = {
  Gebäudereinigung: SYN_GROUPS[0].terms,
};

/** Zerlegt ein Stichwort in eine Synonym-Liste (oder nur das Wort selbst). */
function synonymsFor(keyword: string): string[] {
  const k = keyword.trim().toLowerCase();
  if (!k) return [];
  for (const g of SYN_GROUPS) {
    if (g.terms.some((t) => k.includes(t) || t.includes(k))) return g.terms;
  }
  return [k];
}

/** Für die Overpass-Regex sicher machen (keine Anführungszeichen/Metazeichen). */
function sanitizeTerm(t: string): string {
  return t.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}
function nameRegex(terms: string[]): string | null {
  const cleaned = [...new Set(terms.map(sanitizeTerm).filter((t) => t.length >= 3))];
  return cleaned.length ? cleaned.join("|") : null;
}

function pick(tags: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    const v = tags[k];
    if (v && v.trim()) return v.trim();
  }
  return null;
}

/** Weicht einen Namen einer namensbasierten Kategorie zu (für das Typ-Label). */
function labelFromName(name: string): string | null {
  const n = name.toLowerCase();
  for (const g of SYN_GROUPS) {
    if (g.terms.some((t) => n.includes(t))) return g.label;
  }
  return null;
}

// Abmahn-Schutz: Rechtsanwälte, Patentanwälte und Notare sind die mit Abstand
// häufigsten Abmahner bei kalter E-Mail-Werbung. Sie werden grundsätzlich aus
// allen Suchergebnissen herausgefiltert, damit niemand sie versehentlich anschreibt.
const LAWYER_NAME_RX =
  /\b(rechtsanw|anwalt|anwält|anwalts|patentanw|notar|notariat|kanzlei für recht|rechtsanwaltskanzlei|anwaltskanzlei)/i;
function isAbmahnRisiko(name: string, tags: Record<string, string>): boolean {
  const office = (tags.office ?? "").toLowerCase();
  if (office === "lawyer" || office === "notary") return true;
  if (LAWYER_NAME_RX.test(name)) return true;
  return false;
}

function toLeadInput(el: OverpassElement, branchen: BrancheKey[]): LeadInput | null {
  const tags = el.tags ?? {};
  const name = pick(tags, ["name", "official_name", "operator", "brand"]);
  if (!name) return null; // ohne Name für Vertrieb/Tiefensuche wertlos
  if (isAbmahnRisiko(name, tags)) return null; // Anwälte/Notare ausschließen (Abmahn-Schutz)

  const phoneRaw = pick(tags, ["phone", "contact:phone", "contact:mobile"]);
  const website = pick(tags, ["website", "contact:website", "url"]);
  const email = pick(tags, ["email", "contact:email"]);
  const street = pick(tags, ["addr:street"]);
  const houseno = pick(tags, ["addr:housenumber"]);
  const strasse = [street, houseno].filter(Boolean).join(" ") || null;
  const parsed = phoneRaw ? firstGermanPhone(phoneRaw) : null;
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;

  const objektTyp =
    brancheForTags(tags, branchen) ??
    brancheForTags(tags, ALLE_BRANCHEN) ??
    labelFromName(name);

  return {
    name,
    objektTyp,
    strasse,
    plz: pick(tags, ["addr:postcode"]),
    ort: pick(tags, ["addr:city", "addr:town", "addr:village", "addr:suburb"]),
    lat,
    lon,
    phone: parsed?.normalized ?? phoneRaw,
    phoneE164: parsed?.e164 ?? null,
    email,
    ansprechpartner: null,
    website,
    openingHours: pick(tags, ["opening_hours"]),
    source: "osm",
    enrichmentSource: null,
    enrichedAt: null,
    osmId: `${el.type}/${el.id}`,
  };
}

/**
 * Sucht echte Firmen je Branche (Tag-Suche) + Stichwort (Namens-Suche) im
 * Umkreis und dedupliziert. Wirft AppError("upstream"|"timeout"|"rate_limited"),
 * wenn Overpass (inkl. Mirror) nicht antwortet.
 */
export async function searchLeadsOverpass(
  center: GeoPoint,
  radiusKm: number,
  branchen: BrancheKey[],
  keywords: string[] = [],
): Promise<LeadInput[]> {
  const radiusM = Math.round(Math.min(Math.max(radiusKm, config.osm.minRadiusKm), config.osm.maxRadiusKm) * 1000);
  const around = `(around:${radiusM},${center.lat},${center.lon})`;
  const sel: string[] = [];

  for (const b of branchen) {
    const catchall = CATCHALL_KEY[b];
    if (catchall) {
      sel.push(`nwr["${catchall}"]${around};`);
    } else if (BRANCHEN[b]) {
      for (const tag of BRANCHEN[b].tags) sel.push(`nwr["${tag.key}"="${tag.value}"]${around};`);
    }
    const nameBased = NAME_BASED_BRANCHE[b];
    if (nameBased) {
      const rx = nameRegex(nameBased);
      if (rx) sel.push(`nwr["name"~"${rx}",i]${around};`);
    }
  }

  for (const k of keywords) {
    const rx = nameRegex(synonymsFor(k));
    if (rx) sel.push(`nwr["name"~"${rx}",i]${around};`);
  }

  if (sel.length === 0) return [];

  const query = [
    `[out:json][timeout:${config.osm.overpassTimeoutSec}];`,
    "(",
    ...sel.map((s) => "  " + s),
    ");",
    "out center tags;",
  ].join("\n");

  const elements = await runOverpass(query);

  // Mapping + Dedupe (Website bzw. Name+PLZ+Straße).
  const byKey = new Map<string, LeadInput>();
  for (const el of elements) {
    const lead = toLeadInput(el, branchen);
    if (!lead) continue;
    const key = (lead.website || `${lead.name}|${lead.plz ?? ""}|${lead.strasse ?? ""}`).toLowerCase();
    if (!byKey.has(key)) byKey.set(key, lead);
  }

  return [...byKey.values()].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "de"));
}
