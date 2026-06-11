import type { Metadata } from "next";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Icon, type IconName } from "@/components/icons";

export const metadata: Metadata = {
  title: "Newsletter: mehr Neukunden, Anfragen & Umsatz – KundenRadar",
  description:
    "Jede Woche ein umsetzbarer Tipp für mehr Neukunden, mehr Anfragen und mehr Umsatz – für Dienstleister, Handwerk & Reinigungsfirmen. Kostenlos, jederzeit abbestellbar.",
};

const VALUE: { icon: IconName; title: string; text: string }[] = [
  { icon: "user", title: "Mehr Neukunden", text: "Akquise-Tipps, rechtssichere Telefon- & Brief-Vorlagen, fertige Skripte – damit du planbar neue Kunden gewinnst." },
  { icon: "search", title: "Mehr Anfragen", text: "Sichtbarkeit, einfache SEO-Tricks, bessere Angebote & Online-Auftritt – damit Kunden von selbst auf dich zukommen." },
  { icon: "calculator", title: "Mehr Umsatz", text: "Preise richtig kalkulieren, sicher abschließen, Stammkunden halten – mehr aus jedem Kontakt herausholen." },
];

const TOPICS = [
  "Was bei Kaltakquise erlaubt ist – und was abmahnbar",
  "Telefon-Skripte, die nicht nach Verkäufer klingen",
  "Reinigungs- & Handwerk-spezifische Akquise",
  "Angebote schreiben, die angenommen werden",
  "Preise & Stundensätze sauber kalkulieren",
  "In 30 Minuten/Woche neue Kunden finden",
];

const FAQ = [
  { q: "Wie oft kommt der Newsletter?", a: "Einmal pro Woche – ein konkreter, umsetzbarer Tipp. Kein tägliches Zuspammen." },
  { q: "Kostet das etwas?", a: "Nein, der Newsletter ist komplett kostenlos und unverbindlich." },
  { q: "Wie melde ich mich ab?", a: "Mit einem Klick über den Abmeldelink in jeder E-Mail. Sofort, ohne Rückfragen." },
];

export default function NewsletterPage() {
  return (
    <MarketingShell cta={false} newsletter={false}>
      {/* Hero */}
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-tint)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
        <Icon name="mail" size={13} /> Kostenloser Newsletter
      </div>
      <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
        Jede Woche: mehr Neukunden,{" "}
        <span className="text-[var(--color-brand)]">mehr Anfragen, mehr Umsatz.</span>
      </h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">
        Ein umsetzbarer Tipp pro Woche – für Dienstleister, Handwerk und Reinigungsfirmen.
        Praxisnah, rechtssicher, ohne Bla. Kostenlos und jederzeit abbestellbar.
      </p>

      <div className="mt-6">
        <NewsletterSignup
          source="newsletter-hero"
          title="Jetzt kostenlos anmelden"
          subtitle="Double-Opt-In: kurze Bestätigungs-Mail, dann startet dein wöchentlicher Tipp."
        />
      </div>
      <p className="mt-3 text-xs text-[var(--color-faint)]">
        ✓ Kostenlos &nbsp;·&nbsp; ✓ Jede Woche ein Tipp &nbsp;·&nbsp; ✓ Kein Spam &nbsp;·&nbsp; ✓ 1-Klick-Abmeldung
      </p>

      {/* Das bekommst du */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">Das bekommst du</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {VALUE.map((v) => (
          <div key={v.title} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]">
              <Icon name={v.icon} size={19} />
            </span>
            <h3 className="mt-3 text-sm font-semibold">{v.title}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{v.text}</p>
          </div>
        ))}
      </div>

      {/* So sieht eine Ausgabe aus */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">So sieht eine Ausgabe aus</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-subtle)] px-5 py-3 text-xs text-[var(--color-muted)]">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={12} strokeWidth={2.2} /></span>
          KundenRadar-Tipp #12 · „3 Sätze, die jedes Kaltakquise-Telefonat öffnen"
        </div>
        <div className="space-y-3 p-5 text-sm text-[var(--color-ink-2)]">
          <p className="font-medium text-[var(--color-ink)]">Hallo,</p>
          <p>die ersten 10 Sekunden entscheiden. Diese Woche bekommst du drei Einstiegssätze, mit denen dich der Gegenüber nicht sofort abwimmelt – plus, was du <em>nicht</em> sagen solltest …</p>
          <div className="rounded-lg bg-[var(--color-brand-tint)]/40 p-3 text-[var(--color-ink)]">
            👉 Tipp der Woche: Nenne in Satz 1 den Nutzen für <strong>ihn</strong>, nicht deinen Firmennamen.
          </div>
          <p className="text-[var(--color-faint)]">— Cihan · Seciora Solutions · Abmeldelink &amp; Impressum unten</p>
        </div>
      </div>

      {/* Themen */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">Worüber du Woche für Woche liest</h2>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div key={t} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 text-[var(--color-brand)]"><Icon name="check" size={16} /></span>
            <span className="text-[var(--color-ink-2)]">{t}</span>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
      <div className="mt-5 space-y-3">
        {FAQ.map((f) => (
          <div key={f.q} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <h3 className="text-sm font-semibold">{f.q}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
          </div>
        ))}
      </div>

      {/* Abschluss-CTA */}
      <div className="mt-14 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Bereit für mehr Neukunden?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
          Trag dich ein und bekomm jede Woche einen Tipp, den du sofort umsetzen kannst.
        </p>
        <div className="mx-auto mt-5 max-w-md text-left">
          <NewsletterSignup source="newsletter-footer" title="" subtitle="" variant="bare" />
        </div>
      </div>
    </MarketingShell>
  );
}
