import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { resendPendingConfirmations } from "@/lib/newsletter";

// Mehr Zeit fürs sequentielle Senden (Throttling).
export const maxDuration = 60;

// Erinnerung: Bestätigungs-Mail an alle Pending erneut senden – NUR Superadmin.
export async function POST() {
  try {
    if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");

    const result = await resendPendingConfirmations();
    return jsonOk(result);
  } catch (err) {
    return jsonError(err);
  }
}
