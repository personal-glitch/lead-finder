// Auftragsbörse: öffentliche Dienstleistungs-Anfragen + Angebote der Tool-Nutzer.
// Server-seitig, Zugriff über den Service-Role-Client (wie der Newsletter).
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";
import { isValidEmail } from "@/lib/newsletter";
import { CATEGORIES, type CustomerType, type RequestStatus } from "@/lib/marketplace-constants";

export { CATEGORIES };
export type { CustomerType, RequestStatus };

export interface ServiceRequest {
  id: string;
  createdAt: string;
  category: string;
  title: string;
  description: string;
  plz: string | null;
  ort: string | null;
  customerType: CustomerType;
  budget: string | null;
  name: string;
  email: string;
  phone: string | null;
  status: RequestStatus;
  source: string;
}

export interface RequestWithMeta extends ServiceRequest {
  offerCount: number;
  hasOffered: boolean;
}

export function marketplaceEnabled(): boolean {
  return config.supabase.enabled && Boolean(config.supabase.serviceRoleKey);
}

async function admin() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

const IMPRESSUM = config.resend.impressum ?? "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln";

function shell(inner: string): string {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f4f6f8;padding:16px">
<div style="font-family:system-ui,Arial,sans-serif;color:#16181d;line-height:1.6;max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e3e7ec">
  <div style="background:#16181d;padding:16px 22px"><span style="font-size:18px;font-weight:700;color:#ffffff">Kunden<span style="color:#a8e83a">Radar</span></span></div>
  <div style="padding:24px 22px">${inner}
    <hr style="border:none;border-top:1px solid #e3e7ec;margin:22px 0">
    <p style="margin:0;font-size:12px;color:#5b6470">${IMPRESSUM}</p>
  </div>
</div></body></html>`;
}

export interface CreateRequestInput {
  category: string;
  title: string;
  description: string;
  plz?: string | null;
  ort?: string | null;
  customerType: CustomerType;
  budget?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  ip?: string | null;
}

export async function createServiceRequest(input: CreateRequestInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!marketplaceEnabled()) return { ok: false, error: "Auftragsbörse ist nicht konfiguriert." };
  if (!isValidEmail(input.email)) return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse an." };
  if (!input.title.trim() || !input.description.trim()) return { ok: false, error: "Bitte Titel und Beschreibung ausfüllen." };
  const category = (CATEGORIES as readonly string[]).includes(input.category) ? input.category : "Sonstiges";

  const sb = await admin();
  const nowIso = new Date().toISOString();
  const row = {
    category,
    title: input.title.trim().slice(0, 160),
    description: input.description.trim().slice(0, 4000),
    plz: input.plz?.trim() || null,
    ort: input.ort?.trim() || null,
    customer_type: input.customerType === "gewerblich" ? "gewerblich" : "privat",
    budget: input.budget?.trim() || null,
    name: input.name.trim().slice(0, 120),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    status: "offen" as const,
    source: "formular",
    consent_at: nowIso,
    consent_ip: input.ip ?? null,
  };
  const { data, error } = await sb.from("service_requests").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: "Anfrage konnte nicht gespeichert werden." };

  // Bestätigung an den Anfragenden (transaktional – selbst angefordert).
  await sendSystemEmail({
    to: row.email,
    subject: "Deine Anfrage ist eingegangen ✅ – KundenRadar",
    html: shell(
      `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Anfrage eingegangen ✅</p>
       <p style="margin:0 0 14px">Hallo ${row.name}, danke für deine Anfrage „<b>${row.title}</b>" (${category}). Passende Dienstleister aus unserem Netzwerk können dir jetzt Angebote senden – diese erreichen dich direkt per E-Mail.</p>
       <div style="background:#f4f6f8;border-radius:8px;padding:12px 14px;font-size:14px"><b>Deine Anfrage:</b><br>${row.description.replace(/</g, "&lt;").slice(0, 600)}</div>
       <p style="margin:14px 0 0;font-size:13px;color:#5b6470">Du musst nichts weiter tun. Antworten kommen direkt von den Anbietern.</p>`,
    ),
    text:
      `Hallo ${row.name},\n\ndeine Anfrage „${row.title}" (${category}) ist eingegangen. Passende Dienstleister können dir jetzt Angebote per E-Mail senden.\n\nDeine Anfrage:\n${row.description.slice(0, 600)}\n\n—\n${IMPRESSUM}`,
  }).catch(() => {});

  // Interne Benachrichtigung an das Kontakt-Postfach.
  if (config.admin.notifyEmail) {
    await sendSystemEmail({
      to: config.admin.notifyEmail,
      subject: `Neue Auftragsanfrage: ${row.title} (${category})`,
      html: shell(`<p>Neue Anfrage über die Auftragsbörse:</p><p><b>${row.title}</b> · ${category} · ${row.customer_type}<br>${row.plz ?? ""} ${row.ort ?? ""}<br>${row.name} · ${row.email} · ${row.phone ?? "—"}</p><p>${row.description.replace(/</g, "&lt;").slice(0, 800)}</p>`),
      text: `Neue Anfrage: ${row.title} (${category}, ${row.customer_type})\n${row.name} · ${row.email} · ${row.phone ?? "—"}\n${row.plz ?? ""} ${row.ort ?? ""}\n\n${row.description.slice(0, 800)}`,
    }).catch(() => {});
  }

  return { ok: true, id: data.id as string };
}

