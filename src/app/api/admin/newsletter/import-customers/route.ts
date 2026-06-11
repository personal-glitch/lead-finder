import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { subscribeConfirmed } from "@/lib/newsletter";

// Übernimmt registrierte Kunden in den Newsletter-Verteiler.
// Rechtsgrundlage: § 7 Abs. 3 UWG (eigene Bestandskunden, ähnliche eigene Leistung,
// Abmeldung in jeder Mail). Abgemeldete werden NICHT reaktiviert. NUR Superadmin.
export const maxDuration = 60;

export async function POST() {
  try {
    if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }

    const admin = createAdminClient();
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const users = list?.users ?? [];

    let added = 0, skipped = 0;
    for (const u of users) {
      if (!u.email) continue;
      const name = (u.user_metadata?.first_name as string) ?? null;
      const r = await subscribeConfirmed(
        { email: u.email, name, source: "kunde" },
        { sendWelcome: false, skipUnsubscribed: true },
      );
      if (r.ok && r.state === "pending") added++;
      else skipped++;
    }
    return jsonOk({ added, skipped, total: users.length });
  } catch (err) {
    return jsonError(err);
  }
}
