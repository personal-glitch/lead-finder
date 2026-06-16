"use client";
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { api } from "@/lib/client";
import { trackEvent } from "@/lib/analytics";

// Ergebnis-per-Mail-Erfassung am Ende der Gratis-Rechner: schickt dem Nutzer sein
// Ergebnis zu (transaktional) und nimmt ihn – mit Einwilligung – in den Verteiler auf.
export function RechnerLeadForm({
  modus, headlineLabel, headlineValue, sub, breakdown,
}: {
  modus: string;
  headlineLabel: string;
  headlineValue: string;
  sub?: string;
  breakdown?: { label: string; value: string }[];
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState(""); // Honeypot
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setState("error"); setMsg("Bitte stimme der Verarbeitung zu."); return; }
    setState("loading");
    try {
      await api("/api/rechner/lead", { json: { email, consent, website: hp, modus, headlineLabel, headlineValue, sub, breakdown } });
      setState("done");
      trackEvent("generate_lead", { source: `rechner-${modus}`, type: "rechner" });
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    }
  }

  if (state === "done") {
    return (
      <Card className="mt-3 border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-4 text-center">
        <p className="text-sm font-semibold text-[var(--color-brand)]">✓ Ergebnis ist unterwegs an deine Mail!</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-[var(--color-muted)]">
          Bestätige kurz die Anmeldung in der E-Mail – dann bekommst du auch die 3 Gratis-Akquise-Tools.
        </p>
        <Link href="/registrieren" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
          KundenRadar 3 Tage gratis testen
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mt-3 border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-4">
      <p className="text-center text-sm font-semibold">📩 Ergebnis + Angebots-Tipps per Mail sichern</p>
      <p className="mx-auto mt-1 max-w-sm text-center text-xs text-[var(--color-muted)]">
        Volle Aufschlüsselung sofort in dein Postfach – plus 3 Gratis-Akquise-Tools (Vorlagen, Leitfaden, Tracker).
      </p>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@firma.de"
            className="min-w-0 flex-1 rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          />
          <button type="submit" disabled={state === "loading"}
            className="shrink-0 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60">
            {state === "loading" ? "Sende…" : "Ergebnis senden"}
          </button>
        </div>
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" />
        <label className="flex items-start gap-2 text-[11px] leading-snug text-[var(--color-muted)]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
          <span>
            Schick mir das Ergebnis und künftig Akquise-Tipps (Newsletter). Es gilt die{" "}
            <Link href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</Link>. Abmeldung jederzeit.
          </span>
        </label>
        {state === "error" && <p className="text-xs text-[var(--color-danger)]">{msg}</p>}
      </form>
    </Card>
  );
}
