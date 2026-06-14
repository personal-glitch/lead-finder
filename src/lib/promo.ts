// Zentrale Konfiguration der Frühbucher-Aktion (für Homepage-Banner & Preise).
// Alles hier anpassbar: an/aus, Enddatum, Preis, Code, Plätze.
export const PROMO = {
  /** Aktion ein-/ausschalten (false = nichts wird angezeigt). */
  active: true,
  /** Countdown-Ziel (ISO mit Zeitzone). Nach Ablauf verschwindet die Aktion. */
  endsAt: "2026-06-30T23:59:59+02:00",
  /** Aktionspreis pro Monat. */
  price: "19 €",
  /** Regulärer Preis (durchgestrichen). */
  regular: "49 €",
  /** Rabattcode (im Stripe-Dashboard als Promotion Code anlegen). */
  code: "START19",
  /** Maximale Plätze (im Stripe-Promotion-Code als max. Einlösungen hinterlegen). */
  slots: 30,
} as const;

/** true, solange die Aktion aktiv und das Enddatum nicht überschritten ist. */
export function promoLive(now = Date.now()): boolean {
  return PROMO.active && now < new Date(PROMO.endsAt).getTime();
}
