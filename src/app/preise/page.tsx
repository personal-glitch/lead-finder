import type { Metadata } from "next";
import { LegalShell, H2, P, UL } from "@/components/landing/LegalShell";

export const metadata: Metadata = { title: "Preise & Laufzeit – KundenRadar" };

export default function PreisePage() {
  return (
    <LegalShell
      title="Preise & Laufzeit"
      intro="Transparente Informationen zu Preis, Abrechnung, Laufzeit und Kündigung. Stand: Juni 2026."
    >
      <H2>Preis</H2>
      <UL items={[
        "KundenRadar kostet 49 € pro Monat – das ist der Gesamtpreis (Endpreis), den du zahlst.",
        "Umsatzsteuer: Als Kleinunternehmer im Sinne des § 19 UStG weist der Anbieter keine Umsatzsteuer aus. Gilt Regelbesteuerung, ist die gesetzliche Umsatzsteuer im genannten Preis bereits enthalten – der zu zahlende Betrag bleibt 49 €.",
        "Es fallen keine Einrichtungs- oder versteckten Gebühren an.",
      ]} />

      <H2>Kostenlose Testphase (3 Tage)</H2>
      <P>
        Du kannst KundenRadar <strong>3 Tage kostenlos</strong> testen; dabei wird eine Zahlungsmethode hinterlegt, in
        den ersten 3 Tagen wird nichts berechnet. <strong>Kündigst du nicht vor Ablauf der 3 Tage, geht der Test
        automatisch in ein kostenpflichtiges Monatsabo zu 49 € pro Monat über</strong> und die erste Zahlung wird
        fällig. Das Abo ist jederzeit monatlich mit einem Klick kündbar. Eine dauerhaft kostenlose Version gibt es nicht.
      </P>

      <H2>Abrechnung &amp; Zahlung</H2>
      <UL items={[
        "Die Abrechnung erfolgt im Voraus für den jeweiligen Monat.",
        "Die Zahlung wird sicher über den Zahlungsdienstleister Stripe abgewickelt (u. a. gängige Kartenzahlung).",
        "Du hältst dafür eine gültige Zahlungsmethode in deinem Konto vor.",
      ]} />

      <H2>Laufzeit &amp; Kündigung</H2>
      <UL items={[
        "Das Abonnement läuft monatlich und ist jederzeit zum Ende des laufenden Abrechnungszeitraums kündbar.",
        "Es gibt keine Mindestvertragslaufzeit über den laufenden Monat hinaus.",
        "Die Kündigung ist direkt im Tool oder per Nachricht an uns möglich.",
        "Mit Wirksamwerden der Kündigung endet der Zugang zum Dienst.",
      ]} />

      <H2>Vertragspartner</H2>
      <P>
        Anbieter und Vertragspartner ist Seciora Solutions, Inhaber Cihan Yildirim (Einzelunternehmen),
        Charlottenstraße 37, 51149 Köln. Es gelten ergänzend unsere{" "}
        <a href="/agb" className="text-[var(--color-brand)] hover:underline">AGB</a> und die{" "}
        <a href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</a>.
      </P>
    </LegalShell>
  );
}
