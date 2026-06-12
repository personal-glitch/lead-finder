import type { IconName } from "@/components/icons";

export type PersonaKey = "dienstleister" | "webdesign" | "personalvermittlung";

export interface Persona {
  key: PersonaKey;
  label: string;
  short: string;
  icon: IconName;
  /** Überschrift im Tool / Suche. */
  searchTitle: string;
  /** Wonach gesucht wird. */
  searchHint: string;
  features: {
    /** Website-Bewertung (PageSpeed) je Treffer anzeigen. */
    websiteAudit?: boolean;
    /** Stellenanzeigen-Modul (Bundesagentur-API). */
    jobs?: boolean;
  };
}

export const PERSONAS: Record<PersonaKey, Persona> = {
  dienstleister: {
    key: "dienstleister",
    label: "Dienstleister / Handwerk",
    short: "Du bietest eine Dienstleistung an und suchst Firmen als Kunden (z. B. Reinigung, Handwerk, Agentur, IT, Beratung).",
    icon: "wrench",
    searchTitle: "Firmen finden",
    searchHint: "Branche & Umkreis wählen – anrufbare Firmen mit Telefon & Ansprechpartner.",
    features: {},
  },
  webdesign: {
    key: "webdesign",
    label: "Webdesign / SEO",
    short: "Du verkaufst Websites, SEO oder Online-Marketing und suchst Firmen mit schlechter oder fehlender Website.",
    icon: "globe",
    searchTitle: "Firmen mit Website-Potenzial finden",
    searchHint: "Firmen suchen und ihre Website automatisch bewerten – schlechte/fehlende Seite = Verkaufschance.",
    features: { websiteAudit: true },
  },
  personalvermittlung: {
    key: "personalvermittlung",
    label: "Personalvermittlung / Zeitarbeit",
    short: "Du vermittelst Personal und suchst Firmen mit offenen Stellen (bald: Stellenanzeigen über die offizielle Jobsuche-API).",
    icon: "user",
    searchTitle: "Firmen mit offenen Stellen finden",
    searchHint: "Firmen suchen, die Personal suchen. Stellenanzeigen-Modul folgt in Kürze.",
    features: { jobs: true },
  },
};

export function personaOf(key: string | null | undefined): Persona | null {
  if (key && key in PERSONAS) return PERSONAS[key as PersonaKey];
  return null;
}
