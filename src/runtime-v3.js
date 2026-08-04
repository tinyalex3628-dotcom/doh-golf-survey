"use strict";
/* ── NEXT SWING v3 동작 프로토타입 런타임 ────────────────────────────
   화면 마크업은 <template data-scr="…"> 에 디자인 핸드오프 원본 그대로 들어 있고,
   여기서는 렌더 후 텍스트·아이콘 매칭으로 클릭을 배선한다.               */

const GROUPS = [
  ['메인 5탭',      ['2a', '2b', '2c', '2d', '2h', '2e']],
  ['알림',          ['ar', 'nt', 'ns']],
  ['상태',          ['uf', 'ge']],
  ['스윙',          ['09', '2g']],
  ['레슨기록',       ['2f', '2i']],
  ['프로 한마디',    ['pc1', 'pc2', 'pc3']],
  ['스윙 분석 신청', ['01', '02']],
  ['허브 · AI 설문', ['03', '04', '05', '06', '07']],
  ['정기 피드백 결과지', ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8']],
  ['스윙분석 엔진',   ['sw', 'e1', 'e2', 'e3']],
  ['영상 분석',      ['08', '11', 'cg']],
  ['프로와 비교',    ['12', '13']],
  ['사전 · 구독',    ['16', 'fx', 'cx', '17', '18', '19', 'cp', 'cs', 'tm']],
  ['구독 결제',      ['22', '23', '24']],
  ['피드백 도착',    ['6d']],
];

/* 기간 비교에 쓰는 날짜. 데모 계정의 스윙 기록에 맞춰 고정해 뒀다
   (r2 여정 3~6월 · 갤러리 6~7월). 실서비스에선 서버가 내려준다. */
const CMP_NEW = { long: '7월 22일', short: '7/22' };
const CMP_AGO = {
  '1': { label: '1개월 전', long: '6월 28일', short: '6/28' },
  '2': { label: '2개월 전', long: '5월 24일', short: '5/24' },
  '3': { label: '3개월 전', long: '4월 19일', short: '4/19' },
};

const stage = document.getElementById('stage');
const S = { route: '2a', hist: [], step: 1, picked: null, vids: 0, viaLoading: false,
            view: 'FO', clip: false, job: null, replies: 0, seenIntro: false,
            faq: false, swCompare: false,
            // 기간 비교 — 몇 달 전 스윙과 나란히 볼지. 목적지는 11 이다.
            cmpAgo: '1',
            // AI 설문 답 — 서버로는 { Q1_BALL_FLIGHT: 'SLICE', … } 형태로 나간다
            survey: {}, vidPicked: false,
            // 업로드 — 한 번이라도 올렸는지(빈 갤러리 판단), 몇 번째 시도인지.
            upDone: false, upTry: 0, upFailed: false,
            // 올라가는 중인 영상. 화면을 나가도 여기 남아 계속 돈다.
            up: null,
            // 연습기록 — 오늘 카드 / 프로 한마디 카드는 서로 다른 축의 상태다.
            // 기본값은 앱 전체 내러티브(2g·pc1 이 이미 "오늘 스윙 업로드 완료 · 코멘트 도착"을
            // 전제로 한다)와 맞춘다.
            today: 'empty', cm: 'none', selDay: null,
            // 알림 — 안 읽은 개수와, 홈 상단 도착 띠를 닫았는지.
            // 띠는 '안 읽은 도착 알림'이 있을 때만 뜬다. 읽거나 닫으면 사라진다.
            unread: 0, stripOff: false,
            // 이 계정이 어떤 사람인지, 그리고 실제로 쌓인 것 (ACCOUNT 참고).
            // 기본은 링크를 받고 방금 들어온 사람이다.
            acct: 'new', mine: { vids: 0, days: 0, streak: 0 },
            // 달력이 보고 있는 달 — 처음엔 이번 달
            cal: { y: new Date().getFullYear(), m: new Date().getMonth() },
            // 오늘 기록에 실제로 적어 넣은 것 — 대기 화면(pc2)이 이걸 그대로 보여준다
            log: { feel: null, mins: null, memo: '', at: null },
            // 한마디 요청 — 언제 했고, 이번 달 몇 번 썼는지. 「6시간 전」 같은 건 전부 여기서 계산한다
            cmAt: null, cmUsed: 0,
            // 가입해서 정한 닉네임 — 없으면 화면의 예시 이름이 그대로 보인다
            nick: null,
            // 구독 등급. 정기 피드백은 Elite 전용, 프로 한마디는 Basic 부터.
            // 베타는 Coaching 한 칸으로 고정한다 (BETA 참고) — 프로가 지금
            // 실제로 해줄 수 있는 게 「프로 한마디」뿐이다.
            plan: 'coaching',
            // 결제하려는 플랜. 요금표에서 고른 것이 결제 화면까지 그대로 따라간다.
            buy: null };

/* 등급별로 무엇이 열려 있는지 — 한 곳에만 적는다 */
const PLAN = {
  free:     { name: '무료',     cm: 0, fb: 0 },
  basic:    { name: 'Basic',    cm: 2, fb: 0 },
  coaching: { name: 'Coaching', cm: 5, fb: 0 },
  elite:    { name: 'Elite',    cm: 6, fb: 1 },
};
/* 오프라인 레슨 할인권 — 등급별로 매달 한 장. 앱을 오프라인으로 잇는 통로다.
   숫자는 요금표(17·18)의 '정기레슨 10% 할인' 과 맞춰 뒀다. */
const COUPONS = { free: 0, basic: 0, coaching: 1, elite: 2 };
/* 프로가 주는 건 두 가지고, 회원은 계속 헷갈린다.
   말로 설명하는 것보다 색을 고정하는 게 빠르다. 앱 어디서나 같은 규칙이다.
     프로 한마디  = 청동   (스윙 하나 · 짧게 · 하루 안)
     정기 피드백  = 초록   (한 달치 · 영상 리포트 · 월 1회) */
const TONE = {
  cm: { line: 'var(--ns-bronze)', face: 'rgba(166,124,61,.10)', edge: 'rgba(166,124,61,.28)' },
  fb: { line: 'var(--ns-green)',  face: 'var(--ns-soft)',        edge: '#DCE7DE' },
};
const PERKS = {
  free:     ['업로드 · 연습기록', 'AI 분석'],
  basic:    ['프로 한마디 2회', 'AI 분석 · 갤러리'],
  coaching: ['프로 한마디 5회', '원포인트 레슨권 20%'],
  elite:    ['정기 피드백 월 1회', '프로 한마디 6회'],
};

/* 등급별 혜택 — 여기 한 곳에만 적는다.
   전에는 요금표 두 장(17 · 18)에 각각 박혀 있어서, 한쪽만 고치면 조용히 어긋났다.
   all 은 줄줄이 적는 화면(18)용, line 은 한 줄로 이어붙이는 화면(17)용.
   베타 입구의 「구독 안내」도 이걸 그대로 읽는다 — 세 곳이 늘 같은 말을 한다. */
const BENEFIT = {
  free: {
    all: ['스윙 업로드 · 연습기록', 'AI 분석 · 월간 연습 리포트', '프로 한마디 · 정기 피드백 없음'],
    line: '스윙 업로드 · 연습기록 · AI 분석',
  },
  basic: {
    all: ['AI 분석 · 갤러리 · 프로 스윙 열람', '프로 한마디 월 2회', '정기 피드백 없음'],
    line: 'AI 분석 · 갤러리 · 프로 한마디 월 2회',
  },
  coaching: {
    all: ['Basic 포함', '프로 한마디 월 5회', '원포인트 레슨 할인권 20% 매월 증정', '정기 피드백 없음'],
    line: 'Basic 포함 · 프로 한마디 월 5회 · 원포인트 20% 매월',
  },
  elite: {
    all: ['Coaching 포함', '정기 피드백 월 1회', '프로 한마디 월 6회', '맞춤 영상 피드백',
          '원포인트 레슨 할인권 20% 매월 증정', '정기레슨 15% 할인'],
    line: 'Coaching 포함 · 정기 피드백 월 1회 · 원포인트 20% 매월 · 정기레슨 15%',
  },
};
window.__BENEFIT = BENEFIT;

/* 요금표 카드의 혜택 줄을 BENEFIT 으로 다시 쓴다.
   두 화면의 담는 방식이 다르다 — 18 은 「· 항목」 이 줄줄이, 17 은 한 줄로 이어붙인 것. */
function applyBenefits() {
  root().querySelectorAll('[data-plan-card]').forEach(card => {
    const B = BENEFIT[card.dataset.planCard];
    if (!B) return;
    const spans = Array.from(card.querySelectorAll('span'));

    const list = spans.find(e => e.childElementCount > 1 && e.firstElementChild
      && /^·/.test(e.firstElementChild.textContent.trim()));
    if (list) {
      // 줄 수가 늘면 마지막 줄을 본떠 복제한다 — 색이 붙은 앞줄들은 그대로 둔다
      const proto = list.lastElementChild;
      B.all.forEach((t, i) => {
        let el = list.children[i];
        if (!el) { el = proto.cloneNode(false); list.appendChild(el); }
        el.textContent = '· ' + t;
      });
      while (list.children.length > B.all.length) list.lastElementChild.remove();
      return;
    }

    const one = spans.find(e => !e.childElementCount && e.textContent.includes(' · ')
      && !/원$/.test(e.textContent.trim()));
    if (one) one.textContent = B.line;
  });
}
const can = k => PLAN[S.plan][k] > 0;

/* 요금 — 요금표(17·18)와 결제 화면(22·23·24)이 같은 숫자를 쓴다.
   전에는 결제 흐름이 Elite 79,000원으로 박혀 있어서, Basic 을 고른 사람도
   79,000원 결제 화면을 봤다. */
const LADDER = ['free', 'basic', 'coaching', 'elite'];
const PRICE = { free: 0, basic: 19000, coaching: 39000, elite: 79000 };

/* ── 베타 ───────────────────────────────────────────────────────────
   프로가 지금 실제로 해줄 수 있는 건 「프로 한마디」 하나다.
   정기 피드백은 한 달치를 모아 리포트로 만드는 일이라, 군 복무 중에는 못 한다.
   그래서 베타는 Coaching 한 칸으로 고정한다 — 못 해줄 것을 팔지 않는다.
   가격도 아직 안 정했다. 화면에 숫자를 띄우는 순간 그게 곧 약속이 된다.
   정식으로 열 때 이 블록만 끄면 원래 흐름이 그대로 돌아온다. */
const BETA = { on: true, plan: 'coaching' };
const priceOf = k => BETA.on ? '' : '월 ' + won(PRICE[k]) + '원';
const amount = k => BETA.on ? '미정' : won(PRICE[k]) + '원';
/* 「Coaching · 가격 미정」 처럼 이름 뒤에 값을 붙이던 자리 — 베타에는 이름만 남는다 */
const planLabel = k => PLAN[k].name + (BETA.on ? '' : ' · ' + priceOf(k));
/* 지금 등급에서 한 단계 위 — 고민자에게 보여줄 '다음 칸'이다 */
const NEXT = k => LADDER[Math.min(LADDER.indexOf(k) + 1, 3)];
const won = n => n.toLocaleString('ko-KR');
/* 결제 대상. 아직 안 고른 채로 결제 화면에 오면 다음 칸을 기본으로 잡는다. */
const buying = () => BETA.on ? BETA.plan : (S.buy || NEXT(S.plan));

/* ── 날짜 ────────────────────────────────────────────────────────────
   화면에는 2026년 7월 22일이 박혀 있다. 8·9월에 진짜로 쓸 앱이니
   오늘은 진짜 오늘이어야 하고, 달력은 이번 달을 그려야 한다.
   점이 찍히는 날은 내가 실제로 스윙을 올린 날뿐이다. */
const TODAY = new Date();
/* 엔진 번들에 이미 esc 가 있다 — 이름을 비켜 쓴다 */
const safe = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const cmWhen = t => {
  const d = new Date(t), gap = Math.floor((Date.now() - d) / 36e5);
  if (gap < 1) return '방금';
  if (gap < 24) return gap + '시간 전';
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
};
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const dkey = d => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
const md = d => (d.getMonth() + 1) + '월 ' + d.getDate() + '일';

/* 내가 올린 날 → 그날의 스윙들 */
function myDays() {
  const map = {};
  window.__SWINGS.forEach(r => {
    const k = dkey(new Date(r.at));
    (map[k] = map[k] || []).push(r);
  });
  return map;
}

/* 그날 올린 스윙을 펼쳐 보여준다. 없는 날은 들어갈 것이 없다. */
function openDay(y, m, d) {
  const list = myDays()[y + '-' + m + '-' + d] || [];
  const when = new Date(y, m, d);
  if (!list.length) {
    return toast(when > TODAY ? '아직 오지 않은 날이에요'
                              : md(when) + '엔 올린 스윙이 없어요');
  }
  const box = document.createElement('div');
  box.id = 'swplay';
  box.innerHTML =
    '<div class="swp-card"><div class="swp-top"><span class="swp-nm">'
    + md(when) + ' (' + DOW[when.getDay()] + ') · 스윙 ' + list.length + '개</span>'
    + '<button class="swp-x" type="button" data-x>닫기</button></div>'
    + '<div class="swp-day"></div></div>';
  const wrap = box.querySelector('.swp-day');
  list.forEach(r => {
    const cell = document.createElement('span');
    cell.className = 'swp-cell';
    cell.innerHTML = (r.poster ? '<img src="' + r.poster + '" alt="">' : '')
      + '<span class="swp-tag">' + r.view + '</span>';
    cell.addEventListener('click', () => { box.remove(); playSwing(r); });
    wrap.appendChild(cell);
  });
  box.addEventListener('click', ev => {
    if (ev.target === box || ev.target.closest('[data-x]')) box.remove();
  });
  document.body.appendChild(box);
}

/* 달력을 이번 달로 다시 그린다. 원래 칸에는 2026년 7월이 통째로 박혀 있었다. */
function paintCalendar() {
  const grids = Array.from(root().querySelectorAll('div'))
    .filter(e => /grid-template-columns:\s*repeat\(7/.test(e.getAttribute('style') || ''));
  const grid = grids.find(g => g.querySelector('[data-day]'));
  if (!grid) return;
  const label = Array.from(root().querySelectorAll('span'))
    .find(e => !e.childElementCount && /^\d{4}년 \d{1,2}월$/.test(e.textContent.trim()));
  const y = S.cal.y, m = S.cal.m;
  if (label) label.textContent = y + '년 ' + (m + 1) + '월';

  const days = myDays();
  const lead = new Date(y, m, 1).getDay();
  const last = new Date(y, m + 1, 0).getDate();
  const nowM = y === TODAY.getFullYear() && m === TODAY.getMonth();
  let html = '';
  for (let i = 0; i < lead; i++) html += '<span style="height:39px"></span>';
  for (let d = 1; d <= last; d++) {
    const has = !!days[y + '-' + m + '-' + d];
    const today = nowM && d === TODAY.getDate();
    const soon = new Date(y, m, d) > TODAY;
    html += '<span data-day="' + d + '" style="display:flex;flex-direction:column;'
      + 'align-items:center;gap:3px;padding:3px 0;cursor:pointer">'
      + '<span style="width:26px;height:26px;border-radius:50%;display:flex;'
      + 'align-items:center;justify-content:center;'
      + 'font-family:Pretendard,-apple-system,sans-serif;font-size:12px;font-weight:'
      + (today ? '700' : '500') + ';'
      + (today ? 'background:var(--ns-ink);color:#fff'
               : 'color:' + (soon ? 'var(--ns-ink3);opacity:.5' : 'var(--ns-ink2)'))
      + '">' + d + '</span>'
      + '<span style="width:5px;height:5px;border-radius:50%;background:'
      + (has ? 'var(--ns-green)' : 'transparent') + '"></span></span>';
  }
  grid.innerHTML = html;
  grid.querySelectorAll('[data-day]').forEach(el =>
    tap(el, () => openDay(y, m, +el.dataset.day)));

  // ‹ › 로 달을 넘긴다
  const step = n => { const t = new Date(S.cal.y, S.cal.m + n, 1);
                      S.cal = { y: t.getFullYear(), m: t.getMonth() }; render(); };
  onPath('m14 6-6 6 6 6', () => step(-1));
  onPath('m10 6 6 6-6 6', () => step(1));
}

/* ── 올린 스윙 보기 ─────────────────────────────────────────────────
   보관함에 든 진짜 파일을 연다. 다 보고 닫을 때 주소를 돌려줘야 한다 —
   안 그러면 열 때마다 메모리에 영상이 한 편씩 쌓인다. */
function playSwing(rec) {
  VAULT.url(rec.id).then(u => {
    if (!u) return toast('영상을 열지 못했어요');
    const box = document.createElement('div');
    box.id = 'swplay';
    box.innerHTML =
      '<div class="swp-card">'
      + '<div class="swp-top"><span class="swp-nm">' + rec.view + ' · '
      + new Date(rec.at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
      + '</span><button class="swp-x" type="button" data-x>닫기</button></div>'
      + '<video class="swp-v" src="' + u + '" controls autoplay playsinline></video>'
      + '<div class="swp-foot"><span class="swp-sz">' + Math.round(rec.size / 1024 / 1024 * 10) / 10
      + 'MB</span><button class="swp-del" type="button" data-del>삭제</button></div></div>';
    const shut = () => { VAULT.free(u); box.remove(); };
    box.addEventListener('click', ev => {
      if (ev.target === box || ev.target.closest('[data-x]')) return shut();
      if (ev.target.closest('[data-del]')) {
        confirmSheet('이 스윙을 지울까요?', '지우면 되돌릴 수 없어요.', '지우기', () => {
          VAULT.del(rec.id)
            .then(window.__vaultSync)
            .then(l => { S.mine.vids = l.length; shut(); render(); toast('스윙을 지웠어요'); });
        });
      }
    });
    document.body.appendChild(box);
  });
}

/* 갤러리 — 보관함에 있는 그대로 그린다. 없으면 빈 상태가 남는다. */
function paintGallery(host) {
  const list = window.__SWINGS;
  if (!host || !list.length) return false;
  host.innerHTML =
    '<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 2px 9px">'
    + '<span style="font-family:Pretendard,-apple-system,sans-serif;font-size:12px;font-weight:600;'
    + 'color:var(--ns-ink2)">올린 스윙</span>'
    + '<span style="font-family:Pretendard,-apple-system,sans-serif;font-size:11px;'
    + 'color:var(--ns-ink3)">' + list.length + '개</span></div>'
    + '<div data-swgrid style="display:grid;grid-template-columns:1fr 1fr;gap:9px"></div>';
  const stuck = list.filter(r => !r.sent && r.err).length;
  if (stuck) host.insertAdjacentHTML('beforeend',
    '<div data-resend style="margin-top:10px;display:flex;align-items:center;gap:9px;'
    + 'padding:11px 13px;border-radius:12px;background:rgba(192,57,43,.07);'
    + 'border:1px solid rgba(192,57,43,.24)">'
    + '<span style="flex:1;font-family:Pretendard,-apple-system,sans-serif;font-size:11.5px;'
    + 'color:var(--ns-ink2)">' + stuck + '개가 아직 프로에게 안 갔어요</span>'
    + '<span style="flex:none;font-family:Pretendard,-apple-system,sans-serif;font-size:11.5px;'
    + 'font-weight:700;color:var(--ns-danger)">다시 보내기</span></div>');
  const grid = host.querySelector('[data-swgrid]');
  list.forEach(r => {
    const cell = document.createElement('span');
    cell.setAttribute('style',
      'position:relative;display:block;aspect-ratio:3/4;border-radius:12px;overflow:hidden;'
      + 'background:' + (r.poster ? '#1D2420' : 'var(--ns-sand)')
      + ';border:1px solid var(--ns-line)');
    cell.innerHTML =
      (r.poster ? '<img src="' + r.poster + '" alt="" style="width:100%;height:100%;'
        + 'object-fit:cover;display:block">' : '')
      + '<span style="position:absolute;left:8px;top:8px;padding:3px 7px;border-radius:6px;'
      + 'background:rgba(20,24,22,.62);color:#fff;font-family:Pretendard,-apple-system,sans-serif;'
      + 'font-size:10px;font-weight:600">' + r.view + '</span>'
      + '<span style="position:absolute;left:8px;right:8px;bottom:7px;display:flex;'
      + 'align-items:baseline;justify-content:space-between;gap:6px;color:#fff;'
      + 'font-family:Pretendard,-apple-system,sans-serif;font-size:10.5px;font-weight:500;'
      + 'text-shadow:0 1px 3px rgba(0,0,0,.6)">'
      + '<span>' + new Date(r.at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
      + '</span><span style="font-weight:700;color:' + (r.sent ? '#8FBFA3' : '#E8C07A') + '">'
      + (r.sent ? '전달됨'
         : (r.err ? '재전송 필요'
         : (UPPCT[r.id] != null ? '보내는 중 ' + UPPCT[r.id] + '%' : '대기 중')))
      + '</span></span>';
    tap(cell, () => playSwing(r));
    grid.appendChild(cell);
  });
  const again = host.querySelector('[data-resend]');
  if (again) tap(again, () => { toast('다시 보내는 중이에요'); resendAll(); });
  return true;
}

/* 분석 도구 배선 — 갤러리(09)와 빈 갤러리(ge)가 같은 줄을 쓴다.
   베타에 못 여는 것은 감추지 않는다. 무엇이 생길지는 보여야 기다린다.
   흐리게 두고 부제를 「베타 이후」로 바꾼 다음, 눌러도 안 들어가게 막는다.
   직접 분석은 그대로 연다 — 진짜 엔진이 붙어 있어 지금도 돌아간다. */
const TOOL_GO = { ai: goAI, draw: () => go('08'), cmp: goSwCompare };
/* 프로와 비교는 견줄 프로 스윙이 있어야 성립한다. 아직 한 편도 안 찍었다.
   빈 화면으로 들여보내느니 문 앞에서 이유를 말하는 게 낫다. */
const NO_PRO = '비교할 프로 스윙 영상이 아직 없어요';
const NO_AI  = 'AI 분석은 베타 이후에 열어드릴게요';
/* AI 설문·자동진단으로 들어가는 문은 여럿이다 (홈 · 허브 · 도구 · 알림함).
   카드마다 막으면 하나를 빠뜨린다 — 한 곳에서 잡는다. */
function goAI() {
  if (BETA.on) return toast(NO_AI);
  go('04');
}
const TOOL_LATER = {
  ai:  NO_AI,
  cmp: NO_PRO,
};

function laterMark(el, msg, label) {
  if (el.dataset.later) return;
  el.dataset.later = '1';
  el.style.opacity = '.55';
  // 부제 자리에 그대로 적는다 — 위에 뱃지를 얹으면 좁은 타일에서 글자를 가린다
  const leaves = Array.from(el.querySelectorAll('span'))
    .filter(e => !e.childElementCount && e.textContent.trim());
  const sub = leaves[leaves.length - 1];
  if (sub) sub.textContent = label || '베타 이후';
  el.addEventListener('click', ev => {
    ev.preventDefault(); ev.stopImmediatePropagation();
    toast(msg);
  }, true);
}

/* 화면 어디에 있든 「제목 + 부제」로 카드를 찾아 같은 표시를 붙인다.
   없으면 조용히 지나간다 — 이 층은 55개 화면에서 다 돈다. */
function laterEntry(title, sub, msg) {
  const card = cardUpTo(title, sub);
  if (!card) return;
  /* 도구 줄을 통째로 잡으면 옆에 열려 있는 것(직접 분석)까지 같이 막힌다.
     실제로 그랬다 — 「프로와 비교」를 찾다가 옆 배너의 「나란히 보기」까지
     품는 조상을 잡았고, 그 바람에 줄 전체가 죽었다. */
  if (card.querySelector('[data-swtool], [data-swcmp]')) return;
  laterMark(card, msg);
}

function wireTools() {
  root().querySelectorAll('[data-swtool]').forEach(t => {
    const f = TOOL_GO[t.dataset.swtool];
    f ? tap(t, f) : miss('도구 ' + t.dataset.swtool);
  });
  // 기간 비교 배너 — 이 앱이 파는 것 자체라 도구 타일이 아니라 한 줄을 다 준다.
  const cmp = root().querySelector('[data-swcmp]');
  cmp ? tap(cmp, () => go('cg')) : miss('기간 비교 배너');

  if (!BETA.on) return;
  root().querySelectorAll('[data-swtool]').forEach(t => {
    const msg = TOOL_LATER[t.dataset.swtool];
    if (msg) laterMark(t, msg);
  });
  if (cmp) laterMark(cmp, '기간 비교 \u2014 베타 이후에 열어드릴게요');
}

/* 한 번에 한 칸만 펼친다 — 무엇을 눌러도 화면 높이가 크게 안 변해서 스크롤이 안 생긴다.
   처음 펼쳐두는 건 지금 열려 있는 칸이다 (베타에는 Coaching). */
function planAccordion() {
  const cards = Array.from(root().querySelectorAll('[data-plan-card]'));
  if (!cards.length) return;

  /* 접었다 펼 수 있다는 걸 눈에 보이게. 값을 감췄으니 값 옆이 아니라
     이름 줄의 오른쪽 끝에 단다 — 이름 줄은 어느 화면에서나 카드의 첫 칸이다. */
  cards.forEach(c => {
    const row = c.firstElementChild;
    if (!row || row.querySelector('[data-plan-caret]')) return;
    const car = document.createElement('span');
    car.setAttribute('data-plan-caret', '');
    car.setAttribute('style', 'margin-left:auto;flex:none;font-size:11px;font-weight:600;'
      + 'color:var(--ns-ink3);font-family:Pretendard,-apple-system,sans-serif');
    row.appendChild(car);
  });

  const open = k => cards.forEach(c => {
    const on = c.dataset.planCard === k;
    Array.from(c.children).slice(1).forEach(e => {
      // '' 로 되돌리면 원래 인라인에 있던 display:flex 까지 날아가 혜택 줄이 한 줄로 붙는다
      if (e.dataset.disp === undefined) e.dataset.disp = e.style.display || '';
      e.style.display = on ? e.dataset.disp : 'none';
    });
    c.style.padding = on ? '16px' : '12px 16px';
    // 이 화면에서 흐림은 '못 고르는 칸'이 아니라 '지금 안 읽는 칸'을 뜻한다.
    // 펼친 칸의 글자가 흐리면 읽으라고 펼쳐놓고 읽지 말라는 꼴이다.
    c.style.opacity = on ? '1' : '.62';
    const car = c.querySelector('[data-plan-caret]');
    if (car) car.textContent = on ? '닫기' : '보기';
  });

  cards.forEach(c => tap(c, () => open(c.dataset.planCard)));
  open(BETA.on ? BETA.plan : S.plan);
}

/* ── 내 사실 찍기 ──────────────────────────────────────────────────
   화면 HTML 에는 설계 때 넣은 예시 인물의 기록이 곳곳에 박혀 있다.
   원칙은 하나다 — 화면은 아무것도 기억하지 않는다. 내 상태(S.log · S.cmAt ·
   보관함)가 사실의 전부고, 이 층이 매번 그 사실을 화면에 찍는다.
   화면마다 지우러 다니면 반드시 하나를 빠뜨린다. */
const quota = () => {
  const cap = PLAN[S.plan].cm;
  return { cap, left: Math.max(0, cap - S.cmUsed) };
};
const ago = t => {
  if (!t) return '방금';
  const h = Math.floor((Date.now() - t) / 36e5);
  return h < 1 ? '방금' : h + '시간 전';
};

function applyMyFacts() {
  // 닉네임 — 가입해서 정한 이름이 있으면 예시 이름(골프러버) 자리를 그걸로
  if (S.nick) els().forEach(e => {
    e.childNodes.forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim() === '골프러버') n.textContent = S.nick;
    });
  });
  // 오늘 카드(기록 저장 뒤) — 시간·느낌·클럽·메모가 예시 인물의 것이다
  const done = root().querySelector('[data-today="done"]');
  if (done) {
    const put = (label, v) => {
      const key = Array.from(done.querySelectorAll('span'))
        .find(e => !e.childElementCount && e.textContent.trim() === label);
      if (!key) return;
      const cell = key.parentElement;
      if (v) { if (key.nextElementSibling) key.nextElementSibling.textContent = v; }
      else cell.remove();
    };
    put('시간', S.log.mins);
    put('느낌', S.log.feel);
    put('클럽', null);                      // 안 물어보는 항목이다
    const q = Array.from(done.querySelectorAll('span, div'))
      .find(e => !e.childElementCount && /^[“"].*[”"]$/.test(e.textContent.trim()));
    if (q) {
      if (S.log.memo && S.log.memo.trim()) q.textContent = '“' + S.log.memo.trim() + '”';
      else q.remove();
    }
    const dur = Array.from(done.querySelectorAll('span'))
      .find(e => !e.childElementCount && /^\d+:\d{2}$/.test(e.textContent.trim()));
    if (dur) dur.remove();                  // 길이는 재보지 않으면 모른다
  }

  // 한마디 대기 카드 — 「6시간 전 요청 · 보통 9시간쯤 걸려요」가 박혀 있다
  const wait = root().querySelector('[data-cm="wait"]');
  if (wait) {
    /* 부제 줄만 바꾼다. find 로 잡으면 제목까지 품은 부모가 먼저 걸려서
       카드 머리가 통째로 갈리고 글씨가 제목 크기로 커진다 — 실제로 그랬다.
       같은 글을 품은 것 중 맨 안쪽(문서 순서상 마지막)이 부제다. */
    const line = Array.from(wait.querySelectorAll('span'))
      .filter(e => /전 요청|시간쯤 걸려요/.test(e.textContent) && e.children.length)
      .pop();
    if (line) line.innerHTML = '<b style="font-weight:600;color:var(--ns-ink2);'
      + 'font-family:var(--font-num)">' + ago(S.cmAt) + '</b> 요청 · 보통 하루 안에 와요';
  }

  /* ── 받은 한마디 ────────────────────────────────────────────────
     서버에 있는 것만 진짜다. 예시로 박아둔 한마디가 한 줄이라도 섞이면
     어느 것이 프로가 정말 보낸 것인지 알 수 없게 된다. */
  const got = window.__COMMENTS || [];
  const unread = got.filter(c => !c.read);

  // 종 배지
  const bdot = root().querySelector('[data-bell-dot]');
  if (bdot) {
    bdot.textContent = unread.length;
    bdot.style.display = unread.length ? 'flex' : 'none';
  }

  /* 홈 도착 줄 — 화면에 박혀 있는 「오늘 도착 · 정기 피드백 No.06」띠를 고쳐
     쓰려 했지만, 새 계정은 홈 히어로가 통째로 갈리면서 그 띠도 같이 사라진다.
     남의 화면을 빌리지 말고 우리 띠를 세운다. */
  const heroEl = root().querySelector('[data-h-hero]');
  if (heroEl && heroEl.parentElement && unread.length
      && !root().querySelector('[data-cm-bar]')) {
    const bar = document.createElement('div');
    bar.setAttribute('data-cm-bar', '');
    bar.setAttribute('style', 'display:flex;align-items:center;gap:8px;margin-bottom:11px;'
      + 'padding:12px 14px;border-radius:13px;background:var(--ns-green);'
      + 'box-shadow:0 9px 22px -13px rgba(33,64,47,.8)');
    bar.innerHTML = '<span style="flex:none;width:7px;height:7px;border-radius:50%;'
      + 'background:#E8B85F"></span>'
      + '<span style="flex:1;min-width:0;' + P_FONT + 'font-size:12.5px;font-weight:700;'
      + 'color:#fff;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;'
      + 'white-space:nowrap">이도형 프로 한마디 도착'
      + (unread.length > 1 ? ' · ' + unread.length + '개' : '') + '</span>'
      + '<span style="flex:none;' + P_FONT + 'font-size:11px;font-weight:600;'
      + 'color:rgba(255,255,255,.7)">' + cmWhen(unread[0].at) + '</span>'
      + '<span style="flex:none;' + P_FONT + 'font-size:11.5px;font-weight:700;color:#fff">'
      + '보기 ›</span>';
    heroEl.parentElement.insertBefore(bar, heroEl);
    tap(bar, () => cmSheet());
  }

  // 연습기록 말풍선 — 예시 문구 자리에 진짜 한마디를 넣고, 눌러서 펼치게
  const bub = root().querySelector('[data-cm="arrived"]');
  if (bub && got.length) {
    const c = got[0];
    const inner = Array.from(bub.querySelectorAll('span')).filter(e => !e.childElementCount);
    const when = inner.find(e => /전$|방금/.test(e.textContent.trim()));
    if (when) when.textContent = cmWhen(c.at);
    const body = inner[inner.length - 1];
    if (body) {
      const one = c.body.replace(/\s+/g, ' ');
      body.textContent = one.length > 46 ? one.slice(0, 46) + '…' : one;
    }
    const hit = bub.firstElementChild || bub;
    hit.removeAttribute('data-tapped');
    tap(hit, () => cmSheet());
  }

  // 레슨기록 › 프로 한마디 목록 — 예시 세 줄을 받은 것으로 갈아 끼운다
  const cmRows = root().querySelectorAll('[data-cmrow]');
  if (cmRows.length && got.length) {
    const holder = cmRows[0].parentElement;
    holder.innerHTML = got.map(cmCard).join('');
    holder.querySelectorAll('[data-cm-open]').forEach(r =>
      tap(r, () => cmSheet(r.getAttribute('data-cm-open'))));
  }
  // 「6월에 받은 한마디 5개」 — 6월엔 앱이 없었다
  const older = root().querySelector('[data-cm-older]');
  if (older && older.parentElement) older.parentElement.remove();
  // 「2회 받음 · 3회 남음」
  const qbox = root().querySelector('[data-cm-quota]');
  if (qbox) {
    const line = Array.from(qbox.querySelectorAll('span'))
      .filter(e => !e.childElementCount && /회 받음/.test(e.textContent)).pop();
    if (line) line.textContent = got.length + '회 받음 · ' + quota().left + '회 남음';
  }

  // 남은 횟수 — 「4 / 6회 남음」 「5회 남음」 「n / n」 전부 상태에서 계산한다
  if (can('cm')) {
    const { cap, left } = quota();
    els().filter(e => !e.childElementCount && /\d+\s*\/\s*\d+회 남음/.test(e.textContent.trim()))
      .forEach(e => { e.textContent = left + ' / ' + cap + '회 남음'; });
    els().filter(e => !e.childElementCount && /^\d+회 남음$/.test(e.textContent.trim()))
      .forEach(e => { e.textContent = left + '회 남음'; });
    els().filter(e => e.children.length === 1 && e.firstChild && e.firstChild.nodeType === 3
        && /^\d+\s*$/.test(e.firstChild.textContent)
        && /^\/\s*\d+(회)?$/.test(e.firstElementChild.textContent.trim()))
      .forEach(e => {
        const unit = /회/.test(e.firstElementChild.textContent) ? '회' : '';
        e.firstChild.textContent = left + ' ';
        e.firstElementChild.textContent = '/ ' + cap + unit;
      });
    // 남은 칸 게이지 (청동 = 남음)
    root().querySelectorAll('[data-cm="wait"] span[style*="height:4px"]').forEach((seg, i, all) => {
      if (all.length !== cap) return;       // 칸 수가 다르면 손대지 않는다
      seg.style.background = i < left ? 'var(--ns-bronze)' : 'var(--ns-line)';
    });
  }
}

/* ── 가입 · 로그인 시트 ──────────────────────────────────────────────
   지금 익명 계정에 아이디·비번을 얹는다. 그동안 올린 것이 그대로 남고,
   다른 폰에서 로그인하면 같은 계정으로 들어온다.
   실명은 선택이다 — 베타 운영에 꼭 필요한 건 닉네임뿐이라 최소로 걷는다. */
function joinSheet(required) {
  const old = document.getElementById('join');
  if (old) old.remove();
  const signedUp = window.NS && NS.named();
  const box = document.createElement('div');
  box.id = 'join';
  box.innerHTML = `
  <div class="join-card">
    <div class="join-top"><span class="join-t">${signedUp ? '다른 계정으로 로그인' : '계정 만들기'}</span>
      ${required ? '' : '<button class="join-x" type="button" data-j-x>닫기</button>'}</div>
    ${required ? `<p class="join-p">먼저 계정을 만들어주세요.<br>
      프로가 <b>누구의 스윙인지</b> 알아야 한마디를 보낼 수 있어요.</p>`
    : signedUp ? '' : `<p class="join-p">지금까지 올린 스윙은 그대로 남아요.<br>
      아이디를 만들어두면 폰을 바꿔도 이어서 쓸 수 있어요.</p>`}
    <label class="join-l">아이디 <span>영문·숫자 4~20자</span></label>
    <input class="join-i" data-j-id autocomplete="username" placeholder="golflover">
    <label class="join-l">비밀번호 <span>6자 이상</span></label>
    <input class="join-i" data-j-pw type="password" autocomplete="new-password">
    <div data-j-joinonly>
      <label class="join-l">닉네임 <span>프로에게 보여요</span></label>
      <input class="join-i" data-j-nick placeholder="주말골퍼">
      <label class="join-l">이름 <span>선택 · 프로만 봅니다</span></label>
      <input class="join-i" data-j-real placeholder="적지 않아도 돼요">
      <p class="join-n">이름은 한마디 전달에만 쓰고, 베타가 끝나면 지웁니다.</p>
    </div>
    <button class="join-btn" type="button" data-j-go>${signedUp ? '로그인' : '만들기'}</button>
    <button class="join-alt" type="button" data-j-flip>${signedUp ? '' :
      '이미 아이디가 있어요 · 로그인'}</button>
  </div>`;
  let login = signedUp;
  const flip = () => {
    login = !login;
    box.querySelector('.join-t').textContent = login ? '로그인' : '계정 만들기';
    box.querySelector('[data-j-joinonly]').style.display = login ? 'none' : '';
    box.querySelector('[data-j-go]').textContent = login ? '로그인' : '만들기';
    box.querySelector('[data-j-flip]').textContent = login
      ? '아이디가 없어요 · 만들기' : '이미 아이디가 있어요 · 로그인';
  };
  box.addEventListener('click', ev => {
    // 필수 모드에선 바깥을 눌러도 안 닫힌다 — 여기서 끝내야 하는 관문이다
    if (ev.target === box || ev.target.closest('[data-j-x]')) {
      if (!required) box.remove();
      return;
    }
    if (ev.target.closest('[data-j-flip]')) return flip();
    if (!ev.target.closest('[data-j-go]')) return;
    const v = sel => (box.querySelector(sel) || {}).value || '';
    const id = v('[data-j-id]').trim(), pw = v('[data-j-pw]');
    const go = box.querySelector('[data-j-go]');
    go.textContent = '잠시만요…';
    const done = msg => { box.remove(); toast(msg); S.nick = NS.nick(); render(); };
    const fail = e => { go.textContent = login ? '로그인' : '만들기';
                        toast((e && e.message) || '안 됐어요 · 다시 해주세요'); };
    if (login) NS.signIn(id, pw)
      .then(() => Promise.all([window.__vaultSync(), loadComments()]))
      .then(() => done('로그인했어요')).catch(fail);
    else NS.signUp(id, pw, v('[data-j-nick]').trim(), v('[data-j-real]').trim())
      .then(() => done('계정을 만들었어요 · 폰을 바꿔도 이어서 쓸 수 있어요')).catch(fail);
  });
  document.body.appendChild(box);
}

/* 한마디 요청 표시를 오늘 스윙에 붙인다 */
function sendWant() {
  if (!window.NS) return;
  const today = new Date().setHours(0, 0, 0, 0);
  window.__SWINGS.filter(r => r.remoteId && r.at >= today)
    .forEach(r => NS.want(r.remoteId).catch(() => {}));
}

/* 오늘 기록의 메모를 서버의 오늘 스윙에 붙인다 — CRM 이 영상 옆에서 같이 본다 */
function sendNote() {
  if (!window.NS || !S.log.memo || !S.log.memo.trim()) return;
  const today = new Date().setHours(0, 0, 0, 0);
  window.__SWINGS.filter(r => r.remoteId && r.at >= today)
    .forEach(r => NS.note(r.remoteId, S.log.memo.trim()).catch(() => {}));
}

/* 아직 한 개도 안 올린 계정. 스윙 탭이 빈 갤러리로 갈리는 것과 같은 기준이다. */
const fresh = () => S.acct === 'new' && !S.mine.vids;

/* 계정 상태 두 벌 ─────────────────────────────────────────────────
   기본은 new — 링크를 받고 방금 들어온 사람이 보는 앱이다.
   남이 몇 달 쌓아둔 기록을 자기 것인 양 보여주면 그 순간부터 앱을 못 믿는다.
   used 는 몇 달 써서 프로가 봐주고 있는 사람. 등급 전환기(?dev=1)가 함께 갈아끼운다 —
   Elite 인데 기록이 하나도 없거나, 무료인데 한마디가 와 있으면 화면끼리 앞뒤가 안 맞는다.

   mine 은 이 계정에 실제로 쌓인 것. 전에는 '올렸다/안 올렸다' 두 칸뿐이라,
   신규가 첫 스윙 하나를 올린 순간 화면이 통째로 「이번 달 영상 12개」로 튀었다.
   한 개 올렸으면 한 개다. */
const ACCOUNT = {
  new:  { acct: 'new',  mine: { vids: 0, days: 0, streak: 0 },
          upDone: false, today: 'empty', cm: 'none', unread: 0, replies: 0,
          seenIntro: false, stripOff: false, up: null, upTry: 0, upFailed: false },
  used: { acct: 'used', mine: { vids: 12, days: 12, streak: 5 },
          upDone: true,  today: 'done',  cm: 'arrived', unread: 2, replies: 0,
          stripOff: false },
};
function loadAccount(kind) { Object.assign(S, JSON.parse(JSON.stringify(ACCOUNT[kind]))); }

/* 등급이 화면에 안 붙어 있던 곳들 — 마이 · 드로어 · 레슨기록 배지.
   여기가 틀리면 무료 회원이 자기가 Elite 인 줄 안다. */
function applyPlanMarks() {
  const P = PLAN[S.plan];
  root().querySelectorAll('[data-pl-name]').forEach(e => { e.textContent = P.name; });

  // 플랜 사다리 — 내 플랜만 흰 글씨, 앞뒤로 나머지가 회색으로 놓인다
  const at = LADDER.indexOf(S.plan);
  const before = root().querySelector('[data-pl-before]');
  const after = root().querySelector('[data-pl-after]');
  if (before) before.textContent = LADDER.slice(0, at).map(k => PLAN[k].name).join(' · ')
                                 + (at ? ' ·' : '');
  if (after) after.textContent = (at < 3 ? '· ' : '')
                               + LADDER.slice(at + 1).map(k => PLAN[k].name).join(' · ');

  const perks = root().querySelector('[data-pl-perks]');
  if (perks) {
    const chips = Array.from(perks.children);
    PERKS[S.plan].forEach((t, i) => {
      const c = chips[i];
      if (!c) return;
      const tn = Array.from(c.childNodes).find(x => x.nodeType === 3 && x.textContent.trim());
      if (tn) tn.textContent = t;
    });
  }

  // 못 받는 등급이면 '받은 레슨 6' 도 0 이어야 한다 (세그먼트 배지는 이미 0)
  const fbn = root().querySelector('[data-fb-count]');
  if (fbn && !can('fb')) fbn.textContent = '0';
  root().querySelectorAll('[data-pl-cms]').forEach(e => { if (!can('cm')) e.textContent = '0회'; });
  root().querySelectorAll('[data-pl-coupons]').forEach(e => {
    e.textContent = COUPONS[S.plan] + '장';
  });
  // 요금표에 박혀 있는 「월 39,000원」 같은 금액 — 아직 정한 값이 아니다
  if (BETA.on) els().filter(e => !e.childElementCount
      && /^(월\s*)?\d{1,3}(,\d{3})*\s*원$/.test(e.textContent.trim()))
    .forEach(e => { e.style.display = 'none'; });

  /* 프로와 비교로 들어가는 입구들 — 막는 건 goCompare · goSwCompare 가 이미 한다.
     여기서는 눌리기 전에 보이게만 한다. 헛손질을 두 번 하게 두지 않는다. */
  if (BETA.on) {
    laterEntry('프로와 비교', '나란히 보기', NO_PRO);                 // 홈 퀵메뉴
    laterEntry('프로와 비교하기', 'Next Swing 핵심 차별화', NO_PRO);   // 분석 허브(03)
    laterEntry('AI 스윙분석 + 설문', '설문 → 스윙 등록 → 맞춤 결과', NO_AI);
  }

  // 정기 피드백 설명 — 잠금 띠가 「베타가 끝난 뒤에」라고 해놓고
  // 들어오면 「ELITE 플랜」이라 적혀 있으면 앞뒤가 안 맞는다
  if (BETA.on && S.route === 'fx') {
    const kick = byText('ELITE 플랜 · 월 1회')[0];
    if (kick) kick.textContent = '베타 이후에 열립니다 · 월 1회';
  }

  // 쿠폰함 — 0장이라고 해놓고 열면 쿠폰이 들어 있으면 안 된다
  if (S.route === 'cp' && !COUPONS[S.plan]) {
    emptyBody('아직 쿠폰이 없어요',
              'Coaching 플랜부터 오프라인 레슨 할인권을 매달 드려요');
  }

  /* 못 받는 등급에서 지워야 하는 것과 남겨야 하는 것의 기준 ─────────────
       남긴다 — 프로가 만든 결과물(리포트 카드 · 한마디 말풍선).
                잠금 띠가 '이런 걸 받습니다' 로 안고 간다. 그게 설명이다.
       지운다 — 내 계정의 숫자와 일정(남은 횟수 · 도착 예정일 · '받은').
                이건 설명이 아니라 내 것인 척하는 거짓말이다. */
  if (!can('cm')) {
    // 「4 / 6회 남음」 · 「이번 달 4 / 6회 남음」 — 요청할 수 없는 사람에게 남은 횟수가 없다.
    // 화면마다 담긴 모양이 달라 글자로 찾는다. 게이지 막대와 한 줄에 있으면 줄째,
    // 혼자 있으면 그 줄만 덜어낸다.
    els().filter(e => !e.childElementCount && /회 남음$/.test(e.textContent.trim()))
      .forEach(e => {
        const row = e.parentElement;
        (row && row.querySelector('span[style*="height:4px"]') ? row : e).remove();
      });
  }
  if (!can('fb')) {
    // 「다음 리포트 · 8월호 · D-5 · 늦어지면 미리 알려드려요」 — 오지 않을 일정이다
    const next = cardUpTo('다음 리포트 · 8월호', '모였어요');
    if (next) next.remove();
    // 「받은 레슨」 — 받은 적이 없다
    const got = byText('받은 레슨')[0];
    if (got) got.textContent = '리포트 예시';
  }

  applyFresh();
}

/* 목록 화면의 본문을 빈 상태 한 장으로 바꾼다.
   리포트나 한마디는 '프로가 만든 결과물'이라 예시로 둘 수 있지만,
   알림과 쿠폰은 '나에게 있었던 일'이다. 남의 것을 그대로 두면 예시가 아니라 착각이 된다.
   특히 알림함에는 「8월 1일에 79,000원이 결제돼요」가 들어 있다 —
   결제가 없다고 입구에서 말해놓고 이게 보이면 그 말이 통째로 무너진다. */
function emptyBody(title, sub, act) {
  const body = Array.from(root().querySelectorAll('div')).find(e => {
    const st = e.getAttribute('style') || '';
    return /flex:\s*1/.test(st) && /overflow-y:\s*auto/.test(st);
  });
  if (!body) return miss('빈 상태로 바꿀 본문');
  body.innerHTML =
      '<div style="height:100%;display:flex;flex-direction:column;align-items:center;'
    + 'justify-content:center;gap:9px;padding:0 40px;text-align:center">'
    + '<span style="' + P_FONT + 'font-size:14px;font-weight:700;letter-spacing:-.02em;'
    + 'color:var(--ns-ink2)">' + title + '</span>'
    + '<span style="' + P_FONT + 'font-size:12px;font-weight:400;line-height:1.7;'
    + 'color:var(--ns-ink3)">' + sub + '</span>'
    + (act ? '<span data-empty-act style="margin-top:9px;padding:11px 16px;border-radius:11px;'
        + 'border:1px solid var(--ns-line);background:var(--ns-card);' + P_FONT
        + 'font-size:12.5px;font-weight:700;color:var(--ns-green)">' + act.label + '</span>' : '')
    + '</div>';
  if (act) tap(body.querySelector('[data-empty-act]'), act.go);
}

/* 글자 한 조각에서 출발해 그 카드 전체까지 올라간다.
   끝 문구까지 품는 첫 조상이 카드다 — 화면마다 감싸는 깊이가 달라
   'N번 올라가라'로는 어느 한쪽이 반드시 어긋난다. */
function cardUpTo(startText, endText) {
  let el = byText(startText)[0];
  while (el && el !== root() && !el.textContent.includes(endText)) el = el.parentElement;
  return el && el !== root() ? el : null;
}

/* 3개월째 내고 있는 사람이 결제일마다 묻는 건 하나다 — '내가 늘긴 했나'.
   지금까지 그 답은 리포트 안에만 있었다. 활동량(연습일 · 영상 수)은 답이 아니다.
   프로가 달마다 무엇을 짚었는지가 답이다. */
const JOURNEY = ['3월 슬라이스', '4월 뒤땅', '5월 하체 리드', '6월 왼팔 각'];
function growCard() {
  const box = root().querySelector('[data-grow]');
  const diff = root().querySelector('[data-mo-diff]');
  if (!box) return;
  // 오늘 깐 사람에겐 견줄 지난달이 없다
  const none = S.acct === 'new';
  box.style.display = none ? 'none' : 'flex';
  if (diff) diff.style.display = none ? 'none' : 'flex';
  if (none) return;

  const chips = box.querySelector('[data-grow-chips]');
  if (chips && !chips.childElementCount) {
    JOURNEY.forEach((t, i) => {
      if (i) chips.insertAdjacentHTML('beforeend',
        '<span style="font-size:10px;color:var(--ns-ink3)">›</span>');
      const on = i === JOURNEY.length - 1;
      chips.insertAdjacentHTML('beforeend',
        '<span style="font-size:10.5px;font-weight:' + (on ? '700' : '500') + ';'
        + 'color:' + (on ? 'var(--ns-green)' : 'var(--ns-ink3)') + ';'
        + 'background:' + (on ? 'var(--ns-soft)' : 'var(--ns-sand)') + ';'
        + 'border-radius:7px;padding:5px 8px">' + t + '</span>');
    });
  }
  // 정기 피드백을 받는 등급은 리포트 안 여정으로, 아닌 등급은 받은 한마디로 간다
  const fb = can('fb');
  setText('[data-grow-t]', fb ? '5개월째 함께 만들고 있어요'
                             : '받은 한마디에서 프로가 짚은 것들이에요');
  setText('[data-grow-go]', fb ? '여정 보기 ›' : '한마디 보기 ›');
  tap(root().querySelector('[data-grow-card]'), () => go(fb ? 'r2' : '2i'));
}

/* 요금표(17 · 18) — 고민자가 보는 화면이다. 세 가지를 등급 따라 움직인다.
     ① '현재 플랜' 배지는 진짜 내 플랜 카드에 (전에는 Elite 에 박혀 있었다)
     ② 초록 테두리 = 추천 = 내 다음 칸. 지금 뭘 살지가 화면에 있어야 한다
     ③ 카드를 누르면 그 플랜으로 결제 화면에 간다 — 고른 게 끝까지 따라간다 */
function planTable() {
  const cards = root().querySelectorAll('[data-plan-card]');
  if (!cards.length) return miss('요금표 플랜 카드');
  applyBenefits();
  const nx = NEXT(S.plan);

  /* 구독별 혜택(18)은 네 칸을 다 펼쳐두면 Elite 를 보려고 스크롤해야 한다.
     칸이 부족한 화면이라, 머리말 두 줄을 걷고 한 번에 한 칸만 펼친다. */
  const acc = S.route === '18';
  if (acc) {
    const head = root().querySelector('[data-plan-line]');
    if (head && head.parentElement) head.parentElement.remove();
  }

  const badge = root().querySelector('[data-plan-now]');
  if (badge) {
    // 두 화면의 카드 구조가 달라서, 자리를 좌표로 찾지 않고 '플랜 이름이 적힌 칸'을 찾는다
    const mine = root().querySelector('[data-plan-card="' + S.plan + '"]');
    const nm = PLAN[S.plan].name;
    const slot = mine && [...mine.querySelectorAll('span')]
      .find(e => e.textContent.trim() === nm && !e.querySelector('span'));
    // 이름 칸 안으로 옮기면 부모의 gap 이 안 먹는다 — 자기 여백을 갖고 들어간다
    if (slot && badge.parentElement !== slot) { badge.style.marginLeft = '7px'; slot.appendChild(badge); }
  }

  cards.forEach(c => {
    const k = c.dataset.planCard;
    // 베타에는 고를 것이 하나뿐이다 — 열려 있는 칸만 서 있고 나머지는 물러난다
    const on = BETA.on ? k === BETA.plan : k === nx;
    if (BETA.on) c.style.opacity = on ? '1' : '.5';
    if (k !== 'free' || (BETA.on && on)) {
      c.style.border = on ? '1.5px solid var(--ns-green)' : '1px solid var(--ns-line)';
      c.style.background = on ? '#F6FAF6' : 'var(--ns-card)';
    }
    if (acc) return;              // 누르면 펼치는 화면이다 — planAccordion 이 맡는다
    tap(c, () => {
      if (BETA.on) return k === BETA.plan
        ? toast('베타 기간에 열려 있는 모드예요')
        : toast('베타에서는 Coaching 모드만 열려 있어요');
      if (k === S.plan) return toast('지금 쓰고 계신 플랜이에요');
      if (k === 'free') return toast('무료는 결제 없이 지금 쓰고 계신 기능이에요');
      S.buy = k; go('22');
    });
  });

  if (acc) planAccordion();

  const line = root().querySelector('[data-plan-line]');
  if (line) line.textContent = BETA.on
    ? '베타 기간에는 Coaching 모드만 열어드리고 있어요.'
    : S.plan === 'free'
      ? '지금은 무료 플랜이에요. 프로가 봐주는 건 Basic부터예요.'
      : '지금은 ' + PLAN[S.plan].name + '을(를) 쓰고 있어요.';

  const cta = root().querySelector('[data-plan-cta]');
  if (cta) {
    if (BETA.on) {
      cta.textContent = 'Coaching 모드로 쓰고 계세요';
      tap(cta, () => toast('베타 기간에는 결제 없이 열어드려요'));
    } else {
      const up = nx !== S.plan;
      cta.textContent = up
        ? PLAN[nx].name + ' 시작하기 · ' + priceOf(nx)
        : 'Coaching으로 변경하기';
      tap(cta, () => { S.buy = up ? nx : 'coaching'; go('22'); });
    }
  }
}

/* 아직 한 개도 안 올린 사람에게 남의 기록을 보여주지 않는다.
   화면마다 흩어놓으면 또 어긋나므로 여기 한 곳에서만 처리한다.
   판정은 그릴 때마다 다시 한다 — 부팅 때 한 번만 보면 등급을 바꿔도 안 먹는다. */
/* 방금 가입한 사람의 홈 첫 화면.
   원래 자리에는 「정기 피드백 7월호 · 영상 12개를 돌려봤어요 · 골프러버님과 6번째」가
   박혀 있다. 잠금 띠를 얹어 '예시'라고 적어도, 저건 기능 소개가 아니라
   내 기록인 척하는 숫자다. 오늘 할 수 있는 일 하나로 갈아끼운다. */
const P_FONT = "font-family:'Pretendard',-apple-system,sans-serif;";
const heroHTML = (kick, title, body, cta) =>
    '<div style="flex:none;padding:2px 0 14px"><span style="' + P_FONT + 'font-size:12px;'
  + 'font-weight:700;letter-spacing:-.01em;color:var(--ns-green2)">' + kick + '</span></div>'
  + '<div style="flex:none;' + P_FONT + 'font-size:30px;font-weight:700;'
  + 'letter-spacing:-.035em;color:var(--ns-ink-g);line-height:1.28;padding-bottom:14px">'
  + title + '</div>'
  + '<div style="flex:none;' + P_FONT + 'font-size:13px;font-weight:400;color:#4A503F;'
  + 'line-height:1.75;padding-bottom:16px">' + body + '</div>'
  + '<div data-fresh-go style="flex:none;display:flex;align-items:center;justify-content:center;'
  + 'gap:8px;min-height:54px;border-radius:16px;background:var(--ns-green);color:#fff;'
  + 'box-shadow:0 10px 26px rgba(29,69,52,.18)">'
  + '<span style="' + P_FONT + 'font-size:15px;font-weight:700;letter-spacing:-.02em">'
  + cta + '</span><span style="font-size:15px">→</span></div>';

const FRESH_HERO = heroHTML('시작하기', '첫 스윙을<br>올려보세요',
  '영상 하나면 됩니다. 올린 스윙은 날짜별로 쌓이고, 나중에 예전 스윙과 나란히 놓고 볼 수 있어요.',
  '첫 스윙 올리기');
const MINE_HERO = v => heroHTML('내 기록', '스윙 ' + v + '개를<br>올렸어요',
  '올린 스윙은 스윙 탭에 날짜별로 쌓여요. 오늘 하나 더 올리면 어제 것과 나란히 놓고 볼 수 있어요.',
  '오늘 스윙 올리기');

function applyFresh() {
  if (S.acct !== 'new') return;
  const v = S.mine.vids;

  // 홈 히어로 — 남의 리포트 대신 오늘 할 수 있는 하나, 그리고 내가 실제로 쌓은 것.
  // data-lock 을 뗄 수 있는 건 이 층(등급 표시)이 잠금 층보다 먼저 돌기 때문이다.
  const hero = root().querySelector('[data-h-hero]');
  if (hero) {
    hero.removeAttribute('data-lock');
    hero.innerHTML = v ? MINE_HERO(v) : FRESH_HERO;
    tap(hero.querySelector('[data-fresh-go]'), () => go('2c'));
  }

  // 남은 횟수 — 새 계정은 아직 한 번도 안 썼으니 등급이 주는 만큼 그대로다.
  // 못 받는 등급이면 위(!can('cm'))에서 이미 줄째 지웠고, 여기는 받는 등급만 온다.
  if (can('cm')) {
    // 게이지 — 쓴 만큼만 찬다
    const gauge = root().querySelector('[data-h-quota] span[style*="width:33%"]');
    if (gauge) { const { cap } = quota(); gauge.style.width = Math.round(S.cmUsed / cap * 100) + '%'; }
  } else {
    // 못 받는 등급이면 홈의 횟수 카드 자체가 설 자리가 없다.
    // (잠금 띠는 이 카드 대신 밑의 한마디 예시 목록에 붙는다 — 거기가 제자리다)
    const quota = root().querySelector('[data-h-quota]');
    if (quota) quota.remove();
  }

  // 「최근 프로 한마디 — 이번 달 2회」 — 받은 적이 없으니 '최근'도 '2회'도 없다
  const cmHead = byText('최근 프로 한마디')[0];
  if (cmHead) {
    cmHead.textContent = '프로 한마디';
    const cnt = cmHead.nextElementSibling;
    if (cnt) cnt.remove();
  }

  /* 예시 한마디를 걷어낸다.
     8·9월에 진짜 한마디가 오기 시작하면, 예시가 섞여 있는 순간 어느 게 진짜인지
     알 수 없다. 프로 한마디가 뭔지는 설명 화면(cx)이 맡는다. */
  const tl = root().querySelectorAll('[data-tl-row]');
  if (tl.length) {
    const holder = tl[0].parentElement;
    const got = window.__COMMENTS;
    if (got.length) {
      holder.innerHTML = got.slice(0, 3).map((c, i) =>
        '<div data-cm-row="' + c.id + '" style="padding:12px 2px'
        + (i ? ';border-top:1px solid var(--ns-line)' : '') + '">'
        + '<span style="display:flex;align-items:baseline;gap:7px;padding-bottom:4px">'
        + '<span style="' + P_FONT + 'font-size:11px;font-weight:700;color:var(--ns-bronze)">'
        + cmWhen(c.at) + '</span>'
        + '<span style="' + P_FONT + 'font-size:11px;color:var(--ns-ink3)">이도형 프로 · '
        + c.view + '</span></span>'
        + '<span style="display:block;' + P_FONT + 'font-size:12.5px;line-height:1.7;'
        + 'color:var(--ns-ink2);white-space:pre-wrap">' + safe(c.body) + '</span>'
        + (c.photos || []).map(u => '<img src="' + u + '" style="width:100%;max-width:220px;'
            + 'border-radius:10px;margin-top:8px;display:block;border:1px solid var(--ns-line)">')
          .join('') + '</div>').join('');
      holder.querySelectorAll('[data-cm-row]').forEach(r =>
        tap(r, () => cmSheet(r.getAttribute('data-cm-row'))));
    } else {
      holder.setAttribute('style', (holder.getAttribute('style') || '')
        + ';padding:22px 16px;text-align:center');
      holder.innerHTML =
        '<div style="display:flex;flex-direction:column;gap:6px">'
        + '<span style="' + P_FONT + 'font-size:12.5px;font-weight:600;color:var(--ns-ink2)">'
        + '아직 받은 한마디가 없어요</span>'
        + '<span style="' + P_FONT + 'font-size:11.5px;line-height:1.6;color:var(--ns-ink3)">'
        + '스윙을 올리면 이도형 프로가 직접 남겨드려요</span></div>';
    }
  }

  // 레슨기록 · 정기 피드백 탭 — 베타엔 아직 없는 기능이라 예시 리포트를 걷어낸다
  if (S.route === '2f' && !can('fb')) {
    /* 못 받는 기능이라도 「어떻게 오는지」는 봐야 기다릴 마음이 생긴다.
       실제 리포트 한 장을 그대로 열어준다 — 예시라고 위에 적어두고. */
    emptyBody('정기 피드백은 베타 이후에 열립니다',
              '한 달치 스윙을 모아 프로가 리포트로 만들어드릴 거예요',
              { label: '어떤 리포트인지 미리 보기 ›', go: () => goResult('r1') });
  }
  if (S.route === '2i' && !window.__COMMENTS.length) {
    emptyBody('아직 받은 한마디가 없어요', '스윙을 올리면 이도형 프로가 직접 남겨드려요');
  }

  // 한마디 상세의 「지난 한마디 · 전체 12개」 — 지난 것이 없다.
  // 예시 한마디를 눌러 들어올 수 있는 화면이라 여기까지 따라와야 한다.
  const past = root().querySelector('[data-pc-past]');
  if (past) {
    let sec = past;
    while (sec && sec !== root() && !sec.textContent.includes('지난 한마디')) sec = sec.parentElement;
    if (sec && sec !== root()) sec.remove();
  }

  // 쿠폰함의 「다 쓴 쿠폰 · 7월 12일 사용」 — 쓴 적도 만료된 적도 없다.
  // 이번 달 한 장은 남긴다 — 가입한 달치는 실제로 들어오는 게 맞다.
  const usedCp = byText('다 쓴 쿠폰')[0];
  if (usedCp) {
    let sec = usedCp;
    while (sec && sec !== root() && !sec.textContent.includes('사용')) sec = sec.parentElement;
    if (sec && sec !== root()) sec.remove();
  }

  /* 리포트를 예시로 열어줄 때는 위에 그렇게 적는다.
     안 적으면 내 리포트가 온 줄 안다 — 베타엔 오지 않는 것이다. */
  if (/^r[1-8]$/.test(S.route) && !can('fb') && !root().querySelector('[data-ex-bar]')) {
    const top = root().firstElementChild;
    const bar = document.createElement('div');
    bar.setAttribute('data-ex-bar', '');
    bar.setAttribute('style', 'flex:none;display:flex;align-items:center;gap:8px;'
      + 'padding:9px 16px;background:var(--ns-bronze);color:#fff;' + P_FONT
      + 'font-size:11.5px;font-weight:700;letter-spacing:-.01em');
    bar.textContent = '예시 리포트 · 베타 이후에 이렇게 받게 됩니다';
    /* 상태바 바로 아래에 넣는다. 맨 위에 넣으면 「베타」 표식과 겹친다 —
       표식은 상태바 가운데에 떠 있다. */
    const status = Array.from(root().children).find(e => /9:41/.test(e.textContent));
    /* 결과지의 상태바만 31px 로 낮아서, 그 아래에 넣어도 표식(11~32px)에 1px 닿는다.
       다른 화면과 같은 42px 로 맞춘다 — 겹침도 없어지고 높이도 통일된다. */
    if (status) status.style.minHeight = '42px';
    const anchor = status || top;
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(bar, anchor.nextSibling);
  }

  // 알림함 — 방금 가입한 사람 앞으로 온 알림이 있을 수 없다
  if (S.route === 'nt') {
    emptyBody('아직 온 알림이 없어요', '프로 한마디나 분석이 끝나면 여기로 알려드릴게요');
    const readall = root().querySelector('[data-nt-readall]');
    if (readall) readall.style.display = 'none';
  }

  /* 화면 곳곳에 2026년 7월 22일이 글자로 박혀 있다. 8·9월에 쓸 앱이다 — 진짜 오늘로 바꾼다. */
  const day = TODAY.getDate(), mon = TODAY.getMonth() + 1, dw = DOW[TODAY.getDay()];
  els().filter(e => !e.childElementCount).forEach(e => {
    const t = e.textContent;
    if (!/7월 2[02]일/.test(t)) return;
    e.textContent = t
      .replace(/7월 22일 \(수\)/g, mon + '월 ' + day + '일 (' + dw + ')')
      .replace(/7월 22일 수요일/g, mon + '월 ' + day + '일 ' + dw + '요일')
      .replace(/7월 22일/g, mon + '월 ' + day + '일')
      .replace(/7월 20일/g, mon + '월 ' + day + '일');
  });

  // 연습기록 머리의 「7월 · 12일」 — 이 계정이 실제로 연습한 날수
  // (이 층은 화면마다 도니까, 없는 화면에서 miss 를 쌓지 않게 있을 때만 손댄다)
  const prm = root().querySelector('[data-pr-month]');
  if (prm) prm.textContent = (TODAY.getMonth() + 1) + '월 · ' + S.mine.days + '일';

  // 홈 — 12일 연습 · 12개 영상 · 5일 연속
  const stats = root().querySelector('[data-h-stats]');
  if (stats) stats.innerHTML = '<span style="font-family:Pretendard,-apple-system,sans-serif;'
    + 'font-size:12px;font-weight:600;color:var(--ns-sub-g)">'
    + (v ? '연습 ' + S.mine.days + '일 · 영상 ' + v + '개'
         : '기록은 첫 스윙을 올린 날부터 쌓입니다') + '</span>';

  // 오늘 기록하기 — '최근 기록 · 7월 20일 · 🔥 3일 연속'
  root().querySelectorAll('[data-fresh-hide]').forEach(e => { e.style.display = 'none'; });

  // 마이 — 이번 달 한눈에 보기
  const z = (sel, t) => root().querySelectorAll(sel).forEach(e => { e.textContent = t; });
  z('[data-pl-days-m]', S.mine.days + '일');
  z('[data-pl-vids]', v + '개');
  z('[data-pl-cms]', '0회');

  // 이번 달 통계 4칸 (연습일 · 영상 · 한마디 · 최장 연속)
  const FOUR = [S.mine.days, v, 0, S.mine.streak];
  const ms = root().querySelector('[data-month-stats]');
  if (ms) Array.from(ms.children).forEach((col, i) => {
    const num = col.firstElementChild && col.firstElementChild.firstChild;
    if (num && num.nodeType === 3) num.textContent = String(FOUR[i] != null ? FOUR[i] : 0);
  });
  z('[data-month-vids]', v + '개');
  z('[data-pl-days]', '오늘 시작');   // '넥스트 스윙 500일째' — 방금 깐 사람이다
  z('[data-pl-join]', '오늘 가입했어요');

  // 레슨기록 — '받은 레슨 0' 인데 밑에 목록이 4개면 앞뒤가 안 맞는다.
  // 배지를 아예 숨긴다 (0 은 모순, 6 은 거짓말)
  const fbn = root().querySelector('[data-fb-count]');
  if (fbn) fbn.style.display = 'none';
}
let toastTimer = null;

/* ── DOM 헬퍼 ───────────────────────────────────────────────────── */
const root = () => stage.firstElementChild;
const els = () => Array.from(root().querySelectorAll('*'));

/* 같은 글자를 담는 방식이 핸드오프마다 다르다.
     ① <span>스윙기록</span>          — 글자만 든 요소
     ② 스윙기록<span>12</span>        — 글자가 맨 텍스트 노드, 옆에 배지·아이콘
   ②를 ①이 없을 때만 찾으면, 화면 어딘가에 같은 글자의 제목이 있는 순간
   진짜 버튼(탭 알약)이 통째로 죽는다. 그래서 둘을 합쳐서 돌려준다. */
function byText(t) {
  const exact = els().filter(e => e.textContent.trim() === t
    && !Array.from(e.children).some(c => c.textContent.trim() === t));
  const bare = els().filter(e => !exact.includes(e) && Array.from(e.childNodes)
    .some(n => n.nodeType === 3 && n.textContent.trim() === t));
  return exact.concat(bare);
}
function containing(t) {
  const m = els().filter(e => e.textContent.includes(t));
  return m.length ? m[m.length - 1] : null;
}
function cardOf(t, up) {
  let el = containing(t);
  for (let i = 0; el && i < (up || 0); i++) el = el.parentElement;
  return el;
}
const hasSurface = el => {
  const st = el.getAttribute('style') || '';
  return /background:\s*(?!transparent|none)/.test(st) || /border:\s*[\d.]/.test(st);
};
/* 텍스트에서 출발해 "면을 가진 요소"까지 올라간다.
   부모가 다른 텍스트까지 품으면 멈춘다 — 형제 버튼을 함께 잡는 사고를 막는다. */
function btnOf(t) {
  const e = byText(t)[0];
  if (!e) return null;
  let el = e;
  for (let i = 0; i < 4; i++) {
    if (hasSurface(el)) break;
    const p = el.parentElement;
    if (!p || p === root()) break;
    if (p.textContent.trim() !== el.textContent.trim()) break;
    el = p;
  }
  return el;
}
/* 리스트 행: 텍스트 span 의 부모가 행 컨테이너 (부가 텍스트가 있어도 행 전체를 누를 수 있게) */
const rowOf = t => { const e = byText(t)[0]; return e ? e.parentElement : null; };
function findCard(e, max) {
  let el = e;
  for (let i = 0; i < (max || 5); i++) {
    if (hasSurface(el)) return el;
    if (!el.parentElement || el.parentElement === root()) break;
    el = el.parentElement;
  }
  return e;
}
function tap(el, fn) {
  if (!el || el.dataset.tapped) return;
  el.dataset.tapped = '1';
  el.style.cursor = 'pointer';
  el.addEventListener('click', ev => { ev.stopPropagation(); fn(el); });
}

/* ── 터치 타겟 넓히기 ────────────────────────────────────────────────
   세로 44px 이 안 되는 것을 키우되, 이웃의 클릭을 뺏으면 안 된다.
   달력처럼 촘촘한 격자에서 무작정 넓히면 21일이 22일을 가로챈다.
   그래서 배선이 다 끝난 뒤 한 번에 돌면서, 위아래 이웃까지의 여유 안에서만 넓힌다.

   넓히는 방법은 안전한 순서로 세 가지 —
     ① 여유가 충분하면 진짜 패딩 (레이아웃이 조금 밀리지만 제일 확실)
     ② height 가 박혀 있으면(box-sizing:border-box) 최소 크기로
     ③ 그래도 모자라면 ::after 로 누를 면적만 (레이아웃 변화 0) */
function applyHits() {
  const all = Array.from(root().querySelectorAll('[data-tapped]'))
    .map(e => ({ e, r: e.getBoundingClientRect() }))
    .filter(o => o.r.width > 0.5 && o.r.height > 0.5);

  all.forEach(({ e, r }) => {
    if (r.height >= 44) return;
    // 가로가 겹치는 다른 배선 요소까지의 세로 여유
    let up = 1e4, dn = 1e4;
    all.forEach(({ e: x, r: xr }) => {
      if (x === e || e.contains(x) || x.contains(e)) return;
      if (xr.right <= r.left + 1 || xr.left >= r.right - 1) return;
      if (xr.bottom <= r.top) up = Math.min(up, r.top - xr.bottom);
      else if (xr.top >= r.bottom) dn = Math.min(dn, xr.top - r.bottom);
    });
    const need = (44 - r.height) / 2;
    // 서로 마주 보고 넓힐 수 있으니 여유의 절반까지만 쓴다
    const grow = Math.max(0, Math.min(need, up / 2, dn / 2));
    if (grow < 1) return;

    const cs = getComputedStyle(e);
    if (grow >= need && cs.display !== 'inline' && !/^\d/.test(cs.height) === false) {
      // ① 진짜 키우기 — 여유가 충분할 때만
      e.style.paddingTop = (parseFloat(cs.paddingTop) + grow) + 'px';
      e.style.paddingBottom = (parseFloat(cs.paddingBottom) + grow) + 'px';
    }
    if (e.getBoundingClientRect().height < 44 && grow >= need) {
      // ② height 가 박혀 패딩이 안 먹는 아이콘 버튼
      const pr = e.parentElement && e.parentElement.getBoundingClientRect();
      if (pr && pr.height >= 44) {
        e.style.minHeight = '44px';
        if (r.width < 44) e.style.minWidth = '44px';
        if (cs.display === 'inline') e.style.display = 'inline-flex';
        if (!/flex|grid/.test(cs.display)) e.style.alignItems = 'center';
        e.style.justifyContent = e.style.justifyContent || cs.justifyContent || 'center';
      }
    }
    const now = e.getBoundingClientRect();
    if (now.height < 44) {
      // ③ 남은 만큼만 ::after 로 — 이웃 여유를 넘지 않는 높이
      const h = Math.min(44, now.height + grow * 2);
      if (h - now.height < 2) return;
      if (getComputedStyle(e).position === 'static') e.style.position = 'relative';
      if (!e.closest('[data-lockwrap]')) e.style.zIndex = '1';
      e.style.setProperty('--hit-h', h + 'px');
      e.dataset.hit = '1';
    }
  });

  /* 가로만 좁은 것 — 뒤로가기 화살표가 대표적이다.
     세로는 44px 을 채우고 있어서 위 검사에 안 걸렸고, 폭이 20px 인 채로 남아 있었다.
     장갑 낀 엄지로는 못 누른다. 좌우 이웃까지의 여유 안에서만 넓힌다. */
  all.forEach(({ e, r }) => {
    if (r.width >= 44) return;
    let lt = 1e4, rt = 1e4;
    all.forEach(({ e: x, r: xr }) => {
      if (x === e || e.contains(x) || x.contains(e)) return;
      if (xr.bottom <= r.top + 1 || xr.top >= r.bottom - 1) return;   // 같은 줄만
      if (xr.right <= r.left) lt = Math.min(lt, r.left - xr.right);
      else if (xr.left >= r.right) rt = Math.min(rt, xr.left - r.right);
    });
    const need = (44 - r.width) / 2;
    const grow = Math.max(0, Math.min(need, lt / 2, rt / 2));
    if (grow < 1) return;
    const w = Math.min(44, r.width + grow * 2);
    if (w - r.width < 2) return;
    if (getComputedStyle(e).position === 'static') e.style.position = 'relative';
    if (!e.closest('[data-lockwrap]')) e.style.zIndex = '1';
    e.style.setProperty('--hit-w', w + 'px');
    if (!e.dataset.hit) e.style.setProperty('--hit-h', Math.round(r.height) + 'px');
    e.dataset.hit = '1';
    e.dataset.hitW = '1';
  });
}
/* 디자인 원본이 cursor:pointer 로 표시해 둔 "진짜 누를 영역"까지 올라간다.
   글자 span 만 배선하면 탭 알약·달력칸의 여백을 눌렀을 때 아무 일도 안 일어난다. */
function hit(el) {
  let out = el, p = el;
  const own = el.textContent.replace(/\s+/g, '');
  for (let i = 0; i < 3; i++) {
    p = p.parentElement;
    if (!p || p === root()) break;
    // 부모가 개수 배지·화살표 정도만 더 품으면 그게 알약이고, 그 이상이면 카드다.
    // (카드까지 올라가면 "전체보기" 같은 링크가 카드 전체 동작에 먹힌다)
    if (p.textContent.replace(/\s+/g, '').replace(own, '').length > 4) break;
    if (/cursor:\s*pointer/.test(p.getAttribute('style') || '')) out = p;
  }
  return out;
}
const onText = (t, fn) => { const l = byText(t); l.length ? l.forEach(e => tap(hit(e), fn)) : miss('onText ' + t); };
const onCard = (t, up, fn) => { const e = cardOf(t, up); e ? tap(e, fn) : miss('onCard ' + t); };
window.__MISS = [];
let quiet = false;                       // 상태 변형 화면처럼 일부 요소가 없는 게 정상인 구간
const miss = t => { if (!quiet) window.__MISS.push(S.route + ' : ' + t); };
const onBtn = (t, fn) => { const e = btnOf(t); e ? tap(e, fn) : miss('onBtn ' + t); };
const onRow = (t, fn) => { const e = rowOf(t); e ? tap(e, fn) : miss('onRow ' + t); };
/* 라벨에서 출발해 그 라벨을 품은 카드 전체를 배선한다 (층수를 세지 않는다).
   못 찾으면 조용히 넘어가지 않고 __MISS 에 남긴다 — 이게 없으면 죽은 버튼이 숨는다. */
const onCardOf = (t, fn) => { const e = byText(t)[0]; e ? tap(findCard(e), fn) : miss('onCardOf ' + t); };
/* SVG path 는 핸드오프마다 명령 문자가 달라진다 (M8 1 1 8l7 7 / M8 1L1 8l7 7).
   좌표 숫자만 뽑아 비교하면 같은 아이콘을 형식과 무관하게 잡을 수 있다. */
const pathKey = d => ((d || '').match(/-?[\d.]+/g) || []).join(',');
function onPath(d, fn) {
  const want = pathKey(d);
  let hit = 0;
  root().querySelectorAll('svg path').forEach(p => {
    // 화면 스스로 배선할 아이콘은 공통 배선이 먼저 채가면 안 된다.
    // (홈 도착 띠의 X 는 뒤로가기가 아니라 '이 띠만 닫기'다)
    if (p.closest('[data-own]')) return;
    if (pathKey(p.getAttribute('d')) === want) {
      tap(p.closest('span') || p.closest('div') || p.closest('svg'), fn);
      hit++;
    }
  });
  return hit;
}
/* 연습기록 카드 — 여러 상태를 한 템플릿에 다 심어두고 하나만 보여준다
   (practice_screens.py 의 variants() 가 data-{attr}="{key}" 로 표시해 둔 것과 짝) */
function showVariant(attr, key) {
  root().querySelectorAll('[data-' + attr + ']').forEach(el => {
    el.style.display = el.getAttribute('data-' + attr) === key ? 'block' : 'none';
  });
}

/* 액션 슬롯이 없으면 '되돌리기'를 붙일 자리가 없다.
   지금까지는 글자만 받는 구조라 Undo 가 원천적으로 불가능했다. */
function toast(msg, act) {
  const box = document.getElementById('toastbox');
  box.textContent = msg;
  box.style.pointerEvents = act ? 'auto' : 'none';
  if (act) {
    const b = document.createElement('button');
    b.className = 'toast-act';
    b.textContent = act.label;
    b.onclick = () => { box.classList.remove('show'); clearTimeout(toastTimer); act.fn(); };
    box.appendChild(b);
  }
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), act ? 4200 : 1900);
}

