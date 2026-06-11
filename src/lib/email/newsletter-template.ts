// Gestaltete, E-Mail-sichere HTML-Newsletter (Tabellen-Layout, Inline-Styles).
// Reine Funktionen ohne Server-Abhängigkeiten -> auch für die Live-Vorschau im Client nutzbar.

export type NewsletterTemplate = "tipp" | "angebot" | "ankuendigung";

export interface NewsletterContent {
  template: NewsletterTemplate;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;   // optionales Kopfbild (oben in der Mail)
  rawHtml?: boolean;    // true = body ist fertiges HTML (Profi-Modus)
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

/** Inline-Formatierung auf bereits HTML-escaptem Text: Bild, Link, fett, kursiv. */
function inlineMd(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;margin:6px 0">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t, url) => `<a href="${url}" style="color:#2563eb;text-decoration:underline">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

/** Einfaches Markdown -> E-Mail-HTML (Absätze, Aufzählungen, Inline-Formatierung). */
function bodyToHtml(body: string): string {
  const blocks = esc(body.trim()).split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const hasBullets = lines.some((l) => /^\s*[-*]\s+/.test(l));
      const allBullets = lines.every((l) => l.trim() === "" || /^\s*[-*]\s+/.test(l));
      if (hasBullets && allBullets) {
        const items = lines
          .filter((l) => /^\s*[-*]\s+/.test(l))
          .map((l) => `<li style="margin:0 0 6px">${inlineMd(l.replace(/^\s*[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.6;color:#334155">${items}</ul>`;
      }
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155">${inlineMd(block.replace(/\n/g, "<br>"))}</p>`;
    })
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
  const hero = o.imageUrl
    ? `<tr><td style="padding:0"><img src="${esc(o.imageUrl)}" alt="" style="display:block;width:100%;height:auto"></td></tr>`
    : "";
  const bodyHtml = o.rawHtml ? o.body : bodyToHtml(o.body);

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <tr><td style="background:${a.bar};padding:14px 24px;color:${a.barText};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700">
      KundenRadar &nbsp;·&nbsp; ${a.emoji} ${esc(a.label)}
    </td></tr>
    ${hero}
    <tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0f172a">${esc(o.headline)}</h1>
      ${bodyHtml}
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
  const plainBody = o.rawHtml
    ? o.body.replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").trim()
    : o.body.trim();
  return `${o.headline}\n\n${plainBody}${cta}\n\n—\n${o.impressum}\nAbmelden: ${o.unsubscribeUrl}`;
}
