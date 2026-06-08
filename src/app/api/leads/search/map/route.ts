// Schritt 2 der browserseitigen Suche: Der Browser hat die Overpass-Elemente geholt
// und schickt sie hierher. Der Server parst sie mit derselben Logik wie die
// serverseitige Suche (eine Quelle der Wahrheit) und liefert fertige Leads zurück.
import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { mapElements } from "@/lib/leadgen/search-leads";
import { toLeadInput } from "@/lib/leadgen/run-search";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";
import type { OverpassElement } from "@/lib/osm/overpass";

const ElementSchema = z.object({
  type: z.string().optional(),
  id: z.number().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

const Body = z.object({
  center: z.object({
    lat: z.number(),
    lon: z.number(),
    displayName: z.string(),
  }),
  radiusKm: z.number().positive().max(50).optional(),
  elements: z.array(ElementSchema).max(8000),
  branchen: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  keyword: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    const branchen = (b.branchen ?? []).filter(isBrancheKey) as BrancheKey[];
    const keywords = [...(b.keywords ?? []), ...(b.keyword ? [b.keyword] : [])]
      .map((k) => k.trim())
      .filter(Boolean);

    const generated = mapElements(b.elements as unknown as OverpassElement[], branchen, keywords);
    const leads = generated.map(toLeadInput);

    return jsonOk({
      center: b.center,
      radiusKm: b.radiusKm ?? 15,
      leads,
      notes: [],
      demo: false,
    });
  } catch (err) {
    return jsonError(err);
  }
}
