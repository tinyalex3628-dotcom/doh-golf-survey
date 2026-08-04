# -*- coding: utf-8 -*-
"""C안 팔레트 + 타이포그래피 승격 — 레이아웃(크기·여백·구조)은 건드리지 않는다.
   바꾸는 것: 색상값 / font-family / font-weight / letter-spacing / line-height(헤드라인만)"""
import re

P = 'nextswing-proto.html'
s = open(P, encoding='utf-8').read()

# ── 1. 색상 매핑 (Forest · Warm White · Soft Sand · Charcoal) ──
COLOR = {
    # 잉크 3단 → 차콜 계열
    '#191f28': '#26282A', '#16181d': '#26282A', '#15181d': '#26282A', '#12161c': '#26282A',
    '#4e5968': '#6E7377', '#6b7684': '#6E7377', '#5c6672': '#6E7377', '#7b8494': '#6E7377',
    '#8b95a1': '#A7A9A6', '#98a2ae': '#A7A9A6', '#9aa2ad': '#A7A9A6',
    '#b0b8c1': '#B3B4AE', '#aeb6c0': '#B3B4AE',
    '#c3c9d0': '#C6C6C0', '#cbd2da': '#C6C6C0', '#c3cad3': '#C6C6C0',
    '#d5dae0': '#CFCBC1', '#c8cfda': '#CFCBC1',
    # 프라이머리 블루 → 포레스트 그린
    '#3182f6': '#1F3D2B', '#1b64da': '#16301F', '#5ea1ff': '#4A7359',
    '#8aaffb': '#7E9A87', '#16365f': '#16301F',
    '#e7f0ff': '#E7EDE7', '#bcd7ff': '#CBD8CC', '#d3e4ff': '#D8E2D8',
    '#f7faff': '#F7FAF7', '#f6faff': '#F6FAF6',
    # 표면 → 웜 화이트 · 소프트 샌드
    '#f7f8fa': '#F6F3EE', '#f4f5f7': '#F6F3EE', '#eef1f4': '#F1EDE6',
    '#f9fafb': '#FAF7F2',
    '#f2f4f6': '#F1EBE0', '#f1f3f6': '#F1EBE0', '#f4f6f8': '#F4EFE6',
    '#e5e8eb': '#E6E1D8', '#ebeef1': '#E6E1D8', '#eef0f3': '#E6E1D8',
    '#eaedf1': '#E6E1D8', '#dfe3e8': '#DDD7CB',
    # 어두운 면 (분석 도구 화면 · 썸네일) → 웜 그레이
    '#20242b': '#22231F', '#33415e': '#3A3B33', '#2b3340': '#2E2F28',
    '#1b1f26': '#1D1E1A', '#333c4a': '#3A3B33', '#0c2015': '#22231F',
    # 다크모드 페이지 변수
    '#14171c': '#1A1B18', '#1d2129': '#23241F', '#2b303a': '#33342D', '#e8eaed': '#EDEAE3',
    # 코멘트 마커 그린 → 브론즈 (포레스트가 프라이머리가 되어 구분이 필요)
    '#1a8a3c': '#A67C3D', '#1a8245': '#A67C3D',
    '#e8f8ee': '#F2EADD', '#e9f7ec': '#F2EADD', '#9fd8b4': '#D8C3A0',
}
hits = {}
def sub_color(m):
    k = m.group(0).lower()
    if k in COLOR:
        hits[k] = hits.get(k, 0) + 1
        return COLOR[k]
    return m.group(0)
s = re.sub(r'#[0-9a-fA-F]{6}', sub_color, s)

# rgba 형태의 블루도 포레스트로
s = s.replace('rgba(49,130,246,.09)', 'rgba(31,61,43,.08)')
s = s.replace('rgba(49,130,246,.14)', 'rgba(31,61,43,.12)')
s = s.replace('rgba(49,130,246,.55)', 'rgba(31,61,43,.42)')
s = s.replace('rgba(49,130,246,.65)', 'rgba(31,61,43,.48)')
s = s.replace('rgba(49,130,246,.5)', 'rgba(31,61,43,.4)')
s = s.replace('rgba(15,25,45,', 'rgba(38,40,42,')
s = s.replace('rgba(18,26,40,', 'rgba(38,40,42,')
s = s.replace('rgba(10,30,70,', 'rgba(38,40,42,')
s = s.replace('rgba(15,20,28,', 'rgba(38,40,42,')

