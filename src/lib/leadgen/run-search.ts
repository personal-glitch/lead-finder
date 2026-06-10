// Gemeinsamer Suchlauf: geocode → searchLeads → (Demo-Fallback) → LeadInput[].
// Wird von /api/agents/[id]/run UND /api/leads/search genutzt.
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { geocode, type GeoPoint } from "@/lib/osm/geocode";
import { firstGermanPhone } from "@/lib/phone/parse-de";
import type { LeadInput } from "@/lib/types";
import { type GeneratedLead } from "./search-leads";
import { searchLeadsNominatim } from "@/lib/osm/nominatim-search";
import { searchLeadsOverpass } from "./overpass-search";
import type { BrancheKey } from "./branchen";

export interface BrancheSearchResult {
  center: GeoPoint;
  radiusKm: number;
  leads: LeadInput[];
  notes: string[];
  demo: boolean;
  /** Temporäre Diagnose (nur wenn debug angefordert): welche Quelle, welcher Fehler. */
  _diag?: { source: string; overpassCount?: number; overpassError?: string; nominatimError?: string };
}

const DEMO_NOTE =
  "⚠️ Die Live-Datenbank ist von diesem Netzwerk gerade nicht erreichbar. " +
  "Es werden BEISPIEL-Treffer angezeigt, damit du den Ablauf testen kannst. Im Live-Betrieb " +
  "liefert die Suche echte Firmen aus den gewählten Branchen.";

export function toLeadInput(g: GeneratedLead): LeadInput {
  const parsed = g.phone ? firstGermanPhone(g.phone) : null;
  return {
    name: g.companyName,
    objektTyp: g.branche,
    strasse: [g.street, g.houseNumber].filter(Boolean).join(" ") || null,
    plz: g.zipCode,
    ort: g.city,
    lat: g.latitude,
    lon: g.longitude,
    phone: parsed?.normalized ?? g.phone,
    phoneE164: parsed?.e164 ?? null,
    email: g.email,
    ansprechpartner: g.contactName ?? null,
    website: g.website,
    openingHours: null,
    source: "recherche",
    enrichmentSource: g.contactName ? "web" : null,
    enrichedAt: g.contactName ? new Date().toISOString() : null,
    osmId: null,
  };
}

function buildDemoLeads(
  center: GeoPoint,
  radiusKm: number,
  branchen: BrancheKey[],
  keywords: string[] = [],
): LeadInput[] {
  const labels: string[] = [...branchen, ...keywords].filter(Boolean);
  if (labels.length === 0) labels.push("Büro & Unternehmen");
  const count = Math.min(9, Math.max(4, labels.length * 2));
  const cosLat = Math.cos((center.lat * Math.PI) / 180) || 1;
  const parts = center.displayName.split(",").map((s) => s.trim());
  const ort = parts.find((p) => /[a-zäöü]/i.test(p)) ?? null;

  return Array.from({ length: count }, (_, i) => {
    const branche = labels[i % labels.length];
    const angle = (i / count) * 2 * Math.PI;
    const d = radiusKm * 0.4;
    return {
      name: `Beispiel ${branche} ${i + 1}`,
      objektTyp: branche,
      strasse: `Musterstraße ${10 + i}`,
      plz: /^\d{5}$/.test(parts[0]) ? parts[0] : null,
      ort,
      lat: center.lat + (d / 111) * Math.cos(angle),
      lon: center.lon + (d / (111 * cosLat)) * Math.sin(angle),
      phone: null, phoneE164: null, email: null, ansprechpartner: null,
      website: `https://beispiel-${i + 1}.example.com`,
      openingHours: null, source: "recherche", enrichmentSource: null, enrichedAt: null,
      osmId: null,
    } satisfies LeadInput;
  });
}

export async function runBrancheSearch(
  plz: string,
  radiusKm: number,
  branchen: BrancheKey[],
  keywords: string[] = [],
): Promise<BrancheSearchResult> {
  // Geocoding zuerst (Nominatim klappt auch von Vercel/Cloud-IPs).
  const center = await geocode(plz);
  if (!center) throw new AppError("no_geocode", `Für „${plz}" wurde kein Ort gefunden.`);

  const softCodes = ["upstream", "timeout", "rate_limited"];
  const diag: BrancheSearchResult["_diag"] = { source: "none" };

  // 0) Ist ein Overpass-Proxy (OVERPASS_URL) gesetzt, ist die Kategorie-Suche von
  //    der Cloud erreichbar → PRIMÄR nutzen (findet Firmen nach Tätigkeit).
  if (config.osm.overpassProxied) {
    try {
      const leads = await searchLeadsOverpass(center, radiusKm, branchen, keywords);
      diag.overpassCount = leads.length;
      if (leads.length > 0) {
        diag.source = "overpass";
        return { center, radiusKm, leads, notes: [], demo: false, _diag: diag };
      }
    } catch (err) {
      diag.overpassError = err instanceof AppError ? `${err.code}: ${err.message}` : String(err);
      const code = err instanceof AppError ? err.code : "upstream";
      if (!softCodes.includes(code)) throw err;
    }
  }

  // 1) Namens-Suche über Nominatim – schnell & von Vercel zuverlässig erreichbar.
  let nominatimOk = false;
  try {
    const leads = (await searchLeadsNominatim(center, radiusKm, branchen, keywords)).map(toLeadInput);
    nominatimOk = true;
    diag.source = "nominatim";
    if (leads.length > 0) {
      return { center, radiusKm, leads, notes: [], demo: false, _diag: diag };
    }
    // 0 Treffer → unten Kategorie-Suche (Overpass) als Rettung versuchen.
  } catch (err) {
    diag.nominatimError = err instanceof AppError ? `${err.code}: ${err.message}` : String(err);
    const code = err instanceof AppError ? err.code : "upstream";
    if (!softCodes.includes(code)) throw err;
  }

  // 2) RETTUNG: Kategorie-Suche über Overpass – nur wenn Nominatim nichts fand
  //    bzw. nicht erreichbar war. (Best effort; kann aus der Cloud scheitern.)
  try {
    const leads = await searchLeadsOverpass(center, radiusKm, branchen, keywords);
    diag.overpassCount = leads.length;
    if (leads.length > 0) {
      diag.source = "overpass";
      return { center, radiusKm, leads, notes: [], demo: false, _diag: diag };
    }
  } catch (err) {
    diag.overpassError = err instanceof AppError ? `${err.code}: ${err.message}` : String(err);
    const code = err instanceof AppError ? err.code : "upstream";
    if (!softCodes.includes(code) && !nominatimOk) throw err;
  }

  // 3) Nichts gefunden / beide Quellen aus → leere, ehrliche Antwort bzw. Demo.
  if (nominatimOk) {
    return {
      center, radiusKm, leads: [],
      notes: ["Keine Treffer in diesem Umkreis – Umkreis vergrößern oder andere Branche/Stichwort wählen."],
      demo: false, _diag: diag,
    };
  }
  diag.source = "demo";
  return { center, radiusKm, leads: buildDemoLeads(center, radiusKm, branchen, keywords), notes: [DEMO_NOTE], demo: true, _diag: diag };
}
