import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

const Patch = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const patch = Patch.parse(await req.json());
    const stage = await getStore().updateStage(ownerId, id, patch);
    return jsonOk({ stage });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    await getStore().deleteStage(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
