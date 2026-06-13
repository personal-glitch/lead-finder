"use client";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Kalkulator } from "@/components/Kalkulator";

export default function RechnerClient() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" title="Zur Startseite">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
              <Icon name="agents" size={17} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold">KundenRadar</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[var(--color-ink-2)] md:flex">
            <Link href="/" className="hover:text-[var(--color-ink)]">Startseite</Link>
            <Link href="/#funktionen" className="hover:text-[var(--color-ink)]">Funktionen</Link>
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
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
          <Icon name="chevronLeft" size={14} /> Zurück zur Startseite
        </Link>
        <div className="text-center">
          <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Gratis-Rechner</span>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
            Was solltest du <span className="text-[var(--color-brand)]">verlangen</span>?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
            Angebotspreis für Gebäudereinigung, Stundenverrechnungssatz fürs Handwerk oder den nötigen Satz für deine Dienstleistung – einfach ausrechnen.
          </p>
        </div>

        <div className="mt-8">
          <Kalkulator teaser />
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
          Den vollen Kalkulator gibt's dauerhaft im Tool – inkl. Neukunden-Suche, Pipeline & Anruf-Verwaltung.{" "}
          <Link href="/registrieren" className="font-medium text-[var(--color-brand)] hover:underline">Jetzt kostenlos starten →</Link>
        </p>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Alle Gratis-Rechner</h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[
              { href: "/rechner/gebaeudereinigung", label: "Reinigungskosten" },
              { href: "/rechner/handwerk-stundensatz", label: "Handwerk-Stundensatz" },
              { href: "/rechner/agentur-stundensatz", label: "Agentur-Stundensatz" },
              { href: "/rechner/webdesign-preis", label: "Webdesign-Preis" },
              { href: "/rechner/seo-kosten", label: "SEO-Kosten" },
              { href: "/rechner/personalvermittlung-provision", label: "Personalvermittlung & Zeitarbeit" },
              { href: "/rechner/maler-stundensatz", label: "Maler-Stundensatz" },
              { href: "/rechner/elektriker-stundensatz", label: "Elektriker-Stundensatz" },
              { href: "/rechner/garten-landschaftsbau-stundensatz", label: "GaLaBau-Stundensatz" },
              { href: "/rechner/dachdecker-stundensatz", label: "Dachdecker-Stundensatz" },
              { href: "/rechner/fliesenleger-stundensatz", label: "Fliesenleger-Stundensatz" },
              { href: "/rechner/tischler-schreiner-stundensatz", label: "Tischler-Stundensatz" },
              { href: "/rechner/reinigungskosten-pro-quadratmeter", label: "Reinigungskosten pro m²" },
              { href: "/rechner/neukunde-kosten", label: "Was kostet ein Neukunde?" },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {r.label}
              </Link>
            ))}
            <Link href="/blog" className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">Blog →</Link>
          </div>
        </div>

        {/* CTA-Band: macht die Seite lebendig und führt zurück ins Angebot */}
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-7 text-center">
          <h2 className="text-lg font-semibold">Mehr als nur ein Rechner</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Mit KundenRadar findest du die passenden Kunden gleich dazu – anrufbare Firmen mit Telefon &amp; Ansprechpartner,
            plus Pipeline, Anrufe &amp; E-Mail in einem Tool.
          </p>
          <Link href="/registrieren" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Kostenlos starten <Icon name="chevronRight" size={15} />
          </Link>
          <p className="mt-2 text-xs text-[var(--color-muted)]">3 Tage gratis · danach 49 €/Monat · jederzeit kündbar</p>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-[var(--color-faint)]">
        <Link href="/" className="hover:text-[var(--color-ink)]">Startseite</Link>
        {" · "}
        <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
        {" · "}
        <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
      </footer>
    </div>
  );
}
