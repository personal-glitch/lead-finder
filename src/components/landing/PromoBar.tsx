"use client";
import { useEffect, useState } from "react";
import { PROMO } from "@/lib/promo";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s, done: ms === 0 };
}
const pad = (n: number) => String(n).padStart(2, "0");

/** Schlanke Aktions-Leiste ganz oben mit Live-Countdown. */
export function PromoBar() {
  const target = new Date(PROMO.endsAt).getTime();
  const [t, setT] = useState(() => diff(target));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!PROMO.active) return null;
  // Vor Hydration nichts Abweichendes rendern (kein Flackern); nach Ablauf ausblenden.
  if (mounted && t.done) return null;

  return (
    <div className="w-full bg-[var(--color-brand)] text-[var(--color-on-brand)]">
      <a href="#preise" className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-semibold">
        <span>🚀 Frühbucher: nur {PROMO.price}/Monat statt {PROMO.regular} – für die ersten {PROMO.slots}.</span>
        <span className="tnum tabular-nums opacity-90">
          Endet in {t.d > 0 ? `${t.d}T ` : ""}{pad(t.h)}:{pad(t.m)}:{pad(t.s)}
        </span>
      </a>
    </div>
  );
}
