import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { getStripe, subPeriodEnd } from "@/lib/billing/stripe";

// Holt für alle Kunden Status + Ablaufdatum frisch aus Stripe – NUR Superadmin.
export const maxDuration = 60;

export async function POST() {
  try {
    if (!config.supabase.enabled || !config.stripe.enabled) {
      throw new AppError("not_configured", "Stripe und Supabase werden benötigt.");
    }
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const admin = createAdminClient();
    const { data: rows } = await admin.from("settings").select("owner_id, stripe_customer_id");
    const stripe = getStripe();
    const store = getStore();
    let updated = 0;
    for (const r of rows ?? []) {
      const cust = r.stripe_customer_id as string | null;
      if (!cust) continue;
      try {
        const subs = await stripe.subscriptions.list({ customer: cust, status: "all", limit: 1 });
        const sub = subs.data[0];
        if (!sub) continue;
        await store.updateSettings(r.owner_id as string, {
          subscriptionStatus: sub.status,
          subscriptionRenewsAt: subPeriodEnd(sub),
          cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        });
        updated++;
      } catch { /* einzelne Kunden überspringen */ }
    }
    return jsonOk({ updated });
  } catch (err) {
    return jsonError(err);
  }
}
