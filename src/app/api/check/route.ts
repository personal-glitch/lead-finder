import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { runBrancheSearch } from "@/lib/leadgen/run-search";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";

// Öffentlicher Gratis-Check (Lead-Magnet): zeigt anonym, wie viele Firmen einer
// Branche im Umkreis liegen, plus 3 angeteaserte Treffer (ohne Telefonnummern).
// Bewusst KEINE vollständigen Kontaktdaten – die gibt es nur mit Konto.
export const maxDuration = 30;

const Body = z.object({
  plz: z.string().min(1).max(80),
  branche: z.string().min(1),
  radiusKm: z.number().positive().max(30).optional(),
});

// Einfacher In-Memory-Ratelimiter (best effort je Serverless-Instanz) gegen Missbrauch.
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear(); // Speicher nicht volllaufen lassen
  return arr.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) {
      throw new AppError("rate_limited", "Zu viele Anfragen – bitte kurz warten und erneut versuchen.");
    }
    const b = Body.parse(await req.json());
    if (!isBrancheKey(b.branche)) throw new AppError("bad_request", "Unbekannte Branche.");

    const radius = b.radiusKm ?? 15;
    const result = await runBrancheSearch(b.plz.trim(), radius, [b.branche as BrancheKey], []);
    const leads = result.leads;

    // Nur Teaser: Name + Ort + „hat Telefon/Website" – KEINE Nummern/URLs.
    const preview = leads.slice(0, 3).map((l) => ({
      name: l.name ?? "Firma",
      ort: l.ort ?? null,
      branche: l.objektTyp ?? b.branche,
      hasPhone: Boolean(l.phone),
      hasWebsite: Boolean(l.website),
    }));

    return jsonOk({
      ort: result.center.displayName.split(",")[0],
      radiusKm: result.radiusKm,
      branche: b.branche,
      total: leads.length,
      withPhone: leads.filter((l) => l.phone).length,
      preview,
      demo: Boolean(result.demo),
    });
  } catch (err) {
    return jsonError(err);
  }
}
