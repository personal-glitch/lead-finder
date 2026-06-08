import { describe, it, expect } from "vitest";
import { buildOverpassQuery } from "./overpass";
import { elementToLead } from "./find-leads";
import { deriveObjektTyp } from "./presets";
import type { OverpassElement } from "./overpass";

const center = { lat: 50.9384, lon: 6.96, displayName: "Köln" };

describe("buildOverpassQuery", () => {
  it("hängt (around:…) an jeden Filter und gibt 'out center tags;' aus", () => {
    const q = buildOverpassQuery(["praxis"], center, 1000);
    expect(q).toContain("[out:json]");
    expect(q).toContain('nwr["amenity"~"^(doctors|dentist|clinic)$"](around:1000,50.9384,6.96);');
    expect(q).toContain('nwr["healthcare"](around:1000,50.9384,6.96);');
    expect(q.trim().endsWith("out center tags;")).toBe(true);
  });

  it("kombiniert mehrere Presets", () => {
    const q = buildOverpassQuery(["hotel", "buero"], center, 500);
    expect(q).toContain('nwr["tourism"="hotel"]');
    expect(q).toContain('nwr["office"]');
    expect(q).toContain('nwr["building"="office"]');
  });
});

describe("elementToLead", () => {
  it("mappt einen Node inkl. Telefon-Normalisierung", () => {
    const el: OverpassElement = {
      type: "node",
      id: 1,
      lat: 50.9,
      lon: 6.9,
      tags: {
        name: "Zahnarztpraxis Dr. Test",
        amenity: "dentist",
        "addr:street": "Hauptstraße",
        "addr:housenumber": "5",
        "addr:postcode": "50667",
        "addr:city": "Köln",
        phone: "0221 1234567",
        website: "https://praxis-test.de",
      },
    };
    const lead = elementToLead(el, ["praxis"]);
    expect(lead).not.toBeNull();
    expect(lead!.name).toBe("Zahnarztpraxis Dr. Test");
    expect(lead!.objektTyp).toBe("Arzt- & Zahnarztpraxis");
    expect(lead!.strasse).toBe("Hauptstraße 5");
    expect(lead!.phoneE164).toBe("+492211234567");
    expect(lead!.osmId).toBe("node/1");
    expect(lead!.source).toBe("osm");
  });

  it("nutzt center als Koordinaten bei ways/relations", () => {
    const el: OverpassElement = {
      type: "way",
      id: 7,
      center: { lat: 51.1, lon: 6.8 },
      tags: { name: "Bürohaus", office: "company" },
    };
    const lead = elementToLead(el, ["buero"]);
    expect(lead!.lat).toBe(51.1);
    expect(lead!.lon).toBe(6.8);
    expect(lead!.objektTyp).toBe("Büro / Firma");
  });

  it("verwirft komplett leere Treffer (kein Name/Kontakt)", () => {
    const el: OverpassElement = { type: "node", id: 2, lat: 1, lon: 2, tags: { building: "yes" } };
    expect(elementToLead(el, ["buero"])).toBeNull();
  });
});

describe("deriveObjektTyp", () => {
  it("erkennt Hausverwaltung vor generischem Büro", () => {
    expect(deriveObjektTyp({ office: "estate_agent" }, [])).toBe(
      "Hausverwaltung / Makler",
    );
  });
  it("fällt auf generisches Büro zurück", () => {
    expect(deriveObjektTyp({ office: "company" }, [])).toBe("Büro / Firma");
  });
});
