import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { getStripe } from "@/lib/billing/stripe";

// Stripe-Webhook: aktualisiert den Abo-Status pro Nutzer. Signatur wird geprüft.
export async function POST(req: Request) {
  if (!config.stripe.enabled || !config.stripe.webhookSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }
  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text(); // Rohtext für die Signaturprüfung

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, config.stripe.webhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const store = getStore();
  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const ownerId = s.metadata?.ownerId;
      if (ownerId) {
        await store.updateSettings(ownerId, {
          subscriptionStatus: "trialing", // Testphase startet; subscription.updated hält es danach aktuell
          stripeCustomerId: typeof s.customer === "string" ? s.customer : null,
        });
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const ownerId = sub.metadata?.ownerId;
      if (ownerId) {
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        await store.updateSettings(ownerId, {
          subscriptionStatus: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
          subscriptionRenewsAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        });
      }
    }
  } catch (e) {
    console.error("[stripe webhook] handler error:", e);
  }

  return NextResponse.json({ received: true });
}
