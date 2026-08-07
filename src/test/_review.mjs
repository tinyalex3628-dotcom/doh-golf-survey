/* 월간 요약 한 바퀴 — 프로가 만들고, 회원이 받는다.
   ① CRM: 숫자를 세고 · 반복 주제를 찾고 · 문장을 미리 체크한다
   ② 프로의 한 줄이 없으면 못 보낸다 (이 선이 이 기능의 전부다)
   ③ 문장을 빼고 더할 수 있다
   ④ 회원: 알림 → 시트에 숫자·주제·문장·프로의 한 줄 · 읽음 표시
   ⑤ 레슨기록 › 정기 피드백에 목록으로 쌓인다 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

/* 이번 달 안의 날짜로 심는다 — 달이 바뀌어도 시험이 같아야 한다 */
const DATA = `
const now = new Date();
const MM = (d, h) => new Date(now.getFullYear(), now.getMonth(), d, h || 9).toISOString();
const PP = (d) => new Date(now.getFullYear(), now.getMonth() - 1, d, 9).toISOString();
const SW = [
  { id: 's1', owner: 'u-1', view: '정면', club: '드라이버', path: 'p/1', size: 1e6, note: null,
    want_comment: false, seen_at: MM(3, 10), created_at: MM(3),
    comments: [{ id: 'c1', photos: [], created_at: MM(3, 20),
      body: '톱에서 어깨 회전이 덜 돌아서 왼팔이 접힙니다. 한 번에 하나씩 갑시다.' }] },
  { id: 's2', owner: 'u-1', view: '측면', club: '드라이버', path: 'p/2', size: 1e6, note: null,
    want_comment: false, seen_at: MM(3, 10), created_at: MM(3, 11), comments: [] },
  { id: 's3', owner: 'u-1', view: '정면', club: '7번 아이언', path: 'p/3', size: 1e6, note: null,
    want_comment: false, seen_at: MM(11, 10), created_at: MM(11),
    comments: [{ id: 'c2', photos: [], created_at: MM(11, 21),
      body: '오늘도 어깨가 먼저 열리네요. 하체부터 시작해보세요.' }] },
  { id: 's4', owner: 'u-1', view: '정면', club: null, path: 'p/4', size: 1e6, note: null,
    want_comment: false, seen_at: MM(19, 10), created_at: MM(19),
    comments: [{ id: 'c3', photos: [], created_at: MM(19, 22),
      body: '어깨는 확실히 좋아졌어요. 이제 하체 체중이동을 봅시다.' }] },
  // 지난달 — 이틀, 두 편
  { id: 's5', owner: 'u-1', view: '정면', club: null, path: 'p/5', size: 1e6, note: null,
    want_comment: false, seen_at: PP(5), created_at: PP(5), comments: [] },
  { id: 's6', owner: 'u-1', view: '정면', club: null, path: 'p/6', size: 1e6, note: null,
    want_comment: false, seen_at: PP(20), created_at: PP(20), comments: [] },
];
const PF = [
  { id: 'pro-1', nickname: '이도형', is_pro: true, plan: '베타', real_name: null, created_at: PP(1) },
  { id: 'u-1', nickname: '김회원', is_pro: false, plan: 'Elite', real_name: '김철수', created_at: PP(1) },
];
window.__REV = [];`;

const NSCOMMON = `
  ready: () => Promise.resolve({ id: 'pro-1' }),
  refresh: () => Promise.resolve(true),
  all: () => Promise.resolve(JSON.parse(JSON.stringify(SW))),
  people: () => Promise.resolve(Object.fromEntries(PF.map(p => [p.id, p.nickname]))),
  profiles: () => Promise.resolve(JSON.parse(JSON.stringify(PF))),
  reviews: () => Promise.resolve(JSON.parse(JSON.stringify(window.__REV))),
  sendReview: (owner, month, body) => {
    const row = Object.assign({ id: 'rv-' + month, owner, month,
      created_at: new Date().toISOString(), read_at: null }, body);
    window.__REV = window.__REV.filter(r => !(r.owner === owner && r.month === month));
    window.__REV.push(row);
    return Promise.resolve(row);
  },
  readReview: id => { window.__REV.forEach(r => {
    if (r.id === id) r.read_at = new Date().toISOString(); }); return Promise.resolve(); },
  link: () => Promise.resolve(null), seen: () => Promise.resolve(),
  comment: () => Promise.resolve({}), setPlan: () => Promise.resolve(),
  down: () => false, named: () => true, who: () => ({ id: 'pro-1' })`;

/* ── ① CRM ─────────────────────────────────────────── */
const RAWA = fs.readFileSync(path.join(HERE, '..', 'nextswing-admin.html'), 'utf8');
const A1 = RAWA.indexOf('const SB_URL');
const B1 = RAWA.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
const HTMLA = RAWA.slice(0, A1) + DATA
  + `\nconst NS = { isPro: () => true, nick: () => '이', ${NSCOMMON} };\nwindow.NS = NS;`
  + RAWA.slice(B1);
