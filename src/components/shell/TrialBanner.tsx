"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Icon } from "../icons";

interface Sub { status: string | null; renewsAt: string | null; cancelAtPeriodEnd: boolean }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "long" });
}

/** Dezenter Hinweis im Tool: Test-Countdown bzw. Kündigungs-Auslauf. */
export function TrialBanner() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    api<{ subscription?: Sub }>("/api/stats").then((r) => setSub(r.subscription ?? null)).catch(() => {});
  }, []);

  if (!sub || closed) return null;
  const days = sub.renewsAt ? Math.ceil((new Date(sub.renewsAt).getTime() - Date.now()) / 86_400_000) : null;

  // Gekündigt – läuft aus.
  if (sub.cancelAtPeriodEnd && sub.status !== "canceled" && sub.renewsAt && days != null && days >= 0) {
    return (
      <Bar tone="muted" onClose={() => setClosed(true)}>
        Dein Abo ist gekündigt und endet am <strong>{fmt(sub.renewsAt)}</strong>.{" "}
        <Link href="/einstellungen" className="font-medium underline">Reaktivieren</Link>
      </Bar>
    );
  }

  // Test läuft.
  if (sub.status === "trialing" && sub.renewsAt && days != null && days >= 0) {
    const when = days === 0 ? "heute" : days === 1 ? "morgen" : `in ${days} Tagen`;
    return (
      <Bar tone={days <= 1 ? "warn" : "brand"} onClose={() => setClosed(true)}>
        Dein kostenloser Test endet <strong>{when}</strong> ({fmt(sub.renewsAt)}) – danach läuft dein Abo zu 49 €/Monat
        automatisch weiter, jederzeit kündbar.{" "}
        <Link href="/einstellungen" className="font-medium underline">Abo verwalten</Link>
      </Bar>
    );
  }
  return null;
}

function Bar({ children, tone, onClose }: { children: React.ReactNode; tone: "brand" | "warn" | "muted"; onClose: () => void }) {
  const cls =
    tone === "warn" ? "border-[var(--color-warn)]/40 bg-[var(--color-warn-tint)]/40 text-[var(--color-ink)]"
    : tone === "brand" ? "border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/25 text-[var(--color-ink)]"
    : "border-[var(--color-line)] bg-[var(--color-subtle)] text-[var(--color-ink-2)]";
  return (
    <div className={`flex items-center gap-3 border-b px-4 py-2 text-xs sm:px-7 ${cls}`}>
      <Icon name="clock" size={14} />
      <span className="min-w-0 flex-1">{children}</span>
      <button type="button" onClick={onClose} aria-label="Hinweis schließen" className="shrink-0 opacity-60 hover:opacity-100">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
