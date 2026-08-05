"use strict";
/* ── 여는 화면 · 오늘의 한 장 ─────────────────────────────────────────
   설계 원본은 design/opening-screen.html (아티팩트). 여기 있는 건 그걸
   진짜 데이터에 붙인 것이다. 카드·갈래·문맥의 문구와 순서는 원본 그대로다.

   머리(NS · NEXT SWING · 슬로건)는 고정이고 가운데 한 장만 매번 바뀐다.
   브랜드가 움직이면 매번 「보여주는 것」이 되고, 매일 보면 그게 제일 지겹다.

   핵심은 「얼마 만에 왔나(gap)」가 갈래 순서를 정한다는 것이다.
   같은 사람도 사흘 만과 스무 날 만은 다른 말을 들어야 한다. */

/* 무대를 감추는 건 문서 맨 앞 스크립트가 한다(build_v3.py) — 런타임보다
   먼저여야 한 프레임도 안 새어 나간다. 여기서는 걷는 쪽만 맡는다. */
window.__unboot = () => {
  try { document.documentElement.classList.remove('ns-boot'); } catch (e) {}
};

const OPEN = (() => {

  /* ── 그림 부품 ── */
  const big = (v, u, sz) => '<span style="display:flex;align-items:baseline;gap:4px">'
    + '<span class="o-big" style="font-size:' + (sz || 38) + 'px">' + v + '</span>'
    + (u ? '<span style="font-size:15px;font-weight:700;color:var(--ns-green);'
         + 'letter-spacing:-.02em">' + u + '</span>' : '') + '</span>';
  const rep = (n, on, cls) => '<span class="' + cls + '">'
    + Array.from({ length: Math.max(0, n) }, (_, i) =>
        '<i class="' + (i < on ? 'on' : '') + '"></i>').join('') + '</span>';
  const dots  = (n, on) => rep(n, on, 'o-dd');
  const tiles = (n, on) => rep(n, on, 'o-tiles');
  const gridd = (n, on) => rep(n, on, 'o-gridd');
  const bars = a => '<span class="o-bars">' + a.map(v =>
    '<i class="' + (v < 0 ? 'dim' : '') + '" style="height:'
    + Math.max(6, Math.abs(v)) + 'px"></i>').join('') + '</span>';
  const quote = t => '<span class="o-qw"><span class="o-qm">“</span>'
    + esc(cutTo(t, 44)) + '</span>';

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }
  function cutTo(t, n) {
    const one = String(t || '').replace(/\s+/g, ' ').trim();
    return one.length > n ? one.slice(0, n) + '…' : one;
  }
  const md = t => { const d = new Date(t);
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; };

  /* ── 카드 스물둘 ──────────────────────────────────────────────────
     when() 이 false 면 후보에서 아예 빠진다 — 없는 데이터로 카드를 만들지
     않는다. u:true 는 「오늘만」 — 내일이면 못 쓰는 말이라 문맥을 건너뛰고
     맨 앞에 선다. */
  const CARD = [
    /* 프로 활동 */
    { id: 'fbSoon', g: 'coach',
      when: (m, gp) => m.fbIn >= 1 && m.fbIn <= 7 && gp <= 13,
      art: () => dots(4, 3),
      ttl: () => '정기 피드백 도착까지 얼마 안 남았어요', sub: () => '기대하셔도 좋습니다' },
    { id: 'cmNew', g: 'coach', u: true,
      when: m => m.unread >= 1,
      art: m => quote(m.word),
      ttl: () => '이도형 프로가 한마디를 남겼어요', sub: () => '아직 안 읽으셨어요' },
    { id: 'cmWait', g: 'coach', u: true,
      when: (m, gp) => m.waitH > 0 && gp <= 2,
      art: m => big(m.waitH, '시간', 38),
      ttl: () => '맡기신 스윙, 지금 보고 있어요', sub: () => '48시간 안에 한마디가 도착합니다' },
    { id: 'word', g: 'coach',
      when: m => !!m.word,
      art: m => quote(m.word),
      ttl: () => '이도형 프로가 최근 남긴 말', sub: () => '다시 읽어 보셔도 좋아요' },
    { id: 'allSeen', g: 'coach',
      when: m => m.monVid >= 1 && m.seenMon >= m.monVid,
      art: m => tiles(Math.min(8, m.monVid), Math.min(8, m.monVid)),
      ttl: () => '올려주신 스윙, 하나도 빠짐없이 봤어요',
      sub: m => '이번 달 ' + m.monVid + '개 전부요' },
    { id: 'proMon', g: 'coach',
      when: m => m.seenMon >= 1 && m.seenMon < m.monVid,
      art: m => tiles(Math.min(12, m.monVid), Math.min(12, m.seenMon)),
      ttl: () => '올려주신 스윙, 하나씩 보고 있어요',
      sub: m => '이번 달 ' + m.monVid + '개 중 ' + m.seenMon + '개를 봤어요' },
    { id: 'proTot', g: 'coach',
      when: m => m.proTot >= 20,
      art: m => big(m.proTot, '번', 38),
      ttl: () => '이도형 프로가 봐준 스윙', sub: () => '한 번도 그냥 넘긴 적 없어요' },

    /* 되돌리기 */
    { id: 'hello', g: 'comeback', bigT: true,
      when: m => m.days <= 7,
      art: () => '',
      ttl: () => '넥스트 스윙에 오신 걸 환영합니다', sub: () => '' },
    { id: 'back', g: 'comeback', bigT: true,
      when: (m, gp) => gp >= 4,
      art: () => dots(5, 1),
      ttl: () => '기다리고 있었습니다',
      sub: m => m.lastUp
        ? '오늘의 스윙을 올려보세요 · 마지막 업로드 ' + md(m.lastUp)
        : '오늘의 스윙을 올려보세요' },

    /* 목표 */
    { id: 'quota', g: 'goal',
      when: m => m.cmLeft >= 1,
      art: m => tiles(m.cmAll <= 4 ? 4 : 8, m.cmAll - m.cmLeft),
      ttl: m => '이번 달 레슨 ' + m.cmLeft + '회 남았어요',
      sub: () => '스윙을 올리면 프로가 봐드려요' },
    { id: 'first0', g: 'goal',
      when: m => m.totVid === 0,
      art: () => tiles(4, 0),
      ttl: () => '스윙 하나만 올려 보세요', sub: () => '이도형 프로가 48시간 안에 답합니다' },

    /* 꾸준함 */
    { id: 'streak', g: 'streak',
      when: m => m.streak >= 3,
      art: m => dots(7, m.streak),
      ttl: m => m.streak + '일 연속 연습 중', sub: () => '오늘 올리면 이어집니다' },
    { id: 'weeks', g: 'streak',
      when: m => m.weeks >= 3,
      art: m => tiles(8, m.weeks),
      ttl: m => m.weeks + '주 연속 스윙을 올렸어요', sub: () => '한 주도 안 빠뜨렸습니다' },

    /* 연습 활동 */
    { id: 'monVid', g: 'practice',
      when: m => m.monVid >= 3,
      art: () => bars([14, 20, 17, 26, 23, 35, 31, -11, -11, -11]),
      ttl: m => '이번 달 영상 ' + m.monVid + '개', sub: () => '차곡차곡 쌓이고 있어요' },
    { id: 'monDay', g: 'practice',
      when: m => m.monDay >= 5,
      art: m => gridd(24, m.monDay),
      ttl: m => (new Date().getMonth() + 1) + '월에 ' + m.monDay + '일 연습했어요',
      sub: () => '한 칸이 하루입니다' },

    /* 함께한 시간 */
    { id: 'withDays', g: 'with',
      when: m => m.days >= 30,
      art: m => big(m.days, '일', 38),
      ttl: () => '넥스트 스윙과 함께한 지', sub: () => '이도형 프로가 계속 보고 있어요' },
    { id: 'withMon', g: 'with',
      when: m => m.days >= 60,
      art: m => big(Math.floor(m.days / 30), '개월', 38),
      ttl: () => '함께하고 있습니다',
      sub: m => '첫 스윙을 올린 지 ' + m.days + '일 됐어요' },

    /* 기록 */
    { id: 'first1', g: 'milestone', u: true,
      when: m => m.totVid === 1 && m.days <= 14,
      art: () => tiles(4, 1),
      ttl: () => '첫 스윙을 맡기셨어요', sub: () => '여기서부터 쌓입니다' },

    /* 비교 — 상위 30% 안일 때만. 베타엔 견줄 모수가 없어 안 뜬다 */
    { id: 'rank', g: 'rank',
      when: m => m.pct > 0 && m.pct <= 30,
      art: m => big('상위 ' + m.pct, '%', 30),
      ttl: () => '연습량 상위권이에요', sub: () => '이번 달 넥스트 스윙 회원 중에서' },

    /* 응원 — 조건이 없다. 아무것도 안 맞을 때 여기로 떨어진다 */
    { id: 'cheer', g: 'cheer', when: () => true, art: () => dots(3, 1),
      ttl: () => '오늘도 한 스윙 더', sub: () => '천천히 가도 괜찮습니다' },
    { id: 'cheer2', g: 'cheer', when: () => true, art: () => dots(3, 2),
      ttl: () => '좋은 스윙은 꾸준함에서 옵니다', sub: () => '이도형 프로가 기다리고 있어요' },
    { id: 'cheer3', g: 'cheer', when: () => true, art: () => dots(3, 3),
      ttl: () => '오늘 스윙 하나, 어때요', sub: () => '한 개만 올려도 충분합니다' },
  ];

  /* ── 문맥 여섯 ── 「얼마 만에 왔나」가 갈래 순서를 정한다 ── */
  const CTX = [
    { id: 'first',  hit: m => m.days <= 7,
      ord: ['comeback', 'milestone', 'goal', 'cheer'] },
    { id: 'today',  hit: (m, gp) => gp === 0,
      ord: ['goal', 'coach', 'cheer'] },
    { id: 'active', hit: (m, gp) => gp <= 3,
      ord: ['streak', 'rank', 'practice', 'with', 'milestone', 'coach', 'goal', 'cheer'] },
    { id: 'cool',   hit: (m, gp) => gp <= 13,
      ord: ['coach', 'comeback', 'with', 'milestone', 'goal', 'cheer'] },
    { id: 'risk',   hit: (m, gp) => gp <= 29,
      ord: ['comeback', 'coach', 'with', 'cheer'] },
    { id: 'gone',   hit: () => true,
      ord: ['comeback', 'cheer'] },
  ];

  /* ── 뽑는 규칙 ──
     ① 「오늘만」 카드가 있으면 문맥을 무시하고 그게 이긴다
     ② 없으면 문맥이 정한 갈래 순서대로 훑되, 최근에 쓴 갈래는 건너뛴다.
        갈래가 한 바퀴 돌게 하는 장치다 — 이게 없으면 앞 갈래에 카드가 많은
        회원은 뒤쪽 갈래를 영영 못 본다. 열심히 쓰는 사람이 제일 좁은 화면을
        보게 된다.
     ③ 갈래 안에서는 최근에 쓴 카드를 건너뛴다
     ④ 다 없으면 응원

     확률로 뽑지 않는다. 비율로 돌리면 상황에 안 맞는 카드가 반드시 나온다 —
     3주 잠수한 사람에게 「함께한 지 148일」이 뜬다. 비율은 결과지 목표가 아니다. */
  function pick(m, gp, day, seen, seenG) {
    const ok = CARD.filter(c => { try { return c.when(m, gp); } catch (e) { return false; } });
    const ctx = CTX.find(c => c.hit(m, gp));
    const tryIn = list => {
      if (!list.length) return null;
      const fresh = list.filter(c => seen.indexOf(c.id) < 0);
      return fresh.length ? fresh[day % fresh.length] : null;
    };
    let from = null;
    let card = tryIn(ok.filter(c => c.u));
    if (card) from = 'urgent';
    if (!card) {
      const avail = ctx.ord.filter(g => ok.some(c => c.g === g && !c.u));
      const fresh = avail.filter(g => seenG.indexOf(g) < 0);
      for (const g of (fresh.length ? fresh : avail)) {
        const pool = ok.filter(c => c.g === g && !c.u);
        const got = tryIn(pool) || pool[day % Math.max(1, pool.length)];
        if (got) { card = got; from = g; break; }
      }
    }
    if (!card) { card = CARD.find(c => c.id === 'cheer'); from = 'cheer'; }
    return { card, ctx, from, gcap: Math.max(2, Math.min(6, ctx.ord.length - 2)) };
  }

  /* ── 슬로건 ── 요일마다 갈아 끼운다. 머리에서 유일하게 바뀌는 자리다 ── */
  const WEEKSLO = [
    '당신의 골프를 관리해드립니다',   // 월
    'KPGA 프로가 직접 봅니다',
    '다음 스윙을 위한 기록',
    '스윙 하나에 한마디 하나',
    '오늘도 한 스윙 더',
    '혼자 치지 않게',
    '천천히 가도 괜찮습니다',         // 일
  ];

  return { CARD, CTX, pick, WEEKSLO, dots, tiles, gridd, bars, big, quote, cutTo };
})();

