// Punkt 1: searchLeads(location, radiusKm, branchen)
//   PLZ/Ort → Geocoding (Nominatim, Fallback Photon) → Overpass-Query mit allen
//   Branchen-Tags → Mirror-Rotation (4 Server, in overpass.ts) → Lead-Liste.
//
// buildLeadQuery() und mapElements() sind ausgelagert, damit die Overpass-Abfrage
// auch CLIENT-seitig (im Browser, mit Wohn-IP) laufen kann: Server baut die Query,
// Browser holt die Daten, Server parst die Elemente. Siehe /api/leads/search/{plan,map}.
import { config } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { geocode, type GeoPoint } from "@/lib/osm/geocode";
import { runOverpass, type OverpassElement } from "@/lib/osm/overpass";
import { brancheSelectors, brancheForTags, isBrancheKey, type BrancheKey } from "./branchen";

/** Output-Format pro Lead (exakt nach Vorgabe). */
export interface GeneratedLead {
  companyName: string;
  /** Branche aus dem Katalog – oder, bei reinem Stichwort-Treffer, das Stichwort. */
  branche: string;
  street: string | null;
  houseNumber: string | null;
  zipCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  // Wird nach dem Impressum-Scrape ergänzt (siehe scrape-impressum.ts):
  contactName?: string | null;
  contactRole?: string | null;
  phoneImpressum?: string | null;
  emailImpressum?: string | null;
}

function pick(tags: Record<string, string>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = tags[k];
    if (v && v.trim()) return v.trim();
  }
  return null;
}

// Abmahn-Schutz: Rechtsanwälte, Patentanwälte und Notare sind die häufigsten
// Abmahner bei kalter E-Mail-Werbung. Sie werden aus ALLEN Suchergebnissen
// gefiltert, damit niemand sie versehentlich anschreibt.
const ABMAHN_NAME_RX =
  /(rechtsanw|anwalt|anwält|anwalts|patentanw|notar|notariat|rechtsanwaltskanzlei|anwaltskanzlei)/i;
export function isAbmahnRisiko(name: string, tags: Record<string, string> = {}): boolean {
  const office = (tags.office ?? "").toLowerCase();
  if (office === "lawyer" || office === "notary") return true;
  return ABMAHN_NAME_RX.test(name);
}

function elementToLead(
  el: OverpassElement,
  selected: BrancheKey[],
  keywords: string[],
): GeneratedLead | null {
  const tags = el.tags ?? {};
  const companyName = pick(tags, "name", "official_name", "operator", "brand");
  if (!companyName) return null; // ohne Namen überspringen
  if (isAbmahnRisiko(companyName, tags)) return null; // Anwälte/Notare ausschließen (Abmahn-Schutz)

  // 1) Branche per OSM-Tag; 2) sonst Stichwort-Joker (Name enthält Suchwort).
  let branche: string | null = brancheForTags(tags, selected);
  if (!branche && keywords.length) {
    const lc = companyName.toLowerCase();
    const hit = keywords.find((kw) => lc.includes(kw.toLowerCase()));
    if (hit) branche = hit;
  }
  if (!branche) return null;

  return {
    companyName,
    branche,
    street: pick(tags, "addr:street"),
    houseNumber: pick(tags, "addr:housenumber"),
    zipCode: pick(tags, "addr:postcode"),
    city: pick(tags, "addr:city", "addr:town", "addr:village"),
    latitude: el.lat ?? el.center?.lat ?? null,
    longitude: el.lon ?? el.center?.lon ?? null,
    phone: pick(tags, "phone", "contact:phone", "contact:mobile"),
    email: pick(tags, "email", "contact:email"),
    website: pick(tags, "website", "contact:website", "url"),
  };
}

/** Bereinigt ein Stichwort für die Overpass-Namensregex (RE2): Sonderzeichen escapen. */
function cleanKeyword(kw: string): string {
  return kw.trim().replace(/["\\]/g, "").replace(/[.*+?^${}()|[\]]/g, "\\$&");
}

/** Baut die Overpass-QL-Query (Branchen-Tags + optionaler Namens-Stichwort-Joker). */
export function buildLeadQuery(
  point: GeoPoint,
  radiusKm: number,
  branchen: BrancheKey[],
  keywords: string[] = [],
): string {
  const selected = branchen.filter(isBrancheKey);
  const kws = keywords.map((k) => k.trim()).filter(Boolean);
  const radiusM = Math.round(Math.min(Math.max(radiusKm, 0.5), 50) * 1000);
  const around = `(around:${radiusM},${point.lat},${point.lon})`;
  const selectors = [...brancheSelectors(selected)];
  if (kws.length) {
    const alt = kws.map(cleanKeyword).filter(Boolean).join("|");
    if (alt) selectors.push(`nwr["name"~"${alt}",i]`);
  }
  const body = selectors.map((sel) => `  ${sel}${around};`).join("\n");
  return `[out:json][timeout:${config.osm.overpassTimeoutSec}];\n(\n${body}\n);\nout center tags;`;
}

/** Parsed Overpass-Elemente → Lead-Liste (ohne Namen verworfen, stabil sortiert). */
export function mapElements(
  elements: OverpassElement[],
  branchen: BrancheKey[],
  keywords: string[] = [],
): GeneratedLead[] {
  const selected = branchen.filter(isBrancheKey);
  const kws = keywords.map((k) => k.trim()).filter(Boolean);
  const leads: GeneratedLead[] = [];
  for (const el of elements) {
    const lead = elementToLead(el, selected, kws);
    if (lead) leads.push(lead);
  }
  return leads.sort((a, b) => a.companyName.localeCompare(b.companyName, "de"));
}

export async function searchLeads(
  location: string,
  radiusKm: number,
  branchen: BrancheKey[],
  keywords: string[] = [],
): Promise<GeneratedLead[]> {
  const selected = branchen.filter(isBrancheKey);
  const kws = keywords.map((k) => k.trim()).filter(Boolean);
  if (!location.trim()) throw new AppError("bad_request", "Bitte PLZ oder Ort angeben.");
  if (selected.length === 0 && kws.length === 0) {
    throw new AppError("bad_request", "Bitte mindestens eine Branche oder ein Stichwort wählen.");
  }

  // 1) Geocoding
  const point = await geocode(location);
  if (!point) throw new AppError("no_geocode", `Für „${location}" kein Ort gefunden.`);

  // 2) Overpass-Query bauen
  const query = buildLeadQuery(point, radiusKm, selected, kws);

  // 3) Overpass mit Mirror-Rotation (overpass-api.de → kumi → fr → mail.ru)
  const elements = await runOverpass(query);

  // 4) Parsen → Lead-Liste
  return mapElements(elements, selected, kws);
}
