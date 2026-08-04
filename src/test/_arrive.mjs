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
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 180)));

await p.goto('http://127.0.0.1:8811/');
await p.waitForTimeout(700);

// ① 베타 안내가 떠 있는 동안에는 끼어들지 않아야 한다
const duringGate = await p.evaluate(() => ({
  gate: !!document.querySelector('#bgate:not([hidden])'),
  sheet: !!document.getElementById('cmnew'),
}));

// 안내 두 장을 넘긴다
await p.click('[data-bgate-next]');
await p.waitForTimeout(200);
await p.click('[data-bgate-close]');
await p.waitForTimeout(1800);

// ② 관문이 걷히면 시트가 스스로 올라온다
const sheet = await p.evaluate(() => {
  const s = document.getElementById('cmnew');
  if (!s) return { none: true };
  const imgs = [...s.querySelectorAll('.cmn-img')];
  return {
    on: s.classList.contains('on'),
    title: (s.querySelector('.cmn-t') || {}).textContent,
    body: (s.querySelector('.cmn-body') || {}).textContent,
    photos: imgs.length,
    imgOK: imgs.every(i => i.complete && i.naturalWidth > 0),
    top: Math.round(s.querySelector('.cmn-card').getBoundingClientRect().top),
    btnY: Math.round(s.querySelector('[data-cm-ok]').getBoundingClientRect().bottom),
    화면안: s.querySelector('[data-cm-ok]').getBoundingClientRect().bottom <= innerHeight + 1,
  };
});
await p.screenshot({ path: '_ar_sheet.png' });

// ③ 확인 → 서버에 읽음으로 적힌다
await p.click('[data-cm-ok]');
await p.waitForTimeout(600);
const afterOK = await p.evaluate(() => ({
  gone: !document.getElementById('cmnew'),
  read: window.__READ,
  unread: S.unread,
  cm: S.cm,
}));

// ④ 홈으로 — 도착 줄과 종 배지
await p.evaluate(() => jump('2a'));
await p.waitForTimeout(400);
const home = await p.evaluate(() => {
  const st = document.querySelector('[data-cm-bar]');
  const dot = document.querySelector('[data-bell-dot]');
  const tl = [...document.querySelectorAll('[data-cm-row]')];
  return {
    bar: st ? st.textContent.replace(/\s+/g, ' ').trim() : null,
    dot: dot ? dot.style.display : null,
    recent: tl.length, recentText: tl[0] ? tl[0].textContent.replace(/\s+/g, ' ').slice(0, 40) : null,
  };
});

// ⑤ 레슨기록 › 프로 한마디 목록 — 예시 세 줄이 아니라 받은 것 한 줄
await p.evaluate(() => jump('2i'));
await p.waitForTimeout(400);
const list = await p.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-cm-open]')];
  const body = document.body.innerText;
  return {
    rows: rows.length,
    first: rows[0] ? rows[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 46) : null,
    예시남음: /그립 잡을 때 왼손 엄지|하체부터 시작하는 건/.test(body),
    지난달: /6월에 받은 한마디/.test(body),
  };
});
// 줄을 누르면 그 한마디가 펼쳐진다
await p.click('[data-cm-open]');
await p.waitForTimeout(500);
const reopen = await p.evaluate(() => {
  const s = document.getElementById('cmnew');
  return { open: !!s, photos: s ? s.querySelectorAll('.cmn-img').length : 0 };
});
await p.click('[data-cm-ok]');
await p.waitForTimeout(300);

// ⑥ 쓰는 도중에 새 한마디가 오면 — 끊지 않고 아래쪽 알림으로
await p.evaluate(() => {
  window.__SW[0].comments.push({ id: 'cm-2', body: '오늘 것 잘 봤어요. 하체가 좋아졌습니다.',
    photos: [],
    created_at: new Date().toISOString(), read_at: null });
  return loadComments();
});
await p.waitForTimeout(700);
const live = await p.evaluate(() => {
  const t = document.getElementById('toastbox');
  return { toast: t && t.classList.contains('show') ? t.textContent.replace(/\s+/g, ' ').trim() : null,
           sheetAuto: !!document.getElementById('cmnew'), unread: S.unread };
});
await p.screenshot({ path: '_ar_toast.png' });
// 알림의 「바로 보기」를 누르면 열린다
const btn = await p.$('#toastbox .toast-act');
if (btn) { await btn.click(); await p.waitForTimeout(500); }
const viaToast = await p.evaluate(() => ({ open: !!document.getElementById('cmnew') }));

await p.evaluate(() => { const s = document.getElementById('cmnew'); if (s) s.remove(); jump('2a'); });
await p.waitForTimeout(400);
const homeNew = await p.evaluate(() => {
  const st = document.querySelector('[data-cm-bar]');
  const dot = document.querySelector('[data-bell-dot]');
  return { bar: st ? st.textContent.replace(/\s+/g, ' ').trim() : null,
           dot: dot ? dot.style.display + ':' + dot.textContent : null };
});
await p.screenshot({ path: '_ar_home.png' });
// 도착 줄을 누르면 바로 펼쳐진다
if (await p.$('[data-cm-bar]')) { await p.click('[data-cm-bar]'); await p.waitForTimeout(500); }
const viaStrip = await p.evaluate(() => ({ open: !!document.getElementById('cmnew') }));

console.log('① 안내 떠 있을 때 ', JSON.stringify(duringGate));
console.log('② 관문 걷힌 뒤 시트', JSON.stringify(sheet));
console.log('③ 확인 누른 뒤   ', JSON.stringify(afterOK));
console.log('④ 홈            ', JSON.stringify(home));
console.log('⑤ 한마디 목록    ', JSON.stringify(list), '· 다시 열기', JSON.stringify(reopen));
console.log('⑥ 쓰는 도중 도착 ', JSON.stringify(live), '· 알림으로 열기', JSON.stringify(viaToast));
console.log('⑦ 안 읽은 것 있는 홈', JSON.stringify(homeNew), '· 줄 눌러 열기', JSON.stringify(viaStrip));
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 5)));

await b.close(); srv.close();
