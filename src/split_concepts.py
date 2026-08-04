# -*- coding: utf-8 -*-
"""정기 피드백 ↔ 프로 한마디(코멘트) 구분 — 컨셉 4가지 × 화면 4개 = 16장.

   페이지는 두 개념이 실제로 부딪히는 곳으로 골랐다.
     홈 · 연습기록 · 스윙기록 · 정규레슨

   컨셉
     C1 리포트 & 말풍선   형태로 가른다 (어두운 표지 / 말풍선)
     C2 배지 규칙         레이아웃 그대로, 색·아이콘·좌측바 규칙만
     C3 위·아래 규칙      자리로 가른다 (피드백=상단 스트립 / 코멘트=영상 옆)
     C4 서가 & 타임라인   정보구조로 가른다 (백넘버 서가 / 세로 타임라인)
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'handoff-v3', 'design_handoff_next_swing')

BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE = '#E4DED2', '#EFE9DE', '#A67C3D'
SOFT, BR_SOFT = '#F2F8F4', 'rgba(166,124,61,.10)'
NUM = 'font-family:var(--font-num)'

FRAME = ('width:360px;height:740px;background:#FFFDF9;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;flex-direction:column')


# ── 아이콘 ───────────────────────────────────────────────────────────
def ic(d, w=16, sw='1.8', fill='none'):
    return (f'<svg viewBox="0 0 24 24" fill="{fill}" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;display:block">'
            f'{d}</svg>')


BURGER = '<path d="M4 7h16M4 12h16M4 17h16"></path>'
CHEV = '<path d="m9 5 7 7-7 7"></path>'
LEFT = '<path d="m14 6-6 6 6 6"></path>'
RIGHT = '<path d="m10 6 6 6-6 6"></path>'
PLAY = '<path d="M8 5.5v13l11-6.5z"></path>'
ENVELOPE = '<rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect><path d="m3.8 7 8.2 6 8.2-6"></path>'
BUBBLE = ('<path d="M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V7A2.5 2.5 0 0 1 7.5 4.5h10A2.5 2.5 0 0 1 20 7z">'
          '</path>')
CHECK = '<path d="m4 12.5 5 5L20 6"></path>'


# ── 공통 부품 ────────────────────────────────────────────────────────
def statusbar(bg=BG, fg=INK):
    return (f'<div style="flex:none;height:44px;background:{bg};display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 24px;font-size:12px;color:{fg}">'
            f'<span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {fg};border-radius:2px;opacity:.6"></span>'
            f'<span style="width:15px;height:9px;background:{fg};border-radius:2px"></span></span></div>')


def header(title, right=''):
    return (f'<div style="flex:none;height:54px;background:{BG};display:flex;align-items:center;'
            f'gap:11px;padding:0 16px">'
            f'<span style="color:{INK};flex:none">{ic(BURGER, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:19px;font-weight:700;letter-spacing:-.03em;color:{INK}">{title}</b>'
            f'{right}</div>')


def cap(t, sub=''):
    s = f'<span style="font-size:10px;font-weight:500;color:{INK4}">{sub}</span>' if sub else ''
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 1px 9px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:{INK3}">{t}</span>{s}</div>')


def thumb(dur='0:27', w=72, h=72, r=10):
    pb = max(18, min(28, round(min(w, h) * 0.28)))
    badge = (f'<span style="position:absolute;left:4px;bottom:4px;background:rgba(0,0,0,.66);color:#fff;'
             f'font-size:9px;font-weight:700;border-radius:4px;padding:2px 5px;{NUM}">{dur}</span>'
             if min(w, h) >= 58 else '')
    return (f'<span style="flex:none;position:relative;width:{w}px;height:{h}px;border-radius:{r}px;'
            f'overflow:hidden;background:linear-gradient(150deg,#3A3B33,#1D2420)">'
            f'<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">'
            f'<span style="width:{pb}px;height:{pb}px;border-radius:50%;background:rgba(255,255,255,.94);'
            f'display:flex;align-items:center;justify-content:center;color:{INK}">'
            f'<svg viewBox="0 0 24 24" fill="currentColor" style="width:{round(pb*.4)}px;'
            f'height:{round(pb*.4)}px">{PLAY}</svg></span></span>{badge}</span>')


def bottom_nav(active):
    items = [('홈', '<path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"></path>'),
             ('연습기록', '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect>'
                       '<path d="M8 3v4M16 3v4M8.5 13l2.5 2.5 4.5-4.5"></path>'),
             ('스윙기록', '<rect x="3.5" y="4.5" width="17" height="6" rx="2"></rect>'
                       '<rect x="3.5" y="13.5" width="17" height="6" rx="2"></rect>'),
             ('스윙분석', '<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
                       '<path d="m16 11 5-3v8l-5-3z"></path>'),
             ('마이', '<circle cx="12" cy="8.5" r="3.7"></circle><path d="M5 20a7 7 0 0 1 14 0"></path>')]
    cells = ''
    for nm, d in items:
        on = nm == active
        pill = f'background:{SOFT};border-radius:10px;' if on else ''
        cells += (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;'
                  f'color:{FOREST if on else INK4};padding:7px 0 5px;{pill}">{ic(d, 19, "1.7")}'
                  f'<span style="font-size:11px;font-weight:{600 if on else 500}">{nm}</span></span>')
    return (f'<div style="flex:none;height:62px;background:{CARD};border-top:1px solid {LINE};'
            f'display:flex;align-items:flex-start;padding:5px 6px 0">{cells}</div>')


def avatar(sz=30, bg=FOREST, fg='#fff'):
    return (f'<span style="flex:none;width:{sz}px;height:{sz}px;border-radius:50%;background:{bg};color:{fg};'
            f'display:flex;align-items:center;justify-content:center;font-size:{round(sz*.4)}px;'
            f'font-weight:600">이</span>')


def ba_pair(w=64, h=48):
    """Before / After 미니 쌍 — 리포트 표지의 얼굴."""
    def box(lab, on):
        bd = f'2px solid {BRONZE}' if on else '1px solid rgba(255,255,255,.22)'
        return (f'<span style="display:flex;flex-direction:column;gap:4px;align-items:center">'
                f'<span style="width:{w}px;height:{h}px;border-radius:7px;border:{bd};'
                f'background:linear-gradient(150deg,#4A4B42,#2A2B26)"></span>'
                f'<span style="font-size:8.5px;font-weight:600;letter-spacing:.05em;'
                f'color:{"#fff" if on else "rgba(255,255,255,.45)"};{NUM}">{lab}</span></span>')
    return (f'<span style="display:flex;align-items:center;gap:8px">{box("5/27", False)}'
            f'<span style="color:rgba(255,255,255,.4);font-size:12px">→</span>{box("6/27", True)}</span>')


# ═══════════════════════════════════════════════════════════════════
#  컨셉 1 · 리포트 & 말풍선  — 형태로 가른다
# ═══════════════════════════════════════════════════════════════════
def c1_fb_arrived(compact=False):
    if compact:
        return f'''<div style="background:{INK};border-radius:14px;padding:14px 15px;color:#fff">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:10px;font-weight:600;letter-spacing:.16em;color:rgba(255,255,255,.5);{NUM}">7월호</span>
        <span style="flex:1"></span>
        <span style="font-size:12px;font-weight:700;color:{BRONZE};{NUM};letter-spacing:-.02em">No.06</span></div>
      <div style="font-size:15px;font-weight:600;letter-spacing:-.03em;padding:7px 0 10px">톱에서 왼팔 각 잡기</div>
      <div style="display:flex;align-items:center;gap:9px;padding-top:10px;
                  border-top:1px solid rgba(255,255,255,.14)">
        <span style="flex:1;font-size:11px;font-weight:500;color:rgba(255,255,255,.6)">
          숙제 <b style="color:#fff;font-weight:600;{NUM}">2/3</b> · 스윙스코어
          <b style="color:#fff;font-weight:600;{NUM}">74</b></span>
        <span style="font-size:11.5px;font-weight:600;color:#fff;display:flex;align-items:center;gap:4px">
          리포트 열기{ic(CHEV, 10, '2.4')}</span></div>
    </div>'''
    return f'''<div style="background:{INK};border-radius:16px;padding:16px;color:#fff;
              box-shadow:0 10px 26px -18px rgba(20,22,24,.9)">
    <div style="display:flex;align-items:baseline;gap:8px;padding-bottom:9px">
      <span style="font-size:10px;font-weight:600;letter-spacing:.16em;color:rgba(255,255,255,.5);{NUM}">
        7월호 · 정기 피드백</span>
      <span style="flex:1"></span>
      <span style="font-size:13px;font-weight:700;color:{BRONZE};{NUM};letter-spacing:-.03em">No.06</span>
    </div>
    <div style="font-size:17px;font-weight:600;letter-spacing:-.03em;line-height:1.4;padding-bottom:13px">
      톱에서 왼팔 각 잡기</div>
    {ba_pair()}
    <div style="display:flex;gap:14px;padding:13px 0 12px;margin-top:13px;
                border-top:1px solid rgba(255,255,255,.14)">
      <span style="display:flex;flex-direction:column;gap:2px">
        <span style="font-size:15px;font-weight:600;{NUM};letter-spacing:-.03em">74
          <span style="font-size:10px;color:{BRONZE}">+6</span></span>
        <span style="font-size:9.5px;color:rgba(255,255,255,.5)">스윙 스코어</span></span>
      <span style="display:flex;flex-direction:column;gap:2px">
        <span style="font-size:15px;font-weight:600;{NUM};letter-spacing:-.03em">2/3</span>
        <span style="font-size:9.5px;color:rgba(255,255,255,.5)">숙제</span></span>
      <span style="display:flex;flex-direction:column;gap:2px">
        <span style="font-size:15px;font-weight:600;{NUM};letter-spacing:-.03em">12</span>
        <span style="font-size:9.5px;color:rgba(255,255,255,.5)">분석 클립</span></span>
    </div>
    <span style="display:block;background:rgba(255,255,255,.13);border-radius:10px;padding:12px;
                 text-align:center;font-size:13px;font-weight:600;letter-spacing:-.02em">리포트 열기</span>
  </div>'''


def c1_fb_upcoming():
    return f'''<div style="background:#2A2C27;border-radius:14px;padding:14px 15px;color:#fff">
    <div style="display:flex;align-items:center;gap:9px">
      <span style="flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:10px;font-weight:600;letter-spacing:.16em;color:rgba(255,255,255,.45);{NUM}">
          8월호 준비 중</span>
        <span style="font-size:14px;font-weight:600;letter-spacing:-.025em">7월 27일 (월) 도착</span></span>
      <span style="flex:none;font-size:12.5px;font-weight:700;color:{BRONZE};{NUM};letter-spacing:-.03em;
                   background:rgba(166,124,61,.18);border-radius:7px;padding:6px 10px">D-5</span>
    </div>
    <div style="height:4px;border-radius:99px;background:rgba(255,255,255,.14);margin-top:11px;overflow:hidden">
      <span style="display:block;height:100%;width:72%;background:{BRONZE};border-radius:99px"></span></div>
    <div style="font-size:10.5px;font-weight:500;color:rgba(255,255,255,.5);padding-top:8px">
      이번 달 영상 12개 · 프로가 모아서 분석 중</div>
  </div>'''


def c1_cm(text, when, tail=True, avatar_on=True):
    tl = 'border-radius:14px 14px 14px 4px' if tail else 'border-radius:14px'
    av = avatar(28) if avatar_on else ''
    return f'''<div style="display:flex;gap:9px;align-items:flex-start">{av}
    <span style="flex:1;min-width:0;background:{BR_SOFT};border:1px solid rgba(166,124,61,.3);{tl};
                 padding:11px 13px;display:flex;flex-direction:column;gap:6px">
      <span style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11.5px;font-weight:600;color:{BRONZE};letter-spacing:-.01em">프로 한마디</span>
        <span style="flex:1"></span>
        <span style="font-size:10px;font-weight:500;color:{INK4};{NUM}">{when}</span></span>
      <span style="font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7;
                   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{text}</span>
    </span></div>'''


def c1_cm_badge(state):
    on = state == 'done'
    col = BRONZE if on else INK4
    bg = BR_SOFT if on else SAND
    txt = '프로 한마디' if on else '한마디 대기'
    return (f'<span style="display:inline-flex;align-self:flex-start;align-items:center;gap:5px;background:{bg};color:{col};'
            f'border-radius:99px;padding:4px 9px;font-size:10.5px;font-weight:600">'
            f'{ic(BUBBLE, 11, "2")}{txt}</span>')


# ═══════════════════════════════════════════════════════════════════
#  컨셉 2 · 배지 규칙  — 레이아웃 그대로, 표식만
# ═══════════════════════════════════════════════════════════════════
def c2_rail(color, body, bg=CARD):
    return (f'<div style="position:relative;background:{bg};border:1px solid {LINE};border-radius:13px;'
            f'padding:13px 14px 13px 17px;overflow:hidden">'
            f'<span style="position:absolute;left:0;top:0;bottom:0;width:4px;background:{color}"></span>'
            f'{body}</div>')


def c2_kind(kind):
    """카드 맨 위에 붙는 종류 라벨 — 이 한 줄이 규칙의 전부다."""
    if kind == 'fb':
        return (f'<span style="display:inline-flex;align-self:flex-start;align-items:center;gap:5px;color:{FOREST};'
                f'font-size:9.5px;font-weight:700;letter-spacing:.12em">{ic(ENVELOPE, 11, "2")}정기 피드백</span>')
    return (f'<span style="display:inline-flex;align-self:flex-start;align-items:center;gap:5px;color:{BRONZE};'
            f'font-size:9.5px;font-weight:700;letter-spacing:.12em">{ic(BUBBLE, 11, "2")}프로 한마디</span>')


def c2_fb_arrived():
    body = f'''{c2_kind('fb')}
    <div style="font-size:14.5px;font-weight:600;letter-spacing:-.025em;color:{INK};padding:7px 0 4px">
      7월호 리포트가 도착했어요</div>
    <div style="font-size:11.5px;font-weight:500;color:{INK3};line-height:1.6">
      톱에서 왼팔 각 잡기 · 숙제 2/3 · 스윙스코어 74</div>
    <span style="display:block;margin-top:11px;background:{FOREST};color:#fff;border-radius:10px;padding:11px;
                 text-align:center;font-size:12.5px;font-weight:600;letter-spacing:-.02em">리포트 열기</span>'''
    return c2_rail(FOREST, body)


def c2_fb_upcoming():
    body = f'''<div style="display:flex;align-items:center;gap:9px">
      <span style="flex:1;display:flex;flex-direction:column;gap:4px">{c2_kind('fb')}
        <span style="font-size:13.5px;font-weight:600;letter-spacing:-.025em;color:{INK}">
          7월 27일 (월) 도착 예정</span></span>
      <span style="flex:none;font-size:12.5px;font-weight:700;color:{FOREST};background:{SOFT};
                   border-radius:7px;padding:6px 10px;{NUM};letter-spacing:-.03em">D-5</span></div>
    <div style="height:4px;border-radius:99px;background:{SAND};margin-top:11px;overflow:hidden">
      <span style="display:block;height:100%;width:72%;background:{FOREST};border-radius:99px"></span></div>'''
    return c2_rail(FOREST, body)


def c2_cm(text, when):
    body = f'''<div style="display:flex;align-items:center;gap:8px">
      {c2_kind('cm')}<span style="flex:1"></span>
      <span style="font-size:10px;font-weight:500;color:{INK4};{NUM}">{when}</span></div>
    <div style="display:flex;gap:9px;align-items:flex-start;padding-top:8px">{avatar(26, BRONZE)}
      <span style="flex:1;min-width:0;font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7;
                   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
        {text}</span></div>'''
    return c2_rail(BRONZE, body, BR_SOFT)


def c2_cm_badge(state):
    on = state == 'done'
    col = BRONZE if on else INK4
    return (f'<span style="display:inline-flex;align-self:flex-start;align-items:center;gap:4px;color:{col};'
            f'font-size:10.5px;font-weight:600">{ic(BUBBLE, 11, "2")}'
            f'{"프로 한마디" if on else "한마디 대기"}</span>')


# ═══════════════════════════════════════════════════════════════════
#  컨셉 3 · 위·아래 규칙  — 자리로 가른다
# ═══════════════════════════════════════════════════════════════════
def c3_strip(state='upcoming'):
    """화면 최상단 가로 꽉 찬 스트립. 어느 화면이든 피드백은 여기에만 있다."""
    if state == 'arrived':
        return f'''<div style="flex:none;background:{FOREST};color:#fff;padding:13px 16px 14px;
                  display:flex;align-items:center;gap:11px">
      <span style="flex:none;width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.16);
                   display:flex;align-items:center;justify-content:center">{ic(ENVELOPE, 15, '1.8')}</span>
      <span style="flex:1;display:flex;flex-direction:column;gap:2px">
        <span style="font-size:9.5px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.6);{NUM}">
          정기 피드백 · 7월호</span>
        <span style="font-size:13.5px;font-weight:600;letter-spacing:-.02em">
          No.06 리포트가 도착했어요</span></span>
      <span style="flex:none;font-size:11.5px;font-weight:600;background:rgba(255,255,255,.16);
                   border-radius:8px;padding:7px 11px">열기</span>
    </div>'''
    return f'''<div style="flex:none;background:{FOREST};color:#fff;padding:12px 16px 13px;
              display:flex;align-items:center;gap:11px">
    <span style="flex:none;width:28px;height:28px;border-radius:9px;background:rgba(255,255,255,.16);
                 display:flex;align-items:center;justify-content:center">{ic(ENVELOPE, 14, '1.8')}</span>
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.6);{NUM}">
        정기 피드백</span>
      <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em">
        7월 27일 도착 예정 · 영상 12개 모임</span></span>
    <span style="flex:none;font-size:12.5px;font-weight:700;{NUM};letter-spacing:-.03em">D-5</span>
  </div>'''


def c3_cm(text, when, attached=True):
    """항상 영상·기록에 '붙어서' 나온다. 위쪽 연결선이 소속을 보여준다."""
    hook = (f'<span style="position:absolute;left:22px;top:-9px;width:1.5px;height:9px;'
            f'background:{LINE}"></span>' if attached else '')
    return f'''<div style="position:relative;margin-top:9px">{hook}
    <div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:11px 13px;
                display:flex;gap:9px;align-items:flex-start">{avatar(26, BRONZE)}
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
        <span style="display:flex;align-items:center;gap:6px">
          <span style="font-size:11.5px;font-weight:600;color:{INK}">이도형 프로</span>
          <span style="flex:1"></span>
          <span style="font-size:10px;font-weight:500;color:{INK4};{NUM}">{when}</span></span>
        <span style="font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7;
                     display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          {text}</span></span></div>
  </div>'''


def c3_cm_badge(state):
    on = state == 'done'
    return (f'<span style="display:inline-flex;align-self:flex-start;align-items:center;gap:4px;'
            f'color:{BRONZE if on else INK4};font-size:10.5px;font-weight:600">'
            f'{ic(BUBBLE, 11, "2")}{"한마디 있음" if on else "한마디 대기"}</span>')


# ═══════════════════════════════════════════════════════════════════
#  컨셉 4 · 서가 & 타임라인  — 정보구조로 가른다
# ═══════════════════════════════════════════════════════════════════
def c4_shelf(n=4):
    """백넘버 서가. 피드백은 '쌓이는 것'이라 표지를 옆으로 늘어놓는다."""
    covers = ''
    data = [('No.06', '7월호', '톱에서 왼팔', True), ('No.05', '6월호', '하체 리드', False),
            ('No.04', '5월호', '상체 정렬', False), ('No.03', '4월호', '그립 셋업', False)][:n]
    for no, mon, title, new in data:
        badge = (f'<span style="position:absolute;top:8px;right:8px;background:{BRONZE};color:#fff;'
                 f'font-size:8px;font-weight:700;letter-spacing:.06em;border-radius:4px;padding:2px 5px">NEW</span>'
                 if new else '')
        covers += f'''<span style="flex:none;width:108px;display:flex;flex-direction:column;gap:7px">
      <span style="position:relative;height:132px;border-radius:10px;background:linear-gradient(165deg,#2E302A,{INK});
                   padding:12px 11px;display:flex;flex-direction:column;color:#fff">{badge}
        <span style="font-size:9px;font-weight:600;letter-spacing:.14em;color:rgba(255,255,255,.45);{NUM}">{mon}</span>
        <span style="font-size:19px;font-weight:700;{NUM};letter-spacing:-.04em;padding-top:2px">{no}</span>
        <span style="flex:1"></span>
        <span style="width:34px;height:26px;border-radius:5px;border:1.5px solid {BRONZE};
                     background:linear-gradient(150deg,#4A4B42,#2A2B26)"></span></span>
      <span style="font-size:11px;font-weight:500;color:{INK2};letter-spacing:-.01em">{title}</span></span>'''
    return (f'<div style="display:flex;gap:9px;overflow-x:auto;padding-bottom:2px">{covers}</div>')


def c4_timeline(items):
    """코멘트는 '흐르는 것'이라 세로 타임라인. 왼쪽 선이 시간축이다."""
    rows = ''
    for i, (when, text, dot) in enumerate(items):
        last = i == len(items) - 1
        line = ('' if last else
                f'<span style="position:absolute;left:5px;top:14px;bottom:-14px;width:1.5px;'
                f'background:{LINE}"></span>')
        col = BRONZE if dot else INK4
        rows += f'''<div style="position:relative;padding-left:22px;padding-bottom:{0 if last else 14}px">
      {line}<span style="position:absolute;left:0;top:5px;width:11px;height:11px;border-radius:50%;
        background:{CARD};border:2.5px solid {col}"></span>
      <div style="display:flex;align-items:baseline;gap:7px;padding-bottom:4px">
        <span style="font-size:11px;font-weight:600;color:{col};{NUM}">{when}</span>
        <span style="font-size:10px;font-weight:500;color:{INK4}">이도형 프로</span></div>
      <div style="font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7;
                  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
        {text}</div></div>'''
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:14px 15px">'
            f'{rows}</div>')


def c4_fb_upcoming():
    return f'''<div style="display:flex;align-items:center;gap:11px;background:{INK};border-radius:12px;
              padding:13px 15px;color:#fff">
    <span style="flex:1;display:flex;flex-direction:column;gap:3px">
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.45);{NUM}">
        NEXT ISSUE</span>
      <span style="font-size:13.5px;font-weight:600;letter-spacing:-.025em">8월호 · 7월 27일 도착</span></span>
    <span style="flex:none;font-size:12.5px;font-weight:700;color:{BRONZE};{NUM};letter-spacing:-.03em">D-5</span>
  </div>'''


def c4_cm_badge(state):
    on = state == 'done'
    return (f'<span style="display:inline-flex;align-self:flex-start;align-items:center;gap:4px;color:{BRONZE if on else INK4};'
            f'font-size:10.5px;font-weight:600">'
            f'<span style="width:7px;height:7px;border-radius:50%;background:{CARD};'
            f'border:2px solid {BRONZE if on else INK4}"></span>'
            f'{"한마디 있음" if on else "한마디 대기"}</span>')


# ═══════════════════════════════════════════════════════════════════
#  화면 조립
# ═══════════════════════════════════════════════════════════════════
CM_TEXT = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 영상 0:07 보시면…'
CM_TEXT2 = '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요. 지금은 조금 길게 잡고 계세요.'


def stats_row():
    def st(v, u, k):
        return (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">'
                f'<span style="font-size:17px;font-weight:600;color:{INK};{NUM};letter-spacing:-.04em">{v}'
                f'<span style="font-size:10.5px;font-weight:500;color:{INK3}">{u}</span></span>'
                f'<span style="font-size:10px;font-weight:500;color:{INK3}">{k}</span></span>')
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:13px 8px;'
            f'display:flex">{st("3", "일", "주간 연습")}{st("12", "개", "등록 스윙")}'
            f'{st("5", "일", "연속 기록")}</div>')


def today_card():
    def meta(k, v):
        return (f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.1em;color:{INK4};{NUM}">{k}</span>'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">{v}</span></span>')
    return f'''<div style="background:{CARD};border:1px solid #D8D1C2;border-radius:15px;padding:15px;
              box-shadow:0 8px 22px -16px rgba(20,22,24,.55)">
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:12px">
      <span style="font-size:15.5px;font-weight:600;letter-spacing:-.03em;color:{INK}">7월 22일 (수)</span>
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.06em;color:#fff;background:{INK};
                   border-radius:5px;padding:3px 7px">오늘</span>
      <span style="flex:1"></span>
      <span style="font-size:11.5px;font-weight:600;color:{INK2}">수정 ›</span></div>
    <div style="display:flex;gap:11px">{thumb('0:27', 76, 76)}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:8px">
        <div style="display:flex;gap:8px">{meta('시간', '45분')}{meta('느낌', '보통')}</div>
        <div style="font-size:11.5px;font-weight:500;color:{INK2}">드라이버 · 7번 아이언</div></div></div>
  </div>'''


def swing_card(time, club, tag, badge_html, cm_html=''):
    return f'''<div style="background:{CARD};border:1px solid #EDE8DC;border-radius:12px;padding:9px;
              display:flex;gap:10px;box-shadow:0 4px 12px -10px rgba(20,22,24,.3)">
      {thumb('0:27', 62, 62, 9)}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:5px">
        <span style="font-size:11px;color:{INK4};font-weight:500;{NUM}">{time}</span>
        <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span style="font-size:13px;font-weight:700;color:{INK};letter-spacing:-.01em">{club}</span>
          <span style="font-size:10px;font-weight:600;color:{BRONZE};background:rgba(166,124,61,.12);
                       border-radius:5px;padding:2px 6px;line-height:1.4">{tag}</span></span>
        {badge_html}
      </div>
    </div>{cm_html}'''


def seg_tabs(active='스윙기록'):
    def pill(t, n, on):
        st = (f'background:{FOREST};color:#fff;font-weight:700' if on
              else f'background:transparent;color:{INK2};font-weight:500')
        bs = ('rgba(255,255,255,.2)' if on else '#E4DECE')
        bc = ('#fff' if on else INK3)
        return (f'<span style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;'
                f'padding:9px 6px;border-radius:8px;font-size:13px;{st}">{t}'
                f'<span style="min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:flex;'
                f'align-items:center;justify-content:center;{NUM};font-size:10.5px;font-weight:700;'
                f'background:{bs};color:{bc}">{n}</span></span>')
    return (f'<div style="display:flex;background:#F1EDE4;border-radius:10px;padding:3px;gap:2px">'
            f'{pill("스윙기록", 12, active == "스윙기록")}{pill("정규레슨", 6, active == "정규레슨")}</div>')


def report_row(no, mon, title, date, kind_label, dark=False):
    """정규레슨 탭의 받은 리포트 한 줄."""
    if dark:
        return f'''<div style="background:{INK};border-radius:13px;padding:14px 15px;color:#fff;margin-bottom:8px">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:16px;font-weight:700;{NUM};letter-spacing:-.04em;color:{BRONZE}">{no}</span>
        <span style="flex:1;font-size:13.5px;font-weight:600;letter-spacing:-.025em">{title}</span>
        <span style="font-size:9.5px;font-weight:600;color:rgba(255,255,255,.45);{NUM}">{mon}</span></div>
      <div style="font-size:10.5px;font-weight:500;color:rgba(255,255,255,.5);padding-top:6px">
        {date} · {kind_label}</div>
    </div>'''
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:14px 15px;
              margin-bottom:8px">
    <div style="display:flex;align-items:baseline;gap:8px">
      <span style="font-size:16px;font-weight:700;{NUM};letter-spacing:-.04em;color:{FOREST}">{no}</span>
      <span style="flex:1;font-size:13.5px;font-weight:600;letter-spacing:-.025em;color:{INK}">{title}</span>
      <span style="font-size:9.5px;font-weight:600;color:{INK4};{NUM}">{mon}</span></div>
    <div style="font-size:10.5px;font-weight:500;color:{INK3};padding-top:6px">{date} · {kind_label}</div>
  </div>'''


# ── 화면 4개 × 컨셉 4개 ──────────────────────────────────────────────
def page_home(c):
    if c == 1:
        blocks = (f'<div style="flex:none;margin-top:18px">{cap("정기 피드백", "월 1회")}{c1_fb_arrived()}</div>'
                  f'<div style="flex:none;margin-top:20px">{cap("프로 한마디", "이번 달 3 / 5회")}'
                  f'{c1_cm(CM_TEXT, "6시간 전")}</div>')
    elif c == 2:
        blocks = (f'<div style="flex:none;margin-top:18px">{c2_fb_arrived()}</div>'
                  f'<div style="flex:none;margin-top:9px">{c2_cm(CM_TEXT, "6시간 전")}</div>')
    elif c == 3:
        blocks = (f'<div style="flex:none;margin-top:18px">{cap("최근 스윙")}'
                  f'<div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:11px;'
                  f'display:flex;gap:10px;align-items:center">{thumb("0:27", 56, 56, 9)}'
                  f'<span style="flex:1;font-size:12.5px;font-weight:600;color:{INK}">드라이버 · 오늘 오후 7:24</span>'
                  f'</div>{c3_cm(CM_TEXT, "6시간 전")}</div>')
    else:
        blocks = (f'<div style="flex:none;margin-top:18px">{c4_fb_upcoming()}</div>'
                  f'<div style="flex:none;margin-top:18px">{cap("지난 리포트", "6권")}{c4_shelf(3)}</div>'
                  f'<div style="flex:none;margin-top:20px">{cap("프로 한마디", "최근")}'
                  f'{c4_timeline([("6시간 전", CM_TEXT, True), ("7월 15일", CM_TEXT2, False)])}</div>')

    strip = c3_strip('arrived') if c == 3 else ''
    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('NEXT SWING')}
  {strip}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none;font-size:12px;font-weight:500;color:{INK3};padding:2px 1px 12px">
      골프러버 님 · 7월 22일 수요일</div>
    <div style="flex:none">{stats_row()}</div>
    {blocks}
  </div>
  {bottom_nav('홈')}
</div>'''


def page_practice(c):
    if c == 1:
        blocks = (f'<div style="flex:none;margin-top:20px">{cap("프로 한마디")}{c1_cm(CM_TEXT, "6시간 전")}</div>'
                  f'<div style="flex:none;margin-top:20px">{cap("정기 피드백", "월 1회")}{c1_fb_upcoming()}</div>')
    elif c == 2:
        blocks = (f'<div style="flex:none;margin-top:18px">{c2_cm(CM_TEXT, "6시간 전")}</div>'
                  f'<div style="flex:none;margin-top:9px">{c2_fb_upcoming()}</div>')
    elif c == 3:
        blocks = f'<div style="flex:none">{c3_cm(CM_TEXT, "6시간 전")}</div>'
    else:
        blocks = (f'<div style="flex:none;margin-top:18px">{c4_fb_upcoming()}</div>'
                  f'<div style="flex:none;margin-top:20px">{cap("프로 한마디", "이번 달 2회")}'
                  f'{c4_timeline([("6시간 전", CM_TEXT, True), ("7월 15일", CM_TEXT2, False)])}</div>')

    strip = c3_strip('upcoming') if c == 3 else ''
    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('연습기록', f'<span style="flex:none;font-size:11px;font-weight:600;color:{INK2};background:{CARD};'
                     f'border:1px solid {LINE};border-radius:8px;padding:6px 10px;{NUM}">7월 · 12일</span>')}
  {strip}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none">{cap('오늘', '7월 22일 수요일')}{today_card()}</div>
    {blocks}
  </div>
  {bottom_nav('연습기록')}
</div>'''


def page_swings(c):
    badge = {1: c1_cm_badge, 2: c2_cm_badge, 3: c3_cm_badge, 4: c4_cm_badge}[c]
    if c == 3:
        cards = (swing_card('오후 7:24', '드라이버', '드라이버 영상', badge('done'),
                            c3_cm(CM_TEXT, '6시간 전'))
                 + '<div style="height:10px"></div>'
                 + swing_card('오후 6:02', '7번 아이언', '기본동작', badge('wait')))
    elif c == 4:
        cards = (swing_card('오후 7:24', '드라이버', '드라이버 영상', badge('done'))
                 + '<div style="height:8px"></div>'
                 + swing_card('오후 6:02', '7번 아이언', '기본동작', badge('wait'))
                 + f'<div style="margin-top:18px">{cap("이 주의 한마디", "타임라인")}'
                 + c4_timeline([('6시간 전', CM_TEXT, True), ('7월 15일', CM_TEXT2, False)]) + '</div>')
    else:
        cards = (swing_card('오후 7:24', '드라이버', '드라이버 영상', badge('done'))
                 + '<div style="height:8px"></div>'
                 + swing_card('오후 6:02', '7번 아이언', '기본동작', badge('wait')))

    strip = c3_strip('upcoming') if c == 3 else ''
    return f'''<div style="{FRAME}">
  {statusbar()}
  <div style="flex:none;background:{CARD};border-bottom:1px solid #EFEBE2;padding:6px 16px 13px">
    <div style="display:flex;align-items:center;gap:11px;height:44px">
      <span style="color:{INK}">{ic(BURGER, 20, '1.9')}</span>
      <b style="font-size:19px;font-weight:700;letter-spacing:-.03em;color:{INK}">스윙기록</b></div>
    {seg_tabs('스윙기록')}
  </div>
  {strip}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:14px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none;display:flex;align-items:center;gap:8px;padding-bottom:11px">
      <span style="font-size:14px;font-weight:700;letter-spacing:-.025em;color:{INK}">오늘 · 7월 22일</span>
      <span style="font-size:10.5px;font-weight:600;color:{INK3};background:{SAND};border-radius:99px;
                   padding:2px 8px;{NUM}">2</span></div>
    <div style="flex:none">{cards}</div>
  </div>
  {bottom_nav('스윙기록')}
</div>'''


def page_lessons(c):
    if c == 1:
        body = (f'<div style="flex:none">{cap("다음 호", "준비 중")}{c1_fb_upcoming()}</div>'
                f'<div style="flex:none;margin-top:20px">{cap("받은 리포트", "6권")}'
                f'{c1_fb_arrived()}</div>'
                f'<div style="flex:none;margin-top:10px">'
                f'{report_row("No.05", "6월호", "하체 리드로 시작하기", "5월 27일 받음", "한마디 5개 · 숙제 3/3", True)}'
                f'{report_row("No.04", "5월호", "상체 정렬과 임팩트", "4월 27일 받음", "한마디 4개 · 숙제 2/3", True)}'
                f'</div>')
    elif c == 2:
        body = (f'<div style="flex:none">{c2_fb_upcoming()}</div>'
                f'<div style="flex:none;margin-top:20px">{cap("받은 리포트", "6권")}'
                f'{report_row("No.06", "7월호", "톱에서 왼팔 각 잡기", "6월 27일 받음", "한마디 7개 · 숙제 2/3")}'
                f'{report_row("No.05", "6월호", "하체 리드로 시작하기", "5월 27일 받음", "한마디 5개 · 숙제 3/3")}'
                f'{report_row("No.04", "5월호", "상체 정렬과 임팩트", "4월 27일 받음", "한마디 4개 · 숙제 2/3")}'
                f'</div>')
    elif c == 3:
        body = (f'<div style="flex:none">{cap("받은 리포트", "6권")}'
                f'{report_row("No.06", "7월호", "톱에서 왼팔 각 잡기", "6월 27일 받음", "한마디 7개 · 숙제 2/3")}'
                f'{report_row("No.05", "6월호", "하체 리드로 시작하기", "5월 27일 받음", "한마디 5개 · 숙제 3/3")}'
                f'{report_row("No.04", "5월호", "상체 정렬과 임팩트", "4월 27일 받음", "한마디 4개 · 숙제 2/3")}'
                f'{report_row("No.03", "4월호", "그립과 셋업 재정비", "3월 27일 받음", "한마디 6개 · 숙제 3/3")}'
                f'</div>')
    else:
        body = (f'<div style="flex:none">{c4_fb_upcoming()}</div>'
                f'<div style="flex:none;margin-top:20px">{cap("서가", "6권")}{c4_shelf(4)}</div>'
                f'<div style="flex:none;margin-top:22px">{cap("No.06 · 7월호")}'
                f'<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:14px 15px">'
                f'<div style="font-size:14px;font-weight:600;letter-spacing:-.025em;color:{INK}">'
                f'톱에서 왼팔 각 잡기</div>'
                f'<div style="font-size:11px;font-weight:500;color:{INK3};padding-top:6px">'
                f'6월 27일 받음 · 한마디 7개 · 숙제 2/3</div>'
                f'<span style="display:block;margin-top:11px;background:{FOREST};color:#fff;border-radius:10px;'
                f'padding:11px;text-align:center;font-size:12.5px;font-weight:600">리포트 열기</span></div></div>')

    strip = c3_strip('arrived') if c == 3 else ''
    return f'''<div style="{FRAME}">
  {statusbar()}
  <div style="flex:none;background:{CARD};border-bottom:1px solid #EFEBE2;padding:6px 16px 13px">
    <div style="display:flex;align-items:center;gap:11px;height:44px">
      <span style="color:{INK}">{ic(BURGER, 20, '1.9')}</span>
      <b style="font-size:19px;font-weight:700;letter-spacing:-.03em;color:{INK}">스윙기록</b></div>
    {seg_tabs('정규레슨')}
  </div>
  {strip}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:14px 16px 18px;display:flex;flex-direction:column">
    {body}
  </div>
  {bottom_nav('스윙기록')}
</div>'''


PAGES = [('홈', page_home), ('연습기록', page_practice),
         ('스윙기록', page_swings), ('정규레슨', page_lessons)]

CONCEPTS = [
    (1, '리포트 & 말풍선', '형태로 가른다',
     '피드백은 <b>어두운 리포트 표지</b>, 한마디는 <b>말풍선</b>. 형태가 곧 설명이라 배울 게 없다.',
     ['개념 차이가 가장 세게 드러난다 — 색맹이어도 구분됨',
      '어두운 카드가 앱에 딱 하나뿐이라 그 자체로 표식이 된다',
      '카드 컴포넌트를 두 벌 만들어 모든 화면에 일관되게 써야 한다',
      'pc1(말풍선)·r1(리포트)이 이미 그 방향이라 절반은 만들어져 있다']),
    (2, '배지 규칙', '표식만 통일',
     '레이아웃은 그대로. <b>좌측 색바 + 아이콘 + 종류 라벨</b> 세 개를 규칙으로 박는다.',
     ['제일 싸다. 지금 구조를 거의 안 건드림',
      '규칙이 단순해서 새 화면에도 바로 적용됨',
      '무게 차이가 안 난다 — 월 1회와 주 1회가 여전히 같은 크기',
      '초록이 이미 앱 기본색이라 "피드백 전용"으로 읽히기 어렵다']),
    (3, '위·아래 규칙', '자리로 가른다',
     '피드백은 <b>항상 화면 최상단 스트립</b>, 한마디는 <b>항상 영상에 붙어서</b>. 자리가 곧 종류다.',
     ['어느 화면을 가도 규칙이 같아서 헷갈릴 수가 없다',
      '한마디가 어느 영상 얘긴지 연결선으로 바로 보인다',
      '스트립이 모든 화면 위를 먹는다 — 볼 게 없는 날에도 자리를 차지',
      '피드백을 "읽는 것"이 아니라 "알림"으로 밀어낸 느낌이 든다']),
    (4, '서가 & 타임라인', '정보구조로 가른다',
     '피드백은 <b>백넘버 서가</b>(옆으로 쌓임), 한마디는 <b>세로 타임라인</b>(흘러감).',
     ['쌓이는 것 vs 흐르는 것 — 구조 자체가 다르다',
      'No.06 표지가 소장 가치를 만든다. 6권 모았다는 게 보임',
      '공간을 제일 많이 먹는다. 서가 132px + 타임라인',
      '한마디가 영상에서 떨어져 나온다 — 무슨 영상 얘긴지 약해짐']),
]


def board():
    fp = os.path.join(HERE, 'fonts-concepts.css')
    fonts = open(fp if os.path.exists(fp)
                 else os.path.join(SRC, 'board-fonts.css'), encoding='utf-8').read()

    rows = ''
    for cid, name, tag, desc, pros in CONCEPTS:
        phones = ''.join(
            f'<div class="cell"><div class="plab">{pname}</div>'
            f'<div class="phone">{fn(cid)}</div></div>' for pname, fn in PAGES)
        bullets = ''.join(f'<li class="{"pro" if i < 2 else "con"}">{p}</li>'
                          for i, p in enumerate(pros))
        rows += f'''<section class="row">
      <div class="rhead">
        <div class="rno">C{cid}</div>
        <div class="rmeta">
          <h2>{name}</h2>
          <div class="rtag">{tag}</div>
          <p class="rdesc">{desc}</p>
          <ul class="rlist">{bullets}</ul>
        </div>
      </div>
      <div class="rail">{phones}</div>
    </section>'''

    return f'''<style>
{fonts}
:root{{
  --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2; --panel:#FFFDF9;
  --acc:#21402F; --soft:#F2F8F4; --br:#A67C3D;
  --font-base:Hahmlet,serif; --font-num:Pretendard,-apple-system,sans-serif;
}}
@media (prefers-color-scheme:dark){{ :root{{
  --pg:#191A17; --ct:#EDEAE3; --cs:#A39C8C; --cs2:#8A8375; --bd:#33342D; --panel:#22231F;
  --acc:#8FBFA3; --soft:#233026; --br:#D2A868; }} }}
:root[data-theme="dark"]{{ --pg:#191A17; --ct:#EDEAE3; --cs:#A39C8C; --cs2:#8A8375; --bd:#33342D;
  --panel:#22231F; --acc:#8FBFA3; --soft:#233026; --br:#D2A868; }}
:root[data-theme="light"]{{ --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2;
  --panel:#FFFDF9; --acc:#21402F; --soft:#F2F8F4; --br:#A67C3D; }}

*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:var(--font-base);background:var(--pg);color:var(--ct);
  -webkit-font-smoothing:antialiased;line-height:1.7}}
.wrap{{max-width:1700px;margin:0 auto;padding:44px 24px 90px}}
header.top{{max-width:700px;margin-bottom:14px}}
.eyebrow{{font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--cs2);
  font-family:var(--font-num);margin-bottom:12px}}
h1{{font-size:30px;font-weight:400;letter-spacing:-.035em;line-height:1.35;text-wrap:balance}}
h1 b{{font-weight:600}}
.lede{{font-size:14px;color:var(--cs);margin-top:14px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}

.keytable{{margin:26px 0 8px;max-width:700px;border:1px solid var(--bd);border-radius:13px;
  background:var(--panel);overflow:hidden}}
.keytable div{{display:flex;gap:14px;padding:11px 16px;border-top:1px solid var(--bd);font-size:12.5px}}
.keytable div:first-child{{border-top:none}}
.keytable b{{flex:none;width:96px;font-weight:600;font-size:11.5px}}
.keytable span{{flex:1;color:var(--cs)}}
.kfb{{color:var(--acc)}} .kcm{{color:var(--br)}}

.row{{margin-top:52px;padding-top:34px;border-top:1px solid var(--bd)}}
.row:first-of-type{{border-top:none}}
.rhead{{display:flex;gap:18px;align-items:flex-start;max-width:1000px;margin-bottom:22px}}
.rno{{flex:none;width:46px;height:46px;border-radius:12px;background:var(--acc);color:var(--pg);
  display:flex;align-items:center;justify-content:center;font-family:var(--font-num);
  font-size:15px;font-weight:700;letter-spacing:-.03em}}
.rmeta{{flex:1;min-width:0}}
h2{{font-size:20px;font-weight:600;letter-spacing:-.03em;line-height:1.3}}
.rtag{{font-size:10.5px;font-weight:600;letter-spacing:.14em;color:var(--cs2);
  font-family:var(--font-num);margin-top:4px}}
.rdesc{{font-size:13px;color:var(--cs);margin-top:10px;line-height:1.8;max-width:600px}}
.rdesc b{{color:var(--ct);font-weight:600}}
.rlist{{list-style:none;margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));
  gap:6px 22px;max-width:840px}}
.rlist li{{position:relative;padding-left:16px;font-size:12px;color:var(--cs);line-height:1.7}}
.rlist li::before{{position:absolute;left:0;top:0;font-family:var(--font-num);font-weight:700;font-size:12px}}
.rlist .pro::before{{content:"+";color:var(--acc)}}
.rlist .con::before{{content:"−";color:var(--br)}}

.rail{{display:flex;gap:22px;overflow-x:auto;padding:4px 2px 16px}}
.cell{{flex:none;width:360px}}
.plab{{font-size:11.5px;font-weight:600;letter-spacing:-.01em;color:var(--cs);padding:0 2px 10px}}
.phone{{display:flex;justify-content:center}}

.asks{{margin-top:56px;max-width:920px;background:var(--panel);border:1px solid var(--bd);
  border-radius:16px;padding:22px 24px}}
.asks h2{{font-size:19px;margin-bottom:6px}}
.asks p{{font-size:13px;color:var(--cs);line-height:1.85}}
.asks ol{{padding-left:19px;display:flex;flex-direction:column;gap:12px;margin-top:14px}}
.asks li{{font-size:13px;color:var(--cs);line-height:1.8}}
.asks li b{{color:var(--ct);font-weight:600}}
@media (max-width:760px){{ .wrap{{padding:28px 14px 60px}} h1{{font-size:24px}}
  .rlist{{grid-template-columns:1fr}} }}
</style>

<div class="wrap">
  <header class="top">
    <div class="eyebrow">NEXT SWING · 피드백 ↔ 한마디 구분 · 컨셉 4안</div>
    <h1>성적표와 쪽지를 <b>같은 카드에 담고 있었다</b></h1>
    <p class="lede">월 1회 정식 리포트와 주 1회 댓글이 지금은 같은 흰 카드, 같은 초록 포인트로 놓여 있다.
      빈도가 20배 차이 나는데. 네 가지 방식으로 갈라봤다 —
      <b>형태 · 표식 · 자리 · 정보구조</b>. 화면 4개씩, 총 16장.</p>
  </header>

  <div class="keytable">
    <div><b>이름</b><span><b class="kfb">정기 피드백</b> · 월 1회 리포트 &nbsp;/&nbsp;
      <b class="kcm">프로 한마디</b> · 영상 하나에 남기는 댓글</span></div>
    <div><b>시작</b><span class="kfb">자동 (구독 주기)</span><span class="kcm">회원이 요청</span></div>
    <div><b>대상</b><span class="kfb">그 달 영상 전체</span><span class="kcm">영상 하나</span></div>
    <div><b>수명</b><span class="kfb">한 달 내내 (숙제)</span><span class="kcm">읽으면 끝</span></div>
    <div><b>시간 표현</b><span class="kfb">7월호 · No.06 · D-5</span><span class="kcm">6시간 전</span></div>
  </div>

  {rows}

  <div class="asks">
    <h2>고를 때 이거 세 개만 보면 된다</h2>
    <p>네 안 다 "구분은 된다". 갈리는 건 <b>얼마나 세게 / 얼마나 비싸게 / 무엇을 잃고</b>다.</p>
    <ol>
      <li><b>세기</b> — C1 · C4가 제일 세다. C2가 제일 약하다. C3은 규칙이 세지만 표현은 담백하다.</li>
      <li><b>비용</b> — C2가 제일 싸고(하루), C1은 컴포넌트 두 벌, C3은 모든 화면 상단 구조 변경,
        C4는 새 컴포넌트 두 개 + 공간을 제일 많이 먹는다.</li>
      <li><b>잃는 것</b> — C3·C4는 <b>한마디가 영상에서 떨어질 위험</b>이 있다.
        C4는 아예 타임라인으로 빼내니 "무슨 영상 얘기지?"가 생긴다.
        C2는 잃는 건 없는데 얻는 것도 적다.</li>
    </ol>
    <p style="margin-top:16px"><b>내 추천은 C1이다.</b> 어두운 리포트 표지 하나로 무게 차이가 끝나고,
      한마디는 말풍선이라 영상 옆에 그대로 둘 수 있다.
      <b>C4의 서가는 정규레슨 탭에만 얹으면</b> C1과 충돌 없이 같이 쓸 수 있다 — 그게 최종안일 수도.</p>
  </div>
</div>'''


if __name__ == '__main__':
    out = os.path.join(HERE, 'split-concepts.html')
    open(out, 'w', encoding='utf-8-sig').write(board())
    print(f'{os.path.getsize(out) / 1024:.0f} KB → {os.path.basename(out)}  '
          f'({len(CONCEPTS)}컨셉 × {len(PAGES)}화면 = {len(CONCEPTS) * len(PAGES)}장)')
