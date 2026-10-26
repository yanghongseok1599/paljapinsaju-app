-- ============================================================
-- 결제·별 상태 잠금 (2026-10-26 출시 점검)
--
-- 고치는 구멍
--  1. 별 함수(atomic_*)가 SECURITY DEFINER 인데 실행 권한을 회수하지 않아,
--     공개 anon 키만으로 누구나 자기 별을 무제한 지급하거나(음수 차감 포함)
--     남의 별을 차감할 수 있었다. → 서버(service_role)만 실행.
--  2. 사주·궁합·타로 표의 쓰기 정책에 칸 제한이 없어, 브라우저에서
--     status='paid' 를 직접 써서 유료 분석을 무료로 받을 수 있었다.
--     → 이용자는 입력 칸만 쓸 수 있고, 결제·결과 칸은 서버만 쓴다.
--  3. user_stars 에 INSERT 정책이 없어 "가입 시 별 3개"가 저장되지 않았다.
--     → 가입 트리거에서 지급한다.
--  4. 별 사용 내역(star_transactions)이 이용자 권한으로 기록되다 막혀 사라졌다.
--     → 차감 함수가 같은 트랜잭션에서 기록한다.
--
-- 실행: SQL Editor 에서 20260524_tarot_readings.sql 다음에 실행한다.
-- 다시 실행해도 된다.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. 별 함수 — 서버 전용, 금액 검증, 사용 내역 기록
-- ─────────────────────────────────────────────

-- 인자가 바뀌므로 예전 함수는 지운다 (남겨두면 같은 이름 호출이 모호해진다).
drop function if exists atomic_deduct_stars(uuid, int);
drop function if exists decrement_star(uuid);

create or replace function atomic_deduct_stars(
  p_user_id    uuid,
  p_amount     int,
  p_type       text default null,
  p_reading_id uuid default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'p_amount must be positive';
  end if;

  update user_stars
  set balance    = balance - p_amount,
      updated_at = now()
  where user_id = p_user_id
    and balance >= p_amount
  returning balance into v_balance;

  if v_balance is not null then
    insert into star_transactions(user_id, amount, balance_after, type, reading_id)
    values (p_user_id, -p_amount, v_balance, p_type, p_reading_id);
  end if;

  return v_balance; -- null = 잔액 부족
end;
$$;

-- 같은 주문번호로 두 번 지급하지 않는다 (결제 확인 + 웹훅이 둘 다 지급하는 경우 대비).
create unique index if not exists star_transactions_purchase_once
  on star_transactions(source, reference)
  where source = 'purchase' and reference is not null;

create or replace function atomic_grant_stars(
  p_user_id   uuid,
  p_amount    int,
  p_source    text,
  p_reference text
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx      uuid;
  v_balance int;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'p_amount must be positive';
  end if;

  insert into star_transactions(user_id, amount, source, reference)
  values (p_user_id, p_amount, p_source, p_reference)
  on conflict do nothing
  returning id into v_tx;

  -- 이미 지급한 주문 → 지급하지 않고 현재 잔액만 돌려준다
  if v_tx is null then
    select balance into v_balance from user_stars where user_id = p_user_id;
    return v_balance;
  end if;

  insert into user_stars(user_id, balance, updated_at)
  values (p_user_id, p_amount, now())
  on conflict (user_id) do update
    set balance    = user_stars.balance + p_amount,
        updated_at = now()
  returning balance into v_balance;

  update star_transactions set balance_after = v_balance where id = v_tx;
  return v_balance;
end;
$$;

revoke execute on function atomic_deduct_stars(uuid, int, text, uuid) from public, anon, authenticated;
revoke execute on function atomic_grant_stars(uuid, int, text, text)  from public, anon, authenticated;
grant  execute on function atomic_deduct_stars(uuid, int, text, uuid) to service_role;
grant  execute on function atomic_grant_stars(uuid, int, text, text)  to service_role;

-- ─────────────────────────────────────────────
-- 2. 가입 시 users 행 + 별 3개
-- ─────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into user_stars (user_id, balance)
  values (new.id, 3)
  on conflict (user_id) do nothing;

  insert into star_transactions (user_id, amount, balance_after, source, reference)
  values (new.id, 3, 3, 'bonus', 'signup');

  return new;
end;
$$;

-- 이 파일 전에 가입한 계정에도 별 3개 (이미 잔액 행이 있으면 건너뛴다 — 다시 실행해도 안전)
with created as (
  insert into user_stars (user_id, balance)
  select id, 3 from auth.users
  on conflict (user_id) do nothing
  returning user_id
)
insert into star_transactions (user_id, amount, balance_after, source, reference)
select user_id, 3, 3, 'bonus', 'signup' from created;

-- ─────────────────────────────────────────────
-- 3. 칸 단위 쓰기 권한 — 이용자는 입력 칸만, 결제·결과 칸은 서버만
--    (RLS 는 "어느 행"을, 칸 권한은 "어느 칸"을 막는다. 둘 다 있어야 한다.)
-- ─────────────────────────────────────────────

-- saju_readings: status·full_analysis·preview_summary·pdf_url·chat_* 는 서버만
revoke insert, update on saju_readings from anon, authenticated;
grant insert (
  user_id, name, gender, birth_year, birth_month, birth_day, birth_hour, birth_minute,
  is_lunar, is_leap_month, birth_city, birth_longitude, concerns,
  four_pillars, five_elements, character_id, title
) on saju_readings to authenticated;
grant update (
  user_id, name, gender, birth_year, birth_month, birth_day, birth_hour, birth_minute,
  is_lunar, is_leap_month, birth_city, birth_longitude, concerns,
  four_pillars, five_elements, character_id, title, updated_at
) on saju_readings to authenticated;

-- saju_compatibilities: 상대방 정보만 넣을 수 있다. status·analysis 는 서버만.
revoke insert, update on saju_compatibilities from anon, authenticated;
grant insert (
  reading_id, partner_name, partner_gender, partner_birth_year, partner_birth_month,
  partner_birth_day, partner_birth_hour, partner_birth_minute, partner_is_lunar,
  partner_is_leap_month, partner_four_pillars, partner_five_elements
) on saju_compatibilities to authenticated;

-- tarot_readings: 생성·해석 저장은 별 차감과 함께 서버가 한다.
revoke insert, update on tarot_readings from anon, authenticated;

-- 별 잔액·내역·결제 기록: 이용자는 읽기만 (webhook_events 는 읽기도 불가)
revoke insert, update, delete on user_stars        from anon, authenticated;
revoke insert, update, delete on star_transactions from anon, authenticated;
revoke all                    on webhook_events    from anon, authenticated;

-- ─────────────────────────────────────────────
-- 4. 삭제 — 이용자가 자기 분석과 대화를 지울 수 있게
--    DELETE 정책이 없어 사이드바의 "기록 삭제"와 사주 정보 수정 시 "이전 대화 지우기"가
--    0행 삭제로 조용히 실패했다 (화면엔 지워진 것처럼 보이고 새로고침하면 돌아왔다).
--    별 사용 내역은 reading_id 가 null 로 바뀌어 남는다 (on delete set null).
-- ─────────────────────────────────────────────
drop policy if exists saju_readings_delete_own on saju_readings;
create policy saju_readings_delete_own on saju_readings
  for delete using (auth.uid() = user_id);

drop policy if exists "users delete own chat messages" on saju_chat_messages;
create policy "users delete own chat messages" on saju_chat_messages
  for delete using (
    auth.uid() = (
      select user_id from saju_readings where id = saju_chat_messages.reading_id
    )
  );
