// Schritt 1 der browserseitigen Suche: Server geocodiert (klappt auch von Vercel)
// und baut die Overpass-Query. Die eigentliche Overpass-Abfrage führt danach der
// BROWSER aus (Wohn-IP wird nicht geblockt) – siehe /api/leads/search/map.
import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { geocode } from "@/lib/osm/geocode";
import { buildLeadQuery } from "@/lib/leadgen/search-leads";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";

const Body = z.object({
  plz: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  radiusKm: z.number().positive().max(50).optional(),
  branchen: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  keyword: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    const location = (b.plz ?? b.location ?? "").trim();
    const radiusKm = b.radiusKm ?? 15;
    const branchen = (b.branchen ?? []).filter(isBrancheKey) as BrancheKey[];
    const keywords = [...(b.keywords ?? []), ...(b.keyword ? [b.keyword] : [])]
      .map((k) => k.trim())
      .filter(Boolean);

    if (!location) throw new AppError("bad_request", "Bitte PLZ oder Ort angeben.");
    if (branchen.length === 0 && keywords.length === 0) {
      throw new AppError("bad_request", "Bitte mindestens eine Branche oder ein Stichwort wählen.");
    }

    const point = await geocode(location);
    if (!point) throw new AppError("no_geocode", `Für „${location}" kein Ort gefunden.`);

    const query = buildLeadQuery(point, radiusKm, branchen, keywords);
    return jsonOk({ center: point, radiusKm, query });
  } catch (err) {
    return jsonError(err);
  }
}
