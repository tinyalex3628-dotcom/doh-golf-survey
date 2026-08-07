"use strict";
/* ── NEXT SWING 관리자 콘솔 ──────────────────────────────────────────
   프로가 회원의 스윙에 답을 다는 화면이다.
   이 화면의 존재 이유는 '댓글 창'이 아니라 —
   답을 쓰기 전에 그 회원의 지난 것들이 눈앞에 같이 있는 것이다.
   그게 없으면 답이 일반론이 되고, 회원은 바로 알아챈다. */

const S = {
  view: 'pc',          // pc | mo
  nav: 'home',         // 상단 카테고리에서 고른 곳
  more: false,         // '그 외' 펼침
  bell: false,         // 알림함 펼침
  read: {},            // 읽은 알림
  steps: { ...ALERT_ON },   // 몇 시간마다 알릴지
  how: Object.fromEntries(ALERT_HOW.map(([k, , , on]) => [k, on])),
  quiet: true,         // 조용한 시간
  fold: false,         // 요청함 접기 (영상에 집중할 때)
  mview: 'board',      // 회원 관리 보기: 등급별 | 목록
  mstate: '전체',      // 회원 관리 상태 거르개 (admin-crm.js)
  wback: 0,            // 주간 지표: 0 = 이번 주, 1 = 지난주
  mtab: 'sum',         // 회원 세부 안의 부제목
  back: [],            // 어디서 왔는지 (뒤로 가기)
  pick: 'q2',          // 지금 고른 요청
  done: {},            // 답을 보낸 요청
  draft: {},           // 요청별로 쓰던 글 (사람 바꿔도 안 날아간다)
  shots: {},           // 요청별 첨부 장면 [{t:'0:10', lines:[...]}]
  mo: 'q',             // 모바일 화면: q(요청함) w(쓰기) h(히스토리) d(보냄)
  hist: false,         // PC 회원 카드 열림
  card: null,          // 회원 카드로 연 사람 (요청과 별개로 열 수 있다)
  mark: null,          // 장면 편집 중 {qid, at, i}
  tool: '#C0392B',
  open: {},            // 펼쳐 본 지난 한마디
};

const $ = s => document.querySelector(s);
const cur = () => Q.find(q => q.id === S.pick) || Q[0];
const mem = q => M[q.m];
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
/* 48시간 약속이니 시간으로 세는 게 맞다. '1.8일'은 급한지 안 급한지가 안 읽힌다. */
const left = h => h + '시간 남음';
const urgent = h => h <= 12;
const waiting = () => Q.filter(q => !S.done[q.id]);
const urgentN = () => waiting().filter(q => urgent(q.left)).length;
const won = n => n.toLocaleString('ko-KR');
const PRICE_OF = { '무료': 0, Basic: 19000, Coaching: 39000, Elite: 79000 };
const shots = id => (S.shots[id] = S.shots[id] || []);
/* 편집 중인 장면 */
const editing = () => S.mark && shots(S.mark.qid)[S.mark.i];

/* ── 알림 ──────────────────────────────────────────────────────────
   요청이 온 지 몇 시간 됐는지는 48 - (남은 시간) 으로 나온다.
   켜 둔 단계 중 이미 지난 것만 알림이 된다. 한 요청에 여러 단계가 지났으면
   제일 마지막 것만 보여준다 — 같은 사람이 다섯 줄로 쌓이면 안 읽는다. */
const elapsed = q => 48 - q.left;
function alerts() {
  const out = [];
  waiting().forEach(q => {
    const e = elapsed(q);
    const hit = ALERT_STEPS.filter(h => S.steps[h] && e >= h);
    if (!hit.length) return;
    const at = hit[hit.length - 1];
    out.push({ id: q.id + '@' + at, q, at, e, n: hit.length });
  });
  return out.sort((a, b) => a.q.left - b.q.left);
}
const unread = () => alerts().filter(a => !S.read[a.id]).length;

/* ── 소진율 ────────────────────────────────────────────────────────
   등급에 맞는 횟수를 쓰고 있느냐 — 이게 이 장사의 이탈 신호다.
   안 쓰는 사람은 다음 결제일에 조용히 해지한다. 숫자보다 이걸 먼저 봐야 한다. */
function usage(m) {
  const [used, all] = m.quota;
  // 무료는 줄 횟수가 없다. 이 사람들에게 볼 것은 '올리고는 있나' 다.
  if (m.plan === '무료') return { free: true, used: 0, all: 0, p: 0, gone: 0,
    state: m.vids.length >= 2 ? 'ok' : 'low',
    col: m.vids.length >= 2 ? 'var(--ns-green)' : 'var(--ns-ink3)',
    word: m.vids.length >= 2 ? '올리고는 있어요' : '거의 안 써요' };
  const p = all ? Math.round(used / all * 100) : 0;
  // 이번 달이 얼마나 지났는지와 견준다. 달 초에 0% 인 건 정상이다.
  const gone = Math.round((31 - STAT.monthLeft) / 31 * 100);
  const state = used === 0 ? 'none' : p >= 100 ? 'full' : p >= gone - 15 ? 'ok' : 'low';
  const col = { none: 'var(--ns-danger)', low: 'var(--ns-bronze)',
                ok: 'var(--ns-green)', full: 'var(--ns-green2)' }[state];
  const word = { none: '한 번도 안 썼어요', low: '덜 쓰고 있어요',
                 ok: '잘 쓰고 있어요', full: '다 썼어요' }[state];
  return { used, all, p, gone, state, col, word };
}
/* 이번 달 한 번도 안 쓴 유료 회원 — 먼저 연락할 사람들 */
const sleeping = () => Object.entries(M).filter(([, m]) => m.plan !== '무료' && m.quota[0] === 0);

/* 퍼센트 바 하나 */
function usageBar(m, big) {
  const u = usage(m);
  if (u.free) return `<div style="display:flex;flex-direction:column;gap:${big ? 6 : 4}px;min-width:0">
    <div style="display:flex;align-items:baseline;gap:7px">
      <span style="font-size:${big ? 12.5 : 11.5}px;font-weight:700;color:${u.col}">무료</span>
      <span style="flex:1;font-size:${big ? 11.5 : 10.5}px;font-weight:600;color:${u.col}">${u.word}</span>
      <span style="font-size:${big ? 11.5 : 10.5}px;font-weight:700;font-family:var(--font-num);
        color:var(--ns-ink3)">영상 ${m.vids.length}</span></div>
    <span style="font-size:${big ? 11 : 10.5}px;font-weight:500;color:var(--ns-ink3);line-height:1.6">
      ${m.vids.length >= 2 ? '결제로 넘어올 수 있는 사람입니다' : '아직 앱에 자리를 안 잡았어요'}</span>
  </div>`;
  return `<div style="display:flex;flex-direction:column;gap:${big ? 6 : 5}px;min-width:0">
    <div style="display:flex;align-items:baseline;gap:7px">
      <span style="font-size:${big ? 12.5 : 11.5}px;font-weight:700;font-family:var(--font-num);
        color:${u.col}">${u.used}/${u.all}회</span>
      <span style="flex:1;font-size:${big ? 11.5 : 10.5}px;font-weight:600;color:${u.col};
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.word}</span>
      <span style="font-size:${big ? 11.5 : 10.5}px;font-weight:700;font-family:var(--font-num);
        color:var(--ns-ink3)">${u.p}%</span>
    </div>
    <div style="position:relative;height:${big ? 8 : 6}px;border-radius:9px;background:var(--ns-sand);
      overflow:hidden">
      <span style="display:block;height:100%;width:${u.p}%;border-radius:9px;background:${u.col}"></span>
      <span title="오늘까지 지난 만큼" style="position:absolute;top:-2px;bottom:-2px;left:${u.gone}%;
        width:1.5px;background:rgba(29,36,32,.32)"></span>
    </div>
    ${big ? `<span style="font-size:11px;font-weight:500;color:var(--ns-ink3);line-height:1.6">
      세로선이 오늘입니다. 이번 달 ${STAT.monthLeft}일 남았고 ${u.all - u.used}회 남았어요.
      ${u.state === 'none' ? ' 먼저 연락해볼 자리입니다.' : ''}</span>` : ''}
  </div>`;
}

/* ── 조각들 ─────────────────────────────────────────────────────── */

/* 스윙 그림 하나 — 영상 · 썸네일 · 캡쳐된 장면이 다 이걸 쓴다 */
const FIG = (w) => `<svg viewBox="0 0 120 200" style="height:${w};opacity:.5"><g fill="none"
  stroke="#7E8C7A" stroke-width="2.4" stroke-linecap="round"><circle cx="60" cy="26" r="12"/>
  <path d="M60 38v56M60 52 38 74M60 52l24 20M60 94l-14 46M60 94l16 46M84 72l16-34"/></g></svg>`;

/* 영상 자리. 세로로 길다 — 연습장에서 폰을 세워 찍는 게 대부분이다.
   제일 큰 버튼은 재생이 아니라 '이 장면 캡쳐' 다. 대표님이 실제로 하는 일이
   '올라온 화면에 선 몇 개 긋고 첨부' 라서, 그 길을 제일 짧게 만든다. */