interface RawRequest {
  id: string; created_at: string; category: string; title: string; description: string;
  plz: string | null; ort: string | null; customer_type: string; budget: string | null;
  name: string; email: string; phone: string | null; status: string; source: string;
}

function toRequest(r: RawRequest): ServiceRequest {
  return {
    id: r.id, createdAt: r.created_at, category: r.category, title: r.title, description: r.description,
    plz: r.plz, ort: r.ort, customerType: (r.customer_type === "gewerblich" ? "gewerblich" : "privat"),
    budget: r.budget, name: r.name, email: r.email, phone: r.phone,
    status: (r.status === "geschlossen" ? "geschlossen" : "offen"), source: r.source,
  };
}

/** Offene Anfragen für die In-Tool-Inbox (alle eingeloggten Nutzer). */
export async function listOpenRequests(
  ownerId: string,
  opts: { category?: string | null; q?: string | null; limit?: number } = {},
): Promise<RequestWithMeta[]> {
  if (!marketplaceEnabled()) return [];
  const sb = await admin();
  let query = sb.from("service_requests").select("*").eq("status", "offen").order("created_at", { ascending: false }).limit(opts.limit ?? 200);
  if (opts.category) query = query.eq("category", opts.category);
  const { data } = await query;
  let rows = (data ?? []) as RawRequest[];

  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim().toLowerCase();
    rows = rows.filter((r) =>
      [r.title, r.description, r.ort, r.plz, r.category].some((f) => (f ?? "").toLowerCase().includes(q)),
    );
  }

  const ids = rows.map((r) => r.id);
  const counts = new Map<string, number>();
  const mine = new Set<string>();
  if (ids.length > 0) {
    const { data: offers } = await sb.from("service_request_offers").select("request_id, owner_id").in("request_id", ids);
    for (const o of (offers ?? []) as { request_id: string; owner_id: string }[]) {
      counts.set(o.request_id, (counts.get(o.request_id) ?? 0) + 1);
      if (o.owner_id === ownerId) mine.add(o.request_id);
    }
  }

  return rows.map((r) => ({ ...toRequest(r), offerCount: counts.get(r.id) ?? 0, hasOffered: mine.has(r.id) }));
}

export async function countOpenRequests(): Promise<number> {
  if (!marketplaceEnabled()) return 0;
  const sb = await admin();
  const { count } = await sb.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "offen");
  return count ?? 0;
}

export interface CreateOfferInput {
  requestId: string;
  ownerId: string;
  contactEmail: string;
  message: string;
}

/** Ein Tool-Nutzer sendet ein Angebot auf eine Anfrage. Mailt den Anfragenden an. */
export async function createOffer(input: CreateOfferInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!marketplaceEnabled()) return { ok: false, error: "Auftragsbörse ist nicht konfiguriert." };
  const message = input.message.trim();
  if (message.length < 5) return { ok: false, error: "Bitte schreibe eine kurze Nachricht an den Interessenten." };

  const sb = await admin();
  const { data: reqRow } = await sb.from("service_requests").select("*").eq("id", input.requestId).maybeSingle();
  if (!reqRow) return { ok: false, error: "Anfrage nicht gefunden." };
  const request = toRequest(reqRow as RawRequest);
  if (request.status !== "offen") return { ok: false, error: "Diese Anfrage ist bereits geschlossen." };

  const { error } = await sb.from("service_request_offers").insert({
    request_id: input.requestId,
    owner_id: input.ownerId,
    message: message.slice(0, 2000),
    contact_email: input.contactEmail,
  });
  // Unique-Verstoß = es wurde bereits ein Angebot gesendet.
  if (error) {
    if ((error as { code?: string }).code === "23505") return { ok: false, error: "Du hast auf diese Anfrage bereits ein Angebot gesendet." };
    return { ok: false, error: "Angebot konnte nicht gespeichert werden." };
  }

  await sendSystemEmail({
    to: request.email,
    subject: `Neues Angebot zu deiner Anfrage „${request.title}"`,
    html: shell(
      `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Du hast ein Angebot erhalten 🎉</p>
       <p style="margin:0 0 14px">Hallo ${request.name}, ein Anbieter hat auf deine Anfrage „<b>${request.title}</b>" reagiert:</p>
       <div style="background:#f4f6f8;border-radius:8px;padding:12px 14px;font-size:14px;white-space:pre-wrap">${message.replace(/</g, "&lt;")}</div>
       <p style="margin:14px 0 0">Antworte einfach direkt an: <a href="mailto:${input.contactEmail}" style="color:#3b6d11;font-weight:600">${input.contactEmail}</a></p>`,
    ),
    text:
      `Hallo ${request.name},\n\nein Anbieter hat auf deine Anfrage „${request.title}" reagiert:\n\n${message}\n\nAntworte direkt an: ${input.contactEmail}\n\n—\n${IMPRESSUM}`,
    headers: { "Reply-To": input.contactEmail },
  }).catch(() => {});

  return { ok: true };
}
