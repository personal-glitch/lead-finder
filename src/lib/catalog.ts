// Kostenloser Firmen-Katalog (Branchenbuch): Gewerbe tragen sich gratis ein,
// werden öffentlich gelistet – Kontakt läuft ausschließlich über uns (Lead-Capture).
// Server-seitig, Zugriff über den Service-Role-Client (wie marketplace.ts).
import { config } from "@/lib/config";
import { sendSystemEmail } from "@/lib/email/system";
import { isValidEmail, normEmail, subscribeNewsletter, type SubscriberStatus } from "@/lib/newsletter";
import { CATEGORIES } from "@/lib/marketplace-constants";

export type CompanyStatus = "pending" | "active" | "rejected";

export interface Company {
  id: string;
  createdAt: string;
  slug: string;
  name: string;
  category: string;
  street: string | null;
  plz: string | null;
  ort: string | null;
  region: string | null;
  openingHours: string | null;
  description: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string;   // privat – nie öffentlich rendern (Kontakt nur über Formular)
  contactPhone: string | null; // öffentlich im Profil (11880-Stil)
  logoUrl: string | null;
  status: CompanyStatus;
}

/** Öffentlich anzeigbare Felder (Katalog-Profil). E-Mail bleibt privat. */
export interface PublicCompany {
  slug: string;
  name: string;
  category: string;
  street: string | null;
  plz: string | null;
  ort: string | null;
  region: string | null;
  openingHours: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  createdAt: string;
}

export function catalogEnabled(): boolean {
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

function esc(s: string): string {
  return s.replace(/</g, "&lt;");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60) || "firma";
}

function normWebsite(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v.slice(0, 200);
  return `https://${v}`.slice(0, 200);
}

interface RawCompany {
  id: string; created_at: string; slug: string; name: string; category: string;
  street: string | null; plz: string | null; ort: string | null; region: string | null;
  opening_hours: string | null; description: string | null;
  website: string | null; contact_name: string | null; contact_email: string;
  contact_phone: string | null; logo_url: string | null; status: string;
}

function toCompany(r: RawCompany): Company {
  return {
    id: r.id, createdAt: r.created_at, slug: r.slug, name: r.name, category: r.category,
    street: r.street ?? null, plz: r.plz, ort: r.ort, region: r.region,
    openingHours: r.opening_hours ?? null, description: r.description, website: r.website,
    contactName: r.contact_name, contactEmail: r.contact_email, contactPhone: r.contact_phone,
    logoUrl: r.logo_url,
    status: (r.status === "active" ? "active" : r.status === "rejected" ? "rejected" : "pending"),
  };
}

function toPublic(c: Company): PublicCompany {
  return {
    slug: c.slug, name: c.name, category: c.category, street: c.street, plz: c.plz, ort: c.ort,
    region: c.region, openingHours: c.openingHours, description: c.description, website: c.website,
    phone: c.contactPhone, logoUrl: c.logoUrl, createdAt: c.createdAt,
  };
}

export interface CreateCompanyInput {
  name: string;
  category: string;
  street?: string | null;
  plz?: string | null;
  ort?: string | null;
  region?: string | null;
  openingHours?: string | null;
  description?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  logoUrl?: string | null;
  newsletter?: boolean;
  ip?: string | null;
}

