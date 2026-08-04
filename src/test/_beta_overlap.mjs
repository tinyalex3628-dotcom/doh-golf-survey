/* 「베타」 표식이 55개 화면 중 어디서든 글자·아이콘과 겹치는지 전수 확인 */
import { chromium } from 'playwright-core';
const URL = new globalThis.URL('../nextswing-v3.html', import.meta.url).href;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto(URL + '?dev=1');
await p.waitForTimeout(600);

const ids = await p.evaluate(() =>
  [...document.querySelectorAll('template[data-scr]')].map(t => t.dataset.scr));

const bad = [];
const noMark = [];
for (const id of ids) {
  await p.evaluate(i => window.jump(i), id);
  await p.waitForTimeout(90);
  const r = await p.evaluate(() => {
    const frame = document.querySelector('#stage>div');
    const mk = frame && frame.querySelector('.bmark');
    if (!mk) return { none: true };
    const m = mk.getBoundingClientRect();
    const pad = 3;                                   // 숨 쉴 틈
    const hits = [];
    for (const el of frame.querySelectorAll('*')) {
      if (el === mk || mk.contains(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.display === 'none') continue;
      // 글자가 직접 들어 있거나 아이콘인 것만 — 큰 껍데기 div 는 겹쳐도 상관없다
      const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      const icon = el.tagName === 'svg' || el.tagName === 'IMG';
      const painted = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.getBoundingClientRect().height < 40;
      if (!direct && !icon && !painted) continue;
      const q = el.getBoundingClientRect();
      if (!q.width || !q.height) continue;
      if (q.left < m.right + pad && q.right > m.left - pad &&
          q.top < m.bottom + pad && q.bottom > m.top - pad) {
        hits.push((el.tagName + ' ' + (el.textContent || '').trim().slice(0, 18)).trim());
      }
    }
    return { hits, y: Math.round(m.top - frame.getBoundingClientRect().top) };
  });
  if (r.none) noMark.push(id);
  else if (r.hits.length) bad.push({ id, y: r.y, hits: r.hits });
}

console.log('화면 수', ids.length);
console.log('표식이 안 붙은 화면:', noMark.length ? noMark.join(' ') : '없음');
console.log('겹치는 화면:', bad.length ? JSON.stringify(bad, null, 1) : '없음');
console.log('JS 오류:', errs.length ? errs : '없음');
await b.close();
