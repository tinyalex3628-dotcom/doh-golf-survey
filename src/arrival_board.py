# -*- coding: utf-8 -*-
"""도착 알림 3안 비교 보드."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'arrival-slotted.json'), encoding='utf-8'))
fonts = open(os.path.join(HERE, 'fonts-final.css'), encoding='utf-8').read()
patch = open(os.path.join(HERE, 'font-patch.css'), encoding='utf-8').read()

CARDS = [
    ('now', '지금', '얇은 초록 띠', '없음',
     ['화면 높이의 <b>7%</b>만 차지한다', '스크롤하면 바로 안 보인다',
      '광고 배너와 생김새가 같아서 눈이 건너뛴다'],
     ['월 1회짜리 소식인데 <b>지나칠 수 있다</b>'], 'bad'),
    ('a', 'A안', '배경 흐림 + 센터 카드', '중간',
     ['홈이 뒤에 <b>흐리게 비쳐서</b> 어디에 있는지는 안다',
      '리포트 표지를 그대로 축소해 얹었다 — 뭐가 왔는지 한눈에',
      '<code>나중에 볼게요</code>로 빠져나갈 수 있다'],
     ['가장 무난하다', '앱을 벗어나지 않으면서도 확실히 막는다'], 'pick'),
    ('b', 'B안', '전체 화면 개봉', '강함',
     ['앱을 <b>통째로</b> 덮는다 — 홈이 아예 안 보인다',
      '봉투 + 어두운 배경으로 "특별한 것이 왔다"를 만든다',
      '<code>MONTHLY FEEDBACK</code> 큰 제목으로 격을 세운다'],
     ['월 1회니까 <b>이 정도 해도 된다</b>',
      '다만 급할 때 열었으면 성가시게 느낄 수 있다'], 'strong'),
    ('c', 'C안', '홈 상단 히어로', '약함',
     ['<b>막지 않는다</b> — 홈 맨 위를 크게 차지할 뿐',
      '스크롤하면 지나가지만, 첫 화면에선 절반을 먹는다',
      '탭 이동에 방해가 없다'],
     ['가장 덜 거슬린다',
      '아래 <code>진단받기</code> 카드와 <b>초록이 두 번</b> 겹쳐 무겁다'], 'soft'),
]

cells = ''
for k, nm, sub, force, pts, verdict, tone in CARDS:
    lis = ''.join(f'<li>{p}</li>' for p in pts)
    vs = ''.join(f'<li>{v}</li>' for v in verdict)
    cells += f'''<div class="cell {tone}">
      <div class="head"><span class="nm">{nm}</span><span class="sub">{sub}</span>
        <span class="force f-{tone}">막는 힘 · {force}</span></div>
      <div class="phone">{S[k]}</div>
      <ul class="pts">{lis}</ul>
      <div class="verdict"><b>판단</b><ul>{vs}</ul></div>
    </div>'''

html = f'''<title>도착 알림 3안</title>
<style>
{fonts}{patch}
:root{{--pg:#EDEAE3;--ct:#1D2420;--cs:#6E6858;--cs2:#8A8375;--bd:#E4DED2;--panel:#FFFDF9;
 --acc:#21402F;--br:#A67C3D;--font-num:Pretendard,-apple-system,sans-serif}}
@media (prefers-color-scheme:dark){{:root{{--pg:#191A17;--ct:#EDEAE3;--cs:#A39C8C;--cs2:#8A8375;
 --bd:#33342D;--panel:#22231F;--acc:#8FBFA3;--br:#D2A868}}}}
:root[data-theme="dark"]{{--pg:#191A17;--ct:#EDEAE3;--cs:#A39C8C;--cs2:#8A8375;--bd:#33342D;
 --panel:#22231F;--acc:#8FBFA3;--br:#D2A868}}
:root[data-theme="light"]{{--pg:#EDEAE3;--ct:#1D2420;--cs:#6E6858;--cs2:#8A8375;--bd:#E4DED2;
 --panel:#FFFDF9;--acc:#21402F;--br:#A67C3D}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Hahmlet,serif;background:var(--pg);color:var(--ct);
 -webkit-font-smoothing:antialiased;line-height:1.75}}
.wrap{{max-width:1720px;margin:0 auto;padding:40px 22px 80px}}
h1{{font-size:26px;font-weight:400;letter-spacing:-.02em}}
.lede{{margin-top:12px;font-size:14px;color:var(--cs);max-width:760px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}
.row{{display:flex;gap:18px;margin-top:34px;align-items:flex-start;
 overflow-x:auto;padding-bottom:14px}}
.cell{{flex:0 0 372px;background:var(--panel);border:1px solid var(--bd);border-radius:16px;
 padding:18px 17px 20px}}
.cell.pick{{border-color:var(--acc);border-width:2px;padding:17px 16px 19px}}
.head{{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:14px}}
.nm{{font-size:17px;font-weight:600;letter-spacing:-.02em}}
.sub{{font-size:12px;color:var(--cs)}}
.force{{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.06em;border-radius:6px;
 padding:4px 8px;font-family:var(--font-num)}}
.f-bad{{background:rgba(166,124,61,.14);color:var(--br)}}
.f-soft{{background:rgba(110,104,88,.13);color:var(--cs)}}
.f-pick{{background:var(--acc);color:#fff}}
.f-strong{{background:#1D2420;color:#EDEAE3}}
.phone{{display:flex;justify-content:center;background:var(--pg);border-radius:13px;padding:16px 0;
 border:1px solid var(--bd)}}
.phone>div{{transform:scale(.9);transform-origin:top center;margin-bottom:-74px}}
.pts{{margin:16px 0 0;padding-left:17px;font-size:12.5px;color:var(--cs);line-height:1.85}}
.pts li{{margin-bottom:5px}}
.pts b{{color:var(--ct);font-weight:600}}
code{{font-family:var(--font-num);font-size:11.5px;background:rgba(110,104,88,.12);
 border-radius:4px;padding:1px 5px}}
.verdict{{margin-top:15px;padding-top:13px;border-top:1px solid var(--bd)}}
.verdict>b{{font-size:9.5px;font-weight:700;letter-spacing:.18em;color:var(--cs2);
 font-family:var(--font-num)}}
.verdict ul{{margin:7px 0 0;padding-left:17px;font-size:12.5px;line-height:1.8}}
.verdict b{{font-weight:600}}
.note{{margin-top:36px;background:var(--panel);border:1px solid var(--bd);border-radius:14px;
 padding:20px 22px;max-width:900px}}
.note h2{{font-size:14px;font-weight:600;letter-spacing:-.01em;margin-bottom:10px}}
.note p{{font-size:13px;color:var(--cs);line-height:1.9}}
.note p+p{{margin-top:10px}}
.note b{{color:var(--ct);font-weight:600}}
</style>
<div class="wrap">
  <h1>정기 피드백 도착 — 어떻게 알릴까</h1>
  <p class="lede">지금은 얇은 초록 띠 하나뿐이라 <b>광고 배너처럼 읽히고 그냥 지나칩니다.</b>
    정기 피드백은 Elite가 <b>한 달에 딱 한 번</b> 받는 것이고, 프로가 직접 만드는 가장 비싼 결과물입니다.
    한 달에 한 번이면 화면을 잠깐 막아도 됩니다 — 안 막으면 무슨 일이 있었는지 모르고 넘어갑니다.
    세 안은 <b>얼마나 세게 막느냐</b>로 나뉩니다.</p>
  <div class="row">{cells}</div>
  <div class="note">
    <h2>공통으로 지킨 것</h2>
    <p>· 세 안 모두 <b>리포트 표지를 그대로 축소</b>해서 넣었습니다.
      <code>No.06</code> · 제목 · Before/After · 프로 이름까지요.
      "뭔가 왔다"가 아니라 <b>"무엇이 왔는지"</b>가 보여야 열어봅니다.</p>
    <p>· <b>얇은 초록 띠는 셋 다 치웠습니다.</b> 역할이 겹치면 둘 다 약해집니다.
      단, 닫은 뒤에는 띠가 다시 뜨는 게 맞습니다 — 놓친 사람을 위한 안전망이니까요.</p>
    <p>· 어두운 색은 이 앱에서 <b>"도착한 리포트"에만</b> 쓰기로 한 규칙을 그대로 따랐습니다.
      그래서 B안의 검정 화면이 곧 "리포트가 왔다"로 읽힙니다.</p>
    <p>· <b>월 1회에만</b> 뜹니다. 프로 한마디(월 6회)는 지금처럼 조용히 옵니다.
      이걸 자주 띄우면 다음 달 리포트가 왔을 때 안 열어봅니다.</p>
  </div>
</div>'''

open(os.path.join(HERE, 'arrival-board.html'), 'w', encoding='utf-8-sig').write(html)
print(f'{len(html)/1024:.0f} KB → arrival-board.html')
