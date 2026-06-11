-- Versendete Newsletter-Kampagnen (Historie/Tracking für den Superadmin).
create table if not exists public.newsletter_campaigns (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  body        text not null,
  recipients  integer not null default 0,   -- bestätigte Empfänger zum Sendezeitpunkt
  sent        integer not null default 0,    -- erfolgreich versendet
  failed      integer not null default 0,    -- fehlgeschlagen
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);

alter table public.newsletter_campaigns enable row level security;
-- Bewusst KEINE Policy: nur der Service-Role-Key (Server) darf lesen/schreiben.
