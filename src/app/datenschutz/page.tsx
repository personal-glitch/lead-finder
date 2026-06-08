import type { Metadata } from "next";
import { LegalShell, H2, P, UL, PlaceholderNote } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "Datenschutzerklärung – KundenRadar" };

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutzerklärung" intro="Wir nehmen den Schutz personenbezogener Daten ernst. Nachfolgend informieren wir über Art, Umfang und Zweck der Verarbeitung.">
      <PlaceholderNote />

      <H2>1. Verantwortlicher</H2>
      <P>[Firmenname], [Straße], [PLZ Ort] · E-Mail: [E-Mail] · Telefon: [Telefon]. Die vollständigen Angaben findest du im <a href="/impressum" className="text-[var(--color-brand)] hover:underline">Impressum</a>.</P>

      <H2>2. Hosting & Server-Logfiles</H2>
      <P>Beim Aufruf unserer Seiten erhebt unser Hosting-Provider automatisch Informationen (Server-Logfiles), die dein Browser übermittelt: IP-Adresse, Datum/Uhrzeit, abgerufene Seite, Browsertyp, Betriebssystem. Die Verarbeitung erfolgt zur Sicherstellung eines störungsfreien Betriebs und der Sicherheit (Art. 6 Abs. 1 lit. f DSGVO).</P>

      <H2>3. Cookies</H2>
      <P>Wir setzen technisch notwendige Cookies/Local Storage ein, die für den Betrieb und die Anmeldung erforderlich sind (Art. 6 Abs. 1 lit. f DSGVO). Nicht notwendige Cookies werden nur mit deiner Einwilligung gesetzt.</P>

      <H2>4. Nutzerkonto & Registrierung</H2>
      <P>Für die Registrierung und Nutzung des Tools verarbeiten wir die angegebenen Daten – Vorname, Nachname, Firma, Telefonnummer, E-Mail-Adresse sowie ein verschlüsselt gespeichertes Passwort (Hash) – zur Bereitstellung des Dienstes und zur Vertragsabwicklung (Art. 6 Abs. 1 lit. b DSGVO). Der Registrierung ist eine Zustimmung zu dieser Datenschutzerklärung vorgeschaltet. Die Daten werden gelöscht, sobald das Konto aufgelöst wird und keine gesetzlichen Aufbewahrungspflichten entgegenstehen; eine Löschung kannst du jederzeit anfordern.</P>

      <H2>4a. Eingesetzte Dienstleister (Auftragsverarbeiter)</H2>
      <P>Wir setzen sorgfältig ausgewählte Dienstleister als Auftragsverarbeiter ein, mit denen entsprechende Verträge (AVV) bestehen:</P>
      <UL items={[
        "Hosting, Datenbank & Anmeldung: Supabase – Verarbeitung in der EU (Region Frankfurt).",
        "Zahlungsabwicklung & Abo: Stripe – Karten-, PayPal- und weitere Zahlarten; Stripe verarbeitet die Zahlungsdaten eigenverantwortlich.",
        "E-Mail-Versand: über den vom Nutzer hinterlegten eigenen Mailanbieter (SMTP) bzw. einen E-Mail-Dienstleister; Zugangsdaten werden verschlüsselt gespeichert.",
        "Eine Übermittlung in Drittländer erfolgt nur auf Grundlage geeigneter Garantien (z. B. EU-Standardvertragsklauseln).",
      ]} />

      <H2>5. Verarbeitung geschäftlicher Kontaktdaten (B2B-Leads)</H2>
      <P>Im Tool werden geschäftliche Kontaktdaten verarbeitet (Firmenname, Anschrift, geschäftliche Telefonnummer, ggf. Name einer Ansprechperson in rein geschäftlicher Funktion). Es handelt sich um öffentlich zugängliche, geschäftliche Daten. Rechtsgrundlage ist das berechtigte Interesse an der B2B-Geschäftsanbahnung (Art. 6 Abs. 1 lit. f DSGVO).</P>
      <UL items={[
        "Betroffene können der Verarbeitung jederzeit widersprechen (Opt-out); abgemeldete Adressen werden gesperrt.",
        "Die Herkunft jedes Datensatzes wird gespeichert, sodass Auskunfts- und Löschanfragen beantwortet werden können.",
        "Für die im Tool verarbeiteten Leads ist der jeweilige Nutzer (Reinigungsfirma) datenschutzrechtlich Verantwortlicher; wir handeln insoweit als Auftragsverarbeiter (Abschluss eines AV-Vertrags auf Anfrage).",
      ]} />

      <H2>6. Kontaktaufnahme</H2>
      <P>Wenn du uns über das Kontaktformular oder per E-Mail kontaktierst, verarbeiten wir die angegebenen Daten (Name, E-Mail, Nachricht) zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Die Daten werden nach Abschluss gelöscht, sofern keine Aufbewahrungspflichten bestehen.</P>

      <H2>7. E-Mail-Versand</H2>
      <P>Für den Versand von E-Mails aus dem Tool nutzen wir einen Dienstleister als Auftragsverarbeiter. Jede werbliche E-Mail enthält ein Impressum sowie einen funktionierenden Abmeldelink. Eine Übermittlung in Drittländer erfolgt nur auf Grundlage geeigneter Garantien.</P>

      <H2>8. Deine Rechte</H2>
      <UL items={[
        "Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18)",
        "Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21) gegen Verarbeitungen auf Basis berechtigter Interessen",
        "Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft",
        "Beschwerde bei einer Datenschutz-Aufsichtsbehörde",
      ]} />

      <H2>9. Widerspruch gegen Werbung</H2>
      <P>Der Nutzung der Kontaktdaten zur Übersendung nicht ausdrücklich angeforderter Werbung wird widersprochen. Eine Abmeldung ist über den Link in jeder E-Mail oder per Nachricht an uns jederzeit möglich.</P>

      <H2>10. Aktualität</H2>
      <P>Diese Datenschutzerklärung hat den Stand [Monat/Jahr]. Durch Weiterentwicklung des Angebots kann eine Anpassung erforderlich werden.</P>
    </LegalShell>
  );
}
