import { promises as dns } from "node:dns";
import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";

export const runtime = "nodejs";

const Body = z.object({ email: z.string().max(200) });
const SYNTAX = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/;

// Prüft eine E-Mail: Syntax + ob die Domain überhaupt E-Mails empfangen kann (MX-Record).
// Kein Versand, keine externe API – nur ein DNS-Lookup.
export async function POST(req: Request) {
  try {
    const { email } = Body.parse(await req.json());
    const value = email.trim().toLowerCase();
    const syntax = SYNTAX.test(value);
    if (!syntax) return jsonOk({ valid: false, syntax: false, mx: false, reason: "Ungültige Adresse." });
    const domain = value.split("@")[1];
    let mx = false;
    try {
      const records = await dns.resolveMx(domain);
      mx = Array.isArray(records) && records.length > 0;
    } catch {
      // Fallback: A-Record? Manche Domains nehmen Mail ohne MX entgegen.
      try { const a = await dns.resolve(domain); mx = Array.isArray(a) && a.length > 0; } catch { mx = false; }
    }
    return jsonOk({
      valid: syntax && mx,
      syntax,
      mx,
      domain,
      reason: mx ? "Domain kann E-Mails empfangen." : "Domain hat keinen Mail-Eintrag (MX) – Zustellung unwahrscheinlich.",
    });
  } catch (err) {
    return jsonError(err);
  }
}
