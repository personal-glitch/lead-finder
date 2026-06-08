"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { Icon } from "@/components/icons";
import { TRIAL_DAYS } from "@/lib/plans";

export default function AboPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { method: "POST" });
      window.location.href = url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout fehlgeschlagen.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-brand)] text-[var(--color-on-brand)]">
          <Icon name="agents" size={22} strokeWidth={2.2} />
        </span>
        <h1 className="mt-4 text-xl font-semibold">{TRIAL_DAYS} Tage kostenlos testen</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Hinterlege eine Zahlungsmethode (Karte, PayPal u. a.) – in den ersten {TRIAL_DAYS} Tagen wird nichts berechnet.
          Danach 49 €/Monat, jederzeit kündbar.
        </p>
        <ul className="mt-5 space-y-2 text-left text-sm">
          {["Unbegrenzte Agenten & Kontakte", "Pipeline, Anrufe, Aufgaben & E-Mail", "Alle 50+ Branchen + Stichwortsuche"].map((f) => (
            <li key={f} className="flex gap-2"><span className="mt-0.5 text-[var(--color-brand)]"><Icon name="check" size={15} /></span>{f}</li>
          ))}
        </ul>
        {err && <p className="mt-4 rounded-lg bg-[var(--color-danger-tint)] px-3 py-2 text-xs text-[var(--color-danger)]">{err}</p>}
        <button
          onClick={start}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
        >
          {busy ? "…" : <>Zahlungspflichtig abonnieren <Icon name="chevronRight" size={15} /></>}
        </button>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-faint)]">
          {TRIAL_DAYS} Tage kostenlos, danach 49 €/Monat. Das Abonnement verlängert sich monatlich und ist jederzeit
          zum Ende des Abrechnungszeitraums kündbar.
        </p>
        <form action="/auth/signout" method="post" className="mt-4">
          <button type="submit" className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]">Abmelden</button>
        </form>
      </div>
    </div>
  );
}
