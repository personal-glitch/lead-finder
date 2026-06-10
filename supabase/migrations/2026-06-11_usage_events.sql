-- Nutzungs-Statistik für den Superadmin: Suchen & aktive Nutzer.
-- In Supabase → SQL Editor ausführen.

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  type text not null,                 -- 'search' | 'visit'
  created_at timestamptz not null default now()
);

create index if not exists usage_events_created_idx on public.usage_events (created_at);
create index if not exists usage_events_type_created_idx on public.usage_events (type, created_at);

-- Wird nur serverseitig über die Service-Role beschrieben/gelesen; RLS an lassen,
-- damit normale Clients keinen Zugriff haben.
alter table public.usage_events enable row level security;
