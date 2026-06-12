-- Merker: Erinnerung „Test läuft bald aus" wurde bereits versendet (kein Doppelversand).
alter table public.settings add column if not exists trial_reminder_sent_at timestamptz;
