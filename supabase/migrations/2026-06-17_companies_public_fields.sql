-- Öffentlicher Katalog (11880-Stil): Adresse + Öffnungszeiten ergänzen.
-- Telefon & Website werden im Profil öffentlich angezeigt; E-Mail bleibt privat
-- (Kontakt läuft über das Formular = Lead-Capture).
alter table public.companies add column if not exists street text;
alter table public.companies add column if not exists opening_hours text;
