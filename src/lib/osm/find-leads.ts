// findLeadsOSM – Orchestrierung der Geo-Suche:
//   PLZ/Ort → Geocoding → Overpass → Mapping auf Lead-Datensätze.
//
// (Früherer Name `searchEmployersOSM` war irreführend – hier suchen wir
//  Auftraggeber/Objekte für die Reinigung, keine Arbeitgeber.)
import { config } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { dedupeKey } from "@/lib/dedupe";
import { firstGermanPhone } from "@/lib/phone/parse-de";
import type { LeadInput } from "@/lib/types";
import { geocode, type GeoPoint } from "./geocode";
import { buildOverpassQuery, runOverpass, type OverpassElement } from "./overpass";
import { deriveObjektTyp, getPreset, type PresetKey } from "./presets";

export interface FindLeadsParams {
  /** PLZ oder Ort, z. B. "50667" oder "Köln". */
  plz: string;
  radiusKm: number;
  objektTypen: PresetKey[];
}

export interface FindLeadsResult {
  center: GeoPoint;
  radiusKm: number;
  leads: LeadInput[];
  /** Hinweise für die UI (z. B. dünne Hausverwaltungs-Abdeckung). */
  notes: string[];
  /** true = Overpass war nicht erreichbar, es werden Beispieldaten gezeigt. */
  demo?: boolean;
}

const DEMO_NOTE =
  "⚠️ OpenStreetMap/Overpass ist von diesem Netzwerk nicht erreichbar (IP-Sperre). " +
  "Es werden BEISPIEL-Treffer angezeigt, damit du den Ablauf (Pipeline, Vorlagen, " +
  "E-Mail-Vorschau) testen kannst. Auf einem normalen Server/Netz liefert die Suche " +
  "echte Daten – alternativ einen eigenen OVERPASS_URL/PHOTON_URL-Mirror in .env.local setzen.";

/** Erzeugt klar erkennbare, synthetische Treffer um das (echte) Zentrum herum.
 *  Keine echten Kontakte (keine Telefon/E-Mail) – damit niemand versehentlich
 *  reale Personen anschreibt. */
function buildDemoLeads(
  center: GeoPoint,
  radiusKm: number,
  presets: PresetKey[],
  query: string,
): LeadInput[] {
  const parts = center.displayName.split(",").map((s) => s.trim());
  const ort = parts.find((p) => /[a-zäöü]/i.test(p)) ?? query;
  const plz = /^\d{5}$/.test(query.trim())
    ? query.trim()
    : (parts.find((p) => /^\d{5}$/.test(p)) ?? null);

  const labels = presets.map((k) => getPreset(k)?.label ?? "Objekt");
  const count = Math.min(8, Math.max(4, presets.length * 2));
  const cosLat = Math.cos((center.lat * Math.PI) / 180) || 1;
  const out: LeadInput[] = [];

  for (let i = 0; i < count; i++) {
    const label = labels[i % labels.length];
    const angle = (i / count) * 2 * Math.PI;
    const distKm = radiusKm * 0.4;
    const dLat = (distKm / 111) * Math.cos(angle);
    const dLon = (distKm / (111 * cosLat)) * Math.sin(angle);
    out.push({
      name: `Beispiel ${label} ${i + 1}`,
      objektTyp: label,
      strasse: `Musterstraße ${10 + i}`,
      plz,
      ort,
      lat: center.lat + dLat,
      lon: center.lon + dLon,
      phone: null,
      phoneE164: null,
      email: null,
      ansprechpartner: null,
      website: `https://beispiel-${i + 1}.example.com`,
      openingHours: null,
      source: "osm",
      enrichmentSource: null,
      enrichedAt: null,
      osmId: `demo/${i + 1}`,
    });
  }
  return out;
}

function pick(tags: Record<string, string>, keys: string[]): string | null {
  for (const k of keys) {
    const v = tags[k];
    if (v && v.trim()) return v.trim();
  }
  return null;
}