window.OPEN = OPEN;

/* ── 이 회원의 지금 ───────────────────────────────────────────────────
   카드가 요구하는 숫자를 실제 데이터에서 모은다. 못 세는 것은 0으로 둔다 —
   when() 이 false 가 되어 그 카드가 후보에서 아예 빠진다. 없는 숫자로
   그럴듯한 카드를 만들면 그 순간부터 앱을 못 믿는다. */
function openFacts() {
  const sw = window.__SWINGS || [];
  const cm = window.__COMMENTS || [];
  const wait = window.__WAIT || [];
  const now = new Date();
  const monFrom = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const dkey = t => { const d = new Date(t);
    return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };

  const mon = sw.filter(r => r.at >= monFrom);
  const monDays = new Set(mon.map(r => dkey(r.at)));

  /* 연속 주 — 이번 주부터 거꾸로, 한 주라도 비면 멈춘다 */
  const wkey = t => { const d = new Date(t);
    const mon0 = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    return mon0.getTime(); };
  const weeksUp = new Set(sw.map(r => wkey(r.at)));
  let weeks = 0;
  for (let w = wkey(Date.now()); weeksUp.has(w); w -= 7 * 864e5) weeks++;

  /* 프로가 답을 단 스윙 — 서버가 스윙마다 comments 를 같이 준다 */
  const answered = window.__ANSWERED || {};
  const seenMon = mon.filter(r => answered[r.remoteId]).length;
  const proTot = sw.filter(r => answered[r.remoteId]).length;

  const q = (typeof quota === 'function') ? quota() : { left: 0, cap: 0 };
  const born = window.__BORN || null;          // 가입일 (profiles.created_at)
  const days = born ? Math.max(0, Math.floor((Date.now() - born) / 864e5)) : 0;
  const newest = cm[0];

  return {
    days: days,
    totVid: sw.length,
    monVid: mon.length,
    monDay: monDays.size,
    streak: (window.S && S.mine && S.mine.streak) || 0,
    weeks: weeks,
    unread: cm.filter(c => !c.read).length,
    word: newest ? newest.body : null,
    waitH: wait.length
      ? Math.max(1, Math.round((Date.now() - Math.min(...wait.map(w => w.at))) / 36e5)) : 0,
    cmLeft: q.left, cmAll: q.cap,
    seenMon: seenMon, proTot: proTot,
    lastUp: sw.length ? sw[0].at : null,
    fbIn: 0,      // 정기 피드백은 베타에 없다 — 그래서 그 카드는 안 뜬다
    pct: 0,       // 견줄 모수가 없다 — 상위 % 카드도 안 뜬다
  };
}

