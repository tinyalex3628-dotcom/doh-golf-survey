# -*- coding: utf-8 -*-
"""알림 3종 — 알림함(nt) · 알림 설정(ns) · 푸시 문구 시안(np).

   이 앱에서 알림이 울릴 이유는 딱 두 가지다.
     ① 프로가 나에게 무언가를 줬다        → 즉시 · 끌 수 없음 · 앱을 열게 만드는 알림
     ② 내가 오늘 할 일을 안 했다          → 밤 9시 · 끌 수 있음 · 습관을 붙이는 알림
   그 외(할인·추천·재구독 권유)는 보내지 않는다. 프로가 준 것과 광고가
   같은 자리에서 울리는 순간 ① 이 무시당하기 시작하고, 그게 이 앱의 심장이다.

   무료 회원에겐 ① 이 존재하지 않는다(프로 관리가 없으니까).
   그래서 무료 회원의 알림함은 조용하다 — 그 빈자리가 곧 유료의 이유다.
"""
import json, os
import split_concepts as SC

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = SC.BG, SC.CARD, SC.FOREST
INK, INK2, INK3, INK4 = SC.INK, SC.INK2, SC.INK3, SC.INK4
LINE, SAND, BRONZE, SOFT, BR_SOFT = SC.LINE, SC.SAND, SC.BRONZE, SC.SOFT, SC.BR_SOFT
NUM, ic, cap, thumb = SC.NUM, SC.ic, SC.cap, SC.thumb
FRAME, LEFT, CHEV = SC.FRAME, SC.LEFT, SC.CHEV

ENVELOPE = ('<rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect>'
            '<path d="m3.8 7 8.2 6 8.2-6"></path>')
BUBBLE = '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"></path>'
SPARK = '<path d="M12 3.5 14.4 9l5.6.6-4.2 3.8 1.2 5.5-5-2.9-5 2.9 1.2-5.5L4 9.6 9.6 9z"></path>'
FLAME = '<path d="M12 3s4.5 4 4.5 8a4.5 4.5 0 0 1-9 0c0-1.5 1-3 1-3S8 11 9.5 12c1.2-2.5 2.5-4.5 2.5-9z"></path>'
CAL = ('<rect x="3.5" y="5" width="17" height="15" rx="3"></rect>'
       '<path d="M8 3v4M16 3v4M3.5 10h17"></path>')
CARD_IC = '<rect x="3" y="6" width="18" height="12" rx="2.5"></rect><path d="M3 10h18"></path>'
BELL = '<path d="M18 10a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"></path><path d="M10.5 20a1.8 1.8 0 0 0 3 0"></path>'
MOON = '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path>'


def statusbar():
    return SC.statusbar()


def topbar(title, right=''):
    """뒤로가기 헤더 — 알림함·설정은 탭이 아니라 겹쳐 뜨는 화면이다."""
    return (f'<div style="flex:none;height:52px;background:{BG};display:flex;align-items:center;'
            f'gap:6px;padding:0 12px">'
            f'<span data-nt-back style="width:32px;height:32px;display:flex;align-items:center;'
            f'justify-content:center;color:{INK}">{ic(LEFT, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:17px;font-weight:700;letter-spacing:-.03em;color:{INK}">{title}</b>'
            f'{right}</div>')


# ── 알림 종류 · 이 앱의 전부 ──────────────────────────────────────────
#  key,  아이콘,          색,       배경,        분류
KIND = {
    'fb':    (ENVELOPE, FOREST, SOFT,     '정기 피드백'),
    'cm':    (BUBBLE,   BRONZE, BR_SOFT,  '프로 한마디'),
    'reply': (BUBBLE,   BRONZE, BR_SOFT,  '프로 답글'),
    'ai':    (SPARK,    INK2,   SAND,     'AI 분석'),
    # 연속 기록은 프로가 준 게 아니라 앱이 보내는 리마인더다. 색을 갈라둔다.
    'streak':(FLAME,    INK2,   SAND,     '연속 기록'),
    'remind':(CAL,      INK2,   SAND,     '연습 기록'),
    'pay':   (CARD_IC,  INK2,   SAND,     '결제'),
}


def kind_icon(k, sz=34):
    d, fg, bg, _ = KIND[k]
    return (f'<span style="flex:none;width:{sz}px;height:{sz}px;border-radius:10px;background:{bg};'
            f'color:{fg};display:flex;align-items:center;justify-content:center">{ic(d, 17, "1.8")}</span>')


