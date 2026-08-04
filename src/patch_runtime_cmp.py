# -*- coding: utf-8 -*-
"""8번 + 10번 런타임 배선."""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(HERE, 'runtime-v3.js')
src = open(p, encoding='utf-8').read()
n = 0


def sub(old, new, why):
    global src, n
    assert src.count(old) == 1, f'[{why}] {src.count(old)}건'
    src = src.replace(old, new); n += 1
    print(f'  ✓ {why}')


def drop_wire(rid):
    """WIRE 안의 한 라우트 블록을 통째로 지운다."""
    global src, n
    m = re.search(r"\n  '?" + rid + r"'?\(\)\s*\{", src)
    assert m, rid
    d, i = 1, src.index('{', m.start()) + 1
    while d:
        if src[i] == '{': d += 1
        elif src[i] == '}': d -= 1
        i += 1
    if src[i] == ',': i += 1
    j = src.index('\n', i)
    if src[i:j].strip().startswith('//') or not src[i:j].strip(): i = j
    src = src[:m.start()] + src[i:]
    n += 1
    print(f'  ✓ WIRE {rid} 제거')


# ── ① 개발자 패널 목록 ──────────────────────────────────────────────
sub("  ['알림',          ['ar', 'nt', 'ns', 'np']],",
    "  ['알림',          ['ar', 'nt', 'ns']],", 'GROUPS 알림')
sub("  ['영상 분석',      ['08', '10', '11']],",
    "  ['영상 분석',      ['08', '11', 'cg']],", 'GROUPS 영상 분석')
sub("  ['프로와 비교',    ['12', '13', '15']],",
    "  ['프로와 비교',    ['12', '13']],", 'GROUPS 프로와 비교')
sub("  ['피드백 도착',    ['6c', '6d']],",
    "  ['피드백 도착',    ['6d']],", 'GROUPS 피드백 도착')

# ── ② 상태 ─────────────────────────────────────────────────────────
sub("            faq: false, swCompare: false,",
    "            faq: false, swCompare: false,\n"
    "            // 기간 비교 — 몇 달 전 스윙과 나란히 볼지. 목적지는 11 이다.\n"
    "            cmpAgo: '1',\n"
    "            // 업로드 — 한 번이라도 올렸는지(빈 갤러리 판단), 몇 번째 시도인지.\n"
    "            upDone: false, upTry: 0, upFailed: false,", 'S 상태 추가')

# ── ③ 기간 표 ──────────────────────────────────────────────────────
sub("const stage = document.getElementById('stage');",
    "/* 기간 비교에 쓰는 날짜. 데모 계정의 스윙 기록에 맞춰 고정해 뒀다\n"
    "   (r2 여정 3~6월 · 갤러리 6~7월). 실서비스에선 서버가 내려준다. */\n"
    "const CMP_NEW = { long: '7월 22일', short: '7/22' };\n"
    "const CMP_AGO = {\n"
    "  '1': { label: '1개월 전', long: '6월 28일', short: '6/28' },\n"
    "  '2': { label: '2개월 전', long: '5월 24일', short: '5/24' },\n"
    "  '3': { label: '3개월 전', long: '4월 19일', short: '4/19' },\n"
    "};\n\n"
    "const stage = document.getElementById('stage');", '기간 표')

# ── ④ 업로드 실패 분기 ─────────────────────────────────────────────
sub("""    if (p >= 100) {
      msg.textContent = '올리기 끝났어요';""",
    """    if (fail && p >= fail.at) {                 // 중간에 끊기는 경우
      p = fail.at;
      bar.style.width = p + '%'; pct.textContent = p + '%';
      bar.style.background = '#C0392B'; pct.style.color = '#C0392B';
      msg.textContent = '연결이 끊겼어요';
      setTimeout(() => { if (!stopped && box.isConnected) fail.fn(); }, 620);
      return;
    }
    if (p >= 100) {
      msg.textContent = '올리기 끝났어요';""", 'uploadInto 실패 분기')
