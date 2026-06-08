// "Für wen bist du?"-Vorlagen: ordnen jedem ANBIETER-Typ seine typischen
// B2B-Zielkunden zu. Ein Klick wählt sinnvolle Ziel-Branchen vor – frei anpassbar.
// Gruppiert nach Anbieter-Welt (group) für die Anzeige im Dialog.
import type { IconName } from "@/components/icons";
import type { BrancheKey } from "@/lib/leadgen/branchen-catalog";

export interface AgentTemplate {
  label: string;
  group: string;
  icon: IconName;
  color: string;
  branchen: BrancheKey[];
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  // ── Vor-Ort-Dienstleister ──
  {
    label: "Reinigungsfirma",
    group: "Vor-Ort-Dienstleister",
    icon: "broom",
    color: "emerald",
    branchen: ["Arztpraxis", "Zahnarztpraxis", "Hausverwaltung", "Anwaltskanzlei", "Steuerberater", "Büro & Unternehmen", "Hotel & Pension", "Fitnessstudio"],
  },
  {
    label: "Handwerk & Bau",
    group: "Vor-Ort-Dienstleister",
    icon: "hardhat",
    color: "amber",
    branchen: ["Hausverwaltung", "Immobilienmakler", "Architekturbüro", "Bauunternehmen", "Büro & Unternehmen"],
  },
  {
    label: "Garten & Hausmeister",
    group: "Vor-Ort-Dienstleister",
    icon: "wrench",
    color: "teal",
    branchen: ["Hausverwaltung", "Immobilienmakler", "Hotel & Pension", "Büro & Unternehmen"],
  },
  {
    label: "Sicherheitsdienst",
    group: "Vor-Ort-Dienstleister",
    icon: "key",
    color: "slate",
    branchen: ["Büro & Unternehmen", "Bauunternehmen", "Hotel & Pension", "Supermarkt & Lebensmittel", "Autohaus"],
  },

  // ── Agenturen & Kreativ ──
  {
    label: "Werbe-/Marketingagentur",
    group: "Agenturen & Kreativ",
    icon: "bolt",
    color: "indigo",
    branchen: ["Restaurant", "Autohaus", "Fitnessstudio", "Immobilienmakler", "Zahnarztpraxis", "Mode & Bekleidung", "Hotel & Pension"],
  },
  {
    label: "Webdesign & Foto/Video",
    group: "Agenturen & Kreativ",
    icon: "bolt",
    color: "violet",
    branchen: ["Restaurant", "Hotel & Pension", "Anwaltskanzlei", "Autohaus", "Mode & Bekleidung", "Friseursalon"],
  },

  // ── IT & Business-Services ──
  {
    label: "IT-Dienstleister & Software",
    group: "IT & Business-Services",
    icon: "bolt",
    color: "blue",
    branchen: ["Steuerberater", "Anwaltskanzlei", "Arztpraxis", "Autohaus", "Hausverwaltung", "Büro & Unternehmen"],
  },
  {
    label: "Unternehmensberatung & Coaching",
    group: "IT & Business-Services",
    icon: "building",
    color: "slate",
    branchen: ["Büro & Unternehmen", "Bauunternehmen", "IT- & Software-Firma", "Hotel & Pension"],
  },
  {
    label: "Personal & Recruiting",
    group: "IT & Business-Services",
    icon: "user",
    color: "rose",
    branchen: ["Pflege & Senioren", "Hotel & Pension", "Restaurant", "Bauunternehmen", "Büro & Unternehmen"],
  },
];
