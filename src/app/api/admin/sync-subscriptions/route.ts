import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { getStripe, subPeriodEnd, subAmount } from "@/lib/billing/stripe";

// Holt für alle Kunden Status + Ablaufdatum frisch aus Stripe – NUR Superadmin.
export const maxDuration = 60;

export async function POST() {
  try {
    if (!config.supabase.enabled || !config.stripe.enabled) {
      throw new AppError("not_configured", "Stripe und Supabase werden benötigt.");
    }
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const stripe = getStripe();
    const store = getStore();

    // Stripe ist die sichere Quelle: ALLE Abos durchgehen und settings je
    // metadata.ownerId neu schreiben (legt fehlende Zeilen via Upsert an).
    let updated = 0;
    let startingAfter: string | undefined = undefined;
    for (let page = 0; page < 50; page++) {
      const list = await stripe.subscriptions.list({
        status: "all",
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const sub of list.data) {
        const ownerId = sub.metadata?.ownerId;
        if (!ownerId) continue;
        const cust = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        try {
          await store.updateSettings(ownerId, {
            subscriptionStatus: sub.status,
            subscriptionRenewsAt: subPeriodEnd(sub),
            cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
            stripeCustomerId: cust,
            subscriptionAmount: subAmount(sub),
          });
          updated++;
        } catch { /* einzelnes Abo überspringen */ }
      }
      if (!list.has_more || list.data.length === 0) break;
      startingAfter = list.data[list.data.length - 1].id;
    }
    return jsonOk({ updated });
  } catch (err) {
    return jsonError(err);
  }
}
