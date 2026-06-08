import { redirect } from "next/navigation";
import { config, featureFlags } from "@/lib/config";
import { AppShell } from "@/components/shell/AppShell";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  // Zweite Verteidigungslinie zusätzlich zur Middleware: ohne Session kein Tool.
  if (config.supabase.enabled) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Abo-Gate (nur wenn Stripe aktiv): ohne Trial/aktives Abo → /abo.
    // So kommt niemand ohne hinterlegte Zahlungsmethode ins Tool (Anti-Missbrauch).
    // Der Superadmin ist ausgenommen.
    const isAdmin = config.admin.email && user.email?.toLowerCase() === config.admin.email;
    if (config.stripe.enabled && !isAdmin) {
      const { getStore } = await import("@/lib/db");
      const s = await getStore().getSettings(user.id);
      let ok = ["active", "trialing"].includes(s.subscriptionStatus ?? "");
      // Fällt Supabase (noch) negativ aus, direkt beim Zahlungsdienstleister prüfen –
      // so sperrt ein verzögerter/fehlerhafter Webhook keinen echten Abonnenten aus.
      if (!ok) {
        const { verifyAndSyncSubscription } = await import("@/lib/billing/access");
        const status = await verifyAndSyncSubscription(user.id, user.email ?? undefined, s.stripeCustomerId ?? null);
        ok = ["active", "trialing"].includes(status ?? "");
      }
      if (!ok) redirect("/abo");
    }
  }
  return <AppShell flags={featureFlags()}>{children}</AppShell>;
}
