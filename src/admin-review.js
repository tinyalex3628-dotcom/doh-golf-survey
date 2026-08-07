"use strict";
/* ── 월간 요약 ────────────────────────────────────────────────────────
   한 달치를 한 장으로 묶는다. 이 파일이 지키는 선이 셋 있다 —

   ① 기계는 「중요한 것」을 못 고른다. 그래서 안 고른다.
      대신 「반복해서 말한 것」만 센다. 세면 나오는 사실이라 틀릴 수가 없다.
      「이번 달 핵심은 어깨입니다」는 판단이고, 「어깨 이야기를 세 번 하셨어요」는
      사실이다. 우리는 뒤엣것만 말한다.

   ② 문장은 프로가 고른다. 기계는 미리 체크만 해두고, 빼고 더하는 건 사람이 한다.
      잘못 고른 문장 하나가 「이번 달 요약」으로 가면 그건 없느니만 못하다.

   ③ 프로의 한 줄이 없으면 못 보낸다. 회원이 읽는 마지막 문장은 언제나 사람이 쓴다.
      이게 없으면 이 앱은 그냥 통계 앱이다. */

/* 스윙에서 실제로 쓰는 말. 이 목록은 「기계가 알아듣는 말」의 전부다 —
   여기 없는 말도 자주 나오면 잡히지만, 같은 횟수면 이쪽이 이긴다.
   프로가 새로 쓰는 말이 생기면 여기에 더하면 된다. */
const SW_TERMS = [
  '어깨', '골반', '허리', '무릎', '손목', '팔꿈치', '머리', '시선', '턱',
  '왼팔', '오른팔', '왼발', '오른발', '왼쪽', '오른쪽', '상체', '하체', '체중',
  '그립', '어드레스', '테이크백', '백스윙', '탑', '다운스윙', '임팩트', '팔로우', '피니시',
  '회전', '축', '스웨이', '리버스', '캐스팅', '릴리즈', '코킹', '힌지',
  '템포', '리듬', '스탠스', '정렬', '볼', '헤드', '샤프트', '페이스', '궤도', '스핀',
  '슬라이스', '훅', '뒤땅', '탑핑', '생크', '비거리', '방향',
];

/* 뜻이 비는 말. 자주 나오지만 「이번 달 이야기」가 될 수는 없다. */
const SW_STOP = [
  '스윙', '영상', '이번', '다음', '지금', '조금', '정도', '부분', '느낌', '생각',
  '때문', '그리고', '하지만', '그래서', '이렇게', '저렇게', '그렇게', '여기', '거기',
  '오늘', '어제', '내일', '이번달', '한번', '다시', '계속', '아직', '먼저', '나중',
  '자체', '경우', '상태', '모습', '가지', '이거', '그거', '저거', '우리', '자기',
  '사람', '문제', '연습', '동작', '자세', '정말', '진짜', '아주', '매우', '너무',
];

/* 조사 — 뒤에 붙은 것을 떼면 대개 명사가 남는다. 긴 것부터 떼야
   「에서」를 「에」로 잘못 자르지 않는다. */
const SW_JOSA = [
  '에서는', '에서도', '으로는', '까지는', '부터는', '이라는', '라는',
  '에서', '에게', '한테', '으로', '까지', '부터', '보다', '처럼', '마다', '조차',
  '밖에', '이나', '거나', '라도', '이라', '와', '과', '은', '는', '이', '가',
  '을', '를', '에', '의', '도', '만', '로', '랑',
];

function swStem(w) {
  for (let i = 0; i < SW_JOSA.length; i++) {
    const j = SW_JOSA[i];
    if (w.length > j.length + 1 && w.slice(-j.length) === j) return w.slice(0, -j.length);
  }
  return w;
}

/* 한 달치 한마디에서 「반복해서 말한 것」을 센다.
   같은 한마디 안에서 다섯 번 말한 건 한 번으로 친다 — 그건 한 번 한 이야기다.
   두 개 이상의 한마디에 걸쳐 나와야 「이번 달 이야기」다. */
