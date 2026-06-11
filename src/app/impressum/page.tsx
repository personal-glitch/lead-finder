import type { Metadata } from "next";
import { LegalShell, H2, P } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "Impressum – KundenRadar" };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum">
      <H2>Angaben gemäß § 5 DDG</H2>
      <P>Seciora Solutions</P>
      <P>Inhaber: Cihan Yildirim (Einzelunternehmen)<br />Geschäftsbezeichnung „KundenRadar"</P>
      <P>Charlottenstraße 37<br />51149 Köln<br />Deutschland</P>

      <H2>Kontakt</H2>
      <P>Telefon: +49 15566 021171<br />E-Mail: kontakt@seciora-solutions.de</P>

      <H2>Rechtsform</H2>
      <P>Einzelunternehmen. Eine Eintragung im Handelsregister besteht nicht.</P>

      <H2>Umsatzsteuer-Identifikationsnummer</H2>
      <P>Eine Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz wird nachgereicht, sobald sie vorliegt.</P>

      <H2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H2>
      <P>Cihan Yildirim<br />Anschrift wie oben.</P>

      <H2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</H2>
      <P>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </P>

      <H2>Haftung für Inhalte</H2>
      <P>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den
        allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
        verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Verpflichtungen zur
        Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon
        unberührt.
      </P>

      <H2>Haftung für Links</H2>
      <P>
        Unser Angebot enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
        Für diese fremden Inhalte können wir keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets
        der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
      </P>

      <H2>Urheberrecht</H2>
      <P>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
        Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Vervielfältigung, Bearbeitung und jede Art der
        Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.
      </P>
    </LegalShell>
  );
}
