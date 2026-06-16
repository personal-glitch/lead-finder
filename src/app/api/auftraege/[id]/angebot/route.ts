import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getOwnerId } from "@/lib/db";
import { createOffer } from "@/lib/marketplace";

const Body = z.object({ message: z.string().min(5).max(2000) });

// Ein eingeloggter Nutzer sendet ein Angebot auf eine Anfrage.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ownerId = await getOwnerId();
    const { id } = await params;
    const { message } = Body.parse(await req.json());

    // Kontakt-E-Mail des Anbieters (für Antwort des Interessenten).
    let contactEmail = "";
    if (config.supabase.enabled) {
      const { createClient } = await import("@/lib/supabase/server");
      const { data: { user } } = await (await createClient()).auth.getUser();
      contactEmail = user?.email ?? "";
    }
    if (!contactEmail) throw new AppError("bad_request", "Keine Kontakt-E-Mail im Konto hinterlegt.");

    const res = await createOffer({ requestId: id, ownerId, contactEmail, message });
    if (!res.ok) throw new AppError("bad_request", res.error);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
