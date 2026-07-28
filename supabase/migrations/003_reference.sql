-- ============================================================
-- 프로 스윙 라이브러리
-- 투어 프로나 교습용 모범 스윙을 프로그램에 저장해두고,
-- 분석 중 클릭 한 번으로 비교 화면(B)에 올리기 위한 저장소입니다.
-- Supabase SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

create table if not exists reference_swings (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  name text not null,                                    -- "로리 매킬로이" / "교습용 기본형"
  club text not null default '드라이버',                  -- 드라이버 / 우드 / 아이언 / 웨지 / 퍼터
  view text not null default '정면',                      -- 정면 / 후면 / 기타
  handed text not null default 'right'                    -- right / left
    check (handed in ('right', 'left')),
  note text not null default '',                          -- "템포 3:1, 하체 리드 참고"
  path text not null,                                     -- reference 버킷 안의 파일 경로
  thumb_path text,                                        -- 썸네일 (없으면 비워둠)
  tags text[] not null default '{}',
  uses int not null default 0,                            -- 많이 쓴 순으로 위에 뜨게
  created_at timestamptz not null default now()
);

create index if not exists reference_swings_owner_idx on reference_swings (owner, club, view);

alter table reference_swings enable row level security;

-- 본인이 올린 참고 스윙만 보고 관리합니다.
create policy "own reference swings" on reference_swings
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- ---------- 저장소 ----------
insert into storage.buckets (id, name, public) values ('reference', 'reference', false)
  on conflict (id) do nothing;

create policy "admin write reference bucket" on storage.objects
  for insert with check (bucket_id = 'reference' and is_admin());
create policy "admin read reference bucket" on storage.objects
  for select using (bucket_id = 'reference' and is_admin());
create policy "admin delete reference bucket" on storage.objects
  for delete using (bucket_id = 'reference' and is_admin());

-- ============================================================
-- 참고: 저작권
-- 중계 화면을 그대로 저장해 회원에게 재배포하면 문제가 될 수 있습니다.
-- 직접 촬영한 시범 스윙이나 이용 허락을 받은 영상을 쓰시고,
-- 레슨 영상에 넣을 때는 비교·교육 목적임이 드러나게 사용하세요.
-- ============================================================
