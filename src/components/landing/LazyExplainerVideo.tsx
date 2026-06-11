"use client";
import dynamic from "next/dynamic";

// Erklärvideo liegt weit unten – erst clientseitig nachladen.
const ExplainerVideo = dynamic(
  () => import("@/components/landing/ExplainerVideo").then((m) => m.ExplainerVideo),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
        style={{ minHeight: 280 }}
        aria-hidden="true"
      />
    ),
  },
);

export function LazyExplainerVideo() {
  return <ExplainerVideo />;
}