function rvTheme(comments) {
  const seen = {};                       // 낱말 → 그 낱말이 나온 한마디 수
  comments.forEach(c => {
    const words = new Set();
    String(c.body || '').split(/[^가-힣0-9]+/).forEach(raw => {
      if (raw.length < 2) return;
      const w = swStem(raw);
      if (w.length < 2) return;
      if (SW_STOP.indexOf(w) >= 0) return;
      words.add(w);
    });
    words.forEach(w => { seen[w] = (seen[w] || 0) + 1; });
  });
  const list = Object.keys(seen)
    .filter(w => seen[w] >= 2)
    .map(w => ({ w: w, n: seen[w], known: SW_TERMS.indexOf(w) >= 0 }))
    // 같은 횟수면 스윙에서 실제로 쓰는 말이 이긴다. 그다음은 긴 말 —
    // 「왼팔」이 「팔」보다 무엇을 말하는지가 분명하다.
    .sort((a, b) => b.n - a.n || (b.known - a.known) || b.w.length - a.w.length);
  return list.length ? list[0] : null;
}

/* 한마디를 문장으로 쪼갠다. 마침표가 없는 한마디가 흔해서,
   못 쪼개면 통째로 한 문장으로 본다 — 말을 중간에서 자르느니 길게 둔다. */
function rvSentences(body) {
  const out = String(body || '')
    .split(/(?<=[.!?…])\s+|\n+/)
    .map(x => x.trim())
    .filter(x => x.length >= 6);
  return out.length ? out : [String(body || '').trim()].filter(x => x.length >= 4);
}

/* 프로에게 보여줄 문장 후보. 주제어가 든 문장이 먼저 오고, 기계가
   미리 체크해 두는 건 그중 앞의 둘까지다 — 셋을 넘기면 요약이 아니다. */
function rvCandidates(comments, theme) {
  const out = [];
  comments.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .forEach(c => {
      rvSentences(c.body).forEach((s, i) => {
        out.push({
          key: c.id + ':' + i, body: s, at: c.created_at,
          hit: !!(theme && s.indexOf(theme.w) >= 0),
        });
      });
    });
  const hits = out.filter(x => x.hit);
  const rest = out.filter(x => !x.hit);
  const sorted = hits.concat(rest);
  sorted.forEach((x, i) => { x.on = x.hit && i < 2; });
  return sorted;
}

/* 한 회원의 한 달 — 숫자는 전부 세어서 나온다. 실력·향상도 같은
   평가는 넣지 않는다. 이 앱은 스윙을 채점하지 않는다. */
function rvMonthKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function rvBuild(memberId, monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const from = new Date(y, m - 1, 1).getTime();
  const to = new Date(y, m, 1).getTime();
  const inM = t => { const x = new Date(t).getTime(); return x >= from && x < to; };

  const mine = (IN.list || []).filter(s => s.owner === memberId);
  const ups = mine.filter(s => inM(s.created_at));
  const cms = [];
  mine.forEach(s => (s.comments || []).forEach(c => { if (inM(c.created_at)) cms.push(c); }));

  // 연습한 날 — 같은 날 두 편을 올려도 하루다
  const days = new Set(ups.map(s => {
    const d = new Date(s.created_at);
    return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate();
  }));

  // 클럽 — 안 고르고 올린 것이 많아서, 있는 것만 센다
  const clubs = {};
  ups.forEach(s => { if (s.club) clubs[s.club] = (clubs[s.club] || 0) + 1; });

  // 지난달과 견주기 — 늘었다 줄었다만 말하고 잘잘못은 안 매긴다
  const pm = new Date(y, m - 2, 1);
  const pk = rvMonthKey(pm);
  const pFrom = pm.getTime(), pTo = new Date(y, m - 1, 1).getTime();
  const pUps = mine.filter(s => {
    const x = new Date(s.created_at).getTime(); return x >= pFrom && x < pTo;
  });
  const pDays = new Set(pUps.map(s => {
    const d = new Date(s.created_at);
    return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate();
  }));

  const theme = rvTheme(cms);
  return {
    month: monthKey, prevMonth: pk,
    stats: {
      vids: ups.length, days: days.size, cms: cms.length,
      prevVids: pUps.length, prevDays: pDays.size,
      clubs: clubs,
      first: mine.length ? mine.map(s => s.created_at).sort()[0] : null,
    },
    theme: theme,
    cands: rvCandidates(cms, theme),
    comments: cms,
  };
}

