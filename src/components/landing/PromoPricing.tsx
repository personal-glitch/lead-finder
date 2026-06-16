"use client";
import { useEffect, useState } from "react";
import { PROMO } from "@/lib/promo";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
    done: ms === 0,
  };
}
const pad = (n: number) => String(n).padStart(2, "0");

function Unit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[58px] rounded-lg bg-[var(--color-canvas)] px-2 py-1.5 text-2xl font-bold tabular-nums text-[var(--color-brand)]">{pad(v)}</span>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
    </div>
  );
}

/** Frühbucher-Box mit Live-Countdown + Rabattcode, in der Preise-Sektion. */
export function PromoPricing() {
  const target = new Date(PROMO.endsAt).getTime();
  const [t, setT] = useState(() => diff(target));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!PROMO.active) return null;
  if (mounted && t.done) return null;

  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-[var(--color-brand)] bg-[var(--color-brand-tint)]/15 p-6 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand)] px-3 py-1 text-xs font-semibold text-[var(--color-on-brand)]">
        🚀 Frühbucher-Aktion
      </span>
      <div className="mt-3 flex items-center justify-center gap-3">
        <span className="text-2xl font-medium text-[var(--color-muted)] line-through">{PROMO.regular}</span>
        <span className="text-4xl font-bold text-[var(--color-brand)]">{PROMO.price}</span>
        <span className="text-sm text-[var(--color-muted)]">/Monat</span>
      </div>
      <p className="mt-1 text-xs text-[var(--color-faint)]">Endpreis · keine USt. (Kleinunternehmer, § 19 UStG)</p>
      <p className="mt-1.5 text-sm text-[var(--color-ink-2)]">
        Nur für die <strong>ersten {PROMO.slots} Kunden</strong> – danach dauerhaft {PROMO.price}/Monat.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Unit v={t.d} label="Tage" />
        <span className="text-2xl font-bold text-[var(--color-muted)]">:</span>
        <Unit v={t.h} label="Std" />
        <span className="text-2xl font-bold text-[var(--color-muted)]">:</span>
        <Unit v={t.m} label="Min" />
        <span className="text-2xl font-bold text-[var(--color-muted)]">:</span>
        <Unit v={t.s} label="Sek" />
      </div>
      <p className="mt-4 text-sm text-[var(--color-ink-2)]">
        Code beim Bezahlen eingeben:{" "}
        <span className="rounded-md border border-dashed border-[var(--color-brand)] bg-[var(--color-canvas)] px-2.5 py-1 font-mono text-base font-bold tracking-wider text-[var(--color-brand)]">{PROMO.code}</span>
      </p>
    </div>
  );
}
