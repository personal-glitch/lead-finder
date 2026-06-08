// Just-in-time-Abo-Prüfung: Verlässt sich NICHT allein auf den Webhook. Wenn
// Supabase einen Nutzer (noch) nicht als Abonnent führt, fragen wir direkt beim
// Zahlungsdienstleister nach. Findet sich ein aktives/Trial-Abo, wird der Zugang
// gewährt und Supabase nachgezogen. So sperrt ein verzögerter/fehlerhafter
// Webhook niemanden aus, der tatsächlich bezahlt/getestet hat.
import { config } from "@/lib/config";
import { getStripe } from "./stripe";

const ACCESS_STATES = ["active", "trialing"];

/**
 * Prüft beim Zahlungsdienstleister, ob der Nutzer ein zugriffsberechtigtes Abo
 * hat, und synchronisiert das Ergebnis nach Supabase. Gibt den Abo-Status zurück
 * (z. B. "trialing"/"active") oder null, wenn kein passendes Abo existiert.
 */
export async function verifyAndSyncSubscription(
  ownerId: string,
  email: string | undefined,
  customerId: string | null,
): Promise<string | null> {
  if (!config.stripe.enabled) return null;
  try {
    const stripe = getStripe();

    // Mögliche Kunden-IDs sammeln: gespeicherte zuerst, sonst per E-Mail suchen.
    const customerIds: string[] = [];
    if (customerId) {
      try {
        const c = await stripe.customers.retrieve(customerId);
        if (c && !("deleted" in c && c.deleted)) customerIds.push(c.id);
      } catch { /* gespeicherte ID existiert evtl. nicht (Test↔Live) – ignorieren */ }
    }
    if (email) {
      try {
        const list = await stripe.customers.list({ email, limit: 10 });
        for (const c of list.data) if (!customerIds.includes(c.id)) customerIds.push(c.id);
      } catch { /* ignorieren */ }
    }

    for (const cid of customerIds) {
      const subs = await stripe.subscriptions.list({ customer: cid, status: "all", limit: 10 });
      const sub = subs.data.find((su) => ACCESS_STATES.includes(su.status));
      if (sub) {
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        try {
          const { getStore } = await import("@/lib/db");
          await getStore().updateSettings(ownerId, {
            subscriptionStatus: sub.status,
            stripeCustomerId: cid,
            subscriptionRenewsAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
          });
        } catch { /* Sync-Fehler nicht blockieren – Zugang trotzdem gewähren */ }
        return sub.status;
      }
    }
    return null;
  } catch {
    return null;
  }
}
