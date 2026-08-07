"use strict";
/* ── 회원 명부 ────────────────────────────────────────────────────────
   회원 관리 화면은 지금까지 예시 데이터(M)로 그려진 설계도였다.
   여기서 서버에 있는 진짜 것으로 바꾼다 — 스윙(IN.list)과 프로필(IN.people)만
   있으면 나머지는 전부 계산해서 나온다.

   축이 둘이다 —
     세로축 = 구독 등급 (베타에는 하나뿐이라 아직 쓸 일이 없다)
     가로축 = 상태     (새싹 · 활성 · 복귀 · 침묵 · 휴면)

   상태는 프로가 손으로 매기지 않는다. 마지막 업로드가 며칠 전인가로
   자동으로 갈린다 — 손으로 매기면 반드시 갱신을 잊고, 잊은 명부는
   안 보느니만 못하다. */

const DAY = 864e5;

const ST = {
  seed:  { nm: '새싹', d: '아직 한 개도 안 올림',   c: 'var(--ns-bronze)', bg: 'var(--ns-sand)' },
  live:  { nm: '활성', d: '최근 7일 안에 올림',     c: 'var(--ns-green)',  bg: 'var(--ns-soft)' },
  back:  { nm: '복귀', d: '오래 쉬었다 돌아옴',     c: '#7D5D2E',          bg: '#F6EFE1' },
  quiet: { nm: '침묵', d: '8~29일 조용',            c: '#B0662B',          bg: '#FAEEE2' },
  sleep: { nm: '휴면', d: '30일 넘게 조용',         c: 'var(--ns-danger)', bg: 'rgba(192,57,43,.09)' },
};
const ST_ORDER = ['back', 'quiet', 'seed', 'live', 'sleep'];

/* 프로가 먼저 말을 걸어야 하는 사람. 여기 오르는 순간이 곧 할 일이다.
   활성·휴면은 안 부른다 — 활성은 잘 돌고 있고, 휴면은 한 줄로 될 일이
   아니라 따로 판단할 일이다. */
const NEEDS_CALL = { back: 1, quiet: 2, seed: 3 };

function crmDays(t) { return Math.floor((Date.now() - t) / DAY); }

function crmRoster() {
  const by = {};
  const get = id => by[id] || (by[id] = {
    id: id, ups: [], cm: 0, wait: 0, unseen: 0, nick: null, real: null, join: null,
  });

  (IN.list || []).forEach(s => {
    const m = get(s.owner);
    m.ups.push(new Date(s.created_at).getTime());
    const n = (s.comments || []).length;
    m.cm += n;
    if (s.want_comment && !n) m.wait++;
    if (!s.seen_at && !n) m.unseen++;
  });

  /* 프로필에만 있고 아직 한 개도 안 올린 사람 — 그 사람이 바로 새싹이다.
     스윙만 훑으면 제일 챙겨야 할 사람이 명부에서 통째로 빠진다. */
  (IN.people || []).forEach(p => {
    if (p.is_pro) return;
    const m = get(p.id);
    m.nick = p.nickname; m.real = p.real_name; m.join = p.created_at;
  });

  return Object.values(by).map(m => {
    m.ups.sort((a, b) => b - a);
    m.n = m.ups.length;
    m.last = m.ups[0] || 0;
    m.gap = m.last ? crmDays(m.last) : null;
    m.joinDays = m.join ? crmDays(new Date(m.join).getTime()) : null;
    // 이번 달 몇 개 — 달이 바뀌면 0부터 다시 센다
    const mStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    m.mon = m.ups.filter(t => t >= mStart).length;
    /* 복귀 — 사흘 안에 올렸는데 그 직전과 열흘 넘게 벌어져 있다.
       돌아온 사람에게는 「오랜만이네요」가 첫 문장이어야 한다. */
    const prev = m.n > 1 ? Math.floor((m.ups[0] - m.ups[1]) / DAY) : null;
    m.state = !m.n ? 'seed'
      : (m.gap <= 3 && prev != null && prev >= 10) ? 'back'
      : m.gap <= 7 ? 'live'
      : m.gap <= 29 ? 'quiet'
      : 'sleep';
    m.name = m.nick || ('회원 ' + String(m.id).slice(0, 4));
    /* 가입만 하고 이틀이 지나도록 한 개도 안 올린 새싹 — 첫 업로드를 못 하면
       그 사람은 이 앱을 한 번도 안 써본 것이다. 하루는 기다려 준다. */
    m.call = m.state === 'back' || m.state === 'quiet'
      || (m.state === 'seed' && m.joinDays != null && m.joinDays >= 2);
    return m;
  }).sort((a, b) => {
    const r = (NEEDS_CALL[a.state] || 9) - (NEEDS_CALL[b.state] || 9);
    return r || (b.last - a.last);
  });
}

