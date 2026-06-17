import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { CompanyCards } from "@/components/landing/CompanyCards";
import { Icon, type IconName } from "@/components/icons";
import { searchPublicCompanies, countActiveCompanies, countActiveByCategory } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/marketplace-constants";
import { SERVICE_CITIES } from "@/lib/service-cities";
import { SERVICE_TYPES } from "@/lib/service-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Das kostenlose Branchenbuch für Dienstleister | KundenRadar",
  description:
    "Dienstleister finden oder gefunden werden: Im KundenRadar-Branchenbuch suchst du Reinigungsfirmen, Handwerker & Anbieter aus deiner Stadt mit Adresse, Telefon & Öffnungszeiten – oder trägst dein Unternehmen kostenlos ein.",
  alternates: { canonical: "/firmenverzeichnis" },
  keywords: [
    "Branchenbuch", "Branchenbuch kostenlos", "Dienstleister finden", "Firmen finden", "Handwerker finden",
    "Reinigungsfirma finden", "Dienstleister Verzeichnis", "Firma kostenlos eintragen", "Anbieter in der Nähe",
  ],
};

const BRANCHE_ICON: Record<string, IconName> = {
  reinigungsfirma: "broom", maler: "pencil", elektriker: "bolt", "sanitaer-heizung": "wrench",
  hausmeisterservice: "key", "garten-landschaftsbau": "home", umzugsunternehmen: "truck", tischler: "hardhat",
};

const QUICK = [
  { label: "Reinigung Köln", href: "/firmenverzeichnis/reinigungsfirma/koeln" },
  { label: "Maler Berlin", href: "/firmenverzeichnis/maler/berlin" },
  { label: "Elektriker Hamburg", href: "/firmenverzeichnis/elektriker/hamburg" },
  { label: "Umzug München", href: "/firmenverzeichnis/umzugsunternehmen/muenchen" },
];

