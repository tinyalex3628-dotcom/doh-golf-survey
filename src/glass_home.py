# -*- coding: utf-8 -*-
"""홈 · 글래스 워시 3안.

   받은 스펙 그대로 구현하되, 진짜 갈림길 하나를 축으로 세웠다 — 글꼴.
   스펙은 Pretendard(고딕) 800인데 지금 앱 전체는 Hahmlet(명조)다.
   홈만 고딕으로 가면 다른 화면으로 넘어가는 순간 딴 앱이 된다.
     A  스펙 그대로 (고딕)
     B  같은 레이아웃 · 지금 명조 유지
     C  고딕 + 워시를 옅게 · 카드를 더 불투명하게 (밝은 곳에서 읽히는 안전판)

   구조는 보내주신 화면을 그대로 따랐다. 핵심은 헤드라인이 '카드 안'이 아니라
   워시 위에 직접 앉는다는 것 — 초록을 면으로 깔지 않으니 글자가 주인공이 된다.
"""

# ── 팔레트 (받은 스펙) ───────────────────────────────────────────────
IVORY = '#F5F3EC'
GREEN = '#1D4534'
T_TITLE, T_BODY, T_SUB = '#16281E', '#4A503F', '#5F6A5F'
BADGE = '#C0392B'
TAB_OFF = '#6A6A61'

GLASS = 'rgba(255,255,255,.68)'
GLASS_STRONG = 'rgba(255,255,255,.86)'
GLASS_BD = 'rgba(255,255,255,.85)'
SHADOW = '0 10px 26px rgba(29,69,52,.10)'
TINT = 'rgba(29,69,52,.09)'
TRACK = 'rgba(29,69,52,.11)'
CTA = 'rgba(29,69,52,.92)'

WASH = ('linear-gradient(180deg,rgba(29,69,52,.20),'
        'rgba(29,69,52,.05) 60%,rgba(29,69,52,0))')
WASH_SOFT = ('linear-gradient(180deg,rgba(29,69,52,.12),'
             'rgba(29,69,52,.03) 60%,rgba(29,69,52,0))')

FRAME = ('width:360px;height:740px;background:' + IVORY + ';border:1px solid #DDD6C8;'
         'border-radius:34px;box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;'
         'display:flex;flex-direction:column;position:relative')

SANS = "font-family:'Pretendard',-apple-system,sans-serif"
SERIF = "font-family:'Hahmlet',serif"
NUM = "font-family:'Pretendard',-apple-system,sans-serif"


def ic(d, w=16, sw='1.8', color='currentColor'):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;'
            f'display:block">{d}</svg>')


BURGER = '<path d="M4 7h16M4 12h16M4 17h16"></path>'
BELL = ('<path d="M18 10a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"></path>'
        '<path d="M10.5 19.5a2 2 0 0 0 3 0"></path>')
ARROW = '<path d="M5 12h13m-5-5 5 5-5 5"></path>'
FILM = ('<rect x="3" y="5" width="18" height="14" rx="2.5"></rect>'
        '<path d="M3 9.5h18M8 5v4.5M16 5v4.5"></path>')
HEAD = ('<path d="M4 14v-2a8 8 0 0 1 16 0v2"></path>'
        '<rect x="2.5" y="13.5" width="4" height="6.5" rx="1.8"></rect>'
        '<rect x="17.5" y="13.5" width="4" height="6.5" rx="1.8"></rect>')
BUBBLE = '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"></path>'
PLAY = ('<circle cx="12" cy="12" r="8.6"></circle>'
        '<path d="M10.4 9.2 15 12l-4.6 2.8z"></path>')


# ── 문구 3안 ─────────────────────────────────────────────────────────
#   "기다리던 게 왔어요"의 문제: 기다렸다고 넘겨짚고, 정작 뭐가 왔는지는 안 말한다.
#   제목이 할 일은 하나다 — 탭하기 전에 내 스윙에 대해 뭔가를 알려주는 것.
#   (라벨, 제목, 본문)
COPY = [
    ('① 프로가 짚은 것을 제목으로  · 추천',
     '하체가 자리를 잡으니<br>왼팔이 보여요',
     '이번 달 올리신 영상 <b style="font-weight:700;color:#16281E">12개</b>를 '
     '하나씩 돌려봤어요. 톱에서 왼팔 접힘 — 이번 달은 이것만 잡습니다.'),

    ('② 프로가 말을 거는 투',
     '골프러버님,<br>이번 달 스윙<br>다 봤어요',
     '영상 <b style="font-weight:700;color:#16281E">12개</b>, 하나씩 여러 번 돌려봤습니다. '
     '톱에서 왼팔 접힘 하나만 짚었어요.'),

    ('③ 담백한 사실',
     '7월 리포트가<br>도착했어요',
     '이도형 프로가 이번 달 영상 <b style="font-weight:700;color:#16281E">12개</b>를 보고 '
     '3주 프로그램을 만들었어요.'),
]

