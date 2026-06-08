"use client";
import { useMemo, useState } from "react";
import { BRANCHEN_KATEGORIEN, type BrancheKey } from "@/lib/leadgen/branchen-catalog";
import { Icon } from "@/components/icons";
import { TextInput, cx } from "@/components/ui";

/** Kategorisierter, durchsuchbarer Zielbranchen-Picker + Stichwort-Joker (Hybrid). */
export function TargetPicker({
  selected,
  onToggle,
  keyword,
  onKeyword,
}: {
  selected: Set<string>;
  onToggle: (b: BrancheKey) => void;
  keyword: string;
  onKeyword: (v: string) => void;
}) {
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();

  const cats = useMemo(() => {
    if (!ql) return BRANCHEN_KATEGORIEN;
    return BRANCHEN_KATEGORIEN.map((c) => ({
      ...c,
      branchen: c.branchen.filter((b) => b.toLowerCase().includes(ql)),
    })).filter((c) => c.branchen.length > 0);
  }, [ql]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]">
            <Icon name="search" size={15} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Branche suchen … (z. B. Hotel, Kanzlei, Friseur)"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand)]"
          />
        </div>
        <span className="shrink-0 text-xs text-[var(--color-muted)] tnum">{selected.size} gewählt</span>
      </div>

      <div className="scroll-slim max-h-64 space-y-3 overflow-y-auto pr-1">
        {cats.map((c) => (
          <div key={c.label}>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              <Icon name={c.icon} size={13} /> {c.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.branchen.map((b) => {
                const active = selected.has(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onToggle(b)}
                    className={cx(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]"
                        : "border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-subtle)]",
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {cats.length === 0 && (
          <p className="text-xs text-[var(--color-muted)]">
            Keine Branche gefunden – nutze unten ein freies Stichwort.
          </p>
        )}
      </div>

      <div>
        <span className="eyebrow mb-1 block">
          Stichwort-Joker <span className="font-normal normal-case text-[var(--color-faint)]">(optional)</span>
        </span>
        <TextInput
          value={keyword}
          onChange={(e) => onKeyword(e.target.value)}
          placeholder="z. B. Bäckerei, Coworking, Zahntechnik – mit Komma trennen"
        />
        <p className="mt-1 text-[11px] text-[var(--color-muted)]">
          Findet zusätzlich Firmen, deren Name dein Stichwort enthält – für Nischen, die nicht im Katalog stehen.
        </p>
      </div>
    </div>
  );
}
