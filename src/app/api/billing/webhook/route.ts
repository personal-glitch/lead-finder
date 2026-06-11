import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { getStripe, subPeriodEnd } from "@/lib/billing/stripe";

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
        const customerId = typeof s.customer === "string" ? s.customer : null;
        // Abo direkt abrufen, damit Ablaufdatum/Status sofort vorhanden sind
        // (unabhängig davon, welche subscription.*-Events aktiviert sind).
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
        let synced = false;
        if (subId) {
          try {
            const sub = await getStripe().subscriptions.retrieve(subId);
            await store.updateSettings(ownerId, {
              subscriptionStatus: sub.status,
              subscriptionRenewsAt: subPeriodEnd(sub),
              cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
              stripeCustomerId: customerId,
            });
            synced = true;
          } catch { /* Fallback unten */ }
        }
        if (!synced) {
          await store.updateSettings(ownerId, {
            subscriptionStatus: "trialing",
            stripeCustomerId: customerId,
          });
        }
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const ownerId = sub.metadata?.ownerId;
      if (ownerId) {
        await store.updateSettings(ownerId, {
          subscriptionStatus: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
          subscriptionRenewsAt: subPeriodEnd(sub),
          cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        });
      }
    }
  } catch (e) {
    console.error("[stripe webhook] handler error:", e);
  }

  return NextResponse.json({ received: true });
}
