import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { Icon, type IconName } from "@/components/icons";
import { config } from "@/lib/config";
import { SERVICE_TYPES, serviceTypeBySlug } from "@/lib/service-types";
import { SERVICE_CITIES } from "@/lib/service-cities";

export function generateStaticParams() {
  return SERVICE_TYPES.map((s) => ({ leistung: s.slug }));
}

const BENEFITS: { icon: IconName; t: string; d: string }[] = [
  { icon: "check", t: "100% kostenlos", d: "Als Auftraggeber zahlst du nichts und gehst keine Verpflichtung ein." },
  { icon: "pin", t: "Anbieter aus der Region", d: "Deine Anfrage geht an passende Betriebe vor Ort." },
  { icon: "search", t: "Angebote vergleichen", d: "Die Angebote kommen zu dir – in Ruhe vergleichen, dann entscheiden." },
  { icon: "clock", t: "Schnell", d: "Anfrage in 2 Minuten, oft erste Rückmeldungen in 1–2 Tagen." },
];

export async function generateMetadata({ params }: { params: Promise<{ leistung: string }> }): Promise<Metadata> {
  const { leistung } = await params;
  const s = serviceTypeBySlug(leistung);
  if (!s) return {};
  const title = `${s.keyword} finden – kostenlos Angebote einholen | KundenRadar`;
  const desc = `${s.intro} Privat & gewerblich, unverbindlich, ohne Anmeldung.`;
  return {
    title,
    description: desc.slice(0, 300),
    alternates: { canonical: `/dienstleister/${s.slug}` },
    keywords: s.keywords,
    openGraph: { title, description: desc.slice(0, 300), url: `/dienstleister/${s.slug}`, type: "website" },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ leistung: string }> }) {
  const { leistung } = await params;
  const s = serviceTypeBySlug(leistung);
  if (!s) notFound();

  const url = `${config.appUrl}/dienstleister/${s.slug}`;
  const others = SERVICE_TYPES.filter((x) => x.slug !== s.slug);
  const topCities = SERVICE_CITIES.slice(0, 18);

  const faq = [
    ...s.faq,
    { q: `Was kostet die Anfrage für ${s.keyword}?`, a: "Für dich als Auftraggeber ist die Anfrage komplett kostenlos und unverbindlich. Du entscheidest selbst, welches Angebot du annimmst." },
    { q: "Privat oder gewerblich?", a: "Beides. Egal ob privat oder als Firma – stell einfach deine Anfrage und gib es im Formular an." },
  ];

  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Service", name: `${s.keyword} finden`,
        description: s.intro, areaServed: "DE", url,
        provider: { "@type": "Organization", name: "KundenRadar" },
      }} />

      <article>
        <Link href="/dienstleister-finden" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Alle Dienstleister</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
          {s.keyword} finden – <span className="text-[var(--color-brand)]">kostenlos Angebote einholen</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">{s.intro}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["100% kostenlos", "unverbindlich", "ohne Anmeldung", "geprüfte Anbieter"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-tint)]/40 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
              <Icon name="check" size={13} /> {t}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <ServiceRequestForm defaultCategory={s.category} />
        </div>

        {/* Leistungen */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Typische Leistungen</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {s.leistungen.map((l) => (
              <div key={l} className="flex items-start gap-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5">
                <span className="mt-0.5 shrink-0 text-[var(--color-brand)]"><Icon name="check" size={18} /></span>
                <span className="text-sm">{l}</span>
              </div>
            ))}
          </div>
        </section>

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

        {/* Auswahl & Preis */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-semibold">Worauf du achten solltest</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{s.auswahl}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-semibold">Was kostet das?</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {s.preis}{" "}
              <Link href="/rechner" className="text-[var(--color-brand)] hover:underline">Zum Preis-Rechner →</Link>
            </p>
          </div>
        </section>

        {/* So funktioniert's */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">So funktioniert's</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">1</span> Anfrage in 2 Minuten beschreiben – kostenlos &amp; unverbindlich.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">2</span> Passende {s.keyword}-Betriebe aus deiner Region melden sich mit Angeboten per E-Mail.</li>
            <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">3</span> Angebote vergleichen und selbst entscheiden, wen du beauftragst.</li>
          </ol>
        </section>

        {/* Städte */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">{s.keyword} finden in deiner Stadt</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topCities.map((c) => (
              <Link key={c.slug} href={`/dienstleister-finden/${c.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {s.keyword} {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
          <div className="mt-4 space-y-4">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Andere Branchen */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Weitere Dienstleister finden</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((x) => (
              <Link key={x.slug} href={`/dienstleister/${x.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {x.keyword} finden
              </Link>
            ))}
          </div>
        </section>

        {/* Abschluss-CTA */}
        <section className="mt-14 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-7 text-center">
          <h2 className="text-lg font-semibold">Jetzt kostenlos {s.keyword} finden</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">Beschreibe in 2 Minuten, was du brauchst – passende Anbieter melden sich bei dir.</p>
          <Link href="/auftrag-einstellen" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Anfrage stellen <Icon name="chevronRight" size={15} />
          </Link>
        </section>
      </article>
    </MarketingShell>
  );
}
