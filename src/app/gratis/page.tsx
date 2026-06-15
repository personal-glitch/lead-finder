import type { Metadata } from "next";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Icon, type IconName } from "@/components/icons";

export const metadata: Metadata = {
  title: "3 Gratis-Tools für mehr Neukunden – kostenlos | KundenRadar",
  description:
    "Hol dir 3 kostenlose Tools für deine Neukundengewinnung: Akquise-Vorlagen-Paket (Telefon-Leitfaden + 5 E-Mail-Vorlagen), Kaltakquise-Leitfaden 2026 und einen Akquise-Tracker. Gratis per E-Mail, DSGVO-konform.",
  alternates: { canonical: "/gratis" },
};

const TOOLS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "template",
    title: "Akquise-Vorlagen-Paket (PDF)",
    text: "Telefon-Leitfaden mit Einwand-Behandlung + 5 fertige E-Mail-Vorlagen mit Platzhaltern. Sofort einsetzbar.",
  },
  {
    icon: "health",
    title: "Kaltakquise-Leitfaden 2026 (PDF)",
    text: "Was im B2B erlaubt ist (Telefon, E-Mail, Post), DSGVO-Basics und eine Checkliste für rechtssichere Akquise.",
  },
  {
    icon: "calculator",
    title: "Akquise-Tracker (Excel)",
    text: "Einfache Pipeline-Vorlage mit Status-Dropdown und automatischer Übersicht: Pipeline-Wert, Gewonnen, Abschlussquote.",
  },
];

const STEPS = [
  "E-Mail eintragen und der Verarbeitung zustimmen.",
  "Bestätigungs-Mail öffnen und auf den Link klicken (Double-Opt-In).",
  "Du bekommst sofort eine Mail mit allen 3 Tools zum Download.",
];

export default function GratisPage() {
  return (
    <MarketingShell cta={false} newsletter={false}>
      {/* Hero */}
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-tint)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
        <Icon name="template" size={13} /> 3 Gratis-Tools
      </div>
      <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
        3 kostenlose Tools für{" "}
        <span className="text-[var(--color-brand)]">mehr Neukunden.</span>
      </h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">
        Telefon-Leitfaden, fertige E-Mail-Vorlagen, ein Kaltakquise-Rechtsleitfaden und ein Akquise-Tracker –
        geschnürt für Dienstleister, Handwerk und Reinigungsfirmen. Gratis per E-Mail, jederzeit abbestellbar.
      </p>

      <div className="mt-6">
        <NewsletterSignup
          source="freebie"
          title="Jetzt gratis sichern"
          subtitle="Trag deine E-Mail ein – nach der Bestätigung bekommst du alle 3 Tools sofort zugeschickt."
        />
      </div>
      <p className="mt-3 text-xs text-[var(--color-faint)]">
        ✓ Komplett kostenlos &nbsp;·&nbsp; ✓ Sofort per Mail &nbsp;·&nbsp; ✓ DSGVO-konform &nbsp;·&nbsp; ✓ 1-Klick-Abmeldung
      </p>

      {/* Die 3 Tools */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">Das bekommst du</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <div key={t.title} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]">
              <Icon name={t.icon} size={19} />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t.text}</p>
          </div>
        ))}
      </div>

      {/* So funktioniert's */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">So bekommst du die Tools</h2>
      <ol className="mt-5 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex gap-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {/* Abschluss-CTA */}
      <div className="mt-14 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Hol dir deine 3 Gratis-Tools</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
          Plus jede Woche ein umsetzbarer Tipp für mehr Neukunden – kostenlos und jederzeit abbestellbar.
        </p>
        <div className="mx-auto mt-5 max-w-md text-left">
          <NewsletterSignup source="freebie-footer" title="" subtitle="" variant="bare" />
        </div>
      </div>
    </MarketingShell>
  );
}
