import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendCampaign } from "@/lib/newsletter";

// Mehr Zeit fürs sequentielle Senden (Throttling).
export const maxDuration = 60;

// Versendet einen Newsletter an alle bestätigten Abonnenten – NUR Superadmin.
export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled) {
      throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    }
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const body = (await req.json().catch(() => ({}))) as { subject?: string; body?: string };
    const subject = (body.subject ?? "").trim();
    const text = (body.body ?? "").trim();
    if (subject.length < 3) throw new AppError("bad_request", "Bitte einen Betreff angeben.");
    if (text.length < 10) throw new AppError("bad_request", "Bitte einen Inhalt schreiben.");

    const result = await sendCampaign(subject, text);
    return jsonOk(result);
  } catch (err) {
    return jsonError(err);
  }
}
