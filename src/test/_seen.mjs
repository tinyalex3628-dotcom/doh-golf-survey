/* 봤어요 도장 한 바퀴 — CRM 이 찍고, 회원 앱이 보여주는가.
   ① CRM: 스윙을 열면 NS.seen 이 불리고, 목록의 「안 봄」 점이 꺼진다
   ② 회원: 갤러리 칩이 「전달됨→프로 확인」, 홈 히어로가 「확인했어요」 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

/* ── ① CRM ─────────────────────────────────────────────── */
{
  const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-admin.html'), 'utf8');
  const A = RAW.indexOf('const SB_URL');
  const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
  const STUB = `
window.__STAMPED = [];
const NS = {
  ready: () => Promise.resolve({ id: 'pro-1' }), isPro: () => true,
  all: () => Promise.resolve([
    { id: 'sw-a', owner: 'u-1', view: '정면', path: 'p/a', size: 1e6, note: null,
      want_comment: true, seen_at: null, created_at: new Date().toISOString(), comments: [] },
    { id: 'sw-b', owner: 'u-2', view: '측면', path: 'p/b', size: 1e6, note: null,
      want_comment: false, seen_at: '2026-08-01T09:00:00Z',
      created_at: new Date().toISOString(), comments: [] },
  ]),
  people: () => Promise.resolve({ 'u-1': '김테스트', 'u-2': '박테스트' }),
  link: p => Promise.resolve(null),
  seen: id => { window.__STAMPED.push(id); return Promise.resolve(); },
  comment: () => Promise.resolve({}),
  down: () => false, named: () => true, nick: () => '이', who: () => ({ id: 'pro-1' }),
};
window.NS = NS;`;
  const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
  const srv = http.createServer((q, r) => {
    r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
  }).listen(8851);

  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  await p.goto('http://127.0.0.1:8851/');
  await p.waitForTimeout(400);
  await p.evaluate(() => { S.nav = 'inbox'; render(); });
  await p.waitForTimeout(600);

  const r1 = await p.evaluate(() => ({
    // 처음 열린 스윙(sw-a)에 도장이 자동으로 찍혔는가
    stamped: window.__STAMPED.slice(),
    aSeen: !!IN.list.find(x => x.id === 'sw-a').seen_at,
    // 안 본 스윙 점 — sw-a 는 방금 봤으니 꺼졌고, 점은 이제 없어야 한다
    dots: document.querySelectorAll('[data-in-row] [title*="안 열어본"]').length,
  }));
  // 이미 도장 있는 스윙(sw-b)을 열어도 다시 안 찍는다
  await p.evaluate(() => { IN.sel = 'sw-b'; render(); });
  await p.waitForTimeout(400);
  const r2 = await p.evaluate(() => window.__STAMPED.slice());

  console.log('① CRM 도장', JSON.stringify(r1), '· 재열람 후', JSON.stringify(r2));
  console.log('   JS 오류', errs.length ? errs : '없음');
  await p.close(); srv.close();
}

/* ── ② 회원 앱 ─────────────────────────────────────────── */
{
  const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
  const A = RAW.indexOf('const SB_URL');
  const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
  const STUB = `
window.__SW = [
  { id: 'r1', view: '정면', path: 'p/1', size: 1e6, note: null, club: null,
    want_comment: true, seen_at: new Date(Date.now() - 2 * 36e5).toISOString(),
    created_at: new Date(Date.now() - 5 * 36e5).toISOString(), comments: [] },
  { id: 'r2', view: '측면', path: 'p/2', size: 1e6, note: null, club: null,
    want_comment: false, seen_at: null,
    created_at: new Date(Date.now() - 30 * 36e5).toISOString(), comments: [] },
];
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }), isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')), link: () => Promise.resolve(null),
  remove: () => Promise.resolve(), markRead: () => Promise.resolve(),
  want: () => Promise.resolve(), people: () => Promise.resolve({}),
  note: () => Promise.resolve(), setName: () => Promise.resolve('테스터'),
  saveOpen: () => Promise.resolve(), refresh: () => Promise.resolve(),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;
  const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
  const srv = http.createServer((q, r) => {
    r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
  }).listen(8852);

  const p = await b.newPage({ viewport: { width: 430, height: 900 } });
  await p.addInitScript(() => {
    try { sessionStorage.setItem('ns-open-seen', '1'); } catch (e) {}
  });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  await p.goto('http://127.0.0.1:8852/');
  await p.waitForTimeout(600);
  if (await p.$('[data-bgate-next]')) {
    await p.click('[data-bgate-next]'); await p.click('[data-bgate-close]');
  }
  await p.waitForTimeout(900);

  const home = await p.evaluate(() => {
    const h = document.querySelector('[data-h-hero]');
    return {
      seenMap: Object.keys(window.__SEEN || {}),
      hero: h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 66) : null,
    };
  });
  // 갤러리 — 도장 찍힌 것은 「프로 확인」, 안 찍힌 것은 「전달됨」
  await p.evaluate(() => jump('ge'));
  await p.waitForTimeout(500);
  const gal = await p.evaluate(() => {
    const t = document.getElementById('stage').innerText;
    return {
      프로확인: (t.match(/프로 확인/g) || []).length,
      전달됨: (t.match(/전달됨/g) || []).length,
      보는중: (t.match(/보는 중/g) || []).length,
    };
  });

  console.log('② 회원 홈', JSON.stringify(home));
  console.log('   갤러리 칩', JSON.stringify(gal));
  console.log('   JS 오류', errs.length ? errs : '없음');
  console.log('   빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 4)));
  await p.close(); srv.close();
}

await b.close();
