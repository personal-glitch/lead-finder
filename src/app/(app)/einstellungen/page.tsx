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
          api<{ settings: { callGoal: number; senderImpressum: string; plan: string; senderName: string; senderEmail: string; smtpHost: string; smtpPort: number | null; smtpUser: string; smtpPassSet: boolean; emailReady: boolean; subscriptionStatus: string | null; subscriptionRenewsAt: string | null; cancelAtPeriodEnd: boolean }; usage: { agents: number; leads: number } }>("/api/settings"),
          api<{ stages: PipelineStage[] }>("/api/stages"),
        ]);
        setCallGoal(s.settings.callGoal);
        setImpressum(s.settings.senderImpressum);
        setPlan(s.settings.plan);
        setUsage(s.usage);
        setSenderName(s.settings.senderName);
        setSenderEmail(s.settings.senderEmail);
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
        senderName, senderEmail, smtpHost, smtpPort: Number(smtpPort) || null, smtpUser,
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
      <div className="grid max-w-3xl gap-6 p-7">
        {/* Paket */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Paket</h2>
            <Badge tone="brand">Aktuell: {planOf(plan).name}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Anruf-Ziel pro Tag" hint="Fortschritt in Sidebar & Dashboard.">
              <TextInput type="number" min={1} value={callGoal} onChange={(e) => setCallGoal(Number(e.target.value) || 0)} />
            </Field>
          </div>
          <Field label="Absender-Impressum" hint="Rechtlich Pflicht in jeder Werbe-E-Mail (steht im Footer).">
            <Textarea rows={3} value={impressum} onChange={(e) => setImpressum(e.target.value)}
              placeholder="Deine Firma GmbH · Musterstr. 1 · 50667 Köln · GF: Max Muster · HRB 12345 Amtsgericht Köln" />
          </Field>
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMTP-Server"><TextInput value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.deinanbieter.de" /></Field>
            <Field label="Port" hint="587 (STARTTLS) oder 465 (SSL)."><TextInput type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMTP-Benutzer" hint="Meist deine E-Mail-Adresse."><TextInput value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="kontakt@deinefirma.de" /></Field>
            <Field label="Passwort / App-Passwort" hint={smtpPassSet ? "Gespeichert – leer lassen = unverändert." : "Bei Gmail/GMX/Outlook: App-Passwort verwenden."}>
              <TextInput type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={smtpPassSet ? "•••••••• (gespeichert)" : "App-Passwort"} />
            </Field>
          </div>
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
