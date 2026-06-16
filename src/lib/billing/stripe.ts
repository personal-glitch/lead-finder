import "server-only";
import Stripe from "stripe";
import { config } from "@/lib/config";
import { AppError } from "@/lib/errors";

let client: Stripe | null = null;

/** Stripe-Client (Singleton). Wirft, wenn nicht konfiguriert. */
export function getStripe(): Stripe {
  const key = config.stripe.secretKey;
  if (!key) {
    throw new AppError("not_configured", "Stripe ist nicht konfiguriert.");
  }
  if (!client) client = new Stripe(key);
  return client;
}

/** Abo gilt als aktiv bei diesen Stripe-Status-Werten. */
export function isActiveSubscription(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Liefert das Ende der aktuellen Periode (= „Test endet" bzw. „nächste Zahlung")
 * als ISO-String. Robust über Stripe-API-Versionen: Top-Level current_period_end,
 * sonst auf Item-Ebene, sonst trial_end.
 */
export function subPeriodEnd(sub: Stripe.Subscription): string | null {
  const anySub = sub as unknown as {
    current_period_end?: number;
    trial_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const ts =
    anySub.current_period_end ??
    anySub.items?.data?.[0]?.current_period_end ??
    anySub.trial_end ??
    null;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

/** Effektiver monatlicher Betrag in Cent (Listenpreis minus aktiver Rabatt/Promo). */
export function subAmount(sub: Stripe.Subscription): number | null {
  const item = sub.items?.data?.[0];
  let amt = item?.price?.unit_amount ?? null;
  if (amt == null) return null;
  const disc = (sub as unknown as { discount?: { coupon?: { amount_off?: number | null; percent_off?: number | null } } }).discount;
  const coupon = disc?.coupon;
  if (coupon) {
    if (coupon.amount_off) amt = Math.max(0, amt - coupon.amount_off);
    else if (coupon.percent_off) amt = Math.round(amt * (1 - coupon.percent_off / 100));
  }
  return amt;
}
