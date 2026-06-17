import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { CompanyRegistrationForm } from "@/components/CompanyRegistrationForm";
import { Icon, type IconName } from "@/components/icons";

export const metadata: Metadata = {
  title: "Firma kostenlos eintragen – Dienstleister-Verzeichnis | KundenRadar",
  description:
    "Trage dein Unternehmen kostenlos in unser Dienstleister-Verzeichnis ein und werde von neuen Kunden gefunden. Reinigung, Handwerk, Dienstleistungen – gratis gelistet, Anfragen direkt zu dir. Ohne versteckte Kosten.",
  alternates: { canonical: "/firma-eintragen" },
  keywords: [
    "Firma eintragen kostenlos", "Branchenbuch kostenlos", "Unternehmen eintragen", "Dienstleister Verzeichnis",
    "kostenlos gelistet werden", "Handwerker Verzeichnis eintragen", "Reinigungsfirma eintragen", "Firmeneintrag gratis",
    "neue Kunden gewinnen", "kostenloser Firmeneintrag",
  ],
  openGraph: { title: "Firma kostenlos eintragen – Dienstleister-Verzeichnis", description: "Gratis gelistet werden und von neuen Kunden gefunden werden. Anfragen kommen direkt zu dir.", type: "website" },
};

const TRUST = ["100% kostenlos", "in 2 Minuten", "Anfragen direkt zu dir", "jederzeit löschbar"];

const BENEFITS: { icon: IconName; t: string; d: string }[] = [
  { icon: "search", t: "Von Kunden gefunden werden", d: "Dein Unternehmen erscheint im Verzeichnis und auf einer eigenen Profilseite – auffindbar über Google und unsere Auftragsbörse." },
  { icon: "mail", t: "Anfragen direkt ins Postfach", d: "Interessenten kontaktieren dich über dein Profil. Wir leiten jede Anfrage direkt an dich weiter – kostenlos." },
  { icon: "key", t: "Deine Daten bleiben privat", d: "Telefonnummer und E-Mail werden nicht öffentlich angezeigt. Du entscheidest, auf welche Anfrage du reagierst." },
  { icon: "check", t: "Wirklich kostenlos", d: "Der Eintrag ist und bleibt gratis – keine versteckten Kosten, keine Vertragsbindung, jederzeit löschbar." },
];

const FAQ = [
  { q: "Ist der Eintrag wirklich kostenlos?", a: "Ja. Der Grundeintrag im Verzeichnis ist komplett kostenlos – ohne versteckte Kosten und ohne Vertragsbindung." },
  { q: "Werden meine Kontaktdaten öffentlich angezeigt?", a: "Nein. Firmenname, Branche, Ort und Beschreibung sind öffentlich, deine Telefonnummer und E-Mail jedoch nicht. Anfragen leiten wir direkt an dich weiter." },
  { q: "Wie kommen Anfragen zu mir?", a: "Interessenten füllen auf deiner Profilseite ein kurzes Kontaktformular aus. Die Anfrage geht über uns direkt per E-Mail an dich – du antwortest dann selbst." },
  { q: "Wie schnell bin ich gelistet?", a: "Wir prüfen jeden Eintrag kurz (Spam-Schutz) und schalten ihn dann frei. In der Regel innerhalb von 1–2 Werktagen." },
  { q: "Kann ich den Eintrag wieder löschen?", a: "Ja, jederzeit. Eine kurze E-Mail genügt und wir entfernen deinen Eintrag." },
  { q: "Was bringt mir das gegenüber dem KundenRadar-Tool?", a: "Das Verzeichnis bringt dir passiv Anfragen. Wenn du aktiv neue Kunden suchen willst, findest du mit dem KundenRadar-Tool gezielt Firmen in deiner Region und sprichst sie direkt an." },
];

export default function FirmaEintragenPage() {
  return (
    <MarketingShell newsletter={false}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />

      {/* Hero */}
      <div className="text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Firmen-Verzeichnis · kostenlos</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">
          Firma kostenlos eintragen – <span className="text-[var(--color-brand)]">von neuen Kunden gefunden werden</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Trage dein Unternehmen gratis in unser Dienstleister-Verzeichnis ein. Du bekommst eine eigene Profilseite und
          Anfragen von Interessenten landen direkt bei dir – kostenlos und unverbindlich.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-tint)]/40 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
              <Icon name="check" size={13} /> {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <CompanyRegistrationForm />
      </div>

      {/* Vorteile */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-semibold tracking-[-0.01em]">Warum eintragen?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.t} className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-tint)] text-[var(--color-brand)]"><Icon name={b.icon} size={18} /></span>
              <div>
                <div className="text-sm font-semibold">{b.t}</div>
                <div className="mt-0.5 text-sm text-[var(--color-muted)]">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">So funktioniert&apos;s</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", t: "Kostenlos eintragen", d: "Firmenname, Branche, Ort und kurze Beschreibung – in 2 Minuten ausgefüllt." },
            { n: "2", t: "Profil wird freigeschaltet", d: "Wir prüfen den Eintrag kurz und schalten deine Profilseite frei." },
            { n: "3", t: "Anfragen erhalten", d: "Interessenten kontaktieren dich über dein Profil – die Anfragen kommen direkt zu dir." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-brand-tint)] text-xs font-bold text-[var(--color-brand)]">{s.n}</span>
              <h3 className="mt-2 text-sm font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upsell-Hinweis Tool */}
      <section className="mt-16 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6">
        <h2 className="text-lg font-semibold">Aktiv neue Kunden gewinnen?</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Das Verzeichnis bringt dir passiv Anfragen. Wenn du selbst gezielt auf Kundensuche gehen willst, findest du mit dem{" "}
          <Link href="/check" className="text-[var(--color-brand)] hover:underline">KundenRadar-Tool</Link> passende Firmen in deiner
          Region, siehst direkt Telefonnummer und Ansprechpartner und kannst sie systematisch kontaktieren. Kostenlos testen.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-semibold">{f.q}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
