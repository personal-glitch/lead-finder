// Leichtgewichtiges Nutzungs-Logging für die Superadmin-Statistik.
// Schreibt ausschließlich über die Service-Role; Fehler werden verschluckt,
// damit das Logging niemals einen echten Request blockiert.
import { config } from "@/lib/config";

export type UsageType = "search" | "visit";

// Pro Server-Instanz höchstens 1 "visit" je Nutzer / 10 Min (gegen Heartbeat-Flut).
const lastVisit = new Map<string, number>();

export async function logUsage(type: UsageType, ownerId: string | null): Promise<void> {
  try {
    if (!config.supabase.enabled || !config.supabase.serviceRoleKey) return;
    if (type === "visit") {
      if (!ownerId) return;
      const now = Date.now();
      if (now - (lastVisit.get(ownerId) ?? 0) < 10 * 60_000) return;
      lastVisit.set(ownerId, now);
    }
    const { createAdminClient } = await import("@/lib/supabase/server");
    await createAdminClient().from("usage_events").insert({ owner_id: ownerId, type });
  } catch {
    /* bewusst ignorieren */
  }
}
