import { jsonOk, jsonError } from "@/lib/api";
import { getStore, getOwnerId } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const url = new URL(req.url);
    const leadId = url.searchParams.get("leadId") ?? undefined;
    const limit = Number(url.searchParams.get("limit")) || undefined;
    const activities = await getStore().listActivities(ownerId, { leadId, limit });
    return jsonOk({ activities });
  } catch (err) {
    return jsonError(err);
  }
}
