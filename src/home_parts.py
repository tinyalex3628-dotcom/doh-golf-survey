# -*- coding: utf-8 -*-
"""홈 레이아웃 3안 — 참고 화면에서 가져온 구조 + 이번 달 남은 한마디.

   참고 화면에서 훔칠 만한 것 (색이 아니라 구조):
     ① 맨 위가 '프로'다.        얼굴 · 이름 · "민수님과 6번째" — 앱이 아니라 사람이 말을 건다
     ② 내 이름으로 부른다.      "민수님, 기다리던 게 왔어요"
     ③ 프로가 한 일을 적는다.   "24번 돌려보며 두 가지를 짚었어요" — 노동이 보여야 값을 한다
     ④ 안에 뭐가 있는지 먼저.   분석 영상 12:24 · 음성 코멘트 0:32 — 열기 전에 안다
     ⑤ 카드 수를 줄이고 크게.   덩어리 3개 정도, 글씨는 키운다

   여기에 요청받은 것 하나: 이번 달 남은 프로 한마디.
   숫자만 던지면 재촉으로 읽힌다 — '쓰라'가 아니라 '남아 있다'로 보이게 한다.
"""
BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE, SOFT = '#E4DED2', '#EFE9DE', '#A67C3D', '#F2F8F4'
BR_SOFT = 'rgba(166,124,61,.10)'
NUM = 'font-family:var(--font-num)'

CHEV = '<path d="m9 5 7 7-7 7"></path>'
BUBBLE = '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"></path>'
PLAY = '<path d="M8 5.5v13l11-6.5z"></path>'
ENVELOPE = ('<rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect>'
            '<path d="m3.8 7 8.2 6 8.2-6"></path>')
CAM = ('<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
       '<path d="m16 11 5-3v8l-5-3z"></path>')


def ic(d, w=16, sw='1.8'):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;'
            f'display:block">{d}</svg>')


def cap(t, sub=''):
    s = f'<span style="font-size:10px;font-weight:500;color:{INK4}">{sub}</span>' if sub else ''
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;'
            'padding:0 1px 9px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;'
            f'color:{INK3}">{t}</span>{s}</div>')


# ── 이번 달 남은 프로 한마디 — 3가지 표현 ────────────────────────────
def quota_dots(used=2, total=6, dark=False):
    """알약을 채워서 보여준다. 남은 게 '자리'로 보인다."""
    on = BRONZE if not dark else '#D6B178'
    off = SAND if not dark else 'rgba(255,255,255,.16)'
    lab = INK3 if not dark else 'rgba(255,255,255,.55)'
    val = INK if not dark else '#fff'
    dots = ''.join(f'<span style="flex:1;height:5px;border-radius:99px;'
                   f'background:{on if i < used else off}"></span>' for i in range(total))
    return (f'<span style="flex:1;display:flex;flex-direction:column;gap:7px">'
            f'<span style="display:flex;align-items:baseline;justify-content:space-between">'
            f'<span style="font-size:11.5px;font-weight:500;color:{lab}">이번 달 프로 한마디</span>'
            f'<span style="font-size:11.5px;font-weight:700;color:{val};{NUM}">'
            f'{total - used}회 남음</span></span>'
            f'<span style="display:flex;gap:3px">{dots}</span></span>')


def quota_row(used=2, total=6):
    """카드 한 줄. 남은 횟수 + 바로 쓰는 버튼."""
    return f'''<div data-h-quota style="flex:none;background:{CARD};border:1px solid {LINE};
              border-radius:14px;padding:14px 15px;display:flex;align-items:center;gap:12px">
    <span style="flex:none;width:34px;height:34px;border-radius:10px;background:{BR_SOFT};
                 color:{BRONZE};display:flex;align-items:center;justify-content:center">
      {ic(BUBBLE, 16, '1.8')}</span>
    {quota_dots(used, total)}
  </div>'''


def quota_inline(used=2, total=6):
    """헤더 옆 작은 알약 — 자리를 거의 안 먹는다."""
    return (f'<span data-h-quota style="display:inline-flex;align-items:center;gap:5px;'
            f'background:{BR_SOFT};border-radius:99px;padding:5px 10px">'
            f'<span style="color:{BRONZE};display:flex">{ic(BUBBLE, 11, "2")}</span>'
            f'<span style="font-size:10.5px;font-weight:700;color:{BRONZE};{NUM}">'
            f'한마디 {total - used}회</span></span>')


