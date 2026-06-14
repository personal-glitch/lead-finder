"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { EmailTemplate, Lead, PipelineStage } from "@/lib/types";
import { api } from "@/lib/client";
import { downloadCsv } from "@/lib/csv";
import { useFlags, PageHeader } from "@/components/shell/AppShell";
import { PipelineBoard, LeadCard } from "@/components/Pipeline";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { Icon, type IconName } from "@/components/icons";
import { Button, Card, EmptyState, Spinner, TextInput, Toast } from "@/components/ui";

const STAT_TONES: Record<string, { bg: string; fg: string }> = {
  blue: { bg: "var(--color-info-tint)", fg: "var(--color-info)" },
  amber: { bg: "var(--color-warn-tint)", fg: "var(--color-warn)" },
  green: { bg: "var(--color-success-tint)", fg: "var(--color-success)" },
  slate: { bg: "var(--color-subtle)", fg: "var(--color-ink-2)" },
};

function StatCard({ label, value, sub, icon, tone }: { label: string; value: number; sub?: string; icon: IconName; tone: keyof typeof STAT_TONES }) {
  const t = STAT_TONES[tone];
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: t.bg, color: t.fg }}>
        <Icon name={icon} size={19} />
      </span>
      <div>
        <div className="eyebrow">{label}</div>
        <div className="text-[26px] font-semibold leading-tight tnum">{value}</div>
        {sub && <div className="text-xs text-[var(--color-muted)]">{sub}</div>}
      </div>
    </Card>
  );
}

