# -*- coding: utf-8 -*-
"""달력 칸 명확성 — 5가지 처리 비교"""
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
proto = open(os.path.join(HERE, 'nextswing-proto.html'), encoding='utf-8').read()
FACES = '\n'.join(re.findall(r'@font-face\{[^}]*\}', proto))

BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE = '#E4DED2', '#EFE9DE', '#A67C3D'
NUM = 'font-family:var(--font-num);font-weight:700;letter-spacing:-.03em'

MARKS = {3: 1, 5: 1, 6: 1, 8: 1, 10: 1, 12: 1, 13: 2, 15: 1, 17: 1, 19: 1, 20: 3, 22: 1}
TODAY, FEED = 22, 27
WEEKS = [[None, None, None, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17, 18],
         [19, 20, 21, 22, 23, 24, 25], [26, 27, 28, 29, 30, 31, None]]


def dot(d):
    m = MARKS.get(d, 0)
    if m == 1:
        return f'<span style="width:5px;height:5px;border-radius:50%;background:{FOREST};display:block"></span>'
    if m == 2:
        return (f'<span style="display:flex;gap:3px"><span style="width:5px;height:5px;border-radius:50%;background:{FOREST};display:block"></span>'
                f'<span style="width:5px;height:5px;border-radius:50%;background:{BRONZE};display:block"></span></span>')
    if m == 3:
        return (f'<span style="display:flex;gap:3px"><span style="width:5px;height:5px;border-radius:50%;background:{FOREST};display:block"></span>'
                f'<span style="width:5px;height:5px;border-radius:50%;border:1px solid {BRONZE};display:block"></span></span>')
    return ''


def numel(d):
    if d == TODAY:
        return (f'<span style="{NUM};width:26px;height:26px;border-radius:50%;background:{INK};color:#fff;'
                f'display:flex;align-items:center;justify-content:center;font-size:13px">{d}</span>')
    if d == FEED:
        return (f'<span style="{NUM};width:26px;height:26px;border-radius:50%;background:{FOREST};color:#fff;'
                f'display:flex;align-items:center;justify-content:center;font-size:13px">{d}</span>')
    col = INK2 if d <= TODAY else '#C3BCAC'
    return f'<span style="{NUM};font-size:13px;color:{col};line-height:26px">{d}</span>'


def cell(d, cellstyle=''):
    if d is None:
        return f'<span style="{cellstyle}"></span>'
    sub = (f'<span style="font-size:9px;font-weight:400;color:{FOREST};line-height:6px">진단</span>'
           if d == FEED else dot(d))
    return ('<span style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:5px 0;'
            + cellstyle + '">'
            + numel(d) + f'<span style="height:6px;display:flex;align-items:center">{sub}</span></span>')


def header(gap='2px'):
    return ''.join(f'<span style="text-align:center;font-size:11.5px;font-weight:400;color:{INK4};'
                   f'padding-bottom:6px">{d}</span>' for d in ['일', '월', '화', '수', '목', '금', '토'])


def grid(cellstyle='', gap='2px', extra=''):
    cells = ''.join(cell(d, cellstyle) for w in WEEKS for d in w)
    return (f'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:{gap};{extra}">'
            + header() + cells + '</div>')


# ── 5가지 처리 ──
def opt_now():
    return f'<div style="padding:0 2px">{grid()}</div>'


def opt_card():
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:14px 10px 10px">'
            f'{grid()}</div>')


def opt_rowrule():
    rows = header()
    for wi, w in enumerate(WEEKS):
        bd = f'border-top:1px solid {LINE};' if wi else ''
        for d in w:
            rows += cell(d, bd)
    return ('<div style="padding:0 2px"><div style="display:grid;grid-template-columns:repeat(7,1fr)">'
            + rows + '</div></div>')


def opt_tint():
    cells = header()
    for w in WEEKS:
        for d in w:
            st = (f'background:{SAND};border-radius:8px;' if d and d in MARKS and d not in (TODAY, FEED) else '')
            cells += cell(d, st)
    return ('<div style="padding:0 2px"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">'
            + cells + '</div></div>')


def opt_border():
    cells = header()
    for w in WEEKS:
        for d in w:
            cells += cell(d, f'border:1px solid {LINE};border-radius:6px;background:{CARD};')
    return ('<div style="padding:0 2px"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">'
            + cells + '</div></div>')



def opt_card_tint():
    """① 카드 패널 + ③ 기록일 틴트 — 모듈 경계와 기록 밀도를 함께"""
    cells = header()
    for w in WEEKS:
        for d in w:
            st = (f'background:{SAND};border-radius:9px;'
                  if d and d in MARKS and d not in (TODAY, FEED) else '')
            cells += cell(d, st)
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:14px 10px 10px">'
            '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">'
            + cells + '</div></div>')