/* 되돌릴 수 없는 일 앞에 한 번 세운다.
   한정 자원(월 6회 프로 한마디)을 소모·환급하는 일은 확인 없이 실행하면 안 된다. */
function confirmSheet(title, desc, okLabel, onOk) {
  const frame = root();
  if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
  frame.querySelectorAll('[data-sheet]').forEach(x => x.remove());
  const box = document.createElement('div');
  box.setAttribute('data-sheet', '');
  box.setAttribute('style', 'position:absolute;inset:0;z-index:90;display:flex;'
    + 'align-items:flex-end;background:rgba(20,26,22,.45)');
  box.innerHTML = '<div data-sheet-card style="width:100%;background:#FFFDF9;'
    + 'border-radius:20px 20px 0 0;padding:22px 20px 18px;display:flex;flex-direction:column">'
    + '<div style="font-size:16px;font-weight:700;color:#1D2420;letter-spacing:-.025em">'
    + title + '</div>'
    + '<div style="margin-top:8px;font-size:12.5px;font-weight:400;color:#4A4638;'
    + 'line-height:1.7">' + desc + '</div>'
    + '<div data-sheet-ok style="margin-top:18px;background:#21402F;color:#fff;'
    + 'border-radius:13px;padding:15px;text-align:center;font-size:14.5px;font-weight:600;'
    + 'letter-spacing:-.02em">' + okLabel + '</div>'
    + '<div data-sheet-no style="margin-top:8px;padding:14px;text-align:center;'
    + 'font-size:13px;font-weight:500;color:#686253">그대로 둘게요</div></div>';
  frame.appendChild(box);
  const close = () => box.remove();
  box.querySelector('[data-sheet-ok]').addEventListener('click', e => {
    e.stopPropagation(); close(); onOk();
  });
  box.querySelector('[data-sheet-no]').addEventListener('click', e => { e.stopPropagation(); close(); });
  box.addEventListener('click', e => { if (e.target === box) close(); });   // 배경 탭 = 닫기 (표준)
}

