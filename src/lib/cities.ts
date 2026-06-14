// Stadt-Landingpages: pro Stadt einzigartiger, lokaler Inhalt (kein „Name-Tausch").
// Wird von /neukunden-finden/[stadt] genutzt.

export interface CityBranche {
  name: string; // muss zu einer Branche im Katalog passen (für sinnvolle Beispiele)
  note: string; // lokaler Kontext, 1 Satz
}
export interface City {
  slug: string;
  name: string;     // „Köln"
  artikel: string;  // „in Köln"
  region: string;
  intro: string;    // stadt-spezifischer Einstieg
  branchen: CityBranche[];
  faq: { q: string; a: string }[];
}

export const CITIES: City[] = [
  {
    slug: "koeln", name: "Köln", artikel: "in Köln", region: "Nordrhein-Westfalen",
    intro: "Köln ist Medien- und Versicherungsstandort mit dichter Agentur- und Gastroszene rund um Messe, Innenstadt und Ehrenfeld. Wer als Dienstleister hier Neukunden sucht, hat eine enorme Dichte an Praxen, Büros, Hotels und Hausverwaltungen direkt vor der Tür – die Frage ist nur, wen man anruft.",
    branchen: [
      { name: "Arztpraxen & Zahnarztpraxen", note: "hohe Dichte in Innenstadt, Lindenthal und Sülz – konstanter Reinigungs- und IT-Bedarf." },
      { name: "Hotels & Gastronomie", note: "rund um Dom, Messe und Ringe – laufender Bedarf an Reinigung, Wartung und Lieferanten." },
      { name: "Agenturen & Medien", note: "Köln ist Medienstadt – viele kleine Agenturen als Partner oder Kunden." },
      { name: "Hausverwaltungen", note: "vergeben Unterhaltsreinigung und Handwerk für ganze Objektbestände." },
      { name: "Versicherungsbüros", note: "starker Versicherungsstandort mit vielen Büros und Filialen." },
    ],
    faq: [
      { q: "Wie viele Firmen finde ich in Köln?", a: "Das hängt von Branche und Umkreis ab. Mit dem Gratis-Check oben siehst du sofort, wie viele anrufbare Firmen es z. B. für Arztpraxen oder Hotels im Kölner Umkreis gibt – mit Telefon und Ansprechpartner." },
      { q: "Funktioniert das auch für Vororte wie Leverkusen oder Hürth?", a: "Ja. Du wählst PLZ oder Ort plus Umkreis (z. B. 15 km), dann werden auch Bergisch Gladbach, Leverkusen, Hürth und das Umland abgedeckt." },
      { q: "Sind die Daten aktuell und legal?", a: "Es werden ausschließlich öffentlich zugängliche, geschäftliche Quellen genutzt – DSGVO-konform, mit gespeicherter Herkunft je Kontakt." },
    ],
  },
  {
    slug: "hamburg", name: "Hamburg", artikel: "in Hamburg", region: "Hamburg",
    intro: "Hamburg lebt von Hafen, Logistik, Handel und Medien. Vom Büroviertel City Nord über die HafenCity bis Altona gibt es tausende Betriebe, Praxen und Verwaltungen – ein idealer Markt für Dienstleister, die planbar neue Aufträge wollen.",
    branchen: [
      { name: "Logistik & Spedition", note: "Hafen- und Logistikbetriebe mit Bedarf an Reinigung, Wartung und Personal." },
      { name: "Hausverwaltungen", note: "großer Wohnungsbestand – laufende Aufträge für Unterhaltsreinigung und Handwerk." },
      { name: "Hotels & Gastronomie", note: "von der HafenCity bis St. Pauli – konstanter Dienstleistungsbedarf." },
      { name: "Arztpraxen", note: "dichtes Netz in Eimsbüttel, Altona und Winterhude." },
      { name: "Handel & Filialen", note: "viele Filialbetriebe und Läden als Reinigungs- und Service-Kunden." },
    ],
    faq: [
      { q: "Wie viele Firmen gibt es in Hamburg für meine Branche?", a: "Prüf es gratis oben: Branche + Umkreis wählen und du siehst die Anzahl anrufbarer Firmen mit Telefonnummer." },
      { q: "Deckt das auch Stadtteile wie Harburg oder Bergedorf ab?", a: "Ja, über den Umkreis-Radius werden alle Hamburger Stadtteile und das Umland erfasst." },
      { q: "Brauche ich Vorkenntnisse?", a: "Nein – Ort und Branche eingeben, auf Prüfen klicken, fertig." },
    ],
  },
  {
    slug: "berlin", name: "Berlin", artikel: "in Berlin", region: "Berlin",
    intro: "Berlin ist Deutschlands größter und vielfältigster Markt: Startups in Mitte und Kreuzberg, Gastronomie überall, ein riesiger Wohnungs- und Gewerbebestand. Genau diese Dichte macht die Stadt zum Goldgrube für Dienstleister – wenn man die richtigen Firmen schnell findet.",
    branchen: [
      { name: "Gastronomie & Cafés", note: "extrem dichte Szene in fast jedem Kiez – laufender Reinigungs- und Lieferbedarf." },
      { name: "Startups & IT", note: "tausende junge Firmen als Kunden für Web, IT und Dienstleistung." },
      { name: "Hausverwaltungen", note: "riesiger Wohnungsbestand – planbare Aufträge für Reinigung und Handwerk." },
      { name: "Praxen & Kanzleien", note: "dichtes Netz in Charlottenburg, Prenzlauer Berg und Mitte." },
      { name: "Bau & Handwerk", note: "anhaltende Bautätigkeit mit Bedarf an Subunternehmern und Services." },
    ],
    faq: [
      { q: "Wie finde ich Kunden in einem bestimmten Bezirk?", a: "Gib die PLZ des Bezirks ein (z. B. 10115 für Mitte) und einen kleinen Umkreis – dann bekommst du nur Firmen aus der Gegend." },
      { q: "Wie viele Treffer sind realistisch?", a: "In Berlin oft sehr viele pro Branche. Der Gratis-Check zeigt dir die echte Zahl, bevor du startest." },
      { q: "Ist die Telefonakquise erlaubt?", a: "Gegenüber Unternehmen ist der Werbeanruf im B2B unter den Voraussetzungen des § 7 UWG zulässig. Das Tool weist dich auf die Spielregeln hin." },
    ],
  },
  {
    slug: "muenchen", name: "München", artikel: "in München", region: "Bayern",
    intro: "München verbindet hohe Kaufkraft mit starker Wirtschaft: Tech, Versicherungen, Finanzen und ein gehobener Dienstleistungsmarkt. Für Anbieter von Reinigung, IT, Webdesign oder Beratung ist die Stadt einer der lukrativsten Märkte Deutschlands.",
    branchen: [
      { name: "IT & Software", note: "starker Tech-Standort – viele Firmen als Kunden für Services und Zulieferer." },
      { name: "Versicherungen & Finanzen", note: "zahlreiche Büros und Filialen mit Reinigungs- und Wartungsbedarf." },
      { name: "Arzt- & Zahnarztpraxen", note: "hohe Dichte mit hohem Hygieneanspruch – idealer Reinigungsmarkt." },
      { name: "Hotels & Gastronomie", note: "Premium-Segment mit laufendem Dienstleistungsbedarf." },
      { name: "Unternehmensberatung", note: "viele Beratungen und Kanzleien als B2B-Kunden." },
    ],
    faq: [
      { q: "Lohnt sich der Markt München für Dienstleister?", a: "Ja – hohe Kaufkraft und Firmendichte. Mit dem Gratis-Check siehst du sofort, wie viele anrufbare Firmen deine Zielbranche im Münchner Umkreis hat." },
      { q: "Werden auch Umlandgemeinden erfasst?", a: "Ja, über den Umkreis (z. B. 20 km) werden Garching, Unterföhring, Ottobrunn & Co. abgedeckt." },
      { q: "Bekomme ich echte Durchwahlen?", a: "Ja, aus geprüften öffentlichen Quellen – inklusive Ansprechpartner, wo verfügbar." },
    ],
  },
  {
    slug: "duesseldorf", name: "Düsseldorf", artikel: "in Düsseldorf", region: "Nordrhein-Westfalen",
    intro: "Düsseldorf ist Mode-, Werbe- und Messestadt mit vielen Agenturen, Beratungen und Bürogebäuden entlang der Kö und im Medienhafen. Dienstleister finden hier eine hohe Dichte an anspruchsvollen B2B-Kunden auf engem Raum.",
    branchen: [
      { name: "Agenturen & Werbung", note: "Düsseldorf ist Werbestandort – viele Agenturen als Partner oder Kunden." },
      { name: "Mode & Handel", note: "Showrooms und Läden mit Bedarf an Reinigung und Service." },
      { name: "Beratung & Kanzleien", note: "dichte Bürolandschaft mit laufendem Dienstleistungsbedarf." },
      { name: "Hotels & Gastronomie", note: "rund um Messe und Altstadt – konstanter Bedarf." },
      { name: "Hausverwaltungen", note: "vergeben Unterhaltsreinigung und Handwerk für ganze Bestände." },
    ],
    faq: [
      { q: "Wie viele Firmen finde ich in Düsseldorf?", a: "Branche + Umkreis im Gratis-Check eingeben – du siehst die Anzahl anrufbarer Firmen mit Telefon sofort." },
      { q: "Sind Neuss, Ratingen und Meerbusch dabei?", a: "Ja, über den Umkreis werden die Nachbarstädte mit erfasst." },
      { q: "Wie schnell habe ich eine Anrufliste?", a: "In Sekunden – statt stundenlang zu googeln." },
    ],
  },
  {
    slug: "frankfurt", name: "Frankfurt", artikel: "in Frankfurt", region: "Hessen",
    intro: "Frankfurt ist Finanzmetropole mit Banken, Beratungen, Messe und dem größten Flughafen Deutschlands. Die vielen Bürotürme und Gewerbeflächen bedeuten besonders für Gebäudereiniger, IT- und Service-Anbieter einen riesigen, planbaren Markt.",
    branchen: [
      { name: "Banken & Finanzen", note: "Bürotürme im Bankenviertel mit hohem Reinigungs- und Wartungsbedarf." },
      { name: "Unternehmensberatung", note: "dichte Beraterlandschaft – viele B2B-Kunden." },
      { name: "Logistik (Flughafen)", note: "rund um den Flughafen viele Logistik- und Servicebetriebe." },
      { name: "Hotels & Gastronomie", note: "Messe- und Geschäftsreisen sorgen für konstanten Bedarf." },
      { name: "Hausverwaltungen", note: "großer Gewerbe- und Wohnungsbestand für laufende Aufträge." },
    ],
    faq: [
      { q: "Warum ist Frankfurt gut für Gebäudereiniger?", a: "Sehr viele Bürogebäude und Gewerbeflächen = laufender Reinigungsbedarf. Der Gratis-Check zeigt dir die anrufbaren Firmen im Umkreis." },
      { q: "Werden Offenbach und Umland erfasst?", a: "Ja, über den Umkreis-Radius." },
      { q: "Wie kalkuliere ich den richtigen Preis?", a: "Nutze den kostenlosen Reinigungskosten-Rechner – Stundensatz und m²-Preis in Sekunden." },
    ],
  },
  {
    slug: "stuttgart", name: "Stuttgart", artikel: "in Stuttgart", region: "Baden-Württemberg",
    intro: "Stuttgart ist Industrie- und Mittelstandshochburg: Automotive, Maschinenbau, Ingenieurbüros. Wer Dienstleistungen anbietet, trifft hier auf solvente, beständige B2B-Kunden – von der Werkshalle bis zum Ingenieurbüro.",
    branchen: [
      { name: "Industrie & Maschinenbau", note: "Hallen und Werke mit Bedarf an Industriereinigung und Services." },
      { name: "Ingenieur- & Planungsbüros", note: "dichte Bürolandschaft als B2B-Kunden." },
      { name: "Autohäuser & KFZ", note: "viele Betriebe rund um die Automobilregion." },
      { name: "Arztpraxen", note: "solides Praxisnetz in Stadt und Umland." },
      { name: "Hausverwaltungen", note: "laufende Aufträge für Reinigung und Handwerk." },
    ],
    faq: [
      { q: "Passt das für den Mittelstand rund um Stuttgart?", a: "Ja – gerade Industrie und Mittelstand sind beständige Kunden. Prüf die Firmenzahl gratis oben." },
      { q: "Sind Sindelfingen, Esslingen & Co. dabei?", a: "Ja, über den Umkreis werden die Nachbarstädte abgedeckt." },
      { q: "Bekomme ich Ansprechpartner?", a: "Wo öffentlich verfügbar, ja – inklusive Telefonnummer." },
    ],
  },
  {
    slug: "leipzig", name: "Leipzig", artikel: "in Leipzig", region: "Sachsen",
    intro: "Leipzig ist eine der am schnellsten wachsenden Städte Deutschlands: Logistik, Automotive, Handel und eine lebendige Gründerszene. Für Dienstleister bedeutet das einen jungen, dynamischen Markt mit viel Bewegung und Bedarf.",
    branchen: [
      { name: "Logistik", note: "großer Logistikstandort mit Bedarf an Reinigung, Wartung und Personal." },
      { name: "Handel & Filialen", note: "wachsender Einzelhandel als Service-Kunden." },
      { name: "Gastronomie", note: "lebendige Szene in Zentrum, Plagwitz und Südvorstadt." },
      { name: "Startups & Kreativ", note: "junge Firmen als Kunden für Web, IT und Dienstleistung." },
      { name: "Hausverwaltungen", note: "wachsender Wohnungsbestand für laufende Aufträge." },
    ],
    faq: [
      { q: "Lohnt sich Leipzig als Markt?", a: "Ja – starkes Wachstum und viel Neugeschäft. Der Gratis-Check zeigt dir die echten Firmenzahlen." },
      { q: "Werden Halle und Umland erfasst?", a: "Über einen größeren Umkreis ja." },
      { q: "Wie aktuell sind die Daten?", a: "Sie stammen aus öffentlich zugänglichen, geschäftlichen Quellen." },
    ],
  },
  {
    slug: "dortmund", name: "Dortmund", artikel: "in Dortmund", region: "Nordrhein-Westfalen",
    intro: "Dortmund hat den Wandel von der Industrie zur Logistik-, Technologie- und Dienstleistungsstadt geschafft. Im Ruhrgebiet liegt eine enorme Firmendichte auf kleinem Raum – ideal, um mit kurzen Wegen viele Kunden anzurufen.",
    branchen: [
      { name: "Logistik", note: "großer Logistikstandort mit laufendem Service-Bedarf." },
      { name: "Technologie & IT", note: "wachsende Tech-Szene rund um den Technologiepark." },
      { name: "Handel & Dienstleistung", note: "dichtes Netz an Betrieben und Filialen." },
      { name: "Arztpraxen", note: "solides Praxisnetz in Stadt und Vororten." },
      { name: "Hausverwaltungen", note: "großer Wohnungsbestand im Ruhrgebiet." },
    ],
    faq: [
      { q: "Profitiere ich von der Ruhrgebiets-Dichte?", a: "Ja – über den Umkreis erreichst du von Dortmund aus Bochum, Witten und mehr. Prüf die Zahlen gratis oben." },
      { q: "Wie viele Treffer sind drin?", a: "Das zeigt dir der Gratis-Check je Branche sofort." },
      { q: "Brauche ich ein Konto?", a: "Für den Check nein. Für die volle Liste mit allen Nummern ein kostenloses Konto." },
    ],
  },
  {
    slug: "essen", name: "Essen", artikel: "in Essen", region: "Nordrhein-Westfalen",
    intro: "Essen ist Konzern- und Dienstleistungsstandort im Herzen des Ruhrgebiets, mit vielen Zentralen, Büros und Handelsbetrieben. Die zentrale Lage macht die Stadt zum idealen Ausgangspunkt für Akquise in der gesamten Region.",
    branchen: [
      { name: "Büro & Unternehmen", note: "viele Konzernzentralen und Büros mit Reinigungs- und Service-Bedarf." },
      { name: "Handel & Filialen", note: "dichtes Einzelhandelsnetz als Kunden." },
      { name: "Gesundheit & Pflege", note: "Praxen und Pflegeeinrichtungen mit konstantem Bedarf." },
      { name: "Hausverwaltungen", note: "großer Wohnungsbestand für laufende Aufträge." },
      { name: "Gastronomie", note: "Innenstadt und Rüttenscheid mit lebendiger Szene." },
    ],
    faq: [
      { q: "Erreiche ich von Essen aus das Ruhrgebiet?", a: "Ja – über den Umkreis erfasst du Mülheim, Bochum, Gelsenkirchen und mehr. Prüf es gratis oben." },
      { q: "Sind die Kontakte anrufbar?", a: "Ja, mit echter Telefonnummer aus geprüften öffentlichen Quellen." },
      { q: "Wie schnell geht das?", a: "Branche und Ort eingeben, auf Prüfen klicken – Sekunden statt Stunden." },
    ],
  },
];

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
