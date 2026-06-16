import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

export const metadata: Metadata = { title: "Neues Passwort – KundenRadar" };
export const dynamic = "force-dynamic";

export default function PasswortNeuPage() {
  if (!config.supabase.enabled) redirect("/dashboard");
  return (
    <AuthShell
      title="Neues Passwort vergeben"
      subtitle="Wähle ein neues Passwort für dein Konto."
      footer={
        <>
          Zurück zur{" "}
          <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">Anmeldung</Link>
        </>
      }
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
