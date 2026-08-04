/* ── DOH 스윙분석 엔진 ────────────────────────────────────────────────
   판정 로직은 pose_poc/analyzer2.html 의 dohCheck / runDohRules 를 그대로 옮긴 것.
   앱이 지켜야 할 규칙 3가지:
     ① 모르는 VF### 는 무시한다 (엔진은 측정을 append-only 로 늘린다)
     ② value:null 은 "이 각도에선 측정 불가" — 0 으로 취급하지 않는다
     ③ 판정 기준은 /v1/rules 에서 받은 것만 쓴다 (하드코딩 금지)
   프로토타입에서는 서버 대신 __DOH.rules / __DOH.example 을 그 응답으로 쓴다.  */

/* ── 우리말 사전 ──────────────────────────────────────────────────
   엔진 정본(doh_rules.v1.json)의 nm·why 는 개발자용이다. 'X-Factor 이상',
   '리버스 피벗', 'tush line 이탈', '⚠️ 스케일 보정 전' 같은 말이 회원 화면에
   그대로 나가면 안 된다. 정본은 손대지 않고 여기서 화면에 쓸 말만 갈아 끼운다.
   여기 없는 규칙은 설명 줄을 아예 안 띄운다 — 개발자 메모가 새는 것보다 낫다. */
const RULE_KO = {
  sway:            ['백스윙에서 몸이 옆으로 밀려요',
                    '제자리에서 돌아야 하는데 오른쪽으로 밀리면 돌아올 자리를 잃습니다.'],
  reverse_pivot:   ['톱에서 체중이 반대로 실려요',
                    '올라갈 때 오른발에 실려야 하는데 왼발에 남아 있어요.'],
  shoulder_tilt_p1:['어드레스에서 어깨가 수평이에요',
                    '오른손잡이는 오른 어깨가 조금 낮게 서야 자연스럽게 올라갑니다.'],
  reverse_spine:   ['톱에서 허리가 타깃 쪽으로 꺾여요',
                    '상체가 왼쪽으로 기울면 허리에 부담이 갑니다.'],
  hip_slide:       ['내려올 때 골반이 옆으로 밀려요',
                    '골반은 돌아야 하는데 미끄러지면 힘이 안 실립니다.'],
  hanging_back:    ['임팩트에 체중이 뒤에 남아요',
                    '칠 때 왼발로 넘어가야 하는데 오른발에 남아 있어요.'],
  loss_posture:    ['백스윙에서 자세가 무너져요',
                    '설 때 만든 허리 각도가 올라가는 동안 바뀌었어요.'],
  standing_up:     ['임팩트에서 몸이 일어나요',
                    '칠 때 상체가 처음보다 서면 공을 제대로 맞히기 어렵습니다.'],
  chicken_wing:    ['치고 나서 왼팔이 접혀요',
                    '팔이 접히면 클럽이 몸 쪽으로 빠져 방향이 흔들립니다.'],
  flying_elbow:    ['톱에서 오른 팔꿈치가 들려요',
                    '팔꿈치가 몸에서 멀어지면 내려오는 길이 멀어집니다.'],
  overswing:       ['백스윙이 너무 커요',
                    '필요 이상 올리면 톱에서 몸이 흔들립니다.'],
  under_rotation:  ['톱에서 상체가 덜 돌았어요',
                    '어깨가 충분히 안 돌면 팔로만 치게 됩니다.'],
  xfactor:         ['상체와 골반이 벌어진 정도',
                    '어깨와 골반의 각도 차이예요. 너무 작으면 힘이 안 모이고, 너무 크면 몸에 무리가 갑니다.'],
  trail_knee:      ['톱에서 오른 무릎이 펴져요',
                    '무릎이 펴지면 하체에 모아둔 힘이 풀립니다.'],
  head_dip:        ['백스윙에서 머리가 위아래로 움직여요',
                    '머리 높이가 흔들리면 공을 맞히는 지점이 매번 달라집니다.'],
  tempo:           ['올라가는 속도와 내려오는 속도',
                    '올라가는 시간이 내려오는 시간의 세 배쯤일 때 리듬이 안정적입니다.'],
  early_ext:       ['내려올 때 엉덩이가 공 쪽으로 나와요',
                    '엉덩이가 앞으로 나오면 팔 지나갈 자리가 없어져 손으로 빼게 됩니다.'],
  ott:             ['내려올 때 손이 바깥으로 나와요',
                    '클럽이 바깥에서 들어오면 슬라이스가 납니다.'],
};
/* 결과를 읽고 나서 '내일 연습장에서 뭘 하지'에 답이 없으면 앱을 끈다.
   문제로 나온 것 하나에만 드릴을 붙인다 — 한 번에 하나씩이 이 앱의 방식이다. */
