# -*- coding: utf-8 -*-
"""디자인 작업용 패키지 생성 — 폰트 base64를 걷어내고 화면별로 분리한다."""
import re, os, json, shutil, base64

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'nextswing-proto.html')
OUT = os.path.join(HERE, 'nextswing-design')
raw = open(SRC, encoding='utf-8').read()

for sub in ('', 'screens', 'fonts'):
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)

# ── 폰트: base64 → 실제 파일 + 상대경로 @font-face ──
FONTS = [('Hahmlet', 400, 'hahmlet-400.woff2'), ('Hahmlet', 500, 'hahmlet-500.woff2'),
         ('Hahmlet', 600, 'hahmlet-600.woff2'), ('Pretendard', 400, 'pretendard-400.woff2'),
         ('Pretendard', 600, 'pretendard-600.woff2'), ('Pretendard', 700, 'pretendard-700.woff2')]
for _, _, fn in FONTS:
    shutil.copy(os.path.join(HERE, 'fonts', fn), os.path.join(OUT, 'fonts', fn))

def faces(prefix):
    return '\n'.join(
        f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;"
        f"src:url({prefix}fonts/{fn}) format('woff2')}}" for fam, w, fn in FONTS)

def faces_b64():
    out = []
    for fam, w, fn in FONTS:
        b = base64.b64encode(open(os.path.join(HERE, 'fonts', fn), 'rb').read()).decode()
        out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};"
                   f"font-display:swap;src:url(data:font/woff2;base64,{b}) format('woff2')}}")
    return '\n'.join(out)

TOKENS = """/* ── 디자인 토큰 (지금 적용된 값) ────────────────────────────
   배경 #F3EFE8 · 카드 #FFFDF9 · 딥그린 #21402F · 본문 #1D2420
   보조 #6E6858 · 캡션 #8A8375 · 보더 #E4DED2 · 샌드 #EFE9DE · 브론즈 #A67C3D
   한글·영문 Hahmlet 400/500/600 · 숫자와 버튼·탭바 Pretendard 400/600/700
   ──────────────────────────────────────────────────────── */
:root{ --font-base:Hahmlet,serif; --font-num:Pretendard,-apple-system,sans-serif; }
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-base);-webkit-font-smoothing:antialiased}
.wordmark{font-family:Hahmlet,serif;font-weight:500;letter-spacing:.12em}
.num{font-family:var(--font-num);font-weight:700;letter-spacing:-.03em}
[style*="border-top:1px solid"] [style*="font-size:11px"]{font-family:var(--font-num)}
[style*="font-variant-numeric"]{font-family:var(--font-num)}
[style*="overflow-y:auto"]>*{flex-shrink:0}"""

META = json.loads(re.search(r'window\.__META = (\{.*?\});', raw, re.S).group(1))
tpls = re.findall(r'<template data-scr="([\w-]+)">(.*?)</template>', raw, re.S)
print(f'화면 {len(tpls)}개 추출')

# ── 1. 화면별 개별 파일 (붙여넣기용) ──
index = []
for sid, html in tpls:
    m = META.get(sid, {})
    title = m.get('title', sid)
    fn = f'{sid}.html'
    doc = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>{sid} · {title}</title>
