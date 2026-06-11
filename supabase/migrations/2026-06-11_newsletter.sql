-- Newsletter-Abonnenten mit Double-Opt-In (DSGVO/§7 UWG).
-- Zugriff ausschließlich über die Service-Role (Admin-Client); kein RLS-Policy
-- für anon/auth = öffentliche Clients kommen nicht direkt an die Tabelle.

create table if not exists public.newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  email_norm     text not null unique,                 -- lowercase, getrimmt: Dublettenschutz
  status         text not null default 'pending',      -- pending | confirmed | unsubscribed
  token          text not null,                        -- für Bestätigung & Abmeldung
  source         text,                                 -- z. B. "homepage", "blog", "rechner", "dashboard"
  consent_ip     text,                                 -- Nachweis: IP bei Anmeldung
  consent_at     timestamptz not null default now(),   -- Nachweis: Zeitpunkt der Anmeldung
  confirmed_at   timestamptz,                          -- Zeitpunkt der Double-Opt-In-Bestätigung
  unsubscribed_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists newsletter_subscribers_token_idx  on public.newsletter_subscribers (token);
create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (status);

alter table public.newsletter_subscribers enable row level security;
-- Bewusst KEINE Policy: nur der Service-Role-Key (Server) darf lesen/schreiben.
