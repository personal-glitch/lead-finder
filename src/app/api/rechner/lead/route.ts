import { z } from "zod";
import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";
import { subscribeNewsletter, isValidEmail } from "@/lib/newsletter";

const Body = z.object({
  email: z.string(),
  consent: z.boolean(),
  website: z.string().optional(), // Honeypot
  modus: z.string().optional(),
  headlineLabel: z.string().max(120).optional(),
  headlineValue: z.string().max(60).optional(),
  sub: z.string().max(200).optional(),
  breakdown: z.array(z.object({ label: z.string().max(120), value: z.string().max(60) })).max(20).optional(),
});

const IMPRESSUM = "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";

function resultEmail(b: z.infer<typeof Body>): { subject: string; html: string; text: string } {
  const rows = (b.breakdown ?? [])
    .map((x) => `<tr><td style="padding:6px 0;color:#5b6470">${x.label}</td><td style="padding:6px 0;text-align:right;font-weight:600">${x.value}</td></tr>`)
    .join("");
  const rowsText = (b.breakdown ?? []).map((x) => `- ${x.label}: ${x.value}`).join("\n");
  const head = `${b.headlineLabel ?? "Ergebnis"}: ${b.headlineValue ?? ""}`;
  const url = config.appUrl;
  const subject = "Dein Kalkulations-Ergebnis 📊 – KundenRadar";
  const html = `<!doctype html><html lang="de"><body style="font-family:system-ui,Arial,sans-serif;color:#16181d;line-height:1.6;max-width:580px;margin:0 auto;padding:8px">
<p style="font-size:16px">Hallo,</p>
<p>danke, dass du den KundenRadar-Rechner genutzt hast! Du hast den ersten und wichtigsten Schritt schon gemacht: Du kennst jetzt deinen Preis – auf Basis aktueller Richtwerte (Tariflohn 2026, RAL-Flächenleistungen, marktübliche Sätze). Die meisten Dienstleister kalkulieren aus dem Bauch heraus und lassen damit jeden Monat bares Geld liegen. Du nicht.</p>

<p style="margin-bottom:6px"><b>Dein Ergebnis im Überblick:</b></p>
<div style="background:#f4f6f8;border-radius:12px;padding:16px;margin:6px 0 14px">
  <div style="font-size:12px;color:#5b6470">${b.headlineLabel ?? "Ergebnis"}</div>
  <div style="font-size:28px;font-weight:700;color:#16181d">${b.headlineValue ?? ""}</div>
  ${b.sub ? `<div style="font-size:13px;color:#5b6470;margin-top:2px">${b.sub}</div>` : ""}
  ${rows ? `<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:14px">${rows}</table>` : ""}
</div>
<p style="font-size:12px;color:#5b6470">Richtwerte – ersetzt keine individuelle Kalkulation, ohne Gewähr.</p>

<h3 style="font-size:15px;margin:22px 0 6px">So holst du aus dem Preis das Maximum heraus</h3>
<ul style="padding-left:18px;margin:0">
  <li style="margin-bottom:6px"><b>Nenne den oberen Wert zuerst.</b> Verhandelt wird fast immer – wer hoch startet, landet am Ende beim fairen Preis statt darunter.</li>
  <li style="margin-bottom:6px"><b>Verkaufe das Ergebnis, nicht die Stunden.</b> Sauberkeit, Termintreue, ein fester Ansprechpartner – das rechtfertigt deinen Satz.</li>
  <li style="margin-bottom:6px"><b>Rechne Anfahrt &amp; Material immer extra.</b> Sonst zahlst du bei jedem Auftrag drauf, ohne es zu merken.</li>
  <li style="margin-bottom:6px"><b>Schick dein Angebot noch am selben Tag.</b> Wer zuerst und professionell anbietet, gewinnt den Auftrag – nicht der Billigste.</li>
</ul>

<div style="background:#eafad1;border:1px solid #cdeb9a;border-radius:12px;padding:16px;margin:22px 0">
  <div style="font-weight:700;font-size:15px">📄 Angebot in 2 Minuten – als fertiges PDF mit deinem Logo</div>
  <p style="margin:8px 0 0">Genau diese Kalkulation kannst du in <b>KundenRadar</b> direkt in ein professionelles <b>Angebots-PDF</b> verwandeln – mit <b>deinem Firmenlogo</b>, deinen Daten, deinen Positionen und Preisen, sauber formatiert und sofort versandfertig. Kein Word-Gefummel, keine Vorlagen-Bastelei: Werte eintragen, fertig, raus an den Kunden. So wirkst du vom ersten Kontakt an wie ein Profi.</p>
</div>

<p><b>Und der nächste Schritt?</b> Den passenden Kunden dazu finden. Mit KundenRadar bekommst du <b>anrufbare Firmen mit Telefon &amp; Ansprechpartner</b> in deiner Region – plus Pipeline, Anruf-Verwaltung und E-Mail in einem Tool. Kalkulieren, anbieten, abschließen – alles an einem Ort.</p>

<p style="margin:22px 0"><a href="${url}/registrieren" style="display:inline-block;background:#a8e83a;color:#16181d;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:700">KundenRadar 3 Tage gratis testen →</a></p>
<p style="font-size:13px;color:#5b6470;margin-top:-8px">3 Tage gratis · keine Vorkasse · jederzeit kündbar</p>

<hr style="border:none;border-top:1px solid #e3e7ec;margin:22px 0">
<p style="font-size:13px;color:#5b6470">Übrigens: Hast du dich für unseren Newsletter angemeldet, bekommst du nach der Bestätigung noch unsere <b>3 Gratis-Akquise-Tools</b> obendrauf – Vorlagen-Paket, Kaltakquise-Leitfaden und Akquise-Tracker.</p>

<p style="margin-top:22px">Beste Grüße<br><b>Team von Seciora Solutions</b></p>
<hr style="border:none;border-top:1px solid #e3e7ec;margin:22px 0">
<p style="font-size:12px;color:#5b6470">${IMPRESSUM}</p>
</body></html>`;
  const text =
    `Hallo,\n\n` +
    `danke, dass du den KundenRadar-Rechner genutzt hast! Du kennst jetzt deinen Preis – auf Basis aktueller Richtwerte (Tariflohn 2026, RAL-Flächenleistungen, marktübliche Sätze). Die meisten Dienstleister kalkulieren aus dem Bauch und lassen jeden Monat Geld liegen. Du nicht.\n\n` +
    `DEIN ERGEBNIS:\n${head}\n${b.sub ?? ""}\n${rowsText ? "\n" + rowsText + "\n" : ""}\n` +
    `Richtwerte – ersetzt keine individuelle Kalkulation, ohne Gewähr.\n\n` +
    `SO HOLST DU DAS MAXIMUM HERAUS:\n` +
    `- Nenne den oberen Wert zuerst – verhandelt wird fast immer.\n` +
    `- Verkaufe das Ergebnis, nicht die Stunden (Sauberkeit, Termintreue, fester Ansprechpartner).\n` +
    `- Rechne Anfahrt & Material immer extra.\n` +
    `- Schick dein Angebot noch am selben Tag – wer zuerst professionell anbietet, gewinnt.\n\n` +
    `ANGEBOT IN 2 MINUTEN – ALS PDF MIT DEINEM LOGO:\n` +
    `In KundenRadar verwandelst du diese Kalkulation direkt in ein professionelles Angebots-PDF – mit deinem Firmenlogo, deinen Positionen und Preisen, sofort versandfertig. Kein Word-Gefummel.\n\n` +
    `Der nächste Schritt: den passenden Kunden dazu finden. KundenRadar liefert anrufbare Firmen mit Telefon & Ansprechpartner – plus Pipeline, Anrufe & E-Mail in einem Tool.\n\n` +
    `KundenRadar 3 Tage gratis testen (keine Vorkasse, jederzeit kündbar):\n${url}/registrieren\n\n` +
    `Übrigens: Nach der Newsletter-Bestätigung bekommst du unsere 3 Gratis-Akquise-Tools obendrauf.\n\n` +
    `Beste Grüße\nTeam von Seciora Solutions\n\n—\n${IMPRESSUM}`;
  return { subject, html, text };
}

export async function POST(req: NextRequest) {
  try {
    const b = Body.parse(await req.json());
    if (b.website) return jsonOk({ ok: true }); // Bot
    if (!b.consent) throw new AppError("bad_request", "Bitte stimme der Verarbeitung zu.");
    if (!isValidEmail(b.email)) throw new AppError("bad_request", "Bitte gib eine gültige E-Mail-Adresse an.");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    // 1) Ergebnis sofort per Mail (transaktional – vom Nutzer angefordert).
    const { subject, html, text } = resultEmail(b);
    await sendSystemEmail({ to: b.email.trim(), subject, html, text });

    // 2) In den Newsletter-Verteiler (Double-Opt-In – Einwilligung per Checkbox).
    await subscribeNewsletter({ email: b.email, ip, source: `rechner-${b.modus ?? "ergebnis"}` }).catch(() => {});

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
