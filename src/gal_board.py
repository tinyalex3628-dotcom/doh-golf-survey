# -*- coding: utf-8 -*-
"""스윙 갤러리 + 레슨기록 2탭 — '코멘트는 스윙에 붙어있다' 를 어떻게 지킬 것인가."""
import json, os
G = json.load(open('gal-slotted.json', encoding='utf-8'))
T = json.load(open('tabs-parts.json', encoding='utf-8'))
S = json.load(open('screens-v3.json', encoding='utf-8'))
pc1 = {x['id']: x for x in S}['pc1']['html']
fp = 'fonts-gal.css' if os.path.exists('fonts-gal.css') else 'fonts-tabs.css'
fonts = open(fp, encoding='utf-8').read()

FLOW = [
    (G['gal_swing'], '① 스윙 갤러리', '전체 12 · 한마디 8 필터 · 썸네일에 한마디 표식'),
    (pc1, '② 스윙 상세 — <b>이미 있는 화면</b>', '영상 + 내 기록 + 그때 그 한마디 + 답글'),
    (T['cm_tab_C'], '③ 레슨기록 · 프로 한마디', '같은 코멘트를 "말" 기준으로 모아보기'),
    (G['lesson_fb'], '④ 레슨기록 · 정규레슨', '밝은 예고 + 받은 리포트'),
]
cells = ''.join(
    f'<div class="cell"><div class="plab">{nm}</div><div class="psub">{d}</div>'
    f'<div class="phone">{h}</div></div>' for h, nm, d in FLOW)

navs = f'''<div class="fixrow">
  <div class="fixcell"><div class="ftag">(가) 하단 탭 그대로</div>
    <div class="navbox">{T['bottom']}</div>
    <ul><li>홈 · 연습기록 · <b>레슨기록</b> · 스윙분석 · 마이</li>
        <li>갤러리는 <b>스윙분석 → 허브 → 갤러리</b> 로 두 단계 안쪽</li>
        <li>하단 탭을 안 건드려도 된다</li></ul></div>
  <div class="fixcell"><div class="ftag good">(나) 스윙분석 → 스윙</div>
    <div class="navbox">{json.load(open('gal-parts.json', encoding='utf-8'))['nav_swing_gal']}</div>
    <ul><li>홈 · 연습기록 · <b>스윙</b> · <b>레슨기록</b> · 마이</li>
        <li><b>갤러리가 그 탭의 첫 화면</b> — 한 번에 닿는다</li>
        <li>분석 도구(AI · 직접분석 · 프로비교)는 그 안으로</li>
        <li>하단에서 <b>내가 한 것 / 프로가 준 것</b>이 갈린다</li></ul></div>
</div>'''

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
.wrap{{max-width:1620px;margin:0 auto;padding:44px 24px 90px}}
header.top{{max-width:740px}}
.eyebrow{{font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--cs2);
  font-family:var(--font-num);margin-bottom:12px}}
