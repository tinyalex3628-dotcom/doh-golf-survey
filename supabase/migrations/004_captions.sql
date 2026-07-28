-- ============================================================
-- 자막 저장 + 개인 교정 사전
-- Supabase SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

-- 레슨 영상 자막: [{"start":0.0,"end":3.2,"text":"..."}]
alter table feedbacks add column if not exists captions jsonb not null default '[]';

-- 프로가 자막을 검수하며 승인한 교정 규칙.
-- 기본 교정 사전(코드에 내장)에 더해, 쓰면 쓸수록 프로 말버릇에 맞게 쌓입니다.
create table if not exists stt_corrections (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  wrong text not null,          -- 잘못 받아적힌 형태
  correct text not null,        -- 올바른 표기
  uses int not null default 0,
  created_at timestamptz not null default now(),
  unique (owner, wrong)
);

alter table stt_corrections enable row level security;

create policy "own stt corrections" on stt_corrections
  for all using (owner = auth.uid()) with check (owner = auth.uid());
