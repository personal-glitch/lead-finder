import { z } from "zod";
import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";
import { subscribeNewsletter, isValidEmail } from "@/lib/newsletter";

const Body = z.object({
  email: z.string(),
  consent: z.boolean(),
  website: z.string().optional(), // Honeypot
  modus: z.string().optional(),
  headlineLabel: z.string().max(120).optional(),
  headlineValue: z.string().max(60).optional(),
  sub: z.string().max(200).optional(),
  breakdown: z.array(z.object({ label: z.string().max(120), value: z.string().max(60) })).max(20).optional(),
});

const IMPRESSUM = "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";

function resultEmail(b: z.infer<typeof Body>): { subject: string; html: string; text: string } {
  const rows = (b.breakdown ?? [])
    .map((x) => `<tr><td style="padding:6px 0;color:#5b6470">${x.label}</td><td style="padding:6px 0;text-align:right;font-weight:600">${x.value}</td></tr>`)
    .join("");
  const rowsText = (b.breakdown ?? []).map((x) => `- ${x.label}: ${x.value}`).join("\n");
  const head = `${b.headlineLabel ?? "Ergebnis"}: ${b.headlineValue ?? ""}`;
  const url = config.appUrl;
  const subject = "Dein Kalkulations-Ergebnis 📊 – KundenRadar";
  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#16181d;line-height:1.6;max-width:560px;margin:0 auto;padding:8px">
<p>Hallo,</p>
<p>danke fürs Kalkulieren! Hier ist dein Ergebnis aus dem KundenRadar-Rechner:</p>
<div style="background:#f4f6f8;border-radius:12px;padding:16px;margin:14px 0">
  <div style="font-size:12px;color:#5b6470">${b.headlineLabel ?? "Ergebnis"}</div>
  <div style="font-size:28px;font-weight:700;color:#16181d">${b.headlineValue ?? ""}</div>
  ${b.sub ? `<div style="font-size:13px;color:#5b6470;margin-top:2px">${b.sub}</div>` : ""}
  ${rows ? `<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:14px">${rows}</table>` : ""}
</div>
<p style="font-size:12px;color:#5b6470">Richtwerte (u. a. Tariflohn 2026, RAL-Flächenleistungen) – ersetzt keine individuelle Kalkulation, ohne Gewähr.</p>
<p><b>Jetzt den passenden Kunden dazu finden:</b> Mit KundenRadar bekommst du anrufbare Firmen mit Telefon &amp; Ansprechpartner – plus Pipeline, Anrufe &amp; E-Mail in einem Tool.</p>
<p style="margin:20px 0"><a href="${url}/registrieren" style="display:inline-block;background:#a8e83a;color:#16181d;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">KundenRadar 3 Tage gratis testen</a></p>
<p>Beste Grüße<br>Cihan · Seciora Solutions</p>
<hr style="border:none;border-top:1px solid #e3e7ec;margin:22px 0">
<p style="font-size:12px;color:#5b6470">${IMPRESSUM}</p>
</body></html>`;
  const text =
    `Hallo,\n\ndanke fürs Kalkulieren! Dein Ergebnis aus dem KundenRadar-Rechner:\n\n` +
    `${head}\n${b.sub ?? ""}\n${rowsText ? "\n" + rowsText + "\n" : ""}\n` +
    `Richtwerte – ersetzt keine individuelle Kalkulation, ohne Gewähr.\n\n` +
    `Jetzt den passenden Kunden dazu finden – KundenRadar 3 Tage gratis testen:\n${url}/registrieren\n\n` +
    `Beste Grüße\nCihan · Seciora Solutions\n\n—\n${IMPRESSUM}`;
  return { subject, html, text };
}

export async function POST(req: NextRequest) {
  try {
    const b = Body.parse(await req.json());
    if (b.website) return jsonOk({ ok: true }); // Bot
    if (!b.consent) throw new AppError("bad_request", "Bitte stimme der Verarbeitung zu.");
    if (!isValidEmail(b.email)) throw new AppError("bad_request", "Bitte gib eine gültige E-Mail-Adresse an.");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    // 1) Ergebnis sofort per Mail (transaktional – vom Nutzer angefordert).
    const { subject, html, text } = resultEmail(b);
    await sendSystemEmail({ to: b.email.trim(), subject, html, text });

    // 2) In den Newsletter-Verteiler (Double-Opt-In – Einwilligung per Checkbox).
    await subscribeNewsletter({ email: b.email, ip, source: `rechner-${b.modus ?? "ergebnis"}` }).catch(() => {});

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