def statusbar(f):
    return (f'<div style="flex:none;height:42px;display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 22px;font-size:12px;color:{T_TITLE};'
            f'position:relative;z-index:2">'
            f'<span style="{NUM};font-weight:600">9:41</span>'
            f'<span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {T_TITLE};border-radius:2px;'
            f'opacity:.5"></span><span style="width:15px;height:9px;background:{T_TITLE};'
            f'border-radius:2px"></span></span></div>')


def header(f, w800):
    return (f'<div style="flex:none;height:48px;display:flex;align-items:center;gap:11px;'
            f'padding:0 18px;position:relative;z-index:2">'
            f'<span style="color:{T_TITLE};display:flex">{ic(BURGER, 20, "2")}</span>'
            f'<span style="flex:1;{f};font-size:16px;font-weight:{w800};letter-spacing:-.03em;'
            f'color:{T_TITLE}">NEXT SWING</span>'
            f'<span data-bell style="position:relative;color:{T_TITLE};display:flex">'
            f'{ic(BELL, 19, "1.8")}'
            f'<span data-bell-dot style="position:absolute;top:-3px;right:-4px;'
            f'min-width:15px;height:15px;'
            f'padding:0 4px;border-radius:99px;background:{BADGE};color:#fff;font-size:9px;'
            f'font-weight:700;display:flex;align-items:center;justify-content:center;{NUM}">2'
            f'</span></span></div>')


def arrival_line(f):
    """도착을 띠가 아니라 한 줄로. 초록을 면으로 안 깔기로 했으니 띠도 안 쓴다."""
    return (f'<div style="flex:none;display:flex;align-items:center;gap:7px;padding:2px 0 14px">'
            f'<span style="width:6px;height:6px;border-radius:50%;background:{BADGE};'
            f'flex:none"></span>'
            f'<span style="flex:1;{f};font-size:11.5px;font-weight:700;color:{GREEN};'
            f'letter-spacing:-.01em">오늘 도착 · 정기 피드백 No.06</span>'
            f'<span style="{NUM};font-size:11px;font-weight:500;color:{T_SUB}">7월 22일 수</span>'
            f'</div>')


def headline(f, w800, text):
    size = 29 if text.count('<br>') >= 2 else 30
    return (f'<div style="flex:none;{f};font-size:{size}px;font-weight:{w800};'
            f'letter-spacing:-.035em;color:{T_TITLE};line-height:1.28;'
            f'padding-bottom:14px">{text}</div>')


def lede(f, text):
    return (f'<div style="flex:none;{f};font-size:13px;font-weight:400;color:{T_BODY};'
            f'line-height:1.75;padding-bottom:16px">{text}</div>')


def card(inner, glass, pad='14px 15px', extra=''):
    return (f'<div style="flex:none;background:{glass};border:1px solid {GLASS_BD};'
            f'border-radius:16px;padding:{pad};box-shadow:{SHADOW};'
            f'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);{extra}">{inner}</div>')


def pro_card(f, glass):
    """오른쪽 메타는 영상 길이 하나뿐이다.
       프로가 목소리를 얹어 녹화한 한 파일이라 '영상 12:24 / 음성 0:32'처럼
       길이가 따로 있을 수 없다."""
    def meta(d, t):
        return (f'<span style="display:flex;align-items:center;gap:6px;background:{TINT};'
                f'border-radius:8px;padding:6px 10px;color:{GREEN}">'
                f'{ic(d, 13, "1.9")}<span style="{NUM};font-size:11px;font-weight:700">{t}</span>'
                f'</span>')
    inner = (f'<div style="display:flex;align-items:center;gap:11px">'
             f'<span style="flex:none;width:36px;height:36px;border-radius:50%;background:{TINT};'
             f'color:{GREEN};display:flex;align-items:center;justify-content:center;{f};'
             f'font-size:13px;font-weight:700">이</span>'
             f'<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">'
             f'<span style="{f};font-size:13px;font-weight:700;letter-spacing:-.02em;'
             f'color:{T_TITLE}">이도형 프로</span>'
             f'<span style="{f};font-size:10.5px;font-weight:400;color:{T_SUB}">'
             f'KPGA · 골프러버님과 6번째</span></span>'
             f'<span style="flex:none">{meta(PLAY, "12:24")}</span></div>')
    return card(inner, glass)