sub("function uploadInto(box, filename, onDone) {",
    "function uploadInto(box, filename, onDone, fail) {", 'uploadInto 시그니처')

# ── ⑤ 스윙 탭 — 올린 게 하나도 없으면 빈 갤러리 ────────────────────
sub("  const TABS = { '홈': '2a', '연습기록': '2b', '스윙': '09', "
    "'레슨기록': '2f', '마이': '2e' };",
    "  // 스윙 탭은 계정 상태에 따라 갈리는 유일한 탭이다 —\n"
    "  // 아직 한 개도 안 올린 사람에게 남의 스윙 12개를 보여줄 이유가 없다.\n"
    "  const swTab = () => (S.plan === 'free' && !S.upDone) ? 'ge' : '09';\n"
    "  const TABS = { '홈': '2a', '연습기록': '2b', '스윙': swTab, "
    "'레슨기록': '2f', '마이': '2e' };\n"
    "  const dest = d => (typeof d === 'function' ? d() : d);", 'TABS 스윙 분기')
sub("    marked.forEach(c => { const d = TABS[c.dataset.tab]; if (d) tap(c, () => jump(d)); });",
    "    marked.forEach(c => { const d = TABS[c.dataset.tab]; "
    "if (d) tap(c, () => jump(dest(d))); });", 'TABS 마커 배선')
sub("      tap(e.closest('span[style*=\"flex: 1\"]') || e.parentElement, () => jump(TABS[label]));",
    "      tap(e.closest('span[style*=\"flex: 1\"]') || e.parentElement, "
    "() => jump(dest(TABS[label])));", 'TABS 텍스트 배선')

# ── ⑥ 2c 업로드 — 두 번째 시도는 끊긴다 ────────────────────────────
sub("""        drop.dataset.uploading = '1';
        uploadInto(drop, '드라이버_0722.mp4', () => {
          drop.dataset.uploading = '';
          drop.dataset.done = '1';
          toast('스윙 1개가 추가됐어요 · 달력에 기록돼요');
        });""",
    """        drop.dataset.uploading = '1';
        S.upTry += 1;
        // 두 번째 시도는 일부러 끊는다. 실패 화면(uf)이 앱 안에 실제로 있다는 걸
        // 보여주려면 실패가 한 번은 일어나야 한다. 실서비스에선 진짜 실패일 때만.
        const fail = (S.upTry === 2 && !S.upFailed)
          ? { at: 58, fn: () => { S.upFailed = true; go('uf'); } } : null;
        uploadInto(drop, '드라이버_0722.mp4', () => {
          drop.dataset.uploading = '';
          drop.dataset.done = '1';
          S.upDone = true;
          toast('스윙 1개가 추가됐어요 · 달력에 기록돼요');
        }, fail);""", '2c 실패 분기')

# ── ⑦ uf 다시 올리기 — 이번엔 올라간다 ─────────────────────────────
sub("    R('[data-uf-retry]', () => { replaceWith('2c'); toast('다시 올려볼게요'); });",
    "    R('[data-uf-retry]', () => { S.upTry = 0; replaceWith('2c'); "
    "toast('다시 올려볼게요'); });", 'uf 재시도')

# ── ⑧ 숙제 다 하면 결과지가 바뀐다 (r1 → r3) ───────────────────────
sub("""      toast(on ? '숙제를 해제했어요' : '숙제를 완료했어요');
    });
  });""",
    """      toast(on ? '숙제를 해제했어요' : '숙제를 완료했어요');
      // 이번 달 숙제를 다 하면 결과지 자체가 '2/2' 상태로 넘어간다.
      // 체크는 화면 장식이 아니라 다음 달 레슨으로 넘어가는 문이다.
      if (S.route === 'r1' && !on && hw.every(r => r.dataset.done === '1'))
        setTimeout(() => { if (S.route === 'r1') { S.route = 'r3'; render(); } }, 520);
    });
    hw.push(row);
  });""", '숙제 완료 → r3')
