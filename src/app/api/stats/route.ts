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
    const [activities, openTasks, settings, leads] = await Promise.all([
      store.listActivities(ownerId, { limit: 1000 }),
      store.listTasks(ownerId, { done: false }),
      store.getSettings(ownerId),
      store.listLeads(ownerId),
    ]);
    const ziel = settings.callGoal ?? config.targets.callsPerDay;

    // Pipeline-Auswertung nach Auftragswert + Abschluss-Status.
    const sumValue = (arr: typeof leads) =>
      arr.reduce((s, l) => s + (typeof l.value === "number" ? l.value : 0), 0);
    const offeneLeads = leads.filter((l) => l.status === "offen");
    const gewonnenLeads = leads.filter((l) => l.status === "gewonnen");
    const verlorenLeads = leads.filter((l) => l.status === "verloren");
    const pipelineWert = sumValue(offeneLeads);
    const gewonnenWert = sumValue(gewonnenLeads);
    const abgeschlossen = gewonnenLeads.length + verlorenLeads.length;
    const abschlussquote = abgeschlossen > 0 ? gewonnenLeads.length / abgeschlossen : null;
    const leadsMitWert = leads.filter((l) => typeof l.value === "number" && l.value > 0).length;
    const oeAuftragswert = leadsMitWert > 0 ? sumValue(leads) / leadsMitWert : null;

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
      // Pipeline-Kennzahlen (Auftragswert / Abschlussquote).
      pipeline: {
        anzahlOffen: offeneLeads.length,
        pipelineWert,
        gewonnenAnzahl: gewonnenLeads.length,
        gewonnenWert,
        verlorenAnzahl: verlorenLeads.length,
        abschlussquote,
        oeAuftragswert,
      },
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
