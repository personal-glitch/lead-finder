-- Verbindungs-Logik: Aktivitäten (Ereignis-Log) + Aufgaben (Wiedervorlagen).
-- Beide hängen an einer Firma (leads) – die Drehscheibe des Tools.

create table if not exists activities (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null,
  lead_id    uuid references leads (id) on delete cascade,
  type       text not null
               check (type in ('created','enriched','stage_changed','call','email','task','note')),
  summary    text not null,
  meta       jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activities_owner_idx on activities (owner_id, created_at desc);
create index if not exists activities_lead_idx on activities (lead_id, created_at desc);

create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null,
  lead_id    uuid references leads (id) on delete set null,
  title      text not null,
  type       text not null default 'todo' check (type in ('call','email','todo')),
  due_at     timestamptz,
  done       boolean not null default false,
  done_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists tasks_owner_idx on tasks (owner_id, done, due_at);
create index if not exists tasks_lead_idx on tasks (lead_id);

alter table activities enable row level security;
alter table tasks      enable row level security;

create policy activities_owner_all on activities
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy tasks_owner_all on tasks
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
