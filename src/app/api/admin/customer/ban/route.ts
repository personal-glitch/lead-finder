import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

const Body = z.object({ ownerId: z.string().min(1), ban: z.boolean() });

// Nutzer sperren/entsperren – NUR für den Superadmin. Gesperrte können sich nicht anmelden.
export async function POST(req: Request) {
  try {
    if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");

    const { ownerId, ban } = Body.parse(await req.json());
    if (ownerId === user.id) throw new AppError("bad_request", "Du kannst dich nicht selbst sperren.");

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(ownerId, {
      ban_duration: ban ? "876000h" : "none", // ~100 Jahre = gesperrt; none = entsperrt
    });
    if (error) throw new AppError("bad_request", error.message);
    return jsonOk({ ok: true, banned: ban });
  } catch (err) {
    return jsonError(err);
  }
}
