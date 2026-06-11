-- Superadmin: Markierung „Kunde kontaktiert" (z. B. nach WhatsApp-Nachricht).
alter table public.settings add column if not exists admin_contacted_at timestamptz;
