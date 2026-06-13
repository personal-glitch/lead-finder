"use client";
import { useState } from "react";
import { api } from "@/lib/client";

interface AuditResult {
  reachable: boolean;
  reason?: string;
  url?: string;
  performance?: number | null;
  seo?: number | null;
  bestPractices?: number | null;
  https?: boolean;
  mobileFriendly?: boolean;
  loadMs?: number;
  title?: string | null;
  grade?: string;
  estimated?: boolean;
  opportunity?: boolean;
}

const gradeColor = (g?: string) =>
  g === "A" || g === "B" ? "var(--color-success)" : g === "C" ? "var(--color-warn)" : "var(--color-danger)";

// Bewertet die Website eines Leads (Google PageSpeed). Für Webdesign-/SEO-Verkäufer.
export function WebsiteAudit({ url }: { url: string | null | undefined }) {
  const [res, setRes] = useState<AuditResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setErr(null); setRes(null);
    try {
      const r = await api<AuditResult>("/api/website-audit", { json: { url: url || "" } });
      setRes(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prüfung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--color-ink)]">Website-Check</span>
        <button
          onClick={run}
          disabled={busy || !url}
          className="rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-xs font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-50"
        >
          {busy ? "Prüfe… (kann ~20 s dauern)" : "Website bewerten"}
        </button>
      </div>
      {!url && <p className="mt-1.5 text-xs text-[var(--color-muted)]">Keine Website hinterlegt – zuerst anreichern. Keine Website = oft die beste Verkaufschance.</p>}
      {err && <p className="mt-2 text-xs text-[var(--color-danger)]">{err}</p>}
      {res && !res.reachable && (
        <p className="mt-2 rounded-lg bg-[var(--color-warn-tint)] px-2.5 py-1.5 text-xs text-[var(--color-warn)]">⚠ {res.reason}</p>
      )}
      {res && res.reachable && (
        <div className="mt-2.5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-bold text-white" style={{ background: gradeColor(res.grade) }}>
              {res.grade}
            </span>
            <div className="text-xs">
              {res.performance != null ? (
                <div><b>Performance:</b> {res.performance}/100{res.seo != null && <> · <b>SEO:</b> {res.seo}/100</>}</div>
              ) : (
                <div><b>Note:</b> {res.grade}{res.loadMs != null && <> · Ladezeit {(res.loadMs / 1000).toFixed(1)} s</>}</div>
              )}
              <div className="text-[var(--color-muted)]">
                {res.https ? "🔒 HTTPS" : "❌ kein HTTPS"} · {res.mobileFriendly ? "📱 mobil-tauglich" : "❌ nicht mobil"}
              </div>
            </div>
          </div>
          {res.estimated && (
            <p className="text-[11px] text-[var(--color-faint)]">Schnell-Einschätzung (HTTPS, Mobil, Ladezeit). Für vollen PageSpeed-Score API-Schlüssel hinterlegen.</p>
          )}
          {res.opportunity && (
            <p className="rounded-lg bg-[var(--color-brand-tint)]/30 px-2.5 py-1.5 text-xs font-medium text-[var(--color-brand-ink)]">
              💡 Schwache Website – starker Aufhänger fürs Verkaufsgespräch.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
