#!/usr/bin/env bash
# 마이그레이션 전체를 임시 Postgres 에 올려 결제·별 권한이 막혔는지 확인한다. 운영 DB 는 건드리지 않는다.
# 실행: bash supabase/tests/lock-paid-state.sh   (Homebrew postgresql 필요)
#
# Supabase 의 기본 권한(모든 표·함수를 anon/authenticated 에 열어둠)을 흉내 낸 뒤
# 브라우저가 anon 키로 할 수 있는 일을 authenticated 역할로 직접 시도한다.
set -euo pipefail
export LC_ALL=C LANG=C   # 한국어 로케일에서 postmaster 가 기동하지 못한다
DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"; PORT=55441
trap 'pg_ctl -D "$TMP/data" stop -m fast >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT
initdb -D "$TMP/data" -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
pg_ctl -D "$TMP/data" -o "-p $PORT -c listen_addresses=localhost -c unix_socket_directories=''" -l "$TMP/log" start >/dev/null
sleep 2
export PGOPTIONS='-c client_min_messages=warning'
q() { psql -h localhost -p $PORT -U postgres -d postgres -v ON_ERROR_STOP=1 -q -t -A "$@"; }

q <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema public, auth to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
-- 마이그레이션 전에 가입한 계정 (보충 지급 확인용)
insert into auth.users (id, email) values ('99999999-9999-9999-9999-999999999999', 'old@example.com');
SQL

for f in 20260101000000_init_schema 20260514_atomic_star_ops 20260514_rls_missing_tables \
         20260514_webhook_events 20260524_tarot_readings 20261026000000_lock_paid_state; do
  q -f "$DIR/migrations/$f.sql" >/dev/null
done
# README 대로 다시 실행해도 깨지지 않아야 한다
q -f "$DIR/migrations/20261026000000_lock_paid_state.sql" >/dev/null

q <<'SQL' | tee "$TMP/out"
\set a '''11111111-1111-1111-1111-111111111111'''
\set b '''22222222-2222-2222-2222-222222222222'''
insert into auth.users (id, email) values (:a, 'a@example.com'), (:b, 'b@example.com');

create function pg_temp.denied(sql text, label text) returns text language plpgsql as $$
begin execute sql; return 'FAIL ' || label || ' (허용됨)';
exception when others then return 'ok   ' || label; end $$;
create function pg_temp.allowed(sql text, label text) returns text language plpgsql as $$
begin execute sql; return 'ok   ' || label;
exception when others then return 'FAIL ' || label || ' (' || sqlerrm || ')'; end $$;
create function pg_temp.check(cond boolean, label text) returns text language sql as
  $$ select case when cond then 'ok   ' else 'FAIL ' end || label $$;

-- 가입 보너스
select pg_temp.check((select balance from user_stars where user_id = :a) = 3, '가입하면 별 3개');
select pg_temp.check((select count(*) from star_transactions where user_id = :a and source = 'bonus') = 1, '가입 보너스 내역 기록');
select pg_temp.check((select balance from user_stars where user_id = '99999999-9999-9999-9999-999999999999') = 3, '기존 계정 보충 지급');
select pg_temp.check((select count(*) from star_transactions where user_id = '99999999-9999-9999-9999-999999999999') = 1, '다시 실행해도 보충 지급 1번');

-- 서버가 만든 사주 (A 소유)
insert into saju_readings (id, user_id, name, gender, birth_year, birth_month, birth_day)
values ('aaaaaaaa-0000-0000-0000-000000000001', :a, 'A', 'male', 1990, 1, 1);

-- ── 여기부터 브라우저(anon 키 + A 로그인)가 할 수 있는 일 ──
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

select pg_temp.denied($$select atomic_grant_stars('11111111-1111-1111-1111-111111111111', 100000, 'purchase', 'x')$$, '별 무제한 지급 차단');
select pg_temp.denied($$select atomic_deduct_stars('11111111-1111-1111-1111-111111111111', -100000)$$, '음수 차감(지급) 차단');
select pg_temp.denied($$select atomic_deduct_stars('22222222-2222-2222-2222-222222222222', 3)$$, '남의 별 차감 차단');
select pg_temp.denied($$update user_stars set balance = 99999 where user_id = auth.uid()$$, '잔액 직접 수정 차단');
select pg_temp.denied($$insert into user_stars (user_id, balance) values (auth.uid(), 99999) on conflict do nothing$$, '잔액 직접 생성 차단');
select pg_temp.denied($$insert into star_transactions (user_id, amount, source) values (auth.uid(), 100, 'purchase')$$, '가짜 충전 내역 차단');

select pg_temp.denied($$update saju_readings set status = 'paid' where id = 'aaaaaaaa-0000-0000-0000-000000000001'$$, '사주 결제됨 직접 표시 차단');
select pg_temp.denied($$update saju_readings set full_analysis = '{}' where id = 'aaaaaaaa-0000-0000-0000-000000000001'$$, '분석 결과 직접 쓰기 차단');
select pg_temp.denied($$insert into saju_readings (user_id, name, gender, birth_year, birth_month, birth_day, status)
                        values (auth.uid(), 'x', 'male', 1990, 1, 1, 'paid')$$, '결제됨 상태로 사주 생성 차단');
