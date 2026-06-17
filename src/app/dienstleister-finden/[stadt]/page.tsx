import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { CompanyCards } from "@/components/landing/CompanyCards";
import { Icon, type IconName } from "@/components/icons";
import { config } from "@/lib/config";
import { SERVICE_CITIES, serviceCityBySlug } from "@/lib/service-cities";
import { listPublicCompanies } from "@/lib/catalog";

export const revalidate = 600;

export function generateStaticParams() {
  return SERVICE_CITIES.map((c) => ({ stadt: c.slug }));
}

const BENEFITS: { icon: IconName; t: string; d: string }[] = [
  { icon: "check", t: "100% kostenlos", d: "Als Auftraggeber zahlst du nichts und gehst keine Verpflichtung ein." },
  { icon: "pin", t: "Anbieter aus der Region", d: "Deine Anfrage geht an passende Dienstleister vor Ort – nicht quer durch Deutschland." },
  { icon: "search", t: "Angebote vergleichen", d: "Die Angebote kommen zu dir. In Ruhe vergleichen, dann selbst entscheiden." },
  { icon: "clock", t: "Schnell", d: "Anfrage in 2 Minuten, oft erste Rückmeldungen in 1–2 Tagen." },
];

const SERVICES: { label: string; note: string }[] = [
  { label: "Gebäudereinigung", note: "Unterhalts-, Glas- & Grundreinigung für Büro, Praxis & Treppenhaus" },
  { label: "Hausmeisterservice", note: "Objektbetreuung, Winterdienst & kleine Reparaturen" },
  { label: "Maler & Lackierer", note: "Innen- & Außenanstrich, Tapezieren, Fassade" },
  { label: "Elektriker", note: "Installation, Reparatur & Smart-Home" },
  { label: "Sanitär & Heizung", note: "Bad, Heizung, Rohrbruch & Wartung" },
  { label: "Garten- & Landschaftsbau", note: "Gartenpflege, Baumschnitt & Außenanlagen" },
  { label: "Umzug & Transport", note: "Privat- & Firmenumzug, Entrümpelung" },
  { label: "Tischler & Schreiner", note: "Möbel, Einbauten & Reparaturen" },
];

export async function generateMetadata({ params }: { params: Promise<{ stadt: string }> }): Promise<Metadata> {
  const { stadt } = await params;
  const city = serviceCityBySlug(stadt);
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
      `Elektriker ${city.name}`, `Hausmeisterservice ${city.name}`, `Sanitär Heizung ${city.name}`,
      `Garten- und Landschaftsbau ${city.name}`, `Umzug ${city.name}`, `Angebote einholen ${city.name}`,
    ],
    openGraph: { title, description: desc, url: `/dienstleister-finden/${city.slug}`, type: "website" },
  };
}