function player(q, h) {
  return `<div style="position:relative;background:#12160F;border-radius:12px;overflow:hidden;
      height:${h};aspect-ratio:9/16;flex:none;display:flex;align-items:center;justify-content:center">
    ${FIG('78%')}
    <span style="position:absolute;left:9px;top:9px;font-size:10.5px;font-weight:700;
      color:#EDEDE8;background:rgba(0,0,0,.42);border-radius:6px;padding:4px 8px">
      ${esc(q.view)} · ${esc(q.club)}</span>
    <div style="position:absolute;left:0;right:0;bottom:0;padding:9px 10px 10px;display:flex;
      flex-direction:column;gap:9px;background:linear-gradient(transparent,rgba(0,0,0,.72))">
      <div style="display:flex;align-items:center;gap:8px">
        <span data-play style="width:26px;height:26px;border-radius:50%;background:#FFF;flex:none;
          display:flex;align-items:center;justify-content:center;cursor:pointer">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="#12160F"><path d="M7 4v16l13-8z"/></svg></span>
        <span data-scrub style="flex:1;height:3px;border-radius:9px;background:rgba(255,255,255,.24);cursor:pointer">
          <span style="display:block;width:38%;height:100%;border-radius:9px;background:#FFF"></span></span>
        <span style="font-size:10px;font-weight:600;color:#EDEDE8;font-family:var(--font-num);
          white-space:nowrap">0:10 / ${esc(q.dur)}</span>
      </div>
      <span data-capture style="display:flex;align-items:center;justify-content:center;gap:7px;
        background:#FFF;color:#12160F;border-radius:9px;padding:${z(9, 11)}px;font-size:${z(12, 13)}px;
        font-weight:700;cursor:pointer">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="3.4"/>
          <path d="M8.5 6 10 3.5h4L15.5 6"/></svg>
        이 장면 캡쳐 · 선 긋기</span>
    </div>
    <div style="position:absolute;right:9px;top:9px;display:flex;flex-direction:column;gap:6px">
      ${['0.25x', '0.5x', '구간반복'].map((t, i) => `<span data-speed="${t}"
        style="font-size:10px;font-weight:600;border-radius:6px;padding:5px 8px;cursor:pointer;
        text-align:center;color:${i === 0 ? '#12160F' : '#EDEDE8'};
        background:${i === 0 ? '#FFF' : 'rgba(0,0,0,.42)'}">${t}</span>`).join('')}
    </div>
  </div>`;
}

/* 첨부된 장면 하나 — 선까지 그대로 작게 그린다 */
function shotChip(sh, i, small) {
  const w = small ? 52 : z(64, 82);
  return `<span data-shot="${i}" style="position:relative;flex:none;width:${w}px;height:${Math.round(w * 4 / 3)}px;
    border-radius:9px;background:#1B2019;border:1px solid var(--ns-line);overflow:hidden;
    display:flex;align-items:center;justify-content:center;cursor:pointer">
    ${FIG('72%')}
    <svg viewBox="0 0 300 400" preserveAspectRatio="none"
      style="position:absolute;inset:0;width:100%;height:100%">${sh.lines.map(l =>
      `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="${l[4]}" stroke-width="7"
       stroke-linecap="round"/>`).join('')}</svg>
    <span style="position:absolute;left:0;right:0;bottom:0;font-size:9px;font-weight:700;color:#EDEDE8;
      background:rgba(0,0,0,.55);text-align:center;padding:2px 0;font-family:var(--font-num)">${esc(sh.at)}</span>
  </span>`;
}

/* PC 는 작업대다. 글자와 칸을 키운다 — 하루에 열 명씩 답하는데 11px 로는 못 읽는다. */
const B = () => S.view === 'pc';
const z = (mo, pc) => (B() ? pc : mo);

/* 회원이 올리면서 같이 남긴 것. 이게 곧 질문이다.
   영상 바로 옆에 둔다 — 영상을 보면서 질문을 읽어야 답이 그 질문에 붙는다. */
function memo(q, side) {
  const m = mem(q);
  const row = (k, v) => `<div style="display:flex;align-items:baseline;gap:10px;padding:7px 0;
    border-top:1px solid rgba(0,0,0,.06)">
    <span style="flex:none;width:${z(46, 52)}px;font-size:${z(10.5, 11.5)}px;font-weight:600;
      color:var(--ns-ink3)">${k}</span>
    <span style="flex:1;font-size:${z(12, 13)}px;font-weight:600;color:var(--ns-ink)">${esc(v)}</span></div>`;
  return `<div style="${side ? 'flex:1;min-width:0;' : ''}background:var(--ns-sand);border-radius:12px;
      padding:${z(13, 16)}px ${z(14, 17)}px;display:flex;flex-direction:column;gap:${z(9, 11)}px;
      ${side ? 'overflow-y:auto;' : ''}">
    <span style="font-size:${z(9.5, 10.5)}px;font-weight:700;letter-spacing:.14em;color:var(--ns-ink3)">
      회원이 적은 것</span>
    <span style="font-size:${z(13, 15)}px;font-weight:500;color:var(--ns-ink);line-height:1.85">
      “${esc(q.note)}”</span>
    <div style="display:flex;flex-direction:column;padding-top:2px">
      ${row('클럽', q.club)}${row('각도', q.view)}${row('연습', q.min + '분')}
      ${row('느낌', q.feel)}${row('올린 때', q.ago)}${row('길이', q.dur)}
    </div>
    ${side ? `<div style="padding-top:4px;display:flex;flex-direction:column;gap:5px">
      <span style="font-size:${z(9.5, 10.5)}px;font-weight:700;letter-spacing:.14em;
        color:var(--ns-ink3)">이번 달 한마디</span>
      <span style="font-size:${z(12, 13)}px;font-weight:600;color:var(--ns-ink2)">
        ${m.quota[0]}/${m.quota[1]}회 썼어요</span></div>` : ''}
  </div>`;
}

/* 이 화면의 심장 — 내가 이 사람에게 지금까지 뭐라고 했는지.
   프로가 쓰는 한마디는 실제로 서너 문단이다. 잘라 놓으면 매번 눌러서 열어야 하고,
   그러면 안 읽고 쓰게 된다. 통째로 보여주고 칸이 스크롤되게 한다. */
function history(q) {
  const m = mem(q);
  const box = (label, body) => `<div style="display:flex;flex-direction:column;gap:${z(7, 9)}px">
    <span style="font-size:${z(9.5, 10.5)}px;font-weight:700;letter-spacing:.14em;color:var(--ns-ink3)">${label}</span>
    ${body}</div>`;

  const av = z(38, 46);
  /* 얼마나 오래 낸 사람인지, 요즘 얼마나 치는지 — 답의 세기가 여기서 갈린다.
     3개월 낸 사람과 이번 달 시작한 사람에게 같은 말을 하면 안 된다. */
  const dd = m.days - (m.daysPrev || 0);
  const fact = (k, v, note, col) => `<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
    <span style="font-size:${z(9.5, 10.5)}px;font-weight:600;color:var(--ns-ink3)">${k}</span>
    <span style="font-size:${z(12, 13.5)}px;font-weight:700;color:${col || 'var(--ns-ink)'};
      font-family:var(--font-num)">${v}</span>
    ${note ? `<span style="font-size:${z(10, 11)}px;font-weight:500;color:var(--ns-ink3)">${note}</span>` : ''}
  </div>`;
  const who = `<div style="display:flex;flex-direction:column;gap:${z(11, 14)}px">
    <div style="display:flex;align-items:center;gap:${z(10, 13)}px">
      <span style="width:${av}px;height:${av}px;border-radius:50%;background:var(--ns-green);color:#FFF;
        flex:none;display:flex;align-items:center;justify-content:center;font-size:${z(13, 16)}px;font-weight:700">
        ${esc(m.name[0])}</span>
      <span style="flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:${z(13.5, 16)}px;font-weight:700;color:var(--ns-ink)">${esc(m.name)}
          <span style="font-size:${z(11, 12.5)}px;font-weight:500;color:var(--ns-ink3)">${esc(m.real)}</span></span>
        <span style="font-size:${z(11, 12.5)}px;font-weight:500;color:var(--ns-ink3)">
          ${esc(m.plan)} · ${m.months}개월째 · 한마디 ${m.quota[0]}/${m.quota[1]}회</span></span></div>
    <div style="display:flex;gap:${z(10, 14)}px;background:var(--ns-sand);border-radius:11px;
      padding:${z(11, 13)}px ${z(12, 15)}px">
      ${fact('처음 온 날', esc(m.join), '가입')}
      ${fact('첫 결제', esc(m.pay1), m.join === m.pay1 ? '가입한 날 바로' : '')}
      ${fact('이번 달 연습', m.days + '일',
        dd > 0 ? `지난달보다 ${dd}일 늘었어요` : dd < 0 ? `지난달보다 ${-dd}일 줄었어요` : '지난달과 같아요',
        dd < 0 ? 'var(--ns-danger)' : dd > 0 ? 'var(--ns-green)' : '')}
    </div>
  </div>`;

  const prog = m.program
    ? `<div style="background:var(--ns-soft);border:1px solid #DCE7DE;border-radius:11px;
         padding:${z(11, 14)}px ${z(12, 15)}px;display:flex;flex-direction:column;gap:5px">
        <span style="font-size:${z(12.5, 14.5)}px;font-weight:700;color:var(--ns-green)">${esc(m.program)}</span>
        <span style="font-size:${z(11, 12.5)}px;font-weight:500;color:var(--ns-ink2)">${esc(m.week)}</span>
        ${m.homework.length ? `<span style="font-size:${z(11, 12.5)}px;font-weight:400;color:var(--ns-ink3);
          line-height:1.7;padding-top:4px">숙제 — ${m.homework.map(esc).join(' · ')}</span>` : ''}
      </div>`
    : `<div style="background:var(--ns-sand);border-radius:11px;padding:${z(11, 14)}px ${z(12, 15)}px;
        font-size:${z(11.5, 13)}px;font-weight:500;color:var(--ns-ink3);line-height:1.7">
        정기 피드백을 안 받는 등급이에요. 이번 한마디가 이 사람이 받는 전부입니다.</div>`;

  /* 다섯 개를 통째로 펼쳐 놓으면 스크롤만 길어져서 오히려 안 읽는다.
     첫 두 줄만 보이고, 필요한 것만 눌러서 연다. */
  const past = m.past.map((p, i) => {
    const key = m.name + i;
    const op = !!S.open[key];
    const lines = p.txt.split('\n\n');
    return `<div data-past="${key}" style="border:1px solid var(--ns-line);background:var(--ns-white);
      border-radius:11px;padding:${z(11, 14)}px ${z(12, 15)}px;display:flex;flex-direction:column;
      gap:${z(5, 7)}px;cursor:pointer">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:${z(11, 12.5)}px;font-weight:700;color:var(--ns-bronze);font-family:var(--font-num)">${esc(p.d)}</span>
        <span style="flex:1;font-size:${z(10.5, 11.5)}px;font-weight:500;color:var(--ns-ink3)">${esc(p.club)}</span>
        ${p.photo ? `<span style="font-size:${z(10, 11)}px;font-weight:600;color:var(--ns-ink3)">사진 ${p.photo}</span>` : ''}
      </div>
      <span style="font-size:${z(11.5, 13.5)}px;font-weight:400;color:var(--ns-ink2);line-height:1.8;
        ${op ? 'white-space:pre-wrap' : 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'}"
        >${esc(op ? p.txt : lines[0])}</span>
      ${lines.length > 1 || p.txt.length > 60 ? `<span style="font-size:${z(10.5, 11.5)}px;font-weight:700;
        color:var(--ns-green)">${op ? '접기' : '더 보기'}${op ? '' : ` · ${lines.length}문단`}</span>` : ''}
    </div>`;
  }).join('');

  const jn = m.journey.length
    ? `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">${m.journey.map((t, i) =>
        `${i ? `<span style="font-size:${z(10, 11)}px;color:var(--ns-ink3)">›</span>` : ''}
         <span style="font-size:${z(10.5, 12)}px;font-weight:${i === m.journey.length - 1 ? 700 : 500};
           color:${i === m.journey.length - 1 ? 'var(--ns-green)' : 'var(--ns-ink3)'};
           background:${i === m.journey.length - 1 ? 'var(--ns-soft)' : 'var(--ns-sand)'};
           border-radius:8px;padding:${z(5, 7)}px ${z(8, 11)}px">${esc(t)}</span>`).join('')}</div>`
    : `<span style="font-size:${z(11.5, 13)}px;color:var(--ns-ink3)">아직 짚어온 게 없어요. 이번이 첫 방향입니다.</span>`;

  const vw = z(62, 86), vh = z(74, 106);
  const vids = m.vids.map(v =>
    `<span data-vid style="flex:none;width:${vw}px;display:flex;flex-direction:column;gap:5px;cursor:pointer">
      <span style="height:${vh}px;border-radius:9px;background:#1B2019;border:${v.today ? '2px solid var(--ns-green)' : '1px solid var(--ns-line)'};
        display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 120 200" style="height:70%;opacity:.45"><g fill="none" stroke="#7E8C7A"
          stroke-width="4" stroke-linecap="round"><circle cx="60" cy="26" r="12"/>
          <path d="M60 38v56M60 52 38 74M60 52l24 20M60 94l-14 46M60 94l16 46"/></g></svg></span>
      <span style="font-size:${z(9.5, 11)}px;font-weight:${v.today ? 700 : 500};font-family:var(--font-num);
        color:${v.today ? 'var(--ns-green)' : 'var(--ns-ink3)'};text-align:center">${v.today ? '오늘' : esc(v.d.replace('월 ', '/').replace('일', ''))}</span>
    </span>`).join('');

  return `<div style="display:flex;flex-direction:column;gap:${z(16, 20)}px">
    ${who}
    ${box('이번 달 한마디를 쓰고 있나', usageBar(m, 1))}
    ${box('지금 하는 것', prog)}
    ${box(`내가 지난번에 한 말 ${m.past.length}개`,
      `<div style="display:flex;flex-direction:column;gap:${z(8, 10)}px">${past}</div>`)}
    ${box('과거 스윙 · 눌러서 나란히 보기',
      `<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px">${vids}</div>`)}
    ${box('짚어온 것', jn)}
  </div>`;
}

/* 답 쓰는 곳 */
function writer(q, tall) {
  const d = S.draft[q.id] || '';
  const sh = shots(q.id);
  return `<div style="display:flex;flex-direction:column;gap:${z(9, 11)}px">
    <div style="display:flex;gap:7px;padding-bottom:1px;${B() ? 'flex-wrap:wrap' : 'overflow-x:auto'}">
      ${SNIP.map((s, i) => `<span data-snip="${i}" style="flex:none;font-size:${z(10.5, 12)}px;font-weight:600;
        color:var(--ns-ink2);background:var(--ns-sand);border-radius:9px;padding:${z(7, 9)}px ${z(10, 13)}px;
        white-space:nowrap;cursor:pointer">${esc(s)}</span>`).join('')}
    </div>
    <textarea data-txt placeholder="${esc(mem(q).name)} 님에게 남길 말을 쓰세요"
      style="width:100%;box-sizing:border-box;height:${tall ? 150 : z(104, 200)}px;resize:vertical;
      border:1px solid var(--ns-line);border-radius:12px;padding:${z(12, 15)}px ${z(13, 16)}px;background:var(--ns-white);
      font-family:'Pretendard',-apple-system,sans-serif;font-size:${z(13, 14.5)}px;font-weight:400;
      color:var(--ns-ink);line-height:1.85;outline:none">${esc(d)}</textarea>
    ${sh.length ? `<div style="display:flex;flex-direction:column;gap:6px">
      <span style="font-size:${z(9.5, 10.5)}px;font-weight:700;letter-spacing:.14em;color:var(--ns-ink3)">
        같이 보낼 장면 ${sh.length}</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${sh.map((x, i) => shotChip(x, i)).join('')}
        <span data-addshot style="flex:none;width:${z(64, 82)}px;height:${Math.round(z(64, 82) * 4 / 3)}px;
          border:1.5px dashed var(--ns-line);border-radius:9px;display:flex;align-items:center;
          justify-content:center;color:var(--ns-ink3);cursor:pointer;font-size:${z(10.5, 11.5)}px;
          font-weight:600;text-align:center;line-height:1.4">장면<br>추가</span>
      </div>
      <span style="font-size:${z(10.5, 11.5)}px;font-weight:500;color:var(--ns-ink3)">
        장면을 누르면 선을 고칠 수 있어요</span>
    </div>` : ''}
    <div style="display:flex;align-items:center;gap:9px">
      ${sh.length ? '' : `<span data-addshot style="display:flex;align-items:center;gap:7px;
        font-size:${z(11.5, 13)}px;font-weight:600;color:var(--ns-ink2);border:1px solid var(--ns-line);
        background:var(--ns-white);border-radius:10px;padding:${z(8, 11)}px ${z(11, 14)}px;cursor:pointer">
        <svg viewBox="0 0 24 24" width="${z(13, 15)}" height="${z(13, 15)}" fill="none" stroke="currentColor"
          stroke-width="1.9" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/>
          <path d="m5 16 4.5-4.5 3.5 3.5 3-3L19 15"/><circle cx="9" cy="9.5" r="1.4"/></svg>
        영상에서 장면 가져오기</span>`}
      <span style="flex:1"></span>
      <span data-send style="font-size:${z(13, 14.5)}px;font-weight:600;color:#FFF;background:var(--ns-green);
        border-radius:11px;padding:${z(11, 14)}px ${z(22, 30)}px;cursor:pointer;
        opacity:${d.trim() ? 1 : .38}">보내기</span>
    </div>
  </div>`;
}

/* 요청함 한 줄 — 이 페이지의 주인공은 영상과 답이다.
   목록은 '누구 차례인지'만 알면 되므로 최대한 얇게 만든다. */
function qrow(q, on, wide) {
  const m = mem(q);
  const done = S.done[q.id];
  const av = z(32, wide ? 40 : 34);
  const hot = !done && urgent(q.left);
  return `<div data-q="${q.id}" style="display:flex;gap:${z(10, 10)}px;padding:${z(12, 11)}px ${z(12, 13)}px;
    cursor:pointer;border-bottom:1px solid #F2ECE2;background:${on ? 'var(--ns-soft)' : 'transparent'};
    ${on ? 'box-shadow:inset 3px 0 0 var(--ns-green);' : ''}opacity:${done ? .45 : 1}">
    <span style="width:${av}px;height:${av}px;border-radius:50%;flex:none;display:flex;align-items:center;
      justify-content:center;font-size:${z(12, wide ? 14 : 12.5)}px;font-weight:700;color:#FFF;
      background:${done ? 'var(--ns-ink3)' : 'var(--ns-bronze)'}">${esc(m.name[0])}</span>
    <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
      <span style="display:flex;align-items:baseline;gap:6px">
        <span style="font-size:${z(12.5, 13)}px;font-weight:700;color:var(--ns-ink);white-space:nowrap;
          overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</span>
        <span style="flex:1"></span>
        <span style="flex:none;font-size:${z(10, 10.5)}px;font-weight:700;font-family:var(--font-num);
          white-space:nowrap;color:${done ? 'var(--ns-ink3)' : hot ? 'var(--ns-danger)' : 'var(--ns-ink3)'}">
          ${done ? '답 보냄' : left(q.left)}</span>
      </span>
      <span style="font-size:${z(11, 11.5)}px;font-weight:400;color:var(--ns-ink2);line-height:1.55;
        display:-webkit-box;-webkit-line-clamp:${wide ? 2 : 1};-webkit-box-orient:vertical;
        overflow:hidden">${esc(q.note)}</span>
    </span></div>`;
}

/* 접었을 때 — 아바타와 남은 시간만. 누구 차례인지는 그래도 보인다. */
function qmini(q, on) {
  const m = mem(q);
  const done = S.done[q.id];
  const hot = !done && urgent(q.left);
  return `<div data-q="${q.id}" title="${esc(m.name)} · ${left(q.left)}"
    style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:11px 0;cursor:pointer;
    border-bottom:1px solid #F2ECE2;background:${on ? 'var(--ns-soft)' : 'transparent'};
    ${on ? 'box-shadow:inset 3px 0 0 var(--ns-green);' : ''}opacity:${done ? .4 : 1}">
    <span style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-size:13px;font-weight:700;color:#FFF;
      background:${done ? 'var(--ns-ink3)' : 'var(--ns-bronze)'}">${esc(m.name[0])}</span>
    <span style="font-size:9.5px;font-weight:700;font-family:var(--font-num);
      color:${hot ? 'var(--ns-danger)' : 'var(--ns-ink3)'}">${done ? '완료' : q.left + 'h'}</span>
  </div>`;
}

/* ── CRM 껍데기 ─────────────────────────────────────────────────
   왼쪽 세로줄 대신 위에서 뻗어나간다. 대시보드가 집이고,
   네모 카드가 각 방으로 들어가는 문이다. */
/* 왼쪽 세로줄 — 어디에 있든 전체 지도가 보인다.
   대시보드의 네모 카드는 그대로 둔다. 둘은 서로 안 부딪친다 —
   세로줄은 '어디로 갈 수 있나', 대시보드는 '지금 뭘 해야 하나' 다. */
function sidebar() {
  const badge = k => k === 'queue' ? waiting().length
                   : k === 'members' ? crmCallN()
                   : k === 'fb' ? 1 : 0;
  const item = ([k, name, d]) => {
    const on = S.nav === k;
    const n = badge(k);
    const hot = (k === 'queue' && urgentN()) || (k === 'members' && crmCallN());
    return `<div data-nav="${k}" style="display:flex;align-items:center;gap:10px;padding:9px 11px;
      border-radius:9px;cursor:pointer;background:${on ? 'rgba(237,237,232,.13)' : 'transparent'}">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
        style="flex:none;color:${on ? '#EDEDE8' : 'rgba(237,237,232,.5)'}"><path d="${d}"/></svg>
      <span style="flex:1;font-size:13px;font-weight:${on ? 700 : 500};
        color:${on ? '#EDEDE8' : 'rgba(237,237,232,.72)'}">${name}</span>
      ${n ? `<span style="flex:none;font-size:10.5px;font-weight:700;font-family:var(--font-num);
        color:${hot ? '#FFF' : 'rgba(237,237,232,.6)'};
        background:${hot ? 'var(--ns-danger)' : 'rgba(237,237,232,.13)'};
        border-radius:8px;padding:2px 7px">${n}</span>` : ''}
    </div>`;
  };
  return `<div style="flex:none;width:216px;background:#1F2A22;display:flex;flex-direction:column;
      padding:16px 11px 12px;gap:18px;overflow-y:auto">
    <div data-nav="home" style="display:flex;flex-direction:column;gap:2px;padding:2px 11px 4px;cursor:pointer">
      <span style="font-size:13.5px;font-weight:700;letter-spacing:.05em;color:#EDEDE8">NEXT SWING</span>
      <span style="font-size:11px;font-weight:400;color:rgba(237,237,232,.5)">관리자</span></div>
    ${NAV.map(([g, items]) => `<div style="display:flex;flex-direction:column;gap:3px">
      ${g ? `<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;
        color:rgba(237,237,232,.36);padding:0 11px 5px">${g}</span>` : ''}
      ${items.map(item).join('')}</div>`).join('')}
    <span style="flex:1"></span>
    <div style="display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:9px;
      background:rgba(237,237,232,.07)">
      <span style="width:28px;height:28px;border-radius:50%;background:var(--ns-green);color:#FFF;
        flex:none;display:flex;align-items:center;justify-content:center;font-size:11.5px;
        font-weight:700">이</span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px">
        <span style="font-size:12px;font-weight:600;color:#EDEDE8">이도형 프로</span>
        <span style="font-size:10px;font-weight:400;color:rgba(237,237,232,.5)">KPGA</span></span>
    </div>
  </div>`;
}

/* 위 줄은 얇게 — 지금 어디인지 · 검색 · 알림만 */
function topbar() {
  const TITLE = { home: '대시보드', queue: '답변 요청함', members: '회원 관리',
                  stats: '통계', member: '회원 카드', fb: '정기 피드백', sched: '일정 · 예약',
                  pay: '쿠폰 · 결제', set: '설정' };
  return `<div style="flex:none;height:56px;display:flex;align-items:center;gap:12px;padding:0 22px 0 14px;
      background:var(--ns-card);border-bottom:1px solid var(--ns-line);position:relative;z-index:5">
    <span data-goback title="뒤로" style="width:34px;height:34px;border-radius:9px;flex:none;
      display:flex;align-items:center;justify-content:center;
      color:var(--ns-ink${S.back.length ? '2' : '3'});cursor:${S.back.length ? 'pointer' : 'default'};
      opacity:${S.back.length ? 1 : .35};background:transparent">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg></span>
    <span style="font-size:15px;font-weight:700;letter-spacing:-.02em;color:var(--ns-ink)">
      ${TITLE[S.nav] || ''}</span>
    <span data-search style="flex:1;max-width:380px;display:flex;align-items:center;gap:8px;
      background:var(--ns-bg);border:1px solid var(--ns-line);border-radius:9px;padding:8px 12px;
      cursor:pointer">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ns-ink3)"
        stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
      <span style="font-size:12.5px;font-weight:400;color:var(--ns-ink3)">회원 이름으로 찾기</span></span>
    <span style="flex:1"></span>
    <div style="position:relative;display:flex;align-items:center">
      <span data-bell style="position:relative;width:34px;height:34px;border-radius:9px;display:flex;
        align-items:center;justify-content:center;cursor:pointer;
        background:${S.bell ? 'var(--ns-sand)' : 'transparent'}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--ns-ink2)"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15V10a6 6 0 0 0-12 0v5l-1.5 3h15z"/><path d="M10 21h4"/></svg>
        ${unread() ? `<span style="position:absolute;top:3px;right:3px;min-width:15px;height:15px;
          border-radius:9px;background:var(--ns-danger);color:#FFF;font-size:9.5px;font-weight:700;
          font-family:var(--font-num);display:flex;align-items:center;justify-content:center;
          padding:0 4px">${unread()}</span>` : ''}
      </span>
      ${S.bell ? bellBox() : ''}
    </div>
  </div>`;
}

/* 알림함 — 종을 누르면 열린다 */
function bellBox() {
  const list = alerts();
  const row = a => {
    const m = mem(a.q);
    const isNew = !S.read[a.id];
    return `<div data-alert="${a.id}" style="display:flex;gap:10px;padding:11px 12px;cursor:pointer;
      border-bottom:1px solid #F2ECE2;background:${isNew ? 'var(--ns-soft)' : 'transparent'}">
      <span style="flex:none;width:7px;height:7px;border-radius:50%;margin-top:6px;
        background:${isNew ? (urgent(a.q.left) ? 'var(--ns-danger)' : 'var(--ns-bronze)') : 'transparent'}"></span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:12.5px;font-weight:${isNew ? 700 : 500};color:var(--ns-ink);line-height:1.5">
          ${esc(m.name)} 님 요청이 온 지 <b style="font-family:var(--font-num)">${a.at}시간</b> 지났어요</span>
        <span style="font-size:11px;font-weight:500;color:var(--ns-ink3);line-height:1.5;
          display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">
          ${esc(a.q.note)}</span>
        <span style="font-size:10.5px;font-weight:700;font-family:var(--font-num);
          color:${urgent(a.q.left) ? 'var(--ns-danger)' : 'var(--ns-ink3)'}">${left(a.q.left)}
          ${a.n > 1 ? ` · ${a.n}번째 알림` : ''}</span>
      </span></div>`;
  };
  return `<div style="position:absolute;top:44px;right:-6px;width:330px;background:var(--ns-card);
    border:1px solid var(--ns-line);border-radius:12px;box-shadow:0 16px 38px -20px rgba(38,40,42,.5);
    z-index:9;overflow:hidden;display:flex;flex-direction:column">
    <div style="flex:none;display:flex;align-items:center;padding:12px 13px;border-bottom:1px solid var(--ns-line)">
      <span style="flex:1;font-size:13px;font-weight:700;color:var(--ns-ink)">알림</span>
      ${unread() ? `<span data-readall style="font-size:11px;font-weight:700;color:var(--ns-green);
        cursor:pointer">모두 읽음</span>` : ''}
    </div>
    <div style="max-height:340px;overflow-y:auto">
      ${list.length ? list.map(row).join('')
        : `<div style="padding:26px 14px;text-align:center;font-size:12px;font-weight:500;
            color:var(--ns-ink3);line-height:1.7">지금은 알릴 게 없어요.<br>${ALERT_STEPS.filter(h => S.steps[h]).join(' · ')}시간이 지나면 알려드릴게요.</div>`}
    </div>
    <div data-nav="set" style="flex:none;padding:11px 13px;border-top:1px solid var(--ns-line);
      font-size:11.5px;font-weight:600;color:var(--ns-ink3);cursor:pointer">알림 설정 ›</div>
  </div>`;
}

/* 설정 — 지금은 알림 규칙 하나만 진짜로 돈다 */
function pageSet() {
  const chk = (on, big) => `<span style="flex:none;width:${big ? 20 : 18}px;height:${big ? 20 : 18}px;
    border-radius:6px;display:flex;align-items:center;justify-content:center;
    background:${on ? 'var(--ns-green)' : 'transparent'};
    border:${on ? 'none' : '1.6px solid #C9C3B4'}">
    ${on ? '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#FFF" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 5 5 9-10"/></svg>' : ''}</span>`;
  const card = body => `<div style="background:var(--ns-card);border:1px solid var(--ns-line);
    border-radius:13px;overflow:hidden">${body}</div>`;
  const sect = (t, note, body) => `<div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;flex-direction:column;gap:3px">
      <span style="font-size:15px;font-weight:700;color:var(--ns-ink)">${t}</span>
      ${note ? `<span style="font-size:12px;font-weight:400;color:var(--ns-ink3);line-height:1.6">${note}</span>` : ''}
    </div>${body}</div>`;

  return `<div style="flex:1;overflow-y:auto;background:var(--ns-bg)">
    <div style="max-width:720px;margin:0 auto;padding:30px 30px 44px;display:flex;flex-direction:column;gap:26px">
      <span style="font-size:24px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">설정</span>

      ${sect('언제 알릴까요', '요청이 온 지 이만큼 지나면 알려드려요. 회원과 한 약속은 48시간입니다.',
        card(ALERT_STEPS.map(h => {
          const on = S.steps[h];
          const last = h === 40;
          return `<div data-step="${h}" style="display:flex;align-items:center;gap:12px;padding:14px 16px;
            cursor:pointer;${last ? '' : 'border-bottom:1px solid #F2ECE2'}">
            ${chk(on, 1)}
            <span style="flex:1;display:flex;flex-direction:column;gap:2px">
              <span style="font-size:13.5px;font-weight:600;color:var(--ns-ink)">
                ${h}시간 지났을 때</span>
              <span style="font-size:11.5px;font-weight:400;color:var(--ns-ink3)">
                ${h <= 9 ? '오늘 안에 처리하려면 이 셋이 핵심이에요'
                  : h === 24 ? '하루가 지났어요. 절반 왔습니다'
                  : '마감 8시간 전. 여기서 놓치면 횟수를 돌려드려야 해요'}</span></span>
          </div>`;
        }).join(''))) }

      ${sect('어떻게 받을까요', '관리자 화면은 웹이라 스토어 심사가 없습니다. 알림만 골라 두면 됩니다.',
        card(ALERT_HOW.map(([k, n, d], i) => `<div data-how="${k}" style="display:flex;align-items:center;
          gap:12px;padding:14px 16px;cursor:pointer;${i === ALERT_HOW.length - 1 ? '' : 'border-bottom:1px solid #F2ECE2'}">
          ${chk(S.how[k], 1)}
          <span style="flex:1;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:13.5px;font-weight:600;color:var(--ns-ink)">${n}</span>
            <span style="font-size:11.5px;font-weight:400;color:var(--ns-ink3)">${d}</span></span>
        </div>`).join('')))}

      ${sect('조용한 시간', '',
        card(`<div data-quiet style="display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer">
          ${chk(S.quiet, 1)}
          <span style="flex:1;display:flex;flex-direction:column;gap:2px">
            <span style="font-size:13.5px;font-weight:600;color:var(--ns-ink)">
              ${QUIET[0]}부터 ${QUIET[1]}까지는 안 보내기</span>
            <span style="font-size:11.5px;font-weight:400;color:var(--ns-ink3)">
              그 사이에 쌓인 건 아침에 한 번에 알려드려요</span></span>
        </div>`))}

      <div style="background:var(--ns-sand);border-radius:12px;padding:16px 18px;display:flex;
        flex-direction:column;gap:7px">
        <span style="font-size:12.5px;font-weight:700;color:var(--ns-ink2)">아이폰에서 앱 알림을 받으려면</span>
        <span style="font-size:12px;font-weight:400;color:var(--ns-ink3);line-height:1.8">
          사파리로 이 화면을 연 다음 <b>공유 → 홈 화면에 추가</b>를 한 번만 해주세요.
          그러면 앱처럼 열리고 알림도 옵니다. 안드로이드는 그냥 됩니다.<br>
          카카오 알림톡은 이 설정과 상관없이 항상 옵니다.</span>
      </div>
    </div></div>`;
}

/* 대시보드 — 여기서 각 방으로 들어간다 */
function pageHome() {
  const u = urgentN(), w = waiting().length;
  const sl = sleeping().length;
  const val = { urgent: u + '건', wait: w + '명', fb: 'D-5', sleep: sl + '명' };
  const sub = { urgent: u ? '12시간 안에 답해야 해요' : '급한 건 없어요',
                wait: '48시간 안에 답하면 됩니다',
                sleep: '안 쓰면 다음 결제일에 조용히 해지합니다' };
  const badge = k => k === 'queue' ? (w ? w + '건 대기' : '다 답했어요')
                   : k === 'members' ? Object.keys(M).length + '명'
                   : k === 'stats' ? STAT.month + ' 기준'
                   : k === 'fb' ? 'D-5' : '준비 중';
  const tile = x => {
    const soon = !!SOON[x.k] && x.k !== 'fb';
    const col = x.tone === 'cm' ? 'var(--ns-bronze)' : x.tone === 'fb' ? 'var(--ns-green)' : 'var(--ns-ink2)';
    const face = x.tone === 'cm' ? 'rgba(166,124,61,.10)' : x.tone === 'fb' ? 'var(--ns-soft)' : 'var(--ns-sand)';
    return `<div data-nav="${x.k}" style="cursor:pointer;background:var(--ns-card);
      border:1px solid var(--ns-line);border-radius:14px;padding:20px;display:flex;flex-direction:column;
      gap:9px;min-height:132px;opacity:${soon ? .62 : 1}">
      <span style="width:34px;height:34px;border-radius:10px;background:${face};color:${col};
        display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">
        ${esc(x.t[0])}</span>
      <span style="font-size:15.5px;font-weight:700;letter-spacing:-.02em;color:var(--ns-ink)">${esc(x.t)}</span>
      <span style="font-size:12px;font-weight:400;color:var(--ns-ink3);line-height:1.55">${esc(x.d)}</span>
      <span style="margin-top:auto;font-size:11.5px;font-weight:700;color:${soon ? 'var(--ns-ink3)' : col}">
        ${badge(x.k)}</span>
    </div>`;
  };
  return `<div style="flex:1;overflow-y:auto;background:var(--ns-bg)">
    <div style="max-width:1120px;margin:0 auto;padding:30px 30px 44px;display:flex;flex-direction:column;gap:28px">
      <div style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:24px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">오늘 할 일</span>
        <span style="font-size:13.5px;font-weight:400;color:var(--ns-ink3)">7월 22일 수요일</span></div>
      ${crmCallBox(3)}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(206px,1fr));gap:12px">
        ${TODAY.map(t => {
          const hot = (t.k === 'urgent' && u > 0) || (t.k === 'sleep' && sl > 0);
          return `<div data-nav="${t.go}" style="cursor:pointer;background:var(--ns-card);
            border:1px solid ${hot ? 'rgba(192,57,43,.35)' : 'var(--ns-line)'};border-radius:13px;
            padding:17px 18px;display:flex;flex-direction:column;gap:7px">
            <span style="font-size:12px;font-weight:600;color:var(--ns-ink3)">${t.t}</span>
            <span style="font-size:26px;font-weight:700;letter-spacing:-.03em;font-family:var(--font-num);
              color:${hot ? 'var(--ns-danger)' : 'var(--ns-ink)'}">${val[t.k]}</span>
            <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3);line-height:1.55">
              ${esc(t.sub || sub[t.k] || '')}</span></div>`;
        }).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:11px">
        <span style="font-size:15px;font-weight:700;color:var(--ns-ink)">바로 가기</span>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          ${TILES.map(tile).join('')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:11px">
        <span style="font-size:15px;font-weight:700;color:var(--ns-ink)">먼저 답할 사람</span>
        <div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
          overflow:hidden">${[...waiting()].sort((a, b) => a.left - b.left).map(x => qrow(x, false, 1)).join('')}</div>
      </div>
      ${sl ? `<div style="display:flex;flex-direction:column;gap:11px">
        <div style="display:flex;align-items:baseline;gap:9px">
          <span style="font-size:15px;font-weight:700;color:var(--ns-ink)">먼저 연락할 사람</span>
          <span style="font-size:12px;font-weight:500;color:var(--ns-ink3)">
            돈은 내는데 이번 달 한마디를 한 번도 안 썼어요</span></div>
        <div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
          overflow:hidden">
          ${sleeping().map(([id, m]) => `<div data-mem="${id}" style="display:flex;align-items:center;
            gap:13px;padding:14px 18px;border-bottom:1px solid #F2ECE2;cursor:pointer">
            <span style="width:36px;height:36px;border-radius:50%;background:var(--ns-green);color:#FFF;
              flex:none;display:flex;align-items:center;justify-content:center;font-size:13px;
              font-weight:700">${esc(m.name[0])}</span>
            <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
              <span style="font-size:13.5px;font-weight:700;color:var(--ns-ink)">${esc(m.name)}
                <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3)">${esc(m.plan)} · ${m.months}개월째</span></span>
              <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3)">
                마지막 영상 ${esc(m.lastUp)} · 이번 달 연습 ${m.days}일</span></span>
            <span style="flex:none;width:200px">${usageBar(m)}</span>
          </div>`).join('')}</div>
      </div>` : ''}
    </div></div>`;
}

