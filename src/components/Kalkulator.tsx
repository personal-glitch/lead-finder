"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { Card, cx } from "@/components/ui";
import {
  calcReinigung, calcHandwerk, calcAgentur, eur, type KalkModus,
  LEISTUNGEN, REINIGUNG_ABRECHNUNG, VERSCHMUTZUNG, LOHNBASIS, FREQUENZEN,
  GEWERKE, HANDWERK_GEMEINKOSTEN, HANDWERK_REGION,
  DISZIPLINEN, SENIORITAET, ABRECHNUNG,
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

// Visueller Markt-Vergleich: zeigt, wo der eigene Preis in der Marktspanne liegt.
function Gauge({ min, max, value, unit, money }: { min: number; max: number; value: number; unit: string; money: (n: number) => string }) {
  const span = Math.max(0.0001, max - min);
  const pos = Math.max(0, Math.min(1, (value - min) / span)) * 100;
  const status = value < min ? "unter Markt" : value > max ? "über Markt" : "im Markt";
  const tone = value < min || value > max ? "text-[var(--color-warn)]" : "text-[var(--color-brand)]";
  return (
    <div className="mt-3">
      <div className="relative h-2 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-warn) 45%, transparent), color-mix(in srgb, var(--color-brand) 55%, transparent), color-mix(in srgb, var(--color-warn) 45%, transparent))" }}>
        <div className="absolute -top-1 h-4 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-ink)] ring-2 ring-[var(--color-surface)]" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
        <span>{money(min)}{unit}</span>
        <span className={cx("font-medium", tone)}>dein Preis · {status}</span>
        <span>{money(max)}{unit}</span>
      </div>
    </div>
  );
}

const FORMEL: Record<KalkModus, string> = {
  reinigung: "Fläche ÷ Flächenleistung (RAL-Richtwert) = Stunden. × Selbstkosten/h (Lohn × (1+Zuschlag)) + Anfahrt/Material, plus Gewinnaufschlag. Tariflohn 2026 = 15,00 €.",
  handwerk: "Stundensatz = Lohn × (1 + Gemeinkostenzuschlag) × (1 + Gewinn). Marktspanne je Gewerk, regional angepasst (HWK-Methode).",
  agentur: "Empfehlung aus Marktspanne (Disziplin × Erfahrung). „Nötig fürs Ziel“ = (Jahresziel ÷ 12 + Fixkosten) ÷ effektiv fakturierbare Stunden.",
};

const DEF_R = {
  positionen: [
    { leistung: "unterhalt_buero", flaeche: 300, anzahl: 1 },
    { leistung: "sanitaer", flaeche: 30, anzahl: 1 },
  ],
  verschmutzung: "mittel", lohnbasis: "tarif1", eigenerLohn: 18, zuschlagProzent: 70, margeProzent: 15,
  frequenz: "w5", anfahrtProEinsatz: 0, materialProEinsatz: 0, abrechnung: "kalk", pauschalPreis: 0,
};
const DEF_H = { gewerk: "elektro", lohnProStd: 28, gemein: "mittel", region: "schnitt", gewinnProzent: 10 };
const DEF_A = { disziplin: "web", senior: "mid", abrechnung: "stunde", zielJahresgewinn: 60000, abrechenbareStundenProMonat: 120, auslastungProzent: 65, gemeinkostenProMonat: 2500 };