const srvA = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTMLA);
}).listen(8901);

const pa = await b.newPage({ viewport: { width: 1400, height: 980 } });
const errA = [];
pa.on('pageerror', e => errA.push(String(e).slice(0, 160)));
await pa.goto('http://127.0.0.1:8901/');
await pa.waitForTimeout(600);
if (errA.length) { console.log('CRM 페이지 오류:', errA); await b.close(); srvA.close(); process.exit(1); }
await pa.evaluate(() => { S.nav = 'fb'; render(); });
await pa.waitForTimeout(900);

const built = await pa.evaluate(() => {
  const m = rvMonths()[0];
  const x = rvBuild('u-1', m);
  return { 달: m, 숫자: x.stats, 주제: x.theme,
           후보: x.cands.length, 미리체크: x.cands.filter(c => c.on).length };
});
await pa.screenshot({ path: '/tmp/_rv_crm.png', fullPage: true });

// ② 한 줄 없이 보내기 → 막힌다
await pa.click('[data-rv-send]');
await pa.waitForTimeout(400);
const noLine = await pa.evaluate(() => ({
  보낸것: window.__REV.length,
  알림: (document.getElementById('toast') || {}).textContent,
}));

// ③-0 작업대 — 스윙 골라 열고 캡처해서 요약에 붙인다
const wb0 = await pa.evaluate(() => ({
  스윙칩: document.querySelectorAll('[data-rv-sw]').length,
  영상열림: !!document.querySelector('[data-vid]'),
}));
await pa.click('[data-rv-sw]');
await pa.waitForTimeout(600);
const wb1 = await pa.evaluate(() => ({
  영상칸: !!document.querySelector('[data-v-box]'),
  캡처버튼: !!document.querySelector('[data-v-shot]'),
  확대버튼: !!document.querySelector('[data-v-zin]'),
  선모드: !!document.querySelector('[data-v-md-draw]'),
}));
// 캡처는 진짜 영상이 있어야 되므로, 붙는 자리만 확인한다
await pa.evaluate(() => {
  const sw = rvSwing();
  IN.photos[sw.id] = ['data:image/gif;base64,R0lGODlhAQABAIAAAP8AAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='];
  render();
});
await pa.waitForTimeout(400);
const wb2 = await pa.evaluate(() => ({
  붙은사진: document.querySelectorAll('[data-rv-shotx]').length,
  안내: /요약에 붙는 사진/.test(document.body.innerText),
}));

// ③-1 AI 물어볼 글 — 클립보드에 담기는가
const ai = await pa.evaluate(async () => {
  let got = null;
  navigator.clipboard.writeText = t => { got = t; return Promise.resolve(); };
  document.querySelector('[data-rv-ai]').click();
  await new Promise(r => setTimeout(r, 300));
  return got ? {
    길이: got.length,
    한마디담김: (got.match(/^- /gm) || []).length,
    주제담김: /반복해서 말한 것: 어깨/.test(got),
    채점금지: /채점하지 않는다/.test(got),
    세가지안: /세 가지 안/.test(got),
  } : { none: true };
});

// ③ 문장 하나 더 고르고, 한 줄 쓰고 보내기
await pa.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-rv-pick]')];
  const off = rows.find(r => !r.textContent.includes('✓'));
  if (off) off.click();
});
await pa.waitForTimeout(350);
await pa.fill('[data-rv-line]', '한 달 잘 하셨습니다. 어깨는 잡혔으니 다음 달은 하체만 봅시다.');
await pa.waitForTimeout(200);
await pa.click('[data-rv-send]');
await pa.waitForTimeout(700);
const sent = await pa.evaluate(() => {
  const r = window.__REV[0] || {};
  return { 개수: window.__REV.length, 주제: r.theme, 문장수: (r.picks || []).length,
           사진수: (r.photos || []).length, 한줄: r.pro_line };
});
await pa.close(); srvA.close();

