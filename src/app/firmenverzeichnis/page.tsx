import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { CompanyCards } from "@/components/landing/CompanyCards";
import { Icon } from "@/components/icons";
import { searchPublicCompanies } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/marketplace-constants";
import { SERVICE_CITIES } from "@/lib/service-cities";
import { SERVICE_TYPES } from "@/lib/service-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Firmen-Katalog – Dienstleister finden & kontaktieren | KundenRadar",
  description:
    "Das öffentliche Branchenbuch von KundenRadar: Reinigungsfirmen, Handwerker und Dienstleister aus ganz Deutschland mit Adresse, Telefon & Öffnungszeiten. Such nach Branche und Ort und kontaktiere Firmen direkt.",
  alternates: { canonical: "/firmenverzeichnis" },
  keywords: [
    "Firmen-Katalog", "Branchenbuch", "Dienstleister Verzeichnis", "Firmen finden", "Handwerker Verzeichnis",
    "Reinigungsfirmen Verzeichnis", "Anbieter finden", "lokale Dienstleister", "Firmen suchen",
  ],
};

type SP = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? "";

function buildHref(base: Record<string, string>, overrides: Record<string, string | number>): string {
  const params = new URLSearchParams();
  const merged = { ...base, ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) };
  for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
  const qs = params.toString();
  return qs ? `/firmenverzeichnis?${qs}` : "/firmenverzeichnis";
}

const inputCls = "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

export default async function VerzeichnisPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 80);
  const category = one(sp.branche);
  const ort = one(sp.ort).slice(0, 60);
  const page = Math.max(parseInt(one(sp.page) || "1", 10) || 1, 1);

  const res = await searchPublicCompanies({ q, category, ort, page, perPage: 24 });
  const base = { q, branche: category, ort };
  const hasFilter = Boolean(q || category || ort);

  return (
    <MarketingShell newsletter={false}>
      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Firmen-Katalog</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Firmen-Katalog – <span className="text-[var(--color-brand)]">Dienstleister finden &amp; direkt kontaktieren</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Das öffentliche Branchenbuch von KundenRadar: geprüfte Anbieter mit Adresse, Telefon &amp; Öffnungszeiten.
        </p>
      </div>

      {/* Suche: Was / Wo / Branche (reines GET-Formular, funktioniert ohne JS) */}
      <form action="/firmenverzeichnis" method="get" className="mt-7 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_220px_auto]">
          <input name="q" defaultValue={q} placeholder="Was? z. B. Reinigung, Firmenname" className={inputCls} />
          <input name="ort" defaultValue={ort} placeholder="Wo? z. B. Köln" className={inputCls} />
          <select name="branche" defaultValue={category} className={inputCls}>
            <option value="">Alle Branchen</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Suchen
          </button>
        </div>
        {hasFilter && (
          <div className="mt-2 text-xs text-[var(--color-muted)]">
            <Link href="/firmenverzeichnis" className="hover:underline">Filter zurücksetzen ✕</Link>
          </div>
        )}
      </form>

      {/* Ergebnisse */}
      <section className="mt-8">
        {res.total > 0 ? (
          <>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-[-0.01em]">
                {res.total} {res.total === 1 ? "Anbieter" : "Anbieter"}
                {hasFilter ? " gefunden" : ""}
              </h2>
              {res.pages > 1 && <span className="text-xs text-[var(--color-muted)]">Seite {res.page} von {res.pages}</span>}
            </div>
            <CompanyCards companies={res.items} />

            {res.pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
                {res.page > 1 && (
                  <Link href={buildHref(base, { page: res.page - 1 })} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 font-medium hover:bg-[var(--color-subtle)]">← Zurück</Link>
                )}
                <span className="px-2 text-[var(--color-muted)]">Seite {res.page} / {res.pages}</span>
                {res.page < res.pages && (
                  <Link href={buildHref(base, { page: res.page + 1 })} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 font-medium hover:bg-[var(--color-subtle)]">Weiter →</Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-8 text-center">
            <h2 className="text-lg font-semibold">{hasFilter ? "Keine Treffer" : "Das Verzeichnis wächst gerade"}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              {hasFilter
                ? "Für diese Suche gibt es noch keinen Eintrag. "
                : "Die ersten Firmen tragen sich gerade ein. "}
              Du bietest Dienstleistungen an?{" "}
              <Link href="/firma-eintragen" className="text-[var(--color-brand)] hover:underline">Trag dich kostenlos ein</Link>{" "}
              – oder{" "}
              <Link href="/dienstleister-finden" className="text-[var(--color-brand)] hover:underline">stell direkt eine Anfrage</Link>.
            </p>
          </div>
        )}
      </section>

      {/* Für Anbieter: eintragen */}
      <section className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-lg font-semibold">Du bist selbst Dienstleister?</h2>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--color-muted)]">Trag dein Unternehmen <b>kostenlos</b> ein – mit Logo, Adresse &amp; Öffnungszeiten. Anfragen kommen direkt zu dir.</p>
        </div>
        <Link href="/firma-eintragen" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] sm:mt-0">
          Firma kostenlos eintragen <Icon name="chevronRight" size={15} />
        </Link>
      </section>

      {/* Nach Branche & Stadt (SEO-Hubs) */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Beliebte Kombinationen</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Direkt zu Anbietern einer Branche in deiner Stadt:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_TYPES.slice(0, 4).flatMap((s) =>
            SERVICE_CITIES.slice(0, 6).map((city) => (
              <Link key={`${s.slug}-${city.slug}`} href={`/firmenverzeichnis/${s.slug}/${city.slug}`}
                className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {s.keyword} {city.name}
              </Link>
            )),
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Nach Branche</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_TYPES.map((s) => (
            <Link key={s.slug} href={buildHref({}, { branche: s.category })} className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              {s.keyword}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Nach Stadt</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_CITIES.map((c) => (
            <Link key={c.slug} href={buildHref({}, { ort: c.name })} className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
