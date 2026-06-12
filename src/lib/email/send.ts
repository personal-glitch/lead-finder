// E-Mail-Outreach über Resend – mit Pflicht-Footer (Impressum + Abmeldelink)
// und Suppression-Prüfung. Ohne Resend-Key wird nur eine Vorschau erzeugt.
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";
import type { EmailStatus, EmailTemplate, Lead, Settings } from "@/lib/types";
import { renderTemplate } from "./templates";

/** true, wenn der Nutzer einen eigenen SMTP-Versand hinterlegt hat. */
export function smtpConfigured(s: Settings): boolean {
  return Boolean(s.smtpHost && s.smtpUser && s.smtpPass && s.senderEmail);
}

function fromHeader(s: Settings): string {
  const email = s.senderEmail!.trim();
  const name = s.senderName?.trim();
  return name ? `"${name.replace(/"/g, "")}" <${email}>` : email;
}

/** Versendet eine Mail über den SMTP-Zugang des Nutzers (wirft bei Fehler). */
export async function smtpSendRaw(
  s: Settings,
  msg: { to: string; cc?: string | string[]; bcc?: string | string[]; subject: string; html: string; text: string; headers?: Record<string, string> },
): Promise<void> {
  const port = s.smtpPort ?? 587;
  const transport = nodemailer.createTransport({
    host: s.smtpHost!,
    port,
    secure: port === 465, // 465 = implizites TLS, sonst STARTTLS
    auth: { user: s.smtpUser!, pass: decryptSecret(s.smtpPass) },
  });
  await transport.sendMail({ from: fromHeader(s), replyTo: s.senderEmail!.trim(), ...msg });
}

/** Test-Mail an die eigene Absenderadresse, um den SMTP-Zugang zu prüfen. */
export async function sendTestEmail(ownerId: string): Promise<{ ok: boolean; to?: string; error?: string }> {
  const s = await getStore().getSettings(ownerId);
  if (!smtpConfigured(s)) {
    return { ok: false, error: "Bitte zuerst Absender-E-Mail und SMTP-Zugang speichern." };
  }
  try {
    await smtpSendRaw(s, {
      to: s.senderEmail!.trim(),
      subject: "KundenRadar – Test-E-Mail",
      html: "<p>Geschafft! Dein E-Mail-Versand über <b>KundenRadar</b> funktioniert. ✅</p>",
      text: "Geschafft! Dein E-Mail-Versand über KundenRadar funktioniert.",
    });
    return { ok: true, to: s.senderEmail!.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Versand fehlgeschlagen." };
  }
}

export interface SendOutcome {
  status: EmailStatus;
  to: string | null;
  subject: string | null;
  error: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unsubscribeUrl(email: string, ownerId: string): string {
  const u = new URL("/abmelden", config.appUrl);
  u.searchParams.set("email", email);
  u.searchParams.set("owner", ownerId);
  return u.toString();
}

function buildHtml(body: string, unsubUrl: string, senderImpressum: string | null, signature: string | null): string {
  const paragraphs = escapeHtml(body)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
  // Persönliche Signatur (optional) – direkt unter dem Mailtext, über dem Pflicht-Footer.
  // Enthält die Signatur HTML-Tags, wird sie roh eingebettet (Profi-Signatur); sonst Text mit nl2br.
  const sigTrim = signature?.trim();
  const sigIsHtml = !!sigTrim && /<[a-z][\s\S]*>/i.test(sigTrim);
  const sig = sigTrim
    ? sigIsHtml
      ? `<div style="margin-top:16px">${sigTrim}</div>`
      : `<p style="margin-top:16px;color:#334155">${escapeHtml(sigTrim).replace(/\n/g, "<br>")}</p>`
    : "";
  const impressum = senderImpressum
    ? escapeHtml(senderImpressum)
    : "[Impressum bitte in den Einstellungen hinterlegen]";
  return `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#0f172a;line-height:1.5">
${paragraphs}
${sig}
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
<p style="font-size:12px;color:#64748b">${impressum}</p>
<p style="font-size:12px;color:#64748b">
Sie möchten keine weiteren E-Mails erhalten?
<a href="${unsubUrl}">Hier abmelden</a>.
</p>
</body></html>`;
}

/**
 * Versendet (oder protokolliert) eine Outreach-Mail an einen Lead und schreibt
 * einen Eintrag ins email_log. Liefert das Ergebnis zurück.
 */
export async function sendOutreach(
  ownerId: string,
  lead: Lead,
  template: EmailTemplate,
): Promise<SendOutcome> {
  const store = getStore();
  const to = lead.email?.trim() ?? null;

  const log = (outcome: SendOutcome) =>
    store
      .addEmailLog(ownerId, {
        leadId: lead.id,
        templateId: template.id,
        to: outcome.to,
        subject: outcome.subject,
        status: outcome.status,
        error: outcome.error,
        sentAt: outcome.status === "sent" ? new Date().toISOString() : null,
      })
      .then(() => outcome);

  if (!to) {
    return log({ status: "failed", to: null, subject: null, error: "Kein E-Mail-Kontakt am Lead." });
  }

  // Pflicht: vor jedem Versand gegen die Opt-out-Liste prüfen.
  if (await store.isSuppressed(ownerId, to)) {
    return log({ status: "suppressed", to, subject: null, error: "Empfänger hat sich abgemeldet (Opt-out)." });
  }

  const rendered = renderTemplate(template, lead);
  const unsubUrl = unsubscribeUrl(to, ownerId);
  const settings = await store.getSettings(ownerId);
  const senderImpressum = settings.senderImpressum ?? config.resend.impressum ?? null;
  const signature = settings.senderSignature ?? null;
  const html = buildHtml(rendered.body, unsubUrl, senderImpressum, signature);
  // Für die Text-Version HTML-Tags entfernen, damit die Signatur lesbar bleibt.
  const sigPlain = signature?.trim()
    ? signature.replace(/<br\s*\/?>(?=)/gi, "\n").replace(/<[^>]+>/g, "").replace(/[ \t]+\n/g, "\n").trim()
    : "";
  const sigText = sigPlain ? `\n\n${sigPlain}` : "";
  const text = `${rendered.body}${sigText}\n\n—\n${senderImpressum ?? ""}\nAbmelden: ${unsubUrl}`;
  const headers = {
    "List-Unsubscribe": `<${unsubUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };

  // 1) Bevorzugt: eigener SMTP-Versand des Nutzers (sendet aus SEINER Mailadresse).
  if (smtpConfigured(settings)) {
    try {
      await smtpSendRaw(settings, { to, subject: rendered.subject, html, text, headers });
      return log({ status: "sent", to, subject: rendered.subject, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return log({ status: "failed", to, subject: rendered.subject, error: message });
    }
  }

  // 2) Fallback: Plattform-Resend (falls vom Betreiber konfiguriert).
  if (!config.resend.enabled) {
    return log({
      status: "queued",
      to,
      subject: rendered.subject,
      error: "Kein Versand konfiguriert. Hinterlege deinen Absender unter Einstellungen → E-Mail-Versand.",
    });
  }

  try {
    const resend = new Resend(config.resend.apiKey!);
    const { error } = await resend.emails.send({
      from: config.resend.from!,
      to,
      subject: rendered.subject,
      html,
      text,
      headers,
    });
    if (error) {
      return log({ status: "failed", to, subject: rendered.subject, error: error.message });
    }
    return log({ status: "sent", to, subject: rendered.subject, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return log({ status: "failed", to, subject: rendered.subject, error: message });
  }
}
