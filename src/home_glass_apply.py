# -*- coding: utf-8 -*-
"""홈 최종 · 글래스 워시(A안) + 히어로 아래 한 줄(C안) → 실제 화면 2a 로.

   런타임이 잡고 있는 표식을 그대로 물려준다 —
     data-bell / data-bell-dot   종과 안 읽음 배지
     data-strip                  도착 알림 (이제 띠가 아니라 한 줄)
     data-h-hero + data-lock=fb  등급이 못 여는 덩어리 (흐림 + 자물쇠)
     data-h-quota                이번 달 남은 프로 한마디
     data-tl-row                 최근 프로 한마디 줄

   바로가기 4칸은 없애지 않았다. 홈 퀵메뉴가 스윙 분석 허브(03)의 유일한 입구고,
   날짜별 보기(2g)는 그 허브를 통해서만 들어간다 — 지우면 두 화면이 고아가 된다.
"""
import json, os
import glass_home as G

HERE = os.path.dirname(os.path.abspath(__file__))
F = G.SANS
W = 700
GREEN, TINT, TRACK = G.GREEN, G.TINT, G.TRACK
T_TITLE, T_BODY, T_SUB = G.T_TITLE, G.T_BODY, G.T_SUB
GLASS, GLASS_BD, SHADOW = G.GLASS, G.GLASS_BD, G.SHADOW
NUM = G.NUM

# 제목은 프로가 매달 쓴다 — 지금은 6월호 리포트 제목을 그대로 얹어 둔다
TITLE = '하체가 자리를 잡으니<br>왼팔이 보여요'
LEDE = ('이번 달 올리신 영상 <b style="font-weight:700;color:#16281E">12개</b>를 하나씩 '
        '돌려봤어요. 톱에서 왼팔 접힘 — 이번 달은 이것만 잡습니다.')

BOOK = ('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"></path>'
        '<path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"></path>')
CARDIC = '<rect x="3" y="6" width="18" height="12" rx="2.5"></rect><path d="M3 10h18"></path>'
CAM = ('<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
       '<path d="m16 11 5-3v8l-5-3z"></path>')
CMP = ('<rect x="3" y="6" width="7.5" height="12" rx="2"></rect>'
       '<rect x="13.5" y="6" width="7.5" height="12" rx="2"></rect>')


def arrival_line():
    """도착 알림 — 초록을 면으로 안 깔기로 했으니 띠 대신 한 줄.
       data-strip 을 물려받아 런타임이 등급·읽음에 따라 지울 수 있게 한다."""
    return (f'<div data-strip style="flex:none;display:flex;align-items:center;gap:7px;'
            f'padding:2px 0 14px">'
            f'<span style="width:6px;height:6px;border-radius:50%;background:{G.BADGE};'
            f'flex:none"></span>'
            f'<span style="flex:1;{F};font-size:11.5px;font-weight:700;color:{GREEN};'
            f'letter-spacing:-.01em">오늘 도착 · 정기 피드백 No.06</span>'
            f'<span style="{NUM};font-size:11px;font-weight:500;color:{T_SUB}">7월 22일 수</span>'
            f'</div>')


def hero():
    return (f'<div data-h-hero data-lock="fb" style="flex:none;display:flex;'
            f'flex-direction:column">'
            f'{arrival_line()}'
            f'{G.headline(F, W, TITLE)}'
            f'{G.lede(F, LEDE)}'
            f'{G.pro_card(F, GLASS)}'
            f'{G.cta(F, W)}</div>')


def thin_stats():
    """C안 — 숫자는 남기되 카드를 없애고 한 줄로. 히어로와 경쟁하지 않는다."""
    parts = [('12일', '연습'), ('12개', '영상'), ('5일', '연속')]
    out = ''
    for i, (n, lab) in enumerate(parts):
        dot = (f'<span style="width:3px;height:3px;border-radius:50%;background:{T_SUB};'
               f'opacity:.5;margin:0 9px"></span>' if i else '')
        out += (f'{dot}<span data-h-stat="{lab}" style="display:flex;align-items:baseline;gap:4px">'
                f'<span style="{NUM};font-size:12.5px;font-weight:700;color:{T_TITLE}">{n}</span>'
                f'<span style="{F};font-size:11px;font-weight:400;color:{T_SUB}">{lab}</span>'
                f'</span>')
    return (f'<div style="flex:none;display:flex;align-items:center;justify-content:center;'
            f'padding:20px 0 15px">{out}</div>')


