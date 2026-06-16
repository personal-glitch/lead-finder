import type { Metadata } from "next";
import RechnerClient from "./RechnerClient";

export const metadata: Metadata = {
  title: "Gratis-Kalkulator: Stundensatz & Angebotspreis berechnen – KundenRadar",
  description:
    "Kostenlose Rechner für Dienstleister: Angebotspreis & Stundenverrechnungssatz (Reinigung, Handwerk, Agentur), Webdesign-Preis, SEO-Kosten sowie Provision & Verrechnungssatz für Personalvermittlung und Zeitarbeit – in Sekunden, ohne Anmeldung.",
  alternates: { canonical: "/rechner" },
  keywords: [
    "Stundensatz berechnen", "Stundenverrechnungssatz berechnen", "Angebotspreis berechnen",
    "Reinigungskosten berechnen", "Reinigungskosten pro m²", "Gebäudereinigung Kalkulation",
    "Handwerker Stundensatz", "Maler Stundensatz", "Elektriker Stundensatz", "GaLaBau Stundensatz",
    "Agentur Stundensatz", "Webdesign Preis berechnen", "Was kostet eine Website", "SEO Kosten",
    "Personalvermittlung Provision", "Zeitarbeit Verrechnungssatz", "Was kostet ein Neukunde",
    "Stundensatz kalkulieren Selbstständige", "Preise kalkulieren Dienstleister", "kostenloser Rechner",
  ],
};

export default function RechnerPage() {
  return <RechnerClient />;
}
