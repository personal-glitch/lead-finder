// Gemeinsame Domänen-Typen für den KundenRadar.

// Neutrale, nach außen sichtbare Werte – die konkrete Datenherkunft bleibt Geheimnis.
// ("osm"/"impressum" weiterhin im Union für Altbestand/Abwärtskompatibilität.)
export type LeadSource = "recherche" | "manual" | "osm" | "impressum";
export type EnrichmentSource = "web" | "impressum" | null;

/** Ein in der Pipeline gespeicherter Lead. */
export interface Lead {
  id: string;
  name: string | null;
  objektTyp: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  lat: number | null;
  lon: number | null;
  phone: string | null;
  phoneE164: string | null;
  email: string | null;
  ansprechpartner: string | null;
  website: string | null;
  openingHours: string | null;
  /** Herkunft des Datensatzes – wichtig für Auskunfts-/Löschanfragen (DSGVO). */
  source: LeadSource;
  enrichmentSource: EnrichmentSource;
  enrichedAt: string | null;
  /** OSM-Identität (type/id), z. B. "node/123" – nur für Dedupe. */
  osmId: string | null;
  notes: string | null;
  stageId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** Ein noch nicht gespeicherter Treffer aus Suche/Anreicherung. */
export type LeadInput = Omit<
  Lead,
  "id" | "stageId" | "ownerId" | "createdAt" | "updatedAt" | "notes"
>;

/** Ein benanntes, wiederverwendbares Lead-Gen-Profil mit eigenem Avatar. */
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  /** Icon-Key (siehe components/icons) – kein Emoji. */
  icon: string;
  /** Farb-Key aus der kuratierten Palette. */
  color: string;
  /** Ziel-Branchen aus dem Katalog, die die Suche abfragt. */
  objektTypen: string[];
  /** Freie Namens-Stichwörter (Joker): findet zusätzlich Firmen, deren Name eines dieser Wörter enthält. */
  keywords: string[];
  branche: string | null;
  plz: string;
  radiusKm: number;
  ownerId: string;
  lastRunAt: string | null;
  lastMatchCount: number;
  leadsCreated: number;
  createdAt: string;
  updatedAt: string;
}

export type AgentInput = Pick<
  Agent,
  "name" | "description" | "icon" | "color" | "objektTypen" | "keywords" | "branche" | "plz" | "radiusKm"
>;

export interface PipelineStage {
  id: string;
  name: string;
  position: number;
  ownerId: string;
}

// ── Aktivitäten (verbindendes Ereignis-Log; hängt an einer Firma/Lead) ──
export type ActivityType =
  | "created"
  | "enriched"
  | "stage_changed"
  | "call"
  | "email"
  | "task"
  | "note";

export interface Activity {
  id: string;
  ownerId: string;
  leadId: string | null;
  type: ActivityType;
  summary: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

// ── Anrufe ──
export type CallOutcome =
  | "erreicht"
  | "nicht_erreicht"
  | "termin"
  | "kein_bedarf"
  | "rueckruf";

// ── Aufgaben (Wiedervorlagen / To-dos) ──
export type TaskType = "call" | "email" | "todo";

export interface Task {
  id: string;
  ownerId: string;
  leadId: string | null;
  title: string;
  type: TaskType;
  dueAt: string | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
}

export type TaskInput = Pick<Task, "leadId" | "title" | "type" | "dueAt">;

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  ownerId: string;
}

export type EmailStatus =
  | "queued"
  | "sent"
  | "failed"
  | "suppressed"
  | "opened";

export interface EmailLogEntry {
  id: string;
  leadId: string;
  templateId: string | null;
  to: string | null;
  subject: string | null;
  status: EmailStatus;
  error: string | null;
  sentAt: string | null;
  ownerId: string;
}

export interface Suppression {
  id: string;
  email: string;
  reason: string | null;
  ownerId: string;
  createdAt: string;
}

/** In-App-Einstellungen (überschreiben Env-Defaults). null = Default nutzen. */
export interface Settings {
  callGoal: number | null;
  senderImpressum: string | null;
  /** Gewähltes Paket; null = Default. */
  plan: string | null;
  // ── Eigener E-Mail-Versand pro Nutzer (SMTP) ──
  senderName: string | null;
  senderEmail: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  /** SMTP-Passwort – VERSCHLÜSSELT gespeichert (enc:v1:…), nie im Klartext an den Client. */
  smtpPass: string | null;
  // ── Abrechnung (Stripe) ──
  stripeCustomerId: string | null;
  /** z. B. "active", "trialing", "past_due", "canceled"; null = kein Abo. */
  subscriptionStatus: string | null;
  /** Nächste Fälligkeit / Ende der laufenden Periode (ISO). */
  subscriptionRenewsAt: string | null;
  /** true = gekündigt, läuft zum Periodenende aus. */
  cancelAtPeriodEnd: boolean | null;
}

/** Welche externen Dienste konfiguriert sind – steuert die UI. */
export interface FeatureFlags {
  /** false = lokaler Datei-Store statt Supabase */
  supabase: boolean;
  /** false = E-Mail-Versand deaktiviert (kein Resend-Key) */
  resend: boolean;
  /** true = Stripe-Abrechnung konfiguriert */
  stripe: boolean;
}
