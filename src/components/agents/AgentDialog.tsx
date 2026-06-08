"use client";
import { useEffect, useState } from "react";
import type { Agent, AgentInput } from "@/lib/types";
import { isBrancheKey, type BrancheKey } from "@/lib/leadgen/branchen-catalog";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";
import { TargetPicker } from "./TargetPicker";
import {
  AGENT_COLORS,
  AGENT_ICONS,
  AgentAvatar,
  DEFAULT_COLOR,
  DEFAULT_ICON,
  Icon,
  type IconName,
} from "../icons";
import { Button, Field, Modal, Spinner, TextInput, cx } from "../ui";

export function AgentDialog({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Agent | null;
  onSubmit: (input: AgentInput) => Promise<void>;
}) {
  const isEdit = Boolean(initial);
  const [icon, setIcon] = useState<IconName>(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [branchen, setBranchen] = useState<Set<BrancheKey>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [plz, setPlz] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIcon((initial?.icon as IconName) ?? DEFAULT_ICON);
    setColor(initial?.color ?? DEFAULT_COLOR);
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setBranchen(new Set((initial?.objektTypen ?? []).filter(isBrancheKey) as BrancheKey[]));
    setKeyword((initial?.keywords ?? []).join(", "));
    setPlz(initial?.plz ?? "");
    setRadiusKm(initial?.radiusKm ?? 10);
  }, [open, initial]);

  const applyTemplate = (t: (typeof AGENT_TEMPLATES)[number]) => {
    setIcon(t.icon);
    setColor(t.color);
    if (!name.trim()) setName(t.label);
    setBranchen(new Set(t.branchen));
  };

  const toggle = (b: BrancheKey) =>
    setBranchen((prev) => {
      const next = new Set(prev);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });

  const keywordList = keyword.split(/[;,\n]/).map((k) => k.trim()).filter(Boolean);
  const valid = name.trim() && plz.trim() && (branchen.size > 0 || keywordList.length > 0);

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        icon,
        color,
        objektTypen: [...branchen], // Ziel-Branchen aus dem Katalog
        keywords: keywordList, // freie Stichwörter (Joker)
        branche: null,
        plz: plz.trim(),
        radiusKm,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Agent bearbeiten" : "Neuer Agent"}
      subtitle="Ein Agent findet passende Firmen deiner Zielbranchen im Umkreis – jederzeit per Klick."
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={submit} disabled={!valid || saving}>
            {saving ? <><Spinner /> …</> : isEdit ? "Speichern" : "Agent anlegen"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {!isEdit && (
          <div className="space-y-2.5">
            <div className="eyebrow">Für wen bist du? – Vorlage wählen (Zielkunden vorausgewählt)</div>
            {[...new Set(AGENT_TEMPLATES.map((t) => t.group))].map((g) => (
              <div key={g}>
                <div className="mb-1 text-[11px] text-[var(--color-muted)]">{g}</div>
                <div className="flex flex-wrap gap-2">
                  {AGENT_TEMPLATES.filter((t) => t.group === g).map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] py-1 pl-1 pr-3 text-sm hover:bg-[var(--color-subtle)]"
                    >
                      <AgentAvatar icon={t.icon} color={t.color} size={22} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Avatar */}
        <div className="flex gap-5">
          <div className="flex flex-col items-center gap-2">
            <AgentAvatar icon={icon} color={color} size={56} />
            <span className="eyebrow">Avatar</span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {AGENT_ICONS.map((i) => (
                <button
                  key={i.key}
                  title={i.label}
                  onClick={() => setIcon(i.key)}
                  className={cx(
                    "grid h-8 w-8 place-items-center rounded-lg border text-[var(--color-ink-2)] transition-colors",
                    icon === i.key ? "border-[var(--color-brand)] bg-[var(--color-brand-tint)]" : "border-[var(--color-line)] hover:bg-[var(--color-subtle)]",
                  )}
                >
                  <Icon name={i.key} size={17} />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AGENT_COLORS.map((c) => (
                <button
                  key={c.key}
                  title={c.label}
                  onClick={() => setColor(c.key)}
                  className={cx(
                    "h-7 w-7 rounded-full ring-2 ring-offset-2 transition",
                    color === c.key ? "ring-[var(--color-brand)]" : "ring-transparent",
                  )}
                  style={{ background: c.fg }}
                />
              ))}
            </div>
          </div>
        </div>

        <Field label="Name" required>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Praxen Köln" />
        </Field>

        <Field label="Beschreibung" hint="Optional – wofür ist dieser Agent zuständig?">
          <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div>
          <span className="eyebrow mb-1.5 block">
            Zielbranchen <span className="text-[var(--color-danger)]">*</span>
          </span>
          <p className="mb-2 text-xs text-[var(--color-muted)]">
            Wähle die Firmen-Arten, die deine Dienstleistung brauchen – oder nutze ein freies Stichwort.
          </p>
          <TargetPicker
            selected={branchen as Set<string>}
            onToggle={toggle}
            keyword={keyword}
            onKeyword={setKeyword}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="PLZ / Ort" required>
            <TextInput value={plz} onChange={(e) => setPlz(e.target.value)} placeholder="50667" />
          </Field>
          <Field label={`Umkreis · ${radiusKm} km`}>
            <input type="range" min={1} max={30} value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-brand)]" />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
