"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shell/AppShell";
import { Button, Card, EmptyState, Spinner, TextInput, Toast } from "@/components/ui";
import { Icon } from "@/components/icons";
import { api } from "@/lib/client";

interface Job {
  refnr: string | null;
  title: string;
  company: string | null;
  plz: string | null;
  ort: string | null;
  postedDate: string | null;
  daysOpen: number | null;
}

export default function StellenPage() {
  const [was, setWas] = useState("");
  const [wo, setWo] = useState("");
  const [umkreis, setUmkreis] = useState(25);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const search = async () => {
    setBusy(true);
    try {
      const r = await api<{ jobs: Job[] }>("/api/jobs/search", {
        json: { was: was.trim() || undefined, wo: wo.trim() || undefined, umkreis },
      });
      // Längste Laufzeit zuerst = dringendster Bedarf = heißester Lead.
      const sorted = [...r.jobs].sort((a, b) => (b.daysOpen ?? -1) - (a.daysOpen ?? -1));
      setJobs(sorted);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Stellensuche fehlgeschlagen.");
      setJobs([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Offene Stellen finden" subtitle="Firmen, die Personal suchen – über die offizielle Jobsuche-API der Bundesagentur für Arbeit" />
      <div className="space-y-5 p-4 sm:p-7">
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--color-muted)]">Beruf / Stichwort</span>
              <TextInput value={was} onChange={(e) => setWas(e.target.value)} placeholder="z. B. Pflegekraft, Lagerhelfer, Elektriker" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--color-muted)]">Ort / PLZ</span>
              <TextInput value={wo} onChange={(e) => setWo(e.target.value)} placeholder="z. B. 50667 Köln" />
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
            Tipp: Lange laufende Anzeigen stehen oben – die Firma sucht dort am dringendsten.
          </p>
        </Card>

        {busy ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Suche läuft …</div>
        ) : jobs === null ? (
          <EmptyState icon="search" title="Bereit zur Suche">
            Beruf und Ort eingeben – KundenRadar zeigt dir Firmen mit offenen Stellen und seit wann sie suchen.
          </EmptyState>
        ) : jobs.length === 0 ? (
          <EmptyState icon="search" title="Keine Treffer">Andere Suchbegriffe oder größeren Umkreis versuchen.</EmptyState>
        ) : (
          <Card className="overflow-hidden p-0">
            {jobs.map((j, i) => (
              <div key={(j.refnr ?? "") + i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-[var(--color-line)]" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{j.company ?? "Unbekannte Firma"}</div>
                  <div className="truncate text-xs text-[var(--color-muted)]">
                    {j.title}{(j.ort || j.plz) && <> · {[j.plz, j.ort].filter(Boolean).join(" ")}</>}
                  </div>
                </div>
                {j.daysOpen != null && (
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    j.daysOpen >= 30 ? "bg-[var(--color-danger-tint)] text-[var(--color-danger)]"
                    : j.daysOpen >= 14 ? "bg-[var(--color-warn-tint)] text-[var(--color-warn)]"
                    : "bg-[var(--color-subtle)] text-[var(--color-muted)]"}`}>
                    sucht seit {j.daysOpen} Tagen
                  </span>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