/* ── 지난번에 뭘 보여줬나 ────────────────────────────────────────────
   기기에 두면 폰을 바꿀 때 리셋된다. 서버(profiles)에 두고, 서버가 죽어
   있으면 기기 것으로 버틴다. 둘 다 없으면 「처음 온 사람」으로 친다. */
const OPEN_KEY = 'ns-open';
function openMemory() {
  let mem = { last: 0, seen: [], seenG: [] };
  try {
    const raw = localStorage.getItem(OPEN_KEY);
    if (raw) mem = Object.assign(mem, JSON.parse(raw));
  } catch (e) {}
  const srv = window.__OPENMEM;
  // 서버 것이 더 최근이면 그쪽이 맞다 — 다른 폰에서 열었던 기록이다
  if (srv && (srv.last || 0) > (mem.last || 0)) mem = Object.assign({}, mem, srv);
  return mem;
}
function openRemember(mem) {
  try { localStorage.setItem(OPEN_KEY, JSON.stringify(mem)); } catch (e) {}
  if (window.NS && NS.saveOpen) NS.saveOpen(mem);
}

/* ── 화면 ─────────────────────────────────────────────────────────────
   설계의 세 가지 여는 법 중 「한 화면」이다 — 화면이 안 바뀌고 서클만 돈다.
   머리는 열자마자 그냥 거기 있고(애니메이션 없음), 가운데 한 장만 0.4초 뒤에
   올라온다. 눌러서 건너뛸 수 있다 — 매일 여는 앱이라 기다리게 하면 안 된다. */
