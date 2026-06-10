"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Icon } from "@/components/icons";
import { Spinner, Toast } from "@/components/ui";

interface Customer {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  status: string | null;
  renewsAt: string | null;
  createdAt: string | null;
  confirmed: boolean;
}
interface Usage { searchesToday: number; searches7d: number; activeToday: number; active7d: number }
interface Stats { registered: number; confirmed: number; trialing: number; paying: number; usage?: Usage; customers: Customer[] }

function fmt(iso: string | null) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = () =>
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Kein Zugriff."))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

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
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Übersicht</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Nur für dich sichtbar.</p>

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
                    <th className="px-4 py-2.5 font-medium">Nächste Zahlung</th>
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
                      <td className="px-4 py-2.5 text-[var(--color-muted)] tnum">{c.status === "canceled" ? "–" : fmt(c.renewsAt)}</td>
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
          </>
        ) : null}
      </main>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
