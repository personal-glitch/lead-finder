// Pakete – einzige Quelle der Wahrheit (Landing-Pricing, Einstellungen, Limit-Enforcement).
// Aktuell EIN Paket: alles unbegrenzt für 49 €/Monat (bewusst keine Beschränkung).
export type PlanKey = "pro";

export interface Plan {
  key: PlanKey;
  name: string;
  price: string;
  priceNote: string;
  maxAgents: number;
  maxLeads: number;
  highlight?: boolean;
  cta: string;
  feats: string[];
}

export const PLANS: Plan[] = [
  {
    key: "pro",
    name: "Komplett",
    price: "49 €",
    priceNote: "pro Monat",
    maxAgents: Infinity,
    maxLeads: Infinity,
    highlight: true,
    cta: "Jetzt starten",
    feats: [
      "Unbegrenzte Agenten",
      "Unbegrenzte Kontakte",
      "Pipeline, Anrufe & Aufgaben",
      "E-Mail-Versand aus dem Tool",
      "Alle 50+ Branchen + Stichwortsuche",
      "DSGVO-konform · monatlich kündbar",
    ],
  },
];

export const DEFAULT_PLAN: PlanKey = "pro";

/** Kostenlose Testphase in Tagen (eine Quelle für Checkout + UI-Texte). */
export const TRIAL_DAYS = 3;

export function planOf(key: string | null | undefined): Plan {
  return PLANS.find((p) => p.key === key) ?? PLANS[0];
}
export function isPlanKey(v: string): v is PlanKey {
  return PLANS.some((p) => p.key === v);
}
export const displayLimit = (n: number) => (n >= 9999 ? "∞" : String(n));
