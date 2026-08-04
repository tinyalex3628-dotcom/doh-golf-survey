# -*- coding: utf-8 -*-
"""Hahmlet(영문) + 나눔명조(한글) + Pretendard(숫자·UI 마이크로카피) 3역 분담 적용.
   서브셋한 woff2를 base64로 내장한다 — 아티팩트는 외부 폰트 요청이 CSP로 막힌다."""
import re, os, base64

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, 'nextswing-proto.html')
F = os.path.join(HERE, 'fonts')
s = open(P, encoding='utf-8').read()

# ── 0. 색 팔레트를 지정하신 값으로 정렬 ──
PAL = {
    '#F6F3EE': '#F3EFE8',   # 배경
    '#1F3D2B': '#21402F',   # 딥그린
    '#16301F': '#17301F',
    '#26282A': '#1D2420',   # 본문
    '#6E7377': '#6E6858',   # 보조
    '#A7A9A6': '#8A8375',   # 캡션
    '#B3B4AE': '#A39C8C',
    '#C6C6C0': '#BDB6A6', '#CFCBC1': '#CFC8B8',
    '#E6E1D8': '#E4DED2',   # 보더
    '#DCD5C7': '#D8D1C2', '#DDD7CB': '#DDD6C8',
    '#F1EBE0': '#EFE9DE', '#F4EFE6': '#F2ECE2',
    '#E7EDE7': '#E6EDE7', '#FAF7F2': '#FBF8F2', '#F1EDE6': '#F0ECE4',
}
for a, b in PAL.items():
    s = s.replace(a, b).replace(a.lower(), b)
# 카드 흰색만 웜 화이트로 (흰 글씨는 그대로)
s = s.replace('background:#fff;', 'background:#FFFDF9;').replace('background:#fff"', 'background:#FFFDF9"')
s = s.replace('background:#ffffff', 'background:#FFFDF9')

# ── 1. 이전 라운드의 Georgia 스택 제거 → body 기본 스택 상속 ──
GEO = "font-family:Georgia,'Times New Roman','Nanum Myeongjo','Noto Serif KR',AppleMyungjo,Batang,serif;"
n_geo = s.count(GEO) + s.count(GEO.rstrip(';'))
s = s.replace(GEO, '').replace(GEO.rstrip(';'), '')

head, body = s[:s.index('<template data-scr="2a">')], s[s.index('<template data-scr="2a">'):]

# ── 2. 세리프 굵기는 400 / 700 두 단계만 ──
#     제목(잉크색 + 12.5px 이상 + 기존 600↑) → 700, 나머지 → 400
stats = {'w700': 0, 'w400': 0, 'ls0': 0, 'num': 0}

def weights(m):
    st = m.group(1)
    fw = re.search(r'font-weight:(\d+)', st)
    if not fw:
        return m.group(0)
    w = int(fw.group(1))
    fs = re.search(r'font-size:([\d.]+)px', st)
    size = float(fs.group(1)) if fs else 13.0
    is_ink = '#1D2420' in st or 'color:#fff' in st or '#21402F' in st or '#17301F' in st
    new = 700 if (w >= 600 and size >= 12.5 and is_ink) else 400
    if new != w:
        st = re.sub(r'font-weight:\d+', f'font-weight:{new}', st)
        stats['w700' if new == 700 else 'w400'] += 1
    # 작은 명조는 자간 0 (음수 자간은 명조 가독성을 해친다)
    if size <= 13.5:
        if re.search(r'letter-spacing:-[\d.]+em', st):
            st = re.sub(r'letter-spacing:-[\d.]+em', 'letter-spacing:0', st)
            stats['ls0'] += 1
    return 'style="' + st + '"'

body = re.sub(r'style="([^"]*font-size[^"]*)"', weights, body)

# ── 3. 숫자는 Pretendard — 순수 수치 스팬에만 (DOM 구조는 건드리지 않는다) ──
NUM_RE = re.compile(r'^[\d\s.,:/()\-+°%]+$')

def numify(m):
    st, inner = m.group(1), m.group(2)
    if not NUM_RE.match(inner) or not any(c.isdigit() for c in inner):
        return m.group(0)
    if 'font-family' in st:
        return m.group(0)
    stats['num'] += 1
    return f'<span style="font-family:var(--font-num);font-weight:700;letter-spacing:-.03em;{st}">{inner}</span>'

