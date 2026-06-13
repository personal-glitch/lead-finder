import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Telefonakquise im B2B: Leitfaden, Gesprächseinstieg & Rechtslage";
const DESC =
  "So gelingt Kaltakquise am Telefon im B2B: rechtlicher Rahmen (§ 7 UWG), ein erprobter Gesprächseinstieg, Einwand-Behandlung und wie du die richtigen Firmen findest.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/telefonakquise-b2b-leitfaden" },
};

export default function Page() {
  const url = `${config.appUrl}/blog/telefonakquise-b2b-leitfaden`;
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
            Das Telefon ist im B2B nach wie vor der direkteste Vertriebskanal – wenn man es richtig macht. Hier der
            Rahmen, ein erprobter Einstieg und der Umgang mit den häufigsten Einwänden.
          </P>

          <H2>Ist Telefonakquise im B2B erlaubt?</H2>
          <P>
            Gegenüber Unternehmen ist ein Werbeanruf zulässig, wenn eine mutmaßliche Einwilligung vorliegt
            (§ 7 Abs. 2 Nr. 1 UWG) – also ein sachlicher Bezug deines Angebots zur Tätigkeit der Firma. Gegenüber
            Verbrauchern ist Kaltakquise am Telefon dagegen grundsätzlich unzulässig. Bei E-Mail gelten strengere Regeln;
            Details im{" "}
            <Link href="/blog/kaltakquise-b2b-erlaubt" className="text-[var(--color-brand)] hover:underline">UWG-Ratgeber</Link>.
            Dieser Beitrag ist allgemeine Information, keine Rechtsberatung.
          </P>

          <H2>Vorbereitung: die richtigen Firmen & der richtige Kontakt</H2>
          <P>
            Gute Akquise beginnt vor dem Anruf. Recherchiere passende Firmen im Umkreis und den richtigen
            Ansprechpartner, damit du nicht im Vorzimmer hängenbleibst. KundenRadar liefert dir anrufbare Firmen mit
            Telefonnummer und Ansprechpartner – plus eine Anrufliste mit Tagesziel.
          </P>

          <H2>Ein erprobter Gesprächseinstieg</H2>
          <UL items={[
            "Begrüßung & Name: kurz, klar, freundlich.",
            "Relevanz in einem Satz: warum rufst du genau diese Firma an?",
            "Erlaubnisfrage: „Haben Sie 30 Sekunden?“ – Respekt vor der Zeit.",
            "Nutzen statt Produkt: was hat der Gegenüber davon, nicht was du verkaufst.",
            "Klares Mini-Ziel: Termin, Unterlagen oder Rückruf – nicht gleich der Abschluss.",
          ]} />

          <H2>Die häufigsten Einwände – und gute Reaktionen</H2>
          <P>
            „Kein Interesse" heißt oft „kein erkannter Nutzen" – frage nach, statt zu drängen. „Schicken Sie was per
            Mail" ist ein Etappenziel: Einwilligung einholen, dann darfst du auch mailen. „Keine Zeit" akzeptieren und
            einen konkreten Rückruftermin vereinbaren.
          </P>

          <H2>Dranbleiben ohne zu nerven</H2>
          <P>
            Die meisten Abschlüsse passieren erst nach mehreren Kontakten. Halte Ergebnis und nächsten Schritt fest und
            lass dir die Wiedervorlage automatisch anlegen – in KundenRadar rückt jeder Anruf den Kontakt automatisch in
            die richtige Stage und plant den Nachfass.
          </P>

          <H2>Fazit</H2>
          <P>
            Mit klarem Rahmen, gutem Einstieg und konsequentem Nachfassen wird Telefonakquise im B2B planbar. Entscheidend
            ist Vorbereitung: die richtigen Firmen, der richtige Kontakt, ein konkreter Anlass.
          </P>
        </div>
      </article>
    </MarketingShell>
  );
}
