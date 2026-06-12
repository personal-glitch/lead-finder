import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Maler Stundensatz Rechner 2026: Stundenverrechnungssatz berechnen – KundenRadar",
  description:
    "Kostenloser Maler-Stundensatz-Rechner: berechne deinen Stundenverrechnungssatz aus Lohn, Gemeinkosten und Gewinn – mit Marktspanne für Maler & Lackierer. Ohne Anmeldung.",
  alternates: { canonical: "/rechner/maler-stundensatz" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Maler & Lackierer · Gratis-Rechner"
      h1="Maler-Stundensatz berechnen – fairer Stundenverrechnungssatz"
      intro="Was musst du als Maler pro Stunde verrechnen, um kostendeckend und profitabel zu arbeiten? Gib Lohn, Gemeinkostenzuschlag und Gewinn ein – der Rechner zeigt dir sofort deinen Stundenverrechnungssatz und ob er im Markt liegt."
      content={[
        { title: "So berechnest du den Maler-Stundensatz", text: "Der Stundenverrechnungssatz ergibt sich aus deinen produktiven Lohnkosten je Stunde, multipliziert mit dem Gemeinkostenzuschlag (Fahrzeuge, Werkzeug, Versicherung, Verwaltung) und deinem Gewinnaufschlag. Wer nur den reinen Stundenlohn verrechnet, arbeitet auf Dauer mit Verlust." },
        { title: "Typische Stundensätze im Malerhandwerk", text: "Im Malerhandwerk liegen die Stundenverrechnungssätze 2026 je nach Region und Leistung meist zwischen 45 und 65 € netto. Spezialarbeiten (Lackierung, Tapezier-Effekte, Denkmalpflege) liegen darüber. Der Markt-Balken im Rechner zeigt dir, wo du stehst." },
        { title: "Region & Gemeinkosten richtig ansetzen", text: "In Ballungsräumen sind höhere Sätze durchsetzbar als auf dem Land. Wichtiger als der Vergleich ist aber dein eigener Gemeinkostenzuschlag: Wer Fahrzeuge, Lager und Verwaltung sauber einrechnet, schützt seine Marge." },
      ]}
      faqs={[
        { q: "Was kostet ein Maler pro Stunde?", a: "Der Stundenverrechnungssatz im Malerhandwerk liegt 2026 meist zwischen 45 und 65 € netto, abhängig von Region, Leistung und Betriebsgröße. Material wird in der Regel zusätzlich berechnet." },
        { q: "Ist der Rechner kostenlos?", a: "Ja, ohne Anmeldung. Für die volle Aufschlüsselung und ein Angebots-PDF genügt ein kostenloses KundenRadar-Konto." },
        { q: "Netto oder brutto?", a: "Du kannst oben umschalten. Im Geschäftsverkehr wird netto kalkuliert; die Umsatzsteuer kommt auf die Rechnung." },
      ]}
      related={[
        { href: "/rechner/elektriker-stundensatz", label: "Elektriker-Stundensatz" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk allgemein" },
        { href: "/rechner/gebaeudereinigung", label: "Reinigungskosten" },
      ]}
    />
  );
}
