// Abstraktion über die Persistenz. Zwei Implementierungen:
//   - local.ts    : Datei-gestützt (Dev, ohne Supabase) – persistiert über Reloads
//   - supabase.ts : Postgres + RLS (wenn Keys gesetzt sind)
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

export interface DataStore {
  /** Legt Default-Stages + eine Beispielvorlage an, falls noch nichts existiert. */
  ensureSeed(ownerId: string): Promise<void>;

  // ── Agenten ──
  listAgents(ownerId: string): Promise<Agent[]>;
  getAgent(ownerId: string, id: string): Promise<Agent | null>;
  createAgent(ownerId: string, input: AgentInput): Promise<Agent>;
  updateAgent(ownerId: string, id: string, patch: Partial<AgentInput>): Promise<Agent>;
  deleteAgent(ownerId: string, id: string): Promise<void>;
  recordAgentRun(
    ownerId: string,
    id: string,
    matchCount: number,
    leadsCreatedDelta: number,
  ): Promise<Agent>;

  // ── Pipeline-Stages ──
  listStages(ownerId: string): Promise<PipelineStage[]>;
  createStage(ownerId: string, name: string): Promise<PipelineStage>;
  updateStage(
    ownerId: string,
    id: string,
    patch: Partial<Pick<PipelineStage, "name" | "position">>,
  ): Promise<PipelineStage>;
  deleteStage(ownerId: string, id: string): Promise<void>;
  reorderStages(ownerId: string, orderedIds: string[]): Promise<PipelineStage[]>;

  // ── Leads ──
  listLeads(ownerId: string): Promise<Lead[]>;
  getLead(ownerId: string, id: string): Promise<Lead | null>;
  /**
   * Speichert Treffer aus Suche/Anreicherung. Dedupe über Website bzw.
   * Name+Adresse: existiert ein Lead, werden fehlende Felder ergänzt und – falls
   * `stageId` gesetzt ist – die Stage aktualisiert. Liefert die finalen Leads.
   */
  saveLeads(
    ownerId: string,
    inputs: LeadInput[],
    stageId: string | null,
  ): Promise<Lead[]>;
  updateLead(ownerId: string, id: string, patch: Partial<Lead>): Promise<Lead>;
  deleteLead(ownerId: string, id: string): Promise<void>;

  // ── E-Mail-Vorlagen ──
  listTemplates(ownerId: string): Promise<EmailTemplate[]>;
  createTemplate(
    ownerId: string,
    t: Pick<EmailTemplate, "name" | "subject" | "body">,
  ): Promise<EmailTemplate>;
  updateTemplate(
    ownerId: string,
    id: string,
    patch: Partial<Pick<EmailTemplate, "name" | "subject" | "body">>,
  ): Promise<EmailTemplate>;
  deleteTemplate(ownerId: string, id: string): Promise<void>;

  // ── E-Mail-Protokoll ──
  listEmailLog(ownerId: string, leadId?: string): Promise<EmailLogEntry[]>;
  addEmailLog(
    ownerId: string,
    entry: Omit<EmailLogEntry, "id" | "ownerId">,
  ): Promise<EmailLogEntry>;

  // ── Aktivitäten ──
  listActivities(
    ownerId: string,
    opts?: { leadId?: string; limit?: number },
  ): Promise<Activity[]>;
  addActivity(
    ownerId: string,
    entry: Omit<Activity, "id" | "ownerId" | "createdAt">,
  ): Promise<Activity>;

  // ── Aufgaben ──
  listTasks(ownerId: string, opts?: { leadId?: string; done?: boolean }): Promise<Task[]>;
  createTask(ownerId: string, input: TaskInput): Promise<Task>;
  updateTask(
    ownerId: string,
    id: string,
    patch: Partial<Pick<Task, "title" | "dueAt" | "done" | "type">>,
  ): Promise<Task>;
  deleteTask(ownerId: string, id: string): Promise<void>;

  // ── Einstellungen ──
  getSettings(ownerId: string): Promise<Settings>;
  updateSettings(ownerId: string, patch: Partial<Settings>): Promise<Settings>;

  // ── Suppressions (Opt-out) ──
  listSuppressions(ownerId: string): Promise<Suppression[]>;
  addSuppression(
    ownerId: string,
    email: string,
    reason: string | null,
  ): Promise<Suppression>;
  removeSuppression(ownerId: string, id: string): Promise<void>;
  isSuppressed(ownerId: string, email: string): Promise<boolean>;
}