<style>
{faces('../')}
{TOKENS}
body{{background:#EDEAE3;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px;min-height:100vh}}
</style></head><body>
<!-- 화면 {sid} · {title}
     {m.get('desc', '')}
     구조와 텍스트는 유지하고 시각 디자인만 수정해 주세요. -->
{html.strip()}
</body></html>"""
    open(os.path.join(OUT, 'screens', fn), 'w', encoding='utf-8').write(doc)
    index.append((sid, title, len(doc) // 1024, m.get('desc', '')))

# ── 2. 전체 보드 (폰트 내장 · 단독 실행) ──
GROUPS = [
    ('메인 5탭', ['2a', '2b', '2c', '2g', '2h', '2e', '2f', '2f-1']),
    ('스윙 분석 신청', ['01', '02']),
    ('허브 · AI 설문', ['03', '04', '05', '06', '07']),
    ('영상 분석', ['08', '09', '10', '11']),
    ('프로와 비교', ['12', '13', '14', '15']),
    ('사전 · 구독', ['16', '17', '18', '19']),
    ('구독 결제', ['22', '23', '24']),
    ('피드백 도착', ['6c', '6d']),
]
byid = dict(tpls)
sections = ''
for gname, ids in GROUPS:
    cards = ''
    for sid in ids:
        if sid not in byid:
            continue
        t = META.get(sid, {}).get('title', sid)
        cards += (f'<div class="slot"><div class="lab"><b>{sid.upper()}</b><s>{t}</s></div>'
                  f'<div class="phw">{byid[sid]}</div></div>')
    sections += f'<section><h2>{gname}</h2><div class="row">{cards}</div></section>'

board = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEXT SWING · 디자인 보드 (32화면)</title>
<style>
{faces_b64()}
{TOKENS}
body{{background:#EDEAE3;color:#1D2420}}
.wrap{{max-width:1400px;margin:0 auto;padding:44px 24px 80px}}
h1{{font-size:26px;font-weight:600;letter-spacing:-.02em}}
.lede{{font-size:13px;color:#6E6858;line-height:1.85;margin-top:12px;max-width:660px}}
section{{margin-top:44px}}
h2{{font-size:11px;font-weight:600;letter-spacing:.2em;color:#8A8375;
   padding-bottom:16px;border-bottom:1px solid #E4DED2}}
.row{{display:flex;flex-wrap:wrap;gap:24px;margin-top:24px}}
.slot{{display:flex;flex-direction:column;gap:10px}}
.lab{{display:flex;align-items:baseline;gap:8px}}
.lab b{{font-family:var(--font-num);font-size:11px;font-weight:700;letter-spacing:.06em;color:#21402F}}
.lab s{{font-size:12px;color:#6E6858;text-decoration:none}}
.phw{{width:360px;height:720px;overflow:hidden;border-radius:26px;
     box-shadow:0 18px 44px -28px rgba(29,36,32,.5)}}
.phw>div{{border-radius:26px}}
</style></head><body>
<div class="wrap">
  <h1>NEXT SWING · 디자인 보드</h1>
  <p class="lede">현재 프로토타입의 32개 화면을 그대로 옮긴 정적 보드입니다.
     클릭 동작은 빠져 있고 화면만 들어 있어, 디자인 수정 대상으로 쓰기 좋습니다.
     폰트는 파일 안에 내장돼 있어 이 파일 하나만 열어도 지금과 똑같이 보입니다.</p>
  {sections}
</div>
</body></html>"""
open(os.path.join(OUT, 'board.html'), 'w', encoding='utf-8').write(board)

# ── 3. 규칙 문서 ──
rows = '\n'.join(f'| `{s}` | {t} | {k} KB |' for s, t, k, _ in index)
readme = f"""# NEXT SWING · 디자인 작업 패키지

현재 프로토타입에서 **동작(클릭 배선)을 걷어내고 화면만** 뽑아낸 묶음입니다.
디자인 수정은 이 파일들에서 하시고, 결과를 돌려주시면 배선을 다시 붙여 넣겠습니다.

## 무엇이 들어 있나

| 경로 | 내용 |
|---|---|
| `board.html` | 32화면을 한 페이지에 모은 보드. 폰트 내장이라 **이 파일 하나만 열어도** 지금과 똑같이 보입니다. 전체 훑어보기·스크린샷용 |
| `screens/*.html` | 화면 1개짜리 파일 32개. 각 2~20KB라 **채팅에 붙여넣기 좋습니다** |
| `fonts/*.woff2` | 서브셋 폰트 6종. `screens/` 파일들이 상대경로로 참조합니다 |

## 작업 방법

한 번에 한 화면씩 하시는 걸 권합니다.

1. `screens/2a.html` 같은 파일 하나를 엽니다
2. 그 내용을 통째로 디자인 도구에 주고 **"구조와 텍스트는 유지하고 시각 디자인만"** 수정 요청
3. 돌려받은 결과를 저에게 주시면 배선을 붙이고 검증해서 프로토타입에 반영합니다

`board.html`은 전체 인상을 보거나 스크린샷을 뜰 때 쓰세요. 여기서 직접 고치면 32화면이
한 파일에 있어서 되돌리기가 어렵습니다.

## 자유롭게 바꾸세요 — 버튼도 지우고, 새로 만들고, 화면도 추가하고

이 파일들은 클릭이 빠진 정적 화면입니다. 되돌려주시면 **제가 예전 배선 코드를
그 위에 억지로 얹지 않습니다. 새로 온 화면을 보고 배선을 처음부터 다시 짭니다.**
그래서 실제로는 이런 걱정을 안 하셔도 됩니다.

- 버튼 문구를 바꾸거나, 버튼을 통째로 지우고 다른 모양으로 새로 만들어도 됩니다
- 카드를 합치거나 쪼개거나, `<div>`로 몇 겹을 더 감싸도 됩니다
- 화면 순서나 탭 구성을 바꿔도 됩니다
- **완전히 새로운 화면을 만들어도 됩니다** — 예: 설정 화면, 알림 목록 같은 것

**딱 하나만 알려주시면 됩니다.** 새로 만든 버튼이나 화면이 있으면, 그게 어디로
연결돼야 하는지 한 줄로요. 예를 들면:

> "2a 홈 화면에 종 모양 아이콘 새로 넣었는데, 누르면 알림 목록이라는 새 화면으로
> 가야 해. 알림 목록 화면은 이렇게 생겼어: (화면 붙여넣기)"

기존 버튼을 자리만 옮기거나 이름만 바꾼 정도는 보면 알 수 있어서 안 알려주셔도 됩니다.
화면이 좀 이상하게 돌아온다 싶어도 일단 주세요 — 정리는 제가 합니다.

## 현재 디자인 토큰

```
배경   #F3EFE8      카드   #FFFDF9      딥그린 #21402F
본문   #1D2420      보조   #6E6858      캡션   #8A8375
보더   #E4DED2      샌드   #EFE9DE      브론즈 #A67C3D
```

- 한글·영문: **Hahmlet** 400 / 500 / 600 — 600을 넘기지 마세요 (없는 굵기라 가짜 볼드가 됩니다)
- 숫자·버튼·탭바: **Pretendard** 400 / 600 / 700
- 워드마크 `NEXT SWING`: Hahmlet 500 · 자간 .12em

## 화면 목록

| 파일 | 화면 | 크기 |
|---|---|---|
{rows}
"""
open(os.path.join(OUT, 'README.md'), 'w', encoding='utf-8').write(readme)

tot = sum(os.path.getsize(os.path.join(dp, f))
          for dp, _, fs in os.walk(OUT) for f in fs)
print(f"board.html   {os.path.getsize(os.path.join(OUT,'board.html'))/1024:.0f} KB")
print(f"screens/     {len(index)}개 · 최대 {max(k for _,_,k,_ in index)} KB · 중앙값 {sorted(k for _,_,k,_ in index)[len(index)//2]} KB")
print(f"패키지 전체   {tot/1024:.0f} KB")