export function elementToLead(
  el: OverpassElement,
  selected: PresetKey[],
): LeadInput | null {
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  const tags = el.tags ?? {};

  const name = pick(tags, ["name", "official_name", "operator", "brand"]);
  const phoneRaw = pick(tags, ["phone", "contact:phone", "contact:mobile"]);
  const website = pick(tags, ["website", "contact:website", "url"]);
  const email = pick(tags, ["email", "contact:email"]);

  // Komplett leere Treffer (kein Name, keine Kontaktwege) sind wertlos.
  if (!name && !phoneRaw && !website && !email) return null;

  const street = pick(tags, ["addr:street"]);
  const houseno = pick(tags, ["addr:housenumber"]);
  const strasse = [street, houseno].filter(Boolean).join(" ") || null;

  const parsedPhone = phoneRaw ? firstGermanPhone(phoneRaw) : null;

  return {
    name,
    objektTyp: deriveObjektTyp(tags, selected),
    strasse,
    plz: pick(tags, ["addr:postcode"]),
    ort: pick(tags, ["addr:city", "addr:town", "addr:village"]),
    lat,
    lon,
    phone: parsedPhone?.normalized ?? phoneRaw,
    phoneE164: parsedPhone?.e164 ?? null,
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

/** Führt zwei Treffer desselben Dedupe-Schlüssels zusammen (Nullwerte auffüllen). */
function merge(a: LeadInput, b: LeadInput): LeadInput {
  const out = { ...a };
  (Object.keys(b) as (keyof LeadInput)[]).forEach((k) => {
    if (out[k] == null && b[k] != null) {
      // @ts-expect-error – homogene Zuweisung über gemeinsame Keys
      out[k] = b[k];
    }
  });
  return out;
}

export async function findLeadsOSM(
  params: FindLeadsParams,
): Promise<FindLeadsResult> {
  const { plz, objektTypen } = params;
  if (!plz.trim()) {
    throw new AppError("bad_request", "Bitte eine PLZ oder einen Ort angeben.");
  }
  if (objektTypen.length === 0) {
    throw new AppError(
      "bad_request",
      "Bitte mindestens einen Objekttyp auswählen.",
    );
  }

  const radiusKm = Math.min(
    Math.max(params.radiusKm, config.osm.minRadiusKm),
    config.osm.maxRadiusKm,
  );

  const center = await geocode(plz);
  if (!center) {
    throw new AppError(
      "no_geocode",
      `Für „${plz}" konnte kein Ort gefunden werden. Bitte PLZ/Ort prüfen.`,
    );
  }

  const query = buildOverpassQuery(objektTypen, center, radiusKm * 1000);

  let elements: OverpassElement[];
  try {
    elements = await runOverpass(query);
  } catch (err) {
    // Overpass nicht erreichbar (hier: IP-Sperre) → Beispieldaten, damit der
    // restliche Ablauf testbar bleibt. In Produktion greift das praktisch nie.
    if (err instanceof AppError) {
      return {
        center,
        radiusKm,
        leads: buildDemoLeads(center, radiusKm, objektTypen, plz),
        notes: [DEMO_NOTE],
        demo: true,
      };
    }
    throw err;
  }

  // Mapping + Dedupe (Website bzw. Name+Adresse).
  const byKey = new Map<string, LeadInput>();
  for (const el of elements) {
    const lead = elementToLead(el, objektTypen);
    if (!lead) continue;
    const key = dedupeKey(lead);
    const existing = byKey.get(key);
    byKey.set(key, existing ? merge(existing, lead) : lead);
  }

  const leads = [...byKey.values()].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "de"),
  );

  const notes: string[] = [];
  if (
    objektTypen.includes("hausverwaltung") &&
    leads.filter((l) => l.objektTyp === "Hausverwaltung / Makler").length === 0
  ) {
    notes.push(
      "Hausverwaltungen/Makler sind in OpenStreetMap oft nicht erfasst – hier wurde nichts gefunden. Für diese Zielgruppe wäre später eine zusätzliche Quelle (Branchenverzeichnis) sinnvoll.",
    );
  }

  return { center, radiusKm, leads, notes };
}
