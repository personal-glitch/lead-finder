import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { subscribeNewsletter, isValidEmail } from "@/lib/newsletter";

// Öffentliche Newsletter-Anmeldung (Double-Opt-In). Speichert 'pending' und
// verschickt die Bestätigungs-Mail. Antwort ist bewusst generisch.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      name?: string;
      source?: string;
      website?: string; // Honeypot – muss leer bleiben
    };

    // Bots füllen das versteckte Feld → still als Erfolg quittieren.
    if (body.website && body.website.trim().length > 0) {
      return jsonOk({ ok: true, message: "Fast geschafft! Bitte bestätige den Link in deiner E-Mail." });
    }

    const email = (body.email ?? "").trim();
    if (!isValidEmail(email)) {
      throw new AppError("bad_request", "Bitte gib eine gültige E-Mail-Adresse an.");
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const source = (body.source ?? "homepage").slice(0, 40);
    const name = (body.name ?? "").trim().slice(0, 80) || null;

    const result = await subscribeNewsletter({ email, name, ip, source });
    if (!result.ok) throw new AppError("bad_request", result.error);

    return jsonOk({
      ok: true,
      message:
        result.state === "already_confirmed"
          ? "Du bist bereits angemeldet – danke!"
          : "Fast geschafft! Bitte bestätige den Link in deiner E-Mail.",
    });
  } catch (err) {
    return jsonError(err);
  }
}