# ── 알림함 ───────────────────────────────────────────────────────────
#  (종류, 제목, 본문, 시각, 안읽음, 썸네일)
FEED_TODAY = [
    ('cm', '이도형 프로가 한마디를 남겼어요', '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이…',
     '오후 3:12', True, True),
    ('ai', 'AI 분석이 끝났어요', '7월 22일 드라이버 · 스윙스코어 74점', '오전 11:40', True, False),
]
FEED_WEEK = [
    ('fb', '7월호 리포트가 도착했어요', 'No.06 톱에서 왼팔 각 잡기 · 3주 프로그램',
     '7월 20일', False, False),
    ('streak', '5일 연속 기록이 오늘 끊겨요', '지금 기록하면 이어집니다', '7월 19일 오후 9:00', False, False),
    ('reply', '남기신 질문에 프로가 답했어요', '“그립을 더 짧게 잡아도 되나요?” → 답변 도착',
     '7월 18일', False, False),
]
FEED_OLD = [
    ('remind', '오늘 연습 기록을 안 하셨어요', '1분이면 끝나요', '7월 14일 오후 9:00', False, False),
    ('pay', '8월 1일에 39,000원이 결제돼요', 'Coaching · 카드 끝자리 4821', '7월 12일', False, False),
]


def feed_row(k, title, body, when, unread, thumb_on, last):
    bd = '' if last else f'border-bottom:1px solid #F2ECE2;'
    dot = (f'<span style="position:absolute;left:3px;top:22px;width:6px;height:6px;border-radius:50%;'
           f'background:{BRONZE}"></span>' if unread else '')
    th = ('<span style="flex:none;width:38px;height:38px;border-radius:8px;overflow:hidden;'
          'background:linear-gradient(150deg,#3A3B33,#1D2420)"></span>' if thumb_on else '')
    tw = '600' if unread else '500'
    return f'''<div data-nt-row="{k}" style="position:relative;{bd}display:flex;gap:11px;
              align-items:flex-start;padding:13px 4px 13px 14px">{dot}{kind_icon(k)}
    <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
      <span style="font-size:12.5px;font-weight:{tw};letter-spacing:-.02em;color:{INK};
                   line-height:1.45">{title}</span>
      <span style="font-size:11.5px;font-weight:400;color:{INK3};line-height:1.6;
                   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
                   overflow:hidden">{body}</span>
      <span style="font-size:10px;font-weight:500;color:{INK4};{NUM};padding-top:2px">{when}</span>
    </span>{th}
    <span style="flex:none;width:6px"></span>
  </div>'''


def group(title, rows):
    body = ''.join(feed_row(*r, last=(i == len(rows) - 1)) for i, r in enumerate(rows))
    return (f'<div style="flex:none;margin-bottom:16px">{cap(title)}'
            f'<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;'
            f'overflow:hidden">{body}</div></div>')


def scr_nt():
    read_all = (f'<span data-nt-readall style="flex:none;font-size:11px;font-weight:600;color:{INK2};'
                f'border:1px solid {LINE};background:{CARD};border-radius:8px;padding:7px 10px">'
                f'모두 읽음</span>')
    empty_note = (f'<div style="flex:none;margin-top:2px;background:{SAND};border-radius:11px;'
                  f'padding:12px 13px;font-size:11px;font-weight:500;color:{INK3};line-height:1.7">'
                  f'밤 10시부터 아침 8시까지는 알림을 보내지 않아요. '
                  f'<span data-nt-tosetting style="font-weight:700;color:{FOREST}">알림 설정 ›</span></div>')
    return f'''<div style="{FRAME}">
  {statusbar()}
  {topbar('알림', read_all)}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:8px 16px 18px;display:flex;flex-direction:column">
    {group('오늘', FEED_TODAY)}
    {group('이번 주', FEED_WEEK)}
    {group('지난 알림', FEED_OLD)}
    {empty_note}
  </div>
</div>'''


# ── 알림 설정 ────────────────────────────────────────────────────────
def toggle(on, key):
    knob = 'right:3px' if on else 'left:3px'
    bg = FOREST if on else '#D9D2C4'
    return (f'<span data-ns-tg="{key}" data-on="{"1" if on else ""}" style="flex:none;position:relative;'
            f'width:40px;height:23px;border-radius:99px;background:{bg};transition:background .16s">'
            f'<span style="position:absolute;top:3px;{knob};width:17px;height:17px;border-radius:50%;'
            f'background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:all .16s"></span></span>')


