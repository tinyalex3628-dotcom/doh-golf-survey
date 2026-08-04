# -*- coding: utf-8 -*-
"""연습기록 화면 재설계 시안 — 프로토타입에 씌우기 전 비교용 샘플.

   지금 화면의 문제는 순서 하나로 요약된다.
   페이지 이름은 '연습기록'인데 맨 위가 프로 서비스(정기 피드백·코멘트 카운터)다.
   매일 쓰는 페이지의 주인공은 오늘의 연습이어야 한다.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'handoff-v3', 'design_handoff_next_swing')

BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE = '#E4DED2', '#EFE9DE', '#A67C3D'
SOFT = '#F2F8F4'
NUM = 'font-family:var(--font-num)'

FRAME = ('width:360px;height:740px;background:#FFFDF9;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;flex-direction:column')


# ── 부품 ─────────────────────────────────────────────────────────────
def statusbar():
    return (f'<div style="flex:none;height:44px;background:{BG};display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 24px;font-size:12px;color:{INK}">'
            f'<span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {INK};border-radius:2px;opacity:.6"></span>'
            f'<span style="width:15px;height:9px;background:{INK};border-radius:2px"></span></span></div>')


def ic(d, w=16, sw='1.8'):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;display:block">'
            f'{d}</svg>')


BURGER = '<path d="M4 7h16M4 12h16M4 17h16"></path>'
BACK = '<path d="m15 5-7 7 7 7"></path>'
CHEV = '<path d="m9 5 7 7-7 7"></path>'
LEFT = '<path d="m14 6-6 6 6 6"></path>'
RIGHT = '<path d="m10 6 6 6-6 6"></path>'
PLAY = '<path d="M8 5.5v13l11-6.5z"></path>'
BUBBLE = '<path d="M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V7A2.5 2.5 0 0 1 7.5 4.5h10A2.5 2.5 0 0 1 20 7z"></path>'
CLOCK = '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5l3 2"></path>'


def header(title, right=''):
    return (f'<div style="flex:none;height:54px;background:{BG};display:flex;align-items:center;'
            f'gap:11px;padding:0 16px">'
            f'<span style="color:{INK};flex:none">{ic(BURGER, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:19px;font-weight:700;letter-spacing:-.03em;color:{INK}">{title}</b>'
            f'{right}</div>')


def back_header(title, right=''):
    return (f'<div style="flex:none;height:50px;background:{BG};display:flex;align-items:center;padding:0 12px">'
            f'<span style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;'
            f'color:{INK}">{ic(BACK, 19)}</span>'
            f'<span style="flex:1;text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em;'
            f'color:{INK}">{title}</span>'
            f'<span style="min-width:30px;display:flex;justify-content:flex-end;padding-right:6px">{right}</span></div>')


def cap(t, sub=''):
    s = (f'<span style="font-size:10px;font-weight:500;color:{INK4}">{sub}</span>') if sub else ''
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 1px 9px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:{INK3}">{t}</span>{s}</div>')


def thumb(dur='0:27', w=96, h=96):
    # 재생 버튼과 시간 배지는 썸네일 크기에 맞춰 줄인다 (44px 짜리에 26px 버튼은 너무 크다)
    pb = max(18, min(30, round(min(w, h) * 0.27)))
    fs = 9.5 if w >= 80 else 8.5
    return (f'<span style="flex:none;position:relative;width:{w}px;height:{h}px;border-radius:10px;'
            f'overflow:hidden;background:linear-gradient(150deg,#3A3B33,#1D2420)">'
            f'<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">'
            f'<span style="width:{pb}px;height:{pb}px;border-radius:50%;background:rgba(255,255,255,.94);'
            f'display:flex;align-items:center;justify-content:center;color:{INK}">'
            f'<svg viewBox="0 0 24 24" fill="currentColor" style="width:{round(pb*0.42)}px;'
            f'height:{round(pb*0.42)}px">{PLAY}</svg></span></span>'
            # 60px 미만이면 재생 버튼과 겹치니 시간 배지는 뺀다
            + (f'<span style="position:absolute;left:4px;bottom:4px;background:rgba(0,0,0,.66);color:#fff;'
               f'font-size:{fs}px;font-weight:700;border-radius:4px;padding:2px 5px;{NUM}">{dur}</span>'
               if min(w, h) >= 60 else '')
            + '</span>')


def bottom_nav(active='연습기록'):
    items = [('홈', '<path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"></path>'),
             ('연습기록', '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M8 3v4M16 3v4M8.5 13l2.5 2.5 4.5-4.5"></path>'),
             ('스윙기록', '<rect x="3.5" y="4.5" width="17" height="6" rx="2"></rect><rect x="3.5" y="13.5" width="17" height="6" rx="2"></rect>'),
             ('스윙분석', '<rect x="3" y="6" width="13" height="12" rx="2.5"></rect><path d="m16 11 5-3v8l-5-3z"></path>'),
             ('마이', '<circle cx="12" cy="8.5" r="3.7"></circle><path d="M5 20a7 7 0 0 1 14 0"></path>')]
    cells = ''
    for nm, d in items:
        on = nm == active
        col = FOREST if on else INK4
        pill = (f'background:{SOFT};border-radius:10px;' if on else '')
        # 'flex: 1' 에 공백을 둔다 — wireCommon 의 하단 탭 배선이 이 공백까지 포함해 매칭한다
        cells += (f'<span style="flex: 1;display:flex;flex-direction:column;align-items:center;gap:5px;'
                  f'color:{col};padding:7px 0 5px;{pill}">{ic(d, 19, "1.7")}'
                  f'<span style="font-size:11px;font-weight:{600 if on else 500}">{nm}</span></span>')
    return (f'<div style="flex:none;height:62px;background:{CARD};border-top:1px solid {LINE};'
            f'display:flex;align-items:flex-start;padding:5px 6px 0">{cells}</div>')


# ── 달력 ─────────────────────────────────────────────────────────────
SWING_DAYS = {1, 3, 6, 8, 10, 13, 15, 17, 20, 22}
COMMENT_DAYS = {8, 15, 22}
TODAY, FEEDBACK = 22, 27


def calendar(compact=True):
    cell = 27 if compact else 34
    fs = 12 if compact else 13
    rows, day = '', 1
    lead = 2                                     # 7월 1일 = 화요일
    grid = [None] * lead + list(range(1, 32))
    while len(grid) % 7:
        grid.append(None)
    for wk in range(0, len(grid), 7):
        cells = ''
        for d in grid[wk:wk + 7]:
            if d is None:
                cells += f'<span style="height:{cell + 12}px"></span>'
                continue
            is_today, is_fb = d == TODAY, d == FEEDBACK
            has_sw, has_cm = d in SWING_DAYS, d in COMMENT_DAYS
            col = INK if d <= TODAY else '#CFC8B8'
            box = ''
            if is_today:
                box = (f'width:{cell - 6}px;height:{cell - 6}px;border-radius:50%;background:{INK};'
                       f'color:#fff;display:flex;align-items:center;justify-content:center;')
            elif is_fb:
                box = (f'width:{cell - 6}px;height:{cell - 6}px;border-radius:50%;background:{FOREST};'
                       f'color:#fff;display:flex;align-items:center;justify-content:center;'
                       f'box-shadow:0 0 0 3px {SOFT};')
            dot = ''
            if is_fb:
                dot = f'<span style="font-size:9px;font-weight:500;color:#17301F;line-height:6px">피드백</span>'
            elif has_cm:
                dot = f'<span style="width:6px;height:6px;border-radius:50%;background:{BRONZE};display:block"></span>'
            elif has_sw:
                dot = f'<span style="width:6px;height:6px;border-radius:50%;background:{INK4};display:block"></span>'
            else:
                dot = '<span style="height:6px"></span>'
            cells += (f'<span data-day="{d}" style="display:flex;flex-direction:column;align-items:center;'
                      f'gap:3px;padding:3px 0;cursor:pointer">'
                      f'<span style="{NUM};font-weight:{700 if (is_today or is_fb) else 400};'
                      f'letter-spacing:-.03em;font-size:{fs}px;color:{col};{box}">{d}</span>{dot}</span>')
        rows += f'<div style="display:grid;grid-template-columns:repeat(7,1fr)">{cells}</div>'

    wd = ''.join(f'<span style="text-align:center;font-size:10px;font-weight:500;color:{INK4};'
                 f'padding-bottom:4px">{w}</span>' for w in '일월화수목금토')
    legend = ''.join(
        f'<span style="display:flex;align-items:center;gap:5px">'
        f'<span style="width:6px;height:6px;border-radius:50%;background:{c}"></span>'
        f'<span style="font-size:10px;font-weight:500;color:{INK3}">{t}</span></span>'
        for c, t in [(INK4, '스윙'), (BRONZE, '코멘트'), (FOREST, '피드백일')])

    pad = '11px 11px 9px' if compact else '13px 12px 11px'
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:{pad}">
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;padding-bottom:7px">
      <span style="color:{INK3}">{ic(LEFT, 14, '2.2')}</span>
      <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK};{NUM}">2026년 7월</span>
      <span style="color:{INK3}">{ic(RIGHT, 14, '2.2')}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">{wd}</div>
    {rows}
    <div style="display:flex;gap:12px;justify-content:center;padding-top:8px;margin-top:6px;
                border-top:1px solid #F2ECE2">{legend}</div>
  </div>'''


def week_strip():
    """이번 주 7일만. 어제·그제로 바로 가는 지름길이다.
       달 전체 조망은 못 하니 달력을 대체하진 못하고, 달력을 접어둘 때 짝이 된다."""
    cells = ''
    for d, w in zip(range(20, 27), '월화수목금토일'):
        is_today = d == TODAY
        has_sw, has_cm = d in SWING_DAYS, d in COMMENT_DAYS
        box = (f'width:26px;height:26px;border-radius:50%;background:{INK};color:#fff;'
               f'display:flex;align-items:center;justify-content:center;' if is_today else '')
        col = '#fff' if is_today else (INK if d <= TODAY else '#CFC8B8')
        dot = (f'<span style="width:5px;height:5px;border-radius:50%;background:'
               f'{BRONZE if has_cm else INK4}"></span>' if (has_sw or has_cm)
               else '<span style="height:5px"></span>')
        cells += (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;'
                  f'cursor:pointer"><span style="font-size:9.5px;font-weight:500;color:{INK4}">{w}</span>'
                  f'<span style="{NUM};font-size:12.5px;font-weight:{700 if is_today else 400};'
                  f'letter-spacing:-.03em;color:{col};{box}">{d}</span>{dot}</span>')
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:11px 10px 10px">
    <div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 3px 8px">
      <span style="font-size:11px;font-weight:600;letter-spacing:-.01em;color:{INK2}">이번 주</span>
      <span style="display:flex;align-items:center;gap:3px;font-size:11px;font-weight:600;color:{INK3}">
        7월 전체{ic(CHEV, 10, '2.4')}</span></div>
    <div style="display:flex">{cells}</div>
  </div>'''


def month_folded():
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:13px 14px;
              display:flex;align-items:center;gap:11px">
    <span style="flex:none;width:32px;height:32px;border-radius:9px;background:{SAND};color:{INK2};
                 display:flex;align-items:center;justify-content:center">
      {ic('<rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M8 3v4M16 3v4M3.5 10h17"></path>', 16, '1.7')}</span>
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">7월 달력으로 보기</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK3}">
        이번 달 <b style="font-weight:600;color:{INK2};{NUM}">12일</b> 연습했어요</span></span>
    <span style="flex:none;color:{INK4}">{ic(CHEV, 12, '2.4')}</span>
  </div>'''


# ── ① 오늘 카드 (기록 완료) ──────────────────────────────────────────
def today_done():
    def meta(k, v):
        return (f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.1em;color:{INK4};{NUM}">{k}</span>'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">{v}</span></span>')

    return f'''<div style="background:{CARD};border:1px solid #D8D1C2;border-radius:16px;padding:16px 16px 14px;
              box-shadow:0 8px 22px -16px rgba(20,22,24,.55)">
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:13px">
      <span style="font-size:16px;font-weight:600;letter-spacing:-.03em;color:{INK}">7월 22일 (수)</span>
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.06em;color:#fff;background:{INK};
                   border-radius:5px;padding:3px 7px">오늘</span>
      <span style="flex:1"></span>
      <span style="display:flex;align-items:center;gap:3px;font-size:11.5px;font-weight:600;color:{INK2}">
        수정{ic(CHEV, 10, '2.4')}</span>
    </div>

    <div style="display:flex;gap:11px">
      {thumb('0:27')}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:9px">
        <div style="display:flex;gap:8px">{meta('시간', '45분')}{meta('느낌', '보통')}</div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <span style="font-size:9.5px;font-weight:600;letter-spacing:.1em;color:{INK4};{NUM}">CLUB</span>
          <span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">드라이버 · 7번 아이언</span>
        </div>
      </div>
    </div>

    <div style="margin-top:13px;padding-top:12px;border-top:1px solid #F2ECE2;
                font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7">
      “백스윙이 자꾸 들려요. 힘 빼면 클럽이 안 올라가고요.”</div>

  </div>'''


def today_video_only():
    """영상은 올렸는데 시간·느낌·메모를 안 쓴 날. 실제로 제일 흔하다.
       올린 건 보여주고, 빠진 것만 채우라고 한다."""
    return f'''<div style="background:{CARD};border:1px solid #D8D1C2;border-radius:16px;padding:16px;
              box-shadow:0 8px 22px -16px rgba(20,22,24,.55)">
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:13px">
      <span style="font-size:16px;font-weight:600;letter-spacing:-.03em;color:{INK}">7월 22일 (수)</span>
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.06em;color:#fff;background:{INK};
                   border-radius:5px;padding:3px 7px">오늘</span>
    </div>
    <div style="display:flex;gap:11px;align-items:center">
      {thumb('0:27', 76, 76)}
      <span style="flex:1;display:flex;flex-direction:column;gap:4px">
        <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:{INK}">
          영상 1개 올렸어요</span>
        <span style="font-size:11.5px;font-weight:500;color:{INK3};line-height:1.6">
          연습 시간 · 느낌 · 메모가 아직 비어 있어요</span></span>
    </div>
    <span style="display:block;margin-top:13px;background:{FOREST};color:#fff;border-radius:11px;padding:12px;
                 text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em">기록 마저 쓰기</span>
  </div>'''


# ── ① 오늘 카드 (아직 안 함) ────────────────────────────────────────
def today_empty():
    return f'''<div style="background:{CARD};border:1px solid #D8D1C2;border-radius:16px;padding:16px;
              box-shadow:0 8px 22px -16px rgba(20,22,24,.55)">
    <div style="display:flex;align-items:center;gap:8px;padding-bottom:14px">
      <span style="font-size:16px;font-weight:600;letter-spacing:-.03em;color:{INK}">7월 22일 (수)</span>
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.06em;color:#fff;background:{INK};
                   border-radius:5px;padding:3px 7px">오늘</span>
    </div>
    <div style="border:1.5px dashed #CFC8B8;border-radius:12px;padding:22px 16px;display:flex;
                flex-direction:column;align-items:center;gap:8px">
      <span style="width:38px;height:38px;border-radius:50%;background:{SAND};color:{FOREST};
                   display:flex;align-items:center;justify-content:center">
        {ic('<path d="M12 16V5"></path><path d="m7.5 9.5 4.5-4.5 4.5 4.5"></path>'
            '<path d="M4.5 15v3A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"></path>', 19, '1.7')}</span>
      <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:{INK}">오늘 스윙 올리기</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK3}">정면 · 측면 모두 올릴 수 있어요</span>
    </div>
    <span style="display:block;margin-top:11px;background:{FOREST};color:#fff;border-radius:11px;padding:12px;
                 text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em">오늘 연습 기록하기</span>
    <div style="margin-top:12px;padding-top:11px;border-top:1px solid #F2ECE2;display:flex;
                align-items:center;gap:7px">
      <span style="font-size:11.5px;font-weight:500;color:{INK3};flex:1">
        어제는 <b style="font-weight:600;color:{INK2}">45분 · 드라이버</b> 연습했어요</span>
      <span style="font-size:11px;font-weight:600;color:{BRONZE};{NUM}">🔥 3일 연속</span>
    </div>
  </div>'''


# ── ② 프로 코멘트 ────────────────────────────────────────────────────
def comment_block(state):
    used, total = 2, 5
    bars = ''.join(
        f'<span style="flex:1;height:4px;border-radius:99px;background:'
        f'{BRONZE if i < total - used else "#E4DED2"}"></span>' for i in range(total))
    quota = (f'<div style="display:flex;align-items:center;gap:9px;margin-top:11px">'
             f'<span style="flex:1;display:flex;gap:3px">{bars}</span>'
             f'<span style="font-size:11px;font-weight:600;color:{INK2};{NUM};white-space:nowrap">'
             f'{total - used} / {total}회 남음</span></div>')

    if state in ('none', 'used'):
        # f-string 안에 역슬래시를 못 넣으니 아이콘·문구를 먼저 만들어 둔다
        if state == 'none':
            icon = ic(BUBBLE, 16, '1.7')
            t1, t2 = '영상을 올리면 코멘트를 받을 수 있어요', '이번 달 3 / 5회 남음'
            extra = ''
        else:
            icon = ic(CLOCK, 16, '1.7')
            t1, t2 = '이번 달 코멘트를 다 썼어요', '8월 1일에 5회로 다시 채워져요'
            extra = (f'<span style="flex:none;font-size:11px;font-weight:600;color:{INK2};'
                     f'border:1px solid {LINE};border-radius:8px;padding:7px 10px">플랜 보기</span>')
        return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:14px 15px">'
                f'<div style="display:flex;align-items:center;gap:11px">'
                f'<span style="flex:none;width:34px;height:34px;border-radius:9px;background:{SAND};'
                f'color:{INK4};display:flex;align-items:center;justify-content:center">{icon}</span>'
                f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK3}">{t1}</span>'
                f'<span style="font-size:11px;font-weight:500;color:{INK4}">{t2}</span></span>'
                f'{extra}</div></div>')
    if state == 'ask':
        body = f'''<div style="display:flex;align-items:center;gap:11px">
      {thumb('0:27', 44, 44)}
      <span style="flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">오늘 올린 영상에</span>
        <span style="font-size:11px;font-weight:500;color:{INK3}">프로가 한두 마디 짚어드려요</span></span>
    </div>
    <span style="display:block;margin-top:12px;background:{FOREST};color:#fff;border-radius:11px;padding:13px;
                 text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em">프로 코멘트 요청하기</span>
    {quota}'''
    elif state == 'wait':
        body = f'''<div style="display:flex;align-items:center;gap:11px">
      <span style="flex:none;width:34px;height:34px;border-radius:50%;background:{SAND};color:{INK2};
                   display:flex;align-items:center;justify-content:center">
        {ic('<circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5l3 2"></path>', 17, '1.7')}</span>
      <span style="flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">
          이도형 프로가 확인하고 있어요</span>
        <span style="font-size:11px;font-weight:500;color:{INK3};white-space:nowrap">
          <b style="font-weight:600;color:{INK2};{NUM}">6시간</b> 전 요청 ·
          보통 <b style="font-weight:600;color:{INK2};{NUM}">9시간</b>쯤 걸려요</span></span>
      <span style="flex:none;color:{INK4}">{ic(CHEV, 12, '2.4')}</span>
    </div>{quota}'''
    else:  # arrived
        body = f'''<div style="display:flex;align-items:flex-start;gap:11px">
      <span style="flex:none;width:34px;height:34px;border-radius:50%;background:{FOREST};color:#fff;
                   display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600">이</span>
      <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
        <span style="display:flex;align-items:center;gap:6px">
          <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">이도형 프로</span>
          <span style="font-size:9px;font-weight:700;letter-spacing:.06em;color:{FOREST};
                       background:rgba(33,64,47,.12);border-radius:4px;padding:2px 5px">NEW</span></span>
        <span style="font-size:12px;font-weight:500;color:{INK2};line-height:1.65;
                     display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
          톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 영상 0:07 보시면…</span></span>
    </div>
    <span style="display:block;margin-top:12px;background:{SOFT};color:{FOREST};border-radius:11px;padding:12px;
                 text-align:center;font-size:13px;font-weight:600;letter-spacing:-.02em">코멘트 보러가기</span>'''

    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:14px 15px">'
            f'{body}</div>')


# ── ③ 정기 피드백 ────────────────────────────────────────────────────
def feedback_block():
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:14px 15px">
    <div style="display:flex;align-items:center;gap:9px">
      <span style="flex:1;display:flex;flex-direction:column;gap:4px">
        <span style="font-size:11px;font-weight:500;color:{INK3}">이번 달 정기 피드백 · 월 1회</span>
        <span style="font-size:14px;font-weight:600;letter-spacing:-.025em;color:{INK}">
          7월 27일 (월) 도착 예정</span></span>
      <span style="flex:none;font-size:12.5px;font-weight:700;color:{FOREST};background:{SOFT};
                   border-radius:7px;padding:6px 10px;{NUM};letter-spacing:-.03em">D-5</span>
    </div>
    <div style="height:5px;border-radius:99px;background:{SAND};margin-top:12px;overflow:hidden">
      <span style="display:block;height:100%;width:72%;background:{FOREST};border-radius:99px"></span></div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:9px">
      <span style="flex:1;font-size:11px;font-weight:500;color:{INK3}">
        이번 달 올린 영상 <b style="font-weight:600;color:{INK2};{NUM}">12개</b> · 프로가 모아서 분석 중</span>
      <span style="font-size:11px;font-weight:600;color:{INK2}">지난 레슨</span>
      <span style="color:{INK4}">{ic(CHEV, 10, '2.4')}</span>
    </div>
  </div>'''


# ── ⑤ 이번 달 요약 ──────────────────────────────────────────────────
def month_summary():
    def st(v, u, k):
        return (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">'
                f'<span style="font-size:18px;font-weight:600;color:{INK};{NUM};letter-spacing:-.04em">{v}'
                f'<span style="font-size:11px;font-weight:500;color:{INK3}">{u}</span></span>'
                f'<span style="font-size:10px;font-weight:500;color:{INK3}">{k}</span></span>')
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:14px 8px;'
            f'display:flex">{st("12", "일", "연습")}{st("18", "개", "영상")}'
            f'{st("2", "회", "코멘트")}{st("5", "일", "최장 연속")}</div>')


# ── 화면 조립 ────────────────────────────────────────────────────────
def scr_new(state, cal='month'):
    today = today_empty() if state == 'empty' else today_done()
    cm = comment_block('ask' if state == 'empty' else ('arrived' if state == 'arrived' else 'wait'))
    if cal == 'strip':
        past = f'<div style="flex:none;margin-top:20px">{month_folded()}</div>'
    else:
        past = (f'<div style="flex:none;margin-top:20px">'
                f'{cap("지난 기록", "날짜를 누르면 그날을 볼 수 있어요")}{calendar()}</div>')
    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('연습기록', f'<span style="flex:none;font-size:11px;font-weight:600;color:{INK2};'
                     f'background:{CARD};border:1px solid {LINE};border-radius:8px;padding:6px 10px;{NUM}">'
                     f'7월 · 12일</span>')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:4px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none">{cap('오늘', '7월 22일 수요일')}{today}</div>
    {'<div style="flex:none;margin-top:10px">' + week_strip() + '</div>' if cal == 'strip' else ''}
    <div style="flex:none;margin-top:20px">{cap('프로 코멘트')}{cm}</div>
    <div style="flex:none;margin-top:20px">{cap('정기 피드백', '월 1회')}{feedback_block()}</div>
    {past}
    <div style="flex:none;margin-top:14px">{month_summary()}</div>
  </div>
  {bottom_nav()}
</div>'''


def scr_day():
    def meta(k, v):
        return (f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.1em;color:{INK4};{NUM}">{k}</span>'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">{v}</span></span>')
    return f'''<div style="{FRAME}">
  {statusbar()}
  {back_header('7월 15일 (화)', f'<span style="font-size:11px;font-weight:600;color:{INK2}">수정</span>')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">

    <div style="flex:none">{cap('영상', '2개')}
      <div style="display:flex;gap:8px">{thumb('0:31', 148, 104)}{thumb('0:24', 148, 104)}</div>
    </div>

    <div style="flex:none;margin-top:20px">{cap('연습 기록')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:14px 15px">
        <div style="display:flex;gap:8px">{meta('시간', '60분')}{meta('느낌', '좋았음')}{meta('클럽', '7번 아이언')}</div>
        <div style="margin-top:12px;padding-top:11px;border-top:1px solid #F2ECE2;
                    font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7">
          “하체부터 시작하니까 확실히 편했어요. 근데 마지막에 다시 팔로 치게 되네요.”</div>
      </div>
    </div>

    <div style="flex:none;margin-top:20px">{cap('프로 코멘트', '7월 15일 받음')}
      {comment_block('arrived')}
    </div>

    <div style="flex:1;min-height:16px"></div>
    <div style="flex:none;display:flex;align-items:center;gap:8px;padding-top:14px">
      <span style="flex:1;display:flex;align-items:center;gap:6px;background:{CARD};border:1px solid {LINE};
                   border-radius:11px;padding:11px;font-size:12px;font-weight:600;color:{INK2}">
        <span style="color:{INK4}">{ic(LEFT, 13, '2.2')}</span>7월 14일</span>
      <span style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:6px;background:{CARD};
                   border:1px solid {LINE};border-radius:11px;padding:11px;font-size:12px;font-weight:600;color:{INK2}">
        7월 16일<span style="color:{INK4}">{ic(RIGHT, 13, '2.2')}</span></span>
    </div>
  </div>
</div>'''


# ── 비교 보드 ────────────────────────────────────────────────────────
def board():
    fp = os.path.join(HERE, 'fonts-page.css')
    fonts = open(fp if os.path.exists(fp) else os.path.join(SRC, 'board-fonts.css'), encoding='utf-8').read()

    FINAL = [
        ('확정', '기록을 마친 날', scr_new('done')),
        ('확정', '아직 아무것도 안 한 날', scr_new('empty')),
        ('확정', '그날 하루 · 달력에서 진입', scr_day()),
    ]
    phones = ''.join(
        f'<section class="panel"><div class="ptag"><span class="chip">{tag}</span>'
        f'<span class="psub">{sub}</span></div><div class="phone">{html}</div></section>'
        for tag, sub, html in FINAL)

    TODAY_STATES = [
        ('아무것도 안 함', '올린 영상도 쓴 기록도 없다', today_empty()),
        ('영상만 올림', '제일 흔한 날. 빠진 것만 채우라고 한다', today_video_only()),
        ('기록까지 마침', '오늘 한 일이 한 장에 남는다', today_done()),
    ]
    CM_STATES = [
        ('오늘 영상 없음', '요청할 대상이 없으니 조용히 있는다', comment_block('none')),
        ('요청 안 함', '올린 영상이 있으면 버튼이 살아난다', comment_block('ask')),
        ('요청함 · 대기', '지나온 시간을 보여준다', comment_block('wait')),
        ('도착', '프로 코멘트 첫 두 줄 미리보기', comment_block('arrived')),
        ('이번 달 소진', '언제 다시 채워지는지 알려준다', comment_block('used')),
    ]

    def cardset(states):
        out = ''
        for nm, why, html in states:
            out += (f'<div class="scard"><div class="sname">{nm}</div>'
                    f'<div class="swhy">{why}</div><div class="sbox">{html}</div></div>')
        return out

    COMBO = [
        ('영상도 기록도 안 한 날', '아무것도 안 함', '오늘 영상 없음'),
        ('영상만 올리고 만 날', '영상만 올림', '요청 안 함'),
        ('영상 올리고 기록도 쓴 날', '기록까지 마침', '요청 안 함'),
        ('코멘트까지 요청한 날', '기록까지 마침', '요청함 · 대기'),
        ('프로 답이 온 날', '기록까지 마침', '도착'),
        ('이번 달 5회 다 쓴 뒤', '기록까지 마침', '이번 달 소진'),
    ]
    rows = ''.join(
        f'<tr><td class="q">{d}</td><td><span class="v vok">{a}</span></td>'
        f'<td><span class="v vhalf">{b}</span></td></tr>' for d, a, b in COMBO)

    return f'''<style>
{fonts}
:root{{
  --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2; --panel:#FFFDF9;
  --acc:#21402F; --soft:#F2F8F4; --br:#A67C3D; --stage:#F3EFE8;
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
.wrap{{max-width:1560px;margin:0 auto;padding:44px 24px 80px}}
header.top{{max-width:680px;margin-bottom:34px}}
.eyebrow{{font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--cs2);
  font-family:var(--font-num);margin-bottom:12px}}
h1{{font-size:30px;font-weight:400;letter-spacing:-.035em;line-height:1.35;text-wrap:balance}}
h1 b{{font-weight:600}}
.lede{{font-size:14px;color:var(--cs);margin-top:14px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}

.rail{{display:flex;gap:26px;overflow-x:auto;padding:6px 2px 10px}}
.panel{{flex:none;width:360px}}
.ptag{{display:flex;align-items:baseline;gap:9px;padding:0 2px 12px}}
.chip{{font-size:11px;font-weight:700;letter-spacing:.04em;font-family:var(--font-num);
  background:var(--acc);color:var(--pg);border-radius:6px;padding:4px 9px}}
.psub{{font-size:12px;color:var(--cs)}}
.phone{{display:flex;justify-content:center}}

.sec{{margin-top:56px}}
h2{{font-size:19px;font-weight:600;letter-spacing:-.025em;margin-bottom:6px}}
.sub{{font-size:13px;color:var(--cs);margin-bottom:22px;max-width:660px;line-height:1.85}}
.sub b{{color:var(--ct);font-weight:600}}
.cards{{display:flex;gap:18px;overflow-x:auto;padding:2px 2px 14px}}
.scard{{flex:none;width:328px}}
.sname{{font-size:12.5px;font-weight:600;letter-spacing:-.01em;margin-bottom:2px}}
.swhy{{font-size:11.5px;color:var(--cs);margin-bottom:11px;line-height:1.6;min-height:34px}}
.sbox{{background:var(--stage);border:1px solid var(--bd);border-radius:16px;padding:14px}}

.tw{{overflow-x:auto;border:1px solid var(--bd);border-radius:14px;background:var(--panel);max-width:900px}}
table{{border-collapse:collapse;width:100%;min-width:600px}}
td{{padding:13px 16px;border-top:1px solid var(--bd);font-size:12.5px;color:var(--cs);vertical-align:middle}}
tr:first-child td{{border-top:none}}
td.q{{color:var(--ct);font-weight:500;width:250px}}
.v{{display:inline-block;white-space:nowrap;font-size:10.5px;font-weight:600;border-radius:6px;
  padding:4px 9px;font-family:var(--font-num)}}
.vok{{background:var(--soft);color:var(--acc)}}
.vhalf{{background:rgba(166,124,61,.14);color:var(--br)}}
.thead td{{font-size:9.5px;font-weight:600;letter-spacing:.16em;color:var(--cs2);
  font-family:var(--font-num);padding-bottom:6px}}

.asks{{margin-top:48px;max-width:900px;background:var(--panel);border:1px solid var(--bd);
  border-radius:16px;padding:22px 24px}}
.asks ol{{padding-left:19px;display:flex;flex-direction:column;gap:12px;margin-top:14px}}
.asks li{{font-size:13px;color:var(--cs);line-height:1.8}}
.asks li b{{color:var(--ct);font-weight:600}}
@media (max-width:760px){{ .wrap{{padding:28px 14px 60px}} h1{{font-size:24px}} }}
</style>

<div class="wrap">
  <header class="top">
    <div class="eyebrow">NEXT SWING · 연습기록 · 확정본</div>
    <h1>업로드만 한 날에도 <b>새 페이지는 없다</b></h1>
    <p class="lede">연습기록은 <b>화면 하나</b>다. 그 안의 카드 두 장이 각자 얼굴을 바꿀 뿐이다.
      영상만 올린 날, 코멘트를 안 부른 날, 이번 달 5회를 다 쓴 날 — 전부 같은 화면에서 처리된다.
      아래에 <b>오늘 카드 3가지</b>와 <b>프로 코멘트 카드 5가지</b>를 다 그려놨다.</p>
  </header>

  <div class="rail">{phones}</div>

  <div class="sec">
    <h2>오늘 카드 — 3가지 얼굴</h2>
    <div class="sub">위에서 아래로 갈수록 채워진다. <b>돌아갈 수도 있다</b> —
      기록을 쓴 뒤에 영상을 하나 더 올려도 카드는 안 깨진다.</div>
    <div class="cards">{cardset(TODAY_STATES)}</div>
  </div>

  <div class="sec">
    <h2>프로 코멘트 카드 — 5가지 얼굴</h2>
    <div class="sub">오늘 카드와 <b>따로 논다.</b> 영상만 올리고 코멘트는 안 부르는 날이 대부분일 텐데,
      그럴 땐 버튼만 그대로 앉아 있고 아무 재촉도 안 한다.</div>
    <div class="cards">{cardset(CM_STATES)}</div>
  </div>

  <div class="sec">
    <h2>그래서 어떤 날에 뭐가 뜨나</h2>
    <div class="sub">여섯 가지 날 전부 <b>같은 화면 한 장</b>이다.</div>
    <div class="tw"><table>
      <tr class="thead"><td>이런 날</td><td>오늘 카드</td><td>프로 코멘트 카드</td></tr>
      {rows}
    </table></div>
  </div>

  <div class="asks">
    <h2>이제 씌우면 되는데, 두 개만</h2>
    <ol>
      <li><b>“영상만 올린 날” 카드를 새로 그렸다</b> (가운데). 원래 시안엔 없던 상태다 —
        형이 말한 그 날이 실제로 제일 흔할 것 같아서 만들었다. 문구 봐줘.</li>
      <li><b>이번 달 소진 카드에 “플랜 보기”를 넣었다.</b> 5회를 다 쓴 사람은 Elite 후보라서.
        너무 장사 같으면 뺀다.</li>
      <li>씌울 때 <b>마이크로 인터랙션</b>도 같이 넣는다 — 업로드 완료 표시, 코멘트 도착 배지,
        연속 기록 불꽃. GPT가 마지막에 말한 그거.</li>
    </ol>
  </div>
</div>'''


if __name__ == '__main__':
    out = os.path.join(HERE, 'practice-redesign.html')
    open(out, 'w', encoding='utf-8-sig').write(board())   # BOM — file:// 로 열 때 UTF-8 로 잡히게
    print(f'{os.path.getsize(out) / 1024:.0f} KB → {os.path.basename(out)}')
