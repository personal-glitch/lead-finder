"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

interface Props {
  source?: string;
  title?: string;
  subtitle?: string;
  /** "card" = umrahmte Box (Default), "bare" = ohne Rahmen (z. B. im Footer). */
  variant?: "card" | "bare";
  className?: string;
}

export function NewsletterSignup({
  source = "homepage",
  title = "Newsletter: Tipps für mehr Neukunden",
  subtitle = "Praxis-Tipps zu Akquise, Kaltakquise-Recht und KundenRadar – kostenlos, jederzeit abbestellbar.",
  variant = "card",
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setState("error");
      setMsg("Bitte stimme der Verarbeitung zu.");
      return;
    }
    setState("loading");
    try {
      const r = await api<{ ok: boolean; message: string }>("/api/newsletter/subscribe", {
        json: { email, source, website },
      });
      setState("done");
      setMsg(r.message);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    }
  }

  const box =
    variant === "card"
      ? "rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6"
      : "";

  if (state === "done") {
    return (
      <div className={`${box} ${className}`}>
        <p className="text-sm font-medium text-[var(--color-brand)]">✓ {msg}</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Wir senden erst E-Mails, nachdem du den Bestätigungslink geklickt hast (Double-Opt-In).
        </p>
      </div>
    );
  }

  return (
    <div className={`${box} ${className}`}>
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      {subtitle && <p className="mt-1 text-xs text-[var(--color-muted)]">{subtitle}</p>}
      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@firma.de"
            className="min-w-0 flex-1 rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="shrink-0 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
          >
            {state === "loading" ? "Sende…" : "Anmelden"}
          </button>
        </div>
        {/* Honeypot – für Menschen unsichtbar */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <label className="flex items-start gap-2 text-[11px] leading-snug text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Ich möchte den Newsletter erhalten und akzeptiere die{" "}
            <Link href="/datenschutz" className="text-[var(--color-brand)] hover:underline">
              Datenschutzerklärung
            </Link>
            . Abmeldung jederzeit über den Link in jeder E-Mail.
          </span>
        </label>
        {state === "error" && <p className="text-xs text-[var(--color-danger)]">{msg}</p>}
      </form>
    </div>
  );
}
