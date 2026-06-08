import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";
import { planOf } from "@/lib/plans";
import type { AgentInput } from "@/lib/types";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    const agents = await getStore().listAgents(ownerId);
    return jsonOk({ agents });
  } catch (err) {
    return jsonError(err);
  }
}

export const AgentBody = z.object({
  name: z.string().min(1, "Name erforderlich."),
  description: z.string().nullish(),
  icon: z.string().min(1).default("box"),
  color: z.string().min(1).default("slate"),
  objektTypen: z.array(z.string()).min(1, "Mindestens einen Objekttyp wählen."),
  keywords: z.array(z.string()).default([]),
  branche: z.string().nullish(),
  plz: z.string().min(1, "PLZ/Ort erforderlich."),
  radiusKm: z.number().positive().max(50).default(10),
});

export function toAgentInput(b: z.infer<typeof AgentBody>): AgentInput {
  return {
    name: b.name.trim(),
    description: b.description?.trim() || null,
    icon: b.icon,
    color: b.color,
    objektTypen: b.objektTypen,
    keywords: b.keywords.map((k) => k.trim()).filter(Boolean),
    branche: b.branche?.trim() || null,
    plz: b.plz.trim(),
    radiusKm: b.radiusKm,
  };
}

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const body = AgentBody.parse(await req.json());
    const store = getStore();
    // Paket-Limit erzwingen.
    const limit = planOf((await store.getSettings(ownerId)).plan).maxAgents;
    if ((await store.listAgents(ownerId)).length >= limit) {
      throw new AppError("limit", `Paket-Limit erreicht: max. ${limit} Agent(en). Upgrade in den Einstellungen.`);
    }
    const agent = await store.createAgent(ownerId, toAgentInput(body));
    return jsonOk({ agent }, 201);
  } catch (err) {
    return jsonError(err);
  }
}
