import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Elektriker Stundensatz Rechner 2026: Stundenverrechnungssatz berechnen – KundenRadar",
  description:
    "Kostenloser Elektriker-Stundensatz-Rechner: Stundenverrechnungssatz für Elektrobetriebe aus Lohn, Gemeinkosten und Gewinn – mit Marktspanne. Ohne Anmeldung, sofort.",
  alternates: { canonical: "/rechner/elektriker-stundensatz" },
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="handwerk"
      eyebrow="Elektro · Gratis-Rechner"
      h1="Elektriker-Stundensatz berechnen – kostendeckend & profitabel"
      intro="Welchen Stundenverrechnungssatz braucht dein Elektrobetrieb? Trag Lohn, Gemeinkostenzuschlag und Gewinn ein und sieh sofort, ob dein Satz die Kosten deckt und im regionalen Markt liegt."
      content={[
        { title: "So setzt sich der Elektriker-Stundensatz zusammen", text: "Aus den produktiven Lohnkosten je Stunde, dem Gemeinkostenzuschlag (Fahrzeuge, Messgeräte, Werkstatt, Versicherungen, Verwaltung) und deinem Gewinnaufschlag. Im Elektrohandwerk sind die Gemeinkosten wegen Geräten und Weiterbildung oft höher als gedacht." },
        { title: "Typische Stundensätze im Elektrohandwerk", text: "Die Stundenverrechnungssätze liegen 2026 meist zwischen 55 und 75 € netto, in Ballungsräumen und bei Spezialleistungen (Mess-/Prüfprotokolle, Smart Home, Photovoltaik) auch höher. Der Markt-Balken zeigt dir deine Position." },
        { title: "Warum der reine Lohn nicht reicht", text: "Wer nur 30 € Lohn weitergibt, deckt weder Fahrzeug noch Verwaltung noch Ausfallzeiten. Realistisch sind erst Sätze, die alle Kosten plus eine Marge enthalten – sonst arbeitet der Betrieb in die Verlustzone." },
      ]}
      faqs={[
        { q: "Was verlangt ein Elektriker pro Stunde?", a: "Der Stundenverrechnungssatz liegt 2026 meist zwischen 55 und 75 € netto – je nach Region, Leistung und Betriebsgröße. Material und Anfahrt kommen üblicherweise hinzu." },
        { q: "Ist der Rechner kostenlos?", a: "Ja, ohne Anmeldung. Für die volle Aufschlüsselung und ein Angebots-PDF reicht ein kostenloses KundenRadar-Konto." },
        { q: "Gilt das auch für Photovoltaik & Smart Home?", a: "Als Richtwert ja – Spezialleistungen liegen meist am oberen Rand oder darüber. Passe Lohn und Gewinn im Rechner an deine Leistung an." },
      ]}
      related={[
        { href: "/rechner/maler-stundensatz", label: "Maler-Stundensatz" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk allgemein" },
        { href: "/rechner/garten-landschaftsbau-stundensatz", label: "GaLaBau-Stundensatz" },
      ]}
    />
  );
}
