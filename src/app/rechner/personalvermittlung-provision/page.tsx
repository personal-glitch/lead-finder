import type { Metadata } from "next";
import { PersonalRechner } from "@/components/landing/PersonalRechner";

export const metadata: Metadata = {
  title: "Provision & Verrechnungssatz-Rechner: Personalvermittlung & Zeitarbeit 2026 – KundenRadar",
  description:
    "Kostenloser Rechner für Personalvermittlung & Zeitarbeit: Vermittlungsprovision (% vom Jahresgehalt) und Zeitarbeit-Verrechnungssatz (Faktor × Stundenlohn) inkl. Rohertrag berechnen. Ohne Anmeldung.",
};

export default function Page() {
  return <PersonalRechner />;
}
