import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";
import type { Lead } from "@/lib/types";

const Patch = z.object({
  name: z.string().nullish(),
  objektTyp: z.string().nullish(),
  strasse: z.string().nullish(),
  plz: z.string().nullish(),
  ort: z.string().nullish(),
  phone: z.string().nullish(),
  phoneE164: z.string().nullish(),
  email: z.string().nullish(),
  ansprechpartner: z.string().nullish(),
  website: z.string().nullish(),
  notes: z.string().nullish(),
  value: z.number().nonnegative().nullable().optional(),
  status: z.enum(["offen", "gewonnen", "verloren"]).optional(),
  stageId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const patch = Patch.parse(await req.json()) as Partial<Lead>;
    const store = getStore();
    const before = await store.getLead(ownerId, id);
    const lead = await store.updateLead(ownerId, id, patch);

    // Verbindung: Status-Wechsel in der Timeline festhalten.
    if (patch.stageId !== undefined && before && before.stageId !== lead.stageId) {
      const stages = await store.listStages(ownerId);
      const nameOf = (sid: string | null) => stages.find((s) => s.id === sid)?.name ?? "—";
      await store.addActivity(ownerId, {
        leadId: id,
        type: "stage_changed",
        summary: `Status: ${nameOf(before.stageId)} → ${nameOf(lead.stageId)}`,
        meta: { from: before.stageId, to: lead.stageId },
      });
    }
    return jsonOk({ lead });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    await getStore().deleteLead(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
