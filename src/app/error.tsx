"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-2xl font-semibold">Etwas ist schiefgelaufen</div>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
        Es ist ein unerwarteter Fehler aufgetreten. Versuch es bitte erneut.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
          Erneut versuchen
        </button>
        <a href="/" className="rounded-lg border border-[var(--color-line-strong)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
          Startseite
        </a>
      </div>
    </div>
  );
}
