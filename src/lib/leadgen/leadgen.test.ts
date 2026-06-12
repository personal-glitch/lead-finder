import { describe, it, expect } from "vitest";
import { brancheForTags, brancheSelectors } from "./branchen";
import { findBestContact } from "./scrape-impressum";

describe("brancheForTags – Tag → Branche", () => {
  it("ordnet Zahnarzt korrekt zu", () => {
    expect(brancheForTags({ healthcare: "dentist" }, ["Zahnarztpraxis", "Büro & Unternehmen"])).toBe("Zahnarztpraxis");
  });
  it("bevorzugt spezifische Branche vor dem Catch-all", () => {
    expect(brancheForTags({ office: "tax_advisor" }, ["Steuerberater", "Büro & Unternehmen"])).toBe("Steuerberater");
  });
  it("erkennt allgemeines Büro (office=yes)", () => {
    expect(brancheForTags({ office: "yes" }, ["Büro & Unternehmen"])).toBe("Büro & Unternehmen");
  });
  it("ordnet Restaurant korrekt zu (neuer Katalog)", () => {
    expect(brancheForTags({ amenity: "restaurant" }, ["Restaurant", "Büro & Unternehmen"])).toBe("Restaurant");
  });
  it("gibt null, wenn keine gewählte Branche passt", () => {
    expect(brancheForTags({ amenity: "restaurant" }, ["Büro & Unternehmen"])).toBeNull();
  });
});

describe("brancheSelectors – Overpass-Filter", () => {
  it("baut nwr-Filter aus den Tags", () => {
    const sel = brancheSelectors(["Steuerberater"]);
    expect(sel).toContain('nwr["office"="tax_advisor"]');
    expect(sel).toContain('nwr["office"="accountant"]');
  });
});

describe("findBestContact – Rollen-Priorität", () => {
  it("Praxis: erkennt Praxisleitung und entfernt Anrede", () => {
    const r = findBestContact("Praxisleitung: Frau Anna Schmidt\nTelefon: 0221 1", "Arztpraxis");
    expect(r).toEqual({ name: "Anna Schmidt", role: "Praxisleitung" });
  });

  it("Hausverwaltung: Objektverwalter (Tier 1) schlägt Geschäftsführer (Tier 3)", () => {
    const text = "Geschäftsführer: Max Mustermann\nObjektverwalter: Erika Beispiel";
    const r = findBestContact(text, "Hausverwaltung");
    expect(r?.name).toBe("Erika Beispiel");
    expect(r?.role).toBe("Objektverwalter");
  });

  it("Büro: greift den generischen 'Vertreten durch'-Fallback", () => {
    expect(findBestContact("Vertreten durch: Hans Müller", "Büro & Unternehmen")?.name).toBe("Hans Müller");
  });

  it("Name in der Zeile unter der Rolle wird erkannt", () => {
    const text = "Praxisinhaber\nDr. med. Klaus Weber";
    expect(findBestContact(text, "Arztpraxis")?.name).toBe("Klaus Weber");
  });

  it("kein Treffer → null", () => {
    expect(findBestContact("Wir reinigen Ihr Büro.", "Büro & Unternehmen")).toBeNull();
  });
});
