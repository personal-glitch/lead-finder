"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Modal, Button, TextInput, Spinner } from "@/components/ui";
import { Icon } from "@/components/icons";

export interface CallContact {
  leadId: string;
  name: string;
  phone: string | null;
  phoneE164: string | null;
}

const OUTCOMES: { key: string; label: string; tone: string }[] = [
  { key: "erreicht", label: "Erreicht", tone: "var(--color-success)" },
  { key: "termin", label: "Termin / Interesse", tone: "var(--color-brand-ink)" },
  { key: "rueckruf", label: "Rückruf vereinbart", tone: "var(--color-info)" },
  { key: "nicht_erreicht", label: "Nicht erreicht", tone: "var(--color-muted)" },
  { key: "kein_bedarf", label: "Kein Bedarf", tone: "var(--color-danger)" },
];

export function QuickCallModal({
  open,
  contact,
  onClose,
  onLogged,
}: {
  open: boolean;
  contact: CallContact | null;
  onClose: () => void;
  onLogged: (msg: string) => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setNote(""); setBusy(false); setError(null); } }, [open, contact?.leadId]);

  const log = async (outcome: string) => {
    if (!contact) return;
    setBusy(true); setError(null);
    try {
      const { movedTo, task } = await api<{ movedTo: string | null; task: { id: string } | null }>(
        "/api/calls",
        { json: { leadId: contact.leadId, outcome, note: note.trim() || null } },
      );
      onLogged(`Anruf erfasst${movedTo ? ` · verschoben nach „${movedTo}"` : ""}${task ? " · Wiedervorlage angelegt" : ""}.`);
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
      title="Anruf erfassen"
      subtitle={contact ? contact.name : undefined}
    >
      {!contact ? null : (
        <div className="space-y-4">
          {contact.phone ? (
            <a href={contact.phoneE164 ? `tel:${contact.phoneE164}` : undefined}
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-success-tint)] py-2.5 text-sm font-semibold text-[var(--color-success)] tnum">
              <Icon name="phone" size={16} /> {contact.phone}
            </a>
          ) : (
            <p className="text-xs text-[var(--color-muted)]">Keine Nummer hinterlegt.</p>
          )}

          <div>
            <div className="eyebrow mb-1.5">Ergebnis (1 Klick – Lead wird automatisch einsortiert)</div>
            <div className="grid grid-cols-1 gap-2">
              {OUTCOMES.map((o) => (
                <button key={o.key} disabled={busy} onClick={() => log(o.key)}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-left text-sm font-medium hover:border-[var(--color-brand)] hover:bg-[var(--color-subtle)] disabled:opacity-50">
                  <span style={{ color: o.tone }}>{o.label}</span>
                  {busy ? <Spinner size={13} /> : <Icon name="chevronRight" size={14} />}
                </button>
              ))}
            </div>
          </div>

          <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz zum Gespräch (optional)" />
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
