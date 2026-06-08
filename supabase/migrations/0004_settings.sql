-- In-App-Einstellungen pro Nutzer (überschreiben Env-Defaults).
create table if not exists settings (
  owner_id         uuid primary key,
  call_goal        integer,
  sender_impressum text,
  updated_at       timestamptz not null default now()
);

alter table settings enable row level security;

create policy settings_owner_all on settings
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
