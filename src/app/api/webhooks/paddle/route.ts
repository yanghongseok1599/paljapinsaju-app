// Paddle webhook disabled — migration to Toss Payments in progress.
// The original implementation had two security issues:
//   C2: No idempotency check (webhook events could be replayed to duplicate star grants)
//   C3: String equality (===) used for HMAC comparison instead of crypto.timingSafeEqual
// These are NOT fixed here because Paddle is being decommissioned.
// See src/app/api/webhooks/_TOSS_SECURITY_REQUIREMENTS.md for requirements
// that must be implemented in the Toss Payments webhook handler.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Paddle disabled - migration to Toss in progress" },
    { status: 410 }
  );
}
