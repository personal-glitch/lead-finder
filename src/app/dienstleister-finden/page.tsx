import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { Icon, type IconName } from "@/components/icons";
import { SERVICE_CITIES } from "@/lib/service-cities";
import { SERVICE_TYPES } from "@/lib/service-types";

export const metadata: Metadata = {
  title: "Dienstleister finden & kostenlos Angebote einholen | KundenRadar",
  description:
    "Reinigungsfirma, Handwerker oder Dienstleister gesucht? Stell kostenlos deine Anfrage – privat oder gewerblich. Geprüfte Anbieter aus deiner Stadt senden dir unverbindliche Angebote. Köln, Hamburg, Berlin, München & mehr.",
  alternates: { canonical: "/dienstleister-finden" },
  keywords: [
    "Dienstleister finden", "Dienstleister gesucht", "Reinigungsfirma finden", "Gebäudereinigung finden",
    "Handwerker finden", "Angebote einholen kostenlos", "Dienstleister Vergleich", "Auftragsbörse",
    "Reinigung Angebote", "Handwerker Angebote", "Dienstleister Angebote vergleichen",
  ],
  openGraph: { title: "Dienstleister finden & kostenlos Angebote einholen – KundenRadar", description: "Stell kostenlos deine Anfrage – geprüfte Anbieter senden dir unverbindliche Angebote.", type: "website" },
};

const TRUST = ["100% kostenlos", "unverbindlich", "ohne Anmeldung", "geprüfte Anbieter"];

const BENEFITS: { icon: IconName; t: string; d: string }[] = [
  { icon: "check", t: "Kostenlos & unverbindlich", d: "Als Auftraggeber zahlst du nichts und gehst keine Verpflichtung ein. Du entscheidest selbst, welches Angebot du annimmst." },
  { icon: "pin", t: "Anbieter aus deiner Region", d: "Deine Anfrage geht an passende Dienstleister in deiner Stadt und im Umkreis – nicht an irgendwen quer durch Deutschland." },
  { icon: "search", t: "Angebote vergleichen", d: "Statt selbst zehn Firmen zu googeln und anzurufen, kommen die Angebote zu dir – in Ruhe vergleichen, dann beauftragen." },
  { icon: "clock", t: "Schnell", d: "Eine Anfrage in 2 Minuten, oft erste Rückmeldungen innerhalb von 1–2 Tagen – direkt per E-Mail." },
];

const FAQ = [
  { q: "Was kostet das?", a: "Für dich als Auftraggeber ist die Anfrage komplett kostenlos und unverbindlich – du gehst keine Verpflichtung ein." },
  { q: "Wer bekommt meine Anfrage?", a: "Nur geprüfte Dienstleister aus unserem Netzwerk, die zu deiner Branche und Region passen. Deine Daten werden nicht öffentlich angezeigt." },
  { q: "Wie schnell bekomme ich Angebote?", a: "Das hängt von Branche und Region ab – oft melden sich erste Anbieter innerhalb von 1–2 Tagen direkt bei dir per E-Mail." },
  { q: "Privat oder gewerblich?", a: "Beides. Egal ob du privat einen Handwerker suchst oder als Firma einen Reinigungsdienstleister – stell einfach deine Anfrage." },
  { q: "Muss ich ein Angebot annehmen?", a: "Nein. Du vergleichst die Angebote in Ruhe und entscheidest völlig frei, ob und wen du beauftragst." },
  { q: "Wie genau sollte ich meine Anfrage beschreiben?", a: "Je konkreter, desto besser die Angebote: Was soll gemacht werden, wie oft, welche Größe/Fläche, Wunschtermin und Ort. So bekommst du belastbare Preise statt grober Schätzungen." },
];