/* ── 선택 상태 표현 ─────────────────────────────────────────────── */
const ON = 'background:#21402F;color:#fff;border-color:#21402F';
const ON_SOFT = 'background:#E6EDE7;border-color:#21402F;color:#21402F';

/* 단일 선택 그룹 (칩·세그먼트) */
function selectGroup(labels, css, onPick) {
  const items = labels.map(t => btnOf(t));
  labels.forEach((t, i) => { if (!items[i]) miss('selectGroup ' + t); });
  let base = items.map(e => (e ? e.getAttribute('style') || '' : ''));
  // 디자인 원본에 박혀 있는 '예시 선택' 상태를 푼다.
  // 선택 상태는 배경·그림자가 얹혀 더 길기 마련이라, 가장 짧은 스타일을 미선택 기본형으로 본다.
  const plain = base.filter(Boolean).sort((a, b) => a.length - b.length)[0];
  if (plain !== undefined && base.some(b => b !== plain)) {
    base = base.map(b => (b ? plain : b));
    items.forEach(e => { if (e) e.setAttribute('style', plain); });
  }
  items.forEach((e, i) => tap(e, () => {
    items.forEach((o, j) => { if (o) o.setAttribute('style', base[j]); });
    e.setAttribute('style', base[i] + ';' + css);
    if (onPick) onPick(labels[i], i);
  }));
}
/* 나란히 놓인 카드 묶음 — 격자·리스트.
   onCard 처럼 층수를 세서 올라가면 묶음(격자)을 통째로 잡아버려서
   첫 칸만 살고 나머지가 전부 죽는다. (마이 퀵메뉴가 정확히 그랬다)
   그래서 '형제 라벨을 함께 품기 직전'까지만 올라가고,
   그 사이에서 면(배경·테두리)을 가진 가장 바깥 요소를 칸으로 삼는다. */