const FAQ = [
  { q: "Was ist der KundenRadar-Firmen-Katalog?", a: "Ein kostenloses Branchenbuch: Dienstleister wie Reinigungsfirmen, Handwerker oder Hausmeisterdienste präsentieren sich mit Profil, Adresse, Telefon und Öffnungszeiten – und Kunden finden und kontaktieren sie direkt." },
  { q: "Ist die Nutzung wirklich kostenlos?", a: "Ja. Für Suchende ist der Katalog komplett kostenlos. Auch der Firmeneintrag ist gratis – ohne versteckte Kosten und ohne Vertragsbindung." },
  { q: "Wie finde ich einen Dienstleister in meiner Stadt?", a: "Gib oben einfach ein, was du suchst und in welcher Stadt – oder wähle deine Branche und Stadt aus. Du siehst passende Anbieter mit allen Kontaktdaten." },
  { q: "Wie trage ich mein Unternehmen ein?", a: "Über den Button zum kostenlosen Eintragen: Name, Branche, Adresse, Öffnungszeiten und Logo angeben. Nach einer kurzen Prüfung ist dein Profil online und du erhältst Anfragen direkt." },
  { q: "Welche Branchen gibt es?", a: "Von Gebäudereinigung über Maler, Elektriker, Sanitär & Heizung, Hausmeisterservice und Garten- & Landschaftsbau bis Umzug und Tischler – plus weitere Dienstleistungen." },
];

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
  const plz = one(sp.plz).replace(/[^0-9]/g, "").slice(0, 5);
  const radiusKm = parseInt(one(sp.umkreis) || "0", 10) || 0;
  const page = Math.max(parseInt(one(sp.page) || "1", 10) || 1, 1);
  const hasFilter = Boolean(q || category || ort || plz);

  const [res, total, byCat] = await Promise.all([
    searchPublicCompanies({ q, category, ort, plz, radiusKm, page, perPage: 24 }),
    countActiveCompanies(),
    countActiveByCategory(),
  ]);
  const base = { q, branche: category, ort, plz, umkreis: radiusKm ? String(radiusKm) : "" };

  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "WebSite", name: "KundenRadar Firmen-Katalog",
        url: "https://seciora-solutions.de/firmenverzeichnis",
        potentialAction: { "@type": "SearchAction", target: "https://seciora-solutions.de/firmenverzeichnis?q={search_term_string}", "query-input": "required name=search_term_string" },
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />

      {/* Hero */}
      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Firmen-Katalog · Branchenbuch</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-[2.7rem]">
          Das <span className="text-[var(--color-brand)]">kostenlose Branchenbuch</span> für Dienstleister
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Dienstleister finden – oder gefunden werden. Reinigungsfirmen, Handwerker &amp; Anbieter aus deiner Stadt mit
          Adresse, Telefon &amp; Öffnungszeiten. Suchen ist kostenlos, eintragen auch.
        </p>
      </div>

      {/* Suche */}
      <form action="/firmenverzeichnis" method="get" className="mt-7 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 sm:p-4">
        <div className="grid gap-2.5 sm:grid-cols-[1.3fr_120px_150px_200px_auto]">
          <input name="q" defaultValue={q} placeholder="Was? z. B. Reinigung, Maler …" className={inputCls} aria-label="Suchbegriff" />
          <input name="plz" defaultValue={plz} inputMode="numeric" placeholder="PLZ" className={inputCls} aria-label="Postleitzahl" />
          <select name="umkreis" defaultValue={radiusKm ? String(radiusKm) : "25"} className={inputCls} aria-label="Umkreis">
            <option value="0">Umkreis: egal</option>
            <option value="5">+ 5 km</option>
            <option value="10">+ 10 km</option>
            <option value="25">+ 25 km</option>
            <option value="50">+ 50 km</option>
            <option value="100">+ 100 km</option>
          </select>
          <select name="branche" defaultValue={category} className={inputCls} aria-label="Branche">
            <option value="">Alle Branchen</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Suchen</button>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--color-muted)]">PLZ eingeben → Anbieter nach Entfernung sortiert. Im Umkreis nichts dabei? Wir zeigen automatisch die Nächsten.</p>
      </form>

      {!hasFilter && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">Beliebt:</span>
          {QUICK.map((c) => (
            <Link key={c.label} href={c.href} className="rounded-full border border-[var(--color-line-strong)] px-3 py-1 text-xs text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">{c.label}</Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-5 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-[var(--color-muted)]">
        {[[String(total), "Anbieter"], [String(CATEGORIES.length), "Branchen"], [String(SERVICE_CITIES.length), "Städte"], ["100%", "kostenlos"]].map(([n, l]) => (
          <span key={l}><b className="font-semibold text-[var(--color-ink)] tnum">{n}</b> {l}</span>
        ))}
      </div>

      {hasFilter ? (
        /* Ergebnis-Ansicht */
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{res.total} Anbieter gefunden</h2>
            <Link href="/firmenverzeichnis" className="shrink-0 text-sm text-[var(--color-brand)] hover:underline">Filter zurücksetzen ✕</Link>
          </div>
          {res.total > 0 ? (
            <>
              <CompanyCards companies={res.items} />
              {res.pages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
                  {res.page > 1 && <Link href={buildHref(base, { page: res.page - 1 })} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 font-medium hover:bg-[var(--color-subtle)]">← Zurück</Link>}
                  <span className="px-2 text-[var(--color-muted)]">Seite {res.page} / {res.pages}</span>
                  {res.page < res.pages && <Link href={buildHref(base, { page: res.page + 1 })} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 font-medium hover:bg-[var(--color-subtle)]">Weiter →</Link>}
                </nav>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-8 text-center">
              <p className="text-sm text-[var(--color-muted)]">Für diese Suche gibt es noch keinen Eintrag. <Link href="/dienstleister-finden" className="text-[var(--color-brand)] hover:underline">Stell direkt eine Anfrage</Link> oder <Link href="/firma-eintragen" className="text-[var(--color-brand)] hover:underline">trag deine Firma ein</Link>.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Zwei Zielgruppen */}
          <section className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]"><Icon name="search" size={19} /></span>
                <h2 className="text-base font-semibold">Du suchst einen Dienstleister?</h2>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-muted)]">Such nach Branche &amp; Ort, vergleiche Anbieter und kontaktiere sie direkt – oder lass dir über die Auftragsbörse mehrere Angebote schicken. Kostenlos.</p>
              <Link href="/dienstleister-finden" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)] hover:underline">Kostenlos Angebote einholen <Icon name="chevronRight" size={15} /></Link>
            </div>
            <div className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="building" size={19} /></span>
                <h2 className="text-base font-semibold">Du bietest Dienstleistungen an?</h2>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-muted)]">Trag dein Unternehmen <b>kostenlos</b> ein – mit Logo, Adresse &amp; Öffnungszeiten. Du bekommst eine eigene Profilseite und Anfragen direkt ins Postfach.</p>
              <Link href="/firma-eintragen" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Firma kostenlos eintragen <Icon name="chevronRight" size={15} /></Link>
            </div>
          </section>

          {/* Anbieter */}
          {res.items.length > 0 && (
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-[-0.01em]">Neu im Katalog</h2>
                {total > res.items.length && <span className="text-xs text-[var(--color-muted)]">{total} Anbieter insgesamt</span>}
              </div>
              <div className="mt-5"><CompanyCards companies={res.items.slice(0, 8)} /></div>
            </section>
          )}

          {/* Branchen-Kacheln */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Nach Branche</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Wähle deine Branche – mit Anbietern in allen Städten.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SERVICE_TYPES.map((s) => {
                const n = byCat[s.category] ?? 0;
                return (
                  <Link key={s.slug} href={`/firmenverzeichnis/${s.slug}`} className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-subtle)]">
                    <span className="text-[var(--color-brand)]"><Icon name={BRANCHE_ICON[s.slug] ?? "building"} size={22} /></span>
                    <div className="mt-2 text-sm font-semibold leading-snug group-hover:text-[var(--color-brand)]">{s.keyword}</div>
                    <div className="mt-0.5 text-xs text-[var(--color-muted)]">{n > 0 ? `${n} Anbieter` : "Jetzt eintragen"}</div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Städte (schlank) */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Beliebte Städte</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {SERVICE_CITIES.slice(0, 14).map((c) => (
                <Link key={c.slug} href={buildHref({}, { ort: c.name })} className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">{c.name}</Link>
              ))}
              <Link href="/dienstleister-finden" className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-subtle)]">+ {SERVICE_CITIES.length - 14} weitere</Link>
            </div>
          </section>

          {/* Ratgeber (SEO) */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Dienstleister finden im Branchenbuch</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
              <p>Einen passenden <strong>Dienstleister zu finden</strong> kostet sonst Zeit: googeln, Bewertungen lesen, einzeln anrufen. In unserem <strong>kostenlosen Branchenbuch</strong> siehst du geprüfte Anbieter aus deiner Region – von der <strong>Reinigungsfirma</strong> über Maler und Elektriker bis zum Hausmeisterservice – mit Adresse, Telefon und Öffnungszeiten auf einen Blick.</p>
              <p>Du betreibst selbst ein Unternehmen? Dann <strong>trag deine Firma kostenlos ein</strong> und werde über Google und unsere Auftragsbörse gefunden. Ein vollständiges Profil mit Logo, Leistungen und Öffnungszeiten bringt dir mehr Anfragen – ganz ohne Gebühren.</p>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {FAQ.map((f) => (
                <div key={f.q} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <h3 className="text-sm font-semibold">{f.q}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Eintragen-CTA */}
      <section className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-lg font-semibold">Dein Unternehmen kostenlos im Branchenbuch</h2>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--color-muted)]">Mit Logo, Adresse &amp; Öffnungszeiten gelistet werden und Anfragen direkt erhalten – 100 % kostenlos.</p>
        </div>
        <Link href="/firma-eintragen" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] sm:mt-0">Firma kostenlos eintragen <Icon name="chevronRight" size={15} /></Link>
      </section>
    </MarketingShell>
  );
}
