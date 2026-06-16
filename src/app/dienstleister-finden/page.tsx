import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { CITIES } from "@/lib/cities";

export const metadata: Metadata = {
  title: "Dienstleister finden & kostenlos Angebote einholen | KundenRadar",
  description:
    "Reinigungsfirma, Handwerker oder Dienstleister gesucht? Stell kostenlos deine Anfrage – privat oder gewerblich. Geprüfte Anbieter aus deiner Stadt senden dir unverbindliche Angebote. Köln, Hamburg, Berlin, München & mehr.",
  alternates: { canonical: "/dienstleister-finden" },
  keywords: [
    "Dienstleister finden", "Dienstleister gesucht", "Reinigungsfirma finden", "Gebäudereinigung finden",
    "Handwerker finden", "Angebote einholen kostenlos", "Dienstleister Vergleich", "Auftragsbörse",
  ],
  openGraph: { title: "Dienstleister finden & kostenlos Angebote einholen – KundenRadar", description: "Stell kostenlos deine Anfrage – geprüfte Anbieter senden dir unverbindliche Angebote.", type: "website" },
};

const FAQ = [
  { q: "Was kostet das?", a: "Für dich als Auftraggeber ist die Anfrage komplett kostenlos und unverbindlich – du gehst keine Verpflichtung ein." },
  { q: "Wer bekommt meine Anfrage?", a: "Nur geprüfte Dienstleister aus unserem Netzwerk, die zu deiner Branche und Region passen. Deine Daten werden nicht öffentlich angezeigt." },
  { q: "Privat oder gewerblich?", a: "Beides. Egal ob du privat einen Handwerker suchst oder als Firma einen Reinigungsdienstleister – stell einfach deine Anfrage." },
];

export default function DienstleisterHubPage() {
  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />

      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Auftragsbörse · kostenlos</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Dienstleister finden – <span className="text-[var(--color-brand)]">kostenlos Angebote einholen</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Reinigungsfirma, Handwerker, Hausmeisterservice oder anderen Dienstleister gesucht? Stell deine Anfrage –
          geprüfte Anbieter aus deiner Region senden dir unverbindliche Angebote. Privat &amp; gewerblich.
        </p>
      </div>

      <div className="mt-8">
        <ServiceRequestForm />
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">Dienstleister finden in deiner Stadt</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Wähle deine Stadt – oder stell direkt oben deine Anfrage:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/dienstleister-finden/${c.slug}`}
              className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              Dienstleister {c.artikel}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
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
    </MarketingShell>
  );
}
