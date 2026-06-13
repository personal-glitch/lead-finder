import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getOwnerId } from "@/lib/db";
import { listJobAlerts, createJobAlert, deleteJobAlert } from "@/lib/job-alerts";

export const runtime = "nodejs";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    return jsonOk({ alerts: await listJobAlerts(ownerId) });
  } catch (err) {
    return jsonError(err);
  }
}

const Body = z.object({
  was: z.string().max(120).nullish(),
  wo: z.string().max(120).nullish(),
  umkreis: z.number().int().min(0).max(200).optional(),
  onlyDirect: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    if (!config.supabase.enabled) throw new AppError("not_configured", "Alerts benötigen die Cloud-Datenbank.");
    // E-Mail des angemeldeten Nutzers als Empfänger.
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) throw new AppError("auth", "Keine E-Mail-Adresse am Konto gefunden.");
    const b = Body.parse(await req.json());
    if (!b.was && !b.wo) throw new AppError("bad_request", "Bitte Beruf/Stichwort oder Ort angeben.");
    const alert = await createJobAlert(ownerId, email, { was: b.was, wo: b.wo, umkreis: b.umkreis, onlyDirect: b.onlyDirect });
    return jsonOk({ alert });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new AppError("bad_request", "Keine Alert-ID.");
    await deleteJobAlert(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
