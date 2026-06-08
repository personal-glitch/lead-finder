"use client";
import { useEffect, useState } from "react";
import type { EmailTemplate, Suppression } from "@/lib/types";
import { api } from "@/lib/client";
import { PLACEHOLDERS } from "@/lib/email/templates";
import { PageHeader } from "@/components/shell/AppShell";
import { Icon } from "@/components/icons";
import { Badge, Button, Card, Field, Spinner, TextInput, Textarea, Toast, cx } from "@/components/ui";

type Tab = "templates" | "suppressions";

export default function VorlagenPage() {
  const [tab, setTab] = useState<Tab>("templates");
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => setToast(m);

  return (
    <>
      <PageHeader title="Vorlagen & Abmeldungen" subtitle="E-Mail-Vorlagen mit Platzhaltern und die Opt-out-Liste." />
      <div className="p-7">
        <div className="mb-5 inline-flex rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
          {([["templates", "E-Mail-Vorlagen"], ["suppressions", "Abmeldungen"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cx(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === k ? "bg-[var(--color-brand)] text-[var(--color-on-brand)]" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "templates" ? <Templates notify={notify} /> : <Suppressions notify={notify} />}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function Templates({ notify }: { notify: (m: string) => void }) {
  const [list, setList] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadInto = (t: EmailTemplate | null) => {
    setSelectedId(t?.id ?? null); setName(t?.name ?? ""); setSubject(t?.subject ?? ""); setBody(t?.body ?? "");
  };
  const load = async () => {
    try {
      const { templates } = await api<{ templates: EmailTemplate[] }>("/api/templates");
      setList(templates);
      if (!selectedId) loadInto(templates[0] ?? null);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const save = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    setSaving(true);
    try {
      if (selectedId) {
        const { template } = await api<{ template: EmailTemplate }>(`/api/templates/${selectedId}`, { method: "PATCH", json: { name, subject, body } });
        setList((p) => p.map((t) => (t.id === template.id ? template : t)));
      } else {
        const { template } = await api<{ template: EmailTemplate }>("/api/templates", { json: { name, subject, body } });
        setList((p) => [...p, template]); setSelectedId(template.id);
      }
      notify("Vorlage gespeichert.");
    } catch (e) { notify(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setSaving(false); }
  };
  const del = async () => {
    if (!selectedId || !confirm("Vorlage löschen?")) return;
    await api(`/api/templates/${selectedId}`, { method: "DELETE" });
    const rest = list.filter((t) => t.id !== selectedId);
    setList(rest); loadInto(rest[0] ?? null);
  };

  if (loading) return <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>;

  return (
    <div className="grid grid-cols-[230px_1fr] gap-5">
      <Card className="h-fit p-2">
        {list.map((t) => (
          <button key={t.id} onClick={() => loadInto(t)}
            className={cx("block w-full truncate rounded-lg px-3 py-2 text-left text-sm", selectedId === t.id ? "bg-[var(--color-brand-tint)] text-[var(--color-brand-ink)]" : "hover:bg-[var(--color-subtle)]")}>
            {t.name}
          </button>
        ))}
        <button onClick={() => loadInto(null)} className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-muted)] hover:bg-[var(--color-subtle)]">
          <Icon name="plus" size={15} /> Neue Vorlage
        </button>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Erstansprache" /></Field>
          <Field label="Betreff" required><TextInput value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        </div>
        <Field label="Inhalt" required><Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--color-muted)]">Platzhalter:</span>
          {PLACEHOLDERS.map((p) => (
            <code key={p} onClick={() => setBody((b) => `${b}{{${p}}}`)} title="Anhängen"
              className="cursor-pointer rounded bg-[var(--color-subtle)] px-1.5 py-0.5 text-xs text-[var(--color-ink-2)] hover:bg-[var(--color-line-strong)]">{`{{${p}}}`}</code>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-4">
          {selectedId ? <Button variant="danger" onClick={del}>Löschen</Button> : <span />}
          <Button onClick={save} disabled={saving || !name.trim() || !subject.trim() || !body.trim()}>
            {saving ? <><Spinner /> …</> : selectedId ? "Speichern" : "Anlegen"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Suppressions({ notify }: { notify: (m: string) => void }) {
  const [items, setItems] = useState<Suppression[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { suppressions } = await api<{ suppressions: Suppression[] }>("/api/suppressions"); setItems(suppressions); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!email.trim()) return;
    try { await api("/api/suppressions", { json: { email: email.trim(), reason: "manuell" } }); setEmail(""); load(); }
    catch (e) { notify(e instanceof Error ? e.message : "Ungültige Adresse."); }
  };
  const remove = async (id: string) => { await api(`/api/suppressions/${id}`, { method: "DELETE" }); load(); };

  return (
    <Card className="max-w-2xl p-5">
      <p className="text-sm text-[var(--color-muted)]">
        Adressen auf dieser Liste werden bei jedem Versand übersprungen. Abmeldungen über den Link in den E-Mails landen automatisch hier.
      </p>
      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <Field label="Adresse manuell sperren">
            <TextInput type="email" value={email} placeholder="kontakt@firma.de" onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          </Field>
        </div>
        <Button onClick={add}>Sperren</Button>
      </div>
      <div className="mt-4">
        {loading ? <div className="text-sm text-[var(--color-muted)]">Lädt …</div>
          : items.length === 0 ? <div className="text-sm text-[var(--color-muted)]">Keine Abmeldungen.</div>
          : (
            <ul className="divide-y divide-[var(--color-line)] overflow-hidden rounded-lg border border-[var(--color-line)]">
              {items.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                  <span className="flex items-center gap-2 truncate">{s.email} {s.reason && <Badge tone="slate">{s.reason}</Badge>}</span>
                  <button onClick={() => remove(s.id)} className="text-xs text-[var(--color-danger)] hover:underline">entfernen</button>
                </li>
              ))}
            </ul>
          )}
      </div>
    </Card>
  );
}