h1{{font-size:30px;font-weight:400;letter-spacing:-.035em;line-height:1.34;text-wrap:balance}}
h1 b{{font-weight:600}}
.lede{{font-size:14px;color:var(--cs);margin-top:14px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}
.key{{margin:24px 0 4px;max-width:740px;border:1px solid var(--bd);border-radius:13px;
  background:var(--panel);padding:16px 18px}}
.key p{{font-size:13px;color:var(--cs);line-height:1.85}}
.key b{{color:var(--ct);font-weight:600}}
h2{{font-size:19px;font-weight:600;letter-spacing:-.03em;margin-bottom:6px}}
.sub{{font-size:13px;color:var(--cs);margin-bottom:22px;max-width:700px;line-height:1.85}}
.sub b{{color:var(--ct);font-weight:600}}
.sec{{margin-top:52px;padding-top:32px;border-top:1px solid var(--bd)}}
.rail{{display:flex;gap:22px;overflow-x:auto;padding:4px 2px 16px}}
.cell{{flex:none;width:360px}}
.plab{{font-size:12.5px;font-weight:600;padding:0 2px 2px}}
.psub{{font-size:11.5px;color:var(--cs);padding:0 2px 11px;min-height:20px}}
.phone{{display:flex;justify-content:center}}
.fixrow{{display:flex;gap:22px;overflow-x:auto;padding:2px 2px 10px;flex-wrap:wrap}}
.fixcell{{flex:none;width:380px}}
.ftag{{font-size:11px;font-weight:700;letter-spacing:.06em;font-family:var(--font-num);
  border-radius:6px;padding:4px 9px;display:inline-block;margin-bottom:11px;
  background:var(--bd);color:var(--cs)}}
.ftag.good{{background:var(--soft);color:var(--acc)}}
.navbox{{background:#F3EFE8;border:1px solid var(--bd);border-radius:14px;padding:12px;overflow:hidden}}
.navbox > div{{width:360px;max-width:100%}}
.fixcell ul{{list-style:none;margin-top:13px;display:flex;flex-direction:column;gap:7px}}
.fixcell li{{position:relative;padding-left:14px;font-size:12px;color:var(--cs);line-height:1.7}}
.fixcell li::before{{content:"";position:absolute;left:0;top:9px;width:4px;height:4px;border-radius:50%;
  background:var(--cs2)}}
.fixcell b{{color:var(--ct);font-weight:600}}
.asks{{margin-top:52px;max-width:940px;background:var(--panel);border:1px solid var(--bd);
  border-radius:16px;padding:22px 24px}}
.asks p{{font-size:13px;color:var(--cs);line-height:1.85}}
.asks p b{{color:var(--ct);font-weight:600}}
@media (max-width:760px){{ .wrap{{padding:28px 14px 60px}} h1{{font-size:24px}} }}
</style>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">NEXT SWING · 갤러리와 코멘트</div>
    <h1>"과거 스윙 + 그때 코멘트" 페이지는 <b>이미 있다</b></h1>
    <p class="lede">새로 팔 필요가 없다. 지금 프로토타입의 <b>프로 코멘트 화면(pc1)</b>이 정확히 그거다 —
      그날 영상 + 내가 남긴 기록 + 그때 프로가 한 말 + 답글까지.
      없는 건 <b>거기로 들어가는 갤러리</b>뿐이다.</p>
  </header>

  <div class="key">
    <p><b>코멘트는 스윙에 붙어 있다</b> — 맞다. 그래서 떼지 않는다.
      대신 <b>같은 코멘트를 두 방향에서 본다.</b><br>
      · <b>스윙 기준</b>으로 보고 싶으면 → 갤러리에서 썸네일 누르면 그 스윙 + 그때 코멘트<br>
      · <b>말 기준</b>으로 몰아보고 싶으면 → 레슨기록 · 프로 한마디 탭 (각 줄에 썸네일이 붙어 있어 맥락 유지)<br>
      하나의 데이터, 두 개의 입구. 분리가 아니라 <b>정렬 방식</b>이 다른 거다.</p>
  </div>

  <div class="sec">
    <h2>네 화면이 한 줄로 이어진다</h2>
    <div class="sub">갤러리 → 스윙 상세는 <b>썸네일 하나 누르면 끝</b>이다. ②는 지금 프로토타입에 있는 그 화면 그대로.</div>
    <div class="rail">{cells}</div>
  </div>

  <div class="sec">
    <h2>그럼 갤러리를 어디에 두나</h2>
    <div class="sub">지금 갤러리는 <b>스윙분석 → 허브 → 갤러리</b>로 두 단계 안쪽에 있다.
      "과거 스윙 모아보기"가 중요하면 한 번에 닿아야 한다.</div>
    {navs}
  </div>

  <div class="asks">
    <p><b>내 추천은 (나)</b>. 하단이 이렇게 갈린다 —
      <b>스윙</b>(내가 올리고 분석한 것) / <b>레슨기록</b>(프로가 준 것).
      지금 <code>스윙분석</code>이라는 이름은 도구 이름이지 내용 이름이 아니라서,
      갤러리·분석도구를 다 품는 <code>스윙</code>이 더 맞다.
      레슨기록은 형이 말한 대로 <b>정규레슨 · 프로 한마디 2탭</b>으로 두면
      이름과 내용이 정확히 맞아떨어진다.</p>
  </div>
</div>'''
open('gallery-concept.html', 'w', encoding='utf-8-sig').write(html)
print(f'{os.path.getsize("gallery-concept.html")/1024:.0f} KB → gallery-concept.html')
