import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { FreebieCta } from "@/components/landing/FreebieCta";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Webdesign-Kunden gewinnen: 6 Wege zu Firmen mit schlechter Website";
const DESC =
  "Wie Webdesigner und SEO-Dienstleister planbar Kunden finden: veraltete oder fehlende Websites als Verkaufschance erkennen, bewerten und gezielt ansprechen.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/webdesign-kunden-gewinnen" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/webdesign-kunden-gewinnen`;
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
            Webdesign und SEO verkaufen sich am besten dort, wo der Bedarf sichtbar ist: bei Firmen mit veralteter,
            langsamer oder gar keiner Website. Die Kunst ist nicht das Können – die Kunst ist, diese Firmen planbar zu
            finden und mit einem konkreten Aufhänger anzusprechen. Sechs Wege, die in der Praxis funktionieren.
          </P>

          <H2>1. Schwache Websites sind dein bester Aufhänger</H2>
          <P>
            Wer eine Firma anruft und sagt „Ihre Website lädt auf dem Handy 9 Sekunden und hat kein SSL", hat sofort die
            Aufmerksamkeit. Ein konkreter, überprüfbarer Mangel schlägt jede allgemeine Verkaufsfloskel. Genau deshalb
            lohnt es sich, vor dem Erstkontakt die Seite kurz zu bewerten.
          </P>

          <H2>2. Branchen mit oft schwacher Online-Präsenz</H2>
          <P>Manche Zielgruppen haben überdurchschnittlich oft veraltete oder fehlende Seiten:</P>
          <UL items={[
            "Handwerksbetriebe (Elektro, SHK, Maler, Dachdecker)",
            "Gastronomie, Cafés und kleine Hotels",
            "Lokale Einzelhändler und Filialbetriebe",
            "Praxen, Kanzleien und kleine Dienstleister",
            "Vereine und Handwerkskooperationen",
          ]} />

          <H2>3. Mobile-Performance objektiv messen</H2>
          <P>
            Statt nach Bauchgefühl zu urteilen, prüfe Ladezeit, mobile Darstellung und HTTPS. Im Webdesign-Modus von
            KundenRadar wird die Website jeder gefundenen Firma automatisch bewertet – schwache oder fehlende Seiten
            werden markiert, damit du deine Zeit nur in echte Chancen steckst.
          </P>

          <H2>4. Den Preis sauber kalkulieren</H2>
          <P>
            Bevor du anrufst, solltest du wissen, was dein Angebot wert ist. Kalkuliere Stunden- und Projektpreis mit dem{" "}
            <Link href="/rechner/webdesign-preis" className="text-[var(--color-brand)] hover:underline">Webdesign-Preis-Rechner</Link>{" "}
            und laufende SEO-Pakete mit dem{" "}
            <Link href="/rechner/seo-kosten" className="text-[var(--color-brand)] hover:underline">SEO-Kosten-Rechner</Link>{" "}
            – so gehst du nie unter deinem kostendeckenden Satz ins Gespräch.
          </P>

          <H2>5. Telefon schlägt E-Mail – im B2B erlaubt</H2>
          <P>
            Gegenüber Unternehmen genügt für Werbeanrufe eine mutmaßliche Einwilligung (§ 7 Abs. 2 Nr. 1 UWG), während
            Kalt-E-Mails grundsätzlich eine vorherige Einwilligung brauchen. Ein kurzer, höflicher Anruf mit konkretem
            Website-Befund ist also der zulässige und wirksamere Erstkontakt. Mehr dazu im{" "}
            <Link href="/blog/kaltakquise-b2b-erlaubt" className="text-[var(--color-brand)] hover:underline">UWG-Ratgeber</Link>.
          </P>

          <H2>6. Systematisch statt zufällig</H2>
          <P>
            Der Zeitfresser ist die Recherche: Welche Firmen im Umkreis haben überhaupt eine schwache Seite? Statt
            stundenlang zu googeln, lässt du dir passende Firmen mit Telefon und Ansprechpartner liefern, bewertest ihre
            Website per Klick und arbeitest alles – Anrufe, Aufgaben, Angebote – in einer Pipeline ab. Genau dafür ist
            KundenRadar gebaut.
          </P>

          <H2>Fazit</H2>
          <P>
            Mach die Website-Bewertung zu deinem Vertriebsmotor: Finde Firmen mit schwacher Online-Präsenz, sprich sie
            mit einem konkreten Befund an und kalkuliere von Anfang an profitabel. Zwei, drei feste Akquise-Slots pro
            Woche genügen, um eine volle Pipeline aufzubauen.
          </P>
        </div>
        <FreebieCta source="blog" />
      </article>
    </MarketingShell>
  );
}
