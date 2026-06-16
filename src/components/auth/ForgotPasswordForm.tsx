"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Bitte gib deine E-Mail-Adresse ein."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      // Recovery-Link führt über den Auth-Callback (Session) auf die Seite zum neuen Passwort.
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/passwort-neu`,
      });
      // Aus Sicherheitsgründen immer Erfolg melden (keine Konto-Enumeration).
      if (error && !/rate/i.test(error.message)) { /* trotzdem neutral bestätigen */ }
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-success-tint)] text-[var(--color-success)]">
          <Icon name="mail" size={22} />
        </span>
        <div>
          <h2 className="text-lg font-semibold">E-Mail unterwegs</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Falls ein Konto mit <span className="font-medium text-[var(--color-ink)]">{email.trim()}</span> existiert,
            haben wir dir einen Link zum Zurücksetzen des Passworts geschickt. Schau auch im Spam-Ordner nach.
          </p>
        </div>
        <Link href="/login" className="inline-block text-sm font-medium text-[var(--color-brand)] hover:underline">Zur Anmeldung</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">E-Mail</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"><Icon name="mail" size={16} /></span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@firma.de"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand)]" />
        </div>
      </label>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-danger-tint)] px-3 py-2 text-xs text-[var(--color-danger)]">
          <Icon name="x" size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <button type="submit" disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-[var(--color-on-brand)] transition hover:bg-[var(--color-brand-ink)] disabled:opacity-60">
        {busy ? "…" : "Link zum Zurücksetzen senden"}
        {!busy && <Icon name="chevronRight" size={15} />}
      </button>
    </form>
  );
}
