"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "../icons";

const MAILTO =
  "mailto:kontakt@seciora-solutions.de?subject=" +
  encodeURIComponent("KundenRadar – Hilfe / Feedback");

/** Schwebender „Hilfe & Feedback"-Button mit kurzem Panel. */
export function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[20rem] max-w-[90vw] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Hilfe &amp; Feedback</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label="Schließen" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="mt-3 space-y-1.5 text-sm">
            <div className="text-xs font-medium text-[var(--color-muted)]">Schnellstart</div>
            <Link href="/suche" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-subtle)]"><Icon name="search" size={14} /> Firmen suchen &amp; anreichern</Link>
            <Link href="/pipeline" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-subtle)]"><Icon name="pipeline" size={14} /> Pipeline &amp; Anrufe verwalten</Link>
            <Link href="/einstellungen" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-subtle)]"><Icon name="settings" size={14} /> E-Mail-Versand einrichten</Link>
          </div>

          <a href={MAILTO} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-3 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            <Icon name="mail" size={15} /> Frage stellen / Feedback geben
          </a>
          <p className="mt-2 text-center text-[11px] text-[var(--color-muted)]">Antwort i. d. R. innerhalb von 1 Werktag.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium shadow-lg hover:bg-[var(--color-subtle)]"
      >
        <Icon name="mail" size={15} /> Hilfe
      </button>
    </>
  );
}
