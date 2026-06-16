// Kleiner Helfer, um GA4-Events (Conversions) zu feuern – nur wenn gtag geladen
// und der Nutzer eingewilligt hat (Consent-Mode steuert die tatsächliche Erfassung).
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  try {
    w.gtag?.("event", name, params ?? {});
  } catch {
    /* Tracking darf nie etwas blockieren */
  }
}
