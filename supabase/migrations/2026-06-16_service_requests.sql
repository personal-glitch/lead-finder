-- Auftragsbörse: öffentliche Dienstleistungs-Anfragen (privat/gewerblich) + Angebote der Tool-Nutzer.

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null,
  title text not null,
  description text not null,
  plz text,
  ort text,
  customer_type text not null default 'privat' check (customer_type in ('privat', 'gewerblich')),
  budget text,
  name text not null,
  email text not null,
  phone text,
  status text not null default 'offen' check (status in ('offen', 'geschlossen')),
  source text not null default 'formular',
  consent_at timestamptz,
  consent_ip text
);

create index if not exists service_requests_status_created_idx on public.service_requests (status, created_at desc);
create index if not exists service_requests_category_idx on public.service_requests (category);

create table if not exists public.service_request_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  owner_id uuid not null,
  message text,
  contact_email text,
  created_at timestamptz not null default now(),
  unique (request_id, owner_id)
);

create index if not exists service_request_offers_owner_idx on public.service_request_offers (owner_id);
create index if not exists service_request_offers_request_idx on public.service_request_offers (request_id);
