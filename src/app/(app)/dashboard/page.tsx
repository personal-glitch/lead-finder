"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Activity, ActivityType, Lead, PipelineStage, Task } from "@/lib/types";
import { api } from "@/lib/client";
import { PageHeader, refreshStats } from "@/components/shell/AppShell";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Button, Card, EmptyState, Spinner } from "@/components/ui";
import { NewsletterOptInCard } from "@/components/NewsletterOptInCard";

const ACT_ICON: Record<ActivityType, IconName> = {
  created: "plus", enriched: "search", stage_changed: "pipeline",
  call: "phone", email: "mail", task: "tasks", note: "pencil",
};

interface Stats { anrufeHeute: number; ziel: number; offeneAufgaben: number; faelligHeute: number }

function Kpi({ label, value, sub, icon, tone }: { label: string; value: string | number; sub?: string; icon: IconName; tone: { bg: string; fg: string } }) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: tone.bg, color: tone.fg }}>
        <Icon name={icon} size={19} />
      </span>
      <div>
        <div className="eyebrow">{label}</div>
        <div className="text-[26px] font-semibold leading-tight tnum">{value}</div>
        {sub && <div className="text-xs text-[var(--color-muted)]">{sub}</div>}
      </div>
    </Card>
  );
}

const T = {
  brand: { bg: "var(--color-brand-tint)", fg: "var(--color-brand)" },
  blue: { bg: "var(--color-info-tint)", fg: "var(--color-info)" },
  amber: { bg: "var(--color-warn-tint)", fg: "var(--color-warn)" },
  green: { bg: "var(--color-success-tint)", fg: "var(--color-success)" },
};

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [setup, setSetup] = useState<{ emailReady: boolean; agents: number; impressum: boolean; signature: boolean; templates: number }>({ emailReady: false, agents: 0, impressum: false, signature: false, templates: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [l, s, t, a, st, cfg, tpl] = await Promise.all([
        api<{ leads: Lead[] }>("/api/leads"),
        api<{ stages: PipelineStage[] }>("/api/stages"),
        api<{ tasks: Task[] }>("/api/tasks?done=false"),
        api<{ activities: Activity[] }>("/api/activities?limit=14"),
        api<Stats>("/api/stats"),
        api<{ settings: { emailReady: boolean; senderImpressum: string; senderSignature: string }; usage: { agents: number } }>("/api/settings"),
        api<{ templates: { id: string }[] }>("/api/templates"),
      ]);
      setLeads(l.leads); setStages(s.stages); setTasks(t.tasks); setActivities(a.activities); setStats(st);
      setSetup({
        emailReady: cfg.settings.emailReady,
        agents: cfg.usage.agents,
        impressum: Boolean(cfg.settings.senderImpressum?.trim()),
        signature: Boolean(cfg.settings.senderSignature?.trim()),
        templates: tpl.templates.length,
      });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const leadName = (id: string | null) => (id ? leads.find((l) => l.id === id)?.name ?? "Firma" : null);

  const funnel = useMemo(() => {
    const counts = stages.map((s) => ({ name: s.name, n: leads.filter((l) => l.stageId === s.id).length }));
    const max = Math.max(1, ...counts.map((c) => c.n));
    return { counts, max };
  }, [stages, leads]);

  const eur = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const deal = useMemo(() => {
    const sum = (arr: Lead[]) => arr.reduce((s, l) => s + (typeof l.value === "number" ? l.value : 0), 0);
    const offen = leads.filter((l) => l.status === "offen");
    const won = leads.filter((l) => l.status === "gewonnen");
    const lost = leads.filter((l) => l.status === "verloren");
    const closed = won.length + lost.length;
    const withVal = leads.filter((l) => typeof l.value === "number" && l.value > 0);
    return {
      pipeline: sum(offen),
      offenCount: offen.length,
      wonValue: sum(won),
      wonCount: won.length,
      quote: closed > 0 ? Math.round((won.length / closed) * 100) : null,
      avg: withVal.length > 0 ? Math.round(sum(withVal) / withVal.length) : null,
    };
  }, [leads]);

  const heute = useMemo(() => {
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return tasks.filter((t) => !t.dueAt || t.dueAt <= end.toISOString());
  }, [tasks]);

  const completeTask = async (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    try { await api(`/api/tasks/${id}`, { method: "PATCH", json: { done: true } }); refreshStats(); } catch { load(); }
  };

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Dein Tagesüberblick" />
      <div className="space-y-6 p-4 sm:p-7">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Pipeline-Wert (offen)" value={eur(deal.pipeline)} sub={`${deal.offenCount} offene Leads`} icon="pipeline" tone={T.blue} />
          <Kpi label="Gewonnen" value={eur(deal.wonValue)} sub={`${deal.wonCount} Abschlüsse`} icon="check" tone={T.green} />
          <Kpi label="Abschlussquote" value={deal.quote != null ? `${deal.quote}%` : "—"} sub="gewonnen / abgeschlossen" icon="health" tone={T.brand} />
          <Kpi label="Ø Auftragswert" value={deal.avg != null ? eur(deal.avg) : "—"} sub="erfasste Werte" icon="calculator" tone={T.amber} />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Kpi label="Leads gesamt" value={leads.length} icon="agents" tone={T.blue} />
          <Kpi label="Anrufe heute" value={stats ? `${stats.anrufeHeute}` : "0"} sub={stats ? `Ziel ${stats.ziel}` : undefined} icon="phone" tone={T.brand} />
          <Kpi label="Offene Aufgaben" value={stats?.offeneAufgaben ?? 0} sub={stats ? `${stats.faelligHeute} heute fällig` : undefined} icon="tasks" tone={T.amber} />
        </div>

        {/* Erklärvideo + persönliche Einführung per WhatsApp – starker Conversion-Hebel */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#25D366]/40 bg-gradient-to-r from-[#25D366]/15 to-[#25D366]/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-white text-2xl">💬</span>
            <div>
              <div className="text-base font-bold text-[var(--color-ink)]">Neu hier? Schau dir kurz das Erklärvideo an – oder hol dir eine persönliche Einführung.</div>
              <div className="mt-0.5 text-sm text-[var(--color-muted)]">Das Video zeigt dir in 2:46 Min alles Schritt für Schritt. Lieber persönlich? Wir zeigen dir KundenRadar in ~15 Min per WhatsApp.</div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link href="/hilfe" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-5 py-3 text-sm font-bold text-[var(--color-ink)] hover:border-[var(--color-brand)]">
              ▶ Video-Tutorials ansehen
            </Link>
            <a
              href="https://wa.me/4915292627062?text=Hallo%2C%20ich%20h%C3%A4tte%20gerne%20eine%20kurze%20kostenlose%20Einf%C3%BChrung%20zu%20KundenRadar."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1ebe5d]"
            >
              💬 Kostenlose Einführung per WhatsApp
            </a>
          </div>
        </div>

        {!loading && leads.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-brand-tint)]/15 p-6">
            <h2 className="text-lg font-semibold">👋 Willkommen! In 60 Sekunden zum ersten Ergebnis</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">
              Gib einfach deine Stadt ein – KundenRadar liefert dir sofort anrufbare Firmen mit Telefon &amp;
              Ansprechpartner. Starte mit einer Beispiel-Suche und sieh dir das Ergebnis an:
            </p>
            <Link href="/suche?demo=1" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-brand)] hover:bg-[var(--color-brand-ink)]">
              <Icon name="search" size={15} /> Beispiel-Suche starten
            </Link>
          </div>
        )}

        {!loading && (() => {
          const hasOutreach = activities.some((a) => a.type === "call" || a.type === "email");
          const steps = [
            { done: setup.agents > 0, t: "Ersten Agenten anlegen", d: "Such-Profil für deine Zielbranchen – einmal, dann jederzeit.", href: "/agenten", cta: "Agent anlegen" },
            { done: leads.length > 0, t: "Passende Firmen finden", d: "PLZ + Branche wählen und Leads in die Pipeline übernehmen.", href: "/suche", cta: "Zur Suche" },
            { done: setup.emailReady, t: "E-Mail-Versand einrichten", d: "Eigenes Postfach (SMTP) – Schritt-für-Schritt-Hilfe in den Einstellungen.", href: "/einstellungen", cta: "Einrichten" },
            { done: setup.impressum, t: "Impressum hinterlegen (Pflicht)", d: "Ohne Impressum ist der E-Mail-Versand blockiert. Steht automatisch im Footer jeder Mail.", href: "/einstellungen", cta: "Jetzt hinterlegen" },
            { done: setup.signature, t: "E-Mail-Signatur hinterlegen", d: "Dein Name, Firma & Kontakt unter jeder Mail.", href: "/einstellungen", cta: "Hinzufügen" },
            { done: setup.templates > 0, t: "E-Mail-Vorlage anlegen", d: "Aus der Bibliothek übernehmen oder selbst schreiben.", href: "/vorlagen", cta: "Vorlage anlegen" },
            { done: hasOutreach, t: "Ersten Kontakt ansprechen", d: "Erster Anruf oder erste Mail an einen Lead – los geht's.", href: "/pipeline", cta: "Zur Pipeline" },
          ];
          const doneCount = steps.filter((s) => s.done).length;
          const allDone = doneCount === steps.length;
          const pct = Math.round((doneCount / steps.length) * 100);
          return (
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{allDone ? "✅ Einrichtung abgeschlossen" : "🚀 Einrichtung – so wirst du startklar"}</h2>
                <span className="text-xs font-medium text-[var(--color-muted)] tnum">{doneCount}/{steps.length} erledigt · {pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-subtle)]">
                <div className="h-full rounded-full bg-[var(--color-brand)] transition-all" style={{ width: `${pct}%` }} />
              </div>
              {allDone ? (
                <p className="text-sm text-[var(--color-muted)]">Perfekt – alles eingerichtet. Du kannst jetzt voll loslegen. 🎉</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {steps.map((s, i) => (
                    <div key={s.t} className={`rounded-xl border p-4 ${s.done ? "border-[var(--color-line)] opacity-60" : "border-[var(--color-brand)]/40 bg-[var(--color-brand-tint)]/20"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${s.done ? "bg-[var(--color-brand)] text-[var(--color-on-brand)]" : "border border-[var(--color-line-strong)] text-[var(--color-muted)]"}`}>
                          {s.done ? <Icon name="check" size={13} /> : i + 1}
                        </span>
                        <span className="text-sm font-medium">{s.t}</span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-muted)]">{s.d}</p>
                      {!s.done && <Link href={s.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand)] hover:underline">{s.cta} <Icon name="chevronRight" size={13} /></Link>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })()}

        {loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : leads.length === 0 ? (
          <EmptyState icon="home" title="Noch nichts los">
            Leg einen Agenten an, finde passende Firmen und übernimm sie in die Pipeline – hier siehst du dann deinen Tagesüberblick.
            <div className="mt-4"><Link href="/agenten"><Button><Icon name="agents" size={16} /> Zu den Agenten</Button></Link></div>
          </EmptyState>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Heute zu erledigen + Funnel */}
            <div className="space-y-6">
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Heute zu erledigen</h2>
                  <Link href="/aufgaben" className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]">alle Aufgaben →</Link>
                </div>
                {heute.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">Nichts fällig – sauber. 🎉</p>
                ) : (
                  <ul className="space-y-2">
                    {heute.slice(0, 8).map((t) => (
                      <li key={t.id} className="flex items-center gap-2.5">
                        <button onClick={() => completeTask(t.id)} title="Erledigt"
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[var(--color-line-strong)] text-transparent transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]">
                          <Icon name="check" size={13} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm">{t.title}</div>
                          {leadName(t.leadId) && <div className="truncate text-xs text-[var(--color-muted)]">{leadName(t.leadId)}</div>}
                        </div>
                        {t.dueAt && <span className="shrink-0 text-[11px] text-[var(--color-faint)] tnum">{fmt(t.dueAt)}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold">Pipeline-Funnel</h2>
                <ul className="space-y-2">
                  {funnel.counts.map((c) => (
                    <li key={c.name} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 truncate text-xs text-[var(--color-ink-2)]">{c.name}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-subtle)]">
                        <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${(c.n / funnel.max) * 100}%` }} />
                      </div>
                      <span className="w-7 shrink-0 text-right text-xs font-medium tnum">{c.n}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Letzte Aktivitäten */}
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Letzte Aktivitäten</h2>
              {activities.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">Noch keine Aktivität.</p>
              ) : (
                <ul className="space-y-3">
                  {activities.map((a) => (
                    <li key={a.id} className="flex gap-2.5 text-xs">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-subtle)] text-[var(--color-muted)]">
                        <Icon name={ACT_ICON[a.type]} size={13} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[var(--color-ink)]">{a.summary}</div>
                        <div className="flex items-center gap-1.5 text-[var(--color-faint)]">
                          {leadName(a.leadId) && <span className="truncate">{leadName(a.leadId)}</span>}
                          <span className="tnum">· {fmt(a.createdAt)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}

        <NewsletterOptInCard />
      </div>
    </>
  );
}