const DRILL_KO = {
  sway: ['벽에 오른 엉덩이 대고 백스윙 20회', '벽이 밀리지 않게 제자리에서만 도세요.'],
  reverse_pivot: ['오른발 안쪽을 밟고 백스윙 20회', '올라갈 때 오른 허벅지 안쪽이 눌리는 느낌을 찾으세요.'],
  shoulder_tilt_p1: ['오른손을 조금 아래로 잡고 어드레스 10회', '자연히 오른 어깨가 낮아집니다. 그 느낌을 기억하세요.'],
  reverse_spine: ['머리 뒤에 클럽 대고 백스윙 15회', '클럽이 오른쪽으로 기울어야 해요. 왼쪽으로 넘어가면 반대입니다.'],
  hip_slide: ['오른발 바깥에 클럽 세우고 다운스윙 20회', '골반이 클럽을 안 건드리게 돌리세요.'],
  hanging_back: ['왼발만 밟고 스윙 15회', '칠 때 왼발로 완전히 넘어가는 느낌을 만듭니다.'],
  loss_posture: ['등에 클럽 대고 백스윙 20회', '클럽이 등에서 떨어지면 자세가 무너진 거예요.'],
  standing_up: ['벽에 엉덩이 대고 임팩트까지 20회', '치는 동안 엉덩이가 벽에서 떨어지지 않게.'],
  chicken_wing: ['수건을 왼 겨드랑이에 끼고 스윙 20회', '수건이 안 떨어지게 치면 팔이 접히지 않습니다.'],
  flying_elbow: ['오른 겨드랑이에 헤드커버 끼고 백스윙 20회', '톱까지 안 떨어지게 올려보세요.'],
  overswing: ['왼팔이 수평될 때까지만 올려서 20회', '짧게 쳐도 거리가 크게 안 줄어드는 걸 확인하세요.'],
  under_rotation: ['등을 타깃 쪽으로 보낸다 생각하고 백스윙 20회', '어깨가 아니라 등이 돌아간다고 생각하면 더 돌아갑니다.'],
  xfactor: ['발 모으고 스윙 20회', '발을 붙이면 골반이 덜 돌아서 상체와의 차이가 자연스럽게 잡힙니다.'],
  trail_knee: ['오른 무릎 굽힌 채로 백스윙 20회', '올라가는 동안 무릎 각도를 그대로 두세요.'],
  head_dip: ['벽 앞에 서서 머리 대고 백스윙 15회', '머리가 벽에서 떨어지거나 눌리면 출렁인 거예요.'],
  tempo: ['하나-둘-셋에 올리고 넷에 치기 20회', '숫자를 소리 내어 세면서 치세요.'],
  early_ext: ['벽에 엉덩이 대고 다운스윙 20회', '내려올 때 엉덩이가 벽에 붙어 있어야 합니다.'],
  ott: ['공 바깥쪽에 헤드커버 놓고 스윙 20회', '안 건드리고 치면 안에서 들어오는 길입니다.'],
};
/* 어느 구간을 보고 그렇게 판단했는지. 근거가 없으면 '틀린 것 같다'로만 읽힌다. */
const WHEN_KO = {
  sway: '백스윙', reverse_pivot: '톱', shoulder_tilt_p1: '어드레스', reverse_spine: '톱',
  hip_slide: '다운스윙', hanging_back: '임팩트', loss_posture: '백스윙', standing_up: '임팩트',
  chicken_wing: '임팩트 뒤', flying_elbow: '톱', overswing: '톱', under_rotation: '톱',
  xfactor: '톱', trail_knee: '톱', head_dip: '백스윙', tempo: '스윙 전체',
  early_ext: '다운스윙', ott: '전환',
};
/* 규칙 안쪽 '무엇을 쟀나' 줄. 엔진 정본의 라벨은 'X-Factor @P4' 처럼
   구간 코드가 그대로 박혀 있어서, 100타 치는 사람에겐 암호다.
   정본은 안 건드리고 화면에 쓰는 말만 여기서 갈아 끼운다.
   기준은 오른손잡이다 — 앱의 다른 글(왼팔 각 · 오른 엉덩이)과 같은 기준이다. */
