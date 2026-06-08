import "server-only";
// Firmen-Suche über Nominatim (OpenStreetMap) – KOSTENLOS, ohne API-Key und – anders
// als Overpass – auch von Hosting-/Cloud-IPs (Vercel) erreichbar. Pro Branche eine
// Kategorie-Suche im Umkreis (viewbox + bounded). Liefert echte Firmen inkl. – soweit
// in OSM hinterlegt – Telefon & Website. Pflicht-Etikette: aussagekräftiger User-Agent,
// max. 1 Anfrage/Sekunde (rateLimited).
import { config } from "@/lib/config";
import { rateLimited, fetchWithTimeout } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import type { GeoPoint } from "./geocode";
import type { GeneratedLead } from "@/lib/leadgen/search-leads";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen-catalog";

// Bessere Nominatim-Suchbegriffe für zusammengesetzte/mehrdeutige Branchen.
const TERMS: Partial<Record<BrancheKey, string>> = {
  "Pflege & Senioren": "Pflegedienst",
  "Heilpraktiker & Therapie": "Heilpraktiker",
  "KFZ-Werkstatt": "Autowerkstatt",
  "IT- & Software-Firma": "Softwarefirma",
  "Werbe- & Marketingagentur": "Werbeagentur",
  "Foto- & Videostudio": "Fotostudio",
  "Café & Bäckerei": "Bäckerei",
  "Bar & Kneipe": "Kneipe",
  "Hotel & Pension": "Hotel",
  "Supermarkt & Lebensmittel": "Supermarkt",
  "Mode & Bekleidung": "Bekleidungsgeschäft",
  "Möbel & Einrichtung": "Möbelhaus",
  "Baumarkt & Garten": "Baumarkt",
  "Elektronik & Technik": "Elektronikgeschäft",
  "Optiker & Schmuck": "Optiker",
  "Spedition & Logistik": "Spedition",
  "Kosmetik & Nagelstudio": "Kosmetikstudio",
  "Massage & Spa": "Massagepraxis",
  "Tattoo & Piercing": "Tattoostudio",
  "Yoga- & Tanzstudio": "Tanzstudio",
  "Sportanlage & Verein": "Sportverein",
  "Kita & Kindergarten": "Kindergarten",
  "Nachhilfe & Sprachschule": "Sprachschule",
  "Maler & Lackierer": "Malerbetrieb",
  "Sanitär & Heizung": "Sanitärbetrieb",
  "Tischler & Schreiner": "Schreinerei",
  "Garten- & Landschaftsbau": "Gartenbau",
  "Handwerksbetrieb": "Handwerk",
  "Büro & Unternehmen": "Büro",
};

function termFor(b: BrancheKey): string {
  if (TERMS[b]) return TERMS[b] as string;
  // Fallback: erstes Segment vor "&", abschließendes "-" entfernen.
  return b.split("&")[0].replace(/[-\s]+$/, "").trim();
}

interface NominatimItem {
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
}

function viewbox(center: GeoPoint, radiusKm: number): string {
  const dLat = radiusKm / 111;
  const dLon = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180) || 1);
  // Reihenfolge: left(minLon),top(maxLat),right(maxLon),bottom(minLat)
  return [center.lon - dLon, center.lat + dLat, center.lon + dLon, center.lat - dLat].join(",");
}

async function searchTerm(q: string, center: GeoPoint, radiusKm: number): Promise<NominatimItem[]> {
  const url = new URL(config.osm.nominatimUrl);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "40");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("countrycodes", "de");
  url.searchParams.set("viewbox", viewbox(center, radiusKm));
  url.searchParams.set("bounded", "1");

  const res = await rateLimited("nominatim", config.osm.nominatimMinIntervalMs, () =>
    fetchWithTimeout(url.toString(), {
      headers: { "User-Agent": config.osm.userAgent, Accept: "application/json" },
      timeoutMs: config.osm.fetchTimeoutMs,
    }),
  );
  if (res.status === 429) throw new AppError("rate_limited", "Nominatim: 429");
  if (!res.ok) throw new AppError("upstream", `Nominatim: HTTP ${res.status}`);
  return (await res.json()) as NominatimItem[];
}

function toLead(it: NominatimItem, branche: string): GeneratedLead | null {
  const a = it.address ?? {};
  const x = it.extratags ?? {};
  const name = (it.name && it.name.trim()) || it.display_name?.split(",")[0]?.trim() || null;
  if (!name) return null;
  return {
    companyName: name,
    branche,
    street: a.road ?? a.pedestrian ?? null,
    houseNumber: a.house_number ?? null,
    zipCode: a.postcode ?? null,
    city: a.city ?? a.town ?? a.village ?? a.suburb ?? a.municipality ?? null,
    latitude: it.lat ? Number.parseFloat(it.lat) : null,
    longitude: it.lon ? Number.parseFloat(it.lon) : null,
    phone: x.phone ?? x["contact:phone"] ?? x["contact:mobile"] ?? null,
    email: x.email ?? x["contact:email"] ?? null,
    website: x.website ?? x["contact:website"] ?? x.url ?? null,
  };
}

/**
 * Sucht echte Firmen je Branche/Stichwort im Umkreis und dedupliziert.
 * Wirft AppError("upstream"|"timeout"|"rate_limited"), wenn Nominatim nicht antwortet.
 */
export async function searchLeadsNominatim(
  center: GeoPoint,
  radiusKm: number,
  branchen: BrancheKey[],
  keywords: string[] = [],
): Promise<GeneratedLead[]> {
  const terms = [
    ...branchen.filter(isBrancheKey).map((b) => ({ q: termFor(b), label: b as string })),
    ...keywords.map((k) => k.trim()).filter(Boolean).map((k) => ({ q: k, label: k })),
  ].slice(0, 8); // Laufzeit begrenzen (1 Anfrage/Sek.)

  const out = new Map<string, GeneratedLead>();
  let anyOk = false;
  let lastErr: unknown = null;

  for (const t of terms) {
    let items: NominatimItem[];
    try {
      items = await searchTerm(t.q, center, radiusKm);
      anyOk = true;
    } catch (err) {
      lastErr = err;
      continue; // einzelnen Begriff überspringen
    }
    for (const it of items) {
      const lead = toLead(it, t.label);
      if (!lead) continue;
      const key = (lead.website || `${lead.companyName}|${lead.zipCode ?? ""}|${lead.street ?? ""}`).toLowerCase();
      if (!out.has(key)) out.set(key, lead);
    }
  }

  // Kein einziger Begriff erreichbar → echter Upstream-Fehler (löst Demo-Fallback aus).
  if (!anyOk && lastErr) throw lastErr;
  return [...out.values()].sort((a, b) => a.companyName.localeCompare(b.companyName, "de"));
}
