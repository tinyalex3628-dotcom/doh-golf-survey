/* 폰을 바꾸면 보관함(IndexedDB)이 비어 있다 — 그래도 갤러리는 서버에서
   읽어 와야 한다. 새 브라우저 문맥이 곧 새 폰이다.

   서버 A(8821) — 회원 앱 (sb.js 를 가짜 NS 로 갈아 끼움)
   서버 B(8822) — 영상, CORS 허용 (Supabase Storage 와 같은 조건) */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);   // src/test
const VIDEO = fs.readFileSync(path.join(HERE, '_swtest.webm'));
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');

const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

/* 서버에는 스윙이 두 편 있다 — 둘 다 이 기기에서 올린 것이 아니다 */
const STUB = `
window.__RM = [];
window.__SW = [
  { id: 'rw-1', view: '정면', path: 'v.webm', size: 3000000, note: null,
    created_at: new Date(Date.now() - 86400e3).toISOString(), comments: [] },
  { id: 'rw-2', view: '측면', path: 'v.webm', size: 2500000, note: null,
    created_at: new Date(Date.now() - 172800e3).toISOString(), comments: [] },
];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(
    window.__SW.filter(s => !window.__RM.includes(s.id))))),
  push: () => Promise.reject(new Error('no')),
  link: p => Promise.resolve('http://127.0.0.1:8822/' + p),
  remove: (id, p) => { window.__RM.push(id); return Promise.resolve(); },
  markRead: () => Promise.resolve(), people: () => Promise.resolve({}),
  note: () => Promise.resolve(), want: () => Promise.resolve(),
  setName: () => Promise.resolve('테스터'),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8821);
const vsrv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'video/webm', 'content-length': VIDEO.length,
                     'accept-ranges': 'bytes', 'access-control-allow-origin': '*' });
  r.end(VIDEO);
}).listen(8822);

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

await p.goto('http://127.0.0.1:8821/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]');
await p.click('[data-bgate-close]');
await p.waitForTimeout(1200);

// ① 보관함이 비어 있어도 갤러리에 서버 스윙 두 편이 나온다
await p.evaluate(() => jump('ge'));
await p.waitForTimeout(400);
const gallery = await p.evaluate(() => {
  const cells = [...document.querySelectorAll('[data-swgrid]>span')];
  return {
    개수: cells.length,
    거울: window.__SWINGS.map(r => r.id + '/' + r.view + '/' + (r.sent ? '전달됨' : '?')),
    표시: cells.map(c => c.textContent.replace(/\s+/g, ' ').trim()),
    빈상태남음: /아직 올린 스윙이 없어요/.test(document.body.innerText),
    올린수: S.mine.vids,
  };
});

// ② 썸네일 — 서명 링크에서 한 프레임을 뽑아 채운다
await p.waitForTimeout(2500);
const poster = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('[data-swgrid] img')];
  return { 장수: imgs.length, 실림: imgs.every(i => i.complete && i.naturalWidth > 0) };
});
await p.screenshot({ path: '_gr_gallery.png' });

// ③ 셀을 누르면 서명 링크로 재생된다 (이 기기에 파일이 없다)
await p.click('[data-swgrid]>span');
await p.waitForTimeout(700);
const play = await p.evaluate(() => {
  const v = document.querySelector('#swplay video');
  return { 열림: !!v, 서명링크: v ? v.currentSrc.startsWith('http://127.0.0.1:8822/') : false };
});

// ④ 지우기 — 서버에서도 지워지고 갤러리에서 되살아나지 않는다
await p.click('#swplay [data-del]');
await p.waitForTimeout(300);
await p.click('[data-sheet-ok]');
await p.waitForTimeout(600);
const afterDel = await p.evaluate(() => ({
  서버삭제: window.__RM,
  개수: document.querySelectorAll('[data-swgrid]>span').length,
  올린수: S.mine.vids,
}));

// ⑤ 이 기기에서 올린 것과 서버 것이 같은 스윙이면 — 한 번만 나온다 (기기 것이 이긴다)
const dedupe = await p.evaluate(async () => {
  const f = new File([new Blob([new Uint8Array(1000)])], 'a.mp4', { type: 'video/mp4' });
  const m = await VAULT.add(f, '측면');
  await VAULT.mark(m.id, { sent: true, remoteId: 'rw-2', path: 'v.webm' });
  const all = await window.__vaultSync();
  return {
    개수: all.length,
    이긴쪽: (all.find(r => r.remoteId === 'rw-2') || {}).id,
  };
});

// ⑥ 서버가 잠깐 빈 목록을 줘도(연결 끊김) 알던 것을 지우지 않는다
const blip = await p.evaluate(async () => {
  const keep = window.__SW; window.__SW = [];
  await loadComments();
  window.__SW = keep;
  return { 개수: window.__SWINGS.length };
});

console.log('① 새 폰의 갤러리   ', JSON.stringify(gallery));
console.log('② 썸네일          ', JSON.stringify(poster));
console.log('③ 재생            ', JSON.stringify(play));
console.log('④ 지운 뒤         ', JSON.stringify(afterDel));
console.log('⑤ 기기+서버 같은 스윙', JSON.stringify(dedupe));
console.log('⑥ 서버가 빈 목록을 줄 때', JSON.stringify(blip));
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 5)));

await b.close(); srv.close(); vsrv.close();
