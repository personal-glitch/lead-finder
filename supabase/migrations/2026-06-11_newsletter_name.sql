-- Optionaler Vorname je Abonnent (für Personalisierung {{Vorname}}).
alter table public.newsletter_subscribers add column if not exists name text;
