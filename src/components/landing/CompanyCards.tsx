import Link from "next/link";
import { Icon } from "@/components/icons";
import type { PublicCompany } from "@/lib/catalog";

/** Reine Darstellung gelisteter Firmen (Server-Component, kein Daten-Fetch). */
export function CompanyCards({ companies }: { companies: PublicCompany[] }) {
  if (companies.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {companies.map((c) => (
        <Link
          key={c.slug}
          href={`/firma/${c.slug}`}
          className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-subtle)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold group-hover:text-[var(--color-brand)]">{c.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1"><Icon name="building" size={12} /> {c.category}</span>
                {c.ort && <span className="inline-flex items-center gap-1"><Icon name="pin" size={12} /> {c.ort}</span>}
              </div>
            </div>
            <Icon name="chevronRight" size={15} />
          </div>
          {c.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-ink-2)]">{c.description}</p>
          )}
        </Link>
      ))}
    </div>
  );
}
