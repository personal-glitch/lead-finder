import { z } from "zod";
import { jsonOk, jsonError } from "@/lib/api";
import { config } from "@/lib/config";
import { getStore, getOwnerId } from "@/lib/db";
import { planOf, isPlanKey } from "@/lib/plans";
import { encryptSecret } from "@/lib/crypto";
import type { Settings } from "@/lib/types";

/** Nach außen sichtbare Settings – OHNE das SMTP-Passwort (nur ob gesetzt). */
function publicSettings(s: Settings) {
  const emailReady = Boolean(s.smtpHost && s.smtpUser && s.smtpPass && s.senderEmail);
  return {
    callGoal: s.callGoal ?? config.targets.callsPerDay,
    senderImpressum: s.senderImpressum ?? config.resend.impressum ?? "",
    plan: planOf(s.plan).key,
    senderName: s.senderName ?? "",
    senderEmail: s.senderEmail ?? "",
    smtpHost: s.smtpHost ?? "",
    smtpPort: s.smtpPort ?? null,
    smtpUser: s.smtpUser ?? "",
    smtpPassSet: Boolean(s.smtpPass),
    emailReady,
    subscriptionStatus: s.subscriptionStatus ?? null,
    subscriptionRenewsAt: s.subscriptionRenewsAt ?? null,
    cancelAtPeriodEnd: Boolean(s.cancelAtPeriodEnd),
  };
}

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    const store = getStore();
    const [s, agents, leads] = await Promise.all([
      store.getSettings(ownerId),
      store.listAgents(ownerId),
      store.listLeads(ownerId),
    ]);
    return jsonOk({ settings: publicSettings(s), usage: { agents: agents.length, leads: leads.length } });
  } catch (err) {
    return jsonError(err);
  }
}

const Body = z.object({
  callGoal: z.number().int().positive().max(1000).optional(),
  senderImpressum: z.string().nullish(),
  plan: z.string().optional(),
  senderName: z.string().max(120).nullish(),
  senderEmail: z.string().max(200).nullish(),
  smtpHost: z.string().max(200).nullish(),
  smtpPort: z.number().int().positive().max(65535).nullish(),
  smtpUser: z.string().max(200).nullish(),
  // Klartext-Passwort vom Client; wird hier verschlüsselt. Leer/fehlt = unverändert lassen.
  smtpPass: z.string().nullish(),
});

const clean = (v: string | null | undefined) => (v?.trim() ? v.trim() : null);

export async function PATCH(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const b = Body.parse(await req.json());
    const patch: Partial<Settings> = {};
    if (b.callGoal !== undefined) patch.callGoal = b.callGoal;
    if (b.senderImpressum !== undefined) patch.senderImpressum = clean(b.senderImpressum);
    if (b.plan !== undefined && isPlanKey(b.plan)) patch.plan = b.plan;
    if (b.senderName !== undefined) patch.senderName = clean(b.senderName);
    if (b.senderEmail !== undefined) patch.senderEmail = clean(b.senderEmail);
    if (b.smtpHost !== undefined) patch.smtpHost = clean(b.smtpHost);
    if (b.smtpPort !== undefined) patch.smtpPort = b.smtpPort ?? null;
    if (b.smtpUser !== undefined) patch.smtpUser = clean(b.smtpUser);
    // Passwort nur überschreiben, wenn wirklich ein neues gesendet wurde.
    if (b.smtpPass && b.smtpPass.trim()) patch.smtpPass = encryptSecret(b.smtpPass.trim());

    const s = await getStore().updateSettings(ownerId, patch);
    return jsonOk({ settings: publicSettings(s) });
  } catch (err) {
    return jsonError(err);
  }
}
