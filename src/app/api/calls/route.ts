import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";
import type { PipelineStage, Task } from "@/lib/types";

const Body = z.object({
  leadId: z.string().min(1),
  outcome: z.enum(["erreicht", "nicht_erreicht", "termin", "kein_bedarf", "rueckruf"]),
  note: z.string().nullish(),
});

type Outcome = z.infer<typeof Body>["outcome"];

const LABELS: Record<Outcome, string> = {
  erreicht: "Angerufen – erreicht",
  nicht_erreicht: "Angerufen – nicht erreicht",
  termin: "Angerufen – Termin vereinbart",
  kein_bedarf: "Angerufen – kein Bedarf",
  rueckruf: "Angerufen – Rückruf vereinbart",
};

function findByNames(stages: PipelineStage[], names: string[]) {
  const i = stages.findIndex((s) => names.some((n) => s.name.toLowerCase().includes(n)));
  return i >= 0 ? { stage: stages[i], idx: i } : null;
}

/** Welcher Stage entspricht dem Anruf-Ergebnis? (Name-Treffer, sonst Position) */
function resolveTarget(outcome: Outcome, stages: PipelineStage[]) {
  if (outcome === "nicht_erreicht") return null;
  if (outcome === "kein_bedarf")
    return findByNames(stages, ["verloren", "kein"]) ??
      (stages.length ? { stage: stages[stages.length - 1], idx: stages.length - 1 } : null);
  if (outcome === "termin")
    return findByNames(stages, ["termin", "interess", "angebot"]) ??
      (stages[2] ? { stage: stages[2], idx: 2 } : null);
  // erreicht / rueckruf
  return findByNames(stages, ["kontaktiert", "erreicht"]) ??
    (stages[1] ? { stage: stages[1], idx: 1 } : null);
}

const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { leadId, outcome, note } = Body.parse(await req.json());
    const store = getStore();

    const lead = await store.getLead(ownerId, leadId);
    if (!lead) throw new AppError("not_found", "Lead nicht gefunden.");
    const stages = await store.listStages(ownerId);
    const currentIdx = stages.findIndex((s) => s.id === lead.stageId);

    // 1) Stage-Ripple (nur vorwärts; „kein Bedarf" auch terminal nach hinten)
    const target = resolveTarget(outcome, stages);
    let movedTo: string | null = null;
    let updated = lead;
    if (target && (outcome === "kein_bedarf" || target.idx > currentIdx)) {
      updated = await store.updateLead(ownerId, leadId, { stageId: target.stage.id });
      movedTo = target.stage.name;
    }

    // 2) Aktivität in der Firmen-Timeline
    const firma = lead.name ?? "Lead";
    await store.addActivity(ownerId, {
      leadId,
      type: "call",
      summary: note ? `${LABELS[outcome]} – ${note}` : LABELS[outcome],
      meta: { outcome, movedTo },
    });

    // 3) Automatische Folge-Aufgabe
    let task: Task | null = null;
    if (outcome === "nicht_erreicht")
      task = await store.createTask(ownerId, { leadId, title: `Erneut anrufen: ${firma}`, type: "call", dueAt: inDays(1) });
    else if (outcome === "rueckruf")
      task = await store.createTask(ownerId, { leadId, title: `Rückruf: ${firma}`, type: "call", dueAt: inDays(1) });
    else if (outcome === "termin")
      task = await store.createTask(ownerId, { leadId, title: `Termin/Angebot vorbereiten: ${firma}`, type: "todo", dueAt: inDays(2) });

    return jsonOk({ lead: updated, movedTo, task });
  } catch (err) {
    return jsonError(err);
  }
}
