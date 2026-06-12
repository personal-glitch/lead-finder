// Einfacher, abhängigkeitsfreier CSV-Export (Excel-kompatibel, UTF-8 mit BOM, ;-getrennt).
function cell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Excel-sicher: Felder mit ; " oder Zeilenumbruch quoten; "→""
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const head = headers.map(cell).join(";");
  const body = rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return `﻿${head}\r\n${body}`;
}

/** Browser-Download einer CSV-Datei. */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<unknown>>): void {
  const csv = toCsv(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