/** Öffentliche Gratis-Registrierung. Eintrag landet als `pending` (Moderation). */
export async function createCompany(
  input: CreateCompanyInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  if (!catalogEnabled()) return { ok: false, error: "Der Katalog ist nicht konfiguriert." };
  if (!input.name.trim()) return { ok: false, error: "Bitte gib den Firmennamen an." };
  if (!isValidEmail(input.contactEmail)) return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse an." };
  const category = (CATEGORIES as readonly string[]).includes(input.category) ? input.category : "Sonstiges";

  const sb = await admin();

  // Eindeutigen Slug erzeugen (Name + ggf. Ort, sonst Zähler-Suffix).
  const base = slugify(input.ort ? `${input.name}-${input.ort}` : input.name);
  let slug = base;
  for (let i = 2; i <= 60; i++) {
    const { data: hit } = await sb.from("companies").select("id").eq("slug", slug).maybeSingle();
    if (!hit) break;
    slug = `${base}-${i}`;
  }

  const nowIso = new Date().toISOString();
  const row = {
    slug,
    name: input.name.trim().slice(0, 140),
    category,
    street: input.street?.trim().slice(0, 160) || null,
    plz: input.plz?.trim() || null,
    ort: input.ort?.trim() || null,
    region: input.region?.trim() || null,
    opening_hours: input.openingHours?.trim().slice(0, 400) || null,
    description: input.description?.trim().slice(0, 2000) || null,
    website: normWebsite(input.website),
    contact_name: input.contactName?.trim().slice(0, 120) || null,
    contact_email: input.contactEmail.trim(),
    contact_phone: input.contactPhone?.trim().slice(0, 40) || null,
    logo_url: input.logoUrl?.trim() || null,
    status: "pending" as const,
    source: "registration",
    consent_at: nowIso,
    consent_ip: input.ip ?? null,
  };
  const { error } = await sb.from("companies").insert(row).select("id").single();
  if (error) return { ok: false, error: "Eintrag konnte nicht gespeichert werden." };

  // Opt-in: in die Mailliste aufnehmen (Double-Opt-In – Bestätigungsmail wird verschickt).
  if (input.newsletter) {
    await subscribeNewsletter({
      email: row.contact_email,
      name: row.contact_name,
      source: "firmen_katalog",
      ip: input.ip ?? null,
    }).catch(() => {});
  }

  // Bestätigung an die Firma (transaktional – selbst angefordert).
  await sendSystemEmail({
    to: row.contact_email,
    subject: "Dein Eintrag im KundenRadar-Verzeichnis ✅ (kostenlos)",
    html: shell(
      `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Danke für deinen Eintrag ✅</p>
       <p style="margin:0 0 14px">Hallo${row.contact_name ? " " + esc(row.contact_name) : ""}, <b>${esc(row.name)}</b> wurde kostenlos für unser Dienstleister-Verzeichnis vorgemerkt (${esc(category)}). Wir prüfen den Eintrag kurz und schalten ihn dann frei – danach bist du über deine eigene Profilseite auffindbar.</p>
       <p style="margin:0 0 14px">Dein öffentliches Profil zeigt Adresse, Telefon, Website &amp; Öffnungszeiten – wie in einem Branchenbuch. Deine <b>E-Mail bleibt privat</b>; Anfragen über das Kontaktformular leiten wir direkt an dich weiter.</p>
       <p style="margin:14px 0 0;font-size:13px;color:#5b6470">Du suchst selbst aktiv neue Kunden? Mit dem KundenRadar-Tool findest du passende Firmen in deiner Region und kannst sie direkt kontaktieren – <a href="${config.appUrl}/check" style="color:#3b6d11;font-weight:600">kostenlos testen</a>.</p>`,
    ),
    text:
      `Hallo${row.contact_name ? " " + row.contact_name : ""},\n\n${row.name} wurde kostenlos für unser Dienstleister-Verzeichnis vorgemerkt (${category}). Wir prüfen den Eintrag und schalten ihn dann frei.\n\nAnfragen leiten wir direkt an dich weiter; deine Kontaktdaten bleiben nicht öffentlich.\n\nKundenRadar-Tool kostenlos testen: ${config.appUrl}/check\n\n—\n${IMPRESSUM}`,
  }).catch(() => {});

  // Interne Benachrichtigung an den Superadmin (Moderation).
  if (config.admin.email) {
    await sendSystemEmail({
      to: config.admin.email,
      subject: `Neuer Katalog-Eintrag: ${row.name} (${category})`,
      html: shell(`<p>Neuer Eintrag wartet auf Freigabe:</p><p><b>${esc(row.name)}</b> · ${esc(category)}<br>${esc(row.plz ?? "")} ${esc(row.ort ?? "")}<br>${esc(row.contact_name ?? "—")} · ${esc(row.contact_email)} · ${esc(row.contact_phone ?? "—")}<br>${row.website ? `<a href="${row.website}">${esc(row.website)}</a>` : "—"}</p><p>${esc(row.description ?? "")}</p><p><a href="${config.appUrl}/admin" style="font-weight:600">→ Im Admin freigeben</a></p>`),
      text: `Neuer Katalog-Eintrag: ${row.name} (${category})\n${row.contact_name ?? "—"} · ${row.contact_email} · ${row.contact_phone ?? "—"}\n${row.website ?? "—"}\n\n${row.description ?? ""}\n\nFreigeben: ${config.appUrl}/admin`,
    }).catch(() => {});
  }

  return { ok: true, slug };
}

