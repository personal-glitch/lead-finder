"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { Icon } from "@/components/icons";
import { PERSONAS, type PersonaKey } from "@/lib/personas";

// Erscheint beim ersten Login, bis der Nutzer seine Persona (Anwendungsfall) gewählt hat.
export function OnboardingWizard() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<PersonaKey | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ settings: { workspaceType: string | null } }>("/api/settings");
        if (!r.settings.workspaceType) setShow(true);
      } catch { /* nicht eingeloggt o. Ä. – nichts anzeigen */ }
    })();
  }, []);

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await api("/api/settings", { method: "PATCH", json: { workspaceType: selected } });
      setShow(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-canvas)] p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-[-0.01em] sm:text-2xl">Willkommen! Was machst du?</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[var(--color-muted)]">
            Damit richtet sich KundenRadar passend für dich ein – Suche, Funktionen und Ansicht. Du kannst das später in den Einstellungen ändern.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {(Object.values(PERSONAS)).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelected(p.key)}
              className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${
                selected === p.key
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)]/25 ring-1 ring-[var(--color-brand)]"
                  : "border-[var(--color-line-strong)] hover:border-[var(--color-brand)]/50 hover:bg-[var(--color-subtle)]"
              }`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]">
                <Icon name={p.icon} size={20} />
              </span>
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="text-xs leading-snug text-[var(--color-muted)]">{p.short}</span>
            </button>
          ))}
        </div>

        <button
          onClick={save}
          disabled={!selected || busy}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
        >
          {busy ? "…" : <>Los geht&apos;s <Icon name="chevronRight" size={15} /></>}
        </button>
      </div>
    </div>
  );
}
