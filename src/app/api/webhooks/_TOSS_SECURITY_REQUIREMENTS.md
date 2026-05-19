# Toss Payments Webhook Security Requirements

This file documents the security requirements that MUST be implemented
when building the Toss Payments webhook handler to replace Paddle.

## 1. HMAC Verification — timing-safe comparison

NEVER use string equality (===) for HMAC comparison. Always use:

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

function verifyTossSignature(rawBody: string, headerSignature: string, secret: string): boolean {
  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(headerSignature));
  } catch {
    return false; // length mismatch — treat as invalid
  }
}
```

## 2. Idempotency — deduplicate webhook events

Before processing any event:

1. Look up `webhook_events(provider, event_id)` with a UNIQUE constraint on `(provider, event_id)`.
2. If the row already exists, return 200 immediately — do not process again.
3. Insert the event row INSIDE the same database transaction as the star grant.

Schema:
```sql
create table webhook_events (
  id         uuid primary key default gen_random_uuid(),
  provider   text not null,           -- 'toss'
  event_id   text not null,           -- Toss orderId or eventId
  processed_at timestamptz default now(),
  unique(provider, event_id)
);
```

## 3. Replay window — reject stale events

Toss webhooks include a timestamp. Reject any event where the event timestamp
is older than 5 minutes relative to server time:

```ts
const eventTime = new Date(payload.approvedAt ?? payload.requestedAt);
if (Date.now() - eventTime.getTime() > 5 * 60 * 1000) {
  return NextResponse.json({ error: "Stale event" }, { status: 400 });
}
```

## 4. Server-side order verification

NEVER trust the payment amount or status from the webhook body alone.
Always re-fetch the order from Toss server-side before granting credits:

```ts
const tossOrder = await fetch(
  `https://api.tosspayments.com/v1/payments/orders/${orderId}`,
  {
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64")}`,
    },
  }
).then((r) => r.json());

if (tossOrder.status !== "DONE") {
  return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
}
```

## 5. Atomic star/credit grants

All star grants must use the `atomic_grant_stars` SQL function:

```ts
const { data: newBalance, error } = await supabase.rpc("atomic_grant_stars", {
  p_user_id: userId,
  p_amount: credits,
  p_source: "purchase",
  p_reference: tossOrderId,
});
```

This function does an UPSERT on `user_stars` and inserts into `star_transactions`
in a single atomic operation, preventing race conditions.

See: supabase/migrations/20260514_atomic_star_ops.sql
