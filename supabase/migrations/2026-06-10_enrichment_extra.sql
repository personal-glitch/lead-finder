-- Anreicherung v2: mehrere Kontaktwege je Firma (E-Mails, Nummern, Ansprechpartner).
-- In Supabase → SQL Editor ausführen.

-- 1) Am Lead: alle zusätzlichen Kontaktwege als JSON.
alter table public.leads
  add column if not exists enrichment_extra jsonb;

-- 2) Im Anreicherungs-Cache: dieselben Listen mitcachen (spart erneutes Scrapen).
alter table public.enrichment_cache
  add column if not exists extra jsonb;
