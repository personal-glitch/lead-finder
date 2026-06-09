"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { Card, cx } from "@/components/ui";
import {
  calcReinigung, calcHandwerk, calcAgentur, eur, type KalkModus,
  REINIGUNGSARTEN, OBJEKTARTEN, VERSCHMUTZUNG, LOHNBASIS, FREQUENZEN, GEWERKE,
} from "@/lib/kalkulator";

const MODI: { key: KalkModus; label: string; icon: IconName }[] = [
  { key: "reinigung", label: "Gebäudereinigung", icon: "broom" },
  { key: "handwerk", label: "Handwerk", icon: "wrench" },
  { key: "agentur", label: "Agentur / Dienstleistung", icon: "bolt" },
];

function Seg({ options, value, onChange }: { options: readonly { key: string; label: string }[]; value: string; onChange: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.key} type="button" onClick={() => onChange(o.key)}
          className={cx("rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === o.key ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs text-[var(--color-muted)]">{label}</label>{children}</div>;
}
function Drop({ value, onChange, options }: { value: string; onChange: (k: string) => void; options: readonly { key: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]">
      {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
    </select>
  );
}
function Num({ label, value, onChange, suffix, step = 1 }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; step?: number }) {
  return (
    <Field label={label}>
      <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
        <input type="number" inputMode="decimal" min={0} step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        {suffix && <span className="shrink-0 px-3 text-xs text-[var(--color-muted)]">{suffix}</span>}
      </div>
    </Field>
  );
}

const DEF_R = { flaecheM2: 500, reinigungsart: "unterhalt", objektart: "buero", verschmutzung: "mittel", lohnbasis: "tarif1", eigenerLohn: 18, zuschlagProzent: 70, margeProzent: 15, frequenz: "w5", anfahrtProEinsatz: 0, materialProEinsatz: 0 };
const DEF_H = { gewerk: "elektro", bruttolohnProStd: 28, produktiveStundenProJahr: 1450, mitarbeiter: 1, gemeinkostenProJahr: 30000, gewinnProzent: 12 };
const DEF_A = { zielJahresgewinn: 60000, abrechenbareStundenProMonat: 100, auslastungProzent: 70, gemeinkostenProMonat: 3000 };

export function Kalkulator({ teaser = false }: { teaser?: boolean }) {
  const [modus, setModus] = useState<KalkModus>("reinigung");
  const [r, setR] = useState(DEF_R);
  const [h, setH] = useState(DEF_H);
  const [a, setA] = useState(DEF_A);
  const [adv, setAdv] = useState(false);

  const out = useMemo(() => {
    if (modus === "reinigung") {
      const ra = REINIGUNGSARTEN.find((x) => x.key === r.reinigungsart) ?? REINIGUNGSARTEN[0];
      const oa = OBJEKTARTEN.find((x) => x.key === r.objektart) ?? OBJEKTARTEN[0];
      const vs = VERSCHMUTZUNG.find((x) => x.key === r.verschmutzung) ?? VERSCHMUTZUNG[1];
      const lb = LOHNBASIS.find((x) => x.key === r.lohnbasis) ?? LOHNBASIS[0];
      const fr = FREQUENZEN.find((x) => x.key === r.frequenz) ?? FREQUENZEN[0];
      const res = calcReinigung({
        flaecheM2: r.flaecheM2, objektLeistung: oa.leistung, reinigungsartFactor: ra.factor, verschmutzungFactor: vs.factor,
        lohnProStd: lb.lohn ?? r.eigenerLohn, zuschlagProzent: r.zuschlagProzent, margeProzent: r.margeProzent,
        einsaetzeProWoche: fr.proWoche, anfahrtProEinsatz: r.anfahrtProEinsatz, materialProEinsatz: r.materialProEinsatz,
        marktMinM2: ra.marktMinM2, marktMaxM2: ra.marktMaxM2,
      });
      return {
        headline: { label: "Angebotspreis pro Einsatz", value: `${eur(res.preisMin)} – ${eur(res.preisMax)}` },
        sub: `${eur(res.preisProM2)} / m² · ≈ ${eur(res.preisProMonat)} / Monat`,
        hint: `Marktüblich ${eur(res.marktMin)}–${eur(res.marktMax)} / m² je Reinigung`,
        breakdown: [
          { label: "Arbeitszeit pro Einsatz", value: `${res.stundenProEinsatz} h` },
          { label: "Flächenleistung", value: `${res.leistung} m²/h` },
          { label: "Selbstkosten je Stunde", value: eur(res.selbstkostenProStd) },
          { label: "Kosten pro Einsatz", value: eur(res.kostenProEinsatz) },
          { label: "Pro Jahr", value: eur(res.preisProJahr) },
        ],
      };
    }
    if (modus === "handwerk") {
      const res = calcHandwerk({ ...h, marktSatz: GEWERKE.find((g) => g.key === h.gewerk)?.marktSatz ?? 60 });
      return {
        headline: { label: "Dein Stundenverrechnungssatz", value: eur(res.verrechnungssatz) },
        sub: `Marktüblich im Gewerk ~${eur(res.marktSatz)}`,
        hint: null as string | null,
        breakdown: [
          { label: "Gemeinkosten je Stunde", value: eur(res.gemeinkostenProStd) },
          { label: "Selbstkosten je Stunde", value: eur(res.selbstkostenProStd) },
        ],
      };
    }
    const res = calcAgentur(a);
    return {
      headline: { label: "Dein nötiger Stundensatz", value: eur(res.stundensatz) },
      sub: `Tagessatz (8 h) ${eur(res.tagessatz)}`,
      hint: null as string | null,
      breakdown: [
        { label: "Effektiv fakturierbare Std./Monat", value: `${res.effektivStundenProMonat} h` },
        { label: "Nötiger Umsatz pro Monat", value: eur(res.benoetigterUmsatzProMonat) },
      ],
    };
  }, [modus, r, h, a]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card className="space-y-4 p-5">
        {/* Modus */}
        <div className="grid grid-cols-3 gap-2">
          {MODI.map((m) => (
            <button key={m.key} type="button" onClick={() => setModus(m.key)}
              className={cx("flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition-colors",
                modus === m.key ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]")}>
              <Icon name={m.icon} size={20} strokeWidth={modus === m.key ? 2 : 1.6} />
              {m.label}
            </button>
          ))}
        </div>

        {modus === "reinigung" && (
          <div className="space-y-3.5">
            <Field label="Reinigungsart"><Seg options={REINIGUNGSARTEN} value={r.reinigungsart} onChange={(v) => setR({ ...r, reinigungsart: v })} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Objektart"><Drop options={OBJEKTARTEN} value={r.objektart} onChange={(v) => setR({ ...r, objektart: v })} /></Field>
              <Num label="Fläche" value={r.flaecheM2} onChange={(v) => setR({ ...r, flaecheM2: v })} suffix="m²" step={10} />
            </div>
            <Field label="Verschmutzungsgrad"><Seg options={VERSCHMUTZUNG} value={r.verschmutzung} onChange={(v) => setR({ ...r, verschmutzung: v })} /></Field>
            <Field label="Häufigkeit"><Seg options={FREQUENZEN} value={r.frequenz} onChange={(v) => setR({ ...r, frequenz: v })} /></Field>
            <Field label="Lohnbasis"><Seg options={LOHNBASIS} value={r.lohnbasis} onChange={(v) => setR({ ...r, lohnbasis: v })} /></Field>
            {r.lohnbasis === "eigen" && <Num label="Eigener Stundenlohn" value={r.eigenerLohn} onChange={(v) => setR({ ...r, eigenerLohn: v })} suffix="€/h" />}

            <button type="button" onClick={() => setAdv(!adv)} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              <Icon name={adv ? "chevronLeft" : "chevronRight"} size={13} /> {adv ? "Weniger" : "Feineinstellung"}
            </button>
            {adv && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Num label="Zuschlag (Lohnneben + Gemeinkosten)" value={r.zuschlagProzent} onChange={(v) => setR({ ...r, zuschlagProzent: v })} suffix="%" />
                <Num label="Gewinnaufschlag" value={r.margeProzent} onChange={(v) => setR({ ...r, margeProzent: v })} suffix="%" />
                <Num label="Anfahrt pro Einsatz" value={r.anfahrtProEinsatz} onChange={(v) => setR({ ...r, anfahrtProEinsatz: v })} suffix="€" />
                <Num label="Material pro Einsatz" value={r.materialProEinsatz} onChange={(v) => setR({ ...r, materialProEinsatz: v })} suffix="€" />
              </div>
            )}
          </div>
        )}

        {modus === "handwerk" && (
          <div className="space-y-3.5">
            <Field label="Gewerk">
              <Drop options={GEWERKE} value={h.gewerk} onChange={(v) => {
                const g = GEWERKE.find((x) => x.key === v);
                setH({ ...h, gewerk: v, bruttolohnProStd: g?.lohn ?? h.bruttolohnProStd, produktiveStundenProJahr: g?.stdJahr ?? h.produktiveStundenProJahr });
              }} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Num label="Lohnkosten produktiv" value={h.bruttolohnProStd} onChange={(v) => setH({ ...h, bruttolohnProStd: v })} suffix="€/h" />
              <Num label="Produktive Std./Jahr je MA" value={h.produktiveStundenProJahr} onChange={(v) => setH({ ...h, produktiveStundenProJahr: v })} suffix="h" step={50} />
              <Num label="Produktive Mitarbeiter" value={h.mitarbeiter} onChange={(v) => setH({ ...h, mitarbeiter: v })} suffix="Pers." />
              <Num label="Fixkosten / Overhead pro Jahr" value={h.gemeinkostenProJahr} onChange={(v) => setH({ ...h, gemeinkostenProJahr: v })} suffix="€" step={1000} />
              <Num label="Gewinnaufschlag" value={h.gewinnProzent} onChange={(v) => setH({ ...h, gewinnProzent: v })} suffix="%" />
            </div>
          </div>
        )}

        {modus === "agentur" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Num label="Wunsch-Gewinn / Gehalt pro Jahr" value={a.zielJahresgewinn} onChange={(v) => setA({ ...a, zielJahresgewinn: v })} suffix="€" step={1000} />
            <Num label="Fakturierbare Std./Monat" value={a.abrechenbareStundenProMonat} onChange={(v) => setA({ ...a, abrechenbareStundenProMonat: v })} suffix="h" />
            <Num label="Realistische Auslastung" value={a.auslastungProzent} onChange={(v) => setA({ ...a, auslastungProzent: v })} suffix="%" />
            <Num label="Fixkosten pro Monat" value={a.gemeinkostenProMonat} onChange={(v) => setA({ ...a, gemeinkostenProMonat: v })} suffix="€" step={100} />
          </div>
        )}

        {!teaser && (
          <button type="button" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            onClick={() => { setR(DEF_R); setH(DEF_H); setA(DEF_A); }}>
            <Icon name="refresh" size={13} /> Werte zurücksetzen
          </button>
        )}
      </Card>

      {/* Ergebnis */}
      <div className="space-y-3">
        <Card className="overflow-hidden p-0">
          <div className="bg-[var(--color-brand-tint)]/30 px-5 py-5 text-center">
            <div className="eyebrow">{out.headline.label}</div>
            <div className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-[var(--color-brand)] tnum sm:text-[2rem]">{out.headline.value}</div>
            <div className="mt-1 text-xs text-[var(--color-muted)]">{out.sub}</div>
            {out.hint && <div className="mt-2 inline-block rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[11px] text-[var(--color-ink-2)]">{out.hint}</div>}
          </div>
          <div className="relative px-5 py-3">
            <div className={cx(teaser && "pointer-events-none select-none blur-[6px]")}>
              {out.breakdown.map((b) => (
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
          <p className="px-1 text-[11px] text-[var(--color-faint)]">Richtwerte (u. a. Tariflohn 2026, RAL-Flächenleistungen) – ersetzt keine individuelle Kalkulation. Ohne Gewähr.</p>
        )}
      </div>
    </div>
  );
}
