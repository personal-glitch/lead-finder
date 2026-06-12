import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Reinigungskosten pro m² berechnen (2026): Preis pro Quadratmeter – KundenRadar",
  description:
    "Kostenloser Rechner für Reinigungskosten pro Quadratmeter: Preis pro m² je Reinigung, pro Einsatz und pro Monat – nach Fläche, Verschmutzung, Häufigkeit und Tariflohn 2026. Ohne Anmeldung.",
  alternates: { canonical: "/rechner/reinigungskosten-pro-quadratmeter" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="reinigung"
      eyebrow="Gebäudereinigung · Preis pro m²"
      h1="Reinigungskosten pro m² berechnen"
      intro="Was darf die Reinigung pro Quadratmeter kosten? Trag Fläche, Verschmutzungsgrad und Häufigkeit ein – der Rechner zeigt dir den Preis pro m² je Reinigung sowie pro Einsatz und pro Monat. Basis: Tariflohn 2026 und RAL-Flächenleistungen."
      content={[
        { title: "So entsteht der Preis pro Quadratmeter", text: "Der m²-Preis ergibt sich aus der benötigten Arbeitszeit (Fläche ÷ Flächenleistung) mal deinem Selbstkosten-Stundensatz, geteilt durch die Fläche, plus Anfahrt, Material und Gewinnmarge. Der m²-Preis ist die übliche Vergleichsgröße bei Ausschreibungen." },
        { title: "Was den m²-Preis beeinflusst", text: "Vor allem Objektart und Verschmutzung: Büroflächen reinigt man schneller als Sanitärbereiche, leichte Verschmutzung schneller als starke. Auch die Häufigkeit zählt – bei täglicher Unterhaltsreinigung sinkt der Preis pro m² gegenüber seltener Grundreinigung." },
        { title: "Marktübliche Preise pro m²", text: "Für die laufende Unterhaltsreinigung liegen die Preise meist zwischen 0,20 und 0,50 € pro m² je Reinigung. Der Markt-Balken im Rechner zeigt dir sofort, ob dein Preis günstig, fair oder über dem Markt liegt." },
      ]}
      faqs={[
        { q: "Was kostet Reinigung pro m²?", a: "Für die Unterhaltsreinigung meist 0,20–0,50 € pro m² je Reinigung. Verschmutzung, Objektart und Häufigkeit verändern den Preis – der Rechner kalkuliert das für deine Werte." },
        { q: "Netto oder brutto?", a: "Du kannst oben zwischen netto und inkl. 19 % MwSt umschalten. Im B2B-Geschäft wird üblicherweise netto kalkuliert." },
        { q: "Berücksichtigt der Rechner den Tariflohn?", a: "Ja. Basis ist der allgemeinverbindliche Branchen-Mindestlohn der Gebäudereinigung 2026 (15,00 €/h, Glas/Fassade 18,40 €/h). Liegt dein interner Lohn darunter, warnt der Rechner." },
      ]}
      related={[
        { href: "/rechner/gebaeudereinigung", label: "Gebäudereinigung (alle Preise)" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk-Stundensatz" },
        { href: "/rechner/neukunde-kosten", label: "Was kostet ein Neukunde?" },
      ]}
    />
  );
}
