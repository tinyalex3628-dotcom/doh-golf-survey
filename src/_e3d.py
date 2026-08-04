# -*- coding: utf-8 -*-
p = 'engine-runtime.js'
s = open(p, encoding='utf-8').read()
n = 0
def sub(old, new, why):
    global s, n
    assert s.count(old) == 1, f'[{why}] {s.count(old)}건'
    s = s.replace(old, new); n += 1; print('  ✓', why)

# ① 판정 이름 — '심함'은 진단서 말이다. 100타 치는 사람이 상처받는다.
sub("const LVL_NM = ['정상', '주의', '과다', '심함'];",
    """/* 스윙에 '심함'은 없다. 병이 아니라 습관이다.
   4단계를 그대로 두되 화면에 쓰는 말은 셋으로 줄인다. 색으로만 세기를 나눈다. */
const LVL_NM = ['잘 되고 있어요', '조금 아쉬워요', '고칠 것', '고칠 것'];""", '판정 이름')

# ② 규칙마다 어느 구간인지 — 왜 그렇게 봤는지의 근거가 된다
sub("const P_KO = {", """/* 어느 구간을 보고 그렇게 판단했는지. 근거가 없으면 '틀린 것 같다'로만 읽힌다. */
const WHEN_KO = {
  sway: '백스윙', reverse_pivot: '톱', shoulder_tilt_p1: '어드레스', reverse_spine: '톱',
  hip_slide: '다운스윙', hanging_back: '임팩트', loss_posture: '백스윙', standing_up: '임팩트',
  chicken_wing: '임팩트 뒤', flying_elbow: '톱', overswing: '톱', under_rotation: '톱',
  xfactor: '톱', trail_knee: '톱', head_dip: '백스윙', tempo: '스윙 전체',
  early_ext: '다운스윙', ott: '전환',
};
const P_KO = {""", '구간 사전')

sub("""      <span style="flex:1;font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:${na ? E.INK3 : E.INK}">${esc(ruleName(x.r))}</span>""",
    """      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;
          color:${na ? E.INK3 : E.INK}">${esc(ruleName(x.r))}</span>
        ${WHEN_KO[x.r.id] ? `<span style="font-size:10px;font-weight:500;color:${E.INK4}">${WHEN_KO[x.r.id]}에서 봤어요</span>` : ''}
      </span>""", '카드에 구간 표시')

# ③ 카운트 — 잘 된 걸 먼저 센다
sub("""function tally(res) {
  const n = k => res.filter(k).length;
  return [
    ['문제', n(x => x.lvl != null && x.lvl >= 2), LVL_COLOR[2]],
    ['주의', n(x => x.lvl === 1), LVL_COLOR[1]],
    ['정상', n(x => x.lvl === 0), E.FOREST],
  ];
}""",
    """/* 잘 된 것부터 센다. '문제 9'가 빨갛게 맨 앞에 있으면 나머지를 안 읽는다. */
function tally(res) {
  const n = k => res.filter(k).length;
  return [
    ['잘 되고 있어요', n(x => x.lvl === 0), E.FOREST],
    ['조금 아쉬워요', n(x => x.lvl === 1), LVL_COLOR[1]],
    ['오늘 볼 것', n(x => x.lvl != null && x.lvl >= 2), LVL_COLOR[2]],
  ];
}""", '카운트 순서')

# ④ 목록은 셋까지만. 나머지는 접는다.
sub("""    <div style="margin-top:20px">${capBar('무엇을 봤나')}
      ${judged.map(ruleCard).join('')}
    </div>""",
    """    <div style="margin-top:20px">${capBar('무엇을 봤나')}
      ${head.map(ruleCard).join('')}
      ${rest.length ? `<div style="background:${E.SAND};border-radius:11px;padding:11px 13px;margin-top:2px">
        <div style="display:flex;align-items:center;gap:8px" data-more-head>
          <span style="flex:1;font-size:11.5px;font-weight:500;color:${E.INK3}">나머지 ${rest.length}가지도 보기</span>
          <span style="font-size:10.5px;font-weight:600;color:${E.INK2}">펼치기</span></div>
        <div style="display:none;margin-top:9px" data-more-body>${rest.map(ruleCard).join('')}</div></div>` : ''}
    </div>""", '목록 셋까지')

sub("""  const counts = tally(res).map""",
    """  /* 한 번에 다 보여주면 하나도 안 고친다. 눈에 띄는 셋만 펴두고 나머지는 접는다. */
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

  const counts = tally(res).map""", '격려 + 셋으로 자르기')

sub("""    ${todo}""", """    ${todo}
    ${calm}""", '격려 자리')

# ⑤ 접기 배선
sub("""  return { res, judged, nas };""",
    """  const moreHead = host.querySelector('[data-more-head]');
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
  return { res, judged, nas };""", '더보기 배선')

open(p, 'w', encoding='utf-8').write(s)
print(f'\n{n}곳')
