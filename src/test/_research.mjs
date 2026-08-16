/* 수요조사 칸 — 베타의 목적(내용·양·빈도 답)이 CRM 한 자리에 쌓이는가.
   ① 한마디 2번 이상 + 아직 안 물어봄 → 「조사 때 됐음」 배지
      1번뿐이거나 이미 답이 있으면 안 뜬다
   ② 배지를 눌러도 도착함으로 안 넘어가고 시트가 뜬다
   ③ 답을 적고 저장 → 서버로 가고 배지가 「조사 ✓」로 바뀐다 · 창립 ★
   ④ 다시 열면 적은 답이 그대로 있다
   ⑤ 빈 답은 저장 안 된다
   ⑥ 저장 실패 → 적은 답을 실은 채 시트가 다시 열린다 (받아 적은 말을 안 날린다)
   ⑦ CSV 에 조사 칸이 실린다 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-admin.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

const STUB = `
const D = 864e5;
const ago = d => new Date(Date.now() - d * D).toISOString();
/* u-two   한마디 2번 → 조사 때 됐음
   u-one   한마디 1번 → 아직 아니다
   u-done  한마디 3번 + 답 있음 → 조사 ✓ */
const cm = (i, d) => ({ id: 'c' + i, body: '한마디', photos: [], created_at: ago(d) });
const SW = [
  { id: 's1', owner: 'u-two', view: '정면', created_at: ago(3), want_comment: false,
    seen_at: ago(3), comments: [cm(1, 3)] },
  { id: 's2', owner: 'u-two', view: '측면', created_at: ago(1), want_comment: false,
    seen_at: ago(1), comments: [cm(2, 1)] },
  { id: 's3', owner: 'u-one', view: '정면', created_at: ago(2), want_comment: false,
    seen_at: ago(2), comments: [cm(3, 2)] },
  { id: 's4', owner: 'u-done', view: '정면', created_at: ago(2), want_comment: false,
    seen_at: ago(2), comments: [cm(4, 2), cm(5, 2), cm(6, 2)] },
];
const PF = [
  { id: 'pro-1', nickname: '이도형', is_pro: true, created_at: ago(90) },
  { id: 'u-two', nickname: '김두번', is_pro: false, created_at: ago(30) },
  { id: 'u-one', nickname: '박한번', is_pro: false, created_at: ago(20) },
  { id: 'u-done', nickname: '최끝남', is_pro: false, created_at: ago(40),
    research: { asked_at: ago(5), content: '도움됨', amount: '지금 정도',
                freq: '월 5회 맞음', price: '3만원', founder: true } },
];
window.__SAVED = [];
window.__FAIL = false;
const NS = {
  ready: () => Promise.resolve({ id: 'pro-1' }), isPro: () => true,
  setResearch: (id, obj) => window.__FAIL
    ? Promise.reject(new Error('net'))
    : (window.__SAVED.push({ id, obj }), Promise.resolve()),
  setPlan: () => Promise.resolve(), refresh: () => Promise.resolve(true),
  all: () => Promise.resolve(JSON.parse(JSON.stringify(SW))),
  people: () => Promise.resolve(Object.fromEntries(PF.map(p => [p.id, p.nickname]))),
  profiles: () => Promise.resolve(JSON.parse(JSON.stringify(PF))),
  link: () => Promise.resolve(null), seen: () => Promise.resolve(),
  comment: () => Promise.resolve({}),
  down: () => false, named: () => true, nick: () => '이', who: () => ({ id: 'pro-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8893);

const bad = [];
const ok = (cond, msg) => { if (!cond) bad.push(msg); };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1400, height: 950 } });
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8893/');
await p.waitForTimeout(400);
await p.evaluate(() => { S.nav = 'members'; render(); });
await p.waitForTimeout(300);

/* ① 배지가 맞는 사람에게만 뜬다 */
const badges = await p.evaluate(() => {
  const out = {};
  for (const row of document.querySelectorAll('[data-crm-mem]')) {
    const nm = row.textContent.match(/[가-힣]{3}/)?.[0];
    const ask = row.querySelector('[data-crm-ask]');
    out[nm] = ask ? ask.textContent.replace(/\s+/g, ' ').trim() : null;
  }
  return out;
});
console.log('① 배지', JSON.stringify(badges));
ok(badges['김두번'] === '조사 때 됐음', '2번 받은 사람에게 「조사 때 됐음」이 없다');
ok(badges['박한번'] === null, '1번뿐인데 배지가 떴다');
ok(/조사 ✓/.test(badges['최끝남'] || '') && /★/.test(badges['최끝남'] || ''),
   '답 있는 사람이 「조사 ✓ ★」가 아니다: ' + badges['최끝남']);

/* ② 배지를 누르면 시트 — 도착함으로 안 넘어간다 */
await p.evaluate(() => {
  [...document.querySelectorAll('[data-crm-ask]')]
    .find(e => e.dataset.crmAsk === 'u-two').click();
});
await p.waitForTimeout(250);
const sheet = await p.evaluate(() => {
  const s = document.getElementById('asksurv');
  return { 시트: !!s, 화면그대로: S.nav === 'members',
           질문: s ? [...s.querySelectorAll('[data-sv]')].map(t => t.dataset.sv) : [],
           제목: s ? (s.querySelector('.as-t') || {}).textContent : null };
});
console.log('② 시트', JSON.stringify(sheet));
ok(sheet.시트 && sheet.화면그대로, '시트가 안 떴거나 화면이 넘어갔다');
ok(sheet.질문.join() === 'content,amount,freq,price', '질문 네 칸이 아니다: ' + sheet.질문);
ok(/김두번/.test(sheet.제목 || ''), '누구 조사인지 제목에 없다');