export default function PipelinePage() {
  const flags = useFlags();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [active, setActive] = useState<Lead | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, l, t] = await Promise.all([
          api<{ stages: PipelineStage[] }>("/api/stages"),
          api<{ leads: Lead[] }>("/api/leads"),
          api<{ templates: EmailTemplate[] }>("/api/templates"),
        ]);
        setStages(s.stages); setLeads(l.leads); setTemplates(t.templates);
      } catch (e) {
        setToast(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.ort, l.phone, l.email, l.ansprechpartner, l.objektTyp]
        .filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [leads, query]);

  const stats = useMemo(() => {
    const total = leads.length;
    const firstStage = stages[0]?.id;
    const neu = firstStage ? leads.filter((l) => l.stageId === firstStage).length : 0;
    const mitTel = leads.filter((l) => l.phone).length;
    const mitAP = leads.filter((l) => l.ansprechpartner).length;
    const pct = (n: number) => (total ? `${Math.round((n / total) * 100)} % der Leads` : "—");
    return { total, neu, mitTel, mitAP, pct };
  }, [leads, stages]);

  const selectedLead = useMemo(() => leads.find((l) => l.id === selectedLeadId) ?? null, [leads, selectedLeadId]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const upsert = (incoming: Lead) => setLeads((prev) => prev.map((l) => (l.id === incoming.id ? incoming : l)));

  const moveLead = async (leadId: string, stageId: string) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, stageId } : l)));
    try { await api(`/api/leads/${leadId}`, { method: "PATCH", json: { stageId } }); }
    catch (e) { setLeads(prev); setToast(e instanceof Error ? e.message : "Verschieben fehlgeschlagen."); }
  };
  const updateLead = async (id: string, patch: Partial<Lead>) => {
    try { const { lead } = await api<{ lead: Lead }>(`/api/leads/${id}`, { method: "PATCH", json: patch }); upsert(lead); }
    catch (e) { setToast(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
  };
  const enrichLead = async (lead: Lead) => {
    try { const { lead: u } = await api<{ lead: Lead | null }>("/api/leads/enrich", { json: { id: lead.id } }); if (u) upsert(u); }
    catch (e) { setToast(e instanceof Error ? e.message : "Anreicherung fehlgeschlagen."); }
  };
  const deleteLead = async (lead: Lead) => {
    setSelectedLeadId(null); setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    try { await api(`/api/leads/${lead.id}`, { method: "DELETE" }); }
    catch (e) { setToast(e instanceof Error ? e.message : "Löschen fehlgeschlagen."); }
  };
  const addStage = async (name: string) => {
    try { const { stage } = await api<{ stage: PipelineStage }>("/api/stages", { json: { name } }); setStages((p) => [...p, stage]); }
    catch (e) { setToast(e instanceof Error ? e.message : "Stage anlegen fehlgeschlagen."); }
  };
  const renameStage = async (id: string, name: string) => {
    setStages((p) => p.map((s) => (s.id === id ? { ...s, name } : s)));
    try { await api(`/api/stages/${id}`, { method: "PATCH", json: { name } }); }
    catch (e) { setToast(e instanceof Error ? e.message : "Umbenennen fehlgeschlagen."); }
  };
  const deleteStage = async (id: string) => {
    setStages((p) => p.filter((s) => s.id !== id));
    setLeads((p) => p.map((l) => (l.stageId === id ? { ...l, stageId: null } : l)));
    try { await api(`/api/stages/${id}`, { method: "DELETE" }); }
    catch (e) { setToast(e instanceof Error ? e.message : "Stage löschen fehlgeschlagen."); }
  };

  const onDragStart = (e: DragStartEvent) => setActive((e.active.data.current as { lead?: Lead })?.lead ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const over = e.over?.data.current as { kind?: string; stageId?: string } | undefined;
    const data = e.active.data.current as { lead?: Lead } | undefined;
    if (over?.kind === "stage" && over.stageId && data?.lead && data.lead.stageId !== over.stageId) {
      void moveLead(data.lead.id, over.stageId);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <PageHeader
        title="Pipeline"
        subtitle={`${leads.length} Leads im Blick`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => {
              const stageName = (id: string | null) => stages.find((s) => s.id === id)?.name ?? "";
              const statusLabel: Record<string, string> = { offen: "Offen", gewonnen: "Gewonnen", verloren: "Verloren" };
              const rows = filtered.map((l) => [l.name, l.objektTyp, l.ansprechpartner, l.phone, l.email, l.website, l.strasse, l.plz, l.ort, stageName(l.stageId), statusLabel[l.status] ?? "", l.value != null ? String(l.value) : ""]);
              downloadCsv(`KundenRadar-Leads-${new Date().toISOString().slice(0, 10)}`,
                ["Firma", "Branche", "Ansprechpartner", "Telefon", "E-Mail", "Website", "Straße", "PLZ", "Ort", "Phase", "Status", "Auftragswert (€)"], rows);
            }} disabled={filtered.length === 0}><Icon name="external" size={15} /> CSV</Button>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"><Icon name="search" size={16} /></span>
              <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Firma, Person, Tel., Ort …" className="w-72 pl-8" />
            </div>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-7">
        {/* Kennzahlen — bewusst auf Datenqualität statt nur Menge */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Leads gesamt" value={stats.total} icon="pipeline" tone="blue" />
          <StatCard label="Neu" value={stats.neu} sub={stages[0]?.name} icon="clock" tone="amber" />
          <StatCard label="Mit Telefon" value={stats.mitTel} sub={stats.pct(stats.mitTel)} icon="phone" tone="green" />
          <StatCard label="Mit Ansprechpartner" value={stats.mitAP} sub={stats.pct(stats.mitAP)} icon="user" tone="slate" />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : leads.length === 0 ? (
          <EmptyState icon="pipeline" title="Noch keine Leads">
            Leg einen Agenten an, lass ihn laufen und übernimm die besten Treffer in die Pipeline.
            <div className="mt-4"><Link href="/agenten"><Button><Icon name="agents" size={16} /> Zu den Agenten</Button></Link></div>
          </EmptyState>
        ) : (
          <div className="h-[calc(100vh-310px)] min-h-[420px]">
            <PipelineBoard stages={stages} leads={filtered} onOpenLead={(l) => setSelectedLeadId(l.id)}
              onAddStage={addStage} onRenameStage={renameStage} onDeleteStage={deleteStage} />
          </div>
        )}
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        open={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
        templates={templates}
        resendEnabled={flags.resend}
        onUpdate={updateLead}
        onEnrich={enrichLead}
        onDelete={deleteLead}
        onLeadChanged={upsert}
      />

      <DragOverlay>{active ? <LeadCard lead={active} overlay /> : null}</DragOverlay>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DndContext>
  );
}
