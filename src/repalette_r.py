# -*- coding: utf-8 -*-
"""정기 피드백 결과지(r1~r8) 색을 앱 팔레트로 맞춘다.

   결과지는 다른 곳에서 만들어져 온 화면이라 회색-올리브 계열만 쓴다.
   앱은 따뜻한 종이색(#F3EFE8) + 포레스트 그린(#21402F)인데 여기만 무채색이라
   들어가는 순간 다른 앱처럼 느껴진다.

   레이아웃·크기·여백은 하나도 안 건드린다. 색상값만 바꾼다.
     ① 회색 램프 → 앱의 따뜻한 램프 (같은 밝기끼리 대응)
     ② 강조가 필요한 자리(주 버튼·현재 회차·완료 체크)만 포레스트로 승격
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))

# ── ② 먼저 손댈 자리 (원본 회색값 기준) — 벌크 치환보다 앞서야 한다 ──
ACCENT = [
    # 주 버튼 — 앱의 주 버튼은 포레스트다
    ('background:#2A2A28;color:#F5F5F0', 'background:#21402F;color:#F6F3EC'),
    # 여정 스트립의 '현재 회차' 점 — 지금 위치를 알리는 자리
    ('background:#1A1A1A;border:3px solid #C9C9C4',
     'background:#21402F;border:3px solid #DCE7DE'),
    ('color:#1A1A1A;margin-top:7px', 'color:#21402F;margin-top:7px'),
    # 숙제 완료 체크 — 해낸 것에 색을 준다
    ('border-radius:7px;background:#2A2A28', 'border-radius:7px;background:#21402F'),
]

# ── ① 회색 램프 → 따뜻한 램프 (밝기 순서를 그대로 유지) ──
RAMP = {
    '#1a1a1a': '#1D2420', '#1c1c1a': '#1D2420',      # 잉크
    '#2a2a28': '#2A362E',                             # 어두운 면 (초록기 살짝)
    '#333': '#2E332C', '#3a3a36': '#383A31',
    '#4a4a46': '#4A473C', '#555': '#5C5749',
    '#666': '#6E6858', '#6e6e68': '#6E6858',          # 본문
    '#777': '#78715F', '#7a7a74': '#78715F',
    '#888': '#8A8375', '#8a8a84': '#8A8375',
    '#8e8e88': '#8A8375', '#999': '#8A8375',          # 보조
    '#a9a9a2': '#A39C8C', '#aaa': '#A39C8C',          # 흐린 글자
    '#bbb': '#B7AF9E', '#bebeba': '#BDB5A5',
    '#c2c2be': '#C6BEAE', '#c4c4bf': '#C9C1B2',
    '#c9c9c4': '#CCC4B4', '#cfcfca': '#D2CABB', '#cfcfcb': '#D2CABB',
    '#d2d2cd': '#D5CDBE', '#d6d6d3': '#DAD3C6', '#d8d8d3': '#DBD4C7',
    '#dbdbd6': '#DFD8CB', '#dcdcd8': '#DFD8CB', '#dededa': '#E1DACD',
    '#e0e0dd': '#E4DED2', '#e2e2de': '#E4DED2', '#e7e7e3': '#E4DED2',   # 선
    '#e8e8e4': '#EAE4D8', '#e8e8e5': '#EAE4D8', '#e9e9e6': '#EBE5D9',
    '#ededea': '#EFE9DE', '#edede8': '#EFE9DE',       # 샌드
    '#f2f2f0': '#F3EFE8',                             # 페이지 바탕
    '#f5f5f0': '#F7F3EB',
    '#fff': '#FFFDF9',                                # 카드
    'rgba(237,237,232,.18)': 'rgba(240,235,225,.18)',
    'rgba(237,237,232,.14)': 'rgba(240,235,225,.14)',
    'rgba(237,237,232,.1)': 'rgba(240,235,225,.1)',
}

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    hits, acc = {}, 0

    def swap(m):
        k = m.group(0).lower()
        if k in RAMP:
            hits[k] = hits.get(k, 0) + 1
            return RAMP[k]
        return m.group(0)

    pat = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)')
    for s in screens:
        if not re.fullmatch(r'r\d', s['id']):
            continue
        h = s['html']
        for a, b in ACCENT:
            acc += h.count(a)
            h = h.replace(a, b)
        s['html'] = pat.sub(swap, h)

    json.dump(screens, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'강조 승격 {acc}곳 · 색 치환 {sum(hits.values())}곳 / {len(hits)}종')
    left = set(RAMP) - set(hits)
    if left:
        print('안 쓰인 매핑:', ' '.join(sorted(left)))
