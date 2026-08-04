# -*- coding: utf-8 -*-
"""최종안 보드 — 고른 것들을 합치고, 검은 예고 카드를 고친 결과."""
import json, os
import final_parts as F

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'final-slotted.json'), encoding='utf-8'))
fonts = open(os.path.join(HERE, 'fonts-final.css'
             if os.path.exists(os.path.join(HERE, 'fonts-final.css')) else 'fonts-concepts.css'),
             encoding='utf-8').read()

PHONES = [
    ('home_arr', '홈 · 리포트 온 날', '상단 알림 + 중단 최근 한마디 + 어두운 리포트'),
    ('home_wait', '홈 · 아직 안 온 날', '스트립 없음 + 밝은 예고 카드'),
    ('practice', '연습기록', '말풍선 + 밝은 예고'),
    ('swings', '스윙기록', '도착 알림 + 말풍선 배지'),
    ('lessons', '정규레슨', '밝은 예고 + 서가 + 받은 목록'),
]
cells = ''.join(
    f'<div class="cell"><div class="plab">{nm}</div><div class="psub">{sub}</div>'
    f'<div class="phone">{S[k]}</div></div>' for k, nm, sub in PHONES)

fix = f'''<div class="fixrow">
  <div class="fixcell bad"><div class="ftag">지금 — 뜬금없던 것</div>
    <div class="fbox">{F.PARTS['old_next_issue']}</div>
    <ul><li>아직 <b>안 온 것</b>인데 도착한 리포트급 검정</li>
        <li><code>NEXT ISSUE</code> 영문 대문자가 앱 어디에도 없다</li>
        <li>이번주 연습기록(내 활동) 밑에 갑자기 검은 덩어리</li></ul></div>
  <div class="fixcell good"><div class="ftag">고친 것 — 예고는 밝게</div>
    <div class="fbox">{F.PARTS['f_up']}</div>
    <ul><li>흰 카드 + 초록 아이콘·진행바 = <b>피드백 계열이지만 아직 안 옴</b></li>
        <li><code>다음 리포트 · 8월호</code> 한글로</li>
        <li>주변 카드와 무게가 맞는다</li></ul></div>
  <div class="fixcell good"><div class="ftag">도착하면 — 그때 어두워진다</div>
    <div class="fbox">{F.PARTS['f_report']}</div>
    <ul><li>어두운 카드는 <b>앱에서 여기 하나뿐</b></li>
        <li>그래서 검정 = "진짜 리포트가 왔다" 가 성립</li>
        <li>동시에 상단에 초록 알림 스트립이 뜬다</li></ul></div>
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
.wrap{{max-width:1900px;margin:0 auto;padding:44px 24px 90px}}
header.top{{max-width:720px}}
.eyebrow{{font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--cs2);
  font-family:var(--font-num);margin-bottom:12px}}
h1{{font-size:31px;font-weight:400;letter-spacing:-.035em;line-height:1.34;text-wrap:balance}}
h1 b{{font-weight:600}}
.lede{{font-size:14px;color:var(--cs);margin-top:14px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}
.rule{{margin:26px 0 6px;max-width:720px;border:1px solid var(--bd);border-radius:13px;
  background:var(--panel);overflow:hidden}}
.rule div{{display:flex;gap:14px;padding:12px 16px;border-top:1px solid var(--bd);font-size:12.5px;
  align-items:baseline}}
.rule div:first-child{{border-top:none}}
.rule b{{flex:none;width:74px;font-weight:600;font-size:11.5px}}
.rule span{{flex:1;color:var(--cs)}}
h2{{font-size:20px;font-weight:600;letter-spacing:-.03em;margin-bottom:6px}}
.sub{{font-size:13px;color:var(--cs);margin-bottom:22px;max-width:680px;line-height:1.85}}
.sub b{{color:var(--ct);font-weight:600}}
.sec{{margin-top:54px;padding-top:34px;border-top:1px solid var(--bd)}}
.rail{{display:flex;gap:22px;overflow-x:auto;padding:4px 2px 16px}}
.cell{{flex:none;width:360px}}
.plab{{font-size:12.5px;font-weight:600;letter-spacing:-.01em;padding:0 2px 2px}}
.psub{{font-size:11.5px;color:var(--cs);padding:0 2px 11px}}
.phone{{display:flex;justify-content:center}}
.fixrow{{display:flex;gap:20px;overflow-x:auto;padding:2px 2px 10px}}
.fixcell{{flex:none;width:340px}}
.ftag{{font-size:11px;font-weight:700;letter-spacing:.06em;font-family:var(--font-num);
  border-radius:6px;padding:4px 9px;display:inline-block;margin-bottom:11px}}
.bad .ftag{{background:rgba(166,124,61,.16);color:var(--br)}}
.good .ftag{{background:var(--soft);color:var(--acc)}}
.fbox{{background:#F3EFE8;border:1px solid var(--bd);border-radius:14px;padding:14px}}
.fixcell ul{{list-style:none;margin-top:13px;display:flex;flex-direction:column;gap:7px}}
.fixcell li{{position:relative;padding-left:14px;font-size:12px;color:var(--cs);line-height:1.7}}
.fixcell li::before{{content:"";position:absolute;left:0;top:9px;width:4px;height:4px;border-radius:50%;
  background:var(--cs2)}}
.fixcell b{{color:var(--ct);font-weight:600}}
code{{font-family:var(--font-num);font-size:11px;background:var(--panel);border:1px solid var(--bd);
  border-radius:4px;padding:1px 5px}}
.asks{{margin-top:52px;max-width:940px;background:var(--panel);border:1px solid var(--bd);
  border-radius:16px;padding:22px 24px}}
.asks p{{font-size:13px;color:var(--cs);line-height:1.85}}
.asks p b{{color:var(--ct);font-weight:600}}
.asks ol{{padding-left:19px;display:flex;flex-direction:column;gap:11px;margin-top:13px}}
.asks li{{font-size:13px;color:var(--cs);line-height:1.8}}
.asks li b{{color:var(--ct);font-weight:600}}
@media (max-width:760px){{ .wrap{{padding:28px 14px 60px}} h1{{font-size:24px}} }}
</style>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">NEXT SWING · 피드백 ↔ 한마디 · 최종안</div>
    <h1>어두운 카드는 <b>도착한 리포트에만</b></h1>
    <p class="lede">고른 것들을 합쳤다. 검은 <code>NEXT ISSUE</code> 카드가 뜬금없었던 건 자리가 아니라
      <b>무게</b> 문제였다 — 아직 안 온 예고를 도착한 리포트와 같은 검정으로 그렸으니까.
      규칙을 하나로 잡으니 나머지가 다 풀린다.</p>
  </header>

  <div class="rule">
    <div><b>도착</b><span>상단 초록 스트립(알림) <b>+</b> 본문에 어두운 리포트 카드</span></div>
    <div><b>대기</b><span>스트립 없음 <b>+</b> 밝은 예고 카드 (초록 아이콘·진행바만)</span></div>
    <div><b>한마디</b><span>말풍선 · 영상 옆에 / 홈 중단엔 최근 타임라인</span></div>
  </div>
  <p class="sub" style="margin-top:14px">스트립이 <b>도착했을 때만</b> 뜨니까,
    C3에서 걸렸던 "스트립이 늘 화면 위를 먹는다"는 문제도 같이 사라진다.</p>

  <div class="sec">
    <h2>화면 5장</h2>
    <div class="sub">홈은 <b>온 날 / 안 온 날</b> 두 장이다 — 그 차이가 이번 설계의 전부라서.</div>
    <div class="rail">{cells}</div>
  </div>

  <div class="sec">
    <h2>검은 카드, 뭐가 문제였고 어떻게 고쳤나</h2>
    <div class="sub">형이 짚은 그 자리다. 카드 셋을 나란히 놓으면 이유가 보인다.</div>
    {fix}
  </div>

  <div class="asks">
    <p><b>이대로 가면 프로토타입에 그대로 이식된다.</b> 시안을 실제 화면 위에서 수술해 만들었으니
      고친 부분이 곧 구현 절차다.</p>
    <ol>
      <li><b>이름</b> — 캡션은 <code>프로 한마디</code>로 바꿔 놨다. 카드 안 본문까지 다 바꿀까?</li>
      <li><b>서가</b> — 정규레슨 탭에만 넣었다. 홈에도 넣으면 스크롤이 더 길어지는데, 넣을까?</li>
      <li><b>알림 스트립</b> — 지금은 누르면 리포트로 간다. 닫기(X)도 달까?</li>
    </ol>
  </div>
</div>'''

out = os.path.join(HERE, 'final-concept.html')
open(out, 'w', encoding='utf-8-sig').write(html)
print(f'{os.path.getsize(out)/1024:.0f} KB → final-concept.html')
