import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const leadId = new URL(req.url).searchParams.get("leadId") ?? undefined;
    const log = await getStore().listEmailLog(ownerId, leadId);
    return jsonOk({ log });
  } catch (err) {
    return jsonError(err);
  }
}
