// Heuristik: Erkennt Personaldienstleister / Zeitarbeitsfirmen am Firmennamen.
// Für die Persona „Personalvermittlung": diese Firmen sind Wettbewerber, keine
// Endkunden – sie lassen sich optional aus den Stellen-Treffern ausblenden.

// Generische Wortbestandteile (klein geschrieben, als Teilstring geprüft).
const STAFFING_KEYWORDS = [
  "zeitarbeit", "leiharbeit", "arbeitnehmerüberlass", "arbeitnehmeruberlass",
  "personaldienst", "personal-dienst", "personalservice", "personal-service",
  "personalmanagement", "personalleasing", "personalvermittl", "personalberatung",
  "personalhaus", "fachpersonal", "zeitpersonal", "personallösung", "personalloesung",
  "staffing", "interim", "headhunt", "recruiting", "rekrutierung",
];

// Bekannte Marken (Teilstring im Namen).
const STAFFING_BRANDS = [
  "randstad", "tempton", "adecco", "manpower", "orizon", "piening", "i.k. hofmann",
  "ik hofmann", "gi group", "dis ag", "argo", "actief", "unique personal", "persona service",
  "alphaconsult", "timepartner", "time partner", "perse-partner", "könig fachpersonal",
  "koenig fachpersonal", "avitea", "tempo-team", "tempo team", "start people", "zenjob",
  "runtime", "expertum", "pamec", "dekra arbeit", "jobimpulse", "trio personal",
  "abis", "akku", "hofmann personal", "gvo personal", "wisag personal", "stegmann",
  "personalhaus bielefeld", "perse-partner", "pers-partner",
];

export function isStaffingAgency(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = name.toLowerCase();
  if (STAFFING_KEYWORDS.some((k) => n.includes(k))) return true;
  if (STAFFING_BRANDS.some((b) => n.includes(b))) return true;
  return false;
}
