"use client";
import dynamic from "next/dynamic";

// Interaktiver Kalkulator erst clientseitig nachladen (raus aus dem kritischen
// Initial-JS) – mit höhengleichem Platzhalter gegen Layout-Sprünge.
const Kalkulator = dynamic(() => import("@/components/Kalkulator").then((m) => m.Kalkulator), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
      style={{ minHeight: 560 }}
      aria-hidden="true"
    />
  ),
});

export function LazyKalkulator(props: { teaser?: boolean }) {
  return <Kalkulator {...props} />;
}
