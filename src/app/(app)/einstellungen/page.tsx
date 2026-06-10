"use client";
import { useEffect, useState } from "react";
import type { PipelineStage } from "@/lib/types";
import { api } from "@/lib/client";
import { PageHeader, useFlags, refreshStats } from "@/components/shell/AppShell";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, cx, Field, IconButton, Spinner, TextInput, Textarea, Toast } from "@/components/ui";
import { PLANS, planOf, TRIAL_DAYS } from "@/lib/plans";

// Häufige Anbieter – Auswahl füllt Server & Port automatisch.
const SMTP_PRESETS: Record<string, { host: string; port: number }> = {
  Gmail: { host: "smtp.gmail.com", port: 587 },
  GMX: { host: "mail.gmx.net", port: 587 },
  "Web.de": { host: "smtp.web.de", port: 587 },
  "Outlook / Microsoft 365": { host: "smtp.office365.com", port: 587 },
  IONOS: { host: "smtp.ionos.de", port: 587 },
  Strato: { host: "smtp.strato.de", port: 587 },
};

// Schicke, e-mail-sichere HTML-Signatur (ohne Bilder, mit Marken-Akzent). Platzhalter danach anpassen.
function profiSignatur(name: string, email: string): string {
  const n = name?.trim() || "Dein Name";
  const e = email?.trim() || "name@deinefirma.de";
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.55"><tr><td style="border-left:3px solid #a8e83a;padding:2px 0 2px 14px">
<div style="font-size:16px;font-weight:bold;color:#0f172a">${n}</div>
<div style="color:#6b7280">Deine Firma · Deine Rolle</div>
<div style="margin-top:8px">Tel.: <a href="tel:+490000000000" style="color:#1f2937;text-decoration:none">+49 000 0000000</a></div>
<div><a href="mailto:${e}" style="color:#1f2937;text-decoration:none">${e}</a> &nbsp;·&nbsp; <a href="https://deinefirma.de" style="color:#0f766e;text-decoration:none;font-weight:600">deinefirma.de</a></div>
</td></tr></table>`;
}

export default function EinstellungenPage() {
  const flags = useFlags();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [callGoal, setCallGoal] = useState(60);
  const [impressum, setImpressum] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [newStage, setNewStage] = useState("");

  const [plan, setPlan] = useState("pro");
  const [usage, setUsage] = useState<{ agents: number; leads: number }>({ agents: 0, leads: 0 });

  // E-Mail-Versand (eigener SMTP-Zugang)
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpPassSet, setSmtpPassSet] = useState(false);
  const [emailReady, setEmailReady] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [testing, setTesting] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [renewsAt, setRenewsAt] = useState<string | null>(null);
  const [cancelAtEnd, setCancelAtEnd] = useState(false);
  const [billing, setBilling] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, st] = await Promise.all([
          api<{ settings: { callGoal: number; senderImpressum: string; senderSignature: string; plan: string; senderName: string; senderEmail: string; smtpHost: string; smtpPort: number | null; smtpUser: string; smtpPassSet: boolean; emailReady: boolean; subscriptionStatus: string | null; subscriptionRenewsAt: string | null; cancelAtPeriodEnd: boolean }; usage: { agents: number; leads: number } }>("/api/settings"),
          api<{ stages: PipelineStage[] }>("/api/stages"),
        ]);
        setCallGoal(s.settings.callGoal);
        setImpressum(s.settings.senderImpressum);
        setPlan(s.settings.plan);
        setUsage(s.usage);
        setSenderName(s.settings.senderName);
        setSenderEmail(s.settings.senderEmail);
        setSignature(s.settings.senderSignature);
        setSmtpHost(s.settings.smtpHost);
        setSmtpPort(s.settings.smtpPort ? String(s.settings.smtpPort) : "587");
        setSmtpUser(s.settings.smtpUser);
        setSmtpPassSet(s.settings.smtpPassSet);
        setEmailReady(s.settings.emailReady);
        setSubStatus(s.settings.subscriptionStatus);
        setRenewsAt(s.settings.subscriptionRenewsAt);
        setCancelAtEnd(s.settings.cancelAtPeriodEnd);
        setStages(st.stages);
      } finally { setLoading(false); }
    })();
  }, []);

  // Rückmeldung nach Stripe-Checkout (?abo=ok|abbruch).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("abo");
    if (p === "ok") setToast("Danke! Dein Abo ist aktiv. 🎉");
    else if (p === "abbruch") setToast("Checkout abgebrochen.");
  }, []);

  const subscribe = async () => {
    setBilling(true);
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { method: "POST" });
      window.location.href = url;
    } catch (e) { setToast(e instanceof Error ? e.message : "Checkout fehlgeschlagen."); setBilling(false); }
  };

  const manageBilling = async () => {
    setPortalBusy(true);
    try {
      const { url } = await api<{ url: string }>("/api/billing/portal", { method: "POST" });
      window.location.href = url;
    } catch (e) { setToast(e instanceof Error ? e.message : "Portal nicht verfügbar."); setPortalBusy(false); }
  };

  const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–";
  const subscribed = ["active", "trialing"].includes(subStatus ?? "");

  const applyPreset = (name: string) => {
    const p = SMTP_PRESETS[name];
    if (p) { setSmtpHost(p.host); setSmtpPort(String(p.port)); }
  };

  const saveEmail = async () => {
    setSavingEmail(true);
    try {
      const json: Record<string, unknown> = {
        senderName, senderEmail, senderSignature: signature, smtpHost, smtpPort: Number(smtpPort) || null, smtpUser,
      };
      if (smtpPass.trim()) json.smtpPass = smtpPass.trim();
      const r = await api<{ settings: { emailReady: boolean; smtpPassSet: boolean } }>("/api/settings", { method: "PATCH", json });
      setEmailReady(r.settings.emailReady);
      setSmtpPassSet(r.settings.smtpPassSet);
      setSmtpPass("");
      setToast("E-Mail-Einstellungen gespeichert.");
    } catch (e) { setToast(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setSavingEmail(false); }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const r = await api<{ ok: boolean; to?: string; error?: string }>("/api/email/test", { method: "POST" });
      setToast(r.ok ? `Test-E-Mail an ${r.to} gesendet ✅` : (r.error || "Test fehlgeschlagen."));
    } catch (e) { setToast(e instanceof Error ? e.message : "Test fehlgeschlagen."); }
    finally { setTesting(false); }
  };

  const switchPlan = async (p: string) => {
    setPlan(p);
    try {
      await api("/api/settings", { method: "PATCH", json: { plan: p } });
      refreshStats();
      setToast(`Paket „${planOf(p).name}" aktiv.`);
    } catch (e) { setToast(e instanceof Error ? e.message : "Wechsel fehlgeschlagen."); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api("/api/settings", { method: "PATCH", json: { callGoal, senderImpressum: impressum } });
      refreshStats(); setToast("Einstellungen gespeichert.");
    } catch (e) { setToast(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setSavingSettings(false); }
  };

  // ── Stages ──
  const addStage = async () => {
    if (!newStage.trim()) return;
    const { stage } = await api<{ stage: PipelineStage }>("/api/stages", { json: { name: newStage.trim() } });
    setStages((p) => [...p, stage]); setNewStage("");
  };
  const renameStage = async (id: string, name: string) => {
    setStages((p) => p.map((s) => (s.id === id ? { ...s, name } : s)));
    await api(`/api/stages/${id}`, { method: "PATCH", json: { name } });
  };
  const deleteStage = async (id: string) => {
    if (!confirm("Stage löschen? Leads darin verlieren ihre Stage.")) return;
    setStages((p) => p.filter((s) => s.id !== id));
    await api(`/api/stages/${id}`, { method: "DELETE" });
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= stages.length) return;
    const arr = [...stages];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setStages(arr);
    await api("/api/stages", { method: "PUT", json: { orderedIds: arr.map((s) => s.id) } });
  };

  if (loading) return (<><PageHeader title="Einstellungen" /><div className="flex items-center gap-2 p-7 text-[var(--color-muted)]"><Spinner /> Lädt …</div></>);

  return (
    <>
      <PageHeader title="Einstellungen" subtitle="Ziele, Pipeline & Versand" />
      <div className="grid max-w-3xl gap-6 p-4 sm:p-7">
        {/* Paket */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Paket</h2>
            <Badge tone="brand">Aktuell: {planOf(plan).name}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Usage label="Agenten" used={usage.agents} max={planOf(plan).maxAgents} />
            <Usage label="Kontakte" used={usage.leads} max={planOf(plan).maxLeads} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map((p) => (
              <button key={p.key} onClick={() => switchPlan(p.key)}
                className={cx("rounded-lg border px-3 py-2 text-left transition-colors",
                  plan === p.key ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)]" : "border-[var(--color-line-strong)] hover:bg-[var(--color-subtle)]")}>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-[var(--color-muted)] tnum">{p.price}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted)]">Ein Paket, alles drin: <strong className="text-[var(--color-ink-2)]">unbegrenzte Agenten & Kontakte</strong>. Du bist im Tool nicht limitiert; die Abrechnung folgt separat.</p>
          {flags.stripe && (
            <div className="space-y-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Abo & Abrechnung</div>
                {subscribed
                  ? <Badge tone={subStatus === "trialing" ? "brand" : "green"}>{subStatus === "trialing" ? "Test läuft" : "aktiv"}</Badge>
                  : <Badge tone="amber">kein Abo</Badge>}
              </div>
              {subscribed && (
                <div className="text-xs text-[var(--color-muted)]">
                  {cancelAtEnd
                    ? <>Gekündigt – Zugang bis <span className="font-medium text-[var(--color-ink-2)]">{fmtDate(renewsAt)}</span>.</>
                    : <>Nächste Zahlung am <span className="font-medium text-[var(--color-ink-2)]">{fmtDate(renewsAt)}</span> · 49 € · monatlich kündbar.</>}
                </div>
              )}
              <div className="flex justify-end">
                {subscribed
                  ? <Button variant="ghost" onClick={manageBilling} disabled={portalBusy}>{portalBusy ? <><Spinner size={14} /> …</> : "Abo verwalten / kündigen"}</Button>
                  : <Button onClick={subscribe} disabled={billing}>{billing ? <><Spinner size={14} /> …</> : `${TRIAL_DAYS} Tage gratis starten`}</Button>}
              </div>
            </div>
          )}
        </Card>

        {/* Ziele & Versand */}
        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Ziele & Versand</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Anruf-Ziel pro Tag" hint="Fortschritt in Sidebar & Dashboard.">
              <TextInput type="number" min={1} value={callGoal} onChange={(e) => setCallGoal(Number(e.target.value) || 0)} />
            </Field>
          </div>
          <Field label="Absender-Impressum" required hint="Pflicht – ohne Impressum kannst du keine E-Mails versenden. Es wird automatisch in den Footer jeder Mail gesetzt.">
            <Textarea rows={3} value={impressum} onChange={(e) => setImpressum(e.target.value)}
              placeholder="Deine Firma GmbH · Musterstr. 1 · 50667 Köln · GF: Max Muster · HRB 12345 Amtsgericht Köln" />
          </Field>
          {!impressum.trim() && (
            <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              ⚠️ Noch kein Impressum hinterlegt – <b>der E-Mail-Versand ist blockiert</b>, bis du es einträgst und speicherst.
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={savingSettings}>{savingSettings ? <><Spinner size={14} /> …</> : "Speichern"}</Button>
          </div>
        </Card>

        {/* E-Mail-Versand (eigener SMTP-Zugang) */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">E-Mail-Versand</h2>
            {emailReady ? <Badge tone="green">aktiv</Badge> : <Badge tone="amber">nicht eingerichtet</Badge>}
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Hinterlege deine eigene Mailadresse – dann verschickst du Angebote direkt aus dem Tool, aus deinem Postfach.
            Das Passwort wird verschlüsselt gespeichert.
          </p>

          {/* Schritt-für-Schritt-Anleitung – damit jeder Nutzer es selbst sicher einrichtet. */}
          <details className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] open:pb-3">
            <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-[var(--color-ink)]">
              📩 So richtest du den Versand in 2 Minuten ein (Schritt für Schritt)
            </summary>
            <div className="space-y-3 px-3 text-xs text-[var(--color-muted)]">
              <ol className="list-decimal space-y-1 pl-4">
                <li><b>Absender-Name</b> = dein Name oder Firma · <b>Absender-E-Mail</b> = deine Postfach-Adresse.</li>
                <li><b>Anbieter</b> im Dropdown wählen → Server &amp; Port werden automatisch gesetzt.</li>
                <li><b>SMTP-Benutzer</b> = deine <b>komplette</b> E-Mail-Adresse (z. B. kontakt@deinefirma.de).</li>
                <li><b>Passwort</b> = dein Postfach-Passwort. <b>Bei Gmail, GMX, Web.de, Outlook</b> brauchst du ein <b>App-Passwort</b> (nicht das normale Login-Passwort!).</li>
                <li><b>Speichern</b> → <b>Test-E-Mail</b> klicken. Kommt sie an, läuft alles.</li>
              </ol>
              <div className="rounded-md border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)] px-3 py-2 text-[var(--color-ink)]">
                <b>Zwei goldene Regeln:</b> 1) <b>Absender-E-Mail</b> und <b>SMTP-Benutzer</b> müssen <b>identisch</b> sein. 2) Du kannst nur unter der Adresse senden, mit der du dich anmeldest – sonst lehnt der Anbieter ab.
              </div>
              <table className="w-full text-left">
                <thead className="text-[var(--color-faint)]"><tr><th className="py-1 pr-2 font-medium">Anbieter</th><th className="py-1 pr-2 font-medium">SMTP-Server</th><th className="py-1 font-medium">Port</th></tr></thead>
                <tbody className="tnum">
                  <tr><td className="py-0.5 pr-2">IONOS</td><td className="pr-2">smtp.ionos.de</td><td>587</td></tr>
                  <tr><td className="py-0.5 pr-2">Gmail (App-Passwort)</td><td className="pr-2">smtp.gmail.com</td><td>587</td></tr>
                  <tr><td className="py-0.5 pr-2">Outlook / M365</td><td className="pr-2">smtp.office365.com</td><td>587</td></tr>
                  <tr><td className="py-0.5 pr-2">GMX</td><td className="pr-2">mail.gmx.net</td><td>587</td></tr>
                  <tr><td className="py-0.5 pr-2">Web.de</td><td className="pr-2">smtp.web.de</td><td>587</td></tr>
                  <tr><td className="py-0.5 pr-2">Strato</td><td className="pr-2">smtp.strato.de</td><td>587</td></tr>
                </tbody>
              </table>
            </div>
          </details>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Absender-Name"><TextInput value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Max Mustermann" /></Field>
            <Field label="Absender-E-Mail"><TextInput type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="kontakt@deinefirma.de" /></Field>
          </div>
          <Field label="E-Mail-Anbieter" hint="Auswahl füllt Server & Port automatisch.">
            <select
              onChange={(e) => applyPreset(e.target.value)}
              defaultValue=""
              className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">– Anbieter wählen (oder manuell) –</option>
              {Object.keys(SMTP_PRESETS).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="SMTP-Server"><TextInput value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.deinanbieter.de" /></Field>
            <Field label="Port" hint="587 (STARTTLS) oder 465 (SSL)."><TextInput type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="SMTP-Benutzer" hint="Meist deine E-Mail-Adresse."><TextInput value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="kontakt@deinefirma.de" /></Field>
            <Field label="Passwort / App-Passwort" hint={smtpPassSet ? "Gespeichert – leer lassen = unverändert." : "Bei Gmail/GMX/Outlook: App-Passwort verwenden."}>
              <TextInput type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={smtpPassSet ? "•••••••• (gespeichert)" : "App-Passwort"} />
            </Field>
          </div>
          <Field label="E-Mail-Signatur" hint="Steht automatisch unter jeder Mail – über dem Pflicht-Footer. Reiner Text ODER HTML (Profi-Signatur).">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={() => setSignature(profiSignatur(senderName, senderEmail))}>
                <Icon name="plus" size={14} /> Profi-Signatur einfügen
              </Button>
              <span className="text-xs text-[var(--color-muted)]">Fügt eine schicke HTML-Signatur ein – danach Name, Firma, Telefon & Web anpassen.</span>
            </div>
            <Textarea rows={7} value={signature} onChange={(e) => setSignature(e.target.value)}
              placeholder={"Mit freundlichen Grüßen\nMax Mustermann\n\nMuster GmbH\nMusterstr. 1 · 50667 Köln\nTel.: 0221 1234567\nweb: musterfirma.de"} />
          </Field>

          {/* Compliance-Hinweis: Kaltakquise per E-Mail (§ 7 UWG). */}
          <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <b>⚖️ Bitte beachten – Werbe-E-Mails an Firmen (§ 7 UWG):</b> Unaufgeforderte Werbung per E-Mail ist auch im
            B2B nur zulässig, wenn ein <b>mutmaßliches Interesse</b> des Empfängers an genau deinem Angebot besteht
            (sachlicher Bezug zu seinem Geschäft) – oder eine Einwilligung vorliegt. Versende gezielt &amp; relevant,
            nie in Masse „auf Verdacht". Pflicht in jeder Mail: <b>Impressum</b> und ein funktionierender
            <b> Abmeldelink</b> (setzt das Tool automatisch). Abmeldungen werden dauerhaft gesperrt.
          </div>

          {/* Zustellbarkeit – damit Mails nicht im Spam landen. */}
          <details className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] open:pb-3">
            <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-[var(--color-ink)]">
              📬 So landest du nicht im Spam (wichtig vor dem ersten Versand)
            </summary>
            <div className="space-y-2 px-3 text-xs text-[var(--color-muted)]">
              <ul className="list-disc space-y-1 pl-4">
                <li><b>Aus eigener Domain senden</b> (z. B. name@deinefirma.de), nicht als Absender über Gmail/GMX/Web.de – das wirkt seriöser und kommt besser an.</li>
                <li><b>SPF, DKIM & DMARC</b> einrichten – das beweist, dass die Mail wirklich von dir kommt. Bei IONOS, Strato &amp; Co. sind diese Einträge meist <b>automatisch</b> gesetzt; bei eigener Domain einmal beim Anbieter aktivieren.</li>
                <li><b>Langsam starten (Warm-up):</b> erst 5–10 Mails/Tag, dann über Wochen steigern. Nicht sofort 50 am ersten Tag.</li>
                <li><b>Personalisieren</b> (Platzhalter nutzen) statt identischer Massenmail – persönliche Mails landen seltener im Spam.</li>
                <li><b>Spam-Wörter vermeiden:</b> kein „GRATIS!!!", keine VIELEN AUSRUFEZEICHEN, kein reiner Großbuchstaben-Betreff, keine $$$.</li>
                <li><b>Kurz &amp; sauber:</b> wenig Links, keine großen Bilder/Anhänge, klarer Text.</li>
                <li><b>Impressum &amp; Abmeldelink</b> – setzt das Tool automatisch unter jede Mail (Pflicht &amp; gut für die Zustellbarkeit).</li>
                <li><b>Tageslimit beachten:</b> das Tool drosselt auf max. 50 Mails/Tag – bewusst niedrig, um deine Adresse zu schützen.</li>
              </ul>
              <div className="rounded-md border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)] px-3 py-2 text-[var(--color-ink)]">
                <b>Tipp:</b> Schick dir zuerst eine Testmail an ein Gmail-/Outlook-Konto und prüfe, ob sie im Posteingang (nicht im Spam) landet.
              </div>
            </div>
          </details>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={sendTest} disabled={testing || !emailReady}>
              {testing ? <><Spinner size={14} /> …</> : <><Icon name="mail" size={15} /> Test-E-Mail</>}
            </Button>
            <Button onClick={saveEmail} disabled={savingEmail}>{savingEmail ? <><Spinner size={14} /> …</> : "Speichern"}</Button>
          </div>
        </Card>

        {/* Pipeline-Stages */}
        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">Pipeline-Stages</h2>
          <p className="text-xs text-[var(--color-muted)]">Reihenfolge bestimmt den Vertriebsfluss. Anrufe verschieben Leads automatisch vorwärts.</p>
          <div className="divide-y divide-[var(--color-line)] rounded-lg border border-[var(--color-line)]">
            {stages.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2">
                <span className="w-5 text-center text-xs text-[var(--color-faint)] tnum">{i + 1}</span>
                <TextInput value={s.name} onChange={(e) => setStages((p) => p.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                  onBlur={(e) => renameStage(s.id, e.target.value.trim() || s.name)} className="h-8 flex-1 py-0" />
                <IconButton icon="chevronLeft" label="Hoch" className="rotate-90" onClick={() => move(i, -1)} />
                <IconButton icon="chevronRight" label="Runter" className="rotate-90" onClick={() => move(i, 1)} />
                <IconButton icon="trash" label="Löschen" onClick={() => deleteStage(s.id)} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput value={newStage} onChange={(e) => setNewStage(e.target.value)} placeholder="Neue Stage …"
              onKeyDown={(e) => e.key === "Enter" && addStage()} className="flex-1" />
            <Button variant="ghost" onClick={addStage} disabled={!newStage.trim()}><Icon name="plus" size={15} /> Hinzufügen</Button>
          </div>
        </Card>

        {/* Dienste (read-only) */}
        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">Datenquelle & Dienste</h2>
          <div className="space-y-2 text-sm">
            <Row label="Lead-Daten">Live-Recherche <Badge tone="green">aktiv</Badge></Row>
            <Row label="Speicher">{flags.supabase ? <>Supabase <Badge tone="green">verbunden</Badge></> : <>Lokaler Datei-Store <Badge tone="amber">Dev</Badge></>}</Row>
            <Row label="E-Mail-Versand">{emailReady ? <>Eigener SMTP <Badge tone="green">aktiv</Badge></> : flags.resend ? <>Plattform <Badge tone="green">aktiv</Badge></> : <>Noch nicht eingerichtet <Badge tone="amber">offen</Badge></>}</Row>
          </div>
          <p className="text-xs text-[var(--color-muted)]">Supabase/Resend über Umgebungsvariablen (.env.local) aktivieren. Opt-out-Liste unter „Vorlagen".</p>
        </Card>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-2 last:border-0 last:pb-0">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="flex items-center gap-1.5">{children}</span>
    </div>
  );
}

function Usage({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-muted)]">{label}</span>
        <span className="tnum">{used} / {max >= 9999 ? "∞" : max}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-subtle)]">
        <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
