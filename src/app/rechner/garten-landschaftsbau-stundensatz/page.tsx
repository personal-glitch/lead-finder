import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "GaLaBau Stundensatz Rechner 2026: Garten- & Landschaftsbau berechnen – KundenRadar",
  description:
    "Kostenloser Stundensatz-Rechner für Garten- und Landschaftsbau: Stundenverrechnungssatz aus Lohn, Gemeinkosten und Gewinn – mit Marktspanne. Ohne Anmeldung.",
  alternates: { canonical: "/rechner/garten-landschaftsbau-stundensatz" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Garten- & Landschaftsbau · Gratis-Rechner"
      h1="GaLaBau-Stundensatz berechnen – fair kalkulieren statt schätzen"
      intro="Was musst du im Garten- und Landschaftsbau pro Stunde verrechnen? Lohn, Gemeinkosten (Maschinen, Anhänger, Entsorgung) und Gewinn eingeben – der Rechner zeigt deinen Stundenverrechnungssatz und die Marktspanne."
      content={[
        { title: "Stundensatz im GaLaBau berechnen", text: "Maßgeblich sind deine produktiven Lohnkosten, der Gemeinkostenzuschlag und der Gewinnaufschlag. Im GaLaBau sind Maschinen, Transport und Entsorgung große Posten – sie gehören sauber in die Gemeinkosten, sonst bleibt am Ende zu wenig übrig." },
        { title: "Typische Sätze & saisonale Auslastung", text: "Die Stundenverrechnungssätze liegen 2026 meist zwischen 45 und 65 € netto. Weil die Saison kurz ist, müssen die produktiven Stunden die Fixkosten des ganzen Jahres tragen – kalkuliere die Auslastung realistisch." },
        { title: "Maschinenstunden separat ausweisen", text: "Bagger, Radlader oder Häcksler werden oft als eigene Maschinenstunde berechnet. Im Angebot wirkt das transparent und schützt deine Marge bei gerätelastigen Projekten." },
      ]}
      faqs={[
        { q: "Was kostet eine Stunde Garten- und Landschaftsbau?", a: "Der Stundenverrechnungssatz liegt 2026 meist zwischen 45 und 65 € netto. Maschinen, Transport und Entsorgung werden häufig zusätzlich berechnet." },
        { q: "Ist der Rechner kostenlos?", a: "Ja, ohne Anmeldung. Für die volle Aufschlüsselung und ein Angebots-PDF reicht ein kostenloses KundenRadar-Konto." },
        { q: "Wie berücksichtige ich die Saison?", a: "Setze die Auslastung realistisch an: Da im Winter weniger gearbeitet wird, müssen die produktiven Sommerstunden die Jahresfixkosten mittragen. Der Rechner hilft dir, das einzupreisen." },
      ]}
      related={[
        { href: "/rechner/maler-stundensatz", label: "Maler-Stundensatz" },
        { href: "/rechner/elektriker-stundensatz", label: "Elektriker-Stundensatz" },
        { href: "/rechner/gebaeudereinigung", label: "Reinigungskosten" },
      ]}
    />
  );
}
