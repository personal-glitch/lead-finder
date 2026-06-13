"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { personaOf, type Persona } from "@/lib/personas";

// Lädt die Persona des Kontos (workspace_type) für die persona-adaptive Oberfläche.
export function usePersona(): { persona: Persona | null; loading: boolean } {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ settings: { workspaceType: string | null } }>("/api/settings");
        setPersona(personaOf(r.settings.workspaceType));
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);
  return { persona, loading };
}
