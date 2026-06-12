import "server-only";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";

const KUENDIGUNG_URL = `${config.appUrl.replace(/\/$/, "")}/kuendigung`;
const WHATSAPP_URL =
  "https://wa.me/4915292627062?text=" +
  encodeURIComponent("Hallo, ich habe noch eine Frage zu meinem KundenRadar-Test.");
const IMPRESSUM = "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln · kontakt@seciora-solutions.de";

const fmtDE = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** E-Mail „Deine Testphase endet bald" an einen Trial-Nutzer (von kontakt@). */
async function sendTrialEndingEmail(to: string, name: string, endsAtIso: string): Promise<void> {
  const hi = name ? `Hallo ${name},` : "Hallo,";
  const end = fmtDE(endsAtIso);
  const text =
    `${hi}\n\nnur als kurze Info: Deine 3-tägige kostenlose Testphase von KundenRadar endet am ${end} Uhr.\n\n` +
    `Danach startet automatisch dein Abo zu 49 € pro Monat (monatlich kündbar).\n\n` +
    `• Du möchtest dabei bleiben? Super – du musst nichts tun.\n` +
    `• Du möchtest nicht weitermachen? Dann kündige einfach vorher mit einem Klick, es wird dann nichts berechnet:\n${KUENDIGUNG_URL}\n\n` +
    `Noch Fragen oder unsicher, ob KundenRadar zu dir passt? Schreib mir gerne direkt per WhatsApp, ich helfe dir persönlich weiter:\n${WHATSAPP_URL}\n\n` +
    `Oder antworte einfach auf diese E-Mail.\n\nViele Grüße\nCihan – KundenRadar\n\n—\n${IMPRESSUM}`;
  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#0f172a;line-height:1.6">
<p>${esc(hi)}</p>
<p>nur als kurze Info: Deine <strong>3-tägige kostenlose Testphase</strong> von KundenRadar endet am <strong>${esc(end)} Uhr</strong>.</p>
<p>Danach startet automatisch dein Abo zu <strong>49 € pro Monat</strong> (monatlich kündbar).</p>
<ul>
<li><strong>Du möchtest dabei bleiben?</strong> Super – du musst nichts tun.</li>
<li><strong>Du möchtest nicht weitermachen?</strong> Dann kündige vorher mit einem Klick, es wird nichts berechnet.</li>
</ul>
<p style="margin:18px 0">
<a href="${KUENDIGUNG_URL}" style="display:inline-block;background:#a8e83a;color:#14310a;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px;margin:4px 8px 4px 0">Jetzt kündigen / Test beenden</a>
<a href="${WHATSAPP_URL}" style="display:inline-block;background:#25D366;color:#ffffff;font-weight:600;text-decoration:none;padding:10px 18px;border-radius:8px;margin:4px 0">💬 Fragen? Per WhatsApp melden</a>
</p>
<p>Noch unsicher, ob KundenRadar zu dir passt? Schreib mir gerne direkt per <a href="${WHATSAPP_URL}" style="color:#128C7E">WhatsApp</a> – ich helfe dir persönlich weiter. Oder antworte einfach auf diese E-Mail.</p>
<p>Viele Grüße<br>Cihan – KundenRadar</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
<p style="font-size:12px;color:#64748b">${esc(IMPRESSUM)}</p>
</body></html>`;
  await sendSystemEmail({ to, cc: "kontakt@seciora-solutions.de", subject: "Deine KundenRadar-Testphase endet bald", html, text });
}

/**
 * Erinnert Trial-Nutzer, deren Testphase in den nächsten ~26 Stunden endet,
 * per E-Mail an den automatischen Übergang ins kostenpflichtige Abo.
 * Idempotent über settings.trial_reminder_sent_at (kein Doppelversand).
 * Wird vom täglichen Cron aufgerufen. Liefert die Anzahl versendeter Mails.
 */
export async function sendTrialEndingReminders(): Promise<number> {
  if (!config.supabase.enabled) return 0;
  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = createAdminClient();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 50 * 3600 * 1000).toISOString();

  // Trial-Abos, deren Periode (= Testende) im Fenster liegt und die noch keine
  // Erinnerung erhalten haben.
  const { data: rows, error } = await admin
    .from("settings")
    .select("owner_id, subscription_renews_at")
    .eq("subscription_status", "trialing")
    .is("trial_reminder_sent_at", null)
    .not("subscription_renews_at", "is", null)
    .gte("subscription_renews_at", now.toISOString())
    .lte("subscription_renews_at", windowEnd);
  if (error || !rows?.length) return 0;

  let sent = 0;
  for (const row of rows) {
    const ownerId = row.owner_id as string;
    const endsAtIso = row.subscription_renews_at as string;
    try {
      const { data: u } = await admin.auth.admin.getUserById(ownerId);
      const email = u?.user?.email;
      if (!email) continue;
      const meta = (u?.user?.user_metadata ?? {}) as { first_name?: string };
      await sendTrialEndingEmail(email, (meta.first_name ?? "").trim(), endsAtIso);
      // Sofort als „erinnert" markieren, damit es bei Mehrfachläufen nicht doppelt rausgeht.
      await admin.from("settings").update({ trial_reminder_sent_at: new Date().toISOString() }).eq("owner_id", ownerId);
      sent++;
    } catch (e) {
      console.error("[trial-reminder] Versand fehlgeschlagen für", ownerId, e);
    }
  }
  return sent;
}
