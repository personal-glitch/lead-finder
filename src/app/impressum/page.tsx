import type { Metadata } from "next";
import { LegalShell, H2, P, PlaceholderNote } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "Impressum – KundenRadar" };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum">
      <PlaceholderNote />

      <H2>Angaben gemäß § 5 TMG</H2>
      <P>[Firmenname / Rechtsform, z. B. Muster Reinigung GmbH]</P>
      <P>[Straße und Hausnummer]<br />[PLZ] [Ort]</P>

      <H2>Vertreten durch</H2>
      <P>[Geschäftsführer/in, z. B. Max Mustermann]</P>

      <H2>Kontakt</H2>
      <P>Telefon: [Telefonnummer]<br />E-Mail: [E-Mail-Adresse]</P>

      <H2>Registereintrag</H2>
      <P>Eintragung im Handelsregister.<br />Registergericht: [Amtsgericht]<br />Registernummer: [HRB …]</P>

      <H2>Umsatzsteuer-ID</H2>
      <P>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: [DE…]</P>

      <H2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H2>
      <P>[Name]<br />[Anschrift wie oben]</P>

      <H2>Haftung für Inhalte</H2>
      <P>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
        allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
        verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Verpflichtungen zur
        Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
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
