-- Effektiver monatlicher Abo-Betrag (Cent, nach Rabatt) – für die Superadmin-Tarifanzeige (19 €/49 €).
alter table public.settings add column if not exists subscription_amount integer;
