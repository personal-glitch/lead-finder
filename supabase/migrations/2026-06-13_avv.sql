-- AVV-Zustimmungen (Auftragsverarbeitungsvertrag) je Kundenkonto.
create table if not exists public.avv_acceptances (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  version text not null default '1.0',
  name text,
  company text
);
alter table public.avv_acceptances enable row level security;
