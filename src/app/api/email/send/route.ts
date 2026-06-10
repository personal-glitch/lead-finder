import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { getStore, getOwnerId } from "@/lib/db";
import { sendOutreach, type SendOutcome } from "@/lib/email/send";
import type { EmailTemplate } from "@/lib/types";

const Body = z
  .object({
    leadIds: z.array(z.string()).min(1, "Keine Empfänger ausgewählt."),
    // Entweder eine gespeicherte Vorlage …
    templateId: z.string().optional(),
    // … oder direkt geschriebener Betreff + Text (Direktnachricht).
    subject: z.string().min(1).max(300).optional(),
    body: z.string().min(1).max(8000).optional(),
  })
  .refine((b) => b.templateId || (b.subject && b.body), {
    message: "Bitte eine Vorlage wählen oder Betreff und Text schreiben.",
  });

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { leadIds, templateId, subject, body } = Body.parse(await req.json());
    const store = getStore();

    // Pflicht: Ohne hinterlegtes Impressum dürfen keine Werbe-E-Mails raus (§ 5 DDG / § 6 UWG).
    const settings = await store.getSettings(ownerId);
    const impressum = (settings.senderImpressum ?? config.resend.impressum ?? "").trim();
    if (!impressum) {
      throw new AppError(
        "bad_request",
        "Bitte zuerst dein Impressum unter Einstellungen → E-Mail-Versand hinterlegen. Ohne Impressum dürfen keine Werbe-E-Mails versendet werden.",
      );
    }

    let template: EmailTemplate | undefined;
    if (subject && body) {
      // Ad-hoc-Direktnachricht – wird nicht als Vorlage gespeichert.
      template = { id: "adhoc", name: "Direktnachricht", subject, body, ownerId };
    } else {
      template = (await store.listTemplates(ownerId)).find((t) => t.id === templateId);
    }
    if (!template) throw new AppError("not_found", "Vorlage nicht gefunden.");

    // Tageslimit zum Schutz der Zustellbarkeit (eigenes Postfach wird sonst schnell als Spam gewertet).
    const DAILY_CAP = 50;
    const today = new Date().toDateString();
    const sentToday = (await store.listEmailLog(ownerId)).filter(
      (e) => e.status === "sent" && e.sentAt && new Date(e.sentAt).toDateString() === today,
    ).length;
    let remaining = Math.max(0, DAILY_CAP - sentToday);

    const results: Array<{ leadId: string } & SendOutcome> = [];
    // Sequenziell – schont Limits und hält die Reihenfolge stabil.
    for (const leadId of leadIds) {
      if (remaining <= 0) {
        results.push({
          leadId,
          status: "queued",
          to: null,
          subject: null,
          error: `Tageslimit von ${DAILY_CAP} E-Mails erreicht – Rest am nächsten Tag senden.`,
        });
        continue;
      }
      const lead = await store.getLead(ownerId, leadId);
      if (!lead) {
        results.push({
          leadId,
          status: "failed",
          to: null,
          subject: null,
          error: "Lead nicht gefunden.",
        });
        continue;
      }
      const outcome = await sendOutreach(ownerId, lead, template);
      if (outcome.status === "sent") remaining--;
      await store.addActivity(ownerId, {
        leadId,
        type: "email",
        summary: `E-Mail „${template.name}" (${outcome.status})`,
        meta: { status: outcome.status, to: outcome.to },
      });
      // Halbautomatischer Follow-up: nach erfolgreichem Versand eine Wiedervorlage in 3 Tagen
      // anlegen – aber nur, wenn für den Lead noch keine offene Follow-up-Erinnerung existiert.
      if (outcome.status === "sent") {
        try {
          const open = await store.listTasks(ownerId, { leadId, done: false });
          const hasFollowup = open.some((t) => t.type === "email" && t.title.startsWith("Follow-up"));
          if (!hasFollowup) {
            await store.createTask(ownerId, {
              leadId,
              title: `Follow-up: ${lead.name ?? "Lead"}`,
              type: "email",
              dueAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
            });
          }
        } catch { /* Follow-up ist optional – Versand nicht blockieren */ }
      }
      results.push({ leadId, ...outcome });
    }

    return jsonOk({ results });
  } catch (err) {
    return jsonError(err);
  }
}
