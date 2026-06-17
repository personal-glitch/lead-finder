-- Koordinaten für die PLZ/Umkreis-Suche im Katalog.
-- Werden bei der Eintragung aus der PLZ/Ort geocodiert (Nominatim/Photon).
alter table public.companies add column if not exists lat double precision;
alter table public.companies add column if not exists lng double precision;
create index if not exists companies_geo_idx on public.companies (lat, lng);
