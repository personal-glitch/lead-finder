"use client";
import { useEffect, useState } from "react";
import type { Activity, ActivityType, EmailTemplate, Lead } from "@/lib/types";
import { hostFromUrl } from "@/lib/dedupe";
import { api } from "@/lib/client";
import { refreshStats } from "./shell/AppShell";
import { Icon, type IconName } from "./icons";
import { Badge, Button, Drawer, Field, Select, Spinner, TextInput, Textarea, cx } from "./ui";
import { ConfirmDialog } from "./ConfirmDialog";
import { LeadContactWays } from "./LeadContactWays";
import { WebsiteAudit } from "./WebsiteAudit";
import { LeadJobs } from "./LeadJobs";
import { usePersona } from "./use-persona";

const ACT_ICON: Record<ActivityType, IconName> = {
  created: "plus",
  enriched: "search",
  stage_changed: "pipeline",
  call: "phone",
  email: "mail",
  task: "tasks",
  note: "pencil",
};

const OUTCOMES: { key: string; label: string }[] = [
  { key: "erreicht", label: "Erreicht" },
  { key: "nicht_erreicht", label: "Nicht erreicht" },
  { key: "termin", label: "Termin vereinbart" },
  { key: "rueckruf", label: "Rückruf" },
  { key: "kein_bedarf", label: "Kein Bedarf" },
];

function fmt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const STATUS_OPTS: { key: Lead["status"]; label: string; tone: string }[] = [
  { key: "offen", label: "Offen", tone: "var(--color-muted)" },
  { key: "gewonnen", label: "Gewonnen", tone: "var(--color-success)" },
  { key: "verloren", label: "Verloren", tone: "var(--color-danger)" },
];

// Superadmin-Status nur einmal pro Session laden (für den Mailliste-Einladen-Button).
let _adminCache: boolean | null = null;

function EditableField({ label, value, onSave, placeholder }: {
  label: string; value: string | null; onSave: (v: string | null) => void; placeholder?: string;
}) {
  const [val, setVal] = useState(value ?? "");
  useEffect(() => setVal(value ?? ""), [value]);
  return (
    <Field label={label}>
      <TextInput value={val} placeholder={placeholder} onChange={(e) => setVal(e.target.value)}
        onBlur={() => { const next = val.trim() || null; if (next !== (value ?? null)) onSave(next); }} />
    </Field>
  );
}

