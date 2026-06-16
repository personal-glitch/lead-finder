import { Icon } from "@/components/icons";

// Mobiles Aufklapp-Menü (nur < lg) – nutzt das native <details>, kein Client-JS nötig.
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  return (
    <details className="relative lg:hidden [&_summary::-webkit-details-marker]:hidden">
      <summary
        aria-label="Menü öffnen"
        className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
      >
        <Icon name="menu" size={20} />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-2 shadow-lg">
        <nav className="flex flex-col">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]"
            >
              {l.label}
            </a>
          ))}
          <div className="my-1 border-t border-[var(--color-line)]" />
          <a
            href="/login"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]"
          >
            Anmelden
          </a>
          <a
            href="/registrieren"
            className="mt-1 rounded-lg bg-[var(--color-brand)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]"
          >
            Kostenlos starten
          </a>
        </nav>
      </div>
    </details>
  );
}
