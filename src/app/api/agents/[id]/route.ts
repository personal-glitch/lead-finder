import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const agent = await getStore().getAgent(ownerId, id);
    if (!agent) throw new AppError("not_found", "Agent nicht gefunden.");
    return jsonOk({ agent });
  } catch (err) {
    return jsonError(err);
  }
}

const Patch = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullish(),
  icon: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  objektTypen: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  branche: z.string().nullish(),
  plz: z.string().min(1).optional(),
  radiusKm: z.number().positive().max(50).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const patch = Patch.parse(await req.json());
    const agent = await getStore().updateAgent(ownerId, id, patch);
    return jsonOk({ agent });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    await getStore().deleteAgent(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
