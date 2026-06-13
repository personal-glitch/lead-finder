import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { processDueCampaigns } from "@/lib/newsletter";
import { sendTrialEndingReminders } from "@/lib/billing/trial-reminders";
import { runDueJobAlerts } from "@/lib/job-alerts";

// Täglicher Cron-Lauf: (1) fällige geplante Newsletter verarbeiten,
// (2) Trial-Nutzer erinnern, deren Testphase bald ins Abo übergeht,
// (3) Stellen-Alerts: neue Firmen mit offenen Stellen melden.
// Wird von Vercel-Cron aufgerufen und kann mit ?key=CRON_SECRET manuell getriggert werden.
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
    let trialReminders = 0;
    try {
      trialReminders = await sendTrialEndingReminders();
    } catch (e) {
      // Trial-Erinnerungen dürfen den Newsletter-Lauf nicht blockieren.
      console.error("[cron] Trial-Erinnerungen fehlgeschlagen:", e);
    }
    let jobAlerts = 0;
    try {
      jobAlerts = await runDueJobAlerts();
    } catch (e) {
      console.error("[cron] Stellen-Alerts fehlgeschlagen:", e);
    }
    return jsonOk({ processed, trialReminders, jobAlerts });
  } catch (err) {
    return jsonError(err);
  }
}
