import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Neukunden gewinnen als Reinigungsfirma – 7 Wege, die wirklich funktionieren";
const DESC =
  "Wie Gebäudereiniger planbar an neue Aufträge kommen: von Hausverwaltungen und Empfehlungen über lokale Sichtbarkeit bis zur gezielten Umkreis-Suche nach passenden Firmen.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/neukunden-reinigungsfirma" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/neukunden-reinigungsfirma`;
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESC,
          datePublished: "2026-06-11",
          dateModified: "2026-06-11",
          author: { "@type": "Organization", name: "Seciora Solutions" },
          publisher: { "@type": "Organization", name: "KundenRadar" },
          mainEntityOfPage: url,
        }}
      />

      <article>
        <Link href="/blog" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Blog</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">{TITLE}</h1>
        <p className="mt-3 text-base text-[var(--color-muted)]">{DESC}</p>

        <div className="mt-8">
          <P>
            Aufträge in der Gebäudereinigung kommen selten von allein – aber Neukundengewinnung muss auch kein
            Glücksspiel sein. Wer ein paar Kanäle systematisch bedient, hat planbar volle Auftragsbücher. Hier die
            sieben Wege, die sich in der Praxis bewähren.
          </P>

          <H2>1. Hausverwaltungen gezielt ansprechen</H2>
          <P>
            Hausverwaltungen vergeben laufend Unterhaltsreinigung für Treppenhäuser, Büros und Außenanlagen – meist
            in wiederkehrenden Verträgen. Ein einziger guter Kontakt kann mehrere Objekte bedeuten. Lege dir eine
            Liste der Verwaltungen in deinem Umkreis an und sprich sie persönlich an.
          </P>

          <H2>2. Empfehlungen aktiv erfragen</H2>
          <P>
            Zufriedene Kunden empfehlen dich gern – aber nur, wenn du fragst. Bitte nach gelungenen Aufträgen aktiv
            um eine Weiterempfehlung oder eine kurze Google-Bewertung. Empfehlungen sind der günstigste und am
            besten konvertierende Kanal.
          </P>

          <H2>3. Lokale Sichtbarkeit bei Google</H2>
          <P>
            Ein gepflegtes Google-Unternehmensprofil mit Fotos, Leistungen und Bewertungen sorgt dafür, dass dich
            Interessenten finden, die „Gebäudereinigung + Stadt" googeln. Kostenlos und mit hoher Wirkung im lokalen
            Umkreis.
          </P>

          <H2>4. Branchen mit konstantem Reinigungsbedarf</H2>
          <P>
            Manche Zielgruppen brauchen praktisch immer Reinigung. Konzentriere deine Akquise auf diese:
          </P>
          <UL items={[
            "Arzt- und Zahnarztpraxen (Hygiene-Anforderungen, regelmäßige Reinigung)",
            "Büros, Kanzleien und Steuerberater",
            "Hotels, Pensionen und Gastronomie",
            "Fitnessstudios und Kosmetikstudios",
            "Autohäuser und Filialbetriebe",
          ]} />

          <H2>5. Telefonakquise – im B2B erlaubt</H2>
          <P>
            Anders als bei E-Mail genügt für Werbeanrufe gegenüber Unternehmen eine mutmaßliche Einwilligung
            (§ 7 Abs. 2 Nr. 1 UWG). Ein kurzer, höflicher Anruf bei der passenden Firma ist also ein zulässiger und
            oft wirksamer Erstkontakt. Wichtig: relevant bleiben und ein konkretes Angebot machen.
          </P>

          <H2>6. Saubere Angebote, die im Kopf bleiben</H2>
          <P>
            Wer schnell ein klares, transparentes Angebot mit Preis pro m² liefert, gewinnt häufiger. Kalkuliere
            sauber – unser{" "}
            <Link href="/rechner/gebaeudereinigung" className="text-[var(--color-brand)] hover:underline">Reinigungskosten-Rechner</Link>{" "}
            hilft dir, in Sekunden einen marktgerechten Angebotspreis zu ermitteln.
          </P>

          <H2>7. Systematische Umkreis-Suche statt Zufall</H2>
          <P>
            Der größte Zeitfresser ist das Recherchieren: Wer sind die Hausverwaltungen, Praxen und Büros in meiner
            Nähe, wen rufe ich an? Statt stundenlang zu googeln, kannst du dir die passenden Firmen direkt mit
            Telefonnummer und Ansprechpartner liefern lassen und alles – Anrufe, Aufgaben, Angebote – in einer
            Pipeline abarbeiten. Genau dafür ist KundenRadar gebaut.
          </P>

          <H2>Fazit</H2>
          <P>
            Kombiniere zwei bis drei dieser Wege fest in deinen Wochenrhythmus – z. B. 10 Anrufe pro Tag bei
            Hausverwaltungen und Praxen plus aktives Empfehlungsmanagement. Konstanz schlägt Aktionismus: Wer jede
            Woche dranbleibt, hat in wenigen Monaten einen stabilen Strom neuer Aufträge.
          </P>
        </div>
      </article>
    </MarketingShell>
  );
}
