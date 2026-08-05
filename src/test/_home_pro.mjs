/* 홈이 「프로가 나를 보고 있다」를 말하는가.
   이 앱이 파는 건 이도형 프로가 봐준다는 것 하나다. 홈에서 그게 안 보이면
   영상 올려두는 앱과 구별이 안 된다.

   보는 것 — 횟수 카드의 프로 상태 줄 · 「새 프로 한마디」머리말 ·
             안 읽은 것의 NEW 배지 · 바로가기 「구독」 */
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
const NS = {
  ready: () => Promise.resolve({ id: 'u-1', is_anonymous: false }),
  isPro: () => false,
  mine: () => Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push: () => Promise.reject(new Error('no')),
  link: () => Promise.resolve(null), remove: () => Promise.resolve(),
  markRead: id => { window.__SW.forEach(s => (s.comments||[]).forEach(c => {
      if (c.id === id) c.read_at = new Date().toISOString(); })); return Promise.resolve(); },
  want: () => Promise.resolve(), people: () => Promise.resolve({}),
  note: () => Promise.resolve(), setName: () => Promise.resolve('테스터'),
  down: () => false, named: () => true, nick: () => '테스터', who: () => ({ id: 'u-1' }),
};
window.NS = NS;`;

const HTML = RAW.slice(0, A) + STUB + RAW.slice(B);
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(HTML);
}).listen(8841);

const ago = h => new Date(Date.now() - h * 36e5).toISOString();
const sw = (id, o) => Object.assign({
  id, view: '정면', path: 'p/' + id, size: 1e6, note: null,
  want_comment: false, created_at: ago(30), comments: [],
}, o);

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

await p.goto('http://127.0.0.1:8841/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]');
await p.click('[data-bgate-close]');
await p.waitForTimeout(900);

const look = () => p.evaluate(() => {
  const q = document.querySelector('[data-h-quota]');
  const pro = q && q.querySelector('[data-h-pro]');
  // 「최근 프로 한마디」자리. 횟수 카드의 「이번 달 프로 한마디」와 헷갈리지 않게 정확히 본다
  const head = [...document.querySelectorAll('span,div')]
    .filter(e => !e.childElementCount
      && /^(최근|새|받은) 프로 한마디$|^프로 한마디$/.test(e.textContent.trim())
      && !/이번 달/.test((e.parentElement || {}).textContent || ''))
    .map(e => e.textContent.trim());
  const rows = [...document.querySelectorAll('[data-cm-row]')];
  const hero = document.querySelector('[data-h-hero]');
  return {
    프로줄: pro ? pro.textContent.replace(/\s+/g, ' ').trim() : null,
    머리말: head,
    옆숫자: (() => {
      const h = [...document.querySelectorAll('span,div')]
        .find(e => !e.childElementCount && /^(새|받은) 프로 한마디$/.test(e.textContent.trim()));
      const n = h && h.nextElementSibling;
      return n ? n.textContent.trim() : null;
    })(),
    NEW: rows.filter(r => r.textContent.includes('NEW')).length,
    시간표시: rows.filter(r => /시간 전|일 전|방금/.test(r.textContent)).length,
    히어로: hero ? hero.textContent.replace(/\s+/g, ' ').trim().slice(0, 46) : null,
    구독타일: !!document.evaluate(
      "//span[normalize-space(text())='구독']", document, null, 9, null).singleNodeValue,
    구독안내남음: document.body.innerText.includes('구독 안내'),
    // 「이번 달」이 몇 월인지 — 쌓이는 걸 보는 앱이라 달 이름이 있어야 한다
    오늘날짜: (document.querySelector('[data-h-hero]') || { textContent: '' })
      .textContent.match(/\d+월 \d+일 [월화수목금토일]요일/)?.[0] || null,
    횟수카드: (() => {
      const q = document.querySelector('[data-h-quota]');
      return q ? q.textContent.replace(/\s+/g, ' ').trim().slice(0, 24) : null;
    })(),
    이번달남음: document.body.innerText.includes('이번 달'),
  };
});

const set = async (list) => {
  await p.evaluate(l => { window.__SW = l; return loadComments(); }, list);
  await p.evaluate(() => window.__vaultSync && window.__vaultSync());
  await p.waitForTimeout(500);
  await p.evaluate(() => { const s = document.getElementById('cmnew'); if (s) s.remove(); jump('2a'); });
  await p.waitForTimeout(350);
};

// ① 아직 아무것도 안 올렸다
const a = await look();

// ② 올려두고 답을 기다리는 중 — 히어로가 그 말을 하니 프로줄은 다른 말을 해야 한다
await set([sw('s1', { want_comment: true }), sw('s2', { want_comment: true })]);
const c = await look();

// ③ 한마디가 왔고 아직 안 읽었다
await set([
  sw('s1', { comments: [{ id: 'c1', body: '어깨 회전이 덜 돌아서예요.',
    photos: [], created_at: ago(14), read_at: null }] }),
  sw('s2', {}),
]);
const d = await look();
await p.screenshot({ path: '/tmp/_pro_new.png' });

// ④ 읽고 난 뒤
await p.evaluate(() => NS.markRead('c1'));
await set([
  sw('s1', { comments: [{ id: 'c1', body: '어깨 회전이 덜 돌아서예요.',
    photos: [], created_at: ago(14), read_at: ago(1) }] }),
  sw('s2', {}),
]);
const e = await look();
await p.screenshot({ path: '/tmp/_pro_idle.png' });

/* ⑤ 긴 글 + 사진 세 장 — 카드가 꽉 차야 한다.
   프로가 쓴 글이 이 앱이 파는 것이라 카드에서 제일 큰 자리를 먹어야 한다. */
const PIX = 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640">'
  + '<rect width="360" height="640" fill="#2C3A30"/>'
  + '<line x1="60" y1="180" x2="300" y2="240" stroke="#E4573D" stroke-width="8"/>'
  + '<line x1="180" y1="80" x2="180" y2="560" stroke="#E4573D" stroke-width="8"/></svg>'
).toString('base64');
const LONG = '왼팔이 접히는 건 팔 힘 때문이 아니라 어깨 회전이 부족해서입니다.\n'
  + '영상 0:07쯤 보시면 상체가 먼저 열리는 게 보여요. 한 번에 하나씩 갑니다.';
await set([
  sw('s1', { comments: [{ id: 'c2', body: LONG,
    photos: [PIX, PIX, PIX], created_at: ago(14), read_at: null }] }),
  sw('s2', { comments: [{ id: 'c3', body: '지난번보다 좋아졌어요.',
    photos: [], created_at: ago(70), read_at: ago(60) }] }),
]);
const f = await p.evaluate(() => {
  const row = document.querySelector('[data-cm-row]');
  const bd = row && row.querySelector('[data-cm-body]');
  const wall = row && row.querySelector('.cm-wall');
  const op = row && row.querySelector('[data-cm-open]');
  const all = document.querySelector('[data-cm-all]');
  const cs = bd && getComputedStyle(bd);
  const nav = document.querySelector('[data-nav], nav');
  return {
    카드높이: row ? Math.round(row.getBoundingClientRect().height) : null,
    본문줄수: bd ? Math.round(bd.clientHeight / parseFloat(cs.lineHeight)) : null,
    본문잘림: bd ? bd.scrollHeight > bd.clientHeight + 2 : null,
    사진판: wall ? Math.round(wall.getBoundingClientRect().width) + '×'
                 + Math.round(wall.getBoundingClientRect().height) : null,
    보이는사진: wall ? wall.querySelectorAll('img').length : 0,
    더배지: wall && wall.querySelector('.cm-wall-n')
      ? wall.querySelector('.cm-wall-n').textContent : null,
    액션: op ? op.textContent.trim() : null,
    모두보기: all ? all.textContent.trim() : null,
    설명문구남음: document.body.innerText.includes('눌러서 크게'),
  };
});
await p.screenshot({ path: '/tmp/_pro_rich.png' });
// 사진을 누르면 크게, 카드를 누르면 한마디
await p.click('.cm-wall img');
await p.waitForTimeout(400);
const big = await p.evaluate(() => ({ 큰화면: !!document.getElementById('shotbig'),
  시트안뜸: !document.getElementById('cmnew') }));
await p.evaluate(() => { const x = document.getElementById('shotbig'); if (x) x.remove(); });
/* 카드 밑 한 줄을 누르면 상세로 — 팝업(cmnew)은 이제 없다 */
await p.click('[data-cm-all]');
await p.waitForTimeout(400);
const sheet = await p.evaluate(() => ({ 화면: S.route,
  팝업안뜸: !document.getElementById('cmnew') }));

console.log('① 아무것도 없을 때', JSON.stringify(a, null, 0));
console.log('② 답 기다리는 중  ', JSON.stringify(c, null, 0));
console.log('③ 안 읽은 한마디  ', JSON.stringify(d, null, 0));
console.log('④ 읽은 뒤        ', JSON.stringify(e, null, 0));
console.log('⑤ 긴 글 + 사진 3장', JSON.stringify(f));
console.log('   사진 누름', JSON.stringify(big), '· 카드 누름', JSON.stringify(sheet));
/* ⑤ 홈 카드는 늘 「제일 새 한마디」다 — 새 스윙에 답이 달리면 그걸로 바뀐다.
      그리고 머리줄에 답이 온 때와 「어느 날 스윙인지」가 같이 적힌다. */
const 머리 = () => p.evaluate(() => {
  const row = document.querySelector('[data-cm-row]');
  if (!row) return { none: true };
  return {
    머리줄: (row.children[0] || {}).textContent.replace(/\s+/g, ' ').trim(),
    이름: (row.children[1] || {}).textContent.trim(),
    본문: (row.querySelector('[data-cm-body]') || {}).textContent.trim().slice(0, 14),
  };
});
await p.evaluate(async () => {
  const D = 864e5;
  window.__SW = [{ id: 'sw-old', view: '정면', path: 'a', size: 10, note: null,
    want_comment: false, created_at: new Date(Date.now() - 5 * D).toISOString(),
    comments: [{ id: 'c-old', body: '예전 스윙에 대한 답', photos: [],
      created_at: new Date(Date.now() - 4 * D).toISOString(),
      read_at: new Date().toISOString() }] }];
  await loadComments(); jump('2a');
});
await p.waitForTimeout(400);
const 이전 = await 머리();

// 새 스윙을 올리고 거기에 답이 달렸다
await p.evaluate(async () => {
  const D = 864e5;
  window.__SW.unshift({ id: 'sw-new', view: '측면', path: 'b', size: 10, note: null,
    want_comment: false, created_at: new Date(Date.now() - 1 * D).toISOString(),
    comments: [{ id: 'c-new', body: '새 스윙에 대한 답', photos: [],
      created_at: new Date().toISOString(), read_at: null }] });
  await loadComments(); jump('2a');
});
await p.waitForTimeout(500);
const 이후 = await 머리();

/* ⑥ 「계속 읽기」는 잘린 글 바로 밑 · 사진보다 위에 있어야 한다.
      카드 밑에는 한 줄만 남는다. */
await p.evaluate(async () => {
  const long = '머리가 너무 높고 이상하게 절로 갑니다\n다운스윙에서 상체가 일찍 '
    + '일어나면서 클럽이 밖에서 들어옵니다\n7번 아이언으로 천천히 스무 번만 '
    + '해보세요\n네 번째 줄은 잘려야 합니다\n다섯 번째 줄';
  const c = window.__SW[0].comments[window.__SW[0].comments.length - 1];
  c.body = long;
  // 사진이 있어야 「글 밑 · 사진 위」인지 잴 수 있다
  c.photos = ['data:image/svg+xml;base64,' + btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640">'
    + '<rect width="360" height="640" fill="#2C3A30"/></svg>')];
  await loadComments(); jump('2a');
});
await p.waitForTimeout(400);
const 자리 = await p.evaluate(() => {
  const row = document.querySelector('[data-cm-row]');
  const bd = row.querySelector('[data-cm-body]');
  const more = row.querySelector('[data-cm-more]');
  const wall = row.querySelector('.cm-wall');
  const all = document.querySelector('[data-cm-all]');
  const y = e => e ? Math.round(e.getBoundingClientRect().top) : null;
  return {
    잘림: bd.scrollHeight > bd.clientHeight + 2,
    계속읽기보임: more ? !more.hidden : false,
    글밑에: more && !more.hidden ? y(more) > y(bd) : null,
    사진위에: more && !more.hidden && wall ? y(more) < y(wall) : null,
    하단: all ? all.textContent.replace(/\s+/g, ' ').trim() : null,
    하단이하나: document.querySelectorAll('[data-cm-all]').length,
  };
});
await p.screenshot({ path: '_pro_card.png' });
console.log('⑥ 계속 읽기 자리 ', JSON.stringify(자리));

console.log('⑤ 예전 답만 있을 때', JSON.stringify(이전));
console.log('   새 답이 온 뒤   ', JSON.stringify(이후));
console.log('   바뀌었나        ',
  이전.본문 !== 이후.본문 && /새 스윙/.test(이후.본문) ? '예' : '아니오!',
  '· 스윙 날짜 병기', /스윙/.test(이후.머리줄) ? '예' : '아니오!');

console.log('JS 오류', errs.length ? errs : '없음');
console.log('빠진 배선', await p.evaluate(() => (window.__MISS || []).slice(0, 4)));

await b.close(); srv.close();
