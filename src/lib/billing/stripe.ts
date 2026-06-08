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
