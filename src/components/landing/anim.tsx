"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/ui";

/** Blendet Inhalt sanft ein, sobald er in den Viewport scrollt. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.1 },
    );
    io.observe(el);
    // Sicherheitsnetz: Inhalt niemals dauerhaft unsichtbar lassen.
    const fallback = setTimeout(() => setShown(true), 1000);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cx("transition-all duration-700 ease-out", shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0", className)}
    >
      {children}
    </div>
  );
}

/** Zählt beim Sichtbarwerden von 0 auf `to` hoch. */
export function CountUp({ to, suffix = "", duration = 1200 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            setVal(Math.round(p * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className="tnum">{val}{suffix}</span>;
}

/** Balken, der beim Sichtbarwerden von 0 auf die Zielbreite wächst. */
export function GrowBar({ widthPct, color }: { widthPct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setGrown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGrown(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="h-3 overflow-hidden rounded-full bg-[var(--color-subtle)]">
      <div className="h-full rounded-full transition-[width] duration-1000 ease-out" style={{ width: grown ? `${widthPct}%` : "0%", background: color }} />
    </div>
  );
}

const STATS: { node: ReactNode; label: string }[] = [
  { node: <CountUp to={50} suffix="+" />, label: "Branchen im Katalog" },
  { node: "Direktkontakt", label: "Telefon + Ansprechpartner" },
  { node: "1 Tool", label: "statt Excel, Google & Zettel" },
  { node: "DSGVO-konform", label: "EU-Hosting & Opt-out" },
];

export function StatStrip() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-surface)]/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="text-center">
            <div className="text-2xl font-semibold text-[var(--color-brand)]">{s.node}</div>
            <div className="mt-1 text-xs text-[var(--color-muted)]">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
