/* 연습기록 화면 — 열자마자 기록(달력)이 보여야 한다.
   전에는 「오늘」 카드가 288px 를 먹고 그 아래 두 카드를 지나야 달력이 나와서,
   연습기록 화면인데 스크롤을 내려야 자기 기록을 볼 수 있었다. */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const RAW = fs.readFileSync(path.join(HERE, '..', 'nextswing-v3.html'), 'utf8');
const A = RAW.indexOf('const SB_URL');
const B = RAW.indexOf('window.NS = NS;') + 'window.NS = NS;'.length;
const STUB = `
window.__SW = window.__SW || [];
const NS = { ready:()=>Promise.resolve({id:'u-1',is_anonymous:false}), isPro:()=>false,
  mine:()=>Promise.resolve(JSON.parse(JSON.stringify(window.__SW))),
  push:()=>Promise.reject(new Error('no')), link:()=>Promise.resolve(null),
  remove:()=>Promise.resolve(), want:()=>Promise.resolve(), note:()=>Promise.resolve(),
  markRead:()=>Promise.resolve(), people:()=>Promise.resolve({}), setName:()=>Promise.resolve('t'),
  saveOpen:()=>Promise.resolve(),
  down:()=>false, named:()=>true, nick:()=>'테스터', who:()=>({id:'u-1'}) };
window.NS = NS;`;
const HTML = RAW.slice(0,A)+STUB+RAW.slice(B);
const srv = http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(HTML);}).listen(8881);
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const ctx = await b.newContext({viewport:{width:430,height:900}});
const p = await ctx.newPage();
await p.addInitScript(()=>{
  try{sessionStorage.setItem('ns-open-seen','1');}catch(e){}
  const now = new Date().toISOString();
  window.__SW = [{ id:'rw-1', view:'정면', path:'a', size:10, note:'왼팔이 접혀요',
    want_comment:false, created_at: now,
    comments:[{ id:'c1', body:'어깨 회전이 덜 돌아서예요', photos:[],
      created_at: now, read_at: now }] }];
});
p.on('pageerror', e=>console.log('ERR', String(e).slice(0,160)));
await p.goto('http://127.0.0.1:8881/');
await p.waitForTimeout(600);
await p.click('[data-bgate-next]'); await p.click('[data-bgate-close]');
await p.waitForTimeout(900);
await p.evaluate(()=>jump('2b'));
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const dump=(el,d)=>{ if(!el||d>3) return null;
    const r=el.getBoundingClientRect();
    return { tag:el.tagName, at:el.getAttribute('data-today')||el.getAttribute('data-sec')||'',
      h:Math.round(r.height), txt:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,26),
      kids:[...el.children].map(k=>dump(k,d+1)).filter(Boolean) }; };
  window.__DUMP = dump;
  const frame = document.querySelector('#stage>div');
  const fr = frame.getBoundingClientRect();
  // 스크롤 되는 본문 찾기
  const body = [...frame.querySelectorAll('div')].find(e=>{
    const st=e.getAttribute('style')||''; return /flex:\s*1/.test(st)&&/overflow-y:\s*auto/.test(st);});
  const out = { 프레임높이: Math.round(fr.height),
    본문높이: body?Math.round(body.getBoundingClientRect().height):null,
    스크롤길이: body?body.scrollHeight:null,
    구역: [] };
  if (body) [...body.children].forEach((e,i)=>{
    const r=e.getBoundingClientRect();
    out.구역.push({ i, 높이:Math.round(r.height),
      본문위끝에서: Math.round(r.top - body.getBoundingClientRect().top),
      글: (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,30) });
  });
  const cal = [...frame.querySelectorAll('div')].find(e=>
    /grid-template-columns:\s*repeat\(7/.test(e.getAttribute('style')||''));
  if (cal) { const r=cal.getBoundingClientRect();
    out.달력 = { 위: Math.round(r.top-fr.top), 화면안: r.top < fr.bottom,
      프레임아래로넘침: Math.round(r.top-fr.top) > fr.height }; }
  else out.달력='없음';
  out.오늘카드 = body ? window.__DUMP(body.children[0],0) : null;
  const secs=[...body.children].find(e=>/지난 기록/.test(e.textContent));
  out.달력줄 = secs ? [...secs.querySelectorAll('div')].filter(g=>
      /grid-template-columns:\s*repeat\(7/.test(g.getAttribute('style')||''))
      .map(g=>({h:Math.round(g.getBoundingClientRect().height),
                day:!!g.querySelector('[data-day]'),
                t:(g.textContent||'').replace(/\s+/g,'').slice(0,30)})) : null;
  return out;
}), null, 1));
await p.screenshot({ path:'_2b.png' });

