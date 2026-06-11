-- Geplanter Versand: Status + Inhalt je Kampagne (zum späteren Rendern).
alter table public.newsletter_campaigns add column if not exists status      text not null default 'sent'; -- sent | scheduled | sending
alter table public.newsletter_campaigns add column if not exists scheduled_for timestamptz;
alter table public.newsletter_campaigns add column if not exists template    text;
alter table public.newsletter_campaigns add column if not exists headline    text;
alter table public.newsletter_campaigns add column if not exists cta_label   text;
alter table public.newsletter_campaigns add column if not exists cta_url     text;

create index if not exists newsletter_campaigns_due_idx
  on public.newsletter_campaigns (status, scheduled_for);
