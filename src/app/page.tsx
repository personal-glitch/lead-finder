import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { PLANS } from "@/lib/plans";
import { config } from "@/lib/config";
import { ALLE_BRANCHEN, BRANCHEN_KATEGORIEN } from "@/lib/leadgen/branchen-catalog";
import { LazyKalkulator } from "@/components/landing/LazyKalkulator";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { CheckWidget } from "@/components/landing/CheckWidget";
import { PromoBar } from "@/components/landing/PromoBar";
import { PromoPricing } from "@/components/landing/PromoPricing";
import { CITIES } from "@/lib/cities";
import { Reveal, GrowBar, CountUp } from "@/components/landing/anim";
import { PlanButton } from "@/components/landing/PlanButton";
import {
  ResultsMock,
  PipelineMock,
  CallMock,
  TasksMock,
  DashboardMock,
} from "@/components/landing/mockups";

// Branchen-Zahl direkt aus dem Katalog – bleibt immer wahr.
const BRANCHEN_N = Math.floor(ALLE_BRANCHEN.length / 10) * 10; // 50

export const metadata: Metadata = {
  title: "Kostenloser Rechner für Gebäudereinigung, Handwerk & Dienstleister | KundenRadar",
  description:
    "Kostenlose Rechner & Kalkulatoren für Dienstleister: Stundensatz und Angebotspreis für Gebäudereinigung, Handwerk und Agenturen berechnen – plus KundenRadar, das Tool, das dir anrufbare B2B-Neukunden mit Telefon & Ansprechpartner liefert. 3 Tage gratis testen, DSGVO-konform.",
  keywords: [
    "kostenloser Rechner", "kostenloser Kalkulator", "Kalkulator Gebäudereinigung", "Reinigungskosten-Rechner",
    "Stundensatz Handwerk berechnen", "Stundenverrechnungssatz Handwerk", "Stundensatz Agentur",
    "Webdesign Preis berechnen", "Was kostet eine Website", "SEO Kosten", "Website-Check",
    "Personalvermittlung Provision", "Zeitarbeit Verrechnungssatz", "Firmen mit offenen Stellen finden",
    "Angebotspreis berechnen", "Neukunden für Dienstleister", "B2B-Leads finden", "KundenRadar",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kostenlose Rechner für Gebäudereinigung, Handwerk & Dienstleister – KundenRadar",
    description:
      "Stundensatz & Angebotspreis kostenlos berechnen – plus das Tool, das dir anrufbare B2B-Neukunden findet. 3 Tage gratis testen.",
    url: "/",
  },
};

