import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { processDueCampaigns } from "@/lib/newsletter";

// Verarbeitet fällige geplante Newsletter. Wird von Vercel-Cron aufgerufen
// (täglich) und kann mit ?key=CRON_SECRET auch manuell getriggert werden.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET?.trim();
    const isVercelCron = Boolean(req.headers.get("x-vercel-cron"));
    const key = new URL(req.url).searchParams.get("key");
    // Wenn ein Secret gesetzt ist: nur Vercel-Cron oder passender Schlüssel.
    if (secret && !isVercelCron && key !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
    const processed = await processDueCampaigns();
    return jsonOk({ processed });
  } catch (err) {
    return jsonError(err);
  }
}
