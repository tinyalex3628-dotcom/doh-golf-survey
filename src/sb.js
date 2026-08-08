"use strict";
/* ── 서버 ────────────────────────────────────────────────────────────
   회원이 올린 스윙이 이도형 프로에게 가고, 프로가 쓴 한마디가 회원에게 온다.
   그 한 바퀴를 도는 곳이다.

   기기 먼저(local-first)다 — 영상은 일단 이 기기의 보관함에 들어가고, 그다음
   서버로 올라간다. 타석은 지하가 많고 데이터가 자주 끊긴다. 전송이 실패해도
   찍은 건 남아 있어야 하고, 나중에 다시 보낼 수 있어야 한다.

   여기 있는 키는 「공개용(publishable)」이다. 브라우저에 들어가는 게 정상이고,
   실제 보호는 서버 쪽 접근 규칙(RLS)이 한다 —
   자기 영상만 보이고, 프로만 전부 보인다. */

const SB_URL = 'https://uwjrxfghmndakxqmrgfw.supabase.co';
const SB_KEY = 'sb_publishable_OLQpZsz7HK7sDG3tsXb6ug_MEw-CbCN';
const SB_BUCKET = 'swings';

const NS = (() => {
  let db = null, me = null, pro = false, failed = false, nickname = null;

  function client() {
    if (db) return db;
    if (typeof supabase === 'undefined') { failed = true; return null; }
    db = supabase.createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ns-auth' },
    });
    return db;
  }

  /* 링크만 누르면 들어와진다 — 이메일도 비밀번호도 없다.
     그래도 진짜 계정이다. 고유 ID 가 생기고 자기 것만 보인다.
     나중에 카카오를 얹으면 이 계정에 그대로 이어붙는다. */
  async function ready() {
    const c = client();
    if (!c) return null;
    if (me) return me;
    try {
      const { data } = await c.auth.getSession();
      let user = data && data.session && data.session.user;
      if (!user) {
        const r = await c.auth.signInAnonymously();
        if (r.error) throw r.error;
        user = r.data.user;
      }
      me = user;
      const p = await c.from('profiles')
        .select('is_pro,nickname,created_at,open_mem').eq('id', me.id).maybeSingle();
      pro = !!(p.data && p.data.is_pro);
      nickname = (p.data && p.data.nickname) || null;
      /* 여는 화면이 쓰는 두 가지 — 가입일(「함께한 지」)과 지난번에 보여준 카드.
         기기에만 두면 폰을 바꿀 때 리셋돼서 스무 날 만에 온 사람이 「처음 온
         사람」으로 보인다. */
      if (p.data) {
        window.__BORN = p.data.created_at ? new Date(p.data.created_at).getTime() : null;
        window.__OPENMEM = p.data.open_mem || null;
      }
      return me;
    } catch (e) {
      failed = true;
      return null;
    }
  }

  /* 영상 한 편을 서버로. 파일은 창고에, 「누가·언제·어느 각도」는 표에.
     경로 앞자리가 회원 ID 다 — 접근 규칙이 그 앞자리로 남의 영상을 막는다. */
  async function push(file, view, note, onStep, club) {
    const c = client();
    const u = await ready();
    if (!c || !u) throw new Error('offline');
    const ext = (file.name || '').split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
    const path = u.id + '/' + Date.now() + '-' + Math.round(Math.random() * 1e6) + '.' + ext;

    /* supabase-js 의 upload 는 진행률을 안 준다. 40MB 짜리를 데이터로 올리면
       1분 넘게 걸리는데 화면이 멈춘 것처럼 보인다. 창고에 넣는 부분만 XHR 로
       직접 올려서 몇 %인지 그대로 보여준다. */
    const { data: sess } = await c.auth.getSession();
    const token = sess && sess.session && sess.session.access_token;
    await new Promise((ok, no) => {
      const x = new XMLHttpRequest();
      x.open('POST', SB_URL + '/storage/v1/object/' + SB_BUCKET + '/' + path);
      x.setRequestHeader('authorization', 'Bearer ' + token);
      x.setRequestHeader('apikey', SB_KEY);
      x.setRequestHeader('x-upsert', 'false');
      if (file.type) x.setRequestHeader('content-type', file.type);
      if (onStep) x.upload.onprogress = e => {
        if (e.lengthComputable) onStep(Math.round(e.loaded / e.total * 100));
      };
      x.onload = () => (x.status >= 200 && x.status < 300)
        ? ok() : no(new Error('창고에 못 넣었어요 (' + x.status + ')'));
      x.onerror = () => no(new Error('연결이 끊겼어요'));
      x.ontimeout = () => no(new Error('시간이 너무 오래 걸려요'));
      x.send(file);
    });

    const row = await c.from('swings').insert({
      owner: u.id, view: view, path: path, size: file.size, note: note || null,
      club: club || null,
    }).select().single();
    if (row.error) {
      // 표에 못 넣었으면 올린 파일도 치운다 — 주인 없는 파일이 창고에 남지 않게
      await c.storage.from(SB_BUCKET).remove([path]).catch(() => {});
      throw row.error;
    }
    return row.data;
  }

  /* 내 스윙 + 거기 달린 한마디를 한 번에.

     주인을 여기서 못 박는다. 전에는 조건 없이 긁고 접근 규칙(RLS)이
     알아서 잘라주기를 기대했는데, 프로에게는 그 규칙이 전부 열려 있다.
     그래서 프로가 회원 앱을 열면 남의 스윙과 남이 받은 한마디가 통째로
     「내 것」으로 들어와서, 회원에게 답을 써주고 나면 자기 홈에
     「프로 한마디가 도착했어요」가 떴다.
     규칙은 바닥이지 질문의 뜻이 아니다 — mine() 은 이름 그대로여야 한다. */
  async function mine() {
    const c = client();
    const u = await ready();
    if (!c || !u) return [];
    const r = await c.from('swings')
      .select('id,view,path,size,note,club,want_comment,seen_at,created_at,comments(id,body,photos,created_at,read_at)')
      .eq('owner', u.id)
      .order('created_at', { ascending: false });
    return r.error ? [] : (r.data || []);
  }

  /* 프로 화면 — 전부 본다. 접근 규칙이 프로에게만 열어준다 */
  async function all() {
    const c = client();
    const u = await ready();
    if (!c || !u) return [];
    const r = await c.from('swings')
      .select('id,owner,view,path,size,note,club,want_comment,seen_at,created_at,comments(id,body,photos,created_at,read_at)')
      .order('created_at', { ascending: false }).limit(200);
    return r.error ? [] : (r.data || []);
  }

  async function comment(swingId, body, photos) {
    const c = client();
    await ready();
    const r = await c.from('comments').insert({
      swing_id: swingId, body: body,
      photos: (photos && photos.length) ? photos : null,
    }).select().single();
    if (r.error) throw r.error;
    return r.data;
  }

  /* 봤어요 도장 — 프로가 영상을 연 순간 찍힌다.
     한마디를 쓸 시간이 없어도 「봤다」는 사실은 바로 회원에게 간다.
     반응의 최소 단위다. 한 번 찍히면 다시 안 찍는다. */
  async function seen(swingId) {
    const c = client();
    await ready();
    await c.from('swings').update({ seen_at: new Date().toISOString() })
      .eq('id', swingId).is('seen_at', null);
  }

  async function markRead(commentId) {
    const c = client();
    await ready();
    await c.from('comments').update({ read_at: new Date().toISOString() }).eq('id', commentId);
  }

  /* 비공개 창고라 그냥 주소로는 못 연다. 한 시간짜리 열쇠를 받아서 연다. */
  async function link(path) {
    const c = client();
    await ready();
    const r = await c.storage.from(SB_BUCKET).createSignedUrl(path, 3600);
    return r.error ? null : r.data.signedUrl;
  }

  async function remove(id, path) {
    const c = client();
    await ready();
    await c.storage.from(SB_BUCKET).remove([path]).catch(() => {});
    await c.from('swings').delete().eq('id', id);
  }

  /* 회원 이름표 — swings.owner 는 auth.users 를 가리켜서 profiles 와 자동으로
     이어지지 않는다. 따로 받아서 id 로 맞춘다. */
  /* 회원 명부 — 닉네임만이 아니라 가입일·실명까지. 「가입만 하고 아직
     한 개도 안 올린 사람」은 스윙 표에 없어서, 이걸 안 읽으면 명부에서
     통째로 빠진다. 제일 챙겨야 할 사람이 안 보이는 셈이다. */
  async function profiles() {
    const c = client();
    await ready();
    if (!c) return [];
    const r = await c.from('profiles').select('id,nickname,real_name,is_pro,plan,created_at');
    return r.error ? [] : (r.data || []);
  }

  /* 등급 바꾸기 — 프로만. 결제가 열리기 전까지는 프로가 손으로 적는다. */
  async function setPlan(id, plan) {
    const c = client();
    await ready();
    const r = await c.from('profiles').update({ plan: plan }).eq('id', id);
    if (r.error) throw r.error;
  }

  async function people() {
    const c = client();
    await ready();
    if (!c) return {};
    const r = await c.from('profiles').select('id,nickname');
    if (r.error) return {};
    return Object.fromEntries((r.data || []).map(p => [p.id, p.nickname]));
  }

  /* ── 월간 요약 ────────────────────────────────────────────────────
     mine() 과 같은 함정이 여기 있었다 — 접근 규칙에 맡기면 프로에게는
     전부 열려서, 프로가 회원 앱을 열면 남에게 보낸 요약이 자기 것으로
     들어온다. 부르는 쪽이 무엇을 원하는지 여기서 못 박는다.
       reviews()      — 내 것만 (회원 앱)
       reviews(true)  — 전부   (CRM. 규칙이 프로에게만 열어준다) */
  async function reviews(everyone) {
    const c = client();
    const u = await ready();
    if (!c || !u) return [];
    let q = c.from('reviews')
      .select('id,owner,month,stats,theme,picks,photos,pro_line,created_at,read_at');
    if (!everyone) q = q.eq('owner', u.id);
    const r = await q
    return r.error ? [] : (r.data || []);
  }

  /* 한 회원에게 한 달에 한 장. 고쳐 보내면 덮어쓴다 —
     두 장이 남으면 어느 것이 진짜인지 회원이 알 수 없다. */
  async function sendReview(owner, month, body) {
    const c = client();
    await ready();
    const row = Object.assign({ owner: owner, month: month }, body);
    const r = await c.from('reviews').upsert(row, { onConflict: 'owner,month' })
      .select().single();
    if (r.error) throw r.error;
    return r.data;
  }

  async function readReview(id) {
    const c = client();
    await ready();
    await c.from('reviews').update({ read_at: new Date().toISOString() }).eq('id', id);
  }

  /* ── 탈퇴 ─────────────────────────────────────────────────────────
     앱 안에서 계정을 정말로 지운다. 순서가 중요하다 —
       ① 창고의 영상 파일부터 (표가 사라지면 경로를 잃어서 못 지운다)
       ② 계정 (표는 cascade 로 같이 사라진다)
       ③ 로그아웃
     ①이 실패해도 ②는 간다. 계정을 못 지우는 것보다는 파일 몇 개가
     남는 게 낫다 — 남은 파일은 주인 없는 파일이라 아무도 못 연다. */
  async function wipe() {
    const c = client();
    const u = await ready();
    if (!c || !u) throw new Error('서버에 연결하지 못했어요');
    try {
      const r = await c.from('swings').select('path').eq('owner', u.id);
      const paths = (r.data || []).map(x => x.path).filter(Boolean);
      if (paths.length) await c.storage.from(SB_BUCKET).remove(paths);
    } catch (e) {}
    const d = await c.rpc('delete_own_account');
    if (d.error) throw d.error;
    try { await c.auth.signOut(); } catch (e) {}
    me = null; pro = false; nickname = null;
  }

  /* ── 가입 · 로그인 ────────────────────────────────────────────────
     아이디 · 비밀번호 방식이다. 서버는 이메일 꼴을 요구하므로 아이디 뒤에
     우리 도메인을 붙여 이메일처럼 만든다 — 진짜 메일은 오가지 않는다.
     (Supabase 의 Confirm email 을 꺼야 돌아간다)

     핵심은 「이어붙이기」다. 지금 익명 계정에 아이디·비번을 얹는 것이라,
     가입해도 그동안 올린 스윙과 받은 한마디가 그대로 남는다.
     다른 폰에서 로그인하면 같은 계정으로 들어온다. */
  const fakeMail = id => id.toLowerCase() + '@beta.nextswing.app';

  async function signUp(id, pw, nick, realName) {
    const c = client();
    const u = await ready();
    if (!c) throw new Error('offline');
    if (!/^[a-z0-9_]{4,20}$/i.test(id)) throw new Error('아이디는 영문·숫자 4~20자');
    if ((pw || '').length < 6) throw new Error('비밀번호는 6자 이상');
    if (u && u.is_anonymous) {
      const r = await c.auth.updateUser({ email: fakeMail(id), password: pw });
      if (r.error) throw r.error;
    } else {
      const r = await c.auth.signUp({ email: fakeMail(id), password: pw });
      if (r.error) throw r.error;
      me = r.data.user;
    }
    const uid = (me && me.id) || (u && u.id);
    await c.from('profiles').update({ nickname: nick || null, real_name: realName || null })
      .eq('id', uid);
    nickname = nick || null;
    return true;
  }

  async function signIn(id, pw) {
    const c = client();
    if (!c) throw new Error('offline');
    const r = await c.auth.signInWithPassword({ email: fakeMail(id), password: pw });
    if (r.error) throw r.error;
    me = r.data.user;
    const p = await c.from('profiles').select('is_pro,nickname').eq('id', me.id).maybeSingle();
    pro = !!(p.data && p.data.is_pro);
    nickname = (p.data && p.data.nickname) || null;
    return me;
  }

  /* 한마디 요청 표시 — CRM 이 「답 기다림」과 「그냥 올림」을 가른다 */
  async function want(swingId) {
    const c = client();
    await ready();
    const r = await c.from('swings').update({ want_comment: true }).eq('id', swingId);
    if (r.error) throw r.error;
  }

  /* 오늘 기록의 메모를 스윙에 붙인다 — 프로가 영상 옆에서 같이 본다 */
  async function note(swingId, text) {
    const c = client();
    await ready();
    const r = await c.from('swings').update({ note: text }).eq('id', swingId);
    if (r.error) throw r.error;
  }

  /* 프로 자격을 서버에서 다시 읽는다. ready() 는 첫 결과를 캐시하므로,
     콘솔에서 is_pro 를 켠 「뒤에」는 이걸 불러야 화면이 알아챈다.
     관리자 콘솔의 「다시 불러오기」가 이걸 안 부르고 ready() 만 다시 불러서,
     SQL 을 실행해도 영영 프로가 안 되는 버그가 실제로 있었다. */
  async function refresh() {
    const c = client();
    const u = await ready();
    if (!c || !u) return false;
    const p = await c.from('profiles').select('is_pro,nickname').eq('id', u.id).maybeSingle();
    pro = !!(p.data && p.data.is_pro);
    nickname = (p.data && p.data.nickname) || nickname;
    return pro;
  }

  /* 여는 화면이 지난번에 뭘 보여줬는지 — 서버에 둬야 폰을 바꿔도 이어진다.
     실패해도 조용히 넘어간다. 기기에도 같은 걸 적어두므로 화면은 그대로 돈다. */
  async function saveOpen(mem) {
    const c = client();
    const u = await ready();
    if (!c || !u) return;
    await c.from('profiles').update({ open_mem: mem }).eq('id', u.id);
  }

  async function setName(nickname) {
    const c = client();
    const u = await ready();
    if (!c || !u) return null;
    await c.from('profiles').update({ nickname: nickname }).eq('id', u.id);
    return nickname;
  }

  return {
    ready, push, mine, all, comment, markRead, seen, link, remove, people, profiles,
    setName, setPlan, note, want, wipe,
    reviews, sendReview, readReview,
    saveOpen, refresh,
    signUp, signIn,
    nick: () => nickname,
    named: () => !!(me && !me.is_anonymous),
    who: () => me,
    isPro: () => pro,
    down: () => failed,
  };
})();

window.NS = NS;
