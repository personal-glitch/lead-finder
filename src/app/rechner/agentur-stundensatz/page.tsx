import type { Metadata } from "next";
import { RechnerLandingShell } from "@/components/landing/RechnerLandingShell";

export const metadata: Metadata = {
  title: "Stundensatz-Rechner für Agenturen & Freelancer (2026): Stunden- & Tagessatz berechnen – KundenRadar",
  description:
    "Kostenloser Stundensatz-Rechner für Agenturen, Freelancer und Dienstleister: empfohlener Stunden- und Tagessatz nach Disziplin und Erfahrung – plus der Satz, den du für dein Einkommensziel brauchst.",
};

export default function Page() {
  return (
    <RechnerLandingShell
      modus="agentur"
      eyebrow="Agentur & Freelancer · Gratis-Rechner"
      h1="Welchen Stundensatz solltest du verlangen?"
      intro="Disziplin und Erfahrungsstufe wählen – und du siehst den marktüblichen Stunden- und Tagessatz, plus den Satz, den du für dein Einkommensziel wirklich brauchst."
      content={[
        { title: "Marktsatz vs. dein nötiger Satz", text: "Der Rechner zeigt zwei Dinge: erstens die marktübliche Spanne für deine Disziplin und Erfahrungsstufe, zweitens den Satz, den du brauchst, um dein Einkommensziel zu erreichen. Dafür rechnet er deine fakturierbaren Stunden, die realistische Auslastung und deine Fixkosten ein – denn nicht jede Arbeitsstunde ist abrechenbar." },
        { title: "Stundensätze nach Erfahrung", text: "2026 liegen Stundensätze für Junior-Profile häufig bei 80–110 €, Mid-Level bei 110–150 € und Senior/Strategie bei 150–220 € netto – je nach Disziplin. Beratung liegt am oberen Ende, Content und Social etwas darunter. Der Markt-Balken zeigt deine Einordnung." },
        { title: "Auslastung nicht vergessen", text: "Der häufigste Kalkulationsfehler: den Stundensatz nur aus dem Wunschgehalt durch alle Arbeitsstunden zu teilen. Realistisch sind oft nur 60–70 % fakturierbar – Akquise, Verwaltung und Weiterbildung kosten Zeit. Genau das berücksichtigt der Rechner." },
      ]}
      faqs={[
        { q: "Sind die Sätze netto oder brutto?", a: "Die Marktsätze sind netto (B2B). Mit dem Umschalter oben siehst du den Bruttobetrag inkl. 19 % MwSt. Die Umsatzsteuer schlägst du erst auf die Rechnung auf." },
        { q: "Stundensatz oder Tagessatz?", a: "Beides – schalte oben zwischen Stunden- und Tagessatz um. Der Tagessatz basiert auf 8 Stunden." },
        { q: "Brauche ich ein Konto?", a: "Nein, der Rechner ist gratis und ohne Anmeldung. Für gespeicherte Kalkulationen, Angebots-PDFs und die passende Kundensuche nutzt du ein kostenloses KundenRadar-Konto." },
      ]}
      related={[
        { href: "/rechner/gebaeudereinigung", label: "Reinigungskosten" },
        { href: "/rechner/handwerk-stundensatz", label: "Handwerk-Stundensatz" },
      ]}
    />
  );
}
