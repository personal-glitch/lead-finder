// Auswahl des Persistenz-Adapters + Owner-Kontext. Nur server-seitig nutzbar.
import "server-only";
import { config, DEV_OWNER_ID } from "@/lib/config";
import { AppError } from "@/lib/errors";
import type { DataStore } from "./types";
import { createLocalStore } from "./local";
import { createSupabaseStore } from "./supabase";

let store: DataStore | null = null;

export function getStore(): DataStore {
  if (!store) {
    store = config.supabase.enabled ? createSupabaseStore() : createLocalStore();
  }
  return store;
}

/**
 * Aktuelle Owner-ID für alle Datenzugriffe.
 * - Lokaler Modus (keine Supabase-Keys): feste Dev-Nil-UUID, keine Auth nötig.
 * - Mit Supabase: die echte Session-User-ID (auth.uid()). Fehlt die Session,
 *   wird ein 401 geworfen – Route-Handler antworten dann mit JSON-Fehler.
 */
export async function getOwnerId(): Promise<string> {
  if (!config.supabase.enabled) return DEV_OWNER_ID;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AppError("auth", "Bitte melde dich an.");
  return user.id;
}

let seeded = false;
/** Stellt Default-Stages/Vorlage sicher (idempotent, einmal pro Prozess geprüft). */
export async function ensureSeeded(ownerId: string): Promise<void> {
  if (seeded) return;
  await getStore().ensureSeed(ownerId);
  seeded = true;
}

export type { DataStore } from "./types";
