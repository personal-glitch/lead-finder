import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

export const AVV_VERSION = "1.0";

async function owner() {
  if (!config.supabase.enabled) throw new AppError("not_configured", "Nicht verfügbar.");
  const { createClient } = await import("@/lib/supabase/server");
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) throw new AppError("auth", "Bitte anmelden.");
  return user;
}

// Status: Hat der Nutzer den AVV akzeptiert?
export async function GET() {
  try {
    const user = await owner();
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = createAdminClient();
    const { data } = await admin.from("avv_acceptances").select("accepted_at, version").eq("owner_id", user.id).maybeSingle();
    return jsonOk({ accepted: Boolean(data), acceptedAt: data?.accepted_at ?? null, version: data?.version ?? null, currentVersion: AVV_VERSION });
  } catch (err) {
    return jsonError(err);
  }
}

// AVV akzeptieren (mit Datum speichern).
export async function POST() {
  try {
    const user = await owner();
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = createAdminClient();
    const meta = (user.user_metadata ?? {}) as { first_name?: string; last_name?: string; company?: string };
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || null;
    const { error } = await admin.from("avv_acceptances").upsert(
      { owner_id: user.id, accepted_at: new Date().toISOString(), version: AVV_VERSION, name, company: meta.company ?? null },
      { onConflict: "owner_id" },
    );
    if (error) throw new AppError("upstream", error.message);
    return jsonOk({ ok: true, acceptedAt: new Date().toISOString(), version: AVV_VERSION });
  } catch (err) {
    return jsonError(err);
  }
}
