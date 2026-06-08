import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

const Patch = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const patch = Patch.parse(await req.json());
    const template = await getStore().updateTemplate(ownerId, id, patch);
    return jsonOk({ template });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    await getStore().deleteTemplate(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
