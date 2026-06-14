import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { CheckWidget } from "@/components/landing/CheckWidget";
import { Icon } from "@/components/icons";
import { config } from "@/lib/config";
import { CITIES, cityBySlug } from "@/lib/cities";

export function generateStaticParams() {
  return CITIES.map((c) => ({ stadt: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ stadt: string }> }): Promise<Metadata> {
  const { stadt } = await params;
  const city = cityBySlug(stadt);
  if (!city) return {};
  const title = `Neukunden & Aufträge finden ${city.artikel} – für Dienstleister | KundenRadar`;
  const desc = `Du suchst Aufträge ${city.artikel}? KundenRadar findet dir anrufbare B2B-Firmen mit Telefon & Ansprechpartner ${city.artikel} und Umgebung. Gratis prüfen, ohne Anmeldung – DSGVO-konform.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/neukunden-finden/${city.slug}` },
    keywords: [
      `Neukunden finden ${city.name}`, `Aufträge finden ${city.name}`, `Kunden gewinnen ${city.name}`,
      `B2B Leads ${city.name}`, `Akquise ${city.name}`, "KundenRadar",
    ],
    openGraph: { title, description: desc, url: `/neukunden-finden/${city.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ stadt: string }> }) {
  const { stadt } = await params;
  const city = cityBySlug(stadt);
  if (!city) notFound();

  const url = `${config.appUrl}/neukunden-finden/${city.slug}`;
  const others = CITIES.filter((c) => c.slug !== city.slug);

  return (
    <MarketingShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: city.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "WebPage", name: `Neukunden finden ${city.artikel}`,
        description: `Anrufbare B2B-Firmen ${city.artikel} finden.`, url,
        publisher: { "@type": "Organization", name: "KundenRadar" },
      }} />

      <article>
        <Link href="/" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Startseite</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
          Neukunden &amp; Aufträge finden <span className="text-[var(--color-brand)]">{city.artikel}</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">{city.intro}</p>

        {/* Live-Check, vorbelegt mit der Stadt */}
        <div className="mt-8">
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-brand)]">
            <Icon name="search" size={14} /> Live-Check für {city.name} · echte Daten, keine Anmeldung
          </div>
          <CheckWidget defaultPlz={city.name} />
        </div>

        {/* Starke Branchen vor Ort */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Gefragte Branchen {city.artikel}</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Diese Zielgruppen haben {city.artikel} besonders viel Bedarf an Dienstleistungen:</p>
          <div className="mt-5 space-y-3">
            {city.branchen.map((b) => (
              <div key={b.name} className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <span className="mt-0.5 shrink-0 text-[var(--color-brand)]"><Icon name="check" size={18} /></span>
                <div>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="mt-0.5 text-sm text-[var(--color-muted)]">{b.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* So findest du Kunden */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">So gewinnst du Kunden {city.artikel}</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">1</span> Zielbranche &amp; Umkreis um {city.name} wählen – KundenRadar liefert anrufbare Firmen mit Telefon &amp; Ansprechpartner.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">2</span> Liste in die Pipeline übernehmen und der Reihe nach anrufen – Ergebnis festhalten, Wiedervorlage entsteht automatisch.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">3</span> Interessenten per E-Mail nachfassen – alles in einem Tool, ohne Excel und Zettel.</li>
          </ol>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Tipp: Den passenden Angebotspreis berechnest du vorher mit unserem{" "}
            <Link href="/rechner" className="text-[var(--color-brand)] hover:underline">Gratis-Rechner</Link>.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Häufige Fragen – Kunden finden {city.artikel}</h2>
          <div className="mt-4 space-y-4">
            {city.faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Weitere Städte (interne Verlinkung) */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Neukunden finden in weiteren Städten</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((c) => (
              <Link key={c.slug} href={`/neukunden-finden/${c.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
