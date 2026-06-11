// Newsletter-Verteiler mit Double-Opt-In. Zugriff nur server-seitig (Admin-Client).
import { randomBytes } from "crypto";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string | null;
  consentAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normEmail(email: string): string {
  return email.trim().toLowerCase();
}
export function isValidEmail(email: string): boolean {
  const e = email.trim();
  return e.length <= 254 && EMAIL_RE.test(e);
}
function newToken(): string {
  return randomBytes(24).toString("hex");
}

async function admin() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

export function newsletterEnabled(): boolean {
  return config.supabase.enabled && Boolean(config.supabase.serviceRoleKey);
}

export interface SubscribeInput {
  email: string;
  ip?: string | null;
  source?: string | null;
}
export type SubscribeResult =
  | { ok: true; state: "pending" | "already_confirmed" }
  | { ok: false; error: string };

/** Trägt eine Adresse als 'pending' ein und verschickt die Bestätigungs-Mail (DOI). */
export async function subscribeNewsletter(input: SubscribeInput): Promise<SubscribeResult> {
  if (!newsletterEnabled()) return { ok: false, error: "Newsletter ist nicht konfiguriert." };
  if (!isValidEmail(input.email)) return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse an." };

  const sb = await admin();
  const email = input.email.trim();
  const email_norm = normEmail(email);

  const { data: existing } = await sb
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email_norm", email_norm)
    .maybeSingle();

  // Bereits bestätigt → keine erneute Mail (kein Spam, keine Enumeration).
  if (existing && existing.status === "confirmed") {
    return { ok: true, state: "already_confirmed" };
  }

  const token = newToken();
  const nowIso = new Date().toISOString();
  const row = {
    email,
    email_norm,
    status: "pending" as const,
    token,
    source: input.source ?? null,
    consent_ip: input.ip ?? null,
    consent_at: nowIso,
    confirmed_at: null,
    unsubscribed_at: null,
    updated_at: nowIso,
  };

  if (existing) {
    await sb.from("newsletter_subscribers").update(row).eq("id", existing.id);
  } else {
    await sb.from("newsletter_subscribers").insert(row);
  }

  await sendConfirmationEmail(email, token);
  return { ok: true, state: "pending" };
}

/** Bestätigt die Anmeldung anhand des Tokens. Liefert die E-Mail oder null. */
export async function confirmNewsletter(token: string): Promise<string | null> {
  if (!token || !newsletterEnabled()) return null;
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("id, email, status")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  if (data.status === "confirmed") return data.email; // idempotent
  await sb
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", data.id);
  return data.email;
}

/** Meldet eine Adresse anhand des Tokens ab. Liefert die E-Mail oder null. */
export async function unsubscribeNewsletter(token: string): Promise<string | null> {
  if (!token || !newsletterEnabled()) return null;
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("id, email")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  await sb
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", data.id);
  return data.email;
}

/** Vollständige Liste (für die Superadmin-Übersicht). */
export async function listSubscribers(): Promise<NewsletterSubscriber[]> {
  if (!newsletterEnabled()) return [];
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("id, email, status, source, consent_at, confirmed_at, unsubscribed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    email: r.email as string,
    status: r.status as SubscriberStatus,
    source: (r.source as string) ?? null,
    consentAt: r.consent_at as string,
    confirmedAt: (r.confirmed_at as string) ?? null,
    unsubscribedAt: (r.unsubscribed_at as string) ?? null,
    createdAt: r.created_at as string,
  }));
}

// ── Kampagnen-Versand an bestätigte Abonnenten ──

export interface CampaignResult { recipients: number; sent: number; failed: number; }
export interface NewsletterCampaign {
  id: string; subject: string; recipients: number; sent: number; failed: number; createdAt: string;
}

/** Alle bestätigten Empfänger inkl. Token (für den Abmeldelink). */
async function listConfirmed(): Promise<{ email: string; token: string }[]> {
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("email, token")
    .eq("status", "confirmed");
  return (data ?? []).map((r) => ({ email: r.email as string, token: r.token as string }));
}

function buildCampaignEmail(body: string, token: string): { html: string; text: string } {
  const unsub = unsubscribeUrl(token);
  const impressum = config.resend.impressum ?? "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = esc(body).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("\n");
  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#0f172a;line-height:1.6">
${paragraphs}
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
<p style="font-size:12px;color:#64748b">${esc(impressum)}</p>
<p style="font-size:12px;color:#64748b">Du möchtest keine E-Mails mehr erhalten? <a href="${unsub}">Hier abmelden</a>.</p>
</body></html>`;
  const text = `${body}\n\n—\n${impressum}\nAbmelden: ${unsub}`;
  return { html, text };
}

/** Versendet einen Newsletter an alle bestätigten Abonnenten und protokolliert die Kampagne. */
export async function sendCampaign(subject: string, body: string): Promise<CampaignResult> {
  if (!newsletterEnabled()) throw new Error("Newsletter ist nicht konfiguriert.");
  const recipients = await listConfirmed();
  let sent = 0, failed = 0;
  for (const r of recipients) {
    try {
      const { html, text } = buildCampaignEmail(body, r.token);
      await sendSystemEmail({
        to: r.email,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl(r.token)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      sent++;
    } catch {
      failed++;
    }
    await new Promise((res) => setTimeout(res, 350)); // sanftes Throttling (IONOS-Limits)
  }
  try {
    const sb = await admin();
    await sb.from("newsletter_campaigns").insert({
      subject, body, recipients: recipients.length, sent, failed, sent_at: new Date().toISOString(),
    });
  } catch { /* Tabelle evtl. noch nicht migriert – Versand zählt trotzdem */ }
  return { recipients: recipients.length, sent, failed };
}

/** Versendete Kampagnen (Historie). */
export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  if (!newsletterEnabled()) return [];
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_campaigns")
    .select("id, subject, recipients, sent, failed, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    subject: r.subject as string,
    recipients: (r.recipients as number) ?? 0,
    sent: (r.sent as number) ?? 0,
    failed: (r.failed as number) ?? 0,
    createdAt: r.created_at as string,
  }));
}

export function confirmUrl(token: string): string {
  const u = new URL("/newsletter/bestaetigen", config.appUrl);
  u.searchParams.set("token", token);
  return u.toString();
}
export function unsubscribeUrl(token: string): string {
  const u = new URL("/newsletter/abmelden", config.appUrl);
  u.searchParams.set("token", token);
  return u.toString();
}

async function sendConfirmationEmail(email: string, token: string): Promise<void> {
  const link = confirmUrl(token);
  const impressum = config.resend.impressum ?? "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";
  const subject = "Bitte bestätige deine Newsletter-Anmeldung";
  const text =
    `Hallo,\n\nbitte bestätige mit einem Klick, dass du den KundenRadar-Newsletter erhalten möchtest:\n${link}\n\n` +
    `Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – ohne Bestätigung senden wir dir nichts.\n\n—\n${impressum}`;
  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#0f172a;line-height:1.6">
<p>Hallo,</p>
<p>bitte bestätige mit einem Klick, dass du den <b>KundenRadar</b>-Newsletter erhalten möchtest:</p>
<p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:600">Anmeldung bestätigen</a></p>
<p style="font-size:13px;color:#64748b">Oder kopiere diesen Link in den Browser:<br><a href="${link}">${link}</a></p>
<p style="font-size:13px;color:#64748b">Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach – ohne Bestätigung senden wir dir nichts.</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
<p style="font-size:12px;color:#64748b">${impressum}</p>
</body></html>`;
  await sendSystemEmail({ to: email, subject, html, text });
}
