import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { confirmNewsletter } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Anmeldung bestätigen – KundenRadar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? await confirmNewsletter(token) : null;

  return (
    <MarketingShell cta={false} newsletter={false}>
      {email ? (
        <>
          <h1 className="text-2xl font-semibold">Anmeldung bestätigt ✓</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Danke! <b>{email}</b> ist jetzt für den KundenRadar-Newsletter angemeldet. Du kannst
            dich jederzeit über den Link in jeder E-Mail wieder abmelden.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]"
          >
            Zur Startseite
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Link ungültig oder abgelaufen</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Dieser Bestätigungslink ist nicht (mehr) gültig. Bitte melde dich einfach erneut an.
          </p>
          <Link
            href="/newsletter"
            className="mt-6 inline-flex rounded-lg border border-[var(--color-line-strong)] px-5 py-3 text-sm font-semibold hover:bg-[var(--color-subtle)]"
          >
            Zur Newsletter-Anmeldung
          </Link>
        </>
      )}
    </MarketingShell>
  );
}
