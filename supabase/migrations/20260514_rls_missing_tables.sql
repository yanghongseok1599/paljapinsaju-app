-- RLS policies for 5 tables that lacked row-level security.
-- Run this in the Supabase SQL Editor (project: drsaju / 팔자핀사주).
--
-- Column names verified against src/ code references:
--   saju_chat_messages : reading_id (no direct user_id; user resolved via saju_readings)
--   saju_compatibilities: reading_id (from compatibility/route.ts; canonical name — see note below)
--   star_transactions  : user_id
--   referral_codes     : user_id (issuer)
--   referrals          : referrer_id, referred_id
--
-- NOTE on table name discrepancy:
--   src/app/api/saju/compatibility/route.ts uses "saju_compatibilities"
--   src/app/api/saju/chat/route.ts and src/services/saju/actions.ts use "saju_compatibility"
--   Confirm the actual live table name in Supabase and align the code.
--   This migration uses "saju_compatibilities" (matches the AI route handlers).
--   If the live table is "saju_compatibility", update all references accordingly.

-- -----------------------------------------------------------------------
-- saju_chat_messages
-- -----------------------------------------------------------------------
alter table saju_chat_messages enable row level security;

create policy "users read own chat messages" on saju_chat_messages
  for select using (
    auth.uid() = (
      select user_id from saju_readings where id = saju_chat_messages.reading_id
    )
  );

create policy "users insert own chat messages" on saju_chat_messages
  for insert with check (
    auth.uid() = (
      select user_id from saju_readings where id = saju_chat_messages.reading_id
    )
  );

-- -----------------------------------------------------------------------
-- saju_compatibilities
-- Adjust table name below if live table is "saju_compatibility"
-- -----------------------------------------------------------------------
alter table saju_compatibilities enable row level security;

create policy "users read own compat" on saju_compatibilities
  for select using (
    auth.uid() = (
      select user_id from saju_readings where id = saju_compatibilities.reading_id
    )
  );

create policy "users insert own compat" on saju_compatibilities
  for insert with check (
    auth.uid() = (
      select user_id from saju_readings where id = saju_compatibilities.reading_id
    )
  );

-- -----------------------------------------------------------------------
-- star_transactions
-- Inserts happen only via service-role functions; no client insert policy.
-- -----------------------------------------------------------------------
alter table star_transactions enable row level security;

create policy "users read own star transactions" on star_transactions
  for select using (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- referral_codes
-- Column is user_id (not issuer_user_id — verified in src/services/referral/actions.ts)
-- -----------------------------------------------------------------------
alter table referral_codes enable row level security;

create policy "users read own referral codes" on referral_codes
  for select using (auth.uid() = user_id);

create policy "users insert own referral codes" on referral_codes
  for insert with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- referrals
-- Columns: referrer_id (issuer), referred_id (receiver)
-- -----------------------------------------------------------------------
alter table referrals enable row level security;

create policy "users read own referrals" on referrals
  for select using (
    auth.uid() = referrer_id or auth.uid() = referred_id
  );

-- Inserts done via server-side server action (processReferral) which runs
-- with the anon key but as the authenticated user. Allow insert only when
-- referred_id matches the authenticated user.
create policy "users insert own referrals" on referrals
  for insert with check (auth.uid() = referred_id);
