import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { FreebieCta } from "@/components/landing/FreebieCta";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Offene Stellen als Vertriebssignal – legal Firmen mit Personalbedarf finden";
const DESC =
  "Wie Personalvermittler und Zeitarbeitsfirmen über die offizielle Jobsuche-API der Bundesagentur für Arbeit Firmen mit offenen Stellen finden – datenschutzkonform und ohne Scraping.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/offene-stellen-vertriebssignal" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/offene-stellen-vertriebssignal`;
  return (
    <MarketingShell>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC,
        datePublished: "2026-06-13", dateModified: "2026-06-13",
        author: { "@type": "Organization", name: "Seciora Solutions" },
        publisher: { "@type": "Organization", name: "KundenRadar" }, mainEntityOfPage: url,
      }} />

      <article>
        <Link href="/blog" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Blog</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">{TITLE}</h1>
        <p className="mt-3 text-base text-[var(--color-muted)]">{DESC}</p>

        <div className="mt-8">
          <P>
            Eine offene Stelle ist das ehrlichste Kaufsignal, das es im Personalgeschäft gibt: Die Firma hat Bedarf,
            ein Budget und einen konkreten Anlass für ein Gespräch. Für Personalvermittler und Zeitarbeitsfirmen ist die
            entscheidende Frage nur, wie man diese Firmen findet – und zwar rechtssicher.
          </P>

          <H2>Warum „sucht seit X Tagen" Gold wert ist</H2>
          <P>
            Eine Stelle, die schon 30, 45 oder 60 Tage online ist, signalisiert: Die Firma kommt allein nicht weiter.
            Genau dort ist die Bereitschaft, mit einem Dienstleister zu sprechen, am höchsten. Je länger die Laufzeit,
            desto heißer der Lead – deshalb lohnt es sich, Treffer nach Laufzeit zu sortieren.
          </P>

          <H2>Der legale Weg: die offizielle Jobsuche-API</H2>
          <P>
            Die Bundesagentur für Arbeit stellt ihre Stellenangebote über eine offizielle Programmierschnittstelle (API)
            bereit. Das ist der saubere Weg: Die Daten werden so genutzt, wie sie von der Quelle dafür vorgesehen sind.
            KundenRadar greift ausschließlich auf diese offizielle API zu – kein automatisiertes Auslesen („Scraping")
            von Webseiten der Arbeitsagentur oder von Google.
          </P>

          <H2>Warum kein Scraping?</H2>
          <P>
            Das automatisierte Abgreifen fremder Webseiten kann gegen deren Nutzungsbedingungen verstoßen und je nach
            Inhalt urheber- oder datenschutzrechtliche Fragen aufwerfen. Offizielle Schnittstellen vermeiden das, weil
            der Anbieter die Nutzung ausdrücklich vorsieht. Unser Grundsatz lautet daher:
          </P>
          <UL items={[
            "Nur offizielle, dafür vorgesehene Schnittstellen (APIs) und offene Daten nutzen",
            "Keine Webseiten von Google oder der Arbeitsagentur automatisiert auslesen",
            "Öffentlich zugängliche Firmen-Kontaktdaten (z. B. aus dem Impressum) verantwortungsvoll verwenden",
          ]} />

          <H2>Vom Signal zum Gespräch</H2>
          <P>
            Sobald du eine Firma mit Personalbedarf gefunden hast, brauchst du den richtigen Kontakt. KundenRadar
            ermittelt dazu aus öffentlich verfügbaren Quellen Telefon, Ansprechpartner und Website, sodass du die Firma
            direkt anrufen und in deine Pipeline übernehmen kannst. Der Anruf gegenüber Unternehmen ist im B2B unter den
            Voraussetzungen des § 7 UWG zulässig – Details im{" "}
            <Link href="/blog/kaltakquise-b2b-erlaubt" className="text-[var(--color-brand)] hover:underline">UWG-Ratgeber</Link>.
          </P>

          <H2>Und was bringt dich der Auftrag?</H2>
          <P>
            Bevor du anrufst, lohnt der Blick auf deine Zahlen: Mit dem{" "}
            <Link href="/rechner/personalvermittlung-provision" className="text-[var(--color-brand)] hover:underline">Provisions- &amp; Verrechnungssatz-Rechner</Link>{" "}
            siehst du, was eine Vermittlung einbringt oder welchen Stundensatz du in der Zeitarbeit ansetzen musst.
          </P>

          <H2>Fazit</H2>
          <P>
            Offene Stellen sind das beste Vertriebssignal im Personalgeschäft – wenn du sie legal und systematisch nutzt.
            Über die offizielle Jobsuche-API findest du Firmen mit echtem Bedarf, priorisierst nach Laufzeit und sprichst
            sie mit einem konkreten Anlass an. So wird aus Akquise planbare Arbeit statt Kaltstart.
          </P>
          <P>
            <em>Hinweis: Dieser Beitrag ist eine allgemeine Information und keine Rechtsberatung. Im Zweifel hilft dir
            eine fachkundige Beratung für deinen konkreten Fall.</em>
          </P>
        </div>
        <FreebieCta source="blog" />
      </article>
    </MarketingShell>
  );
}
