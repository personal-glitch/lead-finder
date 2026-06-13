"use client";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Kalkulator } from "@/components/Kalkulator";
import type { KalkModus } from "@/lib/kalkulator";

export interface RelLink { href: string; label: string }

export function RechnerLandingShell({ modus, eyebrow, h1, intro, content, faqs, related }: {
  modus: KalkModus;
  eyebrow: string;
  h1: React.ReactNode;
  intro: string;
  content: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  related: RelLink[];
}) {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }) }}
        />
      )}
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
              <Icon name="agents" size={17} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold">KundenRadar</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[var(--color-ink-2)] md:flex">
            <Link href="/" className="hover:text-[var(--color-ink)]">Startseite</Link>
            <Link href="/rechner" className="hover:text-[var(--color-ink)]">Alle Rechner</Link>
            <Link href="/#preise" className="hover:text-[var(--color-ink)]">Preise</Link>
            <Link href="/blog" className="hover:text-[var(--color-ink)]">Blog</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]">Anmelden</Link>
            <Link href="/registrieren" className="rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Starten</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">{eyebrow}</span>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">{h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-muted)]">{intro}</p>
        </div>

        <div className="mt-8">
          <Kalkulator teaser defaultModus={modus} />
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-10">
          {content.map((c) => (
            <section key={c.title}>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{c.text}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
            <div className="mt-3 space-y-4">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-sm font-medium">{f.q}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">Weitere Rechner</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link key={r.href} href={r.href} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                    {r.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
            <h2 className="text-lg font-semibold">Mehr als nur ein Rechner</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              Mit KundenRadar findest du die passenden Kunden gleich dazu – anrufbare Firmen mit Telefon & Ansprechpartner,
              plus Pipeline, Anrufe & Aufgaben in einem Tool.
            </p>
            <Link href="/registrieren" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
              Kostenlos starten <Icon name="chevronRight" size={15} />
            </Link>
            <p className="mt-2 text-xs text-[var(--color-muted)]">3 Tage gratis · keine Vorab-Zahlung · jederzeit kündbar</p>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-[var(--color-faint)]">
        <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
        {" · "}
        <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
        {" · "}
        <Link href="/rechner" className="hover:text-[var(--color-ink)]">Alle Rechner</Link>
      </footer>
    </div>
  );
}