/* 브라우저 밖(시험)에서도 셈을 그대로 검사할 수 있게 내보낸다 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { rvTheme, rvSentences, rvCandidates, swStem, SW_TERMS, SW_STOP };
}

/* ── CRM 화면 ─────────────────────────────────────────────────────────
   왼쪽에 회원, 오른쪽에 그 사람의 한 달. 도착함과 같은 짜임이라
   프로가 새로 배울 것이 없다. */
const RV = { sel: null, month: null, on: {}, line: {}, busy: false, list: null, sw: null };

/* 이 화면이 지금 열어 둔 스윙. 도착함의 작업대(inMount)가 이걸 보고
   같은 배선을 붙인다 — 선 긋기·확대·캡처가 그대로 돈다. */
function rvSwing() {
  const list = (IN.list || []).filter(x => x.id === RV.sw);
  return list[0] || null;
}

/* 이번 달에 이 회원 스윙에서 캡처한 사진 전부 — 어느 스윙에서 찍었든
   한 달 요약에는 같이 실린다. */
function rvShots(memberId, monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const from = new Date(y, m - 1, 1).getTime(), to = new Date(y, m, 1).getTime();
  const out = [];
  (IN.list || []).forEach(sw => {
    if (sw.owner !== memberId) return;
    const t = new Date(sw.created_at).getTime();
    if (t < from || t >= to) return;
    (IN.photos[sw.id] || []).forEach(u => out.push(u));
  });
  return out;
}

