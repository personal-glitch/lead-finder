import type { Metadata } from "next";
import { MarketingShell } from "@/components/landing/MarketingShell";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Gratis Akquise-Starterkit: 3 Tools für mehr Neukunden | KundenRadar",
  description:
    "Hol dir das kostenlose Akquise-Starterkit für Dienstleister: Vorlagen-Paket (Telefon-Leitfaden + 10 E-Mail-Vorlagen + 50 Opener), Kaltakquise-Leitfaden 2026 und Akquise-Tracker (Excel). Gratis per E-Mail, DSGVO-konform.",
  alternates: { canonical: "/gratis" },
};

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

const FAQ = [
  { q: "Ist das wirklich komplett kostenlos?", a: "Ja. Du bekommst alle 3 Tools gratis per E-Mail – ohne Zahlung, ohne Abo, ohne versteckte Kosten." },
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
        Das komplette Akquise-Starterkit für Dienstleister –{" "}
        <span className="text-[var(--color-brand)]">kostenlos.</span>
      </h1>
      <p className="mt-4 text-lg text-[var(--color-muted)]">
        Telefon-Leitfaden, 10 E-Mail-Vorlagen, 50 Gesprächs-Opener, ein Kaltakquise-Rechtsleitfaden und ein
        Excel-Tracker – aus echter Vertriebspraxis. Sofort einsetzbar, gratis per E-Mail.
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

      {/* USP */}
      <div className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-6">
        <h2 className="text-lg font-semibold">Warum dieses Kit anders ist</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Aus der echten Vertriebspraxis", "Keine Theorie – Skripte und Vorlagen, die im Tagesgeschäft funktionieren."],
            ["Rechtssicher gedacht", "Mit Hinweisen zu § 7 UWG & DSGVO, damit du sauber akquirierst."],
            ["Branchenspezifisch", "Aufhänger für Reinigung, Handwerk, Agentur und Personalvermittlung."],
            ["Direkt umsetzbar mit KundenRadar", "Das Kit spielt nahtlos mit dem Tool zusammen – vom ersten Treffer bis zum Abschluss."],
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
      </div>
    </MarketingShell>
  );
}
