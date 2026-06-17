-- Kostenloser Firmen-Katalog (Branchenbuch) + Kontaktanfragen ("Kontakt nur über uns").
-- Zugriff ausschließlich über den Service-Role-Client (wie service_requests / Newsletter).

-- 1) Firmen-Einträge ------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  category text not null,
  plz text,
  ort text,
  region text,
  description text,
  website text,
  contact_name text,
  contact_email text not null,   -- privat: NICHT öffentlich anzeigen
  contact_phone text,            -- privat: NICHT öffentlich anzeigen
  logo_url text,
  status text not null default 'pending' check (status in ('pending','active','rejected')),
  source text not null default 'registration',
  consent_at timestamptz,
  consent_ip text
);

create index if not exists companies_status_created_idx on public.companies (status, created_at desc);
create index if not exists companies_category_idx on public.companies (category);
create index if not exists companies_ort_idx on public.companies (ort);

-- 2) Kontaktanfragen an eine Firma (laufen über uns) ---------------------------
create table if not exists public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'neu' check (status in ('neu','weitergeleitet','geschlossen')),
  consent_at timestamptz,
  consent_ip text
);

create index if not exists company_contacts_company_idx on public.company_contacts (company_id, created_at desc);

-- 3) RLS: aktivieren, KEINE öffentlichen Policies. Der Service-Role-Client
--    (Server) umgeht RLS; anonyme Clients haben damit keinen Direktzugriff.
alter table public.companies enable row level security;
alter table public.company_contacts enable row level security;
