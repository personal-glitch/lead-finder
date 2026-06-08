import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";
import { scrapeImpressum } from "@/lib/leadgen/scrape-impressum";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";
import { firstGermanPhone } from "@/lib/phone/parse-de";
import type { Lead } from "@/lib/types";

const Body = z.object({
  // Entweder eine bereits gespeicherte Lead-ID (Ergebnis wird persistiert) …
  id: z.uuid().optional(),
  // … oder direkt eine Website (Vorschau ohne Speichern).
  website: z.string().min(1).optional(),
  // Optional: Branche für die Rollen-Priorität der Ansprechperson.
  branche: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { id, website, branche } = Body.parse(await req.json());
    const store = getStore();
    const ownerId = await getOwnerId();

    let lead: Lead | null = null;
    let url = website ?? null;
    let brancheKey: BrancheKey | undefined = isBrancheKey(branche ?? "") ? (branche as BrancheKey) : undefined;

    if (id) {
      lead = await store.getLead(ownerId, id);
      if (!lead) throw new AppError("not_found", "Lead nicht gefunden.");
      url = lead.website;
      if (!brancheKey && lead.objektTyp && isBrancheKey(lead.objektTyp)) brancheKey = lead.objektTyp;
    }
    if (!url) throw new AppError("bad_request", "Keine Website zum Anreichern vorhanden.");

    const imp = await scrapeImpressum(url, brancheKey);
    const e164 = imp.phone ? firstGermanPhone(imp.phone)?.e164 ?? null : null;
    const ansprechpartner = imp.contactName
      ? imp.contactRole
        ? `${imp.contactName} · ${imp.contactRole}`
        : imp.contactName
      : null;

    // Intern reicht die Info „wurde angereichert" – die konkrete Quelle/URL
    // bleibt Geheimnis und wird NICHT an den Client zurückgegeben.
    const enriched = Boolean(imp.impressumUrl);
    const enrichment = {
      phone: imp.phone,
      phoneE164: e164,
      email: imp.email,
      ansprechpartner,
      enrichmentSource: enriched ? ("web" as const) : null,
      enrichedAt: enriched ? new Date().toISOString() : null,
    };

    if (lead) {
      const patch: Partial<Lead> = {
        enrichmentSource: enrichment.enrichmentSource,
        enrichedAt: enrichment.enrichedAt,
      };
      if (enrichment.phone) {
        patch.phone = enrichment.phone;
        patch.phoneE164 = enrichment.phoneE164;
      }
      if (enrichment.email) patch.email = enrichment.email;
      if (enrichment.ansprechpartner) patch.ansprechpartner = enrichment.ansprechpartner;
      const updated = await store.updateLead(ownerId, lead.id, patch);
      if (enrichment.enrichmentSource) {
        await store.addActivity(ownerId, {
          leadId: lead.id,
          type: "enriched",
          summary: enrichment.ansprechpartner
            ? `Angereichert: ${enrichment.ansprechpartner}`
            : "Kontaktdaten geprüft",
          meta: { quelle: "web" },
        });
      }
      return jsonOk({ enrichment, lead: updated });
    }

    return jsonOk({ enrichment, lead: null });
  } catch (err) {
    return jsonError(err);
  }
}
