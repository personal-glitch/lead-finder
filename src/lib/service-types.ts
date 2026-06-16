// Branchen-Landingpages der Auftragsbörse (/dienstleister/[leistung]).
// Pro Branche eigener, keyword-starker Content – plus Verknüpfung zum Anfrage-Formular & Städten.
export interface ServiceType {
  slug: string;        // URL: /dienstleister/<slug>
  keyword: string;     // H1-Keyword, z. B. „Reinigungsfirma"
  name: string;        // Anzeigename
  category: string;    // muss zu CATEGORIES (Formular) passen
  intro: string;       // 2–3 Sätze, käufer-orientiert
  leistungen: string[];// typische Leistungen (Keyword-reich)
  auswahl: string;     // worauf bei der Auswahl achten
  preis: string;       // Preis-Hinweis (verlinkt ggf. auf den Rechner)
  faq: { q: string; a: string }[];
  keywords: string[];  // Meta-Keywords
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    slug: "reinigungsfirma",
    keyword: "Reinigungsfirma",
    name: "Reinigungsfirma / Gebäudereinigung",
    category: "Gebäudereinigung",
    intro: "Du suchst eine zuverlässige Reinigungsfirma für Büro, Praxis, Treppenhaus oder Privathaushalt? Beschreibe kurz, was gereinigt werden soll – geprüfte Gebäudereiniger aus deiner Region senden dir kostenlos Angebote.",
    leistungen: ["Unterhaltsreinigung (Büro, Praxis, Kanzlei)", "Glas- & Fensterreinigung", "Treppenhausreinigung", "Grundreinigung & Bauendreinigung", "Industrie- & Hallenreinigung", "Sanitär- & Hygienereinigung"],
    auswahl: "Achte auf feste Reinigungskräfte, klare Leistungsverzeichnisse, Vertretung bei Krankheit und nachweisbare Referenzen. Seriöse Anbieter besichtigen vor dem Angebot das Objekt.",
    preis: "Reinigung wird meist pro m², pro Stunde oder pro Einsatz abgerechnet. Was marktüblich ist, zeigt dir unser kostenloser Reinigungskosten-Rechner.",
    faq: [
      { q: "Was kostet eine Reinigungsfirma?", a: "Je nach Reinigungsart, Fläche und Häufigkeit. Unterhaltsreinigung liegt oft im Bereich weniger Euro pro m² und Einsatz – exakte Preise bekommst du über die Angebote der Anbieter." },
      { q: "Lohnt sich eine Reinigungsfirma für Privathaushalte?", a: "Ja, viele Firmen bieten auch Privatreinigung an. Gib in deiner Anfrage einfach privat und den Umfang an." },
    ],
    keywords: ["Reinigungsfirma finden", "Gebäudereinigung finden", "Reinigungsfirma gesucht", "Büroreinigung Anbieter", "Reinigungsservice Angebot"],
  },
  {
    slug: "maler",
    keyword: "Maler",
    name: "Maler & Lackierer",
    category: "Maler & Lackierer",
    intro: "Du brauchst einen Maler für Innenräume, Fassade oder Lackierarbeiten? Stell kostenlos deine Anfrage – passende Maler- und Lackiererbetriebe aus deiner Region melden sich mit Angeboten.",
    leistungen: ["Innenanstrich & Tapezieren", "Fassadenanstrich & Außenarbeiten", "Lackierarbeiten (Türen, Fenster, Heizkörper)", "Spachtel- & Putzarbeiten", "Bodenbeschichtung", "Schimmelsanierung (Vorbehandlung)"],
    auswahl: "Lass dir den Aufbau (Vorbereitung, Anzahl Anstriche, Material) im Angebot aufschlüsseln. Ein Vor-Ort-Termin sorgt für realistische Preise statt grober Schätzungen.",
    preis: "Malerarbeiten werden pro m² oder pauschal je Raum kalkuliert, plus Material. Vergleiche die Angebote – Preis und Leistungsumfang.",
    faq: [
      { q: "Was kostet ein Maler pro Raum?", a: "Das hängt von Größe, Untergrund und Anzahl der Anstriche ab. Über deine Anfrage bekommst du konkrete Angebote zum Vergleich." },
      { q: "Übernimmt der Maler auch die Vorbereitung?", a: "Meist ja – Abkleben, Spachteln und Grundieren gehören oft dazu. Gib deinen Wunsch in der Anfrage an." },
    ],
    keywords: ["Maler finden", "Maler gesucht", "Malerbetrieb Angebot", "Maler und Lackierer finden", "Fassade streichen Angebot"],
  },
  {
    slug: "elektriker",
    keyword: "Elektriker",
    name: "Elektriker / Elektroinstallation",
    category: "Elektriker",
    intro: "Du suchst einen Elektriker für Installation, Reparatur oder Smart-Home? Beschreibe dein Anliegen – geprüfte Elektrobetriebe aus deiner Region senden dir kostenlos Angebote.",
    leistungen: ["Elektroinstallation (Neubau & Sanierung)", "Reparatur & Fehlersuche", "Zählerschrank & Sicherungen", "Smart-Home & Netzwerktechnik", "Beleuchtung & Steckdosen", "E-Check & Prüfungen"],
    auswahl: "Achte auf einen eingetragenen Elektro-Fachbetrieb, Festpreis oder klare Stundensätze und Erreichbarkeit – gerade bei Störungen zählt schnelle Reaktion.",
    preis: "Elektriker rechnen meist nach Stundensatz plus Material ab. Was ein fairer Stundensatz ist, zeigt dir unser kostenloser Handwerker-Rechner.",
    faq: [
      { q: "Was kostet ein Elektriker pro Stunde?", a: "Stundensätze variieren regional. Über deine Anfrage erhältst du konkrete Angebote, die du vergleichen kannst." },
      { q: "Bekomme ich auch schnell jemanden bei einer Störung?", a: "Gib in der Anfrage an, dass es dringend ist – viele Betriebe melden sich dann kurzfristig." },
    ],
    keywords: ["Elektriker finden", "Elektriker gesucht", "Elektroinstallation Angebot", "Elektrobetrieb finden", "Elektriker in der Nähe"],
  },
  {
    slug: "sanitaer-heizung",
    keyword: "Sanitär- & Heizungsbetrieb",
    name: "Sanitär, Heizung & Klima (SHK)",
    category: "Sanitär & Heizung",
    intro: "Du brauchst einen Sanitär- oder Heizungsbetrieb – für Bad, Heizung, Rohrbruch oder Wartung? Stell kostenlos deine Anfrage und erhalte Angebote von SHK-Betrieben aus deiner Region.",
    leistungen: ["Badsanierung & Installation", "Heizung einbauen, warten & reparieren", "Rohrbruch & Notdienst", "Wärmepumpe & moderne Heiztechnik", "Sanitärinstallation", "Wartung & Inspektion"],
    auswahl: "Frage nach Festpreis, Garantie und Förderfähigkeit (z. B. bei Heizungstausch). Bei Notfällen zählen Erreichbarkeit und Reaktionszeit.",
    preis: "SHK-Arbeiten werden nach Aufwand plus Material berechnet; größere Projekte (Bad, Heizung) als Pauschale. Hol mehrere Angebote zum Vergleich ein.",
    faq: [
      { q: "Was kostet eine neue Heizung?", a: "Das hängt stark von Technik und Gebäude ab. Über deine Anfrage bekommst du belastbare Angebote – inkl. möglicher Förderung." },
      { q: "Gibt es auch einen Notdienst?", a: "Viele Betriebe bieten Notdienst an. Markiere deine Anfrage als dringend." },
    ],
    keywords: ["Sanitär finden", "Heizungsbauer finden", "SHK Betrieb finden", "Badsanierung Angebot", "Heizung Angebot einholen"],
  },
  {
    slug: "hausmeisterservice",
    keyword: "Hausmeisterservice",
    name: "Hausmeisterservice / Facility",
    category: "Hausmeisterservice",
    intro: "Du suchst einen Hausmeisterservice für Objektbetreuung, Winterdienst oder kleine Reparaturen? Beschreibe dein Objekt – passende Anbieter aus deiner Region senden dir kostenlos Angebote.",
    leistungen: ["Objektbetreuung & Hausmeister", "Winterdienst & Streupflicht", "Grünpflege & Außenanlagen", "Kleine Reparaturen & Wartung", "Treppenhaus- & Außenreinigung", "Schließdienst & Kontrollgänge"],
    auswahl: "Achte auf ein klares Leistungspaket, Vertretungsregelung und Zuverlässigkeit – besonders beim Winterdienst (Haftung!). Referenzen von Hausverwaltungen sind ein gutes Zeichen.",
    preis: "Hausmeisterservices werden oft als monatliche Pauschale je Objekt oder nach Stunden abgerechnet. Vergleiche Leistungsumfang und Preis.",
    faq: [
      { q: "Was kostet ein Hausmeisterservice?", a: "Meist als monatliche Pauschale je nach Objektgröße und Leistungen. Über deine Anfrage bekommst du passende Angebote." },
      { q: "Ist der Winterdienst dabei?", a: "Oft ja, als Zusatzleistung. Gib in der Anfrage an, ob du Winterdienst brauchst." },
    ],
    keywords: ["Hausmeisterservice finden", "Hausmeister gesucht", "Objektbetreuung Angebot", "Winterdienst Anbieter", "Facility Service finden"],
  },
  {
    slug: "garten-landschaftsbau",
    keyword: "Garten- & Landschaftsbauer",
    name: "Garten- & Landschaftsbau (GaLaBau)",
    category: "Garten- & Landschaftsbau",
    intro: "Du suchst einen Garten- und Landschaftsbauer für Gartenpflege, Baumschnitt oder die Neugestaltung deiner Außenanlage? Stell kostenlos deine Anfrage und erhalte Angebote aus deiner Region.",
    leistungen: ["Gartenpflege & Rasenpflege", "Baum- & Heckenschnitt", "Pflasterarbeiten & Wege", "Terrassen- & Zaunbau", "Bepflanzung & Gartengestaltung", "Außenanlagen für Gewerbe"],
    auswahl: "Lass dir bei größeren Projekten einen Plan und ein detailliertes Angebot geben. Für laufende Pflege lohnt ein Vertrag mit festem Turnus.",
    preis: "Gartenpflege wird nach Stunden oder als Saison-Pauschale abgerechnet, Bauprojekte als Festpreis. Mehrere Angebote vergleichen lohnt sich.",
    faq: [
      { q: "Was kostet Gartenpflege?", a: "Je nach Aufwand und Fläche, meist nach Stunden. Über deine Anfrage bekommst du konkrete Angebote." },
      { q: "Auch für Firmengelände?", a: "Ja, viele GaLaBau-Betriebe pflegen auch gewerbliche Außenanlagen. Gib gewerblich in der Anfrage an." },
    ],
    keywords: ["Gärtner finden", "Garten- und Landschaftsbau finden", "GaLaBau Angebot", "Gartenpflege Anbieter", "Gartenbau gesucht"],
  },
  {
    slug: "umzugsunternehmen",
    keyword: "Umzugsunternehmen",
    name: "Umzugsunternehmen / Transport",
    category: "Umzug & Transport",
    intro: "Du planst einen Umzug – privat oder fürs Büro? Beschreibe deinen Umzug kurz und erhalte kostenlos Angebote von Umzugsunternehmen aus deiner Region.",
    leistungen: ["Privatumzug", "Firmen- & Büroumzug", "Möbeltransport & Möbelmontage", "Ein- & Auspackservice", "Entrümpelung & Haushaltsauflösung", "Halteverbotszone & Umzugskartons"],
    auswahl: "Achte auf Versicherung (Haftung bei Schäden), Festpreis statt Stundenlohn-Überraschung und einen Besichtigungstermin bei größeren Umzügen.",
    preis: "Umzüge werden nach Volumen, Entfernung und Leistungen kalkuliert. Hol dir mehrere Angebote – die Preise unterscheiden sich oft deutlich.",
    faq: [
      { q: "Was kostet ein Umzug?", a: "Abhängig von Wohnungsgröße, Entfernung und Zusatzleistungen. Über deine Anfrage bekommst du Angebote zum direkten Vergleich." },
      { q: "Gibt es auch Entrümpelung?", a: "Viele Umzugsfirmen bieten das an. Gib es einfach in der Anfrage an." },
    ],
    keywords: ["Umzugsunternehmen finden", "Umzugsfirma gesucht", "Umzug Angebot einholen", "Möbeltransport Anbieter", "Entrümpelung finden"],
  },
  {
    slug: "tischler",
    keyword: "Tischler & Schreiner",
    name: "Tischler & Schreiner",
    category: "Tischler & Schreiner",
    intro: "Du suchst einen Tischler oder Schreiner – für Möbel nach Maß, Einbauten oder Reparaturen? Stell kostenlos deine Anfrage und erhalte Angebote aus deiner Region.",
    leistungen: ["Möbel nach Maß", "Einbauschränke & Küchen", "Türen & Fenster", "Holzreparaturen & Restaurierung", "Innenausbau", "Terrassen & Holz im Außenbereich"],
    auswahl: "Bei Maßanfertigungen zählen Beratung, Materialqualität und ein klares Angebot mit Skizze. Frag nach Referenzen und Lieferzeit.",
    preis: "Tischlerarbeiten werden individuell kalkuliert (Material + Arbeitszeit). Mehrere Angebote helfen, Preis und Qualität einzuschätzen.",
    faq: [
      { q: "Was kostet ein Möbelstück nach Maß?", a: "Sehr individuell – abhängig von Material, Größe und Aufwand. Über deine Anfrage bekommst du konkrete Angebote." },
      { q: "Auch kleine Reparaturen?", a: "Ja, viele Betriebe übernehmen auch Reparaturen. Beschreibe einfach dein Anliegen." },
    ],
    keywords: ["Tischler finden", "Schreiner finden", "Möbel nach Maß Angebot", "Tischlerei gesucht", "Innenausbau Anbieter"],
  },
];

export function serviceTypeBySlug(slug: string): ServiceType | undefined {
  return SERVICE_TYPES.find((s) => s.slug === slug);
}
