import type { Metadata } from "next";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { CATEGORIES } from "@/lib/marketplace-constants";

export const metadata: Metadata = {
  title: "Dienstleister finden & kostenlos Angebote einholen | Auftragsbörse – KundenRadar",
  description:
    "Reinigungsfirma, Handwerker oder Dienstleister gesucht? Stell kostenlos deine Anfrage – privat oder gewerblich. Passende Anbieter aus deiner Region senden dir unverbindliche Angebote. Schnell, gratis, ohne Anmeldung.",
  alternates: { canonical: "/auftrag-einstellen" },
  keywords: [
    "Dienstleister finden", "Reinigungsfirma finden", "Gebäudereinigung beauftragen", "Handwerker finden",
    "Angebote einholen kostenlos", "Auftrag ausschreiben", "Auftrag einstellen", "Dienstleister gesucht",
    "Reinigungsfirma gesucht", "Hausmeisterservice finden", "Maler finden", "Elektriker finden",
    "Angebote vergleichen Dienstleister", "Auftragsbörse",
  ],
  openGraph: {
    title: "Dienstleister finden & kostenlos Angebote einholen – KundenRadar",
    description: "Stell kostenlos deine Anfrage – passende Anbieter senden dir unverbindliche Angebote.",
    type: "website",
  },
};

const STEPS = [
  { t: "1 · Anfrage stellen", d: "Beschreibe in 2 Minuten, was du brauchst – privat oder gewerblich. Kostenlos und ohne Anmeldung." },
  { t: "2 · Angebote erhalten", d: "Passende Dienstleister aus deiner Region melden sich mit unverbindlichen Angeboten direkt per E-Mail." },
  { t: "3 · Vergleichen & beauftragen", d: "Du vergleichst in Ruhe und entscheidest selbst, wen du beauftragst. Kein Druck, keine Kosten." },
];

const FAQ = [
  { q: "Was kostet das?", a: "Für dich als Auftraggeber ist die Anfrage komplett kostenlos und unverbindlich. Du gehst keine Verpflichtung ein." },
  { q: "Wer bekommt meine Anfrage?", a: "Nur geprüfte Dienstleister in unserem Netzwerk, die zu deiner Branche und Region passen. Deine Daten werden nicht öffentlich angezeigt." },
  { q: "Wie schnell bekomme ich Angebote?", a: "Das hängt von Branche und Region ab – oft melden sich erste Anbieter innerhalb von 1–2 Tagen direkt bei dir." },
  { q: "Privat oder gewerblich?", a: "Beides geht. Egal ob du privat einen Handwerker suchst oder als Firma einen Reinigungsdienstleister – stell einfach deine Anfrage." },
];

export default function AuftragEinstellenPage() {
  return (
    <MarketingShell newsletter={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Auftragsbörse · kostenlos</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Dienstleister gesucht? <span className="text-[var(--color-brand)]">Angebote kostenlos einholen.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Ob Gebäudereinigung, Handwerk oder Hausmeisterservice – privat oder gewerblich: Stell deine Anfrage und
          erhalte unverbindliche Angebote von passenden Anbietern aus deiner Region.
        </p>
      </div>

      <div className="mt-8">
        <ServiceRequestForm />
      </div>

      <section className="mt-14">
        <h2 className="text-center text-xl font-semibold tracking-[-0.01em]">So funktioniert's</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.t} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-brand)]">{s.t}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Für jede Branche – privat &amp; gewerblich</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
          Über unsere Auftragsbörse findest du zuverlässige Dienstleister in ganz Deutschland. Besonders gefragt sind
          Anfragen für <strong>Gebäudereinigung</strong> und <strong>Unterhaltsreinigung</strong> (Büro, Praxis, Treppenhaus),
          <strong> Hausmeisterservice</strong>, sowie Handwerk wie <strong>Maler</strong>, <strong>Elektriker</strong>,
          <strong> Sanitär &amp; Heizung</strong> und <strong>Garten- &amp; Landschaftsbau</strong>. Du beschreibst dein
          Anliegen einmal – passende Betriebe melden sich mit Angeboten. Du vergleichst und entscheidest, ganz ohne
          Verpflichtung.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-2)]">
              {c}
            </span>
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
