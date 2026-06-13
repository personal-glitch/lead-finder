import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Kunden gewinnen als Personalvermittler & Zeitarbeitsfirma – 6 praxiserprobte Wege";
const DESC =
  "Wie Personaldienstleister planbar Firmenkunden gewinnen: offene Stellen als Signal nutzen, die richtigen Ansprechpartner finden und mit klarer Kalkulation überzeugen.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/personalvermittlung-kunden-gewinnen" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/personalvermittlung-kunden-gewinnen`;
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
            Im Personalgeschäft gewinnt nicht, wer die meisten Anrufe macht, sondern wer die richtigen Firmen zur
            richtigen Zeit anspricht. Sechs Wege, mit denen Personalvermittler und Zeitarbeitsfirmen planbar neue
            Firmenkunden gewinnen.
          </P>

          <H2>1. Firmen mit offenem Bedarf zuerst</H2>
          <P>
            Eine ausgeschriebene Stelle ist ein klares Kaufsignal. Konzentriere deine Akquise auf Firmen, die aktuell
            suchen – idealerweise schon länger. Wie du diese Firmen legal über die offizielle Jobsuche-API findest,
            erklärt der Beitrag{" "}
            <Link href="/blog/offene-stellen-vertriebssignal" className="text-[var(--color-brand)] hover:underline">Offene Stellen als Vertriebssignal</Link>.
          </P>

          <H2>2. Branchen mit dauerhaftem Personalbedarf</H2>
          <P>Manche Branchen suchen praktisch ständig – dort lohnt kontinuierliche Akquise:</P>
          <UL items={[
            "Pflege, Gesundheit und soziale Einrichtungen",
            "Logistik, Lager und Transport",
            "Produktion, Metall und Elektro",
            "Bau und Handwerk",
            "Gastronomie und Hotellerie",
          ]} />

          <H2>3. Den richtigen Ansprechpartner treffen</H2>
          <P>
            Personalentscheidungen treffen Geschäftsführung, HR oder Abteilungsleitung – nicht die zentrale Hotline.
            Recherchiere den passenden Kontakt vorab. KundenRadar ermittelt zu jeder Firma aus öffentlichen Quellen
            Telefon und Ansprechpartner, damit du nicht im Vorzimmer hängenbleibst.
          </P>

          <H2>4. Mit Zahlen überzeugen – und sauber kalkulieren</H2>
          <P>
            Wer im Gespräch konkret wird, gewinnt Vertrauen. Kenne deine eigenen Zahlen: Mit dem{" "}
            <Link href="/rechner/personalvermittlung-provision" className="text-[var(--color-brand)] hover:underline">Provisions- &amp; Verrechnungssatz-Rechner</Link>{" "}
            siehst du, was eine Vermittlung einbringt und welchen Faktor du in der Zeitarbeit brauchst, damit der Einsatz
            profitabel bleibt.
          </P>

          <H2>5. Telefon ist im B2B dein stärkster Kanal</H2>
          <P>
            Gegenüber Unternehmen ist der Werbeanruf unter den Voraussetzungen des § 7 UWG zulässig, während
            Kalt-E-Mails grundsätzlich eine vorherige Einwilligung verlangen. Ein höflicher Anruf mit konkretem Bezug zur
            offenen Stelle ist der wirksamste Erstkontakt – mehr im{" "}
            <Link href="/blog/kaltakquise-b2b-erlaubt" className="text-[var(--color-brand)] hover:underline">UWG-Ratgeber</Link>.
          </P>

          <H2>6. Alles an einem Ort statt in Excel</H2>
          <P>
            Wer 30 Firmen pro Woche anspricht, verliert in Tabellen den Überblick. Übernimm gefundene Firmen direkt in
            eine Pipeline, halte Anrufe und Ergebnisse fest und lass dir Wiedervorlagen automatisch anlegen. Genau dafür
            ist KundenRadar gebaut – inklusive Stellen-Suche, Kontaktermittlung und Pipeline in einem Tool.
          </P>

          <H2>Fazit</H2>
          <P>
            Kombiniere Bedarfssignale (offene Stellen) mit gezielter Ansprache der richtigen Person und einer sauberen
            Kalkulation. So wird Neukundengewinnung im Personalgeschäft planbar – und dein Vertrieb skaliert mit deinem
            Team.
          </P>
        </div>
      </article>
    </MarketingShell>
  );
}
