-- ============================================================
-- NEXT SWING 베타 — src/sb.js 가 실제로 쓰는 표와 규칙
--
-- 이 파일은 「지금 코드가 요구하는 모양」이다. Supabase 콘솔에서 이미 만들어 둔
-- 것과 겹쳐도 그대로 다시 돌릴 수 있게 썼다(if not exists / drop policy if exists).
-- 새 환경을 만들 때는 이 파일 하나면 된다.
--
-- 위쪽 schema.sql 은 예전 Next.js 설문 앱 것이라 서로 상관이 없다.
-- ============================================================

-- ── 회원 ────────────────────────────────────────────────────
-- auth.users 와 1:1. 닉네임은 프로 화면에 보이는 이름표다.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text,
  real_name  text,                       -- 선택 · 프로만 본다 · 베타 끝나면 지운다
  is_pro     boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists real_name text;
-- 여는 화면(오늘의 한 장)이 지난번에 보여준 카드·갈래와 마지막 방문일.
-- 기기에만 두면 폰을 바꿀 때 리셋돼서, 스무 날 만에 온 사람이 「처음 온 사람」이
-- 된다. 「얼마 만에 왔나」가 카드를 고르는 기준이라 여기 있어야 한다.
--   { "last": 1754300000000, "seen": ["cheer","quota"], "seenG": ["cheer","goal"] }
alter table public.profiles add column if not exists open_mem jsonb;

-- 계정이 생기면 프로필도 같이 생긴다 (익명 계정 포함 — 링크만 누르고 들어온 사람)
create or replace function public.on_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.on_new_user();

-- ── 스윙 ────────────────────────────────────────────────────
-- 파일은 창고(storage)에, 「누가·언제·어느 각도」는 여기에.
create table if not exists public.swings (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid not null references auth.users(id) on delete cascade,
  view         text,                     -- 정면 / 측면
  path         text not null,            -- swings 버킷 안의 경로. 앞자리가 회원 id 다
  size         bigint,
  note         text,                     -- 오늘 기록에 적은 메모
  want_comment boolean not null default false,   -- CRM 이 「답 기다림」을 이걸로 가른다
  created_at   timestamptz not null default now()
);
alter table public.swings add column if not exists note text;
alter table public.swings add column if not exists want_comment boolean not null default false;
-- 클럽(드라이버 · 7번 아이언 …). 올릴 때 회원이 고른다.
-- 갤러리 필터가 이걸로 갈리고, 프로도 무엇으로 친 스윙인지 알고 본다.
alter table public.swings add column if not exists club text;
create index if not exists swings_owner_idx on public.swings (owner, created_at desc);

-- ── 프로 한마디 ─────────────────────────────────────────────
-- photos 는 작업대에서 캡처한 사진들(data URL 배열)이다. 이 칸이 없으면
-- 답장 글만 가고 사진은 조용히 버려진다.
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  swing_id   uuid not null references public.swings(id) on delete cascade,
  body       text,
  photos     jsonb,
  created_at timestamptz not null default now(),
  read_at    timestamptz               -- 회원이 펼쳐 읽으면 찍힌다
);
alter table public.comments add column if not exists photos jsonb;
alter table public.comments add column if not exists read_at timestamptz;
create index if not exists comments_swing_idx on public.comments (swing_id);

-- ── 접근 규칙 ───────────────────────────────────────────────
-- 자기 것만 보인다. 프로만 전부 본다.
-- is_pro() 는 security definer 다 — 규칙 안에서 profiles 를 읽어야 하는데
-- 그 profiles 자체도 규칙이 걸려 있어서, 아니면 서로 물고 늘어진다.
create or replace function public.is_pro() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_pro from public.profiles where id = auth.uid()), false)
$$;

alter table public.profiles enable row level security;
alter table public.swings   enable row level security;
alter table public.comments enable row level security;

drop policy if exists p_sel on public.profiles;
create policy p_sel on public.profiles for select
  using (id = auth.uid() or public.is_pro());
drop policy if exists p_upd on public.profiles;
create policy p_upd on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists s_sel on public.swings;
create policy s_sel on public.swings for select
  using (owner = auth.uid() or public.is_pro());
drop policy if exists s_ins on public.swings;
create policy s_ins on public.swings for insert
  with check (owner = auth.uid());
-- 오늘 기록의 메모(note)와 한마디 요청 표시(want_comment)를 나중에 붙인다
drop policy if exists s_upd on public.swings;
create policy s_upd on public.swings for update
  using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists s_del on public.swings;
create policy s_del on public.swings for delete
  using (owner = auth.uid());

drop policy if exists c_sel on public.comments;
create policy c_sel on public.comments for select
  using (public.is_pro()
      or exists (select 1 from public.swings s
                  where s.id = comments.swing_id and s.owner = auth.uid()));
-- 한마디는 프로만 쓴다
drop policy if exists c_ins on public.comments;
create policy c_ins on public.comments for insert with check (public.is_pro());
-- 읽음 표시는 받은 사람이 찍는다
drop policy if exists c_upd on public.comments;
create policy c_upd on public.comments for update
  using (public.is_pro()
      or exists (select 1 from public.swings s
                  where s.id = comments.swing_id and s.owner = auth.uid()));

-- ── 창고 ────────────────────────────────────────────────────
-- 비공개 버킷이다. 주소만으로는 못 연다 — 한 시간짜리 서명 링크로 연다.
insert into storage.buckets (id, name, public) values ('swings', 'swings', false)
  on conflict (id) do nothing;

drop policy if exists sw_ins on storage.objects;
create policy sw_ins on storage.objects for insert with check (
  bucket_id = 'swings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists sw_sel on storage.objects;
create policy sw_sel on storage.objects for select using (
  bucket_id = 'swings'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_pro()));
drop policy if exists sw_del on storage.objects;
create policy sw_del on storage.objects for delete using (
  bucket_id = 'swings' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── 프로 지정 ───────────────────────────────────────────────
-- 이도형 프로 계정으로 로그인한 뒤 한 번만. (아이디는 실제로 만든 것으로)
--   update public.profiles set is_pro = true
--    where id = (select id from auth.users where email = '아이디@beta.nextswing.app');

-- ── Supabase 콘솔에서 따로 해둘 것 ──────────────────────────
-- Authentication › Providers › Email › "Confirm email" 을 끈다.
--   가입은 아이디@beta.nextswing.app 꼴의 가짜 메일을 쓴다. 진짜 메일이
--   오가지 않으므로 확인 메일을 켜두면 아무도 가입을 마칠 수 없다.
-- Authentication › Providers › "Anonymous sign-ins" 을 켠다.
--   링크만 누르고 들어온 사람도 계정이 생겨야, 가입할 때 그동안 올린 것이
--   그대로 이어붙는다.
