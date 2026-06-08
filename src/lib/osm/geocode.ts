// Geocoding (PLZ/Ort → lat/lon). Primär Nominatim (Pflicht-Etikette: eigener
// User-Agent, max. 1 Req/s, Cache). Fällt auf Photon (komoot) zurück, falls
// Nominatim die IP sperrt (z. B. aus Rechenzentren) oder nichts liefert.
import { config } from "@/lib/config";
import { rateLimited, fetchWithTimeout } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";

export interface GeoPoint {
  lat: number;
  lon: number;
  displayName: string;
}

const cache = new Map<string, GeoPoint | null>();

async function geocodeNominatim(q: string): Promise<GeoPoint | null> {
  const url = new URL(config.osm.nominatimUrl);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "de");
  url.searchParams.set("limit", "1");

  const res = await rateLimited("nominatim", config.osm.nominatimMinIntervalMs, () =>
    fetchWithTimeout(url.toString(), {
      headers: {
        "User-Agent": config.osm.userAgent,
        Accept: "application/json",
        "Accept-Language": "de",
      },
      timeoutMs: config.osm.fetchTimeoutMs,
    }),
  );
  if (!res.ok) throw new AppError("upstream", `Nominatim HTTP ${res.status}`);
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!Array.isArray(data) || data.length === 0) return null;
  return {
    lat: Number.parseFloat(data[0].lat),
    lon: Number.parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    postcode?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
}

async function geocodePhoton(q: string): Promise<GeoPoint | null> {
  const url = new URL(config.osm.photonUrl);
  url.searchParams.set("q", q);
  url.searchParams.set("lang", "de");
  url.searchParams.set("limit", "5");

  const res = await rateLimited("photon", 1100, () =>
    fetchWithTimeout(url.toString(), {
      headers: { "User-Agent": config.osm.userAgent, Accept: "application/json" },
      timeoutMs: config.osm.fetchTimeoutMs,
    }),
  );
  if (!res.ok) throw new AppError("upstream", `Photon HTTP ${res.status}`);
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const features = data.features ?? [];
  if (features.length === 0) return null;
  // Deutschland bevorzugen, falls vorhanden.
  const f = features.find((x) => x.properties.countrycode === "DE") ?? features[0];
  const [lon, lat] = f.geometry.coordinates;
  const p = f.properties;
  const displayName =
    [p.name, p.postcode, p.city, p.state, p.country].filter(Boolean).join(", ") || q;
  return { lat, lon, displayName };
}

export async function geocode(query: string): Promise<GeoPoint | null> {
  const q = query.trim();
  if (!q) return null;

  const cacheKey = q.toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  let point: GeoPoint | null = null;
  let firstError: unknown = null;

  // 1) Nominatim (kanonisch), 2) Photon (Fallback).
  for (const provider of [geocodeNominatim, geocodePhoton]) {
    try {
      point = await provider(q);
      if (point) break;
    } catch (err) {
      firstError ??= err;
    }
  }

  // Nur cachen, wenn ein Provider geantwortet hat (auch „kein Treffer").
  if (point || firstError === null) {
    cache.set(cacheKey, point);
  }
  return point;
}
