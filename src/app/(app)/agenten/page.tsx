"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Agent, AgentInput } from "@/lib/types";
import { api } from "@/lib/client";
import { PageHeader } from "@/components/shell/AppShell";
import { AgentDialog } from "@/components/agents/AgentDialog";
import { AgentAvatar, Icon } from "@/components/icons";
import { Button, Card, EmptyState, IconButton, Spinner, Toast, cx } from "@/components/ui";

function fmtDate(iso: string | null): string {
  if (!iso) return "noch nie gelaufen";
  return "zuletzt " + new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function AgentCard({ agent, onOpen, onDelete }: { agent: Agent; onOpen: () => void; onDelete: () => void }) {
  return (
    <Card
      className={cx(
        "group flex cursor-pointer flex-col p-4 transition-shadow",
        "hover:shadow-[0_6px_22px_rgba(0,0,0,0.45)]",
      )}
    >
      <div onClick={onOpen} className="flex-1">
        <div className="flex items-start justify-between">
          <AgentAvatar icon={agent.icon as never} color={agent.color} size={42} />
          <IconButton
            icon="trash"
            label="Agent löschen"
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); if (confirm(`Agent „${agent.name}" löschen?`)) onDelete(); }}
          />
        </div>
        <h3 className="mt-3 text-[15px] font-semibold tracking-[-0.01em]">{agent.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Icon name="pin" size={13} />
          <span className="tnum">{agent.plz}</span> · {agent.radiusKm} km
        </div>
        {agent.objektTypen.length > 0 && (
          <p className="mt-2 line-clamp-2 text-xs text-[var(--color-ink-2)]">{agent.objektTypen.join(" · ")}</p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line)] pt-3 text-[11px] text-[var(--color-muted)]">
        <span className="tnum">{agent.lastMatchCount} Treffer · {agent.leadsCreated} Leads</span>
        <span>{fmtDate(agent.lastRunAt)}</span>
      </div>
    </Card>
  );
}

export default function AgentenPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    try {
      const { agents } = await api<{ agents: Agent[] }>("/api/agents");
      setAgents(agents);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (input: AgentInput) => {
    const { agent } = await api<{ agent: Agent }>("/api/agents", { json: input });
    setDialogOpen(false);
    router.push(`/agenten/${agent.id}`);
  };

  const remove = async (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    try { await api(`/api/agents/${id}`, { method: "DELETE" }); }
    catch (e) { setToast(e instanceof Error ? e.message : "Löschen fehlgeschlagen."); load(); }
  };

  return (
    <>
      <PageHeader
        title="Agenten"
        subtitle="Benannte Lead-Gen-Profile mit eigenem Avatar. Öffnen und „Jetzt suchen“ klicken."
        actions={<Button onClick={() => setDialogOpen(true)}><Icon name="plus" size={16} /> Neuer Agent</Button>}
      />
      <div className="p-7">
        {loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]"><Spinner /> Lädt …</div>
        ) : agents.length === 0 ? (
          <EmptyState icon="agents" title="Noch keine Agenten">
            Lege deinen ersten Agenten an — z. B. „Logistik NRW" oder „Pflege Köln". Vorlagen erleichtern den Start.
            <div className="mt-4"><Button onClick={() => setDialogOpen(true)}><Icon name="plus" size={16} /> Neuer Agent</Button></div>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} onOpen={() => router.push(`/agenten/${a.id}`)} onDelete={() => remove(a.id)} />
            ))}
          </div>
        )}
      </div>

      <AgentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={create} />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
