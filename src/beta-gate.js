"use strict";
/* ── 베타 안내 ───────────────────────────────────────────────────────
   링크를 받고 처음 들어온 사람이 제일 먼저 궁금해하는 건 둘이다 —
   「이거 진짜야? 내 돈 나가는 거야?」 그리고 「그래서 얼마야?」
   두 장으로 나눠 차례로 답한다.

   ① 첫 장 — 지금 어디까지 됐는지. 되는 것 / 안 되는 것.
   ② 둘째 장 — 구독 안내. 정식으로 열 때 어떻게 나뉘는지.
   ③ 표식  — 앱을 도는 내내 상태바 가운데에 「베타」 가 붙어 있다.
             (상태바는 55개 화면이 전부 같은 구조라 가운데가 늘 비어 있다)  */

(function () {
  const KEY = 'ns-beta-seen';
  const DEV = /[?&]dev(=|&|$)/.test(location.search);

  /* 등급별 혜택은 런타임(BENEFIT)이 정본이다. 여기서 또 적으면 언젠가 어긋난다. */
  const B = window.__BENEFIT || {};
  const PLANS = [
    ['free', '무료'], ['basic', 'Basic'], ['coaching', 'Coaching'], ['elite', 'Elite'],
  ];
  const BETA_PLAN = 'coaching';

  const ONE = `
  <div class="bgate-head">
    <div class="bgate-mark">NEXT SWING</div>
    <div class="bgate-ko">넥스트 스윙</div>
    <div class="bgate-tag">베타 · 시험판</div>
  </div>

  <div class="bgate-plan">
    <div class="bgate-pt">베타는 <b>Coaching 모드</b>로 열립니다</div>
    <ul class="bgate-ul bgate-ul-p">
      <li>올리신 스윙에 <b>이도형 프로가 직접 한마디</b>를 남깁니다</li>
      <li>한 달에 <b>5번</b>까지 요청하실 수 있어요</li>
      <li>스윙 갤러리 &middot; 연습 기록 &middot; <b>직접 분석</b> 도구가 열려 있어요</li>
      <li><b>원포인트 레슨 할인권 20%</b> 매월 증정</li>
    </ul>
  </div>

  <div class="bgate-sect">
    <div class="bgate-st bgate-st-x">아직 안 되는 것</div>
    <ul class="bgate-ul bgate-ul-x">
      <li><b>AI 분석 &middot; 프로와 비교 &middot; 정기 피드백</b> &mdash; 베타 이후에 열립니다</li>
      <li><b>결제</b> &mdash; 눌러도 돈이 안 나갑니다</li>
      <li><b>올린 영상</b> &mdash; 이도형 프로만 봅니다 · 베타가 끝나면 지웁니다</li>
      <li><b>&lsquo;예시&rsquo; 표시</b> &mdash; 미리 넣어둔 화면입니다</li>
    </ul>
  </div>

  <p class="bgate-ask">다음 화면에서 계정을 만들고 시작합니다.<br>
    이상한 곳이 보이면 그대로 알려주세요.</p>

  <button class="bgate-btn" type="button" data-bgate-next>구독 안내 보기</button>
  <div class="bgate-foot">이도형 프로</div>`;

  const planCard = ([id, nm]) => {
    const on = id === BETA_PLAN;
    const items = (B[id] && B[id].all) || [];
    return `<div class="bplan${on ? ' on' : ''}">
      <div class="bplan-top">
        <span class="bplan-nm">${nm}</span>
        ${on ? '<span class="bplan-tag">베타에 열려 있어요</span>' : ''}
      </div>
      <ul class="bplan-ul">${items.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>`;
  };

  const TWO = () => `
  <div class="bgate-nav">
    <button class="bgate-back" type="button" data-bgate-prev>&lsaquo; 뒤로</button>
    <span class="bgate-h2">구독 안내</span>
  </div>

  <div class="bgate-plans">${PLANS.map(planCard).join('')}</div>

  <button class="bgate-btn" type="button" data-bgate-close>둘러보기 시작</button>`;

  let box = null;
  let step = 1;

  function draw() {
    const card = box.querySelector('.bgate-card');
    card.innerHTML = step === 1 ? ONE : TWO();
    card.classList.toggle('bgate-card-2', step === 2);
    card.scrollTop = 0;   // 다시 열었을 때도 위에서부터 읽게
  }

  function open() {
    if (!box) {
      box = document.createElement('div');
      box.id = 'bgate';
      box.innerHTML = '<div class="bgate-card"></div>';
      box.addEventListener('click', e => {
        if (e.target.closest('[data-bgate-next]')) { step = 2; draw(); return; }
        if (e.target.closest('[data-bgate-prev]')) { step = 1; draw(); return; }
        if (e.target.closest('[data-bgate-close]') || e.target === box) close();
      });
      document.body.appendChild(box);
    }
    step = 1;
    draw();
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('on'));
  }

  function close() {
    if (!box) return;
    box.classList.remove('on');
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    setTimeout(() => {
      if (box) box.hidden = true;
      // 안내가 끝나면 다음 관문(계정 만들기)이 이어받는다
      if (window.__afterGate) window.__afterGate();
    }, 220);
  }

  /* ── 상시 표식 ───────────────────────────────────────────────────
     화면을 갈아끼울 때마다 프레임이 통째로 새로 그려지므로,
     런타임을 건드리지 않고 #stage 를 지켜보다가 다시 붙인다. */
  function mark() {
    const stage = document.getElementById('stage');
    if (!stage) return;
    const frame = stage.firstElementChild;
    if (!frame || frame.querySelector('.bmark')) return;
    if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bmark';
    b.textContent = '베타';
    b.title = '베타 안내 다시 보기';
    b.addEventListener('click', e => { e.stopPropagation(); open(); });
    frame.appendChild(b);
  }

  const stage = document.getElementById('stage');
  if (stage) {
    new MutationObserver(mark).observe(stage, { childList: true });
    mark();
  }

  /* ── 여는 순서 ───────────────────────────────────────────────────
     ① 여는 화면(오늘의 한 장) ② 베타 안내 ③ 계정 만들기 ④ 앱.
     여는 화면은 세션마다 한 번이다 — 탭을 오갈 때마다 뜨면 관문이 된다.
     서버에서 가입일과 지난번 카드를 받아와야 제대로 갈리므로 조금 기다린다.
     안 오면 그냥 연다 — 첫 방문으로 쳐도 카드는 나온다. */
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  const gate = () => { if (!DEV && !seen) open(); };

  let opened = false;
  try { opened = sessionStorage.getItem('ns-open-seen') === '1'; } catch (e) {}

  if (DEV || opened || !window.__openScreen) return gate();
  try { sessionStorage.setItem('ns-open-seen', '1'); } catch (e) {}

  let went = false;
  const start = () => { if (went) return; went = true; window.__openScreen(gate); };
  /* 스윙·한마디가 와 있어야 카드가 제대로 갈린다. 그 신호를 기다리되
     1.2초까지만 — 데이터가 늦는다고 흰 화면을 계속 보여줄 수는 없다.
     늦게 오면 그냥 응원 카드가 나온다. 틀린 말은 아니다. */
  const t0 = Date.now();
  (function wait() {
    if (window.__BOOTREADY || Date.now() - t0 > 1200) return start();
    setTimeout(wait, 60);
  })();
})();
