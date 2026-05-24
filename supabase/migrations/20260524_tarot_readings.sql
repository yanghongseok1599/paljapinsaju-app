-- 타로 리딩 저장 테이블 + RLS
-- Run this in the Supabase SQL Editor (project: drsaju / 팔자핀사주).
--
-- 컬럼:
--   id            : uuid PK
--   user_id       : auth.users(id) FK, RLS 본인 소유
--   character_id  : 'luna_f' 등 캐릭터 ID (CHARACTERS와 일치)
--   spread_type   : 'one' | 'three' | 'celtic'
--   drawn_cards   : jsonb — [{ cardId, reversed, position }]
--   question      : text? — 사용자가 입력한 질문 (선택)
--   interpretation: text? — AI 해석 (스트리밍 완료 후 저장, nullable)
--   star_cost     : int — 실제 차감된 별 수 (환불 추적용)
--   created_at    : timestamptz
--   updated_at    : timestamptz

create table if not exists tarot_readings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  character_id  text not null,
  spread_type   text not null check (spread_type in ('one','three','celtic')),
  drawn_cards   jsonb not null,
  question      text,
  interpretation text,
  star_cost     int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_tarot_readings_user_created
  on tarot_readings(user_id, created_at desc);

-- RLS
alter table tarot_readings enable row level security;

create policy "users read own tarot readings" on tarot_readings
  for select using (auth.uid() = user_id);

create policy "users insert own tarot readings" on tarot_readings
  for insert with check (auth.uid() = user_id);

create policy "users update own tarot readings" on tarot_readings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete own tarot readings" on tarot_readings
  for delete using (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거 (이미 다른 마이그레이션에서 set_updated_at() 함수 있을 수 있음)
create or replace function set_tarot_readings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tarot_readings_updated_at on tarot_readings;
create trigger trg_tarot_readings_updated_at
  before update on tarot_readings
  for each row execute function set_tarot_readings_updated_at();