const CHECK_KO = {
  'X-Factor @P4':                        '톱에서 상체와 골반이 벌어진 정도',
  '어깨 회전각 @P4':                      '톱에서 어깨가 얼마나 돌았는지',
  '어깨 기울기 @P1':                      '설 때 양 어깨 높이가 같은지',
  '척추 좌우기울기 @P4':                  '톱에서 상체가 옆으로 기울었는지',
  '척추각 변화 P1→P4':                    '백스윙에서 숙인 각도가 바뀌었는지',
  '척추각 변화 P1→P7':                    '임팩트에서 숙인 각도가 바뀌었는지',
  '머리 좌우이동 P1→P4':                  '백스윙에서 머리가 옆으로 움직였는지',
  '머리 상하이동 P1→P4':                  '백스윙에서 머리가 위아래로 움직였는지',
  '골반 좌우이동 P1→P4':                  '백스윙에서 골반이 옆으로 밀렸는지',
  '골반 좌우이동 P4→P7':                  '내려올 때 골반이 옆으로 밀렸는지',
  '골반 볼쪽 이동 P5→P7 (tush line 이탈)': '내려올 때 엉덩이가 공 쪽으로 나왔는지',
  '골반 상승 P5→P7 (벨트버클 뜸)':         '내려올 때 골반이 위로 들렸는지',
  '골반 위치 @P7 (P1대비)':               '임팩트 때 골반이 처음보다 얼마나 나갔는지',
  '리드팔 수직각 @P4':                    '톱에서 왼팔이 얼마나 올라갔는지',
  '리드팔 굽힘각 @P7':                    '임팩트 때 왼팔이 굽었는지',
  '트레일 무릎 굽힘 @P4':                 '톱에서 오른 무릎이 펴졌는지',
  '트레일 팔꿈치 높이 @P4':               '톱에서 오른 팔꿈치가 어디쯤인지',
  '손 깊이변화 P4→P6':                    '내려올 때 손이 몸에서 멀어졌는지',
  '템포 비율(백:다운)':                    '올라가는 시간과 내려오는 시간의 비율',
};
const checkName = l => CHECK_KO[l] || String(l).replace(/\s*@?P\d+(→P\d+)?\s*/g, ' ').trim();

const P_KO = { P1: '어드레스', P2: '테이크어웨이', P3: '왼팔 수평', P4: '톱', P5: '다운 시작',
               P6: '클럽 수평', P7: '임팩트', P8: '릴리즈', P9: '폴로스루', P10: '피니시' };
/* 엔진 경고 → 회원이 알아들을 말. 여기 없는 경고는 화면에 안 띄운다. */
const WARN_KO = {
  object_engine_absent: '이번 영상에선 클럽과 공도 못 잡았어요.',
  view_mismatch: '찍은 각도 때문에 건너뛴 항목도 있어요.',
};
const confWord = c => (c >= 0.85 ? '높음' : c >= 0.7 ? '보통' : '낮음');
const ruleName = r => (RULE_KO[r.id] || [r.nm])[0];
const ruleWhy = r => (RULE_KO[r.id] || [])[1] || '';

const INF = 1e9;
const dohNum = x => (x === 'INF' ? INF : x === '-INF' ? -INF : x);
/* 스윙에 '심함'은 없다. 병이 아니라 습관이다.
   4단계는 그대로 두고 화면에 쓰는 말만 셋으로 줄인다. 세기는 색으로만 나눈다. */
const LVL_NM = ['잘 되고 있어요', '조금 아쉬워요', '고칠 것', '고칠 것'];
const LVL_COLOR = ['#21402F', '#7D5D2E', '#A6402D', '#8C2F1F'];   // 주의 등급 대비 보정

