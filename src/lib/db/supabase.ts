// Supabase-Adapter (aktiv, sobald NEXT_PUBLIC_SUPABASE_URL + Key gesetzt sind).
// Server-seitig wird – falls vorhanden – der Service-Role-Key genutzt; mit echter
// Auth sollte owner_id = auth.uid() gesetzt und der Anon-Key + RLS verwendet werden.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";
import { dedupeKey } from "@/lib/dedupe";
import { AppError } from "@/lib/errors";
import type {
  Activity,
  Agent,
  AgentInput,
  EmailLogEntry,
  EmailTemplate,
  Lead,
  LeadInput,
  PipelineStage,
  Settings,
  Suppression,
  Task,
  TaskInput,
} from "@/lib/types";
import type { DataStore } from "./types";
import { DEFAULT_STAGES } from "./local";

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    const key = config.supabase.serviceRoleKey ?? config.supabase.anonKey;
    if (!config.supabase.url || !key) {
      throw new AppError("not_configured", "Supabase ist nicht konfiguriert.");
    }
    client = createClient(config.supabase.url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function fail(context: string, error: { message: string } | null): never {
  throw new AppError("upstream", `${context}: ${error?.message ?? "unbekannt"}`);
}

// ── Mapping snake_case ⇄ Domäne ─────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToSettings(r: any): Settings {
  return {
    callGoal: r?.call_goal ?? null,
    senderImpressum: r?.sender_impressum ?? null,
    workspaceType: r?.workspace_type ?? null,
    senderSignature: r?.sender_signature ?? null,
    plan: r?.plan ?? null,
    senderName: r?.sender_name ?? null,
    senderEmail: r?.sender_email ?? null,
    smtpHost: r?.smtp_host ?? null,
    smtpPort: r?.smtp_port ?? null,
    smtpUser: r?.smtp_user ?? null,
    smtpPass: r?.smtp_pass ?? null,
    stripeCustomerId: r?.stripe_customer_id ?? null,
    subscriptionStatus: r?.subscription_status ?? null,
    subscriptionRenewsAt: r?.subscription_renews_at ?? null,
    cancelAtPeriodEnd: r?.cancel_at_period_end ?? null,
    subscriptionAmount: r?.subscription_amount ?? null,
  };
}
function toLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name ?? null,
    objektTyp: r.objekt_typ ?? null,
    strasse: r.strasse ?? null,
    plz: r.plz ?? null,
    ort: r.ort ?? null,
    lat: r.lat ?? null,
    lon: r.lon ?? null,
    phone: r.phone ?? null,
    phoneE164: r.phone_e164 ?? null,
    email: r.email ?? null,
    ansprechpartner: r.ansprechpartner ?? null,
    website: r.website ?? null,
    openingHours: r.opening_hours ?? null,
    source: r.source,
    enrichmentSource: r.enrichment_source ?? null,
    enrichedAt: r.enriched_at ?? null,
    enrichmentExtra: r.enrichment_extra ?? null,
    osmId: r.osm_id ?? null,
    notes: r.notes ?? null,
    value: r.value ?? null,
    status: (r.status ?? "offen") as Lead["status"],
    stageId: r.stage_id ?? null,
    ownerId: r.owner_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function leadInputToRow(ownerId: string, input: LeadInput, stageId: string | null) {
  return {
    owner_id: ownerId,
    name: input.name,
    objekt_typ: input.objektTyp,
    strasse: input.strasse,
    plz: input.plz,
    ort: input.ort,
    lat: input.lat,
    lon: input.lon,
    phone: input.phone,
    phone_e164: input.phoneE164,
    email: input.email,
    ansprechpartner: input.ansprechpartner,
    website: input.website,
    opening_hours: input.openingHours,
    source: input.source,
    enrichment_source: input.enrichmentSource,
    enriched_at: input.enrichedAt,
    enrichment_extra: input.enrichmentExtra ?? null,
    osm_id: input.osmId,
    stage_id: stageId,
    dedupe_key: dedupeKey(input),
  };
}

const LEAD_PATCH_COLS: Record<string, string> = {
  name: "name",
  objektTyp: "objekt_typ",
  strasse: "strasse",
  plz: "plz",
  ort: "ort",
  lat: "lat",
  lon: "lon",
  phone: "phone",
  phoneE164: "phone_e164",
  email: "email",
  ansprechpartner: "ansprechpartner",
  website: "website",
  openingHours: "opening_hours",
  enrichmentSource: "enrichment_source",
  enrichedAt: "enriched_at",
  enrichmentExtra: "enrichment_extra",
  notes: "notes",
  value: "value",
  status: "status",
  stageId: "stage_id",
};

