import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { unsubscribeNewsletter } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Newsletter abmelden – KundenRadar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? await unsubscribeNewsletter(token) : null;

  return (
    <MarketingShell cta={false} newsletter={false}>
      {email ? (
        <>
          <h1 className="text-2xl font-semibold">Abgemeldet ✓</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            <b>{email}</b> erhält keine Newsletter mehr von uns. Schade, dass du gehst – du kannst
            dich jederzeit wieder anmelden.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Link ungültig</h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Dieser Abmeldelink ist nicht gültig. Falls du weiter E-Mails bekommst, schreib uns kurz
            an kontakt@seciora-solutions.de – wir nehmen dich manuell heraus.
          </p>
        </>
      )}
      <Link href="/" className="mt-6 inline-flex rounded-lg border border-[var(--color-line-strong)] px-5 py-3 text-sm font-semibold hover:bg-[var(--color-subtle)]">
        Zur Startseite
      </Link>
    </MarketingShell>
  );
}