def cta(f, w800):
    return (f'<div style="flex:none;margin-top:12px;background:{CTA};border-radius:15px;'
            f'padding:16px;display:flex;align-items:center;justify-content:center;gap:8px;'
            f'box-shadow:0 12px 24px -14px rgba(29,69,52,.9)">'
            f'<span style="{f};font-size:15px;font-weight:{w800};letter-spacing:-.02em;'
            f'color:#fff">피드백 확인하기</span>'
            f'<span style="color:rgba(255,255,255,.9);display:flex">{ic(ARROW, 15, "2")}</span>'
            f'</div>')


# ── 히어로 아래 자리 · 3안 ───────────────────────────────────────────
#   지금 이 자리(3일 / 12개 / 5일)의 문제는 '관련 없음'이 아니라 '질문이 없음'이다.
#   주간 연습은 최근, 등록 스윙은 재고, 연속 기록은 습관 — 시간 축이 셋 다 다른데
#   똑같은 크기로 나란히 놓여 있어서 무엇을 보라는 건지 화면이 말하지 않는다.
#   그래서 셋 다 "하나의 질문에 답하게" 다시 짰다.

def zone_next(f, glass):
    """A · 다음 리포트까지 내가 얼마나 쌓았나 — 연습을 돈 낸 것과 잇는다."""
    inner = (f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
             f'padding-bottom:11px">'
             f'<span style="{f};font-size:12.5px;font-weight:700;color:{T_TITLE}">'
             f'다음 리포트 준비</span>'
             f'<span style="{NUM};font-size:11px;font-weight:700;color:{GREEN}">8월호 · D-24</span>'
             f'</div>'
             f'<span style="display:block;height:6px;border-radius:99px;background:{TRACK};'
             f'position:relative;overflow:hidden;margin-bottom:10px">'
             f'<span style="position:absolute;left:0;top:0;bottom:0;width:38%;border-radius:99px;'
             f'background:{GREEN};opacity:.55"></span></span>'
             f'<div style="display:flex;gap:14px">'
             + ''.join(
                 f'<span style="display:flex;align-items:baseline;gap:4px">'
                 f'<span style="{NUM};font-size:13px;font-weight:700;color:{T_TITLE}">{n}</span>'
                 f'<span style="{f};font-size:11px;font-weight:400;color:{T_SUB}">{lab}</span>'
                 f'</span>' for n, lab in [('12개', '영상 올림'), ('12일', '연습함')])
             + f'</div>')
    return card(inner, glass, pad='14px 15px')


def zone_todo(f, glass):
    """B · 피드백을 읽었으면 다음은 '할 일'이다 — 리포트의 숙제를 홈으로 끌어온다."""
    items = [('톱에서 3초 멈추기 15회', True),
             ('거울 앞 톱 자세 사진 찍기', False),
             ('발 모으고 스윙 20회', False)]
    rows = ''
    for i, (t, done) in enumerate(items):
        box = (f'background:{GREEN};border:none' if done
               else f'background:transparent;border:1.5px solid rgba(29,69,52,.22)')
        mark = ('<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" '
                'stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px">'
                '<path d="m5 12.5 5 5 9-10"></path></svg>' if done else '')
        col = T_SUB if done else T_TITLE
        deco = 'text-decoration:line-through' if done else ''
        rows += (f'<div style="display:flex;align-items:center;gap:10px;'
                 f'{"padding-top:11px" if i else ""}">'
                 f'<span style="flex:none;width:19px;height:19px;border-radius:6px;{box};'
                 f'display:flex;align-items:center;justify-content:center">{mark}</span>'
                 f'<span style="flex:1;{f};font-size:12.5px;font-weight:{400 if done else 600};'
                 f'color:{col};{deco};letter-spacing:-.01em">{t}</span></div>')
    head = (f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
            f'padding-bottom:12px">'
            f'<span style="{f};font-size:12.5px;font-weight:700;color:{T_TITLE}">이번 달 숙제</span>'
            f'<span style="{NUM};font-size:11px;font-weight:700;color:{GREEN}">1 / 3</span></div>')
    return card(head + rows, glass, pad='14px 15px')


