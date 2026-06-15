import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, JsonLd } from "@/components/landing/MarketingShell";
import { FreebieCta } from "@/components/landing/FreebieCta";
import { H2, P, UL } from "@/components/landing/LegalShell";
import { config } from "@/lib/config";

const TITLE = "Ist Kaltakquise per E-Mail im B2B erlaubt? (§ 7 UWG einfach erklärt)";
const DESC =
  "B2B-Kaltakquise per E-Mail braucht grundsätzlich eine vorherige Einwilligung (§ 7 UWG). Bei Telefon-Werbung an Firmen reicht eine mutmaßliche Einwilligung. Hier die Regeln verständlich – mit Checkliste.";

export const metadata: Metadata = {
  title: `${TITLE} – KundenRadar`,
  description: DESC,
  alternates: { canonical: "/blog/kaltakquise-b2b-erlaubt" },
};

const FAQ = [
  { q: "Darf ich Firmen ungefragt eine Werbe-E-Mail schicken?", a: "Grundsätzlich nein. § 7 Abs. 2 Nr. 2 UWG verlangt für E-Mail-Werbung – auch im B2B – eine vorherige ausdrückliche Einwilligung des Empfängers. Ohne sie gilt die Mail als unzumutbare Belästigung und ist abmahnfähig." },
  { q: "Was ist mit 'mutmaßlicher Einwilligung'?", a: "Die mutmaßliche Einwilligung gilt nur für Telefon-Werbung gegenüber Unternehmen (§ 7 Abs. 2 Nr. 1 UWG) – nicht für E-Mails. Für Mails brauchst du eine echte, vorherige Einwilligung." },
  { q: "Gibt es Ausnahmen für E-Mail?", a: "Ja, die Bestandskunden-Ausnahme (§ 7 Abs. 3 UWG): Wenn du die Adresse beim Verkauf einer Ware/Dienstleistung erhalten hast, für eigene ähnliche Produkte wirbst, der Kunde nicht widersprochen hat und bei jeder Mail auf das Widerspruchsrecht hingewiesen wird." },
  { q: "Wie hole ich rechtssicher eine Einwilligung ein?", a: "Am sichersten per Double-Opt-In: Interessent trägt sich z. B. für einen Newsletter oder ein kostenloses Angebot ein und bestätigt per Klick die Bestätigungs-Mail. Diese Einwilligung dokumentierst du." },
];

export default function Page() {
  const url = `${config.appUrl}/blog/kaltakquise-b2b-erlaubt`;
  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESC,
          datePublished: "2026-06-11",
          dateModified: "2026-06-11",
          author: { "@type": "Organization", name: "Seciora Solutions" },
          publisher: { "@type": "Organization", name: "KundenRadar" },
          mainEntityOfPage: url,
        }}
      />
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

      <article>
        <Link href="/blog" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">← Blog</Link>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-4xl">{TITLE}</h1>
        <p className="mt-3 text-base text-[var(--color-muted)]">{DESC}</p>

        <div className="mt-8">
          <P>
            „Ich schreibe einfach 200 Firmen an, das ist doch B2B" – diesen Satz hört man oft. Leider ist er rechtlich
            riskant. Die wichtigste Regel zuerst: <strong>Werbung per E-Mail braucht in Deutschland grundsätzlich
            eine vorherige, ausdrückliche Einwilligung des Empfängers – auch zwischen Unternehmen.</strong> Das steht
            in § 7 Abs. 2 Nr. 2 UWG.
          </P>

          <H2>E-Mail ist strenger als Telefon</H2>
          <P>
            Viele verwechseln zwei Dinge. Bei der <em>Telefon</em>-Werbung gegenüber anderen Unternehmen (nicht
            Verbrauchern) genügt nach § 7 Abs. 2 Nr. 1 UWG eine <em>mutmaßliche</em> Einwilligung – also ein sachlicher
            Grund anzunehmen, dass das angerufene Unternehmen an deinem Angebot interessiert ist. Für
            <strong> E-Mail-Werbung gibt es diese Erleichterung nicht.</strong> Hier verlangt das Gesetz eine echte,
            vorher erteilte Einwilligung – egal ob B2B oder B2C.
          </P>

          <H2>Die einzige praktische Ausnahme: Bestandskunden</H2>
          <P>
            § 7 Abs. 3 UWG erlaubt E-Mail-Werbung ohne separate Einwilligung, wenn <strong>alle</strong> vier
            Voraussetzungen erfüllt sind:
          </P>
          <UL items={[
            "Du hast die E-Mail-Adresse im Zusammenhang mit dem Verkauf einer Ware oder Dienstleistung erhalten.",
            "Du wirbst für eigene, ähnliche Waren oder Dienstleistungen.",
            "Der Kunde hat der Nutzung nicht widersprochen.",
            "Bei Erhebung und in jeder Mail wird klar und deutlich auf das jederzeitige Widerspruchsrecht hingewiesen.",
          ]} />

          <H2>Was droht bei Verstößen?</H2>
          <P>
            Unzulässige Werbe-Mails sind „unzumutbare Belästigung". Empfänger, Mitbewerber und Verbände können
            <strong> abmahnen</strong>; es drohen Unterlassungsansprüche samt Anwalts- und ggf. Gerichtskosten sowie
            bei Wiederholung Vertragsstrafen. Zusätzlich verarbeitest du personenbezogene Daten – die DSGVO gilt
            also obendrein.
          </P>

          <H2>Wie macht man es richtig?</H2>
          <UL items={[
            "Einwilligung aktiv einsammeln – z. B. per Double-Opt-In über einen Newsletter, ein kostenloses Tool oder ein Whitepaper. Die Einwilligung dokumentieren.",
            "Im B2B telefonisch starten: Bei Firmen ist der Anruf mit sachlichem Bezug zulässig (mutmaßliche Einwilligung). Im Gespräch kannst du um Erlaubnis bitten, Infos per Mail zu senden.",
            "Bestehende Kunden auf Basis von § 7 Abs. 3 UWG ansprechen.",
            "Kanäle ohne E-Mail-Werbeverbot nutzen, z. B. eine persönliche LinkedIn-Nachricht oder Post.",
            "Immer: vollständiges Impressum und ein funktionierender Abmeldelink in jeder Mail.",
          ]} />

          <H2>Und konkret für die eigene Akquise?</H2>
          <P>
            Wenn du Firmen für dein Angebot gewinnen willst, ist der sauberste Weg: <strong>recherchieren, anrufen,
            und Einwilligungen aufbauen</strong>. Genau dafür ist KundenRadar gemacht – es liefert dir passende Firmen
            mit Telefonnummer und Ansprechpartner, sodass du den (im B2B zulässigen) Telefonweg gehen und dir nach
            und nach eine eigene, einwilligungsbasierte Mailingliste aufbauen kannst.
          </P>

          <p className="mt-6 text-xs leading-relaxed text-[var(--color-faint)]">
            Hinweis: Dieser Beitrag ist eine allgemeine, sorgfältig recherchierte Information und keine Rechtsberatung.
            Im Zweifel hilft eine auf IT-/Wettbewerbsrecht spezialisierte Kanzlei.
          </p>
        </div>

        <section className="mt-12">
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
        <FreebieCta source="blog" />
      </article>
    </MarketingShell>
  );
}
