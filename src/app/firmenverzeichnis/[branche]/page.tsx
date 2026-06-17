import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { CompanyCards } from "@/components/landing/CompanyCards";
import { Icon } from "@/components/icons";
import { config } from "@/lib/config";
import { searchPublicCompanies } from "@/lib/catalog";
import { SERVICE_TYPES, serviceTypeBySlug } from "@/lib/service-types";
import { SERVICE_CITIES } from "@/lib/service-cities";

export const revalidate = 600;

type Params = Promise<{ branche: string }>;

export function generateStaticParams() {
  return SERVICE_TYPES.map((s) => ({ branche: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { branche } = await params;
  const s = serviceTypeBySlug(branche);
  if (!s) return { title: "Nicht gefunden | KundenRadar" };
  const title = `${s.keyword} finden – Anbieter im Branchenbuch | KundenRadar`;
  const description = `${s.keyword} finden: geprüfte Anbieter mit Adresse, Telefon & Öffnungszeiten im KundenRadar-Branchenbuch. Direkt kontaktieren oder kostenlos Angebote einholen.`;
  return {
    title,
    description,
    alternates: { canonical: `/firmenverzeichnis/${s.slug}` },
    keywords: [s.keyword + " finden", s.keyword + " in der Nähe", ...s.keywords],
    openGraph: { title, description, type: "website" },
  };
}

export default async function BrancheHubPage({ params }: { params: Params }) {
  const { branche } = await params;
  const s = serviceTypeBySlug(branche);
  if (!s) notFound();

  const res = await searchPublicCompanies({ category: s.category, perPage: 48 });

  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: `${s.keyword} finden`, description: s.intro,
        url: `${config.appUrl}/firmenverzeichnis/${s.slug}`,
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Firmen-Katalog", item: `${config.appUrl}/firmenverzeichnis` },
          { "@type": "ListItem", position: 2, name: `${s.keyword} finden`, item: `${config.appUrl}/firmenverzeichnis/${s.slug}` },
        ],
      }} />

      <nav className="text-xs text-[var(--color-muted)]">
        <Link href="/firmenverzeichnis" className="hover:underline">Firmen-Katalog</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink-2)]">{s.keyword}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
        {s.keyword} <span className="text-[var(--color-brand)]">finden</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">{s.intro}</p>

      {/* Anbieter */}
      <section className="mt-8">
        {res.total > 0 ? (
          <>
            <h2 className="mb-4 text-lg font-semibold tracking-[-0.01em]">{res.total} Anbieter im Katalog</h2>
            <CompanyCards companies={res.items} />
          </>
        ) : (
          <div className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6">
            <h2 className="text-lg font-semibold">Noch keine {s.keyword}-Einträge</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              Bist du {s.keyword}? <Link href="/firma-eintragen" className="text-[var(--color-brand)] hover:underline">Trag dich kostenlos ein</Link> und sei von Anfang an dabei. Oder als Suchender: <Link href="/dienstleister-finden" className="text-[var(--color-brand)] hover:underline">kostenlos Angebote einholen</Link>.
            </p>
          </div>
        )}
      </section>

      {/* Nach Stadt */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">{s.keyword} in deiner Stadt</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Direkt zu Anbietern in deiner Stadt:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_CITIES.map((c) => (
            <Link key={c.slug} href={`/firmenverzeichnis/${s.slug}/${c.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              {s.keyword} {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Leistungen */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Typische Leistungen</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {s.leistungen.map((l) => (
            <div key={l} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm">
              <Icon name="check" size={14} className="shrink-0 text-[var(--color-brand)]" /> {l}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{s.auswahl}</p>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Häufige Fragen – {s.keyword}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.faq.map((f) => (
            <div key={f.q} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-semibold">{f.q}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eintragen-CTA */}
      <section className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-lg font-semibold">{s.keyword}? Kostenlos eintragen</h2>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--color-muted)]">Mit Logo, Adresse &amp; Öffnungszeiten im Branchenbuch erscheinen und Anfragen direkt erhalten.</p>
        </div>
        <Link href="/firma-eintragen" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] sm:mt-0">Firma eintragen <Icon name="chevronRight" size={15} /></Link>
      </section>
    </MarketingShell>
  );
}
