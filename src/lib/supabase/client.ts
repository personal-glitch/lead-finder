"use client";
// Supabase-Client für Client-Komponenten (Browser). Liest die öffentlichen
// Env-Variablen; ohne sie wird Auth nie angefordert (die App läuft dann lokal).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
