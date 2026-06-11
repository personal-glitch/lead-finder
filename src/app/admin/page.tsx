"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Icon } from "@/components/icons";
import { Spinner, Toast } from "@/components/ui";
import { renderNewsletterHtml, type NewsletterTemplate } from "@/lib/email/newsletter-template";

const TEMPLATES: { id: NewsletterTemplate; label: string; emoji: string }[] = [
  { id: "tipp", label: "Tipp der Woche", emoji: "💡" },
  { id: "angebot", label: "Aktion / Angebot", emoji: "🔥" },
  { id: "ankuendigung", label: "Ankündigung", emoji: "📣" },
];

interface Customer {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  status: string | null;
  renewsAt: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string | null;
  confirmed: boolean;
}
interface Usage { searchesToday: number; searches7d: number; activeToday: number; active7d: number }
interface Stats { registered: number; confirmed: number; trialing: number; paying: number; usage?: Usage; customers: Customer[] }

interface Subscriber {
  id: string; email: string; status: string; source: string | null;
  consentAt: string; confirmedAt: string | null; unsubscribedAt: string | null; createdAt: string;
}
interface Campaign { id: string; subject: string; recipients: number; sent: number; failed: number; createdAt: string; status?: string; scheduledFor?: string | null }

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "–";
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
interface NewsletterData { total: number; confirmed: number; pending: number; unsubscribed: number; subscribers: Subscriber[]; campaigns?: Campaign[] }

const SUB_BADGE: Record<string, { t: string; c: string }> = {
  confirmed: { t: "Bestätigt", c: "bg-[var(--color-success-tint)] text-[var(--color-success)]" },
  pending: { t: "Wartet auf Bestätigung", c: "bg-[var(--color-warn-tint)] text-[var(--color-warn)]" },
  unsubscribed: { t: "Abgemeldet", c: "bg-[var(--color-subtle)] text-[var(--color-muted)]" },
};

function fmt(iso: string | null) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Tage bis zum Datum (ganzzahlig, kann negativ sein). */
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/** Zeigt Test-Ablauf, Kündigung oder nächste Zahlung – klar pro Kunde. */
function TrialInfo({ c }: { c: Customer }) {
  const d = daysUntil(c.renewsAt);
  const dayLabel = d == null ? "" : d < 0 ? "abgelaufen" : d === 0 ? "heute" : d === 1 ? "morgen" : `noch ${d} Tage`;
  const tone = d != null && d <= 1 ? "text-[var(--color-danger)]" : d != null && d <= 2 ? "text-[var(--color-warn)]" : "text-[var(--color-muted)]";

  if (c.cancelAtPeriodEnd && c.status !== "canceled") {
    return <span className="text-[var(--color-warn)]">Gekündigt – endet {fmtDateTime(c.renewsAt)}</span>;
  }
  if (c.status === "canceled") return <span className="text-[var(--color-muted)]">beendet</span>;
  if (c.status === "trialing") {
    return (
      <span className={tone}>
        Test endet {fmtDateTime(c.renewsAt)}{dayLabel && <> · {dayLabel}</>}
      </span>
    );
  }
  if (c.status === "active") {
    return <span className="text-[var(--color-muted)]">nächste Zahlung {fmtDateTime(c.renewsAt)}</span>;
  }
  return <span className="text-[var(--color-faint)]">–</span>;
}

