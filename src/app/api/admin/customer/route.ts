import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

// Superadmin-Aktion: Testphase eines Kunden verlängern (manuell).
// Setzt subscription_status = "trialing" und schiebt das Ablaufdatum um N Tage
// nach hinten (ab dem späteren von heute / bisherigem Ablauf). Nur SUPER_ADMIN_EMAIL.
const Body = z.object({
  ownerId: z.string().min(1),
  days: z.number().int().positive().max(365),
});

export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled) {
      throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    }
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const { ownerId, days } = Body.parse(await req.json());
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("settings")
      .select("subscription_renews_at")
      .eq("owner_id", ownerId)
      .maybeSingle();

    const now = Date.now();
    const current = existing?.subscription_renews_at
      ? new Date(existing.subscription_renews_at).getTime()
      : 0;
    const base = Math.max(now, Number.isFinite(current) ? current : 0);
    const renewsAt = new Date(base + days * 86_400_000).toISOString();

    const { error } = await admin
      .from("settings")
      .upsert(
        { owner_id: ownerId, subscription_status: "trialing", subscription_renews_at: renewsAt },
        { onConflict: "owner_id" },
      );
    if (error) throw new AppError("upstream", `Speichern fehlgeschlagen: ${error.message}`);

    return jsonOk({ ok: true, subscriptionStatus: "trialing", subscriptionRenewsAt: renewsAt });
  } catch (err) {
    return jsonError(err);
  }
}
