import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { isPlanKey, planOf, TRIAL_DAYS } from "@/lib/plans";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Kostenlos registrieren – KundenRadar" };
export const dynamic = "force-dynamic";

export default async function RegistrierenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; plan?: string }>;
}) {
  // Lokaler Demo-Modus (keine Auth konfiguriert): direkt ins Tool.
  if (!config.supabase.enabled) redirect("/dashboard");
  const { next, plan } = await searchParams;
  const planKey = plan && isPlanKey(plan) ? plan : undefined;
  const trial = config.stripe.enabled;

  return (
    <AuthShell
      title="Konto erstellen"
      subtitle={
        trial
          ? `${TRIAL_DAYS} Tage kostenlos testen – Zahlungsmethode hinterlegen, in den ersten ${TRIAL_DAYS} Tagen wird nichts berechnet.`
          : planKey
            ? `Du startest mit dem Paket „${planOf(planKey).name}". In 60 Sekunden einsatzbereit.`
            : "Finde anrufbare Neukunden für dein Geschäft – in 60 Sekunden startklar."
      }
      footer={
        <>
          Schon registriert?{" "}
          <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">
            Anmelden
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" next={next} plan={planKey} startTrial={trial} />
      <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--color-faint)]">
        Mit der Registrierung stimmst du unserer{" "}
        <Link href="/datenschutz" className="underline hover:text-[var(--color-muted)]">Datenschutzerklärung</Link>{" "}zu.
      </p>
    </AuthShell>
  );
}
