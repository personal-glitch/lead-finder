import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Stundenverrechnungssatz-Rechner Handwerk (2026): kostendeckenden Stundensatz berechnen – KundenRadar",
  description:
    "Kostenloser Stundenverrechnungssatz-Rechner fürs Handwerk: kostendeckenden Stundensatz nach Gewerk, Region und Gemeinkosten berechnen – mit Marktvergleich. Ohne Anmeldung.",
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Handwerk · Gratis-Rechner"
      h1="Stundenverrechnungssatz fürs Handwerk berechnen"
      intro="Gewerk, Region und Gemeinkosten-Stufe wählen – und du bekommst einen kostendeckenden Stundenverrechnungssatz inklusive Gewinn, plus den Vergleich zum marktüblichen Satz deines Gewerks."
      content={[
        { title: "So funktioniert die Stundensatz-Kalkulation", text: "Nach der HWK-Methode berechnet sich der Stundenverrechnungssatz aus den produktiven Lohnkosten, einem Gemeinkostenzuschlag (Handwerkskammern empfehlen 70–100 % auf die Lohnkosten) und deinem Gewinnaufschlag (üblich 8–12 %). Der Rechner kombiniert diese Werte und zeigt dir Selbstkosten und empfohlenen Satz." },
        { title: "Marktübliche Sätze je Gewerk", text: "Die Stundenverrechnungssätze liegen 2026 grob zwischen 55 und 100 € netto, je nach Gewerk und Region. Elektro und SHK liegen meist höher als Maler, KFZ deutlich darüber. Der Markt-Balken zeigt, wo dein kalkulierter Satz im Vergleich liegt." },
        { title: "Warum ein zu niedriger Satz gefährlich ist", text: "Viele Betriebe rechnen zu knapp und zahlen am Ende drauf. Ein kostendeckender Verrechnungssatz deckt nicht nur den Lohn, sondern auch unproduktive Zeiten, Fahrzeuge, Versicherungen, Verwaltung und Gewinn. Der Rechner macht diese Posten transparent." },
      ]}
      faqs={[
        { q: "Netto oder brutto?", a: "Der empfohlene Stundensatz wird im B2B-Geschäft netto kalkuliert. Mit dem Umschalter oben siehst du auch den Bruttobetrag inkl. 19 % MwSt." },
        { q: "Wie viele produktive Stunden pro Jahr sind realistisch?", a: "Nach Abzug von Urlaub, Krankheit und unproduktiven Zeiten bleiben pro Vollkraft typischerweise 1.250 bis 1.600 produktive Stunden im Jahr." },
        { q: "Kann ich eigene Werte eingeben?", a: "Ja – Gewerk und Region setzen sinnvolle Vorgaben, die du jederzeit anpassen kannst. Für gespeicherte Kalkulationen und Angebots-PDFs nutzt du ein kostenloses Konto." },
      ]}
      related={[
        { href: "/rechner/gebaeudereinigung", label: "Reinigungskosten" },
        { href: "/rechner/agentur-stundensatz", label: "Agentur-Stundensatz" },
      ]}
    />
  );
}
