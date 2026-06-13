-- Tägliche Stellen-Alerts (Persona Personalvermittlung)
create table if not exists public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  email text not null,
  was text,
  wo text,
  umkreis int not null default 25,
  only_direct boolean not null default true,
  seen_refnrs jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists job_alerts_owner_idx on public.job_alerts(owner_id);
create index if not exists job_alerts_active_idx on public.job_alerts(active);
