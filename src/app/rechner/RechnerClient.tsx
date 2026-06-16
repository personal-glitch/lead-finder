"use client";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Kalkulator } from "@/components/Kalkulator";
import { FreebieCta } from "@/components/landing/FreebieCta";

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
            <a
              href={"https://wa.me/4915292627062?text=" + encodeURIComponent("Hallo, ich habe eine Frage zum Preis-Rechner.")}
              target="_blank" rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-[#25D366]/40 px-3 py-2 text-sm font-medium text-[#128C7E] hover:bg-[#25D366]/10 sm:inline-flex"
              title="Frage per WhatsApp stellen"
            >
              <svg viewBox="0 0 32 32" width="15" height="15" fill="#25D366" aria-hidden="true">
                <path d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.1.55 4.16 1.6 5.98L4 28l6.22-1.63a11.9 11.9 0 0 0 5.82 1.5h.01c6.6 0 11.96-5.36 11.96-11.96C28.01 9.36 22.64 4 16.04 4zm0 21.9h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.69.97.98-3.6-.24-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.88 9.88 0 0 1 2.91 7.03c0 5.49-4.46 9.95-9.94 9.95zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
              </svg>
              WhatsApp
            </a>
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

        {/* SEO-Inhalt: erklärt die Kalkulation, mehr Substanz + Keywords */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">So kalkulierst du deinen Preis richtig</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <p>
              Viele Dienstleister verkaufen sich unter Wert, weil sie nur ihren Lohn ansetzen. Dein
              <strong> Stundenverrechnungssatz</strong> muss aber <em>alle</em> Kosten decken: Lohn und Lohnnebenkosten,
              Fahrzeug und Material, Versicherungen, Werkzeug, Verwaltung – plus einen Gewinnaufschlag. Diese Summe teilst du
              durch deine wirklich <strong>verrechenbaren Stunden</strong> (nicht alle Arbeitsstunden sind abrechenbar).
            </p>
            <p>
              Für ein <strong>Angebot</strong> rechnest du anschließend: geschätzter Aufwand in Stunden × Stundensatz,
              plus Material und Anfahrt. So kommst du auf einen <strong>Angebotspreis</strong>, der dich nicht draufzahlen
              lässt. Genau das nehmen dir die Rechner oben ab – für Gebäudereinigung, Handwerk, Agentur, Webdesign, SEO und
              Personalvermittlung.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { q: "Wie hoch sollte mein Stundensatz sein?", a: "Als Faustregel liegt der Verrechnungssatz oft beim 2–3-fachen des reinen Stundenlohns – weil Nebenkosten, Ausfallzeiten und Gewinn mit hineinmüssen." },
              { q: "Warum ist der Stundensatz höher als mein Lohn?", a: "Weil Urlaub, Krankheit, Verwaltung, Werkzeug, Versicherung und unproduktive Zeiten mitfinanziert werden müssen – sonst bleibt am Monatsende nichts übrig." },
              { q: "Was kostet Gebäudereinigung pro m²?", a: "Das hängt von Reinigungsart, Fläche und Tariflohn ab. Der Reinigungskosten-Rechner oben rechnet dir Preis pro Einsatz, pro Monat und pro m² aus." },
              { q: "Wie kalkuliere ich ein Angebot?", a: "Aufwand in Stunden schätzen, mit deinem Verrechnungssatz multiplizieren, Material und Anfahrt addieren – fertig ist ein belastbarer Angebotspreis." },
            ].map((f) => (
              <div key={f.q} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <h3 className="text-sm font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mail-Capture: Rechner-Besucher kalkulieren Preise → brauchen Kunden → Freebie passt */}
        <div className="mx-auto mt-12 max-w-3xl">
          <FreebieCta source="rechner" />
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
