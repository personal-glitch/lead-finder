import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Dachdecker Stundensatz Rechner 2026: Stundenverrechnungssatz berechnen – KundenRadar",
  description:
    "Kostenloser Dachdecker-Stundensatz-Rechner: Stundenverrechnungssatz aus Lohn, Gemeinkosten und Gewinn berechnen – mit Marktspanne fürs Dachdeckerhandwerk. Ohne Anmeldung.",
  alternates: { canonical: "/rechner/dachdecker-stundensatz" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Dachdecker · Gratis-Rechner"
      h1="Dachdecker-Stundensatz berechnen – kostendeckend kalkulieren"
      intro="Welchen Stundenverrechnungssatz braucht dein Dachdeckerbetrieb, um Gerüst, Maschinen und Risiko sauber einzupreisen? Lohn, Gemeinkosten und Gewinn eingeben – der Rechner zeigt dir sofort deinen Satz und die Marktspanne."
      content={[
        { title: "So berechnest du den Dachdecker-Stundensatz", text: "Der Verrechnungssatz ergibt sich aus den produktiven Lohnkosten je Stunde, dem Gemeinkostenzuschlag (Fahrzeuge, Gerüst, Hebebühne, Versicherungen, Verwaltung) und deinem Gewinnaufschlag. Im Dachdeckerhandwerk sind Sicherheits- und Geräteaufwand hoch – das gehört in die Gemeinkosten." },
        { title: "Typische Stundensätze im Dachdeckerhandwerk", text: "Die Stundenverrechnungssätze liegen 2026 meist zwischen 55 und 75 € netto. Höhe und Risiko (Steildach, Höhensicherung) sowie Spezialarbeiten wie Abdichtung oder Reparatur können den Satz nach oben treiben. Der Markt-Balken zeigt deine Position." },
        { title: "Material, Gerüst & Entsorgung getrennt ausweisen", text: "Material, Gerüstmiete und Entsorgung werden in der Regel separat berechnet. So bleibt der Stundensatz vergleichbar und deine Marge bei materialintensiven Projekten geschützt." },
      ]}
      faqs={[
        { q: "Was kostet ein Dachdecker pro Stunde?", a: "Der Stundenverrechnungssatz liegt 2026 meist zwischen 55 und 75 € netto – je nach Region, Risiko und Leistung. Material, Gerüst und Entsorgung kommen üblicherweise hinzu." },
        { q: "Ist der Rechner kostenlos?", a: "Ja, ohne Anmeldung. Für die volle Aufschlüsselung und ein Angebots-PDF reicht ein kostenloses KundenRadar-Konto." },
        { q: "Wie preise ich das Gerüst ein?", a: "Gerüst und Hebebühne werden meist als eigene Position berechnet, nicht über den Stundensatz. Die laufenden Kosten dafür gehören aber anteilig in deine Gemeinkosten." },
      ]}
      related={[
        { href: "/rechner/fliesenleger-stundensatz", label: "Fliesenleger-Stundensatz" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk allgemein" },
        { href: "/rechner/maler-stundensatz", label: "Maler-Stundensatz" },
      ]}
    />
  );
}
