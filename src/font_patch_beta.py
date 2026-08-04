# -*- coding: utf-8 -*-
"""베타 안내에 새로 쓴 글자 중 기존 서브셋에 없는 것만 골라 두 번째 @font-face 로 보강.

   같은 family·weight 로 @font-face 를 한 번 더 선언하면, 브라우저는 앞 얼굴에 없는
   글리프만 뒤 얼굴에서 찾아 쓴다. font-patch.css 를 만들 때 썼던 방식 그대로다.
   (아티팩트·정적 호스팅 모두 외부 폰트 요청을 안 하려고 base64 로 심는다)"""
import re, os, io, sys, base64, subprocess
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FDIR = os.path.join(HERE, 'fonts')
OUT = os.path.join(HERE, 'font-patch-beta.css')

# ── 1. 지금 심어져 있는 글리프 모으기 ──
have = set()
for p in [os.path.join(HERE, 'handoff-v3', 'design_handoff_next_swing', 'board-fonts.css'),
          os.path.join(HERE, 'font-patch.css')]:
    for b64 in re.findall(r'base64,([A-Za-z0-9+/=]+)', open(p, encoding='utf-8').read()):
        have |= set(TTFont(io.BytesIO(base64.b64decode(b64))).getBestCmap())

# ── 2. 런타임이 화면에 찍는 글자 ──
# 화면 템플릿(screens-v3.json)은 board-fonts.css 를 만들 때 이미 훑었다.
# 여기서 훑는 건 「JS 가 만들어 넣는 글자」다 — 신규 계정 히어로처럼 템플릿에 없던 문구.
SRCS = ['beta-gate.js', 'runtime-v3.js', 'engine-runtime.js']
want = set()
for fn in SRCS:
    src = open(os.path.join(HERE, fn), encoding='utf-8').read()
    # 주석은 화면에 안 나온다 — 걷어내야 주석 속 한글까지 폰트에 실리지 않는다
    src = re.sub(r'/\*[\s\S]*?\*/', '', src)
    src = re.sub(r'(?m)//.*$', '', src)
    for pat in (r'>([^<>]*[가-힣][^<>]*)<',      # 마크업 안 본문
                r"'([^'\n]*[가-힣][^'\n]*)'",     # 작은따옴표 문자열
                r'"([^"\n]*[가-힣][^"\n]*)"',     # 큰따옴표 문자열
                r'`([^`]*[가-힣][^`]*)`'):        # 템플릿 문자열
        for t in re.findall(pat, src):
            want |= set(t)
want = {c for c in want if c.strip() and ('가' <= c <= '힣' or ord(c) > 0x2000)}

miss = sorted(c for c in want if ord(c) not in have)
print(f'베타 안내 문자 {len(want)}자 · 빠진 글자 {len(miss)}자: {"".join(miss)}')
if not miss:
    open(OUT, 'w', encoding='utf-8').write('')
    sys.exit(0)

uni = ','.join(f'U+{ord(c):04X}' for c in miss)
JOBS = [
    # 가변폰트 인스턴싱은 이 fontTools 버전에 없다 — 굵기별 정적 파일을 쓴다
    ('Hahmlet-400.ttf',           'Hahmlet',    400),
    ('Hahmlet-500.ttf',           'Hahmlet',    500),
    ('Hahmlet-600.ttf',           'Hahmlet',    600),
    ('Pretendard-Regular.woff2',  'Pretendard', 400),
    ('Pretendard-SemiBold.woff2', 'Pretendard', 600),
    ('Pretendard-Bold.woff2',     'Pretendard', 700),
]

css = []
for fn, fam, w in JOBS:
    tmp = os.path.join(HERE, f'_pb_{fam}_{w}.woff2')
    cmd = [sys.executable, '-m', 'fontTools.subset', os.path.join(FDIR, fn),
           f'--unicodes={uni}', '--flavor=woff2', '--layout-features=*',
           '--no-hinting', '--desubroutinize', f'--output-file={tmp}']
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f'FAIL {fam} {w}\n{r.stderr[-600:]}')
    b64 = base64.b64encode(open(tmp, 'rb').read()).decode()
    os.remove(tmp)
    css.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};"
               f"font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
    print(f'  {fam} {w}: {len(b64)/1024:.1f} KB (base64)')

open(OUT, 'w', encoding='utf-8').write('\n'.join(css) + '\n')
print(f'→ {os.path.basename(OUT)}  {os.path.getsize(OUT)/1024:.0f} KB')