# ── 프로 히어로 카드 (참고 화면의 ①②③④) ────────────────────────────
def pro_hero(dark=True):
    bg = FOREST if dark else CARD
    bd = '' if dark else f'border:1px solid {LINE};'
    tx = '#fff' if dark else INK
    sub = 'rgba(255,255,255,.55)' if dark else INK3
    body = 'rgba(255,255,255,.78)' if dark else INK2
    chip = 'rgba(255,255,255,.11)' if dark else SAND
    chiptx = 'rgba(255,255,255,.86)' if dark else INK2
    btn_bg = '#F6F3EC' if dark else FOREST
    btn_tx = INK if dark else '#fff'
    ring = 'rgba(255,255,255,.2)' if dark else LINE
    dot_on = '#D6B178' if dark else BRONZE
    dot_off = 'rgba(255,255,255,.22)' if dark else SAND

    dots = ''.join(f'<span style="width:5px;height:5px;border-radius:50%;'
                   f'background:{dot_on if i == 5 else dot_off}"></span>' for i in range(6))
    chips = ''.join(
        f'<span style="display:inline-flex;align-items:center;gap:5px;background:{chip};'
        f'border-radius:8px;padding:6px 10px;font-size:10.5px;font-weight:600;color:{chiptx}">'
        f'<span style="display:flex">{ic(d, 11, "2")}</span>{t}</span>'
        for d, t in [(CAM, '분석 영상 12:24'), (BUBBLE, '음성 코멘트 0:32')])

    return f'''<div data-h-hero style="flex:none;background:{bg};{bd}border-radius:18px;
              padding:16px 16px 15px;position:relative;overflow:hidden">
    <span style="position:absolute;right:-40px;top:-40px;width:130px;height:130px;
                 border-radius:50%;background:rgba(255,255,255,.04)"></span>

    <div style="display:flex;align-items:center;gap:10px">
      <span style="flex:none;width:38px;height:38px;border-radius:50%;background:{SOFT};
                   color:{FOREST};display:flex;align-items:center;justify-content:center;
                   font-size:14px;font-weight:700;border:1.5px solid {ring}">이</span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:{tx}">이도형 프로</span>
        <span style="font-size:10.5px;font-weight:500;color:{sub}">KPGA · 골프러버님과 6번째</span></span>
      <span style="flex:none;display:flex;gap:4px;align-items:center">{dots}</span>
    </div>

    <div style="margin-top:15px;font-size:20px;font-weight:600;letter-spacing:-.035em;
                color:{tx};line-height:1.42">골프러버님,<br>기다리던 게 왔어요</div>

    <div style="margin-top:9px;font-size:12px;font-weight:500;color:{body};line-height:1.7">
      지난주 올려주신 드라이버 스윙, <b style="color:{tx};font-weight:700">24번</b> 돌려보며
      두 가지를 짚었어요.</div>

    <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">{chips}</div>

    <div style="margin-top:14px;background:{btn_bg};color:{btn_tx};border-radius:12px;padding:14px;
                text-align:center;font-size:14px;font-weight:600;letter-spacing:-.02em">
      피드백 확인하기</div>
  </div>'''


# ── 이번 주 연습 (참고 화면의 둥근 요일 점) ──────────────────────────
def week_round(dark=False):
    bg = 'rgba(255,255,255,.05)' if dark else CARD
    bd = '' if dark else f'border:1px solid {LINE};'
    tx = '#fff' if dark else INK
    sub = 'rgba(255,255,255,.5)' if dark else INK3
    days = ['일', '월', '화', '수', '목', '금', '토']
    done = [1, 1, 0, 1, 0, 0, 0]
    today = 3
    cells = ''
    for i, d in enumerate(days):
        if done[i]:
            circ = f'background:{FOREST};border:none'
            mark = ('<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" '
                    'stroke-linecap="round" stroke-linejoin="round" '
                    'style="width:12px;height:12px"><path d="m5 12.5 5 5 9-10"></path></svg>')
        else:
            circ = (f'background:transparent;border:1.5px {"solid" if i < today else "dashed"} '
                    f'{LINE if not dark else "rgba(255,255,255,.2)"}')
            mark = ''
        ring = (f'box-shadow:0 0 0 3px {SOFT if not dark else "rgba(255,255,255,.09)"}'
                if i == today else '')
        cells += (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px">'
                  f'<span style="font-size:10.5px;font-weight:{700 if i == today else 500};'
                  f'color:{tx if i == today else sub}">{d}</span>'
                  f'<span style="width:30px;height:30px;border-radius:50%;{circ};{ring};'
                  f'display:flex;align-items:center;justify-content:center">{mark}</span></span>')
    return f'''<div data-h-week style="flex:none;background:{bg};{bd}border-radius:16px;
              padding:15px 13px 16px">
    <div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 3px 13px">
      <span style="font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:{tx}">이번 주 연습</span>
      <span style="font-size:11px;font-weight:500;color:{sub}">3일 · 스윙 올린 날</span></div>
    <div style="display:flex;gap:2px">{cells}</div>
  </div>'''


