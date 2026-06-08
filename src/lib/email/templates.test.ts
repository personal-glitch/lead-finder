import { describe, it, expect } from "vitest";
import { renderTemplate } from "./templates";

const lead = {
  name: "Muster Reinigung GmbH",
  ansprechpartner: "Max Mustermann",
  ort: "Köln",
  objektTyp: "Hotel",
};

describe("renderTemplate", () => {
  it("ersetzt alle Platzhalter", () => {
    const out = renderTemplate(
      {
        subject: "Reinigung für {{firma}} in {{ort}}",
        body: "Guten Tag {{ansprechpartner}}, für {{objekttyp}} ...",
      },
      lead,
    );
    expect(out.subject).toBe("Reinigung für Muster Reinigung GmbH in Köln");
    expect(out.body).toBe("Guten Tag Max Mustermann, für Hotel ...");
  });

  it("nutzt Fallbacks bei fehlenden Werten", () => {
    const out = renderTemplate(
      { subject: "{{firma}}", body: "Guten Tag {{ansprechpartner}}," },
      { name: null, ansprechpartner: null, ort: null, objektTyp: null },
    );
    expect(out.subject).toBe("Ihr Unternehmen");
    expect(out.body).toBe("Guten Tag Damen und Herren,");
  });

  it("ist tolerant gegenüber Leerzeichen in Platzhaltern", () => {
    expect(
      renderTemplate({ subject: "{{ firma }}", body: "" }, lead).subject,
    ).toBe("Muster Reinigung GmbH");
  });
});