/* 달력이 스크롤 없이 보이는가 — 이 화면이 존재하는 이유다 */
const v = await p.evaluate(() => {
  const frame = document.querySelector('#stage>div');
  const fr = frame.getBoundingClientRect();
  const cal = [...frame.querySelectorAll('div')].find(e =>
    /grid-template-columns:\s*repeat\(7/.test(e.getAttribute('style') || '')
    && e.querySelector('[data-day]'));
  const grids = [...frame.querySelectorAll('div')].filter(e =>
    /grid-template-columns:\s*repeat\(7/.test(e.getAttribute('style') || '')
    && e.querySelector('[data-day]'));
  const r = cal.getBoundingClientRect();
  const today = frame.querySelector('[data-today="empty"]');
  return {
    달력시작: Math.round(r.top - fr.top),
    달력끝: Math.round(r.bottom - fr.top),
    프레임높이: Math.round(fr.height),
    스크롤없이보임: r.top < fr.bottom,
    통째로보임: r.bottom <= fr.bottom,
    달력칸수: grids.length,                       // 그린 칸 하나만 남아야 한다
    오늘카드높이: today ? Math.round(today.getBoundingClientRect().height) : null,
    기록버튼: /오늘 연습 기록하기/.test(frame.textContent),
  };
});
console.log('달력이 보이는가', JSON.stringify(v));
/* ── 날짜를 고르면 그날 것이 밑에 뜬다 ────────────────────────────
   전에는 날짜를 누르면 팝업이 떴고, 기록 없는 날은 토스트만 나왔다.
   이제 검은 동그라미가 그날로 옮겨 가고 달력 밑 칸이 그날 것으로 바뀐다. */
const day = async n => {
  await p.click('[data-day="' + n + '"]');
  await p.waitForTimeout(350);
  return p.evaluate(() => {
    const pan = document.querySelector('[data-daypanel]');
    const on = [...document.querySelectorAll('[data-day]')].find(e =>
      /background:\s*var\(--ns-ink\)/.test(e.firstElementChild.getAttribute('style') || ''));
    return {
      검은동그라미: on ? on.dataset.day : null,
      머리: pan ? (pan.firstElementChild.textContent || '').trim() : null,
      한마디: pan ? pan.querySelectorAll('[data-dp-cm]').length : 0,
      스윙: pan ? pan.querySelectorAll('[data-dp-sw]').length : 0,
      없다고말함: pan ? /이 날의 기록이 없어요/.test(pan.textContent) : false,
    };
  });
};
const 오늘 = new Date().getDate();
const 어제 = 오늘 > 1 ? 오늘 - 1 : 1;
const 기록있는날 = await day(오늘);
const 빈날 = await day(어제);
await p.screenshot({ path: '_2b_day.png' });

// 요약 칸의 한마디를 누르면 상세(pc1)로
await p.click('[data-day="' + 오늘 + '"]');
await p.waitForTimeout(300);
const 눌러서상세 = await p.evaluate(async () => {
  const e = document.querySelector('[data-dp-cm]');
  if (!e) return { 없음: true };
  e.click();
  await new Promise(r => setTimeout(r, 400));
  return { 화면: S.route };
});

console.log('오늘(기록 있음)', JSON.stringify(기록있는날));
console.log('어제(기록 없음)', JSON.stringify(빈날));
console.log('한마디 눌러서 ', JSON.stringify(눌러서상세));
console.log(v.스크롤없이보임 && v.달력칸수 === 1 && !v.기록버튼
  && String(기록있는날.검은동그라미) === String(오늘)
  && String(빈날.검은동그라미) === String(어제) && 빈날.없다고말함
  ? '통과' : '실패!');
await b.close(); srv.close();
