-- ============================================================
-- 레슨 카드 구조 추가 (회차 루프)
-- Supabase SQL Editor 에 이 파일 전체를 붙여넣고 실행하세요.
-- 기존 schema.sql 을 이미 실행한 프로젝트에 덧붙이는 파일입니다.
-- ============================================================

-- ---------- 1) 피드백에 레슨 카드 항목 추가 ----------
-- 기존 diagnosis(한 줄 진단) / body(상세 글) 는 그대로 두고,
-- 회원 페이지에 블록별로 나뉘어 들어갈 항목들을 따로 받습니다.
alter table feedbacks add column if not exists headline     text not null default '';   -- 서사형 헤드라인
alter table feedbacks add column if not exists prev_result  text not null default '';   -- 지난달 숙제 결과
alter table feedbacks add column if not exists focus        text not null default '';   -- 이번 달 고칠 것
alter table feedbacks add column if not exists tags         text[] not null default '{}';
alter table feedbacks add column if not exists quote        text not null default '';   -- 선택 인용구
alter table feedbacks add column if not exists next_preview text not null default '';   -- 다음 회차 예고
alter table feedbacks add column if not exists next_upload_on date;                     -- 다음 업로드 예정일
alter table feedbacks add column if not exists round_no     int;                        -- 회차 번호 (No.06)
-- 숙제: [{"id":"hw1","title":"톱에서 3초 멈추기 15회","why":"...","target":15}]
alter table feedbacks add column if not exists homeworks    jsonb not null default '[]';

-- ---------- 2) 회원의 숙제 이행 체크 ----------
-- 회원은 로그인 없이 토큰 링크로 들어오므로, 쓰기는 서버 라우트가 토큰을 검증한 뒤 대신 수행합니다.
create table if not exists homework_checks (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedbacks (id) on delete cascade,
  homework_id text not null,
  done boolean not null default false,
  progress int not null default 0,
  updated_at timestamptz not null default now(),
  unique (feedback_id, homework_id)
);

-- ---------- 3) 회원이 남긴 질문 ----------
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedbacks (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  answered_at timestamptz                                   -- 다음 회차에서 답하면 기록
);

-- ---------- 4) 프로의 숙제 프리셋 라이브러리 ----------
-- 자주 쓰는 드릴을 저장해두고 클릭 한 번으로 숙제에 추가합니다.
create table if not exists drills (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  title text not null,
  why text not null default '',
  uses int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 5) 분석 준비 상태 저장 ----------
-- 밖에서 노트북으로 선을 그어두고, 집 PC에서 이어서 녹화하기 위한 저장소.
-- state 예: {"shapes":[[...],[...]], "sync":[1.24,0.88], "view":[{...},{...}], "compareWith":"<request_id>"}
create table if not exists analysis_states (
  request_id uuid primary key references requests (id) on delete cascade,
  state jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 보안 규칙
-- ============================================================
alter table homework_checks enable row level security;
alter table questions       enable row level security;
alter table drills          enable row level security;
alter table analysis_states enable row level security;

-- 숙제 체크 / 질문: 관리자는 전부, 본인 신청 건이면 회원도 읽기
create policy "admin all homework checks" on homework_checks
  for all using (is_admin()) with check (is_admin());
create policy "own read homework checks" on homework_checks
  for select using (
    exists (select 1 from feedbacks f join requests r on r.id = f.request_id
            where f.id = feedback_id and r.user_id = auth.uid())
  );

create policy "admin all questions" on questions
  for all using (is_admin()) with check (is_admin());
create policy "own read questions" on questions
  for select using (
    exists (select 1 from feedbacks f join requests r on r.id = f.request_id
            where f.id = feedback_id and r.user_id = auth.uid())
  );

-- 드릴 라이브러리: 본인 것만
create policy "own drills" on drills
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- 분석 상태: 관리자만
create policy "admin analysis states" on analysis_states
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- 처음 쓸 때 넣어두면 편한 기본 드릴 (프로님 계정 ID로 바꿔서 실행)
-- ============================================================
-- insert into drills (owner, title, why) values
--   ('여기에-프로님-계정-ID', '톱에서 3초 멈추기 15회', '왼팔이 접히는 순간을 몸이 알아채게 만드는 연습이에요'),
--   ('여기에-프로님-계정-ID', '거울 앞 톱 자세 사진 찍기', '다음 달 비교 자료가 돼요. 각도가 같아야 변화가 보입니다'),
--   ('여기에-프로님-계정-ID', '하프스윙 30회', '큰 동작을 줄여서 궤도만 먼저 몸에 넣습니다'),
--   ('여기에-프로님-계정-ID', '임팩트백 20회', '맞는 순간의 손 위치를 손목이 기억하게 합니다');
