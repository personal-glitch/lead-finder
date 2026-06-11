import type { Metadata } from "next";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Newsletter – KundenRadar",
  description:
    "Praxis-Tipps für mehr Neukunden: Akquise, rechtssichere Kaltakquise und Updates zu KundenRadar. Kostenlos, jederzeit abbestellbar.",
};

export default function NewsletterPage() {
  return (
    <MarketingShell cta={false} newsletter={false}>
      <h1 className="text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
        Mehr Neukunden – ein Tipp pro Woche
      </h1>
      <p className="mt-3 text-[var(--color-muted)]">
        Im KundenRadar-Newsletter bekommst du konkrete Akquise-Tipps, rechtssichere Vorlagen
        (was bei Kaltakquise erlaubt ist – und was nicht) und Produkt-Updates. Kein Spam,
        Abmeldung mit einem Klick.
      </p>

      <div className="mt-6">
        <NewsletterSignup
          source="newsletter-page"
          title="Jetzt kostenlos anmelden"
          subtitle="Double-Opt-In: Du bekommst eine kurze Bestätigungs-Mail, erst danach startet der Newsletter."
        />
      </div>

      <ul className="mt-6 space-y-2 text-sm text-[var(--color-muted)]">
        <li>• Konkrete Akquise- und Telefon-Tipps für Dienstleister &amp; Handwerk</li>
        <li>• Rechtssichere E-Mail- und Brief-Vorlagen (§ 7 UWG)</li>
        <li>• Neue Funktionen &amp; Beispiel-Suchen in KundenRadar</li>
      </ul>
    </MarketingShell>
  );
}
