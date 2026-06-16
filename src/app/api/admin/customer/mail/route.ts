import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";
import { renderNewsletterHtml, renderNewsletterText } from "@/lib/email/newsletter-template";

const Body = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(8000),
  template: z.enum(["tipp", "angebot", "ankuendigung"]).default("tipp"),
  headline: z.string().max(200).optional(),
  ctaLabel: z.string().max(80).optional(),
  ctaUrl: z.string().max(500).optional(),
  imageUrl: z.string().max(500).optional(),
  firstName: z.string().optional(),
});

const IMPRESSUM = config.resend.impressum ?? "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";
const personalize = (s: string, name: string) => s.replace(/\{\{\s*vorname\s*\}\}/gi, name);

// Superadmin: persönliche, gestaltete E-Mail an einen einzelnen Kunden – über den System-Mailer.
export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");

    const b = Body.parse(await req.json());
    const hi = b.firstName?.trim() || "zusammen";
    const opts = {
      template: b.template,
      headline: personalize(b.headline || b.subject, hi),
      body: personalize(b.body, hi),
      ctaLabel: b.ctaLabel || undefined,
      ctaUrl: b.ctaUrl || undefined,
      imageUrl: b.imageUrl || undefined,
      unsubscribeUrl: config.appUrl,
      impressum: IMPRESSUM,
    };

    await sendSystemEmail({
      to: b.to.trim(),
      subject: personalize(b.subject, hi),
      html: renderNewsletterHtml(opts),
      text: renderNewsletterText(opts),
      fromName: "Cihan · Seciora Solutions",
      headers: config.admin.email ? { "Reply-To": config.admin.email } : undefined,
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
