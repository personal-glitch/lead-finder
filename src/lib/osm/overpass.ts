// Overpass-Anfrage: baut die QL-Query aus den ausgewählten Presets und führt
// sie server-seitig aus (serialisiert + rate-limited, mit großzügigem Timeout).
import { config } from "@/lib/config";
import { rateLimited, fetchWithTimeout } from "@/lib/rate-limit";
import { AppError, toAppError } from "@/lib/errors";
import { getPreset, type PresetKey } from "./presets";
import type { GeoPoint } from "./geocode";

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

/**
 * Baut eine Overpass-QL-Query. `out center tags;` sorgt dafür, dass auch Flächen
 * (ways/relations) einen Mittelpunkt liefern.
 */
export function buildOverpassQuery(
  presets: PresetKey[],
  point: GeoPoint,
  radiusM: number,
): string {
  const around = `(around:${Math.round(radiusM)},${point.lat},${point.lon})`;
  const lines: string[] = [];
  for (const key of presets) {
    const preset = getPreset(key);
    if (!preset) continue;
    for (const filter of preset.filters) {
      lines.push(`  ${filter}${around};`);
    }
  }
  return [
    `[out:json][timeout:${config.osm.overpassTimeoutSec}];`,
    "(",
    ...lines,
    ");",
    "out center tags;",
  ].join("\n");
}

async function queryEndpoint(
  endpoint: string,
  query: string,
  timeoutMs: number,
): Promise<OverpassElement[]> {
  const host = new URL(endpoint).host;
  const res = await rateLimited(`overpass:${host}`, config.osm.overpassMinIntervalMs, () =>
    fetchWithTimeout(endpoint, {
      method: "POST",
      headers: {
        "User-Agent": config.osm.userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `data=${encodeURIComponent(query)}`,
      timeoutMs,
    }),
  );

  if (res.status === 429) throw new AppError("rate_limited", `${host}: 429`);
  if (res.status === 504) throw new AppError("timeout", `${host}: 504`);
  if (!res.ok) throw new AppError("upstream", `${host}: HTTP ${res.status}`);

  const json = (await res.json()) as { elements?: OverpassElement[] };
  return json.elements ?? [];
}

/**
 * Führt die Query gegen den konfigurierten Endpoint und – bei Fehlern – gegen
 * die Fallback-Mirror aus. Wirft eine sprechende AppError, wenn alle scheitern.
 */
export async function runOverpass(query: string): Promise<OverpassElement[]> {
  const endpoints = [...new Set([config.osm.overpassUrl, ...config.osm.overpassFallbacks])];
  let lastError: AppError | null = null;
  let sawRateLimit = false;
  const details: string[] = [];

  for (let i = 0; i < endpoints.length; i++) {
    const timeoutMs = i === 0 ? config.osm.fetchTimeoutMs : config.osm.overpassFallbackTimeoutMs;
    const host = (() => { try { return new URL(endpoints[i]).host; } catch { return endpoints[i]; } })();
    try {
      return await queryEndpoint(endpoints[i], query, timeoutMs);
    } catch (err) {
      const appErr = toAppError(err, "Overpass");
      if (appErr.code === "rate_limited") sawRateLimit = true;
      lastError = appErr;
      details.push(`${host}=${appErr.code}:${appErr.message}`);
      // nächsten Mirror versuchen
    }
  }

  // Detail nur fürs Server-Log – nach außen bleibt die Quelle/Technik anonym.
  if (lastError) console.error("[search] upstream failed:", lastError.message);
  // Temporäre Diagnose: Details aller Endpoints in die Fehlermeldung legen.
  const detailMsg = details.join(" | ");
  if (sawRateLimit) {
    throw new AppError(
      "rate_limited",
      `Zu viele Anfragen. Bitte einen Moment warten und erneut suchen. [${detailMsg}]`,
    );
  }
  throw new AppError(
    "upstream",
    `Die Live-Datenbank ist gerade nicht erreichbar. [${detailMsg}]`,
  );
}
