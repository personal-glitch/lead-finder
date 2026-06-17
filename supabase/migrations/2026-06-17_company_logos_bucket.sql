-- Öffentlicher Storage-Bucket für Firmen-Logos.
-- Public = true → Logos sind per öffentlicher URL lesbar (Anzeige im Katalog).
-- Uploads laufen serverseitig über den Service-Role-Client (umgeht RLS).
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;
