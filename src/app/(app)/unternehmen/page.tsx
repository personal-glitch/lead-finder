"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { PageHeader, useFlags } from "@/components/shell/AppShell";
import { useLeadWorkspace } from "@/components/use-lead-workspace";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { Icon, InitialsAvatar } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Select, Spinner, TextInput, Toast, cx } from "@/components/ui";

export default function UnternehmenPage() {
  const flags = useFlags();
  const ws = useLeadWorkspace();
  const { leads, stages, templates } = ws;

  const [q, setQ] = useState("");
  const [branche, setBranche] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [onlyPhone, setOnlyPhone] = useState(false);
  const [onlyContact, setOnlyContact] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stageName = (id: string | null) => stages.find((s) => s.id === id)?.name ?? "—";
  const branchen = useMemo(
    () => [...new Set(leads.map((l) => l.objektTyp).filter(Boolean))].sort() as string[],
    [leads],
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (branche && l.objektTyp !== branche) return false;
      if (stageFilter && l.stageId !== stageFilter) return false;
      if (onlyPhone && !l.phone) return false;
      if (onlyContact && !l.ansprechpartner) return false;
      if (ql && ![l.name, l.ort, l.phone, l.email, l.ansprechpartner].filter(Boolean).join(" ").toLowerCase().includes(ql)) return false;
      return true;
    }).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "de"));
  }, [leads, q, branche, stageFilter, onlyPhone, onlyContact]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((l) => l.id)));
  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const bulkEnrich = async () => {
    const targets = leads.filter((l) => selected.has(l.id) && l.website);
    if (targets.length === 0) { setToast("Keine ausgewählten Firmen mit Website."); return; }
    setBulkBusy(true);
    for (const l of targets) await ws.enrichLead(l);
    setBulkBusy(false); setSelected(new Set());
    setToast(`${targets.length} Firmen angereichert.`);
  };
  const bulkStage = async (stageId: string) => {
    if (!stageId) return;
    setBulkBusy(true);
    for (const id of [...selected]) await ws.updateLead(id, { stageId });
    setBulkBusy(false); setSelected(new Set());
    setToast("Stage gesetzt.");
  };

  return (
    <>
      <PageHeader title="Unternehmen" subtitle={`${leads.length} Firmen im Bestand`} />
      <div className="space-y-4 p-4 sm:p-7">
        {/* Filterleiste */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"><Icon name="search" size={15} /></span>
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche …" className="w-56 pl-8" />
          </div>
          <Select value={branche} onChange={(e) => setBranche(e.target.value)} className="w-48">
            <option value="">Alle Branchen</option>
            {branchen.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
          <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-44">
            <option value="">Alle Stages</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <button onClick={() => setOnlyPhone((v) => !v)}
            className={cx("rounded-lg border px-2.5 py-1.5 text-xs font-medium", onlyPhone ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line-strong)] text-[var(--color-muted)] hover:bg-[var(--color-subtle)]")}>
            mit Telefon
          </button>
          <button onClick={() => setOnlyContact((v) => !v)}
            className={cx("rounded-lg border px-2.5 py-1.5 text-xs font-medium", onlyContact ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line-strong)] text-[var(--color-muted)] hover:bg-[var(--color-subtle)]")}>
            mit Ansprechpartner
          </button>
          <span className="ml-auto text-xs text-[var(--color-muted)] tnum">{filtered.length} angezeigt</span>
        </div>

        {/* Bulk-Leiste */}
        {selected.size > 0 && (
          <Card className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <span className="text-sm font-medium tnum">{selected.size} ausgewählt</span>
            <Button size="sm" variant="ghost" onClick={bulkEnrich} disabled={bulkBusy}>
              {bulkBusy ? <Spinner size={13} /> : <Icon name="search" size={14} />} Anreichern
            </Button>
            <Select className="h-7 w-44 py-0 text-[13px]" defaultValue="" onChange={(e) => bulkStage(e.target.value)} disabled={bulkBusy}>
              <option value="">In Stage verschieben …</option>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <button onClick={() => setSelected(new Set())} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]">Auswahl aufheben</button>
          </Card>
        )}

        {ws.loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : leads.length === 0 ? (
          <EmptyState icon="building" title="Noch keine Firmen">
            Leg einen Agenten an und übernimm Treffer – sie erscheinen hier als durchsuchbarer Bestand.
            <div className="mt-4"><Link href="/agenten"><Button><Icon name="agents" size={16} /> Zu den Agenten</Button></Link></div>
          </EmptyState>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-[11px] uppercase tracking-[0.05em] text-[var(--color-muted)]">
                  <th className="w-10 px-3 py-2.5"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[var(--color-brand)]" /></th>
                  <th className="px-2 py-2.5 font-medium">Firma</th>
                  <th className="px-2 py-2.5 font-medium">Branche</th>
                  <th className="px-2 py-2.5 font-medium">Ort</th>
                  <th className="px-2 py-2.5 font-medium">Telefon</th>
                  <th className="px-2 py-2.5 font-medium">Ansprechpartner</th>
                  <th className="px-2 py-2.5 font-medium">Stage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} onClick={() => ws.openLead(l.id)}
                    className="cursor-pointer border-b border-[var(--color-line)] transition-colors last:border-0 hover:bg-[var(--color-subtle)]">
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-[var(--color-brand)]" />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={l.name} seed={l.id} size={30} />
                        <span className="font-medium">{l.name ?? "Ohne Namen"}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-[var(--color-muted)]">{l.objektTyp ?? "—"}</td>
                    <td className="px-2 py-2.5 text-[var(--color-muted)]">{l.ort ?? "—"}</td>
                    <td className="px-2 py-2.5">
                      {l.phone ? (
                        <a href={l.phoneE164 ? `tel:${l.phoneE164}` : undefined} onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[var(--color-success)] tnum"><Icon name="phone" size={13} /> {l.phone}</a>
                      ) : <span className="text-[var(--color-faint)]">—</span>}
                    </td>
                    <td className="px-2 py-2.5 text-[var(--color-muted)]">{l.ansprechpartner ?? "—"}</td>
                    <td className="px-2 py-2.5"><Badge tone="slate">{stageName(l.stageId)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <LeadDetailDrawer
        lead={ws.selectedLead}
        open={ws.selectedLeadId !== null}
        onClose={ws.closeLead}
        templates={templates}
        resendEnabled={flags.resend}
        onUpdate={ws.updateLead}
        onEnrich={ws.enrichLead}
        onDelete={ws.deleteLead}
        onLeadChanged={ws.upsert}
      />
      {(toast || ws.error) && <Toast message={toast ?? ws.error ?? ""} onClose={() => { setToast(null); ws.setError(null); }} />}
    </>
  );
}
