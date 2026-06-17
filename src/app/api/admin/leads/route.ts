import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { listLeadsAdmin, setLeadStatus, forwardLead, type LeadStatus } from "@/lib/catalog";

async function requireAdmin() {
  if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
  const { createClient } = await import("@/lib/supabase/server");
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");
}

// Liste der Leads (optional nach Status) – nur Superadmin.
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status") as LeadStatus | null;
    const leads = await listLeadsAdmin(status ?? undefined);
    return jsonOk({ leads });
  } catch (err) {
    return jsonError(err);
  }
}

// Aktion: Status setzen oder an die Firma weiterleiten – nur Superadmin.
const Body = z.object({
  id: z.string().min(1),
  action: z.enum(["forward", "status"]),
  status: z.enum(["neu", "weitergeleitet", "geschlossen"]).optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = Body.parse(await req.json());
    const res = b.action === "forward"
      ? await forwardLead(b.id)
      : await setLeadStatus(b.id, (b.status ?? "geschlossen"));
    if (!res.ok) throw new AppError("bad_request", res.error);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