/* ③ 적고 저장 */
await p.evaluate(() => {
  const v = (k, t) => document.querySelector('#asksurv [data-sv="' + k + '"]').value = t;
  v('content', '방향이 잡혀서 좋았다'); v('amount', '지금 정도');
  v('freq', '월 5회면 충분'); v('price', '월 2~3만원');
  document.querySelector('#asksurv [data-sv-founder]').checked = true;
  document.querySelector('#asksurv [data-sv-save]').click();
});
await p.waitForTimeout(300);
const saved = await p.evaluate(() => ({
  보낸것: window.__SAVED.map(s => s.id),
  내용: window.__SAVED[0] && window.__SAVED[0].obj.content,
  창립: window.__SAVED[0] && window.__SAVED[0].obj.founder,
  시트닫힘: !document.getElementById('asksurv'),
  배지: (() => { const r = [...document.querySelectorAll('[data-crm-mem]')]
      .find(e => /김두번/.test(e.textContent));
    const a = r && r.querySelector('[data-crm-ask]');
    return a ? a.textContent.replace(/\s+/g, ' ').trim() : null; })(),
}));
console.log('③ 저장', JSON.stringify(saved));
ok(saved.보낸것.join() === 'u-two', '서버로 안 갔다');
ok(saved.내용 === '방향이 잡혀서 좋았다' && saved.창립 === true, '답이 다르게 갔다');
ok(saved.시트닫힘, '저장했는데 시트가 남아 있다');
ok(/조사 ✓/.test(saved.배지 || '') && /★/.test(saved.배지 || ''),
   '저장 뒤 배지가 「조사 ✓ ★」가 아니다: ' + saved.배지);

/* ④ 다시 열면 답이 그대로 */
await p.evaluate(() => {
  [...document.querySelectorAll('[data-crm-ask]')]
    .find(e => e.dataset.crmAsk === 'u-two').click();
});
await p.waitForTimeout(250);
const again = await p.evaluate(() => {
  const v = k => document.querySelector('#asksurv [data-sv="' + k + '"]').value;
  const out = { 내용: v('content'), 가격: v('price'),
                창립: document.querySelector('#asksurv [data-sv-founder]').checked };
  document.querySelector('#asksurv [data-sv-close]').click();
  return out;
});
console.log('④ 재열람', JSON.stringify(again));
ok(again.내용 === '방향이 잡혀서 좋았다' && again.창립 === true, '적은 답이 안 남았다');

/* ⑤ 빈 답은 저장 안 된다 */
await p.evaluate(() => {
  [...document.querySelectorAll('[data-crm-ask]')]
    .find(e => e.dataset.crmAsk === 'u-done').click();
});
await p.waitForTimeout(250);
const empty = await p.evaluate(() => {
  const s = document.getElementById('asksurv');
  s.querySelectorAll('[data-sv]').forEach(t => t.value = '');
  const n0 = window.__SAVED.length;
  s.querySelector('[data-sv-save]').click();
  return { 보낸수그대로: window.__SAVED.length === n0,
           시트남음: !!document.getElementById('asksurv'),
           알림: (document.getElementById('toast') || {}).textContent || null };
});
await p.evaluate(() => { const s = document.getElementById('asksurv'); if (s) s.remove(); });
console.log('⑤ 빈 답', JSON.stringify(empty));
ok(empty.보낸수그대로 && empty.시트남음, '빈 답이 저장됐다');

/* ⑥ 저장 실패 — 적은 답을 실은 채 다시 열린다 */
await p.evaluate(() => {
  window.__FAIL = true;
  [...document.querySelectorAll('[data-crm-ask]')]
    .find(e => e.dataset.crmAsk === 'u-two').click();
});
await p.waitForTimeout(250);
await p.evaluate(() => {
  document.querySelector('#asksurv [data-sv="content"]').value = '실패해도 남아야 하는 답';
  document.querySelector('#asksurv [data-sv-save]').click();
});
await p.waitForTimeout(400);
const failed = await p.evaluate(() => {
  const s = document.getElementById('asksurv');
  return { 다시열림: !!s,
           답그대로: s ? s.querySelector('[data-sv="content"]').value : null,
           알림: (document.getElementById('toast') || {}).textContent || null };
});
console.log('⑥ 실패', JSON.stringify(failed));
ok(failed.다시열림 && failed.답그대로 === '실패해도 남아야 하는 답',
   '실패했는데 적은 답이 날아갔다');
ok(/저장 못/.test(failed.알림 || ''), '실패를 안 알렸다');
await p.evaluate(() => { window.__FAIL = false;
  const s = document.getElementById('asksurv'); if (s) s.remove(); });

/* ⑦ CSV */
const csv = await p.evaluate(() => {
  let got = null;
  const orig = document.createElement.bind(document);
  document.createElement = tag => {
    const el = orig(tag);
    if (tag === 'a') el.click = () => {
      got = { href: el.href };
    };
    return el;
  };
  return fetch((() => { crmCSV(); document.createElement = orig; return got.href; })())
    .then(r => r.text());
});
const line = csv.split('\r\n').find(l => l.includes('최끝남')) || '';
console.log('⑦ CSV 머리', csv.split('\r\n')[0].slice(0, 120));
console.log('   최끝남 줄', line.slice(0, 120));
ok(/조사-내용/.test(csv), 'CSV 에 조사 칸이 없다');
ok(/했음/.test(line) && /★/.test(line) && /도움됨/.test(line), 'CSV 에 답이 안 실렸다');

console.log(errs.length ? 'JS 오류 ' + errs.join(' / ') : 'JS 오류 없음');
ok(!errs.length, 'JS 오류');

await b.close(); srv.close();
console.log(bad.length ? '실패:\n - ' + bad.join('\n - ') : '통과');
process.exit(bad.length ? 1 : 0);
