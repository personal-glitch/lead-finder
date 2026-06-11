"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Icon } from "@/components/icons";

const KEY = "kr-newsletter-optin-dismissed";

/** 1-Klick-Newsletter-Abo für eingeloggte Nutzer (Einwilligung per Klick, dokumentiert). */
export function NewsletterOptInCard() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "hidden">("idle");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(KEY)) setState("hidden");
  }, []);

  if (state === "hidden") return null;

  const subscribe = async () => {
    setState("loading");
    try {
      await api("/api/newsletter/optin", { json: {} });
      setState("done");
      if (typeof window !== "undefined") localStorage.setItem(KEY, "1");
    } catch {
      setState("idle");
    }
  };
  const dismiss = () => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, "1");
    setState("hidden");
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 px-4 py-3 text-sm">
        <Icon name="check" size={16} className="text-[var(--color-brand)]" />
        <span>Abonniert – dein erster Tipp kommt sofort per E-Mail. Danke!</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
      <div className="flex items-start gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]">
          <Icon name="mail" size={18} />
        </span>
        <div className="text-sm">
          <div className="font-medium">Newsletter abonnieren</div>
          <div className="text-xs text-[var(--color-muted)]">Jede Woche ein Tipp für mehr Neukunden – kostenlos, 1-Klick-Abmeldung.</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={subscribe}
          disabled={state === "loading"}
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
        >
          {state === "loading" ? "…" : "Abonnieren"}
        </button>
        <button onClick={dismiss} aria-label="Ausblenden" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-subtle)]">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
