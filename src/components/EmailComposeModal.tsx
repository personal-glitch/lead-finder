"use client";
import { useEffect, useState } from "react";
import type { EmailTemplate } from "@/lib/types";
import { api } from "@/lib/client";
import { PLACEHOLDERS } from "@/lib/email/templates";
import { Modal, Button, Field, Select, TextInput, Textarea, Spinner } from "@/components/ui";

export interface ComposeContact {
  leadId: string;
  name: string;
  email: string | null;
}

interface SendResult {
  status: string;
  to: string | null;
  subject: string | null;
  error: string | null;
}

export function EmailComposeModal({
  open,
  contact,
  templates,
  onClose,
  onSent,
}: {
  open: boolean;
  contact: ComposeContact | null;
  templates: EmailTemplate[];
  onClose: () => void;
  onSent: (msg: string) => void;
}) {
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Beim Öffnen / Kontaktwechsel Felder zurücksetzen.
  useEffect(() => {
    if (open) { setTemplateId(""); setSubject(""); setBody(""); setError(null); setBusy(false); }
  }, [open, contact?.leadId]);

  const loadTemplate = (id: string) => {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) { setSubject(t.subject); setBody(t.body); }
  };

  const send = async () => {
    if (!contact || !subject.trim() || !body.trim()) return;
    setBusy(true); setError(null);
    try {
      const { results } = await api<{ results: Array<{ leadId: string } & SendResult> }>(
        "/api/email/send",
        { json: { leadIds: [contact.leadId], subject: subject.trim(), body: body.trim() } },
      );
      const r = results[0];
      if (r?.status === "sent") {
        onSent(`E-Mail an ${r.to} gesendet ✅`);
        onClose();
      } else if (r?.status === "suppressed") {
        setError("Empfänger hat sich abgemeldet – Versand blockiert.");
      } else {
        setError(r?.error || "Versand fehlgeschlagen. Ist dein E-Mail-Versand in den Einstellungen eingerichtet?");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Versand fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="E-Mail schreiben"
      subtitle={contact ? `An: ${contact.name}${contact.email ? ` · ${contact.email}` : ""}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={send} disabled={busy || !subject.trim() || !body.trim() || !contact?.email}>
            {busy ? <Spinner size={14} /> : "Senden"}
          </Button>
        </>
      }
    >
      {!contact?.email ? (
        <p className="text-sm text-[var(--color-muted)]">Für diesen Kontakt ist keine E-Mail-Adresse hinterlegt.</p>
      ) : (
        <div className="space-y-4">
          {templates.length > 0 && (
            <Field label="Vorlage laden (optional)">
              <Select value={templateId} onChange={(e) => loadTemplate(e.target.value)}>
                <option value="">– Leer / selbst schreiben –</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
          )}
          <Field label="Betreff" required>
            <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z. B. Kurze Anfrage" />
          </Field>
          <Field label="Nachricht" required>
            <Textarea rows={9} value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={"Guten Tag {{ansprechpartner}},\n\n…\n\nFreundliche Grüße"} />
          </Field>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--color-muted)]">Platzhalter:</span>
            {PLACEHOLDERS.map((p) => (
              <code key={p} onClick={() => setBody((b) => `${b}{{${p}}}`)} title="Einfügen"
                className="cursor-pointer rounded bg-[var(--color-subtle)] px-1.5 py-0.5 text-xs text-[var(--color-ink-2)] hover:bg-[var(--color-line-strong)]">{`{{${p}}}`}</code>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Deine <b>Signatur</b>, dein <b>Impressum</b> und ein <b>Abmeldelink</b> werden automatisch unter die Mail gesetzt.
            Versand erfolgt über dein in den Einstellungen hinterlegtes Postfach.
          </p>
          <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            ⚖️ Schreibe nur mit sachlichem Bezug zum Empfänger (§ 7 UWG) – am sichersten nach einem Erstkontakt.
          </div>
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
