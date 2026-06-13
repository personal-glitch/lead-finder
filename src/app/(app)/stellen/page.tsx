"use client";
import { useMemo, useState } from "react";
import { PageHeader, refreshStats } from "@/components/shell/AppShell";
import { Button, Card, EmptyState, Spinner, TextInput, Toast } from "@/components/ui";
import { Icon } from "@/components/icons";
import { api } from "@/lib/client";

interface Job {
  refnr: string | null;
  title: string;
  company: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  region: string | null;
  postedDate: string | null;
  daysOpen: number | null;
}

interface EnrichResp {
  phone?: string | null; phoneE164?: string | null; email?: string | null;
  ansprechpartner?: string | null; website?: string | null;
}

// Eine Firma mit allen ihren offenen Stellen (gruppiert).
interface Firm {
  company: string;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  titles: string[];
  maxDaysOpen: number | null;
  enrich?: EnrichResp;
  enriching?: boolean;
  saved?: boolean;
}

function groupByFirm(jobs: Job[]): Firm[] {
  const map = new Map<string, Firm>();
  for (const j of jobs) {
    const name = (j.company ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase() + "|" + (j.ort ?? "");
    const ex = map.get(key);
    if (ex) {
      if (!ex.titles.includes(j.title)) ex.titles.push(j.title);
      if ((j.daysOpen ?? -1) > (ex.maxDaysOpen ?? -1)) ex.maxDaysOpen = j.daysOpen;
      if (!ex.strasse && j.strasse) ex.strasse = j.strasse;
    } else {
      map.set(key, { company: name, strasse: j.strasse, plz: j.plz, ort: j.ort, titles: [j.title], maxDaysOpen: j.daysOpen });
    }
  }
  // Längste Laufzeit zuerst = dringendster Bedarf.
  return [...map.values()].sort((a, b) => (b.maxDaysOpen ?? -1) - (a.maxDaysOpen ?? -1));
}

export default function StellenPage() {
  const [was, setWas] = useState("");
  const [wo, setWo] = useState("");
  const [umkreis, setUmkreis] = useState(25);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const search = async () => {
    setBusy(true);
    try {
      const r = await api<{ jobs: Job[] }>("/api/jobs/search", {
        json: { was: was.trim() || undefined, wo: wo.trim() || undefined, umkreis, size: 50 },
      });
      setJobs(r.jobs);
      setFirms(groupByFirm(r.jobs));
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Stellensuche fehlgeschlagen.");
      setJobs([]); setFirms([]);
    } finally {
      setBusy(false);
    }
  };

  const totalOpen = useMemo(() => jobs?.length ?? 0, [jobs]);

  const update = (i: number, patch: Partial<Firm>) => setFirms((p) => p.map((f, k) => (k === i ? { ...f, ...patch } : f)));

  // Kontaktdaten der suchenden Firma ermitteln (Website per Web-Suche + Impressum).
  const enrichFirm = async (i: number) => {
    const f = firms[i];
    update(i, { enriching: true });
    try {
      const { enrichment } = await api<{ enrichment: EnrichResp }>("/api/leads/enrich", {
        json: { name: f.company, ort: f.ort ?? (wo.trim() || undefined) },
      });
      update(i, { enrich: enrichment, enriching: false });
      if (!enrichment.phone && !enrichment.email && !enrichment.website && !enrichment.ansprechpartner) {
        setToast(`Für ${f.company} keine öffentlichen Kontaktdaten gefunden.`);
      }
    } catch (e) {
      update(i, { enriching: false });
      setToast(e instanceof Error ? e.message : "Anreicherung fehlgeschlagen.");
    }
  };

  // Firma als Lead in die Pipeline übernehmen.
  const saveFirm = async (i: number) => {
    const f = firms[i];
    const e = f.enrich ?? {};
    const input = {
      name: f.company,
      objektTyp: "Offene Stelle",
      strasse: f.strasse ?? null,
      plz: f.plz ?? null,
      ort: f.ort ?? null,
      phone: e.phone ?? null,
      phoneE164: e.phoneE164 ?? null,
      email: e.email ?? null,
      ansprechpartner: e.ansprechpartner ?? null,
      website: e.website ?? null,
      source: "manual" as const,
    };
    try {
      await api("/api/leads", { json: { inputs: [input] } });
      update(i, { saved: true }); refreshStats();
      setToast(`${f.company} in die Pipeline übernommen.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Übernehmen fehlgeschlagen.");
    }
  };

  return (
    <>
      <PageHeader title="Offene Stellen finden" subtitle="Firmen, die Personal suchen – über die offizielle Jobsuche-API der Bundesagentur für Arbeit. Pro Firma findest du Kontakt & übernimmst sie in die Pipeline." />
      <div className="space-y-5 p-4 sm:p-7">
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--color-muted)]">Beruf / Stichwort</span>
              <TextInput value={was} onChange={(e) => setWas(e.target.value)} placeholder="z. B. Schweißer, Pflegekraft, Lagerhelfer"
                onKeyDown={(e) => e.key === "Enter" && !busy && search()} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--color-muted)]">Ort / PLZ</span>
              <TextInput value={wo} onChange={(e) => setWo(e.target.value)} placeholder="z. B. 50667 Köln"
                onKeyDown={(e) => e.key === "Enter" && !busy && search()} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--color-muted)]">Umkreis (km)</span>
              <TextInput type="number" value={umkreis} onChange={(e) => setUmkreis(Number(e.target.value) || 0)} className="w-24" />
            </label>
            <Button onClick={search} disabled={busy}>
              {busy ? <Spinner size={14} /> : <><Icon name="search" size={15} /> Suchen</>}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-[var(--color-faint)]">
            Firmen mit den am längsten offenen Stellen stehen oben – dort ist der Personalbedarf am dringendsten.
          </p>
        </Card>

        {busy ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Suche läuft …</div>
        ) : jobs === null ? (
          <EmptyState icon="search" title="Bereit zur Suche">
            Beruf und Ort eingeben – KundenRadar zeigt dir Firmen mit offenen Stellen und seit wann sie suchen.
          </EmptyState>
        ) : firms.length === 0 ? (
          <EmptyState icon="search" title="Keine Treffer">Andere Suchbegriffe oder größeren Umkreis versuchen.</EmptyState>
        ) : (
          <>
            <div className="text-sm text-[var(--color-muted)]">
              <span className="font-medium text-[var(--color-ink)] tnum">{firms.length}</span> Firmen · {totalOpen} offene Stellen
            </div>
            <Card className="overflow-hidden p-0">
              {firms.map((f, i) => (
                <div key={f.company + i} className={`px-4 py-3 ${i > 0 ? "border-t border-[var(--color-line)]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{f.company}</span>
                        {f.titles.length > 1 && <span className="rounded-full bg-[var(--color-subtle)] px-2 py-0.5 text-[10px] text-[var(--color-muted)]">{f.titles.length} offene Stellen</span>}
                        {f.maxDaysOpen != null && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            f.maxDaysOpen >= 30 ? "bg-[var(--color-danger-tint)] text-[var(--color-danger)]"
                            : f.maxDaysOpen >= 14 ? "bg-[var(--color-warn-tint)] text-[var(--color-warn)]"
                            : "bg-[var(--color-subtle)] text-[var(--color-muted)]"}`}>
                            sucht seit {f.maxDaysOpen} Tagen
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
                        {f.titles.slice(0, 3).join(" · ")}
                        {(f.strasse || f.ort) && <> · {[f.strasse, [f.plz, f.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</>}
                      </div>
                      {f.enrich && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {f.enrich.phone ? (
                            <a href={f.enrich.phoneE164 ? `tel:${f.enrich.phoneE164}` : undefined} className="inline-flex items-center gap-1 text-[var(--color-success)] tnum"><Icon name="phone" size={12} /> {f.enrich.phone}</a>
                          ) : <span className="text-[var(--color-faint)]">keine Nummer gefunden</span>}
                          {f.enrich.email && <a href={`mailto:${f.enrich.email}`} className="inline-flex items-center gap-1 text-[var(--color-brand)] hover:underline"><Icon name="mail" size={12} /> {f.enrich.email}</a>}
                          {f.enrich.ansprechpartner && <span className="inline-flex items-center gap-1"><Icon name="user" size={12} /> {f.enrich.ansprechpartner}</span>}
                          {f.enrich.website && <a href={f.enrich.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--color-brand)] hover:underline"><Icon name="globe" size={12} /> Website</a>}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      {!f.enrich && (
                        <Button variant="ghost" size="sm" disabled={f.enriching} onClick={() => enrichFirm(i)} title="Telefon, Website & Ansprechpartner finden">
                          {f.enriching ? <Spinner size={13} /> : <><Icon name="bolt" size={13} /> Kontakt finden</>}
                        </Button>
                      )}
                      <Button size="sm" disabled={f.saved} onClick={() => saveFirm(i)}>
                        {f.saved ? <><Icon name="check" size={13} /> übernommen</> : <><Icon name="plus" size={13} /> In Pipeline</>}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