/* ── 통계 ────────────────────────────────────────────────────────
   숫자를 늘어놓지 않는다. 세 가지만 본다 —
   약속을 지켰나 · 회원이 남았나 · 돈이 도나. */
function pageStats() {
  const S1 = STAT;
  const pct = Math.round(S1.keep.hit / S1.keep.all * 100);
  const won2 = n => won(n) + '원';
  const big = (t, v, sub, col) => `<div style="background:var(--ns-card);border:1px solid var(--ns-line);
    border-radius:13px;padding:18px;display:flex;flex-direction:column;gap:7px">
    <span style="font-size:12px;font-weight:600;color:var(--ns-ink3)">${t}</span>
    <span style="font-size:27px;font-weight:700;letter-spacing:-.03em;font-family:var(--font-num);
      color:${col || 'var(--ns-ink)'}">${v}</span>
    <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3);line-height:1.55">${sub}</span></div>`;
  const sect = (t, note, body) => `<div style="display:flex;flex-direction:column;gap:11px">
    <div style="display:flex;align-items:baseline;gap:9px">
      <span style="font-size:15px;font-weight:700;color:var(--ns-ink)">${t}</span>
      <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3)">${note}</span></div>
    ${body}</div>`;

  // 막대 — 라이브러리 없이 그린다
  const maxV = Math.max(...S1.vids.map(x => x[1]));
  const bars = `<div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
    padding:20px;display:flex;align-items:flex-end;gap:14px;height:200px">
    ${S1.vids.map(([m, v], i) => {
      const on = i === S1.vids.length - 1;
      return `<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;
        justify-content:flex-end">
        <span style="font-size:12px;font-weight:700;font-family:var(--font-num);
          color:${on ? 'var(--ns-green)' : 'var(--ns-ink3)'}">${v}</span>
        <span style="width:100%;max-width:56px;height:${Math.round(v / maxV * 118)}px;border-radius:7px 7px 3px 3px;
          background:${on ? 'var(--ns-green)' : 'var(--ns-sand)'}"></span>
        <span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">${m}</span></span>`;
    }).join('')}
  </div>`;

  const tierAll = S1.tiers.reduce((a, x) => a + x[1], 0);
  const tiers = `<div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
    padding:20px;display:flex;flex-direction:column;gap:13px">
    <div style="display:flex;height:13px;border-radius:9px;overflow:hidden">
      ${S1.tiers.map(([n, v], i) => `<span style="width:${v / tierAll * 100}%;
        background:${['#DCD6C8', 'rgba(166,124,61,.55)', 'var(--ns-bronze)', 'var(--ns-green)'][i]}"></span>`).join('')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:16px">
      ${S1.tiers.map(([n, v], i) => `<span style="display:flex;align-items:center;gap:7px">
        <span style="width:9px;height:9px;border-radius:50%;
          background:${['#DCD6C8', 'rgba(166,124,61,.55)', 'var(--ns-bronze)', 'var(--ns-green)'][i]}"></span>
        <span style="font-size:12.5px;font-weight:600;color:var(--ns-ink2)">${n}</span>
        <span style="font-size:12.5px;font-weight:700;font-family:var(--font-num);color:var(--ns-ink)">${v}</span>
      </span>`).join('')}
    </div>
    <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3);line-height:1.6">
      유료 ${S1.paid}명 · 무료 ${S1.free}명. 무료에서 Basic 으로 넘어오는 사람이 이 장사의 입구입니다.</span>
  </div>`;

  return `<div style="flex:1;overflow-y:auto;background:var(--ns-bg)">
    <div style="max-width:1120px;margin:0 auto;padding:30px 30px 44px;display:flex;flex-direction:column;gap:28px">
      <div style="display:flex;align-items:baseline;gap:10px">
        <span style="font-size:24px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">통계</span>
        <span style="font-size:13.5px;font-weight:500;color:var(--ns-ink3)">${S1.month} 기준</span></div>

      ${sect('약속을 지켰나', '회원과 한 약속은 48시간입니다',
        `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(206px,1fr));gap:12px">
          ${big('48시간 안에 답한 비율', pct + '%', `${S1.keep.all}건 중 ${S1.keep.hit}건`,
            pct >= 90 ? 'var(--ns-green)' : 'var(--ns-danger)')}
          ${big('평균 답변까지', S1.avgH + '시간', '빠를수록 다음 달에 또 올립니다')}
          ${big('돌려준 횟수', (S1.keep.all - S1.keep.hit) + '회',
            '48시간을 넘겨 횟수를 반환한 건')}
          ${big('한마디 소진율', Math.round(S1.cmUsed / S1.cmGiven * 100) + '%',
            `준 ${S1.cmGiven}회 중 ${S1.cmUsed}회 씀`)}
        </div>`)}

      ${sect('회원이 남았나', '등급이 곧 이 앱의 값어치입니다', tiers)}

      ${sect('등급값을 쓰고 있나', '준 횟수를 안 쓰는 사람이 다음 달에 해지합니다',
        `<div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
          padding:6px 18px">
          ${Object.entries(M).filter(([, m]) => m.plan !== '무료')
            .sort((a, b) => usage(a[1]).p - usage(b[1]).p)
            .map(([id, m], i, arr) => `<div data-mem="${id}" style="display:flex;align-items:center;
              gap:14px;padding:13px 0;cursor:pointer;${i === arr.length - 1 ? '' : 'border-bottom:1px solid #F2ECE2'}">
              <span style="flex:none;width:110px;font-size:12.5px;font-weight:600;color:var(--ns-ink)">
                ${esc(m.name)}</span>
              <span style="flex:none;width:74px;font-size:11.5px;font-weight:500;color:var(--ns-ink3)">
                ${esc(m.plan)}</span>
              <span style="flex:1;min-width:0">${usageBar(m)}</span>
            </div>`).join('')}
        </div>`)}

      ${sect('영상이 올라오나', '올라오는 영상이 줄면 다음 달 해지가 옵니다', bars)}

      ${sect('돈이 도나', '',
        `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(206px,1fr));gap:12px">
          ${big('이번 달 구독', won2(S1.mrr),
            `지난달보다 ${won2(S1.mrr - S1.mrrPrev)} 늘었어요`, 'var(--ns-green)')}
          ${big('이번 달 가입', S1.joined + '명', '무료 포함')}
          ${big('이번 달 해지', S1.churn + '명', '유료 기준')}
          ${big('30일 넘게 조용한 유료 회원', S1.quiet + '명',
            '해지 직전 신호입니다. 먼저 연락할 사람들', S1.quiet ? 'var(--ns-danger)' : '')}
        </div>`)}
    </div></div>`;
}

/* 회원 관리 — 등급별 세로줄로 본다.
   등급이 곧 이 장사의 단계다. 무료가 몇이고 Elite 가 몇인지,
   어느 줄에 사람이 고여 있는지가 한눈에 보여야 한다.
   순서는 최신 등록순 — 새로 온 사람이 맨 위다. */
const TIERS = [
  ['무료', '결제로 넘어올 사람들'],
  ['Basic', '프로 한마디 월 2회'],
  ['Coaching', '프로 한마디 월 5회'],
  ['Elite', '정기 피드백 + 월 6회'],
];
const byJoin = arr => arr.slice().sort((a, b) => b[1].join.localeCompare(a[1].join));

function memCard(id, m) {
  const q = Q.find(x => x.m === id && !S.done[x.id]);
  const u = usage(m);
  return `<div data-mem="${id}" style="background:var(--ns-card);border:1px solid var(--ns-line);
    border-radius:12px;padding:13px 14px;display:flex;flex-direction:column;gap:9px;cursor:pointer">
    <div style="display:flex;align-items:center;gap:9px">
      <span style="width:32px;height:32px;border-radius:50%;background:var(--ns-green);color:#FFF;
        flex:none;display:flex;align-items:center;justify-content:center;font-size:12px;
        font-weight:700">${esc(m.name[0])}</span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:13px;font-weight:700;color:var(--ns-ink);white-space:nowrap;
          overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</span>
        <span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);font-family:var(--font-num)">
          ${esc(m.join)} 등록 · ${m.months}개월째</span></span>
      ${q ? `<span style="flex:none;font-size:10px;font-weight:700;font-family:var(--font-num);
        color:${urgent(q.left) ? '#FFF' : 'var(--ns-green)'};
        background:${urgent(q.left) ? 'var(--ns-danger)' : 'var(--ns-soft)'};
        border-radius:7px;padding:3px 7px">${left(q.left)}</span>` : ''}
    </div>
    ${usageBar(m)}
    ${m.program ? `<span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);
      border-top:1px solid #F2ECE2;padding-top:8px;white-space:nowrap;overflow:hidden;
      text-overflow:ellipsis">${esc(m.program)}</span>` : ''}
  </div>`;
}

function pageMembers() {
  const all = Object.entries(M);
  const board = S.mview !== 'list';

  const col = ([tier, note]) => {
    const list = byJoin(all.filter(([, m]) => m.plan === tier));
    const money = tier === '무료' ? 0 : list.length * (PRICE_OF[tier] || 0);
    const risk = list.filter(([, m]) => tier !== '무료' && m.quota[0] === 0).length;
    return `<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;flex-direction:column;gap:5px;padding:0 2px">
        <div style="display:flex;align-items:baseline;gap:7px">
          <span style="font-size:13.5px;font-weight:700;color:var(--ns-ink)">${tier}</span>
          <span style="font-size:12px;font-weight:700;font-family:var(--font-num);
            color:var(--ns-ink3)">${list.length}</span>
          <span style="flex:1"></span>
          ${risk ? `<span style="font-size:10px;font-weight:700;color:#FFF;background:var(--ns-danger);
            border-radius:7px;padding:2px 6px">안 씀 ${risk}</span>` : ''}
        </div>
        <span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3)">
          ${money ? won(money) + '원 / 월' : note}</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:9px;background:rgba(29,36,32,.035);
        border-radius:13px;padding:10px;min-height:120px">
        ${list.length ? list.map(([id, m]) => memCard(id, m)).join('')
          : `<div style="padding:22px 8px;text-align:center;font-size:11.5px;font-weight:500;
              color:var(--ns-ink3)">아직 없어요</div>`}
      </div></div>`;
  };

  // 목록 보기 — 안 쓰는 사람이 위로. '누구에게 먼저 연락하나' 를 볼 때 쓴다.
  const order = { none: 0, low: 1, ok: 2, full: 3 };
  const rows = all.slice()
    .sort((a, b) => order[usage(a[1]).state] - order[usage(b[1]).state])
    .map(([id, m]) => {
      const q = Q.find(x => x.m === id && !S.done[x.id]);
      return `<div data-mem="${id}" style="display:flex;align-items:center;gap:13px;padding:15px 18px;
        border-bottom:1px solid #F2ECE2;cursor:pointer">
        <span style="width:40px;height:40px;border-radius:50%;background:var(--ns-green);color:#FFF;
          flex:none;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">
          ${esc(m.name[0])}</span>
        <span style="flex:2;min-width:0;display:flex;flex-direction:column;gap:3px">
          <span style="font-size:14px;font-weight:700;color:var(--ns-ink)">${esc(m.name)}
            <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3)">${esc(m.real)}</span></span>
          <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3)">
            ${esc(m.plan)} · ${m.months}개월째 · ${esc(m.join)} 등록</span></span>
        <span style="flex:1;font-size:12.5px;font-weight:500;color:var(--ns-ink2)">
          ${m.program ? esc(m.program) : '<span style="color:var(--ns-ink3)">정기 피드백 없음</span>'}</span>
        <span style="flex:none;width:190px">${usageBar(m)}</span>
        <span style="flex:none;width:104px;text-align:right;font-size:11.5px;font-weight:700;
          color:${q ? (urgent(q.left) ? 'var(--ns-danger)' : 'var(--ns-green)') : 'var(--ns-ink3)'}">
          ${q ? left(q.left) : '마지막 ' + esc(m.lastUp)}</span>
      </div>`;
    }).join('');

  const tab = (k, n) => `<span data-mview="${k}" style="font-size:12px;font-weight:${board === (k === 'board') ? 700 : 500};
    color:${board === (k === 'board') ? 'var(--ns-ink)' : 'var(--ns-ink3)'};
    background:${board === (k === 'board') ? 'var(--ns-card)' : 'transparent'};
    border-radius:8px;padding:7px 13px;cursor:pointer;
    ${board === (k === 'board') ? 'box-shadow:0 1px 3px rgba(29,36,32,.12)' : ''}">${n}</span>`;

  return `<div style="flex:1;overflow-y:auto;background:var(--ns-bg)">
    <div style="padding:26px 30px 44px;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:24px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">회원 관리</span>
        <span style="font-size:13.5px;font-weight:500;color:var(--ns-ink3)">${all.length}명</span>
        <span style="display:flex;gap:3px;background:var(--ns-sand);border-radius:10px;padding:3px;
          margin-left:6px">${tab('board', '등급별')}${tab('list', '목록')}</span>
        <span style="flex:1"></span>
        ${sleeping().length ? `<span style="font-size:12px;font-weight:700;color:var(--ns-danger);
          background:rgba(192,57,43,.08);border-radius:8px;padding:6px 11px">
          이번 달 한 번도 안 쓴 유료 회원 ${sleeping().length}명</span>` : ''}
      </div>
      ${board
        ? `<div style="display:flex;gap:14px;align-items:stretch">${TIERS.map(col).join('')}</div>
           <span style="font-size:12px;font-weight:500;color:var(--ns-ink3);line-height:1.7">
             줄마다 <b style="font-weight:700;color:var(--ns-ink2)">최신 등록순</b>입니다.
             칸을 누르면 그 회원 페이지로 갑니다.
             무료 줄에서 <b style="font-weight:700;color:var(--ns-ink2)">영상을 두 개 넘게 올린 사람</b>이
             결제로 넘어올 다음 사람입니다.</span>`
        : `<div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
             overflow:hidden">
             <div style="display:flex;align-items:center;gap:13px;padding:11px 18px;
               border-bottom:1px solid var(--ns-line);font-size:11px;font-weight:700;
               letter-spacing:.06em;color:var(--ns-ink3)">
               <span style="flex:none;width:40px"></span><span style="flex:2">회원</span>
               <span style="flex:1">지금 하는 것</span>
               <span style="flex:none;width:190px">이번 달 한마디를 쓰고 있나</span>
               <span style="flex:none;width:104px;text-align:right">기다리는 것</span>
             </div>${rows}</div>
           <span style="font-size:12px;font-weight:500;color:var(--ns-ink3);line-height:1.7">
             <b style="font-weight:700;color:var(--ns-ink2)">안 쓰는 사람이 맨 위</b>입니다 —
             막대의 세로선이 오늘이고, 선보다 막대가 짧으면 이번 달을 흘려보내고 있다는 뜻입니다.</span>`}
    </div></div>`;
}

