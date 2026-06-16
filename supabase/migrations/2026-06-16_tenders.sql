-- Öffentliche Ausschreibungen aus dem Datenservice Öffentlicher Einkauf (CC0).

create table if not exists public.tenders (
  notice_id text primary key,
  title text not null,
  description text,
  category text not null,
  cpv text,
  buyer text,
  ort text,
  plz text,
  contact_email text,
  url text,
  published_date timestamptz,
  deadline timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tenders_category_idx on public.tenders (category);
create index if not exists tenders_published_idx on public.tenders (published_date desc);
create index if not exists tenders_deadline_idx on public.tenders (deadline);

-- Protokoll der bereits importierten Tage (für idempotentes Lazy-Backfill).
create table if not exists public.tender_imports (
  day text primary key,
  imported_at timestamptz not null default now(),
  count integer not null default 0
);