function rvMonths() {
  const now = new Date();
  const out = [];
  for (let i = 0; i < 6; i++) out.push(rvMonthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  return out;
}
const rvLabel = k => { const [y, m] = k.split('-'); return (+m) + '월'; };

/* 이미 보낸 것 — reviews 는 도착함과 따로 받는다(늦게 와도 화면은 돈다) */
function rvLoad(force) {
  if (RV.busy || (RV.list && !force)) return;
  RV.busy = true;
  (NS.reviews ? NS.reviews() : Promise.resolve([])).then(l => {
    RV.list = l || []; RV.busy = false; if (S.nav === 'fb') render();
  }).catch(() => { RV.list = []; RV.busy = false; });
}
const rvSent = (owner, month) =>
  (RV.list || []).find(r => r.owner === owner && r.month === month) || null;

function rvPage() {
  if (!IN.ready) { inLoad(); return `<div style="flex:1;display:flex;align-items:center;
    justify-content:center;background:var(--ns-bg);color:var(--ns-ink3);font-size:13px">
    불러오는 중…</div>`; }
  rvLoad();
  const month = RV.month || rvMonths()[0];
  const people = crmRoster().filter(m => m.n > 0);
  const sel = people.find(m => m.id === RV.sel) || people[0] || null;
  const mo = S.view === 'mo';

  const left = `<div style="flex:none;${mo ? 'width:100%;max-height:32vh' : 'width:clamp(210px,17vw,270px)'};
      display:flex;flex-direction:column;background:var(--ns-card);
      ${mo ? 'border-bottom' : 'border-right'}:1px solid var(--ns-line)">
    <div style="flex:none;padding:11px 13px;border-bottom:1px solid var(--ns-line);
      display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      ${rvMonths().slice(0, 4).map(k => `<span data-rv-month="${k}" style="font-size:11.5px;
        font-weight:${k === month ? 700 : 600};color:${k === month ? '#FFF' : 'var(--ns-ink2)'};
        background:${k === month ? 'var(--ns-green)' : 'var(--ns-sand)'};border-radius:8px;
        padding:4px 9px;cursor:pointer">${rvLabel(k)}</span>`).join('')}
    </div>
    <div style="flex:1;overflow-y:auto">
      ${people.length ? people.map(m => {
        const done = rvSent(m.id, month);
        const on = sel && m.id === sel.id;
        return `<div data-rv-mem="${esc(m.id)}" style="display:flex;align-items:center;gap:9px;
          padding:11px 13px;border-bottom:1px solid var(--ns-line);cursor:pointer;
          background:${on ? 'var(--ns-soft)' : 'transparent'};
          box-shadow:${on ? 'inset 3px 0 0 var(--ns-green)' : 'none'}">
          <span style="flex:1;min-width:0;font-size:12.5px;font-weight:700;color:var(--ns-ink);
            overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name)}</span>
          ${done ? `<span style="flex:none;font-size:10px;font-weight:700;color:var(--ns-green)">
            보냄${done.read_at ? ' · 읽음' : ''}</span>`
            : `<span style="flex:none;font-size:10px;font-weight:600;color:var(--ns-ink3)">
            아직</span>`}
        </div>`;
      }).join('') : `<div style="padding:26px 14px;text-align:center;font-size:12px;
        color:var(--ns-ink3)">스윙을 올린 회원이 아직 없어요</div>`}
    </div></div>`;

  if (!sel) return `<div style="flex:1;display:flex;background:var(--ns-bg)">${left}</div>`;

  const b = rvBuild(sel.id, month);
  const st = b.stats;
  const sent = rvSent(sel.id, month);
  const line = RV.line[sel.id + month] != null ? RV.line[sel.id + month]
             : (sent ? sent.pro_line : '');
  const chosen = RV.on[sel.id + month];
  const cands = b.cands.map(x => Object.assign({}, x,
    { on: chosen ? chosen.indexOf(x.key) >= 0 : x.on }));
  const picked = cands.filter(x => x.on);

  const dnum = (now, was) => {
    const d = now - was;
    if (!was && !now) return '';
    if (!d) return `<span style="font-size:10.5px;color:var(--ns-ink3)">지난달과 같음</span>`;
    return `<span style="font-size:10.5px;font-weight:700;color:var(--ns-ink3);
      font-family:var(--font-num)">지난달 ${was} → ${now}</span>`;
  };
  const num = (t, v, unit, tail) => `<div style="flex:1;min-width:96px;background:var(--ns-card);
      border:1px solid var(--ns-line);border-radius:12px;padding:13px 14px;display:flex;
      flex-direction:column;gap:4px">
    <span style="font-size:11px;font-weight:700;color:var(--ns-ink3)">${t}</span>
    <span style="display:flex;align-items:baseline;gap:4px">
      <span style="font-size:22px;font-weight:700;color:var(--ns-ink);font-family:var(--font-num);
        letter-spacing:-.02em">${v}</span>
      <span style="font-size:12px;font-weight:600;color:var(--ns-ink3)">${unit}</span></span>
    ${tail || ''}</div>`;

  const right = `<div style="flex:1;min-width:0;display:flex;flex-direction:column;
      overflow-y:auto;padding:18px 20px 26px;gap:14px">
    <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap">
      <span style="font-size:17px;font-weight:700;color:var(--ns-ink)">${esc(sel.name)}</span>
      <span style="font-size:12.5px;color:var(--ns-ink3)">${rvLabel(month)} 한 달</span>
      <span style="flex:1"></span>
      ${sent ? `<span style="font-size:11px;font-weight:700;color:var(--ns-green)">
        ${esc(inWhen(sent.created_at))} 보냄 — 다시 보내면 덮어씁니다</span>` : ''}
    </div>

    <div style="display:flex;gap:9px;flex-wrap:wrap">
      ${num('연습한 날', st.days, '일', dnum(st.days, st.prevDays))}
      ${num('올린 영상', st.vids, '개', dnum(st.vids, st.prevVids))}
      ${num('보낸 한마디', st.cms, '개', '')}
    </div>

    <div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
      padding:15px 16px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">
          이번 달 반복해서 말한 것</span>
        ${b.theme ? `<span style="font-size:12px;font-weight:800;color:#FFF;
          background:var(--ns-bronze);border-radius:8px;padding:2px 9px">${esc(b.theme.w)}</span>
          <span style="font-size:11px;color:var(--ns-ink3)">한마디 ${b.theme.n}개에 나왔어요</span>`
          : `<span style="font-size:11.5px;color:var(--ns-ink3)">
            같은 이야기가 두 번 이상 나온 게 없어요 — 주제 없이 보냅니다</span>`}
      </div>
      <span style="font-size:11px;color:var(--ns-ink3);line-height:1.6">
        세어서 나온 것입니다. 「무엇이 중요한가」는 기계가 못 고르니 안 고릅니다.</span>
    </div>

    <div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
      padding:15px 16px;display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">회원에게 보낼 문장</span>
        <span style="font-size:11.5px;color:var(--ns-ink3)">
          ${picked.length}개 고름 — 빼거나 더하세요</span>
      </div>
      ${cands.length ? `<div style="display:flex;flex-direction:column;gap:6px;max-height:230px;
        overflow-y:auto">${cands.map(x => `<span data-rv-pick="${esc(x.key)}"
          style="display:flex;align-items:flex-start;gap:9px;padding:9px 11px;border-radius:10px;
          border:1px solid ${x.on ? 'var(--ns-green)' : 'var(--ns-line)'};
          background:${x.on ? 'var(--ns-soft)' : 'transparent'};cursor:pointer">
          <span style="flex:none;width:15px;height:15px;margin-top:2px;border-radius:5px;
            border:2px solid ${x.on ? 'var(--ns-green)' : 'var(--ns-line)'};
            background:${x.on ? 'var(--ns-green)' : 'transparent'};display:flex;
            align-items:center;justify-content:center;color:#FFF;font-size:9px;
            font-weight:900">${x.on ? '✓' : ''}</span>
          <span style="flex:1;min-width:0;font-size:12.5px;line-height:1.65;
            color:var(--ns-ink2)">${esc(x.body)}</span>
          <span style="flex:none;font-size:10px;color:var(--ns-ink3);font-family:var(--font-num)">
            ${esc(inWhen(x.at))}</span>
        </span>`).join('')}</div>`
        : `<span style="font-size:12px;color:var(--ns-ink3);padding:8px 0">
          이번 달에 보낸 한마디가 없어요. 숫자만 보내거나, 한마디를 먼저 남기세요.</span>`}
    </div>

    ${rvWorkbench(sel, month, mo)}

    <div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
      padding:15px 16px;display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
        <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">AI 로 초안 뽑기</span>
        <span style="font-size:11.5px;color:var(--ns-ink3)">
          이번 달 한마디 ${b.comments.length}개를 물어볼 글로 만들어 복사합니다</span>
      </div>
      <span style="font-size:11.5px;color:var(--ns-ink3);line-height:1.7">
        누르면 클립보드에 담깁니다. ChatGPT·클로드에 붙여넣고 나온 초안을
        <b style="color:var(--ns-ink2)">고쳐서</b> 아래 한 줄에 쓰세요 —
        그대로 붙여넣지는 마세요. 회원이 읽는 마지막 문장은 프로가 쓴 것이어야 합니다.
      </span>
      <span data-rv-ai style="align-self:flex-start;padding:9px 15px;border-radius:10px;
        border:1px solid var(--ns-green);color:var(--ns-green);font-size:12px;font-weight:700;
        cursor:pointer;background:var(--ns-card)">물어볼 글 복사하기</span>
    </div>

    <div style="background:var(--ns-card);border:1.5px solid var(--ns-green);border-radius:13px;
      padding:15px 16px;display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:13px;font-weight:700;color:var(--ns-green)">
          이도형 프로의 한 줄</span>
        <span style="font-size:11.5px;color:var(--ns-ink3)">
          이게 없으면 못 보냅니다 — 회원이 읽는 마지막 문장입니다</span>
      </div>
      <textarea data-rv-line rows="3" placeholder="한 달 보시고 하고 싶은 말 한 줄"
        style="width:100%;padding:12px 13px;border:1px solid var(--ns-line);border-radius:11px;
        background:#FBFAF6;font-family:inherit;font-size:13px;line-height:1.7;
        color:var(--ns-ink);resize:vertical">${esc(line)}</textarea>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="flex:1;font-size:11px;color:var(--ns-ink3)">
          숫자와 문장은 기계가 모았습니다. 마지막 줄만 프로가 씁니다.</span>
        <span data-rv-send style="flex:none;padding:11px 20px;border-radius:11px;
          background:${line.trim() ? 'var(--ns-green)' : 'var(--ns-line)'};
          color:${line.trim() ? '#FFF' : 'var(--ns-ink3)'};font-size:12.5px;font-weight:700;
          cursor:${line.trim() ? 'pointer' : 'default'}">
          ${sent ? '다시 보내기' : '보내기'}</span>
      </div>
    </div></div>`;

  return `<div style="flex:1;display:flex;min-width:0;background:var(--ns-bg);
    ${mo ? 'flex-direction:column;overflow-y:auto' : ''}">${left}${right}</div>`;
}

