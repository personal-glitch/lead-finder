// Platzhalter-Ersetzung für E-Mail-Vorlagen.
// Unterstützte Platzhalter: {{firma}}, {{ansprechpartner}}, {{ort}}, {{objekttyp}}
import type { Lead } from "@/lib/types";

export const PLACEHOLDERS = ["firma", "ansprechpartner", "ort", "objekttyp"] as const;

export function renderTemplate(
  tpl: { subject: string; body: string },
  lead: Pick<Lead, "name" | "ansprechpartner" | "ort" | "objektTyp">,
): { subject: string; body: string } {
  const values: Record<(typeof PLACEHOLDERS)[number], string> = {
    firma: lead.name?.trim() || "Ihr Unternehmen",
    // Sinnvoller Fallback, damit keine „Guten Tag ," entstehen.
    ansprechpartner: lead.ansprechpartner?.trim() || "Damen und Herren",
    ort: lead.ort?.trim() || "Ihrer Region",
    objekttyp: lead.objektTyp?.trim() || "Ihr Objekt",
  };

  const apply = (s: string) =>
    s.replace(
      /\{\{\s*(firma|ansprechpartner|ort|objekttyp)\s*\}\}/gi,
      (_, key: string) => values[key.toLowerCase() as keyof typeof values],
    );

  return { subject: apply(tpl.subject), body: apply(tpl.body) };
}
