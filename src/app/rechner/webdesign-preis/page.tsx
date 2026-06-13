import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Was kostet eine Website? Webdesign-Preis-Rechner 2026 – KundenRadar",
  description:
    "Kostenloser Webdesign-Preis-Rechner: Was kostet eine professionelle Website? Stunden- und Tagessatz für Webdesign berechnen – plus der Satz, den du für dein Einkommensziel brauchst. Ohne Anmeldung.",
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="agentur"
      eyebrow="Webdesign · Gratis-Rechner"
      h1="Was solltest du für eine Website verlangen?"
      intro="Disziplin 'Web-Entwicklung / Webdesign' und Erfahrungsstufe wählen – und du siehst den marktüblichen Stunden- und Tagessatz, plus den Satz, den du für dein Einkommensziel wirklich brauchst. So kalkulierst du Website-Projekte kostendeckend."
      content={[
        { title: "Was kostet eine Website 2026 wirklich?", text: "Webdesign wird meist nach Aufwand kalkuliert. Übliche Stundensätze liegen 2026 bei 80–110 € netto, erfahrene Studios darüber. Eine einfache Visitenkarten-Website (One-Pager) landet so oft bei 1.500–3.500 €, eine umfangreichere Unternehmensseite mit CMS bei 4.000–10.000 €. Der Rechner zeigt dir den passenden Stundensatz und rechnet dein Projekt darauf hoch." },
        { title: "Stunden schätzen statt Bauchgefühl", text: "Multipliziere deinen kalkulierten Stundensatz mit einer realistischen Stundenschätzung: Konzept & Wireframe, Design, Umsetzung, Inhalte, Testing und Abnahme. Wer den Aufwand sauber schätzt und mit einem kostendeckenden Satz multipliziert, vermeidet die typische Webdesign-Falle: zu günstig anbieten und am Ende draufzahlen." },
        { title: "Wiederkehrende Einnahmen einplanen", text: "Pflege, Hosting, Updates und kleine Änderungen lassen sich als monatliche Pauschale abrechnen – das stabilisiert deinen Umsatz. Kalkuliere auch hier mit deinem echten Stundensatz statt mit 'kostenlos als Service'." },
      ]}
      faqs={[
        { q: "Sind die Preise netto oder brutto?", a: "Die Marktsätze sind netto (B2B). Mit dem Umschalter oben siehst du den Bruttobetrag inkl. 19 % MwSt." },
        { q: "Festpreis oder Stundensatz?", a: "Viele Kunden wollen einen Festpreis. Kalkuliere ihn intern über Stunden × Satz und schlage einen Puffer für Korrekturschleifen auf – sonst frisst die Nachbesserung deine Marge." },
        { q: "Wie finde ich Kunden für Webdesign?", a: "Firmen mit veralteter oder fehlender Website sind ideale Kunden. In KundenRadar bewertest du im Webdesign-Modus die Website jeder gefundenen Firma automatisch – schwache oder fehlende Seiten sind dein bester Gesprächsaufhänger." },
      ]}
      related={[
        { href: "/rechner/seo-kosten", label: "SEO-Kosten" },
        { href: "/rechner/agentur-stundensatz", label: "Agentur-Stundensatz" },
      ]}
    />
  );
}
