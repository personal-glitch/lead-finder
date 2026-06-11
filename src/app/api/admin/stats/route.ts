import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

// Aggregierte Kennzahlen – NUR für die Superadmin-E-Mail (SUPER_ADMIN_EMAIL).
export async function GET() {
  try {
    if (!config.supabase.enabled) {
      throw new AppError("not_configured", "Die Übersicht ist nur mit Supabase verfügbar.");
    }
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const admin = createAdminClient();
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const users = list?.users ?? [];
    const registered = users.length;
    const confirmed = users.filter((u) => Boolean(u.email_confirmed_at)).length;

    const { data: settings } = await admin
      .from("settings")
      .select("owner_id, subscription_status, subscription_renews_at, cancel_at_period_end, admin_contacted_at");
    const rows = settings ?? [];
    const byOwner = new Map(rows.map((r) => [r.owner_id, r]));
    const trialing = rows.filter((r) => r.subscription_status === "trialing").length;
    const paying = rows.filter((r) => r.subscription_status === "active").length;

    const customers = users
      .map((u) => {
        const st = byOwner.get(u.id);
        const m = (u.user_metadata ?? {}) as Record<string, string>;
        return {
          id: u.id,
          email: u.email ?? "",
          name: [m.first_name, m.last_name].filter(Boolean).join(" ") || null,
          company: m.company ?? null,
          phone: m.phone ?? null,
          status: st?.subscription_status ?? null,
          renewsAt: st?.subscription_renews_at ?? null,
          cancelAtPeriodEnd: Boolean(st?.cancel_at_period_end),
          contactedAt: (st?.admin_contacted_at as string) ?? null,
          createdAt: u.created_at,
          confirmed: Boolean(u.email_confirmed_at),
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    // ── Nutzungs-Statistik (Suchen & aktive Nutzer) ──
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const since7 = new Date(Date.now() - 7 * 86_400_000).toISOString();
    let usage = { searchesToday: 0, searches7d: 0, activeToday: 0, active7d: 0 };
    try {
      const { data: ev } = await admin
        .from("usage_events")
        .select("owner_id, type, created_at")
        .gte("created_at", since7);
      const evs = ev ?? [];
      const todayEvs = evs.filter((e) => (e.created_at as string) >= startToday);
      usage = {
        searches7d: evs.filter((e) => e.type === "search").length,
        searchesToday: todayEvs.filter((e) => e.type === "search").length,
        activeToday: new Set(todayEvs.filter((e) => e.owner_id).map((e) => e.owner_id)).size,
        active7d: new Set(evs.filter((e) => e.owner_id).map((e) => e.owner_id)).size,
      };
    } catch {
      /* Tabelle evtl. noch nicht migriert – Statistik bleibt auf 0 */
    }

    return jsonOk({ registered, confirmed, trialing, paying, usage, customers });
  } catch (err) {
    return jsonError(err);
  }
}
