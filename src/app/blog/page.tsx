import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/landing/MarketingShell";

export const metadata: Metadata = {
  title: "Blog: Neukunden, Akquise & Vertrieb für Dienstleister – KundenRadar",
  description:
    "Praxisnahe Ratgeber zu Neukundengewinnung, Kaltakquise (§7 UWG), Angeboten und Vertrieb – für Reinigungsfirmen, Handwerk, Webdesign/SEO, Personalvermittlung, Zeitarbeit und andere Dienstleister.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  {
    href: "/blog/kaltakquise-b2b-erlaubt",
    title: "Ist Kaltakquise per E-Mail im B2B erlaubt? (§ 7 UWG einfach erklärt)",
    excerpt:
      "Wann du Firmen ungefragt per E-Mail anschreiben darfst – und wann nicht. Die Regeln des § 7 UWG verständlich, mit Checkliste und Praxistipps.",
    date: "2026-06-11",
  },
  {
    href: "/blog/neukunden-reinigungsfirma",
    title: "Neukunden gewinnen als Reinigungsfirma – 7 Wege, die wirklich funktionieren",
    excerpt:
      "Von Hausverwaltungen über Empfehlungen bis zur gezielten Umkreis-Suche: konkrete Wege, wie Gebäudereiniger planbar an neue Aufträge kommen.",
    date: "2026-06-11",
  },
  {
    href: "/blog/webdesign-kunden-gewinnen",
    title: "Webdesign-Kunden gewinnen: 6 Wege zu Firmen mit schlechter Website",
    excerpt:
      "Veraltete oder fehlende Websites als Verkaufschance erkennen, objektiv bewerten und gezielt ansprechen – für Webdesigner und SEO-Dienstleister.",
    date: "2026-06-13",
  },
  {
    href: "/blog/offene-stellen-vertriebssignal",
    title: "Offene Stellen als Vertriebssignal – legal Firmen mit Personalbedarf finden",
    excerpt:
      "Wie Personalvermittler und Zeitarbeitsfirmen über die offizielle Jobsuche-API der Bundesagentur Firmen mit Bedarf finden – ohne Scraping, datenschutzkonform.",
    date: "2026-06-13",
  },
  {
    href: "/blog/personalvermittlung-kunden-gewinnen",
    title: "Kunden gewinnen als Personalvermittler & Zeitarbeitsfirma – 6 praxiserprobte Wege",
    excerpt:
      "Offene Stellen als Signal nutzen, die richtigen Ansprechpartner finden und mit klarer Kalkulation überzeugen – planbare Akquise im Personalgeschäft.",
    date: "2026-06-13",
  },
  {
    href: "/blog/neukunden-handwerksbetrieb",
    title: "Neukunden gewinnen als Handwerksbetrieb – 7 Wege zu mehr Aufträgen",
    excerpt:
      "Hausverwaltungen, Bauträger und Betriebe gezielt ansprechen, sauber kalkulieren und systematisch akquirieren – planbar mehr gewerbliche Aufträge.",
    date: "2026-06-13",
  },
  {
    href: "/blog/telefonakquise-b2b-leitfaden",
    title: "Telefonakquise im B2B: Leitfaden, Gesprächseinstieg & Rechtslage",
    excerpt:
      "Rechtlicher Rahmen (§ 7 UWG), ein erprobter Gesprächseinstieg, Einwand-Behandlung und wie du die richtigen Firmen für den Anruf findest.",
    date: "2026-06-13",
  },
  {
    href: "/blog/angebot-schreiben-dienstleister",
    title: "Angebot schreiben als Dienstleister: Aufbau, Preis & häufige Fehler",
    excerpt:
      "Klarer Aufbau, marktgerechter Preis, typische Fehler – und wie du in Minuten ein sauberes Angebots-PDF erstellst.",
    date: "2026-06-13",
  },
];

export default function BlogIndex() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Blog</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Ratgeber für deinen Vertrieb</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted)]">
          Praxisnahe Tipps zu Neukundengewinnung, Akquise und Angeboten – für Reinigungsfirmen, Handwerk und
          andere Dienstleister.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        {POSTS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="block rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-brand)]/40"
          >
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{p.title}</h2>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">{p.excerpt}</p>
            <span className="mt-3 inline-block text-sm font-medium text-[var(--color-brand)]">Weiterlesen →</span>
          </Link>
        ))}
      </div>
    </MarketingShell>
  );
}
