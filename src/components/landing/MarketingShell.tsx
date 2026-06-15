import Link from "next/link";
import { Icon } from "@/components/icons";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

/** Gemeinsame Hülle (Header + Footer + CTA) für Blog & weitere SEO-Landingpages. */
export function MarketingShell({
  children,
  cta = true,
  newsletter = true,
}: {
  children: React.ReactNode;
  cta?: boolean;
  newsletter?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
              <Icon name="agents" size={17} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold">KundenRadar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] sm:block">Blog</Link>
            <Link href="/login" className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]">Anmelden</Link>
            <Link href="/registrieren" className="rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Starten</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {children}

        {cta && (
          <section className="mt-14 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
            <h2 className="text-lg font-semibold">Neue Kunden finden – ohne stundenlanges Googeln</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              KundenRadar liefert dir anrufbare Firmen mit Telefon &amp; Ansprechpartner und bündelt Pipeline,
              Anrufe, Aufgaben &amp; E-Mail in einem Tool.
            </p>
            <Link href="/registrieren" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
              Kostenlos starten <Icon name="chevronRight" size={15} />
            </Link>
            <p className="mt-2 text-xs text-[var(--color-muted)]">3 Tage gratis · keine Vorab-Zahlung · jederzeit kündbar</p>
          </section>
        )}

        {newsletter && (
          <section className="mt-12">
            <NewsletterSignup source="marketing" />
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-[var(--color-faint)]">
        <Link href="/blog" className="hover:text-[var(--color-ink)]">Blog</Link>
        {" · "}
        <Link href="/rechner" className="hover:text-[var(--color-ink)]">Rechner</Link>
        {" · "}
        <Link href="/gratis" className="font-semibold text-[var(--color-brand)] hover:underline">Gratis-Tools</Link>
        {" · "}
        <Link href="/newsletter" className="hover:text-[var(--color-ink)]">Newsletter</Link>
        {" · "}
        <a href="https://wa.me/4915292627062?text=Hallo%2C%20ich%20habe%20eine%20Frage%20zu%20KundenRadar." target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-ink)]">WhatsApp</a>
        {" · "}
        <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
        {" · "}
        <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
      </footer>
      <WhatsAppWidget />
    </div>
  );
}

/** Kleiner Helfer: JSON-LD als Script einbetten. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD ist statisch & vertrauenswürdig (eigene Daten).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
