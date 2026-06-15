// Newsletter-Verteiler mit Double-Opt-In. Zugriff nur server-seitig (Admin-Client).
import { randomBytes } from "crypto";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";
import { renderNewsletterHtml, renderNewsletterText, type NewsletterContent } from "@/lib/email/newsletter-template";

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
  name?: string | null;
  ip?: string | null;
  source?: string | null;
}

/** Ersetzt {{Vorname}} (case-insensitive) durch den Namen, sonst „zusammen". */
export function personalize(text: string, name?: string | null): string {
  return text.replace(/\{\{\s*vorname\s*\}\}/gi, name && name.trim() ? name.trim() : "zusammen");
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
    name: input.name ?? null,
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

/**
 * Trägt eine bereits verifizierte Adresse (eingeloggter Nutzer) direkt als
 * 'confirmed' ein – Einwilligung per ausdrücklichem Klick im Tool, dokumentiert.
 */
export async function subscribeConfirmed(
  input: SubscribeInput,
  opts: { sendWelcome?: boolean; skipUnsubscribed?: boolean } = {},
): Promise<SubscribeResult> {
  if (!newsletterEnabled()) return { ok: false, error: "Newsletter ist nicht konfiguriert." };
  if (!isValidEmail(input.email)) return { ok: false, error: "Ungültige E-Mail-Adresse." };
  const sb = await admin();
  const email = input.email.trim();
  const email_norm = normEmail(email);

  const { data: existing } = await sb
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email_norm", email_norm)
    .maybeSingle();
  if (existing && existing.status === "confirmed") return { ok: true, state: "already_confirmed" };
  // Abgemeldete beim Massen-Import nicht reaktivieren (Opt-out respektieren).
  if (existing && existing.status === "unsubscribed" && opts.skipUnsubscribed) return { ok: true, state: "already_confirmed" };

  const token = newToken();
  const now = new Date().toISOString();
  const row = {
    email, email_norm, status: "confirmed" as const, token,
    source: input.source ?? "tool", name: input.name ?? null,
    consent_ip: input.ip ?? null, consent_at: now, confirmed_at: now,
    unsubscribed_at: null, updated_at: now,
  };
  if (existing) await sb.from("newsletter_subscribers").update(row).eq("id", existing.id);
  else await sb.from("newsletter_subscribers").insert(row);

  if (opts.sendWelcome !== false) await sendWelcomeEmail(email, input.name ?? null, token).catch(() => {});
  return { ok: true, state: "pending" };
}

// Die 3 Gratis-Tools (Lead-Magnete), die jeder neue Abonnent per Mail bekommt.
export const FREEBIES = [
  { label: "Akquise-Vorlagen-Paket (PDF)", file: "Akquise-Vorlagen-Paket.pdf" },
  { label: "Kaltakquise-Leitfaden 2026 (PDF)", file: "Kaltakquise-Leitfaden-2026.pdf" },
  { label: "Akquise-Tracker (Excel)", file: "Akquise-Tracker.xlsx" },
] as const;

export function downloadUrl(file: string): string {
  return new URL(`/downloads/${file}`, config.appUrl).toString();
}

// Automatische Willkommens-Mail nach Bestätigung / Opt-in – mit den 3 Gratis-Tools.
async function sendWelcomeEmail(email: string, name: string | null, token: string): Promise<void> {
  const hallo = name && name.trim() ? name.trim() : "zusammen";
  const impressum = config.resend.impressum ?? DEFAULT_IMPRESSUM;
  const unsub = unsubscribeUrl(token);

  const buttons = FREEBIES.map(
    (d) =>
      `<p style="margin:8px 0"><a href="${downloadUrl(d.file)}" style="display:inline-block;background:#16181d;color:#a8e83a;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:600">⬇ ${d.label}</a></p>`,
  ).join("");

  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#16181d;line-height:1.6;max-width:560px;margin:0 auto;padding:8px">
<p>Hallo ${hallo},</p>
<p>schön, dass du dabei bist! Hier sind deine <b>3 Gratis-Tools</b> zum sofort Loslegen:</p>
${buttons}
<p style="font-size:13px;color:#5b6470">Tipp: Fang mit dem Vorlagen-Paket an – Telefon-Leitfaden + 5 E-Mail-Vorlagen, sofort einsetzbar.</p>
<p>Ab jetzt bekommst du außerdem regelmäßig einen umsetzbaren Tipp für mehr Neukunden, Anfragen und Umsatz.</p>
<p style="margin:22px 0"><a href="${config.appUrl}/registrieren" style="display:inline-block;background:#a8e83a;color:#16181d;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">KundenRadar 3 Tage gratis testen</a></p>
<p>Beste Grüße<br>Cihan · Seciora Solutions</p>
<hr style="border:none;border-top:1px solid #e3e7ec;margin:24px 0">
<p style="font-size:12px;color:#5b6470">${impressum}<br><a href="${unsub}" style="color:#5b6470">Newsletter abbestellen</a></p>
</body></html>`;

  const text =
    `Hallo ${hallo},\n\nschön, dass du dabei bist! Hier sind deine 3 Gratis-Tools:\n\n` +
    FREEBIES.map((d) => `- ${d.label}: ${downloadUrl(d.file)}`).join("\n") +
    `\n\nAb jetzt bekommst du regelmäßig einen Tipp für mehr Neukunden.\n\n` +
    `KundenRadar 3 Tage gratis testen: ${config.appUrl}/registrieren\n\n` +
    `Beste Grüße\nCihan · Seciora Solutions\n\n—\n${impressum}\nAbbestellen: ${unsub}`;

  await sendSystemEmail({ to: email, subject: "Deine 3 Gratis-Tools für mehr Neukunden 🎁", html, text });
}

/** Bestätigt die Anmeldung anhand des Tokens. Liefert die E-Mail oder null. */
export async function confirmNewsletter(token: string): Promise<string | null> {
  if (!token || !newsletterEnabled()) return null;
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("id, email, status, name")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  if (data.status === "confirmed") return data.email; // idempotent
  await sb
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", data.id);
  // Willkommens-Mail automatisch nach Double-Opt-In.
  await sendWelcomeEmail(data.email as string, (data.name as string) ?? null, token).catch(() => {});
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
  status: string; scheduledFor: string | null;
}

/** Alle bestätigten Empfänger inkl. Token (für den Abmeldelink). */
async function listConfirmed(): Promise<{ email: string; token: string; name: string | null }[]> {
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("email, token, name")
    .eq("status", "confirmed");
  return (data ?? []).map((r) => ({ email: r.email as string, token: r.token as string, name: (r.name as string) ?? null }));
}

export interface CampaignInput extends NewsletterContent { subject: string; }

const DEFAULT_IMPRESSUM = "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";

function buildCampaignEmail(content: NewsletterContent, token: string): { html: string; text: string } {
  const opts = {
    ...content,
    unsubscribeUrl: unsubscribeUrl(token),
    impressum: config.resend.impressum ?? DEFAULT_IMPRESSUM,
  };
  return { html: renderNewsletterHtml(opts), text: renderNewsletterText(opts) };
}

/** Reine Zustellung an alle bestätigten Abonnenten (mit {{Vorname}}-Personalisierung). */
async function deliverToConfirmed(input: CampaignInput): Promise<CampaignResult> {
  const recipients = await listConfirmed();
  let sent = 0, failed = 0;
  for (const r of recipients) {
    try {
      const personalized = {
        ...input,
        headline: personalize(input.headline, r.name),
        body: personalize(input.body, r.name),
      };
      const { html, text } = buildCampaignEmail(personalized, r.token);
      await sendSystemEmail({
        to: r.email,
        subject: personalize(input.subject, r.name),
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
  return { recipients: recipients.length, sent, failed };
}

function campaignRow(input: CampaignInput) {
  return {
    subject: input.subject,
    body: input.body,
    template: input.template,
    headline: input.headline,
    cta_label: input.ctaLabel ?? null,
    cta_url: input.ctaUrl ?? null,
    image_url: input.imageUrl ?? null,
    raw_html: input.rawHtml ?? false,
  };
}

/** Sofort an alle bestätigten Abonnenten senden + protokollieren. */
export async function sendCampaign(input: CampaignInput): Promise<CampaignResult> {
  if (!newsletterEnabled()) throw new Error("Newsletter ist nicht konfiguriert.");
  const r = await deliverToConfirmed(input);
  try {
    const sb = await admin();
    await sb.from("newsletter_campaigns").insert({
      ...campaignRow(input), status: "sent", recipients: r.recipients, sent: r.sent, failed: r.failed, sent_at: new Date().toISOString(),
    });
  } catch { /* Tabelle evtl. noch nicht migriert – Versand zählt trotzdem */ }
  return r;
}

/** Newsletter für einen späteren Zeitpunkt einplanen. */
export async function createScheduledCampaign(input: CampaignInput, scheduledForIso: string): Promise<void> {
  if (!newsletterEnabled()) throw new Error("Newsletter ist nicht konfiguriert.");
  const sb = await admin();
  await sb.from("newsletter_campaigns").insert({
    ...campaignRow(input), status: "scheduled", scheduled_for: scheduledForIso, recipients: 0, sent: 0, failed: 0,
  });
}

/** Fällige geplante Kampagnen senden (Cron + On-Demand). Liefert Anzahl verarbeiteter Kampagnen. */
export async function processDueCampaigns(): Promise<number> {
  if (!newsletterEnabled()) return 0;
  const sb = await admin();
  const nowIso = new Date().toISOString();
  const { data } = await sb
    .from("newsletter_campaigns")
    .select("id, subject, body, template, headline, cta_label, cta_url, image_url, raw_html")
    .eq("status", "scheduled")
    .lte("scheduled_for", nowIso)
    .limit(20);
  let processed = 0;
  for (const c of data ?? []) {
    // Doppelversand vermeiden: Kampagne erst „beanspruchen".
    const { data: claim } = await sb
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", c.id).eq("status", "scheduled").select("id");
    if (!claim || claim.length === 0) continue;
    const input: CampaignInput = {
      subject: c.subject as string,
      template: ((c.template as string) || "tipp") as NewsletterContent["template"],
      headline: (c.headline as string) || (c.subject as string),
      body: c.body as string,
      ctaLabel: (c.cta_label as string) || undefined,
      ctaUrl: (c.cta_url as string) || undefined,
      imageUrl: (c.image_url as string) || undefined,
      rawHtml: Boolean(c.raw_html),
    };
    const r = await deliverToConfirmed(input);
    await sb.from("newsletter_campaigns").update({
      status: "sent", recipients: r.recipients, sent: r.sent, failed: r.failed, sent_at: new Date().toISOString(),
    }).eq("id", c.id);
    processed++;
  }
  return processed;
}

/** Versendete & geplante Kampagnen (Historie). */
export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  if (!newsletterEnabled()) return [];
  const sb = await admin();
  const { data } = await sb
    .from("newsletter_campaigns")
    .select("id, subject, recipients, sent, failed, created_at, status, scheduled_for")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    subject: r.subject as string,
    recipients: (r.recipients as number) ?? 0,
    sent: (r.sent as number) ?? 0,
    failed: (r.failed as number) ?? 0,
    createdAt: r.created_at as string,
    status: (r.status as string) ?? "sent",
    scheduledFor: (r.scheduled_for as string) ?? null,
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
