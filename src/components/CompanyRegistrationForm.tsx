"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { trackEvent } from "@/lib/analytics";
import { CATEGORIES } from "@/lib/marketplace-constants";

const inputCls =
  "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

export function CompanyRegistrationForm({ defaultOrt = "", defaultCategory }: { defaultOrt?: string; defaultCategory?: string } = {}) {
  const initialCat = defaultCategory && (CATEGORIES as readonly string[]).includes(defaultCategory) ? defaultCategory : CATEGORIES[0];
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(initialCat);
  const [street, setStreet] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState(defaultOrt);
  const [openingHours, setOpeningHours] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setState("error"); setMsg("Bitte stimme der Verarbeitung zu."); return; }
    setState("loading"); setMsg("");
    try {
      await api("/api/firmen", {
        json: { name, category, street, plz, ort, openingHours, description, website, contactName, contactEmail, contactPhone, consent, newsletter, website_hp: hp },
      });
      trackEvent("sign_up", { source: "firmen_katalog", type: "company_registration" });
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6 text-center">
        <div className="text-2xl">✅</div>
        <h2 className="mt-2 text-lg font-semibold">Eintrag abgeschickt!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
          Wir haben dir eine Bestätigung per E-Mail geschickt. Sobald wir deinen Eintrag kurz geprüft haben, ist deine
          Firma im Verzeichnis auffindbar. Kundenanfragen leiten wir direkt an dich weiter.
        </p>
        <button
          onClick={() => { setState("idle"); setName(""); setDescription(""); setWebsite(""); setConsent(false); }}
          className="mt-4 rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-subtle)]"
        >
          Weitere Firma eintragen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Firmenname *</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Glanz & Klar Gebäudereinigung" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Branche *</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Kurzbeschreibung</span>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Was bietet ihr an? Leistungen, Einsatzgebiet, Besonderheiten – das sehen potenzielle Kunden auf deiner Profilseite." className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Straße &amp; Hausnr.</span>
        <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Musterstraße 12" className={inputCls} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">PLZ</span>
          <input value={plz} onChange={(e) => setPlz(e.target.value)} placeholder="50667" className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Ort / Einsatzgebiet</span>
          <input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Köln" className={inputCls} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Öffnungszeiten (optional)</span>
        <input value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="Mo–Fr 8–17 Uhr, Sa nach Absprache" className={inputCls} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Website (optional)</span>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.deine-firma.de" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Telefon (optional)</span>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="0221 …" className={inputCls} />
        </label>
      </div>

      <div className="rounded-lg bg-[var(--color-subtle)] px-3.5 py-2.5 text-xs text-[var(--color-muted)]">
        📣 Firmenname, Adresse, Telefon, Website &amp; Öffnungszeiten erscheinen <b>öffentlich</b> in deinem Katalog-Profil
        (wie im Branchenbuch). Deine <b>E-Mail bleibt privat</b> – darüber leiten wir nur Anfragen an dich weiter.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">Ansprechpartner (optional)</span>
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Vor- &amp; Nachname" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--color-muted)]">E-Mail (privat) *</span>
          <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="kontakt@firma.de" className={inputCls} />
        </label>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" />

      <label className="flex items-start gap-2 rounded-lg bg-[var(--color-brand-tint)]/20 px-3 py-2.5 text-xs leading-snug text-[var(--color-ink-2)]">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
        <span>
          Schickt mir kostenlose Akquise-Tipps &amp; Neuigkeiten per E-Mail – plus <b>3 Gratis-Tools</b> zum Start. Ich erhalte
          eine Bestätigungs-Mail (Double-Opt-in), Abmeldung jederzeit.
        </span>
      </label>

      <label className="flex items-start gap-2 text-xs leading-snug text-[var(--color-muted)]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]" />
        <span>
          Ich bin einverstanden, dass die Firmenangaben im KundenRadar-Verzeichnis veröffentlicht und meine Kontaktdaten zur
          Weiterleitung von Anfragen gespeichert werden. Es gilt die{" "}
          <Link href="/datenschutz" className="text-[var(--color-brand)] hover:underline">Datenschutzerklärung</Link>.
        </span>
      </label>

      {state === "error" && <p className="text-sm text-[var(--color-danger)]">{msg}</p>}

      <button type="submit" disabled={state === "loading"}
        className="w-full rounded-lg bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60">
        {state === "loading" ? "Wird gesendet …" : "Kostenlos eintragen"}
      </button>
      <p className="text-center text-[11px] text-[var(--color-muted)]">100 % kostenlos · keine versteckten Kosten · jederzeit löschbar</p>
    </form>
  );
}
