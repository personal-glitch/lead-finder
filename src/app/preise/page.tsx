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

      <H2>Kostenlose Testphase</H2>
      <P>
        Du kannst KundenRadar 3 Tage kostenlos testen. Kündigst du innerhalb der Testphase, entstehen keine Kosten.
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
        Anbieter und Vertragspartner ist die Seciora GbR i.G. (in Gründung), Cihan Yildirim und Salih Aygün,
        Rathenaustraße 135, 51373 Leverkusen. Es gelten ergänzend unsere{" "}
        <a href="/agb" className="text-[var(--color-brand)] hover:underline">AGB</a> und die{" "}
        <a href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</a>.
      </P>
    </LegalShell>
  );
}
