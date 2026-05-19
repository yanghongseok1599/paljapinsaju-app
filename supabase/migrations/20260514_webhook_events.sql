-- Idempotency table for webhook deduplication.
-- Prevents replay attacks and duplicate star grants from retried webhooks.
-- Primary key on (provider, event_id) enforces exactly-once processing.

create table if not exists webhook_events (
  provider     text        not null,
  event_id     text        not null,
  received_at  timestamptz not null default now(),
  primary key (provider, event_id)
);

-- No user-accessible policies — only service role writes via API routes.
alter table webhook_events enable row level security;
