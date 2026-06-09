import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

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
        "Die Online-Kündigung ist derzeit nicht verfügbar. Bitte kündige per E-Mail an kontakt@seciora.de.",
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
    if (config.stripe.enabled) {
      try {
        const { getStripe } = await import("@/lib/billing/stripe");
        const stripe = getStripe();
        const customers = await stripe.customers.list({ email: b.email, limit: 20 });
        for (const customer of customers.data) {
          const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 20 });
          for (const sub of subs.data) {
            if (["active", "trialing", "past_due", "unpaid"].includes(sub.status)) {
              if (b.kind === "ausserordentlich") {
                // Sofortige Beendigung (außerordentliche Kündigung).
                await stripe.subscriptions.cancel(sub.id);
              } else {
                // Ordentliche Kündigung zum Ende des Abrechnungszeitraums – während der
                // Testphase bedeutet das: keine Umwandlung in ein kostenpflichtiges Abo,
                // also keine Abbuchung.
                await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
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

    return jsonOk({ ok: true, receivedAt, subscriptionsCancelled });
  } catch (err) {
    return jsonError(err);
  }
}
