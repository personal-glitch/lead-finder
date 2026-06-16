import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { config } from "@/lib/config";
import { CITIES, cityBySlug } from "@/lib/cities";

export function generateStaticParams() {
  return CITIES.map((c) => ({ stadt: c.slug }));
}

// Beliebte, lokal gesuchte Dienstleistungen (Stadt-Keyword wird angehängt).
const SERVICES: { label: string; note: string }[] = [
  { label: "Gebäudereinigung", note: "Unterhalts-, Glas- & Grundreinigung für Büro, Praxis & Treppenhaus" },
  { label: "Hausmeisterservice", note: "Hausmeister, Winterdienst & Objektbetreuung" },
  { label: "Maler & Lackierer", note: "Innen- & Außenanstrich, Tapezieren, Fassade" },
  { label: "Elektriker", note: "Installation, Reparatur & Smart-Home" },
  { label: "Sanitär & Heizung", note: "Bad, Heizung, Rohrbruch & Wartung" },
  { label: "Garten- & Landschaftsbau", note: "Gartenpflege, Baumschnitt & Außenanlagen" },
  { label: "Umzug & Transport", note: "Privat- & Firmenumzug, Entrümpelung" },
  { label: "Tischler & Schreiner", note: "Möbel, Einbau & Reparatur" },
];

export async function generateMetadata({ params }: { params: Promise<{ stadt: string }> }): Promise<Metadata> {
  const { stadt } = await params;
  const city = cityBySlug(stadt);
  if (!city) return {};
  const title = `Dienstleister finden ${city.artikel} – kostenlos Angebote einholen | KundenRadar`;
  const desc = `Reinigungsfirma, Handwerker oder Dienstleister ${city.artikel} gesucht? Stell kostenlos deine Anfrage – geprüfte Anbieter aus ${city.name} und Umgebung senden dir unverbindliche Angebote. Privat & gewerblich, ohne Anmeldung.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/dienstleister-finden/${city.slug}` },
    keywords: [
      `Dienstleister finden ${city.name}`, `Dienstleister gesucht ${city.name}`, `Reinigungsfirma ${city.name}`,
      `Gebäudereinigung ${city.name}`, `Reinigung ${city.name}`, `Handwerker ${city.name}`, `Maler ${city.name}`,
      `Elektriker ${city.name}`, `Hausmeisterservice ${city.name}`, `Sanitär ${city.name}`,
      `Garten- und Landschaftsbau ${city.name}`, `Angebote einholen ${city.name}`,
    ],
    openGraph: { title, description: desc, url: `/dienstleister-finden/${city.slug}`, type: "website" },
  };
}

export default async function DienstleisterCityPage({ params }: { params: Promise<{ stadt: string }> }) {
  const { stadt } = await params;
  const city = cityBySlug(stadt);
  if (!city) notFound();

  const url = `${config.appUrl}/dienstleister-finden/${city.slug}`;
  const others = CITIES.filter((c) => c.slug !== city.slug);

  const faq = [
    { q: `Was kostet eine Anfrage ${city.artikel}?`, a: "Für dich als Auftraggeber ist die Anfrage komplett kostenlos und unverbindlich. Du gehst keine Verpflichtung ein und entscheidest selbst, welches Angebot du annimmst." },
    { q: `Wie schnell bekomme ich Angebote ${city.artikel}?`, a: `Das hängt von Branche und Umfang ab – oft melden sich erste Anbieter aus ${city.name} und Umgebung innerhalb von 1–2 Tagen direkt bei dir per E-Mail.` },
    { q: `Welche Dienstleister finde ich ${city.artikel}?`, a: "Gebäudereinigung, Hausmeisterservice, Maler, Elektriker, Sanitär & Heizung, Garten- & Landschaftsbau, Umzug, Tischler und mehr – privat wie gewerblich." },
    { q: "Werden auch Umlandorte erfasst?", a: `Ja. Gib einfach deine PLZ und ${city.name} an – Anbieter aus ${city.name} und dem Umland können dir Angebote senden.` },
  ];

  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "WebPage", name: `Dienstleister finden ${city.artikel}`,
        description: `Kostenlos Angebote von Dienstleistern ${city.artikel} einholen.`, url,
        publisher: { "@type": "Organization", name: "KundenRadar" },
      }} />

      <article>
        <Link href="/dienstleister-finden" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Alle Städte</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
          Dienstleister finden <span className="text-[var(--color-brand)]">{city.artikel}</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
          Du suchst {city.artikel} eine zuverlässige Reinigungsfirma, einen Handwerker oder einen anderen Dienstleister?
          Stell in 2 Minuten kostenlos deine Anfrage – geprüfte Anbieter aus {city.name} und Umgebung melden sich mit
          unverbindlichen Angeboten. Privat oder gewerblich, ohne Anmeldung.
        </p>

        <div className="mt-8">
          <ServiceRequestForm defaultOrt={city.name} />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Beliebte Dienstleistungen {city.artikel}</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Für diese Leistungen findest du {city.artikel} schnell passende Anbieter:</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <div className="text-sm font-semibold">{s.label} {city.name}</div>
                <div className="mt-0.5 text-sm text-[var(--color-muted)]">{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">So funktioniert's</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">1</span> Anfrage beschreiben – Leistung, Umfang und Ort ({city.name}) angeben. Kostenlos &amp; unverbindlich.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">2</span> Passende Dienstleister aus {city.name} und Umgebung melden sich mit Angeboten – direkt per E-Mail.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">3</span> Angebote vergleichen und selbst entscheiden, wen du beauftragst. Kein Druck, keine Kosten.</li>
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Häufige Fragen – Dienstleister {city.artikel}</h2>
          <div className="mt-4 space-y-4">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Dienstleister finden in weiteren Städten</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((c) => (
              <Link key={c.slug} href={`/dienstleister-finden/${c.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
