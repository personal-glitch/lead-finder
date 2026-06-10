import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId, ensureSeeded } from "@/lib/db";
import { planOf } from "@/lib/plans";
import type { LeadInput } from "@/lib/types";

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    await ensureSeeded(ownerId);
    const leads = await getStore().listLeads(ownerId);
    return jsonOk({ leads });
  } catch (err) {
    return jsonError(err);
  }
}

const LeadInputSchema = z.object({
  name: z.string().nullish(),
  objektTyp: z.string().nullish(),
  strasse: z.string().nullish(),
  plz: z.string().nullish(),
  ort: z.string().nullish(),
  lat: z.number().nullish(),
  lon: z.number().nullish(),
  phone: z.string().nullish(),
  phoneE164: z.string().nullish(),
  email: z.string().nullish(),
  ansprechpartner: z.string().nullish(),
  website: z.string().nullish(),
  openingHours: z.string().nullish(),
  source: z.enum(["osm", "impressum", "manual", "recherche"]).optional(),
  enrichmentSource: z.enum(["impressum", "web"]).nullish(),
  enrichedAt: z.string().nullish(),
  enrichmentExtra: z.object({
    emails: z.array(z.string()),
    phones: z.array(z.object({
      number: z.string(),
      e164: z.string().nullable(),
      label: z.enum(["tel", "mobil", "fax"]).nullable(),
    })),
    contacts: z.array(z.object({ name: z.string(), role: z.string().nullable() })),
  }).nullish(),
  osmId: z.string().nullish(),
});

const Body = z.object({
  inputs: z.array(LeadInputSchema).min(1, "Keine Leads übergeben."),
  stageId: z.string().nullish(),
  /** Optional: Agent, aus dessen Lauf die Leads stammen (für Statistik). */
  agentId: z.string().nullish(),
});

function toLeadInput(i: z.infer<typeof LeadInputSchema>): LeadInput {
  return {
    name: i.name ?? null,
    objektTyp: i.objektTyp ?? null,
    strasse: i.strasse ?? null,
    plz: i.plz ?? null,
    ort: i.ort ?? null,
    lat: i.lat ?? null,
    lon: i.lon ?? null,
    phone: i.phone ?? null,
    phoneE164: i.phoneE164 ?? null,
    email: i.email ?? null,
    ansprechpartner: i.ansprechpartner ?? null,
    website: i.website ?? null,
    openingHours: i.openingHours ?? null,
    source: i.source ?? "manual",
    enrichmentSource: i.enrichmentSource ?? null,
    enrichedAt: i.enrichedAt ?? null,
    enrichmentExtra: i.enrichmentExtra ?? null,
    osmId: i.osmId ?? null,
  };
}

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    await ensureSeeded(ownerId);
    const { inputs, stageId, agentId } = Body.parse(await req.json());
    const store = getStore();
    // Paket-Limit erzwingen (Kontakte gesamt).
    const limit = planOf((await store.getSettings(ownerId)).plan).maxLeads;
    if ((await store.listLeads(ownerId)).length >= limit) {
      throw new AppError("limit", `Paket-Limit erreicht: max. ${limit} Kontakte. Upgrade in den Einstellungen.`);
    }
    const leads = await store.saveLeads(ownerId, inputs.map(toLeadInput), stageId ?? null);

    // Verbindung: jede Übernahme als Aktivität an der Firma protokollieren.
    for (const lead of leads) {
      await store.addActivity(ownerId, {
        leadId: lead.id,
        type: "created",
        summary: `Lead übernommen: ${lead.name ?? "Ohne Namen"}`,
        meta: { source: lead.source },
      });
    }

    // Agent-Statistik „Leads angelegt" fortschreiben (Best effort).
    if (agentId) {
      try {
        const agent = await store.getAgent(ownerId, agentId);
        if (agent) {
          await store.recordAgentRun(ownerId, agentId, agent.lastMatchCount, inputs.length);
        }
      } catch {
        /* Statistik darf das Speichern nicht blockieren */
      }
    }
    return jsonOk({ leads });
  } catch (err) {
    return jsonError(err);
  }
}