function openScreen(done) {
  const mem = openMemory();
  const now = Date.now();
  const dayNum = t => Math.floor(new Date(new Date(t).getFullYear(),
    new Date(t).getMonth(), new Date(t).getDate()) / 864e5);
  /* 「얼마 만에 왔나」 — 처음 온 사람은 0 으로 친다(오늘 왔으니까) */
  const gp = mem.last ? Math.max(0, dayNum(now) - dayNum(mem.last)) : 0;

  const m = openFacts();
  const r = OPEN.pick(m, gp, dayNum(now), mem.seen || [], mem.seenG || []);
  const c = r.card;

  const art = c.art(m, gp) || '';
  const ttl = c.ttl(m, gp) || '';
  const sub = c.sub(m, gp) || '';

  const box = document.createElement('div');
  box.id = 'openscr';
  /* 어느 카드가 왜 뽑혔는지 남긴다 — 시험이 이걸 읽고, 사람이 볼 땐 안 보인다 */
  box.dataset.card = c.id;
  box.dataset.grp = c.g;
  box.dataset.ctx = r.ctx.id;
  box.dataset.gap = String(gp);
  window.__OPENPICK = { card: c.id, grp: c.g, ctx: r.ctx.id, from: r.from, gap: gp, facts: m };
  if (!art) box.classList.add('noart');
  // 요일 슬로건 — 월요일이 0 이다 (getDay 는 일요일이 0)
  const slo = OPEN.WEEKSLO[(new Date().getDay() + 6) % 7];
  box.innerHTML =
    '<div class="o-head">'
    + '<span class="o-ns">NS</span>'
    + '<span class="o-mk">NEXT SWING</span>'
    + '<span class="o-ru"></span>'
    + '<span class="o-slo">' + slo + '</span></div>'
    + (art ? '<div class="o-art">' + art + '</div>' : '')
    + '<div class="o-ttl' + (c.bigT ? ' bigT' : '') + '">' + ttl + '</div>'
    + (sub ? '<div class="o-sub">' + sub + '</div>' : '')
    + '<div class="o-spin"><svg viewBox="0 0 22 22">'
    + '<circle class="sb" cx="11" cy="11" r="9"></circle>'
    + '<circle class="sf" cx="11" cy="11" r="9"></circle></svg></div>';

  /* 보여준 것을 적어 둔다 — 다음에 같은 카드·같은 갈래를 피하려고.
     「오늘만」 카드는 갈래 기록에 안 넣는다. 문맥을 건너뛰고 나온 것이라
     이걸 넣으면 정작 그 갈래가 부당하게 밀린다. */
  const seen = (mem.seen || []).slice();
  seen.push(c.id);
  while (seen.length > 5) seen.shift();
  const seenG = (mem.seenG || []).slice();
  if (r.from !== 'urgent') {
    seenG.push(c.g);
    while (seenG.length > r.gcap) seenG.shift();
  }
  openRemember({ last: now, seen: seen, seenG: seenG });

  let shut = false;
  const close = () => {
    if (shut) return;
    shut = true;
    box.classList.add('out');
    setTimeout(() => { box.remove(); if (done) done(); }, 320);
  };
  box.addEventListener('click', close);           // 눌러서 건너뛴다
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('on'));
  setTimeout(close, 2200);
  return box;
}
window.__openScreen = openScreen;
