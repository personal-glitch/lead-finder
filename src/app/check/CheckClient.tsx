"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { BRANCHEN_KATEGORIEN } from "@/lib/leadgen/branchen-catalog";
import { Icon } from "@/components/icons";
import { Button, Card, Select, Spinner, TextInput, cx } from "@/components/ui";

interface Preview { name: string; ort: string | null; branche: string; hasPhone: boolean; hasWebsite: boolean }
interface CheckResult {
  ort: string; radiusKm: number; branche: string; total: number; withPhone: number; preview: Preview[]; demo: boolean;
}

const INPUT = "w-full";

export default function CheckClient() {
  const [plz, setPlz] = useState("");
  const [branche, setBranche] = useState("Arztpraxis");
  const [radiusKm, setRadiusKm] = useState(15);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<CheckResult | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plz.trim()) { setError("Bitte PLZ oder Ort eingeben."); return; }
    setBusy(true); setError(null); setRes(null);
    try {
      const r = await api<CheckResult>("/api/check", { json: { plz: plz.trim(), branche, radiusKm } });
      setRes(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prüfung fehlgeschlagen. Bitte erneut versuchen.");
    } finally { setBusy(false); }
  };

  const rest = res ? Math.max(0, res.total - res.preview.length) : 0;

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
              <Icon name="agents" size={17} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold">KundenRadar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]">Anmelden</Link>
            <Link href="/registrieren" className="rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Starten</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Gratis-Check · ohne Anmeldung</span>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
            Wie viele <span className="text-[var(--color-brand)]">Neukunden</span> warten in deiner Nähe?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
            Branche + Ort wählen und sofort sehen, wie viele anrufbare Firmen es im Umkreis gibt – echte Daten, keine Anmeldung nötig.
          </p>
        </div>

        {/* Formular */}
        <Card className="mt-8 p-5">
          <form onSubmit={run} className="grid gap-4 sm:grid-cols-[1.2fr_1fr_auto] sm:items-end">
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">PLZ oder Ort</label>
              <TextInput value={plz} onChange={(e) => setPlz(e.target.value)} placeholder="z. B. 50667 oder Köln" className={INPUT} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">Branche</label>
              <Select value={branche} onChange={(e) => setBranche(e.target.value)} className={INPUT}>
                {BRANCHEN_KATEGORIEN.map((c) => (
                  <optgroup key={c.label} label={c.label}>
                    {c.branchen.map((b) => <option key={b} value={b}>{b}</option>)}
                  </optgroup>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <Select value={String(radiusKm)} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-24" aria-label="Umkreis">
                {[5, 10, 15, 25].map((r) => <option key={r} value={r}>{r} km</option>)}
              </Select>
              <Button type="submit" disabled={busy} className="shrink-0">
                {busy ? <><Spinner size={14} /> Prüfe …</> : <><Icon name="search" size={16} /> Prüfen</>}
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 rounded-lg bg-[var(--color-danger-tint)] px-3 py-2 text-xs text-[var(--color-danger)]">{error}</p>}
        </Card>

        {/* Ergebnis */}
        {res && (
          <div className="mt-8 space-y-5">
            <div className="text-center">
              <div className="text-5xl font-semibold tracking-[-0.02em] text-[var(--color-brand)] tnum">{res.total}</div>
              <p className="mt-2 text-lg">
                <span className="font-medium">{res.branche}</span> im Umkreis {res.radiusKm} km um <span className="font-medium">{res.ort}</span>
              </p>
              {res.withPhone > 0 && (
                <p className="mt-1 text-sm text-[var(--color-muted)]">davon <span className="font-medium text-[var(--color-ink)] tnum">{res.withPhone}</span> direkt mit Telefonnummer</p>
              )}
              {res.demo && <p className="mt-1 text-xs text-[var(--color-warn)]">Beispielansicht – echte Live-Daten nach der Anmeldung.</p>}
            </div>

            {res.preview.length > 0 && (
              <Card className="overflow-hidden">
                {res.preview.map((p, i) => (
                  <div key={i} className={cx("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-[var(--color-line)]")}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-tint)] text-sm font-semibold text-[var(--color-brand)]">{(p.name[0] ?? "?").toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--color-muted)]">
                        {p.ort && <span>{p.ort}</span>}
                        {p.hasPhone && <span className="inline-flex items-center gap-1 text-[var(--color-success)]"><Icon name="phone" size={12} /> <span className="select-none blur-[5px]">030 123456</span></span>}
                        {p.hasWebsite && <span className="inline-flex items-center gap-1 text-[var(--color-faint)]"><Icon name="globe" size={12} /> Website</span>}
                      </div>
                    </div>
                    <Icon name="check" size={16} className="shrink-0 text-[var(--color-faint)]" />
                  </div>
                ))}
                {rest > 0 && (
                  <div className="relative border-t border-[var(--color-line)]">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 blur-[3px]">
                        <span className="h-9 w-9 shrink-0 rounded-lg bg-[var(--color-subtle)]" />
                        <div className="flex-1">
                          <div className="h-3 w-40 rounded bg-[var(--color-subtle)]" />
                          <div className="mt-2 h-2.5 w-56 rounded bg-[var(--color-subtle)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* CTA */}
            <Card className="border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/20 p-5 text-center">
              <p className="text-base font-medium">
                {rest > 0 ? <>Noch <span className="text-[var(--color-brand)] tnum">{rest}</span> weitere Treffer warten auf dich.</> : <>Schalte alle Treffer frei.</>}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Mit kostenlosem Konto siehst du <strong>alle {res.total} Firmen inkl. Telefonnummern & Ansprechpartner</strong> – und kannst sie direkt anrufen und verwalten.
              </p>
              <Link href="/registrieren" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
                Kostenlos starten <Icon name="chevronRight" size={16} />
              </Link>
              <p className="mt-2 text-xs text-[var(--color-muted)]">3 Tage gratis testen · danach 49 €/Monat · jederzeit kündbar</p>
            </Card>
          </div>
        )}

        {!res && !busy && (
          <p className="mt-6 text-center text-xs text-[var(--color-faint)]">
            Tipp: Probier deine eigene Stadt + deine Wunsch-Zielbranche.
          </p>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-[var(--color-faint)]">
        <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
        {" · "}
        <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
      </footer>
    </div>
  );
}
