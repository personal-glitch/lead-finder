"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { Button, Card, cx } from "@/components/ui";
import {
  calcReinigung, calcHandwerk, calcAgentur, eur, type KalkModus,
} from "@/lib/kalkulator";

const MODI: { key: KalkModus; label: string; icon: IconName }[] = [
  { key: "reinigung", label: "Gebäudereinigung", icon: "broom" },
  { key: "handwerk", label: "Handwerk", icon: "wrench" },
  { key: "agentur", label: "Agentur / Dienstleistung", icon: "bolt" },
];

function Num({ label, value, onChange, suffix, step = 1 }: {
  label: string; value: number; onChange: (n: number) => void; suffix?: string; step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[var(--color-muted)]">{label}</label>
      <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
        <input
          type="number" inputMode="decimal" min={0} step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="shrink-0 px-3 text-xs text-[var(--color-muted)]">{suffix}</span>}
      </div>
    </div>
  );
}

const DEF_REIN = { flaecheM2: 500, leistungM2ProStd: 200, stundensatz: 30, einsaetzeProWoche: 5, anfahrtProEinsatz: 0, materialProEinsatz: 0, margeProzent: 15 };
const DEF_HAND = { bruttolohnProStd: 25, produktiveStundenProJahr: 1500, mitarbeiter: 1, gemeinkostenProJahr: 30000, gewinnProzent: 12 };
const DEF_AGEN = { zielJahresgewinn: 60000, abrechenbareStundenProMonat: 100, auslastungProzent: 70, gemeinkostenProMonat: 3000 };

