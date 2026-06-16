import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { getStripe } from "@/lib/billing/stripe";

const Body = z.object({ ownerId: z.string().min(1), action: z.enum(["cancel", "reactivate"]) });

// Superadmin: Abo eines Kunden zum Periodenende kündigen bzw. Kündigung zurücknehmen.
export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled || !config.stripe.enabled) {
      throw new AppError("not_configured", "Stripe und Supabase werden benötigt.");
    }
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");

    const { ownerId, action } = Body.parse(await req.json());
    const store = getStore();
    const settings = await store.getSettings(ownerId);
    const customerId = settings.stripeCustomerId;
    if (!customerId) throw new AppError("bad_request", "Für diesen Kunden ist kein Stripe-Kunde hinterlegt.");

    const stripe = getStripe();
    const list = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
    const sub = list.data.find((s) => ["active", "trialing", "past_due"].includes(s.status));
    if (!sub) throw new AppError("bad_request", "Kein aktives Abo gefunden.");

    const cancel = action === "cancel";
    const updated = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: cancel });
    await store.updateSettings(ownerId, { cancelAtPeriodEnd: cancel, subscriptionStatus: updated.status });
    return jsonOk({ ok: true, cancelAtPeriodEnd: cancel });
  } catch (err) {
    return jsonError(err);
  }
}
