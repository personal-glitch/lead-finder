"use client";
import { useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Lead, PipelineStage } from "@/lib/types";
import { AGENT_COLORS, Icon } from "./icons";
import { Badge, Button, IconButton, TextInput, cx } from "./ui";
import { useConfirm } from "@/components/ConfirmProvider";

function initials(name: string | null): string {
  if (!name) return "–";
  const parts = name.replace(/\b(gmbh|ag|kg|ohg|e\.?v\.?|co|mbh)\b/gi, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}
function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AGENT_COLORS[h % AGENT_COLORS.length];
}

export function LeadCard({ lead, onOpen, overlay }: { lead: Lead; onOpen?: (l: Lead) => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lead:${lead.id}`,
    data: { kind: "lead", lead },
    disabled: overlay,
  });
  const c = colorFor(lead.id);

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={{ transform: overlay ? undefined : CSS.Translate.toString(transform) }}
      className={cx(
        "group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 transition-shadow",
        !overlay && "cursor-grab shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.45)] active:cursor-grabbing",
        isDragging && "opacity-40",
        overlay && "w-64 rotate-1 shadow-[0_14px_40px_rgba(0,0,0,0.6)]",
      )}
      {...(overlay ? {} : { ...listeners, ...attributes })}
      onClick={() => onOpen?.(lead)}
      role="button"
    >
      <div className="flex items-start gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold"
          style={{ background: c.bg, color: c.fg }}
        >
          {initials(lead.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-snug">{lead.name ?? "Ohne Namen"}</div>
          {lead.ansprechpartner && (
            <div className="truncate text-xs text-[var(--color-muted)]">{lead.ansprechpartner}</div>
          )}
        </div>
      </div>

      {lead.phone && (
        <a
          href={lead.phoneE164 ? `tel:${lead.phoneE164}` : undefined}
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-[var(--color-success-tint)] px-2 py-1 text-xs font-medium text-[var(--color-success)] tnum"
        >
          <Icon name="phone" size={13} /> {lead.phone}
        </a>
      )}

      {(typeof lead.value === "number" || lead.status !== "offen") && (
        <div className="mt-2 flex items-center gap-1.5">
          {typeof lead.value === "number" && (
            <span className="inline-flex items-center rounded-md bg-[var(--color-subtle)] px-1.5 py-0.5 text-[11px] font-semibold tnum">
              {lead.value.toLocaleString("de-DE")} €
            </span>
          )}
          {lead.status === "gewonnen" && <Badge tone="green">Gewonnen</Badge>}
          {lead.status === "verloren" && <Badge tone="slate">Verloren</Badge>}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
          {lead.ort && (
            <span className="inline-flex items-center gap-0.5 truncate">
              <Icon name="pin" size={12} /> {lead.ort}
            </span>
          )}
        </div>
        {lead.objektTyp && <Badge tone="slate">{lead.objektTyp.split(" / ")[0]}</Badge>}
      </div>
    </div>
  );
}

function Column({
  stage,
  leads,
  onOpenLead,
  onRename,
  onDelete,
}: {
  stage: PipelineStage;
  leads: Lead[];
  onOpenLead: (l: Lead) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${stage.id}`, data: { kind: "stage", stageId: stage.id } });
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(stage.name);

  return (
    <div className="flex w-[280px] shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {editing ? (
            <TextInput
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setEditing(false);
                if (name.trim() && name !== stage.name) onRename(stage.id, name.trim());
                else setName(stage.name);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") { setName(stage.name); setEditing(false); }
              }}
              className="h-7 py-0 text-sm"
            />
          ) : (
            <button
              className="text-sm font-semibold tracking-[-0.01em]"
              onDoubleClick={() => setEditing(true)}
              title="Doppelklick zum Umbenennen"
            >
              {stage.name}
            </button>
          )}
          <span className="rounded-full bg-[var(--color-subtle)] px-1.5 text-[11px] font-medium text-[var(--color-muted)] tnum">
            {leads.length}
          </span>
        </div>
        <IconButton icon="trash" label="Stage löschen" className="opacity-0 group-hover/board:opacity-100"
          onClick={async () => {
            if (await confirm({ message: `Stage „${stage.name}" löschen? Leads darin verlieren ihre Stage.`, confirmLabel: "Löschen" })) onDelete(stage.id);
          }} />
      </div>
      <div
        ref={setNodeRef}
        className={cx(
          "scroll-slim flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto rounded-xl border p-2 transition-colors",
          isOver ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)]/50" : "border-transparent bg-[var(--color-subtle)]",
        )}
      >
        {leads.length === 0 ? (
          <p className="m-auto text-center text-xs text-[var(--color-faint)]">Leads hierher ziehen</p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={onOpenLead} />)
        )}
      </div>
    </div>
  );
}

function AddStage({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-7 flex h-9 w-[200px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--color-line-strong)] text-sm text-[var(--color-muted)] hover:bg-[var(--color-subtle)]"
      >
        <Icon name="plus" size={15} /> Stage
      </button>
    );
  }
  return (
    <div className="mt-7 w-[220px] shrink-0">
      <TextInput autoFocus value={name} placeholder="Name der Stage" onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) { onAdd(name.trim()); setName(""); setOpen(false); }
          if (e.key === "Escape") setOpen(false);
        }}
        onBlur={() => { if (name.trim()) onAdd(name.trim()); setName(""); setOpen(false); }} />
    </div>
  );
}

export function PipelineBoard({
  stages,
  leads,
  onOpenLead,
  onAddStage,
  onRenameStage,
  onDeleteStage,
}: {
  stages: PipelineStage[];
  leads: Lead[];
  onOpenLead: (l: Lead) => void;
  onAddStage: (name: string) => void;
  onRenameStage: (id: string, name: string) => void;
  onDeleteStage: (id: string) => void;
}) {
  const byStage = useMemo(() => {
    const m = new Map<string, Lead[]>();
    stages.forEach((s) => m.set(s.id, []));
    for (const l of leads) if (l.stageId && m.has(l.stageId)) m.get(l.stageId)!.push(l);
    return m;
  }, [stages, leads]);

  return (
    <div className="group/board scroll-slim flex h-full gap-4 overflow-x-auto pb-3">
      {stages.map((stage) => (
        <Column key={stage.id} stage={stage} leads={byStage.get(stage.id) ?? []}
          onOpenLead={onOpenLead} onRename={onRenameStage} onDelete={onDeleteStage} />
      ))}
      <AddStage onAdd={onAddStage} />
    </div>
  );
}
