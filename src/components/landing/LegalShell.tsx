import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

/** Öffentlicher Rahmen für Rechtsseiten (Impressum/Datenschutz/Kontakt). */
export function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={16} strokeWidth={2.2} /></span>
            <span className="font-semibold">KundenRadar</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <Icon name="chevronLeft" size={14} /> Startseite
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">{title}</h1>
        {intro && <p className="mt-3 text-[var(--color-muted)]">{intro}</p>}
        <div className="mt-8">{children}</div>
      </main>

      <footer className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-[var(--color-muted)]">
          <span>© {new Date().getFullYear()} KundenRadar</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
            <Link href="/agb" className="hover:text-[var(--color-ink)]">AGB</Link>
            <Link href="/widerruf" className="hover:text-[var(--color-ink)]">Widerruf</Link>
            <Link href="/preise" className="hover:text-[var(--color-ink)]">Preise</Link>
            <Link href="/kontakt" className="hover:text-[var(--color-ink)]">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-9 text-lg font-semibold text-[var(--color-ink)]">{children}</h2>;
}
export function P({ children }: { children: ReactNode }) {
  return <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-muted)]">{children}</p>;
}
export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-faint)]" />{it}</li>
      ))}
    </ul>
  );
}

/** Hinweis-Box: Platzhalter ersetzen / anwaltlich prüfen. */
export function PlaceholderNote() {
  return (
    <div className="rounded-lg border border-[var(--color-warn-tint)] bg-[var(--color-warn-tint)] px-4 py-3 text-xs text-[var(--color-warn)]">
      Hinweis: Platzhalter in [eckigen Klammern] bitte durch eure Angaben ersetzen. Rechtstexte
      sind eine solide Vorlage – vor dem Live-Gang einmal anwaltlich bzw. mit einem Generator prüfen lassen.
    </div>
  );
}
