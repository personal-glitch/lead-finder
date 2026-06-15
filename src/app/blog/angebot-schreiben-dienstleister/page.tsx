import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { FreebieCta } from "@/components/landing/FreebieCta";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Angebot schreiben als Dienstleister: Aufbau, Preis & häufige Fehler";
const DESC =
  "Wie du als Dienstleister ein überzeugendes Angebot schreibst: klarer Aufbau, marktgerechter Preis, die typischen Fehler – und wie du in Minuten ein sauberes Angebots-PDF erstellst.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/angebot-schreiben-dienstleister" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/angebot-schreiben-dienstleister`;
  return (
    <MarketingShell>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC,
        datePublished: "2026-06-13", dateModified: "2026-06-13",
        author: { "@type": "Organization", name: "Seciora Solutions" },
        publisher: { "@type": "Organization", name: "KundenRadar" }, mainEntityOfPage: url,
      }} />

      <article>
        <Link href="/blog" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Blog</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">{TITLE}</h1>
        <p className="mt-3 text-base text-[var(--color-muted)]">{DESC}</p>

        <div className="mt-8">
          <P>
            Ein gutes Angebot entscheidet oft über den Auftrag – nicht nur der Preis, sondern auch Klarheit und
            Geschwindigkeit. So baust du ein Angebot auf, das gewinnt.
          </P>

          <H2>Der klare Aufbau</H2>
          <UL items={[
            "Empfänger & Bezug: an wen, worauf bezieht sich das Angebot.",
            "Leistungsbeschreibung: was genau ist enthalten – und was nicht.",
            "Preis & Einheiten: transparent, z. B. pro m², pro Stunde oder als Pauschale.",
            "Konditionen: Gültigkeit, Zahlungsziel, Termin.",
            "Nächster Schritt: wie der Kunde zusagt.",
          ]} />

          <H2>Den Preis marktgerecht kalkulieren</H2>
          <P>
            Zu günstig anzubieten kostet Marge, zu teuer kostet den Auftrag. Nutze einen passenden Rechner als
            Orientierung:{" "}
            <Link href="/rechner/gebaeudereinigung" className="text-[var(--color-brand)] hover:underline">Reinigungskosten</Link>,{" "}
            <Link href="/rechner/handwerk-stundensatz" className="text-[var(--color-brand)] hover:underline">Handwerk-Stundensatz</Link>{" "}
            oder{" "}
            <Link href="/rechner/agentur-stundensatz" className="text-[var(--color-brand)] hover:underline">Agentur-Stundensatz</Link>.
            So gehst du nie unter deinem kostendeckenden Satz ins Angebot.
          </P>

          <H2>Die häufigsten Fehler</H2>
          <UL items={[
            "Zu langsam: wer Tage wartet, verliert gegen den Schnelleren.",
            "Zu vage: unklare Leistungen führen zu Nachverhandlung und Streit.",
            "Kein Puffer: Korrekturschleifen und Zusatzwünsche nicht eingeplant.",
            "Kein Nachfass: das beste Angebot bringt nichts ohne Erinnerung.",
          ]} />

          <H2>Schnell ein sauberes Angebots-PDF</H2>
          <P>
            In KundenRadar kalkulierst du den Preis und erstellst daraus in Minuten ein professionelles Angebots-PDF –
            mit Angebotsnummer, Empfängerblock und klarer Positionsübersicht. Der Kontakt samt Angebot bleibt in deiner
            Pipeline, inklusive automatischem Nachfass.
          </P>

          <H2>Fazit</H2>
          <P>
            Klar, schnell, marktgerecht kalkuliert – und konsequent nachgefasst. Wer diese vier Dinge beherzigt, gewinnt
            spürbar mehr Aufträge aus denselben Anfragen.
          </P>
        </div>
        <FreebieCta source="blog" />
      </article>
    </MarketingShell>
  );
}
