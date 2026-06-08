// Funktionierender Abmelde-/Opt-out-Link aus jeder Outreach-Mail.
// Trägt die Adresse in die Suppressions-Tabelle ein (wird bei jedem Versand geprüft).
import { getStore } from "@/lib/db";
import { DEV_OWNER_ID } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AbmeldenPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; owner?: string }>;
}) {
  const { email, owner } = await searchParams;
  let done = false;
  let error: string | null = null;

  if (email && /.+@.+\..+/.test(email)) {
    try {
      await getStore().addSuppression(
        owner || DEV_OWNER_ID,
        email,
        "Abmeldung über Link",
      );
      done = true;
    } catch (e) {
      error = e instanceof Error ? e.message : "Unbekannter Fehler.";
    }
  } else {
    error = "Es wurde keine gültige E-Mail-Adresse übergeben.";
  }

  return (
    <main className="mx-auto max-w-lg p-10">
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-xl font-semibold">
          {done ? "Sie wurden abgemeldet" : "Abmeldung"}
        </h1>
        {done ? (
          <p className="mt-3 text-[var(--color-muted)]">
            Die Adresse <strong>{email}</strong> erhält keine weiteren E-Mails von
            uns. Sie können dieses Fenster schließen.
          </p>
        ) : (
          <p className="mt-3 text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    </main>
  );
}
