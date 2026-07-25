-- ============================================================
-- NEXT 골프 스윙 피드백 서비스 데이터베이스 스키마
-- Supabase SQL Editor 에 이 파일 전체를 붙여넣고 실행하세요.
-- ============================================================

-- 관리자(프로) 목록: 여기에 등록된 계정만 관리자 화면을 볼 수 있어요.
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 관리자인지 확인하는 함수
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- 신청서
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  receipt_no text not null unique,          -- 접수번호 예: SW-260725-014
  concerns text[] not null default '{}',    -- 고민 칩 (슬라이스, 비거리 ...)
  note text not null default '',            -- 자유 입력
  phone text not null default '',           -- 알림 받을 휴대폰 번호
  status text not null default 'received',  -- received(접수) / done(피드백 완료)
  created_at timestamptz not null default now()
);

-- 신청자가 올린 파일 (영상/사진)
create table if not exists request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id) on delete cascade,
  kind text not null check (kind in ('video', 'photo')),
  path text not null,                       -- storage 안의 파일 경로
  created_at timestamptz not null default now()
);

-- 프로가 작성한 피드백
create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references requests (id) on delete cascade,
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  diagnosis text not null default '',       -- 한 줄 진단 (알림톡에 들어감)
  body text not null default '',            -- 상세 피드백 글
  chapters jsonb not null default '[]',     -- [{"time":"03:12","label":"백스윙 오른팔 각도"}]
  created_at timestamptz not null default now()
);

-- 피드백에 첨부된 파일 (분석 영상/사진)
create table if not exists feedback_files (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedbacks (id) on delete cascade,
  kind text not null check (kind in ('video', 'photo')),
  path text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 보안 규칙 (RLS): 누가 무엇을 볼 수 있는지
-- ============================================================
alter table admins enable row level security;
alter table requests enable row level security;
alter table request_files enable row level security;
alter table feedbacks enable row level security;
alter table feedback_files enable row level security;

-- admins: 본인이 관리자면 자기 행을 볼 수 있음
create policy "admins can see themselves" on admins
  for select using (user_id = auth.uid());

-- requests: 본인 것 + 관리자는 전부
create policy "own or admin read" on requests
  for select using (user_id = auth.uid() or is_admin());
create policy "own insert" on requests
  for insert with check (user_id = auth.uid());
create policy "admin update" on requests
  for update using (is_admin());

-- request_files: 신청서와 동일한 규칙
create policy "own or admin read files" on request_files
  for select using (
    exists (select 1 from requests r where r.id = request_id
            and (r.user_id = auth.uid() or is_admin()))
  );
create policy "own insert files" on request_files
  for insert with check (
    exists (select 1 from requests r where r.id = request_id and r.user_id = auth.uid())
  );

-- feedbacks / feedback_files: 관리자만 직접 접근 (신청자는 토큰 링크로 열람)
create policy "admin all feedbacks" on feedbacks
  for all using (is_admin()) with check (is_admin());
create policy "admin all feedback files" on feedback_files
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- 저장소(Storage) 버킷: 파일이 실제로 저장되는 곳
-- ============================================================
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('feedback', 'feedback', false)
  on conflict (id) do nothing;

-- uploads: 로그인한 사람은 자기 폴더(자기 user id)에만 올릴 수 있음
create policy "user upload own folder" on storage.objects
  for insert with check (
    bucket_id = 'uploads'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "user read own folder or admin" on storage.objects
  for select using (
    bucket_id = 'uploads'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_admin())
  );

-- feedback: 관리자만 올리고 볼 수 있음 (신청자는 서명된 링크로 열람)
create policy "admin write feedback bucket" on storage.objects
  for insert with check (bucket_id = 'feedback' and is_admin());
create policy "admin read feedback bucket" on storage.objects
  for select using (bucket_id = 'feedback' and is_admin());
