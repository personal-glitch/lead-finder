// Erzeugt ein professionelles, gebrandetes Angebots-/Kalkulations-PDF (jsPDF).
export interface AngebotData {
  senderName: string | null;
  senderImpressum: string | null;
  senderEmail: string | null;
  kunde: string | null;
  modusLabel: string;
  headlineLabel: string;
  headlineValue: string;
  sub: string | null;
  hint: string | null;
  breakdown: { label: string; value: string }[];
}

const NAVY: [number, number, number] = [0x0f, 0x17, 0x2a];
const GREEN: [number, number, number] = [0xa8, 0xe8, 0x3a];
const GREEN_DK: [number, number, number] = [0x3f, 0x6f, 0x12];
const INK: [number, number, number] = [0x1f, 0x29, 0x37];
const MUT: [number, number, number] = [0x6b, 0x72, 0x80];
const LINE: [number, number, number] = [0xe2, 0xe8, 0xf0];
const TINT: [number, number, number] = [0xf3, 0xf9, 0xe7];
const ZEBRA: [number, number, number] = [0xf7, 0xf9, 0xfb];

// jsPDF-Standardfont kann kein Unicode wie ≈ / – / → – sauber ersetzen.
const clean = (s: unknown): string =>
  String(s ?? "")
    .replace(/≈/g, "ca.")
    .replace(/→/g, "->")
    .replace(/[–—]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'");

export async function generateAngebotPdf(d: AngebotData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 18;
  const RIGHT = W - M;
  const now = new Date();
  const angebotNr = `ANG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  // ---- Kopfbereich: Absender links, ANGEBOT rechts ----
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(clean(d.senderName?.trim() || "Dein Unternehmen"), M, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUT);
  const impLine = (d.senderImpressum?.trim() || "").replace(/\s*\n\s*/g, " · ");
  if (impLine) doc.text(doc.splitTextToSize(clean(impLine), 110) as string[], M, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...NAVY);
  doc.text("ANGEBOT", RIGHT, 24, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUT);
  doc.text(`Nr. ${angebotNr}`, RIGHT, 31, { align: "right" });
  doc.text(`Datum: ${now.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}`, RIGHT, 36, { align: "right" });

  // Grüne Akzentlinie
  doc.setFillColor(...GREEN);
  doc.rect(M, 42, W - 2 * M, 1.4, "F");

  // ---- Empfänger ----
  let y = 56;
  doc.setFontSize(8.5);
  doc.setTextColor(...MUT);
  doc.text("ANGEBOT FÜR", M, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(clean(d.kunde?.trim() || "Interessent / Projekt"), M, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUT);
  doc.text(clean(`Kalkulation · ${d.modusLabel}`), RIGHT, y + 7, { align: "right" });

  // ---- Preis-Hero ----
  y += 16;
  doc.setFillColor(...TINT);
  doc.roundedRect(M, y, W - 2 * M, 32, 3, 3, "F");
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 2, 32, "F"); // grüner Balken links
  doc.setTextColor(...MUT);
  doc.setFontSize(9.5);
  doc.text(clean(d.headlineLabel), M + 8, y + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(...GREEN_DK);
  doc.text(clean(d.headlineValue), M + 8, y + 22);
  if (d.sub) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUT);
    doc.text(clean(d.sub), M + 8, y + 28.5);
  }

  // ---- Aufschlüsselung (Zebra-Tabelle) ----
  y += 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Aufschlüsselung", M, y);
  y += 4;
  const rowH = 9;
  d.breakdown.forEach((b, i) => {
    if (i % 2 === 0) { doc.setFillColor(...ZEBRA); doc.rect(M, y, W - 2 * M, rowH, "F"); }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUT);
    doc.text(clean(b.label), M + 4, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(clean(b.value), RIGHT - 4, y + 6, { align: "right" });
    y += rowH;
  });
  doc.setDrawColor(...LINE);
  doc.line(M, y, RIGHT, y);

  if (d.hint) {
    y += 8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUT);
    doc.text(clean(d.hint), M, y);
  }

  // ---- Hinweisbox ----
  y += 10;
  doc.setFillColor(0xf8, 0xfa, 0xfc);
  doc.roundedRect(M, y, W - 2 * M, 16, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUT);
  doc.text(
    clean("Dieses Angebot basiert auf den genannten Eckdaten und gilt freibleibend. Preise verstehen sich wie angegeben (netto/brutto). Gerne erstelle ich Ihnen ein verbindliches Festangebot nach Besichtigung."),
    M + 4, y + 6, { maxWidth: W - 2 * M - 8 },
  );

  // ---- Fußzeile ----
  const footY = 285;
  doc.setDrawColor(...LINE);
  doc.line(M, footY - 6, RIGHT, footY - 6);
  doc.setFontSize(7.5);
  doc.setTextColor(...MUT);
  if (impLine) doc.text(doc.splitTextToSize(clean(impLine), W - 2 * M) as string[], M, footY);
  doc.setTextColor(0xa0, 0xa8, 0xb4);
  doc.text("Erstellt mit KundenRadar · seciora-solutions.de", RIGHT, footY + 6, { align: "right" });

  const safe = clean(d.kunde?.trim() || d.modusLabel).replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  doc.save(`Angebot-${safe}-${now.toISOString().slice(0, 10)}.pdf`);
}