def ns_row(k, title, sub, on, key, locked=False, last=False):
    bd = '' if last else 'border-bottom:1px solid #F2ECE2;'
    right = (f'<span style="flex:none;font-size:10px;font-weight:600;color:{INK4};background:{SAND};'
             f'border-radius:6px;padding:5px 8px">항상 켬</span>' if locked else toggle(on, key))
    return f'''<div style="{bd}display:flex;align-items:center;gap:11px;padding:13px 14px">
    {kind_icon(k, 30)}
    <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
      <span style="font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">{title}</span>
      <span style="font-size:10.5px;font-weight:400;color:{INK3};line-height:1.55">{sub}</span>
    </span>{right}</div>'''


def ns_block(title, note, rows):
    body = ''.join(ns_row(*r, last=(i == len(rows) - 1)) for i, r in enumerate(rows))
    return (f'<div style="flex:none;margin-bottom:18px">{cap(title, note)}'
            f'<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;'
            f'overflow:hidden">{body}</div></div>')


def scr_ns():
    got = ns_block('프로가 준 것', '끌 수 없어요', [
        ('fb', '정기 피드백 도착', '리포트가 올라오면 바로', True, 'fb', True),
        ('cm', '프로 한마디 도착', '영상에 한마디가 달리면 바로', True, 'cm', True),
        ('reply', '내 질문에 답글', '남긴 질문에 프로가 답하면', True, 'reply', True),
    ])
    push = ns_block('나를 움직이는 알림', '밤 9시', [
        ('remind', '연습 기록 안 한 날', '기록이 없는 날에만 하루 한 번', True, 'remind'),
        ('streak', '연속 기록이 끊길 때', '3일 이상 이어졌을 때만', True, 'streak'),
        ('cm', '이번 달 남은 한마디', '월말 5일 전 한 번', False, 'left'),
    ])
    etc = ns_block('그 밖에', '', [
        ('ai', 'AI 분석 완료', '분석이 끝나면', True, 'ai'),
        ('pay', '결제 · 구독', '결제 3일 전 · 결제 결과', True, 'pay'),
    ])
    quiet = f'''<div style="flex:none;margin-bottom:18px">{cap('조용한 시간')}
    <div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:13px 14px;
                display:flex;align-items:center;gap:11px">
      <span style="flex:none;width:30px;height:30px;border-radius:9px;background:{SAND};color:{INK2};
                   display:flex;align-items:center;justify-content:center">{ic(MOON, 16, '1.8')}</span>
      <span style="flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:12.5px;font-weight:600;color:{INK}">밤 10:00 ~ 아침 8:00</span>
        <span style="font-size:10.5px;font-weight:400;color:{INK3}">이 시간엔 아무것도 보내지 않아요</span>
      </span>{toggle(True, 'quiet')}</div></div>'''
    foot = (f'<div style="flex:none;font-size:10.5px;font-weight:400;color:{INK4};line-height:1.75;'
            f'padding:0 2px">할인·이벤트 알림은 보내지 않습니다. '
            f'프로가 준 것과 광고가 같은 자리에서 울리면, 프로가 준 것부터 무시하게 되니까요.</div>')
    return f'''<div style="{FRAME}">
  {statusbar()}
  {topbar('알림 설정')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:8px 16px 18px;display:flex;flex-direction:column">
    {got}{push}{etc}{quiet}{foot}
  </div>
</div>'''


# ── 푸시 문구 시안 (잠금화면) ────────────────────────────────────────
#  (종류, 언제 보내나, 제목, 본문)
PUSH = [
    ('cm', '프로가 한마디를 단 즉시', 'NEXT SWING',
     '이도형 프로가 오늘 스윙에 한마디를 남겼어요'),
    ('fb', '리포트 업로드 즉시', 'NEXT SWING',
     '7월호 리포트 No.06 「톱에서 왼팔 각 잡기」가 도착했어요'),
    ('streak', '연속 3일 이상 · 기록 없는 날 밤 9시', 'NEXT SWING',
     '5일 연속 기록이 오늘 끊겨요. 1분이면 이어집니다'),
    ('remind', '기록 없는 날 밤 9시 (연속 0~2일)', 'NEXT SWING',
     '오늘 연습하셨나요? 영상 없이 기록만 남겨도 돼요'),
    ('fb', '리포트 도착 3일 전', 'NEXT SWING',
     '8월호 리포트까지 3일. 지금까지 12개 올리셨어요'),
]


