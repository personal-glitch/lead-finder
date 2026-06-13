"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { eur } from "@/lib/kalkulator";

type Modus = "provision" | "zeitarbeit";

const FAQS = [
  { q: "Wie hoch ist die Provision bei der Personalvermittlung?", a: "Üblich sind 20–30 % des Bruttojahresgehalts der vermittelten Person, bei gefragten Fach- und Führungskräften auch mehr. Der Rechner nutzt standardmäßig 25 %." },
  { q: "Was ist der Faktor in der Zeitarbeit?", a: "Der Verrechnungssatz an den Kunden ergibt sich aus dem Stundenlohn des Mitarbeiters multipliziert mit einem Faktor (meist 2,0–2,8). Er deckt Lohn, Lohnnebenkosten, Verwaltung und Marge." },
  { q: "Sind die Werte netto?", a: "Ja, die Ergebnisse sind Netto-Richtwerte (B2B). Die Umsatzsteuer schlägst du auf der Rechnung auf. Es handelt sich um Orientierungswerte, keine verbindliche Kalkulation." },
];

function Field({ label, value, onChange, suffix, step = 1 }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--color-muted)]">{label}</span>
      <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3">
        <input type="number" value={value} step={step} min={0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent py-2 text-sm outline-none tnum" />
        {suffix && <span className="pl-2 text-xs text-[var(--color-muted)]">{suffix}</span>}
      </div>
    </label>
  );
}

export function PersonalRechner() {
  const [modus, setModus] = useState<Modus>("provision");
  // Personalvermittlung
  const [jahresgehalt, setJahresgehalt] = useState(45000);
  const [provSatz, setProvSatz] = useState(25);
  // Zeitarbeit
  const [stundenlohn, setStundenlohn] = useState(16);
  const [faktor, setFaktor] = useState(2.4);
  const [stundenProMonat, setStundenProMonat] = useState(160);

  const provision = Math.round(jahresgehalt * (provSatz / 100));
  const provMin = Math.round(jahresgehalt * 0.2);
  const provMax = Math.round(jahresgehalt * 0.3);

  const verrechnungssatz = Math.round(stundenlohn * faktor * 100) / 100;
  const margeProStd = Math.round((verrechnungssatz - stundenlohn) * 100) / 100;
  const umsatzProMonat = Math.round(verrechnungssatz * stundenProMonat);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }) }} />

      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--color-brand)] text-[var(--color-on-brand)]">
              <Icon name="agents" size={17} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold">KundenRadar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-ink)]">Anmelden</Link>
            <Link href="/registrieren" className="rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Starten</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow rounded-full border border-[var(--color-line-strong)] px-3 py-1">Personalvermittlung & Zeitarbeit · Gratis-Rechner</span>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-4xl">Provision & Verrechnungssatz berechnen</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            Was bringt eine Vermittlung – und welchen Stundensatz brauchst du in der Zeitarbeit? Zwei Rechner in einem, in Sekunden, ohne Anmeldung.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="mb-4 flex rounded-xl border border-[var(--color-line)] p-1">
            {([["provision", "Personalvermittlung (Provision)"], ["zeitarbeit", "Zeitarbeit (Verrechnungssatz)"]] as [Modus, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setModus(k)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${modus === k ? "bg-[var(--color-brand)] text-[var(--color-on-brand)]" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            {modus === "provision" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bruttojahresgehalt der Position" value={jahresgehalt} onChange={setJahresgehalt} suffix="€" step={1000} />
                  <Field label="Provisionssatz" value={provSatz} onChange={setProvSatz} suffix="%" />
                </div>
                <div className="mt-5 rounded-xl bg-[var(--color-brand-tint)]/20 p-4 text-center">
                  <div className="eyebrow">Deine Provision je Vermittlung</div>
                  <div className="mt-1 text-3xl font-semibold tnum">{eur(provision)}</div>
                  <div className="mt-1 text-xs text-[var(--color-muted)]">Marktüblich (20–30 %): {eur(provMin)} – {eur(provMax)}</div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Stundenlohn Mitarbeiter" value={stundenlohn} onChange={setStundenlohn} suffix="€" step={0.5} />
                  <Field label="Faktor (Multiplikator)" value={faktor} onChange={setFaktor} suffix="×" step={0.1} />
                </div>
                <div className="mt-3">
                  <Field label="Einsatzstunden pro Monat" value={stundenProMonat} onChange={setStundenProMonat} suffix="Std" step={10} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[var(--color-brand-tint)]/20 p-3">
                    <div className="eyebrow">Verrechnungssatz/h</div>
                    <div className="mt-1 text-xl font-semibold tnum">{eur(verrechnungssatz)}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-subtle)] p-3">
                    <div className="eyebrow">Rohertrag/h</div>
                    <div className="mt-1 text-xl font-semibold tnum">{eur(margeProStd)}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-subtle)] p-3">
                    <div className="eyebrow">Umsatz/Monat</div>
                    <div className="mt-1 text-xl font-semibold tnum">{eur(umsatzProMonat)}</div>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] text-[var(--color-faint)]">Üblicher Faktor 2,0–2,8. Der Rohertrag deckt noch Lohnnebenkosten, Verwaltung & Risiko.</p>
              </>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-[var(--color-faint)]">Richtwerte zur Orientierung, keine verbindliche Kalkulation.</p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-10">
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Provision in der Personalvermittlung</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Die Vermittlungsprovision wird üblicherweise als Prozentsatz des Bruttojahresgehalts der vermittelten Person berechnet – meist 20–30 %, bei gefragten Fach- und Führungskräften auch darüber. Bei einem Jahresgehalt von 45.000 € sind das je nach Satz rund 9.000–13.500 € pro erfolgreicher Vermittlung. Entscheidend für planbaren Umsatz: ein steter Strom an Firmen mit offenen Stellen.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Verrechnungssatz in der Zeitarbeit</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              In der Arbeitnehmerüberlassung berechnet sich der Satz an den Kunden über einen Faktor auf den Stundenlohn des Mitarbeiters. Bei 16 € Lohn und Faktor 2,4 ergibt sich ein Verrechnungssatz von 38,40 €/h. Der Faktor deckt Lohnnebenkosten, Urlaub, Ausfallzeiten, Verwaltung und Marge – ein zu niedriger Faktor macht den Einsatz schnell zum Verlustgeschäft.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Häufige Fragen</h2>
            <div className="mt-3 space-y-4">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-sm font-medium">{f.q}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
            <h2 className="text-lg font-semibold">Firmen mit offenen Stellen finden</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">
              KundenRadar zeigt dir im Personalvermittler-Modus über die offizielle Jobsuche-API der Bundesagentur für Arbeit, welche Firmen aktuell Personal suchen und seit wann – inklusive Adresse, Telefon & Ansprechpartner.
            </p>
            <Link href="/registrieren" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
              Kostenlos starten <Icon name="chevronRight" size={15} />
            </Link>
            <p className="mt-2 text-xs text-[var(--color-muted)]">3 Tage gratis · keine Vorab-Zahlung · jederzeit kündbar</p>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-[var(--color-faint)]">
        <Link href="/impressum" className="hover:text-[var(--color-ink)]">Impressum</Link>
        {" · "}
        <Link href="/datenschutz" className="hover:text-[var(--color-ink)]">Datenschutz</Link>
        {" · "}
        <Link href="/rechner" className="hover:text-[var(--color-ink)]">Alle Rechner</Link>
      </footer>
    </div>
  );
}
