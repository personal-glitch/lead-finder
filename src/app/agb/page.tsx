import type { Metadata } from "next";
import { LegalShell, H2, P, UL } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "AGB – KundenRadar" };

export default function AgbPage() {
  return (
    <LegalShell
      title="Allgemeine Geschäftsbedingungen (AGB)"
      intro="Diese AGB regeln die Nutzung des Online-Dienstes KundenRadar. Stand: Juni 2026."
    >
      <H2>§ 1 Anbieter &amp; Geltungsbereich</H2>
      <P>
        Anbieter des Dienstes „KundenRadar" (nachfolgend „Dienst") ist die Seciora GbR i.G. (in Gründung),
        vertreten durch die Gesellschafter Cihan Yildirim und Salih Aygün, Rathenaustraße 135, 51373 Leverkusen
        (nachfolgend „Anbieter"). Diese AGB gelten für sämtliche Verträge über die Nutzung des Dienstes zwischen
        dem Anbieter und seinen Kundinnen und Kunden (nachfolgend „Nutzer").
      </P>
      <P>
        Das Angebot richtet sich an Gewerbetreibende, Selbstständige und Unternehmen (Unternehmer i.S.d. § 14 BGB).
        Abweichende oder ergänzende Bedingungen des Nutzers werden nur wirksam, wenn der Anbieter ihnen ausdrücklich
        zustimmt.
      </P>

      <H2>§ 2 Leistungsgegenstand</H2>
      <P>
        Der Anbieter stellt eine webbasierte Software (Software as a Service) bereit, mit der Nutzer öffentlich
        zugängliche, geschäftliche Firmendaten recherchieren, anreichern, in einer Vertriebs-Pipeline verwalten und
        per E-Mail-Vorlagen ansprechen können. Der konkrete Funktionsumfang ergibt sich aus der jeweils aktuellen
        Leistungsbeschreibung auf der Website.
      </P>
      <P>
        Die Datenrecherche greift auf öffentliche Quellen (u. a. OpenStreetMap) zu. Der Anbieter übernimmt keine
        Gewähr für Vollständigkeit, Richtigkeit oder ständige Verfügbarkeit dieser Drittquellen.
      </P>

      <H2>§ 3 Vertragsschluss &amp; Registrierung</H2>
      <P>
        Zur Nutzung ist eine Registrierung mit zutreffenden Angaben erforderlich. Der Vertrag kommt mit Abschluss
        der Registrierung bzw. mit dem Start eines kostenpflichtigen Abonnements zustande. Zugangsdaten sind
        vertraulich zu behandeln.
      </P>

      <H2>§ 4 Kostenlose Testphase</H2>
      <P>
        Sofern angeboten, kann der Dienst für einen begrenzten Zeitraum (derzeit 3 Tage) kostenlos getestet werden.
        Ein Anspruch auf eine Testphase besteht nicht. Wird das Abonnement nicht vor Ablauf der Testphase gekündigt,
        geht es – sofern bei der Anmeldung so vereinbart – in ein kostenpflichtiges Abonnement über.
      </P>

      <H2>§ 5 Preise &amp; Zahlung</H2>
      <UL items={[
        "Das Abonnement kostet 49 € pro Monat (Gesamtpreis/Endpreis).",
        "Umsatzsteuer: Als Kleinunternehmer (§ 19 UStG) weist der Anbieter keine Umsatzsteuer aus; bei Regelbesteuerung ist die gesetzliche Umsatzsteuer im Preis bereits enthalten. Der zu zahlende Betrag bleibt 49 € pro Monat.",
        "Die Abrechnung erfolgt im Voraus für den jeweiligen Abrechnungszeitraum (monatlich).",
        "Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister Stripe; es gelten zusätzlich dessen Bedingungen. Der Nutzer hält eine gültige Zahlungsmethode vor.",
        "Bei Zahlungsverzug kann der Zugang bis zum Ausgleich gesperrt werden.",
      ]} />

      <H2>§ 6 Laufzeit &amp; Kündigung</H2>
      <P>
        Das Abonnement läuft auf unbestimmte Zeit und kann jederzeit zum Ende des laufenden Abrechnungszeitraums
        (monatlich) gekündigt werden. Die Kündigung ist im Tool bzw. per Nachricht an den Anbieter möglich. Das Recht
        zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Mit Wirksamwerden der Kündigung endet
        der Zugang zum Dienst.
      </P>

      <H2>§ 7 Pflichten des Nutzers</H2>
      <UL items={[
        "Der Nutzer nutzt den Dienst ausschließlich im Rahmen der geltenden Gesetze, insbesondere des Datenschutz- (DSGVO), Wettbewerbs- (UWG) und Telekommunikationsrechts.",
        "Für die im Tool verarbeiteten Kontakt-/Lead-Daten ist der Nutzer datenschutzrechtlich Verantwortlicher; der Anbieter handelt insoweit als Auftragsverarbeiter (Abschluss eines AV-Vertrags auf Anfrage).",
        "Die Kontaktaufnahme zu recherchierten Firmen (z. B. werbliche E-Mails, Telefonwerbung) erfolgt eigenverantwortlich und unter Beachtung der gesetzlichen Einwilligungs- und Informationspflichten.",
        "Eine missbräuchliche Nutzung (z. B. Spam, automatisiertes Auslesen über den vorgesehenen Umfang hinaus, Rechtsverletzungen Dritter) ist untersagt.",
      ]} />

      <H2>§ 8 Verfügbarkeit</H2>
      <P>
        Der Anbieter ist um eine hohe Verfügbarkeit bemüht, schuldet jedoch keine ununterbrochene Erreichbarkeit.
        Wartungsarbeiten, Störungen bei Drittanbietern (Hosting, Datenquellen, Zahlungsdienstleister) sowie Fälle
        höherer Gewalt können die Verfügbarkeit vorübergehend einschränken.
      </P>

      <H2>§ 9 Haftung</H2>
      <P>
        Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei der Verletzung von Leben,
        Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen
        Vertragspflicht (Kardinalpflicht) und begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Im Übrigen
        ist die Haftung ausgeschlossen. Eine Haftung für die inhaltliche Richtigkeit recherchierter Drittdaten sowie
        für die rechtmäßige Verwendung dieser Daten durch den Nutzer ist ausgeschlossen.
      </P>

      <H2>§ 10 Datenschutz</H2>
      <P>
        Informationen zur Verarbeitung personenbezogener Daten enthält die{" "}
        <a href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</a>.
      </P>

      <H2>§ 11 Änderungen der AGB</H2>
      <P>
        Änderungen dieser AGB bedürfen der Zustimmung des Nutzers. Der Anbieter bietet Änderungen mindestens
        30 Tage vor dem geplanten Wirksamwerden in Textform an und weist dabei auf die geplanten Änderungen sowie auf
        das Zustimmungs- bzw. Kündigungsrecht gesondert hin. Stimmt der Nutzer den Änderungen nicht zu, kann jede
        Partei den Vertrag zum geplanten Änderungstermin kündigen; bis zur Beendigung gelten die bisherigen
        Bedingungen fort. Eine Änderung wesentlicher Vertragsbestandteile (insbesondere Preis und Hauptleistung)
        erfolgt ausschließlich mit ausdrücklicher Zustimmung des Nutzers.
      </P>

      <H2>§ 12 Schlussbestimmungen</H2>
      <P>
        Es gilt das Recht der Bundesrepublik Deutschland. Ist der Nutzer Kaufmann, juristische Person des öffentlichen
        Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand der Sitz des Anbieters. Sollte eine
        Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
      </P>
    </LegalShell>
  );
}