def lock_push(k, when, title, body, first=False):
    d, fg, bg, label = KIND[k]
    icon = (f'<span style="flex:none;width:20px;height:20px;border-radius:5px;background:{FOREST};'
            f'color:#fff;display:flex;align-items:center;justify-content:center;font-size:8px;'
            f'font-weight:700;letter-spacing:-.04em">NS</span>')
    when_row = (f'<div style="display:flex;align-items:center;gap:6px;padding:0 2px 7px">'
                f'<span style="width:5px;height:5px;border-radius:50%;background:{fg}"></span>'
                f'<span style="font-size:10px;font-weight:600;color:rgba(255,255,255,.72)">{label}</span>'
                f'<span style="font-size:10px;font-weight:400;color:rgba(255,255,255,.45)">· {when}</span>'
                f'</div>')
    return f'''<div style="flex:none;margin-bottom:12px">{when_row}
    <div style="background:rgba(255,255,255,.16);backdrop-filter:blur(8px);border-radius:15px;
                padding:11px 13px;display:flex;flex-direction:column;gap:5px">
      <div style="display:flex;align-items:center;gap:7px">{icon}
        <span style="flex:1;font-size:10.5px;font-weight:600;color:rgba(255,255,255,.9);
                     letter-spacing:.02em">{title}</span>
        <span style="font-size:9.5px;font-weight:500;color:rgba(255,255,255,.5);{NUM}">지금</span></div>
      <span style="font-size:12.5px;font-weight:500;color:#fff;line-height:1.55;
                   letter-spacing:-.01em">{body}</span>
    </div></div>'''


def scr_np():
    cards = ''.join(lock_push(*p, first=(i == 0)) for i, p in enumerate(PUSH))
    rules = f'''<div style="flex:none;margin-top:6px;background:rgba(255,255,255,.1);border-radius:13px;
              padding:14px 15px;display:flex;flex-direction:column;gap:9px">
    <span style="font-size:9.5px;font-weight:700;letter-spacing:.18em;color:rgba(255,255,255,.5)">보내는 규칙</span>
    ''' + ''.join(
        f'<span style="font-size:11.5px;font-weight:400;color:rgba(255,255,255,.82);line-height:1.6">'
        f'· {t}</span>' for t in [
            '프로가 준 것(한마디·리포트·답글)은 즉시, 그 외는 밤 9시에 모아서',
            '리마인더는 하루 1개까지 — 두 개가 겹치면 연속 기록 쪽만 보냄',
            '밤 10시 ~ 아침 8시는 아무것도 보내지 않음',
            '할인 · 이벤트 · 재구독 권유는 푸시로 보내지 않음',
            '무료 회원에게는 프로 관련 알림 자체가 없음 (AI 분석 · 기록 리마인더만)',
        ]) + '</div>'
    return f'''<div style="{FRAME};background:#1D2420">
  <div style="flex:none;height:44px;display:flex;align-items:center;justify-content:space-between;
              padding:0 24px;font-size:12px;color:rgba(255,255,255,.85)">
    <span style="{NUM}">9:41</span>
    <span style="display:flex;gap:4px;align-items:center">
      <span style="width:15px;height:9px;border:1px solid rgba(255,255,255,.7);border-radius:2px"></span>
      <span style="width:15px;height:9px;background:rgba(255,255,255,.85);border-radius:2px"></span></span></div>
  <div style="flex:1;overflow-y:auto;padding:4px 16px 20px;display:flex;flex-direction:column;
              background:radial-gradient(120% 80% at 50% 0%,#2B3A31 0%,#161A17 70%)">
    <div data-nt-back style="flex:none;align-self:flex-start;display:flex;align-items:center;gap:5px;
                background:rgba(255,255,255,.14);border-radius:99px;padding:6px 12px 6px 9px;
                font-size:11px;font-weight:600;color:rgba(255,255,255,.8);margin-bottom:2px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" style="width:12px;height:12px;display:block">
        <path d="m14 6-6 6 6 6"></path></svg>나가기</div>
    <div style="flex:none;text-align:center;padding:6px 0 20px">
      <div style="font-size:44px;font-weight:300;color:#fff;letter-spacing:-.04em;{NUM}">9:41</div>
      <div style="font-size:11.5px;font-weight:500;color:rgba(255,255,255,.55);padding-top:2px">
        7월 22일 수요일</div></div>
    {cards}{rules}
  </div>
</div>'''


SCREENS = [('nt', '알림함', '알림', scr_nt()),
           ('ns', '알림 설정', '알림', scr_ns()),
           ('np', '푸시 문구 시안 (잠금화면)', '알림', scr_np())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, grp, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'notify_screens.py', 'title': title,
                   'group': grp, 'html': html, 'holes': False}
        print(f'  {sid}  {title:26} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('2e') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
