"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useFlags, PageHeader } from "@/components/shell/AppShell";
import { useLeadWorkspace } from "@/components/use-lead-workspace";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { EmailComposeModal, type ComposeContact } from "@/components/EmailComposeModal";
import { Icon, InitialsAvatar } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Select, Spinner, TextInput, Toast } from "@/components/ui";

interface Kontakt {
  leadId: string;
  name: string;
  role: string | null;
  firma: string | null;
  ort: string | null;
  branche: string | null;
  phone: string | null;
  phoneE164: string | null;
  email: string | null;
}

export default function KontaktePage() {
  const flags = useFlags();
  const ws = useLeadWorkspace();
  const { leads, templates } = ws;
  const [q, setQ] = useState("");
  const [branche, setBranche] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [composeFor, setComposeFor] = useState<ComposeContact | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTemplateId, setBulkTemplateId] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const kontakte = useMemo<Kontakt[]>(() => {
    return leads
      .filter((l) => l.ansprechpartner)
      .map((l) => {
        const [name, role] = (l.ansprechpartner as string).split(" · ");
        return {
          leadId: l.id, name: name.trim(), role: role?.trim() ?? null,
          firma: l.name, ort: l.ort, branche: l.objektTyp,
          phone: l.phone, phoneE164: l.phoneE164, email: l.email,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [leads]);

  const branchen = useMemo(() => [...new Set(kontakte.map((k) => k.branche).filter(Boolean))].sort() as string[], [kontakte]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return kontakte.filter((k) => {
      if (branche && k.branche !== branche) return false;
      if (ql && ![k.name, k.role, k.firma, k.ort, k.phone, k.email].filter(Boolean).join(" ").toLowerCase().includes(ql)) return false;
      return true;
    });
  }, [kontakte, q, branche]);

  const mailable = useMemo(() => filtered.filter((k) => k.email), [filtered]);
  const selCount = selected.size;

  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((p) => p.size === mailable.length ? new Set() : new Set(mailable.map((k) => k.leadId)));
  const clearSel = () => setSelected(new Set());

  const bulkSend = async () => {
    if (!bulkTemplateId || selCount === 0) return;
    setBulkBusy(true);
    try {
      const { results } = await api<{ results: Array<{ status: string }> }>(
        "/api/email/send",
        { json: { leadIds: [...selected], templateId: bulkTemplateId } },
      );
      const sent = results.filter((r) => r.status === "sent").length;
      const skipped = results.filter((r) => r.status === "queued").length;
      const failed = results.filter((r) => r.status === "failed" || r.status === "suppressed").length;
      setToast(`${sent} gesendet${skipped ? `, ${skipped} wg. Tageslimit verschoben` : ""}${failed ? `, ${failed} fehlgeschlagen` : ""}.`);
      clearSel(); setBulkTemplateId(""); ws.reload?.();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Versand fehlgeschlagen.");
    } finally { setBulkBusy(false); }
  };

  return (
    <>
      <PageHeader title="Kontakte" subtitle={`${kontakte.length} Ansprechpartner`} />
      <div className="space-y-4 p-4 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"><Icon name="search" size={15} /></span>
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, Firma, Rolle …" className="w-64 pl-8" />
          </div>
          <Select value={branche} onChange={(e) => setBranche(e.target.value)} className="w-48">
            <option value="">Alle Branchen</option>
            {branchen.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
          <span className="ml-auto text-xs text-[var(--color-muted)] tnum">{filtered.length} angezeigt</span>
        </div>

        {selCount > 0 && (
          <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)] px-3 py-2.5 shadow-sm">
            <span className="text-sm font-medium">{selCount} ausgewählt</span>
            <Select value={bulkTemplateId} onChange={(e) => setBulkTemplateId(e.target.value)} className="w-56">
              <option value="">Vorlage wählen …</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Button onClick={bulkSend} disabled={bulkBusy || !bulkTemplateId}>
              {bulkBusy ? <Spinner size={14} /> : <><Icon name="mail" size={15} /> An Auswahl senden</>}
            </Button>
            <button onClick={clearSel} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]">Auswahl aufheben</button>
            <span className="ml-auto text-xs text-[var(--color-muted)]">Max. 50 E-Mails/Tag (Zustellbarkeit). Platzhalter & Signatur werden eingesetzt.</span>
          </div>
        )}

        {ws.loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : kontakte.length === 0 ? (
          <EmptyState icon="user" title="Noch keine Kontakte">
            Ansprechpartner entstehen beim <strong>Anreichern</strong> – Name + Rolle (z. B. Praxismanager,
            Hausverwalter). Reichere Firmen an, dann erscheinen sie hier.
            <div className="mt-4"><Link href="/unternehmen"><Button><Icon name="building" size={16} /> Zu den Unternehmen</Button></Link></div>
          </EmptyState>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-[11px] uppercase tracking-[0.05em] text-[var(--color-muted)]">
                  <th className="px-3 py-2.5 font-medium">
                    <input type="checkbox" title="Alle mit E-Mail auswählen" aria-label="Alle auswählen"
                      checked={mailable.length > 0 && selCount === mailable.length}
                      onChange={toggleAll} className="h-4 w-4 cursor-pointer accent-[var(--color-brand)]" />
                  </th>
                  <th className="px-3 py-2.5 font-medium">Name</th>
                  <th className="px-2 py-2.5 font-medium">Rolle</th>
                  <th className="px-2 py-2.5 font-medium">Firma</th>
                  <th className="px-2 py-2.5 font-medium">Telefon</th>
                  <th className="px-2 py-2.5 font-medium">E-Mail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => (
                  <tr key={k.leadId} onClick={() => ws.openLead(k.leadId)}
                    className="cursor-pointer border-b border-[var(--color-line)] transition-colors last:border-0 hover:bg-[var(--color-subtle)]">
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`${k.name} auswählen`}
                        disabled={!k.email} checked={selected.has(k.leadId)}
                        onChange={() => toggle(k.leadId)}
                        className="h-4 w-4 cursor-pointer accent-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-40" />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={k.name} seed={k.leadId} size={30} />
                        <span className="font-medium">{k.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">{k.role ? <Badge tone="brand">{k.role}</Badge> : <span className="text-[var(--color-faint)]">—</span>}</td>
                    <td className="px-2 py-2.5 text-[var(--color-muted)]">
                      {k.firma ?? "—"}{k.ort && <span className="text-[var(--color-faint)]"> · {k.ort}</span>}
                    </td>
                    <td className="px-2 py-2.5">
                      {k.phone ? (
                        <a href={k.phoneE164 ? `tel:${k.phoneE164}` : undefined} onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[var(--color-success)] tnum"><Icon name="phone" size={13} /> {k.phone}</a>
                      ) : <span className="text-[var(--color-faint)]">—</span>}
                    </td>
                    <td className="px-2 py-2.5">
                      {k.email ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setComposeFor({ leadId: k.leadId, name: k.name, email: k.email }); }}
                            title="E-Mail schreiben"
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-tint)]">
                            <Icon name="mail" size={13} /> Mail
                          </button>
                          <span className="truncate text-xs text-[var(--color-muted)]">{k.email}</span>
                        </div>
                      ) : <span className="text-[var(--color-faint)]">—</span>}
                    </td>
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
      <EmailComposeModal
        open={composeFor !== null}
        contact={composeFor}
        templates={templates}
        onClose={() => setComposeFor(null)}
        onSent={(m) => { setToast(m); setComposeFor(null); ws.reload?.(); }}
      />
      {(toast || ws.error) && <Toast message={toast ?? ws.error ?? ""} onClose={() => { setToast(null); ws.setError(null); }} />}
    </>
  );
}
