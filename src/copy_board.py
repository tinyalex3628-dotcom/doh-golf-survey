# -*- coding: utf-8 -*-
"""홈 문구 3안 (레이아웃은 A안 확정)."""
import json, os
import glass_home as G
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'copy-slotted.json'), encoding='utf-8'))

CARDS = [
    ('v1', G.COPY[0][0], [
        '탭하기 <b>전에</b> 내 스윙에 대해 알려주는 유일한 안',
        '리포트 제목을 그대로 제목으로 — 홈이 <b>리포트의 예고편</b>이 된다',
        '"뭐가 왔는지"는 위의 <code>● 오늘 도착 · 정기 피드백 No.06</code> 줄이 담당'],
     ['제목이 매달 바뀐다 — 프로가 리포트 제목을 쓰면 <b>홈이 자동으로 갱신</b>된다',
      '가장 골프 앱답다'], 'pick'),

    ('v2', G.COPY[1][0], [
        '이름으로 부르고, 프로가 <b>한 일</b>을 말한다',
        '"다 봤어요"가 <b>노동을 증명</b>한다',
        '리포트 내용과 무관하게 <b>항상 쓸 수 있다</b>'],
     ['따뜻하지만 <b>내 스윙 얘기는 아직 없다</b>',
      '문구를 매달 안 고쳐도 되는 게 장점'], 'alt'),

    ('v3', G.COPY[2][0], [
        '사실만. 넘겨짚지 않는다',
        '가장 안전하고 <b>가장 밋밋하다</b>'],
     ['이 정도면 <b>알림 문구</b>지 홈 제목은 아니다',
      '29px을 쓸 이유가 없어진다'], 'soft'),
]

cells = ''
for k, nm, pts, verdict, tone in CARDS:
    lis = ''.join(f'<li>{p}</li>' for p in pts)
    vs = ''.join(f'<li>{v}</li>' for v in verdict)
    cells += f'''<div class="cell {tone}">
      <div class="head"><span class="nm">{nm}</span></div>
      <div class="phone">{S[k]}</div>
      <ul class="pts">{lis}</ul>
      <div class="verdict"><b>판단</b><ul>{vs}</ul></div>
    </div>'''

html = f'''<title>홈 문구 3안</title>
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
.wrap{{max-width:1400px;margin:0 auto;padding:40px 22px 80px}}
h1{{font-size:26px;font-weight:700;letter-spacing:-.03em}}
.lede{{margin-top:12px;font-size:14px;color:var(--cs);max-width:860px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:700}}
.row{{display:flex;gap:18px;margin-top:30px;align-items:flex-start;overflow-x:auto;
 padding-bottom:14px}}
.cell{{flex:0 0 372px;background:var(--panel);border:1px solid var(--bd);border-radius:16px;
 padding:18px 17px 20px}}
.cell.pick{{border-color:var(--acc);border-width:2px;padding:17px 16px 19px}}
.head{{margin-bottom:14px}}
.nm{{font-size:15px;font-weight:700;letter-spacing:-.02em}}
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
code{{font-size:11.5px;background:rgba(29,69,52,.09);border-radius:4px;padding:1px 5px}}
.note{{margin-top:32px;background:var(--panel);border:1px solid var(--bd);border-radius:14px;
 padding:20px 22px;max-width:900px}}
.note h2{{font-size:14px;font-weight:700;margin-bottom:10px}}
.note p{{font-size:13px;color:var(--cs);line-height:1.9}}
.note p+p{{margin-top:9px}}
.note b{{color:var(--ct);font-weight:700}}
</style>
<div class="wrap">
  <h1>홈 문구 3안</h1>
  <p class="lede">레이아웃은 <b>A안 확정</b>. 문구만 비교합니다.
    기존 <b>"기다리던 게 왔어요"</b>의 문제는 두 가지였습니다 —
    <b>기다렸다고 넘겨짚고</b>, 정작 <b>뭐가 왔는지는 안 말합니다.</b>
    제목이 할 일은 하나입니다. 탭하기 전에 <b>내 스윙에 대해 뭔가를 알려주는 것.</b></p>
  <div class="row">{cells}</div>
  <div class="note">
    <h2>영상 길이 하나로 고쳤습니다</h2>
    <p>말씀대로 <code>분석 영상 12:24</code> / <code>음성 코멘트 0:32</code>는 성립이 안 됩니다.
      프로가 <b>목소리를 얹어 녹화한 한 파일</b>이라 길이가 따로 있을 수 없어요.
      재생 아이콘 + <b>12:24</b> 하나만 남기고, 초록 틴트 칩으로 감싸 눈에 걸리게 했습니다.</p>
    <h2>제 추천은 ①입니다</h2>
    <p>세 안 중 <b>내 골프 얘기를 하는 건 ①뿐</b>입니다. ②는 프로가 한 일을,
      ③은 앱이 한 일을 말합니다. 그리고 ①은 <b>프로가 리포트 제목을 쓰면 홈이 자동으로 갱신</b>돼서
      매달 문구를 따로 만들 필요가 없습니다.</p>
    <p>다만 ②는 <b>리포트 내용과 무관하게 항상 성립</b>합니다.
      운영이 편한 쪽을 원하시면 ②도 충분히 좋습니다.</p>
  </div>
</div>'''
open(os.path.join(HERE, 'copy-board.html'), 'w', encoding='utf-8-sig').write(html)
print(f'{len(html)/1024:.0f} KB → copy-board.html')
