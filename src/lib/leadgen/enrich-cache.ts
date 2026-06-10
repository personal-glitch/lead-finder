// Domain-Cache für Anreicherungen: Einmal gescrapte Firmen werden in Supabase
// zwischengespeichert (Schlüssel = Domain ohne www). So muss dieselbe Firma bei
// erneuter Suche/Agenten-Lauf nicht noch einmal angesurft werden – schneller und
// schonender für fremde Server. Fällt sauber auf "kein Cache" zurück, wenn
// Supabase/Service-Role nicht verfügbar ist.
import { config } from "@/lib/config";
import type { ImpressumResult } from "./scrape-impressum";

// Gültigkeitsdauer eines Cache-Eintrags (Kontaktdaten ändern sich selten).
const TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 Tage

/** Registrierbare Domain (klein, ohne www) als Cache-Schlüssel. */
export function cacheDomain(url: string): string | null {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.host.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

async function admin() {
  if (!config.supabase.enabled || !config.supabase.serviceRoleKey) return null;
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    return createAdminClient();
  } catch {
    return null;
  }
}

export async function getCachedEnrichment(domain: string): Promise<ImpressumResult | null> {
  try {
    const db = await admin();
    if (!db) return null;
    const { data, error } = await db
      .from("enrichment_cache")
      .select("phone, email, contact_name, contact_role, impressum_url, extra, fetched_at")
      .eq("domain", domain)
      .maybeSingle();
    if (error || !data) return null;
    if (Date.now() - new Date(data.fetched_at as string).getTime() > TTL_MS) return null;
    // Alte Cache-Einträge VOR der v2-Anreicherung haben kein `extra` → als
    // Cache-Miss behandeln, damit neu gescrapt wird und die Listen entstehen.
    if (data.extra == null) return null;
    const extra = (data.extra as { emails?: string[]; phones?: ImpressumResult["phones"]; contacts?: ImpressumResult["contacts"] } | null) ?? null;
    return {
      impressumUrl: (data.impressum_url as string) ?? null,
      phone: (data.phone as string) ?? null,
      email: (data.email as string) ?? null,
      contactName: (data.contact_name as string) ?? null,
      contactRole: (data.contact_role as string) ?? null,
      emails: extra?.emails ?? [],
      phones: extra?.phones ?? [],
      contacts: extra?.contacts ?? [],
    };
  } catch {
    return null;
  }
}

export async function putCachedEnrichment(domain: string, imp: ImpressumResult): Promise<void> {
  try {
    const db = await admin();
    if (!db) return;
    await db.from("enrichment_cache").upsert(
      {
        domain,
        phone: imp.phone,
        email: imp.email,
        contact_name: imp.contactName,
        contact_role: imp.contactRole,
        impressum_url: imp.impressumUrl,
        extra: { emails: imp.emails, phones: imp.phones, contacts: imp.contacts },
        source: imp.impressumUrl ? "web" : "none",
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "domain" },
    );
  } catch {
    /* Cache-Fehler bewusst ignorieren – Anreicherung funktioniert auch ohne. */
  }
}
