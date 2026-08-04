# -*- coding: utf-8 -*-
"""글래스 워시 홈 3안 비교 보드."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'glass-slotted.json'), encoding='utf-8'))

CARDS = [
    ('now', '지금', '따뜻한 종이 + 초록 면', '',
     ['초록을 <b>면(카드)</b>으로 쓴다 — 히어로가 통째로 딥그린',
      '명조(Hahmlet) · 카드가 또렷하게 나뉜다'],
     ['묵직하고 안정적이지만 <b>초록 덩어리가 시선을 다 먹는다</b>'], 'soft'),

    ('a', 'A안', '스펙 그대로 · 고딕', '보내주신 화면',
     ['초록이 <b>면이 아니라 안개</b> — 상단 470px 워시로만 깔린다',
      '헤드라인이 <b>카드 밖</b>, 워시 위에 직접 앉는다 (29px / 700)',
      '카드는 흰색 68% 반투명 + 흰 테두리 + 블러',
      '진한 초록은 <b>CTA 버튼과 글자에만</b>',
      '도착 알림도 띠가 아니라 <b>한 줄</b>로 — 면을 안 쓰기로 했으니까'],
     ['가장 가볍고 요즘 느낌. <b>글꼴이 고딕으로 바뀌는 게 유일한 문제</b>'], 'pick'),

    ('b', 'B안', '같은 레이아웃 · 명조 유지', '',
     ['레이아웃 · 색 · 워시 전부 A안과 같다',
      '글꼴만 지금 앱 그대로 <b>Hahmlet(명조)</b>',
      '다른 화면(연습기록 · 레슨기록 · 결과지)과 <b>이어진다</b>'],
     ['A안보다 <b>차분하고 고급스럽다</b>',
      '대신 스펙이 노린 "요즘 앱" 느낌은 덜하다'], 'alt'),

    ('c', 'C안', '고딕 · 워시 옅게 · 카드 진하게', '밝은 곳 안전판',
     ['워시 20% → <b>12%</b>, 높이 470 → <b>400px</b>',
      '카드 68% → <b>86%</b> 불투명',
      '햇빛 아래 · 저가 액정에서도 글자가 <b>확실히 읽힌다</b>'],
     ['가장 안전하지만 <b>글래스 느낌이 옅어진다</b>',
      'A안이 예쁘고 C안이 실용적이다'], 'alt'),
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

html = f'''<title>홈 · 글래스 워시 3안</title>
<style>
__FONTS__
:root{{--pg:#EFECE3;--ct:#16281E;--cs:#4A503F;--cs2:#7C857C;--bd:#E2DED2;--panel:#FCFBF7;
 --acc:#1D4534;--font-num:'Pretendard',-apple-system,sans-serif}}
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
.lede{{margin-top:12px;font-size:14px;color:var(--cs);max-width:840px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:700}}
.rules{{margin-top:22px;display:flex;gap:9px;flex-wrap:wrap;max-width:1060px}}
.rules span{{font-size:12px;background:var(--panel);border:1px solid var(--bd);border-radius:9px;
 padding:8px 12px;color:var(--cs)}}
.rules b{{color:var(--ct);font-weight:700}}
.row{{display:flex;gap:18px;margin-top:30px;align-items:flex-start;overflow-x:auto;
 padding-bottom:14px}}
.cell{{flex:0 0 372px;background:var(--panel);border:1px solid var(--bd);border-radius:16px;
 padding:18px 17px 20px}}
.cell.pick{{border-color:var(--acc);border-width:2px;padding:17px 16px 19px}}
.head{{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:14px}}
.nm{{font-size:17px;font-weight:700;letter-spacing:-.02em}}
.sub{{font-size:12px;color:var(--cs)}}
.tag{{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.03em;background:var(--acc);
 color:#fff;border-radius:6px;padding:4px 8px}}
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
.note{{margin-top:34px;background:var(--panel);border:1px solid var(--bd);border-radius:14px;
 padding:20px 22px;max-width:960px}}
.note h2{{font-size:14px;font-weight:700;margin-bottom:10px}}
.note h2+h2{{margin-top:18px}}
.note p{{font-size:13px;color:var(--cs);line-height:1.9}}
.note p+p{{margin-top:9px}}
.note b{{color:var(--ct);font-weight:700}}
code{{font-family:var(--font-num);font-size:11.5px;background:rgba(29,69,52,.09);
 border-radius:4px;padding:1px 5px}}
</style>
<div class="wrap">
  <h1>홈 · 글래스 워시 3안</h1>
  <p class="lede">받은 스펙을 그대로 구현했습니다. 핵심은 하나입니다 —
    <b>초록을 면으로 깔지 않는다.</b> 상단 470px에 안개처럼 얇게 깔고,
    진한 초록은 <b>CTA 버튼과 글자에만</b> 씁니다. 그래서 헤드라인이 카드 밖으로 나와
    워시 위에 직접 앉습니다.</p>
  <div class="rules">
    <span>배경 <code>#F5F3EC</code> 웜 아이보리</span>
    <span>워시 <code>rgba(29,69,52,.20)</code> → 투명 · 470px</span>
    <span>카드 <b>흰색 68%</b> + 흰 테두리 + blur(12px)</span>
    <span>CTA <code>rgba(29,69,52,.92)</code></span>
    <span>글자 <code>#16281E</code> / <code>#4A503F</code> / <code>#7C857C</code></span>
    <span>알림 뱃지 <code>#C0392B</code></span>
  </div>
  <div class="row">{cells}</div>
  <div class="note">
    <h2>고를 때 진짜 갈리는 건 글꼴입니다</h2>
    <p>스펙은 <b>Pretendard 800</b>인데 지금 앱 전체가 <b>Hahmlet(명조)</b>입니다.
      홈만 고딕으로 가면 <b>연습기록·레슨기록·결과지로 넘어가는 순간 딴 앱</b>이 됩니다.
      선택지는 둘입니다 — <b>A안을 고르고 앱 전체를 고딕으로 바꾸거나</b>,
      <b>B안으로 명조를 지키거나</b>. 홈만 고딕은 권하지 않습니다.</p>
    <p>참고로 넣어둔 Pretendard 서브셋에는 <b>800이 없어 700(Bold)</b>이 최대입니다.
      실제 앱에선 800을 쓸 수 있으니 지금 시안보다 <b>조금 더 굵어집니다</b>.</p>

    <h2>기술적으로 하나 짚습니다 — blur는 거의 일을 안 합니다</h2>
    <p><code>backdrop-filter: blur(12px)</code>는 <b>뒤에 흐려질 것이 있을 때</b> 효과가 납니다.
      지금 카드 뒤는 단색 아이보리 + 완만한 그라디언트뿐이라
      <b>흐려도 눈에 띄는 변화가 없습니다.</b> 이 화면의 유리 느낌은 사실
      <b>흰색 반투명이 초록 워시 위에 얹힌 것</b>에서 나옵니다.</p>
    <p>그런데 blur는 <b>공짜가 아닙니다.</b> 카드 8개에 걸면 저가 안드로이드에서
      스크롤이 눈에 띄게 버벅입니다. <b>탭바 하나만 남기고 카드에서는 빼는 걸</b> 권합니다.
      보기엔 똑같고 성능만 벌어요. (시안엔 스펙대로 넣어뒀습니다.)</p>

    <h2>남은 결정 두 개</h2>
    <p>· <b>피드백이 안 온 날</b> — 헤드라인 자리가 뭘 말할지. 한 달 중 29일입니다.
      제 제안은 프로가 계속 말을 거는 것:
      <code>이번 주 스윙 3개 봤어요. 목요일까지 하나 더 올려주시면 같이 볼게요</code></p>
    <p>· <b>이 팔레트를 홈에만 쓸지, 앱 전체에 쓸지</b> — 지금 앱 초록은
      <code>#21402F</code>, 스펙은 <code>#1D4534</code>로 조금 다릅니다.
      홈만 바꾸면 미묘하게 어긋나 보이니 <b>전체를 새 초록으로 통일</b>하는 게 맞습니다.</p>
  </div>
</div>'''

open(os.path.join(HERE, 'glass-board.html'), 'w', encoding='utf-8-sig').write(html)
print(f'{len(html)/1024:.0f} KB → glass-board.html (폰트 미포함)')
