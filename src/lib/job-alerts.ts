// Tägliche Stellen-Alerts für die Persona „Personalvermittlung".
// Speichert gespeicherte Suchen pro Nutzer und meldet beim täglichen Cron-Lauf
// NEU hinzugekommene Firmen mit offenen Stellen per E-Mail. Datenquelle:
// ausschließlich die offizielle Jobsuche-API der Bundesagentur für Arbeit.
import "server-only";
import { config } from "@/lib/config";
import { isStaffingAgency } from "@/lib/leadgen/staffing";
import { sendSystemEmail, systemMailAvailable } from "@/lib/email/system";

const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs";

export interface JobAlert {
  id: string;
  was: string | null;
  wo: string | null;
  umkreis: number;
  onlyDirect: boolean;
  active: boolean;
  createdAt: string;
}

interface AlertRow {
  id: string; owner_id: string; email: string; was: string | null; wo: string | null;
  umkreis: number; only_direct: boolean; seen_refnrs: string[] | null; active: boolean;
  last_run_at: string | null; created_at: string;
}

async function admin() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

function rowToAlert(r: AlertRow): JobAlert {
  return { id: r.id, was: r.was, wo: r.wo, umkreis: r.umkreis, onlyDirect: r.only_direct, active: r.active, createdAt: r.created_at };
}

export async function listJobAlerts(ownerId: string): Promise<JobAlert[]> {
  if (!config.supabase.enabled) return [];
  const sb = await admin();
  const { data } = await sb.from("job_alerts").select("*").eq("owner_id", ownerId).order("created_at", { ascending: false });
  return ((data as AlertRow[] | null) ?? []).map(rowToAlert);
}

export async function createJobAlert(
  ownerId: string, email: string,
  input: { was?: string | null; wo?: string | null; umkreis?: number; onlyDirect?: boolean },
): Promise<JobAlert> {
  const sb = await admin();
  const row = {
    owner_id: ownerId, email,
    was: input.was?.trim() || null, wo: input.wo?.trim() || null,
    umkreis: input.umkreis ?? 25, only_direct: input.onlyDirect ?? true,
    seen_refnrs: [], active: true,
  };
  const { data, error } = await sb.from("job_alerts").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return rowToAlert(data as AlertRow);
}

export async function deleteJobAlert(ownerId: string, id: string): Promise<void> {
  const sb = await admin();
  await sb.from("job_alerts").delete().eq("owner_id", ownerId).eq("id", id);
}

interface RawJob { refnr: string | null; titel?: string; beruf?: string; arbeitgeber?: string | null; arbeitsort?: { plz?: string; ort?: string }; aktuelleVeroeffentlichungsdatum?: string }

async function fetchJobs(a: AlertRow): Promise<{ refnr: string; company: string; title: string; ort: string }[]> {
  const key = process.env.ARBEITSAGENTUR_API_KEY?.trim() || "jobboerse-jobsuche";
  const url = new URL(BASE);
  if (a.was) url.searchParams.set("was", a.was);
  if (a.wo) url.searchParams.set("wo", a.wo);
  if (a.umkreis != null) url.searchParams.set("umkreis", String(a.umkreis));
  url.searchParams.set("size", "50");
  url.searchParams.set("page", "1");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  let res: Response;
  try {
    res = await fetch(url.toString(), { headers: { "X-API-Key": key, accept: "application/json" }, signal: ctrl.signal });
  } finally { clearTimeout(timer); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const raw: RawJob[] = data?.stellenangebote ?? [];
  return raw
    .filter((j) => j.refnr && j.arbeitgeber)
    .map((j) => ({ refnr: j.refnr!, company: j.arbeitgeber!, title: j.titel ?? j.beruf ?? "Stelle", ort: j.arbeitsort?.ort ?? "" }));
}

/** Cron: alle aktiven Alerts prüfen und neue Firmen per E-Mail melden. */
export async function runDueJobAlerts(): Promise<number> {
  if (!config.supabase.enabled) return 0;
  if (!(await systemMailAvailable())) return 0;
  const sb = await admin();
  const { data } = await sb.from("job_alerts").select("*").eq("active", true);
  const alerts = (data as AlertRow[] | null) ?? [];
  let sent = 0;
  for (const a of alerts) {
    try {
      const jobs = await fetchJobs(a);
      const direct = a.only_direct ? jobs.filter((j) => !isStaffingAgency(j.company)) : jobs;
      const seen = new Set(a.seen_refnrs ?? []);
      const fresh = direct.filter((j) => !seen.has(j.refnr));
      // Beim allerersten Lauf nur den Stand merken, nicht spammen.
      const firstRun = (a.seen_refnrs ?? []).length === 0;
      const allRefnrs = [...new Set([...(a.seen_refnrs ?? []), ...jobs.map((j) => j.refnr)])].slice(-800);
      if (!firstRun && fresh.length > 0) {
        await sendAlertEmail(a, fresh);
        sent++;
      }
      await sb.from("job_alerts").update({ seen_refnrs: allRefnrs, last_run_at: new Date().toISOString() }).eq("id", a.id);
    } catch (e) {
      console.error("[job-alerts] Alert", a.id, "fehlgeschlagen:", e);
    }
  }
  return sent;
}

async function sendAlertEmail(a: AlertRow, fresh: { company: string; title: string; ort: string }[]) {
  // Pro Firma nur einmal listen.
  const seenCompany = new Set<string>();
  const firms = fresh.filter((j) => { const k = j.company.toLowerCase(); if (seenCompany.has(k)) return false; seenCompany.add(k); return true; });
  const label = [a.was, a.wo].filter(Boolean).join(" · ") || "deine Suche";
  const appUrl = config.appUrl;
  const rows = firms.slice(0, 30).map((f) => `<li style="margin:4px 0"><b>${esc(f.company)}</b>${f.ort ? ` – ${esc(f.ort)}` : ""}<br><span style="color:#666;font-size:13px">${esc(f.title)}</span></li>`).join("");
  const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px">
    <p>Guten Tag,</p>
    <p>für deinen Stellen-Alarm <b>${esc(label)}</b> gibt es <b>${firms.length} neue Firma${firms.length === 1 ? "" : "en"}</b> mit offenen Stellen:</p>
    <ul style="padding-left:18px">${rows}</ul>
    <p><a href="${appUrl}/stellen" style="display:inline-block;background:#a8e83a;color:#0a0a0a;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">In KundenRadar öffnen</a></p>
    <p style="color:#888;font-size:12px">Quelle: offizielle Jobsuche-API der Bundesagentur für Arbeit. Du erhältst diese Mail, weil du einen täglichen Stellen-Alarm angelegt hast.</p>
  </div>`;
  const text = `Neue Firmen für ${label}:\n\n` + firms.slice(0, 30).map((f) => `- ${f.company}${f.ort ? ` (${f.ort})` : ""}: ${f.title}`).join("\n") + `\n\n${appUrl}/stellen`;
  await sendSystemEmail({
    to: a.email,
    subject: `${firms.length} neue Firma${firms.length === 1 ? "" : "en"} mit offenen Stellen – ${label}`,
    html, text, fromName: "Team Seciora Solutions · KundenRadar",
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] ?? c));
}