export default function DienstleisterHubPage() {
  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />

      {/* Hero */}
      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Auftragsbörse · kostenlos</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Dienstleister finden – <span className="text-[var(--color-brand)]">kostenlos Angebote einholen</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Reinigungsfirma, Handwerker, Hausmeisterservice oder anderen Dienstleister gesucht? Beschreibe einmal, was du
          brauchst – geprüfte Anbieter aus deiner Region senden dir unverbindliche Angebote. Privat &amp; gewerblich.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-tint)]/40 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
              <Icon name="check" size={13} /> {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ServiceRequestForm />
      </div>

      {/* Für Anbieter: kostenlos eintragen */}
      <section className="mt-16 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-lg font-semibold">Du bist selbst Dienstleister?</h2>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--color-muted)]">
            Trag dein Unternehmen <b>kostenlos</b> in unser Verzeichnis ein, bekomme eine eigene Profilseite und erhalte
            Anfragen direkt ins Postfach – ohne versteckte Kosten.
          </p>
        </div>
        <Link href="/firma-eintragen" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] sm:mt-0">
          Firma kostenlos eintragen <Icon name="chevronRight" size={15} />
        </Link>
      </section>

      {/* Vorteile */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-semibold tracking-[-0.01em]">Warum über KundenRadar?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

      {/* So funktioniert's */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">So funktioniert's</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", t: "Anfrage stellen", d: "In 2 Minuten beschreiben, was du brauchst – kostenlos und ohne Anmeldung." },
            { n: "2", t: "Angebote erhalten", d: "Passende Dienstleister melden sich mit unverbindlichen Angeboten per E-Mail." },
            { n: "3", t: "Vergleichen & beauftragen", d: "In Ruhe vergleichen und selbst entscheiden, wen du beauftragst." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">{s.n}</span>
              <h3 className="mt-2 text-sm font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Branchen (verlinkt auf eigene Landingpages) */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">Beliebte Dienstleistungen</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Wähle, was du brauchst – oder stell direkt oben deine Anfrage:</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SERVICE_TYPES.map((s) => (
            <Link key={s.slug} href={`/dienstleister/${s.slug}`} className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-subtle)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold group-hover:text-[var(--color-brand)]">{s.keyword} finden</div>
                <Icon name="chevronRight" size={15} />
              </div>
              <div className="mt-0.5 text-sm text-[var(--color-muted)]">{s.leistungen.slice(0, 3).join(" · ")}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Städte */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">Dienstleister finden in deiner Stadt</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Wähle deine Stadt für lokale Anbieter – oder stell direkt oben deine Anfrage:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_CITIES.map((c) => (
            <Link key={c.slug} href={`/dienstleister-finden/${c.slug}`}
              className="rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              Dienstleister {c.artikel}
            </Link>
          ))}
        </div>
      </section>

      {/* Ratgeber */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">So findest du den richtigen Dienstleister</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
          <p>
            Den passenden <strong>Dienstleister zu finden</strong> kostet normalerweise Zeit: Firmen googeln, Bewertungen
            lesen, einzeln anrufen, auf Rückruf warten. Schneller geht es, wenn du dein Anliegen <strong>einmal
            beschreibst</strong> und passende Anbieter sich bei dir melden. Genau dafür ist diese Auftragsbörse da – für
            Reinigung, Handwerk, Hausmeisterservice, Garten- &amp; Landschaftsbau, Umzüge und mehr.
          </p>
          <p>
            <strong>Beschreibe deine Anfrage konkret.</strong> Je genauer du angibst, was gemacht werden soll – Umfang,
            Häufigkeit, Größe oder Fläche, Wunschtermin und Ort –, desto belastbarer sind die Angebote. Eine Anfrage wie
            „Büroreinigung, 200 m², 2× pro Woche, Start im nächsten Monat in Köln" bringt dir präzise Preise statt grober
            Schätzungen.
          </p>
          <p>
            <strong>Vergleiche nicht nur den Preis.</strong> Achte auf Erreichbarkeit, Termintreue, Referenzen und einen
            festen Ansprechpartner. Der günstigste Anbieter ist nicht immer der beste – ein faires Preis-Leistungs-Verhältnis
            zahlt sich langfristig aus. Willst du selbst einschätzen, was eine Leistung kosten sollte? Unser{" "}
            <Link href="/rechner" className="text-[var(--color-brand)] hover:underline">kostenloser Preis-Rechner</Link>{" "}
            zeigt dir marktübliche Stundensätze und Angebotspreise.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-semibold">{f.q}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="mt-16 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-7 text-center">
        <h2 className="text-lg font-semibold">Jetzt kostenlos Angebote einholen</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">
          Beschreibe in 2 Minuten, was du brauchst – passende Dienstleister aus deiner Region melden sich bei dir.
        </p>
        <a href="#top" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
          Anfrage stellen <Icon name="chevronRight" size={15} />
        </a>
      </section>
    </MarketingShell>
  );
}
