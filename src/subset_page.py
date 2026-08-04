# -*- coding: utf-8 -*-
"""주어진 HTML 이 실제로 쓰는 글자만 남긴 폰트 CSS 를 만든다.
   아티팩트는 외부 폰트 요청이 CSP 로 막히니 base64 로 내장한다."""
import base64, io, os, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(HERE, 'fonts')
FACES = [('Hahmlet', 400, 'Hahmlet-400.ttf'), ('Hahmlet', 500, 'Hahmlet-500.ttf'),
         ('Hahmlet', 600, 'Hahmlet-600.ttf'), ('Hahmlet', 700, 'Hahmlet-600.ttf'),
         ('Pretendard', 400, 'Pretendard-Regular.woff2'),
         ('Pretendard', 600, 'Pretendard-SemiBold.woff2'),
         ('Pretendard', 700, 'Pretendard-Bold.woff2')]


def chars_of(html):
    body = re.sub(r'<style>.*?</style>', '', html, flags=re.S)
    body = re.sub(r'<[^>]+>', ' ', body)
    return set(body)


def build(chars):
    keep = ''.join(sorted(chars | set(
        ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        '.,:;·—–-/()[]%?!\'"·×→←↑↓○●◦+&@#')))
    css = []
    for fam, wt, fn in FACES:
        path = os.path.join(F, fn)
        f = TTFont(path, fontNumber=0, lazy=True)
        opt = subset.Options(layout_features=['*'], notdef_outline=True,
                             desubroutinize=True, drop_tables=[])
        opt.flavor = 'woff2'
        sub = subset.Subsetter(options=opt)
        sub.populate(text=keep)
        sub.subset(f)
        buf = io.BytesIO()
        f.flavor = 'woff2'
        f.save(buf)
        b64 = base64.b64encode(buf.getvalue()).decode()
        css.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{wt};"
                   f"font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
        print(f'  {fam} {wt:3}  {len(buf.getvalue())/1024:6.1f} KB')
    return '\n'.join(css)


if __name__ == '__main__':
    src = sys.argv[1]
    html = open(src, encoding='utf-8-sig').read()
    css = build(chars_of(html))
    out = os.path.join(HERE, 'fonts-page.css')
    open(out, 'w', encoding='utf-8').write(css)
    print(f'\n{os.path.getsize(out)/1024:.0f} KB → {os.path.basename(out)}')
