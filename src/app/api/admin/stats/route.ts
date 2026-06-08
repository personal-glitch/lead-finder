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
      .select("owner_id, subscription_status, subscription_renews_at");
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
          createdAt: u.created_at,
          confirmed: Boolean(u.email_confirmed_at),
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    return jsonOk({ registered, confirmed, trialing, paying, customers });
  } catch (err) {
    return jsonError(err);
  }
}