/* 아직 안 만든 자리. 이름만 놓으면 고장 난 화면으로 보인다 — 무엇을 넣을 자리인지 적는다. */
function pageSoon(k) {
  const [t, d] = SOON[k] || ['준비 중', ''];
  return `<div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--ns-bg);padding:30px">
    <div style="max-width:420px;display:flex;flex-direction:column;gap:11px;text-align:center">
      <span style="font-size:20px;font-weight:700;letter-spacing:-.03em;color:var(--ns-ink)">${esc(t)}</span>
      <span style="font-size:13.5px;font-weight:400;color:var(--ns-ink3);line-height:1.85;
        white-space:pre-wrap">${esc(d)}</span>
      <span style="font-size:11.5px;font-weight:700;color:var(--ns-bronze);background:rgba(166,124,61,.1);
        border-radius:8px;padding:7px 12px;align-self:center;margin-top:6px">아직 안 만든 자리예요</span>
      <span data-nav="home" style="font-size:12.5px;font-weight:700;color:var(--ns-green);cursor:pointer;
        padding-top:6px">‹ 대시보드로</span>
    </div></div>`;
}

/* ── 답변 요청함 (3단) ──────────────────────────────────────────── */
function pageQueue() {
  const q = cur();
  const m = mem(q);
  const done = S.done[q.id];
  const wait = waiting().length;

  const fold = S.fold;
  const queue = fold
    ? `<div style="flex:none;width:64px;display:flex;flex-direction:column;
        border-right:1px solid var(--ns-line);background:var(--ns-card)">
        <div style="flex:none;height:47px;display:flex;align-items:center;justify-content:center;
          border-bottom:1px solid var(--ns-line)">
          <span data-fold style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;
            justify-content:center;cursor:pointer;color:var(--ns-ink3)" title="요청함 펼치기">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></span>
        </div>
        <div style="flex:1;overflow-y:auto">${Q.map(x => qmini(x, x.id === S.pick)).join('')}</div>
      </div>`
    : `<div style="flex:none;width:clamp(228px,17vw,288px);display:flex;flex-direction:column;
        border-right:1px solid var(--ns-line);background:var(--ns-card)">
      <div style="flex:none;height:47px;display:flex;align-items:center;gap:7px;padding:0 8px 0 13px;
        border-bottom:1px solid var(--ns-line)">
        <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">요청함</span>
        <span style="font-size:11px;font-weight:700;color:#FFF;background:var(--ns-bronze);
          border-radius:8px;padding:1px 7px;font-family:var(--font-num)">${wait}</span>
        <span style="flex:1"></span>
        <span data-fold style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;
          justify-content:center;cursor:pointer;color:var(--ns-ink3)" title="요청함 접기">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg></span>
      </div>
      <div style="flex:1;overflow-y:auto">${Q.map(x => qrow(x, x.id === S.pick)).join('')}</div>
      <div style="flex:none;padding:9px 13px;border-top:1px solid var(--ns-line);font-size:10.5px;
        font-weight:500;color:var(--ns-ink3);line-height:1.5">48시간 안에 답하지 못하면 횟수를 돌려드려야 해요</div>
    </div>`;

  const mid = `<div style="flex:1;min-width:0;display:flex;flex-direction:column;
      border-right:1px solid var(--ns-line)">
    <div style="flex:none;padding:14px 22px 12px;border-bottom:1px solid var(--ns-line);
      display:flex;align-items:center;gap:11px">
      <span data-mem="${q.m}" style="font-size:16px;font-weight:700;color:var(--ns-ink);cursor:pointer">
        ${esc(m.name)} 님의 스윙</span>
      <span style="font-size:12px;font-weight:500;color:var(--ns-ink3)">${esc(q.ago)} · ${esc(q.view)}</span>
      <span style="flex:1"></span>
      <span style="font-size:12.5px;font-weight:700;font-family:var(--font-num);
        color:${urgent(q.left) ? 'var(--ns-danger)' : 'var(--ns-green)'};
        background:${urgent(q.left) ? 'rgba(192,57,43,.09)' : 'var(--ns-soft)'};
        border-radius:8px;padding:6px 11px">${left(q.left)}</span>
    </div>
    <div style="flex:1;overflow-y:auto;padding:18px 22px 22px;display:flex;flex-direction:column;gap:16px">
      <div style="flex:none;display:flex;gap:14px;height:${fold ? 'min(66vh,700px)' : 'min(58vh,600px)'}">
        ${player(q, '100%')}
        ${memo(q, 1)}
      </div>
      ${done
        ? `<div style="border:1px solid #DCE7DE;background:var(--ns-soft);border-radius:11px;
            padding:14px;display:flex;flex-direction:column;gap:9px">
            <span style="font-size:13.5px;font-weight:700;color:var(--ns-green)">답을 보냈어요</span>
            <span style="font-size:14px;font-weight:400;color:var(--ns-ink);line-height:1.85;
              white-space:pre-wrap">${esc(S.draft[q.id] || '')}</span>
            ${shots(q.id).length ? `<div style="display:flex;gap:8px">${shots(q.id).map((x, i) => shotChip(x, i)).join('')}</div>` : ''}
            <span data-next style="align-self:flex-start;font-size:12px;font-weight:700;color:#FFF;
              background:var(--ns-green);border-radius:9px;padding:9px 16px;cursor:pointer">
              다음 사람 ›</span></div>`
        : writer(q, false)}
    </div>
  </div>`;

  const right = `<div style="flex:none;width:clamp(360px,30vw,520px);display:flex;flex-direction:column;background:var(--ns-card)">
    <div style="flex:none;padding:16px 18px 14px;border-bottom:1px solid var(--ns-line);
      display:flex;align-items:center">
      <span style="flex:1;font-size:16px;font-weight:700;color:var(--ns-ink)">이 회원을 아는 데 필요한 것</span>
      <span data-mem="${q.m}" style="font-size:12.5px;font-weight:700;color:var(--ns-green);cursor:pointer">회원 카드 전체 보기 ›</span>
    </div>
    <div style="flex:1;overflow-y:auto;padding:18px">${history(q)}</div>
  </div>`;

  return `<div style="flex:1;min-width:0;display:flex;background:var(--ns-bg)">${queue}${mid}${right}</div>`;
}

