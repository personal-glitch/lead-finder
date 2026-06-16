// Städte für die Auftragsbörse-Landingpages (/dienstleister-finden/[stadt]).
// Bewusst schlank (nur Ort + Region) – so lassen sich viele Städte ohne Pflege-Aufwand abdecken.
export interface ServiceCity { slug: string; name: string; artikel: string; region: string }

function c(slug: string, name: string, region: string): ServiceCity {
  return { slug, name, artikel: `in ${name}`, region };
}

export const SERVICE_CITIES: ServiceCity[] = [
  c("koeln", "Köln", "Nordrhein-Westfalen"),
  c("hamburg", "Hamburg", "Hamburg"),
  c("berlin", "Berlin", "Berlin"),
  c("muenchen", "München", "Bayern"),
  c("frankfurt", "Frankfurt am Main", "Hessen"),
  c("duesseldorf", "Düsseldorf", "Nordrhein-Westfalen"),
  c("stuttgart", "Stuttgart", "Baden-Württemberg"),
  c("leipzig", "Leipzig", "Sachsen"),
  c("dortmund", "Dortmund", "Nordrhein-Westfalen"),
  c("essen", "Essen", "Nordrhein-Westfalen"),
  c("bremen", "Bremen", "Bremen"),
  c("dresden", "Dresden", "Sachsen"),
  c("hannover", "Hannover", "Niedersachsen"),
  c("nuernberg", "Nürnberg", "Bayern"),
  c("duisburg", "Duisburg", "Nordrhein-Westfalen"),
  c("bochum", "Bochum", "Nordrhein-Westfalen"),
  c("wuppertal", "Wuppertal", "Nordrhein-Westfalen"),
  c("bonn", "Bonn", "Nordrhein-Westfalen"),
  c("bielefeld", "Bielefeld", "Nordrhein-Westfalen"),
  c("muenster", "Münster", "Nordrhein-Westfalen"),
  c("mannheim", "Mannheim", "Baden-Württemberg"),
  c("karlsruhe", "Karlsruhe", "Baden-Württemberg"),
  c("wiesbaden", "Wiesbaden", "Hessen"),
  c("mainz", "Mainz", "Rheinland-Pfalz"),
  c("augsburg", "Augsburg", "Bayern"),
  c("aachen", "Aachen", "Nordrhein-Westfalen"),
  c("moenchengladbach", "Mönchengladbach", "Nordrhein-Westfalen"),
  c("freiburg", "Freiburg", "Baden-Württemberg"),
  c("kiel", "Kiel", "Schleswig-Holstein"),
  c("luebeck", "Lübeck", "Schleswig-Holstein"),
  c("erfurt", "Erfurt", "Thüringen"),
  c("rostock", "Rostock", "Mecklenburg-Vorpommern"),
  c("kassel", "Kassel", "Hessen"),
  c("saarbruecken", "Saarbrücken", "Saarland"),
  c("heidelberg", "Heidelberg", "Baden-Württemberg"),
  c("leverkusen", "Leverkusen", "Nordrhein-Westfalen"),
];

export function serviceCityBySlug(slug: string): ServiceCity | undefined {
  return SERVICE_CITIES.find((x) => x.slug === slug);
}
