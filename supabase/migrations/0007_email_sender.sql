-- Eigener E-Mail-Versand pro Nutzer (SMTP). Passwort wird verschlüsselt gespeichert.
alter table settings add column if not exists sender_name   text;
alter table settings add column if not exists sender_email  text;
alter table settings add column if not exists smtp_host      text;
alter table settings add column if not exists smtp_port      integer;
alter table settings add column if not exists smtp_user      text;
alter table settings add column if not exists smtp_pass      text;
