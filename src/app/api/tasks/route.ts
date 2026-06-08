import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const url = new URL(req.url);
    const leadId = url.searchParams.get("leadId") ?? undefined;
    const doneParam = url.searchParams.get("done");
    const done = doneParam === null ? undefined : doneParam === "true";
    const tasks = await getStore().listTasks(ownerId, { leadId, done });
    return jsonOk({ tasks });
  } catch (err) {
    return jsonError(err);
  }
}

const Body = z.object({
  title: z.string().min(1, "Titel erforderlich."),
  type: z.enum(["call", "email", "todo"]).default("todo"),
  leadId: z.string().nullish(),
  dueAt: z.string().nullish(),
});

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const b = Body.parse(await req.json());
    const store = getStore();
    const task = await store.createTask(ownerId, {
      title: b.title.trim(),
      type: b.type,
      leadId: b.leadId ?? null,
      dueAt: b.dueAt ?? null,
    });
    // Verbindung: an der Firma als Aktivität sichtbar machen.
    if (task.leadId) {
      await store.addActivity(ownerId, {
        leadId: task.leadId,
        type: "task",
        summary: `Aufgabe erstellt: ${task.title}`,
        meta: { taskId: task.id },
      });
    }
    return jsonOk({ task }, 201);
  } catch (err) {
    return jsonError(err);
  }
}