def zone_thin(f, glass):
    """C · 지금 것을 그대로 두되 위계만 낮춘다 — 카드 없이 한 줄."""
    parts = [('12일', '연습'), ('12개', '영상'), ('5일', '연속')]
    out = ''
    for i, (n, lab) in enumerate(parts):
        dot = (f'<span style="width:3px;height:3px;border-radius:50%;background:{T_SUB};'
               f'opacity:.5;margin:0 9px"></span>' if i else '')
        out += (f'{dot}<span style="display:flex;align-items:baseline;gap:4px">'
                f'<span style="{NUM};font-size:12.5px;font-weight:700;color:{T_TITLE}">{n}</span>'
                f'<span style="{f};font-size:11px;font-weight:400;color:{T_SUB}">{lab}</span>'
                f'</span>')
    return (f'<div style="flex:none;display:flex;align-items:center;justify-content:center;'
            f'padding:4px 0 2px">{out}</div>')

def stats(f, w800):
    cells = [('3', '일', '주간 연습'), ('12', '개', '등록 스윙'), ('5', '일', '연속 기록')]
    out = ''
    for n, u, lab in cells:
        out += (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;'
                f'gap:3px">'
                f'<span style="display:flex;align-items:baseline;gap:1px">'
                f'<span style="{NUM};font-size:20px;font-weight:700;color:{T_TITLE};'
                f'letter-spacing:-.03em">{n}</span>'
                f'<span style="{f};font-size:11px;font-weight:600;color:{T_SUB}">{u}</span></span>'
                f'<span style="{f};font-size:10.5px;font-weight:400;color:{T_SUB}">{lab}</span>'
                f'</span>')
    return (f'<div style="flex:none;display:flex;align-items:center;padding:20px 4px 16px">'
            f'{out}</div>')


def quota(f, glass, used=2, total=6):
    pct = round(used / total * 100)
    inner = (f'<div style="display:flex;align-items:center;gap:11px">'
             f'<span style="flex:none;width:30px;height:30px;border-radius:10px;background:{TINT};'
             f'color:{GREEN};display:flex;align-items:center;justify-content:center">'
             f'{ic(BUBBLE, 15, "1.9")}</span>'
             f'<span style="flex:1;display:flex;flex-direction:column;gap:7px">'
             f'<span style="display:flex;align-items:baseline;justify-content:space-between">'
             f'<span style="{f};font-size:12px;font-weight:600;color:{T_TITLE}">'
             f'이번 달 프로 한마디</span>'
             f'<span style="{NUM};font-size:11.5px;font-weight:700;color:{GREEN}">'
             f'{total - used}회 남음</span></span>'
             f'<span style="height:5px;border-radius:99px;background:{TRACK};position:relative;'
             f'overflow:hidden"><span style="position:absolute;left:0;top:0;bottom:0;'
             f'width:{pct}%;border-radius:99px;background:{GREEN};opacity:.55"></span></span>'
             f'</span></div>')
    return card(inner, glass, pad='13px 14px')


def cap(f, t, sub):
    return (f'<div style="flex:none;display:flex;align-items:baseline;justify-content:space-between;'
            f'padding:22px 2px 9px">'
            f'<span style="{f};font-size:11.5px;font-weight:600;color:{T_BODY};'
            f'letter-spacing:-.01em">{t}</span>'
            f'<span style="{f};font-size:10.5px;font-weight:400;color:{T_SUB}">{sub}</span></div>')


