"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

// Zeigt den AVV-Status und erlaubt das Akzeptieren (mit Datum gespeichert).
export function AvvAccept() {
  const [loading, setLoading] = useState(true);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [authed, setAuthed] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ accepted: boolean; acceptedAt: string | null }>("/api/avv");
        setAcceptedAt(r.acceptedAt);
      } catch {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const accept = async () => {
    setBusy(true);
    try {
      const r = await api<{ acceptedAt: string }>("/api/avv", { method: "POST" });
      setAcceptedAt(r.acceptedAt);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  if (!authed) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] px-4 py-3 text-sm text-[var(--color-muted)]">
        Melde dich an, um den AVV mit einem Klick abzuschließen. Er wird dann mit Datum in deinem Konto gespeichert.
      </div>
    );
  }

  if (acceptedAt) {
    return (
      <div className="rounded-xl border border-[var(--color-success-tint)] bg-[var(--color-success-tint)] px-4 py-3 text-sm text-[var(--color-success)]">
        ✓ AVV abgeschlossen am {new Date(acceptedAt).toLocaleString("de-DE")}. Dein Nachweis ist gespeichert – du musst nichts hochladen oder verschicken.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)]/20 px-4 py-3.5">
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
        <span>Ich schließe diesen Auftragsverarbeitungsvertrag (Art. 28 DSGVO) mit Seciora Solutions ab.</span>
      </label>
      <button
        onClick={accept}
        disabled={!consent || busy}
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
      >
        {busy ? "…" : "AVV jetzt abschließen"}
      </button>
    </div>
  );
}
