import { jsonOk, jsonError } from "@/lib/api";
import { config } from "@/lib/config";
import { getStore, getOwnerId } from "@/lib/db";
import { logUsage } from "@/lib/usage";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    // Heartbeat „aktiv heute" (gedrosselt) – vor dem Return abschließen.
    await logUsage("visit", ownerId);
    const store = getStore();
    const [activities, openTasks, settings] = await Promise.all([
      store.listActivities(ownerId, { limit: 1000 }),
      store.listTasks(ownerId, { done: false }),
      store.getSettings(ownerId),
    ]);
    const ziel = settings.callGoal ?? config.targets.callsPerDay;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    const anrufeHeute = activities.filter(
      (a) => a.type === "call" && a.createdAt >= startOfToday,
    ).length;
    const faelligHeute = openTasks.filter((t) => t.dueAt && t.dueAt <= endOfToday).length;

    return jsonOk({
      anrufeHeute,
      ziel,
      offeneAufgaben: openTasks.length,
      faelligHeute,
      // Abo-/Test-Status für den In-App-Countdown.
      subscription: {
        status: settings.subscriptionStatus ?? null,
        renewsAt: settings.subscriptionRenewsAt ?? null,
        cancelAtPeriodEnd: settings.cancelAtPeriodEnd ?? false,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
