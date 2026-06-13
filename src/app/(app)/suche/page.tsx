"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EnrichmentExtra, LeadInput, PipelineStage } from "@/lib/types";
import { api } from "@/lib/client";
import { dedupeKey, hostFromUrl } from "@/lib/dedupe";
import { type BrancheKey } from "@/lib/leadgen/branchen-catalog";
import { PageHeader, refreshStats } from "@/components/shell/AppShell";
import { usePersona } from "@/components/use-persona";
import { TargetPicker } from "@/components/agents/TargetPicker";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, Drawer, EmptyState, Field, Spinner, TextInput, Toast, cx } from "@/components/ui";
import { LeadContactWays } from "@/components/LeadContactWays";
import { WebsiteAudit } from "@/components/WebsiteAudit";

interface AuditResult {
  reachable: boolean; reason?: string; performance?: number | null; seo?: number | null;
  https?: boolean; mobileFriendly?: boolean; loadMs?: number; grade?: string; estimated?: boolean; opportunity?: boolean;
}
const gradeBg = (g?: string) => (g === "A" || g === "B" ? "var(--color-success)" : g === "C" ? "var(--color-warn)" : "var(--color-danger)");

// Antwort-Form der Anreicherung (inkl. v2-Listen).
interface EnrichResp {
  phone?: string | null; phoneE164?: string | null; email?: string | null;
  ansprechpartner?: string | null; website?: string | null;
  extra?: EnrichmentExtra | null; enrichmentSource?: string | null;
}

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
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [detail, setDetail] = useState<LeadInput | null>(null);
  const [knownKeys, setKnownKeys] = useState<Set<string>>(new Set());
  const { persona } = usePersona();
  const webdesign = persona?.features.websiteAudit === true;
  const [audits, setAudits] = useState<Record<string, AuditResult>>({});
  const [auditingKey, setAuditingKey] = useState<string | null>(null);
  const [auditingAll, setAuditingAll] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    api<{ stages: PipelineStage[] }>("/api/stages").then((s) => setStageId(s.stages[0]?.id ?? null)).catch(() => {});
    // Bereits gespeicherte Leads laden – für Dubletten-Warnung in den Treffern.
    api<{ leads: LeadInput[] }>("/api/leads").then((r) => setKnownKeys(new Set(r.leads.map(dedupeKey)))).catch(() => {});
    try { const v = localStorage.getItem("kr-auto-enrich"); if (v !== null) setAutoEnrich(v === "1"); } catch {}
  }, []);

  const toggleAuto = () => setAutoEnrich((v) => {
    const nv = !v;
    try { localStorage.setItem("kr-auto-enrich", nv ? "1" : "0"); } catch {}
    return nv;
  });

  const toggleBranche = (b: BrancheKey) => setBranchen((p) => { const n = new Set(p); n.has(b) ? n.delete(b) : n.add(b); return n; });

  const keywordList = keyword.split(/[;,\n]/).map((k) => k.trim()).filter(Boolean);

  const search = async (plzArg?: string) => {
    const override = typeof plzArg === "string" ? plzArg : undefined;
    const p = (override ?? plz).trim();
    if (!p || (branchen.size === 0 && keywordList.length === 0)) return;
    setSearching(true); setResult(null);
    const payload = { plz: p, radiusKm, branchen: [...branchen], keywords: keywordList };
    try {
      const res = await api<SearchResult>("/api/leads/search", { json: payload });
      setResult(res); setSelected(new Set(res.leads.map(dedupeKey).filter((k) => !knownKeys.has(k)))); setTaken(new Set());
      // Automatisch anreichern (Hintergrund), außer bei Beispieldaten.
      if (autoEnrich && !res.demo) void runEnrich(res.leads, true);
    } catch (e) { setToast(e instanceof Error ? e.message : "Suche fehlgeschlagen."); }
    finally { setSearching(false); }
  };

  // Geführte Beispiel-Suche: kommt der Nutzer mit ?demo aus dem Dashboard,
  // wird eine echte Beispielstadt vorbelegt und sofort gesucht (Aha-Moment).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("demo")) {
      setPlz("Köln");
      void search("Köln");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyEnrichment = (key: string, e: EnrichResp) => {
    const patch = (l: LeadInput): LeadInput => dedupeKey(l) === key ? {
      ...l, phone: e.phone ?? l.phone, phoneE164: e.phoneE164 ?? l.phoneE164,
      email: e.email ?? l.email, ansprechpartner: e.ansprechpartner ?? l.ansprechpartner,
      website: e.website ?? l.website,
      enrichmentExtra: e.extra ?? l.enrichmentExtra,
      enrichmentSource: (e.enrichmentSource as "web") ?? l.enrichmentSource,
    } : l;
    setResult((r) => r ? { ...r, leads: r.leads.map(patch) } : r);
    // Offenes Detail-Fenster live mitziehen.
    setDetail((d) => (d && dedupeKey(d) === key ? patch(d) : d));
  };

  // Anreichern eines einzelnen Treffers. Hat der Treffer keine Website, wird sie
  // serverseitig per Web-Suche aus Name + Ort ermittelt und danach gescrapt.
  const enrich = async (input: LeadInput) => {
    const key = dedupeKey(input); setEnrichingKey(key);
    try {
      const { enrichment } = await api<{ enrichment: EnrichResp }>("/api/leads/enrich", {
        json: { website: input.website ?? undefined, branche: input.objektTyp, name: input.name, ort: input.ort },
      });
      applyEnrichment(key, enrichment);
      if (!enrichment.phone && !enrichment.email && !enrichment.ansprechpartner) {
        setToast("Keine zusätzlichen Kontaktdaten gefunden.");
      }
    } catch (e) { setToast(e instanceof Error ? e.message : "Anreicherung fehlgeschlagen."); }
    finally { setEnrichingKey(null); }
  };

  // Website eines Treffers bewerten (für Webdesign-Persona). Note erscheint inline.
  const auditOne = async (l: LeadInput) => {
    if (!l.website) return;
    const key = dedupeKey(l); setAuditingKey(key);
    try {
      const r = await api<AuditResult>("/api/website-audit", { json: { url: l.website } });
      setAudits((p) => ({ ...p, [key]: r }));
    } catch (e) { setToast(e instanceof Error ? e.message : "Website-Check fehlgeschlagen."); }
    finally { setAuditingKey(null); }
  };

  // Alle sichtbaren Treffer mit Website bewerten (schonende Nebenläufigkeit).
  const auditAll = async () => {
    const targets = displayLeads.filter((l) => l.website && !audits[dedupeKey(l)]);
    if (targets.length === 0) { setToast("Nichts zu bewerten – Treffer haben keine Website oder sind schon geprüft."); return; }
    setAuditingAll(true);
    let idx = 0;
    const worker = async () => {
      while (idx < targets.length) {
        const l = targets[idx++]; const key = dedupeKey(l);
        try { const r = await api<AuditResult>("/api/website-audit", { json: { url: l.website } }); setAudits((p) => ({ ...p, [key]: r })); }
        catch { /* einzelne überspringen */ }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, targets.length) }, worker));
    setAuditingAll(false);
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
          const { enrichment } = await api<{ enrichment: EnrichResp }>("/api/leads/enrich", {
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
    let r = result.leads;
    if (onlyWithContact) r = r.filter(hasContact);
    if (onlyNoWebsite) r = r.filter((l) => !l.website);
    return r;
  }, [result, onlyWithContact, onlyNoWebsite]);
  const hiddenCount = result ? result.leads.length - displayLeads.length : 0;
  const selectableCount = useMemo(() => displayLeads.filter((l) => !taken.has(dedupeKey(l))).length, [displayLeads, taken]);
  const canSearch = plz.trim().length > 0 && (branchen.size > 0 || keywordList.length > 0) && !searching;

  return (
    <>
      <PageHeader
        title={persona?.features.jobs ? "Firmen finden" : (persona?.searchTitle ?? "Suche")}
        subtitle={persona?.features.jobs
          ? "Firmen per Branche & Umkreis. Tipp: Firmen mit offenen Stellen findest du unter 'Stellen'."
          : (persona?.searchHint ?? "Direkt passende Firmen finden – ohne gespeicherten Agenten")} />
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
          <Button onClick={() => search()} disabled={!canSearch}>
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
                {webdesign && (
                  <button
                    className={cx("inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs",
                      onlyNoWebsite ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]")}
                    onClick={() => setOnlyNoWebsite((v) => !v)}>
                    ★ Nur ohne Website
                  </button>
                )}
                {webdesign && (
                  <Button variant="ghost" size="sm" onClick={auditAll} disabled={auditingAll}>
                    {auditingAll ? <Spinner size={13} /> : <Icon name="globe" size={14} />} Websites bewerten
                  </Button>
                )}
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
                  const isKnown = knownKeys.has(key) && !isTaken;
                  return (
                    <div key={key} className={cx("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-[var(--color-line)]", isTaken && "bg-[var(--color-success-tint)]/30")}>
                      <input type="checkbox" checked={selected.has(key)} disabled={isTaken} onChange={() => toggle(key)} className="h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setDetail(l)} title="Details anzeigen">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{l.name ?? "Ohne Namen"}</span>
                          {l.objektTyp && <Badge tone="slate">{l.objektTyp}</Badge>}
                          {l.enrichmentSource && <Badge tone="blue">angereichert</Badge>}
                          {isTaken && <Badge tone="green">übernommen</Badge>}
                          {isKnown && <span className="rounded-full bg-[var(--color-warn-tint)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-warn)]">schon gespeichert</span>}
                          {webdesign && !l.website && <span className="rounded-full bg-[var(--color-brand-tint)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-brand-ink)]">★ keine Website</span>}
                          {webdesign && l.website && audits[key] && audits[key].reachable && (
                            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ background: gradeBg(audits[key].grade) }}>
                              Note {audits[key].grade}
                              {audits[key].performance != null ? ` · ${audits[key].performance}` : audits[key].loadMs != null ? ` · ${(audits[key].loadMs! / 1000).toFixed(1)}s` : ""}
                              {!audits[key].https && " · kein HTTPS"}
                            </span>
                          )}
                          {webdesign && l.website && audits[key] && !audits[key].reachable && (
                            <span className="rounded-full bg-[var(--color-danger-tint)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-danger)]">Seite nicht erreichbar</span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--color-muted)]">
                          {(l.strasse || l.ort) && <span className="truncate">{[l.strasse, l.ort].filter(Boolean).join(", ")}</span>}
                          {l.phone ? <a href={l.phoneE164 ? `tel:${l.phoneE164}` : undefined} className="inline-flex items-center gap-1 text-[var(--color-success)] tnum"><Icon name="phone" size={12} /> {l.phone}</a> : <span className="text-[var(--color-faint)]">keine Nummer</span>}
                          {l.ansprechpartner && <span>{l.ansprechpartner}</span>}
                          {host && l.website && (
                            <a href={l.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="inline-flex max-w-[180px] items-center gap-0.5 truncate text-[var(--color-brand)] hover:underline" title={l.website}>
                              {host} <Icon name="external" size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                      {webdesign && l.website && !audits[key] && (
                        <Button variant="ghost" size="sm" disabled={auditingKey === key} onClick={() => auditOne(l)} title="Website-Note & Ladezeit prüfen">
                          {auditingKey === key ? <Spinner size={13} /> : <><Icon name="globe" size={14} /> Speedtest</>}
                        </Button>
                      )}
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

      {detail && (
        <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail.name ?? "Treffer"} subtitle={detail.objektTyp ?? undefined}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {detail.objektTyp && <Badge tone="slate">{detail.objektTyp}</Badge>}
              {detail.enrichmentSource && <Badge tone="blue">angereichert</Badge>}
            </div>
            {(detail.strasse || detail.ort) && (
              <p className="text-sm text-[var(--color-muted)]">
                {[detail.strasse, [detail.plz, detail.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="grid grid-cols-1 gap-2 text-sm">
              {detail.phone && <a href={detail.phoneE164 ? `tel:${detail.phoneE164}` : undefined} className="inline-flex items-center gap-2 text-[var(--color-success)] tnum"><Icon name="phone" size={14} /> {detail.phone}</a>}
              {detail.email && <a href={`mailto:${detail.email}`} className="inline-flex items-center gap-2 text-[var(--color-brand)] hover:underline"><Icon name="mail" size={14} /> {detail.email}</a>}
              {detail.ansprechpartner && <span className="inline-flex items-center gap-2"><Icon name="user" size={14} /> {detail.ansprechpartner}</span>}
              {detail.website && <a href={detail.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-[var(--color-brand)] hover:underline"><Icon name="globe" size={14} /> {hostFromUrl(detail.website) ?? detail.website}</a>}
            </div>

            {webdesign && <WebsiteAudit url={detail.website} />}

            <LeadContactWays extra={detail.enrichmentExtra} />

            {!detail.enrichmentSource && detail.name && (
              <Button variant="ghost" size="sm" disabled={enrichingKey === dedupeKey(detail)}
                onClick={() => enrich(detail)}>
                {enrichingKey === dedupeKey(detail) ? <Spinner size={13} /> : detail.website ? "Anreichern" : "Tiefensuche (Web)"}
              </Button>
            )}
            {detail.enrichmentSource && !detail.enrichmentExtra && (
              <p className="text-xs text-[var(--color-muted)]">Angereichert – keine weiteren Kontaktwege gefunden.</p>
            )}
            <p className="text-xs text-[var(--color-faint)]">Tipp: Mit „Übernehmen" landet dieser Treffer samt aller Kontaktwege in deiner Pipeline.</p>
          </div>
        </Drawer>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
