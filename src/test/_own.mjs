/* 「내 것」이 정말 내 것인가, 그리고 못 보낸 요청은 안 깎이는가.

   두 가지가 같이 터졌다 —
   ① 프로가 회원 앱을 열면 남의 스윙과 남이 받은 한마디가 「내 것」으로
      들어왔다. mine() 이 조건 없이 긁고 접근 규칙(RLS)에 맡겼는데,
      프로에게는 그 규칙이 전부 열려 있기 때문이다. 그래서 회원에게
      답을 써주고 나면 자기 홈에 「프로 한마디 도착」이 떴다.
   ② 스윙을 한 편도 안 올린 사람이 「프로 한마디 요청하기」를 누르면
      화면은 「기다리는 중」이 되고 횟수는 깎이는데, 서버에 붙일 스윙이
      없어서 프로 도착함에는 아무것도 안 갔다. 시늉만 나고 차감만 됐다. */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const bad = [];
const ok = (cond, msg) => { if (!cond) bad.push(msg); };

/* ── ① sb.js 에게 직접 물어본다 ────────────────────────────────────
   가짜 서버를 물려서 mine() · all() 이 실제로 어떤 질문을 던지는지 본다.
   화면을 거치지 않으니 원인 자리를 정확히 짚는다. */
const SRC = fs.readFileSync(path.join(HERE, '..', 'sb.js'), 'utf8');
const asked = [];

function table(name) {
  const log = { table: name, eq: [] };
  const api = {
    select: () => api,
    eq: (col, val) => { log.eq.push(col + '=' + val); return api; },
    order: () => api,
    limit: () => api,
    update: () => api,
    maybeSingle: () => Promise.resolve({ data: { is_pro: true, nickname: '이도형' } }),
    then: (res, rej) => { asked.push(log); return Promise.resolve({ data: [], error: null }).then(res, rej); },
  };
  return api;
}
const fakeSupabase = {
  createClient: () => ({
    from: table,
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'u-pro', is_anonymous: false } } } }),
      signInAnonymously: () => Promise.resolve({ data: { user: { id: 'u-pro' } }, error: null }),
    },
    storage: { from: () => ({ remove: () => Promise.resolve() }) },
  }),
};
const fakeWindow = {};
const NS = new Function('supabase', 'window', SRC + '\nreturn NS;')(fakeSupabase, fakeWindow);

await NS.mine();
const mineQ = asked.filter(q => q.table === 'swings').pop();
asked.length = 0;
await NS.all();
const allQ = asked.filter(q => q.table === 'swings').pop();

const 내것 = { 표: mineQ && mineQ.table, 조건: mineQ ? mineQ.eq : null };
const 전부 = { 표: allQ && allQ.table, 조건: allQ ? allQ.eq : null };
console.log('① mine() 이 던진 질문 ', JSON.stringify(내것));
console.log('  all() 이 던진 질문  ', JSON.stringify(전부));
ok(mineQ && mineQ.eq.includes('owner=u-pro'), 'mine() 이 주인으로 안 걸렀다 — 프로가 남의 것을 본다');
ok(allQ && !allQ.eq.length, 'all() 은 프로가 전부 보는 자리다 — 조건이 붙으면 안 된다');

/* ── ② 스윙 0개에서 요청 누르기 ────────────────────────────────── */
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

const STUB = `
window.__SW = [];
window.__WANT = [];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')),
  link: () => Promise.resolve(null),
  remove: () => Promise.resolve(),
  markRead: () => Promise.resolve(),
  want: id => { window.__WANT.push(id); return Promise.resolve(); },
  people: () => Promise.resolve({}), note: () => Promise.resolve(),
  setName: () => Promise.resolve('테스터'),
  reviews: () => Promise.resolve([]), readReview: () => Promise.resolve(),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8843);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(() => { try { sessionStorage.setItem('ns-open-seen', '1'); } catch (e) {} });
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 180)));

await p.goto('http://127.0.0.1:8843/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]');
await p.click('[data-bgate-close]');
await p.waitForTimeout(900);

/* 연습기록(2b)으로 간다 — 「프로 한마디 요청하기」 버튼이 있는 자리다.
   올린 스윙은 하나도 없다. */
await p.evaluate(() => { window.__SWINGS = []; jump('2b'); });
await p.waitForTimeout(400);

const before = await p.evaluate(() => ({ used: S.cmUsed, cm: S.cm, wait: (window.__WAIT || []).length }));
const btn = await p.evaluate(() => {
  const e = [...document.querySelectorAll('#stage *')]
    .find(x => !x.children.length && /프로 한마디 요청하기/.test(x.textContent || ''));
  if (!e) return false;
  (e.closest('button,[role=button]') || e).click();
  return true;
});
await p.waitForTimeout(500);

const after = await p.evaluate(() => ({
  used: S.cmUsed, cm: S.cm, wait: (window.__WAIT || []).length,
  보낸것: (window.__WANT || []).length,
  화면: S.route,
  알림: (document.getElementById('toastbox') || {}).textContent || null,
}));
console.log('② 스윙 0개에서 요청 · 버튼찾음', btn);
console.log('   누르기 전', JSON.stringify(before));
console.log('   누른 뒤  ', JSON.stringify(after));
ok(btn, '「프로 한마디 요청하기」 버튼을 못 찾았다');
ok(after.used === before.used, '올린 스윙이 없는데 횟수가 깎였다');
ok(after.보낸것 === 0, '붙일 스윙이 없는데 서버로 요청이 갔다');
ok(after.cm !== 'wait', '보내지도 않고 「기다리는 중」이 됐다');
ok(after.화면 !== 'pc2', '보내지도 않고 대기 화면으로 넘어갔다');
ok(/스윙을 올려/.test(after.알림 || ''), '왜 안 되는지 안 알려줬다 · 알림: ' + after.알림);

/* ── ③ 한 편 올린 뒤에는 정상으로 간다 ────────────────────────── */
await p.evaluate(() => {
  window.__SWINGS = [{ id: 'l1', remoteId: 'rw-1', view: '정면', at: Date.now() }];
  S.cm = 'ask'; S.cmAt = 0; window.__WAIT = []; window.__WANT = [];
  jump('2b');
});
await p.waitForTimeout(400);
await p.evaluate(() => {
  const e = [...document.querySelectorAll('#stage *')]
    .find(x => !x.children.length && /프로 한마디 요청하기/.test(x.textContent || ''));
  if (e) (e.closest('button,[role=button]') || e).click();
});
await p.waitForTimeout(500);
const good = await p.evaluate(() => ({
  used: S.cmUsed, cm: S.cm, 화면: S.route, 보낸것: (window.__WANT || []).slice(),
}));
console.log('③ 한 편 올린 뒤', JSON.stringify(good));
ok(good.보낸것.length === 1 && good.보낸것[0] === 'rw-1', '올린 스윙에 요청이 안 붙었다');
ok(good.used === before.used + 1, '정상 요청인데 횟수가 안 깎였다');
ok(good.cm === 'wait' && good.화면 === 'pc2', '정상 요청인데 대기 화면으로 안 갔다');

console.log(errs.length ? 'JS 오류 ' + errs.join(' / ') : 'JS 오류 없음');
ok(!errs.length, 'JS 오류');

await b.close(); srv.close();
console.log(bad.length ? '실패:\n - ' + bad.join('\n - ') : '통과');
process.exit(bad.length ? 1 : 0);
