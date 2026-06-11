// System-/Transaktions-Mailversand (z. B. Newsletter-Bestätigung).
// Priorität: Plattform-Resend → Betreiber-SMTP (Superadmin-Postfach).
import { Resend } from "resend";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { smtpConfigured, smtpSendRaw } from "./send";
import type { Settings } from "@/lib/types";

export interface SystemMail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

/** Lädt die Einstellungen (inkl. SMTP) des Superadmin-Kontos, falls vorhanden. */
async function operatorSettings(): Promise<Settings | null> {
  if (!config.supabase.enabled || !config.admin.email) return null;
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const u = (data?.users ?? []).find(
      (x) => x.email?.toLowerCase() === config.admin.email,
    );
    if (!u) return null;
    return await getStore().getSettings(u.id);
  } catch {
    return null;
  }
}

/** true, wenn überhaupt ein System-Versandweg verfügbar ist. */
export async function systemMailAvailable(): Promise<boolean> {
  if (config.resend.enabled) return true;
  const s = await operatorSettings();
  return !!(s && smtpConfigured(s));
}

/** Versendet eine System-Mail (wirft bei Fehler / fehlender Konfiguration). */
export async function sendSystemEmail(msg: SystemMail): Promise<void> {
  if (config.resend.enabled) {
    const resend = new Resend(config.resend.apiKey!);
    const { error } = await resend.emails.send({ from: config.resend.from!, ...msg });
    if (error) throw new Error(error.message);
    return;
  }
  const s = await operatorSettings();
  if (s && smtpConfigured(s)) {
    await smtpSendRaw(s, msg);
    return;
  }
  throw new Error(
    "Kein System-Versand konfiguriert: weder Resend (RESEND_API_KEY/RESEND_FROM) noch ein SMTP-Zugang im Superadmin-Konto.",
  );
}