sub("  // 숙제 체크 토글\n", "  // 숙제 체크 토글\n  const hw = [];\n", '숙제 배열')

# ── ⑨ 안 쓰는 WIRE 제거 ────────────────────────────────────────────
for rid in ('10', '15', '6c', 'np'):
    drop_wire(rid)

# ── ⑩ 09 — 기간 비교 배너 ──────────────────────────────────────────
sub("    onText('스윙 갤러리', () => toast('전체 12개를 보여드릴게요'));",
    "    onText('스윙 갤러리', () => toast('전체 12개를 보여드릴게요'));\n"
    "    // 기간 비교 배너 — 이 앱이 파는 것 자체라 도구 타일이 아니라 한 줄을 다 준다.\n"
    "    const cmp = root().querySelector('[data-swcmp]');\n"
    "    cmp ? tap(cmp, () => go('cg')) : miss('09 기간 비교 배너');", '09 배너')

# ── ⑪ cg + 11 ──────────────────────────────────────────────────────
sub("""  '11'() {
    selectGroup(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'], ON);""",
    """  /* ── 기간 비교 ──────────────────────────────────────────────────
     "얼마나 좋아졌다"를 숫자로 말해주지 않는다. 두 스윙을 같은 화면에
     놓아줄 뿐이고, 달라진 걸 보는 건 회원이 한다. 같은 구간을 자동으로
     맞추는 건 지금 잘 안 되므로 팝업에서 미리 말하고 들어간다. */
  cg() {
    const box = root();
    const chips = box.querySelectorAll('[data-cg-p]');
    chips.length === 3 || miss('cg 기간 칩 (' + chips.length + '개)');
    const paint = () => {
      chips.forEach(c => {
        const on = c.dataset.cgP === S.cmpAgo;
        c.dataset.on = on ? '1' : '';
        c.style.background = on ? 'var(--ns-green)' : 'var(--ns-card)';
        c.style.borderColor = on ? 'var(--ns-green)' : 'var(--ns-line)';
        if (c.children[0]) c.children[0].style.color = on ? '#FFFFFF' : 'var(--ns-ink)';
        if (c.children[1]) c.children[1].style.color = on ? 'rgba(255,255,255,.66)'
                                                         : 'var(--ns-ink3)';
      });
      const old = box.querySelector('[data-cg-old]');
      if (old) old.textContent = CMP_AGO[S.cmpAgo].long;
    };
    chips.forEach(c => tap(c, () => { S.cmpAgo = c.dataset.cgP; paint(); }));
    paint();
    const R = (sel, fn) => { const e = box.querySelector(sel); e ? tap(e, fn) : miss('cg ' + sel); };
    // 팝업은 히스토리에 안 남긴다 — 비교 화면에서 뒤로 가면 스윙 탭이어야 한다.
    R('[data-cg-go]', () => { const a = CMP_AGO[S.cmpAgo]; replaceWith('11');
                              toast(a.long + ' 스윙을 옆에 놓았어요'); });
    R('[data-cg-no]', back);
    const dim = box.querySelector('[data-cg]');
    if (dim) dim.addEventListener('click', ev => { if (ev.target === dim) back(); });
  },

  '11'() {
    // 어느 기간을 골랐든 같은 화면을 쓴다. 날짜만 갈아 끼운다.
    const a = CMP_AGO[S.cmpAgo] || CMP_AGO['1'];
    const put = (sel, txt) => { const e = root().querySelector(sel);
                                e ? e.textContent = txt : miss('11 ' + sel); };
    put('[data-cmp-sub]', a.long + ' ↔ ' + CMP_NEW.long + ' · 정면');
    put('[data-cmp-old]', '과거 ' + a.short);
    put('[data-cmp-new]', '현재 ' + CMP_NEW.short);
    selectGroup(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'], ON);""", 'cg + 11')

open(p, 'w', encoding='utf-8').write(src)
print(f'\n{n}곳 수정 · {len(src)/1024:.1f} KB')
