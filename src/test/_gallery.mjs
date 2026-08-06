/* 스윙 갤러리 — 날짜로 묶이고, 필터 칩으로 갈리고, 상태가 색으로 읽히는가.
   그리고 올릴 때 고른 클럽이 그 줄을 따라 끝까지 가는가. */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');

const D = 864e5;
const iso = n => new Date(Date.now() - n * D).toISOString();
const STUB = `
window.__PUSHED = [];
window.__SW = [
  { id:'s1', view:'정면', club:'드라이버', path:'a', size:10, note:null, want_comment:false,
    created_at:'${iso(0)}', comments:[{ id:'c1', body:'좋아요', photos:[],
      created_at:'${iso(0)}', read_at:'${iso(0)}' }] },
  { id:'s2', view:'측면', club:'드라이버', path:'b', size:10, note:null, want_comment:true,
    created_at:'${iso(0)}', comments:[] },
  { id:'s3', view:'정면', club:'아이언', path:'c', size:10, note:null, want_comment:false,
    created_at:'${iso(2)}', comments:[] },
];
const NS = {
  ready:()=>Promise.resolve({id:'u-1',is_anonymous:false}), isPro:()=>false,
  mine:()=>Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push:(f,v,n,cb,club)=>{ window.__PUSHED.push({view:v,club:club});
    return Promise.resolve({id:'new-'+window.__PUSHED.length,path:'p'}); },
  link:()=>Promise.resolve(null), remove:()=>Promise.resolve(),
  want:()=>Promise.resolve(), note:()=>Promise.resolve(), markRead:()=>Promise.resolve(),
  people:()=>Promise.resolve({}), setName:()=>Promise.resolve('t'),
  saveOpen:()=>Promise.resolve(), refresh:()=>Promise.resolve(false),
  down:()=>false, named:()=>true, nick:()=>'테스터', who:()=>({id:'u-1'}),
};
window.NS = NS;`;
const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8901);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(() => { try { sessionStorage.setItem('ns-open-seen','1'); } catch (e) {} });
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 180)));

await p.goto('http://127.0.0.1:8901/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]');
await p.click('[data-bgate-close]');
await p.waitForTimeout(1100);
await p.evaluate(() => jump('09'));
await p.waitForTimeout(500);

const read = () => p.evaluate(() => {
  const chips = [...document.querySelectorAll('[data-galchip]')];
  const heads = [...document.querySelectorAll('[data-galbody] > div')]
    .filter(e => !e.hasAttribute('data-swgrid'))
    .map(e => e.textContent.replace(/\s+/g, ' ').trim());
  const cells = [...document.querySelectorAll('[data-galcell]')];
  return {
    칩: chips.map(c => c.textContent.trim()),
    고른칩: (chips.find(c => /var\(--ns-green\)/.test(
      c.getAttribute('style').split('background:')[1] || '')) || {}).textContent,
    날짜머리: heads,
    칸수: cells.length,
    칸: cells.map(c => c.textContent.replace(/\s+/g, ' ').trim()),
    빈말: /이 조건에 맞는/.test(document.body.innerText),
  };
});
const 전체 = await read();
await p.screenshot({ path: '_gal.png' });
if (!전체.칩.length) { console.log('갤러리가 안 붙었다', JSON.stringify(전체));
  console.log('본문', await p.evaluate(() => document.querySelector('#stage>div').innerText.slice(0,300)));
  await b.close(); srv.close(); process.exit(0); }

// 칩으로 거른다
await p.click('[data-galchip="아이언"]');
await p.waitForTimeout(350);
const 아이언 = await read();
await p.click('[data-galchip="한마디 받음"]');
await p.waitForTimeout(350);
const 한마디 = await read();
await p.click('[data-galchip="전체"]');
await p.waitForTimeout(300);

/* 올릴 때 클럽을 고르면 그대로 서버까지 간다 */
await p.evaluate(() => jump('2c'));
await p.waitForTimeout(400);
/* 오늘 몫(두 개)이 이미 차 있으면 시트가 안 뜬다 — 자리를 비운다 */
await p.evaluate(async () => {
  const D = 864e5;
  window.__SW.forEach(s => { s.created_at = new Date(Date.now() - 3 * D).toISOString(); });
  await loadComments();
});
await p.waitForTimeout(300);
/* 파일 창은 사람만 열 수 있다 — 고른 뒤에 도는 자리(upTake)를 바로 부른다 */
await p.evaluate(() => {
  const f = new File([new Blob([new Uint8Array(1000)])], 'a.mp4', { type: 'video/mp4' });
  upTake([f]);
});
await p.waitForTimeout(400);
const 시트 = await p.evaluate(() => {
  const s = document.querySelector('[data-club-sheet]');
  return s ? [...s.querySelectorAll('[data-pick]')].map(e => e.textContent.trim()) : null;
});
await p.click('[data-pick="웨지"]');
await p.click('[data-pick="측면"]');
await p.click('[data-club-go]');
await p.waitForTimeout(900);
const 보낸것 = await p.evaluate(() => window.__PUSHED.slice());

console.log('① 전체        ', JSON.stringify(전체));
console.log('② 아이언 칩    ', JSON.stringify({ 칸수: 아이언.칸수, 칸: 아이언.칸, 고른칩: 아이언.고른칩 }));
console.log('③ 한마디 받음  ', JSON.stringify({ 칸수: 한마디.칸수, 칸: 한마디.칸 }));
console.log('④ 올릴 때 물음 ', JSON.stringify(시트));
console.log('   서버로 간 것 ', JSON.stringify(보낸것));
console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 5)));

await b.close(); srv.close();