// Funktions-Showcase entlang des Vertriebs-Ablaufs (mit echten Mini-Mockups)
const SHOWCASE: { tag: string; title: string; text: string; bullets: string[]; mock: ReactNode }[] = [
  {
    tag: "Finden & Anreichern",
    title: "Anrufbare Firmen – inklusive Telefon & Ansprechpartner",
    text: "Zielbranche + Umkreis wählen (oder ein freies Stichwort), und KundenRadar liefert echte Firmen mit Durchwahl und der richtigen Kontaktperson. Kein stundenlanges Googeln mehr.",
    bullets: [`${BRANCHEN_N}+ Branchen + freie Stichwortsuche`, "Telefon, Adresse, Website & Ansprechpartner", "Auf Qualität geprüft – keine Karteileichen"],
    mock: <ResultsMock />,
  },
  {
    tag: "Pipeline",
    title: "Jeder Kontakt im Blick – per Drag & Drop",
    text: "Deine Kontakte wandern durch frei definierbare Stages. Du siehst sofort, wer neu ist, wer kontaktiert wurde und wo ein Abschluss winkt – statt verstreuter Excel-Tabs.",
    bullets: ["Eigene Stages frei benennbar", "Status bleibt erhalten – nichts geht verloren", "Ein Klick öffnet alle Details & Historie"],
    mock: <PipelineMock />,
  },
  {
    tag: "Anrufen & Automatik",
    title: "Anrufen, Ergebnis loggen – der Rest passiert automatisch",
    text: "Per Klick anrufen, Ergebnis festhalten – der Kontakt rückt automatisch in die richtige Stage und legt die nächste Wiedervorlage an. Alles verknüpft, eine Logik.",
    bullets: ["Klick-to-Call direkt aus dem Kontakt", "Ergebnis → Stage & Aufgabe automatisch", "Tagesziel: Anrufe heute im Blick"],
    mock: <CallMock />,
  },
  {
    tag: "E-Mail-Outreach",
    title: "Aus dem Tool mailen – mit Signatur, Vorlagen & automatischem Nachfass",
    text: "Schreib direkt aus dem Kontakt heraus – einzeln oder als Sammel-Versand. Aus deinem eigenen Postfach, mit deiner Signatur. Impressum & Abmeldelink kommen automatisch dazu, und nach 3 Tagen erinnert dich das Tool ans Nachfassen.",
    bullets: [
      "Versand aus deinem Postfach (SMTP) – mit persönlicher Signatur",
      "Vorlagen-Bibliothek + Platzhalter · Sammel-Versand mit Tageslimit",
      "Halbautomatischer Follow-up · DSGVO/§7-konform (Opt-out, Impressum)",
    ],
    mock: (
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">E-Mail schreiben</span>
          <span className="rounded-full bg-[var(--color-brand-tint)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand-ink)]">aus deinem Postfach</span>
        </div>
        <div className="space-y-2 rounded-lg border border-[var(--color-line)] p-3">
          <div className="text-[var(--color-muted)]">An: m.weber@hausverwaltung-koeln.de</div>
          <div className="border-t border-[var(--color-line)] pt-2 font-medium">Betreff: Unterhaltsreinigung für Ihre Objekte</div>
          <div className="space-y-1.5 text-[var(--color-muted)]">
            <div>Guten Tag Herr Weber,</div>
            <div className="h-2 w-full rounded bg-[var(--color-subtle)]" />
            <div className="h-2 w-4/5 rounded bg-[var(--color-subtle)]" />
            <div className="pt-1 text-[10px] text-[var(--color-faint)]">— Signatur · Impressum · Abmeldelink werden automatisch ergänzt</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[var(--color-subtle)] px-2 py-1 text-[var(--color-ink-2)]">⏰ Follow-up in 3 Tagen</span>
          <span className="rounded-md bg-[var(--color-brand)] px-3 py-1 font-semibold text-[var(--color-on-brand)]">Senden</span>
        </div>
      </div>
    ),
  },
  {
    tag: "Aufgaben & Wiedervorlagen",
    title: "Nie wieder einen Rückruf vergessen",
    text: "Jede offene Sache wird zur Aufgabe mit Fälligkeit. Morgens siehst du genau, was heute ansteht – kein Zettel, nichts geht unter.",
    bullets: ["Automatische Wiedervorlagen nach Anrufen", "Fällig-heute-Liste auf dem Dashboard", "Aufgaben hängen am Kontakt"],
    mock: <TasksMock />,
  },
  {
    tag: "Dashboard",
    title: "Dein Vertrieb in Zahlen – jeden Tag",
    text: "Anrufe heute, offene Aufgaben, Funnel und letzte Aktivitäten auf einen Blick. Du weißt immer, wo du stehst – ohne Reporting zu basteln.",
    bullets: ["Live-KPIs & Funnel", "Aktivitäts-Verlauf je Kontakt", "Fortschritt zum Tagesziel"],
    mock: <DashboardMock />,
  },
];

// Kompaktes Feature-Raster (der Rest, den das Tool kann)
const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "agents", title: "Such-Agenten", text: "Gespeicherte Such-Profile pro Zielgruppe. Einmal anlegen, jederzeit per Klick laufen lassen." },
  { icon: "mail", title: "Versand aus deinem Postfach", text: "Mailen direkt aus dem Tool über deinen eigenen SMTP-Zugang – mit persönlicher Signatur unter jeder Mail." },
  { icon: "template", title: "Vorlagen-Bibliothek", text: "Fertige Vorlagen für Reinigung, Handwerk & Agentur – mit Platzhaltern, einsatzbereit in Sekunden." },
  { icon: "mail", title: "Sammel-Versand", text: "Mehrere Kontakte auf einmal anschreiben – mit Tageslimit, das deine Zustellbarkeit schützt." },
  { icon: "tasks", title: "Automatischer Nachfass", text: "Nach dem Erstkontakt erinnert dich das Tool ans Follow-up – senden mit einem Klick." },
  { icon: "user", title: "Kontakte & Unternehmen", text: "Alle Firmen & Ansprechpartner sauber gespeichert – filter-, sortier- und durchsuchbar." },
  { icon: "settings", title: "Eine Logik – alles verknüpft", text: "Ein Anruf bewegt die Pipeline, erzeugt Aufgaben und aktualisiert dein Dashboard. Automatisch." },
  { icon: "check", title: "Auf Datenschutz & Recht ausgelegt", text: "Impressum & Abmeldelink automatisch in jeder Mail, Opt-out-Liste, EU-Hosting. Werbe-Mails nur mit Einwilligung – das Tool weist dich aktiv darauf hin." },
  { icon: "calculator", title: "Preis-Kalkulator", text: "Angebotspreis, Stundenverrechnungssatz & Marge für Reinigung, Handwerk und Dienstleistung – in Sekunden." },
];