/* ── ② 회원 앱 ─────────────────────────────────────── */
const RAWM = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
const A2 = RAWM.indexOf('const SB_URL');
const B2 = RAWM.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
const REV = JSON.stringify([{
  id: 'rv-x', owner: 'u-1',
  month: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
  stats: { days: 3, vids: 4, cms: 3, prevDays: 2, prevVids: 2 },
  theme: '어깨',
  picks: [{ body: '톱에서 어깨 회전이 덜 돌아서 왼팔이 접힙니다.', at: new Date().toISOString() },
          { body: '오늘도 어깨가 먼저 열리네요.', at: new Date().toISOString() }],
  photos: ['data:image/gif;base64,R0lGODlhAQABAIAAAP8AAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='],
  pro_line: '한 달 잘 하셨습니다. 어깨는 잡혔으니 다음 달은 하체만 봅시다.',
  created_at: new Date().toISOString(), read_at: null,
}]);
const HTMLM = RAWM.slice(0, A2) + `
window.__READ = [];
window.__REV = ${REV};
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }), isPro: () => false,
  mine: () => Promise.resolve([]), push: () => Promise.reject(new Error('no')),
  link: () => Promise.resolve(null), remove: () => Promise.resolve(),
  markRead: () => Promise.resolve(), want: () => Promise.resolve(),
  people: () => Promise.resolve({}), note: () => Promise.resolve(),
  setName: () => Promise.resolve('테스터'), saveOpen: () => Promise.resolve(),
  refresh: () => Promise.resolve(), wipe: () => Promise.resolve(),
  reviews: () => Promise.resolve(JSON.parse(JSON.stringify(window.__REV))),
  readReview: id => { window.__READ.push(id);
    window.__REV.forEach(r => { if (r.id === id) r.read_at = new Date().toISOString(); });
    return Promise.resolve(); },
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;` + RAWM.slice(B2);
const srvM = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTMLM);
}).listen(8902);

const pm = await b.newPage({ viewport: { width: 430, height: 900 } });
await pm.addInitScript(() => {
  try { sessionStorage.setItem('ns-open-seen', '1'); } catch (e) {}
});
const errM = [];
pm.on('pageerror', e => errM.push(String(e).slice(0, 160)));
await pm.goto('http://127.0.0.1:8902/');
await pm.waitForTimeout(600);
if (await pm.$('[data-bgate-next]')) {
  await pm.click('[data-bgate-next]'); await pm.click('[data-bgate-close]');
}
await pm.waitForTimeout(1400);

// ④ 알림 → 시트
const notice = await pm.evaluate(() => {
  const t = document.getElementById('toastbox');
  return { 알림: t && t.classList.contains('show') ? t.textContent.replace(/\s+/g, ' ').trim() : null,
           받은것: (window.__REVIEWS || []).length };
});
await pm.evaluate(() => rvSheet());
await pm.waitForTimeout(500);
const sheet = await pm.evaluate(() => {
  const s = document.getElementById('rvnew');
  if (!s) return { none: true };
  const g = q => (s.querySelector(q) || {}).textContent;
  return {
    숫자: [...s.querySelectorAll('.rv-n')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
    주제: g('.rv-th-w'),
    문장: s.querySelectorAll('.rv-p').length,
    프로한줄: g('.rv-lb'),
    사진: s.querySelectorAll('.rv-ss img').length,
    // 프로가 쓴 줄이 이 장에서 제일 큰 자리를 차지하는가
    한줄크기: s.querySelector('.rv-lb')
      ? Math.round(s.querySelector('.rv-line').getBoundingClientRect().height) : 0,
    버튼화면안: s.querySelector('.rv-btn')
      ? s.querySelector('.rv-btn').getBoundingClientRect().bottom <= innerHeight + 1 : null,
  };
});
await pm.screenshot({ path: '/tmp/_rv_mem.png' });

if (sheet.none) { console.log('시트가 안 열림 · 받은 것', notice, '· 오류', errM);
  await b.close(); srvM.close(); process.exit(1); }
await pm.click('[data-rv-ok]');
await pm.waitForTimeout(500);
const read = await pm.evaluate(() => ({ 읽음보냄: window.__READ, 시트닫힘: !document.getElementById('rvnew') }));

// ⑤ 레슨기록 › 정기 피드백
await pm.evaluate(() => jump('2f'));
await pm.waitForTimeout(500);
const tab = await pm.evaluate(() => ({
  줄: document.querySelectorAll('[data-rv-row]').length,
  글: document.getElementById('stage').innerText.replace(/\s+/g, ' ').slice(0, 70),
  베타이후남음: /베타 이후에 열립니다/.test(document.getElementById('stage').innerText),
}));

console.log('① 셈       ', JSON.stringify(built));
console.log('② 한 줄 없이', JSON.stringify(noLine));
console.log('②-3 AI 초안 ', JSON.stringify(ai));
console.log('②-2 작업대 ', JSON.stringify(wb0), JSON.stringify(wb1), JSON.stringify(wb2));
console.log('③ 보낸 것   ', JSON.stringify(sent));
console.log('④ 회원 알림 ', JSON.stringify(notice));
console.log('   시트     ', JSON.stringify(sheet));
console.log('   읽음     ', JSON.stringify(read));
console.log('⑤ 피드백 탭 ', JSON.stringify(tab));
console.log('JS 오류 · CRM', errA.length ? errA : '없음', '· 회원', errM.length ? errM : '없음');
console.log('빠진 배선', await pm.evaluate(() => (window.__MISS || []).slice(0, 4)));

await b.close(); srvM.close();
