-- Atomic star operations for race-condition-free balance management.
-- Run this in the Supabase SQL Editor (project: drsaju / 팔자핀사주).
-- These functions run as SECURITY DEFINER to bypass RLS where needed.

-- -----------------------------------------------------------------------
-- atomic_deduct_stars: deducts p_amount from user balance in one UPDATE.
-- Returns the new balance, or NULL if balance was insufficient.
-- Callers must treat NULL return as 402 Insufficient Balance.
-- -----------------------------------------------------------------------
create or replace function atomic_deduct_stars(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
as $$
declare
  v_balance int;
begin
  update user_stars
  set balance    = balance - p_amount,
      updated_at = now()
  where user_id = p_user_id
    and balance >= p_amount
  returning balance into v_balance;

  return v_balance; -- null if row not found or insufficient balance
end;
$$;

-- -----------------------------------------------------------------------
-- atomic_grant_stars: upserts user_stars and appends a star_transactions row.
-- Returns the new balance.
-- p_source: e.g. 'purchase', 'referral', 'bonus'
-- p_reference: external reference (transaction id, referral code id, etc.)
-- -----------------------------------------------------------------------
create or replace function atomic_grant_stars(
  p_user_id  uuid,
  p_amount   int,
  p_source   text,
  p_reference text
)
returns int
language plpgsql
security definer
as $$
declare
  v_balance int;
begin
  insert into user_stars(user_id, balance, updated_at)
  values (p_user_id, p_amount, now())
  on conflict (user_id) do update
    set balance    = user_stars.balance + p_amount,
        updated_at = now()
  returning balance into v_balance;

  insert into star_transactions(user_id, amount, source, reference, created_at)
  values (p_user_id, p_amount, p_source, p_reference, now());

  return v_balance;
end;
$$;

-- -----------------------------------------------------------------------
-- decrement_star: decrements balance by 1 for chat usage.
-- This is the RPC called by src/app/api/saju/chat/route.ts.
-- Uses the same atomic pattern as atomic_deduct_stars.
-- -----------------------------------------------------------------------
create or replace function decrement_star(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update user_stars
  set balance    = greatest(balance - 1, 0),
      updated_at = now()
  where user_id = p_user_id;
end;
$$;
