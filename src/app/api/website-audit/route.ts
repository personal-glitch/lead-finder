import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

// Bewertet eine öffentliche Website. Primär über die offizielle Google-PageSpeed-
// Insights-API (legal & kostenlos, optional mit GOOGLE_PAGESPEED_KEY). Wenn diese
// nicht verfügbar ist (z. B. HTTP 429 ohne Schlüssel), greift ein eigener
// Basis-Check: Erreichbarkeit, HTTPS, Mobil-Viewport, Ladezeit, Titel. Dabei wird
// ausschließlich die eigene öffentliche Seite des Leads abgerufen – kein Scraping.
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

// Eigener Basis-Check ohne Fremd-API: lädt die Seite einmal und leitet aus
// HTTPS, Mobil-Viewport und Ladezeit eine grobe Note ab.
async function basicCheck(target: string) {
  const tryFetch = async (u: string) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    const started = Date.now();
    try {
      const res = await fetch(u, {
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": "Mozilla/5.0 (KundenRadar Website-Check)" },
      });
      const ms = Date.now() - started;
      const html = res.ok ? (await res.text()).slice(0, 200_000) : "";
      return { res, ms, html };
    } finally {
      clearTimeout(timer);
    }
  };

  let r: Awaited<ReturnType<typeof tryFetch>> | null = null;
  try {
    r = await tryFetch(target);
  } catch {
    // HTTPS fehlgeschlagen → http versuchen (Seite ohne SSL ist selbst ein Signal).
    const httpUrl = target.replace(/^https:/i, "http:");
    if (httpUrl !== target) { try { r = await tryFetch(httpUrl); } catch { r = null; } }
  }

  if (!r || !r.res.ok) {
    return { ok: true, reachable: false, reason: "Keine erreichbare Website gefunden – starkes Verkaufsargument.", url: target } as const;
  }

  const finalUrl = r.res.url || target;
  const https = finalUrl.startsWith("https://");
  const html = r.html;
  const hasViewport = /<meta[^>]+name=["']?viewport/i.test(html);
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim().slice(0, 120) : null;
  const slow = r.ms > 2500;

  // Heuristische Note: jeder Mangel zieht Punkte ab.
  let score = 100;
  if (!https) score -= 35;
  if (!hasViewport) score -= 30;
  if (slow) score -= 20;
  if (r.ms > 5000) score -= 15;
  score = Math.max(5, score);

  return {
    ok: true,
    reachable: true,
    url: finalUrl,
    performance: null,
    seo: null,
    bestPractices: null,
    https,
    mobileFriendly: hasViewport,
    loadMs: r.ms,
    title,
    grade: grade(score),
    estimated: true, // Hinweis: grobe Eigen-Einschätzung, kein PageSpeed-Score.
    opportunity: !https || !hasViewport || slow,
  } as const;
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
    const timer = setTimeout(() => ctrl.abort(), 45_000);
    let res: Response | null = null;
    try {
      res = await fetch(api.toString(), { signal: ctrl.signal });
    } catch {
      res = null; // Netzw/Timeout → Fallback
    } finally {
      clearTimeout(timer);
    }

    // PageSpeed nicht ok? → eigener Basis-Check statt Fehlermeldung.
    if (!res || !res.ok) {
      // 400 = Seite konnte nicht geladen werden → trotzdem selbst gegenprüfen.
      return jsonOk(await basicCheck(target));
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
      estimated: false,
      // Verkaufs-Signal: schlechte Seite = Chance.
      opportunity: perf < 50 || !https || !hasViewport,
    });
  } catch (err) {
    return jsonError(err);
  }
}
