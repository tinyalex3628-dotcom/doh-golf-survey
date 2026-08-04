/* 캡처 — 「다른 출처」 영상으로 확인한다.
   지금까지 테스트는 전부 같은 출처(blob:)를 썼다. 그래서 이 버그가 안 잡혔다.
   진짜 서버(Supabase)는 다른 출처라서 캔버스가 오염되고 toDataURL 이 막힌다.

   서버 A(8801) — 관리자 콘솔
   서버 B(8802) — 영상, CORS 허용 (Supabase Storage 와 같은 조건)
   서버 C(8803) — 영상, CORS 없음 (내려받기가 막히는 최악의 경우) */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);   // src/test
const VIDEO = fs.readFileSync(path.join(HERE, '_swtest.webm'));
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-admin.html'), 'utf8');

/* sb.js 는 최상위 `const NS` 라 window.NS 를 덮어써도 안 바뀐다.
   그래서 서버 붙는 부분만 통째로 가짜로 갈아 끼운 페이지를 만든다.
   (프록시가 supabase.co 를 막고 있어 진짜 서버로는 어차피 못 붙는다) */
const A = RAW.indexOf("const SB_URL");
const B = RAW.indexOf("window.NS = NS;") + "window.NS = NS;".length;
if (A < 0 || B < 15) throw new Error('sb.js 자리를 못 찾았어요');
let HTML_PORT = 8802;
const stub = () => `
const NS = {
  ready: () => Promise.resolve({ id: 'pro-1' }),
  isPro: () => true,
  all: () => Promise.resolve([{ id: 'sw-x', owner: 'u-1', view: '정면',
    path: 'http://127.0.0.1:' + window.__VPORT + '/v.webm', size: 3000000,
    note: '드라이버 실외', want_comment: true,
    created_at: new Date().toISOString(), comments: [] }]),
  people: () => Promise.resolve({ 'u-1': '김테스트' }),
  link: p => Promise.resolve(p),
  comment: (id, body, photos) => {
    window.__sent = { body: body, n: (photos || []).length,
      head: (photos || [])[0] ? photos[0].slice(0, 22) : null };
    return Promise.resolve({});
  },
  down: () => false, named: () => true, nick: () => '이도형',
};
window.NS = NS;`;

const serveHtml = http.createServer((q, r) => {
  const port = q.url.includes('nocors') ? 8803 : 8802;
  const html = '<script>window.__VPORT=' + port + '</' + 'script>'
    + RAW.slice(0, A) + stub() + RAW.slice(B);
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  r.end(html);
}).listen(8801);