function cardFor(label, siblings) {
  const e = byText(label)[0];
  if (!e) return null;
  let best = hasSurface(e) ? e : null, el = e, widest = e;
  for (let i = 0; i < 5; i++) {
    const p = el.parentElement;
    if (!p || p === root()) break;
    if (siblings.some(o => o !== label && p.textContent.includes(o))) break;
    el = p;
    widest = el;                          // 형제를 안 삼키는 가장 바깥
    if (hasSurface(el)) best = el;
  }
  // 면이 없는 칸(마이 '12일 / 연습일' 같은 통계 셀)도 칸 전체가 눌려야 한다.
  // 라벨 글자만 배선하면 큰 숫자를 눌렀을 때 바깥 카드로 이벤트가 새 나간다.
  return best || widest;
}
function onGroup(map) {
  const labels = Object.keys(map);
  labels.forEach(t => {
    const c = cardFor(t, labels);
    c ? tap(c, () => map[t]()) : miss('onGroup ' + t);
  });
}

/* 상단 세그먼트 탭 (정기 피드백 | 프로 한마디).
   "두 라벨을 품은 2칸짜리"만으로는 부족하다 — 본문 카드가 같은 두 낱말을 함께
   담고 있으면 그쪽이 잡힌다. 두 칸이 라벨을 하나씩 나눠 가진 것만 세그먼트다. */
function segTab(a, bLab, destOf) {
  const two = els().filter(e => e.children.length === 2
    && e.textContent.includes(a) && e.textContent.includes(bLab));
  const split = ([x, y]) => x.textContent.includes(a) && !x.textContent.includes(bLab)
                         && y.textContent.includes(bLab) && !y.textContent.includes(a);
  const bar = two.filter(e => split(Array.from(e.children))).pop() || two.pop();
  if (!bar) return miss('segTab ' + a + '/' + bLab);
  Array.from(bar.children).forEach(pill => {
    const lab = pill.textContent.includes(a) ? a : bLab;
    tap(pill, () => { const d = destOf[lab]; d ? go(d) : toast('이미 ' + lab + ' 탭이에요'); });
  });
}

/* 다중 토글 칩 */
function toggleChips(labels, css) {
  labels.forEach(t => {
    const e = byText(t)[0];
    if (!e) { miss('toggleChips ' + t); return; }
    const card = findCard(e, 3);
    const base = card.getAttribute('style') || '';
    tap(card, () => {
      const on = card.dataset.on === '1';
      card.dataset.on = on ? '' : '1';
      card.setAttribute('style', on ? base : base + ';' + css);
    });
  });
}

/* ── 라우팅 ─────────────────────────────────────────────────────── */
/* ── 스크롤 자리 기억 ────────────────────────────────────────────────
   연습기록에서 달력을 한참 내려 며칠을 눌러 들어갔다 나오면, 다시 맨 위였다.
   보던 자리를 손으로 찾아 내려가야 한다 — 종이라면 손가락을 끼워뒀을 자리다.

   앞으로 갈 때는 맨 위에서 시작하고(새 화면이니까), 뒤로 올 때만 되돌린다.
   탭을 눌러 다시 들어오는 것도 새로 들어오는 것이라 맨 위가 맞다. */
const SCROLL = {};
const scrollBody = () => {
  const r = root();
  return r && Array.from(r.querySelectorAll('div'))
    .find(e => /overflow-y:\s*auto/.test(e.getAttribute('style') || ''));
};
function keepScroll() { const b = scrollBody(); if (b) SCROLL[S.route] = b.scrollTop; }
function restoreScroll() {
  const y = SCROLL[S.route];
  if (!y) return;
  const b = scrollBody();
  if (b) b.scrollTop = y;
}

function go(id) { keepScroll(); S.hist.push(S.route); S.route = id; render(); }
/* 결과지는 로딩 화면을 거쳐 들어간다 */
function goResult(id) { S.viaLoading = id; go('r5'); }
function jump(id) { keepScroll(); S.hist = []; S.route = id; render(); }
/* 프로와 비교 진입 — 첫 진입 안내 팝업(13)은 딱 한 번만 뜬다.
   두 번째부터는 팝업 없는 허브(12)로 바로 들어간다.
   15번의 "프로와 똑같이 해야 하나요?" 는 사용자가 일부러 여는 FAQ라 이 규칙과 무관하다. */
function goCompare() {
  if (BETA.on) return toast(NO_PRO);
  go(S.seenIntro ? '12' : '13');
}
/* 안내 팝업(13)은 지나가는 관문이지 목적지가 아니다.
   여기서 go('12') 로 넘기면 히스토리에 13 이 남아, 나중에 뒤로 나갈 때
   팝업이 길목에서 다시 튀어나온다. 그래서 밀어넣지 않고 갈아끼운다. */
function replaceWith(id) { S.route = id; render(); }
function back() {
  keepScroll();
  S.route = S.hist.length ? S.hist.pop() : '2a';
  render();
  restoreScroll();   // 뒤로 나올 때만 — 떠날 때 보던 자리 그대로
}

/* 알림 전용 작은 헬퍼 */
function onSel(sel, fn) {
  const e = root().querySelector(sel);
  e ? tap(e, fn) : miss('요소 ' + sel);
}
function backArrow(sel) { const e = root().querySelector(sel); e ? tap(e, back) : miss('backArrow ' + sel); }
function setText(sel, t, html) {
  const es = root().querySelectorAll(sel);
  if (!es.length) return miss('글자 ' + sel);
  es.forEach(e => { html ? (e.innerHTML = t) : (e.textContent = t); });
}
function markRead(row) {                       // 왼쪽 점을 지우고 제목 굵기를 낮춘다
  const dot = row.querySelector('span[style*="border-radius:50%"][style*="position:absolute"]');
  if (dot) dot.remove();
  const title = row.querySelector('span[style*="font-weight:600"]');
  if (title) title.style.fontWeight = '500';
  if (S.unread > 0) S.unread--;
}

/* 스윙분석 엔진은 한 번만 붙이고, 화면을 떠날 땐 무대에서 빼두기만 한다.
   매번 다시 붙이면 불러온 영상과 그어놓은 선이 날아간다. */
let swHost = null;
/* 엔진 자체의 단독/비교 토글을 눌러준다 — 엔진 코드는 건드리지 않고 클릭만 시킨다.
   첫 진입에선 React 가 아직 그리는 중이라 토글이 없다. 나타날 때까지 몇 프레임 기다린다. */
function swSetCompare(tries) {
  const btns = swHost ? swHost.querySelectorAll('.sw-mode-toggle button') : [];
  if (!btns[1]) {
    if ((tries || 0) < 30) requestAnimationFrame(() => swSetCompare((tries || 0) + 1));
    return;
  }
  if (!btns[1].classList.contains('on')) btns[1].click();
}
function goSwCompare() {
  if (BETA.on) return toast(NO_PRO);
  S.swCompare = true; go('sw');
}
/* 정기 피드백 요청 — Elite 만 갈 수 있다. 나머지는 구독 안내로 보낸다. */
function feedbackCTA() { can('fb') ? go('01') : go('fx'); }   // 못 받는 등급엔 가격표보다 설명이 먼저다

function swMount(box) {
  if (!swHost) {
    swHost = document.createElement('div');
    swHost.className = 'ns-swhost';
    box.appendChild(swHost);
    window.__mountSwing(swHost);          // 붙인 뒤에 마운트해야 엔진이 크기를 제대로 잰다
  } else box.appendChild(swHost);
}

function render() {
  // 못 받는 등급에는 도착 팝업이 뜰 일이 없다. 등급을 바꿔 이 화면에 남아 있으면 홈으로.
  if (S.route === 'ar' && !can('fb')) S.route = '2a';
  // 오늘 카드는 배선(showVariant)이 먼저 읽으므로 그리기 전에 정해야 한다
  if (fresh()) S.today = 'empty';   // 오늘 카드의 빈 상태 이름은 empty 다
  /* 안 읽은 한마디 수는 세어 두는 값이 아니라 서버에서 나오는 값이다.
     홈의 도착 줄은 배선 단계에서 이 수를 보고 지울지 말지 정하므로,
     「내 사실」층까지 기다리면 이미 지워진 뒤다. */
  if ((window.__COMMENTS || []).length) {
    S.unread = window.__COMMENTS.filter(c => !c.read).length;
    if (S.unread) S.stripOff = false;
  }
  const tpl = document.querySelector('template[data-scr="' + S.route + '"]');
  if (swHost && swHost.parentElement) swHost.remove();   // 지우지 말고 떼어만 둔다
  stage.innerHTML = '';
  stage.appendChild(tpl.content.cloneNode(true));
  /* 한 층이 터져도 다음 층은 돈다.
     전에는 화면 하나의 배선이 예외를 던지면 render() 가 거기서 죽어
     applyPlanMarks · applyLock 이 아예 안 돌았다. 그러면 무료 회원이
     잠금 없는 유료 화면을 보게 된다 — 배선 버그가 곧 등급 구멍이었다.
     특히 applyLock 은 무슨 일이 있어도 돌아야 한다. */
  const layer = (name, fn) => {
    try { fn(); }
    catch (e) { window.__MISS.push(S.route + ' : ' + name + '이(가) 터짐 — ' + e.message); }
  };
  layer('공통 배선', wireCommon);
  layer('화면 배선', WIRE[S.route] || (() => {}));
  layer('등급 표시', applyPlanMarks);
  layer('내 사실', applyMyFacts);
  layer('잠금', applyLock);
  layer('터치 영역', applyHits);
  layer('범례', renderLegend);
}

/* ── 공통 배선: 뒤로가기 · 햄버거 · 하단 5탭 ─────────────────────── */
function wireCommon() {
  // 뒤로가기 화살표 (좌표 비교라 M/m/l 표기 차이는 자동 흡수)
  onPath('m15 5-7 7 7 7', back);
  onPath('M8 1 1 8l7 7', back);
  // 햄버거 → 드로어
  onPath('M4 7h16M4 12h16M4 17h16', () => go('2h'));
  onPath('M4 8h16M4 16h16', () => go('2h'));
  // 닫기 X (분석 도구 · 드로어 · 오버레이)
  onPath('m6 6 12 12M18 6 6 18', back);
  onPath('M1.5 1.5 10.5 10.5M10.5 1.5 1.5 10.5', back);

  // 하단에서 "내가 한 것 / 프로가 준 것"이 갈린다.
  //   스윙   = 갤러리(09) 가 첫 화면 — 분석 도구는 그 안으로
  //   레슨기록 = 정규레슨(2f) · 프로 한마디(2i) 2탭
  // 스윙 탭은 계정 상태에 따라 갈리는 유일한 탭이다 —
  // 아직 한 개도 안 올린 사람에게 남의 스윙 12개를 보여줄 이유가 없다.
  // 신규 계정은 늘 ge 다. 09 는 남의 스윙 12개가 박혀 있는 화면이라
  // 내가 올린 것과 섞이면 어느 게 내 것인지 알 수 없다.
  const swTab = () => S.acct === 'new' ? 'ge' : '09';
  const TABS = { '홈': '2a', '연습기록': '2b', '스윙': swTab, '레슨기록': '2f', '마이': '2e' };
  const dest = d => (typeof d === 'function' ? d() : d);
  // 표식이 달린 탭바(글래스 홈)는 그걸로 잡는다 — 글자 크기가 화면마다 달라
  // '글자 + font-size 11px' 만으로는 놓치는 탭바가 생긴다.
  const marked = root().querySelectorAll('[data-tab]');
  if (marked.length) {
    marked.forEach(c => { const d = TABS[c.dataset.tab]; if (d) tap(c, () => jump(dest(d))); });
    return;
  }
  Object.keys(TABS).forEach(label => {
    els().forEach(e => {
      if (e.tagName !== 'SPAN' || e.childElementCount !== 0) return;
      if (e.textContent.trim() !== label) return;
      if (!/font-size:\s*11px/.test(e.getAttribute('style') || '')) return;
      tap(e.closest('span[style*="flex: 1"]') || e.parentElement, () => jump(dest(TABS[label])));
    });
  });
}


/* ── 등급 잠금 ────────────────────────────────────────────────────
   못 쓰는 걸 감추지 않고 '흐리게' 보여준다. 안 보이면 존재를 모른 채 나가고,
   또렷하게 보이면 안 되는 걸 누르게 된다. 흐림은 "있긴 있다"만 전한다.
   화면 HTML 은 data-lock 표식만 갖고, 실제 처리는 전부 여기서 한다. */
/* 잠긴 덩어리 — 가리지 않는다. 내용은 다 보여주고 '신청'만 막는다.
   흐리게 덮어버리면 뭐가 좋은지 모르니까 궁금해지지도 않고 그냥 짜증만 난다.
   보이면 갖고 싶어지고, 누르면 왜 안 되는지 알게 된다 — 그게 순서다.
   대신 남의 기록을 내 것처럼 보이게 두면 거짓말이라, 띠에 '예시'라고 못 박는다. */
/* 베타에서는 정기 피드백을 「Elite 플랜부터」라고 말하면 안 된다.
   돈을 더 내도 지금은 못 받는다 — 프로가 아직 만들어 줄 수 없기 때문이다.
   못 파는 걸 파는 문구로 두느니 준비 중이라고 적는 게 맞다. */
const LOCK_MSG = {
  fb: BETA.on
    ? ['정기 피드백 · 준비 중', '한 달치를 모아 프로가 리포트로 만들어요',
       '정기 피드백은 베타가 끝난 뒤에 열어드릴게요', 'fx']
    : ['정기 피드백 · Elite 플랜 예시', '한 달치를 모아 프로가 리포트로 만들어요',
       '정기 피드백은 Elite 플랜부터 받을 수 있어요', 'fx'],
  cm: ['프로 한마디 · Basic 플랜 예시', '올린 영상에 프로가 한두 마디 남겨줘요',
       '프로 한마디는 Basic 플랜부터 요청할 수 있어요', 'cx'],
};
const LOCK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
  + 'stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:block">'
  + '<rect x="5" y="10.5" width="14" height="9" rx="2.2"></rect>'
  + '<path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"></path></svg>';
