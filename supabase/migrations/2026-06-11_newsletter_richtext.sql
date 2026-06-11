-- Rich-Text/HTML-Newsletter: Kopfbild + Roh-HTML-Modus je Kampagne.
alter table public.newsletter_campaigns add column if not exists image_url text;
alter table public.newsletter_campaigns add column if not exists raw_html boolean not null default false;
