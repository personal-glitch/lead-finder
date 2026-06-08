import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Anmelden – KundenRadar" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Lokaler Demo-Modus (keine Auth konfiguriert): direkt ins Tool.
  if (!config.supabase.enabled) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Willkommen zurück"
      subtitle="Melde dich an, um deine Kunden-Pipeline zu öffnen."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="font-medium text-[var(--color-brand)] hover:underline">
            Kostenlos registrieren
          </Link>
        </>
      }
    >
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