function toStage(r: any): PipelineStage {
  return { id: r.id, name: r.name, position: r.position, ownerId: r.owner_id };
}
function toTemplate(r: any): EmailTemplate {
  return { id: r.id, name: r.name, subject: r.subject, body: r.body, ownerId: r.owner_id };
}
function toEmailLog(r: any): EmailLogEntry {
  return {
    id: r.id,
    leadId: r.lead_id,
    templateId: r.template_id ?? null,
    to: r.to_email ?? null,
    subject: r.subject ?? null,
    status: r.status,
    error: r.error ?? null,
    sentAt: r.sent_at ?? null,
    ownerId: r.owner_id,
  };
}
function toSuppression(r: any): Suppression {
  return {
    id: r.id,
    email: r.email,
    reason: r.reason ?? null,
    ownerId: r.owner_id,
    createdAt: r.created_at,
  };
}
function toAgent(r: any): Agent {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    icon: r.icon,
    color: r.color,
    objektTypen: r.objekt_typen ?? [],
    keywords: r.keywords ?? [],
    branche: r.branche ?? null,
    plz: r.plz,
    radiusKm: r.radius_km,
    ownerId: r.owner_id,
    lastRunAt: r.last_run_at ?? null,
    lastMatchCount: r.last_match_count ?? 0,
    leadsCreated: r.leads_created ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function toActivity(r: any): Activity {
  return {
    id: r.id,
    ownerId: r.owner_id,
    leadId: r.lead_id ?? null,
    type: r.type,
    summary: r.summary,
    meta: r.meta ?? null,
    createdAt: r.created_at,
  };
}
function toTask(r: any): Task {
  return {
    id: r.id,
    ownerId: r.owner_id,
    leadId: r.lead_id ?? null,
    title: r.title,
    type: r.type,
    dueAt: r.due_at ?? null,
    done: r.done,
    doneAt: r.done_at ?? null,
    createdAt: r.created_at,
  };
}
function agentInputToRow(ownerId: string, input: Partial<AgentInput>) {
  const row: Record<string, unknown> = {};
  if (ownerId) row.owner_id = ownerId;
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description;
  if (input.icon !== undefined) row.icon = input.icon;
  if (input.color !== undefined) row.color = input.color;
  if (input.objektTypen !== undefined) row.objekt_typen = input.objektTypen;
  if (input.keywords !== undefined) row.keywords = input.keywords;
  if (input.branche !== undefined) row.branche = input.branche;
  if (input.plz !== undefined) row.plz = input.plz;
  if (input.radiusKm !== undefined) row.radius_km = input.radiusKm;
  return row;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function createSupabaseStore(): DataStore {
  return {
    async ensureSeed(ownerId) {
      const { data: stages, error } = await db()
        .from("pipeline_stages")
        .select("id")
        .eq("owner_id", ownerId)
        .limit(1);
      if (error) fail("Stages laden", error);
      if (!stages || stages.length === 0) {
        const rows = DEFAULT_STAGES.map((name, position) => ({
          owner_id: ownerId,
          name,
          position,
        }));
        const { error: insErr } = await db().from("pipeline_stages").insert(rows);
        if (insErr) fail("Default-Stages anlegen", insErr);
      }

      const { data: tpls } = await db()
        .from("email_templates")
        .select("id")
        .eq("owner_id", ownerId)
        .limit(1);
      if (!tpls || tpls.length === 0) {
        await db()
          .from("email_templates")
          .insert({
            owner_id: ownerId,
            name: "Erstansprache",
            subject: "Kurze Anfrage an {{firma}} in {{ort}}",
            body:
              "Guten Tag {{ansprechpartner}},\n\nwir sind ein Dienstleister aus Ihrer Region " +
              "und unterstützen Firmen wie {{firma}} ({{objekttyp}}). Gerne erstellen wir ein " +
              "unverbindliches Angebot.\n\nFreundliche Grüße",
          });
      }
    },

    async listAgents(ownerId) {
      const { data, error } = await db()
        .from("agents")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error) fail("Agenten laden", error);
      return (data ?? []).map(toAgent);
    },

    async getAgent(ownerId, id) {
      const { data, error } = await db()
        .from("agents")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("id", id)
        .maybeSingle();
      if (error) fail("Agent laden", error);
      return data ? toAgent(data) : null;
    },

    async createAgent(ownerId, input) {
      const { data, error } = await db()
        .from("agents")
        .insert(agentInputToRow(ownerId, input))
        .select()
        .single();
      if (error) fail("Agent anlegen", error);
      return toAgent(data);
    },

    async updateAgent(ownerId, id, patch) {
      const { data, error } = await db()
        .from("agents")
        .update(agentInputToRow("", patch))
        .eq("owner_id", ownerId)
        .eq("id", id)
        .select()
        .single();
      if (error) fail("Agent aktualisieren", error);
      return toAgent(data);
    },

    async deleteAgent(ownerId, id) {
      const { error } = await db()
        .from("agents")
        .delete()
        .eq("owner_id", ownerId)
        .eq("id", id);
      if (error) fail("Agent löschen", error);
    },

    async recordAgentRun(ownerId, id, matchCount, leadsCreatedDelta) {
      const { data: cur } = await db()
        .from("agents")
        .select("leads_created")
        .eq("owner_id", ownerId)
        .eq("id", id)
        .maybeSingle();
      const { data, error } = await db()
        .from("agents")
        .update({
          last_run_at: new Date().toISOString(),
          last_match_count: matchCount,
          leads_created: (cur?.leads_created ?? 0) + leadsCreatedDelta,
        })
        .eq("owner_id", ownerId)
        .eq("id", id)
        .select()
        .single();
      if (error) fail("Agent-Lauf speichern", error);
      return toAgent(data);
    },

    async listStages(ownerId) {
      const { data, error } = await db()
        .from("pipeline_stages")
        .select("*")
        .eq("owner_id", ownerId)
        .order("position");
      if (error) fail("Stages laden", error);
      return (data ?? []).map(toStage);
    },

    async createStage(ownerId, name) {
      const { data: max } = await db()
        .from("pipeline_stages")
        .select("position")
        .eq("owner_id", ownerId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const position = (max?.position ?? -1) + 1;
      const { data, error } = await db()
        .from("pipeline_stages")
        .insert({ owner_id: ownerId, name, position })
        .select()
        .single();
      if (error) fail("Stage anlegen", error);
      return toStage(data);
    },

    async updateStage(ownerId, id, patch) {
      const { data, error } = await db()
        .from("pipeline_stages")
        .update(patch)
        .eq("owner_id", ownerId)
        .eq("id", id)
        .select()
        .single();
      if (error) fail("Stage aktualisieren", error);
      return toStage(data);
    },

    async deleteStage(ownerId, id) {
      const { error } = await db()
        .from("pipeline_stages")
        .delete()
        .eq("owner_id", ownerId)
        .eq("id", id);
      if (error) fail("Stage löschen", error);
    },

    async reorderStages(ownerId, orderedIds) {
      // Einzel-Updates – für die UI-Größenordnung völlig ausreichend.
      await Promise.all(
        orderedIds.map((id, position) =>
          db()
            .from("pipeline_stages")
            .update({ position })
            .eq("owner_id", ownerId)
            .eq("id", id),
        ),
      );
      return this.listStages(ownerId);
    },

    async listLeads(ownerId) {
      const { data, error } = await db()
        .from("leads")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error) fail("Leads laden", error);
      return (data ?? []).map(toLead);
    },

    async getLead(ownerId, id) {
      const { data, error } = await db()
        .from("leads")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("id", id)
        .maybeSingle();
      if (error) fail("Lead laden", error);
      return data ? toLead(data) : null;
    },

    async saveLeads(ownerId, inputs, stageId) {
      const keys = inputs.map((i) => dedupeKey(i));
      const { data: existingRows } = await db()
        .from("leads")
        .select("*")
        .eq("owner_id", ownerId)
        .in("dedupe_key", keys);
      const existing = new Map(
        (existingRows ?? []).map((r) => [r.dedupe_key as string, r]),
      );

      const result: Lead[] = [];
      const toInsert: ReturnType<typeof leadInputToRow>[] = [];
      const queuedKeys = new Set<string>();

      for (const input of inputs) {
        const key = dedupeKey(input);
        const row = existing.get(key);
        if (row) {
          const patch: Record<string, unknown> = {};
          // fehlende Felder ergänzen
          for (const [field, col] of Object.entries(LEAD_PATCH_COLS)) {
            const val = (input as Record<string, unknown>)[field];
            if (row[col] == null && val != null) patch[col] = val;
          }
          if (stageId) patch.stage_id = stageId;
          if (Object.keys(patch).length > 0) {
            const { data, error } = await db()
              .from("leads")
              .update(patch)
              .eq("owner_id", ownerId)
              .eq("id", row.id)
              .select()
              .single();
            if (error) fail("Lead aktualisieren", error);
            result.push(toLead(data));
          } else {
            result.push(toLead(row));
          }
        } else if (queuedKeys.has(key)) {
          // Doppelter Eintrag in derselben Auswahl (gleiche Firma / gleicher Schlüssel) – überspringen,
          // statt den ganzen Speichervorgang an der Unique-Constraint scheitern zu lassen.
          continue;
        } else {
          queuedKeys.add(key);
          toInsert.push(leadInputToRow(ownerId, input, stageId));
        }
      }

      if (toInsert.length > 0) {
        const { data, error } = await db().from("leads").insert(toInsert).select();
        if (error) fail("Leads speichern", error);
        result.push(...(data ?? []).map(toLead));
      }
      return result;
    },

    async updateLead(ownerId, id, patch) {
      const row: Record<string, unknown> = {};
      for (const [field, col] of Object.entries(LEAD_PATCH_COLS)) {
        const val = (patch as Record<string, unknown>)[field];
        if (val !== undefined) row[col] = val;
      }
      const { data, error } = await db()
        .from("leads")
        .update(row)
        .eq("owner_id", ownerId)
        .eq("id", id)
        .select()
        .single();
      if (error) fail("Lead aktualisieren", error);
      return toLead(data);
    },

    async deleteLead(ownerId, id) {
      const { error } = await db()
        .from("leads")
        .delete()
        .eq("owner_id", ownerId)
        .eq("id", id);
      if (error) fail("Lead löschen", error);
    },

    async listTemplates(ownerId) {
      const { data, error } = await db()
        .from("email_templates")
        .select("*")
        .eq("owner_id", ownerId)
        .order("name");
      if (error) fail("Vorlagen laden", error);
      return (data ?? []).map(toTemplate);
    },

    async createTemplate(ownerId, t) {
      const { data, error } = await db()
        .from("email_templates")
        .insert({ owner_id: ownerId, ...t })
        .select()
        .single();
      if (error) fail("Vorlage anlegen", error);
      return toTemplate(data);
    },

    async updateTemplate(ownerId, id, patch) {
      const { data, error } = await db()
        .from("email_templates")
        .update(patch)
        .eq("owner_id", ownerId)
        .eq("id", id)
        .select()
        .single();
      if (error) fail("Vorlage aktualisieren", error);
      return toTemplate(data);
    },

    async deleteTemplate(ownerId, id) {
      const { error } = await db()
        .from("email_templates")
        .delete()
        .eq("owner_id", ownerId)
        .eq("id", id);
      if (error) fail("Vorlage löschen", error);
    },

    async listEmailLog(ownerId, leadId) {
      let q = db().from("email_log").select("*").eq("owner_id", ownerId);
      if (leadId) q = q.eq("lead_id", leadId);
      const { data, error } = await q.order("sent_at", { ascending: false });
      if (error) fail("E-Mail-Protokoll laden", error);
      return (data ?? []).map(toEmailLog);
    },

    async addEmailLog(ownerId, entry) {
      const { data, error } = await db()
        .from("email_log")
        .insert({
          owner_id: ownerId,
          lead_id: entry.leadId,
          template_id: entry.templateId,
          to_email: entry.to,
          subject: entry.subject,
          status: entry.status,
          error: entry.error,
          sent_at: entry.sentAt,
        })
        .select()
        .single();
      if (error) fail("E-Mail protokollieren", error);
      return toEmailLog(data);
    },

    async listActivities(ownerId, opts) {
      let q = db().from("activities").select("*").eq("owner_id", ownerId);
      if (opts?.leadId) q = q.eq("lead_id", opts.leadId);
      const { data, error } = await q
        .order("created_at", { ascending: false })
        .limit(opts?.limit ?? 500);
      if (error) fail("Aktivitäten laden", error);
      return (data ?? []).map(toActivity);
    },

    async addActivity(ownerId, entry) {
      const { data, error } = await db()
        .from("activities")
        .insert({
          owner_id: ownerId,
          lead_id: entry.leadId,
          type: entry.type,
          summary: entry.summary,
          meta: entry.meta,
        })
        .select()
        .single();
      if (error) fail("Aktivität speichern", error);
      return toActivity(data);
    },

    async listTasks(ownerId, opts) {
      let q = db().from("tasks").select("*").eq("owner_id", ownerId);
      if (opts?.leadId) q = q.eq("lead_id", opts.leadId);
      if (opts?.done !== undefined) q = q.eq("done", opts.done);
      const { data, error } = await q
        .order("done")
        .order("due_at", { nullsFirst: false });
      if (error) fail("Aufgaben laden", error);
      return (data ?? []).map(toTask);
    },

    async createTask(ownerId, input) {
      const { data, error } = await db()
        .from("tasks")
        .insert({
          owner_id: ownerId,
          lead_id: input.leadId,
          title: input.title,
          type: input.type,
          due_at: input.dueAt,
        })
        .select()
        .single();
      if (error) fail("Aufgabe anlegen", error);
      return toTask(data);
    },

    async updateTask(ownerId, id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.title != null) row.title = patch.title;
      if (patch.type != null) row.type = patch.type;
      if (patch.dueAt !== undefined) row.due_at = patch.dueAt;
      if (patch.done !== undefined) {
        row.done = patch.done;
        row.done_at = patch.done ? new Date().toISOString() : null;
      }
      const { data, error } = await db()
        .from("tasks")
        .update(row)
        .eq("owner_id", ownerId)
        .eq("id", id)
        .select()
        .single();
      if (error) fail("Aufgabe aktualisieren", error);
      return toTask(data);
    },

    async deleteTask(ownerId, id) {
      const { error } = await db().from("tasks").delete().eq("owner_id", ownerId).eq("id", id);
      if (error) fail("Aufgabe löschen", error);
    },

    async getSettings(ownerId): Promise<Settings> {
      const { data } = await db().from("settings").select("*").eq("owner_id", ownerId).maybeSingle();
      return rowToSettings(data);
    },

    async updateSettings(ownerId, patch): Promise<Settings> {
      const row: Record<string, unknown> = { owner_id: ownerId };
      if (patch.callGoal !== undefined) row.call_goal = patch.callGoal;
      if (patch.senderImpressum !== undefined) row.sender_impressum = patch.senderImpressum;
      if (patch.workspaceType !== undefined) row.workspace_type = patch.workspaceType;
      if (patch.senderSignature !== undefined) row.sender_signature = patch.senderSignature;
      if (patch.plan !== undefined) row.plan = patch.plan;
      if (patch.senderName !== undefined) row.sender_name = patch.senderName;
      if (patch.senderEmail !== undefined) row.sender_email = patch.senderEmail;
      if (patch.smtpHost !== undefined) row.smtp_host = patch.smtpHost;
      if (patch.smtpPort !== undefined) row.smtp_port = patch.smtpPort;
      if (patch.smtpUser !== undefined) row.smtp_user = patch.smtpUser;
      if (patch.smtpPass !== undefined) row.smtp_pass = patch.smtpPass;
      if (patch.stripeCustomerId !== undefined) row.stripe_customer_id = patch.stripeCustomerId;
      if (patch.subscriptionStatus !== undefined) row.subscription_status = patch.subscriptionStatus;
      if (patch.subscriptionRenewsAt !== undefined) row.subscription_renews_at = patch.subscriptionRenewsAt;
      if (patch.cancelAtPeriodEnd !== undefined) row.cancel_at_period_end = patch.cancelAtPeriodEnd;
      if (patch.subscriptionAmount !== undefined) row.subscription_amount = patch.subscriptionAmount;
      const { data, error } = await db()
        .from("settings")
        .upsert(row, { onConflict: "owner_id" })
        .select()
        .single();
      if (error) fail("Einstellungen speichern", error);
      return rowToSettings(data);
    },

    async listSuppressions(ownerId) {
      const { data, error } = await db()
        .from("suppressions")
        .select("*")
        .eq("owner_id", ownerId);
      if (error) fail("Suppressions laden", error);
      return (data ?? []).map(toSuppression);
    },

    async addSuppression(ownerId, email, reason) {
      const norm = email.trim().toLowerCase();
      const { data, error } = await db()
        .from("suppressions")
        .upsert(
          { owner_id: ownerId, email: norm, reason },
          { onConflict: "owner_id,email" },
        )
        .select()
        .single();
      if (error) fail("Suppression anlegen", error);
      return toSuppression(data);
    },

    async removeSuppression(ownerId, id) {
      const { error } = await db()
        .from("suppressions")
        .delete()
        .eq("owner_id", ownerId)
        .eq("id", id);
      if (error) fail("Suppression löschen", error);
    },

    async isSuppressed(ownerId, email) {
      const norm = email.trim().toLowerCase();
      const { data, error } = await db()
        .from("suppressions")
        .select("id")
        .eq("owner_id", ownerId)
        .eq("email", norm)
        .maybeSingle();
      if (error) fail("Suppression prüfen", error);
      return Boolean(data);
    },
  };
}
