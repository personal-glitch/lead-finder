// Öffentliche Ausschreibungen aus dem Datenservice Öffentlicher Einkauf (oeffentlichevergabe.de).
// Open Data, Lizenz CC0. Tages-ZIP (OCDS) wird geladen, nach relevanten CPV-Codes gefiltert
// und in der Tabelle `tenders` gespeichert. Anzeige im Tool unter „Aufträge → Ausschreibungen".
import { config } from "@/lib/config";

const EXPORT_URL = "https://oeffentlichevergabe.de/api/notice-exports";

// CPV-Präfix → Branche (erster Treffer gewinnt). Bewusst eng gehalten, damit nur
// für unsere Zielgruppen relevante Ausschreibungen einlaufen.
const CPV_PREFIX: Record<string, string> = {
  "909": "Gebäudereinigung",
  "9061": "Gebäudereinigung",
  "90919": "Gebäudereinigung",
  "7731": "Garten- & Landschaftsbau",
  "45112": "Garten- & Landschaftsbau",
  "45442": "Maler & Lackierer",
  "45441": "Maler & Lackierer",
  "4533": "Sanitär & Heizung",
  "45310": "Elektriker",
  "45311": "Elektriker",
  "45315": "Elektriker",
  "45316": "Elektriker",
  "45261": "Dachdecker",
  "45421": "Tischler & Schreiner",
  "45422": "Tischler & Schreiner",
  "79993": "Hausmeisterservice",
  "70330": "Hausmeisterservice",
};

function categoryFor(cpvs: string[]): string | null {
  for (const c of cpvs) {
    for (const p of Object.keys(CPV_PREFIX)) {
      if (c.startsWith(p)) return CPV_PREFIX[p];
    }
  }
  return null;
}

export interface Tender {
  noticeId: string;
  title: string;
  description: string | null;
  category: string;
  cpv: string | null;
  buyer: string | null;
  ort: string | null;
  plz: string | null;
  contactEmail: string | null;
  url: string | null;
  publishedDate: string | null;
  deadline: string | null;
}

export function tendersEnabled(): boolean {
  return config.supabase.enabled && Boolean(config.supabase.serviceRoleKey);
}

async function admin() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

/** Datum (YYYY-MM-DD) für „vor n Tagen" in Europe/Berlin. */
function berlinDay(offsetDays: number): string {
  const now = new Date();
  const berlin = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  berlin.setDate(berlin.getDate() - offsetDays);
  return berlin.toISOString().slice(0, 10);
}

interface OcdsItem { classification?: { id?: string }; additionalClassifications?: { id?: string }[] }
interface OcdsRelease {
  id?: string; ocid?: string; date?: string;
  buyer?: { name?: string; address?: { locality?: string; postalCode?: string }; contactPoint?: { email?: string; url?: string } };
  tender?: { title?: string; description?: string; items?: OcdsItem[]; tenderPeriod?: { endDate?: string } };
}
interface OcdsPackage { publishedDate?: string; releases?: OcdsRelease[] }

function parseNotice(json: OcdsPackage): Tender | null {
  const rel = json.releases?.[0];
  if (!rel || !rel.id) return null;
  const t = rel.tender ?? {};
  const cpvs: string[] = [];
  for (const it of t.items ?? []) {
    if (it.classification?.id) cpvs.push(String(it.classification.id));
    for (const a of it.additionalClassifications ?? []) if (a.id) cpvs.push(String(a.id));
  }
  const category = categoryFor(cpvs);
  if (!category) return null;
  if (!t.title) return null;

  return {
    noticeId: rel.id,
    title: t.title.slice(0, 400),
    description: (t.description ?? "").slice(0, 2000) || null,
    category,
    cpv: cpvs.slice(0, 8).join(", ") || null,
    buyer: rel.buyer?.name ?? null,
    ort: rel.buyer?.address?.locality ?? null,
    plz: rel.buyer?.address?.postalCode ?? null,
    contactEmail: rel.buyer?.contactPoint?.email ?? null,
    url: `https://oeffentlichevergabe.de/ui/de/search/details?noticeId=${rel.id}`,
    publishedDate: json.publishedDate ?? rel.date ?? null,
    deadline: t.tenderPeriod?.endDate ?? null,
  };
}

