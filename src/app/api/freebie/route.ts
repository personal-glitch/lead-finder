import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { FREEBIES, newsletterEnabled } from "@/lib/newsletter";

export const runtime = "nodejs";

// Erlaubte Dateien (Whitelist) + MIME. Schlüssel = ?f= aus dem Mail-Link.
const FILES: Record<string, { type: string }> = {
  "Akquise-Vorlagen-Paket.pdf": { type: "application/pdf" },
  "Kaltakquise-Leitfaden-2026.pdf": { type: "application/pdf" },
  "Akquise-Tracker.xlsx": { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
};

// Geschützter Download der Gratis-Tools: nur mit gültigem Bestätigungs-Token
// eines (bestätigten) Newsletter-Abonnenten. So gibt es die Dateien NUR gegen
// eine bestätigte E-Mail – keine offenen, teilbaren Public-Links mehr.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = (searchParams.get("f") ?? "").trim();
  const token = (searchParams.get("t") ?? "").trim();

  if (!FILES[file] || !FREEBIES.some((d) => d.file === file)) {
    return new Response("Datei nicht gefunden.", { status: 404 });
  }
  if (!token || !newsletterEnabled()) {
    return new Response("Dieser Download-Link ist ungültig. Bitte bestätige zuerst deine Anmeldung.", { status: 403 });
  }

  // Token gegen Abonnenten prüfen.
  const { createAdminClient } = await import("@/lib/supabase/server");
  const sb = createAdminClient();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("status")
    .eq("token", token)
    .maybeSingle();
  if (!data || data.status === "unsubscribed") {
    return new Response("Dieser Download-Link ist ungültig oder abgelaufen.", { status: 403 });
  }

  try {
    const buf = await fs.readFile(path.join(process.cwd(), "freebies", file));
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": FILES[file].type,
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    return new Response("Datei konnte nicht geladen werden.", { status: 500 });
  }
}
