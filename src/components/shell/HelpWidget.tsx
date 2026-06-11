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

          <a href="https://wa.me/4915292627062?text=Hallo%2C%20ich%20brauche%20Hilfe%20bei%20KundenRadar." target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ background: "#25D366" }}>
            <svg viewBox="0 0 32 32" width="16" height="16" fill="#fff" aria-hidden="true"><path d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.1.55 4.16 1.6 5.98L4 28l6.22-1.63a11.9 11.9 0 0 0 5.82 1.5c6.6 0 11.96-5.36 11.96-11.96C28.01 9.36 22.64 4 16.04 4zm5.46 16.45c-.25.7-1.45 1.34-2.02 1.42-.51.08-1.16.11-1.87-.12-.43-.13-.98-.31-1.69-.62-2.98-1.29-4.93-4.29-5.08-4.49-.15-.2-1.22-1.62-1.22-3.09s.78-2.19 1.05-2.49c.28-.3.6-.37.8-.37l.57.01c.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.33-.3.5-.15.17-.32.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.28 1.66 2.07 1.14 1.02 2.1 1.33 2.4 1.48.3.15.48.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.23.57.35.08.12.08.72-.17 1.42z" /></svg>
            Support per WhatsApp
          </a>
          <a href={MAILTO} className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
            <Icon name="mail" size={15} /> Per E-Mail schreiben
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
