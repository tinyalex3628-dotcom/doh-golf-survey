/* 회원 명부 — 서버 데이터에서 상태가 자동으로 갈리는가.
   ① 다섯 상태가 업로드 날짜만으로 정확히 갈린다
   ② 가입만 하고 안 올린 사람(새싹)이 명부에서 안 빠진다
   ③ 「먼저 연락할 사람」이 스스로 맨 위에 오른다
   ④ 상태 칩으로 걸러진다 · 회원을 누르면 그 사람 스윙으로 간다 */
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
/* 회원 여섯 —
   u-live  2일 전 올림                        → 활성
   u-quiet 12일 전이 마지막                   → 침묵
   u-sleep 40일 전이 마지막                   → 휴면
   u-back  어제 올렸는데 그 전은 25일 전      → 복귀
   u-seed  가입만 하고 한 개도 안 올림(5일째) → 새싹 · 연락 대상
   u-new   오늘 가입, 아직 안 올림            → 새싹 · 하루는 기다린다 */
const SW = [
  { id: 's1', owner: 'u-live',  view: '정면', created_at: ago(2),  want_comment: true,
    seen_at: null, comments: [] },
  { id: 's2', owner: 'u-live',  view: '측면', created_at: ago(9),  want_comment: false,
    seen_at: ago(9), comments: [{ id: 'c1', body: '좋아요', photos: [], created_at: ago(8) }] },
  { id: 's3', owner: 'u-quiet', view: '정면', created_at: ago(12), want_comment: false,
    seen_at: ago(12), comments: [] },
  { id: 's4', owner: 'u-sleep', view: '정면', created_at: ago(40), want_comment: false,
    seen_at: ago(40), comments: [] },
  { id: 's5', owner: 'u-back',  view: '정면', created_at: ago(1),  want_comment: true,
    seen_at: null, comments: [] },
  { id: 's6', owner: 'u-back',  view: '정면', created_at: ago(26), want_comment: false,
    seen_at: ago(26), comments: [] },
];
const PF = [
  { id: 'pro-1',  nickname: '이도형', real_name: null, is_pro: true,  created_at: ago(90) },
  { id: 'u-live', nickname: '김활성', real_name: '김활', is_pro: false, created_at: ago(60) },
  { id: 'u-quiet',nickname: '박침묵', real_name: null,  is_pro: false, created_at: ago(50) },
  { id: 'u-sleep',nickname: '최휴면', real_name: null,  is_pro: false, created_at: ago(80) },
  { id: 'u-back', nickname: '정복귀', real_name: null,  is_pro: false, created_at: ago(70) },
  { id: 'u-seed', nickname: '한새싹', real_name: null,  is_pro: false, created_at: ago(5) },
  { id: 'u-new',  nickname: '오늘온', real_name: null,  is_pro: false, created_at: ago(0) },
];
const NS = {
  ready: () => Promise.resolve({ id: 'pro-1' }), isPro: () => true,
  refresh: () => Promise.resolve(true),
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
}).listen(8871);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1400, height: 950 } });
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8871/');
await p.waitForTimeout(400);
await p.evaluate(() => { S.nav = 'members'; render(); });
await p.waitForTimeout(900);

// ① 상태 계산
const states = await p.evaluate(() =>
  Object.fromEntries(crmRoster().map(m => [m.name, m.state])));

// ② 명부에 다 있는가 (프로는 빠져야 한다)
const roster = await p.evaluate(() => ({
  총: crmRoster().length,
  프로포함: crmRoster().some(m => m.name === '이도형'),
  순서: crmRoster().map(m => m.name),
}));

// ③ 연락할 사람
const call = await p.evaluate(() => {
  // 상자는 「먼저 연락할 사람」 제목을 직접 품은 span 의 조부모다
  const t = [...document.querySelectorAll('span')]
    .find(e => !e.childElementCount && e.textContent.trim() === '먼저 연락할 사람');
  const box = t && t.parentElement && t.parentElement.parentElement;
  return {
    수: crmRoster().filter(m => m.call).length,
    이름: crmRoster().filter(m => m.call).map(m => m.name),
    상자보임: !!box,
    상자행수: box ? box.querySelectorAll('[data-crm-mem]').length : 0,
    사이드바배지: crmCallN(),
  };
});

// ④ 화면에 상태 배지가 붙었는가
const badges = await p.evaluate(() => {
  const t = document.body.innerText;
  return { 새싹: (t.match(/새싹/g) || []).length, 활성: (t.match(/활성/g) || []).length,
           침묵: (t.match(/침묵/g) || []).length, 휴면: (t.match(/휴면/g) || []).length,
           복귀: (t.match(/복귀/g) || []).length,
           안봄: /안 봄/.test(t), 답기다림: /답 기다림/.test(t) };
});
await p.screenshot({ path: '/tmp/_crm.png' });

// ⑤ 칩으로 거르기
await p.click('[data-mstate="quiet"]');
await p.waitForTimeout(350);
const filtered = await p.evaluate(() => {
  // 목록만 센다 — 「먼저 연락할 사람」 상자에도 같은 손잡이가 붙어 있다
  const rows = [...document.querySelectorAll('[data-crm-mem]')]
    .filter(e => !e.closest('[data-crm-callbox]'));
  return { 칩: S.mstate, 목록행수: rows.length,
           이름: rows.map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 3)) };
});

// ⑥ 회원을 누르면 그 사람 스윙으로
await p.click('[data-mstate="전체"]');
await p.waitForTimeout(300);
await p.evaluate(() => {
  document.querySelector('[data-crm-mem="u-quiet"]').click();
});
await p.waitForTimeout(600);
const jumped = await p.evaluate(() => ({ nav: S.nav, sel: IN.sel }));

// ⑦ 대시보드에도 「먼저 연락할 사람」이 뜨는가 · 모바일도 도는가
await p.evaluate(() => { S.nav = 'home'; render(); });
await p.waitForTimeout(400);
const dash = await p.evaluate(() => ({
  상자: !!document.querySelector('[data-crm-callbox]'),
  행수: document.querySelectorAll('[data-crm-callbox] [data-crm-mem]').length,
}));
await p.evaluate(() => { S.view = 'mo'; S.nav = 'members'; render(); });
await p.waitForTimeout(500);
const mo = await p.evaluate(() => ({
  회원행: document.querySelectorAll('[data-crm-mem]').length,
  상자: !!document.querySelector('[data-crm-callbox]'),
  가로밀림: document.querySelector('.mobox')
    ? document.querySelector('.mobox').scrollWidth > document.querySelector('.mobox').clientWidth + 1
    : null,
}));
await p.screenshot({ path: '/tmp/_crm_mo.png' });

console.log('① 상태  ', JSON.stringify(states));
console.log('② 명부  ', JSON.stringify(roster));
console.log('③ 연락  ', JSON.stringify(call));
console.log('④ 배지  ', JSON.stringify(badges));
console.log('⑤ 거르기', JSON.stringify(filtered));
console.log('⑥ 눌러서 이동', JSON.stringify(jumped));
console.log('⑦ 대시보드', JSON.stringify(dash), '· 모바일', JSON.stringify(mo));
console.log('JS 오류', errs.length ? errs : '없음');

await b.close(); srv.close();
