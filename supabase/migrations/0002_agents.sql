-- Agenten: benannte, wiederverwendbare Lead-Gen-Profile (Avatar = Icon + Farbe).

create table if not exists agents (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null,
  name             text not null,
  description      text,
  icon             text not null default 'box',
  color            text not null default 'slate',
  objekt_typen     text[] not null default '{}',
  keywords         text[] not null default '{}',
  branche          text,
  plz              text not null,
  radius_km        integer not null default 10,
  last_run_at      timestamptz,
  last_match_count integer not null default 0,
  leads_created    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists agents_owner_idx on agents (owner_id, created_at desc);

create trigger agents_set_updated_at
  before update on agents
  for each row execute function set_updated_at();

alter table agents enable row level security;

create policy agents_owner_all on agents
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