function StatusBadge({ s }: { s: string | null }) {
  const map: Record<string, { t: string; c: string }> = {
    active: { t: "Zahlend", c: "bg-[var(--color-success-tint)] text-[var(--color-success)]" },
    trialing: { t: "Im Test", c: "bg-[var(--color-brand-tint)] text-[var(--color-brand)]" },
    past_due: { t: "Zahlung offen", c: "bg-[var(--color-warn-tint)] text-[var(--color-warn)]" },
    canceled: { t: "Gekündigt", c: "bg-[var(--color-subtle)] text-[var(--color-muted)]" },
  };
  const m = (s && map[s]) || { t: s ?? "Kein Abo", c: "bg-[var(--color-subtle)] text-[var(--color-muted)]" };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.c}`}>{m.t}</span>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [news, setNews] = useState<NewsletterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState<NewsletterTemplate>("tipp");
  const [headline, setHeadline] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [useRawHtml, setUseRawHtml] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [sending, setSending] = useState(false);

  const reloadNews = () => api<NewsletterData>("/api/admin/newsletter").then(setNews).catch(() => {});

  const syncStripe = async () => {
    setSyncing(true);
    try {
      const r = await api<{ updated: number }>("/api/admin/sync-subscriptions", { json: {} });
      setToast(`${r.updated} Kunden mit Stripe synchronisiert.`);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Synchronisierung fehlgeschlagen.");
    } finally {
      setSyncing(false);
    }
  };

  const importCustomers = async () => {
    if (!window.confirm("Alle registrierten Kunden in den Newsletter-Verteiler übernehmen?\n\nRechtsgrundlage: § 7 Abs. 3 UWG (Bestandskunden, Abmeldung in jeder Mail). Bereits abgemeldete Kunden bleiben ausgenommen.")) return;
    setImporting(true);
    try {
      const r = await api<{ added: number; skipped: number }>("/api/admin/newsletter/import-customers", { json: {} });
      setToast(`${r.added} Kunden übernommen, ${r.skipped} übersprungen (bereits drin/abgemeldet).`);
      reloadNews();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Import fehlgeschlagen.");
    } finally {
      setImporting(false);
    }
  };

  const sendNewsletter = async () => {
    if (!news) return;
    if (news.confirmed === 0) { setToast("Noch keine bestätigten Abonnenten."); return; }
    const planned = scheduledFor.trim().length > 0;
    const when = planned ? new Date(scheduledFor).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
    const ask = planned
      ? `Newsletter „${subject}" für ${when} Uhr einplanen (an dann bestätigte Abonnenten)?`
      : `Newsletter „${subject}" jetzt an ${news.confirmed} bestätigte Abonnenten senden?`;
    if (!window.confirm(ask)) return;
    setSending(true);
    try {
      const r = await api<{ recipients?: number; sent?: number; failed?: number; scheduled?: boolean; scheduledFor?: string }>(
        "/api/admin/newsletter/send",
        { json: { subject, template, headline, body: mailBody, ctaLabel, ctaUrl, imageUrl, rawHtml: useRawHtml, scheduledFor: planned ? new Date(scheduledFor).toISOString() : "" } },
      );
      setToast(r.scheduled ? `Eingeplant für ${when} Uhr.` : `Versendet: ${r.sent}/${r.recipients}${r.failed ? ` · ${r.failed} fehlgeschlagen` : ""}`);
      setSubject(""); setHeadline(""); setMailBody(""); setCtaLabel(""); setCtaUrl(""); setImageUrl(""); setScheduledFor("");
      reloadNews();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Aktion fehlgeschlagen.");
    } finally {
      setSending(false);
    }
  };

  const load = () =>
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Kein Zugriff."))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    api<NewsletterData>("/api/admin/newsletter").then(setNews).catch(() => {});
  }, []);

  const extendTrial = async (ownerId: string, days: number) => {
    setBusy(ownerId);
    try {
      await api("/api/admin/customer", { json: { ownerId, days } });
      await load();
      setToast(`Testphase um ${days} Tage verlängert.`);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Verlängern fehlgeschlagen.");
    } finally {
      setBusy(null);
    }
  };

  const cards = stats
    ? [
        { label: "Registriert", value: stats.registered, icon: "user" as const },
        { label: "Bestätigt", value: stats.confirmed, icon: "check" as const },
        { label: "Im Test", value: stats.trialing, icon: "clock" as const },
        { label: "Zahlend", value: stats.paying, icon: "agents" as const },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)]"><Icon name="agents" size={16} strokeWidth={2.2} /></span>
            <span className="font-semibold">KundenRadar · Superadmin</span>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"><Icon name="chevronLeft" size={14} /> Zum Tool</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.01em]">Übersicht</h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Nur für dich sichtbar.</p>
          </div>
          <button
            onClick={syncStripe}
            disabled={syncing}
            title="Status & Ablaufdatum aller Kunden frisch aus Stripe holen"
            className="shrink-0 rounded-lg border border-[var(--color-line-strong)] px-3 py-2 text-sm font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] disabled:opacity-60"
          >
            {syncing ? "Synchronisiere …" : "↻ Stripe synchronisieren"}
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-[var(--color-muted)]">Lädt …</p>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
            {error} — diese Seite ist nur für den Superadmin zugänglich (mit Supabase + SUPER_ADMIN_EMAIL).
          </div>
        ) : stats ? (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {cards.map((c) => (
                <div key={c.label} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-tint)] text-[var(--color-brand)]"><Icon name={c.icon} size={19} /></span>
                  <div className="mt-3 text-3xl font-semibold tnum">{c.value}</div>
                  <div className="text-sm font-medium">{c.label}</div>
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-sm font-semibold">Aktivität</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Suchen heute", value: stats.usage?.searchesToday ?? 0, icon: "search" as const },
                { label: "Aktive Nutzer heute", value: stats.usage?.activeToday ?? 0, icon: "user" as const },
                { label: "Suchen (7 Tage)", value: stats.usage?.searches7d ?? 0, icon: "search" as const },
                { label: "Aktive Nutzer (7 Tage)", value: stats.usage?.active7d ?? 0, icon: "agents" as const },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-subtle)] text-[var(--color-ink-2)]"><Icon name={c.icon} size={19} /></span>
                  <div className="mt-3 text-3xl font-semibold tnum">{c.value}</div>
                  <div className="text-sm font-medium">{c.label}</div>
                </div>
              ))}
            </div>

            {(() => {
              const soon = stats.customers.filter((c) => {
                const d = daysUntil(c.renewsAt);
                return c.status === "trialing" && !c.cancelAtPeriodEnd && d != null && d >= 0 && d <= 2;
              });
              return soon.length > 0 ? (
                <div className="mt-8 rounded-xl border border-[var(--color-warn)]/40 bg-[var(--color-warn-tint)]/30 px-4 py-3 text-sm text-[var(--color-ink)]">
                  ⏰ <strong>{soon.length}</strong> {soon.length > 1 ? "Tests enden" : "Test endet"} in den nächsten 2 Tagen
                  {" – "}guter Moment für eine persönliche Nachfass-Mail oder eine Verlängerung.
                </div>
              ) : null;
            })()}

            <h2 className="mt-10 text-sm font-semibold">Alle Kunden ({stats.customers.length})</h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-left text-xs text-[var(--color-muted)]">
                    <th className="px-4 py-2.5 font-medium">Firma</th>
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">E-Mail</th>
                    <th className="px-4 py-2.5 font-medium">Telefon</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Registriert</th>
                    <th className="px-4 py-2.5 font-medium">Test-Ablauf / Kündigung</th>
                    <th className="px-4 py-2.5 font-medium text-right">Test verlängern</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.customers.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-6 text-center text-[var(--color-muted)]">Noch keine Kunden.</td></tr>
                  ) : stats.customers.map((c) => (
                    <tr key={c.email} className="border-b border-[var(--color-line)] last:border-0">
                      <td className="px-4 py-2.5 font-medium">{c.company ?? "–"}</td>
                      <td className="px-4 py-2.5">{c.name ?? "–"}</td>
                      <td className="px-4 py-2.5 text-[var(--color-muted)]">{c.email}</td>
                      <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{c.phone ?? "–"}</td>
                      <td className="px-4 py-2.5"><StatusBadge s={c.status} /></td>
                      <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{fmt(c.createdAt)}</td>
                      <td className="px-4 py-2.5 text-xs tnum"><TrialInfo c={c} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {busy === c.id ? (
                            <Spinner size={14} />
                          ) : (
                            [7, 14, 30].map((d) => (
                              <button
                                key={d}
                                onClick={() => extendTrial(c.id, d)}
                                className="rounded-md border border-[var(--color-line)] px-2 py-1 text-xs text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                                title={`Testphase um ${d} Tage verlängern`}
                              >
                                +{d}d
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Newsletter-Verteiler */}
            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Newsletter-Verteiler{news ? ` (${news.total})` : ""}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={importCustomers}
                  disabled={importing}
                  title="Registrierte Kunden in den Verteiler übernehmen (§ 7 Abs. 3 UWG)"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)] disabled:opacity-60"
                >
                  <Icon name="user" size={13} /> {importing ? "Übernehme …" : "Kunden übernehmen"}
                </button>
                {news && news.total > 0 && (
                  <a
                    href="/api/admin/newsletter/export"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
                  >
                    <Icon name="search" size={13} /> Als CSV exportieren
                  </a>
                )}
              </div>
            </div>

            {!news ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Verteiler lädt … oder die Tabelle <code>newsletter_subscribers</code> ist noch nicht migriert.
              </p>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  {[
                    { label: "Bestätigt (aktiv)", value: news.confirmed, c: "text-[var(--color-success)]" },
                    { label: "Wartet auf Bestätigung", value: news.pending, c: "text-[var(--color-warn)]" },
                    { label: "Abgemeldet", value: news.unsubscribed, c: "text-[var(--color-muted)]" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                      <div className={`text-3xl font-semibold tnum ${k.c}`}>{k.value}</div>
                      <div className="text-sm font-medium">{k.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-line)] text-left text-xs text-[var(--color-muted)]">
                        <th className="px-4 py-2.5 font-medium">E-Mail</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Quelle</th>
                        <th className="px-4 py-2.5 font-medium">Angemeldet</th>
                        <th className="px-4 py-2.5 font-medium">Bestätigt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.subscribers.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Noch keine Anmeldungen.</td></tr>
                      ) : news.subscribers.map((s) => {
                        const b = SUB_BADGE[s.status] ?? { t: s.status, c: "bg-[var(--color-subtle)] text-[var(--color-muted)]" };
                        return (
                          <tr key={s.id} className="border-b border-[var(--color-line)] last:border-0">
                            <td className="px-4 py-2.5">{s.email}</td>
                            <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${b.c}`}>{b.t}</span></td>
                            <td className="px-4 py-2.5 text-[var(--color-muted)]">{s.source ?? "–"}</td>
                            <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{fmt(s.consentAt)}</td>
                            <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{fmt(s.confirmedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Newsletter verfassen & senden */}
                <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
                  <h3 className="text-sm font-semibold">Newsletter verfassen &amp; senden</h3>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Geht an alle <strong>{news.confirmed}</strong> bestätigten Abonnenten. Impressum &amp; Abmeldelink werden automatisch angehängt.
                  </p>

                  {/* Vorlagen-Auswahl */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          template === t.id
                            ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)] text-[var(--color-brand)]"
                            : "border-[var(--color-line-strong)] text-[var(--color-ink-2)] hover:bg-[var(--color-subtle)]"
                        }`}
                      >
                        {t.emoji} {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-5 lg:grid-cols-2">
                    {/* Formular */}
                    <div className="space-y-2.5">
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Betreff (steht in der Inbox-Zeile)"
                        className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                      />
                      <input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Überschrift (große Zeile in der Mail)"
                        className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                      />
                      <textarea
                        value={mailBody}
                        onChange={(e) => setMailBody(e.target.value)}
                        placeholder={"Hallo,\n\nhier dein Tipp der Woche …\n\nViele Grüße\nCihan"}
                        rows={8}
                        className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={ctaLabel}
                          onChange={(e) => setCtaLabel(e.target.value)}
                          placeholder="Button-Text (optional)"
                          className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                        />
                        <input
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                          placeholder="Button-Link (https://…)"
                          className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                        />
                      </div>
                      <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Bild-URL für den Kopf (optional, https://…)"
                        className="w-full rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                      />
                      <label className="flex items-center gap-2 text-xs text-[var(--color-ink-2)]">
                        <input type="checkbox" checked={useRawHtml} onChange={(e) => setUseRawHtml(e.target.checked)} className="h-4 w-4 accent-[var(--color-brand)]" />
                        Eigenes HTML schreiben (Profi-Modus)
                      </label>
                      {useRawHtml ? (
                        <p className="text-xs text-[var(--color-muted)]">Der Textbereich wird als <strong>HTML</strong> gesendet. Kopf, Bild, Fuß &amp; Abmeldelink kommen automatisch dazu. <code>{"{{Vorname}}"}</code> funktioniert weiter.</p>
                      ) : (
                        <p className="text-xs text-[var(--color-muted)]">Formatierung: <code>**fett**</code> · <code>*kursiv*</code> · <code>[Text](https://…)</code> · Zeilen mit <code>- </code> = Aufzählung · <code>![](Bild-URL)</code> = Bild. Leerzeile = neuer Absatz. <code>{"{{Vorname}}"}</code> wird je Empfänger ersetzt.</p>
                      )}
                    </div>

                    {/* Live-Vorschau */}
                    <div>
                      <div className="mb-1.5 eyebrow">Vorschau</div>
                      <iframe
                        title="Newsletter-Vorschau"
                        sandbox=""
                        className="h-[460px] w-full rounded-lg border border-[var(--color-line)] bg-white"
                        srcDoc={renderNewsletterHtml({
                          template,
                          headline: headline || "Deine Überschrift",
                          body: mailBody || "Hier steht dein Text … schreib links los, die Vorschau aktualisiert sich live.",
                          ctaLabel: ctaLabel || undefined,
                          ctaUrl: ctaUrl || undefined,
                          imageUrl: imageUrl || undefined,
                          rawHtml: useRawHtml,
                          unsubscribeUrl: "#",
                          impressum: "Seciora Solutions, Inhaber Cihan Yildirim, Charlottenstraße 37, 51149 Köln",
                        })}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end justify-end gap-3">
                    <label className="text-xs text-[var(--color-muted)]">
                      <span className="mb-1 block">Später senden (optional)</span>
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="rounded-lg border border-[var(--color-line-strong)] bg-[var(--color-canvas)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                      />
                    </label>
                    <button
                      onClick={sendNewsletter}
                      disabled={sending || subject.trim().length < 3 || headline.trim().length < 3 || mailBody.trim().length < 10}
                      className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)] disabled:opacity-50"
                    >
                      {sending ? "…" : scheduledFor.trim() ? "Einplanen" : `An ${news.confirmed} senden`}
                    </button>
                  </div>
                </div>

                {/* Versendete Kampagnen */}
                {news.campaigns && news.campaigns.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-line)] text-left text-xs text-[var(--color-muted)]">
                          <th className="px-4 py-2.5 font-medium">Betreff</th>
                          <th className="px-4 py-2.5 font-medium">Status</th>
                          <th className="px-4 py-2.5 font-medium">Empfänger</th>
                          <th className="px-4 py-2.5 font-medium">Versendet</th>
                          <th className="px-4 py-2.5 font-medium">Zeitpunkt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {news.campaigns.map((c) => {
                          const scheduled = c.status === "scheduled" || c.status === "sending";
                          return (
                            <tr key={c.id} className="border-b border-[var(--color-line)] last:border-0">
                              <td className="px-4 py-2.5">{c.subject}</td>
                              <td className="px-4 py-2.5">
                                {c.status === "scheduled" ? (
                                  <span className="rounded-full bg-[var(--color-warn-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-warn)]">⏰ Geplant</span>
                                ) : c.status === "sending" ? (
                                  <span className="rounded-full bg-[var(--color-brand-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-brand)]">Wird gesendet…</span>
                                ) : (
                                  <span className="rounded-full bg-[var(--color-success-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)]">Versendet</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{scheduled ? "–" : c.recipients}</td>
                              <td className="px-4 py-2.5 tnum">{scheduled ? "–" : <>{c.sent}{c.failed ? <span className="text-[var(--color-danger)]"> · {c.failed} ✗</span> : null}</>}</td>
                              <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{scheduled ? fmtDateTime(c.scheduledFor) : fmt(c.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </main>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