/* 한 달 안의 스윙을 골라 열고, 선 긋고, 캡처해서 요약에 붙인다.
   도착함과 같은 작업대다 — 프로가 새로 배울 것이 없다. */
function rvWorkbench(sel, month, mo) {
  const [y, m] = month.split('-').map(Number);
  const from = new Date(y, m - 1, 1).getTime(), to = new Date(y, m, 1).getTime();
  const ups = (IN.list || []).filter(sw => {
    if (sw.owner !== sel.id) return false;
    const t = new Date(sw.created_at).getTime();
    return t >= from && t < to;
  }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const shots = rvShots(sel.id, month);

  const head = `<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">
    <span style="font-size:13px;font-weight:700;color:var(--ns-ink)">스윙에서 사진 뽑기</span>
    <span style="font-size:11.5px;color:var(--ns-ink3)">
      ${ups.length ? '이번 달 올린 ' + ups.length + '개 중에서 골라 선을 긋고 캡처하세요'
                   : '이번 달에 올린 스윙이 없어요'}</span>
    ${shots.length ? `<span style="flex:1"></span>
      <span style="font-size:11.5px;font-weight:700;color:var(--ns-green)">
        ${shots.length}장 붙어 있어요</span>` : ''}
  </div>`;

  if (!ups.length) {
    return `<div style="background:var(--ns-card);border:1px solid var(--ns-line);
      border-radius:13px;padding:15px 16px">${head}</div>`;
  }

  const chips = `<div style="display:flex;gap:6px;flex-wrap:wrap">
    ${ups.map(sw => {
      const on = RV.sw === sw.id;
      const n = (IN.photos[sw.id] || []).length;
      return `<span data-rv-sw="${esc(sw.id)}" style="font-size:11.5px;font-weight:${on ? 700 : 600};
        color:${on ? '#FFF' : 'var(--ns-ink2)'};
        background:${on ? 'var(--ns-green)' : 'var(--ns-sand)'};border-radius:8px;
        padding:5px 10px;cursor:pointer">${esc(inWhen(sw.created_at))} · ${esc(sw.view)}
        ${n ? ' 📷' + n : ''}</span>`;
    }).join('')}
    ${RV.sw ? `<span data-rv-swx style="font-size:11.5px;font-weight:600;color:var(--ns-ink3);
      background:transparent;border:1px solid var(--ns-line);border-radius:8px;
      padding:5px 10px;cursor:pointer">닫기</span>` : ''}
  </div>`;

  const open = rvSwing();
  return `<div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:13px;
      padding:15px 16px;display:flex;flex-direction:column;gap:10px">
    ${head}${chips}
    ${open ? `<div style="display:flex;${mo ? 'flex-direction:column' : ''};gap:12px;
      border-top:1px solid var(--ns-line);padding-top:12px">${wbVideo(open, mo)}</div>` : ''}
    ${shots.length ? `<div style="display:flex;flex-direction:column;gap:8px;padding:11px 12px;
        border:1.5px solid var(--ns-green);border-radius:12px;background:var(--ns-soft)">
      <span style="font-size:11.5px;font-weight:700;color:var(--ns-green)">
        📷 요약에 붙는 사진 ${shots.length}장</span>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${shots.map((u, i) =>
        `<span style="position:relative;display:block;width:78px">
          <img src="${u}" style="width:78px;border-radius:9px;display:block;
            border:1px solid var(--ns-line)">
          <span data-rv-shotx="${i}" title="빼기" style="position:absolute;right:-6px;top:-6px;
            width:20px;height:20px;border-radius:50%;background:var(--ns-danger);color:#fff;
            display:flex;align-items:center;justify-content:center;font-size:12px;
            font-weight:700;cursor:pointer">×</span></span>`).join('')}</div>
    </div>` : ''}
  </div>`;
}

/* AI 에게 물어볼 글을 만든다.
   앱이 직접 AI 를 부르지 않는 이유 — 브라우저에 들어가는 열쇠는 누구나 꺼내
   쓸 수 있어서, 그 순간 요금이 남의 손에 넘어간다. 서버가 생기기 전까지는
   프로가 직접 붙여넣는 것이 가장 안전하고 가장 빠르다.
   대신 「무엇을 물을지」는 앱이 정해준다 — 프롬프트가 곧 품질이다. */
/* 클립보드가 막힌 브라우저(구형·비보안 출처)에서는 옛 방법으로 */
function rvFallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('style', 'position:fixed;left:-9999px;top:0');
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); }
  catch (e) { toast('복사가 안 돼요 · 브라우저를 확인해주세요'); }
  ta.remove();
}

