-- Nächste Fälligkeit + Kündigungsstatus aus Stripe (für Anzeige im Tool).
alter table settings add column if not exists subscription_renews_at timestamptz;
alter table settings add column if not exists cancel_at_period_end   boolean;