select pg_temp.allowed($$insert into saju_readings (user_id, name, gender, birth_year, birth_month, birth_day, concerns)
                        values (auth.uid(), 'x', 'male', 1990, 1, 1, '{love}')$$, '정상 사주 생성은 허용');
select pg_temp.check((select status from saju_readings where name = 'x') = 'pending', '새 사주는 pending');
select pg_temp.allowed($$update saju_readings set title = '제목', birth_city = 'Seoul', character_id = 'doctor'
                        where id = 'aaaaaaaa-0000-0000-0000-000000000001'$$, '제목·도시·캐릭터 수정은 허용');

select pg_temp.denied($$insert into saju_compatibilities (reading_id, partner_name, partner_gender, partner_birth_year,
                        partner_birth_month, partner_birth_day, status)
                        values ('aaaaaaaa-0000-0000-0000-000000000001', 'B', 'female', 1991, 2, 2, 'paid')$$, '결제됨 궁합 생성 차단');
select pg_temp.allowed($$insert into saju_compatibilities (reading_id, partner_name, partner_gender, partner_birth_year,
                        partner_birth_month, partner_birth_day)
                        values ('aaaaaaaa-0000-0000-0000-000000000001', 'B', 'female', 1991, 2, 2)$$, '정상 궁합 생성은 허용');

select pg_temp.denied($$insert into tarot_readings (user_id, character_id, spread_type, drawn_cards)
                        values (auth.uid(), 'luna', 'one', '[]')$$, '타로 무료 생성 차단');
select pg_temp.denied($$select * from webhook_events$$, '결제 기록 조회 차단');

-- 삭제: 본인 것만 실제로 지워진다 (정책이 없으면 0행 삭제로 조용히 실패한다)
reset role;
insert into saju_readings (id, user_id, name, gender, birth_year, birth_month, birth_day)
values ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'B', 'female', 1991, 2, 2);
insert into saju_chat_messages (reading_id, role, content)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'user', 'hi'),
       ('bbbbbbbb-0000-0000-0000-000000000002', 'user', 'hi');
set role authenticated;
delete from saju_chat_messages where reading_id in ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002');
delete from saju_readings where name = 'x';
delete from saju_readings where id = 'bbbbbbbb-0000-0000-0000-000000000002';
reset role;
select pg_temp.check((select count(*) from saju_readings where name = 'x') = 0, '본인 사주 삭제됨');
select pg_temp.check((select count(*) from saju_chat_messages where reading_id = 'aaaaaaaa-0000-0000-0000-000000000001') = 0, '본인 대화 삭제됨');
select pg_temp.check((select count(*) from saju_readings where id = 'bbbbbbbb-0000-0000-0000-000000000002') = 1, '남의 사주는 안 지워짐');
select pg_temp.check((select count(*) from saju_chat_messages where reading_id = 'bbbbbbbb-0000-0000-0000-000000000002') = 1, '남의 대화는 안 지워짐');

-- ── 서버(service_role) ──
reset role;
set role service_role;
select pg_temp.check(atomic_deduct_stars('11111111-1111-1111-1111-111111111111', 2, 'chat', null) = 1, '서버 차감 3→1');
select pg_temp.check(atomic_deduct_stars('11111111-1111-1111-1111-111111111111', 2, 'chat', null) is null, '잔액 부족이면 null');
select pg_temp.check((select count(*) from star_transactions where user_id = '11111111-1111-1111-1111-111111111111' and amount < 0) = 1, '사용 내역은 성공한 차감만 기록');
select pg_temp.denied($$select atomic_deduct_stars('11111111-1111-1111-1111-111111111111', -5)$$, '서버도 음수 차감 거부');
select pg_temp.check(atomic_grant_stars('11111111-1111-1111-1111-111111111111', 30, 'purchase', 'order-1') = 31, '구매 지급 1→31');
select pg_temp.check(atomic_grant_stars('11111111-1111-1111-1111-111111111111', 30, 'purchase', 'order-1') = 31, '같은 주문 재지급 안 함');
select pg_temp.check(atomic_grant_stars('11111111-1111-1111-1111-111111111111', 2, 'refund', 'r-1') = 33, '환불 지급은 허용');
select pg_temp.allowed($$update saju_readings set status = 'paid' where id = 'aaaaaaaa-0000-0000-0000-000000000001'$$, '서버는 결제 상태 변경 가능');
select pg_temp.allowed($$insert into tarot_readings (user_id, character_id, spread_type, drawn_cards, star_cost)
                        values ('11111111-1111-1111-1111-111111111111', 'luna', 'one', '[]', 1)$$, '서버는 타로 생성 가능');
SQL

if grep -q '^FAIL' "$TMP/out"; then echo; echo "실패한 항목이 있습니다"; exit 1; fi
echo; echo "전부 통과"