function rvPrompt(sel, month, b) {
  const st = b.stats;
  const lines = b.comments.slice()
    .sort((a, c) => new Date(a.created_at) - new Date(c.created_at))
    .map(c => {
      const d = new Date(c.created_at);
      // 괄호를 빼면 '- ' + 7 + 1 이 되어 「71월」이 된다
      return '- ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일: '
        + String(c.body || '').replace(/\s+/g, ' ');
    });
  return [
    '너는 골프 레슨 프로의 글쓰기를 돕는다. 아래는 내가 한 회원에게 이번 달에 보낸',
    '피드백 전부다. 이걸 회원에게 보낼 「월간 요약」의 마지막 한 줄 초안으로 만들어라.',
    '',
    '조건:',
    '- 두세 문장, 존댓말, 담백하게. 과장·칭찬 남발 금지.',
    '- 이번 달 반복해서 지적한 것 하나와, 다음 달에 볼 것 하나를 담아라.',
    '- 점수·등급·실력 평가는 쓰지 마라. 스윙을 채점하지 않는다.',
    '- 이모지, 「회원님」 표현은 쓰지 마라.',
    '- 서로 다른 세 가지 안을 제시해라.',
    '',
    '회원: ' + sel.name,
    '기간: ' + rvLabel(month),
    '연습한 날 ' + st.days + '일 · 올린 영상 ' + st.vids + '개 · 보낸 한마디 ' + st.cms + '개',
    (b.theme ? '반복해서 말한 것: ' + b.theme.w + ' (한마디 ' + b.theme.n + '개에 나옴)' : ''),
    '',
    '내가 보낸 피드백:',
  ].filter(x => x !== null).join('\n') + '\n' + lines.join('\n');
}

