import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";
import { sendOutreach, type SendOutcome } from "@/lib/email/send";

const Body = z.object({
  leadIds: z.array(z.string()).min(1, "Keine Empfänger ausgewählt."),
  templateId: z.string().min(1, "Keine Vorlage gewählt."),
});

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { leadIds, templateId } = Body.parse(await req.json());
    const store = getStore();

    const template = (await store.listTemplates(ownerId)).find(
      (t) => t.id === templateId,
    );
    if (!template) throw new AppError("not_found", "Vorlage nicht gefunden.");

    const results: Array<{ leadId: string } & SendOutcome> = [];
    // Sequenziell – schont Resend-Limits und hält die Reihenfolge stabil.
    for (const leadId of leadIds) {
      const lead = await store.getLead(ownerId, leadId);
      if (!lead) {
        results.push({
          leadId,
          status: "failed",
          to: null,
          subject: null,
          error: "Lead nicht gefunden.",
        });
        continue;
      }
      const outcome = await sendOutreach(ownerId, lead, template);
      await store.addActivity(ownerId, {
        leadId,
        type: "email",
        summary: `E-Mail „${template.name}" (${outcome.status})`,
        meta: { status: outcome.status, to: outcome.to },
      });
      results.push({ leadId, ...outcome });
    }

    return jsonOk({ results });
  } catch (err) {
    return jsonError(err);
  }
}
