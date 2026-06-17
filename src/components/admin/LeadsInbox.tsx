"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Badge, Button, Card, Spinner, cx } from "@/components/ui";
import { useConfirm } from "@/components/ConfirmProvider";

type Status = "neu" | "weitergeleitet" | "geschlossen";

interface Lead {
  id: string; createdAt: string; status: Status;
  name: string; email: string; phone: string | null; message: string;
  companyName: string; companySlug: string; companyCategory: string;
  companyEmail: string; companyPhone: string | null;
}

const TABS: { key: Status; label: string }[] = [
  { key: "neu", label: "Neu" },
  { key: "weitergeleitet", label: "Weitergeleitet" },
  { key: "geschlossen", label: "Erledigt" },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function LeadsInbox() {
  const confirm = useConfirm();
  const [tab, setTab] = useState<Status>("neu");
  const [list, setList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (status: Status) => {
    setLoading(true);
    try {
      const { leads } = await api<{ leads: Lead[] }>(`/api/admin/leads?status=${status}`);
      setList(leads);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const act = async (l: Lead, action: "forward" | "status", status?: Status, msg?: string) => {
    if (msg && !(await confirm({ message: msg, confirmLabel: action === "forward" ? "Weiterleiten" : "OK" }))) return;
    setBusy(l.id);
    try {
      await api("/api/admin/leads", { json: { id: l.id, action, status } });
      setList((p) => p.filter((x) => x.id !== l.id));
    } catch (e) {
      await confirm({ message: e instanceof Error ? e.message : "Fehlgeschlagen.", confirmLabel: "OK" });
    } finally { setBusy(null); }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Katalog-Leads · Anfragen</h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">Anfragen aus den Firmenprofilen. Du entscheidest, welche Firma sie bekommt – „An Firma weiterleiten" sendet sie per E-Mail.</p>
        </div>
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

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-line-strong)] p-6 text-center text-sm text-[var(--color-muted)]">
            {tab === "neu" ? "Keine neuen Anfragen." : tab === "weitergeleitet" ? "Nichts weitergeleitet." : "Nichts erledigt."}
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((l) => (
              <li key={l.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{l.companyName}</span>
                      <Badge tone="slate">{l.companyCategory}</Badge>
                      <span className="text-xs text-[var(--color-muted)]">{fmt(l.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--color-subtle)] px-3 py-2 text-sm text-[var(--color-ink-2)]">{l.message}</p>
                    <div className="mt-2 text-xs text-[var(--color-muted)]">
                      <b>Interessent:</b> {l.name} · <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a>{l.phone ? <> · <a href={`tel:${l.phone.replace(/\s+/g, "")}`} className="hover:underline">{l.phone}</a></> : null}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-muted)]">
                      <b>Firma (privat):</b> <a href={`mailto:${l.companyEmail}`} className="hover:underline">{l.companyEmail}</a>{l.companyPhone ? " · " + l.companyPhone : ""} · <a href={`/firma/${l.companySlug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Profil ↗</a>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {tab !== "weitergeleitet" && (
                      <Button onClick={() => act(l, "forward", undefined, `Anfrage an „${l.companyName}" (${l.companyEmail}) per E-Mail weiterleiten?`)} disabled={busy === l.id}>
                        {busy === l.id ? <Spinner /> : "An Firma weiterleiten"}
                      </Button>
                    )}
                    {tab !== "geschlossen" && (
                      <Button variant="subtle" onClick={() => act(l, "status", "geschlossen")} disabled={busy === l.id}>Erledigt</Button>
                    )}
                    {tab !== "neu" && (
                      <Button variant="subtle" onClick={() => act(l, "status", "neu")} disabled={busy === l.id}>Zurück auf „Neu"</Button>
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
