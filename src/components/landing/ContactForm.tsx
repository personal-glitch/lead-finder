"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { Button, Field, Spinner, TextInput, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      await api("/api/contact", { json: { name: name.trim(), email: email.trim(), message: message.trim() } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--color-success-tint)] text-[var(--color-success)]"><Icon name="check" size={22} /></span>
        <h3 className="mt-3 font-semibold">Danke für deine Nachricht!</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Wir melden uns so schnell wie möglich bei dir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" /></Field>
        <Field label="E-Mail" required><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.de" /></Field>
      </div>
      <Field label="Nachricht" required><Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Wie können wir helfen?" /></Field>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" disabled={sending || !name.trim() || !email.trim() || !message.trim()}>
        {sending ? <><Spinner size={14} /> Senden …</> : "Nachricht senden"}
      </Button>
    </form>
  );
}
