"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { trackEvent } from "@/lib/analytics";

const inputCls =
  "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

export function CompanyContactForm({ slug, companyName }: { slug: string; companyName: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setState("error"); setMsg("Bitte stimme der Verarbeitung zu."); return; }
    setState("loading"); setMsg("");
    try {
      await api("/api/firmen/kontakt", {
        json: { slug, name, email, phone, message, consent, website_hp: hp },
      });
      trackEvent("generate_lead", { source: "firmen_katalog", type: "company_contact" });
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
        <div className="text-2xl">✅</div>
        <h2 className="mt-2 text-lg font-semibold">Anfrage gesendet!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
          Wir haben deine Anfrage zu {companyName} erhalten und leiten sie an den Anbieter weiter. Du bekommst in der
          Regel innerhalb von 1–2 Werktagen eine Rückmeldung. Eine Bestätigung liegt in deinem Postfach.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Dein Name *</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- &amp; Nachname" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">E-Mail *</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@mail.de" className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Telefon (optional)</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0151 …" className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Deine Anfrage *</span>
        <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder={`Was brauchst du von ${companyName}? Beschreibe kurz dein Anliegen, Umfang und Wunschtermin.`} className={inputCls} />
      </label>

      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" />

      <label className="flex items-start gap-2 text-xs leading-snug text-[var(--color-muted)]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
        <span>
          Ich bin einverstanden, dass meine Anfrage zur Bearbeitung gespeichert und an den Anbieter weitergeleitet wird.
          Es gilt die{" "}
          <Link href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</Link>.
        </span>
      </label>

      {state === "error" && <p className="text-sm text-[var(--color-danger)]">{msg}</p>}

      <button type="submit" disabled={state === "loading"}
        className="w-full rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60">
        {state === "loading" ? "Wird gesendet …" : "Anfrage senden"}
      </button>
      <p className="text-center text-[11px] text-[var(--color-muted)]">Kostenlos &amp; unverbindlich · Kontakt läuft sicher über KundenRadar</p>
    </form>
  );
}
