-- Abrechnung (Stripe): Kundenzuordnung + Abo-Status pro Nutzer.
alter table settings add column if not exists stripe_customer_id  text;
alter table settings add column if not exists subscription_status  text;
