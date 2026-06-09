import type { Metadata } from "next";
import RechnerClient from "./RechnerClient";

export const metadata: Metadata = {
  title: "Gratis-Kalkulator: Stundensatz & Angebotspreis berechnen – KundenRadar",
  description:
    "Kostenloser Rechner für Gebäudereiniger, Handwerker & Dienstleister: Angebotspreis, Stundenverrechnungssatz und nötiger Stundensatz – in Sekunden, ohne Anmeldung.",
};

export default function RechnerPage() {
  return <RechnerClient />;
}
