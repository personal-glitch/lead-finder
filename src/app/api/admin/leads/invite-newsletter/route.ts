import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore, getOwnerId } from "@/lib/db";
import { inviteNewsletter, isValidEmail } from "@/lib/newsletter";

const Body = z.object({ leadId: z.string().min(1) });

// Nur der Superadmin darf Leads zur Mailliste einladen.
async function requireAdmin(): Promise<void> {
  if (!config.supabase.enabled || !config.admin.email) throw new AppError("auth", "Kein Zugriff.");
  const { createClient } = await import("@/lib/supabase/server");
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (user?.email?.toLowerCase() !== config.admin.email) throw new AppError("auth", "Kein Zugriff.");
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const ownerId = await getOwnerId();
    const { leadId } = Body.parse(await req.json());

    const store = getStore();
    const lead = await store.getLead(ownerId, leadId);
    if (!lead) throw new AppError("not_found", "Lead nicht gefunden.");
    if (!lead.email || !isValidEmail(lead.email)) {
      throw new AppError("bad_request", "Dieser Lead hat keine gültige E-Mail-Adresse.");
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const res = await inviteNewsletter({
      email: lead.email,
      name: lead.ansprechpartner ?? lead.name ?? null,
      ip,
      source: "pipeline-invite",
    });
    if (!res.ok) throw new AppError("bad_request", res.error);

    await store.addActivity(ownerId, {
      leadId,
      type: "email",
      summary:
        res.state === "already_confirmed"
          ? "Steht bereits bestätigt in der Mailliste"
          : "Zur Mailliste eingeladen – Bestätigung gesendet",
      meta: { source: "pipeline-invite", email: lead.email },
    });

    return jsonOk({ ok: true, state: res.state });
  } catch (err) {
    return jsonError(err);
  }
}
