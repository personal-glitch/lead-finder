"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { trackEvent } from "@/lib/analytics";
import { CATEGORIES, type CustomerType } from "@/lib/marketplace-constants";

const inputCls =
  "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

export function ServiceRequestForm() {
  const [customerType, setCustomerType] = useState<CustomerType>("privat");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setState("error"); setMsg("Bitte stimme der Verarbeitung zu."); return; }
    setState("loading"); setMsg("");
    try {
      await api("/api/auftraege", {
        json: { customerType, category, title, description, plz, ort, budget, name, email, phone, consent, website: hp },
      });
      trackEvent("generate_lead", { source: "auftragsboerse", type: "service_request" });
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
        <h2 className="mt-2 text-lg font-semibold">Anfrage abgeschickt!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
          Wir haben dir eine Bestätigung per E-Mail geschickt. Passende Dienstleister können dir jetzt Angebote senden –
          die Antworten kommen direkt in dein Postfach.
        </p>
        <button
          onClick={() => { setState("idle"); setTitle(""); setDescription(""); setBudget(""); setConsent(false); }}
          className="mt-4 rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-subtle)]"
        >
          Weitere Anfrage stellen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="flex gap-2">
        {(["privat", "gewerblich"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setCustomerType(t)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${
              customerType === t
                ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-on-brand)]"
                : "border-[var(--color-line-strong)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
            }`}>
            {t === "privat" ? "Privat" : "Gewerblich"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Was brauchst du? *</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Budget (optional)</span>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="z. B. 500 € / monatlich" className={inputCls} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Kurztitel *</span>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Büroreinigung 2× pro Woche, 200 m²" className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Beschreibung *</span>
        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibe kurz, was gemacht werden soll – Umfang, Häufigkeit, Wunschtermin …" className={inputCls} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">PLZ</span>
          <input value={plz} onChange={(e) => setPlz(e.target.value)} placeholder="50667" className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Ort</span>
          <input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Köln" className={inputCls} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Name *</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- &amp; Nachname" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">E-Mail *</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@mail.de" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Telefon (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0151 …" className={inputCls} />
        </label>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" />

      <label className="flex items-start gap-2 text-xs leading-snug text-[var(--color-muted)]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
        <span>
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert und an passende Dienstleister
          weitergegeben werden. Es gilt die{" "}
          <Link href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</Link>.
        </span>
      </label>

      {state === "error" && <p className="text-sm text-[var(--color-danger)]">{msg}</p>}

      <button type="submit" disabled={state === "loading"}
        className="w-full rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60">
        {state === "loading" ? "Wird gesendet …" : "Kostenlos Angebote einholen"}
      </button>
      <p className="text-center text-[11px] text-[var(--color-muted)]">100 % kostenlos &amp; unverbindlich · keine versteckten Kosten</p>
    </form>
  );
}