// Vorher / Nachher
const ALT = [
  "Stundenlang Firmen googeln & Nummern raussuchen",
  "Excel-Listen, Notizzettel, verstreute Tabs",
  "Vergessene Rückrufe, kein Überblick",
  "Vier Tools, die nicht miteinander reden",
];
const NEU = [
  "Anrufbare Firmen auf Knopfdruck – mit Ansprechpartner",
  "Pipeline, Aufgaben & Historie an einem Ort",
  "Automatische Wiedervorlagen & Follow-ups – nichts geht verloren",
  "Finden, anrufen & mailen in einem Tool",
];

// Ablauf in 5 Schritten (Diagramm)
const STEPS: { icon: IconName; t: string; d: string }[] = [
  { icon: "search", t: "Finden", d: "Branche & Umkreis – echte Firmen" },
  { icon: "bolt", t: "Kontaktdaten", d: "Telefon & Ansprechpartner automatisch" },
  { icon: "pipeline", t: "Pipeline", d: "Per Drag & Drop durch die Stages" },
  { icon: "phone", t: "Anrufen", d: "Klick-to-Call, Ergebnis loggt sich" },
  { icon: "check", t: "Abschluss", d: "Wiedervorlage & Nachfass automatisch" },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Woher kommen die Daten?", a: "Wir bündeln öffentlich zugängliche Brancheninformationen mit unserer eigenen Recherche-Technologie und verdichten sie zu anrufbaren Kontakten (Telefon, Adresse, Ansprechpartner). Die genaue Methodik ist Teil unseres Know-hows." },
  { q: "Für welche Branchen funktioniert das?", a: `Für ${BRANCHEN_N}+ Branchen aus 12 Kategorien – von Praxen, Hotels und Restaurants über Autohäuser, Steuerberater und Hausverwaltungen bis zu Handwerk und Industrie. Findest du eine Nische nicht im Katalog, suchst du sie einfach per freiem Stichwort.` },
  { q: "Für wen ist das Tool?", a: "Für jeden Dienstleister, der B2B-Kunden gewinnt – Reinigung, Handwerk, Garten-/Hausmeisterservice, Agenturen, IT, Beratung, Personaldienstleister u. v. m. Du wählst deine Zielbranchen, KundenRadar findet passende Firmen im Umkreis." },
  { q: "Ersetzt das wirklich Excel & mein bisheriges Vorgehen?", a: "Ja. Finden, Anreichern, Anrufen, Pipeline, Aufgaben, E-Mails und Auswertung passieren in einem Tool – verknüpft. Kein Hin- und Herkopieren zwischen Google, Excel und Notizzetteln mehr." },
  { q: "Ist das DSGVO-konform?", a: "Ja. Es werden ausschließlich öffentliche, geschäftliche Quellen genutzt, die Herkunft jedes Kontakts wird gespeichert, ein Opt-out/Abmeldelink ist in jeder E-Mail Pflicht, und Auskunfts- bzw. Löschanfragen lassen sich jederzeit beantworten." },
  { q: "Brauche ich technisches Wissen?", a: "Nein. Zielbranche und Umkreis wählen, auf Suchen klicken – fertig. Anbieter-Vorlagen erleichtern den Start zusätzlich." },
  { q: "Bekomme ich echte Telefonnummern?", a: "Ja – aus geprüften, öffentlich zugänglichen Quellen. Wir priorisieren Datenqualität (echte, anrufbare Nummern + Ansprechpartner) statt möglichst vieler Treffer." },
  { q: "Wie laufen Testphase und Kündigung?", a: "Du testest KundenRadar 3 Tage mit vollem Zugriff. Für den Start ist eine Zahlungsmethode nötig, belastet wird aber erst nach den 3 Tagen. Kündigst du nicht vor Ablauf der 3 Tage, geht der Test automatisch in das Monatsabo zu 49 € über – jederzeit monatlich mit einem Klick kündbar. Eine dauerhaft kostenlose Version gibt es nicht." },
  { q: "Muss ich für den Gratis-Test eine Zahlungsmethode hinterlegen?", a: "Ja. Beim Start des 3-tägigen Tests hinterlegst du eine Zahlungsmethode, es wird in den 3 Tagen aber nichts abgebucht. Erst danach – und nur, wenn du nicht vorher kündigst – beginnt das Abo zu 49 €/Monat. Vor der Anmeldung siehst du diesen Hinweis klar, und kündigen kannst du jederzeit mit einem Klick." },
  { q: "Funktioniert KundenRadar auch für Webdesign/SEO oder Personalvermittlung?", a: "Ja. Beim ersten Login wählst du deinen Anwendungsfall, und das Tool passt sich an: Webdesign/SEO bewertet automatisch die Website jeder gefundenen Firma (schwache oder fehlende Seite = Verkaufschance); Personalvermittlung/Zeitarbeit findet Firmen mit offenen Stellen über die offizielle Jobsuche-API der Bundesagentur für Arbeit. Den Anwendungsfall kannst du in den Einstellungen jederzeit wechseln." },
  { q: "Woher kommen die offenen Stellen?", a: "Ausschließlich aus der offiziellen Jobsuche-API der Bundesagentur für Arbeit. Es wird nichts von Google oder fremden Webseiten ausgelesen (kein Scraping). Du siehst, welche Firma sucht und seit wann – je länger offen, desto dringender der Bedarf." },
];

