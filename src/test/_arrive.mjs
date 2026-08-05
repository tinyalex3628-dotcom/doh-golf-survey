/* 프로가 보낸 한마디가 회원에게 닿는지 — 회원 앱 쪽 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';

const RAW = fs.readFileSync('nextswing-v3.html', 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

// 1×1 빨간 점 — 프로가 붙인 캡처 사진 대역
const PIX = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNjAiIGhlaWdodD0iNjQwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjY0MCIgZmlsbD0iIzJDM0EzMCIvPjxsaW5lIHgxPSI2MCIgeTE9IjE4MCIgeDI9IjMwMCIgeTI9IjI0MCIgc3Ryb2tlPSIjRTQ1NzNEIiBzdHJva2Utd2lkdGg9IjYiLz48bGluZSB4MT0iMTgwIiB5MT0iODAiIHgyPSIxODAiIHkyPSI1NjAiIHN0cm9rZT0iI0U0NTczRCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PC9zdmc+';

const STUB = `
window.__READ = [];
window.__SW = [{ id: 'sw-1', view: '정면', path: 'p/1.mp4', size: 1000, note: null,
  created_at: new Date(Date.now() - 7200e3).toISOString(),
  comments: [{ id: 'cm-1', body: '톱에서 왼팔이 접히는 건 팔 힘이 아니라\\n어깨 회전이 덜 돌아서 그래요.',
    photos: ['${PIX}', '${PIX}'],
    created_at: new Date(Date.now() - 600e3).toISOString(), read_at: null }] }];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')),
  markRead: id => { window.__READ.push(id);
    window.__SW.forEach(s => s.comments.forEach(c => {
      if (c.id === id) c.read_at = new Date().toISOString(); }));
    return Promise.resolve(); },
  link: p => Promise.resolve(p), people: () => Promise.resolve({}),
  note: () => Promise.resolve(), want: () => Promise.resolve(),
  setName: () => Promise.resolve('테스터'),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8811);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
const p = await ctx.newPage();
/* 여는 화면(오늘의 한 장)은 _opening.mjs 가 맡는다. 여기서는 건너뛴다 —
   안 그러면 앱이 뜨기까지 3초가 더 걸려 이 시험의 타이밍이 전부 밀린다. */
await p.addInitScript(() => {
  try { sessionStorage.setItem('ns-open-seen', '1'); } catch (e) {}
});
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 180)));

await p.goto('http://127.0.0.1:8811/');
await p.waitForTimeout(700);

// ① 베타 안내가 떠 있는 동안에는 끼어들지 않아야 한다
const duringGate = await p.evaluate(() => ({
  gate: !!document.querySelector('#bgate:not([hidden])'),
  sheet: !!document.getElementById('cmnew'),
}));

await p.click('[data-bgate-next]');
await p.waitForTimeout(200);
await p.click('[data-bgate-close]');
await p.waitForTimeout(1500);

/* ② 팝업은 이제 안 뜬다. 홈 히어로와 도착 줄이 그 말을 이미 하고 있어서,
      같은 말을 팝업으로 한 번 더 할 이유가 없다. */
const home = await p.evaluate(() => {
  const st = document.querySelector('[data-cm-bar]');
  const dot = document.querySelector('[data-bell-dot]');
  const h = document.querySelector('[data-h-hero]');
  return {
    팝업: !!document.getElementById('cmnew'),
    히어로: h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 34) : null,
    도착줄: st ? st.textContent.replace(/\s+/g, ' ').trim() : null,
    종배지: dot ? dot.style.display + ':' + dot.textContent : null,
    unread: S.unread,
  };
});
await p.screenshot({ path: '_ar_home.png' });

/* ③ 눌러서 상세(pc1)로 바로 간다 — 중간에 팝업이 없다.
      히어로가 이미 「한마디 도착」을 말하는 화면에선 도착 줄을 안 세운다
      (같은 소식을 두 번 말하지 않는다). 그럴 땐 히어로 버튼이 그 자리다. */
await p.click((await p.$('[data-cm-bar]')) ? '[data-cm-bar]' : '[data-fresh-go]');
await p.waitForTimeout(600);
const detail = await p.evaluate(() => {
  const bub = document.querySelector('[data-pc-body]');
  const imgs = [...document.querySelectorAll('[data-pc-body] .cmn-img')];
  return {
    화면: S.route,
    팝업없음: !document.getElementById('cmnew'),
    프로글: bub ? /어깨 회전이 덜 돌아서/.test(bub.textContent) : false,
    사진: imgs.length,
    사진실림: imgs.every(i => i.complete && i.naturalWidth > 0),
    영상칸: !!document.querySelector('[data-pc-video] video'),
    예시남음: /드라이버|45분|짚은 지점|지난 한마디/.test(
      document.querySelector('#stage>div').textContent),
    읽음: window.__READ,
    unread: S.unread,
  };
});
await p.screenshot({ path: '_ar_pc1.png' });

// ④ 사진을 누르면 크게 보기
await p.click('[data-pc-body] .cmn-img');
await p.waitForTimeout(350);
const big = await p.evaluate(() => ({ 열림: !!document.getElementById('shotbig') }));
await p.evaluate(() => { const g = document.getElementById('shotbig'); if (g) g.remove(); });

// ⑤ 레슨기록 › 받은 한마디 목록 — 예시가 아니라 받은 것 한 줄
await p.evaluate(() => jump('2i'));
await p.waitForTimeout(400);
const list = await p.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-cm-open]')];
  return {
    줄수: rows.length,
    첫줄: rows[0] ? rows[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null,
    예시남음: /그립 잡을 때 왼손 엄지|하체부터 시작하는 건/.test(document.body.innerText),
  };
});
await p.click('[data-cm-open]');
await p.waitForTimeout(500);
const reopen = await p.evaluate(() => ({ 화면: S.route,
  사진: document.querySelectorAll('[data-pc-body] .cmn-img').length }));

// ⑥ 쓰는 도중에 새 한마디가 오면 — 끊지 않고 아래쪽 알림으로
await p.evaluate(() => jump('2a'));
await p.waitForTimeout(300);
await p.evaluate(() => {
  window.__SW[0].comments.push({ id: 'cm-2', body: '오늘 것 잘 봤어요. 하체가 좋아졌습니다.',
    photos: [], created_at: new Date().toISOString(), read_at: null });
  return loadComments();
});
await p.waitForTimeout(700);
const live = await p.evaluate(() => {
  const t = document.getElementById('toastbox');
  return { 알림: t && t.classList.contains('show')
             ? t.textContent.replace(/\s+/g, ' ').trim() : null,
           팝업안뜸: !document.getElementById('cmnew'), unread: S.unread };
});
const btn = await p.$('#toastbox .toast-act');
if (btn) { await btn.click(); await p.waitForTimeout(500); }
const viaToast = await p.evaluate(() => ({ 화면: S.route, 읽음: window.__READ }));

console.log('① 안내 떠 있을 때', JSON.stringify(duringGate));
console.log('② 안내 걷힌 홈  ', JSON.stringify(home));
console.log('③ 줄 눌러 상세  ', JSON.stringify(detail));
console.log('④ 사진 크게     ', JSON.stringify(big));
console.log('⑤ 한마디 목록   ', JSON.stringify(list), '· 눌러 열기', JSON.stringify(reopen));
console.log('⑥ 쓰는 도중 도착', JSON.stringify(live), '· 알림으로 열기', JSON.stringify(viaToast));
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 5)));

await b.close(); srv.close();
