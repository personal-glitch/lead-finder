// Statische, markenkonforme Mini-Mockups für den Funktions-Showcase der Landing.
// Server-Komponenten (kein State) – zeigen echte Tool-Bausteine 1:1.
import { Icon } from "@/components/icons";

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-tint)] text-[11px] font-semibold text-[var(--color-brand)]">
      {initials}
    </span>
  );
}

/** Trefferliste mit Direktkontakt (Finden + Anreichern). */
export function ResultsMock() {
  const rows = [
    { i: "ZB", n: "Zahnarztpraxis Dr. Berg", b: "Zahnarztpraxis", t: "0221 1234567", p: "Frau Berg · Praxisleitung" },
    { i: "HR", n: "Hausverw. Rhein GmbH", b: "Hausverwaltung", t: "0221 9988776", p: "Hr. Weber · Objektverwalter" },
    { i: "HW", n: "Hotel Westend", b: "Hotel & Pension", t: "0221 4455667", p: "Fr. Vogt · Empfang" },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.n} className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2">
          <Avatar initials={r.i} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[13px] font-medium">{r.n}</span>
              <span className="hidden shrink-0 rounded-full bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted)] sm:inline">{r.b}</span>
            </div>
            <div className="truncate text-[11px] text-[var(--color-muted)]">{r.p}</div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--color-success-tint)] px-2 py-1 text-[11px] font-medium text-[var(--color-success)] tnum">
            <Icon name="phone" size={12} /> {r.t}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Kanban-Pipeline (Drag-&-Drop-Stages). */
export function PipelineMock() {
  const cols: { name: string; n: number; cards: string[] }[] = [
    { name: "Neu", n: 8, cards: ["Kanzlei Vogt", "Café Mocca"] },
    { name: "Kontaktiert", n: 5, cards: ["Autohaus Süd"] },
    { name: "Gewonnen", n: 2, cards: ["Hotel Westend"] },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((c) => (
        <div key={c.name} className="rounded-lg bg-[var(--color-subtle)] p-2">
          <div className="mb-1.5 flex items-center justify-between px-0.5">
            <span className="text-[11px] font-semibold">{c.name}</span>
            <span className="rounded-full bg-[var(--color-surface)] px-1.5 text-[10px] text-[var(--color-muted)] tnum">{c.n}</span>
          </div>
          <div className="space-y-1.5">
            {c.cards.map((card) => (
              <div key={card} className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5 text-[11px]">{card}</div>
            ))}
            {c.name === "Gewonnen" && <div className="rounded-md border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)]/40 px-2 py-1.5 text-[11px] text-[var(--color-brand)]">+ Auftrag 🎉</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Anruf-Logging mit Ergebnis → Stage + Aufgabe. */
export function CallMock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2 text-sm">
        <Icon name="phone" size={16} className="text-[var(--color-success)]" /> Hausverw. Rhein GmbH
        <span className="ml-auto text-xs text-[var(--color-muted)] tnum">0221 9988776</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-[var(--color-line-strong)] px-2.5 py-1 text-xs text-[var(--color-muted)]">Nicht erreicht</span>
        <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-tint)] px-2.5 py-1 text-xs font-medium text-[var(--color-brand)]">Termin vereinbart</span>
        <span className="rounded-full border border-[var(--color-line-strong)] px-2.5 py-1 text-xs text-[var(--color-muted)]">Kein Bedarf</span>
      </div>
      <div className="rounded-lg bg-[var(--color-success-tint)] px-3 py-2 text-xs text-[var(--color-success)]">
        ✓ Stage → „Interessiert" · Aufgabe „Angebot senden" automatisch angelegt
      </div>
    </div>
  );
}

/** Aufgaben / Wiedervorlagen. */
export function TasksMock() {
  const tasks = [
    { t: "Angebot an Hotel Westend senden", d: "heute", done: false },
    { t: "Rückruf Kanzlei Vogt", d: "heute", done: false },
    { t: "Nachfassen Autohaus Süd", d: "Mo", done: true },
  ];
  return (
    <div className="space-y-1.5">
      {tasks.map((x) => (
        <div key={x.t} className="flex items-center gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-3 py-2">
          <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${x.done ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-on-brand)]" : "border-[var(--color-line-strong)]"}`}>
            {x.done && <Icon name="check" size={11} />}
          </span>
          <span className={`flex-1 text-[12px] ${x.done ? "text-[var(--color-faint)] line-through" : ""}`}>{x.t}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] tnum ${x.d === "heute" ? "bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "bg-[var(--color-surface)] text-[var(--color-muted)]"}`}>{x.d}</span>
        </div>
      ))}
    </div>
  );
}

/** E-Mail-Vorlage mit Platzhaltern + Pflicht-Footer. */
export function TemplateMock() {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] p-3 text-[12px]">
      <div className="text-[var(--color-muted)]">Betreff: Kurze Anfrage an <span className="rounded bg-[var(--color-brand-tint)] px-1 text-[var(--color-brand)]">{"{{firma}}"}</span></div>
      <div className="h-px bg-[var(--color-line)]" />
      <p className="leading-relaxed text-[var(--color-ink-2)]">
        Guten Tag <span className="rounded bg-[var(--color-brand-tint)] px-1 text-[var(--color-brand)]">{"{{ansprechpartner}}"}</span>,<br />
        wir unterstützen Firmen wie <span className="rounded bg-[var(--color-brand-tint)] px-1 text-[var(--color-brand)]">{"{{firma}}"}</span> …
      </p>
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-faint)]"><Icon name="check" size={11} className="text-[var(--color-success)]" /> Impressum + Abmeldelink automatisch</div>
    </div>
  );
}

/** Dashboard: KPIs + Funnel. */
export function DashboardMock() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[["Anrufe heute", "12 / 60"], ["Termine", "3"], ["Offen", "7"]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] px-2.5 py-2">
            <div className="text-[10px] text-[var(--color-muted)]">{k}</div>
            <div className="text-base font-semibold text-[var(--color-brand)] tnum">{v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-subtle)] p-2.5">
        {[["Neu", 80], ["Kontaktiert", 55], ["Interessiert", 35], ["Gewonnen", 18]].map(([n, w]) => (
          <div key={n as string} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[10px] text-[var(--color-ink-2)]">{n}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface)]"><div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${w}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
