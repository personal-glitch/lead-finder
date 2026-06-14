-- Auftragswert + Abschluss-Status je Lead (für Pipeline-Auswertung im Dashboard).
alter table public.leads add column if not exists value numeric;
alter table public.leads add column if not exists status text not null default 'offen';

-- Nur erlaubte Status-Werte zulassen.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check check (status in ('offen', 'gewonnen', 'verloren'));
  end if;
end $$;

create index if not exists leads_owner_status_idx on public.leads (owner_id, status);