function applyLock() {
  // 도착 띠는 '사건 알림'이다. 안 일어나는 사건을 흐리게 보여줄 이유가 없다 — 지운다.
  // (진짜 온 한마디를 알리는 띠는 따로 세운다 — [data-cm-bar])
  const strip = root().querySelector('[data-strip]');
  if (strip && !can('fb')) strip.remove();

  // 세그먼트 배지도 등급을 따른다 — 못 받는 것이 24개 쌓여 있을 수는 없다
  const bar = els().find(e => /background:#F1EDE4/.test(e.getAttribute('style') || ''));
  if (bar) Array.from(bar.children).forEach(pill => {
    const kind = pill.textContent.includes('정기 피드백') ? 'fb'
               : pill.textContent.includes('프로 한마디') ? 'cm' : null;
    if (!kind || can(kind)) return;
    const badge = pill.lastElementChild;
    if (badge) badge.textContent = '0';
  });

  const banded = {};   // 한 화면에 같은 안내 띠를 두 번 붙이면 잔소리가 된다
  root().querySelectorAll('[data-lock]').forEach(el => {
    const kind = el.dataset.lock;
    if (can(kind) || el.dataset.locked) return;
    el.dataset.locked = '1';
    // 가격표로 바로 보내면 '이게 뭔데 79,000원이냐'가 된다. 설명을 한 장 거친다.
    const [title, sub, why, learn] = LOCK_MSG[kind];
    const first = !banded[kind];
    banded[kind] = 1;
    // 탭 본문 전체가 잠긴 경우(2f·2i)와 카드 하나가 잠긴 경우는 자리 잡는 법이 다르다.
    const full = /flex:\s*1/.test(el.getAttribute('style') || '');

    const wrap = document.createElement('div');
    wrap.setAttribute('data-lockwrap', kind);
    wrap.setAttribute('style', 'display:flex;flex-direction:column;'
      + (full ? 'flex:1;min-height:0;' : 'flex:none;'));
    el.replaceWith(wrap);

    const bar = document.createElement('div');
    bar.setAttribute('data-lockbar', kind);
    const tn = TONE[kind];
    bar.setAttribute('style',
      'flex:none;display:flex;align-items:center;gap:9px;background:' + tn.face + ';'
      + 'border:1px solid ' + tn.edge + ';border-radius:12px;padding:10px 12px;'
      + (full ? 'margin:10px 16px 8px;' : 'margin-bottom:8px;'));
    bar.innerHTML =
      '<span style="flex:none;color:' + tn.line + ';display:flex">' + LOCK_ICON + '</span>'
      + '<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">'
      + '<span style="font-size:11.5px;font-weight:700;letter-spacing:-.02em;'
      + 'color:' + tn.line + '">' + title + '</span>'
      + '<span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);'
      + 'line-height:1.5">' + sub + '</span></span>'
      + '<span style="flex:none;white-space:nowrap;font-size:10.5px;font-weight:700;'
      + 'color:' + tn.line + '">어떻게 받나요 ›</span>';
    if (first) { wrap.appendChild(bar); tap(bar, () => go(learn)); }
    wrap.appendChild(el);

    // 신청만 막는다. 내용은 그대로 보이고, 누르면 왜 안 되는지 알려준다.
    // 껍데기에서 잡아야 안쪽 배선보다 먼저 걸린다 (캡처 단계).
    wrap.addEventListener('click', ev => {
      if (bar.contains(ev.target)) return;
      // 「미리 보기」는 막을 기능이 아니라 설명이다 — 잠금이 삼키면 안 된다
      if (ev.target.closest('[data-empty-act]')) return;
      ev.preventDefault(); ev.stopImmediatePropagation();
      const lit = root().querySelector('[data-lockbar="' + kind + '"]');
      if (lit) lit.animate([{ background: tn.edge }, { background: tn.face }], 460);
      toast(why, { label: '어떤 건지 보기', fn: () => go(learn) });
    }, true);
  });
}

/* ── 업로드 ────────────────────────────────────────────────────────
   업로드는 화면이 아니라 앱이 한다.
   전에는 진행 상태가 그 화면의 DOM 안에만 있어서, 타석에서 화면 한 번 넘기면
   올라가던 게 소리 없이 죽고 처음 상태로 돌아왔다. 다시 올려야 하는 줄도 모른다.
   이제 상태는 S.up 에 있고, 타이머는 어느 화면에 있든 계속 돈다.
   2c 로 돌아오면 지금 몇 %인지 그대로 다시 그린다. */
/* ── 업로드 ────────────────────────────────────────────────────────
   진짜로 올린다. 폰 갤러리가 열리고, 고른 영상이 이 기기의 보관함에 들어간다.
   한 번에 두 개까지 — 정면과 측면이다.

   전에는 파일 이름이 코드에 박혀 있고 진행률만 흉내 냈다. 「되는 척」이
   제일 나쁘다. 베타에서 확인해야 할 게 바로 이 한 바퀴다.

   서버가 붙으면 VAULT.add 뒤에 업로드 한 줄을 더하면 된다 —
   화면 쪽은 하나도 안 고쳐도 되게 보관함 안에서 다 막아뒀다. */
const UP_MAX = 2;
const VIEWS = ['정면', '측면'];

let upInput = null;
function upPicker() {
  if (upInput) return upInput;
  upInput = document.createElement('input');
  upInput.type = 'file';
  upInput.accept = 'video/*';
  upInput.multiple = true;
  upInput.setAttribute('style', 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0');
  upInput.addEventListener('change', () => {
    const files = Array.from(upInput.files || []);
    upInput.value = '';                    // 같은 영상을 또 골라도 걸리게 비운다
    if (files.length) upTake(files);
  });
  document.body.appendChild(upInput);
  return upInput;
}

/* 누른 그 순간에 열어야 한다 — 사용자 동작에서 한 박자라도 벗어나면
   브라우저가 파일 창을 막는다 */
function upStart() {
  if (S.up && !S.up.done) return;          // 올라가는 중엔 또 안 연다
  upPicker().click();
}

function upTake(files) {
  const over = files.length > UP_MAX;
  const take = files.slice(0, UP_MAX);
  if (take.some(f => f.size > VAULT.MAX)) {
    return toast('영상이 너무 커요 · 10초 안쪽으로 잘라서 올려주세요');
  }
  S.up = { p: 0, done: false, failed: false, n: take.length,
           names: take.map(f => f.name || '스윙.mp4') };
  upPaint();
  if (over) toast('한 번에 두 개까지 올릴 수 있어요');
  else {
    // 40MB 짜리는 데이터로 1분 넘게 걸린다. 멈춘 줄 알기 전에 미리 말해준다.
    const mb = take.reduce((a, f) => a + f.size, 0) / 1024 / 1024;
    if (mb > 25) toast(Math.round(mb) + 'MB · 프로에게 보내는 데 조금 걸려요');
  }

  let i = 0;
  const next = () => {
    if (i >= take.length) return upFinish();
    const file = take[i];
    VAULT.add(file, VIEWS[i] || '정면').then(rec => {
      sendUp(rec, file);            // 기기에 넣었으면 그다음 프로에게 보낸다
      i += 1;
      if (!S.up) return;                   // 그새 화면을 떠났으면 그린 것도 없다
      S.up.p = Math.round(i / take.length * 100);
      upPaint();
      next();
    }).catch(() => {
      if (!S.up) return;
      S.up.failed = true;
      upPaint();
      setTimeout(() => {
        S.upFailed = true; S.up = null;
        // 몰래 죽지 않는다 — 보고 있으면 실패 화면으로, 딴 데 있으면 알림으로
        if (S.route === '2c') go('uf');
        else toast('영상을 저장하지 못했어요', { label: '다시 하기', fn: () => go('2c') });
      }, 700);
    });
  };
  next();
}

/* ── 프로에게 보내기 ────────────────────────────────────────────────
   기기에 넣는 것과 서버로 보내는 것은 따로 논다.
   타석은 지하가 많고 데이터가 자주 끊긴다 — 전송이 실패해도 찍은 건 남아야 하고,
   나중에 다시 보낼 수 있어야 한다. 그래서 「보냈다/못 보냈다」를 기기에 적어둔다. */
const UPPCT = {};                       // 지금 몇 % 올라갔는지 (칸마다)
function sendUp(rec, file) {
  if (!window.NS) return;
  UPPCT[rec.id] = 0;
  let last = 0;
  NS.push(file, rec.view, null, pct => {
    UPPCT[rec.id] = pct;
    // 10% 단위로만 다시 그린다 — 매 프레임 그리면 올리는 것보다 그리는 게 무겁다
    if (pct - last >= 10 || pct === 100) { last = pct; if (S.route === 'ge') render(); }
  }).then(row => {
    delete UPPCT[rec.id];
    VAULT.mark(rec.id, { sent: true, remoteId: row.id, path: row.path, err: null })
      .then(window.__vaultSync).then(() => { if (S.route === 'ge') render(); });
  }).catch(e => {
    delete UPPCT[rec.id];
    VAULT.mark(rec.id, { sent: false, err: (e && e.message) || '전송 실패' })
      .then(window.__vaultSync).then(() => { if (S.route === 'ge') render(); });
  });
}

/* 프로가 남긴 한마디를 받아 온다. 서버에 있는 그대로다.
   앱을 열 때마다 다시 받는다 — 밤사이 왔을 수 있다. */
/* 썸네일은 저장이 끝난 뒤 뒤에서 만들어진다 — 다 되면 보고 있는 화면을 고쳐 그린다 */
window.__posterDone = () => { if (S.route === 'ge' || S.route === '2b') render(); };

window.__COMMENTS = [];
function loadComments() {
  if (!window.NS) return Promise.resolve([]);
  return NS.mine().then(list => {
    const out = [];
    list.forEach(sw => (sw.comments || []).forEach(c =>
      out.push({ id: c.id, body: c.body, photos: c.photos || [],
                 at: c.created_at, read: c.read_at, view: sw.view })));
    out.sort((a, b) => new Date(b.at) - new Date(a.at));
    const had = window.__COMMENTS.length;
    window.__COMMENTS = out;
    if (out.length) S.cm = 'arrived';
    const fresh = out.filter(c => !c.read);
    S.unread = fresh.length;
    if (fresh.length) S.stripOff = false;
    cmAnnounce(fresh);
    if (out.length !== had || fresh.length) render();
    return out;
  }).catch(() => []);
}

/* ── 프로 한마디가 왔다 ──────────────────────────────────────────────
   여기까지 와야 한 바퀴가 돈다 — 올리고, 프로가 답하고, 그게 회원에게 닿는다.
   답이 서버에만 있고 아무도 안 알려주면 아무 일도 안 일어난 것과 같다.

   네 군데서 알린다 —
     ① 앱을 열 때 시트로 바로 펼친다 (읽을 것이 있는데 접어둘 이유가 없다)
     ② 쓰는 도중에 오면 아래쪽 알림으로 (보던 것을 끊지 않는다)
     ③ 홈 도착 줄 · 종 배지 · 연습기록 말풍선
     ④ 레슨기록 › 프로 한마디 목록
   읽으면 서버에 읽음으로 적는다 — 폰을 바꿔도 다시 뜨지 않는다. */
const cmTold = new Set();          // 이 세션에서 이미 알린 것

// 안내나 가입 관문이 떠 있는 동안은 끼어들지 않는다 — 순서가 있다
const cmGated = () => {
  if (document.getElementById('join')) return true;
  const g = document.getElementById('bgate');
  return !!(g && !g.hidden);
};

function cmAnnounce(fresh) {
  const unseen = fresh.filter(c => !cmTold.has(c.id));
  if (!unseen.length) return;
  unseen.forEach(c => cmTold.add(c.id));
  const first = !window.__cmBooted;
  window.__cmBooted = true;
  if (!first) {
    return toast('이도형 프로가 한마디를 남겼어요', { label: '바로 보기', fn: () => cmSheet() });
  }
  // 앱을 막 연 참이다 — 관문이 걷히면 바로 펼친다
  const t = setInterval(() => {
    if (cmGated()) return;
    clearInterval(t);
    cmSheet();
  }, 700);
  setTimeout(() => clearInterval(t), 90000);
}

/* 목록 한 줄 — 안 읽은 것은 테두리가 초록이고 NEW 가 붙는다 */
function cmCard(c) {
  const n = (c.photos || []).length;
  return '<div data-cm-open="' + c.id + '" style="background:var(--ns-card);border:1px solid '
    + (c.read ? 'var(--ns-line)' : 'var(--ns-green)') + ';border-radius:13px;padding:12px 13px;'
    + 'display:flex;flex-direction:column;gap:6px;margin-bottom:8px">'
    + '<span style="display:flex;align-items:center;gap:6px">'
    + '<span style="' + P_FONT + 'font-size:12px;font-weight:600;color:var(--ns-ink)">'
    + cmWhen(c.at) + ' · ' + safe(c.view) + '</span>'
    + (c.read ? '' : '<span style="' + P_FONT + 'font-size:9px;font-weight:700;letter-spacing:.06em;'
        + 'color:var(--ns-green);background:rgba(33,64,47,.12);border-radius:4px;padding:2px 5px">'
        + 'NEW</span>')
    + '<span style="flex:1"></span>'
    + (n ? '<span style="' + P_FONT + 'font-size:10px;font-weight:600;color:var(--ns-ink3)">사진 '
        + n + '</span>' : '')
    + '</span>'
    + '<span style="' + P_FONT + 'font-size:12px;line-height:1.65;color:var(--ns-ink2);'
    + 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'
    + safe(c.body) + '</span></div>';
}

/* 펼친 한마디 — 프로가 보낸 글과 사진이 그대로 나온다 */
function cmSheet(id) {
  const all = window.__COMMENTS || [];
  if (!all.length) return;
  const fresh = all.filter(c => !c.read);
  const show = id ? all.filter(c => c.id === id)
             : fresh.length ? fresh : all.slice(0, 1);
  if (!show.length) return;
  const old = document.getElementById('cmnew');
  if (old) old.remove();

  const box = document.createElement('div');
  box.id = 'cmnew';
  box.innerHTML = '<div class="cmn-card">'
    + '<span class="cmn-tag">프로 한마디</span>'
    + '<span class="cmn-t">이도형 프로가 한마디를 남겼어요</span>'
    + show.map(c => '<div class="cmn-one">'
        + '<span class="cmn-meta">' + cmWhen(c.at) + ' · ' + safe(c.view) + ' 스윙</span>'
        + '<span class="cmn-body">' + safe(c.body) + '</span>'
        + (c.photos || []).map(u => '<img class="cmn-img" src="' + u + '" alt="">').join('')
        + '</div>').join('')
    + '<div class="cmn-foot">'
    + '<button class="cmn-btn" type="button" data-cm-ok>확인했어요</button>'
    + '<button class="cmn-alt" type="button" data-cm-list>받은 한마디 모두 보기</button>'
    + '</div></div>';

  const shut = go2i => {
    box.remove();
    // 펼친 것은 읽은 것이다 — 서버에도 적어 둔다
    show.filter(c => !c.read).forEach(c => {
      c.read = new Date().toISOString();
      if (window.NS) NS.markRead(c.id);
    });
    S.unread = (window.__COMMENTS || []).filter(c => !c.read).length;
    if (!S.unread) S.stripOff = true;
    if (go2i) jump('2i'); else render();
  };
  box.addEventListener('click', ev => {
    if (ev.target.closest('[data-cm-list]')) return shut(true);
    if (ev.target === box || ev.target.closest('[data-cm-ok]')) shut(false);
  });
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('on'));
}
window.__cmSheet = cmSheet;

/* 앱을 보고 있는 동안에도 계속 확인한다 — 프로는 아무 때나 답한다 */
setInterval(() => { if (!document.hidden) loadComments(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadComments(); });

/* 앱을 열 때 · 「다시 보내기」를 누를 때 — 아직 안 간 것을 밀어 보낸다 */
function resendAll() {
  const left = window.__SWINGS.filter(r => !r.sent);
  if (!left.length) return Promise.resolve(0);
  return Promise.all(left.map(r =>
    VAULT.file(r.id).then(f => f && sendUp(r, f))
  )).then(() => left.length);
}

function upFinish() {
  window.__vaultSync().then(list => {
    if (!S.up) return;
    S.up.done = true; S.up.p = 100;
    S.upDone = true;
    S.mine.vids = list.length;
    S.mine.days = Math.max(1, S.mine.days);
    S.mine.streak = Math.max(1, S.mine.streak);
    upPaint();
    const n = S.up.n;
    toast('스윙 ' + n + '개를 올렸어요',
          { label: '갤러리 보기', fn: () => jump(S.acct === 'new' ? 'ge' : '09') });
  });
}

function upPaint() {
  const box = root().querySelector('[data-up-box]');
  if (!box) return;
  if (!box.dataset.upBase) box.dataset.upBase = box.getAttribute('style') || '';
  const base = box.dataset.upBase;
  const u = S.up;

  if (!u) {                                // 아직 안 올림 / 취소함
    box.setAttribute('style', base);
    box.innerHTML = '<span style="font-size:13px;font-weight:600;color:#4A4638">영상 추가하기</span>';
    return;
  }

  if (u.done) {
    box.setAttribute('style', base + ';border-style:solid;border-color:#21402F;background:#F2F8F4');
    box.innerHTML =
      '<span style="display:flex;align-items:center;gap:9px;width:100%;min-width:0">'
      + '<span style="width:24px;height:24px;border-radius:50%;background:#21402F;flex:none;'
      + 'display:flex;align-items:center;justify-content:center">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" '
      + 'stroke-linejoin="round" style="width:11px;height:11px"><path d="m5 12.5 5 5 9-10"></path></svg>'
      + '</span><span style="flex:1;min-width:0;font-size:13px;font-weight:600;color:#1D2420;'
      + 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
      /* 파일명은 「Screen_Recording_20260702_201406_Instagram.mp4」 같은 것이 온다.
         길어서 상자를 뚫고 나가고, 읽어도 아무 도움이 안 된다.
         올린 사람이 알고 싶은 건 무엇을 몇 개 올렸는가다. */
      + (u.n > 1 ? '정면 · 측면 ' + u.n + '개 올렸어요' : VIEWS[0] + ' 스윙 올렸어요')
      + '</span></span>';
    return;
  }

  const bad = u.failed;
  box.setAttribute('style', base + ';border-color:#21402F;background:#F2F8F4');
  box.innerHTML =
    '<div style="display:flex;flex-direction:column;gap:9px;width:100%;min-width:0">'
    + '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">'
    + '<span style="flex:1;min-width:0;font-size:12.5px;font-weight:600;color:#1D2420;'
    + 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
    + (u.n > 1 ? '스윙 ' + u.n + '개' : VIEWS[0] + ' 스윙') + '</span>'
    + '<span style="font-size:12.5px;font-weight:700;font-family:var(--font-num);color:'
    + (bad ? '#C0392B' : '#21402F') + '">' + u.p + '%</span></div>'
    + '<div style="height:5px;border-radius:99px;background:#DCE7DE;overflow:hidden">'
    + '<span style="display:block;height:100%;border-radius:99px;width:' + u.p + '%;'
    + 'background:' + (bad ? '#C0392B' : '#21402F') + '"></span></div>'
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">'
    + '<span style="font-size:11px;font-weight:400;color:#4A4638">'
    + (bad ? '저장하지 못했어요'
           : (u.p >= 100 ? '올리기 끝났어요' : '보관함에 넣는 중이에요')) + '</span>'
    + '</div></div>';
}

/* ── 결과지 공통 배선 ──────────────────────────────────────────── */
function wireResult() {
  quiet = true;
  try { wireResultBody(); } finally { quiet = false; }   // 터져도 감시 장치는 다시 켠다
}
function wireResultBody() {
  onText('기록 보기', () => { S.route = 'r2'; render(); });
  onText('크게 보기', () => go('r7'));
  onText('이미지 저장', () => toast('시스템 공유 시트가 열려요'));
  onBtn('남기기', () => { S.route = 'r8'; render(); toast('질문을 남겼어요. 다음 영상에서 답해드릴게요'); });
  onBtn('스윙 올리고 확인받기', () => go('01'));

  // Before / After 사진 → 크게 보기
  ['5월 27일', '6월 27일'].forEach(t => onText(t, () => go('r7')));

  // 알림 받기 → 같은 화면에서 버튼만 바뀐다
  onBtn('알림 받기', el => {
    el.textContent = '알림 받는 중';
    el.style.background = 'rgba(237,237,232,.28)';
    el.style.color = '#EDEDE8';
    toast('7월 27일에 알림을 보내드릴게요');
  });

  // 숙제 체크 토글
  const hw = [];
  ['톱에서 3초 멈추기 15회', '거울 앞 톱 자세 사진 찍기', '발 모으고 스윙 20회'].forEach(t => {
    const e = byText(t)[0];
    if (!e) return;
    const row = findCard(e, 4);
    if (!row) return;
    const box = row.querySelector('span[style*="border-radius: 7px"]');
    tap(row, () => {
      const on = row.dataset.done === '1';
      row.dataset.done = on ? '' : '1';
      row.style.background = on ? '#FFF' : '#E7E7E3';
      row.style.borderColor = on ? '#E0E0DD' : '#D2D2CD';
      e.style.textDecoration = on ? 'none' : 'line-through';
      e.style.color = on ? '#1A1A1A' : '#666';
      if (box) {
        box.style.background = on ? 'transparent' : '#2A2A28';
        box.style.border = on ? '1.8px solid #C4C4BF' : 'none';
        box.innerHTML = on ? '' : '<svg width="11" height="9" viewBox="0 0 11 9" fill="none">'
          + '<path d="m1 4.6 3 3L10 1" stroke="#F2F2F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        box.style.display = 'flex';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';
      }
      toast(on ? '숙제를 해제했어요' : '숙제를 완료했어요');
      // 이번 달 숙제를 다 하면 결과지 자체가 '2/2' 상태로 넘어간다.
      // 체크는 화면 장식이 아니라 다음 달 레슨으로 넘어가는 문이다.
      if (S.route === 'r1' && !on && hw.every(r => r.dataset.done === '1'))
        setTimeout(() => { if (S.route === 'r1') { S.route = 'r3'; render(); } }, 520);
    });
    hw.push(row);
  });

  // 레슨 영상 재생
  root().querySelectorAll('[style*="background:#D6D6D3"],[style*="background: rgb(214, 214, 211)"]')
    .forEach(v => tap(v, () => toast('레슨 영상을 재생합니다')));
}

/* ── 프로 한마디 공통 배선 ──────────────────────────────────────────
   긴 코멘트를 위한 장치: 본문 안의 시각 칩과 영상 아래 인덱스 칩이
   같은 seek 를 부른다. 글이 길어져도 영상과 글이 서로를 잃지 않는다. */
const VID_SEC = 27;
const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

function pcSeek(sec) {
  const fill = root().querySelector('[data-pc-fill]');
  const time = root().querySelector('[data-pc-time]');
  if (fill) fill.style.width = Math.min(100, sec / VID_SEC * 100).toFixed(1) + '%';
  if (time) time.textContent = mmss(sec) + ' / ' + mmss(VID_SEC);
}

function wirePlayer() {
  root().querySelectorAll('[data-pc-jump]').forEach(e => tap(e, () => {
    const sec = +e.getAttribute('data-pc-jump');
    pcSeek(sec);
    toast(mmss(sec) + ' 지점으로 이동했어요');
  }));
  const vid = root().querySelector('[data-pc-video]');
  if (vid) tap(vid, () => { pcSeek(VID_SEC); toast('연습 영상을 재생합니다'); });
}

/* 카드형 토글 버튼 — 누르면 선택 상태로 잠긴다 */
function pcToggle(sel, onMsg, offMsg) {
  const e = root().querySelector(sel);
  if (!e) return miss('pcToggle ' + sel);
  tap(e, () => {
    const on = e.dataset.on === '1';
    e.dataset.on = on ? '' : '1';
    e.style.background = on ? '#FFFDF9' : '#E6EDE7';
    e.style.borderColor = on ? '#E4DED2' : '#21402F';
    e.style.color = on ? '#686253' : '#21402F';
    toast(on ? offMsg : onMsg);
  });
}

/* 회원 답글 — 코멘트는 일방 통보가 아니라 주고받는 것 */
const REPLY_TXT = [
  '아 어깨였군요. 7번 아이언으로 20번씩 해보겠습니다',
  '다음엔 정면으로 찍어서 올릴게요. 감사합니다!',
  '0:07 다시 봤는데 진짜 어깨가 멈춰 있네요',
];
function pcReply() {
  const box = root().querySelector('[data-pc-thread]');
  if (!box) return;
  const d = document.createElement('div');
  d.style.cssText = 'display:flex;justify-content:flex-end;padding-top:10px';
  d.innerHTML = '<span style="max-width:80%;background:#E6EDE7;border:1px solid #D3E0D6;'
    + 'border-radius:13px 13px 4px 13px;padding:10px 13px;font-size:12.5px;font-weight:500;'
    + 'color:#21402F;line-height:1.7;letter-spacing:-.01em">'
    + REPLY_TXT[S.replies % REPLY_TXT.length]
    + '<span style="display:block;font-size:9.5px;font-weight:500;color:#686253;'
    + 'font-family:var(--font-num);margin-top:5px;text-align:right">방금</span></span>';
  box.appendChild(d);
  S.replies++;
  const sc = box.parentElement;
  if (sc) {
    const dy = box.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom + 70;
    if (dy > 0) sc.scrollTop += dy;
  }
  toast('답글을 남겼어요 · 프로에게 알림이 갑니다');
}

/* ── 화면별 배선 ───────────────────────────────────────────────── */
const WIRE = {
  '2a'() {
    // 글래스 워시 홈 — 히어로(도착 줄 + 제목 + 프로 카드 + CTA)가 한 덩어리다.
    onGroup({
      '이도형 프로':     () => goResult('r1'),   // 프로 카드
      '최근 프로 한마디': () => go('2i'),
    });
    // 히어로 CTA — 온 리포트가 있으면 그걸 열고, 없으면 등급에 맞는 곳으로
    onBtn('피드백 확인하기', () => (can('fb') && S.unread) ? goResult('r1') : feedbackCTA());
    onCardOf('이번 달 프로 한마디', () => go('2i'));
    // 한 줄 통계 — 셋이 서로 다른 곳을 가리킨다
    const STAT = { '연습': '2b', '영상': '09', '연속': '2b' };
    root().querySelectorAll('[data-h-stat]').forEach(e => {
      const d = STAT[e.dataset.hStat];
      d ? tap(e, () => go(d)) : miss('통계 ' + e.dataset.hStat);
    });
    // 도착 줄을 눌러도 리포트가 열린다
    onText('오늘 도착 · 정기 피드백 No.06', () => goResult('r1'));
    root().querySelectorAll('[data-tl-row]').forEach(r => tap(r, () => go('pc1')));
    // 바로가기 — 스윙 분석 허브(03)의 유일한 입구다
    onGroup({
      'AI · 업로드 · 갤러리': () => go('03'),
      '나란히 보기':        goCompare,
      '용어 찾아보기':      () => go('16'),
      '혜택 · 결제':        () => go('17'),
    });
    root().querySelectorAll('[data-bell]').forEach(b => tap(b, () => go('nt')));

    /* 도착 줄 = 인앱 알림. '안 읽은 도착 알림'이 있을 때만 뜬다. */
    const strip = root().querySelector('[data-strip]');
    const dot = root().querySelector('[data-bell-dot]');
    if (dot) { dot.textContent = S.unread; dot.style.display = S.unread ? 'flex' : 'none'; }
    if (!strip) miss('홈 도착 줄');
    else if (S.stripOff || !S.unread) {
      strip.remove();
      // 바로 아래 '최근 프로 한마디'와 둘 다 '이도형 프로'로 시작한다.
      // 띠가 사라지면 위쪽이 무엇인지 알려주는 말이 화면에서 하나도 없어진다.
      const hero = root().querySelector('[data-h-hero]');
      if (hero && !hero.querySelector('[data-h-kind]')) {
        const lab = document.createElement('span');
        lab.setAttribute('data-h-kind', '');
        lab.setAttribute('style', "font-family:'Pretendard',-apple-system,sans-serif;"
          + 'font-size:10px;font-weight:700;letter-spacing:.14em;'
          + 'color:var(--ns-green2);padding-bottom:9px');
        lab.textContent = '정기 피드백 · 7월호';
        hero.insertBefore(lab, hero.firstChild);
      }
    }
  },


  /* ── 연습기록 (재설계) ─────────────────────────────────────────────
     화면은 하나다. '오늘' 카드와 '프로 한마디' 카드가 상태에 따라 얼굴을 바꾼다.
     empty → video → done (오늘), none → ask → wait → arrived (코멘트).
     둘은 서로 다른 축이라 따로 논다 — 영상만 올리고 코멘트는 안 부르는 날이 실제로 제일 흔하다. */
  '2b'() {
    showVariant('today', S.today);
    showVariant('cm', S.cm);

    // 오늘 카드
    const emptyBox = root().querySelector('[data-today="empty"] [style*="dashed"]');
    emptyBox ? tap(emptyBox, () => go('2c')) : miss('오늘 카드 업로드 박스');
    onBtn('오늘 연습 기록하기', () => go('2c'));
    onBtn('기록 마저 쓰기', () => go('2c'));
    onText('수정', () => go('2c'));

    // 프로 한마디 카드
    onBtn('프로 한마디 요청하기', () => {
      S.cm = 'wait'; S.cmAt = Date.now(); S.cmUsed += 1;
      toast('프로 한마디를 요청했어요'); go('pc2');
    });
    const waitCard = root().querySelector('[data-cm="wait"]');
    waitCard ? tap(waitCard, () => go('pc2')) : miss('코멘트 대기 카드');
    const bubble = root().querySelector('[data-cm="arrived"]');
    bubble ? tap(bubble.firstElementChild || bubble, () => go('pc1')) : miss('한마디 말풍선');
    onText('플랜 보기', () => go('18'));

    // 정기 피드백 카드 — 제목 줄에서 카드 전체까지 올라가 통째로 배선한다
    onCardOf('7월 27일 (월) 도착 예정', () => go('2f'));
    onText('지난 레슨', () => go('2f'));

    // 영상 썸네일 → 실제 엔진
    root().querySelectorAll('[style*="linear-gradient"]').forEach(v => tap(v, () => go('sw')));

    // 달력은 이번 달을 그리고, 점은 내가 올린 날에만 찍힌다
    paintCalendar();
  },

  /* ── 그날 하루 (달력에서 진입) ──────────────────────────────────── */
  '2d'() {
    const d = S.selDay || __PRACTICE.order[__PRACTICE.order.length - 1];
    const rec = __PRACTICE.days[d];
    if (!rec) return;
    const set = (sel, text) => { const e = root().querySelector(sel); if (e) e.textContent = text; };

    set('[data-d-title]', rec.label);
    set('[data-d-vn]', rec.videos.length + '개');
    set('[data-d-time]', rec.time);
    set('[data-d-feel]', rec.feel);
    set('[data-d-club]', rec.club);
    set('[data-d-memo]', '“' + rec.memo + '”');

    // 영상 개수만큼 썸네일을 다시 그린다 (1개인 날이 대부분이다)
    const vidsBox = root().querySelector('[data-d-vids]');
    if (vidsBox) {
      vidsBox.innerHTML = rec.videos.map(dur =>
        `<span style="flex:none;position:relative;width:148px;height:104px;border-radius:10px;overflow:hidden;
          background:linear-gradient(150deg,#3A3B33,#1D2420)">
          <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
            <span style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.94);
              display:flex;align-items:center;justify-content:center;color:#1D2420">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:11px;height:11px">
                <path d="M8 5.5v13l11-6.5z"></path></svg></span></span>
          <span style="position:absolute;left:5px;bottom:5px;background:rgba(0,0,0,.66);color:#fff;
            font-size:9.5px;font-weight:700;border-radius:4px;padding:2px 5px;font-family:var(--font-num)">
            ${dur}</span></span>`).join('');
      vidsBox.querySelectorAll('[style*="linear-gradient"]').forEach(v => tap(v, () => go('sw')));
    }

    // 코멘트가 없는 날은 그 섹션째로 숨긴다 — 대부분의 날은 이렇다
    const cmWrap = root().querySelector('[data-d-cmwrap]');
    if (cmWrap) {
      if (rec.comment) {
        cmWrap.style.display = '';
        set('[data-d-cmwhen]', rec.comment.when);
        const box = root().querySelector('[data-d-cm]');
        // 미리보기 두 줄 — line-clamp 스타일을 가진 가장 안쪽 span 하나뿐이라 정확히 짚힌다
        const preview = box && box.querySelector('span[style*="line-clamp"]');
        if (preview) preview.textContent = rec.comment.preview;
        onText('프로 한마디 보러가기', () => { S.route = 'pc1'; render(); });
      } else {
        cmWrap.style.display = 'none';
      }
    }

    onText('수정', () => toast('지난 기록은 오늘 화면에서만 고칠 수 있어요'));

    const idx = __PRACTICE.order.indexOf(d);
    const prevD = idx > 0 ? __PRACTICE.order[idx - 1] : null;
    const nextD = idx < __PRACTICE.order.length - 1 ? __PRACTICE.order[idx + 1] : null;
    set('[data-d-prevlab]', prevD ? '7월 ' + prevD + '일' : '이전 기록 없음');
    set('[data-d-nextlab]', nextD ? '7월 ' + nextD + '일' : '오늘까지 봤어요');
    const prevBtn = root().querySelector('[data-d-prev]'), nextBtn = root().querySelector('[data-d-next]');
    if (prevD && prevBtn) tap(prevBtn, () => { S.selDay = prevD; render(); });
    else if (prevBtn) prevBtn.style.opacity = '.4';
    if (nextD && nextBtn) tap(nextBtn, () => { S.selDay = nextD; render(); });
    else if (nextBtn) nextBtn.style.opacity = '.4';
  },

  '2c'() {
    // 업로드는 몇십 초 걸리는 일인데 지금까진 누르자마자 '추가됐어요' 였다.
    // 올라가는 동안 무슨 일이 벌어지는지, 취소할 수 있는지를 보여준다.
    // 점선 박스 자체를 잡아야 한다. 한 단계 위는 섹션 제목까지 품고 있어서
    // 거기에 진행률을 그리면 '오늘 스윙 올리기' 제목이 사라진다.
    const drop = root().querySelector('[data-up-box]');
    if (drop) {
      upPaint();                       // 나갔다 왔으면 하던 데서 이어 그린다
      tap(drop.parentElement, upStart);
    } else miss('2c 업로드 칸');
    selectGroup(['좋았음', '보통', '안 됐음'], ON_SOFT, t => { S.log.feel = t; });
    selectGroup(['30분 이하', '30~60분', '1시간 이상'], ON_SOFT, t => { S.log.mins = t; });
    /* 메모 칸이 진짜 입력이 아니었다 — 글자만 그려둔 상자였다.
       「담당 프로가 확인합니다」라고 적어놓고 적을 수가 없었다. 진짜로 바꾼다. */
    const memoBox = Array.from(root().querySelectorAll('div'))
      .find(e => e.children.length === 1 && /남겨보세요/.test(e.textContent));
    if (memoBox && !memoBox.querySelector('textarea')) {
      const ta = document.createElement('textarea');
      ta.setAttribute('data-memo', '');
      ta.rows = 3;
      ta.placeholder = '오늘 연습에서 느낀 점을 남겨보세요.';
      ta.value = S.log.memo || '';
      ta.setAttribute('style', 'width:100%;border:0;background:transparent;resize:none;'
        + 'font-family:inherit;font-size:12px;line-height:1.6;color:var(--ns-ink);outline:none');
      memoBox.innerHTML = '';
      memoBox.appendChild(ta);
      ta.addEventListener('input', e => { S.log.memo = e.target.value; });
    }
    // 요청할 수 없는 등급인데 체크가 켜져 있으면 '이미 신청됨'으로 읽힌다. 꺼둔다.
    if (!can('cm')) {
      const row0 = cardOf('프로 한마디', 2);        // 체크 줄
      const chk0 = row0 && row0.firstElementChild;  // 체크 상자
      if (chk0) {
        row0.dataset.off = '1';
        row0.style.borderColor = 'var(--ns-line)';
        row0.style.background = 'var(--ns-white)';
        chk0.innerHTML = '';
        chk0.style.background = 'transparent';
        chk0.style.border = '1.6px solid #C9C3B4';
      } else miss('2c 프로 한마디 체크 상자');
    }
    onCard('프로 한마디', 2, el => {
      const off = el.dataset.off === '1';
      el.dataset.off = off ? '' : '1';
      el.style.opacity = off ? '1' : '.45';
      toast(off ? '프로 한마디를 요청할게요 (이번 달 4회 남음)' : '한마디 요청을 해제했어요');
    });
    // 코멘트를 요청한 채로 저장하면 대기 화면으로 — 요청한 것의 행방을 보여준다.
    // 연습기록(2b)의 오늘 카드 / 프로 한마디 카드 상태도 여기서 같이 갱신한다.
    byText('오늘 기록하기').forEach(e => tap(findCard(e, 3), () => {
      S.today = 'done';
      S.log.at = Date.now();
      const req = cardOf('프로 한마디', 2);
      /* 저장하고 나면 이 화면은 끝난 화면이다. 뒤로 가서 다시 나오면
         이미 낸 것을 또 내게 된다. 돌아갈 자리는 연습기록이다. */
      S.hist = ['2b'];
      if (can('cm') && req && req.dataset.off !== '1') {
        if (S.cm !== 'arrived') { S.cm = 'wait'; S.cmAt = Date.now(); S.cmUsed += 1; }
        sendNote();                      // 적은 메모를 서버의 오늘 스윙에 붙여 보낸다
        sendWant();                      // 「한마디 요청함」 표시도 같이 — CRM 이 이걸로 가른다
        toast('기록을 저장하고 프로 한마디를 요청했어요');
        S.route = 'pc2'; return render();
      }
      sendNote();
      if (S.cm !== 'arrived' && S.cm !== 'wait') S.cm = 'ask';
      toast('오늘 기록을 저장했어요');
      S.route = '2b'; render();
    }));
  },

  '2g'() {   // 날짜별 스윙 — 정규레슨은 레슨기록 탭으로 옮겨갔다
    onPath('m14 6-6 6 6 6', () => toast('지난 주 기록을 불러왔어요'));
    onPath('m10 6 6 6-6 6', () => toast('다음 주 기록을 불러왔어요'));
    root().querySelectorAll('svg path').forEach(p => {
      if (pathKey(p.getAttribute('d')) === pathKey('m6 14.5 6-6 6 6')) {
        const head = p.closest('div');
        tap(head, () => toast('그룹을 접었어요'));
      }
    });
    // 상단 주간 캘린더: 날짜를 누르면 그 날 기록으로
    ['26', '27', '28', '29', '30', '31', '1'].forEach(d => onText(d, () => toast(d + '일 기록을 불러왔어요')));
    // 영상 카드는 칩만이 아니라 카드 아무 데나 눌러도 열린다 (patch_2g.mjs 가 붙여둔 표시)
    const cards = root().querySelectorAll('[data-swcard]');
    cards.length ? cards.forEach(c => tap(c, () => go(c.getAttribute('data-swcard'))))
                 : miss('영상 카드 data-swcard');
  },

  '2f'() {
    segTab('정기 피드백', '프로 한마디', { '프로 한마디': '2i' });
    onBtn('레슨 열기', () => goResult('r1'));
    onGroup(Object.fromEntries(['No.06', 'No.05', 'No.04', 'No.03']
      .map(n => [n, () => goResult('r1')])));
    onText('전체 보기', () => toast('지난 레슨 6개를 모두 보여드릴게요'));
    onCardOf('7월 27일 (월) 도착 예정', () => go('2b'));
  },

  /* ── 레슨기록 · 프로 한마디 목록 ─────────────────────────────────
     같은 코멘트를 '말 기준'으로 모아 본다. 각 줄에 그 스윙 썸네일이 붙어 있어
     목록으로 빼도 "무슨 영상 얘기지?" 가 생기지 않는다. */
  '2i'() {
    segTab('정기 피드백', '프로 한마디', { '정기 피드백': '2f' });
    const rows = root().querySelectorAll('[data-cmrow]');
    rows.length ? rows.forEach(r => tap(r, () => {
      S.selDay = +r.getAttribute('data-cmrow');
      go('pc1');
    })) : miss('한마디 행 data-cmrow');
    // 규칙 줄이 먼저 잡혀야 한다 — 바깥 카드(→ 2c)보다 안쪽이 우선이다
    onSel('[data-cm-rule-go]', () => go('cx'));
    tap(root().querySelector('[data-cm-quota]'), () => go('2c'));
    tap(root().querySelector('[data-cm-older]'), () => toast('6월 한마디 5개를 보여드릴게요'));
  },

  /* ── 프로 한마디 (그날 연습 영상에 프로가 남기는 코멘트) ────────── */
  pc1() {
    // '이게 다야?' 하고 실망하는 걸 막는 한 줄. 둘의 차이를 바로 볼 수 있게 잇는다.
    onSel('[data-pc-fb]', () => go('cx'));
    wirePlayer();
    onText('크게 보기', () => go('pc3'));
    const ph = root().querySelector('[data-pc-photo]');
    if (ph) tap(ph, () => go('pc3'));
    pcToggle('[data-pc-react]', '프로에게 전달했어요', '표시를 해제했어요');
    pcToggle('[data-pc-save]', '저장한 한마디에 담았어요', '저장을 해제했어요');
    tap(root().querySelector('[data-pc-input]'), pcReply);
    tap(root().querySelector('[data-pc-send]'), pcReply);
    tap(root().querySelector('[data-pc-clip]'), () => toast('사진 1장까지 함께 보낼 수 있어요'));
    root().querySelectorAll('[data-pc-past]').forEach(r => tap(r, () => {
      const d = r.firstElementChild.textContent.trim();
      toast(d + ' 한마디를 불러왔어요');
    }));
    onText('4 / 6회', () => toast('이번 달 프로 한마디 2회 사용 · 4회 남았어요'));
  },

  pc2() {
    wirePlayer();
    /* 「내가 남긴 기록」에 남의 연습이 적혀 있었다 —
       드라이버 · 45분 · 보통 · "톱에서 왼팔이 자꾸 접히는…".
       내가 적은 것만 보여주고, 안 적은 칸은 아예 지운다. */
    const pairs = [['클럽', null], ['시간', S.log.mins], ['느낌', S.log.feel]];
    pairs.forEach(([k, v]) => {
      const key = byText(k)[0];
      if (!key) return;
      const val = key.nextElementSibling;
      if (v) { if (val) val.textContent = v; }
      else if (key.parentElement) key.parentElement.remove();
    });
    // 따옴표로 묶인 메모 자리
    const quote = els().find(e => !e.childElementCount && /^[“"].*[”"]$/.test(e.textContent.trim()));
    if (quote) {
      if (S.log.memo && S.log.memo.trim()) quote.textContent = '“' + S.log.memo.trim() + '”';
      else quote.remove();
    }
    // 「내가 남긴 기록」에 아무것도 안 남았으면 제목도 치운다
    const head = byText('내가 남긴 기록')[0];
    if (head) {
      const card = head.nextElementSibling;
      if (!card || !card.textContent.trim()) {
        if (card) card.remove();
        head.remove();
      }
    }
    // 날짜 · 영상 배지도 실제로 올린 것으로
    const when = new Date(S.log.at || Date.now());
    const dl = byText('7월 26일 (일)')[0];
    if (dl) dl.textContent = md(when) + ' (' + DOW[when.getDay()] + ')';
    const tl = byText('연습 오후 6:02')[0];
    if (tl) tl.textContent = '연습 ' + when.toLocaleTimeString('ko-KR',
      { hour: 'numeric', minute: '2-digit' });
    const club = byText('드라이버')[0];
    if (club && club.parentElement) club.remove();
    // 진행 상황의 「오후 6:02 · 6:03」 — 실제로 올린 시각이다
    const hm = d => d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
    const upAt = hm(when), reqAt = hm(new Date(when.getTime() + 60000));
    const t1 = byText('오후 6:02'), t2 = byText('오후 6:03');
    t1.forEach(e => { e.textContent = upAt; });
    t2.forEach(e => { e.textContent = reqAt; });
    // 남은 횟수는 「내 사실」 층이 상태에서 계산해 찍는다
    // 영상 길이 「0:00 / 0:27」 — 아직 안 재생했으니 알 수 없다. 자리째 지운다.
    const dur = byText('0:00 / 0:27')[0];
    if (dur) dur.remove();
    onBtn('도착하면 알림 받기', el => {
      el.textContent = '알림 받는 중';
      el.style.background = '#E6EDE7';
      el.style.color = '#21402F';
      toast('프로 한마디가 도착하면 알려드릴게요');
      /* 알림을 켜두면 이 화면에 더 할 일이 없다. 「기다리는 중」을 계속 보고 있을
         이유가 없으니 내보낸다. 버튼이 바뀐 걸 눈으로 확인할 만큼만 두고 —
         그새 직접 다른 데로 갔으면 뒤로가기를 한 번 더 먹이면 안 된다.
         토스트는 화면 밖에 있어서 나가도 그대로 남는다. */
      setTimeout(() => { if (S.route === 'pc2') back(); }, 750);
    });
    // 월 6회짜리 한정 자원을 되돌리는 일이다. 확인 없이 실행하면 안 되고,
    // 실행한 뒤에도 되돌릴 수 있어야 한다.
    tap(root().querySelector('[data-pc-cancel]'), () => {
      confirmSheet('프로 한마디 요청을 취소할까요?',
        '취소하면 이번 달 횟수는 돌려받아요. 다시 요청하면 순서는 새로 잡힙니다.',
        '요청 취소하기', () => {
          const before = S.cm;
          S.cm = 'none';
          go('2b');
          toast('요청을 취소했어요 · 이번 달 4회 남음',
            { label: '되돌리기', fn: () => { S.cm = before; go('pc2'); } });
        });
    });
  },

  pc3() {
    tap(root().querySelector('[data-pc-save2]'), () => toast('사진을 갤러리에 저장했어요'));
    tap(root().querySelector('[data-pc-orig]'), back);
  },

  /* ── 스윙분석 엔진 (회원용) — 원본 SwingAnalyzer.tsx 를 그대로 띄운다 ── */
  sw() {
    swMount(root().querySelector('[data-sw-host]'));
    if (S.swCompare) { S.swCompare = false; swSetCompare(); }
    tap(root().querySelector('[data-sw-pro]'), () => {
      swSetCompare();
      toast('비교 모드예요 · 영상 A에 프로, 영상 B에 내 스윙을 불러오세요');
    });
  },

  /* ── DOH 판정 엔진 (POST /v1/analyze/video → 폴링 → doh.vision.v1) ── */
  e1() {
    const caps = __DOH.example.engines;
    const box = root().querySelector('[data-e1-caps]');
    if (box) box.innerHTML = [
      ['pose', caps.pose.name + ' · ' + caps.pose.variant, caps.pose.version],
      ['event', caps.event.name, caps.event.version],
      ['object', caps.object ? caps.object.name : '미탑재 (2차)', caps.object ? caps.object.version : '—'],
    ].map(([k, v, ver]) =>
      '<div style="display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid #F2ECE2">'
      + '<span style="width:44px;font-size:9.5px;font-weight:600;letter-spacing:.1em;color:#686253;'
      + 'font-family:var(--font-num)">' + k.toUpperCase() + '</span>'
      + '<span style="flex:1;font-size:11.5px;font-weight:500;color:#1D2420">' + v + '</span>'
      + '<span style="font-size:10px;color:#686253;font-family:var(--font-num)">' + ver + '</span></div>'
    ).join('').replace(/border-bottom:1px solid #F2ECE2(?![\s\S]*border-bottom)/, 'border-bottom:none');

    selectGroup(['정면', '측면'], 'background:#21402F;color:#fff;border-color:#21402F',
      lab => { S.view = lab === '정면' ? 'FO' : 'DTL'; toast(lab + '(' + S.view + ') 영상으로 분석해요'); });

    const cta = root().querySelector('[data-e1-cta]');
    const empty = root().querySelector('[data-e1-empty]');
    onCard('영상 추가하기', 2, el => {
      S.clip = true;
      el.style.borderStyle = 'solid';
      el.style.borderColor = '#21402F';
      el.style.background = '#E6EDE7';
      if (empty) { empty.textContent = 'swing_' + S.view.toLowerCase() + '_0001.mp4 · 3.2초'; empty.style.color = '#21402F'; }
      if (cta) { cta.style.background = '#21402F'; cta.style.color = '#fff'; }
      toast('영상을 등록했어요');
    });
    tap(cta, () => {
      if (!S.clip) return toast('영상을 먼저 등록해주세요');
      S.job = 'job_' + Math.abs(Date.now() % 100000).toString(36);
      go('e2');
    });
  },

  e2() {
    /* 기다리는 사람이 알아야 할 건 셋뿐이다 — 얼마나 남았나 / 지금 뭐 하나 / 나가도 되나.
       단계 이름은 사람 말로 바꿨다. 'POST /v1/analyze/video' 는 회원이 알 이유가 없다. */
    const STEPS = [
      ['영상 보내기', '올린 영상을 서버로'],
      ['자세 찾아내기', '몸의 관절 위치를 잡아요'],
      ['스윙 구간 나누기', '백스윙 · 톱 · 임팩트'],
      ['각도 재기', '어깨 · 골반 · 팔 각도'],
      ['문제 짚어내기', '18가지 항목과 비교'],
    ];
    const TOTAL = 40;                       // 실제 분석에 걸리는 대략의 시간(초)
    const host = root().querySelector('[data-e2-steps]');
    const bar = root().querySelector('[data-e2-bar]');
    const pct = root().querySelector('[data-e2-pct]');
    const eta = root().querySelector('[data-e2-eta]');
    if (!host) return miss('e2 단계 목록');

    host.innerHTML = STEPS.map(([t, sub], i) =>
      '<div style="display:flex;align-items:center;gap:11px;padding:9px 0" data-step="' + i + '">'
      + '<span style="width:20px;height:20px;border-radius:50%;border:1.5px solid #DED7C7;flex:none;'
      + 'display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600;'
      + 'color:#686253;font-family:var(--font-num)" data-dot>' + (i + 1) + '</span>'
      + '<span style="flex:1;display:flex;flex-direction:column;gap:2px">'
      + '<span style="font-size:12.5px;font-weight:500;color:#686253" data-lab>' + t + '</span>'
      + '<span style="font-size:10.5px;font-weight:400;color:#6E6858">' + sub + '</span></span>'
      + '<span style="font-size:10.5px;font-weight:600;color:#6E6858;font-family:var(--font-num)"'
      + ' data-state></span></div>'
    ).join('');

    const DONE = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" '
      + 'stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px">'
      + '<path d="m5 12.5 5 5 9-10"></path></svg>';
    let i = 0;
    const tick = () => {
      if (S.route !== 'e2') return;
      const row = host.querySelector('[data-step="' + i + '"]');
      if (row) {
        const prev = host.querySelector('[data-step="' + (i - 1) + '"]');
        if (prev) {
          prev.querySelector('[data-dot]').innerHTML = DONE;
          prev.querySelector('[data-state]').textContent = '끝';
        }
        row.querySelector('[data-dot]').style.cssText =
          'width:20px;height:20px;border-radius:50%;background:#21402F;color:#fff;flex:none;'
          + 'display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:600;'
          + 'font-family:var(--font-num)';
        row.querySelector('[data-lab]').style.color = '#1D2420';
        row.querySelector('[data-lab]').style.fontWeight = '700';
        row.querySelector('[data-state]').textContent = '하는 중';
        row.querySelector('[data-state]').style.color = '#21402F';
      }
      const p = Math.round((i + 1) / STEPS.length * 100);
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = p + '%';
      if (eta) {
        const left = Math.max(3, Math.round(TOTAL * (1 - p / 100)));
        eta.textContent = p >= 100 ? '거의 다 됐어요' : '약 ' + left + '초 남았어요';
      }
      i++;
      if (i < STEPS.length) setTimeout(tick, 420);
      else setTimeout(() => { if (S.route === 'e2') { S.route = 'e3'; render(); } }, 600);
    };
    setTimeout(tick, 260);

    // 나가도 계속 돌아간다는 걸 말로만 하지 않고 실제로 나갈 수 있게 한다
    const bg = root().querySelector('[data-e2-bg]');
    bg ? tap(bg, () => { replaceWith('2a'); toast('분석이 끝나면 알림으로 알려드릴게요'); })
       : miss('e2 백그라운드 버튼');
  },

  e3() {
    const host = root().querySelector('[data-e3-body]');
    const out = renderEngineResult(host, __DOH.example, __DOH.rules);
    // 신뢰도는 마무리 카드 한 곳에서만 말한다. 여기저기 흩으면 '못 믿겠다'만 남는다.
    const conf = root().querySelector('[data-e3-conf]');
    if (conf) conf.style.display = 'none';
    // P 구간 칩 → 프레임 이동
    host.querySelectorAll('[data-p-chip]').forEach(ch => {
      ch.style.cursor = 'pointer';
      ch.dataset.tapped = '1';
      ch.addEventListener('click', () => toast(ch.textContent.trim().split(' ')[0]
        + ' 구간 (' + ch.dataset.frame + '프레임)으로 이동했어요'));
    });
    // 결론은 하나다 — AI로는 여기까지고, 정확한 건 프로가 본다.
    // 문구는 등급과 무관하게 하나, 가는 곳만 갈린다.
    const pro = host.querySelector('[data-e3-pro]');
    if (pro) tap(pro, () => ((can('fb') || can('cm')) ? go('01') : go('fx')));
  },

  /* ── 정규레슨 결과지 (카카오 알림톡 링크로 진입) ────────────────── */
  r5() {  // 로딩 — 진입 경로로 왔으면 잠시 뒤 결과지로 넘어간다
    if (S.viaLoading) {
      const target = S.viaLoading;
      S.viaLoading = false;
      setTimeout(() => { if (S.route === 'r5') { S.route = target; render(); } }, 1100);
    }
    tap(root(), () => { S.route = 'r1'; render(); });
  },

  r1() { wireResult(); },
  r2() {
    wireResult();
    onText('접기', () => { S.route = 'r1'; render(); });
    // 여정 목록은 지금까지 그냥 그림이었다. 지난 레슨은 눌러서 다시 열려야 한다.
    // 첫 레슨은 시작점이라 계속 열어두고, 그 뒤 레슨 링크는 30일 지나면 닫힌다.
    const OPEN = { '슬라이스 잡기': 'r4' };   // 3월 = No.01 첫 레슨
    ['슬라이스 잡기', '아이언 뒤땅 줄이기', '하체 리드 만들기'].forEach(t => {
      const e = byText(t)[0];
      if (!e) return miss('r2 여정 ' + t);
      tap(e.closest('div'), () => go(OPEN[t] || 'r6'));
    });
  },
  r3() { wireResult(); },
  r4() { wireResult(); },
  r8() { wireResult(); onText('수정', () => { S.route = 'r1'; render(); }); },

  r6() {  // 링크 만료
    onBtn('프로에게 다시 요청하기', () => { toast('프로에게 링크를 다시 보내달라고 요청했어요'); back(); });
    onBtn('새 스윙 올리기', () => go('01'));
  },

  r7() {  // 사진 비교 전체화면
    onPath('M1.5 1.5 10.5 10.5M10.5 1.5 1.5 10.5', back);
    onBtn('이미지로 저장하기', () => toast('시스템 공유 시트가 열려요'));
  },

  /* ── 알림 ────────────────────────────────────────────────────────
     알림함은 '프로가 준 것'과 '내가 안 한 것' 두 종류만 담는다.
     줄을 누르면 그 알림이 가리키는 실물로 바로 간다 — 알림은 목적지가 아니라 문이다. */
  /* ── 정기 피드백 도착 · 앱 켜자마자 ────────────────────────────────
     한 달에 한 번뿐인 소식이라 화면을 통째로 쓴다. 어두운 화면은 이 앱에서
     '도착한 리포트'에만 허락된 색이라, 검정 자체가 곧 "왔다"는 신호가 된다.
     닫아도 홈 상단 띠는 남긴다 — 여기서 놓친 사람의 안전망이다. */
  'ar'() {
    quiet = true;                       // 뒤에 흐리게 깔린 홈은 배선하지 않는다
    try {
      const open = root().querySelector('[data-ar-open]');
      open ? tap(open, () => goResult('r1')) : miss('ar 리포트 열기');
      const later = root().querySelector('[data-ar-later]');
      later ? tap(later, () => replaceWith('2a')) : miss('ar 나중에');
    } finally { quiet = false; }
  },

  /* ── 없던 상태 화면 ─────────────────────────────────────────────── */
  uf() {   // 업로드 실패 — 실패는 막다른 길이 아니라 갈림길이어야 한다
    const R = (sel, fn) => { const e = root().querySelector(sel); e ? tap(e, fn) : miss('uf ' + sel); };
    R('[data-uf-retry]', () => { S.upTry = 0; S.up = null; replaceWith('2c'); toast('다시 올려볼게요'); });
    R('[data-uf-later]', () => replaceWith('2b'));
    R('[data-uf-help]', () => go('cs'));
    backArrow('[data-st-back]');
  },

  ge() {   // 갤러리 · 아직 비어 있음
    const R = (sel, fn) => { const e = root().querySelector(sel); e ? tap(e, fn) : miss('ge ' + sel); };
    R('[data-ge-upload]', () => go('2c'));
    R('[data-ge-guide]', () => toast('촬영 가이드는 준비 중이에요'));

    /* 첫 화면부터 「이 앱에 뭐가 들어 있는지」는 보여야 한다. 아직 못 여는 것이라도
       뭐가 생길지는 알아야 기다린다. 갤러리(09)의 분석 도구 줄을 베끼지 않고
       원본 그대로 복제해 온다 — 그래야 두 화면이 영영 안 어긋난다. */
    const src = document.querySelector('template[data-scr="09"]');
    const body = Array.from(root().querySelectorAll('div')).find(e => {
      const st = e.getAttribute('style') || '';
      return /flex:\s*1/.test(st) && /overflow-y:\s*auto/.test(st);
    });
    const proto = src && src.content.querySelector('[data-swtools]');
    if (proto && body && !body.querySelector('[data-swtools]')) {
      const box = proto.cloneNode(true);
      box.style.flex = 'none';
      box.style.marginTop = '16px';
      body.insertBefore(box, body.children[1] || null);
    }
    wireTools();

    /* 올린 스윙이 있으면 「아직 올린 스윙이 없어요」 자리를 진짜 목록으로 바꾼다.
       빈 상태는 정말 비어 있을 때만 나와야 한다. */
    if (window.__SWINGS.length && body) {
      const empty = body.firstElementChild;
      if (empty && !empty.querySelector('[data-swgrid]')) {
        empty.setAttribute('style', 'flex:none;display:block');
        paintGallery(empty);
      }
      // 「어떻게 쓰나요」 3단계는 첫 영상을 올리기 전에 읽는 글이다.
      // 이미 올린 사람에게는 자리만 차지한다.
      const guide = byText('어떻게 쓰나요')[0];
      if (guide) {
        let sec = guide;
        while (sec && sec.parentElement !== body) sec = sec.parentElement;
        if (sec) sec.remove();
      }
      const tip = byText('찍는 게 어렵다면 촬영 방법부터 볼까요?')[0];
      if (tip) {
        let sec = tip;
        while (sec && sec.parentElement !== body) sec = sec.parentElement;
        if (sec) sec.remove();
      }
    }
  },

  'nt'() {
    const DEST = { cm: 'pc1', reply: 'pc1', fb: () => goResult('r1'), ai: goAI,
                   streak: '2c', remind: '2c', pay: '18' };
    root().querySelectorAll('[data-nt-row]').forEach(r => tap(r, () => {
      markRead(r);
      const d = DEST[r.dataset.ntRow];
      typeof d === 'function' ? d() : go(d);
    }));
    onText('모두 읽음', () => {
      root().querySelectorAll('[data-nt-row]').forEach(markRead);
      S.unread = 0; S.stripOff = true;
      toast('모두 읽음으로 표시했어요');
    });
    onText('알림 설정 ›', () => go('ns'));
    backArrow('[data-nt-back]');
  },

  'ns'() {
    root().querySelectorAll('[data-ns-tg]').forEach(t => tap(t, () => {
      const on = t.dataset.on === '1';
      t.dataset.on = on ? '' : '1';
      t.style.background = on ? '#D9D2C4' : '#21402F';
      const knob = t.firstElementChild;
      knob.style.left = on ? '3px' : ''; knob.style.right = on ? '' : '3px';
      toast(on ? '이 알림을 껐어요' : '이 알림을 켰어요');
    }));
    root().querySelectorAll('[style*="항상 켬"], span').forEach(e => {
      if (e.textContent.trim() === '항상 켬')
        tap(e, () => toast('프로가 준 것은 놓치면 안 되니 끌 수 없어요'));
    });
    backArrow('[data-nt-back]');
  },


  '2h'() {
    onRow('Elite', () => go('18'));
    onRow('쿠폰함', () => go('cp'));
    onRow('구독 안내', () => go('17'));
    onRow('오프라인 레슨 예약', () => go('19'));
    onRow('골프 사전', () => go('16'));
    onRow('1:1 문의', () => go('cs'));
    onRow('설정', () => go('2e'));
    onText('로그아웃 · v2.4.1', () => confirmSheet('로그아웃할까요?',
      '다시 로그인하면 기록과 리포트는 그대로 있어요.', '로그아웃',
      () => toast('로그아웃 되었어요')));
  },

  '2e'() {
    growCard();
    // 이름 줄(연필 아이콘) — 계정 만들기 · 로그인
    const nm = byText(S.nick || '골프러버')[0];
    if (nm && nm.parentElement) tap(nm.parentElement, joinSheet);
    // 가입 안 했으면 그 아래에 한 줄로 권한다
    if (window.NS && !NS.named()) {
      const sub = byText('넥스트 스윙 오늘 시작')[0];
      if (sub) { sub.textContent = '계정을 만들면 폰을 바꿔도 이어져요 ›'; }
    }
    // 결제일마다 '이거 계속 낼까'를 생각하는 사람인데, 다음 결제일이 앱에 없었다
    const pn = root().querySelector('[data-pay-next]');
    if (pn) {
      // 베타 계정에도 다음 결제일이 없다 — 낸 적이 없으니 다음이 있을 리 없다
      if (S.plan === 'free' || BETA.on) pn.style.display = 'none';
      else {
        pn.style.display = 'flex';   // '' 로 지우면 원래 있던 display:flex 까지 날아간다
        setText('[data-pay-when]', '8월 25일 · ' + amount(S.plan));
        tap(pn, () => go('tm'));
      }
    }
    onBtn('플랜 관리', () => go('18'));
    onCard('MY PLAN', 3, () => go('18'));
    onText('상세보기', () => go('2b'));
    /* 마이의 통계 세 칸 → 그 기록으로. 신규 계정은 남의 화면 대신 내 것으로 간다.
       한마디는 아직 받은 게 없으면 열어봐야 남의 것뿐이다. */
    onGroup({
      '연습일': () => go('2b'),
      '영상 업로드': () => go(S.acct === 'new' ? 'ge' : '09'),
      '한마디': () => (S.acct === 'new' && S.cm !== 'arrived')
        ? toast('아직 받은 한마디가 없어요') : go('pc1'),
    });
    // 퀵메뉴 4칸은 grid 하나에 들어 있다. 층수로 올라가면 격자를 통째로 잡아
    // 첫 칸(골프 사전)만 살고 나머지 셋이 죽는다 → 칸의 '면'까지만 올라간다.
    onGroup({
      '골프 사전': () => go('16'),
      '유튜브':    () => toast('youtube.com/@Hyeong_golf 로 연결돼요'),
      '구독 안내': () => go('17'),
      '문의':      () => go('cs'),
    });
    onRow('내 쿠폰함', () => go('cp'));
    onRow('오프라인 레슨 안내', () => go('19'));
    onRow('알림 설정', () => go('ns'));
    onRow('약관 · 결제 · 해지', () => go('tm'));
  },

  '01'() {
    onText('촬영 가이드', () => toast('촬영 가이드를 보여드릴게요'));
    onCard('영상 추가하기', 2, el => {
      S.vids = Math.min(3, S.vids + 1);
      const cnt = byText('0/3')[0] || byText(S.vids - 1 + '/3')[0];
      if (cnt) cnt.textContent = S.vids + '/3';
      el.style.borderColor = '#21402F';
      el.style.background = '#E6EDE7';
      // CTA 활성화
      const cta = cardOf('스윙 분석 요청하기', 1);
      if (cta) { cta.style.background = '#21402F'; cta.style.color = '#fff'; cta.style.opacity = '1'; }
      const helper = byText('영상을 등록하면 분석을 요청할 수 있어요')[0];
      if (helper) helper.style.display = 'none';
      toast('영상 ' + S.vids + '개를 등록했어요');
    });
    toggleChips(['방향성', '비거리', '슬라이스', '훅', '뒤땅', '탑핑'], ON);
    onText('더 보기', () => toast('고민 항목 3개가 더 있어요'));
    onBtn('스윙 분석 요청하기', () => {
      if (!S.vids) return toast('영상을 먼저 등록해주세요');
      go('02');
    });
  },

  '02'() {
    onBtn('알림 설정 확인하기', () => toast('알림톡 수신 설정을 확인했어요'));
    onBtn('홈으로', () => jump('2a'));
  },

  '03'() {
    onCard('설문 → 스윙 등록 → 맞춤 결과', 2, goAI);
    onCard('영상 올리고 프레임 · 선 · 캡처', 2, () => go('08'));
    onCard('Next Swing 핵심 차별화', 2, goCompare);
    // 2g 는 남의 스윙이 2026년 7월로 박혀 있는 화면이다.
    // 신규 계정은 내가 올린 것이 그대로 있는 갤러리로 보낸다.
    onCard('과거 스윙 날짜별 조회', 2, () => go(S.acct === 'new' ? 'ge' : '2g'));
  },

  '04'() { onBtn('설문 시작하기', () => { S.step = 1; S.survey = {}; S.vidPicked = false; go('05'); }); },

  /* ── AI 설문 ─────────────────────────────────────────────────────
     질문지는 여기 한 곳에만 있다. 문구를 고칠 자리도 여기 한 곳뿐이다.
     각 줄의 첫 값(SLICE, FAT …)은 서버로 보낼 값이라 화면엔 안 보인다.
     type  one  하나만 / many  여러 개 (max 가 있으면 그만큼까지)
     do    답하기 전에 몸을 움직여야 하는 문항의 안내
     none  이걸 고르면 나머지가 풀리는 '없다' 선택지                     */
  '05'() {
    const SURVEY = [
      { id: 'Q1_BALL_FLIGHT', type: 'one',
        q: '드라이버로 친 최근 10발 중<br>가장 흔한 공의 휘어짐은?',
        o: [['SLICE', '오른쪽으로 휘어 나간다', '슬라이스'],
            ['HOOK', '왼쪽으로 감긴다', '훅'],
            ['STRAIGHT', '거의 곧게 간다', ''],
            ['MIXED', '그때그때 다르다', ''],
            ['UNKNOWN', '잘 모르겠다', '']] },

      { id: 'Q2_MISS', type: 'many', max: 2, none: 'NONE',
        q: '미스가 날 때<br>가장 자주 나오는 형태는?',
        o: [['FAT', '뒤땅', '공 앞 지면을 먼저 친다'],
            ['THIN', '탑볼', '공 윗부분을 친다'],
            ['SHANK', '생크', '클럽 목에 맞아 오른쪽으로 튄다'],
            ['WEAK', '힘이 안 실린다', '거리가 안 난다'],
            ['NONE', '특별한 미스 패턴은 없다', '']] },

      { id: 'Q3_GRIP', type: 'one',
        do: '어드레스로 서서 고개를 숙여 왼손 등을 보세요.',
        q: '손등의 주먹뼈(너클)가<br>몇 개 보이나요?',
        o: [['KNUCKLE_0_1', '0~1개', '손등이 거의 안 보인다'],
            ['KNUCKLE_2', '2개', ''],
            ['KNUCKLE_3PLUS', '3개 이상', '손등이 많이 보인다'],
            ['UNKNOWN', '지금은 확인이 어렵다', '']] },

      { id: 'Q4_MOBILITY', type: 'many', none: 'NONE',
        do: '네 가지를 직접 해보고, 잘 안 되는 것을 모두 골라주세요.',
        q: '몸이 어디까지<br>움직이나요?',
        o: [['TRAIL_HIP', '오른쪽 골반이 뻣뻣하다',
             '의자에 앉아 무릎을 붙이고 오른발을 바깥으로 벌려보세요'],
            ['THORAX', '상체가 45도도 안 돌아간다',
             '팔짱 끼고 앉아 상체만 오른쪽으로 돌려보세요'],
            ['ANKLE', '무릎이 벽에 안 닿는다',
             '벽 앞에 발을 붙이고 서서 무릎을 벽에 대보세요'],
            ['SHOULDER', '두 팔을 귀 옆까지 못 올린다',
             '만세하듯 두 팔을 위로 올려보세요'],
            ['NONE', '네 개 다 무리 없이 된다', '']] },

      { id: 'Q5_CUE', type: 'many', none: 'NONE',
        q: '요즘 스윙할 때<br>의식하는 말이 있나요?',
        o: [['HEAD_BACK', '"머리를 뒤에 두고 쳐라"', ''],
            ['HIP_BACK_CHEST_UP', '"엉덩이 빼고 가슴 세워라"', ''],
            ['TRAIL_ARM_TIGHT', '"오른팔을 몸에 붙여라"', ''],
            ['LOWER_BODY_FIX', '"하체 고정하고 상체만 돌려라"', ''],
            ['HIT_DOWN', '"눌러 쳐라 · 뒤땅 내지 마라"', ''],
            ['CLOSE_FACE', '"슬라이스 안 나게 페이스 닫아라"', ''],
            ['NONE', '특별히 의식하는 말은 없다', '']] },

      { id: 'Q6_ADDRESS_PRESSURE', type: 'one',
        do: '어드레스로 서서 발바닥을 느껴보세요.',
        q: '체중이<br>어디에 실려 있나요?',
        o: [['TOE', '앞꿈치 쪽', '발가락'],
            ['CENTER', '발 한가운데', ''],
            ['HEEL', '뒤꿈치 쪽', ''],
            ['LEAD_PRELOAD', '왼발에 미리 많이 실려 있다', '타깃 쪽 발']] },

      { id: 'G_PAIN', type: 'many', none: 'NONE',
        q: '스윙할 때 아프거나<br>불편한 곳이 있나요?',
        note: '이 문항은 분석 점수에 안 들어가요. 아픈 곳이 있으면 스트레칭을 '
            + '함부로 권하지 않으려고 여쭤봅니다.',
        o: [['BACK', '허리', ''], ['NECK_SHOULDER', '목 · 어깨', ''],
            ['ELBOW_WRIST', '팔꿈치 · 손목', ''], ['KNEE', '무릎', ''],
            ['HIP', '고관절', ''], ['NONE', '없다', '']] },
    ];
    const LAST = SURVEY.length;
    const Q = () => SURVEY[S.step - 1];
    const pick = () => (S.survey[Q().id] || []);
    const R = sel => root().querySelector(sel);

    const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2"'
      + ' stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px">'
      + '<path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>';

    function drawOpts() {
      const q = Q(), many = q.type === 'many', on = pick();
      R('[data-sv-opts]').innerHTML = q.o.map(([v, t, d]) => {
        const sel = on.indexOf(v) >= 0;
        return '<span data-sv-opt="' + v + '" style="display:flex;align-items:center;gap:12px;'
          + 'padding:13px 14px;border-radius:11px;border:' + (sel ? '1.5px solid var(--ns-green)'
            : '1px solid var(--ns-line)') + ';background:' + (sel ? '#E6EDE7' : 'var(--ns-card)') + '">'
          + '<span style="flex:none;width:22px;height:22px;border-radius:' + (many ? '7px' : '50%')
          + ';display:flex;align-items:center;justify-content:center;'
          + (sel ? 'background:var(--ns-green);color:var(--ns-white)'
                 : 'border:1.5px solid var(--ns-line)') + '">' + (sel ? CHECK : '') + '</span>'
          + '<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">'
          + '<span style="font-size:14px;font-weight:600;letter-spacing:-.02em;line-height:1.4;'
          + 'color:' + (sel ? '#17301F' : 'var(--ns-ink)') + '">' + t + '</span>'
          + (d ? '<span style="font-size:11px;font-weight:400;color:var(--ns-ink3);'
                 + 'line-height:1.5">' + d + '</span>' : '')
          + '</span></span>';
      }).join('');
      R('[data-sv-opts]').querySelectorAll('[data-sv-opt]').forEach(el => tap(el, () => choose(el.dataset.svOpt)));
    }

    function choose(v) {
      const q = Q();
      if (q.type === 'one') { S.survey[q.id] = [v]; return drawOpts(); }
      let on = pick().slice();
      if (on.indexOf(v) >= 0) on = on.filter(x => x !== v);
      else if (v === q.none) on = [v];                       // '없다'는 나머지를 푼다
      else {
        on = on.filter(x => x !== q.none);
        if (q.max && on.length >= q.max) return toast(q.max + '개까지 고를 수 있어요');
        on.push(v);
      }
      S.survey[q.id] = on;
      drawOpts();
    }

    function paint() {
      const q = Q();
      R('[data-sv-n]').textContent = S.step + ' / ' + LAST;
      R('[data-sv-bar]').style.width = (S.step / LAST * 100).toFixed(1) + '%';
      R('[data-sv-q]').innerHTML = q.q;
      const doBox = R('[data-sv-do]');
      doBox.style.display = q.do ? 'flex' : 'none';
      if (q.do) R('[data-sv-do-t]').textContent = q.do;
      R('[data-sv-hint]').textContent = q.type === 'one' ? '하나만 골라주세요'
        : q.max ? ('해당되는 것으로 최대 ' + q.max + '개까지') : '해당되는 것을 모두 골라주세요';
      const note = R('[data-sv-note]');
      note.style.display = q.note ? 'block' : 'none';
      if (q.note) note.textContent = q.note;
      drawOpts();
      const box = R('[data-sv-body]'); if (box) box.scrollTop = 0;   // 문항이 바뀌면 맨 위부터
    }

    if (!S.survey) S.survey = {};
    paint();

    onBtn('이전', () => { if (S.step <= 1) return back(); S.step--; paint(); });
    onBtn('다음', () => {
      const q = Q();
      if (!pick().length)
        return toast(q.type === 'one' ? '하나를 골라주세요' : '하나 이상 골라주세요');
      if (S.step < LAST) { S.step++; return paint(); }
      // 통증이 있으면 몸을 늘리라는 처방을 내리지 않는다 — 사람이 봐야 한다
      const pain = (S.survey.G_PAIN || []).filter(x => x !== 'NONE');
      if (pain.length) toast('아픈 곳이 있으면 스트레칭 대신 전문가 확인을 권해드려요');
      go('06');
    });
  },

  '06'() {
    // 아직 아무것도 안 골랐는데 '등록 완료'가 떠 있었다. 고른 뒤에 완료가 돼야 한다.
    const vbox = root().querySelector('[data-sv-vidbox]');
    const vnm = root().querySelector('[data-sv-vidname]');
    const vst = root().querySelector('[data-sv-vid]');
    if (vbox && vst) {
      const done = () => {
        vbox.style.background = 'var(--ns-green)';
        vbox.style.opacity = '1';
        vnm.textContent = '드라이버_0722.mp4';
        vst.textContent = '등록 완료';
        S.vidPicked = true;
      };
      if (!S.vidPicked) {
        vbox.style.background = 'var(--ns-sand)';
        vbox.style.opacity = '.5';
        vst.textContent = '탭해서 영상 고르기';
        tap(vst.parentElement, () => { done(); render(); toast('영상을 등록했어요'); });
      } else done();
    } else miss('06 영상 등록 자리');
    selectGroup(['정면', '측면'], 'background:#FFFFFF;color:#1D2420;box-shadow:0 1px 3px rgba(29,36,32,.16)',
      lab => toast(lab + ' 영상으로 등록할게요'));
    selectGroup(['좌타', '우타'], 'background:#FFFFFF;color:#1D2420;box-shadow:0 1px 3px rgba(29,36,32,.16)');
    selectGroup(['드라이버', '아이언'], 'background:#FFFFFF;color:#1D2420;box-shadow:0 1px 3px rgba(29,36,32,.16)');
    onBtn('이전', back);
    onBtn('AI 분석 시작하기', () => {
      if (!S.vidPicked) return toast('스윙 영상을 먼저 등록해주세요');
      S.clip = true; go('e2');
    });
  },

  '07'() {  // AI 분석 결과지 (프로 피드백 결과지와 별개 화면)
    onText('이도형 프로에게 이 영상 보내기', () => go('01'));
    onBtn('내일 이 드릴 하고 다시 찍기', () => { toast('내일 알림을 보내드릴게요'); jump('2a'); });
    onText('문제 구간 · 임팩트', () => toast('임팩트 구간을 0.25배속으로 재생합니다'));
  },

  '08'() {
    ['정면', '측면'].forEach(t => byText(t).forEach(e => {
      const slot = findCard(e, 3);
      tap(slot, () => {
        slot.style.borderColor = '#21402F';
        slot.style.background = '#E6EDE7';
        toast(t + ' 영상을 올렸어요');
      });
    }));
    // 09 는 남의 스윙 12개가 박힌 화면이다 — 신규 계정은 내 갤러리로 보낸다
    onText('스윙 갤러리에서 고르기', () => go(S.acct === 'new' ? 'ge' : '09'));
    onCard('단독 분석으로 이동', 1, () => go('sw'));
    root().querySelectorAll('[style*="linear-gradient"]').forEach(v => tap(v, () => go('sw')));
  },

  '09'() {   // 스윙 탭의 첫 화면
    // 필터 칩을 걷어내고 그 자리를 분석 도구에 줬다.
    // 갤러리가 이미 '이번 주 / 7월 초 / 6월'로 묶여 있어 칩 없이도 찾아진다.
    const tools = root().querySelectorAll('[data-swtool]');
    tools.length === 3 || miss('분석 도구 줄 (' + tools.length + '개)');
    wireTools();
    // 썸네일 → 그 스윙 상세(영상 + 내 기록 + 그때 그 한마디). 새 화면이 아니라 pc1 이다.
    const tiles = root().querySelectorAll('[style*="aspect-ratio"]');
    tiles.length ? tiles.forEach(t => tap(t, () => go('pc1'))) : miss('갤러리 썸네일');
    onText('스윙 갤러리', () => toast('전체 12개를 보여드릴게요'));
  },


  /* ── 기간 비교 ──────────────────────────────────────────────────
     "얼마나 좋아졌다"를 숫자로 말해주지 않는다. 두 스윙을 같은 화면에
     놓아줄 뿐이고, 달라진 걸 보는 건 회원이 한다. 같은 구간을 자동으로
     맞추는 건 지금 잘 안 되므로 팝업에서 미리 말하고 들어간다. */
  cg() {
    const box = root();
    const chips = box.querySelectorAll('[data-cg-p]');
    chips.length === 3 || miss('cg 기간 칩 (' + chips.length + '개)');
    const paint = () => {
      chips.forEach(c => {
        const on = c.dataset.cgP === S.cmpAgo;
        c.dataset.on = on ? '1' : '';
        c.style.background = on ? 'var(--ns-green)' : 'var(--ns-card)';
        c.style.borderColor = on ? 'var(--ns-green)' : 'var(--ns-line)';
        if (c.children[0]) c.children[0].style.color = on ? '#FFFFFF' : 'var(--ns-ink)';
        if (c.children[1]) c.children[1].style.color = on ? 'rgba(255,255,255,.66)'
                                                         : 'var(--ns-ink3)';
      });
      const old = box.querySelector('[data-cg-old]');
      if (old) old.textContent = CMP_AGO[S.cmpAgo].long;
    };
    chips.forEach(c => tap(c, () => { S.cmpAgo = c.dataset.cgP; paint(); }));
    paint();
    const R = (sel, fn) => { const e = box.querySelector(sel); e ? tap(e, fn) : miss('cg ' + sel); };
    // 팝업은 히스토리에 안 남긴다 — 비교 화면에서 뒤로 가면 스윙 탭이어야 한다.
    R('[data-cg-go]', () => { const a = CMP_AGO[S.cmpAgo]; replaceWith('11');
                              toast(a.long + ' 스윙을 옆에 놓았어요'); });
    R('[data-cg-no]', back);
    const dim = box.querySelector('[data-cg]');
    if (dim) dim.addEventListener('click', ev => { if (ev.target === dim) back(); });
  },

  '11'() {
    // 어느 기간을 골랐든 같은 화면을 쓴다. 날짜만 갈아 끼운다.
    const a = CMP_AGO[S.cmpAgo] || CMP_AGO['1'];
    const put = (sel, txt) => { const e = root().querySelector(sel);
                                e ? e.textContent = txt : miss('11 ' + sel); };
    put('[data-cmp-sub]', a.long + ' ↔ ' + CMP_NEW.long + ' · 정면');
    put('[data-cmp-old]', '과거 ' + a.short);
    put('[data-cmp-new]', '현재 ' + CMP_NEW.short);
    // 구간 이름은 우리말이다 — P1~P8 은 100타 치는 사람에겐 암호였다
    selectGroup(['어드레스', '백스윙', '왼팔수평', '톱', '다운', '클럽수평', '임팩트', '마무리'], ON);
    onBtn('저장', () => toast('비교 이미지를 저장했어요'));
    root().querySelectorAll('[style*="linear-gradient"]').forEach(v => tap(v, () => go('sw')));
    onText('프레임 동기화 ON', () => toast('프레임 동기화를 껐어요'));
    onBtn('양쪽 캡처', () => toast('양쪽 화면을 캡처했어요'));
    onBtn('프로와 비교', goSwCompare);
  },

  '12'() {
    // 프로 스윙 보기 = 영상을 여는 일이다. 껍데기 화면 대신 실제 엔진으로 바로 들어간다.
    onBtn('프로 스윙 보러가기', () => go('sw'));
    onCard('어드레스부터 피니시까지 한 구간씩', 2, () => go('sw'));
    onCard('프레임 동기화로 나란히 보기', 2, goSwCompare);
  },

  '13'() {
    S.seenIntro = true;                       // 한 번 봤으면 다시 안 띄운다
    onBtn('이해했어요', () => {
      if (S.faq) { S.faq = false; return back(); }   // 15에서 일부러 연 FAQ → 왔던 자리로
      replaceWith('12');                              // 첫 진입 안내 → 히스토리에 안 남기고 통과
    });
  },



  '16'() {
    selectGroup(['전체', '스윙 동작', '장비', '규칙'], ON);
    ['임팩트', '릴리즈', '템포', '레깅 (래그)', '캐스팅', '스웨이', '스윙 플레인'].forEach(t =>
      onCard(t, 2, () => toast('"' + t + '" 상세는 준비 중이에요')));
    onText('용어 검색', () => toast('검색은 준비 중이에요'));
  },

  /* ── 못 쓰는 등급이 '이게 뭔지' 알아보는 두 장 ────────────────────
     끝에 실물(예시)과 가격을 나란히 둔다. 궁금 → 실물 → 가격 순서다. */
  fx() {
    backArrow('[data-ex-back]');
    onSel('[data-ex-demo]', () => go('6d'));      // 실제 리포트 예시
    onSel('[data-ex-plan]', () => go('17'));
  },
  cx() {
    backArrow('[data-ex-back]');
    onSel('[data-ex-demo]', () => go('pc1'));     // 실제 한마디 예시
    onSel('[data-ex-plan]', () => go('17'));
  },

  '17'() {
    planTable();
    onCard('프로 소개 · 레슨 지점 5곳 · 예약', 2, () => go('19'));
    onCard('실제 피드백 예시', 2, () => go('6d'));
    // 요금표에서 '프로 한마디 월 2회'만 읽고는 그게 뭔지 모른다. 설명으로 가는 길을 연다
    onSel('[data-plan-what="fb"]', () => go('fx'));
    onSel('[data-plan-what="cm"]', () => go('cx'));
  },

  '18'() { planTable(); },

  /* 쿠폰함 — 등급이 못 받는 회원에겐 빈 상태를 보여준다.
     이 화면은 앱과 오프라인 레슨을 잇는 유일한 통로라, 빈 화면도 문이어야 한다. */
  cp() {
    backArrow('[data-cp-back]');
    const live = root().querySelector('[data-cp-live]');
    const none = root().querySelector('[data-cp-none]');
    const have = COUPONS[S.plan];
    if (live && none) {
      live.style.display = have ? 'block' : 'none';
      none.style.display = have ? 'none' : 'flex';
      const t = none.querySelector('[data-cp-none-t]');
      if (t && S.plan === 'basic')
        t.innerHTML = 'Coaching 플랜부터 매달 오프라인 레슨<br>할인권을 한 장씩 드려요.';
    } else miss('cp 쿠폰 목록');
    // 등급이 두 장을 못 받으면 두 번째 장은 접는다
    const tks = root().querySelectorAll('[data-cp-ticket]');
    tks.forEach((e, i) => { e.style.display = i < have ? 'flex' : 'none'; });
    const cnt = root().querySelector('[data-cp-live] span[style*="10.5px"]');
    if (cnt) cnt.textContent = have + '장';
    root().querySelectorAll('[data-cp-use]').forEach(e => tap(e, () =>
      toast('예약할 때 이 쿠폰을 쓸게요', { label: '지점 보기', fn: () => go('19') })));
    onSel('[data-cp-plan]', () => go('17'));
    onSel('[data-cp-book]', () => go('19'));
    // 지금 내 등급 줄을 굵게
    const NM = { free: '무료', basic: 'Basic', coaching: 'Coaching', elite: 'Elite' };
    /* 쿠폰은 「원포인트 레슨 20% 할인권」이 됐다 (정기레슨 15% 는 Elite 의 별개 혜택이다).
       화면 여러 곳에 「오프라인 레슨 10% 할인」 이 박혀 있어 한 번에 고쳐 쓴다. */
    els().filter(e => !e.childElementCount && /10% 할인/.test(e.textContent))
      .forEach(e => { e.textContent = e.textContent
        .replace('오프라인 레슨 10% 할인', '원포인트 레슨 20% 할인')
        .replace('10% 할인', '20% 할인'); });

    root().querySelectorAll('[data-cp-tier]').forEach(e => {
      const on = e.dataset.cpTier === NM[S.plan];
      const [k, v] = e.children;
      if (k) { k.style.fontWeight = on ? '700' : '500';
               k.style.color = on ? 'var(--ns-green)' : 'var(--ns-ink3)'; }
      if (v) { v.style.fontWeight = on ? '600' : '400';
               v.style.color = on ? 'var(--ns-ink)' : 'var(--ns-ink2)'; }
    });
  },

  '19'() {
    onGroup({
      '유튜브':     () => toast('youtube.com/@Hyeong_golf 로 연결돼요'),
      '인스타그램': () => toast('instagram.com/hyeong_golf 로 연결돼요'),
      '블로그':     () => toast('blog.naver.com/alex3628 로 연결돼요'),
    });
    const SHOPS = ['서초 TPZ', '판교 TPZ', '양재 TPZ', '남영골프클럽', '숏게임힐스'];
    onGroup(Object.fromEntries(SHOPS.map(t =>
      [t, () => toast('"' + t + '" 예약은 문의로 연결돼요')])));
    onBtn('예약 문의하기', () => go('cs'));
  },

  cs() {
    // 링크는 진짜로 걸려 있다. 눌리지 않는 환경도 있어 주소를 글자로도 보여준다.
    tap(root().querySelector('[data-cs-kakao]'), () => toast('카카오톡 오픈채팅으로 연결돼요'));
    tap(root().querySelector('[data-cs-mail]'), () => toast('메일 앱이 열려요'));
    tap(root().querySelector('[data-cs-copy]'), el => {
      el.textContent = '복사됨';
      el.style.color = '#21402F';
      el.style.borderColor = '#21402F';
      toast('alex3628@naver.com 을 복사했어요');
    });
    tap(root().querySelector('[data-cs-copyinfo]'), () => toast('회원 · 플랜 · 앱 버전을 복사했어요'));
    root().querySelectorAll('[data-cs-faq]').forEach(row => {
      tap(row.querySelector('[data-cs-q]'), () => {
        const a = row.querySelector('[data-cs-a]');
        const caret = row.querySelector('[data-cs-caret]');
        const open = a.style.display !== 'none';
        a.style.display = open ? 'none' : 'block';
        caret.style.transform = open ? '' : 'rotate(180deg)';
      });
    });
  },

  /* 약관 · 결제 · 해지 ─ 붙잡는 화면이 아니라 알려주는 화면이다.
     '받은 리포트는 해지 후에도 남는다'가 이 화면의 핵심이다. */
  tm() {
    backArrow('[data-tm-back]');
    /* 무료 회원에겐 해지할 결제가 없다. 전에는 '지금 결제 · Elite 79,000원 ·
       구독 해지하기'가 그대로 떠서, 무료인데 돈이 나가는 줄 알게 돼 있었다. */
    const pay = root().querySelector('[data-tm-pay]');
    const label = root().querySelector('[data-tm-paylabel]');
    const cancel = root().querySelector('[data-tm-cancel]');
    if (S.plan === 'free' || BETA.on) {
      if (label) label.textContent = '지금 플랜';
      if (pay) pay.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:14px 0">'
        + '<span style="flex:1;font-size:12.5px;font-weight:600;color:var(--ns-ink);line-height:1.5">'
        + (BETA.on ? 'Coaching 모드 · 베타 기간에는 나가는 돈이 없어요'
                   : '무료 플랜 · 나가는 돈이 없어요') + '</span>'
        + '<span data-tm-plans style="flex:none;font-size:11.5px;font-weight:700;'
        + 'color:var(--ns-green)">플랜 보기 ›</span></div>';
      if (cancel) cancel.style.display = 'none';
      // 아직 안 낸 사람에겐 이 정보가 '끊는 법'이 아니라 '내기 전에 알아둘 것'이다
      setText('[data-tm-know]', '결제 전에 알아둘 것');
      setText('[data-tm-ask]', '궁금한 게 있어요');
      onSel('[data-tm-plans]', () => go('17'));
    } else {
      setText('[data-buy-np]', planLabel(S.plan));
      setText('[data-tm-know]', '끊을 때 알아둘 것');
      setText('[data-tm-ask]', '해지 전에 물어볼 게 있어요');
      if (cancel) cancel.style.display = '';
    }
    const DOC = { terms: '이용약관', privacy: '개인정보 처리방침', refund: '환불 규정' };
    root().querySelectorAll('[data-tm-doc]').forEach(e =>
      tap(e, () => toast(DOC[e.dataset.tmDoc] + ' 전문은 웹에서 열려요')));
    onSel('[data-tm-cancel]', () => confirmSheet('구독을 해지할까요?',
      '이번 달 마지막 날까지는 지금 플랜 그대로 쓸 수 있어요. 받은 리포트는 해지 후에도 남습니다.',
      '해지하기',
      () => toast('해지 예약했어요 · 8월 25일부터 무료 플랜', { label: '되돌리기',
        fn: () => toast('해지를 취소했어요. 구독이 그대로 이어집니다') })));
    onSel('[data-tm-ask]', () => go('cs'));
  },

  '22'() {
    const k = buying();
    setText('[data-buy-np]', planLabel(k));
    onSel('[data-pay-cancel]', () => go('tm'));
    onBtn('결제 페이지 열기', () => go('23'));
    onBtn('다음에 하기', back);
  },

  '23'() {
    const k = buying();
    setText('[data-buy-name]', PLAN[k].name);
    setText('[data-buy-price]', BETA.on ? '미정' : priceOf(k));
    setText('[data-buy-total]', amount(k));
    selectGroup(['토스페이', '신용 · 체크카드', '계좌 자동이체'], ON_SOFT);
    onText('정기결제 약관 및 개인정보 제3자 제공에 동의합니다.', el => {
      const box = el.previousElementSibling || el.parentElement.firstElementChild;
      if (box) box.style.background = '#21402F';
      toast('약관에 동의했어요');
    });
    const btn = root().querySelector('[data-buy-btn]');
    if (btn) {
      btn.textContent = BETA.on ? '베타 참여하기' : won(PRICE[k]) + '원 결제하기';
      // 결제가 진짜로 등급을 바꾼다. 안 바꾸면 결제하고 홈에 와도 잠금이 그대로다
      tap(btn, () => { S.plan = k; S.buy = null; go('24'); });
    } else miss('결제 버튼');
  },

  '24'() {
    setText('[data-buy-done]', PLAN[S.plan].name + ' 구독이<br>시작됐어요', true);
    setText('[data-buy-total]', amount(S.plan));
    onBtn('홈으로 가기', () => jump('2a'));
    onBtn('영수증 보기', () => toast('영수증을 이메일로 보내드렸어요'));
  },


  '6d'() {
    // 원본 디자인에 뒤로가기가 없다 (알림톡 링크로 여는 랜딩 화면).
    // 앱 안에서 들어오면 나갈 수 없어 히어로 좌상단에 최소한의 버튼을 얹는다.
    const hero = root().querySelector('[style*="linear-gradient"]');
    if (hero && !hero.querySelector('[data-added-back]')) {
      const btn = document.createElement('span');
      btn.dataset.addedBack = '1';
      btn.style.cssText = 'position:absolute;top:50px;left:16px;z-index:5;width:32px;height:32px;'
        + 'border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;'
        + 'justify-content:center;cursor:pointer';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">'
        + '<path d="m15 5-7 7 7 7"></path></svg>';
      btn.addEventListener('click', ev => { ev.stopPropagation(); back(); });
      hero.appendChild(btn);
    }
    const PTS = ['플라잉 엘보 (오른팔 벌어짐)', '체중 이동 지연', '임팩트 시 상체 열림'];
    onGroup(Object.fromEntries(PTS.map(t => [t, () => toast('"' + t + '" 구간으로 이동했어요')])));
    onCard('영상 저장하기', 1, () => toast('워터마크가 찍힌 영상으로 저장돼요'));
    root().querySelectorAll('[style*="linear-gradient"]').forEach(v => tap(v, () => toast('영상을 재생합니다')));
  },
};

/* ── 사이드 목차 ───────────────────────────────────────────────── */
/* 프로토타입 전용 — 회원 등급을 바꿔가며 같은 화면을 본다.
   실제 앱엔 없는 장치다. 무료 회원이 무엇을 못 보는지 확인하려고 둔다. */
function renderPlanSwitch() {
  const box = document.getElementById('lg-plan');
  if (!box) return;
  if (!box.childElementCount) {
    Object.keys(PLAN).forEach(k => {
      const b = document.createElement('button');
      b.className = 'plan'; b.dataset.plan = k; b.textContent = PLAN[k].name;
      b.onclick = () => { S.plan = k; loadAccount(k === 'free' ? 'new' : 'used'); render(); };
      box.appendChild(b);
    });
  }
  box.querySelectorAll('.plan').forEach(b => b.classList.toggle('on', b.dataset.plan === S.plan));
}

function renderLegend() {
  renderPlanSwitch();
  const meta = window.__META[S.route] || {};
  document.getElementById('lg-name').textContent = S.route.toUpperCase() + ' · ' + (meta.title || '');
  document.getElementById('lg-purpose').textContent = meta.group || '';
  const box = document.getElementById('lg-jumps');
  if (box.childElementCount) {
    box.querySelectorAll('.jump').forEach(b => b.classList.toggle('on', b.dataset.id === S.route));
    return;
  }
  GROUPS.forEach(([gname, ids]) => {
    const lab = document.createElement('div');
    lab.className = 'sec-label';
    lab.textContent = gname;
    box.appendChild(lab);
    const row = document.createElement('div');
    row.className = 'jumps';
    ids.forEach(id => {
      if (!document.querySelector('template[data-scr="' + id + '"]')) return;
      const b = document.createElement('button');
      b.className = 'jump' + (id === S.route ? ' on' : '');
      b.dataset.id = id;
      b.textContent = id.toUpperCase() + ' ' + ((window.__META[id] || {}).title || '').split(' — ')[0].split(' · ')[0];
      b.onclick = () => jump(id);
      row.appendChild(b);
    });
    box.appendChild(row);
  });
}

/* 앱 실행 시점: 안 읽은 정기 피드백이 있으면 홈이 아니라 도착 화면부터 연다.
   기본 계정은 신규라 해당 없고, 등급을 유료로 바꿔 실행할 때만 걸린다. */
if (can('fb') && S.unread > 0) S.route = 'ar';
render();

/* 보관함은 비동기라 첫 그림보다 한 박자 늦게 온다.
   오면 개수를 맞추고 다시 그린다 — 앱을 껐다 켜도 올린 스윙이 그대로 있어야 한다. */
/* 서버에 붙는다. 실패해도 앱은 그대로 돈다 — 영상은 기기에 남고 나중에 다시 간다. */
/* 순서가 중요하다 — ① 베타 안내 ② 계정 만들기 ③ 앱.
   가입 없이 들어가면 프로 쪽에는 이름 없는 스윙만 쌓인다.
   서버가 죽어 있을 때만 그냥 들여보낸다 — 그때 막으면 아무것도 못 한다. */
const needJoin = () => window.NS && !NS.down() && !NS.named();
window.__afterGate = () => { if (needJoin()) joinSheet(true); };

if (window.NS) NS.ready().then(u => {
  if (!u) return;
  if (NS.nick()) { S.nick = NS.nick(); render(); }
  // 안내를 이미 본 세션(새로고침)이라 __afterGate 가 안 불렸으면 여기서
  let seen = false;
  try { seen = sessionStorage.getItem('ns-beta-seen') === '1'; } catch (e) {}
  const dev = /[?&]dev(=|&|$)/.test(location.search);
  if ((seen || dev) && needJoin() && !dev) joinSheet(true);
  resendAll();
  loadComments();
}).catch(() => {});

window.__vaultSync().then(l => {
  if (!l.length) return;
  S.mine.vids = l.length;
  S.mine.days = Math.max(1, S.mine.days);
  S.mine.streak = Math.max(1, S.mine.streak);
  S.upDone = true;
  render();
}).catch(() => {});