/* 같은 「3일」도 상태마다 다른 말이다 — 돌아온 사람에게 「3일째 조용」이라고
   하면 방금 온 사람을 나무라는 말이 된다. */
const crmWhen = m => {
  if (m.state === 'seed') return m.joinDays == null ? '가입함'
    : m.joinDays === 0 ? '오늘 가입' : m.joinDays + '일 전 가입';
  if (m.gap === 0) return m.state === 'back' ? '오늘 돌아옴' : '오늘 올림';
  if (m.state === 'back') return m.gap + '일 전 돌아옴';
  if (m.state === 'live') return m.gap + '일 전 올림';
  return m.gap + '일째 조용';
};

/* 프로가 뭐라고 말을 걸면 되는지 — 빈 화면 앞에서 첫 문장을 고민하지 않게.
   지난 스윙 이야기가 들어가야 편지가 되고, 안 들어가면 단체문자가 된다. */
function crmOpener(m) {
  if (m.state === 'seed') return '가입은 하셨는데 아직 한 개도 안 올리셨어요. '
    + '「대충 찍어도 됩니다」 한마디면 첫 영상이 옵니다.';
  if (m.state === 'back') return (m.gap === 0 ? '오늘' : m.gap + '일 전에')
    + ' 돌아왔어요. 첫 문장을 「돌아오셨네요」로 여세요 — 밀린 이야기는 하지 않습니다.';
  return m.gap + '일째 조용합니다. 지난 스윙에서 짚었던 것을 걸고 물어보세요.';
}

/* ── 연락할 사람 ─────────────────────────────────────────────────────
   프로가 명부를 뒤져서 찾는 게 아니라, 화면이 먼저 올려준다.
   찾아다녀야 하는 일은 결국 안 하게 된다. */