# ── 다음 정기 피드백 한 줄 ───────────────────────────────────────────
def next_fb(dark=False):
    bg = 'rgba(255,255,255,.05)' if dark else CARD
    bd = '' if dark else f'border:1px solid {LINE};'
    tx = '#fff' if dark else INK
    sub = 'rgba(255,255,255,.5)' if dark else INK3
    return f'''<div data-h-next style="flex:none;background:{bg};{bd}border-radius:14px;
              padding:14px 15px;display:flex;align-items:center;gap:12px">
    <span style="flex:1;display:flex;flex-direction:column;gap:3px">
      <span style="font-size:10.5px;font-weight:500;color:{sub}">다음 정기 피드백</span>
      <span style="font-size:14px;font-weight:600;letter-spacing:-.02em;color:{tx}">
        7월 27일 (월)</span></span>
    <span style="flex:none;background:{SOFT};color:{FOREST};border-radius:9px;padding:7px 11px;
                 font-size:12px;font-weight:700;{NUM}">D-5</span>
  </div>'''


# ── 최근 프로 한마디 타임라인 (지금 홈에 있는 것, 압축판) ────────────
def recent_tl():
    rows = [('6시간 전', '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서…', True),
            ('7월 15일', '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요.', False)]
    out = ''
    for i, (when, txt, new) in enumerate(rows):
        dot = BRONZE if new else INK4
        line = (f'<span style="position:absolute;left:4px;top:14px;bottom:-14px;width:1.5px;'
                f'background:{LINE}"></span>' if i == 0 else '')
        out += (f'<div data-h-tl style="position:relative;padding-left:20px;'
                f'{"padding-bottom:14px" if i == 0 else ""}">{line}'
                f'<span style="position:absolute;left:0;top:4px;width:9px;height:9px;'
                f'border-radius:50%;border:2px solid {dot};background:{CARD}"></span>'
                f'<div style="display:flex;align-items:baseline;gap:7px">'
                f'<span style="font-size:11px;font-weight:700;color:{BRONZE if new else INK3};'
                f'{NUM}">{when}</span>'
                f'<span style="font-size:10.5px;font-weight:500;color:{INK4}">이도형 프로</span></div>'
                f'<div style="margin-top:4px;font-size:12px;font-weight:500;color:{INK2};'
                f'line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;'
                f'-webkit-box-orient:vertical;overflow:hidden">{txt}</div></div>')
    return (f'<div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:14px;'
            f'padding:15px 15px 14px">{out}</div>')


def stat_row():
    cells = [('3', '일', '주간 연습'), ('12', '개', '등록 스윙'), ('5', '일', '연속 기록')]
    out = ''
    for i, (n, u, lab) in enumerate(cells):
        div = (f'<span style="width:1px;height:26px;background:{LINE}"></span>'
               if i else '')
        out += (f'{div}<span style="flex:1;display:flex;flex-direction:column;align-items:center;'
                f'gap:4px"><span style="display:flex;align-items:baseline;gap:1px">'
                f'<span style="font-size:19px;font-weight:700;color:{INK};{NUM}">{n}</span>'
                f'<span style="font-size:11px;font-weight:600;color:{INK3}">{u}</span></span>'
                f'<span style="font-size:10.5px;font-weight:500;color:{INK3}">{lab}</span></span>')
    return (f'<div data-h-stat style="flex:none;background:{CARD};border:1px solid {LINE};'
            f'border-radius:14px;padding:14px 6px;display:flex;align-items:center">{out}</div>')
