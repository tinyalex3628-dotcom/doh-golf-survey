/* 프로가 붙인 캡처 사진 — 글이 먼저 보이고, 스크롤 없이 한 화면에 들어오고,
   눌러야 크게 열린다. 전에는 사진이 폭을 다 써서 글이 위로 밀려났다. */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

/* 실제 캡처와 같은 세로 사진(9:16) 두 장 */
const shot = c => 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640">'
  + '<rect width="360" height="640" fill="' + c + '"/>'
  + '<line x1="60" y1="180" x2="300" y2="240" stroke="#E4573D" stroke-width="6"/></svg>'
).toString('base64');

const STUB = `
window.__SW = [{ id: 'rw-1', view: '정면', path: 'a', size: 10, note: null, want_comment: false,
  created_at: new Date(Date.now() - 9 * 36e5).toISOString(),
  comments: [{ id: 'cm-1', body: '이렇게 하시면됩니다',
    photos: ['${shot('#2C3A30')}', '${shot('#3A2C30')}'],
    created_at: new Date(Date.now() - 9 * 36e5).toISOString(), read_at: null }] }];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')), link: () => Promise.resolve(null),
  remove: () => Promise.resolve(), want: () => Promise.resolve(), note: () => Promise.resolve(),
  markRead: id => { window.__SW.forEach(s => s.comments.forEach(c => {
      if (c.id === id) c.read_at = new Date().toISOString(); })); return Promise.resolve(); },
  people: () => Promise.resolve({}), setName: () => Promise.resolve('테스터'),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8841);

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

await p.goto('http://127.0.0.1:8841/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]');
await p.click('[data-bgate-close]');
await p.waitForTimeout(1500);

// ① 상세(pc1) — 글이 먼저, 사진은 작은 썸네일, 스크롤 없이 글이 보인다
await p.click((await p.$('[data-cm-bar]')) ? '[data-cm-bar]' : '[data-fresh-go]');
await p.waitForTimeout(600);
const detail = await p.evaluate(() => {
  const bub = document.querySelector('[data-pc-body]');
  if (!bub) return { none: true };
  const body = [...bub.querySelectorAll('span')].find(e => /하시면됩니다/.test(e.textContent));
  const imgs = [...bub.querySelectorAll('.cmn-img')];
  const bb = body.getBoundingClientRect(), im = imgs[0].getBoundingClientRect();
  return {
    화면: S.route,
    글: body.textContent.trim(),
    글이사진위: bb.bottom <= im.top + 1,
    사진크기: Math.round(im.width) + '×' + Math.round(im.height),
    사진장수: imgs.length,
    사진나란히: Math.abs(imgs[0].getBoundingClientRect().top
                       - imgs[1].getBoundingClientRect().top) < 2,
  };
});
await p.screenshot({ path: '_st_pc1.png' });

// ② 썸네일을 누르면 전체화면 — 화면은 그대로 pc1
await p.click('[data-pc-body] .cmn-img[data-shot="1"]');
await p.waitForTimeout(350);
const big = await p.evaluate(() => {
  const g = document.getElementById('shotbig');
  if (!g) return { none: true };
  const im = g.querySelector('img').getBoundingClientRect();
  return { 열림: true, 화면그대로: S.route === 'pc1',
           쪽수: (g.querySelector('[data-sb-n]') || {}).textContent || null,
           화면대비: Math.round(im.height / innerHeight * 100) + '%' };
});
await p.screenshot({ path: '_st_big.png' });

// ③ 좌우로 넘긴다 · 닫는다
await p.evaluate(() => {
  const im = document.querySelector('#shotbig img');
  const r = im.getBoundingClientRect();
  im.dispatchEvent(new MouseEvent('click',
    { bubbles: true, clientX: r.left + r.width / 6, clientY: r.top + r.height / 2 }));
});
await p.waitForTimeout(200);
const flipped = await p.evaluate(() =>
  (document.querySelector('#shotbig [data-sb-n]') || {}).textContent || null);
await p.click('[data-sb-x]');
await p.waitForTimeout(250);
const closed = await p.evaluate(() => ({
  큰화면닫힘: !document.getElementById('shotbig'), 화면: S.route }));

// ④ 홈 한마디 카드 — 사진을 누르면 크게 보기가 뜬다
await p.evaluate(() => jump('2a'));
await p.waitForTimeout(500);
const home = await p.evaluate(() => {
  const row = document.querySelector('[data-cm-row]');
  if (!row) return { none: true };
  return {
    줄높이: Math.round(row.getBoundingClientRect().height),
    글: (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30),
  };
});
await p.screenshot({ path: '_st_home.png' });
const cell = await p.$('[data-cm-row] .cmn-img, [data-cm-row] .cm-wall img');
if (cell) { await cell.click(); await p.waitForTimeout(350); }
const fromHome = await p.evaluate(() => ({ 크게보기: !!document.getElementById('shotbig') }));

console.log('① 상세의 사진', JSON.stringify(detail));
console.log('② 크게 보기  ', JSON.stringify(big));
console.log('③ 넘김       ', flipped, '· 닫기', JSON.stringify(closed));
console.log('④ 홈 카드    ', JSON.stringify(home), '· 사진 누름', JSON.stringify(fromHome));
console.log('JS 오류', errs.length ? errs : '없음');

await b.close(); srv.close();
