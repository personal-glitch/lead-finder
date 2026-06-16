// Client-sichere Konstanten/Typen der Auftragsbörse (kein Server-Code).
export const CATEGORIES = [
  "Gebäudereinigung",
  "Hausmeisterservice",
  "Maler & Lackierer",
  "Elektriker",
  "Sanitär & Heizung",
  "Tischler & Schreiner",
  "Dachdecker",
  "Garten- & Landschaftsbau",
  "Umzug & Transport",
  "Handwerk (Sonstiges)",
  "Agentur & Marketing",
  "IT & Web",
  "Sonstiges",
] as const;

export type CustomerType = "privat" | "gewerblich";
export type RequestStatus = "offen" | "geschlossen";
