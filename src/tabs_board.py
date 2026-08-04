# -*- coding: utf-8 -*-
"""레슨기록 탭 구조 3안 보드."""
import json, os
T = json.load(open('tabs-parts.json', encoding='utf-8'))
S = json.load(open('tabs-slotted.json', encoding='utf-8'))
fp = 'fonts-tabs.css' if os.path.exists('fonts-tabs.css') else 'fonts-final.css'
fonts = open(fp, encoding='utf-8').read()

GROUPS = [
    ('A', '레슨기록 [정규레슨 | 코멘트 | 스윙기록]', '형이 제안한 그대로',
     [('A_sw', '스윙기록 탭', '내 영상 — 세 번째 칸'),
      ('cm_tab_A', '코멘트 탭 · 새 화면', '프로가 남긴 말 전부 · 월별'),
      ('fb_A', '정규레슨 탭', 'C1 어두운 리포트 + C2 종류 라벨')],
     ['코멘트에 <b>집이 생긴다</b> — 지금은 흩어져서 몰아볼 수가 없다',
      '상단 세 칸이 곧 개념 지도다. 들어가자마자 셋이 다른 거라는 게 보인다',
      '<b>스윙기록은 프로가 준 게 아니다</b> — 내가 올린 영상인데 "레슨기록" 안에 들어간다',
      '연습기록 달력·그날하루와 겹친다 — 내 영상 보려면 어디로 가야 하나']),
    ('B', '레슨기록 [스윙기록 | 코멘트 | 정규레슨]', '순서만 뒤집기 · 내 것 → 프로 것',
     [('B_sw', '스윙기록 탭', '기본 진입이 내 영상')],
     ['왼쪽에서 오른쪽으로 <b>내 것 → 프로 것</b> 순서라 논리가 있다',
      '기본 진입이 내 영상이라 연습기록과의 연결이 자연스럽다',
      '탭 이름이 "레슨기록"인데 첫 칸이 레슨이 아니다 — 이름과 순서가 어긋난다',
      'A안과 나머지는 똑같다']),
    ('C', '레슨기록 [정규레슨 | 프로 한마디]', '2탭 · 스윙기록은 연습기록으로',
     [('cm_tab_C', '프로 한마디 탭', '2칸이라 글자가 넉넉하다'),
      ('fb_C', '정규레슨 탭', '')],
     ['<b>이름과 내용이 정확히 맞는다</b> — 레슨기록 = 프로가 준 것만',
      '칸이 둘이라 글자·배지가 안 답답하다',
      '스윙기록 화면이 갈 곳이 필요하다 — 연습기록에 "전체 영상" 입구를 새로 파야 함',
      '지금 스윙기록의 날짜별 그룹 뷰가 사라진다']),
]

rows = ''
for tag, title, sub, phones, notes in GROUPS:
    cells = ''.join(
        f'<div class="cell"><div class="plab">{nm}</div><div class="psub">{d}</div>'
        f'<div class="phone">{S.get(k) or T[k]}</div></div>' for k, nm, d in phones)
    bl = ''.join(f'<li class="{"pro" if i < 2 else "con"}">{x}</li>' for i, x in enumerate(notes))
    rows += f'''<section class="row"><div class="rhead"><div class="rno">{tag}</div>
      <div class="rmeta"><h2>{title}</h2><div class="rtag">{sub}</div>
        <ul class="rlist">{bl}</ul></div></div>
      <div class="rail">{cells}</div></section>'''

