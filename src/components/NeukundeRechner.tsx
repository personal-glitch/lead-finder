"use client";
import { useMemo, useState } from "react";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function Field({ label, suffix, value, onChange, step = 1, min = 0 }: {
  label: string; suffix?: string; value: number; onChange: (n: number) => void; step?: number; min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">{label}</span>
      <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none tnum"
        />
        {suffix && <span className="px-3 text-xs text-[var(--color-faint)]">{suffix}</span>}
      </div>
    </label>
  );
}

export function NeukundeRechner() {
  const [spend, setSpend] = useState(1000); // Akquise-/Marketingkosten pro Monat
  const [newCustomers, setNewCustomers] = useState(5); // neue Kunden pro Monat
  const [value, setValue] = useState(250); // Umsatz/Deckungsbeitrag pro Kunde & Monat
  const [months, setMonths] = useState(12); // durchschnittliche Kundendauer

  const r = useMemo(() => {
    const cac = newCustomers > 0 ? spend / newCustomers : 0;
    const ltv = value * months;
    const ratio = cac > 0 ? ltv / cac : 0;
    const payback = value > 0 ? cac / value : 0; // Monate bis CAC verdient
    return { cac, ltv, ratio, payback };
  }, [spend, newCustomers, value, months]);

  const verdict =
    r.ratio >= 3 ? { t: "gesund", c: "text-[var(--color-success)]" }
    : r.ratio >= 1 ? { t: "grenzwertig", c: "text-[var(--color-warn)]" }
    : { t: "zu teuer", c: "text-[var(--color-danger)]" };

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Akquise-/Marketingkosten pro Monat" suffix="€" value={spend} step={50} onChange={setSpend} />
        <Field label="Neue Kunden pro Monat" value={newCustomers} onChange={setNewCustomers} />
        <Field label="Wert pro Kunde & Monat (Umsatz/Marge)" suffix="€" value={value} step={10} onChange={setValue} />
        <Field label="Durchschnittliche Kundendauer" suffix="Monate" value={months} onChange={setMonths} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[var(--color-subtle)] p-4">
          <div className="text-xs text-[var(--color-muted)]">Kosten pro Neukunde (CAC)</div>
          <div className="mt-1 text-2xl font-semibold tnum">{eur(r.cac)}</div>
        </div>
        <div className="rounded-xl bg-[var(--color-subtle)] p-4">
          <div className="text-xs text-[var(--color-muted)]">Kundenwert (LTV)</div>
          <div className="mt-1 text-2xl font-semibold tnum">{eur(r.ltv)}</div>
        </div>
        <div className="rounded-xl bg-[var(--color-subtle)] p-4">
          <div className="text-xs text-[var(--color-muted)]">Verhältnis LTV : CAC</div>
          <div className={`mt-1 text-2xl font-semibold tnum ${verdict.c}`}>
            {r.ratio ? `${r.ratio.toFixed(1)}×` : "–"} <span className="text-sm font-medium">{r.ratio ? verdict.t : ""}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--color-muted)]">
        Amortisation: Ein Neukunde hat seine Akquisekosten nach <strong>{r.payback ? r.payback.toFixed(1) : "–"} Monaten</strong> wieder eingespielt.
        Faustregel: Ein Verhältnis von <strong>LTV : CAC ≥ 3</strong> gilt als gesund.
      </p>
    </div>
  );
}
