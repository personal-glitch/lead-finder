import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Neukunden gewinnen als Handwerksbetrieb – 7 Wege zu mehr Aufträgen";
const DESC =
  "Wie Handwerker planbar an gewerbliche Aufträge kommen: Hausverwaltungen, Bauträger und Betriebe gezielt ansprechen, sauber kalkulieren und systematisch akquirieren.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/neukunden-handwerksbetrieb" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/neukunden-handwerksbetrieb`;
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
            Volle Auftragsbücher sind im Handwerk kein Zufall. Wer neben Privatkunden gezielt gewerbliche Auftraggeber
            anspricht, macht sich unabhängiger und planbarer. Diese sieben Wege funktionieren in der Praxis.
          </P>

          <H2>1. Hausverwaltungen & Bauträger als Dauerkunden</H2>
          <P>
            Verwaltungen und Bauträger vergeben regelmäßig Aufträge – Sanierung, Reparatur, Ausbau. Ein guter Kontakt
            bedeutet oft wiederkehrende Aufträge über viele Objekte. Lege dir eine Liste der Verwaltungen und Bauträger
            in deinem Umkreis an und sprich sie aktiv an.
          </P>

          <H2>2. Gewerbliche Zielgruppen mit konstantem Bedarf</H2>
          <P>Manche Betriebe brauchen laufend Handwerksleistungen:</P>
          <UL items={[
            "Filialisten, Autohäuser und Ladenketten (Umbau, Instandhaltung)",
            "Hotels, Gastronomie und Pflegeeinrichtungen",
            "Industrie- und Logistikbetriebe (Halle, Technik)",
            "andere Handwerksbetriebe als Subunternehmer-Partner",
          ]} />

          <H2>3. Sauber kalkulieren – mit dem richtigen Stundensatz</H2>
          <P>
            Wer zu knapp kalkuliert, arbeitet für die Konkurrenz. Ermittle deinen kostendeckenden
            Stundenverrechnungssatz mit dem{" "}
            <Link href="/rechner/handwerk-stundensatz" className="text-[var(--color-brand)] hover:underline">Handwerk-Stundensatz-Rechner</Link>{" "}
            und gib nie unter diesem Satz ein Angebot ab.
          </P>

          <H2>4. Empfehlungen aktiv erfragen</H2>
          <P>
            Zufriedene gewerbliche Kunden empfehlen dich gern weiter – aber nur, wenn du fragst. Nach jedem gelungenen
            Auftrag aktiv um eine Weiterempfehlung oder eine Google-Bewertung bitten.
          </P>

          <H2>5. Telefonakquise – im B2B erlaubt</H2>
          <P>
            Gegenüber Unternehmen genügt für einen Werbeanruf eine mutmaßliche Einwilligung (§ 7 Abs. 2 Nr. 1 UWG),
            während Kalt-E-Mails grundsätzlich eine vorherige Einwilligung verlangen. Ein kurzer, höflicher Anruf bei der
            passenden Firma ist also ein zulässiger Erstkontakt – mehr im{" "}
            <Link href="/blog/kaltakquise-b2b-erlaubt" className="text-[var(--color-brand)] hover:underline">UWG-Ratgeber</Link>.
          </P>

          <H2>6. Schnelle, klare Angebote</H2>
          <P>
            Wer zügig ein transparentes Angebot liefert, gewinnt häufiger. Ein professionelles Angebots-PDF mit klarer
            Position und Preis hinterlässt Eindruck – KundenRadar erstellt es dir aus deiner Kalkulation.
          </P>

          <H2>7. Systematische Umkreis-Suche statt Zufall</H2>
          <P>
            Der größte Zeitfresser ist die Recherche: Welche Betriebe, Verwaltungen und Filialen gibt es in meiner Nähe?
            Statt zu googeln, lässt du dir passende Firmen mit Telefonnummer und Ansprechpartner liefern und arbeitest
            Anrufe, Aufgaben und Angebote in einer Pipeline ab. Genau dafür ist KundenRadar gebaut.
          </P>

          <H2>Fazit</H2>
          <P>
            Zwei bis drei feste Akquise-Slots pro Woche – gewerbliche Zielkunden anrufen, sauber kalkulieren, Angebote
            nachfassen – und dein Auftragsbestand wird planbar. Konstanz schlägt Aktionismus.
          </P>
        </div>
      </article>
    </MarketingShell>
  );
}
