import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";
import { runBrancheSearch } from "@/lib/leadgen/run-search";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ownerId = await getOwnerId();
    const store = getStore();

    const agent = await store.getAgent(ownerId, id);
    if (!agent) throw new AppError("not_found", "Agent nicht gefunden.");
    const branchen = agent.objektTypen.filter(isBrancheKey) as BrancheKey[];
    const keywords = (agent.keywords ?? []).map((k) => k.trim()).filter(Boolean);

    const result = await runBrancheSearch(agent.plz, agent.radiusKm, branchen, keywords);
    const updated = await store.recordAgentRun(ownerId, id, result.leads.length, 0);
    return jsonOk({ agent: updated, result });
  } catch (err) {
    return jsonError(err);
  }
}
