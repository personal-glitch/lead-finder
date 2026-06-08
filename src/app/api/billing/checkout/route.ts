import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore, getOwnerId } from "@/lib/db";
import { getStripe } from "@/lib/billing/stripe";
import { TRIAL_DAYS } from "@/lib/plans";

// Startet eine Stripe-Checkout-Session (Abo 49 €) und liefert die Weiterleitungs-URL.
export async function POST() {
  try {
    if (!config.stripe.enabled) throw new AppError("not_configured", "Stripe ist nicht konfiguriert.");
    const ownerId = await getOwnerId();
    const store = getStore();
    const stripe = getStripe();
    const settings = await store.getSettings(ownerId);

    // E-Mail für die Kundenzuordnung (aus Auth, sonst Absenderadresse).
    let email = settings.senderEmail ?? undefined;
    if (config.supabase.enabled) {
      const { createClient } = await import("@/lib/supabase/server");
      const { data } = await (await createClient()).auth.getUser();
      email = data.user?.email ?? email;
    }

    // Bestehenden Kunden wiederverwenden oder neu anlegen.
    let customerId = settings.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { ownerId } });
      customerId = customer.id;
      await store.updateSettings(ownerId, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: config.stripe.priceId!, quantity: 1 }],
      success_url: `${config.appUrl}/dashboard?abo=ok`,
      cancel_url: `${config.appUrl}/abo?abo=abbruch`,
      // Gratis-Testphase; Zahlungsmethode wird trotzdem hinterlegt (= Anti-Missbrauch).
      // Zahlarten (Karte, PayPal, …) steuerst du im Stripe-Dashboard – Checkout zeigt sie automatisch.
      subscription_data: { metadata: { ownerId }, trial_period_days: TRIAL_DAYS },
      payment_method_collection: "always",
      allow_promotion_codes: true,
    });

    return jsonOk({ url: session.url });
  } catch (err) {
    return jsonError(err);
  }
}