/* 한 구간 판정 */
function dohCheck(fd, c) {
  const f = fd[c.vf];
  if (!f) return { ok: false, c, txt: '측정 없음' };
  if (f.value == null) {
    const vm = (f.error_flags || []).includes('view_mismatch');
    return { ok: false, c, f, txt: vm ? '이 촬영각도에선 측정 불가' : '측정 실패' };
  }
  const v = f.value, t = c.t;
  const tv = t === 'high' ? v : t === 'low' ? -v : t === 'abs' ? Math.abs(v) : -Math.abs(v);
  const B = c.B.map(dohNum);
  const lvl = tv < B[0] ? 0 : tv < B[1] ? 1 : tv < B[2] ? 2 : 3;
  return { ok: true, c, f, v, tv, lvl };
}

/* 규칙 전체 판정 — lvl null 이면 판정불가 */
function runDohRules(fd, rules) {
  return rules.map(r => {
    const checks = r.checks.map(c => dohCheck(fd, c));
    const avail = checks.filter(x => x.ok);
    const lvl = avail.length ? Math.max(...avail.map(x => x.lvl)) : null;
    const conf = avail.length ? Math.max(...avail.map(x => x.f.confidence || 0)) : 0;
    return { r, checks, lvl, conf, low: lvl != null && lvl >= 2 && conf < 0.5 };
  });
}

/* ── 결과 화면 렌더 ──────────────────────────────────────────────── */
const E = { BG: '#F3EFE8', CARD: '#FFFDF9', FOREST: '#21402F', INK: '#1D2420', SOFT: '#F2F8F4',
            INK2: '#4A4638', INK3: '#6E6858', INK4: '#6E6858', LINE: '#E4DED2', SAND: '#EFE9DE' };
const NUMF = 'font-family:var(--font-num)';

function esc(s) { return String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }

/* 잘 된 것부터 센다. '문제 9'가 빨갛게 맨 앞에 있으면 나머지를 안 읽는다. */
function tally(res) {
  const n = k => res.filter(k).length;
  return [
    ['잘 되고 있어요', n(x => x.lvl === 0), E.FOREST],
    ['조금 아쉬워요', n(x => x.lvl === 1), LVL_COLOR[1]],
    ['오늘 볼 것', n(x => x.lvl != null && x.lvl >= 2), LVL_COLOR[2]],
  ];
}

function ruleCard(x) {
  const na = x.lvl == null;
  const col = na ? E.INK4 : LVL_COLOR[x.lvl];
  const badge = na ? '이번엔 못 봄' : LVL_NM[x.lvl] + (x.low ? ' (확실치 않아요)' : '');
  // 회원 화면에서는 측정값·기준밴드·VF 코드를 안 보여준다.
  // 숫자를 이해하려면 엔진을 알아야 하고, 모르면 '틀린 것 같다'로만 읽힌다.
  const rows = x.checks.map(ck => {
    const state = ck.ok ? LVL_NM[ck.lvl]
      : ck.txt === '측정 없음' ? '이번엔 못 봄' : ck.txt;
    const col = ck.ok ? LVL_COLOR[ck.lvl] : E.INK4;
    return `<div style="display:flex;gap:8px;padding:7px 0;border-top:1px solid #F2ECE2">
      <span style="flex:1;font-size:11px;font-weight:500;color:${E.INK2}">${esc(checkName(ck.c.lab))}</span>
      <span style="font-size:10.5px;font-weight:600;color:${col}">${esc(state)}</span></div>`;
  }).join('');

  return `<div style="background:${E.CARD};border:1px solid ${E.LINE};border-radius:12px;padding:13px 14px;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:9px" data-rule-head>
      <span style="width:6px;height:6px;border-radius:50%;background:${col};flex:none"></span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;
          color:${na ? E.INK3 : E.INK}">${esc(ruleName(x.r))}</span>
        ${WHEN_KO[x.r.id] ? `<span style="font-size:10px;font-weight:500;color:${E.INK4}">${WHEN_KO[x.r.id]}에서 봤어요</span>` : ''}
      </span>
      <span style="flex:none;white-space:nowrap;font-size:10px;font-weight:600;color:${col};
        background:${na ? E.SAND : col + '18'};border-radius:6px;padding:4px 8px">${badge}</span>
    </div>
    <div style="display:none;margin-top:9px" data-rule-detail>
      ${ruleWhy(x.r) ? `<div style="font-size:11px;font-weight:400;color:${E.INK3};line-height:1.65;padding-bottom:4px">${esc(ruleWhy(x.r))}</div>` : ''}
      ${rows}
    </div>
  </div>`;
}

