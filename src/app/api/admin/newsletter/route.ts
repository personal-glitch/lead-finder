import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { listSubscribers, listCampaigns } from "@/lib/newsletter";

// Newsletter-Abonnenten – NUR für die Superadmin-E-Mail.
export async function GET() {
  try {
    if (!config.supabase.enabled) {
      throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    }
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email || !config.admin.email || email !== config.admin.email) {
      throw new AppError("auth", "Kein Zugriff.");
    }
    const subscribers = await listSubscribers();
    const campaigns = await listCampaigns();
    return jsonOk({
      total: subscribers.length,
      confirmed: subscribers.filter((s) => s.status === "confirmed").length,
      pending: subscribers.filter((s) => s.status === "pending").length,
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
      subscribers,
      campaigns,
    });
  } catch (err) {
    return jsonError(err);
  }
}