body = re.sub(r'<span style="([^"]*)">([^<]+)</span>', numify, body)

# D-day 표기도 숫자 취급
body = re.sub(r'(<span style="(?![^"]*font-family)[^"]*")(>D-\d+</span>)',
              lambda m: m.group(1)[:-1] + ';font-family:var(--font-num);font-weight:700"' + m.group(2), body)

# ── 4. 홈 통계: 숫자는 Pretendard, 단위(일·개)는 명조 유지 ──
body = re.sub(r'(<span style="font-size:23px[^"]*)"',
              r'\1;font-family:var(--font-num);font-weight:700;letter-spacing:-.03em"', body)
body = re.sub(r'(<span style="font-size:11px;font-weight:\d+;letter-spacing:[^;"]*;color:#8A8375;margin-left:1px")',
              lambda m: m.group(0)[:-1] + ';font-family:var(--font-base)"', body)

# ── 5. 워드마크 ──
body = re.sub(r'<span style="font-size:14\.5px;font-weight:\d+;letter-spacing:[^;"]*;color:#1D2420">NEXT SWING</span>',
              '<span class="wordmark" style="font-size:15px;color:#1D2420">NEXT SWING</span>', body)

# ── 6. 12px 이하 UI 마이크로카피(탭바·버튼)는 Pretendard 예외 ──
body = body.replace('text-align:center;font-size:14.5px;font-weight:400;',
                    'text-align:center;font-size:14.5px;font-weight:600;font-family:var(--font-num);')
body = body.replace('text-align:center;font-size:14.5px;font-weight:700;',
                    'text-align:center;font-size:14.5px;font-weight:600;font-family:var(--font-num);')
s = head + body

# ── 7. @font-face 내장 + 역할 변수 ──
def b64(f):
    with open(os.path.join(F, f), 'rb') as fh:
        return base64.b64encode(fh.read()).decode()

faces = ''
for fam, wt, fn in [('Hahmlet', 400, 'hahmlet-400.woff2'), ('Hahmlet', 500, 'hahmlet-500.woff2'),
                    ('Nanum Myeongjo', 400, 'myeongjo-400.woff2'), ('Nanum Myeongjo', 700, 'myeongjo-700.woff2'),
                    ('Pretendard', 400, 'pretendard-400.woff2'), ('Pretendard', 600, 'pretendard-600.woff2'),
                    ('Pretendard', 700, 'pretendard-700.woff2')]:
    faces += (f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{wt};font-display:swap;"
              f"src:url(data:font/woff2;base64,{b64(fn)}) format('woff2')}}\n")

CSS = faces + """
:root{ --font-base:Hahmlet,'Nanum Myeongjo',serif; --font-num:Pretendard,-apple-system,sans-serif; }
body{ font-family:var(--font-base) }
.wordmark{ font-family:Hahmlet,serif;font-weight:500;letter-spacing:.12em }
.num{ font-family:var(--font-num);font-weight:700;letter-spacing:-.03em }
/* 탭바 라벨은 UI 마이크로카피 → Pretendard */
.ph [style*="border-top:1px solid"] [style*="font-size:11px"]{ font-family:var(--font-num) }
[style*="border-top:1px solid"] [style*="font-size:11px"]{ font-family:var(--font-num) }
/* 상태바 시각 · 12px 이하 수치 */
[style*="font-variant-numeric"]{ font-family:var(--font-num) }
"""

# 기존 body 폰트 선언을 대체
s = re.sub(r'body\{font-family:"Pretendard"[^}]*\}',
           'body{background:var(--canvas);color:var(--ct);-webkit-font-smoothing:antialiased;font-family:var(--font-base)}', s)
s = s.replace('<style>\n:root{', '<style>\n' + CSS + '\n:root{', 1)

open(P, 'w', encoding='utf-8').write(s)
kb = os.path.getsize(P) / 1024
print(f'Georgia 스택 제거 {n_geo}곳')
print(f'세리프 굵기  700 {stats["w700"]}곳 · 400 {stats["w400"]}곳')
print(f'작은 명조 자간 0  {stats["ls0"]}곳')
print(f'Pretendard 숫자   {stats["num"]}곳')
print(f'파일 크기 {kb:.0f} KB (폰트 7종 내장)')
