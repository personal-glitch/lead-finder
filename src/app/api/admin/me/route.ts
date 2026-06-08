import { jsonOk } from "@/lib/api";
import { config } from "@/lib/config";

// Schlanker Check, ob der eingeloggte Nutzer der Superadmin ist (für den Sidebar-Link).
export async function GET() {
  try {
    let isAdmin = false;
    if (config.supabase.enabled && config.admin.email) {
      const { createClient } = await import("@/lib/supabase/server");
      const {
        data: { user },
      } = await (await createClient()).auth.getUser();
      isAdmin = user?.email?.toLowerCase() === config.admin.email;
    }
    return jsonOk({ isAdmin });
  } catch {
    return jsonOk({ isAdmin: false });
  }
}
