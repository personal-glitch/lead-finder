"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { cx } from "@/components/ui";

const SCENE_MS = 4000;
const SCENES = 6;

const CAPTIONS = [
  "So gewinnst du neue Aufträge",
  "1 · Branche & Umkreis wählen",
  "2 · Die Live-Recherche findet Firmen",
  "3 · Direktkontakt: Telefon + Ansprechpartner",
  "4 · Anrufen & Termin vereinbaren",
  "Ergebnis: volle Pipeline, mehr Aufträge",
];

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={cx("rounded-full border px-2.5 py-1 text-xs font-medium",
      active ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line-strong)] text-[var(--color-muted)]")}>
      {children}
    </span>
  );
}

function Scene({ s }: { s: number }) {
  switch (s) {
    case 0:
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={26} strokeWidth={2.2} /></span>
          <div className="text-xl font-semibold">So gewinnst du neue Aufträge</div>
          <div className="text-sm text-[var(--color-muted)]">In 4 Schritten – ganz ohne Kaltakquise-Stress.</div>
        </div>
      );
    case 1:
      return (
        <div className="mx-auto w-full max-w-sm space-y-3">
          <div className="rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-subtle)] px-3 py-2 text-sm"><span className="text-[var(--color-faint)]">PLZ / Ort</span> · 50667 Köln · 15 km</div>
          <div className="flex flex-wrap gap-1.5">
            <Pill active>Arztpraxis</Pill><Pill active>Hausverwaltung</Pill><Pill active>Steuerberater</Pill><Pill>Büro</Pill>
          </div>
          <button className="w-full rounded-lg bg-[var(--color-brand)] py-2 text-sm font-semibold text-[var(--color-on-brand)]">Suchen</button>
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <svg className="animate-spin text-[var(--color-brand)]" width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="text-sm text-[var(--color-muted)]">Live-Recherche läuft …</div>
          <div className="text-2xl font-semibold tnum">14 Treffer</div>
        </div>
      );
    case 3:
      return (
        <div className="mx-auto w-full max-w-md space-y-2">
          {[["Zahnarztpraxis Dr. Berg", "0221 1234567", "Frau Berg · Praxisleitung"], ["Hausverw. Rhein GmbH", "0221 9988776", "Hr. Weber · Objektverwalter"], ["Kanzlei Vogt & Partner", "0221 4455667", "Fr. Vogt · Office-Mgmt"]].map(([n, t, p], i) => (
            <div key={n} className="lf-row flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2" style={{ animationDelay: `${i * 220}ms` }}>
              <div className="min-w-0"><div className="truncate text-[13px] font-medium">{n}</div><div className="truncate text-[11px] text-[var(--color-muted)]">{p}</div></div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success)] tnum"><Icon name="phone" size={12} /> {t}</span>
            </div>
          ))}
        </div>
      );
    case 4:
      return (
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-6">
          <div className="flex items-center gap-2 text-sm"><Icon name="phone" size={18} className="text-[var(--color-success)]" /> ruft an: Hausverw. Rhein GmbH</div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <Pill>Nicht erreicht</Pill><Pill active>Termin vereinbart</Pill><Pill>Kein Bedarf</Pill>
          </div>
          <div className="rounded-lg bg-[var(--color-success-tint)] px-3 py-1.5 text-sm font-medium text-[var(--color-success)]">✓ Termin am Mo 10 Uhr</div>
        </div>
      );
    default:
      return (
        <div className="mx-auto w-full max-w-md space-y-3 py-2">
          <div className="space-y-1.5">
            {[["Neu", 30], ["Kontaktiert", 70], ["Interessiert", 50], ["Gewonnen", 25]].map(([n, w]) => (
              <div key={n as string} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs text-[var(--color-ink-2)]">{n}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-subtle)]"><div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${w}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2 text-sm">
            <span>Anrufe heute</span><span className="font-semibold text-[var(--color-brand)] tnum">12 / 60</span>
          </div>
          <div className="text-center text-sm font-medium text-[var(--color-success)]">🎉 1 neuer Auftrag gewonnen</div>
        </div>
      );
  }
}

export function ExplainerVideo() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((x) => (x + 1) % SCENES), SCENE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_30px_80px_-25px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-[var(--color-faint)]">Erklärvideo · KundenRadar</span>
          <span className="ml-auto text-[11px] text-[var(--color-faint)] tnum">{String(s + 1).padStart(2, "0")} / {SCENES}</span>
        </div>
        <div className="flex min-h-[260px] items-center justify-center px-6 py-6">
          <div key={s} className="lf-fade w-full">
            <Scene s={s} />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--color-line)] px-5 py-3">
          <span className="text-xs text-[var(--color-muted)]">{CAPTIONS[s]}</span>
          <div className="ml-auto flex gap-1.5">
            {Array.from({ length: SCENES }, (_, i) => (
              <span key={i} className="h-1.5 w-6 overflow-hidden rounded-full bg-[var(--color-line-strong)]">
                {i === s && <span key={`p${s}`} className="lf-progress block h-full rounded-full bg-[var(--color-brand)]" />}
                {i < s && <span className="block h-full w-full rounded-full bg-[var(--color-brand)]/40" />}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