def timeline(f, glass):
    rows = [('6시간 전', '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회…', True),
            ('7월 15일', '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요.', False)]
    out = ''
    for i, (when, txt, new) in enumerate(rows):
        dot = GREEN if new else 'rgba(29,69,52,.3)'
        line = (f'<span style="position:absolute;left:4px;top:15px;bottom:-13px;width:1.5px;'
                f'background:{TRACK}"></span>' if i == 0 else '')
        out += (f'<div style="position:relative;padding-left:19px;'
                f'{"padding-bottom:13px" if i == 0 else ""}">{line}'
                f'<span style="position:absolute;left:0;top:4px;width:9px;height:9px;'
                f'border-radius:50%;border:2px solid {dot};background:#fff"></span>'
                f'<div style="display:flex;align-items:baseline;gap:7px">'
                f'<span style="{NUM};font-size:11px;font-weight:700;color:{GREEN if new else T_SUB}">'
                f'{when}</span>'
                f'<span style="{f};font-size:10.5px;font-weight:400;color:{T_SUB}">이도형 프로</span>'
                f'</div>'
                f'<div style="margin-top:4px;{f};font-size:12px;font-weight:400;color:{T_BODY};'
                f'line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;'
                f'-webkit-box-orient:vertical;overflow:hidden">{txt}</div></div>')
    return card(out, glass, pad='14px 15px')


def tabbar(f):
    items = [('홈', '<path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"></path>'),
             ('연습기록', '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect>'
                       '<path d="M8 3v4M16 3v4M8.5 13l2.5 2.5 4.5-4.5"></path>'),
             ('스윙', '<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
                    '<path d="m16 11 5-3v8l-5-3z"></path>'),
             ('레슨기록', '<rect x="3.5" y="4.5" width="17" height="6" rx="2"></rect>'
                       '<rect x="3.5" y="13.5" width="17" height="6" rx="2"></rect>'),
             ('마이', '<circle cx="12" cy="8.5" r="3.7"></circle>'
                    '<path d="M5 20a7 7 0 0 1 14 0"></path>')]
    cells = ''
    for nm, d in items:
        on = nm == '홈'
        cells += (f'<span data-tab="{nm}" style="flex:1;display:flex;flex-direction:column;'
                  f'align-items:center;gap:5px;color:{GREEN if on else TAB_OFF};padding:8px 0 6px">'
                  f'{ic(d, 19, "1.8")}'
                  f'<span style="{f};font-size:10.5px;font-weight:{700 if on else 400}">{nm}</span>'
                  f'</span>')
    return (f'<div style="flex:none;height:62px;background:rgba(255,255,255,.85);'
            f'backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);'
            f'border-top:1px solid rgba(29,69,52,.08);display:flex;align-items:flex-start;'
            f'padding:2px 6px 0;position:relative;z-index:2">{cells}</div>')


def phone(font, w800, wash, glass, wash_h=470, copy=None, zone=None):
    f = font
    copy = copy or COPY[0]
    zone = zone or (lambda ff, gg: stats(ff, w800))
    body = (f'<div style="flex:1;overflow-y:auto;padding:6px 18px 20px;display:flex;'
            f'flex-direction:column;position:relative;z-index:2">'
            f'{arrival_line(f)}{headline(f, w800, copy[1])}{lede(f, copy[2])}'
            f'{pro_card(f, glass)}{cta(f, w800)}'
            f'<div style="flex:none;height:20px"></div>'
            f'{zone(f, glass)}'
            f'<div style="flex:none;height:11px"></div>{quota(f, glass)}'
            f'{cap(f, "최근 프로 한마디", "이번 달 2회")}{timeline(f, glass)}</div>')
    return (f'<div style="{FRAME}">'
            f'<span style="position:absolute;left:0;right:0;top:0;height:{wash_h}px;'
            f'background:{wash};pointer-events:none;z-index:1"></span>'
            f'{statusbar(f)}{header(f, w800)}{body}{tabbar(f)}</div>')


# 레이아웃 A안 확정 · 문구는 직접 쓰신다 → 히어로 아래 자리만 비교한다.
Z1 = phone(SANS, 700, WASH, GLASS, copy=COPY[0], zone=zone_next)
Z2 = phone(SANS, 700, WASH, GLASS, copy=COPY[0], zone=zone_todo)
Z3 = phone(SANS, 700, WASH, GLASS, copy=COPY[0], zone=zone_thin)
Z0 = phone(SANS, 700, WASH, GLASS, copy=COPY[0])          # 지금 (숫자 3개)

if __name__ == '__main__':
    import json, os
    HERE = os.path.dirname(os.path.abspath(__file__))
    D = {'z0': Z0, 'z1': Z1, 'z2': Z2, 'z3': Z3}
    json.dump(D, open(os.path.join(HERE, 'zone-slotted.json'), 'w', encoding='utf-8'),
              ensure_ascii=False)
    print(' '.join(f'{k} {len(v) / 1024:.0f}KB' for k, v in D.items()))
