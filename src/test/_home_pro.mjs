/* 홈이 「프로가 나를 보고 있다」를 말하는가.
   이 앱이 파는 건 이도형 프로가 봐준다는 것 하나다. 홈에서 그게 안 보이면
   영상 올려두는 앱과 구별이 안 된다.

   보는 것 — 횟수 카드의 프로 상태 줄 · 「새 프로 한마디」머리말 ·
             안 읽은 것의 NEW 배지 · 바로가기 「구독」 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

const STUB = `
window.__SW = [];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')),
  link: () => Promise.resolve(null), remove: () => Promise.resolve(),
  markRead: id => { window.__SW.forEach(s => (s.comments||[]).forEach(c => {
      if (c.id === id) c.read_at = new Date().toISOString(); })); return Promise.resolve(); },
  want: () => Promise.resolve(), people: () => Promise.resolve({}),
  note: () => Promise.resolve(), setName: () => Promise.resolve('테스터'),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8841);

const ago = h => new Date(Date.now() - h * 36e5).toISOString();
const sw = (id, o) => Object.assign({
  id, view: '정면', path: 'p/' + id, size: 1e6, note: null,
  want_comment: false, created_at: ago(30), comments: [],
}, o);

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
await p.waitForTimeout(900);

const look = () => p.evaluate(() => {
  const q = document.querySelector('[data-h-quota]');
  const pro = q && q.querySelector('[data-h-pro]');
  // 「최근 프로 한마디」자리. 횟수 카드의 「이번 달 프로 한마디」와 헷갈리지 않게 정확히 본다
  const head = [...document.querySelectorAll('span,div')]
    .filter(e => !e.childElementCount
      && /^(최근|새|받은) 프로 한마디$|^프로 한마디$/.test(e.textContent.trim())
      && !/이번 달/.test((e.parentElement || {}).textContent || ''))
    .map(e => e.textContent.trim());
  const rows = [...document.querySelectorAll('[data-cm-row]')];
  const hero = document.querySelector('[data-h-hero]');
  return {
    프로줄: pro ? pro.textContent.replace(/\s+/g, ' ').trim() : null,
    머리말: head,
    옆숫자: (() => {
      const h = [...document.querySelectorAll('span,div')]
        .find(e => !e.childElementCount && /^(새|받은) 프로 한마디$/.test(e.textContent.trim()));
      const n = h && h.nextElementSibling;
      return n ? n.textContent.trim() : null;
    })(),
    NEW: rows.filter(r => r.textContent.includes('NEW')).length,
    시간표시: rows.filter(r => /시간 전|일 전|방금/.test(r.textContent)).length,
    히어로: hero ? hero.textContent.replace(/\s+/g, ' ').trim().slice(0, 46) : null,
    구독타일: !!document.evaluate(
      "//span[normalize-space(text())='구독']", document, null, 9, null).singleNodeValue,
    구독안내남음: document.body.innerText.includes('구독 안내'),
  };
});

const set = async (list) => {
  await p.evaluate(l => { window.__SW = l; return loadComments(); }, list);
  await p.evaluate(() => window.__vaultSync && window.__vaultSync());
  await p.waitForTimeout(500);
  await p.evaluate(() => { const s = document.getElementById('cmnew'); if (s) s.remove(); jump('2a'); });
  await p.waitForTimeout(350);
};

// ① 아직 아무것도 안 올렸다
const a = await look();

// ② 올려두고 답을 기다리는 중 — 히어로가 그 말을 하니 프로줄은 다른 말을 해야 한다
await set([sw('s1', { want_comment: true }), sw('s2', { want_comment: true })]);
const c = await look();

// ③ 한마디가 왔고 아직 안 읽었다
await set([
  sw('s1', { comments: [{ id: 'c1', body: '어깨 회전이 덜 돌아서예요.',
    photos: [], created_at: ago(14), read_at: null }] }),
  sw('s2', {}),
]);
const d = await look();
await p.screenshot({ path: '/tmp/_pro_new.png' });

// ④ 읽고 난 뒤
await p.evaluate(() => NS.markRead('c1'));
await set([
  sw('s1', { comments: [{ id: 'c1', body: '어깨 회전이 덜 돌아서예요.',
    photos: [], created_at: ago(14), read_at: ago(1) }] }),
  sw('s2', {}),
]);
const e = await look();
await p.screenshot({ path: '/tmp/_pro_idle.png' });

console.log('① 아무것도 없을 때', JSON.stringify(a, null, 0));
console.log('② 답 기다리는 중  ', JSON.stringify(c, null, 0));
console.log('③ 안 읽은 한마디  ', JSON.stringify(d, null, 0));
console.log('④ 읽은 뒤        ', JSON.stringify(e, null, 0));
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 4)));

await b.close(); srv.close();
