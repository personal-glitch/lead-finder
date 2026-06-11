// Gestaltete, E-Mail-sichere HTML-Newsletter (Tabellen-Layout, Inline-Styles).
// Reine Funktionen ohne Server-Abhängigkeiten -> auch für die Live-Vorschau im Client nutzbar.

export type NewsletterTemplate = "tipp" | "angebot" | "ankuendigung";

export interface NewsletterContent {
  template: NewsletterTemplate;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface RenderOptions extends NewsletterContent {
  unsubscribeUrl: string;
  impressum: string;
}

const ACCENT: Record<NewsletterTemplate, { bar: string; barText: string; label: string; emoji: string; btnBg: string; btnText: string }> = {
  tipp:         { bar: "#a8e83a", barText: "#0f172a", label: "Tipp der Woche", emoji: "💡", btnBg: "#a8e83a", btnText: "#0f172a" },
  angebot:      { bar: "#f59e0b", barText: "#ffffff", label: "Aktion",         emoji: "🔥", btnBg: "#f59e0b", btnText: "#ffffff" },
  ankuendigung: { bar: "#2563eb", barText: "#ffffff", label: "Neu",            emoji: "📣", btnBg: "#2563eb", btnText: "#ffffff" },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paragraphs(body: string): string {
  return esc(body.trim())
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155">${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export function renderNewsletterHtml(o: RenderOptions): string {
  const a = ACCENT[o.template] ?? ACCENT.tipp;
  const cta =
    o.ctaUrl && o.ctaLabel
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">
           <tr><td style="border-radius:10px;background:${a.btnBg}">
             <a href="${esc(o.ctaUrl)}" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:700;color:${a.btnText};text-decoration:none;border-radius:10px">${esc(o.ctaLabel)}</a>
           </td></tr>
         </table>`
      : "";

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <tr><td style="background:${a.bar};padding:14px 24px;color:${a.barText};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700">
      KundenRadar &nbsp;·&nbsp; ${a.emoji} ${esc(a.label)}
    </td></tr>
    <tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">${esc(o.headline)}</h1>
      ${paragraphs(o.body)}
      ${cta}
    </td></tr>
    <tr><td style="padding:20px 28px 26px;font-family:Arial,Helvetica,sans-serif">
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 14px">
      <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8">${esc(o.impressum)}</p>
      <p style="margin:0;font-size:12px;color:#94a3b8">Du möchtest keine E-Mails mehr? <a href="${esc(o.unsubscribeUrl)}" style="color:#94a3b8">Hier abmelden</a>.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

export function renderNewsletterText(o: RenderOptions): string {
  const cta = o.ctaUrl && o.ctaLabel ? `\n\n${o.ctaLabel}: ${o.ctaUrl}` : "";
  return `${o.headline}\n\n${o.body.trim()}${cta}\n\n—\n${o.impressum}\nAbmelden: ${o.unsubscribeUrl}`;
}
