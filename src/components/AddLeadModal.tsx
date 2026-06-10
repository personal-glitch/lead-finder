"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Modal, Button, Field, TextInput, Spinner } from "@/components/ui";

/** Fenster zum manuellen Anlegen einer Firma bzw. eines Kontakts. */
export function AddLeadModal({
  open,
  mode,
  onClose,
  onAdded,
}: {
  open: boolean;
  mode: "firma" | "kontakt";
  onClose: () => void;
  onAdded: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [branche, setBranche] = useState("");
  const [ort, setOrt] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ansprechpartner, setAnsprechpartner] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(""); setBranche(""); setOrt(""); setPhone(""); setEmail("");
      setAnsprechpartner(""); setWebsite(""); setBusy(false); setError(null);
    }
  }, [open, mode]);

  const valid = name.trim() && (mode === "firma" || ansprechpartner.trim());

  const save = async () => {
    if (!valid) return;
    setBusy(true); setError(null);
    const clean = (v: string) => (v.trim() ? v.trim() : null);
    const ph = phone.trim();
    const e164 = ph && /^\+/.test(ph.replace(/\s/g, "")) ? ph.replace(/[^\d+]/g, "") : null;
    try {
      await api("/api/leads", {
        json: {
          inputs: [{
            name: clean(name),
            objektTyp: clean(branche),
            ort: clean(ort),
            phone: clean(phone),
            phoneE164: e164,
            email: clean(email),
            ansprechpartner: clean(ansprechpartner),
            website: clean(website),
            source: "manual",
          }],
        },
      });
      onAdded(mode === "firma" ? "Firma angelegt." : "Kontakt angelegt.");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "firma" ? "Firma hinzufügen" : "Kontakt hinzufügen"}
      subtitle="Manuell angelegt – erscheint sofort in deiner Liste und Pipeline."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Abbrechen</Button>
          <Button onClick={save} disabled={busy || !valid}>{busy ? <Spinner size={14} /> : "Anlegen"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Firmenname" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Muster GmbH" />
          </Field>
          <Field label="Branche">
            <TextInput value={branche} onChange={(e) => setBranche(e.target.value)} placeholder="z. B. Hausverwaltung" />
          </Field>
        </div>
        <Field label={mode === "kontakt" ? "Ansprechpartner" : "Ansprechpartner (optional)"} required={mode === "kontakt"}>
          <TextInput value={ansprechpartner} onChange={(e) => setAnsprechpartner(e.target.value)} placeholder="Frau Berg · Praxisleitung" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 221 1234567" />
          </Field>
          <Field label="E-Mail">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kontakt@firma.de" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ort">
            <TextInput value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Köln" />
          </Field>
          <Field label="Website">
            <TextInput value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="firma.de" />
          </Field>
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      </div>
    </Modal>
  );
}
