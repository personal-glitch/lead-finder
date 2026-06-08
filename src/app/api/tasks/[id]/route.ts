import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

const Patch = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["call", "email", "todo"]).optional(),
  dueAt: z.string().nullish(),
  done: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const patch = Patch.parse(await req.json());
    const store = getStore();
    const task = await store.updateTask(ownerId, id, patch);
    // Verbindung: Erledigung in der Firmen-Timeline protokollieren.
    if (patch.done === true && task.leadId) {
      await store.addActivity(ownerId, {
        leadId: task.leadId,
        type: "task",
        summary: `Aufgabe erledigt: ${task.title}`,
        meta: { taskId: task.id },
      });
    }
    return jsonOk({ task });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    await getStore().deleteTask(ownerId, id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
