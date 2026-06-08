import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { config } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { rateLimitExceeded } from "@/lib/rate-limit";

const Body = z.object({
  name: z.string().min(1, "Name erforderlich.").max(200),
  email: z.email("Ungültige E-Mail-Adresse."),
  message: z.string().min(1, "Nachricht erforderlich.").max(5000),
});

export async function POST(req: Request) {
  try {
    // Spam-/Abuse-Schutz: max. 5 Anfragen pro IP / 10 Minuten.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimitExceeded(`contact:${ip}`, 5, 10 * 60 * 1000)) {
      throw new AppError("rate_limited", "Zu viele Anfragen. Bitte versuche es später erneut.");
    }

    const { name, email, message } = Body.parse(await req.json());

    // Wenn Resend konfiguriert ist: Anfrage an die eigene Absenderadresse schicken.
    if (config.resend.enabled) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(config.resend.apiKey!);
        await resend.emails.send({
          from: config.resend.from!,
          to: config.resend.from!,
          replyTo: email,
          subject: `Kontaktanfrage von ${name}`,
          text: `Von: ${name} <${email}>\n\n${message}`,
        });
      } catch (e) {
        console.error("[contact] send failed:", e);
      }
    } else {
      console.log(`[contact] ${name} <${email}>: ${message}`);
    }

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
