import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

// Bewertet eine öffentliche Website über die offizielle Google-PageSpeed-Insights-API
// (legal & kostenlos). Kein Scraping. Liefert Score + Note für Webdesign-/SEO-Verkäufer.
const Body = z.object({ url: z.string().max(300) });

function normalizeUrl(raw: string): string | null {
  let u = raw.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try { return new URL(u).toString(); } catch { return null; }
}

function grade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

export async function POST(req: Request) {
  try {
    const { url } = Body.parse(await req.json());
    const target = normalizeUrl(url);
    if (!target) throw new AppError("bad_request", "Keine gültige Website-Adresse.");

    const key = process.env.GOOGLE_PAGESPEED_KEY?.trim();
    const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    api.searchParams.set("url", target);
    api.searchParams.set("strategy", "mobile");
    api.searchParams.append("category", "performance");
    api.searchParams.append("category", "seo");
    api.searchParams.append("category", "best-practices");
    if (key) api.searchParams.set("key", key);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 55_000);
    let res: Response;
    try {
      res = await fetch(api.toString(), { signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      // 400 = Seite nicht erreichbar/keine Website → für den Vertrieb auch ein Signal.
      if (res.status === 400) {
        return jsonOk({ ok: true, reachable: false, reason: "Keine erreichbare Website gefunden – starkes Verkaufsargument.", url: target });
      }
      throw new AppError("upstream", `Prüfung nicht möglich (HTTP ${res.status}).`);
    }
    const data = await res.json();
    const cats = data?.lighthouseResult?.categories ?? {};
    const perf = Math.round((cats.performance?.score ?? 0) * 100);
    const seo = cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null;
    const best = cats["best-practices"]?.score != null ? Math.round(cats["best-practices"].score * 100) : null;
    const finalUrl: string = data?.lighthouseResult?.finalUrl ?? target;
    const https = finalUrl.startsWith("https://");
    const hasViewport = data?.lighthouseResult?.audits?.viewport?.score === 1;

    return jsonOk({
      ok: true,
      reachable: true,
      url: finalUrl,
      performance: perf,
      seo,
      bestPractices: best,
      https,
      mobileFriendly: hasViewport,
      grade: grade(perf),
      // Verkaufs-Signal: schlechte Seite = Chance.
      opportunity: perf < 50 || !https || !hasViewport,
    });
  } catch (err) {
    return jsonError(err);
  }
}
