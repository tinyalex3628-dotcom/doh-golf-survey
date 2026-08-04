# -*- coding: utf-8 -*-
"""시안 보드에 실제로 쓰인 글자만 서브셋 → base64 @font-face.
   아티팩트는 외부 도메인이 CSP로 막히므로 CDN 링크를 못 쓴다."""
import re, os, base64, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'open-board.html')
raw = open(SRC, encoding='utf-8').read()

# <style> 블록만 빼고 나머지 전부에서 글자를 모은다 (JS 문자열 포함)
body = re.sub(r'<style>[\s\S]*?</style>', '', raw)
chars = set(body)
chars |= set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
chars |= set(' .,·:;/()[]{}%+-—–~!?\'"‘’“”°&#@*<>=|₩$×')
chars = {c for c in chars if c == ' ' or c.strip()}

hangul = sorted(c for c in chars if '가' <= c <= '힣')
latin  = sorted(c for c in chars if ord(c) < 0x2500 and c not in hangul)
print(f'글자 {len(chars)}자 · 한글 {len(hangul)} · 라틴/기호 {len(latin)}')

uni = lambda cs: ','.join(f'U+{ord(c):04X}' for c in cs)

# 함렛은 한글 글리프도 있다 — 낱말표(넥스트 스윙)를 라틴과 같은 목소리로 쓰려면 한글도 남긴다
JOBS = [
    ('Hahmlet-400.ttf',          'Hahmlet',    400, hangul + latin, []),
    ('Hahmlet-600.ttf',          'Hahmlet',    600, hangul + latin, []),
    ('Pretendard-Regular.woff2', 'Pretendard', 400, hangul + latin, []),
    ('Pretendard-SemiBold.woff2','Pretendard', 600, hangul + latin, []),
    ('Pretendard-Bold.woff2',    'Pretendard', 700, hangul + latin, []),
]

faces, total = [], 0
for src, fam, wt, cs, extra in JOBS:
    tmp = tempfile.mktemp(suffix='.woff2')
    cmd = [sys.executable, '-m', 'fontTools.subset', os.path.join(HERE, 'fonts', src),
           f'--unicodes={uni(cs)}', '--flavor=woff2', '--layout-features=*',
           '--no-hinting', '--desubroutinize', f'--output-file={tmp}'] + extra
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f'FAIL {src} {wt}\n{r.stderr[-600:]}')
    b = open(tmp, 'rb').read(); os.remove(tmp)
    total += len(b)
    print(f'  {fam}-{wt:<4} {len(b)/1024:7.1f} KB')
    faces.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;"
                 "font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}"
                 % (fam, wt, base64.b64encode(b).decode()))

out = raw.replace('/*FONTS*/', '\n'.join(faces), 1)
assert '/*FONTS*/' not in out
open(os.path.join(HERE, 'open-board.built.html'), 'w', encoding='utf-8').write(out)
print(f'폰트 합계 {total/1024:.0f} KB → 문서 {len(out.encode())/1024:.0f} KB')
