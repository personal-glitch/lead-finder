"use client";
import { useState } from "react";
import { LegalShell, H2, P } from "@/components/landing/LegalShell";
import { api } from "@/lib/client";

const INPUT =
  "w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-2.5 px-3 text-sm outline-none focus:border-[var(--color-brand)]";

export default function KuendigungPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contractRef, setContractRef] = useState("");
  const [kind, setKind] = useState<"ordentlich" | "ausserordentlich">("ordentlich");
  const [desiredDate, setDesiredDate] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ receivedAt: string; subscriptionsCancelled: number } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Bitte gib die E-Mail-Adresse deines Kontos an."); return; }
    setBusy(true);
    try {
      const res = await api<{ receivedAt: string; subscriptionsCancelled: number }>("/api/kuendigung", {
        json: { name: name.trim() || undefined, email: email.trim(), contractRef: contractRef.trim() || undefined, kind, desiredDate: desiredDate.trim() || undefined, message: message.trim() || undefined },
      });
      setDone(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kündigung fehlgeschlagen. Bitte per E-Mail an kontakt@seciora-solutions.de kündigen.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <LegalShell title="Kündigung eingegangen">
        <div className="rounded-xl border border-[var(--color-success-tint)] bg-[var(--color-success-tint)] px-5 py-4 text-sm text-[var(--color-success)]">
          Deine Kündigung ist bei uns eingegangen am {new Date(done.receivedAt).toLocaleString("de-DE")}.
        </div>
        {done.subscriptionsCancelled > 0 ? (
          <P>
            Dein laufendes Abonnement wurde bei unserem Zahlungsdienstleister gekündigt – es erfolgt
            <strong> keine weitere Abbuchung</strong>. Bei einer ordentlichen Kündigung bleibt der Zugang bis zum Ende
            des bereits bezahlten Zeitraums bestehen.
          </P>
        ) : (
          <P>
            Falls unter der angegebenen E-Mail-Adresse ein Abonnement besteht, beenden wir es zum nächstmöglichen
            Zeitpunkt, sodass keine weitere Abbuchung erfolgt. Bitte gib im Zweifel die E-Mail-Adresse deines Kontos an.
          </P>
        )}
        <P>
          Eine <strong>Kündigungsbestätigung</strong> haben wir dir soeben per E-Mail an{" "}
          <strong>{email}</strong> geschickt (bitte ggf. auch den Spam-Ordner prüfen). Bei Fragen erreichst du uns
          unter kontakt@seciora-solutions.de.
        </P>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      title="Verträge hier kündigen"
      intro="Hier kannst du dein Abonnement ohne Anmeldung kündigen. Fülle das Formular aus und bestätige mit dem Button Jetzt kündigen."
    >
      <H2>Kündigungsformular</H2>
      <form onSubmit={submit} className="mt-3 space-y-4">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">E-Mail-Adresse deines Kontos *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} placeholder="du@firma.de" required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Name (optional)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} placeholder="Vor- und Nachname" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Kunden-/Vertragsnummer (optional)</label>
          <input type="text" value={contractRef} onChange={(e) => setContractRef(e.target.value)} className={INPUT} placeholder="falls vorhanden" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Art der Kündigung</label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="kind" checked={kind === "ordentlich"} onChange={() => setKind("ordentlich")} className="accent-[var(--color-brand)]" />
              Ordentliche Kündigung (zum nächstmöglichen Termin)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="kind" checked={kind === "ausserordentlich"} onChange={() => setKind("ausserordentlich")} className="accent-[var(--color-brand)]" />
              Außerordentliche Kündigung
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Gewünschtes Kündigungsdatum (optional)</label>
          <input type="text" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} className={INPUT} placeholder="z. B. zum nächstmöglichen Termin" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Nachricht / Grund (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={INPUT} placeholder="z. B. Begründung bei außerordentlicher Kündigung" />
        </div>

        {error && <p className="rounded-lg bg-[var(--color-danger-tint)] px-3 py-2 text-xs text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand)] py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60"
        >
          {busy ? "…" : "Jetzt kündigen"}
        </button>
        <P>
          Nach dem Klick erhältst du eine Eingangsbestätigung. Alternativ kannst du jederzeit formlos per E-Mail an
          kontakt@seciora-solutions.de kündigen.
        </P>
      </form>
    </LegalShell>
  );
}
