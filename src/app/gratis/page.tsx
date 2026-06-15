import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Gratis Akquise-Starterkit: 3 Tools für mehr Neukunden | KundenRadar",
  description:
    "Hol dir das kostenlose Akquise-Starterkit für Dienstleister: Vorlagen-Paket (Telefon-Leitfaden + 10 E-Mail-Vorlagen + 50 Opener), Kaltakquise-Leitfaden 2026 und Akquise-Tracker (Excel). Gratis per E-Mail, DSGVO-konform.",
  alternates: { canonical: "/gratis" },
};

const FOR_WHOM = ["Reinigung", "Handwerk", "Garten & Hausmeister", "Agentur & Webdesign", "IT & Beratung", "Personalvermittlung"];

const TOOLS = [
  {
    img: "/downloads/preview/vorlagen.png",
    title: "Akquise-Vorlagen-Paket (PDF)",
    inside: [
      "Telefon-Leitfaden für das Erstgespräch",
      "Einwand-Spickzettel: 8 Antworten zum Ausdrucken",
      "10 fertige E-Mail-Vorlagen (mit Platzhaltern)",
      "Branchen-Aufhänger: Reinigung · Handwerk · Agentur · Personal",
      "50 Gesprächs-Opener für Telefon & E-Mail",
    ],
  },
  {
    img: "/downloads/preview/leitfaden.png",
    title: "Kaltakquise-Leitfaden 2026 (PDF)",
    inside: [
      "Was erlaubt ist – je Kanal (Telefon, E-Mail, Post, WhatsApp)",
      "Do's & Don'ts + DSGVO-Kurzcheck",
      "Muster-Einwilligungstext zum Kopieren",
      "3 typische Abmahn-Fallen vermeiden",
      "Druckbare Checkliste",
    ],
  },
  {
    img: "/downloads/preview/tracker.png",
    title: "Akquise-Tracker (Excel)",
    inside: [
      "Pipeline mit Status-Dropdown (Neu → Gewonnen)",
      "Auto-Übersicht: Pipeline-Wert, Abschlussquote",
      "Balkendiagramm der Leads je Status",
      "Wochenziel & Tages-Streak",
      "Anleitungs-Reiter zum Loslegen",
    ],
  },
];

const TIPS = [
  {
    n: "1",
    title: "Fester Akquise-Slot statt „wenn Zeit ist“",
    text: "Blockiere dir 30 Minuten am Tag – wie einen Termin. Wer Akquise plant, macht sie. Wer auf den richtigen Moment wartet, macht sie nie.",
  },
  {
    n: "2",
    title: "Nutzen in Satz 1 – nicht deinen Firmennamen",
    text: "„Ich helfe Betrieben in [Ort], planbar an Aufträge zu kommen“ zieht mehr als „Wir sind die Firma XY“. Sag, was der andere davon hat.",
  },
  {
    n: "3",
    title: "Ziel ist der Termin, nicht der Abschluss",
    text: "Am Telefon verkaufst du nicht das Angebot, sondern den nächsten Schritt. Frag mit Alternativen: „Dienstag 10 Uhr oder eher Donnerstag?“",
  },
];

const STEPS = [
  "Branche & Umkreis wählen – du bekommst anrufbare Firmen mit Telefon & Ansprechpartner.",
  "Mit den Gratis-Vorlagen anrufen & anschreiben – Skript und E-Mails hast du ja jetzt.",
  "In der Pipeline nachfassen – Wiedervorlagen entstehen automatisch, nichts geht verloren.",
];

const FAQ = [
  { q: "Ist das wirklich komplett kostenlos?", a: "Ja. Du bekommst alle 3 Tools gratis per E-Mail – ohne Zahlung, ohne Abo, ohne versteckte Kosten." },
  { q: "Brauche ich KundenRadar dafür?", a: "Nein. Die Tools funktionieren komplett eigenständig. Wer noch effizienter werden will, kombiniert sie mit KundenRadar – muss aber nicht." },
  { q: "Was passiert mit meiner E-Mail?", a: "Du kommst in unseren Newsletter (Double-Opt-In) und bekommst regelmäßig Akquise-Tipps. Abmeldung jederzeit mit einem Klick. DSGVO-konform." },
  { q: "Wie schnell habe ich die Tools?", a: "Sofort: Nach dem Klick auf den Bestätigungslink in der ersten Mail bekommst du direkt die Download-Mail mit allen 3 Dateien." },
  { q: "In welchem Format sind die Dateien?", a: "Zwei PDFs (Vorlagen-Paket, Leitfaden) und eine Excel-Datei (Tracker) – auf jedem Rechner nutzbar." },
];

