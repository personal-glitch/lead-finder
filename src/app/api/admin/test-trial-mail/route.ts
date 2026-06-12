import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendTrialEndingEmail } from "@/lib/billing/trial-reminders";

// Schickt eine Beispiel-„Testphase endet bald"-Mail an die Superadmin-Adresse,
// damit der Betreiber sieht, wie die Erinnerung aussieht. NUR Superadmin.
export async function GET() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }
    // Beispiel-Testende: in 2 Tagen. Test-Mail geht fest an das Betreiber-Postfach.
    const sampleEnd = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
    const target = "kontakt@seciora-solutions.de";
    await sendTrialEndingEmail(target, "Max", sampleEnd);
    return jsonOk({ ok: true, sentTo: target });
  } catch (err) {
    return jsonError(err);
  }
}
