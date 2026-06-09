"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, cx } from "@/components/ui";
import { LEISTUNGEN, VERSCHMUTZUNG, FREQUENZEN, eur } from "@/lib/kalkulator";

// Vereinfachte Optionen für Laien.
const WIZ_LEISTUNGEN = LEISTUNGEN;
const WIZ_VERSCHMUTZUNG = [
  { key: "leicht", label: "Eher sauber", icon: "check" as const },
  { key: "mittel", label: "Normal", icon: "broom" as const },
  { key: "stark", label: "Stark verschmutzt", icon: "trash" as const },
];
const WIZ_FREQ = [
  { key: "w5", label: "Täglich (Mo–Fr)" },
  { key: "w3", label: "3× pro Woche" },
  { key: "w2", label: "2× pro Woche" },
  { key: "w1", label: "Wöchentlich" },
  { key: "m2", label: "Alle 2 Wochen" },
  { key: "m1", label: "Monatlich" },
];

const LOHN = 15, ZUSCHLAG = 70, MARGE = 15;
const HOURLY_MIN = 25, HOURLY_MAX = 40; // marktüblicher Kundenpreis €/h (Reinigung)

function BigBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cx("rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
        active ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "border-[var(--color-line-strong)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]")}>
      {children}
    </button>
  );
}

