// Datei-gestützter Store für die lokale Entwicklung ohne Supabase.
// Persistiert nach .data/store.json (gitignored) → Stand bleibt nach Reload.
// Mutationen werden serialisiert, um Schreib-Races (Dev-Server) zu vermeiden.
import { promises as fs } from "node:fs";
import path from "node:path";
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

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "store.json");

export const DEFAULT_STAGES = [
  "Neu",
  "Kontaktiert",
  "Interessiert",
  "Angebot",
  "Kunde",
  "Verloren",
];

interface DbShape {
  agents: Agent[];
  leads: Lead[];
  stages: PipelineStage[];
  templates: EmailTemplate[];
  emailLog: EmailLogEntry[];
  suppressions: Suppression[];
  activities: Activity[];
  tasks: Task[];
  settings: (Settings & { ownerId: string })[];
}

const uuid = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();

let state: DbShape | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DbShape> {
  if (state) return state;
  try {
    state = JSON.parse(await fs.readFile(FILE, "utf8")) as DbShape;
  } catch {
    state = {
      agents: [], leads: [], stages: [], templates: [],
      emailLog: [], suppressions: [], activities: [], tasks: [], settings: [],
    };
  }
  state.agents ??= [];
  state.activities ??= [];
  state.tasks ??= [];
  state.settings ??= [];
  state.leads ??= [];
  state.stages ??= [];
  state.templates ??= [];
  state.emailLog ??= [];
  state.suppressions ??= [];
  return state;
}

/** Serialisierte Lese-/Schreib-Transaktion mit Persistenz danach. */
function tx<T>(fn: (s: DbShape) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const s = await load();
    const result = await fn(s);
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(s, null, 2), "utf8");
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function read<T>(fn: (s: DbShape) => T): Promise<T> {
  return load().then(fn);
}

function leadFromInput(
  ownerId: string,
  input: LeadInput,
  stageId: string | null,
): Lead {
  const ts = now();
  return { ...input, id: uuid(), notes: null, stageId, ownerId, createdAt: ts, updatedAt: ts };
}

function fillMissing(target: Lead, input: LeadInput): void {
  (Object.keys(input) as (keyof LeadInput)[]).forEach((k) => {
    if (target[k] == null && input[k] != null) {
      // @ts-expect-error – gemeinsame Keys, homogene Zuweisung
      target[k] = input[k];
    }
  });
}

