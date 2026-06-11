import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";
import { subscribeConfirmed } from "@/lib/newsletter";

// 1-Klick-Newsletter-Abo für eingeloggte Nutzer (verifizierte E-Mail + Klick = Einwilligung).
export async function POST(req: NextRequest) {
  try {
    if (!config.supabase.enabled) throw new AppError("not_configured", "Nur mit Supabase verfügbar.");
    const { createClient } = await import("@/lib/supabase/server");
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (!user?.email) throw new AppError("auth", "Bitte zuerst anmelden.");

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const name = (user.user_metadata?.first_name as string) ?? null;
    const r = await subscribeConfirmed({ email: user.email, name, ip, source: "dashboard" });
    if (!r.ok) throw new AppError("bad_request", r.error);
    return jsonOk({ ok: true, already: r.state === "already_confirmed" });
  } catch (err) {
    return jsonError(err);
  }
}
