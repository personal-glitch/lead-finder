import "server-only";
// Supabase-Client für Server-Komponenten, Route-Handler & Server-Actions.
// Nutzt den Anon-Key + Cookies (RLS gilt). Schreiben von Cookies ist in reinen
// Server-Komponenten nicht erlaubt – dort schlägt setAll bewusst still fehl.
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

/** Service-Role-Client (umgeht RLS) – NUR für Admin-Aggregationen, nie an den Client geben. */
export function createAdminClient(): SupabaseClient {
  return createSupabaseClient(config.supabase.url!, config.supabase.serviceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    config.supabase.url!,
    config.supabase.anonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Aufruf aus einer Server-Komponente – Cookies setzt hier die Middleware.
          }
        },
      },
    },
  );
}
