import { NextResponse } from "next/server";
import { config } from "@/lib/config";

/** Meldet den Nutzer ab (löscht die Session-Cookies) und führt zur Startseite. */
export async function POST(request: Request) {
  if (config.supabase.enabled) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  // 303 → der Browser folgt mit GET; zurück auf die öffentliche Startseite.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