const videoServer = cors => http.createServer((q, r) => {
  const h = { 'content-type': 'video/webm', 'content-length': VIDEO.length,
              'accept-ranges': 'bytes' };
  if (cors) h['access-control-allow-origin'] = '*';
  r.writeHead(200, h);
  r.end(VIDEO);
});
const okServer = videoServer(true).listen(8802);
const noServer = videoServer(false).listen(8803);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function run(port, label) {
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));

  await p.goto('http://127.0.0.1:8801/' + (port === 8803 ? '?nocors' : ''));
  await p.waitForTimeout(400);
  // 도착함으로
  await p.evaluate(() => { S.nav = 'inbox'; render(); });
  await p.waitForTimeout(2500);   // 내려받아서 여는 시간

  const opened = await p.evaluate(() => {
    const v = document.querySelector('[data-vid]');
    return { w: v.videoWidth, h: v.videoHeight, blob: v.currentSrc.startsWith('blob:'),
             wait: !!document.querySelector('[data-v-wait]') };
  });

  // 선 세 개를 긋는다 (진짜 손처럼 끌어서)
  const box = await p.locator('[data-v-ink]').boundingBox();
  for (const [a, c, d, e] of [[.3, .2, .7, .5], [.25, .6, .75, .62], [.5, .15, .5, .85]]) {
    await p.mouse.move(box.x + box.width * a, box.y + box.height * c);
    await p.mouse.down();
    await p.mouse.move(box.x + box.width * d, box.y + box.height * e, { steps: 6 });
    await p.mouse.up();
  }
  const nLines = await p.evaluate(() => (IN.lines['sw-x'] || []).length);

  // 캡처
  await p.click('[data-v-shot]');
  await p.waitForTimeout(500);

  const after = await p.evaluate(() => {
    const arr = IN.photos['sw-x'] || [];
    const boxEl = [...document.querySelectorAll('div')]
      .find(d => (d.textContent || '').includes('답장과 같이 갑니다'));
    const img = document.querySelector('[data-in-shot-x]')
      ? document.querySelector('[data-in-shot-x]').parentElement.querySelector('img') : null;
    return {
      photos: arr.length,
      isJpeg: arr[0] ? arr[0].startsWith('data:image/jpeg') : false,
      bytes: arr[0] ? arr[0].length : 0,
      boxShown: !!boxEl,
      boxText: boxEl ? boxEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null,
      hasX: !!document.querySelector('[data-in-shot-x]'),
      imgLoaded: img ? img.complete && img.naturalWidth > 0 : false,
    };
  });

  // 캡처본에 빨간 선이 진짜 찍혔는지 — 픽셀을 센다
  const red = await p.evaluate(() => {
    const u = (IN.photos['sw-x'] || [])[0];
    if (!u) return -1;
    return new Promise(ok => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = im.width; c.height = im.height;
        const g = c.getContext('2d');
        g.drawImage(im, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 150 && d[i + 1] < 120 && d[i + 2] < 100) n++;
        }
        ok(n);
      };
      im.onerror = () => ok(-2);
      im.src = u;
    });
  });

  // 두 장째 — 렌더 뒤에도 선이 남고 보던 지점이 유지되는지
  const t1 = await p.evaluate(() => document.querySelector('[data-vid]').currentTime);
  await p.click('[data-v-shot]');
  await p.waitForTimeout(400);
  const second = await p.evaluate(() => ({
    photos: (IN.photos['sw-x'] || []).length,
    lines: (IN.lines['sw-x'] || []).length,
    at: document.querySelector('[data-vid]').currentTime,
  }));

  /* ── 확대 · 이동 ─────────────────────────────────────────────── */
  await p.evaluate(() => { IN.photos['sw-x'] = []; IN.lines['sw-x'] = []; render(); });
  await p.waitForTimeout(600);

  // 버튼으로 확대
  await p.click('[data-v-zin]');
  await p.click('[data-v-zin]');
  await p.click('[data-v-zin]');
  const zoomed = await p.evaluate(() => ({
    z: Math.round(IN.zoom['sw-x'].z * 100) / 100,
    pct: document.querySelector('[data-v-pct]').textContent,
    tr: document.querySelector('[data-v-zoom]').style.transform,
  }));

  // ✋ 이동으로 끌기 — 화면이 따라와야 한다
  await p.click('[data-v-md-pan]');
  const box2 = await p.locator('[data-v-ink]').boundingBox();
  const before = await p.evaluate(() => ({ ...IN.zoom['sw-x'] }));
  await p.mouse.move(box2.x + box2.width * .5, box2.y + box2.height * .5);
  await p.mouse.down();
  await p.mouse.move(box2.x + box2.width * .5 - 90, box2.y + box2.height * .5 - 70, { steps: 8 });
  await p.mouse.up();
  const panned = await p.evaluate(() => ({ ...IN.zoom['sw-x'] }));
  const moved = { dx: Math.round(panned.tx - before.tx), dy: Math.round(panned.ty - before.ty),
                  linesMade: (await p.evaluate(() => IN.lines['sw-x'].length)) };

  // 확대한 채로 선 긋기
  await p.click('[data-v-md-draw]');
  const box3 = await p.locator('[data-v-box]').boundingBox();
  await p.mouse.move(box3.x + box3.width * .35, box3.y + box3.height * .35);
  await p.mouse.down();
  await p.mouse.move(box3.x + box3.width * .68, box3.y + box3.height * .6, { steps: 6 });
  await p.mouse.up();
  const zLines = await p.evaluate(() => IN.lines['sw-x'].length);

  // 확대한 채로 캡처 — 잘려서, 선까지 같이 나와야 한다
  await p.click('[data-v-shot]');
  await p.waitForTimeout(400);
  const zShot = await p.evaluate(() => {
    const u = (IN.photos['sw-x'] || [])[0];
    if (!u) return { none: true };
    return new Promise(ok => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = im.width; c.height = im.height;
        const g = c.getContext('2d');
        g.drawImage(im, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let red = 0, black = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 150 && d[i + 1] < 120 && d[i + 2] < 100) red++;
          if (d[i] < 16 && d[i + 1] < 16 && d[i + 2] < 16) black++;
        }
        ok({ w: im.width, h: im.height, red,
             blackPct: Math.round(black / (c.width * c.height) * 100) });
      };
      im.onerror = () => ok({ broken: true });
      im.src = u;
    });
  });
  // 확대 상태가 렌더 뒤에도 남아 있는지
  const kept = await p.evaluate(() => ({
    z: Math.round(IN.zoom['sw-x'].z * 100) / 100,
    pct: document.querySelector('[data-v-pct]').textContent,
    lines: IN.lines['sw-x'].length,
  }));
  // 원래대로
  await p.click('[data-v-pct]');
  const reset = await p.evaluate(() => ({ ...IN.zoom['sw-x'] }));

  // 보내기 — 사진이 답장에 실려 나가는지
  await p.fill('[data-in-txt]', '어깨가 먼저 열립니다');
  await p.click('[data-in-send]');
  await p.waitForTimeout(300);
  const sent = await p.evaluate(() => window.__sent || null);

  console.log('── ' + label);
  console.log('  영상 열림', JSON.stringify(opened));
  console.log('  그은 선', nLines);
  console.log('  캡처 결과', JSON.stringify(after));
  console.log('  캡처본 빨간 픽셀', red);
  console.log('  두 장째', JSON.stringify({ ...second, t1: Math.round(t1 * 100) / 100 }));
  console.log('  확대', JSON.stringify(zoomed));
  console.log('  ✋ 이동으로 끈 결과', JSON.stringify(moved));
  console.log('  확대한 채로 그은 선', zLines);
  console.log('  확대한 채로 캡처', JSON.stringify(zShot));
  console.log('  캡처 뒤에도 남은 상태', JSON.stringify(kept));
  console.log('  원래대로', JSON.stringify(reset));
  console.log('  보내진 것', JSON.stringify(sent));
  console.log('  JS 오류', errs.length ? errs : '없음');
  await ctx.close();
}

await run(8802, 'CORS 허용 — 진짜 Supabase 와 같은 조건');
await run(8803, 'CORS 없음 — 내려받기가 막히는 최악의 경우');

await b.close();
serveHtml.close(); okServer.close(); noServer.close();
