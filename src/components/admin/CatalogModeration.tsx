"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Badge, Button, Card, Spinner, cx } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useConfirm } from "@/components/ConfirmProvider";

type Status = "pending" | "active" | "rejected";

interface AdminCompany {
  id: string;
  createdAt: string;
  slug: string;
  name: string;
  category: string;
  plz: string | null;
  ort: string | null;
  description: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string;
  contactPhone: string | null;
  logoUrl: string | null;
  status: Status;
  subscriber: "pending" | "confirmed" | "unsubscribed" | null;
}

const SUB_BADGE: Record<NonNullable<AdminCompany["subscriber"]>, { label: string; tone: "green" | "amber" | "slate" }> = {
  confirmed: { label: "📧 Mailliste ✓", tone: "green" },
  pending: { label: "📧 Mailliste ausstehend", tone: "amber" },
  unsubscribed: { label: "📧 abgemeldet", tone: "slate" },
};

const TABS: { key: Status; label: string }[] = [
  { key: "pending", label: "Offen" },
  { key: "active", label: "Aktiv" },
  { key: "rejected", label: "Abgelehnt" },
];

export function CatalogModeration() {
  const confirm = useConfirm();
  const [tab, setTab] = useState<Status>("pending");
  const [list, setList] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<Status, number>>({ pending: 0, active: 0, rejected: 0 });

  const load = useCallback(async (status: Status) => {
    setLoading(true);
    try {
      const { companies } = await api<{ companies: AdminCompany[] }>(`/api/admin/catalog?status=${status}`);
      setList(companies);
      setCounts((c) => ({ ...c, [status]: companies.length }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const setStatus = async (c: AdminCompany, status: Status, confirmMsg?: string) => {
    if (confirmMsg && !(await confirm({ message: confirmMsg, confirmLabel: status === "rejected" ? "Ablehnen" : "OK", danger: status === "rejected" }))) return;
    setBusy(c.id);
    try {
      await api("/api/admin/catalog", { json: { id: c.id, status } });
      setList((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      await confirm({ message: e instanceof Error ? e.message : "Fehlgeschlagen.", confirmLabel: "OK", cancelLabel: "" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Firmen-Katalog · Moderation</h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">Neue Einträge prüfen, freigeben oder ablehnen. Freigeschaltete Firmen erscheinen im Verzeichnis.</p>
        </div>
        <div className="flex items-center gap-2">
        <a
          href="/api/admin/catalog/export"
          title="Alle eingetragenen Firmen inkl. E-Mail als CSV exportieren"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
        >
          <Icon name="mail" size={13} /> E-Mails (CSV)
        </a>
        <div className="inline-flex rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cx("rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.key ? "bg-[var(--color-brand)] text-[var(--color-on-brand)]" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]")}>
              {t.label}{tab === t.key && list.length ? ` (${list.length})` : ""}
            </button>
          ))}
        </div>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-line-strong)] p-6 text-center text-sm text-[var(--color-muted)]">
            {tab === "pending" ? "Keine offenen Einträge." : tab === "active" ? "Noch keine aktiven Firmen." : "Keine abgelehnten Einträge."}
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((c) => (
              <li key={c.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {c.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-[var(--color-line)] bg-white object-contain" />
                    )}
                    <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <Badge tone="slate">{c.category}</Badge>
                      {c.subscriber && <Badge tone={SUB_BADGE[c.subscriber].tone}>{SUB_BADGE[c.subscriber].label}</Badge>}
                      {c.ort && <span className="text-xs text-[var(--color-muted)]">{[c.plz, c.ort].filter(Boolean).join(" ")}</span>}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-muted)]">
                      {c.contactName ? c.contactName + " · " : ""}
                      <a href={`mailto:${c.contactEmail}`} className="hover:underline">{c.contactEmail}</a>
                      {c.contactPhone ? " · " + c.contactPhone : ""}
                      {c.website ? <> · <a href={c.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website ↗</a></> : null}
                      {c.status === "active" ? <> · <a href={`/firma/${c.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Profil ↗</a></> : null}
                    </div>
                    {c.description && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--color-ink-2)]">{c.description}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {tab !== "active" && (
                      <Button onClick={() => setStatus(c, "active")} disabled={busy === c.id}>
                        {busy === c.id ? <Spinner /> : "Freigeben"}
                      </Button>
                    )}
                    {tab === "active" && (
                      <Button variant="subtle" onClick={() => setStatus(c, "pending", `„${c.name}" wieder verbergen (zurück auf „Offen")?`)} disabled={busy === c.id}>
                        Verbergen
                      </Button>
                    )}
                    {tab !== "rejected" && (
                      <Button variant="danger" onClick={() => setStatus(c, "rejected", `„${c.name}" ablehnen? Der Eintrag wird nicht angezeigt.`)} disabled={busy === c.id}>
                        Ablehnen
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