/** Öffentliche Liste freigeschalteter Firmen (für Landingpages / Verzeichnis). */
export async function listPublicCompanies(
  opts: { category?: string | null; ort?: string | null; q?: string | null; limit?: number } = {},
): Promise<PublicCompany[]> {
  if (!catalogEnabled()) return [];
  const sb = await admin();
  let query = sb.from("companies").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(opts.limit ?? 200);
  if (opts.category) query = query.eq("category", opts.category);
  const { data } = await query;
  let rows = (data ?? []) as RawCompany[];

  if (opts.ort && opts.ort.trim()) {
    const o = opts.ort.trim().toLowerCase();
    rows = rows.filter((r) => (r.ort ?? "").toLowerCase().includes(o));
  }
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim().toLowerCase();
    rows = rows.filter((r) =>
      [r.name, r.description, r.ort, r.plz, r.category].some((f) => (f ?? "").toLowerCase().includes(q)),
    );
  }
  return rows.map((r) => toPublic(toCompany(r)));
}

function sanitizeQ(q: string): string {
  // Zeichen entfernen, die die PostgREST-or()-Grammatik brechen würden.
  return q.replace(/[,()%*.:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export interface SearchResult {
  items: PublicCompany[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

/** Serverseitige Suche/Filter/Pagination für den öffentlichen Katalog (skaliert auf viele Tausend). */
export async function searchPublicCompanies(opts: {
  q?: string | null;
  category?: string | null;
  ort?: string | null;
  page?: number;
  perPage?: number;
} = {}): Promise<SearchResult> {
  const perPage = Math.min(Math.max(opts.perPage ?? 24, 1), 60);
  const page = Math.max(opts.page ?? 1, 1);
  const empty: SearchResult = { items: [], total: 0, page, perPage, pages: 0 };
  if (!catalogEnabled()) return empty;
  try {
    const sb = await admin();

    let query = sb.from("companies").select("*", { count: "exact" }).eq("status", "active");
    if (opts.category && (CATEGORIES as readonly string[]).includes(opts.category)) query = query.eq("category", opts.category);
    if (opts.ort && opts.ort.trim()) query = query.ilike("ort", `%${opts.ort.trim().slice(0, 60)}%`);
    const q = opts.q ? sanitizeQ(opts.q) : "";
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,ort.ilike.%${q}%,category.ilike.%${q}%,street.ilike.%${q}%`);

    const from = (page - 1) * perPage;
    query = query.order("created_at", { ascending: false }).range(from, from + perPage - 1);

    const { data, count, error } = await query;
    if (error) return empty;
    const total = count ?? 0;
    return {
      items: ((data ?? []) as RawCompany[]).map((r) => toPublic(toCompany(r))),
      total,
      page,
      perPage,
      pages: Math.max(1, Math.ceil(total / perPage)),
    };
  } catch {
    return empty;
  }
}

/** Eine freigeschaltete Firma per Slug (für die Profilseite). */
export async function getPublicCompany(slug: string): Promise<PublicCompany | null> {
  if (!catalogEnabled()) return null;
  const sb = await admin();
  const { data } = await sb.from("companies").select("*").eq("slug", slug).eq("status", "active").maybeSingle();
  if (!data) return null;
  return toPublic(toCompany(data as RawCompany));
}

/** Slugs aller aktiven Firmen (für die Sitemap). */
export async function listActiveCompanySlugs(): Promise<string[]> {
  if (!catalogEnabled()) return [];
  const sb = await admin();
  const { data } = await sb.from("companies").select("slug").eq("status", "active").limit(5000);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export async function countActiveCompanies(): Promise<number> {
  if (!catalogEnabled()) return 0;
  const sb = await admin();
  const { count } = await sb.from("companies").select("id", { count: "exact", head: true }).eq("status", "active");
  return count ?? 0;
}

/** Anzahl aktiver Firmen je Branche (für Branchen-Kacheln). */
export async function countActiveByCategory(): Promise<Record<string, number>> {
  if (!catalogEnabled()) return {};
  try {
    const sb = await admin();
    const { data } = await sb.from("companies").select("category").eq("status", "active").limit(5000);
    const m: Record<string, number> = {};
    for (const r of (data ?? []) as { category: string }[]) m[r.category] = (m[r.category] ?? 0) + 1;
    return m;
  } catch {
    return {};
  }
}

// --- Admin / Moderation ------------------------------------------------------

/** Firma inkl. Maillisten-Status (für die Superadmin-Übersicht). */
export interface AdminCompany extends Company {
  subscriber: SubscriberStatus | null; // Status in der Newsletter-Liste (oder null = nicht eingetragen)
}

export async function listCompaniesAdmin(status?: CompanyStatus): Promise<AdminCompany[]> {
  if (!catalogEnabled()) return [];
  const sb = await admin();
  let query = sb.from("companies").select("*").order("created_at", { ascending: false }).limit(500);
  if (status) query = query.eq("status", status);
  const { data } = await query;
  const companies = ((data ?? []) as RawCompany[]).map(toCompany);

  // Maillisten-Status je Firma (per normalisierter E-Mail) nachladen.
  const emails = Array.from(new Set(companies.map((c) => normEmail(c.contactEmail))));
  const subMap = new Map<string, SubscriberStatus>();
  if (emails.length > 0) {
    const { data: subs } = await sb.from("newsletter_subscribers").select("email_norm, status").in("email_norm", emails);
    for (const s of (subs ?? []) as { email_norm: string; status: SubscriberStatus }[]) {
      subMap.set(s.email_norm, s.status);
    }
  }
  return companies.map((c) => ({ ...c, subscriber: subMap.get(normEmail(c.contactEmail)) ?? null }));
}

export async function setCompanyStatus(id: string, status: CompanyStatus): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!catalogEnabled()) return { ok: false, error: "Katalog nicht konfiguriert." };
  const sb = await admin();
  const { data, error } = await sb
    .from("companies")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return { ok: false, error: "Status konnte nicht geändert werden." };

  // Bei Freigabe: Firma benachrichtigen + Profil-Link senden.
  if (status === "active") {
    const c = toCompany(data as RawCompany);
    await sendSystemEmail({
      to: c.contactEmail,
      subject: "Dein Verzeichnis-Eintrag ist jetzt online ✅",
      html: shell(
        `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Du bist online ✅</p>
         <p style="margin:0 0 14px">Hallo${c.contactName ? " " + esc(c.contactName) : ""}, <b>${esc(c.name)}</b> ist jetzt im KundenRadar-Verzeichnis gelistet. Deine Profilseite:</p>
         <p style="margin:0 0 14px"><a href="${config.appUrl}/firma/${c.slug}" style="color:#3b6d11;font-weight:600">${config.appUrl}/firma/${c.slug}</a></p>
         <p style="margin:0;font-size:13px;color:#5b6470">Interessenten-Anfragen leiten wir direkt an dich weiter.</p>`,
      ),
      text: `Hallo${c.contactName ? " " + c.contactName : ""},\n\n${c.name} ist jetzt im KundenRadar-Verzeichnis gelistet:\n${config.appUrl}/firma/${c.slug}\n\n—\n${IMPRESSUM}`,
    }).catch(() => {});
  }
  return { ok: true };
}

// --- Kontakt "nur über uns" --------------------------------------------------

export interface CreateContactInput {
  slug: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  ip?: string | null;
}

/** Interessent kontaktiert eine Firma – läuft über uns (Lead-Capture + Weiterleitung). */
export async function createCompanyContact(
  input: CreateContactInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!catalogEnabled()) return { ok: false, error: "Katalog nicht konfiguriert." };
  if (!isValidEmail(input.email)) return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse an." };
  if (input.message.trim().length < 5) return { ok: false, error: "Bitte beschreibe kurz dein Anliegen." };

  const sb = await admin();
  const { data: comp } = await sb.from("companies").select("*").eq("slug", input.slug).eq("status", "active").maybeSingle();
  if (!comp) return { ok: false, error: "Anbieter nicht gefunden." };
  const company = toCompany(comp as RawCompany);

  const nowIso = new Date().toISOString();
  const message = input.message.trim().slice(0, 4000);
  const name = input.name.trim().slice(0, 120);
  const email = input.email.trim();
  const phone = input.phone?.trim().slice(0, 40) || null;

  const { error } = await sb.from("company_contacts").insert({
    company_id: company.id,
    name, email, phone, message,
    status: "neu",
    consent_at: nowIso,
    consent_ip: input.ip ?? null,
  });
  if (error) return { ok: false, error: "Anfrage konnte nicht gespeichert werden." };

  // Lead läuft ÜBER UNS: Benachrichtigung an den Superadmin (nicht an die Firma).
  // Du verteilst die Anfrage selbst im Admin (mit „An Firma weiterleiten").
  if (config.admin.email) {
    await sendSystemEmail({
      to: config.admin.email,
      subject: `Neuer Katalog-Lead: ${company.name} (${company.category})`,
      html: shell(
        `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Neuer Lead 🎯</p>
         <p style="margin:0 0 12px">Anfrage über das Profil von <b>${esc(company.name)}</b> (${esc(company.category)}${company.ort ? " · " + esc(company.ort) : ""}):</p>
         <div style="background:#f4f6f8;border-radius:8px;padding:12px 14px;font-size:14px;white-space:pre-wrap">${esc(message)}</div>
         <p style="margin:14px 0 0"><b>Interessent:</b> ${esc(name)} · <a href="mailto:${esc(email)}" style="color:#3b6d11;font-weight:600">${esc(email)}</a>${phone ? " · " + esc(phone) : ""}</p>
         <p style="margin:8px 0 0"><b>Firma (privat):</b> ${esc(company.contactEmail)}${company.contactPhone ? " · " + esc(company.contactPhone) : ""}</p>
         <p style="margin:14px 0 0;font-size:13px;color:#5b6470">Im <a href="${config.appUrl}/admin" style="color:#3b6d11;font-weight:600">Admin</a> kannst du den Lead an die Firma weiterleiten oder selbst bearbeiten.</p>`,
      ),
      text:
        `Neuer Katalog-Lead für ${company.name} (${company.category}):\n\n${message}\n\nInteressent: ${name} · ${email}${phone ? " · " + phone : ""}\nFirma (privat): ${company.contactEmail}${company.contactPhone ? " · " + company.contactPhone : ""}\n\nAdmin: ${config.appUrl}/admin`,
      headers: { "Reply-To": email },
    }).catch(() => {});
  }

  // Bestätigung an den Interessenten (neutral – wir verteilen den Lead selbst).
  await sendSystemEmail({
    to: email,
    subject: `Deine Anfrage ist eingegangen ✅ – KundenRadar`,
    html: shell(
      `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Anfrage eingegangen ✅</p>
       <p style="margin:0 0 14px">Hallo ${esc(name)}, wir haben deine Anfrage zu <b>${esc(company.name)}</b> erhalten und leiten sie an den passenden Anbieter weiter. Du bekommst in der Regel innerhalb von 1–2 Werktagen eine Rückmeldung.</p>
       <div style="background:#f4f6f8;border-radius:8px;padding:12px 14px;font-size:14px;white-space:pre-wrap">${esc(message)}</div>
       <p style="margin:14px 0 0;font-size:13px;color:#5b6470">Tipp: Über unsere <a href="${config.appUrl}/dienstleister-finden" style="color:#3b6d11;font-weight:600">Auftragsbörse</a> kannst du auch mehrere Angebote auf einmal einholen.</p>`,
    ),
    text:
      `Hallo ${name},\n\nwir haben deine Anfrage zu ${company.name} erhalten und leiten sie an den passenden Anbieter weiter. Rückmeldung meist in 1–2 Werktagen.\n\nDeine Nachricht:\n${message}\n\n—\n${IMPRESSUM}`,
  }).catch(() => {});

  return { ok: true };
}

// --- Lead-Verwaltung (Admin verteilt selbst) ---------------------------------

export type LeadStatus = "neu" | "weitergeleitet" | "geschlossen";

export interface AdminLead {
  id: string;
  createdAt: string;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyCategory: string;
  companyEmail: string;   // privat – zum Weiterleiten
  companyPhone: string | null;
}

interface RawContact {
  id: string; created_at: string; status: string; name: string; email: string;
  phone: string | null; message: string; company_id: string;
}

export async function listLeadsAdmin(status?: LeadStatus): Promise<AdminLead[]> {
  if (!catalogEnabled()) return [];
  const sb = await admin();
  let q = sb.from("company_contacts").select("*").order("created_at", { ascending: false }).limit(500);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as RawContact[];
  if (rows.length === 0) return [];

  const ids = Array.from(new Set(rows.map((r) => r.company_id)));
  const { data: comps } = await sb.from("companies").select("*").in("id", ids);
  const cmap = new Map<string, Company>();
  for (const c of (comps ?? []) as RawCompany[]) cmap.set(c.id, toCompany(c));

  return rows.map((r) => {
    const c = cmap.get(r.company_id);
    return {
      id: r.id, createdAt: r.created_at,
      status: (r.status === "weitergeleitet" ? "weitergeleitet" : r.status === "geschlossen" ? "geschlossen" : "neu"),
      name: r.name, email: r.email, phone: r.phone, message: r.message,
      companyId: r.company_id,
      companyName: c?.name ?? "—", companySlug: c?.slug ?? "", companyCategory: c?.category ?? "—",
      companyEmail: c?.contactEmail ?? "", companyPhone: c?.contactPhone ?? null,
    };
  });
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!catalogEnabled()) return { ok: false, error: "Katalog nicht konfiguriert." };
  const sb = await admin();
  const { error } = await sb.from("company_contacts").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "Status konnte nicht geändert werden." };
  return { ok: true };
}

/** Lead an die Firma weiterleiten (du entscheidest wann) + auf „weitergeleitet" setzen. */
export async function forwardLead(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!catalogEnabled()) return { ok: false, error: "Katalog nicht konfiguriert." };
  const sb = await admin();
  const { data: row } = await sb.from("company_contacts").select("*").eq("id", id).maybeSingle();
  if (!row) return { ok: false, error: "Lead nicht gefunden." };
  const r = row as RawContact;
  const { data: comp } = await sb.from("companies").select("*").eq("id", r.company_id).maybeSingle();
  if (!comp) return { ok: false, error: "Firma nicht gefunden." };
  const company = toCompany(comp as RawCompany);
  const phone = r.phone ? esc(r.phone) : null;

  await sendSystemEmail({
    to: company.contactEmail,
    subject: `Neue Kundenanfrage über KundenRadar – ${company.name}`,
    html: shell(
      `<p style="margin:0 0 6px;font-size:18px;font-weight:700">Neue Anfrage 🎉</p>
       <p style="margin:0 0 14px">Über dein Profil bei KundenRadar hat dich ein Interessent kontaktiert:</p>
       <div style="background:#f4f6f8;border-radius:8px;padding:12px 14px;font-size:14px;white-space:pre-wrap">${esc(r.message)}</div>
       <p style="margin:14px 0 0"><b>Kontakt:</b> ${esc(r.name)} · <a href="mailto:${esc(r.email)}" style="color:#3b6d11;font-weight:600">${esc(r.email)}</a>${phone ? " · " + phone : ""}</p>
       <p style="margin:14px 0 0;font-size:13px;color:#5b6470">Antworte einfach direkt auf diese E-Mail – sie geht an den Interessenten.</p>`,
    ),
    text:
      `Neue Anfrage über KundenRadar für ${company.name}:\n\n${r.message}\n\nKontakt: ${r.name} · ${r.email}${r.phone ? " · " + r.phone : ""}\n\nAntworte direkt an: ${r.email}\n\n—\n${IMPRESSUM}`,
    headers: { "Reply-To": r.email },
  }).catch(() => {});

  await sb.from("company_contacts").update({ status: "weitergeleitet" }).eq("id", id);
  return { ok: true };
}
