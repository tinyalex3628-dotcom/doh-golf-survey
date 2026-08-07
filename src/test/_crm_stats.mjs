/* 주간 지표 다섯 — 서버에 있는 것만으로 세어 나오는가.
   ① 다섯 개가 뜬다 (여섯 번째가 늘면 그때가 하나를 뺄 때다)
   ② 지난주와 견주는 화살표
   ③ 안 열어본 스윙 알림 · CSV 내려받기
   ④ 주 넘기기 · 모바일 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-admin.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;

/* 이번 주 월요일을 기준으로 데이터를 심는다 — 오늘이 무슨 요일이든
   시험 결과가 같아야 한다. */
const STUB = `
const now = new Date();
const mon0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
mon0.setDate(mon0.getDate() - ((mon0.getDay() + 6) % 7));
const thisW = h => new Date(mon0.getTime() + h * 36e5).toISOString();   // 이번 주 월요일 + h시간
const lastW = h => new Date(mon0.getTime() - 7 * 864e5 + h * 36e5).toISOString();
const SW = [
  // 이번 주 — 두 명이 올렸고, 한 건은 4시간 만에 답, 한 건은 20시간 만에 답
  { id: 's1', owner: 'u-a', view: '정면', created_at: thisW(10), want_comment: true,
    seen_at: thisW(11), comments: [{ id: 'c1', body: 'ok', photos: [], created_at: thisW(14) }] },
  { id: 's2', owner: 'u-b', view: '정면', created_at: thisW(12), want_comment: true,
    seen_at: thisW(13), comments: [{ id: 'c2', body: 'ok', photos: [], created_at: thisW(32) }] },
  // 이번 주 올렸는데 아직 안 열어본 것
  { id: 's3', owner: 'u-a', view: '측면', created_at: thisW(30), want_comment: true,
    seen_at: null, comments: [] },
  // 지난주 — 한 명만 올렸고 40시간 만에 답
  { id: 's4', owner: 'u-c', view: '정면', created_at: lastW(10), want_comment: true,
    seen_at: lastW(12), comments: [{ id: 'c3', body: 'ok', photos: [], created_at: lastW(50) }] },
];
const PF = [
  { id: 'pro-1', nickname: '이도형', is_pro: true, plan: '베타', real_name: null, created_at: lastW(0) },
  { id: 'u-a', nickname: '가회원', is_pro: false, plan: 'Coaching', real_name: '가', created_at: lastW(0) },
  { id: 'u-b', nickname: '나회원', is_pro: false, plan: '베타', real_name: null, created_at: lastW(0) },
  { id: 'u-c', nickname: '다회원', is_pro: false, plan: '베타', real_name: null, created_at: lastW(0) },
];
const NS = {
  ready: () => Promise.resolve({ id: 'pro-1' }), isPro: () => true,
  refresh: () => Promise.resolve(true),
  all: () => Promise.resolve(JSON.parse(JSON.stringify(SW))),
  people: () => Promise.resolve(Object.fromEntries(PF.map(p => [p.id, p.nickname]))),
  profiles: () => Promise.resolve(JSON.parse(JSON.stringify(PF))),
  setPlan: () => Promise.resolve(), link: () => Promise.resolve(null),
  seen: () => Promise.resolve(), comment: () => Promise.resolve({}),
  down: () => false, named: () => true, nick: () => '이', who: () => ({ id: 'pro-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8881);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1400, height: 950 } });
const errs = [];
p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8881/');
await p.waitForTimeout(400);
await p.evaluate(() => { S.nav = 'stats'; render(); });
await p.waitForTimeout(900);

const now = await p.evaluate(() => crmStats(0));
const was = await p.evaluate(() => crmStats(1));
const ui = await p.evaluate(() => ({
  상자수: [...document.querySelectorAll('div')]
    .filter(d => /^(올린 회원|답장까지|한마디 적게|먼저 연락할|보낸 한마디)/.test(
      (d.textContent || '').trim())).length,
  화살표: (document.body.innerText.match(/[▲▼]/g) || []).length,
  안본알림: /안 열어본 스윙/.test(document.body.innerText),
  csv: !!document.querySelector('[data-crm-csv]'),
}));
await p.screenshot({ path: '/tmp/_stats.png' });

// 주 넘기기
await p.click('[data-wback="1"]');
await p.waitForTimeout(400);
const back = await p.evaluate(() => ({ wback: S.wback, 올린회원: crmStats(S.wback).upRate }));

// CSV
await p.evaluate(() => { S.wback = 0; render(); });
await p.waitForTimeout(300);
const csv = await p.evaluate(() => {
  let got = null;
  const A = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { got = this.download; };
  crmCSV();
  HTMLAnchorElement.prototype.click = A;
  return got;
});

// 모바일
await p.evaluate(() => { S.view = 'mo'; render(); });
await p.waitForTimeout(500);
const mo = await p.evaluate(() => ({
  숫자보임: /올린 회원/.test(document.body.innerText),
  가로밀림: document.querySelector('.mobox')
    ? document.querySelector('.mobox').scrollWidth > document.querySelector('.mobox').clientWidth + 1
    : null,
}));

console.log('이번 주', JSON.stringify({ upRate: now.upRate, upN: now.upN, activeN: now.activeN,
  reply: now.reply, replyN: now.replyN, lowN: now.lowN, quietN: now.quietN,
  replied: now.replied, unseen: now.unseen }));
console.log('지난주', JSON.stringify({ upRate: was.upRate, reply: was.reply, replied: was.replied }));
console.log('화면  ', JSON.stringify(ui));
console.log('주 넘기기', JSON.stringify(back), '· CSV', JSON.stringify(csv));
console.log('모바일', JSON.stringify(mo));
console.log('JS 오류', errs.length ? errs : '없음');
await b.close(); srv.close();