export function createLocalStore(): DataStore {
  return {
    async ensureSeed(ownerId) {
      await tx((s) => {
        const hasStages = s.stages.some((x) => x.ownerId === ownerId);
        if (!hasStages) {
          DEFAULT_STAGES.forEach((name, i) =>
            s.stages.push({ id: uuid(), name, position: i, ownerId }),
          );
        }
        const hasTemplates = s.templates.some((x) => x.ownerId === ownerId);
        if (!hasTemplates) {
          s.templates.push({
            id: uuid(),
            ownerId,
            name: "Erstansprache",
            subject: "Kurze Anfrage an {{firma}} in {{ort}}",
            body:
              "Guten Tag {{ansprechpartner}},\n\n" +
              "wir sind ein Dienstleister aus Ihrer Region und unterstützen Firmen wie " +
              "{{firma}} ({{objekttyp}}). Gerne stellen wir uns kurz vor und erstellen " +
              "ein unverbindliches Angebot.\n\n" +
              "Hätten Sie diese Woche kurz Zeit für ein Telefonat?\n\n" +
              "Freundliche Grüße",
          });
        }
      });
    },

    listAgents(ownerId) {
      return read((s) =>
        s.agents
          .filter((x) => x.ownerId === ownerId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },

    getAgent(ownerId, id) {
      return read(
        (s) => s.agents.find((x) => x.id === id && x.ownerId === ownerId) ?? null,
      );
    },

    createAgent(ownerId, input) {
      return tx((s) => {
        const ts = now();
        const agent: Agent = {
          id: uuid(),
          ...input,
          ownerId,
          lastRunAt: null,
          lastMatchCount: 0,
          leadsCreated: 0,
          createdAt: ts,
          updatedAt: ts,
        };
        s.agents.push(agent);
        return agent;
      });
    },

    updateAgent(ownerId, id, patch) {
      return tx((s) => {
        const agent = s.agents.find((x) => x.id === id && x.ownerId === ownerId);
        if (!agent) throw new AppError("not_found", "Agent nicht gefunden.");
        (Object.keys(patch) as (keyof AgentInput)[]).forEach((k) => {
          if (patch[k] !== undefined) {
            // @ts-expect-error – gemeinsame Keys
            agent[k] = patch[k];
          }
        });
        agent.updatedAt = now();
        return agent;
      });
    },

    deleteAgent(ownerId, id) {
      return tx((s) => {
        s.agents = s.agents.filter((x) => !(x.id === id && x.ownerId === ownerId));
      });
    },

    recordAgentRun(ownerId, id, matchCount, leadsCreatedDelta) {
      return tx((s) => {
        const agent = s.agents.find((x) => x.id === id && x.ownerId === ownerId);
        if (!agent) throw new AppError("not_found", "Agent nicht gefunden.");
        agent.lastRunAt = now();
        agent.lastMatchCount = matchCount;
        agent.leadsCreated += leadsCreatedDelta;
        agent.updatedAt = now();
        return agent;
      });
    },

    listStages(ownerId) {
      return read((s) =>
        s.stages
          .filter((x) => x.ownerId === ownerId)
          .sort((a, b) => a.position - b.position),
      );
    },

    createStage(ownerId, name) {
      return tx((s) => {
        const max = Math.max(
          -1,
          ...s.stages.filter((x) => x.ownerId === ownerId).map((x) => x.position),
        );
        const stage: PipelineStage = {
          id: uuid(),
          name,
          position: max + 1,
          ownerId,
        };
        s.stages.push(stage);
        return stage;
      });
    },

    updateStage(ownerId, id, patch) {
      return tx((s) => {
        const stage = s.stages.find((x) => x.id === id && x.ownerId === ownerId);
        if (!stage) throw new AppError("not_found", "Stage nicht gefunden.");
        if (patch.name != null) stage.name = patch.name;
        if (patch.position != null) stage.position = patch.position;
        return stage;
      });
    },

    deleteStage(ownerId, id) {
      return tx((s) => {
        s.stages = s.stages.filter((x) => !(x.id === id && x.ownerId === ownerId));
        // Leads dieser Stage lösen (zurück in "kein Stage").
        s.leads.forEach((l) => {
          if (l.ownerId === ownerId && l.stageId === id) l.stageId = null;
        });
      });
    },

    reorderStages(ownerId, orderedIds) {
      return tx((s) => {
        orderedIds.forEach((id, i) => {
          const stage = s.stages.find((x) => x.id === id && x.ownerId === ownerId);
          if (stage) stage.position = i;
        });
        return s.stages
          .filter((x) => x.ownerId === ownerId)
          .sort((a, b) => a.position - b.position);
      });
    },

    listLeads(ownerId) {
      return read((s) =>
        s.leads
          .filter((x) => x.ownerId === ownerId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },

    getLead(ownerId, id) {
      return read(
        (s) => s.leads.find((x) => x.id === id && x.ownerId === ownerId) ?? null,
      );
    },

    saveLeads(ownerId, inputs, stageId) {
      return tx((s) => {
        const ownerLeads = s.leads.filter((x) => x.ownerId === ownerId);
        const byKey = new Map(ownerLeads.map((l) => [dedupeKey(l), l]));
        const result: Lead[] = [];
        for (const input of inputs) {
          const key = dedupeKey(input);
          const existing = byKey.get(key);
          if (existing) {
            fillMissing(existing, input);
            if (stageId) existing.stageId = stageId;
            existing.updatedAt = now();
            result.push(existing);
          } else {
            const lead = leadFromInput(ownerId, input, stageId);
            s.leads.push(lead);
            byKey.set(key, lead);
            result.push(lead);
          }
        }
        return result;
      });
    },

    updateLead(ownerId, id, patch) {
      return tx((s) => {
        const lead = s.leads.find((x) => x.id === id && x.ownerId === ownerId);
        if (!lead) throw new AppError("not_found", "Lead nicht gefunden.");
        const immutable = new Set(["id", "ownerId", "createdAt"]);
        (Object.keys(patch) as (keyof Lead)[]).forEach((k) => {
          if (immutable.has(k as string)) return;
          if (patch[k] !== undefined) {
            // @ts-expect-error – gemeinsame Keys
            lead[k] = patch[k];
          }
        });
        lead.updatedAt = now();
        return lead;
      });
    },

    deleteLead(ownerId, id) {
      return tx((s) => {
        s.leads = s.leads.filter((x) => !(x.id === id && x.ownerId === ownerId));
        s.emailLog = s.emailLog.filter((x) => x.leadId !== id);
      });
    },

    listTemplates(ownerId) {
      return read((s) =>
        s.templates
          .filter((x) => x.ownerId === ownerId)
          .sort((a, b) => a.name.localeCompare(b.name, "de")),
      );
    },

    createTemplate(ownerId, t) {
      return tx((s) => {
        const tpl: EmailTemplate = { id: uuid(), ownerId, ...t };
        s.templates.push(tpl);
        return tpl;
      });
    },

    updateTemplate(ownerId, id, patch) {
      return tx((s) => {
        const tpl = s.templates.find((x) => x.id === id && x.ownerId === ownerId);
        if (!tpl) throw new AppError("not_found", "Vorlage nicht gefunden.");
        if (patch.name != null) tpl.name = patch.name;
        if (patch.subject != null) tpl.subject = patch.subject;
        if (patch.body != null) tpl.body = patch.body;
        return tpl;
      });
    },

    deleteTemplate(ownerId, id) {
      return tx((s) => {
        s.templates = s.templates.filter(
          (x) => !(x.id === id && x.ownerId === ownerId),
        );
      });
    },

    listEmailLog(ownerId, leadId) {
      return read((s) =>
        s.emailLog
          .filter((x) => x.ownerId === ownerId && (!leadId || x.leadId === leadId))
          .sort((a, b) => (b.sentAt ?? "").localeCompare(a.sentAt ?? "")),
      );
    },

    addEmailLog(ownerId, entry) {
      return tx((s) => {
        const log: EmailLogEntry = { id: uuid(), ownerId, ...entry };
        s.emailLog.push(log);
        return log;
      });
    },

    listActivities(ownerId, opts) {
      return read((s) =>
        s.activities
          .filter((x) => x.ownerId === ownerId && (!opts?.leadId || x.leadId === opts.leadId))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, opts?.limit ?? 500),
      );
    },

    addActivity(ownerId, entry) {
      return tx((s) => {
        const act: Activity = { id: uuid(), ownerId, ...entry, createdAt: now() };
        s.activities.push(act);
        return act;
      });
    },

    listTasks(ownerId, opts) {
      return read((s) =>
        s.tasks
          .filter(
            (x) =>
              x.ownerId === ownerId &&
              (!opts?.leadId || x.leadId === opts.leadId) &&
              (opts?.done === undefined || x.done === opts.done),
          )
          .sort((a, b) => {
            // offene zuerst, dann nach Fälligkeit (frühe zuerst)
            if (a.done !== b.done) return a.done ? 1 : -1;
            return (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999");
          }),
      );
    },

    createTask(ownerId, input) {
      return tx((s) => {
        const task: Task = {
          id: uuid(),
          ownerId,
          leadId: input.leadId ?? null,
          title: input.title,
          type: input.type,
          dueAt: input.dueAt ?? null,
          done: false,
          doneAt: null,
          createdAt: now(),
        };
        s.tasks.push(task);
        return task;
      });
    },

    updateTask(ownerId, id, patch) {
      return tx((s) => {
        const task = s.tasks.find((x) => x.id === id && x.ownerId === ownerId);
        if (!task) throw new AppError("not_found", "Aufgabe nicht gefunden.");
        if (patch.title != null) task.title = patch.title;
        if (patch.type != null) task.type = patch.type;
        if (patch.dueAt !== undefined) task.dueAt = patch.dueAt;
        if (patch.done !== undefined) {
          task.done = patch.done;
          task.doneAt = patch.done ? now() : null;
        }
        return task;
      });
    },

    deleteTask(ownerId, id) {
      return tx((s) => {
        s.tasks = s.tasks.filter((x) => !(x.id === id && x.ownerId === ownerId));
      });
    },

    getSettings(ownerId) {
      return read((s) => {
        const f = s.settings.find((x) => x.ownerId === ownerId);
        return {
          callGoal: f?.callGoal ?? null,
          senderImpressum: f?.senderImpressum ?? null,
          senderSignature: f?.senderSignature ?? null,
          plan: f?.plan ?? null,
          senderName: f?.senderName ?? null,
          senderEmail: f?.senderEmail ?? null,
          smtpHost: f?.smtpHost ?? null,
          smtpPort: f?.smtpPort ?? null,
          smtpUser: f?.smtpUser ?? null,
          smtpPass: f?.smtpPass ?? null,
          stripeCustomerId: f?.stripeCustomerId ?? null,
          subscriptionStatus: f?.subscriptionStatus ?? null,
          subscriptionRenewsAt: f?.subscriptionRenewsAt ?? null,
          cancelAtPeriodEnd: f?.cancelAtPeriodEnd ?? null,
        };
      });
    },

    updateSettings(ownerId, patch) {
      return tx((s) => {
        let f = s.settings.find((x) => x.ownerId === ownerId);
        if (!f) {
          f = {
            ownerId, callGoal: null, senderImpressum: null, senderSignature: null, plan: null,
            senderName: null, senderEmail: null, smtpHost: null, smtpPort: null, smtpUser: null, smtpPass: null,
            stripeCustomerId: null, subscriptionStatus: null, subscriptionRenewsAt: null, cancelAtPeriodEnd: null,
          };
          s.settings.push(f);
        }
        const keys = [
          "callGoal", "senderImpressum", "senderSignature", "plan",
          "senderName", "senderEmail", "smtpHost", "smtpPort", "smtpUser", "smtpPass",
          "stripeCustomerId", "subscriptionStatus", "subscriptionRenewsAt", "cancelAtPeriodEnd",
        ] as const;
        for (const k of keys) {
          if (patch[k] !== undefined) {
            // @ts-expect-error – gemeinsame Settings-Keys
            f[k] = patch[k];
          }
        }
        const { ownerId: _o, ...rest } = f;
        void _o;
        return { ...rest };
      });
    },

    listSuppressions(ownerId) {
      return read((s) => s.suppressions.filter((x) => x.ownerId === ownerId));
    },

    addSuppression(ownerId, email, reason) {
      return tx((s) => {
        const norm = email.trim().toLowerCase();
        const existing = s.suppressions.find(
          (x) => x.ownerId === ownerId && x.email === norm,
        );
        if (existing) return existing;
        const sup: Suppression = {
          id: uuid(),
          ownerId,
          email: norm,
          reason,
          createdAt: now(),
        };
        s.suppressions.push(sup);
        return sup;
      });
    },

    removeSuppression(ownerId, id) {
      return tx((s) => {
        s.suppressions = s.suppressions.filter(
          (x) => !(x.id === id && x.ownerId === ownerId),
        );
      });
    },

    isSuppressed(ownerId, email) {
      const norm = email.trim().toLowerCase();
      return read((s) =>
        s.suppressions.some((x) => x.ownerId === ownerId && x.email === norm),
      );
    },
  };
}
