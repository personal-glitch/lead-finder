// Erzeugt ein gebrandetes Angebots-/Kalkulations-PDF (jsPDF, dynamisch geladen).
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

const GREEN: [number, number, number] = [0x86, 0xc7, 0x12]; // dunkleres Brand-Grün (lesbar auf Weiß)
const INK: [number, number, number] = [0x0f, 0x17, 0x2a];
const MUT: [number, number, number] = [0x64, 0x74, 0x8b];

export async function generateAngebotPdf(d: AngebotData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 18;
  let y = 0;

  // Kopf-Balken
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(d.senderName?.trim() || "Angebot", M, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text(`Angebot / Kalkulation · ${d.modusLabel}`, M, 20);

  y = 38;
  doc.setTextColor(...MUT);
  doc.setFontSize(10);
  const datum = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Datum: ${datum}`, M, y);
  if (d.kunde?.trim()) doc.text(`Für: ${d.kunde.trim()}`, W - M, y, { align: "right" });

  // Ergebnis-Box
  y += 8;
  doc.setFillColor(0xf1, 0xf7, 0xe6);
  doc.roundedRect(M, y, W - 2 * M, 30, 3, 3, "F");
  doc.setTextColor(...MUT);
  doc.setFontSize(10);
  doc.text(d.headlineLabel, M + 6, y + 9);
  doc.setTextColor(0x3f, 0x6f, 0x12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(d.headlineValue, M + 6, y + 21);
  if (d.sub) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUT);
    doc.text(d.sub, M + 6, y + 27);
  }
  y += 40;

  // Aufschlüsselung
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Aufschlüsselung", M, y);
  y += 3;
  doc.setDrawColor(0xe2, 0xe8, 0xf0);
  doc.line(M, y, W - M, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const b of d.breakdown) {
    doc.setTextColor(...MUT);
    doc.text(b.label, M, y);
    doc.setTextColor(...INK);
    doc.text(b.value, W - M, y, { align: "right" });
    y += 7;
  }
  if (d.hint) {
    y += 2;
    doc.setTextColor(...MUT);
    doc.setFontSize(9);
    doc.text(d.hint, M, y);
    y += 6;
  }

  // Fußzeile
  const footY = 280;
  doc.setDrawColor(0xe2, 0xe8, 0xf0);
  doc.line(M, footY - 6, W - M, footY - 6);
  doc.setFontSize(8);
  doc.setTextColor(...MUT);
  const imp = (d.senderImpressum?.trim() || "").replace(/\s*\n\s*/g, " · ");
  if (imp) doc.text(doc.splitTextToSize(imp, W - 2 * M) as string[], M, footY - 1);
  doc.text("Richtwerte – unverbindlich, ohne Gewähr. Erstellt mit KundenRadar.", M, footY + 8);

  const safe = (d.kunde?.trim() || d.modusLabel).replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  doc.save(`Angebot-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
