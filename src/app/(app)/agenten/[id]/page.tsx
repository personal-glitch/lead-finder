"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Agent, AgentInput, LeadInput, PipelineStage } from "@/lib/types";
import { api } from "@/lib/client";
import { dedupeKey, hostFromUrl } from "@/lib/dedupe";
import { PageHeader } from "@/components/shell/AppShell";
import { AgentDialog } from "@/components/agents/AgentDialog";
import { AgentAvatar, Icon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Spinner, Toast, cx } from "@/components/ui";

interface RunResult {
  center: { displayName: string };
  radiusKm: number;
  leads: LeadInput[];
  notes: string[];
  demo?: boolean;
}

export default function AgentDetailPage() {
  const id = String(useParams().id);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stageId, setStageId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<RunResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [enrichingKey, setEnrichingKey] = useState<string | null>(null);
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<{ done: number; total: number } | null>(null);
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    try { const v = localStorage.getItem("kr-auto-enrich"); if (v !== null) setAutoEnrich(v === "1"); } catch {}
    (async () => {
      try {
        const [{ agent }, { stages }] = await Promise.all([
          api<{ agent: Agent }>(`/api/agents/${id}`),
          api<{ stages: PipelineStage[] }>("/api/stages"),
        ]);
        setAgent(agent);
        setStageId(stages[0]?.id ?? null);
      } catch (e) {
        setToast(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
      }
    })();
  }, [id]);

  const run = async () => {
    setPhase("running");
    setResult(null);
    try {
      const { agent: updated, result } = await api<{ agent: Agent; result: RunResult }>(
        `/api/agents/${id}/run`,
        { method: "POST" },
      );
      setAgent(updated);
      setResult(result);
      setSelected(new Set(result.leads.map(dedupeKey)));
      setTaken(new Set());
      setPhase("done");
      // Automatisch anreichern (Hintergrund), außer bei Beispieldaten.
      if (autoEnrich && !result.demo) void runEnrich(result.leads, true);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Suche fehlgeschlagen.");
      setPhase("idle");
    }
  };

  const saveEdit = async (input: AgentInput) => {
    const { agent } = await api<{ agent: Agent }>(`/api/agents/${id}`, { method: "PATCH", json: input });
    setAgent(agent);
    setEditOpen(false);
  };

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const applyEnrichment = (key: string, e: Record<string, string | null>) =>
    setResult((r) => r ? { ...r, leads: r.leads.map((l) => dedupeKey(l) === key ? {
      ...l, phone: e.phone ?? l.phone, phoneE164: e.phoneE164 ?? l.phoneE164,
      email: e.email ?? l.email, ansprechpartner: e.ansprechpartner ?? l.ansprechpartner,
      enrichmentSource: (e.enrichmentSource as "web") ?? l.enrichmentSource,
    } : l) } : r);

  const enrich = async (input: LeadInput) => {
    if (!input.website) return;
    const key = dedupeKey(input);
    setEnrichingKey(key);
    try {
      const { enrichment } = await api<{ enrichment: Record<string, string | null> }>("/api/leads/enrich", {
        json: { website: input.website, branche: input.objektTyp },
      });
      applyEnrichment(key, enrichment);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Anreicherung fehlgeschlagen.");
    } finally {
      setEnrichingKey(null);
    }
  };

  // Alle Treffer mit Website anreichern – parallelisiert, abbrechbar. Wird manuell
  // oder automatisch nach dem Agentenlauf aufgerufen.
  const runEnrich = async (leads: LeadInput[], silent = false) => {
    const targets = leads.filter((l) => l.website && !l.enrichmentSource);
    if (targets.length === 0) {
      if (!silent) setToast("Nichts anzureichern – kein Treffer mit Website (oder alle bereits angereichert).");
      return;
    }
    setEnrichingAll(true); stopRef.current = false;
    setEnrichProgress({ done: 0, total: targets.length });
    let done = 0, found = 0, idx = 0;
    const worker = async () => {
      while (idx < targets.length && !stopRef.current) {
        const input = targets[idx++]; const key = dedupeKey(input);
        try {
          const { enrichment } = await api<{ enrichment: Record<string, string | null> }>("/api/leads/enrich", { json: { website: input.website, branche: input.objektTyp } });
          applyEnrichment(key, enrichment);
          if (enrichment.phone || enrichment.email || enrichment.ansprechpartner) found++;
        } catch { /* einzelne Fehler überspringen */ }
        setEnrichProgress({ done: ++done, total: targets.length });
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, targets.length) }, worker));
    setEnrichingAll(false); setEnrichProgress(null);
    if (!stopRef.current) setToast(`Anreicherung fertig: ${found} von ${targets.length} mit Kontaktdaten gefunden.`);
  };

  const enrichAll = () => { if (result && !enrichingAll) runEnrich(result.leads); };
  const stopEnrich = () => { stopRef.current = true; };
  const toggleAuto = () => setAutoEnrich((v) => {
    const nv = !v;
    try { localStorage.setItem("kr-auto-enrich", nv ? "1" : "0"); } catch {}
    return nv;
  });

  const takeSelected = async () => {
    if (!result) return;
    const inputs = result.leads.filter((l) => selected.has(dedupeKey(l)) && !taken.has(dedupeKey(l)));
    if (inputs.length === 0) return;
    try {
      await api("/api/leads", { json: { inputs, stageId, agentId: id } });
      setTaken((prev) => new Set([...prev, ...inputs.map(dedupeKey)]));
      setToast(`${inputs.length} Lead${inputs.length === 1 ? "" : "s"} in die Pipeline übernommen.`);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Übernehmen fehlgeschlagen.");
    }
  };

  const selectableCount = useMemo(
    () => (result ? result.leads.filter((l) => !taken.has(dedupeKey(l))).length : 0),
    [result, taken],
  );

  if (!agent) {
    return (
      <>
        <PageHeader title="Agent" back={{ href: "/agenten", label: "Zurück zu allen Agenten" }} />
        <div className="flex items-center gap-2 p-7 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={agent.name} back={{ href: "/agenten", label: "Zurück zu allen Agenten" }} />
      <div className="space-y-5 p-4 sm:p-7">
        {/* Profil-Kopf */}
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <AgentAvatar icon={agent.icon as never} color={agent.color} size={52} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.01em]">{agent.name}</h2>
                <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                  <Icon name="pencil" size={13} /> Bearbeiten
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1"><Icon name="pin" size={13} /><span className="tnum">{agent.plz}</span> · {agent.radiusKm} km</span>
                <span>· {agent.lastMatchCount} Treffer · {agent.leadsCreated} Leads angelegt</span>
              </div>
              {agent.objektTypen.length > 0 && (
                <p className="mt-1.5 text-xs text-[var(--color-ink-2)]"><span className="text-[var(--color-faint)]">Zielbranchen:</span> {agent.objektTypen.join(", ")}</p>
              )}
            </div>
          </div>
          <Button onClick={run} disabled={phase === "running"} className="shrink-0">
            {phase === "running" ? <><Spinner /> Suche läuft …</> : <><Icon name="play" size={15} /> Jetzt suchen</>}
          </Button>
        </Card>

        {/* Ergebnis-Bereich */}
        {phase === "idle" && (
          <EmptyState icon="play" title="Bereit zur Suche">
            Klick „Jetzt suchen" — der Agent läuft mit seinem gespeicherten Profil und zeigt hier die Treffer.
          </EmptyState>
        )}

        {phase === "running" && (
          <Card className="flex flex-col items-center gap-3 py-14">
            <Spinner size={26} className="text-[var(--color-brand)]" />
            <div className="text-sm text-[var(--color-muted)]">Live-Recherche läuft … Suche · Abgleich · Anreicherung</div>
          </Card>
        )}

        {phase === "done" && result && (
          <div className="space-y-3">
            {result.notes.map((n, i) => (
              <div key={i} className="rounded-lg border border-[var(--color-warn-tint)] bg-[var(--color-warn-tint)] px-3.5 py-2.5 text-xs text-[var(--color-warn)]">{n}</div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-[var(--color-muted)]">
                <span className="font-medium text-[var(--color-ink)] tnum">{result.leads.length}</span> Treffer um {result.center.displayName.split(",")[0]} · {result.radiusKm} km
                {result.demo && <Badge tone="amber">Beispieldaten</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={cx("inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs",
                    autoEnrich ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]")}
                  onClick={toggleAuto} title="Treffer nach jedem Lauf automatisch anreichern">
                  <Icon name="bolt" size={13} /> Auto {autoEnrich ? "an" : "aus"}
                </button>
                {enrichingAll ? (
                  <Button variant="ghost" size="sm" onClick={stopEnrich}>
                    <Spinner size={13} /> {enrichProgress?.done}/{enrichProgress?.total} · Stopp
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={enrichAll}>
                    <Icon name="bolt" size={14} /> Alle anreichern
                  </Button>
                )}
                <button
                  className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  onClick={() =>
                    setSelected((prev) =>
                      prev.size === result.leads.length ? new Set() : new Set(result.leads.map(dedupeKey)),
                    )
                  }
                >
                  {selected.size === result.leads.length ? "Auswahl aufheben" : "Alle auswählen"}
                </button>
                <Button onClick={takeSelected} disabled={selected.size === 0 || selectableCount === 0}>
                  <Icon name="check" size={15} /> {selected.size} in Pipeline übernehmen
                </Button>
              </div>
            </div>

            {result.leads.length === 0 ? (
              <EmptyState icon="search" title="Keine Treffer">Umkreis vergrößern oder andere Objekttypen im Agenten wählen.</EmptyState>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
                {result.leads.map((l, i) => {
                  const key = dedupeKey(l);
                  const isTaken = taken.has(key);
                  const host = hostFromUrl(l.website);
                  return (
                    <div
                      key={key}
                      className={cx(
                        "flex items-center gap-3 px-4 py-3",
                        i > 0 && "border-t border-[var(--color-line)]",
                        isTaken && "bg-[var(--color-success-tint)]/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(key)}
                        disabled={isTaken}
                        onChange={() => toggle(key)}
                        className="h-4 w-4 shrink-0 accent-[var(--color-brand)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{l.name ?? "Ohne Namen"}</span>
                          {l.objektTyp && <Badge tone="slate">{l.objektTyp.split(" / ")[0]}</Badge>}
                          {l.enrichmentSource && <Badge tone="blue">angereichert</Badge>}
                          {isTaken && <Badge tone="green">übernommen</Badge>}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--color-muted)]">
                          {(l.strasse || l.ort) && <span className="truncate">{[l.strasse, l.ort].filter(Boolean).join(", ")}</span>}
                          {l.phone ? <span className="text-[var(--color-success)] tnum">📞 {l.phone}</span> : <span className="text-[var(--color-faint)]">keine Nummer</span>}
                          {l.email && <span className="truncate">{l.email}</span>}
                          {l.ansprechpartner && <span>{l.ansprechpartner}</span>}
                          {host && <span className="truncate text-[var(--color-faint)]">{host}</span>}
                        </div>
                      </div>
                      {l.website && (
                        <Button variant="ghost" size="sm" disabled={enrichingKey === key} onClick={() => enrich(l)}>
                          {enrichingKey === key ? <Spinner size={13} /> : "Anreichern"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <AgentDialog open={editOpen} onClose={() => setEditOpen(false)} initial={agent} onSubmit={saveEdit} />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