export function Kalkulator({ teaser = false, compact = false, defaultModus }: { teaser?: boolean; compact?: boolean; defaultModus?: KalkModus }) {
  const [modus, setModus] = useState<KalkModus>(defaultModus ?? "reinigung");
  const [r, setR] = useState(DEF_R);
  const [h, setH] = useState(DEF_H);
  const [a, setA] = useState(DEF_A);
  const [adv, setAdv] = useState(false);
  const [brutto, setBrutto] = useState(false);
  const [showFormel, setShowFormel] = useState(false);
  const money = (n: number) => eur(brutto ? n * 1.19 : n);
  const updatePos = (idx: number, patch: Partial<{ leistung: string; flaeche: number; anzahl: number }>) =>
    setR((s) => ({ ...s, positionen: s.positionen.map((p, i) => (i === idx ? { ...p, ...patch } : p)) }));
  const addPos = () => setR((s) => ({ ...s, positionen: [...s.positionen, { leistung: "unterhalt_buero", flaeche: 100, anzahl: 1 }] }));
  const removePos = (idx: number) => setR((s) => ({ ...s, positionen: s.positionen.filter((_, i) => i !== idx) }));

  const out = useMemo(() => {
    const m = (n: number) => eur(brutto ? n * 1.19 : n);
    const mwst = brutto ? " (brutto)" : " (netto)";
    if (modus === "reinigung") {
      const vs = VERSCHMUTZUNG.find((x) => x.key === r.verschmutzung) ?? VERSCHMUTZUNG[1];
      const lb = LOHNBASIS.find((x) => x.key === r.lohnbasis) ?? LOHNBASIS[0];
      const fr = FREQUENZEN.find((x) => x.key === r.frequenz) ?? FREQUENZEN[0];
      const lohn = lb.lohn ?? r.eigenerLohn;
      const pauschal = r.abrechnung === "pauschal";
      const positionen = r.positionen.map((p) => {
        const L = LEISTUNGEN.find((x) => x.key === p.leistung) ?? LEISTUNGEN[0];
        return { leistungM2h: L.leistung, flaeche: p.flaeche, anzahl: p.anzahl, marktMin: L.marktMin, marktMax: L.marktMax };
      });
      const res = calcReinigung({
        positionen, verschmutzungFactor: vs.factor, lohnProStd: lohn, zuschlagProzent: r.zuschlagProzent,
        margeProzent: r.margeProzent, einsaetzeProWoche: fr.proWoche, anfahrtProEinsatz: r.anfahrtProEinsatz,
        materialProEinsatz: r.materialProEinsatz, pauschal, pauschalPreis: r.pauschalPreis,
      });
      return {
        headline: {
          label: `${pauschal ? "Pauschalpreis" : "Angebotspreis"} pro Einsatz${mwst}`,
          value: pauschal ? m(res.preisProEinsatz) : `${m(res.preisMin)} – ${m(res.preisMax)}`,
        },
        sub: `${m(res.preisProM2)} / m² · ≈ ${m(res.preisProMonat)} / Monat`,
        hint: `Marktüblich ${m(res.marktMin)}–${m(res.marktMax)} / m² je Reinigung`,
        gauge: { min: res.marktMin, max: res.marktMax, value: res.preisProM2, unit: "/m²" },
        warn: lohn < 15
          ? `Achtung: ${eur(lohn)}/h liegt unter dem Tariflohn 2026 (15,00 €).`
          : pauschal && res.impliedMarge < 0
          ? `Achtung: dein Pauschalpreis liegt unter den Kosten (${eur(res.kostenProEinsatz)}).`
          : null,
        breakdown: pauschal
          ? [
              { label: "Gesamtfläche", value: `${res.totalFlaeche} m²` },
              { label: "Arbeitszeit gesamt", value: `${res.totalStunden} h` },
              { label: "Kosten pro Einsatz", value: m(res.kostenProEinsatz) },
              { label: "Daraus Stundensatz", value: `${m(res.impliedStundensatz)} / h` },
              { label: "Deine Marge", value: `${res.impliedMarge} %` },
            ]
          : [
              { label: "Gesamtfläche", value: `${res.totalFlaeche} m²` },
              { label: "Arbeitszeit gesamt", value: `${res.totalStunden} h` },
              { label: "Selbstkosten je Stunde", value: m(res.selbstkostenProStd) },
              { label: "Kosten pro Einsatz", value: m(res.kostenProEinsatz) },
              { label: "Pro Jahr", value: m(res.preisProJahr) },
            ],
      };
    }
    if (modus === "handwerk") {
      const gw = GEWERKE.find((g) => g.key === h.gewerk) ?? GEWERKE[0];
      const gk = HANDWERK_GEMEINKOSTEN.find((g) => g.key === h.gemein) ?? HANDWERK_GEMEINKOSTEN[1];
      const rg = HANDWERK_REGION.find((g) => g.key === h.region) ?? HANDWERK_REGION[0];
      const res = calcHandwerk({ lohnProStd: h.lohnProStd, gemeinZuschlagProzent: gk.zuschlag, gewinnProzent: h.gewinnProzent, marktMin: gw.marktMin, marktMax: gw.marktMax, regionFactor: rg.factor });
      return {
        headline: { label: `Empfohlener Stundensatz${mwst}`, value: m(res.verrechnungssatz) },
        sub: `Selbstkosten ${m(res.selbstkostenProStd)} / h`,
        hint: `Marktüblich ${m(res.marktMin)}–${m(res.marktMax)} / h`,
        gauge: { min: res.marktMin, max: res.marktMax, value: res.verrechnungssatz, unit: "/h" },
        warn: null as string | null,
        breakdown: [
          { label: "Lohnkosten je Stunde", value: m(h.lohnProStd) },
          { label: "+ Gemeinkostenzuschlag", value: `${gk.zuschlag} %` },
          { label: "Selbstkosten je Stunde", value: m(res.selbstkostenProStd) },
        ],
      };
    }
    const di = DISZIPLINEN.find((x) => x.key === a.disziplin) ?? DISZIPLINEN[0];
    const se = SENIORITAET.find((x) => x.key === a.senior) ?? SENIORITAET[1];
    const mMin = Math.round(di.min * se.factor);
    const mMax = Math.round(di.max * se.factor);
    const res = calcAgentur(a);
    const istTag = a.abrechnung === "tag";
    return {
      headline: {
        label: `Empfohlener ${istTag ? "Tagessatz" : "Stundensatz"}${mwst}`,
        value: istTag ? `${m(mMin * 8)} – ${m(mMax * 8)}` : `${m(mMin)} – ${m(mMax)}`,
      },
      sub: istTag ? `Stundensatz ${m(mMin)}–${m(mMax)}` : `Tagessatz ${m(mMin * 8)}–${m(mMax * 8)}`,
      hint: `Für dein Einkommensziel nötig: ${m(res.stundensatz)} / h`,
      gauge: { min: mMin, max: mMax, value: res.stundensatz, unit: "/h" },
      warn: null as string | null,
      breakdown: [
        { label: "Effektiv fakturierbare Std./Monat", value: `${res.effektivStundenProMonat} h` },
        { label: "Nötiger Umsatz pro Monat", value: m(res.benoetigterUmsatzProMonat) },
        { label: "Nötiger Stundensatz (dein Ziel)", value: m(res.stundensatz) },
      ],
    };
  }, [modus, r, h, a, brutto]);

  return (
    <div className={cx(compact ? "space-y-4" : "grid gap-5 lg:grid-cols-[1fr_380px]")}>
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

        {/* Netto / Brutto */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--color-muted)]">Preisanzeige</span>
          <Seg options={[{ key: "netto", label: "netto" }, { key: "brutto", label: "inkl. 19 % MwSt" }]} value={brutto ? "brutto" : "netto"} onChange={(v) => setBrutto(v === "brutto")} />
        </div>

        {modus === "reinigung" && (
          <div className="space-y-3.5">
            <Field label="Abrechnung"><Seg options={REINIGUNG_ABRECHNUNG} value={r.abrechnung} onChange={(v) => setR({ ...r, abrechnung: v })} /></Field>

            <div className="space-y-2">
              <span className="block text-xs text-[var(--color-muted)]">Flächen / Positionen</span>
              {r.positionen.map((p, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-[var(--color-line)] p-2.5">
                  <Drop options={LEISTUNGEN} value={p.leistung} onChange={(v) => updatePos(idx, { leistung: v })} />
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
                      <input type="number" min={0} step={10} value={Number.isFinite(p.flaeche) ? p.flaeche : ""} onChange={(e) => updatePos(idx, { flaeche: e.target.value === "" ? 0 : Number(e.target.value) })}
                        className="w-full bg-transparent px-2.5 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                      <span className="px-2 text-xs text-[var(--color-muted)]">m²</span>
                    </div>
                    <span className="text-xs text-[var(--color-muted)]">×</span>
                    <div className="flex w-20 items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
                      <input type="number" min={1} step={1} value={Number.isFinite(p.anzahl) ? p.anzahl : ""} onChange={(e) => updatePos(idx, { anzahl: e.target.value === "" ? 1 : Number(e.target.value) })}
                        className="w-full bg-transparent px-2.5 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                    {r.positionen.length > 1 && (
                      <button type="button" onClick={() => removePos(idx)} aria-label="Position entfernen"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-danger)]">
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addPos} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-brand)] hover:underline">
                <Icon name="plus" size={13} /> Fläche / Raum hinzufügen
              </button>
              <p className="text-[11px] text-[var(--color-faint)]">„×" = Anzahl gleicher Räume (z. B. 5 Büros × 25 m²).</p>
            </div>

            <Field label="Verschmutzungsgrad"><Seg options={VERSCHMUTZUNG} value={r.verschmutzung} onChange={(v) => setR({ ...r, verschmutzung: v })} /></Field>
            <Field label="Häufigkeit"><Seg options={FREQUENZEN} value={r.frequenz} onChange={(v) => setR({ ...r, frequenz: v })} /></Field>
            <Field label="Lohnbasis"><Seg options={LOHNBASIS} value={r.lohnbasis} onChange={(v) => setR({ ...r, lohnbasis: v })} /></Field>
            {r.lohnbasis === "eigen" && <Num label="Eigener Stundenlohn" value={r.eigenerLohn} onChange={(v) => setR({ ...r, eigenerLohn: v })} suffix="€/h" />}
            {r.abrechnung === "pauschal" && <Num label="Dein Pauschalpreis pro Einsatz" value={r.pauschalPreis} onChange={(v) => setR({ ...r, pauschalPreis: v })} suffix="€" step={5} />}
            {out.warn && <p className="rounded-lg bg-[var(--color-warn-tint)] px-3 py-2 text-xs text-[var(--color-warn)]">⚠ {out.warn}</p>}

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
                setH({ ...h, gewerk: v, lohnProStd: g?.lohn ?? h.lohnProStd });
              }} />
            </Field>
            <Field label="Region"><Seg options={HANDWERK_REGION} value={h.region} onChange={(v) => setH({ ...h, region: v })} /></Field>
            <Field label="Gemeinkosten (Zuschlag auf Lohn)"><Seg options={HANDWERK_GEMEINKOSTEN} value={h.gemein} onChange={(v) => setH({ ...h, gemein: v })} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Num label="Lohnkosten produktiv" value={h.lohnProStd} onChange={(v) => setH({ ...h, lohnProStd: v })} suffix="€/h" />
              <Num label="Gewinnaufschlag" value={h.gewinnProzent} onChange={(v) => setH({ ...h, gewinnProzent: v })} suffix="%" />
            </div>
          </div>
        )}

        {modus === "agentur" && (
          <div className="space-y-3.5">
            <Field label="Disziplin"><Drop options={DISZIPLINEN} value={a.disziplin} onChange={(v) => setA({ ...a, disziplin: v })} /></Field>
            <Field label="Erfahrung"><Seg options={SENIORITAET} value={a.senior} onChange={(v) => setA({ ...a, senior: v })} /></Field>
            <Field label="Abrechnung"><Seg options={ABRECHNUNG} value={a.abrechnung} onChange={(v) => setA({ ...a, abrechnung: v })} /></Field>
            <button type="button" onClick={() => setAdv(!adv)} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              <Icon name={adv ? "chevronLeft" : "chevronRight"} size={13} /> {adv ? "Weniger" : "Dein Einkommensziel (optional)"}
            </button>
            {adv && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Num label="Wunsch-Gewinn / Gehalt pro Jahr" value={a.zielJahresgewinn} onChange={(v) => setA({ ...a, zielJahresgewinn: v })} suffix="€" step={1000} />
                <Num label="Fakturierbare Std./Monat" value={a.abrechenbareStundenProMonat} onChange={(v) => setA({ ...a, abrechenbareStundenProMonat: v })} suffix="h" />
                <Num label="Realistische Auslastung" value={a.auslastungProzent} onChange={(v) => setA({ ...a, auslastungProzent: v })} suffix="%" />
                <Num label="Fixkosten pro Monat" value={a.gemeinkostenProMonat} onChange={(v) => setA({ ...a, gemeinkostenProMonat: v })} suffix="€" step={100} />
              </div>
            )}
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
            {out.gauge && <Gauge min={out.gauge.min} max={out.gauge.max} value={out.gauge.value} unit={out.gauge.unit} money={money} />}
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

        {/* Transparenz + Stand */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <button type="button" onClick={() => setShowFormel(!showFormel)} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <Icon name={showFormel ? "chevronLeft" : "chevronRight"} size={12} /> So rechnen wir
          </button>
          <span className="rounded-full bg-[var(--color-subtle)] px-2 py-0.5 text-[10px] text-[var(--color-faint)]">Richtwerte Stand 2026</span>
        </div>
        {showFormel && <p className="px-1 text-[11px] leading-relaxed text-[var(--color-faint)]">{FORMEL[modus]}</p>}

        {teaser ? (
          compact ? (
            <div className="text-center">
              <Link href="/registrieren" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
                Ergebnis & Angebots-PDF sichern <Icon name="chevronRight" size={15} />
              </Link>
              <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">Kostenlos starten · 3 Tage gratis · jederzeit kündbar</p>
            </div>
          ) : (
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
          )
        ) : (
          <p className="px-1 text-[11px] text-[var(--color-faint)]">Richtwerte (u. a. Tariflohn 2026, RAL-Flächenleistungen) – ersetzt keine individuelle Kalkulation. Ohne Gewähr.</p>
        )}
      </div>
    </div>
  );
}