export function Kalkulator({ teaser = false }: { teaser?: boolean }) {
  const [modus, setModus] = useState<KalkModus>("reinigung");
  const [rein, setRein] = useState(DEF_REIN);
  const [hand, setHand] = useState(DEF_HAND);
  const [agen, setAgen] = useState(DEF_AGEN);

  const { headline, sub, breakdown } = useMemo(() => {
    if (modus === "reinigung") {
      const r = calcReinigung(rein);
      return {
        headline: { label: "Angebotspreis pro Einsatz", value: eur(r.preisProEinsatz) },
        sub: `≈ ${eur(r.preisProMonat)} / Monat`,
        breakdown: [
          { label: "Arbeitszeit pro Einsatz", value: `${r.stundenProEinsatz} h` },
          { label: "Kosten pro Einsatz", value: eur(r.kostenProEinsatz) },
          { label: "Pro Jahr", value: eur(r.preisProJahr) },
        ],
      };
    }
    if (modus === "handwerk") {
      const r = calcHandwerk(hand);
      return {
        headline: { label: "Dein Stundenverrechnungssatz", value: eur(r.verrechnungssatz) },
        sub: "kostendeckend inkl. Gewinn",
        breakdown: [
          { label: "Gemeinkosten je Stunde", value: eur(r.gemeinkostenProStd) },
          { label: "Selbstkosten je Stunde", value: eur(r.selbstkostenProStd) },
        ],
      };
    }
    const r = calcAgentur(agen);
    return {
      headline: { label: "Dein nötiger Stundensatz", value: eur(r.stundensatz) },
      sub: `für ${eur(r.benoetigterUmsatzProMonat)} Umsatz / Monat`,
      breakdown: [
        { label: "Effektiv fakturierbare Std./Monat", value: `${r.effektivStundenProMonat} h` },
        { label: "Nötiger Umsatz pro Monat", value: eur(r.benoetigterUmsatzProMonat) },
      ],
    };
  }, [modus, rein, hand, agen]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      {/* Eingaben */}
      <Card className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2">
          {MODI.map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={cx("flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition-colors",
                modus === m.key ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]")}
            >
              <Icon name={m.icon} size={20} strokeWidth={modus === m.key ? 2 : 1.6} />
              {m.label}
            </button>
          ))}
        </div>

        {modus === "reinigung" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Num label="Fläche" value={rein.flaecheM2} onChange={(v) => setRein({ ...rein, flaecheM2: v })} suffix="m²" step={10} />
            <Num label="Reinigungsleistung" value={rein.leistungM2ProStd} onChange={(v) => setRein({ ...rein, leistungM2ProStd: v })} suffix="m²/h" step={10} />
            <Num label="Interner Stundensatz" value={rein.stundensatz} onChange={(v) => setRein({ ...rein, stundensatz: v })} suffix="€/h" />
            <Num label="Einsätze pro Woche" value={rein.einsaetzeProWoche} onChange={(v) => setRein({ ...rein, einsaetzeProWoche: v })} suffix="×" />
            <Num label="Anfahrt pro Einsatz" value={rein.anfahrtProEinsatz} onChange={(v) => setRein({ ...rein, anfahrtProEinsatz: v })} suffix="€" />
            <Num label="Material pro Einsatz" value={rein.materialProEinsatz} onChange={(v) => setRein({ ...rein, materialProEinsatz: v })} suffix="€" />
            <Num label="Gewinnaufschlag" value={rein.margeProzent} onChange={(v) => setRein({ ...rein, margeProzent: v })} suffix="%" />
          </div>
        )}
        {modus === "handwerk" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Num label="Lohnkosten produktiv" value={hand.bruttolohnProStd} onChange={(v) => setHand({ ...hand, bruttolohnProStd: v })} suffix="€/h" />
            <Num label="Produktive Stunden/Jahr je MA" value={hand.produktiveStundenProJahr} onChange={(v) => setHand({ ...hand, produktiveStundenProJahr: v })} suffix="h" step={50} />
            <Num label="Produktive Mitarbeiter" value={hand.mitarbeiter} onChange={(v) => setHand({ ...hand, mitarbeiter: v })} suffix="Pers." />
            <Num label="Fixkosten / Overhead pro Jahr" value={hand.gemeinkostenProJahr} onChange={(v) => setHand({ ...hand, gemeinkostenProJahr: v })} suffix="€" step={1000} />
            <Num label="Gewinnaufschlag" value={hand.gewinnProzent} onChange={(v) => setHand({ ...hand, gewinnProzent: v })} suffix="%" />
          </div>
        )}
        {modus === "agentur" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Num label="Wunsch-Gewinn / Gehalt pro Jahr" value={agen.zielJahresgewinn} onChange={(v) => setAgen({ ...agen, zielJahresgewinn: v })} suffix="€" step={1000} />
            <Num label="Fakturierbare Std./Monat" value={agen.abrechenbareStundenProMonat} onChange={(v) => setAgen({ ...agen, abrechenbareStundenProMonat: v })} suffix="h" />
            <Num label="Realistische Auslastung" value={agen.auslastungProzent} onChange={(v) => setAgen({ ...agen, auslastungProzent: v })} suffix="%" />
            <Num label="Fixkosten pro Monat" value={agen.gemeinkostenProMonat} onChange={(v) => setAgen({ ...agen, gemeinkostenProMonat: v })} suffix="€" step={100} />
          </div>
        )}
        {!teaser && (
          <button
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            onClick={() => { setRein(DEF_REIN); setHand(DEF_HAND); setAgen(DEF_AGEN); }}
          >
            <Icon name="refresh" size={13} /> Werte zurücksetzen
          </button>
        )}
      </Card>

      {/* Ergebnis – Kernzahl immer sichtbar (der „Aha") */}
      <div className="space-y-3">
        <Card className="overflow-hidden p-0">
          <div className="bg-[var(--color-brand-tint)]/30 px-5 py-5 text-center">
            <div className="eyebrow">{headline.label}</div>
            <div className="mt-1 text-4xl font-semibold tracking-[-0.02em] text-[var(--color-brand)] tnum">{headline.value}</div>
            <div className="mt-1 text-xs text-[var(--color-muted)]">{sub}</div>
          </div>

          {/* Aufschlüsselung – im Köder verschwommen */}
          <div className="relative px-5 py-3">
            <div className={cx(teaser && "pointer-events-none select-none blur-[6px]")}>
              {breakdown.map((b) => (
                <div key={b.label} className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
                  <span className="text-[var(--color-muted)]">{b.label}</span>
                  <span className="tnum">{b.value}</span>
                </div>
              ))}
            </div>
            {teaser && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-[11px] font-medium text-[var(--color-muted)] shadow-sm">
                  Volle Aufschlüsselung + Angebots-PDF im Tool
                </span>
              </div>
            )}
          </div>
        </Card>

        {teaser ? (
          <Card className="border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-4 text-center">
            <p className="text-sm font-medium">Kostenlos sichern & weiter:</p>
            <ul className="mx-auto mt-2 max-w-xs space-y-1 text-left text-xs text-[var(--color-muted)]">
              <li className="flex items-start gap-1.5"><Icon name="check" size={13} className="mt-0.5 shrink-0 text-[var(--color-brand)]" /> Kalkulation speichern & als Angebot exportieren</li>
              <li className="flex items-start gap-1.5"><Icon name="check" size={13} className="mt-0.5 shrink-0 text-[var(--color-brand)]" /> Passende Firmen in deiner Nähe finden & anrufen</li>
              <li className="flex items-start gap-1.5"><Icon name="check" size={13} className="mt-0.5 shrink-0 text-[var(--color-brand)]" /> Pipeline, Aufgaben & E-Mail an einem Ort</li>
            </ul>
            <Link href="/registrieren" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
              Kostenlos starten <Icon name="chevronRight" size={15} />
            </Link>
            <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">3 Tage gratis · keine Vorab-Zahlung · jederzeit kündbar</p>
          </Card>
        ) : (
          <p className="px-1 text-[11px] text-[var(--color-faint)]">Richtwert zur Orientierung – ersetzt keine individuelle Kalkulation. Ohne Gewähr.</p>
        )}
      </div>
    </div>
  );
}
