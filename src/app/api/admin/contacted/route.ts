import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

// Superadmin: Kunde als „kontaktiert" markieren / Markierung entfernen.
const Body = z.object({ ownerId: z.string().min(1), contacted: z.boolean() });

export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled) {
      throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    }
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const { ownerId, contacted } = Body.parse(await req.json());
    const admin = createAdminClient();
    const { error } = await admin.from("settings").upsert(
      { owner_id: ownerId, admin_contacted_at: contacted ? new Date().toISOString() : null },
      { onConflict: "owner_id" },
    );
    if (error) throw new AppError("upstream", `Speichern fehlgeschlagen: ${error.message}`);
    return jsonOk({ ok: true, contacted });
  } catch (err) {
    return jsonError(err);
  }
}