function renderPC() {
  const page = S.nav === 'inbox' ? pageInbox()
             : S.nav === 'home' ? pageHome()
             : S.nav === 'queue' ? pageQueue()
             : S.nav === 'members' ? crmMembers()
             : S.nav === 'stats' ? crmStatsPage()
             : S.nav === 'member' ? pageMember()
             : S.nav === 'set' ? pageSet()
             : pageSoon(S.nav);
  return `<div style="display:flex;height:100%;background:var(--ns-bg)">${sidebar()}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column">
      ${topbar()}<div style="flex:1;min-height:0;display:flex">${page}</div></div></div>`;
}

/* ── 모바일 ─────────────────────────────────────────────────────
   PC 축소판이 아니다. 이동 중에 짧게 답하는 용도라 한 화면에 하나씩만 둔다. */
function moTabs() {
  const T = [['home', '홈', 'M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z'],
             ['queue', '요청함', 'M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V7A2.5 2.5 0 0 1 7.5 4.5h10A2.5 2.5 0 0 1 20 7z'],
             ['members', '회원', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1-4 4-6 8-6s7 2 8 6'],
             ['stats', '통계', 'M5 20V10M12 20V4M19 20v-7']];
  return `<div style="flex:none;display:flex;border-top:1px solid var(--ns-line);background:var(--ns-card)">
    ${T.map(([k, n, d]) => {
      const on = S.nav === k;
      const cnt = k === 'queue' ? waiting().length : 0;
      return `<span data-nav="${k}" style="flex:1;display:flex;flex-direction:column;align-items:center;
        gap:3px;padding:9px 0 11px;cursor:pointer;position:relative">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
          style="color:${on ? 'var(--ns-green)' : 'var(--ns-ink3)'}"><path d="${d}"/></svg>
        <span style="font-size:10.5px;font-weight:${on ? 700 : 500};
          color:${on ? 'var(--ns-green)' : 'var(--ns-ink3)'}">${n}</span>
        ${cnt ? `<span style="position:absolute;top:5px;left:calc(50% + 8px);font-size:9px;font-weight:700;
          color:#FFF;background:var(--ns-bronze);border-radius:8px;padding:1px 5px;
          font-family:var(--font-num)">${cnt}</span>` : ''}
      </span>`;
    }).join('')}
  </div>`;
}

function renderMO() {
  const q = cur();
  const m = mem(q);
  const done = S.done[q.id];
  const bar = (title, back, right) => `<div style="flex:none;height:50px;display:flex;align-items:center;
    gap:8px;padding:0 12px;border-bottom:1px solid var(--ns-line);background:var(--ns-card)">
    ${back ? `<span data-back style="width:32px;height:32px;display:flex;align-items:center;
      justify-content:center;cursor:pointer;color:var(--ns-ink)">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
        stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg></span>`
      : '<span style="width:4px"></span>'}
    <span style="flex:1;font-size:14px;font-weight:700;color:var(--ns-ink)">${title}</span>${right || ''}</div>`;
  const page = body => `<div style="display:flex;flex-direction:column;height:100%;background:var(--ns-bg)">
    ${body}${moTabs()}</div>`;

  // 목록 쪽 — 사이드바 대신 아래 탭
  if (S.nav === 'home') {
    const u = urgentN();
    return page(`${bar('오늘 할 일')}
      <div style="flex:1;overflow-y:auto">
        <div style="padding:15px 14px;display:flex;flex-direction:column;gap:11px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
            ${[['오늘 안에', u + '건', u > 0], ['기다리는 사람', waiting().length + '명', 0],
               ['정기 피드백', 'D-5', 0], ['새 회원', '1명', 0]].map(([t, v, hot]) =>
              `<div style="background:var(--ns-card);border:1px solid ${hot ? 'rgba(192,57,43,.35)' : 'var(--ns-line)'};
                border-radius:12px;padding:13px 14px;display:flex;flex-direction:column;gap:5px">
                <span style="font-size:11px;font-weight:600;color:var(--ns-ink3)">${t}</span>
                <span style="font-size:21px;font-weight:700;font-family:var(--font-num);
                  color:${hot ? 'var(--ns-danger)' : 'var(--ns-ink)'}">${v}</span></div>`).join('')}
          </div>
          <span style="font-size:13px;font-weight:700;color:var(--ns-ink);padding-top:4px">바로 가기</span>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
            ${TILES.map(x => `<div data-nav="${x.k}" style="cursor:pointer;background:var(--ns-card);
              border:1px solid var(--ns-line);border-radius:12px;padding:13px 14px;display:flex;
              flex-direction:column;gap:4px;opacity:${SOON[x.k] && x.k !== 'fb' ? .62 : 1}">
              <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">${esc(x.t)}</span>
              <span style="font-size:10.5px;font-weight:400;color:var(--ns-ink3);line-height:1.5">${esc(x.d)}</span>
            </div>`).join('')}
          </div>
          <span style="font-size:13px;font-weight:700;color:var(--ns-ink);padding-top:4px">먼저 답할 사람</span>
        </div>
        <div style="background:var(--ns-card);border-top:1px solid var(--ns-line)">
          ${[...waiting()].sort((a, b) => a.left - b.left).map(x => qrow(x, false)).join('')}</div>
      </div>`);
  }

  if (S.nav === 'members') {
    // 진짜 명부 — 상태별로 위아래로 쌓는다 (admin-crm.js)
    return page(bar('회원 관리', 0, '') + crmMembersMO());
  }
  if (false) {
    return page(`${bar('회원 관리', 0, `<span style="font-size:11.5px;font-weight:600;
      color:var(--ns-ink3)">${Object.keys(M).length}명</span>`)}
      <div style="flex:1;overflow-y:auto;padding:12px 12px 18px;display:flex;flex-direction:column;gap:16px">
        ${TIERS.map(([tier, note]) => {
          const list = byJoin(Object.entries(M).filter(([, m]) => m.plan === tier));
          const money = tier === '무료' ? 0 : list.length * (PRICE_OF[tier] || 0);
          const risk = list.filter(([, m]) => tier !== '무료' && m.quota[0] === 0).length;
          return `<div style="display:flex;flex-direction:column;gap:9px">
            <div style="display:flex;align-items:baseline;gap:7px;padding:0 3px">
              <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">${tier}</span>
              <span style="font-size:11.5px;font-weight:700;font-family:var(--font-num);
                color:var(--ns-ink3)">${list.length}</span>
              <span style="flex:1"></span>
              ${risk ? `<span style="font-size:9.5px;font-weight:700;color:#FFF;
                background:var(--ns-danger);border-radius:7px;padding:2px 6px">안 씀 ${risk}</span>` : ''}
              <span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3)">
                ${money ? won(money) + '원 / 월' : note}</span>
            </div>
            ${list.length ? list.map(([id, m]) => memCard(id, m)).join('')
              : `<div style="padding:14px;text-align:center;font-size:11.5px;font-weight:500;
                  color:var(--ns-ink3);background:var(--ns-card);border:1px solid var(--ns-line);
                  border-radius:12px">아직 없어요</div>`}
          </div>`;
        }).join('')}
      </div>`);
  }

  if (S.nav === 'member') {
    const m = M[S.card];
    return page(`${bar(esc(m ? m.name : '') + ' 님', 1)}${pageMember()}`);
  }

  if (S.nav === 'stats') {
    // 진짜 지표 — PC 와 같은 것을 좁게 쌓는다 (admin-crm.js)
    return page(bar('이번 주', 0, '') + crmStatsPage());
  }
  if (false) {
    const pct = Math.round(STAT.keep.hit / STAT.keep.all * 100);
    const card = (t, v, sub, col) => `<div style="background:var(--ns-card);border:1px solid var(--ns-line);
      border-radius:12px;padding:13px 14px;display:flex;flex-direction:column;gap:5px">
      <span style="font-size:11px;font-weight:600;color:var(--ns-ink3)">${t}</span>
      <span style="font-size:20px;font-weight:700;font-family:var(--font-num);
        color:${col || 'var(--ns-ink)'}">${v}</span>
      <span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);line-height:1.5">${sub}</span></div>`;
    return page(`${bar('통계', 0, `<span style="font-size:11.5px;font-weight:600;
      color:var(--ns-ink3)">${STAT.month}</span>`)}
      <div style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px">
        ${card('48시간 안에 답한 비율', pct + '%', `${STAT.keep.all}건 중 ${STAT.keep.hit}건`,
          pct >= 90 ? 'var(--ns-green)' : 'var(--ns-danger)')}
        ${card('평균 답변까지', STAT.avgH + '시간', '빠를수록 다음 달에 또 올립니다')}
        ${card('이번 달 구독', won(STAT.mrr) + '원',
          `지난달보다 ${won(STAT.mrr - STAT.mrrPrev)}원 늘었어요`, 'var(--ns-green)')}
        ${card('유료 회원', STAT.paid + '명', `무료 ${STAT.free}명`)}
        ${card('30일 넘게 조용한 유료 회원', STAT.quiet + '명',
          '해지 직전 신호입니다', 'var(--ns-danger)')}
      </div>`);
  }

  if (S.nav === 'inbox') return pageInbox();
  if (!['queue'].includes(S.nav)) {
    const [t, d] = SOON[S.nav] || ['준비 중', ''];
    return page(`${bar(t)}
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:26px">
        <div style="display:flex;flex-direction:column;gap:10px;text-align:center">
          <span style="font-size:17px;font-weight:700;color:var(--ns-ink)">${esc(t)}</span>
          <span style="font-size:12.5px;font-weight:400;color:var(--ns-ink3);line-height:1.85;
            white-space:pre-wrap">${esc(d)}</span>
          <span style="font-size:11px;font-weight:700;color:var(--ns-bronze);background:rgba(166,124,61,.1);
            border-radius:8px;padding:7px 12px;align-self:center;margin-top:4px">아직 안 만든 자리예요</span>
        </div></div>`);
  }

  // 요청함 안 — 목록 / 쓰기 / 히스토리 / 보냄
  if (S.mo === 'q') {
    return page(`${bar('답변 요청함', 0, `<span style="font-size:11px;font-weight:700;color:#FFF;
      background:var(--ns-bronze);border-radius:9px;padding:3px 8px;font-family:var(--font-num)">
      ${waiting().length}</span>`)}
      <div style="flex:none;padding:10px 13px;background:var(--ns-soft);font-size:11px;
        font-weight:500;color:var(--ns-ink2);line-height:1.55">
        48시간 안에 답하지 못하면 횟수를 돌려드려야 해요</div>
      <div style="flex:1;overflow-y:auto;background:var(--ns-card)">${Q.map(x => qrow(x, false)).join('')}</div>`);
  }

  if (S.mo === 'h') {
    return `<div style="display:flex;flex-direction:column;height:100%;background:var(--ns-bg)">
      ${bar(esc(m.name) + ' 님', 1)}
      <div style="flex:1;overflow-y:auto;padding:16px 14px">${history(q)}</div>
      <div style="flex:none;padding:11px 14px;border-top:1px solid var(--ns-line);background:var(--ns-card)">
        <span data-toW style="display:block;text-align:center;font-size:13.5px;font-weight:600;color:#FFF;
          background:var(--ns-green);border-radius:11px;padding:13px;cursor:pointer">답 쓰러 가기</span></div>
    </div>`;
  }

  if (S.mo === 'd') {
    return `<div style="display:flex;flex-direction:column;height:100%;background:var(--ns-bg)">
      ${bar('보냈어요', 1)}
      <div style="flex:1;overflow-y:auto;padding:18px 14px;display:flex;flex-direction:column;gap:14px">
        <div style="background:var(--ns-soft);border:1px solid #DCE7DE;border-radius:12px;padding:14px;
          display:flex;flex-direction:column;gap:9px">
          <span style="font-size:12px;font-weight:700;color:var(--ns-green)">
            ${esc(m.name)} 님에게 보냈어요</span>
          <span style="font-size:12.5px;font-weight:400;color:var(--ns-ink);line-height:1.75;
            white-space:pre-wrap">${esc(S.draft[q.id] || '')}</span>
          ${shots(q.id).length ? `<div style="display:flex;gap:7px">${shots(q.id).map((x, i) => shotChip(x, i, 1)).join('')}</div>` : ''}
        </div>
        <span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3);line-height:1.6">
          회원 앱에 바로 뜨고, 알림도 함께 갑니다. 이번 달 ${esc(m.name)} 님 한마디는
          ${m.quota[0] + 1}/${m.quota[1]}회가 됐어요.</span>
        <span data-next style="text-align:center;font-size:13.5px;font-weight:600;color:#FFF;
          background:var(--ns-green);border-radius:11px;padding:13px;cursor:pointer">
          다음 사람 (${waiting().length}명 남음)</span>
        <span data-toQ style="text-align:center;font-size:12.5px;font-weight:600;
          color:var(--ns-ink3);padding:6px;cursor:pointer">요청함으로</span>
      </div></div>`;
  }

  // 쓰기
  return `<div style="display:flex;flex-direction:column;height:100%;background:var(--ns-bg)">
    ${bar(esc(m.name) + ' 님', 1, `<span style="font-size:10.5px;font-weight:700;font-family:var(--font-num);
      color:${urgent(q.left) ? 'var(--ns-danger)' : 'var(--ns-green)'}">${left(q.left)}</span>`)}
    <div style="flex:1;overflow-y:auto;padding:13px 14px 16px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:stretch">
        ${player(q, '300px')}
        ${memo(q, 1)}
      </div>
      <div data-open style="display:flex;align-items:center;gap:8px;border:1px solid var(--ns-line);
        background:var(--ns-card);border-radius:11px;padding:12px 13px;cursor:pointer">
        <span style="flex:1;display:flex;flex-direction:column;gap:3px">
          <span style="font-size:12.5px;font-weight:700;color:var(--ns-ink)">이 회원을 아는 데 필요한 것</span>
          <span style="font-size:11px;font-weight:500;color:var(--ns-ink3);line-height:1.5">
            ${m.program ? esc(m.program) + ' · ' : ''}내가 지난번에 한 말 ${m.past.length}개 · 과거 스윙 ${m.vids.length - 1}개</span>
        </span>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--ns-ink3)"
          stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></div>
      ${writer(q, true)}
    </div></div>`;
}

/* ── 장면에 선 긋기 ───────────────────────────────────────────────
   여기가 이 도구의 전부다. 영상을 뜯어보는 분석기가 아니라,
   "올라온 화면에 선 몇 개 긋고 첨부" 를 제일 빠르게 하는 자리다. */
function renderMark() {
  const sh = editing();
  if (!sh) return '';
  const line = l => `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}"
    stroke="${l[4]}" stroke-width="3.4" stroke-linecap="round"/>`;
  const TOOLS = [['#C0392B', '빨강'], ['#F0C419', '노랑'], ['#FFFFFF', '흰색']];
  return `<div data-markbg style="position:fixed;inset:0;background:rgba(18,22,15,.88);z-index:60;
    display:flex;align-items:center;justify-content:center;padding:22px">
    <div style="width:min(460px,94vw);display:flex;flex-direction:column;gap:11px">
      <div style="display:flex;align-items:baseline;gap:9px">
        <span style="font-size:14px;font-weight:700;color:#EDEDE8">선 긋기</span>
        <span style="flex:1;font-size:11.5px;font-weight:500;color:rgba(237,237,232,.6)">
          ${esc(sh.at)} 장면 · 끌어서 그으세요</span>
        <span data-markcancel style="font-size:11.5px;font-weight:600;color:rgba(237,237,232,.6);
          cursor:pointer">취소</span>
      </div>
      <div data-canvas style="position:relative;background:#1B2019;border-radius:12px;overflow:hidden;
        aspect-ratio:3/4;cursor:crosshair;touch-action:none">
        ${FIG('76%')}
        <svg data-lines viewBox="0 0 300 400" preserveAspectRatio="none"
          style="position:absolute;inset:0;width:100%;height:100%">${sh.lines.map(line).join('')}</svg>
        ${sh.lines.length ? '' : `<span style="position:absolute;left:0;right:0;bottom:14px;text-align:center;
          font-size:11.5px;font-weight:600;color:rgba(237,237,232,.5)">화면을 끌면 선이 그어져요</span>`}
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${TOOLS.map(([c, n]) => `<span data-tool="${c}" title="${n}"
          style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;
          border:2px solid ${S.tool === c ? '#FFF' : 'transparent'};box-shadow:0 0 0 1px rgba(0,0,0,.35)"></span>`).join('')}
        <span data-undo style="font-size:11.5px;font-weight:600;color:#EDEDE8;
          border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:8px 12px;cursor:pointer;
          opacity:${sh.lines.length ? 1 : .35}">한 줄 지우기</span>
        <span style="flex:1"></span>
        <span data-markdel style="font-size:11.5px;font-weight:600;color:#E8A79E;
          border:1px solid rgba(232,167,158,.4);border-radius:8px;padding:8px 12px;cursor:pointer">
          이 장면 빼기</span>
        <span data-markdone style="font-size:13px;font-weight:700;color:#12160F;background:#FFF;
          border-radius:9px;padding:10px 20px;cursor:pointer">첨부하기</span>
      </div>
    </div></div>`;
}

/* ── 회원 세부 페이지 ──────────────────────────────────────────────
   작은 창이 아니라 한 페이지다. 다만 전부를 한 줄로 쌓으면 스크롤이 너무 길다.
   머리(이름 · 지금 상태 · 할 수 있는 것)만 늘 붙여 두고,
   나머지는 부제목으로 갈라서 필요한 것만 연다. */
/* 세 번째 칸은 모바일용 짧은 이름이다. 폰에서 한 칸이 72px 밖에 안 되는데
   `한마디 · 피드백` 을 그대로 쓰면 `한마디 · …` 로 잘려서 뭘 누르는지 모른다. */
const MTABS = [['sum', '요약'], ['act', '활동'], ['cm', '한마디 · 피드백', '한마디'],
               ['pay', '결제'], ['memo', '내 메모', '메모']];

function pageMember() {
  const id = S.card;
  const m = M[id];
  if (!m) return pageMembers();
  const u = usage(m);
  const hist = HIST[id] || [];
  const pay = PAY[id] || [];
  const fbs = FB[id] || [];
  const open = Q.find(x => x.m === id && !S.done[x.id]);
  const total = pay.reduce((a, x) => a + x[2], 0);
  const maxD = Math.max(1, ...hist.map(h => h[1]));

  const sect = (t, note, body) => `<section data-sect style="display:flex;flex-direction:column;gap:12px;
      padding-bottom:${z(18, 22)}px;border-bottom:1px solid var(--ns-line)">
    <div style="display:flex;align-items:baseline;gap:9px">
      <span style="width:3px;height:14px;border-radius:2px;background:var(--ns-green);
        display:inline-block;transform:translateY(2px)"></span>
      <span style="font-size:14.5px;font-weight:700;color:var(--ns-ink)">${t}</span>
      ${note ? `<span style="font-size:11.5px;font-weight:500;color:var(--ns-ink3)">${note}</span>` : ''}</div>
    ${body}</section>`;
  const card = body => `<div style="background:var(--ns-card);border:1px solid var(--ns-line);
    border-radius:13px;overflow:hidden">${body}</div>`;
  const fact = (k, v, note, col) => `<div style="background:var(--ns-card);border:1px solid var(--ns-line);
    border-radius:12px;padding:15px 16px;display:flex;flex-direction:column;gap:5px">
    <span style="font-size:11.5px;font-weight:600;color:var(--ns-ink3)">${k}</span>
    <span style="font-size:17px;font-weight:700;letter-spacing:-.02em;font-family:var(--font-num);
      color:${col || 'var(--ns-ink)'}">${v}</span>
    ${note ? `<span style="font-size:11px;font-weight:500;color:var(--ns-ink3);line-height:1.55">${note}</span>` : ''}
  </div>`;
  const cmCard = (pp, i) => {
    const key = 'D' + id + i, op = !!S.open[key], lines = pp.txt.split('\n\n');
    return `<div data-past="${key}" style="background:var(--ns-card);border:1px solid var(--ns-line);
      border-radius:12px;padding:15px 17px;display:flex;flex-direction:column;gap:8px;cursor:pointer">
      <div style="display:flex;align-items:baseline;gap:9px">
        <span style="font-size:12.5px;font-weight:700;color:var(--ns-bronze);
          font-family:var(--font-num)">${esc(pp.d)}</span>
        <span style="flex:1;font-size:11.5px;font-weight:500;color:var(--ns-ink3)">${esc(pp.club)}</span>
        ${pp.photo ? `<span style="font-size:11px;font-weight:600;color:var(--ns-ink3)">사진 ${pp.photo}</span>` : ''}
      </div>
      <span style="font-size:13.5px;font-weight:400;color:var(--ns-ink2);line-height:1.85;
        ${op ? 'white-space:pre-wrap' : 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'}"
        >${esc(op ? pp.txt : lines[0])}</span>
      ${lines.length > 1 || pp.txt.length > 60 ? `<span style="font-size:11.5px;font-weight:700;
        color:var(--ns-green)">${op ? '접기' : `더 보기 · ${lines.length}문단`}</span>` : ''}
    </div>`;
  };

  /* 늘 붙어 있는 머리 */
  const head = `<div style="display:flex;align-items:flex-start;gap:${z(12, 16)}px;flex-wrap:wrap">
    <span style="width:${z(48, 60)}px;height:${z(48, 60)}px;border-radius:50%;background:var(--ns-green);
      color:#FFF;flex:none;display:flex;align-items:center;justify-content:center;
      font-size:${z(18, 22)}px;font-weight:700">${esc(m.name[0])}</span>
    <div style="flex:1;min-width:${B() ? '0' : '150px'};display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap">
        <span style="font-size:${z(19, 23)}px;font-weight:700;letter-spacing:-.03em;
          white-space:nowrap;color:var(--ns-ink)">${esc(m.name)}</span>
        <span style="font-size:${z(12.5, 14)}px;font-weight:500;color:var(--ns-ink3)">${esc(m.real)}</span>
        <span style="font-size:11.5px;font-weight:700;color:${u.col};background:${u.state === 'none'
          ? 'rgba(192,57,43,.09)' : u.state === 'low' ? 'rgba(166,124,61,.1)' : 'var(--ns-soft)'};
          border-radius:8px;padding:5px 10px">${u.word}</span>
      </div>
      <span style="font-size:${z(12, 13)}px;font-weight:500;color:var(--ns-ink2)">
        ${esc(m.plan)} · ${m.months}개월째 · ${esc(m.join)} 가입</span>
    </div>
    <div style="${B() ? 'flex:none;' : 'flex-basis:100%;'}display:flex;gap:8px">
      ${open ? `<span data-cardgo="${open.id}" style="${B() ? '' : 'flex:1;text-align:center;'}
        font-size:${z(12.5, 13)}px;font-weight:700;color:#FFF;
        background:var(--ns-green);border-radius:10px;padding:11px 18px;cursor:pointer">
        한마디 쓰러 가기</span>` : ''}
      <span data-poke style="${B() ? '' : 'flex:1;text-align:center;'}
        font-size:${z(12.5, 13)}px;font-weight:600;color:var(--ns-ink2);
        border:1px solid var(--ns-line);background:var(--ns-card);border-radius:10px;
        padding:11px 16px;cursor:pointer">먼저 연락하기</span>
    </div>
  </div>`;

  /* 부제목 — 여기서 갈라 들어간다 */
  const badge = k => k === 'cm' ? m.past.length : k === 'pay' ? pay.length
                   : k === 'memo' && MEMO[id] ? 1 : 0;
  /* 칸을 가로로 꽉 채운다. 좁게 몰아 놓으면 눌러야 할 것처럼 안 보인다.
     칸마다 세로 구분선을 둬서 어디까지가 한 칸인지 눈으로 끊어준다. */
  const tabs = `<div style="display:flex;background:var(--ns-card);border:1px solid var(--ns-line);
      border-radius:12px;overflow:hidden">
    ${MTABS.map(([k, n, mn], i) => {
      const on = S.mtab === k;
      if (!B() && mn) n = mn;
      return `<span data-mtab="${k}" style="flex:1;min-width:0;display:flex;align-items:center;
        justify-content:center;gap:7px;padding:${z(11, 14)}px ${z(6, 10)}px;cursor:pointer;
        min-height:44px;box-sizing:border-box;white-space:nowrap;position:relative;
        ${i ? 'border-left:1px solid var(--ns-line);' : ''}
        background:${on ? 'var(--ns-soft)' : 'transparent'};
        box-shadow:${on ? 'inset 0 -2.5px 0 var(--ns-green)' : 'none'}">
        <span style="font-size:${z(12, 13.5)}px;font-weight:${on ? 700 : 500};
          color:${on ? 'var(--ns-ink)' : 'var(--ns-ink3)'};overflow:hidden;
          text-overflow:ellipsis">${n}</span>
        ${badge(k) ? `<span style="flex:none;font-size:10px;font-weight:700;font-family:var(--font-num);
          color:${on ? '#FFF' : 'var(--ns-ink3)'};background:${on ? 'var(--ns-green)' : 'var(--ns-sand)'};
          border-radius:7px;padding:1px 6px">${badge(k)}</span>` : ''}
      </span>`;
    }).join('')}
  </div>`;

  /* ── 요약 ── 여기만 봐도 지금 뭘 해야 하는지 나와야 한다 */
  const paySum = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:11px">
    ${fact('처음 온 날', esc(m.join), '가입')}
    ${fact('첫 결제', m.pay1 ? esc(m.pay1) : '아직 없어요',
      m.pay1 ? (m.join === m.pay1 ? '가입한 날 바로' : '가입 뒤 결제') : '무료로 쓰는 중')}
    ${fact('지금까지 낸 돈', total ? won(total) + '원' : '0원', pay.length + '번 결제')}
    ${fact('다음 결제일', pay.length ? '8월 ' + pay[pay.length - 1][0].split('.')[2] + '일' : '—',
      esc(m.plan) + (PRICE_OF[m.plan] ? ' · ' + won(PRICE_OF[m.plan]) + '원' : ''))}
  </div>`;
  const lastCm = m.past.length
    ? sect('내가 마지막으로 한 말', esc(m.past[0].d), cmCard(m.past[0], 0)
        + `<span data-mtab="cm" style="align-self:flex-start;font-size:12px;font-weight:700;
            color:var(--ns-green);cursor:pointer;padding-top:2px">한마디 ${m.past.length}개 전부 보기 ›</span>`)
    : '';
  const sum = `${sect('이번 달 한마디를 쓰고 있나', '',
      card(`<div style="padding:18px">${usageBar(m, 1)}</div>`))}
    ${sect('언제부터 · 얼마를 냈나', '', paySum)}
    ${lastCm}`;

  /* ── 활동 ── */
  const bars = card(`<div style="padding:${z(14, 20)}px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;align-items:flex-end;gap:${z(8, 12)}px;height:150px">
      ${hist.map(([mo, d], i) => {
        const on = i === hist.length - 1;
        const drop = i && d < hist[i - 1][1] * 0.6;
        return `<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;
          height:100%;justify-content:flex-end">
          <span style="font-size:11.5px;font-weight:700;font-family:var(--font-num);
            color:${drop ? 'var(--ns-danger)' : on ? 'var(--ns-green)' : 'var(--ns-ink3)'}">${d}</span>
          <span style="width:100%;max-width:52px;height:${Math.round(d / maxD * 96)}px;
            border-radius:6px 6px 3px 3px;background:${drop ? 'var(--ns-danger)'
              : on ? 'var(--ns-green)' : 'var(--ns-sand)'}"></span>
          <span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">${mo}</span></span>`;
      }).join('')}
    </div>
    <div style="border-top:1px solid #F2ECE2;padding-top:13px;display:flex;flex-direction:column;gap:7px">
      ${[['연습한 날', 1, '일'], ['올린 영상', 2, '개'], ['쓴 한마디', 3, '회'], ['앱을 연 날', 4, '일']]
        .map(([lab, ix, unit]) => `<div style="display:flex;align-items:center;gap:8px">
          <span style="flex:none;width:${z(62, 76)}px;font-size:11.5px;font-weight:600;
            color:var(--ns-ink3)">${lab}</span>
          ${hist.map(h => `<span style="flex:1;text-align:center;font-size:${z(11, 12)}px;font-weight:${
            h === hist[hist.length - 1] ? 700 : 500};font-family:var(--font-num);
            color:var(--ns-ink${h === hist[hist.length - 1] ? '' : '2'})">${h[ix]}${unit}</span>`).join('')}
        </div>`).join('')}
    </div>
  </div>`);
  const vids = card(`<div style="padding:16px 18px;display:flex;gap:10px;overflow-x:auto">
    ${m.vids.map(v => `<span style="flex:none;width:82px;display:flex;flex-direction:column;gap:5px">
      <span style="height:104px;border-radius:9px;background:#1B2019;
        border:${v.today ? '2px solid var(--ns-green)' : '1px solid var(--ns-line)'};
        display:flex;align-items:center;justify-content:center">${FIG('72%')}</span>
      <span style="font-size:10.5px;font-weight:600;color:var(--ns-ink2);text-align:center">${esc(v.d)}</span>
      <span style="font-size:9.5px;font-weight:500;color:var(--ns-ink3);text-align:center">
        ${esc(v.view)} · ${esc(v.club)}</span></span>`).join('')}
  </div>`);
  const act = `${sect('달마다 얼마나 썼나', '연습한 날이 뚝 떨어지면 빨강입니다', bars)}
    ${sect('올린 스윙', m.vids.length + '개 · 마지막 ' + esc(m.lastUp), vids)}`;

  /* ── 한마디 · 피드백 ── */
  const past = m.past.length
    ? `<div style="display:flex;flex-direction:column;gap:10px">${m.past.map(cmCard).join('')}</div>`
    : card(`<div style="padding:22px;text-align:center;font-size:12.5px;font-weight:500;
        color:var(--ns-ink3);line-height:1.7">아직 한마디를 보낸 적이 없어요.<br>
        이 사람에게 첫 말이 무엇이 될지가 남습니다.</div>`);
  const fbRows = fbs.length ? card(fbs.map((x, i) => `<div style="display:flex;align-items:center;gap:14px;
    padding:13px 18px;${i === fbs.length - 1 ? '' : 'border-bottom:1px solid #F2ECE2'}">
    <span style="flex:none;width:56px;font-size:12.5px;font-weight:700;color:var(--ns-green);
      font-family:var(--font-num)">${esc(x[0])}</span>
    <span style="flex:1;font-size:12.5px;font-weight:600;color:var(--ns-ink)">${esc(x[2])}</span>
    <span style="flex:none;font-size:11.5px;font-weight:500;color:var(--ns-ink3);
      font-family:var(--font-num)">${esc(x[1])}</span></div>`).join(''))
    : card(`<div style="padding:20px;text-align:center;font-size:12.5px;font-weight:500;color:var(--ns-ink3);
        line-height:1.7">정기 피드백을 안 받는 등급이에요.<br>프로 한마디가 이 사람이 받는 전부입니다.</div>`);
  const cm = `${sect('내가 달아준 한마디', m.past.length + '개', past)}
    ${sect('정기 피드백', fbs.length ? fbs.length + '개' : '', fbRows)}`;

  /* ── 결제 ── */
  const payRows = pay.length ? card(pay.slice().reverse().map((x, i) => `<div style="display:flex;
    align-items:center;gap:14px;padding:13px 18px;${i === pay.length - 1 ? '' : 'border-bottom:1px solid #F2ECE2'}">
    <span style="flex:none;width:110px;font-size:12.5px;font-weight:600;color:var(--ns-ink2);
      font-family:var(--font-num)">${esc(x[0])}</span>
    <span style="flex:1;font-size:12.5px;font-weight:600;color:var(--ns-ink)">${esc(x[1])}</span>
    <span style="flex:none;font-size:12.5px;font-weight:700;color:var(--ns-ink);
      font-family:var(--font-num)">${won(x[2])}원</span></div>`).join(''))
    : card(`<div style="padding:22px;text-align:center;font-size:12.5px;font-weight:500;
        color:var(--ns-ink3);line-height:1.7">아직 결제한 적이 없어요.<br>
        무료로 쓰면서 지켜보는 중입니다.</div>`);
  const payTab = `${sect('언제부터 · 얼마를 냈나', '', paySum)}
    ${sect('결제 이력', pay.length ? pay.length + '번' : '', payRows)}`;

  /* ── 메모 ── */
  const memo = `${sect('내 메모', '회원에겐 안 보여요',
    card(`<div style="padding:16px 18px;font-size:13px;font-weight:400;color:var(--ns-ink2);
      line-height:1.85;white-space:pre-wrap">${esc(MEMO[id] || '아직 남긴 메모가 없어요.')}</div>`))}`;

  let body = { sum, act, cm, pay: payTab, memo }[S.mtab] || sum;
  /* 마지막 마디엔 밑줄이 필요 없다 — 그 아래엔 아무것도 없어서
     선만 덩그러니 떠 있으면 아직 뭐가 더 있는 것처럼 보인다. */
  const lastSect = body.lastIndexOf('<section data-sect');
  if (lastSect >= 0) body = body.slice(0, lastSect)
    + body.slice(lastSect).replace('border-bottom:1px solid var(--ns-line)', 'border-bottom:none');

  return `<div style="flex:1;min-height:0;display:flex;flex-direction:column;background:var(--ns-bg)">
    <div style="flex:none;padding:${z(14, 20)}px ${z(14, 30)}px ${z(12, 16)}px;
      background:var(--ns-bg);border-bottom:1px solid var(--ns-line)">
      <div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:${z(14, 18)}px">
        ${head}
        ${tabs}
      </div>
    </div>
    <div style="flex:1;min-height:0;overflow-y:auto;padding:${z(16, 22)}px ${z(14, 30)}px 44px">
      <div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;
        gap:${z(18, 22)}px">${body}</div>
    </div></div>`;
}

/* ── 그리기 ─────────────────────────────────────────────────────── */
function render() {
  // 도착함·회원 관리·대시보드가 같은 서버 데이터를 본다
  if (['inbox', 'members', 'home', 'stats'].includes(S.nav)) inLoad();
  const pc = S.view === 'pc';
  document.documentElement.classList.toggle('pcmode', pc);
  $('#frame').innerHTML = pc
    ? `<div class="pcbox">${renderPC()}</div>`
    : `<div class="mobox">${renderMO()}</div>`;
  $('#over').innerHTML = renderMark();
  document.querySelectorAll('.vtab').forEach(b => b.classList.toggle('on', b.dataset.v === S.view));
  wire();
}

function on(sel, ev, fn) { document.querySelectorAll(sel).forEach(e => e.addEventListener(ev, fn)); }

function wire() {
  inWire();
  crmWire();
  const q = cur();
  on('[data-q]', 'click', e => {
    S.pick = e.currentTarget.dataset.q;
    S.nav = 'queue';
    if (S.view === 'mo') S.mo = S.done[S.pick] ? 'd' : 'w';
    render();
  });
  on('[data-txt]', 'input', e => {
    S.draft[q.id] = e.target.value;
    const b = $('[data-send]');
    if (b) b.style.opacity = e.target.value.trim() ? 1 : .38;
  });
  on('[data-snip]', 'click', e => {
    const t = $('[data-txt]');
    const add = SNIP[+e.currentTarget.dataset.snip];
    S.draft[q.id] = ((S.draft[q.id] || '') + (S.draft[q.id] ? ' ' : '') + add);
    render();
    const n = $('[data-txt]');
    if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
  });
  // 영상에서 장면 뽑기 → 바로 선 긋기 창으로. 중간 단계를 두지 않는다.
  const grab = () => {
    const list = shots(q.id);
    list.push({ at: '0:10', lines: [] });
    S.mark = { qid: q.id, i: list.length - 1 };
    render();
  };
  on('[data-capture],[data-addshot]', 'click', grab);
  on('[data-shot]', 'click', e => {
    S.mark = { qid: q.id, i: +e.currentTarget.dataset.shot };
    render();
  });
  on('[data-send]', 'click', () => {
    if (!(S.draft[q.id] || '').trim()) return;
    S.done[q.id] = true;
    if (S.view === 'mo') S.mo = 'd';
    render();
  });
  on('[data-next]', 'click', () => {
    const n = waiting()[0];
    if (n) { S.pick = n.id; if (S.view === 'mo') S.mo = 'w'; }
    else if (S.view === 'mo') S.mo = 'q';
    render();
  });
  on('[data-nav]', 'click', e => {
    const to = e.currentTarget.dataset.nav;
    if (to !== S.nav) S.back.push({ nav: S.nav, card: S.card, mtab: S.mtab });
    S.nav = to; S.card = null; S.more = false; S.bell = false;
    if (S.view === 'mo' && S.nav === 'queue') S.mo = 'q';
    render();
  });
  on('[data-search]', 'click', () => { S.nav = 'members'; render(); toast('회원 관리에서 찾아보세요'); });
  on('[data-fold]', 'click', e => { e.stopPropagation(); S.fold = !S.fold; render(); });
  on('[data-bell]', 'click', () => { S.bell = !S.bell; S.more = false; render(); });
  on('[data-alert]', 'click', e => {
    const id = e.currentTarget.dataset.alert;
    S.read[id] = true;
    S.pick = id.split('@')[0];
    if (S.nav !== 'queue') S.back.push({ nav: S.nav, card: S.card, mtab: S.mtab });
    S.nav = 'queue'; S.bell = false;
    if (S.view === 'mo') S.mo = 'w';
    render();
  });
  on('[data-readall]', 'click', e => { e.stopPropagation(); alerts().forEach(a => { S.read[a.id] = true; }); render(); });
  on('[data-step]', 'click', e => { const h = e.currentTarget.dataset.step; S.steps[h] = !S.steps[h]; render(); });
  on('[data-how]', 'click', e => { const k = e.currentTarget.dataset.how; S.how[k] = !S.how[k]; render(); });
  on('[data-quiet]', 'click', () => { S.quiet = !S.quiet; render(); });
  on('[data-go]', 'click', e => { S.nav = e.currentTarget.dataset.go; render(); });
  on('[data-mem]', 'click', e => {
    S.back.push({ nav: S.nav, card: S.card, mtab: S.mtab });
    S.card = e.currentTarget.dataset.mem; S.nav = 'member'; S.bell = false; S.mtab = 'sum';
    if (S.view === 'mo') S.mo = 'q';
    render();
  });
  on('[data-mtab]', 'click', e => { S.mtab = e.currentTarget.dataset.mtab; render(); });
  on('[data-mview]', 'click', e => { S.mview = e.currentTarget.dataset.mview; render(); });
  on('[data-back-mem],[data-goback]', 'click', () => {
    const p = S.back.pop();
    if (p) { S.nav = p.nav; S.card = p.card; S.mtab = p.mtab || 'sum'; }
    else S.nav = 'home';
    render();
  });
  on('[data-poke]', 'click', () => toast('카카오 알림톡으로 안부를 보냅니다'));
  on('[data-cardgo]', 'click', e => {
    S.pick = e.currentTarget.dataset.cardgo;
    S.back.push({ nav: S.nav, card: S.card, mtab: S.mtab });
    S.nav = 'queue';
    if (S.view === 'mo') S.mo = 'w';
    render();
  });
  on('[data-open]', 'click', () => { S.mo = 'h'; render(); });
  on('[data-toW]', 'click', () => { S.mo = 'w'; render(); });
  on('[data-toQ]', 'click', () => { S.mo = 'q'; render(); });
  on('[data-back]', 'click', () => {
    if (S.nav === 'member') { S.nav = 'members'; return render(); }
    S.mo = S.mo === 'h' ? 'w' : 'q'; render();
  });
  on('[data-play]', 'click', () => toast('영상을 재생합니다'));
  on('[data-speed]', 'click', e => toast(e.currentTarget.dataset.speed + ' 로 봅니다'));
  on('[data-past]', 'click', e => {
    const k = e.currentTarget.dataset.past;
    S.open[k] = !S.open[k];
    render();
  });
  on('[data-vid]', 'click', () => toast('이번 스윙과 나란히 놓고 봅니다'));

  // 끌어서 선 하나
  const cv = $('[data-canvas]');
  const sh = editing();
  if (cv && sh) {
    let from = null;
    const pos = ev => {
      const r = cv.getBoundingClientRect();
      return [(ev.clientX - r.left) / r.width * 300, (ev.clientY - r.top) / r.height * 400];
    };
    cv.addEventListener('pointerdown', ev => { from = pos(ev); cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointerup', ev => {
      if (!from) return;
      const to = pos(ev);
      if (Math.hypot(to[0] - from[0], to[1] - from[1]) > 8)
        sh.lines.push([from[0], from[1], to[0], to[1], S.tool]);
      from = null; render();
    });
  }
  on('[data-tool]', 'click', e => { S.tool = e.currentTarget.dataset.tool; render(); });
  on('[data-undo]', 'click', () => { const x = editing(); if (x) x.lines.pop(); render(); });
  on('[data-markdone]', 'click', () => {
    const x = editing();
    // 아무것도 안 그은 장면은 붙일 이유가 없다
    if (x && !x.lines.length) return closeMark(true);
    S.mark = null; render(); toast('장면을 첨부했어요');
  });
  on('[data-markdel]', 'click', () => closeMark(true));
  on('[data-markcancel]', 'click', () => closeMark(false));
  on('[data-markbg]', 'click', e => { if (e.target === e.currentTarget) closeMark(false); });
}

/* 창을 닫는다. drop 이면 그 장면을 목록에서 뺀다.
   방금 뽑았는데 아무것도 안 그었으면 빈 장면이 남으면 안 된다. */
function closeMark(drop) {
  const m = S.mark;
  if (m) {
    const list = shots(m.qid);
    const x = list[m.i];
    if (drop || (x && !x.lines.length)) list.splice(m.i, 1);
  }
  S.mark = null; render();
}

let tt;
function toast(t) {
  const b = $('#toast');
  b.textContent = t; b.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => b.classList.remove('show'), 1800);
}

document.querySelectorAll('.vtab').forEach(b =>
  b.addEventListener('click', () => { S.view = b.dataset.v; render(); }));
if (/[?&]view=mo/.test(location.search)) S.view = 'mo';
render();