export function LeadDetailDrawer({
  lead, open, onClose, templates, resendEnabled, onUpdate, onEnrich, onDelete, onLeadChanged,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  templates: EmailTemplate[];
  resendEnabled: boolean;
  onUpdate: (id: string, patch: Partial<Lead>) => void;
  onEnrich: (lead: Lead) => Promise<void>;
  onDelete: (lead: Lead) => void;
  onLeadChanged?: (lead: Lead) => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [panel, setPanel] = useState<"call" | "email" | "task" | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [callNote, setCallNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [valInput, setValInput] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(_adminCache ?? false);
  const [inviting, setInviting] = useState(false);
  const { persona } = usePersona();

  useEffect(() => {
    if (_adminCache !== null) { setIsAdmin(_adminCache); return; }
    api<{ isAdmin: boolean }>("/api/admin/me")
      .then((r) => { _adminCache = r.isAdmin; setIsAdmin(r.isAdmin); })
      .catch(() => {});
  }, []);

  const inviteToList = async () => {
    if (!lead) return;
    setInviting(true); setMsg(null);
    try {
      const { state } = await api<{ state: string }>("/api/admin/leads/invite-newsletter", { json: { leadId: lead.id } });
      setMsg(state === "already_confirmed"
        ? `${lead.email} steht bereits bestätigt in der Mailliste.`
        : `Einladung an ${lead.email} gesendet – wird nach Bestätigung aufgenommen.`);
      await loadActivities(lead.id);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Einladung fehlgeschlagen."); }
    finally { setInviting(false); }
  };

  const loadActivities = async (leadId: string) => {
    try {
      const { activities } = await api<{ activities: Activity[] }>(`/api/activities?leadId=${leadId}`);
      setActivities(activities);
    } catch { setActivities([]); }
  };

  useEffect(() => {
    if (open && lead) {
      setPanel(null); setMsg(null); setCallNote("");
      setValInput(lead.value != null ? String(lead.value) : "");
      setTaskTitle(`Wiedervorlage: ${lead.name ?? "Lead"}`);
      setTemplateId(templates[0]?.id ?? "");
      loadActivities(lead.id);
    }
  }, [open, lead, templates]);

  if (!lead) return null;
  const host = hostFromUrl(lead.website);

  const logCall = async (outcome: string) => {
    setBusy(true); setMsg(null);
    try {
      const { lead: updated, movedTo, task } = await api<{ lead: Lead; movedTo: string | null; task: { id: string } | null }>(
        "/api/calls", { json: { leadId: lead.id, outcome, note: callNote.trim() || null } });
      onLeadChanged?.(updated);
      refreshStats();
      await loadActivities(lead.id);
      setCallNote(""); setPanel(null);
      setMsg(`Anruf gespeichert${movedTo ? ` · verschoben nach „${movedTo}"` : ""}${task ? " · Folge-Aufgabe angelegt" : ""}.`);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setBusy(false); }
  };

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    setBusy(true);
    try {
      await api("/api/tasks", { json: { leadId: lead.id, title: taskTitle.trim(), type: "todo", dueAt: new Date(Date.now() + 3 * 86_400_000).toISOString() } });
      refreshStats(); await loadActivities(lead.id); setPanel(null);
      setMsg("Aufgabe angelegt (in 3 Tagen fällig).");
    } catch (e) { setMsg(e instanceof Error ? e.message : "Fehlgeschlagen."); }
    finally { setBusy(false); }
  };

  const send = async () => {
    if (!templateId) return;
    if (!emailConsent) { setMsg("Bitte zuerst bestätigen, dass eine Einwilligung/Anfrage vorliegt."); return; }
    setBusy(true); setMsg(null);
    try {
      const { results } = await api<{ results: Array<{ status: string; error: string | null }> }>(
        "/api/email/send", { json: { leadIds: [lead.id], templateId } });
      const r = results[0];
      const labels: Record<string, string> = {
        sent: "E-Mail gesendet.", queued: "Vorschau erstellt (Versand nicht konfiguriert).",
        suppressed: "Empfänger steht auf der Opt-out-Liste.", failed: `Fehlgeschlagen: ${r.error ?? "?"}`,
      };
      setMsg(labels[r.status] ?? r.status);
      await loadActivities(lead.id); setPanel(null);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Versand fehlgeschlagen."); }
    finally { setBusy(false); }
  };

  const doEnrich = async () => { setEnriching(true); try { await onEnrich(lead); await loadActivities(lead.id); } finally { setEnriching(false); } };

  return (
    <Drawer open={open} onClose={onClose} title={lead.name ?? "Lead"} subtitle={lead.objektTyp ?? undefined}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="slate">Quelle: {lead.source === "manual" ? "Manuell" : "Recherche"}</Badge>
          {lead.enrichmentSource && <Badge tone="blue">angereichert</Badge>}
        </div>

        {(lead.strasse || lead.ort) && (
          <p className="text-sm text-[var(--color-muted)]">
            {[lead.strasse, [lead.plz, lead.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Deal: Status + Auftragswert */}
        <div className="space-y-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
          <div className="flex gap-1.5">
            {STATUS_OPTS.map((s) => {
              const active = lead.status === s.key;
              return (
                <button key={s.key} onClick={() => onUpdate(lead.id, { status: s.key })}
                  className={cx(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                    active ? "text-[var(--color-on-brand)]" : "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-2)] hover:bg-[var(--color-elevated)]",
                  )}
                  style={active ? { background: s.tone, borderColor: s.tone } : undefined}>
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-muted)] whitespace-nowrap">Auftragswert</span>
            <div className="relative flex-1">
              <TextInput value={valInput} inputMode="numeric" placeholder="z. B. 2400"
                onChange={(e) => setValInput(e.target.value.replace(/[^\d.,]/g, ""))}
                onBlur={() => {
                  const raw = valInput.replace(/\./g, "").replace(",", ".").trim();
                  const num = raw === "" ? null : Number(raw);
                  const next = num != null && Number.isFinite(num) && num >= 0 ? num : null;
                  if (next !== (lead.value ?? null)) onUpdate(lead.id, { value: next });
                }} />
            </div>
            <span className="text-xs text-[var(--color-muted)]">€</span>
          </div>
        </div>

        {/* Aktionsleiste */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => setPanel(panel === "call" ? null : "call")}>
            <Icon name="phone" size={15} /> Anrufen
          </Button>
          <Button variant="ghost" onClick={() => setPanel(panel === "email" ? null : "email")}>
            <Icon name="mail" size={15} /> E-Mail
          </Button>
          <Button variant="ghost" onClick={() => setPanel(panel === "task" ? null : "task")}>
            <Icon name="tasks" size={15} /> Aufgabe
          </Button>
        </div>

        {persona?.features.websiteAudit && <WebsiteAudit url={lead.website} />}
        {persona?.features.jobs && <LeadJobs company={lead.name} ort={lead.ort} plz={lead.plz} />}

        {/* Anruf-Panel */}
        {panel === "call" && (
          <div className="space-y-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
            {lead.phone ? (
              <a href={lead.phoneE164 ? `tel:${lead.phoneE164}` : undefined}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-success-tint)] py-2 text-sm font-semibold text-[var(--color-success)] tnum">
                <Icon name="phone" size={16} /> {lead.phone}
              </a>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">Keine Nummer – zuerst anreichern oder ergänzen.</p>
            )}
            {lead.phoneE164 && (
              <a href={`https://wa.me/${lead.phoneE164.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer noopener"
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2 text-sm font-semibold text-[var(--color-ink-2)] hover:bg-[var(--color-elevated)]">
                <Icon name="phone" size={15} /> Per WhatsApp schreiben
              </a>
            )}
            <div>
              <div className="eyebrow mb-1.5">Ergebnis festhalten</div>
              <div className="flex flex-wrap gap-1.5">
                {OUTCOMES.map((o) => (
                  <button key={o.key} disabled={busy} onClick={() => logCall(o.key)}
                    className="rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--color-elevated)] disabled:opacity-50">
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <TextInput value={callNote} onChange={(e) => setCallNote(e.target.value)} placeholder="Notiz zum Gespräch (optional)" />
          </div>
        )}

        {/* E-Mail-Panel */}
        {panel === "email" && (
          <div className="space-y-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
            {!resendEnabled && <p className="text-xs text-[var(--color-warn)]">Versand nicht konfiguriert – es wird nur eine Vorschau protokolliert.</p>}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field label="Vorlage">
                  <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                    {templates.length === 0 && <option value="">Keine Vorlage</option>}
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </Field>
              </div>
              <Button onClick={send} disabled={busy || !templateId || !lead.email || !emailConsent}>{busy ? <Spinner size={14} /> : "Senden"}</Button>
            </div>
            {lead.email && (
              <label className="flex cursor-pointer items-start gap-2 text-xs text-[var(--color-ink-2)]">
                <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
                <span>Einwilligung/Anfrage liegt vor (z.&nbsp;B. nach Anruf). Keine unaufgeforderte Kaltakquise (§&nbsp;7 UWG).</span>
              </label>
            )}
            {!lead.email && <p className="text-xs text-[var(--color-muted)]">Kein E-Mail-Kontakt – zuerst anreichern.</p>}
          </div>
        )}

        {/* Aufgaben-Panel */}
        {panel === "task" && (
          <div className="space-y-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
            <TextInput value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Aufgabe" />
            <div className="flex justify-end">
              <Button onClick={addTask} disabled={busy || !taskTitle.trim()}>{busy ? <Spinner size={14} /> : "Anlegen (in 3 Tagen)"}</Button>
            </div>
          </div>
        )}

        {msg && <p className="text-xs text-[var(--color-ink)]">{msg}</p>}

        <div className="grid grid-cols-1 gap-3">
          <EditableField label="Telefon" value={lead.phone} placeholder="—" onSave={(v) => onUpdate(lead.id, { phone: v })} />
          <EditableField label="E-Mail" value={lead.email} placeholder="—" onSave={(v) => onUpdate(lead.id, { email: v })} />
          <EditableField label="Ansprechpartner" value={lead.ansprechpartner} placeholder="—" onSave={(v) => onUpdate(lead.id, { ansprechpartner: v })} />
        </div>

        {lead.website && (
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-subtle)] px-3 py-2">
            <a href={lead.website} target="_blank" rel="noreferrer noopener"
              className="flex items-center gap-1.5 truncate text-sm text-[var(--color-brand)] hover:underline">
              <Icon name="globe" size={14} /> {host ?? lead.website}
            </a>
            <Button variant="ghost" size="sm" onClick={doEnrich} disabled={enriching}>
              {enriching ? <Spinner size={13} /> : "Anreichern"}
            </Button>
          </div>
        )}

        {/* Superadmin: Lead per Double-Opt-In zur Mailliste einladen (z. B. nach dem Anruf) */}
        {isAdmin && lead.email && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Zur Mailliste einladen</div>
              <div className="text-xs text-[var(--color-muted)]">Schickt {lead.email} eine Bestätigungs-Einladung (Double-Opt-In).</div>
            </div>
            <Button size="sm" onClick={inviteToList} disabled={inviting}>
              {inviting ? <Spinner size={13} /> : <><Icon name="mail" size={14} /> Einladen</>}
            </Button>
          </div>
        )}

        <LeadContactWays extra={lead.enrichmentExtra} />

        <Field label="Notizen">
          <Textarea rows={3} defaultValue={lead.notes ?? ""} placeholder="Gesprächsnotizen, nächste Schritte …"
            onBlur={(e) => onUpdate(lead.id, { notes: e.currentTarget.value.trim() || null })} />
        </Field>

        {/* Aktivitäts-Timeline */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Aktivität</h3>
          {activities.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)]">Noch keine Aktivität.</p>
          ) : (
            <ul className="space-y-2.5">
              {activities.map((a) => (
                <li key={a.id} className="flex gap-2.5 text-xs">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-subtle)] text-[var(--color-muted)]">
                    <Icon name={ACT_ICON[a.type]} size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[var(--color-ink)]">{a.summary}</div>
                    <div className="text-[var(--color-faint)] tnum">{fmt(a.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-between border-t border-[var(--color-line)] pt-4">
          <Button variant="danger" onClick={() => setConfirmDel(true)}>
            Lead löschen
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDel}
        title="Lead löschen?"
        message={<>Möchtest du <b>{lead.name ?? "diesen Lead"}</b> wirklich löschen? Das kann nicht rückgängig gemacht werden.</>}
        confirmLabel="Endgültig löschen"
        onConfirm={() => { setConfirmDel(false); onDelete(lead); }}
        onClose={() => setConfirmDel(false)}
      />
    </Drawer>
  );
}
