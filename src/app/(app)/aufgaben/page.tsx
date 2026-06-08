"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lead, Task } from "@/lib/types";
import { api } from "@/lib/client";
import { PageHeader, refreshStats } from "@/components/shell/AppShell";
import { Icon } from "@/components/icons";
import { Button, Card, EmptyState, Field, Select, Spinner, TextInput, cx } from "@/components/ui";

function fmt(iso: string | null) {
  if (!iso) return "ohne Termin";
  return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
const inDays = (d: number) => { const x = new Date(); x.setHours(9, 0, 0, 0); x.setDate(x.getDate() + d); return x.toISOString(); };

const DUE_OPTIONS: { key: string; label: string; value: () => string | null }[] = [
  { key: "today", label: "Heute", value: () => inDays(0) },
  { key: "tomorrow", label: "Morgen", value: () => inDays(1) },
  { key: "3d", label: "In 3 Tagen", value: () => inDays(3) },
  { key: "week", label: "Nächste Woche", value: () => inDays(7) },
  { key: "none", label: "Kein Datum", value: () => null },
];

function TaskRow({ task, firma, onToggle, onDelete }: { task: Task; firma: string | null; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2.5 px-1 py-2">
      <button onClick={onToggle} title={task.done ? "Wieder öffnen" : "Erledigt"}
        className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
          task.done ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-[var(--color-on-brand)]"
            : "border-[var(--color-line-strong)] text-transparent hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]")}>
        <Icon name="check" size={13} />
      </button>
      <div className="min-w-0 flex-1">
        <div className={cx("truncate text-sm", task.done && "text-[var(--color-faint)] line-through")}>{task.title}</div>
        {firma && <div className="truncate text-xs text-[var(--color-muted)]">{firma}</div>}
      </div>
      <span className="shrink-0 text-[11px] text-[var(--color-faint)] tnum">{fmt(task.dueAt)}</span>
      <button onClick={onDelete} className="shrink-0 text-[var(--color-faint)] hover:text-[var(--color-danger)]" aria-label="Löschen">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

export default function AufgabenPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("3d");

  const load = async () => {
    try {
      const [t, l] = await Promise.all([
        api<{ tasks: Task[] }>("/api/tasks"),
        api<{ leads: Lead[] }>("/api/leads"),
      ]);
      setTasks(t.tasks); setLeads(l.leads);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const leadName = (id: string | null) => (id ? leads.find((l) => l.id === id)?.name ?? "Firma" : null);

  const groups = useMemo(() => {
    const now = new Date();
    const endToday = new Date(); endToday.setHours(23, 59, 59, 999);
    const endWeek = new Date(); endWeek.setDate(endWeek.getDate() + 7); endWeek.setHours(23, 59, 59, 999);
    const g: Record<string, Task[]> = { "Überfällig": [], "Heute": [], "Diese Woche": [], "Später": [], "Ohne Termin": [], "Erledigt": [] };
    for (const t of tasks) {
      if (t.done) g["Erledigt"].push(t);
      else if (!t.dueAt) g["Ohne Termin"].push(t);
      else if (t.dueAt < now.toISOString()) g["Überfällig"].push(t);
      else if (t.dueAt <= endToday.toISOString()) g["Heute"].push(t);
      else if (t.dueAt <= endWeek.toISOString()) g["Diese Woche"].push(t);
      else g["Später"].push(t);
    }
    return g;
  }, [tasks]);

  const toggle = async (task: Task) => {
    setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    try { await api(`/api/tasks/${task.id}`, { method: "PATCH", json: { done: !task.done } }); refreshStats(); } catch { load(); }
  };
  const remove = async (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    try { await api(`/api/tasks/${id}`, { method: "DELETE" }); refreshStats(); } catch { load(); }
  };
  const create = async () => {
    if (!title.trim()) return;
    const dueAt = DUE_OPTIONS.find((o) => o.key === due)!.value();
    const { task } = await api<{ task: Task }>("/api/tasks", { json: { title: title.trim(), type: "todo", dueAt } });
    setTasks((p) => [task, ...p]); setTitle(""); setAdding(false); refreshStats();
  };

  const order = ["Überfällig", "Heute", "Diese Woche", "Später", "Ohne Termin", "Erledigt"];
  const hasOpen = tasks.some((t) => !t.done);

  return (
    <>
      <PageHeader title="Aufgaben" subtitle="Wiedervorlagen & To-dos"
        actions={<Button onClick={() => setAdding((v) => !v)}><Icon name="plus" size={16} /> Neue Aufgabe</Button>} />
      <div className="space-y-5 p-4 sm:p-7">
        {adding && (
          <Card className="flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-[240px] flex-1">
              <Field label="Aufgabe"><TextInput autoFocus value={title} placeholder="z. B. Angebot nachfassen"
                onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} /></Field>
            </div>
            <div className="w-40">
              <Field label="Fällig"><Select value={due} onChange={(e) => setDue(e.target.value)}>
                {DUE_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </Select></Field>
            </div>
            <Button onClick={create} disabled={!title.trim()}>Anlegen</Button>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : !hasOpen && tasks.length === 0 ? (
          <EmptyState icon="tasks" title="Keine Aufgaben">
            Aufgaben entstehen automatisch beim Telefonieren (z. B. „Wiedervorlage" bei nicht erreicht) – oder leg manuell eine an.
          </EmptyState>
        ) : (
          <div className="space-y-5">
            {order.map((name) => {
              const items = groups[name];
              if (items.length === 0) return null;
              return (
                <Card key={name} className="p-4">
                  <div className="mb-1 flex items-center gap-2 px-1">
                    <h2 className={cx("text-sm font-semibold", name === "Überfällig" && "text-[var(--color-danger)]")}>{name}</h2>
                    <span className="rounded-full bg-[var(--color-subtle)] px-1.5 text-[11px] text-[var(--color-muted)] tnum">{items.length}</span>
                  </div>
                  <div className="divide-y divide-[var(--color-line)]">
                    {items.map((t) => (
                      <TaskRow key={t.id} task={t} firma={leadName(t.leadId)} onToggle={() => toggle(t)} onDelete={() => remove(t.id)} />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
