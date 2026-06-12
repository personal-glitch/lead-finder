import type { Metadata } from "next";
import { LegalShell, H2, P, UL } from "@/components/landing/LegalShell";
import { AvvAccept } from "@/components/AvvAccept";

export const metadata: Metadata = { title: "Auftragsverarbeitungsvertrag (AVV) – KundenRadar" };

export default function AvvPage() {
  return (
    <LegalShell
      title="Auftragsverarbeitungsvertrag (AVV)"
      intro="Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO zwischen dir als Verantwortlichem und Seciora Solutions als Auftragsverarbeiter. Stand: Juni 2026 · Version 1.0."
    >
      <div className="mb-6"><AvvAccept /></div>

      <H2>§ 1 Gegenstand &amp; Parteien</H2>
      <P>
        Dieser Vertrag regelt die Verarbeitung personenbezogener Daten durch Seciora Solutions, Inhaber Cihan Yildirim,
        Charlottenstraße 37, 51149 Köln („Auftragsverarbeiter") im Auftrag des Nutzers von KundenRadar
        („Verantwortlicher"). Der Verantwortliche bleibt für die Rechtmäßigkeit der Verarbeitung verantwortlich,
        insbesondere für das Vorliegen einer Rechtsgrundlage für die Ansprache der von ihm verarbeiteten Kontakte.
      </P>

      <H2>§ 2 Gegenstand, Art &amp; Zweck der Verarbeitung</H2>
      <P>
        Bereitstellung einer SaaS-Anwendung zur Recherche, Anreicherung, Verwaltung (Pipeline) und Ansprache
        geschäftlicher Kontakte. Die Verarbeitung erfolgt ausschließlich auf dokumentierte Weisung des Verantwortlichen
        und für die Dauer der Nutzung des Dienstes.
      </P>

      <H2>§ 3 Art der Daten &amp; Kategorien betroffener Personen</H2>
      <UL items={[
        "Datenarten: geschäftliche Kontaktdaten (Firmenname, Anschrift, Telefon, E-Mail, Website, Ansprechpartner/Funktion), Notizen, Aktivitäts- und Versandprotokolle.",
        "Betroffene Personen: Ansprechpartner und Beschäftigte der vom Verantwortlichen recherchierten/verwalteten Unternehmen.",
      ]} />

      <H2>§ 4 Pflichten des Auftragsverarbeiters</H2>
      <UL items={[
        "Verarbeitung nur auf dokumentierte Weisung des Verantwortlichen (die Nutzung des Tools gilt als Weisung).",
        "Vertraulichkeit: zur Verarbeitung befugte Personen sind zur Vertraulichkeit verpflichtet.",
        "Technische und organisatorische Maßnahmen (Art. 32 DSGVO): verschlüsselte Übertragung (TLS), Zugriffsschutz, Mandantentrennung per Row-Level-Security, Zugriff nur für berechtigte Personen.",
        "Unterstützung des Verantwortlichen bei Betroffenenrechten sowie bei Datenschutz-Folgenabschätzungen und Meldepflichten (Art. 32–36 DSGVO) im Rahmen des technisch Möglichen.",
        "Meldung von Datenschutzverletzungen unverzüglich nach Bekanntwerden.",
        "Nach Beendigung: Löschung oder Rückgabe der Daten nach Wahl des Verantwortlichen, sofern keine gesetzliche Aufbewahrungspflicht besteht.",
        "Nachweise zur Einhaltung der Pflichten und Ermöglichung von Überprüfungen (Audits) in zumutbarem Rahmen.",
      ]} />

      <H2>§ 5 Unterauftragsverarbeiter</H2>
      <P>
        Der Verantwortliche stimmt dem Einsatz folgender Unterauftragsverarbeiter zu. Über Änderungen wird der
        Auftragsverarbeiter vorab informieren; ein Widerspruchsrecht aus wichtigem Grund bleibt unberührt.
      </P>
      <UL items={[
        "Supabase Inc. (USA) – Datenbank, Authentifizierung; Datenspeicherung im EU-Rechenzentrum (Region Irland, eu-west-1), Drittlandtransfer auf Basis der EU-Standardvertragsklauseln.",
        "Vercel Inc. (USA) – Hosting/Auslieferung der Anwendung, Region Frankfurt (fra1); EU-Standardvertragsklauseln.",
        "1&1 IONOS SE (Deutschland) – E-Mail-Versand über das Betreiber-Postfach (Systemmails).",
        "Stripe Payments Europe Ltd. (Irland) – Zahlungsabwicklung des Abonnements.",
      ]} />

      <H2>§ 6 Ort der Verarbeitung</H2>
      <P>
        Die Verarbeitung findet innerhalb der EU/des EWR statt. Soweit Unterauftragsverarbeiter in einem Drittland
        sitzen, erfolgt die Übermittlung auf Grundlage geeigneter Garantien (EU-Standardvertragsklauseln).
      </P>

      <H2>§ 7 Pflichten &amp; Verantwortung des Verantwortlichen</H2>
      <P>
        Der Verantwortliche stellt sicher, dass für jede Verarbeitung und Ansprache eine Rechtsgrundlage besteht –
        insbesondere, dass E-Mail-Werbung nur mit Einwilligung oder bei berechtigtem Interesse i.S.d. § 7 UWG erfolgt –
        und kommt seinen Informationspflichten (Art. 13/14 DSGVO) nach.
      </P>

      <H2>§ 8 Laufzeit</H2>
      <P>
        Dieser Vertrag gilt für die Dauer der Nutzung von KundenRadar. Er endet automatisch mit Beendigung des
        Nutzungsverhältnisses.
      </P>

      <P>
        Hinweis: Diese Vorlage ist sorgfältig erstellt, ersetzt aber keine Rechtsberatung. Für maximale Sicherheit
        sollte der Vertrag einmal anwaltlich geprüft werden.
      </P>
    </LegalShell>
  );
}
