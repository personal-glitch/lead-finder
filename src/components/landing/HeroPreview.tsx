"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { cx } from "@/components/ui";

const CAPTIONS = [
  "Branche & Umkreis wählen",
  "Agent recherchiert & reichert an",
  "Treffer mit Telefon & Ansprechpartner",
  "Anrufen & in die Pipeline",
];

const RESULTS = [
  { name: "Zahnarztpraxis Dr. Berg", tel: "0221 1234567", typ: "Zahnarztpraxis" },
  { name: "Hausverwaltung Rhein GmbH", tel: "0221 9988776", typ: "Hausverwaltung" },
  { name: "Kanzlei Vogt & Partner", tel: "0221 4455667", typ: "Anwaltskanzlei" },
];

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={cx("rounded-full border px-2.5 py-1 text-[11px] font-medium",
      active ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]"
        : "border-[var(--color-line-strong)] text-[var(--color-muted)]")}>
      {children}
    </span>
  );
}

function Scene({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-subtle)] px-3 py-2 text-sm text-[var(--color-ink)]">
          <span className="text-[var(--color-faint)]">PLZ / Ort</span> · 50667 Köln
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active>Arztpraxis</Chip><Chip active>Hausverwaltung</Chip>
          <Chip>Anwaltskanzlei</Chip><Chip>Steuerberater</Chip><Chip>Büro</Chip>
        </div>
        <button className="w-full rounded-lg bg-[var(--color-brand)] py-2 text-center text-sm font-semibold text-[var(--color-on-brand)]">
          Suchen
        </button>
      </div>
    );
  if (step === 1)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <svg className="animate-spin text-[var(--color-brand)]" width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="text-sm text-[var(--color-muted)]">Live-Recherche läuft …</div>
        <div className="text-xs text-[var(--color-faint)]">12 Treffer gefunden</div>
      </div>
    );
  if (step === 2)
    return (
      <div className="space-y-2">
        {RESULTS.map((r, i) => (
          <div key={r.name} className="lf-row flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2" style={{ animationDelay: `${i * 140}ms` }}>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium">{r.name}</div>
              <div className="text-[11px] text-[var(--color-muted)]">{r.typ}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success)] tnum"><Icon name="phone" size={12} /> {r.tel}</span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2.5">
        <div className="text-[13px] font-medium">Hausverwaltung Rhein GmbH</div>
        <span className="rounded-md bg-[var(--color-success-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)]">Termin vereinbart</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <Icon name="pipeline" size={14} /> verschoben nach
        <span className="rounded-md bg-[var(--color-brand-tint)] px-2 py-0.5 font-medium text-[var(--color-brand)]">Interessiert</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <Icon name="tasks" size={14} /> Aufgabe „Angebot vorbereiten" angelegt
      </div>
    </div>
  );
}

export function HeroPreview() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
      {/* Fensterleiste */}
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-[var(--color-faint)]">app.kundenradar.de</span>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={15} strokeWidth={2.2} /></span>
          <span className="text-sm font-semibold">Agent · Praxen & Hausverwaltungen Köln</span>
        </div>
        <div key={step} className="lf-fade min-h-[180px]">
          <Scene step={step} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
          <span className="text-xs text-[var(--color-muted)]">{step + 1} · {CAPTIONS[step]}</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cx("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-[var(--color-brand)]" : "w-1.5 bg-[var(--color-line-strong)]")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