/** Importiert alle relevanten Ausschreibungen eines Tages (YYYY-MM-DD). Idempotent. */
export async function importTendersForDay(day: string): Promise<number> {
  if (!tendersEnabled()) return 0;
  const { readZip } = await import("@/lib/zip");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  let entries: { name: string; data: Buffer }[];
  try {
    const res = await fetch(`${EXPORT_URL}?pubDay=${day}&format=ocds.zip`, {
      headers: { Accept: "application/vnd.bekanntmachungsservice.ocds.zip+zip" },
      signal: ctrl.signal,
    });
    if (!res.ok) return 0;
    const buf = Buffer.from(await res.arrayBuffer());
    entries = readZip(buf);
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }

  const rows: Record<string, unknown>[] = [];
  for (const e of entries) {
    if (!e.name.endsWith(".json")) continue;
    let json: OcdsPackage;
    try { json = JSON.parse(e.data.toString("utf8")); } catch { continue; }
    const tnd = parseNotice(json);
    if (!tnd) continue;
    rows.push({
      notice_id: tnd.noticeId, title: tnd.title, description: tnd.description, category: tnd.category,
      cpv: tnd.cpv, buyer: tnd.buyer, ort: tnd.ort, plz: tnd.plz, contact_email: tnd.contactEmail,
      url: tnd.url, published_date: tnd.publishedDate, deadline: tnd.deadline,
    });
  }

  const sb = await admin();
  if (rows.length > 0) {
    await sb.from("tenders").upsert(rows, { onConflict: "notice_id", ignoreDuplicates: true });
  }
  await sb.from("tender_imports").upsert({ day, imported_at: new Date().toISOString(), count: rows.length }, { onConflict: "day" });
  return rows.length;
}

/** Stellt sicher, dass die letzten Tage importiert sind (lazy, idempotent, beschränkt). */
export async function ensureRecentImport(): Promise<void> {
  if (!tendersEnabled()) return;
  try {
    const sb = await admin();
    // Beim allerersten Mal mehr Tage backfillen, danach nur die letzten 3 frisch halten.
    const { count } = await sb.from("tender_imports").select("day", { count: "exact", head: true });
    const window = (count ?? 0) === 0 ? 5 : 3;
    const targets = Array.from({ length: window }, (_, i) => berlinDay(i + 1)); // gestern, vorgestern …
    const { data } = await sb.from("tender_imports").select("day").in("day", targets);
    const done = new Set((data ?? []).map((r) => (r as { day: string }).day));
    for (const day of targets) {
      if (!done.has(day)) await importTendersForDay(day);
    }
  } catch { /* Import-Fehler dürfen die Anzeige nie blockieren */ }
}

export async function listTenders(opts: { category?: string | null; q?: string | null; limit?: number } = {}): Promise<Tender[]> {
  if (!tendersEnabled()) return [];
  const sb = await admin();
  const nowIso = new Date().toISOString();
  let query = sb.from("tenders").select("*").order("published_date", { ascending: false }).limit(opts.limit ?? 200);
  if (opts.category) query = query.eq("category", opts.category);
  // Abgelaufene (Frist vorbei) ausblenden – Frist null bleibt sichtbar.
  query = query.or(`deadline.is.null,deadline.gte.${nowIso}`);
  const { data } = await query;
  let rows = (data ?? []) as Record<string, unknown>[];

  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim().toLowerCase();
    rows = rows.filter((r) =>
      [r.title, r.description, r.ort, r.plz, r.buyer, r.cpv].some((f) => String(f ?? "").toLowerCase().includes(q)),
    );
  }

  return rows.map((r) => ({
    noticeId: r.notice_id as string,
    title: r.title as string,
    description: (r.description as string) ?? null,
    category: r.category as string,
    cpv: (r.cpv as string) ?? null,
    buyer: (r.buyer as string) ?? null,
    ort: (r.ort as string) ?? null,
    plz: (r.plz as string) ?? null,
    contactEmail: (r.contact_email as string) ?? null,
    url: (r.url as string) ?? null,
    publishedDate: (r.published_date as string) ?? null,
    deadline: (r.deadline as string) ?? null,
  }));
}
