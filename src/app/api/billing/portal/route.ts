import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore, getOwnerId } from "@/lib/db";
import { getStripe } from "@/lib/billing/stripe";

// Öffnet das Stripe-Kundenportal: kündigen, Zahlungsmethode ändern, Rechnungen,
// nächste Fälligkeit – alles von Stripe gehostet & rechtssicher.
export async function POST() {
  try {
    if (!config.stripe.enabled) throw new AppError("not_configured", "Stripe ist nicht konfiguriert.");
    const ownerId = await getOwnerId();
    const s = await getStore().getSettings(ownerId);
    if (!s.stripeCustomerId) throw new AppError("bad_request", "Noch kein Abo/Kundenkonto vorhanden.");

    const portal = await getStripe().billingPortal.sessions.create({
      customer: s.stripeCustomerId,
      return_url: `${config.appUrl}/einstellungen`,
    });
    return jsonOk({ url: portal.url });
  } catch (err) {
    return jsonError(err);
  }
}
