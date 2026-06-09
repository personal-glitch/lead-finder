import type { Metadata } from "next";
import CheckClient from "./CheckClient";

export const metadata: Metadata = {
  title: "Gratis-Check: Wie viele Neukunden gibt es in deiner Nähe? – KundenRadar",
  description:
    "Branche + Ort eingeben und sofort sehen, wie viele anrufbare B2B-Firmen es im Umkreis gibt – mit Telefon & Ansprechpartner. Kostenlos, ohne Anmeldung.",
};

export default function CheckPage() {
  return <CheckClient />;
}