export default async function DienstleisterCityPage({ params }: { params: Promise<{ stadt: string }> }) {
  const { stadt } = await params;
  const city = serviceCityBySlug(stadt);
  if (!city) notFound();

  const url = `${config.appUrl}/dienstleister-finden/${city.slug}`;
  const others = SERVICE_CITIES.filter((c) => c.slug !== city.slug);
  const companies = await listPublicCompanies({ ort: city.name, limit: 6 });

  const faq = [
    { q: `Was kostet eine Anfrage ${city.artikel}?`, a: "Für dich als Auftraggeber ist die Anfrage komplett kostenlos und unverbindlich. Du gehst keine Verpflichtung ein und entscheidest selbst, welches Angebot du annimmst." },
    { q: `Wie schnell bekomme ich Angebote ${city.artikel}?`, a: `Das hängt von Branche und Umfang ab – oft melden sich erste Anbieter aus ${city.name} und Umgebung innerhalb von 1–2 Tagen direkt bei dir per E-Mail.` },
    { q: `Welche Dienstleister finde ich ${city.artikel}?`, a: "Gebäudereinigung, Hausmeisterservice, Maler, Elektriker, Sanitär & Heizung, Garten- & Landschaftsbau, Umzug, Tischler und mehr – privat wie gewerblich." },
    { q: "Werden auch Umlandorte erfasst?", a: `Ja. Gib einfach deine PLZ und ${city.name} an – Anbieter aus ${city.name} und dem Umland können dir Angebote senden.` },
    { q: "Muss ich ein Angebot annehmen?", a: "Nein. Du vergleichst in Ruhe und entscheidest völlig frei, ob und wen du beauftragst." },
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
          Stell in 2 Minuten kostenlos deine Anfrage – geprüfte Anbieter aus {city.name} ({city.region}) und Umgebung
          melden sich mit unverbindlichen Angeboten. Privat oder gewerblich, ohne Anmeldung.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["100% kostenlos", "unverbindlich", "ohne Anmeldung", "Anbieter aus der Region"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-tint)]/40 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
              <Icon name="check" size={13} /> {t}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <ServiceRequestForm defaultOrt={city.name} />
        </div>

        {/* Lokale Anbieter aus dem Verzeichnis */}
        {companies.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-[-0.01em]">Anbieter {city.artikel}</h2>
              <Link href="/firmenverzeichnis" className="shrink-0 text-sm font-medium text-[var(--color-brand)] hover:underline">Alle anzeigen →</Link>
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Diese Dienstleister sind {city.artikel} im Verzeichnis – direkt kontaktieren oder oben eine Anfrage stellen.</p>
            <div className="mt-5"><CompanyCards companies={companies} /></div>
          </section>
        )}

        {/* Vorteile */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Warum über KundenRadar?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.t} className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-tint)] text-[var(--color-brand)]"><Icon name={b.icon} size={18} /></span>
                <div>
                  <div className="text-sm font-semibold">{b.t}</div>
                  <div className="mt-0.5 text-sm text-[var(--color-muted)]">{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beliebte Dienstleistungen vor Ort (Service + Stadt-Keyword) */}
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

        {/* So funktioniert's */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">So funktioniert's</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">1</span> Anfrage beschreiben – Leistung, Umfang und Ort ({city.name}) angeben. Kostenlos &amp; unverbindlich.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">2</span> Passende Dienstleister aus {city.name} und Umgebung melden sich mit Angeboten – direkt per E-Mail.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">3</span> Angebote vergleichen und selbst entscheiden, wen du beauftragst. Kein Druck, keine Kosten.</li>
          </ol>
        </section>

        {/* Ratgeber lokal */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">So findest du den richtigen Dienstleister {city.artikel}</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <p>
              Einen guten <strong>Dienstleister {city.artikel} zu finden</strong> muss nicht stundenlanges Googeln und
              Telefonieren bedeuten. Beschreibe dein Anliegen einmal – ob <strong>Reinigung {city.name}</strong>,
              <strong> Handwerker {city.name}</strong> oder Hausmeisterservice – und passende Betriebe aus {city.name} und
              Umgebung melden sich mit Angeboten.
            </p>
            <p>
              <strong>Je konkreter deine Anfrage, desto besser die Angebote.</strong> Gib Umfang, Häufigkeit, Größe oder
              Fläche, Wunschtermin und den Ort ({city.name}) an. So bekommst du belastbare Preise statt grober Schätzungen –
              und kannst die Anbieter fair vergleichen.
            </p>
            <p>
              Achte beim Vergleich nicht nur auf den Preis, sondern auch auf Erreichbarkeit, Termintreue und Referenzen.
              Was eine Leistung kosten sollte, kannst du vorab mit unserem{" "}
              <Link href="/rechner" className="text-[var(--color-brand)] hover:underline">kostenlosen Preis-Rechner</Link>{" "}
              einschätzen.
            </p>
          </div>
        </section>

        {/* FAQ */}
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

        {/* Weitere Städte */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Dienstleister finden in weiteren Städten</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((c) => (
              <Link key={c.slug} href={`/dienstleister-finden/${c.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Abschluss-CTA */}
        <section className="mt-14 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-7 text-center">
          <h2 className="text-lg font-semibold">Jetzt kostenlos Angebote {city.artikel} einholen</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">Beschreibe in 2 Minuten, was du brauchst – passende Dienstleister aus {city.name} melden sich bei dir.</p>
          <Link href="/auftrag-einstellen" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Anfrage stellen <Icon name="chevronRight" size={15} />
          </Link>
        </section>
      </article>
    </MarketingShell>
  );
}
