"use client";
import type { EnrichmentExtra } from "@/lib/types";
import { Icon } from "./icons";
import { Badge } from "./ui";

const PHONE_LABEL: Record<string, string> = { tel: "Tel", mobil: "Mobil", fax: "Fax" };

function isPersonal(email: string): boolean {
  const local = email.split("@")[0] ?? "";
  return /[._-]/.test(local) && !/^(info|kontakt|contact|office|mail|e?mail|post|service|hallo|hello|team|zentrale|empfang|sekretariat|buchhaltung|rechnung|newsletter|no-?reply|noreply|webmaster|admin|support|praxis|kanzlei)\b/i.test(local);
}

/**
 * Zeigt ALLE gefundenen Kontaktwege einer Firma: mehrere Nummern (1-Klick-Anruf),
 * mehrere E-Mails (Person + info@, 1-Klick-Mail) und mehrere Ansprechpartner.
 * Optional onMail-Callback (öffnet das Compose-Fenster mit der gewählten Adresse).
 */
export function LeadContactWays({ extra, onMail }: {
  extra: EnrichmentExtra | null | undefined;
  onMail?: (email: string) => void;
}) {
  if (!extra) return null;
  const phones = extra.phones ?? [];
  const emails = extra.emails ?? [];
  const contacts = extra.contacts ?? [];
  if (phones.length === 0 && emails.length === 0 && contacts.length === 0) return null;

  return (
    <div className="space-y-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-subtle)] p-3">
      <div className="eyebrow">Alle Kontaktwege</div>

      {contacts.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-[var(--color-muted)]">Ansprechpartner</div>
          <ul className="space-y-1">
            {contacts.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Icon name="user" size={13} />
                <span className="font-medium">{c.name}</span>
                {c.role && <Badge tone="slate">{c.role}</Badge>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {phones.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-[var(--color-muted)]">Telefon</div>
          <ul className="flex flex-wrap gap-1.5">
            {phones.map((p, i) => (
              <a key={i} href={p.e164 ? `tel:${p.e164}` : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-success)] tnum hover:bg-[var(--color-elevated)]">
                <Icon name="phone" size={12} /> {p.number}
                {p.label && <span className="text-[var(--color-faint)]">{PHONE_LABEL[p.label] ?? p.label}</span>}
              </a>
            ))}
          </ul>
        </div>
      )}

      {emails.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-[var(--color-muted)]">E-Mail</div>
          <ul className="space-y-1">
            {emails.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <button type="button" onClick={() => onMail?.(e)}
                  className={onMail ? "truncate text-left text-[var(--color-brand)] hover:underline" : "truncate text-left"}>
                  {e}
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  {isPersonal(e) ? <Badge tone="green">Person</Badge> : <Badge tone="slate">allgemein</Badge>}
                  <a href={`mailto:${e}`} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]" title="Mail-Programm öffnen">
                    <Icon name="mail" size={13} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
