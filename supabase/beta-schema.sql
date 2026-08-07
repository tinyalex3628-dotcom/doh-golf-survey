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
-- 구독 등급. 베타에는 하나뿐이라 전부 '베타' 지만, 결제가 열리면 이 칸이
-- 회원 관리의 세로축이 된다. 프로가 CRM 에서 직접 바꾼다.
alter table public.profiles add column if not exists plan text not null default '베타';

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
-- 봤어요 도장. 프로가 CRM 에서 영상을 연 순간 찍힌다. 한마디를 아직 못 써도
-- 「프로가 확인했습니다」는 바로 회원에게 간다 — 반응의 최소 단위.
alter table public.swings add column if not exists seen_at timestamptz;
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

-- ── 월간 요약 ───────────────────────────────────────────────
-- 한 달치를 한 장으로. 숫자와 「반복해서 말한 것」은 기계가 세고,
-- 마지막 한 줄은 프로가 쓴다 — pro_line 이 not null 인 이유다.
--
-- stats 를 굳혀서 넣는 까닭: 회원이 나중에 영상을 지우면 다시 세는 값이
-- 바뀐다. 8월에 보낸 요약이 9월에 다른 숫자가 되면 그건 기록이 아니다.
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null references auth.users(id) on delete cascade,
  month      text not null,              -- '2026-08'
  stats      jsonb,                       -- 보낸 그 시점의 숫자
  theme      text,                        -- 이번 달 반복해서 말한 것
  picks      jsonb,                       -- 프로가 고른 문장 [{body, at}]
  pro_line   text not null,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
-- 한 회원에게 한 달에 한 장. 다시 보내면 덮어쓴다.
create unique index if not exists reviews_owner_month
  on public.reviews (owner, month);

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
alter table public.reviews  enable row level security;

drop policy if exists p_sel on public.profiles;
create policy p_sel on public.profiles for select
  using (id = auth.uid() or public.is_pro());
-- 닉네임·실명은 본인이, 등급(plan)은 프로가 적는다
drop policy if exists p_upd on public.profiles;
create policy p_upd on public.profiles for update
  using (id = auth.uid() or public.is_pro())
  with check (id = auth.uid() or public.is_pro());

drop policy if exists s_sel on public.swings;
create policy s_sel on public.swings for select
  using (owner = auth.uid() or public.is_pro());
drop policy if exists s_ins on public.swings;
create policy s_ins on public.swings for insert
  with check (owner = auth.uid());
-- 오늘 기록의 메모(note)와 한마디 요청 표시(want_comment)는 회원이,
-- 봤어요 도장(seen_at)은 프로가 적는다 — 그래서 프로도 update 가 열려 있어야 한다
drop policy if exists s_upd on public.swings;
create policy s_upd on public.swings for update
  using (owner = auth.uid() or public.is_pro())
  with check (owner = auth.uid() or public.is_pro());
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

-- 월간 요약 — 받은 사람과 프로만. 쓰는 건 프로, 읽음은 받은 사람이 찍는다.
drop policy if exists r_sel on public.reviews;
create policy r_sel on public.reviews for select
  using (owner = auth.uid() or public.is_pro());
drop policy if exists r_ins on public.reviews;
create policy r_ins on public.reviews for insert with check (public.is_pro());
drop policy if exists r_upd on public.reviews;
create policy r_upd on public.reviews for update
  using (owner = auth.uid() or public.is_pro())
  with check (owner = auth.uid() or public.is_pro());

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

-- ── 회원 탈퇴 ───────────────────────────────────────────────
-- 앱 안에서 계정을 정말로 지울 수 있어야 한다(양대 스토어 공통 요구).
-- 브라우저는 auth.users 를 못 건드리므로, 본인만 자기 줄을 지우는 함수를
-- 하나 두고 그걸 부른다. profiles · swings · comments 는 전부
-- on delete cascade 라 같이 사라진다.
--   창고(storage)의 영상 파일은 cascade 가 안 걸린다 — 앱이 이 함수를
--   부르기 전에 먼저 지운다(sb.js 의 wipe()).
create or replace function public.delete_own_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception '로그인 상태가 아닙니다';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

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
