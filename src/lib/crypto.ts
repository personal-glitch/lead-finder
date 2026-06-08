import "server-only";
// Verschlüsselt sensible Settings (z. B. SMTP-Passwort) AT REST.
// Schlüssel aus stabilem Server-Secret: APP_SECRET bevorzugt, sonst Service-Role-Key.
// Im Dev ohne beides ein fester Fallback (dann NICHT für echte Produktions-Secrets nutzen).
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { config } from "@/lib/config";

const PREFIX = "enc:v1:";

function key(): Buffer {
  const secret =
    process.env.APP_SECRET?.trim() ||
    config.supabase.serviceRoleKey ||
    "kundenradar-dev-insecure-key";
  return createHash("sha256").update(secret).digest();
}

/** Verschlüsselt einen Klartext → "enc:v1:<base64>". Leerstring bleibt leer. */
export function encryptSecret(plain: string): string {
  if (!plain) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

/** Entschlüsselt einen mit encryptSecret erzeugten Wert. Klartext-Altbestand bleibt unverändert. */
export function decryptSecret(stored: string | null | undefined): string {
  if (!stored) return "";
  if (!stored.startsWith(PREFIX)) return stored;
  try {
    const raw = Buffer.from(stored.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const ct = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

/** true, wenn der Wert bereits verschlüsselt ist. */
export function isEncrypted(v: string | null | undefined): boolean {
  return Boolean(v && v.startsWith(PREFIX));
}
