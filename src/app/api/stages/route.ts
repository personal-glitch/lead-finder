import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId, ensureSeeded } from "@/lib/db";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    await ensureSeeded(ownerId);
    const stages = await getStore().listStages(ownerId);
    return jsonOk({ stages });
  } catch (err) {
    return jsonError(err);
  }
}

const CreateBody = z.object({ name: z.string().min(1, "Name erforderlich.") });

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { name } = CreateBody.parse(await req.json());
    const stage = await getStore().createStage(ownerId, name);
    return jsonOk({ stage }, 201);
  } catch (err) {
    return jsonError(err);
  }
}

const ReorderBody = z.object({ orderedIds: z.array(z.string()).min(1) });

export async function PUT(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { orderedIds } = ReorderBody.parse(await req.json());
    const stages = await getStore().reorderStages(ownerId, orderedIds);
    return jsonOk({ stages });
  } catch (err) {
    return jsonError(err);
  }
}
