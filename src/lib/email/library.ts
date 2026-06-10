// Vorlagen-Bibliothek: geprüfte Start-Vorlagen für die Kaltansprache.
// Platzhalter: {{firma}}, {{ansprechpartner}}, {{ort}}, {{objekttyp}}.
// Bewusst kurz, sachlich und mit konkretem Bezug zum Empfänger (DSGVO/UWG-freundlich).

export interface LibraryTemplate {
  name: string;
  branche: "Reinigung" | "Handwerk" | "Agentur" | "Allgemein";
  subject: string;
  body: string;
}

export const TEMPLATE_LIBRARY: LibraryTemplate[] = [
  {
    name: "Reinigung – Erstansprache",
    branche: "Reinigung",
    subject: "Unterhaltsreinigung für {{firma}} in {{ort}}",
    body:
      "Guten Tag {{ansprechpartner}},\n\n" +
      "ich bin auf {{firma}} aufmerksam geworden und wir übernehmen für Betriebe in {{ort}} die regelmäßige " +
      "Unterhaltsreinigung – zuverlässig, mit festen Ansprechpartnern und transparenten Preisen.\n\n" +
      "Hätten Sie Interesse an einem unverbindlichen Angebot für {{objekttyp}}? Ich richte mich gern nach Ihrem " +
      "gewünschten Rhythmus.\n\n" +
      "Über eine kurze Rückmeldung freue ich mich.\n\nFreundliche Grüße",
  },
  {
    name: "Reinigung – kurz & direkt",
    branche: "Reinigung",
    subject: "Angebot Reinigung {{firma}}?",
    body:
      "Hallo {{ansprechpartner}},\n\n" +
      "kurze Frage: Ist Ihre Reinigung für {{objekttyp}} aktuell vergeben – oder darf ich Ihnen ein " +
      "unverbindliches Angebot machen? Zwei Sätze zu Fläche und Rhythmus genügen.\n\nViele Grüße",
  },
  {
    name: "Handwerk – Erstansprache",
    branche: "Handwerk",
    subject: "Kapazität für {{firma}} – Anfrage aus {{ort}}",
    body:
      "Guten Tag {{ansprechpartner}},\n\n" +
      "wir haben kurzfristig Kapazität frei und unterstützen Firmen wie {{firma}} in {{ort}} bei anstehenden " +
      "Arbeiten an {{objekttyp}}. Faire Festpreise, saubere Ausführung, verbindliche Termine.\n\n" +
      "Gibt es bei Ihnen gerade etwas, wofür Sie ein Angebot brauchen? Melden Sie sich gern.\n\nFreundliche Grüße",
  },
  {
    name: "Agentur – Erstansprache",
    branche: "Agentur",
    subject: "Mehr Anfragen für {{firma}}",
    body:
      "Hallo {{ansprechpartner}},\n\n" +
      "ich habe mir {{firma}} angesehen – mit ein paar gezielten Anpassungen an Ihrem Online-Auftritt ließen sich " +
      "spürbar mehr Anfragen aus {{ort}} gewinnen.\n\n" +
      "Wenn es passt, schicke ich Ihnen 2–3 konkrete Ansatzpunkte, die ich konkret bei Ihnen sehe – unverbindlich.\n\n" +
      "Beste Grüße",
  },
  {
    name: "Nach Telefonat (sauberer Bezug)",
    branche: "Allgemein",
    subject: "Wie besprochen: Angebot für {{firma}}",
    body:
      "Guten Tag {{ansprechpartner}},\n\n" +
      "vielen Dank für das kurze Telefonat eben. Wie besprochen sende ich Ihnen die Infos zu {{objekttyp}} " +
      "schriftlich zu und erstelle Ihnen gern ein passendes Angebot.\n\n" +
      "Sagen Sie mir einfach kurz, was Ihnen am wichtigsten ist – dann melde ich mich mit konkreten Zahlen.\n\n" +
      "Freundliche Grüße",
  },
  {
    name: "Follow-up (freundlicher Nachfass)",
    branche: "Allgemein",
    subject: "Kurz nachgehakt – {{firma}}",
    body:
      "Hallo {{ansprechpartner}},\n\n" +
      "ich wollte nur kurz nachfragen, ob meine letzte Nachricht bei Ihnen angekommen ist. Falls das Thema " +
      "{{objekttyp}} gerade nicht passt, ist das völlig in Ordnung – sagen Sie einfach kurz Bescheid, dann " +
      "melde ich mich nicht weiter.\n\n" +
      "Andernfalls mache ich Ihnen gern ein unverbindliches Angebot.\n\nViele Grüße",
  },
];
