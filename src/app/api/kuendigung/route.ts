import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

// Öffentliche Kündigung gemäß § 312k BGB (Kündigungsbutton). Nimmt die
// Kündigungserklärung entgegen, speichert sie und bestätigt den Eingang.
const Body = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse angeben."),
  contractRef: z.string().max(200).optional(),
  kind: z.enum(["ordentlich", "ausserordentlich"]).default("ordentlich"),
  desiredDate: z.string().max(60).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    if (!config.supabase.enabled) {
      throw new AppError(
        "not_configured",
        "Die Online-Kündigung ist derzeit nicht verfügbar. Bitte kündige per E-Mail an personal@lupen-rhein.de.",
      );
    }
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = createAdminClient();
    const receivedAt = new Date().toISOString();
    const { error } = await admin.from("cancellation_requests").insert({
      name: b.name ?? null,
      email: b.email,
      contract_ref: b.contractRef ?? null,
      kind: b.kind,
      desired_date: b.desiredDate ?? null,
      message: b.message ?? null,
    });
    if (error) throw new AppError("upstream", `Kündigung konnte nicht gespeichert werden: ${error.message}`);
    return jsonOk({ ok: true, receivedAt });
  } catch (err) {
    return jsonError(err);
  }
}
