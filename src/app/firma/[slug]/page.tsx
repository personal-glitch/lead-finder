import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { CompanyContactForm } from "@/components/CompanyContactForm";
import { Icon } from "@/components/icons";
import { config } from "@/lib/config";
import { getPublicCompany } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getPublicCompany(slug);
  if (!c) return { title: "Anbieter nicht gefunden | KundenRadar" };
  const ortPart = c.ort ? ` in ${c.ort}` : "";
  const title = `${c.name} – ${c.category}${ortPart} | KundenRadar`;
  const description = (c.description?.slice(0, 155)) ||
    `${c.name}: ${c.category}${ortPart}. Kontaktiere den Anbieter kostenlos und unverbindlich über KundenRadar.`;
  return {
    title,
    description,
    alternates: { canonical: `/firma/${c.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const c = await getPublicCompany(slug);
  if (!c) notFound();

  const ortLabel = [c.plz, c.ort].filter(Boolean).join(" ");
  const fullAddress = [c.street, ortLabel].filter(Boolean).join(", ");
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.name, fullAddress].filter(Boolean).join(", "))}`;

  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: c.name,
        description: c.description ?? undefined,
        url: `${config.appUrl}/firma/${c.slug}`,
        telephone: c.phone ?? undefined,
        address: (c.street || c.ort) ? { "@type": "PostalAddress", streetAddress: c.street ?? undefined, postalCode: c.plz ?? undefined, addressLocality: c.ort ?? undefined, addressCountry: "DE" } : undefined,
        openingHours: c.openingHours ?? undefined,
        sameAs: c.website ?? undefined,
        areaServed: c.ort ?? c.region ?? "Deutschland",
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Dienstleister finden", item: `${config.appUrl}/dienstleister-finden` },
          { "@type": "ListItem", position: 2, name: "Verzeichnis", item: `${config.appUrl}/firmenverzeichnis` },
          { "@type": "ListItem", position: 3, name: c.name, item: `${config.appUrl}/firma/${c.slug}` },
        ],
      }} />

      {/* Breadcrumb */}
      <nav className="text-xs text-[var(--color-muted)]">
        <Link href="/dienstleister-finden" className="hover:underline">Dienstleister finden</Link>
        <span className="mx-1.5">/</span>
        <Link href="/firmenverzeichnis" className="hover:underline">Verzeichnis</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--color-ink-2)]">{c.name}</span>
      </nav>

      {/* Header */}
      <div className="mt-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-tint)]/40 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
          <Icon name="building" size={13} /> {c.category}
        </span>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">{c.name}</h1>
        {ortLabel && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
            <Icon name="pin" size={15} /> {ortLabel}{c.region ? ` · ${c.region}` : ""}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Inhalt */}
        <div className="space-y-8">
          {c.description && (
            <section>
              <h2 className="text-lg font-semibold">Über {c.name}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink-2)]">{c.description}</p>
            </section>
          )}

          <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold">Kontakt &amp; Eckdaten</h2>
            <dl className="mt-3 grid gap-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Icon name="building" size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                <div><dt className="text-xs text-[var(--color-muted)]">Branche</dt><dd className="font-medium">{c.category}</dd></div>
              </div>
              {fullAddress && (
                <div className="flex items-start gap-2.5">
                  <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                  <div>
                    <dt className="text-xs text-[var(--color-muted)]">Adresse</dt>
                    <dd className="font-medium">{fullAddress}</dd>
                    <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-brand)] hover:underline">Auf Karte ansehen ↗</a>
                  </div>
                </div>
              )}
              {c.phone && (
                <div className="flex items-start gap-2.5">
                  <Icon name="phone" size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                  <div><dt className="text-xs text-[var(--color-muted)]">Telefon</dt>
                    <dd><a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="font-medium text-[var(--color-brand)] hover:underline">{c.phone}</a></dd>
                  </div>
                </div>
              )}
              {c.website && (
                <div className="flex items-start gap-2.5">
                  <Icon name="globe" size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                  <div><dt className="text-xs text-[var(--color-muted)]">Website</dt>
                    <dd><a href={c.website} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-brand)] hover:underline">{c.website.replace(/^https?:\/\//, "")}</a></dd>
                  </div>
                </div>
              )}
              {c.openingHours && (
                <div className="flex items-start gap-2.5">
                  <Icon name="clock" size={16} className="mt-0.5 shrink-0 text-[var(--color-muted)]" />
                  <div><dt className="text-xs text-[var(--color-muted)]">Öffnungszeiten</dt><dd className="whitespace-pre-wrap font-medium">{c.openingHours}</dd></div>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-5">
            <h2 className="text-sm font-semibold">Du suchst mehrere Angebote?</h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Über unsere <Link href="/dienstleister-finden" className="text-[var(--color-brand)] hover:underline">Auftragsbörse</Link>{" "}
              beschreibst du dein Anliegen einmal und mehrere passende Anbieter aus deiner Region melden sich mit Angeboten.
            </p>
          </section>
        </div>

        {/* Kontakt-Formular (sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-3 text-lg font-semibold">{c.name} kontaktieren</h2>
          <CompanyContactForm slug={c.slug} companyName={c.name} />
        </div>
      </div>
    </MarketingShell>
  );
}
