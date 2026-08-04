# -*- coding: utf-8 -*-
"""홈 3안 비교 보드."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'home-slotted.json'), encoding='utf-8'))
fonts = open(os.path.join(HERE, 'fonts-final.css'), encoding='utf-8').read()
patch = open(os.path.join(HERE, 'font-patch.css'), encoding='utf-8').read()

CARDS = [
    ('now', '지금', '카드 6개 · 균등한 무게', '',
     ['제일 큰 카드가 <code>프로에게 스윙 진단받기</code> — <b>파는 말</b>이 대문이다',
      '프로가 <b>뭘 해줬는지</b>가 어디에도 안 적혀 있다',
      '남은 한마디 횟수가 홈에 없다'],
     ['카드가 다 비슷한 크기라 <b>어디를 먼저 봐야 할지</b> 모른다'], 'bad'),

    ('a', 'A안', '프로가 말을 건다', '참고 화면에 제일 가까움',
     ['맨 위가 <b>프로</b>다 — 얼굴 · 이름 · <code>골프러버님과 6번째</code>',
      '<b>내 이름</b>으로 부른다 · 프로가 한 일을 적는다 (<code>24번 돌려보며</code>)',
      '열기 전에 <b>안에 뭐가 있는지</b> 보인다 (영상 12:24 · 음성 0:32)',
      '남은 한마디를 <b>알약 6칸</b>으로 — 숫자보다 "자리가 남았다"로 읽힌다'],
     ['가장 사람 냄새가 난다',
      '피드백이 <b>안 온 달</b>엔 이 큰 카드가 뭘 말할지 정해야 한다'], 'pick'),

    ('b', 'B안', '헤더에 횟수 · 본문은 더 비움', '',
     ['남은 한마디를 <b>헤더 알약</b>으로 올려 자리를 거의 안 먹는다',
      '본문은 히어로 · 주간 · 다음 피드백 · 최근 한마디 <b>4덩어리</b>',
      'A안보다 <b>한 덩어리 더</b> 스크롤 없이 들어온다'],
     ['헤더 알약은 <b>눈에 덜 띈다</b> — 재촉 안 하려면 이쪽',
      '반대로 "얼마 남았지?"를 <b>알려주고 싶다면 A안</b>'], 'alt'),

    ('c', 'C안', '지금 구조 유지 + 히어로만 얹기', '변화 폭 최소',
     ['숫자 3개 줄(<code>주간 연습 · 등록 스윙 · 연속 기록</code>)을 <b>그대로 둔다</b>',
      '히어로와 남은 횟수만 새로 얹는다',
      '기존 사용자가 <b>덜 놀란다</b>'],
     ['안전하지만 <b>카드가 다시 많아진다</b> — 참고 화면의 여백감은 사라진다'], 'soft'),
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

html = f'''<title>홈 레이아웃 3안</title>
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
.lede{{margin-top:12px;font-size:14px;color:var(--cs);max-width:800px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}
.steal{{margin-top:22px;display:flex;gap:9px;flex-wrap:wrap;max-width:1000px}}
.steal span{{font-size:12px;background:var(--panel);border:1px solid var(--bd);border-radius:9px;
 padding:8px 12px;color:var(--cs)}}
.steal b{{color:var(--ct);font-weight:600}}
.row{{display:flex;gap:18px;margin-top:30px;align-items:flex-start;overflow-x:auto;
 padding-bottom:14px}}
.cell{{flex:0 0 372px;background:var(--panel);border:1px solid var(--bd);border-radius:16px;
 padding:18px 17px 20px}}
.cell.pick{{border-color:var(--acc);border-width:2px;padding:17px 16px 19px}}
.head{{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:14px}}
.nm{{font-size:17px;font-weight:600;letter-spacing:-.02em}}
.sub{{font-size:12px;color:var(--cs)}}
.tag{{margin-left:auto;font-size:10px;font-weight:700;letter-spacing:.05em;background:var(--acc);
 color:#fff;border-radius:6px;padding:4px 8px;font-family:var(--font-num)}}
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
.note{{margin-top:34px;background:var(--panel);border:1px solid var(--bd);border-radius:14px;
 padding:20px 22px;max-width:940px}}
.note h2{{font-size:14px;font-weight:600;margin-bottom:10px}}
.note p{{font-size:13px;color:var(--cs);line-height:1.9}}
.note p+p{{margin-top:10px}}
.note b{{color:var(--ct);font-weight:600}}
</style>
<div class="wrap">
  <h1>홈 레이아웃 3안</h1>
  <p class="lede">보내주신 화면에서 <b>색이 아니라 구조</b>를 가져왔습니다.
    지금 홈은 카드 6개가 다 비슷한 크기라 어디를 먼저 볼지 모르고,
    제일 큰 카드가 <code>프로에게 스윙 진단받기</code>라 <b>파는 말이 대문</b>입니다.
    요청하신 <b>이번 달 남은 한마디</b>도 세 안 모두에 넣었습니다.</p>
  <div class="steal">
    <span>① 맨 위가 <b>프로</b>다 — 앱이 아니라 사람이 말을 건다</span>
    <span>② <b>내 이름</b>으로 부른다</span>
    <span>③ 프로가 <b>한 일</b>을 적는다 (24번 돌려봤다)</span>
    <span>④ 열기 전에 <b>안에 뭐가 있는지</b> 보인다</span>
    <span>⑤ 카드 수를 줄이고 <b>글씨를 키운다</b></span>
  </div>
  <div class="row">{cells}</div>
  <div class="note">
    <h2>남은 한마디를 어떻게 보여줄지</h2>
    <p>· 숫자만 크게 던지면 <b>"빨리 쓰라"는 재촉</b>으로 읽힙니다. 돈 낸 사람에게 할 말이 아닙니다.
      그래서 <b>알약 6칸</b>을 채우는 방식으로 만들었습니다 — 쓴 만큼 칠해지고,
      남은 건 <b>빈 자리</b>로 보입니다.</p>
    <p>· A · C안은 <b>본문 카드</b>로, B안은 <b>헤더 알약</b>으로 넣었습니다.
      눈에 띄게 하려면 A, 조용히 두려면 B입니다.</p>
    <p>· 다 쓴 달에는 <code>이번 달 다 썼어요 · 8월 1일에 6회로 채워져요</code>로 바뀌어야 합니다.
      0으로 비어 있기만 하면 <b>고장난 것처럼</b> 보입니다.</p>
    <h2 style="margin-top:18px">정해야 할 것 하나</h2>
    <p>히어로 카드는 <b>피드백이 온 날</b>을 전제로 만들었습니다.
      한 달 중 <b>29일은 안 온 날</b>인데, 그때 이 자리가 뭘 말할지 정해야 합니다.
      제 생각엔 <b>같은 자리에 프로가 계속 말을 거는 게</b> 맞습니다 —
      <code>이번 주 스윙 3개 봤어요. 목요일까지 하나 더 올려주시면 같이 볼게요</code> 같은 식으로요.
      고르시면 그 상태도 같이 만들겠습니다.</p>
  </div>
</div>'''

open(os.path.join(HERE, 'home-board.html'), 'w', encoding='utf-8-sig').write(html)
print(f'{len(html)/1024:.0f} KB → home-board.html')
