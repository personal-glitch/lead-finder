"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/AppShell";
import { api } from "@/lib/client";
import { CATEGORIES } from "@/lib/marketplace-constants";

interface RequestItem {
  id: string; createdAt: string; category: string; title: string; description: string;
  plz: string | null; ort: string | null; customerType: "privat" | "gewerblich"; budget: string | null;
  offerCount: number; hasOffered: boolean;
}
interface TenderItem {
  noticeId: string; title: string; description: string | null; category: string; cpv: string | null;
  buyer: string | null; ort: string | null; plz: string | null; url: string | null;
  publishedDate: string | null; deadline: string | null;
}

function timeAgo(iso: string): string {
  const d = new Date(iso); const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "heute"; if (days === 1) return "gestern";
  if (days < 14) return `vor ${days} Tagen`;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function RequestCard({ r, onOffered }: { r: RequestItem; onOffered: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [offered, setOffered] = useState(r.hasOffered);

  const send = async () => {
    if (message.trim().length < 5) { setMsg("Bitte schreibe eine kurze Nachricht."); return; }
    setBusy(true); setMsg("");
    try {
      await api(`/api/auftraege/${r.id}/angebot`, { json: { message: message.trim() } });
      setOffered(true); setOpen(false); onOffered(r.id);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Senden fehlgeschlagen."); }
    finally { setBusy(false); }
  };
  const ort = [r.plz, r.ort].filter(Boolean).join(" ");

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-[var(--color-brand-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand)]">{r.category}</span>
            <span className="rounded-md bg-[var(--color-subtle)] px-2 py-0.5 text-[11px] font-medium capitalize text-[var(--color-ink-2)]">{r.customerType}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold">{r.title}</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{ort || "Ort offen"} · {timeAgo(r.createdAt)}{r.budget ? ` · Budget: ${r.budget}` : ""}</p>
        </div>
        <span className="shrink-0 text-[11px] text-[var(--color-faint)]">{r.offerCount} Angebot{r.offerCount === 1 ? "" : "e"}</span>
      </div>
      <p className="mt-2.5 line-clamp-3 text-sm text-[var(--color-ink-2)]">{r.description}</p>
      <div className="mt-3">
        {offered ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-success-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">✓ Angebot gesendet</span>
        ) : open ? (
          <div className="space-y-2">
            <textarea autoFocus rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Kurzes Angebot / Nachricht an den Interessenten – inkl. Preis-Idee &amp; Kontakt …"
              className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
            {msg && <p className="text-xs text-[var(--color-danger)]">{msg}</p>}
            <div className="flex gap-2">
              <button onClick={send} disabled={busy} className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-60">{busy ? "Sende …" : "Angebot senden"}</button>
              <button onClick={() => setOpen(false)} className="rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-subtle)]">Abbrechen</button>
            </div>
            <p className="text-[11px] text-[var(--color-muted)]">Deine Konto-E-Mail wird als Antwortadresse mitgesendet.</p>
          </div>
        ) : (
          <button onClick={() => setOpen(true)} className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">Angebot senden</button>
        )}
      </div>
    </div>
  );
}

function TenderCard({ t }: { t: TenderItem }) {
  const ort = [t.plz, t.ort].filter(Boolean).join(" ");
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-[var(--color-brand-tint)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand)]">{t.category}</span>
        <span className="rounded-md bg-[var(--color-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-2)]">Öffentliche Ausschreibung</span>
      </div>
      <h3 className="mt-1.5 text-sm font-semibold">{t.title}</h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        {t.buyer ? `${t.buyer} · ` : ""}{ort || "Ort offen"}
        {t.deadline ? ` · Frist: ${fmtDate(t.deadline)}` : ""}
      </p>
      {t.description && <p className="mt-2.5 line-clamp-3 text-sm text-[var(--color-ink-2)]">{t.description}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        {t.cpv && <span className="truncate text-[11px] text-[var(--color-faint)]">CPV {t.cpv}</span>}
        {t.url && (
          <a href={t.url} target="_blank" rel="noreferrer noopener"
            className="shrink-0 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
            Zur Ausschreibung →
          </a>
        )}
      </div>
    </div>
  );
}

export default function AuftraegePage() {
  const [tab, setTab] = useState<"anfragen" | "ausschreibungen">("anfragen");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (q.trim()) params.set("q", q.trim());
      if (tab === "anfragen") {
        const { requests } = await api<{ requests: RequestItem[] }>(`/api/auftraege?${params.toString()}`);
        setRequests(requests);
      } else {
        const { tenders } = await api<{ tenders: TenderItem[] }>(`/api/tenders?${params.toString()}`);
        setTenders(tenders);
      }
    } catch { if (tab === "anfragen") setRequests([]); else setTenders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tab, category]);

  const onOffered = (id: string) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, hasOffered: true, offerCount: r.offerCount + 1 } : r)));

  const TabBtn = ({ id, label }: { id: "anfragen" | "ausschreibungen"; label: string }) => (
    <button onClick={() => { setTab(id); setQ(""); }}
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
        tab === id ? "bg-[var(--color-brand-tint)] text-[var(--color-brand)]" : "text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
      }`}>
      {label}
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Aufträge"
        subtitle="Anfragen von Auftraggebern und öffentliche Ausschreibungen – sende ein Angebot, bevor es die Konkurrenz tut."
      />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-7">
        <div className="mb-4 flex gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
          <TabBtn id="anfragen" label="Anfragen" />
          <TabBtn id="ausschreibungen" label="Öffentliche Ausschreibungen" />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]">
            <option value="">Alle Branchen</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex flex-1 gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ort, PLZ oder Stichwort …"
              className="min-w-0 flex-1 rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
            <button type="submit" className="rounded-lg border border-[var(--color-line-strong)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-subtle)]">Suchen</button>
          </form>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[var(--color-muted)]">Lädt …</p>
        ) : tab === "anfragen" ? (
          requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-line-strong)] py-12 text-center">
              <p className="text-sm font-medium">Noch keine offenen Anfragen{category ? ` in „${category}"` : ""}.</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Neue Anfragen erscheinen hier automatisch, sobald Auftraggeber sie über die Auftragsbörse einstellen.</p>
            </div>
          ) : (
            <div className="grid gap-3">{requests.map((r) => <RequestCard key={r.id} r={r} onOffered={onOffered} />)}</div>
          )
        ) : tenders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-line-strong)] py-12 text-center">
            <p className="text-sm font-medium">Aktuell keine passenden Ausschreibungen{category ? ` in „${category}"` : ""}.</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">Quelle: Datenservice Öffentlicher Einkauf (Bund, Länder, Kommunen). Neue Ausschreibungen kommen täglich dazu.</p>
          </div>
        ) : (
          <div className="grid gap-3">{tenders.map((t) => <TenderCard key={t.noticeId} t={t} />)}</div>
        )}
      </div>
    </div>
  );
}
