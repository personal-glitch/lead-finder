import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Fliesenleger Stundensatz Rechner 2026: Stundenverrechnungssatz berechnen – KundenRadar",
  description:
    "Kostenloser Fliesenleger-Stundensatz-Rechner: Stundenverrechnungssatz aus Lohn, Gemeinkosten und Gewinn – mit Marktspanne fürs Fliesenlegerhandwerk. Ohne Anmeldung.",
  alternates: { canonical: "/rechner/fliesenleger-stundensatz" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Fliesenleger · Gratis-Rechner"
      h1="Fliesenleger-Stundensatz berechnen – fair und profitabel"
      intro="Was musst du als Fliesenleger pro Stunde verrechnen? Gib Lohn, Gemeinkostenzuschlag und Gewinn ein – der Rechner zeigt dir deinen Stundenverrechnungssatz und ob er im Markt liegt."
      content={[
        { title: "So berechnest du den Fliesenleger-Stundensatz", text: "Der Verrechnungssatz setzt sich aus produktiven Lohnkosten, Gemeinkostenzuschlag (Fahrzeug, Werkzeug, Schneidmaschinen, Verwaltung) und Gewinnaufschlag zusammen. Gerade bei aufwendigen Verlegemustern oder Großformaten lohnt sich eine saubere Kalkulation." },
        { title: "Typische Stundensätze im Fliesenlegerhandwerk", text: "Die Stundenverrechnungssätze liegen 2026 meist zwischen 45 und 65 € netto. Naturstein, Großformate und Mosaikarbeiten liegen am oberen Rand. Der Markt-Balken im Rechner zeigt dir deine Position sofort." },
        { title: "Material & Verschnitt nicht vergessen", text: "Fliesen, Kleber, Fugenmasse und Verschnitt werden separat berechnet. Kalkuliere den Verschnitt realistisch ein – bei Diagonalverlegung und Großformaten ist er höher." },
      ]}
      faqs={[
        { q: "Was kostet ein Fliesenleger pro Stunde?", a: "Der Stundenverrechnungssatz liegt 2026 meist zwischen 45 und 65 € netto – je nach Region, Material und Verlegeart. Material und Verschnitt kommen hinzu." },
        { q: "Ist der Rechner kostenlos?", a: "Ja, ohne Anmeldung. Für die volle Aufschlüsselung und ein Angebots-PDF reicht ein kostenloses KundenRadar-Konto." },
        { q: "Wird pro m² oder pro Stunde abgerechnet?", a: "Beides ist üblich. Der m²-Preis leitet sich aus deinem Stundensatz und der Verlegeleistung ab – mit dem Stundensatz als Basis kalkulierst du beide Varianten sauber." },
      ]}
      related={[
        { href: "/rechner/dachdecker-stundensatz", label: "Dachdecker-Stundensatz" },
        { href: "/rechner/tischler-schreiner-stundensatz", label: "Tischler-Stundensatz" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk allgemein" },
      ]}
    />
  );
}
