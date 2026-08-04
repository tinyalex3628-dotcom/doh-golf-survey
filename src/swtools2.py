# -*- coding: utf-8 -*-
"""스윙 탭 상단 분석 도구 — 3칸.

   필터 칩 줄(전체/드라이버/아이언/어프로치)을 걷어내고 그 자리를 도구에 준다.
   갤러리는 이미 '이번 주 / 7월 초 / 6월'로 묶여 있어서 칩이 없어도 찾아진다.

   칸마다 한 줄 설명을 붙였다. 아이콘 + 두 단어만으로는
   AI 분석 / 직접 분석 / 프로와 비교가 서로 뭐가 다른지 화면이 말해주지 못한다.
"""
CARD, FOREST, LINE, SOFT = '#FFFDF9', '#21402F', '#E4DED2', '#F2F8F4'
INK, INK2, INK3 = '#1D2420', '#4A4638', '#6E6858'

TOOLS = [
    ('ai', 'AI 분석', '설문 + 자동 진단',
     '<path d="M12 3.5 14.4 9l5.6.6-4.2 3.8 1.2 5.5-5-2.9-5 2.9 1.2-5.5L4 9.6 9.6 9z"></path>'),
    ('draw', '직접 분석', '선 긋고 캡처',
     '<path d="M4 20.5 8.5 19 19 8.5a2.1 2.1 0 0 0-3-3L5.5 16z"></path>'),
    ('cmp', '프로와 비교', '나란히 놓고 보기',
     '<rect x="3" y="6" width="7.5" height="12" rx="2"></rect>'
     '<rect x="13.5" y="6" width="7.5" height="12" rx="2"></rect>'),
]


def ic(d, w=17, sw='1.8'):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;'
            f'display:block">{d}</svg>')


def tile(key, name, desc, path):
    return (f'<span data-swtool="{key}" style="flex:1;min-width:0;display:flex;'
            f'flex-direction:column;align-items:center;gap:8px;background:{CARD};'
            f'border:1px solid {LINE};border-radius:13px;padding:14px 6px 13px">'
            f'<span style="width:36px;height:36px;border-radius:11px;background:{SOFT};'
            f'color:{FOREST};display:flex;align-items:center;justify-content:center">'
            f'{ic(path)}</span>'
            f'<span style="display:flex;flex-direction:column;align-items:center;gap:3px">'
            f'<span style="font-size:12px;font-weight:700;color:{INK};letter-spacing:-.02em;'
            f'white-space:nowrap">{name}</span>'
            f'<span style="font-size:9.5px;font-weight:500;color:{INK3};white-space:nowrap">'
            f'{desc}</span></span></span>')


def row():
    tiles = ''.join(tile(*t) for t in TOOLS)
    return (f'<div data-swtools style="display:flex;flex-direction:column;gap:10px;'
            f'padding:2px 0 6px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:{INK3};'
            f'padding:0 1px">분석 도구</span>'
            f'<div style="display:flex;gap:8px">{tiles}</div></div>')


if __name__ == '__main__':
    import json, os
    json.dump({'row': row()}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
              'swtools2.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{len(row())/1024:.1f} KB')
