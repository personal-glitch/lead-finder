import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { runBrancheSearch } from "@/lib/leadgen/run-search";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";

// Overpass (Kategorie-Suche) + ggf. Nominatim-Fallback brauchen Luft.
export const maxDuration = 60;

const Body = z.object({
  // PLZ oder Ort (Alias "location" laut Spec ebenfalls akzeptiert).
  plz: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  radiusKm: z.number().positive().max(50).optional(),
  // Hybrid: Branchen aus dem Katalog UND/ODER freie Stichwörter (Joker).
  branchen: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  keyword: z.string().optional(),
  // Temporär: Diagnose-Infos (Quelle/Fehler) mit ausgeben.
  debug: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    const plz = (b.plz ?? b.location ?? "").trim();
    const branchen = (b.branchen ?? []).filter(isBrancheKey) as BrancheKey[];
    const keywords = [...(b.keywords ?? []), ...(b.keyword ? [b.keyword] : [])]
      .map((k) => k.trim())
      .filter(Boolean);
    const result = await runBrancheSearch(plz, b.radiusKm ?? 15, branchen, keywords);
    // _diag nur bei ausdrücklichem debug zurückgeben (Datenquelle bleibt sonst intern).
    if (!b.debug && "_diag" in result) {
      const { _diag, ...rest } = result;
      void _diag;
      return jsonOk(rest);
    }
    return jsonOk(result);
  } catch (err) {
    return jsonError(err);
  }
}