print('── 색상 치환 ──')
for k in sorted(hits, key=lambda x: -hits[x])[:12]:
    print(f'  {hits[k]:4}  {k} → {COLOR[k]}')
print(f'  총 {sum(hits.values())}곳\n')

# ── 2. 타이포그래피: 디스플레이 서체는 브랜딩 순간에만 ──
DISPLAY = ("Georgia,'Times New Roman','Nanum Myeongjo','Noto Serif KR',"
           "AppleMyungjo,Batang,serif")

head, body = s[:s.index('<template data-scr="2a">')], s[s.index('<template data-scr="2a">'):]
tstats = {'display': 0, 'weight': 0, 'track': 0}

def typo(m):
    st = m.group(1)
    if 'font-size' not in st:
        return m.group(0)
    size = float(re.search(r'font-size:([\d.]+)px', st).group(1))
    fw = re.search(r'font-weight:(\d+)', st)
    w = int(fw.group(1)) if fw else None
    ls = re.search(r'letter-spacing:(-?[\d.]+)em', st)
    track = float(ls.group(1)) if ls else None

    # (a) 18px 이상 = 헤드라인/디스플레이 숫자 → 세리프 + 가벼운 웨이트 + 조인 자간
    if size >= 18:
        if 'font-family' not in st:
            st = f'font-family:{DISPLAY};' + st
            tstats['display'] += 1
        if w is not None:
            st = re.sub(r'font-weight:\d+', 'font-weight:400', st)
        if track is None or track > -0.02:
            st = (re.sub(r'letter-spacing:-?[\d.]+em', 'letter-spacing:-.025em', st)
                  if track is not None else st + ';letter-spacing:-.025em')
        if 'line-height' not in st:
            st += ';line-height:1.45'
        tstats['weight'] += 1
        return 'style="' + st + '"'

    # (b) 굵기를 남발하지 않는다 — 크기·자간·여백이 위계를 만든다
    if w is not None and w >= 700:
        st = re.sub(r'font-weight:\d+', 'font-weight:600', st)
        tstats['weight'] += 1
        w = 600

    # (c) 넓은 트래킹의 라틴 라벨은 더 넓게 (에디토리얼 섹션 라벨)
    if track is not None and track >= 0.1:
        st = re.sub(r'letter-spacing:[\d.]+em', 'letter-spacing:.18em', st)
        tstats['track'] += 1

    return 'style="' + st + '"'

body = re.sub(r'style="([^"]*)"', typo, body)

# ── 3. 워드마크: 브랜드가 가장 먼저 말하는 자리 ──
body = body.replace(
    '<span style="font-size:14.5px;font-weight:700;letter-spacing:-.04em;color:#26282A">넥스트 스윙</span>',
    f'<span style="font-family:{DISPLAY};font-size:14.5px;font-weight:400;'
    'letter-spacing:.19em;color:#26282A">NEXT SWING</span>')

# 홈 히어로 메시지 — 브랜딩 순간
body = body.replace(
    '<span style="font-size:16px;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1.42">',
    f'<span style="font-family:{DISPLAY};font-size:16px;font-weight:400;'
    'letter-spacing:-.015em;color:#fff;line-height:1.55">')

# 히어로 아이브로우 — 조용하고 넓게
body = body.replace('font-size:9.5px;font-weight:600;letter-spacing:.18em;color:rgba(255,255,255,.66)',
                    'font-size:9px;font-weight:500;letter-spacing:.24em;color:rgba(255,255,255,.6)')

open(P, 'w', encoding='utf-8').write(head + body)
print('── 타이포그래피 ──')
print(f'  디스플레이 세리프 적용   {tstats["display"]}곳')
print(f'  웨이트 하향 (700→600/400) {tstats["weight"]}곳')
print(f'  라틴 라벨 트래킹 확대     {tstats["track"]}곳')
