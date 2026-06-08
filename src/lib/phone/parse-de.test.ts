import { describe, it, expect } from "vitest";
import {
  parseGermanPhone,
  extractPhoneNumbers,
  firstGermanPhone,
  pickBestPhone,
  maskExclusions,
} from "./parse-de";

describe("parseGermanPhone – die vier akzeptierten DE-Formate", () => {
  // Alle vier Beispiele beschreiben dieselbe Rufnummer.
  const cases = [
    "+49 221 1234567",
    "0221 1234567",
    "(0221) 123 45 67",
    "0221/1234-567",
  ];

  for (const input of cases) {
    it(`erkennt "${input}" → +492211234567`, () => {
      const p = parseGermanPhone(input);
      expect(p).not.toBeNull();
      expect(p!.e164).toBe("+492211234567");
    });
  }

  it("normalisiert Trennzeichen zu einzelnen Leerzeichen", () => {
    expect(parseGermanPhone("0221/1234-567")!.normalized).toBe("0221 1234 567");
    expect(parseGermanPhone("(0221) 123 45 67")!.normalized).toBe(
      "0221 123 45 67",
    );
  });

  it("behandelt die optionale (0) in internationaler Schreibweise", () => {
    const p = parseGermanPhone("+49 (0) 221 1234567");
    expect(p!.e164).toBe("+492211234567");
    expect(p!.normalized).toBe("+49 221 1234567");
  });

  it("akzeptiert 0049 als Länderpräfix", () => {
    expect(parseGermanPhone("0049 221 1234567")!.e164).toBe("+492211234567");
  });

  it("erkennt eine Berliner Nummer (030)", () => {
    expect(parseGermanPhone("030 12345678")!.e164).toBe("+493012345678");
  });
});

describe("extractPhoneNumbers – schließt Nicht-Telefonnummern aus", () => {
  const noPhone = (text: string) =>
    expect(extractPhoneNumbers(text)).toHaveLength(0);

  it("Handelsregister / Amtsgericht / HRB", () => {
    noPhone("Handelsregister: Amtsgericht Köln HRB 12345");
    noPhone("Eingetragen beim Amtsgericht München, HRA 98765");
  });

  it("Steuernummer", () => {
    noPhone("Steuernummer 214/5678/9012");
    noPhone("St.-Nr. 5133081508159");
  });

  it("USt-IdNr. (mit und ohne Leerzeichen, mit/ohne DE-Wort)", () => {
    noPhone("USt-IdNr.: DE123456789");
    noPhone("USt-IdNr: DE 123 456 789");
    noPhone("Umsatzsteuer-Identifikationsnummer: DE 811 569 869");
    noPhone("USt-IdNr: 123456789");
  });

  it("IBAN / Bankverbindung", () => {
    noPhone("IBAN: DE89 3704 0044 0532 0130 00");
    noPhone("Kontonummer 0532013000");
  });

  it("Datum mit vierstelligem Jahr (beginnt mit 0)", () => {
    noPhone("Stand: 07.08.2023");
  });

  it("reine 5-stellige PLZ ohne Telefon-Kontext", () => {
    noPhone("50667 Köln");
    noPhone("01067 Dresden");
  });
});

describe("extractPhoneNumbers – realistischer Impressum-Block", () => {
  const impressum = `
Muster Reinigung GmbH
Musterstraße 12
50667 Köln

Telefon: 0221 1234567
Telefax: 0221 1234568
E-Mail: info@muster-reinigung.de

Geschäftsführer: Max Mustermann
Registergericht: Amtsgericht Köln, HRB 98765
USt-IdNr.: DE 123 456 789
Stand: 07.08.2023
`;

  it("findet genau die Telefon- und die Fax-Nummer – nichts sonst", () => {
    const phones = extractPhoneNumbers(impressum);
    const e164s = phones.map((p) => p.e164).sort();
    expect(e164s).toEqual(["+492211234567", "+492211234568"]);
  });

  it("labelt Tel vs. Fax korrekt", () => {
    const phones = extractPhoneNumbers(impressum);
    const tel = phones.find((p) => p.e164 === "+492211234567");
    const fax = phones.find((p) => p.e164 === "+492211234568");
    expect(tel!.label).toBe("tel");
    expect(fax!.label).toBe("fax");
  });

  it("pickBestPhone bevorzugt die anrufbare Tel-Nummer vor Fax", () => {
    const best = firstGermanPhone(impressum);
    expect(best!.e164).toBe("+492211234567");
    expect(best!.label).toBe("tel");
  });
});

describe("maskExclusions", () => {
  it("erhält die Zeichenlänge (für Label-Erkennung)", () => {
    const input = "USt-IdNr.: DE123456789";
    expect(maskExclusions(input)).toHaveLength(input.length);
  });

  it("entfernt HRB-Nummer, lässt eine danebenstehende Tel-Nummer stehen", () => {
    const text = "HRB 12345, Tel 0221 1234567";
    const phones = extractPhoneNumbers(text);
    expect(phones.map((p) => p.e164)).toEqual(["+492211234567"]);
  });
});

describe("pickBestPhone", () => {
  it("gibt null bei leerer Liste", () => {
    expect(pickBestPhone([])).toBeNull();
  });

  it("bevorzugt Mobil vor Fax", () => {
    const phones = extractPhoneNumbers("Fax: 0221 111111  Mobil: 0171 2345678");
    const best = pickBestPhone(phones);
    expect(best!.label).toBe("mobil");
  });
});