function Check() {
  return <span className="mt-0.5 shrink-0 text-[var(--color-brand)]"><Icon name="check" size={15} /></span>;
}

function TrustLine() {
  return <p className="mt-3 text-xs text-[var(--color-faint)]">3 Tage gratis · danach 49 €/Monat · monatlich kündbar</p>;
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[var(--color-line)] py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
        {q}
        <span className="text-[var(--color-faint)] transition-transform group-open:rotate-45"><Icon name="plus" size={16} /></span>
      </summary>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{a}</p>
    </details>
  );
}

// Structured Data (schema.org) – hilft Google bei Einordnung & Rich Snippets.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${config.appUrl}/#organization`,
      name: "Seciora Solutions",
      url: config.appUrl,
      email: "kontakt@seciora-solutions.de",
      brand: "KundenRadar",
      logo: `${config.appUrl}/logo.png`,
      image: `${config.appUrl}/logo.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${config.appUrl}/#website`,
      url: config.appUrl,
      name: "KundenRadar",
      inLanguage: "de-DE",
      publisher: { "@id": `${config.appUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "KundenRadar",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: config.appUrl,
      description:
        "B2B-Neukunden finden, anrufen und per E-Mail ansprechen – Lead-Recherche, Pipeline, Anrufe, Aufgaben und E-Mail-Outreach in einem Tool.",
      offers: { "@type": "Offer", price: "49", priceCurrency: "EUR" },
      publisher: { "@id": `${config.appUrl}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Landing() {
  // Mit Supabase-Auth → Registrierung/Anmeldung; im lokalen Demo-Modus direkt ins Tool.
  const signupHref = config.supabase.enabled ? "/registrieren" : "/dashboard";
  const loginHref = config.supabase.enabled ? "/login" : "/dashboard";
  const planSignup = config.supabase.enabled ? "/registrieren" : undefined;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <WhatsAppWidget />
      <PromoBar />
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={16} strokeWidth={2.2} /></span>
            <span className="font-semibold">KundenRadar</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[var(--color-ink-2)] md:flex">
            <a href="#funktionen" className="hover:text-[var(--color-ink)]">Funktionen</a>
            <a href="#ablauf" className="hover:text-[var(--color-ink)]">Ablauf</a>
            <a href="#zielgruppe" className="hover:text-[var(--color-ink)]">Für wen?</a>
            <a href="#preise" className="hover:text-[var(--color-ink)]">Preise</a>
            <a href="/rechner" className="hover:text-[var(--color-ink)]">Rechner</a>
            <a href="/blog" className="hover:text-[var(--color-ink)]">Blog</a>
            <a href="#faq" className="hover:text-[var(--color-ink)]">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={loginHref} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]">Anmelden</Link>
            <Link href={signupHref} className="rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]"><span className="sm:hidden">Starten</span><span className="hidden sm:inline">Kostenlos starten</span></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="kalkulator" className="relative mx-auto max-w-6xl overflow-hidden px-6 py-14 lg:py-20">
        {/* Radar-Hintergrund (dekorativ, on-brand) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center">
          <div className="relative mt-2 h-[560px] w-[560px] max-w-[92vw]">
            <div className="kr-aurora left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="kr-ring" />
            <div className="kr-ring" style={{ animationDelay: "1.3s" }} />
            <div className="kr-ring" style={{ animationDelay: "2.6s" }} />
            <div className="kr-radar-sweep opacity-70" />
            <span className="kr-blip absolute left-[30%] top-[35%] h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" style={{ animationDelay: "0.5s" }} />
            <span className="kr-blip absolute left-[65%] top-[28%] h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" style={{ animationDelay: "1.8s" }} />
            <span className="kr-blip absolute left-[58%] top-[62%] h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" style={{ animationDelay: "2.7s" }} />
            <span className="kr-blip absolute left-[38%] top-[60%] h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" style={{ animationDelay: "3.4s" }} />
          </div>
        </div>

        <div className="relative z-10">
        {/* Painpoint → Lösung → Benefit (zentriert) */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Für Dienstleister</span>
            <span className="rounded-full border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)]/40 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">{BRANCHEN_N}+ Branchen</span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            Neue Kunden finden – <span className="text-[var(--color-brand)]">ohne stundenlanges Googeln</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
            KundenRadar liefert dir anrufbare Firmen mit Telefon & Ansprechpartner und bündelt Pipeline, Anrufe,
            Aufgaben & E-Mail in einem Tool.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--color-ink-2)]">
            {[
              "Echte Durchwahlen & Ansprechpartner",
              "Alles an einem Ort statt Excel & Zettel",
              "Gratis-Preisrechner inklusive",
            ].map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <Icon name="check" size={15} className="shrink-0 text-[var(--color-brand)]" />{b}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href={signupHref} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] shadow-[0_0_0_1px_rgba(168,232,58,0.25),0_8px_24px_-6px_rgba(168,232,58,0.5)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-brand-ink)]">
              Kostenlos starten <Icon name="chevronRight" size={16} />
            </Link>
            <Link href="/check" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line-strong)] px-5 py-3 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
              <Icon name="search" size={15} /> Neukunden gratis prüfen
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--color-faint)]">3 Tage gratis testen · DSGVO-konform · Daten aus öffentlichen Quellen</p>
          <p className="mt-2 text-xs">
            <a
              href="https://wa.me/4915292627062?text=Hallo%2C%20ich%20habe%20eine%20Frage%20zu%20KundenRadar."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:underline"
              style={{ color: "#1ca64c" }}
            >
              <svg viewBox="0 0 32 32" width="14" height="14" fill="#25D366" aria-hidden="true"><path d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.1.55 4.16 1.6 5.98L4 28l6.22-1.63a11.9 11.9 0 0 0 5.82 1.5c6.6 0 11.96-5.36 11.96-11.96C28.01 9.36 22.64 4 16.04 4zm5.46 16.45c-.25.7-1.45 1.34-2.02 1.42-.51.08-1.16.11-1.87-.12-.43-.13-.98-.31-1.69-.62-2.98-1.29-4.93-4.29-5.08-4.49-.15-.2-1.22-1.62-1.22-3.09s.78-2.19 1.05-2.49c.28-.3.6-.37.8-.37l.57.01c.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.33-.3.5-.15.17-.32.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.28 1.66 2.07 1.14 1.02 2.1 1.33 2.4 1.48.3.15.48.13.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.23.57.35.08.12.08.72-.17 1.42z" /></svg>
              Fragen? Schreib uns auf WhatsApp
            </a>
          </p>
        </div>

        {/* Live-Check als Hero-Bühne (echter, interaktiver Beweis) */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-brand)]">
            <Icon name="search" size={14} /> Live-Check · echte Daten, keine Anmeldung
          </div>
          <CheckWidget />
        </div>
        </div>
      </section>

      {/* Vertrauens-Leiste (ehrliche Fakten, keine erfundene Bewertung) */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-surface)]/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-5 text-sm text-[var(--color-muted)]">
          {["Aus der Vertriebspraxis entwickelt", "DSGVO-konform · EU-Hosting", "Offizielle & öffentliche Datenquellen", "3 Tage gratis testen"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="text-[var(--color-brand)]"><Icon name="check" size={15} /></span>{t}
            </span>
          ))}
        </div>
      </section>

      {/* Ablauf-Diagramm – 5 Schritte */}
      <section id="ablauf" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">In 5 Schritten zum Termin</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--color-muted)]">Ein durchgängiger Ablauf – jeder Schritt greift automatisch in den nächsten.</p>
        <div className="mt-10 flex flex-col items-stretch gap-3 md:flex-row md:items-stretch">
          {STEPS.map((s, i) => (
            <Fragment key={s.t}>
              <Reveal delay={i * 70} className="flex-1">
                <div className="flex h-full flex-col items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-center transition-all hover:-translate-y-1 hover:border-[var(--color-brand)]/40">
                  <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]">
                    <Icon name={s.icon} size={22} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--color-brand)] text-[10px] font-bold text-[var(--color-on-brand)] tnum">{i + 1}</span>
                  </span>
                  <div className="mt-3 text-[15px] font-semibold">{s.t}</div>
                  <div className="mt-1 text-xs text-[var(--color-muted)]">{s.d}</div>
                </div>
              </Reveal>
              {i < STEPS.length - 1 && (
                <div className="hidden shrink-0 items-center self-center text-[var(--color-line-strong)] md:flex"><Icon name="chevronRight" size={22} /></div>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* Vorher / Nachher */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Schluss mit Excel, Google & Zettel</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--color-muted)]">Dein Vertrieb läuft heute über vier Tools – KundenRadar bündelt alles an einem Ort.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-[var(--color-line)] p-7">
            <h3 className="text-lg font-semibold text-[var(--color-ink-2)]">Das alte Spiel</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-muted)]">
              {ALT.map((t) => (
                <li key={t} className="flex gap-2"><span className="mt-0.5 shrink-0 text-[var(--color-danger)]"><Icon name="x" size={15} /></span>{t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-2xl border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)]/30 p-7">
            <h3 className="text-lg font-semibold">Mit KundenRadar</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-ink-2)]">
              {NEU.map((t) => (
                <li key={t} className="flex gap-2"><Check />{t}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Funktions-Showcase */}
      <section id="funktionen" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Alles, was dein Vertrieb braucht</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--color-muted)]">Vom ersten Treffer bis zum gewonnenen Auftrag – jeder Schritt ist eingebaut und miteinander verbunden.</p>
        <div className="mt-12 space-y-14">
          {SHOWCASE.slice(0, 4).map((s, i) => (
            <Reveal key={s.title}>
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="eyebrow text-[var(--color-brand)]">{s.tag}</span>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.01em]">{s.title}</h3>
                  <p className="mt-3 text-[var(--color-muted)]">{s.text}</p>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-2)]">
                    {s.bullets.map((b) => <li key={b} className="flex gap-2"><Check />{b}</li>)}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]">
                    {s.mock}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Kompaktes Feature-Raster */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(0, 6).map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="group h-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--color-brand)]/40 hover:shadow-[0_14px_34px_-14px_rgba(168,232,58,0.28)]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)] transition-transform group-hover:scale-110"><Icon name={f.icon} size={19} /></span>
                <h3 className="mt-3 text-[15px] font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Für wen + Branchen-Breite */}
      {/* Für wen – Persona-Modi (Relevanz: das Tool passt sich an) */}
      <section id="zielgruppe" className="border-y border-[var(--color-line)] bg-[var(--color-surface)]/40">
        <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Für wen ist KundenRadar gemacht?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-muted)]">
            Beim ersten Login sagst du, was du machst – und das Tool passt Suche, Signale &amp; Module an dein Geschäft an.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: "wrench" as IconName, tag: "Dienstleister & Handwerk", title: "Anrufbare Firmen finden", text: "Branche & Umkreis wählen – echte Firmen mit Telefon, Adresse und Ansprechpartner, direkt in die Pipeline." },
              { icon: "globe" as IconName, tag: "Webdesign & SEO", title: "Schwache Websites aufspüren", text: "Jede gefundene Firma wird automatisch bewertet: langsame, unsichere oder fehlende Seiten sind dein Verkaufsaufhänger." },
              { icon: "user" as IconName, tag: "Personalvermittlung & Zeitarbeit", title: "Firmen mit offenen Stellen", text: "Über die offizielle Jobsuche-API der Bundesagentur: wer sucht, seit wann – inkl. Kontakt. Legal, ohne Scraping." },
            ].map((m, i) => (
              <Reveal key={m.tag} delay={i * 70}>
                <div className="flex h-full flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--color-brand)]/40">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]"><Icon name={m.icon} size={20} /></span>
                  <span className="mt-4 eyebrow">{m.tag}</span>
                  <h3 className="mt-1 text-lg font-semibold tracking-[-0.01em]">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-muted)]">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Branchen-Breite (Coverage: ja, auch deine Nische) */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">…und findet deine Zielkunden in {BRANCHEN_N}+ Branchen</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--color-muted)]">{BRANCHEN_KATEGORIEN.length} Kategorien – plus freie Stichwortsuche für jede Nische, die nicht dabei ist.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {BRANCHEN_KATEGORIEN.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--color-brand)]/40">
              <span className="text-[var(--color-brand)]"><Icon name={c.icon} size={14} /></span>
              {c.label}
            </span>
          ))}
        </div>
        <details className="group mx-auto mt-5 max-w-3xl">
          <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
            Alle {BRANCHEN_N}+ Branchen anzeigen
            <span className="transition-transform group-open:rotate-45"><Icon name="plus" size={14} /></span>
          </summary>
          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {BRANCHEN_KATEGORIEN.flatMap((c) => c.branchen).map((b) => (
              <span key={b} className="rounded-full bg-[var(--color-subtle)] px-2.5 py-1 text-[11px] text-[var(--color-muted)]">{b}</span>
            ))}
          </div>
        </details>
      </section>

      {/* Gratis-Rechner (aus dem Hero nach unten verlagert) */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-surface)]/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--color-brand)]">
            <Icon name="calculator" size={14} /> Gratis-Rechner – sofort testen
          </div>
          <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Was solltest du verlangen?</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--color-muted)]">Stundensatz &amp; Angebotspreis in Sekunden – ohne Anmeldung.</p>
          <div className="mt-8"><LazyKalkulator teaser /></div>
        </div>
      </section>

      {/* Fakten & Zahlen */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Warum sich das rechnet</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--color-muted)]">Echte Zahlen zum Tool – plus ein typisches Zeitbeispiel.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Zeit-Vergleich (Balken, Beispiel) */}
          <Reveal className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
            <div className="text-sm font-semibold">Zeit für eine fertige Anrufliste</div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1 flex items-baseline justify-between text-xs text-[var(--color-muted)]"><span>Manuell googeln &amp; Nummern sammeln</span><span className="tnum">~3 Std</span></div>
                <GrowBar widthPct={100} color="var(--color-danger)" />
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between text-xs"><span className="text-[var(--color-muted)]">Mit KundenRadar</span><span className="tnum font-semibold text-[var(--color-brand)]">~5 Min</span></div>
                <GrowBar widthPct={4} color="var(--color-brand)" />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-[var(--color-faint)]">Beispielhafte Schätzung – die tatsächliche Zeit hängt von Branche, Umkreis und Datenlage ab.</p>
          </Reveal>
          {/* Fakten-Kacheln (echte Zahlen) */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { node: <CountUp to={BRANCHEN_N} suffix="+" />, label: "Branchen im Katalog" },
              { node: <CountUp to={3} />, label: "Arbeitsweisen: Dienstleister · Webdesign · Personal" },
              { node: <CountUp to={1} />, label: "Tool statt vier (Suche, CRM, Aufgaben, E-Mail)" },
              { node: "3 Tage", label: "gratis testen, danach monatlich kündbar" },
            ].map((f, i) => (
              <Reveal key={f.label} delay={i * 70}>
                <div className="flex h-full flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                  <div className="text-3xl font-semibold text-[var(--color-brand)] tnum">{f.node}</div>
                  <div className="mt-1 text-xs text-[var(--color-muted)]">{f.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DSGVO / Vertrauen */}
      <section className="mx-auto max-w-4xl px-6 py-12 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]"><Icon name="check" size={24} /></span>
        <h2 className="mt-4 text-2xl font-semibold">Rechtssicher & transparent</h2>
        <p className="mt-3 text-[var(--color-muted)]">
          Wir verarbeiten ausschließlich <strong className="text-[var(--color-ink-2)]">öffentlich zugängliche, geschäftliche
          Kontaktdaten</strong>. Die Herkunft jedes Kontakts wird gespeichert, Abmeldungen landen automatisch auf einer
          Opt-out-Liste, und Auskunfts-/Löschanfragen sind jederzeit erfüllbar.
        </p>
      </section>

      {/* Preise */}
      <section id="preise" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Einfache Preise</h2>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">Ein Paket, alles drin – unbegrenzte Agenten & Kontakte. Monatlich kündbar.</p>

        {/* Frühbucher-Aktion mit Countdown */}
        <PromoPricing />

        {/* Gratis-Test als Blickfang */}
        <Reveal className="mx-auto mt-8 max-w-md rounded-2xl border-2 border-[var(--color-brand)] bg-[var(--color-brand-tint)]/20 p-7 text-center">
          <span className="eyebrow text-[var(--color-brand)]">Jetzt starten</span>
          <div className="mt-1 text-6xl font-bold tracking-[-0.03em] text-[var(--color-brand)] tnum">0,00 €</div>
          <div className="mt-1 text-2xl font-bold tracking-[-0.01em]">3 Tage Test</div>
          <p className="mt-3 text-sm text-[var(--color-muted)]">Voller Zugriff für 3 Tage. Eine Zahlungsmethode ist nötig – belastet wird erst danach.</p>
          <Link href={signupHref} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-[var(--color-on-brand)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-brand-ink)]">
            Kostenlos starten <Icon name="chevronRight" size={16} />
          </Link>
          <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-[var(--color-faint)]">
            Hinweis: Nach den 3 Tagen geht der Test automatisch in das Abo zu 49 €/Monat über, wenn du nicht vorher kündigst. Jederzeit mit einem Klick monatlich kündbar.
          </p>
        </Reveal>

        <div className={`mt-10 grid gap-5 ${PLANS.length === 1 ? "max-w-md mx-auto" : "lg:grid-cols-3"}`}>
          {PLANS.map((t, i) => (
            <Reveal key={t.key} delay={i * 80}>
              <div className={`relative h-full rounded-2xl bg-[var(--color-surface)] p-6 transition-all hover:-translate-y-1 ${t.highlight ? "border-2 border-[var(--color-brand)] shadow-[0_16px_40px_-16px_rgba(168,232,58,0.3)]" : "border border-[var(--color-line)] hover:border-[var(--color-brand)]/40"}`}>
                {t.highlight && <span className="absolute -top-3 left-6 rounded-full bg-[var(--color-brand)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-on-brand)]">Beliebt</span>}
                <h3 className="font-semibold">{t.name}</h3>
                <div className="mt-2 flex items-baseline gap-1.5"><span className="text-3xl font-semibold tnum">{t.price}</span><span className="text-sm text-[var(--color-muted)]">{t.priceNote}</span></div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {t.feats.map((f) => <li key={f} className="flex gap-2"><Check />{f}</li>)}
                </ul>
                <PlanButton plan={t.key} label={t.cta} highlight={t.highlight} signupHref={planSignup} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
        <div className="mt-8">
          {FAQ.map((f) => <Faq key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)]/20 px-6 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.01em]">Füll deine Pipeline – noch heute.</h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--color-muted)]">Leg in 2 Minuten deinen ersten Agenten an und hol dir anrufbare Neukunden.</p>
          <Link href={signupHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Kostenlos starten <Icon name="chevronRight" size={16} />
          </Link>
          <TrustLine />
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <NewsletterSignup source="homepage-footer" />
        </div>
      </section>

      {/* Städte – Aufträge & Neukunden lokal finden (interne Verlinkung + SEO) */}
      <section className="border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Aufträge &amp; Neukunden finden in deiner Stadt</h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/neukunden-finden/${c.slug}`} className="rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-[var(--color-muted)] sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={13} strokeWidth={2.2} /></span>
            <span>© {new Date().getFullYear()} KundenRadar</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/blog" className="hover:text-[var(--color-ink)]">Blog</Link>
            <Link href="/rechner" className="hover:text-[var(--color-ink)]">Rechner</Link>
            <Link href="/newsletter" className="hover:text-[var(--color-ink)]">Newsletter</Link>
            <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
            <Link href="/agb" className="hover:text-[var(--color-ink)]">AGB</Link>
            <Link href="/widerruf" className="hover:text-[var(--color-ink)]">Widerruf</Link>
            <Link href="/preise" className="hover:text-[var(--color-ink)]">Preise</Link>
            <Link href="/kuendigung" className="hover:text-[var(--color-ink)]">Verträge hier kündigen</Link>
            <Link href="/kontakt" className="hover:text-[var(--color-ink)]">Kontakt</Link>
            <a href="https://wa.me/4915292627062?text=Hallo%2C%20ich%20habe%20eine%20Frage%20zu%20KundenRadar." target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-ink)]">WhatsApp</a>
          </div>
        </div>
      </footer>

      {/* Sticky CTA (mobil) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[var(--color-canvas)]/95 px-4 py-3 backdrop-blur md:hidden">
        <span className="text-xs text-[var(--color-muted)]">3 Tage gratis testen · monatlich kündbar</span>
        <Link href={signupHref} className="shrink-0 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)]">Starten</Link>
      </div>
    </div>
  );
}
