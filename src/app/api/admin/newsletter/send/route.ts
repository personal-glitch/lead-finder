import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendCampaign, createScheduledCampaign } from "@/lib/newsletter";

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

    const p = (await req.json().catch(() => ({}))) as {
      subject?: string; template?: string; headline?: string; body?: string; ctaLabel?: string; ctaUrl?: string;
      imageUrl?: string; rawHtml?: boolean; scheduledFor?: string;
    };
    const subject = (p.subject ?? "").trim();
    const headline = (p.headline ?? "").trim();
    const text = (p.body ?? "").trim();
    const template = (["tipp", "angebot", "ankuendigung"].includes(p.template ?? "") ? p.template : "tipp") as
      "tipp" | "angebot" | "ankuendigung";
    if (subject.length < 3) throw new AppError("bad_request", "Bitte einen Betreff angeben.");
    if (headline.length < 3) throw new AppError("bad_request", "Bitte eine Überschrift angeben.");
    if (text.length < 10) throw new AppError("bad_request", "Bitte einen Inhalt schreiben.");

    const input = {
      subject,
      template,
      headline,
      body: text,
      ctaLabel: (p.ctaLabel ?? "").trim() || undefined,
      ctaUrl: (p.ctaUrl ?? "").trim() || undefined,
      imageUrl: (p.imageUrl ?? "").trim() || undefined,
      rawHtml: Boolean(p.rawHtml),
    };

    // Geplanter Versand?
    const scheduledRaw = (p.scheduledFor ?? "").trim();
    if (scheduledRaw) {
      const when = new Date(scheduledRaw);
      if (isNaN(when.getTime())) throw new AppError("bad_request", "Ungültiger Zeitpunkt.");
      if (when.getTime() < Date.now() - 60_000) throw new AppError("bad_request", "Der Zeitpunkt liegt in der Vergangenheit.");
      await createScheduledCampaign(input, when.toISOString());
      return jsonOk({ scheduled: true, scheduledFor: when.toISOString() });
    }

    const result = await sendCampaign(input);
    return jsonOk({ ...result, scheduled: false });
  } catch (err) {
    return jsonError(err);
  }
}
