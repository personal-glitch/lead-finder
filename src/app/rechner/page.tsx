import type { Metadata } from "next";
import RechnerClient from "./RechnerClient";

export const metadata: Metadata = {
  title: "Gratis-Kalkulator: Stundensatz & Angebotspreis berechnen – KundenRadar",
  description:
    "Kostenlose Rechner für Dienstleister: Angebotspreis & Stundenverrechnungssatz (Reinigung, Handwerk, Agentur), Webdesign-Preis, SEO-Kosten sowie Provision & Verrechnungssatz für Personalvermittlung und Zeitarbeit – in Sekunden, ohne Anmeldung.",
};

export default function RechnerPage() {
  return <RechnerClient />;
}
