import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getStore, getOwnerId } from "@/lib/db";
import { scrapeImpressum } from "@/lib/leadgen/scrape-impressum";
import { discoverWebsite } from "@/lib/leadgen/discover-website";
import { cacheDomain, getCachedEnrichment, putCachedEnrichment } from "@/lib/leadgen/enrich-cache";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen";
import { firstGermanPhone } from "@/lib/phone/parse-de";
import type { Lead } from "@/lib/types";

const Body = z.object({
  // Temporär: Diagnose (roher Fetch-Status der Website).
  debug: z.boolean().optional(),
  // Entweder eine bereits gespeicherte Lead-ID (Ergebnis wird persistiert) …
  id: z.uuid().optional(),
  // … oder direkt eine Website (Vorschau ohne Speichern).
  website: z.string().min(1).optional(),
  // Optional: Branche für die Rollen-Priorität der Ansprechperson.
  branche: z.string().optional(),
  // Optional: Firmenname + Ort. Ist keine Website bekannt, wird damit die
  // offizielle Website per Web-Suche ermittelt und anschließend gescrapt.
  name: z.string().optional(),
  ort: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { id, website, branche, name, ort, debug } = Body.parse(await req.json());

    // ── Temporäre Egress-Diagnose ──
    if (debug && website) {
      const { config } = await import("@/lib/config");
      const out: Record<string, unknown> = {};
      for (const u of [website, new URL("/impressum", website).toString()]) {
        try {
          const r = await fetch(u, { headers: { "User-Agent": config.osm.userAgent, Accept: "text/html" }, signal: AbortSignal.timeout(12_000), redirect: "follow" });
          out[u] = { status: r.status, ctype: r.headers.get("content-type"), len: (await r.text()).length };
        } catch (e) {
          out[u] = { error: String(e) };
        }
      }
      return jsonOk({ debugFetch: out });
    }

    const store = getStore();
    const ownerId = await getOwnerId();

    let lead: Lead | null = null;
    let url = website ?? null;
    let brancheKey: BrancheKey | undefined = isBrancheKey(branche ?? "") ? (branche as BrancheKey) : undefined;
    let searchName = name ?? null;
    let searchOrt = ort ?? null;

    if (id) {
      lead = await store.getLead(ownerId, id);
      if (!lead) throw new AppError("not_found", "Lead nicht gefunden.");
      url = lead.website;
      searchName = searchName ?? lead.name;
      searchOrt = searchOrt ?? lead.ort;
      if (!brancheKey && lead.objektTyp && isBrancheKey(lead.objektTyp)) brancheKey = lead.objektTyp;
    }

    // Keine Website bekannt? Dann per Web-Suche die offizielle Firmen-Website
    // ermitteln (kostenlos, ohne Key) und – falls gefunden – am Lead speichern.
    let discoveredWebsite: string | null = null;
    if (!url && searchName) {
      url = await discoverWebsite(searchName, searchOrt);
      if (url) discoveredWebsite = url;
    }
    if (!url) {
      throw new AppError(
        "bad_request",
        "Keine Website gefunden. Für diese Firma ließ sich online keine eigene Website ermitteln – bitte Telefon/Adresse manuell prüfen.",
      );
    }

    // Cache zuerst – spart erneutes Scrapen derselben Domain.
    const domain = cacheDomain(url);
    let imp = domain ? await getCachedEnrichment(domain) : null;
    if (!imp) {
      imp = await scrapeImpressum(url, brancheKey);
      if (domain) await putCachedEnrichment(domain, imp);
    }
    const e164 = imp.phone ? firstGermanPhone(imp.phone)?.e164 ?? null : null;
    const ansprechpartner = imp.contactName
      ? imp.contactRole
        ? `${imp.contactName} · ${imp.contactRole}`
        : imp.contactName
      : null;

    // Intern reicht die Info „wurde angereichert" – die konkrete Quelle/URL
    // bleibt Geheimnis und wird NICHT an den Client zurückgegeben.
    const enriched = Boolean(imp.impressumUrl);
    // v2: alle gefundenen Kontaktwege (mehrere E-Mails/Nummern/Ansprechpartner).
    const extra = { emails: imp.emails, phones: imp.phones, contacts: imp.contacts };
    const hasExtra = imp.emails.length > 0 || imp.phones.length > 0 || imp.contacts.length > 0;
    const enrichment = {
      phone: imp.phone,
      phoneE164: e164,
      email: imp.email,
      ansprechpartner,
      // Per Web-Suche gefundene Website (für die UI, damit der Lead sie übernimmt).
      website: discoveredWebsite,
      // Alle weiteren Kontaktwege (für das Detail-Fenster).
      extra,
      enrichmentSource: enriched ? ("web" as const) : null,
      enrichedAt: enriched ? new Date().toISOString() : null,
    };

    if (lead) {
      const patch: Partial<Lead> = {
        enrichmentSource: enrichment.enrichmentSource,
        enrichedAt: enrichment.enrichedAt,
      };
      if (discoveredWebsite && !lead.website) patch.website = discoveredWebsite;
      if (enrichment.phone) {
        patch.phone = enrichment.phone;
        patch.phoneE164 = enrichment.phoneE164;
      }
      if (enrichment.email) patch.email = enrichment.email;
      if (enrichment.ansprechpartner) patch.ansprechpartner = enrichment.ansprechpartner;
      if (hasExtra) patch.enrichmentExtra = extra;
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
