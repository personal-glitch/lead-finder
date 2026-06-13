import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Was kostet SEO? SEO-Kosten-Rechner 2026 (Stunden- & Tagessatz) – KundenRadar",
  description:
    "Kostenloser SEO-Kosten-Rechner: Was kostet Suchmaschinenoptimierung pro Monat? Stunden- und Tagessatz für SEO & Online-Marketing berechnen – plus der Satz, den du für dein Einkommensziel brauchst. Ohne Anmeldung.",
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="agentur"
      eyebrow="SEO & Online-Marketing · Gratis-Rechner"
      h1="Was solltest du für SEO verlangen?"
      intro="Disziplin 'Online-Marketing / SEO' und Erfahrungsstufe wählen – und du siehst den marktüblichen Stunden- und Tagessatz, plus den Satz, den du für dein Einkommensziel wirklich brauchst. So kalkulierst du SEO-Pakete profitabel."
      content={[
        { title: "Was kostet SEO pro Monat?", text: "SEO wird meist als monatliche Betreuung verkauft. Übliche Stundensätze liegen 2026 bei 90–140 € netto. Ein laufendes SEO-Paket für KMU bewegt sich häufig zwischen 500 und 2.500 € im Monat – je nach Stundenkontingent, Wettbewerb und Zielen. Der Rechner zeigt dir den passenden Stundensatz, aus dem du dein Paket ableitest." },
        { title: "Paketpreis aus Stunden ableiten", text: "Lege fest, wie viele Stunden pro Monat in Audit, OnPage, Content, Linkaufbau und Reporting fließen, und multipliziere mit deinem kostendeckenden Satz. So bleibt dein Retainer profitabel – statt einer Pauschale, die deine Zeit nicht deckt." },
        { title: "Auslastung & unbezahlte Zeit", text: "Wie bei jeder Dienstleistung sind selten 100 % deiner Stunden abrechenbar. Akquise, Calls und Weiterbildung kosten Zeit. Der Rechner berücksichtigt deine realistische Auslastung, damit dein Satz wirklich dein Einkommensziel trägt." },
      ]}
      faqs={[
        { q: "Sind die Sätze netto oder brutto?", a: "Die Marktsätze sind netto (B2B). Mit dem Umschalter oben siehst du den Bruttobetrag inkl. 19 % MwSt." },
        { q: "Monatspauschale oder Stundensatz?", a: "Beides ist üblich. Kalkuliere die Monatspauschale immer intern über Stunden × Satz, damit der Retainer profitabel bleibt." },
        { q: "Wie finde ich SEO-Kunden?", a: "Firmen mit schwacher Website-Performance oder schlechter mobiler Darstellung sind ideale SEO-Kunden. In KundenRadar bewertest du im Webdesign-/SEO-Modus die Seite jeder gefundenen Firma automatisch – das liefert dir den perfekten Gesprächsaufhänger." },
      ]}
      related={[
        { href: "/rechner/webdesign-preis", label: "Webdesign-Preis" },
        { href: "/rechner/agentur-stundensatz", label: "Agentur-Stundensatz" },
      ]}
    />
  );
}