export default function GratisPage() {
  return (
    <MarketingShell cta={false} newsletter={false}>
      {/* Hero */}
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-tint)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
        <Icon name="template" size={13} /> Gratis Akquise-Starterkit
      </div>
      <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
        Schluss mit Rätselraten bei der Akquise –{" "}
        <span className="text-[var(--color-brand)]">fertige Vorlagen, kostenlos.</span>
      </h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">
        Telefon-Leitfaden, 10 E-Mail-Vorlagen, 50 Gesprächs-Opener, ein Kaltakquise-Rechtsleitfaden und ein
        Excel-Tracker – aus echter Vertriebspraxis. Damit weißt du beim nächsten Kontakt genau, was du sagst.
      </p>

      <div className="mt-6">
        <NewsletterSignup
          source="freebie"
          title="Jetzt gratis sichern"
          subtitle="E-Mail eintragen → bestätigen → du bekommst alle 3 Tools sofort zugeschickt."
        />
      </div>
      <p className="mt-3 text-xs text-[var(--color-faint)]">
        ✓ Komplett kostenlos &nbsp;·&nbsp; ✓ Sofort per Mail &nbsp;·&nbsp; ✓ DSGVO-konform &nbsp;·&nbsp; ✓ 1-Klick-Abmeldung
      </p>

      {/* Für wen */}
      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-faint)]">Gemacht für Dienstleister wie dich</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FOR_WHOM.map((f) => (
            <span key={f} className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-ink-2)]">{f}</span>
          ))}
        </div>
      </div>

      {/* Vorschau + das ist drin */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">Das bekommst du – im Detail</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {TOOLS.map((t) => (
          <div key={t.title} className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.img} alt={`Vorschau: ${t.title}`} className="h-44 w-full border-b border-[var(--color-line)] object-cover object-top" />
            <div className="p-5">
              <h3 className="text-sm font-semibold">{t.title}</h3>
              <ul className="mt-3 space-y-2">
                {t.inside.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-[var(--color-ink-2)]">
                    <span className="mt-0.5 shrink-0 text-[var(--color-brand)]"><Icon name="check" size={15} /></span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* 3 Sofort-Tipps – Mehrwert direkt auf der Seite */}
      <h2 className="mt-14 text-xl font-semibold tracking-[-0.01em]">3 Tipps, die du sofort umsetzen kannst</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Kleiner Vorgeschmack – die ausführlichen Vorlagen und Skripte sind im Gratis-Paket.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {TIPS.map((t) => (
          <div key={t.n} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-brand)] text-sm font-bold text-[var(--color-on-brand)]">{t.n}</span>
            <h3 className="mt-3 text-sm font-semibold">{t.title}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{t.text}</p>
          </div>
        ))}
      </div>

      {/* USP */}
      <div className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6">
        <h2 className="text-lg font-semibold">Warum dieses Kit anders ist</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Aus der echten Vertriebspraxis", "Keine Theorie – Skripte und Vorlagen, die im Tagesgeschäft funktionieren."],
            ["Rechtssicher gedacht", "Mit Hinweisen zu § 7 UWG & DSGVO, damit du sauber akquirierst."],
            ["Branchenspezifisch", "Aufhänger für Reinigung, Handwerk, Agentur und Personalvermittlung."],
            ["Sofort einsetzbar", "Platzhalter ersetzen, anrufen, anschreiben – heute noch."],
          ].map(([h, p]) => (
            <div key={h} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-[var(--color-brand)]"><Icon name="check" size={18} /></span>
              <div>
                <div className="text-sm font-semibold">{h}</div>
                <div className="mt-0.5 text-sm text-[var(--color-muted)]">{p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brücke zum Tool – indirekt verkaufen */}
      <div className="mt-12 overflow-hidden rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Die Vorlagen sind die halbe Miete.</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Die andere Hälfte: <strong>die richtigen Firmen finden</strong> – mit Telefonnummer und Ansprechpartner.
          Genau das macht <strong>KundenRadar</strong>: Du wählst Branche und Umkreis und bekommst anrufbare B2B-Firmen,
          ziehst sie durch deine Pipeline und fasst automatisch nach.
        </p>
        <ol className="mt-5 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-on-brand)]">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/registrieren" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            KundenRadar 3 Tage gratis testen <Icon name="chevronRight" size={16} />
          </Link>
          <Link href="/check" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)] hover:underline">
            Erst kostenlos prüfen, wie viele Firmen es in deinem Umkreis gibt →
          </Link>
        </div>
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
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Hol dir dein Gratis-Starterkit</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-muted)]">
          Alle 3 Tools sofort per Mail – plus jede Woche ein umsetzbarer Tipp für mehr Neukunden. Jederzeit abbestellbar.
        </p>
        <div className="mx-auto mt-5 max-w-md text-left">
          <NewsletterSignup source="freebie-footer" title="" subtitle="" variant="bare" />
        </div>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Schon überzeugt?{" "}
          <Link href="/registrieren" className="font-semibold text-[var(--color-brand)] hover:underline">KundenRadar 3 Tage gratis testen →</Link>
        </p>
      </div>
    </MarketingShell>
  );
}