LEGEND = ('<div style="display:flex;justify-content:space-between;padding:14px 4px 0">'
          + ''.join(f'<span style="display:flex;align-items:center;gap:5px;font-size:10.5px;color:{INK3}">'
                    f'<span style="{s};display:block"></span>{t}</span>'
                    for s, t in [(f'width:5px;height:5px;border-radius:50%;background:{FOREST}', '스윙'),
                                 (f'width:5px;height:5px;border-radius:50%;background:{BRONZE}', '코멘트'),
                                 (f'width:6px;height:6px;border-radius:50%;border:1px solid {BRONZE}', '대기'),
                                 (f'width:11px;height:11px;border-radius:50%;background:{FOREST}', '진단일')])
          + '</div>')

OPTS = [
    ('현재', '컨테이너 없이 배경 위에 바로. 칸 경계가 없어 세로로 무엇이 한 주인지 잡히지 않습니다.', opt_now()),
    ('① 카드 패널', '달력 전체를 카드 면 위에 올립니다. 달력이 하나의 모듈로 읽히고, 주변 카드들과 언어가 같아집니다.', opt_card()),
    ('② 주 구분선', '주와 주 사이에만 얇은 선. 표가 아니라 문서의 행처럼 읽혀 에디토리얼 톤과 맞습니다.', opt_rowrule()),
    ('③ 기록일 틴트', '스윙을 올린 날에만 옅은 샌드 배경. 칸을 나누는 대신 “한 달 중 내가 채운 날”이 덩어리로 보입니다.', opt_tint()),
    ('④ 전체 테두리', '모든 칸에 테두리. 경계는 가장 또렷하지만 표·엑셀 인상이 강해집니다.', opt_border()),
    ('⑤ 카드 + 기록일 틴트', '①의 카드 면 위에 ③의 틴트를 얹은 조합. 달력의 경계와 “이번 달 내가 채운 날”이 한눈에 같이 들어옵니다.', opt_card_tint()),
]

cards = ''
for i, (name, desc, html) in enumerate(OPTS):
    tag = ('<span style="font-size:10px;font-weight:600;letter-spacing:.1em;color:#8A8375;'
           'border:1px solid #D8D1C2;border-radius:20px;padding:3px 9px;margin-left:8px">기준</span>') if i == 0 else ''
    rec = ('<span style="font-size:10px;font-weight:600;letter-spacing:.1em;color:#fff;'
           'background:#21402F;border-radius:20px;padding:3px 9px;margin-left:8px">추천</span>') if name.startswith('⑤') else ''
    cards += f'''<div class="opt">
      <div class="oh"><b>{name}</b>{tag}{rec}</div>
      <p class="od">{desc}</p>
      <div class="phone"><div class="inner">{html}{LEGEND}</div></div>
    </div>'''

HTML = f'''<title>달력 칸 처리 · 5안 비교</title>
<style>
{FACES}
:root{{ --font-num:Pretendard,-apple-system,sans-serif; --font-base:Hahmlet,'Nanum Myeongjo',serif;
  --pg:#F4F5F7; --ct:#1D2420; --cs:#6E6858; --bd:#E4DED2; }}
@media (prefers-color-scheme: dark){{ :root{{ --pg:#15171a; --ct:#e9ebee; --cs:#98a0aa; --bd:#2a2f35; }} }}
:root[data-theme="dark"]{{ --pg:#15171a; --ct:#e9ebee; --cs:#98a0aa; --bd:#2a2f35; }}
:root[data-theme="light"]{{ --pg:#F4F5F7; --ct:#1D2420; --cs:#6E6858; --bd:#E4DED2; }}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:var(--font-base);background:var(--pg);color:var(--ct);-webkit-font-smoothing:antialiased}}
.wrap{{max-width:1200px;margin:0 auto;padding:40px 22px 70px}}
h1{{font-size:23px;font-weight:400;letter-spacing:-.02em}}
.lede{{font-size:13px;color:var(--cs);line-height:1.85;margin-top:10px;max-width:640px;font-weight:400}}
.grid{{display:flex;flex-wrap:wrap;gap:20px;margin-top:32px}}
.opt{{flex:1 1 330px;max-width:360px;display:flex;flex-direction:column;gap:9px}}
.oh{{display:flex;align-items:center}}
.oh b{{font-size:14px;font-weight:700;letter-spacing:-.01em}}
.od{{font-size:11.5px;color:var(--cs);line-height:1.75;min-height:56px;font-weight:400}}
.phone{{background:{BG};border:1px solid var(--bd);border-radius:16px;overflow:hidden}}
.inner{{padding:18px 16px 16px}}
</style>
<div class="wrap">
  <h1>달력 칸 처리 · 5안 비교</h1>
  <p class="lede">연습기록 달력의 칸 경계를 어떻게 잡을지 다섯 가지로 만들어 나란히 뒀습니다.
     날짜·마커·범례는 모두 동일하고 칸 처리만 다릅니다. 실제 앱 배경색 위에 얹어 대비를 그대로 볼 수 있게 했습니다.</p>
  <div class="grid">{cards}</div>
</div>'''

open(os.path.join(HERE, 'cal-options.html'), 'w', encoding='utf-8').write(HTML)
print('written cal-options.html', len(HTML) // 1024, 'KB')
