import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Reinigungskosten-Rechner: Angebotspreis & Preis pro m² berechnen (2026) – KundenRadar",
  description:
    "Kostenloser Gebäudereinigung-Rechner: Angebotspreis pro Einsatz, Monat und pro m² in Sekunden – nach Reinigungsart, Objektart, Tariflohn 2026 und RAL-Flächenleistungen. Ohne Anmeldung.",
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="reinigung"
      eyebrow="Gebäudereinigung · Gratis-Rechner"
      h1="Reinigungskosten berechnen – Angebotspreis pro Einsatz & m²"
      intro="Reinigungsart, Objektart und Fläche wählen – und du siehst sofort einen realistischen Angebotspreis pro Einsatz, pro Monat und pro Quadratmeter. Basierend auf dem Tariflohn 2026 und RAL-Flächenleistungen."
      content={[
        { title: "So berechnest du den Reinigungspreis", text: "Die Grundformel lautet: Fläche ÷ Flächenleistung (m²/h) = benötigte Stunden. Diese Stunden multiplizierst du mit deinem Selbstkosten-Stundensatz (Lohn plus Lohnnebenkosten und Gemeinkosten), addierst Anfahrt und Material und schlägst deine Gewinnmarge auf. Der Rechner macht das automatisch und zeigt zusätzlich den Preis pro m² – die übliche Vergleichsgröße bei Ausschreibungen." },
        { title: "Tariflohn & Flächenleistung als Basis", text: "Seit 1. Januar 2026 gilt in der Gebäudereinigung ein Branchen-Mindestlohn von 15,00 €/h (Lohngruppe 1), für Glas- und Fassadenreinigung 18,40 €/h (Lohngruppe 6). Die Flächenleistung hängt stark von Objektart und Verschmutzung ab – Büroflächen lassen sich schneller reinigen als Sanitärbereiche. Der Rechner nutzt dafür Richtwerte der RAL-Gütegemeinschaft." },
        { title: "Marktüblicher Preis pro m²", text: "Für die laufende Unterhaltsreinigung liegen die Preise meist zwischen 0,20 und 0,50 € pro m² je Reinigung. Der Markt-Balken im Rechner zeigt dir sofort, ob dein kalkulierter Preis günstig, fair oder über dem Marktniveau liegt." },
      ]}
      faqs={[
        { q: "Ist der Rechner kostenlos?", a: "Ja, der Rechner ist kostenlos und ohne Anmeldung nutzbar. Für die volle Aufschlüsselung und ein Angebots-PDF brauchst du ein kostenloses KundenRadar-Konto." },
        { q: "Sind die Preise netto oder brutto?", a: "Du kannst oben zwischen netto und inkl. 19 % MwSt umschalten. Im B2B-Geschäft wird üblicherweise netto kalkuliert; die Umsatzsteuer kommt erst auf die Rechnung." },
        { q: "Gilt der Tariflohn für mich?", a: "Der Branchen-Mindestlohn der Gebäudereinigung ist allgemeinverbindlich – alle Betriebe müssen ihn zahlen. Liegt dein interner Stundenlohn darunter, warnt der Rechner." },
      ]}
      related={[
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk-Stundensatz" },
        { href: "/rechner/agentur-stundensatz", label: "Agentur-Stundensatz" },
      ]}
    />
  );
}
