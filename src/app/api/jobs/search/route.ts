import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 30;

// Sucht offene Stellenanzeigen über die OFFIZIELLE REST-API der Bundesagentur für
// Arbeit (kein Scraping). Für die Persona „Personalvermittlung / Zeitarbeit":
// zeigt, welche Firma Personal sucht und seit wann (= heißes Signal).
const Body = z.object({
  was: z.string().max(120).optional(),
  wo: z.string().max(120).optional(),
  umkreis: z.number().int().min(0).max(200).optional(),
  size: z.number().int().min(1).max(50).optional(),
});

const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs";

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    // Offizieller API-Schlüssel – für den Produktivbetrieb über das Arbeitsagentur-API-Portal
    // registrieren und in ARBEITSAGENTUR_API_KEY hinterlegen.
    const key = process.env.ARBEITSAGENTUR_API_KEY?.trim() || "jobboerse-jobsuche";

    const url = new URL(BASE);
    if (b.was) url.searchParams.set("was", b.was);
    if (b.wo) url.searchParams.set("wo", b.wo);
    if (b.umkreis != null) url.searchParams.set("umkreis", String(b.umkreis));
    url.searchParams.set("size", String(b.size ?? 25));
    url.searchParams.set("page", "1");

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20_000);
    let res: Response;
    try {
      res = await fetch(url.toString(), { headers: { "X-API-Key": key, accept: "application/json" }, signal: ctrl.signal });
    } finally { clearTimeout(timer); }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new AppError("not_configured", "Stellen-Modul noch nicht freigeschaltet – bitte offiziellen Arbeitsagentur-API-Schlüssel hinterlegen.");
      }
      throw new AppError("upstream", `Stellensuche nicht möglich (HTTP ${res.status}).`);
    }
    const data = await res.json();
    const raw: any[] = data?.stellenangebote ?? [];
    const today = Date.now();
    const jobs = raw.map((j) => {
      const posted = j.aktuelleVeroeffentlichungsdatum ?? j.eintrittsdatum ?? null;
      const daysOpen = posted ? Math.max(0, Math.round((today - Date.parse(posted)) / 86_400_000)) : null;
      const ort = j.arbeitsort ?? {};
      return {
        refnr: j.refnr ?? null,
        title: j.titel ?? j.beruf ?? "Stelle",
        company: j.arbeitgeber ?? null,
        plz: ort.plz ?? null,
        ort: ort.ort ?? null,
        postedDate: posted,
        daysOpen,
      };
    });
    return jsonOk({ count: data?.maxErgebnisse ?? jobs.length, jobs });
  } catch (err) {
    return jsonError(err);
  }
}
