# -*- coding: utf-8 -*-
"""2번 · 글자가 배경에 묻히는 문제.

   원인은 산발적 실수가 아니라 회색 램프 자체다.
   보조 글자 두 단계(#8A8375 · #A39C8C)가 애초에 4.5:1 을 못 넘는데
   그걸 전 화면에서 썼다.

   그런데 세 단계를 전부 4.5 로 올리면 서로 명도차가 0.004 가 되어
   단계 구분이 사라진다. 그래서 램프를 아래쪽으로 벌렸다.

     제목  #1D2420   (그대로)
     본문  #6E6858 → #4A4638      한 단계 어둡게
     보조  #8A8375 → #6E6858      옛 본문 자리로
     흐림  #A39C8C → #6E6858      보조와 통합 (4단계 → 3단계)

   흐림 단계를 없앤 대신, 위계는 크기와 굵기가 진다 — 색으로만 층을 나누던 걸
   되돌린 셈이다.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))

# 같은 색이 hex 와 rgb() 두 표기로 섞여 있어 둘 다 잡는다
MAP = {
    '#6e6858': '#4A4638', 'rgb(110,104,88)': 'rgb(74,70,56)',        # 본문
    '#8a8375': '#6E6858', 'rgb(138,131,117)': 'rgb(110,104,88)',     # 보조
    '#a39c8c': '#6E6858', 'rgb(163,156,140)': 'rgb(110,104,88)',     # 흐림 → 보조
    '#7c857c': '#5F6A5F',                                            # 글래스 보조
    '#9a9a90': '#6A6A61',                                            # 탭 비활성
    '#8c857a': '#68625A',                                            # 2c 안내문
    # ── 2차 · 선(#E4DED2)·진한 샌드(#EAE4D6) 위에서도 4.5 를 넘게 ──
    '#a67c3d': '#7D5D2E', 'rgb(166,124,61)': 'rgb(125,93,46)',        # 한마디 브론즈
    '#6e6858': '#686253', 'rgb(110,104,88)': 'rgb(104,98,83)',        # 보조 미세 보정
    '#c6c0b0': '#6A624D', 'rgb(198,192,176)': 'rgb(106,98,77)',
    '#cfc8b8': '#6C6249', 'rgb(207,200,184)': 'rgb(108,98,73)',
    '#c6bfb0': '#6B624D', 'rgb(198,191,176)': 'rgb(107,98,77)',
    '#b7af9e': '#6A624F', 'rgb(183,175,158)': 'rgb(106,98,79)',
    '#787160': '#696254', 'rgb(120,113,95)': 'rgb(105,98,84)',
    '#b08a7a': '#7F5A4B', 'rgb(176,138,122)': 'rgb(127,90,75)',
    '#999999': '#626262', 'rgb(153,153,153)': 'rgb(98,98,98)',
    '#999': '#626262',
}
PAT = re.compile(r'#[0-9a-fA-F]{6}\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)')


def norm(s):
    return re.sub(r'\s+', '', s.lower())


def swap(m, hits):
    k = norm(m.group(0))
    if k in MAP:
        hits[k] = hits.get(k, 0) + 1
        # 원본이 rgb 표기면 rgb 로, hex 면 hex 로 돌려준다
        return MAP[k]
    return m.group(0)


if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    hits = {}
    for s in screens:
        s['html'] = PAT.sub(lambda m: swap(m, hits), s['html'])
    json.dump(screens, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'화면 색 치환 {sum(hits.values())}곳')
    for k, v in sorted(hits.items(), key=lambda x: -x[1]):
        print(f'   {v:5}  {k} → {MAP[k]}')
