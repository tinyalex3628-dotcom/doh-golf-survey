# -*- coding: utf-8 -*-
"""히어로 아래 자리 3안."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'zone-slotted.json'), encoding='utf-8'))

CARDS = [
    ('z0', '지금', '3일 · 12개 · 5일', '',
     ['<b>주간</b> 연습 3일 — 최근 활동',
      '<b>등록</b> 스윙 12개 — 쌓인 재고',
      '<b>연속</b> 기록 5일 — 습관'],
     ['시간 축이 <b>셋 다 다른데</b> 크기가 똑같다',
      '무엇을 보라는 건지 화면이 말하지 않는다'], 'bad'),

    ('z1', 'A안', '다음 리포트 준비', '추천',
     ['셋을 <b>하나의 질문</b>에 답하게 묶었다 — "다음 리포트까지 얼마나 쌓았나"',
      '연습이 <b>돈 낸 것(리포트)과 이어진다</b>',
      '리포트가 온 날에도 <b>바로 다음 사이클</b>이 시작된다'],
     ['영상을 왜 올려야 하는지가 <b>숫자로 보인다</b>',
      '피드백 없는 29일에도 <b>그대로 작동</b>한다'], 'pick'),

    ('z2', 'B안', '이번 달 숙제', '',
     ['피드백을 읽었으면 다음은 <b>할 일</b>이다',
      '리포트 안에 있던 숙제를 <b>홈으로 끌어온다</b>',
      '홈에서 바로 체크한다'],
     ['가장 <b>행동을 만든다</b>. 코칭 앱다운 선택',
      '다만 숙제는 <b>Elite만</b> 생긴다 — 나머지 등급은 이 자리가 빈다'], 'alt'),

    ('z3', 'C안', '한 줄로 축소', '',
     ['숫자는 그대로 두되 <b>카드를 없애고</b> 한 줄로',
      '히어로와 경쟁하지 않는다'],
     ['가장 안 건드리는 안. <b>문제를 해결하진 않고 비켜준다</b>'], 'soft'),
]

cells = ''
for k, nm, sub, tag, pts, verdict, tone in CARDS:
    lis = ''.join(f'<li>{p}</li>' for p in pts)
    vs = ''.join(f'<li>{v}</li>' for v in verdict)
    tg = f'<span class="tag">{tag}</span>' if tag else ''
    cells += f'''<div class="cell {tone}">
      <div class="head"><span class="nm">{nm}</span><span class="sub">{sub}</span>{tg}</div>
      <div class="phone">{S[k]}</div>
      <ul class="pts">{lis}</ul>
      <div class="verdict"><b>판단</b><ul>{vs}</ul></div>
    </div>'''

html = f'''<title>히어로 아래 자리 3안</title>
<style>
__FONTS__
:root{{--pg:#EFECE3;--ct:#16281E;--cs:#4A503F;--cs2:#7C857C;--bd:#E2DED2;--panel:#FCFBF7;
 --acc:#1D4534}}
@media (prefers-color-scheme:dark){{:root{{--pg:#181A17;--ct:#E9E7DE;--cs:#A9ADA0;--cs2:#868A80;
 --bd:#32352E;--panel:#212420;--acc:#8FBFA3}}}}
:root[data-theme="dark"]{{--pg:#181A17;--ct:#E9E7DE;--cs:#A9ADA0;--cs2:#868A80;--bd:#32352E;
 --panel:#212420;--acc:#8FBFA3}}
:root[data-theme="light"]{{--pg:#EFECE3;--ct:#16281E;--cs:#4A503F;--cs2:#7C857C;--bd:#E2DED2;
 --panel:#FCFBF7;--acc:#1D4534}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Pretendard',-apple-system,sans-serif;background:var(--pg);color:var(--ct);
 -webkit-font-smoothing:antialiased;line-height:1.75}}
.wrap{{max-width:1720px;margin:0 auto;padding:40px 22px 80px}}
h1{{font-size:26px;font-weight:700;letter-spacing:-.03em}}
.lede{{margin-top:12px;font-size:14px;color:var(--cs);max-width:880px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:700}}
.row{{display:flex;gap:18px;margin-top:30px;align-items:flex-start;overflow-x:auto;
 padding-bottom:14px}}
.cell{{flex:0 0 372px;background:var(--panel);border:1px solid var(--bd);border-radius:16px;
 padding:18px 17px 20px}}
.cell.pick{{border-color:var(--acc);border-width:2px;padding:17px 16px 19px}}
.head{{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:14px}}
.nm{{font-size:17px;font-weight:700;letter-spacing:-.02em}}
.sub{{font-size:12px;color:var(--cs)}}
.tag{{margin-left:auto;font-size:10px;font-weight:700;background:var(--acc);color:#fff;
 border-radius:6px;padding:4px 8px}}
.phone{{display:flex;justify-content:center;background:var(--pg);border-radius:13px;padding:16px 0;
 border:1px solid var(--bd)}}
.phone>div{{transform:scale(.9);transform-origin:top center;margin-bottom:-74px}}
.pts{{margin:16px 0 0;padding-left:17px;font-size:12.5px;color:var(--cs);line-height:1.85}}
.pts li{{margin-bottom:5px}}
.pts b{{color:var(--ct);font-weight:700}}
.verdict{{margin-top:15px;padding-top:13px;border-top:1px solid var(--bd)}}
.verdict>b{{font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--cs2)}}
.verdict ul{{margin:7px 0 0;padding-left:17px;font-size:12.5px;line-height:1.8}}
.verdict b{{font-weight:700}}
.note{{margin-top:32px;background:var(--panel);border:1px solid var(--bd);border-radius:14px;
 padding:20px 22px;max-width:920px}}
.note h2{{font-size:14px;font-weight:700;margin-bottom:10px}}
.note h2+h2{{margin-top:18px}}
.note p{{font-size:13px;color:var(--cs);line-height:1.9}}
.note p+p{{margin-top:9px}}
.note b{{color:var(--ct);font-weight:700}}
code{{font-size:11.5px;background:rgba(29,69,52,.09);border-radius:4px;padding:1px 5px}}
</style>
<div class="wrap">
  <h1>히어로 아래 자리 3안</h1>
  <p class="lede">짚으신 게 맞습니다. 그런데 문제는 <b>"피드백과 관련이 없어서"가 아닙니다.</b>
    저 세 숫자는 <b>아무 질문에도 답을 안 하고</b> 있어요 —
    주간 연습은 <b>최근</b>, 등록 스윙은 <b>재고</b>, 연속 기록은 <b>습관</b>.
    시간 축이 셋 다 다른데 크기가 똑같아서, 무엇을 보라는 건지 화면이 말하지 않습니다.
    그래서 셋 다 <b>하나의 질문에 답하도록</b> 다시 짰습니다.</p>
  <div class="row">{cells}</div>
  <div class="note">
    <h2>제 추천은 A안입니다</h2>
    <p>이 앱에서 회원이 영상을 올리는 <b>진짜 이유</b>는 "많이 올리면 프로가 더 잘 봐준다"입니다.
      그런데 지금 홈은 그 연결을 어디에도 안 보여줍니다.
      A안은 <code>영상 12개 · 연습 12일</code>을 <b>다음 리포트 진행바</b>에 묶어서,
      연습이 <b>돈 낸 것과 이어져 있다</b>는 걸 매일 보여줍니다.</p>
    <p>그리고 <b>리포트가 온 날에도 바로 다음 사이클이 시작</b>됩니다.
      피드백 없는 29일에도 그대로 작동해서, 앞서 걱정했던
      "안 온 날 홈이 죽는다" 문제까지 같이 풀립니다.</p>

    <h2>B안은 더 좋을 수도 있습니다 — 단, 조건이 있습니다</h2>
    <p>"피드백을 읽었으면 다음은 할 일"이라는 흐름은 <b>코칭 앱으로서 가장 옳습니다.</b>
      다만 <b>숙제는 정기 피드백에만 딸려 옵니다.</b>
      Elite가 아니면 이 자리가 통째로 비어요.
      Basic · Coaching에게 뭘 보여줄지 같이 정해야 합니다.</p>
    <p><b>A안 + B안을 위아래로 같이 두는 것</b>도 됩니다. 자리는 충분합니다.
      Elite는 숙제와 진행바를 다 보고, 나머지 등급은 진행바만 봅니다.</p>

    <h2>참고 · 지금 시안의 제목은 자리표시입니다</h2>
    <p>제목은 직접 쓰신다고 하셔서 <code>하체가 자리를 잡으니 / 왼팔이 보여요</code>를
      그냥 채워뒀습니다. 글자 수는 <b>두 줄이면 넉넉하고 세 줄까지</b> 들어갑니다.</p>
  </div>
</div>'''
open(os.path.join(HERE, 'zone-board.html'), 'w', encoding='utf-8-sig').write(html)
print(f'{len(html)/1024:.0f} KB → zone-board.html')