function rvWire() {
  on('[data-rv-ai]', 'click', () => {
    const m = RV.month || rvMonths()[0];
    const people = crmRoster().filter(x => x.n > 0);
    const sel = people.find(x => x.id === RV.sel) || people[0];
    if (!sel) return;
    const b = rvBuild(sel.id, m);
    if (!b.comments.length) return toast('이번 달 보낸 한마디가 없어요');
    const text = rvPrompt(sel, m, b);
    const done = () => toast('복사했어요 · ChatGPT 에 붙여넣으세요');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => rvFallbackCopy(text, done));
    } else rvFallbackCopy(text, done);
  });
  on('[data-rv-sw]', 'click', e => { RV.sw = e.currentTarget.dataset.rvSw; render(); });
  on('[data-rv-swx]', 'click', () => { RV.sw = null; render(); });
  on('[data-rv-shotx]', 'click', e => {
    const m = RV.month || rvMonths()[0];
    const people = crmRoster().filter(x => x.n > 0);
    const sel = people.find(x => x.id === RV.sel) || people[0];
    if (!sel) return;
    // 몇 번째 사진인지로 어느 스윙의 것인지 되짚는다
    let k = +e.currentTarget.dataset.rvShotx;
    const [y, mm] = m.split('-').map(Number);
    const from = new Date(y, mm - 1, 1).getTime(), to = new Date(y, mm, 1).getTime();
    const ups = (IN.list || []).filter(sw => sw.owner === sel.id
      && new Date(sw.created_at).getTime() >= from && new Date(sw.created_at).getTime() < to);
    for (let i = 0; i < ups.length; i++) {
      const arr = IN.photos[ups[i].id] || [];
      if (k < arr.length) { arr.splice(k, 1); break; }
      k -= arr.length;
    }
    render();
  });
  on('[data-rv-month]', 'click', e => { RV.month = e.currentTarget.dataset.rvMonth; render(); });
  on('[data-rv-mem]', 'click', e => { RV.sel = e.currentTarget.dataset.rvMem; render(); });
  on('[data-rv-line]', 'input', e => {
    const m = RV.month || rvMonths()[0];
    const sel = RV.sel || (crmRoster().filter(x => x.n > 0)[0] || {}).id;
    RV.line[sel + m] = e.target.value;
    /* 버튼 색만 바꾼다 — 여기서 다시 그리면 글 쓰는 도중에 칸이 사라진다 */
    const btn = document.querySelector('[data-rv-send]');
    if (btn) {
      const okk = !!e.target.value.trim();
      btn.style.background = okk ? 'var(--ns-green)' : 'var(--ns-line)';
      btn.style.color = okk ? '#FFF' : 'var(--ns-ink3)';
      btn.style.cursor = okk ? 'pointer' : 'default';
    }
  });
  on('[data-rv-pick]', 'click', e => {
    const m = RV.month || rvMonths()[0];
    const people = crmRoster().filter(x => x.n > 0);
    const sel = people.find(x => x.id === RV.sel) || people[0];
    if (!sel) return;
    const k = sel.id + m;
    const b = rvBuild(sel.id, m);
    if (!RV.on[k]) RV.on[k] = b.cands.filter(x => x.on).map(x => x.key);
    const key = e.currentTarget.dataset.rvPick;
    const i = RV.on[k].indexOf(key);
    if (i >= 0) RV.on[k].splice(i, 1); else RV.on[k].push(key);
    render();
  });
  on('[data-rv-send]', 'click', () => {
    const m = RV.month || rvMonths()[0];
    const people = crmRoster().filter(x => x.n > 0);
    const sel = people.find(x => x.id === RV.sel) || people[0];
    if (!sel) return;
    const k = sel.id + m;
    const sent0 = rvSent(sel.id, m);
    const line = (RV.line[k] != null ? RV.line[k] : (sent0 ? sent0.pro_line : '')).trim();
    if (!line) return toast('마지막 한 줄을 써주세요 — 이게 없으면 못 보냅니다');
    const b = rvBuild(sel.id, m);
    const keys = RV.on[k] || b.cands.filter(x => x.on).map(x => x.key);
    const picks = b.cands.filter(x => keys.indexOf(x.key) >= 0)
      .map(x => ({ body: x.body, at: x.at }));
    const shots = rvShots(sel.id, m);
    NS.sendReview(sel.id, m, {
      stats: b.stats, theme: b.theme ? b.theme.w : null, picks: picks, pro_line: line,
      photos: shots.length ? shots : null,
    }).then(() => {
      toast(sel.name + '님에게 ' + rvLabel(m) + ' 요약을 보냈어요');
      RV.list = null; rvLoad(true); render();
    }).catch(e2 => toast('보내지 못했어요 · ' + ((e2 && e2.message) || '')));
  });
}
