import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    await getStore().removeSuppression(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
