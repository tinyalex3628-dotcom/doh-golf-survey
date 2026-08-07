/* 회원 탈퇴 — 스토어 심사 필수 요건. 앱 안에서 계정을 정말로 지우는가.
   ① 「약관 · 결제 · 해지」에 탈퇴 입구가 있다 (구독 해지와 갈라져 있다)
   ② 무엇이 사라지는지 숫자로 적는다
   ③ 닉네임을 정확히 쳐야만 지워진다 — 「정말요?」 한 번은 아무도 안 읽는다
   ④ 창고 파일 → 계정 → 로그아웃 순서로 서버가 지워진다
   ⑤ 기기 보관함도 비운다 · 실패하면 아무것도 안 지우고 되돌린다 */
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
window.__CALLS = [];
window.__FAIL = false;
window.__SW = [
  { id: 'r1', view: '정면', path: 'u/1.mp4', size: 1e6, note: null, club: null,
    want_comment: false, seen_at: null, created_at: new Date().toISOString(),
    comments: [{ id: 'c1', body: '좋아요', photos: [], created_at: new Date().toISOString(),
      read_at: null }] },
  { id: 'r2', view: '측면', path: 'u/2.mp4', size: 1e6, note: null, club: null,
    want_comment: false, seen_at: null, created_at: new Date().toISOString(), comments: [] },
];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }), isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')), link: () => Promise.resolve(null),
  remove: () => Promise.resolve(), markRead: () => Promise.resolve(),
  want: () => Promise.resolve(), people: () => Promise.resolve({}),
  note: () => Promise.resolve(), setName: () => Promise.resolve('테스터'),
  saveOpen: () => Promise.resolve(), refresh: () => Promise.resolve(),
  wipe: () => {
    window.__CALLS.push('wipe');
    if (window.__FAIL) return Promise.reject(new Error('연결이 끊겼어요'));
    window.__SW = [];
    return Promise.resolve();
  },
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8891);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  try { sessionStorage.setItem('ns-open-seen', '1'); } catch (e) {}
});
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
// 지운 뒤 화면이 처음부터 다시 뜨는지는 페이지 이동 횟수로 본다
let navs = 0;
p.on('framenavigated', f => { if (f === p.mainFrame()) navs++; });

await p.goto('http://127.0.0.1:8891/');
await p.waitForTimeout(600);
if (await p.$('[data-bgate-next]')) {
  await p.click('[data-bgate-next]'); await p.click('[data-bgate-close]');
}
await p.waitForTimeout(900);
await p.evaluate(() => { const s = document.getElementById('cmnew'); if (s) s.remove(); jump('tm'); });
await p.waitForTimeout(500);

// ① 입구
const entry = await p.evaluate(() => {
  const q = document.querySelector('[data-tm-quit]');
  const cancel = document.querySelector('[data-tm-cancel]');
  return {
    탈퇴입구: q ? q.textContent.trim() : null,
    구독해지: cancel ? (getComputedStyle(cancel).display !== 'none') : null,
  };
});

// ② 무엇이 사라지는지
await p.click('[data-tm-quit]');
await p.waitForTimeout(400);
const sheet = await p.evaluate(() => {
  const s = document.getElementById('quit');
  if (!s) return { none: true };
  return {
    열림: true,
    글: s.textContent.replace(/\s+/g, ' ').trim().slice(0, 120),
    닉네임칸: !!s.querySelector('[data-q-name]'),
  };
});
await p.screenshot({ path: '/tmp/_quit.png' });

// ③ 닉네임이 틀리면 안 지워진다
await p.fill('[data-q-name]', '아무개');
await p.click('[data-q-go]');
await p.waitForTimeout(400);
const wrong = await p.evaluate(() => ({
  호출: window.__CALLS.slice(), 시트: !!document.getElementById('quit'),
  알림: (document.getElementById('toastbox') || {}).textContent,
}));

// ④ 서버가 실패하면 아무것도 안 지우고 되돌린다
await p.evaluate(() => { window.__FAIL = true; });
await p.fill('[data-q-name]', '테스터');
await p.click('[data-q-go]');
await p.waitForTimeout(600);
const failed = await p.evaluate(() => ({
  호출: window.__CALLS.length, 시트살아있음: !!document.getElementById('quit'),
  버튼: (document.querySelector('[data-q-go]') || {}).textContent,
  알림: (document.getElementById('toastbox') || {}).textContent,
  스윙남음: (window.__SWINGS || []).length,
}));

// ⑤ 제대로 지워진다
await p.evaluate(() => { window.__FAIL = false; });
await p.click('[data-q-go]');
await p.waitForTimeout(900);
const done = await p.evaluate(() => ({
  호출: window.__CALLS.slice(),
  시트닫힘: !document.getElementById('quit'),
  스윙: (window.__SWINGS || []).length,
  한마디: (window.__COMMENTS || []).length,
  닉: S.nick,
  저장소비움: (() => { try { return localStorage.length === 0; } catch (e) { return null; } })(),
}));
const before = navs;
await p.waitForTimeout(1400);          // 새로고침은 1.2초 뒤에 걸린다
const reloaded = navs - before;

console.log('① 입구      ', JSON.stringify(entry));
console.log('② 시트      ', JSON.stringify(sheet));
console.log('③ 닉네임 틀림', JSON.stringify(wrong));
console.log('④ 서버 실패  ', JSON.stringify(failed));
console.log('⑤ 지운 뒤    ', JSON.stringify(done), '· 화면 다시 뜸', reloaded > 0);
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 4)));

await b.close(); srv.close();
