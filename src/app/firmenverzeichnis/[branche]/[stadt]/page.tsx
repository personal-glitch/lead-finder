import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { CompanyCards } from "@/components/landing/CompanyCards";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { Icon } from "@/components/icons";
import { config } from "@/lib/config";
import { searchPublicCompanies } from "@/lib/catalog";
import { SERVICE_TYPES, serviceTypeBySlug } from "@/lib/service-types";
import { SERVICE_CITIES, serviceCityBySlug } from "@/lib/service-cities";

export const revalidate = 600;

type Params = Promise<{ branche: string; stadt: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { branche, stadt } = await params;
  const s = serviceTypeBySlug(branche);
  const city = serviceCityBySlug(stadt);
  if (!s || !city) return { title: "Nicht gefunden | KundenRadar" };
  const title = `${s.keyword} ${city.name} – Anbieter im Firmen-Katalog | KundenRadar`;
  const description = `${s.keyword} ${city.artikel} finden: Anbieter mit Adresse, Telefon & Öffnungszeiten im KundenRadar-Katalog. Direkt kontaktieren oder kostenlos Angebote einholen.`;
  return {
    title,
    description,
    alternates: { canonical: `/firmenverzeichnis/${s.slug}/${city.slug}` },
    keywords: [
      `${s.keyword} ${city.name}`, `${s.keyword} ${city.name} finden`, `${s.name} ${city.name}`,
      `${s.keyword} in ${city.name}`, `Dienstleister ${city.name}`,
    ],
    openGraph: { title, description, type: "website" },
  };
}

export default async function BrancheStadtPage({ params }: { params: Params }) {
  const { branche, stadt } = await params;
  const s = serviceTypeBySlug(branche);
  const city = serviceCityBySlug(stadt);
  if (!s || !city) notFound();

  const res = await searchPublicCompanies({ category: s.category, ort: city.name, perPage: 48 });
  const otherCities = SERVICE_CITIES.filter((x) => x.slug !== city.slug).slice(0, 12);
  const otherTypes = SERVICE_TYPES.filter((x) => x.slug !== s.slug);

  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: `${s.keyword} ${city.name}`,
        description: `${s.keyword} ${city.artikel} im KundenRadar-Firmen-Katalog.`,
        url: `${config.appUrl}/firmenverzeichnis/${s.slug}/${city.slug}`,
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Firmen-Katalog", item: `${config.appUrl}/firmenverzeichnis` },
          { "@type": "ListItem", position: 2, name: `${s.keyword} ${city.name}`, item: `${config.appUrl}/firmenverzeichnis/${s.slug}/${city.slug}` },
        ],
      }} />

      <nav className="text-xs text-[var(--color-muted)]">
        <Link href="/firmenverzeichnis" className="hover:underline">Firmen-Katalog</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink-2)]">{s.keyword} {city.name}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
        {s.keyword} <span className="text-[var(--color-brand)]">{city.name}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
        {s.intro} Hier findest du Anbieter {city.artikel} – mit Adresse, Telefon &amp; Öffnungszeiten. Direkt kontaktieren
        oder kostenlos mehrere Angebote einholen.
      </p>

      {/* Ergebnisse oder Leer-Zustand mit Anfrage-CTA */}
      <section className="mt-8">
        {res.total > 0 ? (
          <>
            <h2 className="mb-4 text-lg font-semibold tracking-[-0.01em]">{res.total} {res.total === 1 ? "Anbieter" : "Anbieter"} {city.artikel}</h2>
            <CompanyCards companies={res.items} />
          </>
        ) : (
          <div className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6">
            <h2 className="text-lg font-semibold">Noch keine {s.keyword}-Einträge {city.artikel}</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              Stell einfach kostenlos deine Anfrage – passende Anbieter aus {city.name} und Umgebung melden sich mit
              Angeboten. Oder bist du selbst {s.keyword} {city.artikel}?{" "}
              <Link href="/firma-eintragen" className="text-[var(--color-brand)] hover:underline">Trag dich kostenlos ein</Link>.
            </p>
            <div className="mt-5"><ServiceRequestForm defaultOrt={city.name} defaultCategory={s.category} /></div>
          </div>
        )}
      </section>

      {/* Leistungen (Keyword-Kontext) */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Typische Leistungen</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {s.leistungen.map((l) => (
            <div key={l} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm">
              <Icon name="check" size={14} className="shrink-0 text-[var(--color-brand)]" /> {l}
            </div>
          ))}
        </div>
      </section>

      {/* Eintragen-CTA */}
      <section className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-lg font-semibold">{s.keyword} {city.artikel}? Kostenlos eintragen</h2>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--color-muted)]">Mit Logo, Adresse &amp; Öffnungszeiten im Katalog erscheinen und Anfragen direkt erhalten.</p>
        </div>
        <Link href="/firma-eintragen" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] sm:mt-0">
          Firma eintragen <Icon name="chevronRight" size={15} />
        </Link>
      </section>

      {/* Interne Verlinkung */}
      <section className="mt-12">
        <h3 className="text-sm font-semibold">{s.keyword} in anderen Städten</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherCities.map((x) => (
            <Link key={x.slug} href={`/firmenverzeichnis/${s.slug}/${x.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              {s.keyword} {x.name}
            </Link>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-semibold">Andere Branchen {city.artikel}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherTypes.map((x) => (
            <Link key={x.slug} href={`/firmenverzeichnis/${x.slug}/${city.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              {x.keyword} {city.name}
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
