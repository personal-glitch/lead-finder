import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Passwort vergessen – KundenRadar" };
export const dynamic = "force-dynamic";

export default function PasswortVergessenPage() {
  if (!config.supabase.enabled) redirect("/dashboard");
  return (
    <AuthShell
      title="Passwort vergessen?"
      subtitle="Gib deine E-Mail ein – wir senden dir einen Link zum Zurücksetzen."
      footer={
        <>
          Wieder eingefallen?{" "}
          <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">Zur Anmeldung</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