html = f'''<style>
{fonts}
:root{{ --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2; --panel:#FFFDF9;
  --acc:#21402F; --soft:#F2F8F4; --br:#A67C3D;
  --font-base:Hahmlet,serif; --font-num:Pretendard,-apple-system,sans-serif; }}
@media (prefers-color-scheme:dark){{ :root{{ --pg:#191A17; --ct:#EDEAE3; --cs:#A39C8C; --cs2:#8A8375;
  --bd:#33342D; --panel:#22231F; --acc:#8FBFA3; --soft:#233026; --br:#D2A868; }} }}
:root[data-theme="dark"]{{ --pg:#191A17; --ct:#EDEAE3; --cs:#A39C8C; --cs2:#8A8375; --bd:#33342D;
  --panel:#22231F; --acc:#8FBFA3; --soft:#233026; --br:#D2A868; }}
:root[data-theme="light"]{{ --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2;
  --panel:#FFFDF9; --acc:#21402F; --soft:#F2F8F4; --br:#A67C3D; }}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:var(--font-base);background:var(--pg);color:var(--ct);
  -webkit-font-smoothing:antialiased;line-height:1.7}}
.wrap{{max-width:1500px;margin:0 auto;padding:44px 24px 90px}}
header.top{{max-width:720px}}
.eyebrow{{font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--cs2);
  font-family:var(--font-num);margin-bottom:12px}}
h1{{font-size:30px;font-weight:400;letter-spacing:-.035em;line-height:1.34;text-wrap:balance}}
h1 b{{font-weight:600}}
.lede{{font-size:14px;color:var(--cs);margin-top:14px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}
.row{{margin-top:50px;padding-top:32px;border-top:1px solid var(--bd)}}
.rhead{{display:flex;gap:18px;align-items:flex-start;max-width:980px;margin-bottom:22px}}
.rno{{flex:none;width:44px;height:44px;border-radius:12px;background:var(--acc);color:var(--pg);
  display:flex;align-items:center;justify-content:center;font-family:var(--font-num);
  font-size:17px;font-weight:700}}
h2{{font-size:19px;font-weight:600;letter-spacing:-.03em}}
.rtag{{font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--cs2);
  font-family:var(--font-num);margin-top:4px}}
.rlist{{list-style:none;margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(230px,1fr));
  gap:6px 22px;max-width:860px}}
.rlist li{{position:relative;padding-left:16px;font-size:12px;color:var(--cs);line-height:1.7}}
.rlist li::before{{position:absolute;left:0;top:0;font-family:var(--font-num);font-weight:700;font-size:12px}}
.rlist .pro::before{{content:"+";color:var(--acc)}}
.rlist .con::before{{content:"−";color:var(--br)}}
.rlist b{{color:var(--ct);font-weight:600}}
.rail{{display:flex;gap:22px;overflow-x:auto;padding:4px 2px 16px}}
.cell{{flex:none;width:360px}}
.plab{{font-size:12.5px;font-weight:600;padding:0 2px 2px}}
.psub{{font-size:11.5px;color:var(--cs);padding:0 2px 11px;min-height:20px}}
.phone{{display:flex;justify-content:center}}
.asks{{margin-top:52px;max-width:940px;background:var(--panel);border:1px solid var(--bd);
  border-radius:16px;padding:22px 24px}}
.asks h2{{margin-bottom:8px}}
.asks p{{font-size:13px;color:var(--cs);line-height:1.85}}
.asks p b{{color:var(--ct);font-weight:600}}
@media (max-width:760px){{ .wrap{{padding:28px 14px 60px}} h1{{font-size:24px}}
  .rlist{{grid-template-columns:1fr}} }}
</style>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">NEXT SWING · 레슨기록 탭 구조 3안</div>
    <h1>코멘트에 <b>집을 주는 건 맞다</b>. 스윙기록을 같이 넣느냐가 갈린다</h1>
    <p class="lede">제안대로 만들어봤다(A). 걸리는 건 하나 —
      <b>스윙기록은 프로가 준 게 아니라 내가 올린 영상</b>이다.
      "레슨기록" 안에 들어가면 이름과 내용이 어긋나고, 연습기록 달력과도 겹친다.
      순서만 바꾼 B, 아예 빼는 C도 같이 놨다. <b>코멘트 탭은 셋 다 새로 만든 화면</b>이다.</p>
  </header>
  {rows}
  <div class="asks">
    <h2>내 추천은 A — 단, 이름을 하나 더 바꾸면</h2>
    <p>코멘트 탭이 주는 값이 크다. "프로가 나한테 해준 말 24개"를 쭉 보는 화면은 지금 없고,
      만들면 <b>구독을 계속할 이유</b>가 눈에 보인다. 스윙기록이 같이 있는 것도,
      <b>탭 이름을 <code>레슨</code> 대신 <code>기록</code></b> 정도로 두면 어긋남이 사라진다 —
      "기록 [정규레슨 | 한마디 | 스윙]". C는 깔끔하지만 지금 스윙기록 화면이 갈 곳을 새로 파야 한다.</p>
  </div>
</div>'''
open('tabs-concept.html', 'w', encoding='utf-8-sig').write(html)
print(f'{os.path.getsize("tabs-concept.html")/1024:.0f} KB → tabs-concept.html')
