"use client";
import { useEffect, useState } from "react";
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

// Zeigt offene Stellenanzeigen der Firma (offizielle Jobsuche-API der Bundesagentur).
// Nur für die Persona „Personalvermittlung / Zeitarbeit". Kein Scraping.
export function LeadJobs({ company, ort, plz }: { company: string | null | undefined; ort?: string | null; plz?: string | null }) {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!company) { setJobs([]); return; }
    let cancelled = false;
    setBusy(true); setErr(null); setJobs(null);
    const wo = [plz, ort].filter(Boolean).join(" ").trim() || undefined;
    api<{ jobs: Job[] }>("/api/jobs/search", { json: { arbeitgeber: company, wo, umkreis: 25, size: 10 } })
      .then((r) => { if (!cancelled) setJobs([...r.jobs].sort((a, b) => (b.daysOpen ?? -1) - (a.daysOpen ?? -1))); })
      .catch((e) => { if (!cancelled) setErr(e instanceof Error ? e.message : "Stellensuche fehlgeschlagen."); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [company, ort, plz]);

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--color-ink)]">Offene Stellen dieser Firma</span>
        {jobs && jobs.length > 0 && <span className="text-[11px] text-[var(--color-muted)]">{jobs.length} gefunden</span>}
      </div>
      {busy && <p className="text-xs text-[var(--color-muted)]">Suche offene Stellen …</p>}
      {err && <p className="text-xs text-[var(--color-danger)]">{err}</p>}
      {jobs && jobs.length === 0 && !busy && (
        <p className="text-xs text-[var(--color-muted)]">Aktuell keine offene Stelle gefunden – kann sich täglich ändern.</p>
      )}
      {jobs && jobs.length > 0 && (
        <ul className="space-y-1.5">
          {jobs.map((j, i) => (
            <li key={(j.refnr ?? "") + i} className="flex items-center gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-[var(--color-ink)]">{j.title}</span>
              {j.daysOpen != null && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  j.daysOpen >= 30 ? "bg-[var(--color-danger-tint)] text-[var(--color-danger)]"
                  : j.daysOpen >= 14 ? "bg-[var(--color-warn-tint)] text-[var(--color-warn)]"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)]"}`}>
                  seit {j.daysOpen} T
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {jobs && jobs.length > 0 && jobs.some((j) => (j.daysOpen ?? 0) >= 14) && (
        <p className="mt-2 rounded-lg bg-[var(--color-brand-tint)]/30 px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-brand-ink)]">
          💡 Sucht schon länger – idealer Zeitpunkt für deinen Anruf.
        </p>
      )}
    </div>
  );
}
