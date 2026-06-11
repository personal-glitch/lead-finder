"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";
import { cx } from "@/components/ui";

type Mode = "login" | "signup";

const INPUT =
  "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 px-3 text-sm outline-none focus:border-[var(--color-brand)]";

/** Nur interne Ziele erlauben (kein Open-Redirect). */
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

const ERROR_DE: Record<string, string> = {
  "Invalid login credentials": "E-Mail oder Passwort ist falsch.",
  "Email not confirmed": "Bitte bestätige zuerst deine E-Mail-Adresse.",
  "User already registered": "Diese E-Mail ist bereits registriert. Melde dich an.",
  "Password should be at least 6 characters": "Das Passwort muss mindestens 8 Zeichen haben.",
  "Password should be at least 8 characters": "Das Passwort muss mindestens 8 Zeichen haben.",
};

export function AuthForm({
  mode,
  next,
  plan,
  startTrial,
}: {
  mode: Mode;
  next?: string;
  plan?: string;
  /** true = nach Registrierung direkt in den Trial-Checkout (Zahlungsmethode hinterlegen). */
  startTrial?: boolean;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const dest = safeNext(next);
  const translate = (msg: string) => ERROR_DE[msg] ?? msg;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSignup) {
      if (!firstName.trim() || !lastName.trim() || !company.trim() || !phone.trim() || !email.trim() || !password) {
        setError("Bitte alle Felder ausfüllen.");
        return;
      }
      if (password.length < 8) { setError("Das Passwort muss mindestens 8 Zeichen haben."); return; }
      if (!consent) { setError("Bitte bestätige die Unternehmereigenschaft sowie AGB und Datenschutz."); return; }
    } else if (!email.trim() || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(startTrial ? "/abo" : dest)}`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              company: company.trim(),
              phone: phone.trim(),
              consent_at: new Date().toISOString(),
            },
          },
        });
        if (error) { setError(translate(error.message)); return; }
        // Optionales Newsletter-Abo (Double-Opt-In) – darf die Registrierung nie blockieren.
        if (newsletterOptIn) {
          try {
            await fetch("/api/newsletter/subscribe", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email: email.trim(), name: firstName.trim(), source: "registrierung" }),
            });
          } catch { /* ignorieren */ }
        }
        if (!data.session) { setSentTo(email.trim()); return; }
        if (plan) {
          try {
            await fetch("/api/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
          } catch { /* darf den Einstieg nicht blockieren */ }
        }
        // Mit Stripe: direkt in den Trial-Checkout (Zahlungsmethode), sonst ins Tool.
        if (startTrial) {
          try {
            const res = await fetch("/api/billing/checkout", { method: "POST" });
            const json = await res.json();
            if (json?.url) { window.location.href = json.url; return; }
          } catch { /* Fallback unten */ }
        }
        router.push(dest);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setError(translate(error.message)); return; }
        router.push(dest);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Es ist ein Fehler aufgetreten.");
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-success-tint)] text-[var(--color-success)]">
          <Icon name="mail" size={22} />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Fast geschafft</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Wir haben dir eine Bestätigung an <span className="font-medium text-[var(--color-ink)]">{sentTo}</span> geschickt.
            Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
          </p>
        </div>
        <Link href="/login" className="inline-block text-sm font-medium text-[var(--color-brand)] hover:underline">Zur Anmeldung</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {isSignup && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Vorname</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="Max" className={INPUT} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Nachname</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="Mustermann" className={INPUT} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Firma</span>
            <input value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" placeholder="Muster Dienstleistungen GmbH" className={INPUT} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Telefon</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+49 …" className={INPUT} />
          </label>
        </>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">E-Mail</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]"><Icon name="mail" size={16} /></span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@firma.de"
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand)]" />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-2)]">Passwort</span>
        <div className="relative">
          <input type={show ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? "Mind. 6 Zeichen" : "Dein Passwort"}
            className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 pl-3 pr-16 text-sm outline-none focus:border-[var(--color-brand)]" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            {show ? "verbergen" : "zeigen"}
          </button>
        </div>
      </label>

      {isSignup && (
        <label className="flex cursor-pointer items-start gap-2 text-xs text-[var(--color-muted)]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
          <span>Ich handle als Unternehmer (gewerblich oder selbstständig) und akzeptiere die <Link href="/agb" target="_blank" className="text-[var(--color-brand)] hover:underline">AGB</Link> und die <Link href="/datenschutz" target="_blank" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</Link>.</span>
        </label>
      )}

      {isSignup && (
        <label className="flex cursor-pointer items-start gap-2 text-xs text-[var(--color-muted)]">
          <input type="checkbox" checked={newsletterOptIn} onChange={(e) => setNewsletterOptIn(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
          <span>Schickt mir den kostenlosen Newsletter mit Tipps für mehr Neukunden (jederzeit abbestellbar). Du bekommst eine kurze Bestätigungs-Mail.</span>
        </label>
      )}

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-danger-tint)] px-3 py-2 text-xs text-[var(--color-danger)]">
          <Icon name="x" size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <button type="submit" disabled={busy}
        className={cx("flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-[var(--color-on-brand)] transition hover:bg-[var(--color-brand-ink)] disabled:opacity-60")}>
        {busy ? "…" : isSignup ? "Konto erstellen" : "Anmelden"}
        {!busy && <Icon name="chevronRight" size={15} />}
      </button>
    </form>
  );
}
