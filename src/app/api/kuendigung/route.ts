import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";

const IMPRESSUM = "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln · kontakt@seciora-solutions.de";
const fmtDE = (iso: string) => new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** § 312k BGB: Kündigungsbestätigung in Textform an den Kunden + Info an den Betreiber. */
async function sendCancellationConfirmation(o: {
  to: string; name: string | null; kind: "ordentlich" | "ausserordentlich";
  receivedAt: string; endsAtIso: string | null; desiredDate: string | null; contractRef: string | null;
}): Promise<void> {
  const hi = o.name ? `Hallo ${o.name},` : "Hallo,";
  const art = o.kind === "ausserordentlich"
    ? "außerordentliche Kündigung (sofortige Beendigung)"
    : "ordentliche Kündigung zum Ende des laufenden Abrechnungszeitraums";
  const endTxt = o.endsAtIso ? fmtDE(o.endsAtIso) : "zum Ende des laufenden Abrechnungszeitraums – keine weitere Abbuchung";
  const refLine = o.contractRef ? `\nReferenz: ${o.contractRef}` : "";

  const text =
    `${hi}\n\nhiermit bestätigen wir den Eingang deiner Kündigung für KundenRadar.\n\n` +
    `Eingegangen am: ${fmtDE(o.receivedAt)}\nArt der Kündigung: ${art}\nBeendigung: ${endTxt}${refLine}\n\n` +
    `Es erfolgt keine weitere Abbuchung. Bei Fragen antworte einfach auf diese E-Mail.\n\nViele Grüße\n${IMPRESSUM}`;
  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#0f172a;line-height:1.6">
<p>${esc(hi)}</p>
<p>hiermit bestätigen wir den <strong>Eingang deiner Kündigung</strong> für KundenRadar.</p>
<ul>
<li><strong>Eingegangen am:</strong> ${esc(fmtDE(o.receivedAt))}</li>
<li><strong>Art der Kündigung:</strong> ${esc(art)}</li>
<li><strong>Beendigung:</strong> ${esc(endTxt)}</li>
${o.contractRef ? `<li><strong>Referenz:</strong> ${esc(o.contractRef)}</li>` : ""}
</ul>
<p>Es erfolgt keine weitere Abbuchung. Bei Fragen antworte einfach auf diese E-Mail.</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
<p style="font-size:12px;color:#64748b">${esc(IMPRESSUM)}</p>
</body></html>`;

  await sendSystemEmail({ to: o.to, subject: "Bestätigung deiner Kündigung – KundenRadar", html, text });
  // Info-Kopie an den Betreiber (best effort).
  try {
    await sendSystemEmail({
      to: "kontakt@seciora-solutions.de",
      subject: `Kündigung eingegangen: ${o.to}`,
      html: `<p>Kündigung über den Kündigungsbutton.</p><p>E-Mail: ${esc(o.to)}<br>Art: ${esc(art)}<br>Eingang: ${esc(fmtDE(o.receivedAt))}<br>Beendigung: ${esc(endTxt)}</p>`,
      text: `Kündigung über den Kündigungsbutton.\nE-Mail: ${o.to}\nArt: ${art}\nEingang: ${fmtDE(o.receivedAt)}\nBeendigung: ${endTxt}`,
    });
  } catch { /* Info-Kopie ist optional */ }
}

// Öffentliche Kündigung gemäß § 312k BGB (Kündigungsbutton). Nimmt die
// Kündigungserklärung entgegen, speichert sie und bestätigt den Eingang.
const Body = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse angeben."),
  contractRef: z.string().max(200).optional(),
  kind: z.enum(["ordentlich", "ausserordentlich"]).default("ordentlich"),
  desiredDate: z.string().max(60).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    if (!config.supabase.enabled) {
      throw new AppError(
        "not_configured",
        "Die Online-Kündigung ist derzeit nicht verfügbar. Bitte kündige per E-Mail an kontakt@seciora-solutions.de.",
      );
    }
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = createAdminClient();
    const receivedAt = new Date().toISOString();
    const { error } = await admin.from("cancellation_requests").insert({
      name: b.name ?? null,
      email: b.email,
      contract_ref: b.contractRef ?? null,
      kind: b.kind,
      desired_date: b.desiredDate ?? null,
      message: b.message ?? null,
    });
    if (error) throw new AppError("upstream", `Kündigung konnte nicht gespeichert werden: ${error.message}`);

    // Abo tatsächlich bei Stripe beenden, damit nichts (mehr) abgebucht wird.
    // Zuordnung über die angegebene Konto-E-Mail. Der Stripe-Webhook hält danach
    // den Status in Supabase automatisch aktuell.
    let subscriptionsCancelled = 0;
    let endsAtIso: string | null = null;
    if (config.stripe.enabled) {
      try {
        const { getStripe, subPeriodEnd } = await import("@/lib/billing/stripe");
        const stripe = getStripe();
        const customers = await stripe.customers.list({ email: b.email, limit: 20 });
        for (const customer of customers.data) {
          const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 20 });
          for (const sub of subs.data) {
            if (["active", "trialing", "past_due", "unpaid"].includes(sub.status)) {
              if (b.kind === "ausserordentlich") {
                // Sofortige Beendigung (außerordentliche Kündigung).
                await stripe.subscriptions.cancel(sub.id);
                endsAtIso = receivedAt;
              } else {
                // Ordentliche Kündigung zum Ende des Abrechnungszeitraums – während der
                // Testphase bedeutet das: keine Umwandlung in ein kostenpflichtiges Abo,
                // also keine Abbuchung.
                await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
                endsAtIso = endsAtIso ?? subPeriodEnd(sub);
              }
              subscriptionsCancelled++;
            }
          }
        }
      } catch (e) {
        // Nicht blockieren – die Kündigung ist gespeichert und wird ansonsten manuell verarbeitet.
        console.error("[kuendigung] Stripe-Kündigung fehlgeschlagen:", e);
      }
    }

    // § 312k BGB: Kündigungsbestätigung unverzüglich in Textform (E-Mail) an den Kunden,
    // mit Inhalt, Datum/Uhrzeit des Eingangs und Beendigungszeitpunkt. Best-effort.
    try {
      await sendCancellationConfirmation({
        to: b.email,
        name: b.name ?? null,
        kind: b.kind,
        receivedAt,
        endsAtIso,
        desiredDate: b.desiredDate ?? null,
        contractRef: b.contractRef ?? null,
      });
    } catch (e) {
      console.error("[kuendigung] Bestätigungsmail fehlgeschlagen:", e);
    }

    return jsonOk({ ok: true, receivedAt, subscriptionsCancelled });
  } catch (err) {
    return jsonError(err);
  }
}
