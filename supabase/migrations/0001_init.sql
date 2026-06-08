-- Lead-Finder – Initiales Schema (Supabase / Postgres)
--
-- Multi-Tenant über owner_id + Row Level Security: jeder Nutzer sieht nur seine
-- eigenen Daten. owner_id ist bewusst KEIN FK auf auth.users, damit das Skelett
-- auch mit Service-Role + Platzhalter-Owner läuft; mit echter Auth sollte
-- owner_id = auth.uid() gesetzt werden (ein FK auf auth.users ist dann sinnvoll).

create extension if not exists pgcrypto;

-- ── updated_at automatisch pflegen ──────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Pipeline-Stages ─────────────────────────────────────────────────────────
create table if not exists pipeline_stages (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null,
  name       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists pipeline_stages_owner_idx on pipeline_stages (owner_id, position);

-- ── Leads ─────────────────────────────────────────────────────────────────--
create table if not exists leads (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null,
  name              text,
  objekt_typ        text,
  strasse           text,
  plz               text,
  ort               text,
  lat               double precision,
  lon               double precision,
  phone             text,
  phone_e164        text,
  email             text,
  ansprechpartner   text,
  website           text,
  opening_hours     text,
  -- Herkunft für Auskunfts-/Löschanfragen (DSGVO).
  source            text not null default 'osm'
                      check (source in ('osm', 'impressum', 'manual')),
  enrichment_source text check (enrichment_source in ('impressum')),
  enriched_at       timestamptz,
  osm_id            text,
  notes             text,
  -- Dedupe-Schlüssel (Website bzw. Name+Adresse) – verhindert Duplikate.
  dedupe_key        text,
  stage_id          uuid references pipeline_stages (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists leads_owner_idx on leads (owner_id, created_at desc);
create index if not exists leads_owner_stage_idx on leads (owner_id, stage_id);
-- Pro Owner darf ein Dedupe-Schlüssel nur einmal vorkommen.
create unique index if not exists leads_owner_dedupe_uniq
  on leads (owner_id, dedupe_key) where dedupe_key is not null;

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- ── E-Mail-Vorlagen ──────────────────────────────────────────────────────-─
create table if not exists email_templates (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null,
  name       text not null,
  subject    text not null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists email_templates_owner_idx on email_templates (owner_id);

-- ── E-Mail-Protokoll ─────────────────────────────────────────────────────-─
create table if not exists email_log (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null,
  lead_id     uuid not null references leads (id) on delete cascade,
  template_id uuid references email_templates (id) on delete set null,
  to_email    text,
  subject     text,
  status      text not null
                check (status in ('queued', 'sent', 'failed', 'suppressed', 'opened')),
  error       text,
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists email_log_owner_lead_idx on email_log (owner_id, lead_id);

-- ── Suppressions (Opt-out / Abmeldungen) ────────────────────────────────────
create table if not exists suppressions (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null,
  email      text not null,
  reason     text,
  created_at timestamptz not null default now(),
  unique (owner_id, email)
);
create index if not exists suppressions_owner_idx on suppressions (owner_id);

-- ── Row Level Security ───────────────────────────────────────────────────-─
-- Policies greifen für Anon-/Auth-Zugriff; der Service-Role-Key umgeht RLS.
alter table pipeline_stages enable row level security;
alter table leads           enable row level security;
alter table email_templates enable row level security;
alter table email_log       enable row level security;
alter table suppressions    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['pipeline_stages','leads','email_templates','email_log','suppressions']
  loop
    execute format($f$
      create policy %1$s_owner_all on %1$s
        for all to authenticated
        using (owner_id = auth.uid())
        with check (owner_id = auth.uid());
    $f$, t);
  end loop;
end $$;
