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

  // 이제는 물어보고 찍는다 — 창이 떠 있고 아직 안 보냈어야 한다
  const ask = await p.evaluate(() => ({
    창: !!document.getElementById('askseen'),
    아직안보냄: window.__STAMPED.length === 0,
    글: (document.querySelector('.as-t') || {}).textContent,
    안전장치: !!document.querySelector('[data-as-no]'),
  }));
  await p.click('[data-as-yes]');
  await p.waitForTimeout(400);

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

  // 다른 스윙을 「알리지 않고 보기」로 열면 도장이 안 나간다
  await p.evaluate(() => { IN.list[1].seen_at = null; IN.sel = 'sw-b'; render(); });
  await p.waitForTimeout(500);
  await p.click('[data-as-no]');
  await p.waitForTimeout(400);
  const quiet = await p.evaluate(() => ({
    보낸것: window.__STAMPED.slice(), 창닫힘: !document.getElementById('askseen'),
    알림: (document.getElementById('toast') || {}).textContent,
  }));

  // 「알리지 않고 보기」를 골랐어도, 다시 들어오면 또 묻는다
  await p.evaluate(() => { IN.sel = 'sw-a'; render(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { IN.sel = 'sw-b'; render(); });
  await p.waitForTimeout(500);
  const again = await p.evaluate(() => ({
    또물음: !!document.getElementById('askseen'),
    아직안보냄: window.__STAMPED.indexOf('sw-b') < 0,
  }));
  // 이번엔 알리기로 하면 그때 나간다
  if (await p.$('[data-as-yes]')) { await p.click('[data-as-yes]'); await p.waitForTimeout(400); }
  const later = await p.evaluate(() => window.__STAMPED.slice());
  // 도장이 찍힌 뒤로는 다시 안 묻는다
  await p.evaluate(() => { IN.sel = 'sw-a'; render(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { IN.sel = 'sw-b'; render(); });
  await p.waitForTimeout(500);
  const done2 = await p.evaluate(() => ({ 안물음: !document.getElementById('askseen') }));

  console.log('① 물어보기', JSON.stringify(ask));
  console.log('   찍은 뒤 ', JSON.stringify(r1), '· 재열람', JSON.stringify(r2));
  console.log('   알리지 않고', JSON.stringify(quiet));
  console.log('   다시 들어오면', JSON.stringify(again), '· 그때 알리기', JSON.stringify(later));
  console.log('   찍힌 뒤엔  ', JSON.stringify(done2));
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

  /* ③ 요청 없이 올린 스윙에 도장만 찍힌 경우 — 홈 프로 줄이 바로 말하는가 */
  await p.evaluate(() => {
    window.__SW = [{ id: 'r3', view: '정면', path: 'p/3', size: 1e6, note: null, club: null,
      want_comment: false, seen_at: new Date(Date.now() - 3 * 36e5).toISOString(),
      created_at: new Date(Date.now() - 8 * 36e5).toISOString(), comments: [] }];
    return loadComments();
  });
  await p.evaluate(() => window.__vaultSync && window.__vaultSync());
  await p.waitForTimeout(500);
  await p.evaluate(() => jump('2a'));
  await p.waitForTimeout(400);
  const proLine = await p.evaluate(() => {
    const el = document.querySelector('[data-h-pro]');
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
  });

  console.log('② 회원 홈', JSON.stringify(home));
  console.log('③ 도장만 있는 홈 프로 줄:', JSON.stringify(proLine));
  console.log('   갤러리 칩', JSON.stringify(gal));
  console.log('   JS 오류', errs.length ? errs : '없음');
  console.log('   빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 4)));
  await p.close(); srv.close();
}

await b.close();
