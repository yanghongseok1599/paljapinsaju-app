-- ============================================================
-- 팔자핀사주 — 전체 데이터베이스 설계도 (처음부터 만들기)
--
-- 이 파일 하나만 새 Supabase 프로젝트의 SQL Editor에 붙여넣으면
-- 앱이 쓰는 표(테이블)가 전부 만들어진다.
--
-- 왜 필요한가:
--   기존 마이그레이션들은 표를 "만들지" 않고 "고치기만" 했다(ALTER).
--   즉 표가 이미 있다고 전제했기 때문에, 새 프로젝트에서는
--   사주 입력부터 실패했다. 이 파일이 그 빈 자리를 채운다.
--
-- 파일 이름을 20260101(가장 이른 날짜)로 둔 이유:
--   마이그레이션은 이름 순서대로 실행된다. 기존 파일들(20260514~)보다
--   먼저 돌아야 그 파일들의 ALTER가 성공한다.
--
-- 실행 순서: 이 파일 → 20260514_* → 20260524_*
-- 이미 운영 중인 프로젝트에 돌려도 안전하다 (if not exists 사용).
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. users — 가입자 추가 정보
--    로그인 계정 자체는 Supabase가 auth.users에 관리한다.
--    여기에는 "어디서 유입됐는지" 같은 마케팅 정보만 둔다.
-- ─────────────────────────────────────────────
create table if not exists users (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  -- 처음 들어올 때의 유입 경로 (첫 방문 기준, 나중에 덮어쓰지 않는다)
  first_utm_source   text,
  first_utm_medium   text,
  first_utm_campaign text,
  first_referrer     text,
  signup_country     text,
  signup_device      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 가입하면 users 행을 자동으로 만들어 준다.
-- 이게 없으면 가입 직후 유입 정보 저장이 조용히 실패한다.
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────
-- 2. saju_readings — 사주 분석 (앱의 핵심 표)
-- ─────────────────────────────────────────────
create table if not exists saju_readings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,

  -- 입력받은 생년월일시
  name            text not null,
  gender          text not null check (gender in ('male', 'female')),
  birth_year      int  not null,
  birth_month     int  not null,
  birth_day       int  not null,
  birth_hour      int,            -- null = 시간 모름
  birth_minute    int  not null default 0,
  is_lunar        boolean not null default false,
  is_leap_month   boolean not null default false,
  birth_city      text,
  birth_longitude numeric,

  -- 고민 분류 (love, career, wealth, health, relationship, other)
  concerns        text[] not null default '{}',

  -- 계산·분석 결과
  four_pillars    jsonb,          -- 만세력 사주팔자
  five_elements   jsonb,          -- 오행 분포
  preview_summary text,
  full_analysis   jsonb,          -- AI 종합 분석

  -- 결제·진행 상태
  status          text not null default 'pending'
                  check (status in ('pending','preview','paid','generating','completed','failed')),
  paddle_transaction_id text,     -- 과거 결제 연동 잔재 (현재 미사용)
  pdf_url         text,

  -- 상담 관련
  title           text,           -- AI가 만든 대화 제목
  character_id    text not null default 'charon_m',
  chat_credits    int  not null default 3,
  chat_used       int  not null default 0,   -- ⚠️ 횟수(정수)이지 참/거짓이 아니다

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists saju_readings_user_id_idx    on saju_readings(user_id);
create index if not exists saju_readings_created_at_idx on saju_readings(created_at);

-- ─────────────────────────────────────────────
-- 3. user_stars — 별(상담에 쓰는 재화) 잔액
--    한 사람당 한 줄. atomic_grant_stars 가 user_id로 upsert 하므로
--    user_id에 고유 제약이 반드시 있어야 한다.
-- ─────────────────────────────────────────────
create table if not exists user_stars (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  balance    int not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 4. star_transactions — 별 입출금 내역
--    ⚠️ 두 곳에서 서로 다른 칸으로 기록한다. 둘 다 받아야 한다.
--      - atomic_grant_stars(DB 함수) : source, reference
--      - /api/saju/deduct-stars      : balance_after, type, reading_id
-- ─────────────────────────────────────────────
create table if not exists star_transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        int  not null,            -- 충전은 +, 사용은 -
  balance_after int,
  source        text,                     -- 'purchase' | 'referral' | 'bonus'
  reference     text,                     -- 주문번호 등 외부 참조
  type          text,                     -- 'report' 등 사용처
  reading_id    uuid references saju_readings(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists star_transactions_user_id_idx on star_transactions(user_id);

-- ─────────────────────────────────────────────
-- 5. saju_chat_messages — AI 상담 대화 기록
-- ─────────────────────────────────────────────
create table if not exists saju_chat_messages (
  id           uuid primary key default gen_random_uuid(),
  reading_id   uuid not null references saju_readings(id) on delete cascade,
  role         text not null check (role in ('user','assistant','system')),
  content      text not null,
  character_id text,
  created_at   timestamptz not null default now()
);

create index if not exists saju_chat_messages_reading_id_idx on saju_chat_messages(reading_id);
create index if not exists saju_chat_messages_created_at_idx on saju_chat_messages(created_at);

-- ─────────────────────────────────────────────
-- 6. saju_compatibilities — 궁합 분석 (상대방 정보)
-- ─────────────────────────────────────────────
create table if not exists saju_compatibilities (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  reading_id    uuid not null references saju_readings(id) on delete cascade,

  partner_name          text not null,
  partner_gender        text not null check (partner_gender in ('male','female')),
  partner_birth_year    int  not null,
  partner_birth_month   int  not null,
  partner_birth_day     int  not null,
  partner_birth_hour    int,
  partner_birth_minute  int  not null default 0,
  partner_is_lunar      boolean not null default false,
  partner_is_leap_month boolean not null default false,
  partner_four_pillars  jsonb,
  partner_five_elements jsonb,

  analysis   jsonb,
  status     text not null default 'pending'
             check (status in ('pending','paid','generating','completed','failed')),
  paddle_transaction_id text,
  pdf_url    text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saju_compatibilities_reading_id_idx on saju_compatibilities(reading_id);

-- ─────────────────────────────────────────────
-- 7. referral_codes — 추천인 코드 (사람당 하나)
-- ─────────────────────────────────────────────
create table if not exists referral_codes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  code       text not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 8. referrals — 누가 누구를 데려왔는지
--    한 사람은 한 번만 추천받을 수 있다 (referred_id 고유).
-- ─────────────────────────────────────────────
create table if not exists referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid not null references auth.users(id) on delete cascade,
  referred_id      uuid not null unique references auth.users(id) on delete cascade,
  referral_code_id uuid references referral_codes(id) on delete set null,
  status           text not null default 'pending'
                   check (status in ('pending','completed','cancelled')),
  reward_given     boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists referrals_referrer_id_idx on referrals(referrer_id);

-- ─────────────────────────────────────────────
-- 9. analytics_events — 방문·행동 기록 (관리자 대시보드용)
-- ─────────────────────────────────────────────
create table if not exists analytics_events (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete set null,
  session_id    text,
  event_type    text not null,            -- 'page_view', 'login', 'signup' 등
  properties    jsonb not null default '{}'::jsonb,
  page_path     text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  country_code  text,
  city          text,
  device_type   text,
  browser       text,
  os            text,
  ip_hash       text,                     -- IP 원본은 저장하지 않는다
  created_at    timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on analytics_events(created_at);
create index if not exists analytics_events_event_type_idx  on analytics_events(event_type);

-- ============================================================
-- 접근 권한 (RLS)
--
-- 기본 원칙: 로그인한 사람은 "자기 것만" 보고 고칠 수 있다.
-- 관리자 작업(지급, 통계 집계 등)은 서버가 service_role 키로 처리하며,
-- service_role 은 RLS를 건너뛰므로 별도 정책이 필요 없다.
--
-- 아래 표 중 saju_chat_messages / saju_compatibilities /
-- referrals / referral_codes / star_transactions 의 정책은
-- 20260514_rls_missing_tables.sql 에서 설정한다.
-- ============================================================

alter table users            enable row level security;
alter table saju_readings    enable row level security;
alter table user_stars       enable row level security;
alter table analytics_events enable row level security;

-- users: 본인만
drop policy if exists users_select_own on users;
create policy users_select_own on users
  for select using (auth.uid() = id);

drop policy if exists users_update_own on users;
create policy users_update_own on users
  for update using (auth.uid() = id);

-- saju_readings: 본인 것만 보고 만들고 고친다
drop policy if exists saju_readings_select_own on saju_readings;
create policy saju_readings_select_own on saju_readings
  for select using (auth.uid() = user_id);

drop policy if exists saju_readings_insert_own on saju_readings;
create policy saju_readings_insert_own on saju_readings
  for insert with check (auth.uid() = user_id);

drop policy if exists saju_readings_update_own on saju_readings;
create policy saju_readings_update_own on saju_readings
  for update using (auth.uid() = user_id);

-- user_stars: 잔액은 읽기만. 증감은 서버(DB 함수)만 할 수 있다.
drop policy if exists user_stars_select_own on user_stars;
create policy user_stars_select_own on user_stars
  for select using (auth.uid() = user_id);

-- analytics_events: 일반 사용자는 읽을 수 없다. 기록은 서버가 한다.
-- (정책을 만들지 않으면 service_role 외에는 접근 불가)
