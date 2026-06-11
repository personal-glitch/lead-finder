// Overpass-Proxy als Vercel EDGE-Funktion. Die Edge-Runtime läuft auf einem
// anderen Netzwerk als die Node-Serverless-Funktionen – Overpass blockt diese
// IPs i. d. R. NICHT. So wird die Kategorie-Suche ohne externen Cloudflare-Worker
// von der Cloud erreichbar.
export const runtime = "edge";

const TARGETS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];
const PER_TRY_TIMEOUT_MS = 16_000;

export async function GET() {
  return new Response("KundenRadar Overpass-Edge-Proxy ok", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  let lastStatus = 502;
  for (const target of TARGETS) {
    try {
      const r = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "KundenRadar/1.0 (kontakt@seciora-solutions.de)",
          Accept: "application/json",
        },
        body,
        signal: AbortSignal.timeout(PER_TRY_TIMEOUT_MS),
      });
      if (r.ok) {
        return new Response(r.body, {
          status: 200,
          headers: { "content-type": r.headers.get("content-type") || "application/json" },
        });
      }
      lastStatus = r.status;
    } catch {
      lastStatus = 504;
    }
  }
  return new Response(JSON.stringify({ error: "overpass upstream failed", status: lastStatus }), {
    status: lastStatus,
    headers: { "content-type": "application/json" },
  });
}
