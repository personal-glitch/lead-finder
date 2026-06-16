import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";

const Body = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(8000),
  firstName: z.string().optional(),
});

const IMPRESSUM = config.resend.impressum ?? "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Superadmin: persönliche E-Mail an einen einzelnen Kunden – über den System-Mailer.
export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");

    const b = Body.parse(await req.json());
    const hi = b.firstName?.trim() || "zusammen";
    const subject = b.subject.replace(/\{\{\s*vorname\s*\}\}/gi, hi);
    const bodyText = b.body.replace(/\{\{\s*vorname\s*\}\}/gi, hi);
    const htmlBody = esc(bodyText).replace(/\n/g, "<br>");

    const html = `<!doctype html><html lang="de"><body style="margin:0;background:#f4f6f8;padding:16px">
<div style="font-family:system-ui,Arial,sans-serif;color:#16181d;line-height:1.6;max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e3e7ec">
  <div style="background:#16181d;padding:16px 22px"><span style="font-size:18px;font-weight:700;color:#ffffff">Kunden<span style="color:#a8e83a">Radar</span></span></div>
  <div style="padding:24px 22px;font-size:15px">${htmlBody}
    <hr style="border:none;border-top:1px solid #e3e7ec;margin:22px 0">
    <p style="margin:0;font-size:12px;color:#5b6470">${IMPRESSUM}</p>
  </div>
</div></body></html>`;
    const text = `${bodyText}\n\n—\n${IMPRESSUM}`;

    await sendSystemEmail({
      to: b.to.trim(),
      subject,
      html,
      text,
      fromName: "Cihan · Seciora Solutions",
      headers: config.admin.email ? { "Reply-To": config.admin.email } : undefined,
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