export function ReinigungWizard({ teaser = false }: { teaser?: boolean }) {
  const [step, setStep] = useState(0);
  const [leistung, setLeistung] = useState<string>("");
  const [eingabe, setEingabe] = useState<"flaeche" | "stunden">("flaeche");
  const [flaeche, setFlaeche] = useState(0);
  const [stunden, setStunden] = useState(0);
  const [verschmutzung, setVerschmutzung] = useState<string>("");
  const [frequenz, setFrequenz] = useState<string>("");
  const [pauschal, setPauschal] = useState(0);

  const res = useMemo(() => {
    const L = LEISTUNGEN.find((x) => x.key === leistung) ?? LEISTUNGEN[0];
    const vf = VERSCHMUTZUNG.find((x) => x.key === verschmutzung)?.factor ?? 1;
    const fr = FREQUENZEN.find((x) => x.key === frequenz)?.proWoche ?? 1;
    const selbstkosten = LOHN * (1 + ZUSCHLAG / 100);
    const stundenEinsatz = eingabe === "stunden" ? Math.max(0, stunden) : flaeche / Math.max(10, L.leistung * vf);
    const kosten = stundenEinsatz * selbstkosten;
    const preis = kosten * (1 + MARGE / 100);
    const proMonat = preis * fr * 4.33;
    const proM2 = eingabe === "flaeche" && flaeche > 0 ? preis / flaeche : 0;
    const stundensatzKunde = stundenEinsatz > 0 ? preis / stundenEinsatz : 0;
    // Empfehlung: Markt-Einordnung (€/m² bei Fläche, €/h beim Zeit-Modus)
    let min: number, max: number, value: number, unit: string, empfPreis: number;
    if (eingabe === "flaeche") {
      min = L.marktMin; max = L.marktMax; value = proM2; unit = "/m²";
      empfPreis = ((min + max) / 2) * flaeche;
    } else {
      min = HOURLY_MIN; max = HOURLY_MAX; value = stundensatzKunde; unit = "/h";
      empfPreis = ((min + max) / 2) * stundenEinsatz;
    }
    const status: "unter" | "im" | "ueber" = value < min ? "unter" : value > max ? "ueber" : "im";
    const empfMarge = kosten > 0 ? Math.round(((empfPreis - kosten) / kosten) * 100) : 0;
    return { L, stundenEinsatz, kosten, preis, proMonat, proM2, stundensatzKunde, min, max, value, unit, status, empfPreis, empfMarge, selbstkosten };
  }, [leistung, eingabe, flaeche, stunden, verschmutzung, frequenz]);

  const steps = ["Was?", "Größe", "Verschmutzung", "Häufigkeit", "Ergebnis"];
  const go = (n: number) => setStep(Math.max(0, Math.min(4, n)));
  const reset = () => { setStep(0); setLeistung(""); setFlaeche(0); setStunden(0); setVerschmutzung(""); setFrequenz(""); setEingabe("flaeche"); setPauschal(0); };

  return (
    <Card className="mx-auto max-w-xl p-5">
      {/* Fortschritt */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={cx("h-1.5 w-7 rounded-full", i <= step ? "bg-[var(--color-brand)]" : "bg-[var(--color-line)]")} />
          ))}
        </div>
        <span className="text-[11px] text-[var(--color-muted)]">Schritt {step + 1} / 5</span>
      </div>

      {step === 0 && (
        <div>
          <h3 className="text-base font-semibold">Was soll gereinigt werden?</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WIZ_LEISTUNGEN.map((l) => (
              <BigBtn key={l.key} active={leistung === l.key} onClick={() => { setLeistung(l.key); go(1); }}>{l.label}</BigBtn>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-base font-semibold">Wie groß ist es?</h3>
          <div className="mt-3 flex gap-2">
            <BigBtn active={eingabe === "flaeche"} onClick={() => setEingabe("flaeche")}>Ich kenne die m²</BigBtn>
            <BigBtn active={eingabe === "stunden"} onClick={() => setEingabe("stunden")}>Ich schätze die Zeit</BigBtn>
          </div>
          <div className="mt-3">
            {eingabe === "flaeche" ? (
              <label className="block">
                <span className="mb-1 block text-xs text-[var(--color-muted)]">Fläche</span>
                <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
                  <input type="number" min={0} step={10} autoFocus value={flaeche || ""} onChange={(e) => setFlaeche(Number(e.target.value) || 0)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" placeholder="z. B. 250" />
                  <span className="px-3 text-xs text-[var(--color-muted)]">m²</span>
                </div>
              </label>
            ) : (
              <label className="block">
                <span className="mb-1 block text-xs text-[var(--color-muted)]">Wie lange dauert eine Reinigung ungefähr?</span>
                <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
                  <input type="number" min={0} step={0.5} autoFocus value={stunden || ""} onChange={(e) => setStunden(Number(e.target.value) || 0)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" placeholder="z. B. 2" />
                  <span className="px-3 text-xs text-[var(--color-muted)]">Std.</span>
                </div>
              </label>
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <button type="button" onClick={() => go(0)} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">Zurück</button>
            <button type="button" disabled={eingabe === "flaeche" ? flaeche <= 0 : stunden <= 0} onClick={() => go(2)}
              className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-50">Weiter</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-base font-semibold">Wie stark verschmutzt?</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {WIZ_VERSCHMUTZUNG.map((v) => (
              <BigBtn key={v.key} active={verschmutzung === v.key} onClick={() => { setVerschmutzung(v.key); go(3); }}>
                <span className="flex items-center gap-2"><Icon name={v.icon} size={16} /> {v.label}</span>
              </BigBtn>
            ))}
          </div>
          <div className="mt-4"><button type="button" onClick={() => go(1)} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">Zurück</button></div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-base font-semibold">Wie oft wird gereinigt?</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WIZ_FREQ.map((f) => (
              <BigBtn key={f.key} active={frequenz === f.key} onClick={() => { setFrequenz(f.key); go(4); }}>{f.label}</BigBtn>
            ))}
          </div>
          <div className="mt-4"><button type="button" onClick={() => go(2)} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">Zurück</button></div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="rounded-xl bg-[var(--color-brand-tint)]/30 p-5 text-center">
            <div className="eyebrow">Dein Angebotspreis pro Einsatz</div>
            <div className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-[var(--color-brand)] tnum">{eur(res.preis * 0.9)} – {eur(res.preis * 1.1)}</div>
            <div className="mt-1 text-xs text-[var(--color-muted)]">
              ≈ {eur(res.proMonat)} / Monat · {res.stundenEinsatz.toFixed(1)} h Arbeit{res.proM2 > 0 ? ` · ${eur(res.proM2)}/m²` : ""}
            </div>
          </div>

          {/* Empfehlung */}
          <div className={cx("mt-3 rounded-xl border p-4 text-sm",
            res.status === "unter" ? "border-[var(--color-warn)]/40 bg-[var(--color-warn-tint)]/40" : "border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15")}>
            <div className="flex items-start gap-2">
              <Icon name={res.status === "im" ? "check" : "bolt"} size={16} className={cx("mt-0.5 shrink-0", res.status === "unter" ? "text-[var(--color-warn)]" : "text-[var(--color-brand)]")} />
              <div>
                {res.status === "unter" && (
                  <p><strong>Du lässt Geld liegen.</strong> Dein Preis liegt unter dem marktüblichen ({eur(res.min)}–{eur(res.max)}{res.unit}). Geh ruhig auf <strong>~{eur(res.empfPreis)} pro Einsatz</strong> – das ist marktüblich und bringt dir rund <strong>{res.empfMarge} %</strong> Marge.</p>
                )}
                {res.status === "im" && (
                  <p><strong>Solider, marktüblicher Preis.</strong> Du liegst im üblichen Rahmen ({eur(res.min)}–{eur(res.max)}{res.unit}) und deckst Kosten plus Gewinn ab.</p>
                )}
                {res.status === "ueber" && (
                  <p><strong>Premium-Preis.</strong> Du liegst über dem Marktschnitt ({eur(res.min)}–{eur(res.max)}{res.unit}) – gut, wenn dein Service/Qualität das hergibt. Sonst ggf. etwas runter, um Aufträge zu gewinnen.</p>
                )}
              </div>
            </div>
          </div>

          {/* Pauschal-Check */}
          <div className="mt-3 rounded-xl border border-[var(--color-line)] p-4">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--color-muted)]">Lieber einen Pauschalpreis nennen? Trag ihn ein:</span>
              <div className="flex items-center rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] focus-within:border-[var(--color-brand)]">
                <input type="number" min={0} step={5} value={pauschal || ""} onChange={(e) => setPauschal(Number(e.target.value) || 0)}
                  className="w-full bg-transparent px-3 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" placeholder={`z. B. ${Math.round(res.preis)}`} />
                <span className="px-3 text-xs text-[var(--color-muted)]">€ / Einsatz</span>
              </div>
            </label>
            {pauschal > 0 && (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Bei {eur(pauschal)} pro Einsatz: Marge {res.kosten > 0 ? Math.round(((pauschal - res.kosten) / res.kosten) * 100) : 0} % ·{" "}
                {res.stundenEinsatz > 0 ? `${eur(pauschal / res.stundenEinsatz)}/h` : ""}
                {pauschal < res.kosten && <span className="text-[var(--color-warn)]"> · Achtung: unter deinen Kosten ({eur(res.kosten)})!</span>}
              </p>
            )}
          </div>

          {teaser ? (
            <div className="mt-3 text-center">
              <Link href="/registrieren" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
                Angebots-PDF erstellen & Kunden finden <Icon name="chevronRight" size={15} />
              </Link>
              <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">Kostenlos starten · 3 Tage gratis · jederzeit kündbar</p>
            </div>
          ) : null}

          <button type="button" onClick={reset} className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <Icon name="refresh" size={13} /> Neu starten
          </button>
        </div>
      )}
    </Card>
  );
}