def quota(used=2, total=6):
    inner = G.quota(F, GLASS, used, total)
    return inner.replace('<div style="flex:none;background:',
                         '<div data-h-quota data-lock="cm" style="flex:none;background:', 1)


def timeline():
    rows = [('6시간 전', '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서…', True),
            ('7월 15일', '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요.', False)]
    out = ''
    for i, (when, txt, new) in enumerate(rows):
        dot = GREEN if new else 'rgba(29,69,52,.3)'
        line = (f'<span style="position:absolute;left:4px;top:15px;bottom:-13px;width:1.5px;'
                f'background:{TRACK}"></span>' if i == 0 else '')
        out += (f'<div data-tl-row style="position:relative;padding-left:19px;'
                f'{"padding-bottom:13px" if i == 0 else ""}">{line}'
                f'<span style="position:absolute;left:0;top:4px;width:9px;height:9px;'
                f'border-radius:50%;border:2px solid {dot};background:#fff"></span>'
                f'<div style="display:flex;align-items:baseline;gap:7px">'
                f'<span style="{NUM};font-size:11px;font-weight:700;'
                f'color:{GREEN if new else T_SUB}">{when}</span>'
                f'<span style="{F};font-size:10.5px;font-weight:400;color:{T_SUB}">이도형 프로</span>'
                f'</div>'
                f'<div style="margin-top:4px;{F};font-size:12px;font-weight:400;color:{T_BODY};'
                f'line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;'
                f'-webkit-box-orient:vertical;overflow:hidden">{txt}</div></div>')
    return G.card(out, GLASS, pad='14px 15px').replace(
        '<div style="flex:none;background:', '<div data-lock="cm" style="flex:none;background:', 1)


def shortcuts():
    """바로가기 — 스윙 분석 허브(03)의 유일한 입구다. 지우면 03·2g 가 고아가 된다."""
    items = [(CAM, '스윙 분석', 'AI · 업로드 · 갤러리'),
             (CMP, '프로와 비교', '나란히 보기'),
             (BOOK, '골프 사전', '용어 찾아보기'),
             (CARDIC, '구독 안내', '혜택 · 결제')]
    out = ''
    for d, name, sub in items:
        out += (f'<span style="flex:1 1 calc(50% - 4px);min-width:0;display:flex;'
                f'align-items:center;gap:9px;background:{GLASS};border:1px solid {GLASS_BD};'
                f'border-radius:13px;padding:11px 12px;box-shadow:{SHADOW}">'
                f'<span style="flex:none;width:28px;height:28px;border-radius:9px;'
                f'background:{TINT};color:{GREEN};display:flex;align-items:center;'
                f'justify-content:center">{G.ic(d, 14, "1.8")}</span>'
                f'<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">'
                f'<span style="{F};font-size:11.5px;font-weight:700;color:{T_TITLE};'
                f'letter-spacing:-.02em;white-space:nowrap">{name}</span>'
                f'<span style="{F};font-size:9.5px;font-weight:400;color:{T_SUB};'
                f'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{sub}</span>'
                f'</span></span>')
    return (f'<div style="flex:none;display:flex;flex-wrap:wrap;gap:8px;padding-top:22px">'
            f'{out}</div>')


def build():
    body = (f'<div style="flex:1;overflow-y:auto;padding:6px 18px 20px;display:flex;'
            f'flex-direction:column;position:relative;z-index:2">'
            f'{hero()}{thin_stats()}{quota()}'
            f'{G.cap(F, "최근 프로 한마디", "이번 달 2회")}{timeline()}{shortcuts()}</div>')
    return (f'<div style="{G.FRAME}">'
            f'<span style="position:absolute;left:0;right:0;top:0;height:470px;'
            f'background:{G.WASH};pointer-events:none;z-index:1"></span>'
            f'{G.statusbar(F)}{G.header(F, W)}{body}{G.tabbar(F)}</div>')


if __name__ == '__main__':
    html = build()
    for mark in ['data-bell', 'data-bell-dot', 'data-strip', 'data-h-hero',
                 'data-lock="fb"', 'data-h-quota', 'data-tl-row']:
        assert mark in html, f'표식 빠짐: {mark}'
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    for s in screens:
        if s['id'] == '2a':
            s['html'] = html
            s['file'] = 'home_glass_apply.py'
            break
    json.dump(screens, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'2a 교체 · {len(html) / 1024:.1f} KB · 표식 7종 확인')
