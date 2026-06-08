"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmailTemplate, Lead, PipelineStage } from "@/lib/types";
import { api } from "@/lib/client";

/**
 * Gemeinsame Lead-Logik für Seiten, die den Lead-Detail-Drawer nutzen
 * (Unternehmen, Kontakte). Lädt Leads/Stages/Vorlagen und kapselt die Mutationen.
 */
export function useLeadWorkspace() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [l, s, t] = await Promise.all([
        api<{ leads: Lead[] }>("/api/leads"),
        api<{ stages: PipelineStage[] }>("/api/stages"),
        api<{ templates: EmailTemplate[] }>("/api/templates"),
      ]);
      setLeads(l.leads);
      setStages(s.stages);
      setTemplates(t.templates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsert = useCallback((lead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
  }, []);

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    try {
      const { lead } = await api<{ lead: Lead }>(`/api/leads/${id}`, { method: "PATCH", json: patch });
      upsert(lead);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
    }
  }, [upsert]);

  const enrichLead = useCallback(async (lead: Lead) => {
    try {
      const { lead: u } = await api<{ lead: Lead | null }>("/api/leads/enrich", { json: { id: lead.id } });
      if (u) upsert(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Anreicherung fehlgeschlagen.");
    }
  }, [upsert]);

  const deleteLead = useCallback(async (lead: Lead) => {
    setSelectedLeadId(null);
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    try {
      await api(`/api/leads/${lead.id}`, { method: "DELETE" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen.");
    }
  }, []);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  return {
    leads, stages, templates, loading, error, setError,
    selectedLead, selectedLeadId, openLead: setSelectedLeadId,
    closeLead: () => setSelectedLeadId(null),
    reload, upsert, updateLead, enrichLead, deleteLead, setLeads,
  };
}
