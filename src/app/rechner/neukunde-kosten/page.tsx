import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { H2, P } from "@/components/landing/LegalShell";
import { NeukundeRechner } from "@/components/NeukundeRechner";

const TITLE = "Was kostet ein Neukunde? Kostenloser CAC-Rechner für Dienstleister";
const DESC =
  "Berechne kostenlos deine Kosten pro Neukunde (CAC), den Kundenwert (LTV) und das Verhältnis LTV:CAC – in Sekunden, ohne Anmeldung. Mit Faustregeln zur Bewertung.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/rechner/neukunde-kosten" },
};

const FAQ = [
  { q: "Was ist der CAC?", a: "CAC steht für Customer Acquisition Cost – die durchschnittlichen Kosten, um einen neuen Kunden zu gewinnen. Formel: Akquise-/Marketingkosten eines Zeitraums geteilt durch die Zahl der in diesem Zeitraum gewonnenen Neukunden." },
  { q: "Was ist ein gutes Verhältnis von LTV zu CAC?", a: "Als Faustregel gilt ein Verhältnis von LTV:CAC von mindestens 3:1 als gesund. Liegt es darunter, ist die Kundengewinnung im Verhältnis zum Kundenwert zu teuer." },
  { q: "Was bedeutet Amortisation (Payback)?", a: "Die Amortisationszeit gibt an, nach wie vielen Monaten ein Neukunde seine Akquisekosten wieder eingespielt hat. Je kürzer, desto schneller wird die Akquise profitabel." },
  { q: "Ist der Rechner kostenlos?", a: "Ja, der CAC-Rechner ist komplett kostenlos und ohne Anmeldung nutzbar." },
];

export default function Page() {
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Gratis-Rechner · CAC</span>
        <h1 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Was kostet ein Neukunde?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Trage deine Akquisekosten und Neukunden ein – der Rechner zeigt dir sofort deine Kosten pro Neukunde
          (CAC), den Kundenwert (LTV) und ob sich deine Akquise lohnt.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <NeukundeRechner />
      </div>

      <div className="mx-auto mt-14 max-w-2xl space-y-10">
        <section>
          <H2>So berechnest du die Kosten pro Neukunde</H2>
          <P>
            Die Grundformel ist einfach: Du teilst alle Kosten für Akquise und Marketing eines Zeitraums durch die
            Zahl der Neukunden, die du in diesem Zeitraum gewonnen hast. Gibst du 1.000 € im Monat aus und gewinnst
            5 Kunden, liegt dein CAC bei 200 €. Wichtig ist, den CAC immer im Verhältnis zum Kundenwert zu sehen –
            ein hoher CAC ist kein Problem, wenn ein Kunde über die Jahre ein Vielfaches einbringt.
          </P>
        </section>
        <section>
          <H2>Warum das Verhältnis LTV:CAC zählt</H2>
          <P>
            Der Kundenwert (LTV, Lifetime Value) ergibt sich aus dem monatlichen Wert eines Kunden mal seiner
            durchschnittlichen Verweildauer. Erst das Verhältnis von LTV zu CAC zeigt, ob dein Wachstum gesund ist.
            Ein Wert von 3 oder mehr bedeutet: Jeder in die Akquise investierte Euro kommt mehrfach zurück. Liegt er
            unter 1, verlierst du mit jedem Neukunden Geld.
          </P>
        </section>
        <section>
          <H2>CAC senken – die größten Hebel</H2>
          <P>
            Der häufigste Kostentreiber ist die <em>Recherche-Zeit</em>: Stunden damit zu verbringen, passende Firmen
            und Ansprechpartner zusammenzusuchen. Genau hier setzt KundenRadar an – du bekommst anrufbare Firmen mit
            Telefon und Ansprechpartner direkt geliefert und arbeitest sie effizient in einer Pipeline ab. Weniger
            Zeit pro Kontakt = niedrigerer CAC.
          </P>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
          <div className="mt-3 space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-sm font-medium">{f.q}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Weitere Rechner</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { href: "/rechner/gebaeudereinigung", label: "Reinigungskosten-Rechner" },
              { href: "/rechner/handwerk-stundensatz", label: "Handwerk-Stundensatz" },
              { href: "/rechner/agentur-stundensatz", label: "Agentur-Stundensatz" },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
