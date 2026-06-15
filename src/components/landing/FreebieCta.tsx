import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Icon } from "@/components/icons";

// Wiederverwendbare Freebie-CTA-Box für das Ende von Blogartikeln:
// holt SEO-Leser direkt in die Mailliste (3 Gratis-Tools per Mail).
export function FreebieCta({ source = "blog" }: { source?: string }) {
  return (
    <aside className="mt-14 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-3 py-1 text-xs font-semibold text-[var(--color-on-brand)]">
        <Icon name="template" size={13} /> Gratis Akquise-Starterkit
      </div>
      <h2 className="mt-3 text-lg font-semibold tracking-[-0.01em]">
        Hol dir 3 kostenlose Tools für mehr Neukunden
      </h2>
      <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">
        Telefon-Leitfaden + 10 E-Mail-Vorlagen, ein Kaltakquise-Leitfaden 2026 und ein Akquise-Tracker –
        sofort per Mail, kostenlos und jederzeit abbestellbar.
      </p>
      <div className="mt-4 max-w-md">
        <NewsletterSignup source={source} title="" subtitle="" variant="bare" />
      </div>
    </aside>
  );
}
