# -*- coding: utf-8 -*-
"""프로토타입에 실제로 쓰인 글자만 남겨 서브셋 → base64 @font-face 로 내장.
   아티팩트는 외부 도메인 요청이 CSP로 차단되므로 CDN 링크를 쓸 수 없다."""
import re, os, base64, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.join(HERE, '..', 'nextswing-proto.html')

# ── 1. 사용 문자 수집 (태그·스타일 제외한 순수 텍스트 + JS 문자열) ──
raw = open(PROTO, encoding='utf-8').read()
body = raw[raw.index('<template data-scr="2a">'):]
texts = re.findall(r'>([^<>]+)<', body)          # 화면에 그려지는 텍스트
texts += re.findall(r"'([^']*[가-힣][^']*)'", raw)  # 런타임 토스트/라벨 문자열
texts += re.findall(r'"([^"]*[가-힣][^"]*)"', raw)

chars = set()
for t in texts:
    chars |= set(t)
# 숫자·기호·영문은 넉넉히 확보 (동적으로 바뀌는 값 대비)
chars |= set('0123456789')
chars |= set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
chars |= set(' .,·:;/()[]{}%+-—–~!?\'"‘’“”°&#@*<>=|₩$')
chars |= set('일월화수목금토년가나다라마바사아자차카타파하')
chars = {c for c in chars if c.strip() or c == ' '}

hangul = sorted(c for c in chars if '가' <= c <= '힣' or '㄰' <= c <= '㆏')
latin = sorted(c for c in chars if ord(c) < 0x2500 and c not in hangul)
print(f'사용 문자  전체 {len(chars)}자 · 한글 {len(hangul)}자 · 영문/기호 {len(latin)}자')

def uni(cs):
    return ','.join(f'U+{ord(c):04X}' for c in cs)

# ── 2. 서브셋 ──
# Hahmlet 은 한글 글리프도 갖고 있어, 라틴만 남겨야 한글이 나눔명조로 자연히 넘어간다
JOBS = [
    ('Hahmlet[wght].ttf',        'hahmlet-400.woff2', latin,          ['--variations=wght=400']),
    ('Hahmlet[wght].ttf',        'hahmlet-500.woff2', latin,          ['--variations=wght=500']),
    ('NanumMyeongjo-Regular.ttf','myeongjo-400.woff2', hangul + latin, []),
    ('NanumMyeongjo-Bold.ttf',   'myeongjo-700.woff2', hangul + latin, []),
    ('Pretendard-Regular.woff2', 'pretendard-400.woff2', hangul + latin, ['--flavor=woff2']),
    ('Pretendard-SemiBold.woff2','pretendard-600.woff2', hangul + latin, ['--flavor=woff2']),
    ('Pretendard-Bold.woff2',    'pretendard-700.woff2', hangul + latin, ['--flavor=woff2']),
]

out = {}
for src, dst, cs, extra in JOBS:
    sp = os.path.join(HERE, src)
    dp = os.path.join(HERE, dst)
    cmd = [sys.executable, '-m', 'fontTools.subset', sp,
           f'--unicodes={uni(cs)}',
           '--flavor=woff2', '--layout-features=*',
           '--no-hinting', '--desubroutinize',
           f'--output-file={dp}'] + [e for e in extra if not e.startswith('--flavor')]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('FAIL', dst, r.stderr[-400:]); continue
    kb = os.path.getsize(dp) / 1024
    out[dst] = kb
    print(f'  {dst:24} {kb:7.1f} KB')

print(f'합계 {sum(out.values()):.0f} KB')
