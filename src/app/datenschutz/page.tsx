import type { Metadata } from "next";
import { LegalShell, H2, P, UL } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "Datenschutzerklärung – KundenRadar" };

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutzerklärung" intro="Wir nehmen den Schutz personenbezogener Daten ernst. Nachfolgend informieren wir über Art, Umfang und Zweck der Verarbeitung.">
      <H2>1. Verantwortlicher</H2>
      <P>
        Cihan Yildirim, Einzelunternehmen „KundenRadar", Rathenaustraße 135,
        51373 Leverkusen · Telefon: +49 15566 021171 · E-Mail: kontakt@seciora.de. Die vollständigen Angaben findest du im{" "}
        <a href="/impressum" className="text-[var(--color-brand)] hover:underline">Impressum</a>.
      </P>

      <H2>2. Hosting &amp; Server-Logfiles</H2>
      <P>
        Unsere Anwendung wird bei der Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) betrieben;
        die Server-Funktionen sind auf die EU-Region Frankfurt (Deutschland) festgelegt. Beim Aufruf der Seiten
        verarbeitet der Hosting-Provider automatisch technische Informationen (Server-Logfiles): IP-Adresse,
        Datum/Uhrzeit, abgerufene Seite, Browsertyp, Betriebssystem. Die Verarbeitung erfolgt zur Sicherstellung
        eines störungsfreien Betriebs und der Sicherheit (Art. 6 Abs. 1 lit. f DSGVO). Soweit eine Verarbeitung in
        den USA erfolgt, stützt sich diese auf die EU-Standardvertragsklauseln (Art. 46 DSGVO).
      </P>

      <H2>3. Cookies &amp; lokale Speicherung</H2>
      <P>
        Wir setzen ausschließlich technisch notwendige Cookies bzw. lokale Speicherung ein, die für den Betrieb und
        die Anmeldung (Session) erforderlich sind (Art. 6 Abs. 1 lit. f DSGVO). Nicht notwendige Cookies oder
        Tracking setzen wir nicht ein; eine Einwilligung ist daher nicht erforderlich.
      </P>

      <H2>4. Nutzerkonto &amp; Registrierung</H2>
      <P>
        Für die Registrierung und Nutzung des Tools verarbeiten wir die angegebenen Daten – Vorname, Nachname, Firma,
        Telefonnummer, E-Mail-Adresse sowie ein nur verschlüsselt gespeichertes Passwort (Hash) – zur Bereitstellung
        des Dienstes und zur Vertragsabwicklung (Art. 6 Abs. 1 lit. b DSGVO). Der Registrierung ist eine Zustimmung zu
        dieser Datenschutzerklärung vorgeschaltet. Die Daten werden gelöscht, sobald das Konto aufgelöst wird und keine
        gesetzlichen Aufbewahrungspflichten entgegenstehen; eine Löschung kannst du jederzeit anfordern.
      </P>

      <H2>4a. Eingesetzte Dienstleister (Auftragsverarbeiter)</H2>
      <P>Wir setzen sorgfältig ausgewählte Dienstleister ein, mit denen Verträge zur Auftragsverarbeitung (Art. 28 DSGVO) bestehen bzw. abgeschlossen werden:</P>
      <UL items={[
        "Hosting & CDN: Vercel Inc., USA – Betrieb der Anwendung, Server-Funktionen in der EU-Region Frankfurt; Drittlandtransfer auf Basis der EU-Standardvertragsklauseln.",
        "Datenbank, Anmeldung & Authentifizierung: Supabase Inc., USA – Datenspeicherung im EU-Rechenzentrum (Region Irland, eu-west-1); Drittlandtransfer auf Basis der EU-Standardvertragsklauseln. Der Zugriff ist durch Row-Level-Security je Nutzerkonto abgesichert.",
        "Zahlungsabwicklung & Abo: Stripe Payments Europe, Ltd. (Irland) bzw. Stripe, Inc. – Verarbeitung der Zahlungsdaten in eigener Verantwortung; wir erhalten keine vollständigen Zahlungsmittel-Daten.",
        "Orts-/Firmensuche & Geokodierung: OpenStreetMap-Dienste (Nominatim, OpenStreetMap Foundation, UK). Übermittelt werden nur die Suchparameter (z. B. PLZ/Ort und Branche), keine personenbezogenen Daten der Nutzerinnen und Nutzer.",
        "E-Mail-Versand: über den von der Nutzerin/dem Nutzer hinterlegten eigenen Mailanbieter (SMTP) bzw. einen E-Mail-Dienstleister; Zugangsdaten werden verschlüsselt gespeichert.",
      ]} />

      <H2>5. Verarbeitung geschäftlicher Kontaktdaten (B2B-Leads)</H2>
      <P>
        Im Tool werden geschäftliche Kontaktdaten verarbeitet (Firmenname, Anschrift, geschäftliche Telefonnummer,
        ggf. Name einer Ansprechperson in rein geschäftlicher Funktion). Es handelt sich um öffentlich zugängliche,
        geschäftliche Daten aus OpenStreetMap sowie dem Impressum der jeweiligen Firmen-Website. Rechtsgrundlage ist
        das berechtigte Interesse an der B2B-Geschäftsanbahnung (Art. 6 Abs. 1 lit. f DSGVO).
      </P>
      <UL items={[
        "Betroffene können der Verarbeitung jederzeit widersprechen (Opt-out); abgemeldete Adressen werden gesperrt.",
        "Die Herkunft jedes Datensatzes wird gespeichert, sodass Auskunfts- und Löschanfragen beantwortet werden können.",
        "Für die im Tool verarbeiteten Leads ist die jeweilige Nutzerin/der Nutzer (z. B. die Reinigungsfirma) datenschutzrechtlich verantwortlich; wir handeln insoweit als Auftragsverarbeiter (Abschluss eines AV-Vertrags auf Anfrage).",
      ]} />

      <H2>6. Kontaktaufnahme</H2>
      <P>
        Wenn du uns über das Kontaktformular oder per E-Mail kontaktierst, verarbeiten wir die angegebenen Daten
        (Name, E-Mail, Nachricht) zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Die Daten werden
        nach Abschluss gelöscht, sofern keine Aufbewahrungspflichten bestehen.
      </P>

      <H2>7. E-Mail-Versand aus dem Tool</H2>
      <P>
        Für den Versand von E-Mails aus dem Tool nutzen Nutzerinnen und Nutzer einen eigenen Mailanbieter oder einen
        Dienstleister als Auftragsverarbeiter. Jede werbliche E-Mail enthält ein Impressum sowie einen funktionierenden
        Abmeldelink. Eine Übermittlung in Drittländer erfolgt nur auf Grundlage geeigneter Garantien.
      </P>

      <H2>8. Deine Rechte</H2>
      <UL items={[
        "Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18)",
        "Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21) gegen Verarbeitungen auf Basis berechtigter Interessen",
        "Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft",
        "Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
      ]} />

      <H2>9. Widerspruch gegen Werbung</H2>
      <P>
        Der Nutzung der Kontaktdaten zur Übersendung nicht ausdrücklich angeforderter Werbung wird widersprochen. Eine
        Abmeldung ist über den Link in jeder E-Mail oder per Nachricht an uns jederzeit möglich.
      </P>

      <H2>10. Aktualität</H2>
      <P>Diese Datenschutzerklärung hat den Stand Juni 2026. Durch Weiterentwicklung des Angebots kann eine Anpassung erforderlich werden.</P>
    </LegalShell>
  );
}
