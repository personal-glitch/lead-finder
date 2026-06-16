"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

export function NewPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nach dem Klick auf den Recovery-Link hat der Auth-Callback bereits eine Session gesetzt.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setReady(data.user ? "ok" : "invalid")).catch(() => setReady("invalid"));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Das Passwort muss mindestens 8 Zeichen haben."); return; }
    if (password !== confirm) { setError("Die Passwörter stimmen nicht überein."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setError(error.message); return; }
      setDone(true);
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Es ist ein Fehler aufgetreten.");
    } finally {
      setBusy(false);
    }
  };

  if (ready === "checking") {
    return <p className="py-6 text-center text-sm text-[var(--color-muted)]">Lädt …</p>;
  }
  if (ready === "invalid") {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Dieser Link ist ungültig oder abgelaufen. Fordere bitte einen neuen Link an.
        </p>
        <Link href="/passwort-vergessen" className="inline-block text-sm font-medium text-[var(--color-brand)] hover:underline">Neuen Link anfordern</Link>
      </div>
    );
  }
  if (done) {
    return (
      <div className="space-y-3 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-success-tint)] text-[var(--color-success)]">
          <Icon name="check" size={22} />
        </span>
        <p className="text-sm font-medium">Passwort geändert. Du wirst weitergeleitet …</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Neues Passwort</span>
        <div className="relative">
          <input type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Mind. 8 Zeichen"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 pl-3 pr-16 text-sm outline-none focus:border-[var(--color-brand)]" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            {show ? "verbergen" : "zeigen"}
          </button>
        </div>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Passwort wiederholen</span>
        <input type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Nochmal eingeben"
          className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 px-3 text-sm outline-none focus:border-[var(--color-brand)]" />
      </label>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-danger-tint)] px-3 py-2 text-xs text-[var(--color-danger)]">
          <Icon name="x" size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <button type="submit" disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-[var(--color-on-brand)] transition hover:bg-[var(--color-brand-ink)] disabled:opacity-60">
        {busy ? "…" : "Passwort speichern"}
        {!busy && <Icon name="chevronRight" size={15} />}
      </button>
    </form>
  );
}
