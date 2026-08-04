/* 홈 첫 화면이 Coaching 회원의 지금 상태를 보여주는가.
   전에는 몇 개를 올리든 「스윙 올리기」 카드가 계속 박혀 있었다.

   한 바퀴: 안 올림 → 올림 → 한마디 요청 → 도착 → 읽음 */
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
window.__WANT = [];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')),
  link: () => Promise.resolve(null),
  remove: () => Promise.resolve(),
  markRead: id => { window.__SW.forEach(s => (s.comments||[]).forEach(c => {
      if (c.id === id) c.read_at = new Date().toISOString(); })); return Promise.resolve(); },
  want: id => { window.__WANT.push(id);
    window.__SW.forEach(s => { if (s.id === id) s.want_comment = true; });
    return Promise.resolve(); },
  people: () => Promise.resolve({}), note: () => Promise.resolve(),
  setName: () => Promise.resolve('테스터'),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8831);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 180)));

await p.goto('http://127.0.0.1:8831/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]');
await p.click('[data-bgate-close]');
await p.waitForTimeout(900);

/* 홈 히어로를 읽는다 — 머리말 · 제목 · 버튼 · 프로 카드가 있는지 */
const hero = () => p.evaluate(() => {
  const h = document.querySelector('[data-h-hero]');
  if (!h) return { none: true };
  const line = s => (h.querySelector(s) || {}).textContent || null;
  const txt = h.textContent.replace(/\s+/g, ' ').trim();
  const stats = [...document.querySelectorAll('[data-h-stat]')]
    .map(e => e.textContent.replace(/\s+/g, ' ').trim());
  return {
    머리말: (h.firstElementChild || {}).textContent || null,
    제목: (h.children[1] || {}).textContent || null,
    버튼: line('[data-fresh-go]'),
    프로카드: /이도형 프로/.test(txt),
    통계: stats,
    남은횟수: (document.querySelector('[data-h-quota]') || {}).textContent
      ? document.querySelector('[data-h-quota]').textContent
          .replace(/\s+/g, ' ').match(/\d+회 남음/) : null,
  };
});
const day = n => new Date(Date.now() - n * 864e5).toISOString();

// ① 아직 한 개도 안 올림
const s1 = await hero();

// ② 스윙을 올렸다 — 오늘 2개. 「오늘 올렸어요 → 한마디 요청」이 돼야 한다
await p.evaluate(async () => {
  window.__SW = [
    { id: 'rw-1', view: '정면', path: 'a', size: 10, note: null, want_comment: false,
      created_at: new Date().toISOString(), comments: [] },
    { id: 'rw-2', view: '측면', path: 'b', size: 10, note: null, want_comment: false,
      created_at: new Date().toISOString(), comments: [] },
  ];
  await loadComments();
});
await p.waitForTimeout(400);
const s2 = await hero();

// ③ 한마디를 요청했다 — 서버에 표시가 가고 홈은 「보고 있어요」
await p.evaluate(() => jump('2b'));
await p.waitForTimeout(300);
const asked = await p.evaluate(() => {
  const btn = [...document.querySelectorAll('#stage *')].filter(e =>
    !e.childElementCount && e.textContent.trim() === '프로 한마디 요청하기').pop();
  if (!btn) return false;
  btn.click();
  return true;
});
await p.waitForTimeout(400);
const 요청함 = await p.evaluate(() => window.__WANT.slice());
await p.evaluate(() => jump('2a'));
await p.waitForTimeout(300);
const s3 = await hero();

// ④ 프로가 답했다 — 홈에 프로가 쓴 글이 그대로.
//    한마디 없이 앱을 연 사람이라, 이건 「쓰는 도중 도착」이다 —
//    시트가 화면을 끊으면 안 되고 아래쪽 알림으로 와야 한다.
await p.evaluate(async () => {
  window.__SW[0].comments = [{ id: 'cm-1',
    body: '톱에서 왼팔이 접히는 건 어깨 회전이 덜 돌아서예요.',
    photos: [], created_at: new Date().toISOString(), read_at: null }];
  await loadComments();
});
await p.waitForTimeout(1600);          // 시트가 올라올 시간(0.7초 주기)을 충분히 준다
const 도중 = await p.evaluate(() => {
  const t = document.getElementById('toastbox');
  return { 시트가끊음: !!document.getElementById('cmnew'),
           알림: t && t.classList.contains('show')
             ? t.textContent.replace(/\s+/g, ' ').trim() : null };
});
await p.evaluate(() => { const s = document.getElementById('cmnew'); if (s) s.remove(); jump('2a'); });
await p.waitForTimeout(300);
const s4 = await hero();
await p.screenshot({ path: '_hh_arrived.png' });

// ⑤ 읽었다 — 며칠 지난 기록. 「N일 지났어요」 + 진짜 연습일·연속
await p.evaluate(async () => {
  window.__SW[0].comments[0].read_at = new Date().toISOString();
  window.__SW[0].want_comment = false; window.__SW[1].want_comment = false;
  window.__SW[0].created_at = day2(2); window.__SW[1].created_at = day2(3);
  window.__SW.push({ id: 'rw-3', view: '정면', path: 'c', size: 10, note: null,
    want_comment: false, created_at: day2(4), comments: [] });
  await loadComments();
  function day2(n) { return new Date(Date.now() - n * 864e5).toISOString(); }
});
await p.waitForTimeout(400);
const s5 = await hero();
await p.screenshot({ path: '_hh_record.png' });

console.log('① 안 올렸을 때 ', JSON.stringify(s1));
console.log('② 오늘 2개 올림 ', JSON.stringify(s2));
console.log('③ 한마디 요청  ', JSON.stringify(s3), '· 버튼 찾음', asked,
            '· 서버로 간 요청', JSON.stringify(요청함));
console.log('④ 한마디 도착  ', JSON.stringify(s4), '· 쓰는 도중', JSON.stringify(도중));
console.log('⑤ 읽은 뒤·3일 전', JSON.stringify(s5));
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 5)));

await b.close(); srv.close();
