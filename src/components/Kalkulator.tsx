"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Button, Card, cx } from "@/components/ui";
import {
  MODI, calcReinigung, calcHandwerk, calcAgentur, eur, type KalkModus,
} from "@/lib/kalkulator";

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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cx("flex items-baseline justify-between gap-4 py-2", strong && "border-t border-[var(--color-line)] pt-3")}>
      <span className={cx("text-sm", strong ? "font-medium" : "text-[var(--color-muted)]")}>{label}</span>
      <span className={cx("tnum", strong ? "text-xl font-semibold text-[var(--color-brand)]" : "text-sm")}>{value}</span>
    </div>
  );
}

export function Kalkulator({ teaser = false }: { teaser?: boolean }) {
  const [modus, setModus] = useState<KalkModus>("reinigung");

  const [rein, setRein] = useState({ flaecheM2: 500, leistungM2ProStd: 200, stundensatz: 30, einsaetzeProWoche: 5, anfahrtProEinsatz: 0, materialProEinsatz: 0, margeProzent: 15 });
  const [hand, setHand] = useState({ bruttolohnProStd: 25, produktiveStundenProJahr: 1500, mitarbeiter: 1, gemeinkostenProJahr: 30000, gewinnProzent: 12 });
  const [agen, setAgen] = useState({ zielJahresgewinn: 60000, abrechenbareStundenProMonat: 100, auslastungProzent: 70, gemeinkostenProMonat: 3000 });

  const rows = useMemo(() => {
    if (modus === "reinigung") {
      const r = calcReinigung(rein);
      return [
        { label: "Arbeitszeit pro Einsatz", value: `${r.stundenProEinsatz} h` },
        { label: "Kosten pro Einsatz", value: eur(r.kostenProEinsatz) },
        { label: "Angebotspreis pro Einsatz", value: eur(r.preisProEinsatz), strong: true },
        { label: "Pro Monat", value: eur(r.preisProMonat) },
        { label: "Pro Jahr", value: eur(r.preisProJahr) },
      ];
    }
    if (modus === "handwerk") {
      const r = calcHandwerk(hand);
      return [
        { label: "Gemeinkosten je Stunde", value: eur(r.gemeinkostenProStd) },
        { label: "Selbstkosten je Stunde", value: eur(r.selbstkostenProStd) },
        { label: "Stundenverrechnungssatz", value: eur(r.verrechnungssatz), strong: true },
      ];
    }
    const r = calcAgentur(agen);
    return [
      { label: "Effektiv fakturierbare Std./Monat", value: `${r.effektivStundenProMonat} h` },
      { label: "Nötiger Umsatz pro Monat", value: eur(r.benoetigterUmsatzProMonat) },
      { label: "Nötiger Stundensatz", value: eur(r.stundensatz), strong: true },
    ];
  }, [modus, rein, hand, agen]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* Eingaben */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {MODI.map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={cx("rounded-lg border px-3 py-1.5 text-sm font-medium",
                modus === m.key ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]")}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted)]">{MODI.find((m) => m.key === modus)?.hint}</p>

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
      </Card>

      {/* Ergebnis */}
      <div className="space-y-3">
        <Card className="relative overflow-hidden p-5">
          <div className="eyebrow mb-1">Ergebnis</div>
          <div className={cx(teaser && "pointer-events-none select-none blur-[7px]")}>
            {rows.map((r) => <Row key={r.label} {...r} />)}
          </div>
          {teaser && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-surface)]/70 px-4 text-center backdrop-blur-[2px]">
              <Icon name="key" size={22} className="text-[var(--color-brand)]" />
              <p className="text-sm font-medium">Dein Ergebnis ist fertig.</p>
              <p className="text-xs text-[var(--color-muted)]">Kostenlos registrieren und den vollen Kalkulator dauerhaft im Tool nutzen.</p>
              <Link href="/registrieren" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
                Kostenlos starten <Icon name="chevronRight" size={15} />
              </Link>
            </div>
          )}
        </Card>
        <p className="px-1 text-[11px] text-[var(--color-faint)]">
          Richtwert zur Orientierung – ersetzt keine individuelle Kalkulation. Ohne Gewähr.
        </p>
        {!teaser && (
          <Button variant="ghost" size="sm" className="w-full" onClick={() => {
            setRein({ flaecheM2: 500, leistungM2ProStd: 200, stundensatz: 30, einsaetzeProWoche: 5, anfahrtProEinsatz: 0, materialProEinsatz: 0, margeProzent: 15 });
            setHand({ bruttolohnProStd: 25, produktiveStundenProJahr: 1500, mitarbeiter: 1, gemeinkostenProJahr: 30000, gewinnProzent: 12 });
            setAgen({ zielJahresgewinn: 60000, abrechenbareStundenProMonat: 100, auslastungProzent: 70, gemeinkostenProMonat: 3000 });
          }}>
            <Icon name="refresh" size={14} /> Werte zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
}
