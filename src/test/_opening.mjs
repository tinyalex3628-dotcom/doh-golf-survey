/* 여는 화면 · 오늘의 한 장 —
   머리는 고정이고 가운데 한 장만 바뀐다. 「얼마 만에 왔나」가 갈래를 정한다.
   설계 원본은 design/opening-screen.html */
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

/* 서버를 흉내 낸다. __SETUP 으로 회원 상태를 갈아 끼운다. */
const STUB = `
window.__SAVED = [];
window.__SW = window.__SW || [];   // addInitScript 가 미리 심어둔 것을 지우지 않는다
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')), link: () => Promise.resolve(null),
  remove: () => Promise.resolve(), want: () => Promise.resolve(), note: () => Promise.resolve(),
  markRead: () => Promise.resolve(), people: () => Promise.resolve({}),
  setName: () => Promise.resolve('t'),
  saveOpen: m => { window.__SAVED.push(m); return Promise.resolve(); },
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8871);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errs = [];

/* 한 회원의 하루를 연다. setup 으로 서버 상태와 기억을 심는다. */
async function openAs(label, setup) {
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(label + ': ' + String(e).slice(0, 140)));
  await p.addInitScript(setup);
  await p.goto('http://127.0.0.1:8871/');
  // 여는 화면은 최대 1.2초 기다렸다 뜨고 2.2초 뒤 스스로 닫힌다
  await p.waitForTimeout(1500);
  const shot = await p.evaluate(() => {
    const o = document.getElementById('openscr');
    if (!o) return { none: true };
    const t = o.querySelector('.o-ttl');
    return {
      슬로건: (o.querySelector('.o-slo') || {}).textContent,
      마크: (o.querySelector('.o-mk') || {}).textContent,
      제목: t ? t.textContent : null,
      큰제목: t ? t.classList.contains('bigT') : false,
      부제: (o.querySelector('.o-sub') || {}).textContent || null,
      그림: !!o.querySelector('.o-art'),
      카드: (window.__OPENPICK || {}).card,
      갈래: (window.__OPENPICK || {}).grp,
      문맥: (window.__OPENPICK || {}).ctx,
      왜: (window.__OPENPICK || {}).from,
      적어둔것: (window.__SAVED[0] || {}),
    };
  });
  return { p, ctx, shot };
}

const 기본 = `
window.__BORN = Date.now() - 40 * ${D};
window.__OPENMEM = null;`;

/* ① 처음 온 사람 — 환영. 그림 없이 한 줄만 */
{
  const { p, ctx, shot } = await openAs('처음', `
    window.__BORN = Date.now() - 2 * ${D};
    window.__SW = [];`);
  console.log('① 가입 2일 · 스윙 0개  ', JSON.stringify(shot));
  await ctx.close();
}

/* ② 한마디가 왔다 — 「오늘만」 카드라 문맥을 건너뛰고 이긴다 */
{
  const { ctx, shot } = await openAs('한마디', `
    ${기본}
    window.__SW = [{ id: 'rw-1', view: '정면', path: 'a', size: 10, note: null,
      want_comment: false, created_at: '${iso(1)}',
      comments: [{ id: 'c1', body: '톱에서 왼팔이 접히는 건 어깨 회전이 덜 돌아서예요',
        photos: [], created_at: '${iso(0)}', read_at: null }] }];`);
  console.log('② 안 읽은 한마디       ', JSON.stringify(shot));
  await ctx.close();
}

/* ③ 스무 날 만에 온 사람 — 숫자로 혼내지 않는다. comeback 이 맨 앞 */
{
  const { ctx, shot } = await openAs('복귀', `
    window.__BORN = Date.now() - 120 * ${D};
    window.__OPENMEM = { last: Date.now() - 20 * ${D}, seen: [], seenG: [] };
    window.__SW = [{ id: 'rw-9', view: '정면', path: 'a', size: 10, note: null,
      want_comment: false, created_at: '${iso(21)}', comments: [] }];`);
  console.log('③ 20일 만에            ', JSON.stringify(shot));
  await ctx.close();
}

/* ④ 오늘 또 열었다 — 방해하지 않는다. goal → coach → cheer */
{
  const { ctx, shot } = await openAs('오늘또', `
    ${기본}
    window.__OPENMEM = { last: Date.now(), seen: [], seenG: [] };
    window.__SW = [{ id: 'rw-2', view: '정면', path: 'a', size: 10, note: null,
      want_comment: false, created_at: '${iso(0)}', comments: [] }];`);
  console.log('④ 오늘 또 열었다        ', JSON.stringify(shot));
  await ctx.close();
}

/* ⑤ 같은 갈래를 연달아 안 보여준다 — 어제 goal 을 봤으면 오늘은 다른 갈래 */
{
  const { ctx, shot } = await openAs('갈래돌기', `
    ${기본}
    window.__OPENMEM = { last: Date.now() - 2 * ${D}, seen: ['quota'], seenG: ['goal'] };
    window.__SW = [{ id: 'rw-3', view: '정면', path: 'a', size: 10, note: null,
      want_comment: false, created_at: '${iso(2)}',
      comments: [{ id: 'c9', body: '좋아졌어요', photos: [],
        created_at: '${iso(2)}', read_at: '${iso(1)}' }] }];`);
  console.log('⑤ 어제 goal 을 봤다면   ', JSON.stringify(shot));
  await ctx.close();
}

/* ⑥ 세션에 한 번만 — 새로고침해도 두 번은 안 뜬다 */
{
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('한번만: ' + String(e).slice(0, 140)));
  await p.addInitScript(기본);
  await p.goto('http://127.0.0.1:8871/');
  await p.waitForTimeout(1500);
  const 첫판 = await p.evaluate(() => !!document.getElementById('openscr'));
  await p.screenshot({ path: '_op_first.png' });
  await p.waitForTimeout(1400);                    // 스스로 닫힐 때까지
  const 닫힘 = await p.evaluate(() => !document.getElementById('openscr'));
  const 안내 = await p.evaluate(() => !!document.querySelector('#bgate:not([hidden])'));
  await p.reload();
  await p.waitForTimeout(1500);
  const 두번째 = await p.evaluate(() => !!document.getElementById('openscr'));
  console.log('⑥ 한 번 뜨고 스스로 닫힘', JSON.stringify({ 첫판, 닫힘, 뒤에안내: 안내, 새로고침때: 두번째 }));
  await ctx.close();
}

/* ⑦ 눌러서 건너뛴다 */
{
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('건너뛰기: ' + String(e).slice(0, 140)));
  await p.addInitScript(기본);
  await p.goto('http://127.0.0.1:8871/');
  await p.waitForTimeout(1500);
  await p.click('#openscr');
  await p.waitForTimeout(450);
  console.log('⑦ 눌러서 건너뛰기      ',
    JSON.stringify({ 닫힘: await p.evaluate(() => !document.getElementById('openscr')) }));
  await ctx.close();
}

/* ⑧ 여는 화면이 붙기 전에 앱이 한 프레임 번쩍이지 않는가 —
      런타임이 먼저 그리고 여는 화면은 데이터를 기다렸다 붙어서, 그 사이에
      앱이 0.1초쯤 보였다 사라졌다. 매 프레임 무대가 보이는지 지켜본다. */
{
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('번쩍임: ' + String(e).slice(0, 140)));
  await p.addInitScript(`${기본}
    window.__SAW = [];
    const tick = () => {
      const st = document.getElementById('stage');
      const op = document.getElementById('openscr');
      // 「그려진 앱이 보였나」 — 무대가 비어 있는 프레임은 번쩍임이 아니다
      if (st) window.__SAW.push({
        무대보임: getComputedStyle(st).visibility !== 'hidden'
                  && st.childElementCount > 0,
        여는화면: !!op,
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);`);
  await p.goto('http://127.0.0.1:8871/');
  await p.waitForTimeout(1600);
  const 번쩍 = await p.evaluate(() => {
    /* 여는 화면이 처음 뜨기 「전」 구간만 본다. 그 구간에 무대가 보인
       프레임이 있으면 그게 번쩍임이다. (닫힌 뒤는 당연히 보여야 한다) */
    const saw = window.__SAW || [];
    const i = saw.findIndex(f => f.여는화면);
    return (i < 0 ? saw : saw.slice(0, i)).filter(f => f.무대보임).length;
  });
  console.log('⑧ 앱이 미리 보인 프레임', 번쩍, 번쩍 === 0 ? '· 없음' : '· 번쩍임!');
  await ctx.close();
}

/* ⑨ 요일 슬로건 일곱 개가 다 나오는가 */
{
  const ctx = await b.newContext({ viewport: { width: 430, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8871/');
  await p.waitForTimeout(300);
  const slo = await p.evaluate(() => OPEN.WEEKSLO);
  console.log('⑨ 요일 슬로건          ', slo.length + '개 ·', JSON.stringify(slo.slice(0, 3)));
  await ctx.close();
}

console.log('JS 오류', errs.length ? errs : '없음');
await b.close(); srv.close();
