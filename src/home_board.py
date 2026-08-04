# -*- coding: utf-8 -*-
"""홈 3안 — 참고 화면 구조 + 이번 달 남은 한마디."""
import json, os
import home_parts as H
import lesson_screens as L

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, INK, INK3, LINE = H.BG, H.CARD, H.INK, H.INK3, H.LINE
FRAME = ('width:360px;height:740px;background:#FFFDF9;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;'
         'flex-direction:column')
NUM = H.NUM


def statusbar():
    return (f'<div style="flex:none;height:44px;background:{BG};display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 24px;font-size:12px;color:{INK}">'
            f'<span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {INK};border-radius:2px;'
            f'opacity:.6"></span><span style="width:15px;height:9px;background:{INK};'
            f'border-radius:2px"></span></span></div>')


def header(right=''):
    bell = ('<span style="position:relative;width:24px;height:24px;color:#6E6858;display:flex;'
            'align-items:center;justify-content:center">'
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
            'stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">'
            '<path d="M18 10a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"></path>'
            '<path d="M10.5 19.5a2 2 0 0 0 3 0"></path></svg>'
            '<span style="position:absolute;top:1px;right:2px;min-width:14px;height:14px;'
            'padding:0 3px;border-radius:99px;background:#A67C3D;color:#fff;font-size:9px;'
            f'font-weight:700;display:flex;align-items:center;justify-content:center;{NUM}">'
            '2</span></span>')
    return (f'<div style="flex:none;height:54px;background:{BG};display:flex;align-items:center;'
            f'gap:10px;padding:0 16px">'
            f'<span style="color:{INK};display:flex">'
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            'stroke-linecap="round" style="width:20px;height:20px">'
            '<path d="M4 7h16M4 12h16M4 17h16"></path></svg></span>'
            f'<span style="flex:1;display:flex;align-items:center;gap:8px">'
            f'<span style="width:22px;height:22px;border-radius:7px;background:#E7EFE9;'
            f'color:#21402F;display:flex;align-items:center;justify-content:center;font-size:8.5px;'
            f'font-weight:700;{NUM}">NS</span>'
            f'<span style="font-size:15px;letter-spacing:.02em;color:{INK}">NEXT SWING</span>'
            f'</span>{right}{bell}</div>')


def body(inner, gap=13):
    return (f'<div style="flex:1;overflow-y:auto;background:{BG};padding:8px 16px 18px;'
            f'display:flex;flex-direction:column;gap:{gap}px">{inner}</div>')


def phone(head_right, inner, gap=13):
    return (f'<div style="{FRAME}">{statusbar()}{header(head_right)}'
            f'{body(inner, gap)}{L.bottom_nav("홈")}</div>')


# ── A안 · 프로가 말을 건다 (참고 화면에 제일 가까움) ─────────────────
A = phone('', H.pro_hero(dark=True) + H.quota_row() + H.week_round() + H.next_fb())

# ── B안 · 남은 횟수를 헤더로 올리고, 본문은 더 비운다 ────────────────
B = phone(H.quota_inline() + '<span style="width:6px"></span>',
          H.pro_hero(dark=True) + H.week_round() + H.next_fb() + H.recent_tl())

# ── C안 · 지금 구조 유지 + 히어로/횟수만 얹기 (변화 폭 최소) ─────────
C = phone('', H.pro_hero(dark=True) + H.stat_row() + H.quota_row()
          + H.cap('최근 프로 한마디', '이번 달 2회') + H.recent_tl() + H.week_round())

S = {'a': A, 'b': B, 'c': C}
json.dump(S, open(os.path.join(HERE, 'home-slotted.json'), 'w', encoding='utf-8'),
          ensure_ascii=False)
print(' '.join(f'{k} {len(v)/1024:.0f}KB' for k, v in S.items()))