function renderEngineResult(host, data, rules) {
  const fd = {};
  data.features.forEach(f => { fd[f.feature_id] = f; });
  const res = runDohRules(fd, rules);
  const order = { 3: 0, 2: 1, 1: 2, 0: 3 };
  const judged = res.filter(x => x.lvl != null).sort((a, b) => order[a.lvl] - order[b.lvl]);
  const nas = res.filter(x => x.lvl == null);

  // P1 · 55f 는 회원이 알 이유가 없다. 구간 이름과 몇 초쯤인지로 바꾼다.
  const fps = data.source.fps_effective || 30;
  const chips = data.swing_events.map(e =>
    `<span style="flex:none;background:${E.CARD};border:1px solid ${E.LINE};border-radius:8px;padding:6px 10px;
      font-size:11px;font-weight:600;color:${E.INK}" data-p-chip data-frame="${e.frame}">${P_KO[e.p] || e.p}
      <span style="color:${E.INK4};font-weight:500;${NUMF}"> ${(e.frame / fps).toFixed(1)}초</span></span>`).join('');

  /* 오늘 할 것 — 제일 심한 것 하나만. 여러 개를 주면 하나도 안 한다. */
  const worst = judged.find(x => x.lvl >= 2) || judged.find(x => x.lvl === 1);
  const dr = worst && DRILL_KO[worst.r.id];
  const todo = dr
    ? `<div style="margin-top:14px;background:${E.FOREST};border-radius:14px;padding:16px 16px 15px">
        <div style="font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(255,255,255,.62);
          ${NUMF}">오늘 할 것</div>
        <div style="margin-top:8px;font-size:16px;font-weight:700;letter-spacing:-.03em;
          color:#fff;line-height:1.4">${esc(dr[0])}</div>
        <div style="margin-top:7px;font-size:11.5px;font-weight:400;color:rgba(255,255,255,.72);
          line-height:1.65">${esc(dr[1])}</div>
        <div style="margin-top:11px;padding-top:11px;border-top:1px solid rgba(255,255,255,.14);
          font-size:11px;font-weight:500;color:rgba(255,255,255,.62);line-height:1.6">
          왜 하나요 — ${esc(ruleName(worst.r))}${ruleWhy(worst.r) ? ' · ' + esc(ruleWhy(worst.r)) : ''}</div>
      </div>`
    : `<div style="margin-top:14px;background:${E.SOFT || '#F2F8F4'};border:1px solid #DCE7DE;
        border-radius:14px;padding:15px 16px">
        <div style="font-size:13px;font-weight:700;color:${E.FOREST}">오늘은 고칠 게 안 보여요</div>
        <div style="margin-top:6px;font-size:11.5px;font-weight:400;color:${E.INK2};line-height:1.65">
          지금 치던 대로 하시면 됩니다. 다음 영상에서 다시 볼게요.</div>
      </div>`;

  /* 한 번에 다 보여주면 하나도 안 고친다. 눈에 띄는 셋만 펴두고 나머지는 접는다. */
  const head = judged.slice(0, 3);
  const rest = judged.slice(3);

  /* 잘못된 게 많이 나온 날. 숫자만 던지면 그날로 앱을 끈다. */
  const bad = judged.filter(x => x.lvl >= 2).length;
  const calm = bad >= 3
    ? `<div style="margin-top:12px;background:${E.SOFT};border:1px solid #DCE7DE;border-radius:12px;
        padding:12px 14px;font-size:11.5px;font-weight:500;color:${E.FOREST};line-height:1.65">
        한 번에 다 고치지 않습니다. 오늘은 위의 하나만 하세요.<br>
        ${bad}가지가 한꺼번에 나온 건 대부분 원인이 하나라서예요.</div>`
    : '';

  const counts = tally(res).map(([nm, n, col]) =>
    `<span style="flex:1;text-align:center">
      <span style="display:block;font-size:19px;font-weight:600;color:${col};${NUMF};letter-spacing:-.03em">${n}</span>
      <span style="display:block;font-size:10px;font-weight:500;color:${E.INK3};margin-top:2px">${nm}</span></span>`).join('');

  // 측정 상태판(VF031 측정 없음 …)은 개발자용 표다. 회원 화면에서 뺀다.
  // 못 본 항목이 몇 개인지는 아래 '못 본 항목' 줄 하나로 충분하다.

  // 엔진 경고를 우리말로. 사전에 없는 경고는 아예 안 띄운다 —
  // 'object_engine_absent: club/ball features unavailable' 이 그대로 나가면 고장으로 읽힌다.
  // 엔진 경고는 따로 늘어놓지 않고 '틀릴 수 있다' 문장에 붙인다.
  // 'object_engine_absent: club/ball features unavailable' 이 그대로 나가면 고장으로 읽힌다.
  const warn = (data.quality.warnings || [])
    .map(w => WARN_KO[String(w).split(':')[0].trim()])
    .filter(Boolean).map(t => ' ' + esc(t)).join('');

  const capBar = t => `<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 1px 9px">
    <span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:${E.INK3}">${t}</span></div>`;

  host.innerHTML = `
    <div style="padding:8px 0 4px">
      <div style="font-size:11px;font-weight:500;color:${E.INK3}">${
        data.source.camera_view === 'FO' ? '정면에서 찍은 스윙' : '측면에서 찍은 스윙'} ·
        ${data.source.handedness === 'right' ? '오른손잡이' : '왼손잡이'}</div>
      <div style="font-size:19px;font-weight:400;letter-spacing:-.025em;color:${E.INK};line-height:1.45;margin-top:7px">
        이번 스윙에서<br />${judged.length}가지를 확인했어요</div>
    </div>

    <div style="background:${E.CARD};border:1px solid ${E.LINE};border-radius:12px;padding:13px 8px;
                display:flex;margin-top:14px">${counts}</div>

    ${todo}
    ${calm}

    <div style="margin-top:20px">${capBar('스윙 구간')}
      <div style="display:flex;gap:6px;flex-wrap:wrap">${chips}</div></div>

    <div style="margin-top:20px">${capBar('무엇을 봤나')}
      ${head.map(ruleCard).join('')}
      ${rest.length ? `<div style="background:${E.SAND};border-radius:11px;padding:11px 13px;margin-top:2px">
        <div style="display:flex;align-items:center;gap:8px" data-more-head>
          <span style="flex:1;font-size:11.5px;font-weight:500;color:${E.INK3}">나머지 ${rest.length}가지도 보기</span>
          <span style="font-size:10.5px;font-weight:600;color:${E.INK2}">펼치기</span></div>
        <div style="display:none;margin-top:9px" data-more-body>${rest.map(ruleCard).join('')}</div></div>` : ''}
    </div>

    <div style="margin-top:22px;padding-bottom:4px;background:${E.CARD};border:1px solid ${E.LINE};
                border-radius:14px;padding:16px 16px 15px">
      <div style="font-size:14px;font-weight:700;letter-spacing:-.025em;color:${E.INK}">
        AI 분석은 여기까지예요</div>
      <div style="margin-top:8px;font-size:12px;font-weight:400;color:${E.INK2};line-height:1.7">
        영상에 보이는 각도만 보기 때문에 틀릴 수 있어요.${warn}
        왜 그렇게 되는지는 사람이 봐야 압니다.</div>
      <span style="display:block;margin-top:15px;background:${E.FOREST};color:#fff;border-radius:12px;
        padding:15px;text-align:center;font-size:14px;font-weight:600;letter-spacing:-.02em"
        data-e3-pro>프로에게 확인받기</span>
    </div>`;

  // 진단 카드 펼치기
  host.querySelectorAll('[data-rule-head]').forEach(h => {
    h.style.cursor = 'pointer';
    h.dataset.tapped = '1';
    h.addEventListener('click', () => {
      const d = h.parentElement.querySelector('[data-rule-detail]');
      d.style.display = d.style.display === 'none' ? 'block' : 'none';
    });
  });
  const moreHead = host.querySelector('[data-more-head]');
  if (moreHead) {
    moreHead.style.cursor = 'pointer';
    moreHead.dataset.tapped = '1';
    moreHead.addEventListener('click', () => {
      const b = host.querySelector('[data-more-body]');
      const open = b.style.display !== 'none';
      b.style.display = open ? 'none' : 'block';
      moreHead.lastElementChild.textContent = open ? '펼치기' : '접기';
    });
  }
  return { res, judged, nas };
}
