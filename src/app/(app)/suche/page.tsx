"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LeadInput, PipelineStage } from "@/lib/types";
import { api } from "@/lib/client";
import { dedupeKey, hostFromUrl } from "@/lib/dedupe";
import { type BrancheKey } from "@/lib/leadgen/branchen-catalog";
import { PageHeader, refreshStats } from "@/components/shell/AppShell";
import { TargetPicker } from "@/components/agents/TargetPicker";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Field, Spinner, TextInput, Toast, cx } from "@/components/ui";

interface SearchResult { center: { displayName: string }; radiusKm: number; leads: LeadInput[]; notes: string[]; demo: boolean }

export default function SuchePage() {
  const [plz, setPlz] = useState("");
  const [radiusKm, setRadiusKm] = useState(15);
  const [branchen, setBranchen] = useState<Set<BrancheKey>>(new Set(["Arztpraxis"]));
  const [keyword, setKeyword] = useState("");
  const [stageId, setStageId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [enrichingKey, setEnrichingKey] = useState<string | null>(null);
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<{ done: number; total: number } | null>(null);
  const [onlyWithContact, setOnlyWithContact] = useState(false);
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    api<{ stages: PipelineStage[] }>("/api/stages").then((s) => setStageId(s.stages[0]?.id ?? null)).catch(() => {});
    try { const v = localStorage.getItem("kr-auto-enrich"); if (v !== null) setAutoEnrich(v === "1"); } catch {}
  }, []);

  const toggleAuto = () => setAutoEnrich((v) => {
    const nv = !v;
    try { localStorage.setItem("kr-auto-enrich", nv ? "1" : "0"); } catch {}
    return nv;
  });

  const toggleBranche = (b: BrancheKey) => setBranchen((p) => { const n = new Set(p); n.has(b) ? n.delete(b) : n.add(b); return n; });

  const keywordList = keyword.split(/[;,\n]/).map((k) => k.trim()).filter(Boolean);

  const search = async () => {
    if (!plz.trim() || (branchen.size === 0 && keywordList.length === 0)) return;
    setSearching(true); setResult(null);
    const payload = { plz: plz.trim(), radiusKm, branchen: [...branchen], keywords: keywordList };
    try {
      const res = await api<SearchResult>("/api/leads/search", { json: payload });
      setResult(res); setSelected(new Set(res.leads.map(dedupeKey))); setTaken(new Set());
      // Automatisch anreichern (Hintergrund), außer bei Beispieldaten.
      if (autoEnrich && !res.demo) void runEnrich(res.leads, true);
    } catch (e) { setToast(e instanceof Error ? e.message : "Suche fehlgeschlagen."); }
    finally { setSearching(false); }
  };

  const applyEnrichment = (key: string, e: Record<string, string | null>) =>
    setResult((r) => r ? { ...r, leads: r.leads.map((l) => dedupeKey(l) === key ? {
      ...l, phone: e.phone ?? l.phone, phoneE164: e.phoneE164 ?? l.phoneE164,
      email: e.email ?? l.email, ansprechpartner: e.ansprechpartner ?? l.ansprechpartner,
      website: e.website ?? l.website,
      enrichmentSource: (e.enrichmentSource as "web") ?? l.enrichmentSource,
    } : l) } : r);

  // Anreichern eines einzelnen Treffers. Hat der Treffer keine Website, wird sie
  // serverseitig per Web-Suche aus Name + Ort ermittelt und danach gescrapt.
  const enrich = async (input: LeadInput) => {
    const key = dedupeKey(input); setEnrichingKey(key);
    try {
      const { enrichment } = await api<{ enrichment: Record<string, string | null> }>("/api/leads/enrich", {
        json: { website: input.website ?? undefined, branche: input.objektTyp, name: input.name, ort: input.ort },
      });
      applyEnrichment(key, enrichment);
      if (!enrichment.phone && !enrichment.email && !enrichment.ansprechpartner) {
        setToast("Keine zusätzlichen Kontaktdaten gefunden.");
      }
    } catch (e) { setToast(e instanceof Error ? e.message : "Anreicherung fehlgeschlagen."); }
    finally { setEnrichingKey(null); }
  };

  // Treffer anreichern (Impressum-/Kontakt-Scrape, serverseitig & kostenlos).
  // Parallelisiert (schonende Nebenläufigkeit), abbrechbar. Schon angereicherte
  // werden übersprungen.
  //   deep=false  → nur Treffer mit bereits bekannter Website (schnell; Auto-Lauf)
  //   deep=true   → auch Treffer OHNE Website: Website wird per Web-Suche gesucht
  const runEnrich = async (leads: LeadInput[], silent = false, deep = false) => {
    const targets = leads.filter((l) => !l.enrichmentSource && (deep ? (l.website || l.name) : l.website));
    if (targets.length === 0) {
      if (!silent) setToast("Nichts anzureichern – alle Treffer sind bereits angereichert.");
      return;
    }
    setEnrichingAll(true); stopRef.current = false;
    setEnrichProgress({ done: 0, total: targets.length });
    let done = 0, found = 0, idx = 0;
    const worker = async () => {
      while (idx < targets.length && !stopRef.current) {
        const input = targets[idx++]; const key = dedupeKey(input);
        try {
          const { enrichment } = await api<{ enrichment: Record<string, string | null> }>("/api/leads/enrich", {
            json: { website: input.website ?? undefined, branche: input.objektTyp, name: input.name, ort: input.ort },
          });
          applyEnrichment(key, enrichment);
          if (enrichment.phone || enrichment.email || enrichment.ansprechpartner) found++;
        } catch { /* einzelne Fehler überspringen, Lauf nicht abbrechen */ }
        setEnrichProgress({ done: ++done, total: targets.length });
      }
    };
    // Schonende Nebenläufigkeit: tiefe Suche zurückhaltender (Web-Suche je Firma).
    const lanes = deep ? 3 : 5;
    await Promise.all(Array.from({ length: Math.min(lanes, targets.length) }, worker));
    setEnrichingAll(false); setEnrichProgress(null);
    if (!stopRef.current) setToast(`Anreicherung fertig: ${found} von ${targets.length} mit Kontaktdaten gefunden.`);
  };

  // „Alle anreichern" geht in die Tiefe (auch Firmen ohne hinterlegte Website).
  const enrichAll = () => { if (result && !enrichingAll) runEnrich(result.leads, false, true); };
  const stopEnrich = () => { stopRef.current = true; };

  const take = async () => {
    if (!result) return;
    const inputs = result.leads.filter((l) => selected.has(dedupeKey(l)) && !taken.has(dedupeKey(l)));
    if (inputs.length === 0) return;
    try {
      await api("/api/leads", { json: { inputs, stageId } });
      setTaken((p) => new Set([...p, ...inputs.map(dedupeKey)])); refreshStats();
      setToast(`${inputs.length} in die Pipeline übernommen.`);
    } catch (e) { setToast(e instanceof Error ? e.message : "Übernehmen fehlgeschlagen."); }
  };

  const toggle = (k: string) => setSelected((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const hasContact = (l: LeadInput) => Boolean(l.phone || l.email || l.website || l.ansprechpartner);
  // Sichtbare Treffer: optional ohne Kontaktlose (kein Web/Tel/E-Mail/Ansprechpartner).
  const displayLeads = useMemo(() => {
    if (!result) return [] as LeadInput[];
    return onlyWithContact ? result.leads.filter(hasContact) : result.leads;
  }, [result, onlyWithContact]);
  const hiddenCount = result ? result.leads.length - displayLeads.length : 0;
  const selectableCount = useMemo(() => displayLeads.filter((l) => !taken.has(dedupeKey(l))).length, [displayLeads, taken]);
  const canSearch = plz.trim().length > 0 && (branchen.size > 0 || keywordList.length > 0) && !searching;

  return (
    <>
      <PageHeader title="Suche" subtitle="Direkt passende Firmen finden – ohne gespeicherten Agenten" />
      <div className="space-y-5 p-4 sm:p-7">
        <Card className="space-y-4 p-5">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <Field label="PLZ / Ort" required>
              <TextInput value={plz} onChange={(e) => setPlz(e.target.value)} placeholder="z. B. 50667 oder Köln"
                onKeyDown={(e) => e.key === "Enter" && canSearch && search()} />
            </Field>
            <Field label={`Umkreis · ${radiusKm} km`}>
              <input type="range" min={1} max={30} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="mt-2 w-48 accent-[var(--color-brand)]" />
            </Field>
          </div>
          <div>
            <span className="eyebrow mb-1.5 block">Zielbranchen</span>
            <TargetPicker selected={branchen as Set<string>} onToggle={toggleBranche} keyword={keyword} onKeyword={setKeyword} />
          </div>
          <Button onClick={search} disabled={!canSearch}>
            {searching ? <><Spinner /> Suche läuft …</> : <><Icon name="search" size={16} /> Suchen</>}
          </Button>
        </Card>

        {result && (
          <div className="space-y-3">
            {result.notes.map((n, i) => (
              <div key={i} className="rounded-lg border border-[var(--color-warn-tint)] bg-[var(--color-warn-tint)] px-3.5 py-2.5 text-xs text-[var(--color-warn)]">{n}</div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-[var(--color-muted)]">
                <span className="font-medium text-[var(--color-ink)] tnum">{displayLeads.length}</span> Treffer um {result.center.displayName.split(",")[0]} · {result.radiusKm} km
                {onlyWithContact && hiddenCount > 0 && <span className="text-[var(--color-faint)]"> · {hiddenCount} ohne Kontakt ausgeblendet</span>}
                {result.demo && <Badge tone="amber">Beispieldaten</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={cx("inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs",
                    onlyWithContact ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]")}
                  onClick={() => setOnlyWithContact((v) => !v)}>
                  <Icon name="filter" size={13} /> Nur mit Kontakt
                </button>
                <button
                  className={cx("inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs",
                    autoEnrich ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]")}
                  onClick={toggleAuto} title="Treffer nach jeder Suche automatisch anreichern">
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
                <button className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  onClick={() => setSelected((p) => p.size >= displayLeads.length && displayLeads.length > 0 ? new Set() : new Set(displayLeads.map(dedupeKey)))}>
                  {selected.size >= displayLeads.length && displayLeads.length > 0 ? "Auswahl aufheben" : "Alle auswählen"}
                </button>
                <Button onClick={take} disabled={selected.size === 0 || selectableCount === 0}>
                  <Icon name="check" size={15} /> {selected.size} übernehmen
                </Button>
              </div>
            </div>

            {displayLeads.length === 0 ? (
              onlyWithContact && result.leads.length > 0 ? (
                <EmptyState icon="filter" title="Alle ohne Kontakt ausgeblendet">
                  Kein Treffer hat Web/Tel/E-Mail. „Alle anreichern" versuchen oder den Filter „Nur mit Kontakt" deaktivieren.
                </EmptyState>
              ) : (
                <EmptyState icon="search" title="Keine Treffer">Umkreis vergrößern oder andere Branchen wählen.</EmptyState>
              )
            ) : (
              <Card className="overflow-hidden">
                {displayLeads.map((l, i) => {
                  const key = dedupeKey(l); const isTaken = taken.has(key); const host = hostFromUrl(l.website);
                  return (
                    <div key={key} className={cx("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-[var(--color-line)]", isTaken && "bg-[var(--color-success-tint)]/30")}>
                      <input type="checkbox" checked={selected.has(key)} disabled={isTaken} onChange={() => toggle(key)} className="h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{l.name ?? "Ohne Namen"}</span>
                          {l.objektTyp && <Badge tone="slate">{l.objektTyp}</Badge>}
                          {l.enrichmentSource && <Badge tone="blue">angereichert</Badge>}
                          {isTaken && <Badge tone="green">übernommen</Badge>}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--color-muted)]">
                          {(l.strasse || l.ort) && <span className="truncate">{[l.strasse, l.ort].filter(Boolean).join(", ")}</span>}
                          {l.phone ? <a href={l.phoneE164 ? `tel:${l.phoneE164}` : undefined} className="inline-flex items-center gap-1 text-[var(--color-success)] tnum"><Icon name="phone" size={12} /> {l.phone}</a> : <span className="text-[var(--color-faint)]">keine Nummer</span>}
                          {l.ansprechpartner && <span>{l.ansprechpartner}</span>}
                          {host && <span className="truncate text-[var(--color-faint)]">{host}</span>}
                        </div>
                      </div>
                      {!l.enrichmentSource && l.name && (
                        <Button variant="ghost" size="sm" disabled={enrichingKey === key} onClick={() => enrich(l)}
                          title={l.website ? "Impressum auslesen" : "Website per Web-Suche finden und auslesen"}>
                          {enrichingKey === key ? <Spinner size={13} /> : l.website ? "Anreichern" : "Tiefensuche"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </Card>
            )}
          </div>
        )}

        {!result && !searching && (
          <EmptyState icon="search" title="Bereit zur Suche">
            PLZ + Zielbranchen (oder Stichwort) wählen und „Suchen". Treffer landen hier – die besten übernimmst du in die Pipeline.
          </EmptyState>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
