import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Tischler & Schreiner Stundensatz Rechner 2026: Stundenverrechnungssatz berechnen – KundenRadar",
  description:
    "Kostenloser Tischler-/Schreiner-Stundensatz-Rechner: Stundenverrechnungssatz aus Lohn, Werkstatt-Gemeinkosten und Gewinn – mit Marktspanne. Ohne Anmeldung.",
  alternates: { canonical: "/rechner/tischler-schreiner-stundensatz" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Tischler & Schreiner · Gratis-Rechner"
      h1="Tischler-/Schreiner-Stundensatz berechnen"
      intro="Welchen Stundenverrechnungssatz braucht deine Tischlerei, um Werkstatt, Maschinen und Verwaltung zu decken? Lohn, Gemeinkosten und Gewinn eingeben – der Rechner zeigt deinen Satz und die Marktspanne."
      content={[
        { title: "So berechnest du den Tischler-Stundensatz", text: "Der Verrechnungssatz ergibt sich aus produktiven Lohnkosten, dem Gemeinkostenzuschlag (Werkstatt, Maschinen, Absauganlage, Fahrzeug, Verwaltung) und dem Gewinnaufschlag. In der Tischlerei sind die Werkstatt- und Maschinenkosten ein großer Posten – sie müssen über die produktiven Stunden getragen werden." },
        { title: "Typische Stundensätze im Tischlerhandwerk", text: "Die Stundenverrechnungssätze liegen 2026 meist zwischen 55 und 80 € netto. Möbeltischlerei, Innenausbau und CNC-Arbeiten liegen tendenziell höher. Der Markt-Balken zeigt deine Position." },
        { title: "Werkstattstunden vs. Montagestunden", text: "Unterscheide Werkstatt- und Montagestunden – beide können unterschiedlich kalkuliert sein. Material wird separat berechnet. So bleibt deine Kalkulation transparent und vergleichbar." },
      ]}
      faqs={[
        { q: "Was kostet ein Tischler pro Stunde?", a: "Der Stundenverrechnungssatz liegt 2026 meist zwischen 55 und 80 € netto – je nach Region, Leistung und Werkstattausstattung. Material kommt hinzu." },
        { q: "Ist der Rechner kostenlos?", a: "Ja, ohne Anmeldung. Für die volle Aufschlüsselung und ein Angebots-PDF reicht ein kostenloses KundenRadar-Konto." },
        { q: "Wie rechne ich Maschinenkosten ein?", a: "Maschinen- und Werkstattkosten gehören in den Gemeinkostenzuschlag und werden so über jede produktive Stunde mitfinanziert. Sehr maschinenintensive Arbeiten kannst du zusätzlich als Maschinenstunde ausweisen." },
      ]}
      related={[
        { href: "/rechner/fliesenleger-stundensatz", label: "Fliesenleger-Stundensatz" },
        { href: "/rechner/elektriker-stundensatz", label: "Elektriker-Stundensatz" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk allgemein" },
      ]}
    />
  );
}