function crmCallBox(limit) {
  const list = crmRoster().filter(m => m.call).slice(0, limit || 6);
  if (!list.length) return '';
  return `<div data-crm-callbox style="background:var(--ns-card);border:1px solid var(--ns-line);
      border-radius:14px;padding:15px 17px;display:flex;flex-direction:column;gap:11px">
    <div style="display:flex;align-items:baseline;gap:8px">
      <span style="font-size:13.5px;font-weight:700;color:var(--ns-ink)">먼저 연락할 사람</span>
      <span style="font-size:12px;font-weight:700;font-family:var(--font-num);color:#FFF;
        background:var(--ns-bronze);border-radius:8px;padding:1px 7px">${list.length}</span>
      <span style="flex:1"></span>
      ${S.view === 'mo' ? '' : `<span style="font-size:11px;color:var(--ns-ink3);
        white-space:nowrap">한 주에 두 명이면 충분합니다</span>`}
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${list.map(m => `<div data-crm-mem="${esc(m.id)}" style="display:flex;align-items:flex-start;
        gap:10px;padding:11px 12px;border:1px solid var(--ns-line);border-radius:11px;
        background:${ST[m.state].bg};cursor:pointer">
        <span style="flex:none;width:28px;height:28px;border-radius:50%;background:var(--ns-green);
          color:#FFF;display:flex;align-items:center;justify-content:center;font-size:11.5px;
          font-weight:700">${esc(m.name[0])}</span>
        <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
          <span style="display:flex;align-items:center;gap:7px">
            <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">${esc(m.name)}</span>
            <span style="font-size:9.5px;font-weight:800;letter-spacing:.05em;color:${ST[m.state].c}">
              ${ST[m.state].nm}</span>
            <span style="font-size:10.5px;color:var(--ns-ink3);font-family:var(--font-num)">
              ${esc(crmWhen(m))}</span></span>
          <span style="font-size:11.5px;line-height:1.65;color:var(--ns-ink2)">
            ${esc(crmOpener(m))}</span></span>
      </div>`).join('')}
    </div></div>`;
}

/* ── 회원 관리 (진짜) ─────────────────────────────────────────────── */
function crmMembers() {
  if (!IN.ready) {
    inLoad();
    return `<div style="flex:1;display:flex;align-items:center;justify-content:center;
      background:var(--ns-bg);color:var(--ns-ink3);font-size:13px">회원 명부를 불러오는 중…</div>`;
  }
  const all = crmRoster();
  const cnt = {};
  all.forEach(m => { cnt[m.state] = (cnt[m.state] || 0) + 1; });
  const on = S.mstate && ST[S.mstate] ? S.mstate : '전체';
  const list = on === '전체' ? all : all.filter(m => m.state === on);

  const chip = (k, nm, n) => `<span data-mstate="${k}" style="font-size:11.5px;
    font-weight:${on === k ? 700 : 600};color:${on === k ? '#FFF' : 'var(--ns-ink2)'};
    background:${on === k ? 'var(--ns-green)' : 'var(--ns-card)'};
    border:1px solid ${on === k ? 'var(--ns-green)' : 'var(--ns-line)'};
    border-radius:9px;padding:6px 11px;cursor:pointer;white-space:nowrap">${nm}${
      n == null ? '' : ` <b style="font-family:var(--font-num)">${n}</b>`}</span>`;

  const row = m => `<div data-crm-mem="${esc(m.id)}" style="display:flex;align-items:center;gap:13px;
      padding:14px 16px;border-bottom:1px solid var(--ns-line);cursor:pointer">
    <span style="flex:none;width:36px;height:36px;border-radius:50%;background:var(--ns-green);
      color:#FFF;display:flex;align-items:center;justify-content:center;font-size:13px;
      font-weight:700">${esc(m.name[0])}</span>
    <span style="flex:2;min-width:0;display:flex;flex-direction:column;gap:3px">
      <span style="display:flex;align-items:center;gap:7px;min-width:0">
        <span style="font-size:13.5px;font-weight:700;color:var(--ns-ink);white-space:nowrap;
          overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</span>
        ${m.real ? `<span style="font-size:11px;color:var(--ns-ink3);white-space:nowrap">
          ${esc(m.real)}</span>` : ''}
        <span style="flex:none;font-size:9.5px;font-weight:800;letter-spacing:.05em;
          color:${ST[m.state].c};background:${ST[m.state].bg};border-radius:6px;
          padding:2px 7px">${ST[m.state].nm}</span></span>
      <span style="font-size:11px;color:var(--ns-ink3);font-family:var(--font-num)">
        ${esc(crmWhen(m))}${m.joinDays != null ? ' · 가입 ' + m.joinDays + '일째' : ''}</span></span>
    <span style="flex:1;display:flex;gap:14px;font-size:11.5px;color:var(--ns-ink2);
      font-family:var(--font-num);white-space:nowrap">
      <span>스윙 <b style="color:var(--ns-ink)">${m.n}</b></span>
      <span>이번 달 <b style="color:var(--ns-ink)">${m.mon}</b></span>
      <span>한마디 <b style="color:var(--ns-ink)">${m.cm}</b></span></span>
    <span style="flex:none;width:120px;text-align:right;display:flex;gap:6px;justify-content:flex-end">
      ${m.unseen ? `<span title="아직 안 열어본 스윙" style="font-size:10.5px;font-weight:700;
        color:#FFF;background:var(--ns-danger);border-radius:7px;padding:2px 7px">안 봄 ${m.unseen}</span>` : ''}
      ${m.wait ? `<span style="font-size:10.5px;font-weight:700;color:var(--ns-bronze);
        background:var(--ns-sand);border-radius:7px;padding:2px 7px">답 기다림 ${m.wait}</span>` : ''}
    </span></div>`;

  return `<div style="flex:1;overflow-y:auto;background:var(--ns-bg)">
    <div style="padding:24px 28px 40px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
        <span style="font-size:23px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">
          회원 관리</span>
        <span style="font-size:13px;color:var(--ns-ink3)">${all.length}명</span>
        <span style="flex:1"></span>
        <span data-in-reload style="font-size:11.5px;font-weight:700;color:var(--ns-green);
          cursor:pointer">새로고침</span>
      </div>

      ${crmCallBox(6)}

      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${chip('전체', '전체', all.length)}
        ${ST_ORDER.map(k => chip(k, ST[k].nm, cnt[k] || 0)).join('')}
      </div>

      <div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:14px;
        overflow:hidden">
        ${list.length ? list.map(row).join('')
          : `<div style="padding:34px;text-align:center;font-size:12.5px;color:var(--ns-ink3)">
              여기 해당하는 회원이 없어요</div>`}
      </div>

      <span style="font-size:11.5px;color:var(--ns-ink3);line-height:1.75">
        상태는 <b style="color:var(--ns-ink2)">마지막 업로드가 며칠 전인가</b>로 자동으로 갈립니다 —
        손으로 매기지 않습니다. ${ST_ORDER.map(k => ST[k].nm + '은(는) ' + ST[k].d).join(' · ')}.
      </span>
    </div></div>`;
}

/* 모바일 — 세로로 쌓는다. 순서는 같다(연락할 사람이 맨 위) */
function crmMembersMO() {
  if (!IN.ready) { inLoad(); return '<div style="flex:1;display:flex;align-items:center;'
    + 'justify-content:center;color:var(--ns-ink3);font-size:12.5px">불러오는 중…</div>'; }
  const all = crmRoster();
  return `<div style="flex:1;overflow-y:auto;padding:12px 12px 20px;display:flex;
      flex-direction:column;gap:14px">
    ${crmCallBox(4)}
    ${ST_ORDER.map(k => {
      const list = all.filter(m => m.state === k);
      if (!list.length) return '';
      return `<div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:baseline;gap:7px;padding:0 3px">
          <span style="font-size:12.5px;font-weight:700;color:${ST[k].c}">${ST[k].nm}</span>
          <span style="font-size:11.5px;font-weight:700;font-family:var(--font-num);
            color:var(--ns-ink3)">${list.length}</span>
          <span style="font-size:10.5px;color:var(--ns-ink3)">${ST[k].d}</span></div>
        ${list.map(m => `<div data-crm-mem="${esc(m.id)}" style="background:var(--ns-card);
          border:1px solid var(--ns-line);border-radius:12px;padding:12px 13px;display:flex;
          align-items:center;gap:10px;cursor:pointer">
          <span style="flex:none;width:30px;height:30px;border-radius:50%;background:var(--ns-green);
            color:#FFF;display:flex;align-items:center;justify-content:center;font-size:12px;
            font-weight:700">${esc(m.name[0])}</span>
          <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">${esc(m.name)}</span>
            <span style="font-size:10.5px;color:var(--ns-ink3);font-family:var(--font-num)">
              ${esc(crmWhen(m))} · 스윙 ${m.n} · 한마디 ${m.cm}</span></span>
          ${m.unseen ? `<span style="flex:none;font-size:10px;font-weight:700;color:#FFF;
            background:var(--ns-danger);border-radius:7px;padding:2px 6px">안 봄 ${m.unseen}</span>` : ''}
        </div>`).join('')}</div>`;
    }).join('')}
  </div>`;
}

/* 회원 한 명을 누르면 그 사람 스윙만 도착함에 걸러 보여준다 —
   말을 걸기 전에 무엇을 올렸는지 봐야 첫 문장이 나온다. */
function crmWire() {
  on('[data-mstate]', 'click', e => { S.mstate = e.currentTarget.dataset.mstate; render(); });
  on('[data-crm-mem]', 'click', e => {
    const id = e.currentTarget.dataset.crmMem;
    const sw = (IN.list || []).filter(s => s.owner === id);
    if (!sw.length) return toast('아직 올린 스윙이 없어요');
    IN.sel = sw[0].id;
    S.back.push({ nav: S.nav, card: S.card, mtab: S.mtab });
    S.nav = 'inbox';
    render();
  });
}

/* 사이드바 배지 — 서버가 아직 안 왔으면 0. 없는 숫자로 빨간 점을 켜지 않는다. */
function crmCallN() {
  if (!IN.ready || IN.err) return 0;
  return crmRoster().filter(m => m.call).length;
}
