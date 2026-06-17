import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { CompanyCards } from "@/components/landing/CompanyCards";
import { Icon } from "@/components/icons";
import { listPublicCompanies } from "@/lib/catalog";
import { SERVICE_CITIES } from "@/lib/service-cities";
import { SERVICE_TYPES } from "@/lib/service-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dienstleister-Verzeichnis – Firmen finden & kontaktieren | KundenRadar",
  description:
    "Durchsuche unser kostenloses Dienstleister-Verzeichnis: Reinigungsfirmen, Handwerker und weitere Anbieter aus deiner Region. Kontaktiere Firmen direkt und unverbindlich über KundenRadar.",
  alternates: { canonical: "/firmenverzeichnis" },
  keywords: [
    "Dienstleister Verzeichnis", "Branchenbuch", "Firmen finden", "Handwerker Verzeichnis", "Reinigungsfirmen Verzeichnis",
    "Dienstleister Liste", "Anbieter finden", "lokale Dienstleister",
  ],
};

export default async function VerzeichnisPage() {
  const companies = await listPublicCompanies({ limit: 300 });

  return (
    <MarketingShell newsletter={false}>
      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Firmen-Katalog</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Firmen-Katalog – <span className="text-[var(--color-brand)]">Dienstleister finden &amp; direkt kontaktieren</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Das öffentliche Branchenbuch von KundenRadar: geprüfte Anbieter aus ganz Deutschland mit Adresse, Telefon &amp;
          Öffnungszeiten. Firma wählen und direkt kontaktieren – per Telefon oder kostenlos über uns.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/dienstleister-finden" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Angebote einholen <Icon name="chevronRight" size={15} />
          </Link>
          <Link href="/firma-eintragen" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line-strong)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-subtle)]">
            Firma kostenlos eintragen
          </Link>
        </div>
      </div>

      {/* Firmenliste */}
      <section className="mt-12">
        {companies.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Eingetragene Anbieter ({companies.length})</h2>
            <div className="mt-5"><CompanyCards companies={companies} /></div>
          </>
        ) : (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-8 text-center">
            <h2 className="text-lg font-semibold">Das Verzeichnis wächst gerade</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              Die ersten Firmen tragen sich gerade ein. Du bietest Dienstleistungen an?{" "}
              <Link href="/firma-eintragen" className="text-[var(--color-brand)] hover:underline">Trag dich kostenlos ein</Link>{" "}
              und sei von Anfang an dabei. Oder{" "}
              <Link href="/dienstleister-finden" className="text-[var(--color-brand)] hover:underline">stell direkt eine Anfrage</Link>.
            </p>
          </div>
        )}
      </section>

      {/* Nach Branche */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Nach Branche</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SERVICE_TYPES.map((s) => (
            <Link key={s.slug} href={`/dienstleister/${s.slug}`} className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-subtle)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold group-hover:text-[var(--color-brand)]">{s.keyword} finden</div>
                <Icon name="chevronRight" size={15} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nach Stadt */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Nach Stadt</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_CITIES.map((c) => (
            <Link key={c.slug} href={`/dienstleister-finden/${c.slug}`}
              className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              Dienstleister {c.artikel}
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
