# -*- coding: utf-8 -*-
"""컨셉 4안 × 실제 화면 4개 — DOM 수술본(slotted.json)으로 보드를 조립한다."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'slotted.json'), encoding='utf-8'))
fp = os.path.join(HERE, 'fonts-concepts.css')
fonts = open(fp, encoding='utf-8').read()

PAGES = [('2a', '홈'), ('2b', '연습기록'), ('2g', '스윙기록'), ('2f', '정규레슨')]
CONCEPTS = [
    (1, '리포트 & 말풍선', '형태로 가른다',
     '피드백은 <b>어두운 리포트 표지</b>, 한마디는 <b>말풍선</b>. 화면 구조는 원본 그대로 두고 그 두 카드만 갈았다.',
     ['개념 차이가 가장 세게 드러난다 — 어두운 카드는 앱에 이것뿐',
      'pc1(말풍선)·r1(리포트)이 이미 이 방향이라 절반은 만들어져 있다',
      '카드 컴포넌트 두 벌을 모든 화면에 일관되게 깔아야 한다',
      '어두운 카드가 밝은 앱 톤에서 튄다 — 그게 목적이지만 과하면 무거워진다']),
    (2, '배지 규칙', '표식만 통일 · 원본 무수정',
     '레이아웃 완전 보존. <b>좌측 색바 + 아이콘 + 종류 라벨</b> 세 가지 표식만 규칙으로 얹었다.',
     ['제일 싸다 — 기존 카드에 표식만 붙임',
      '규칙이 단순해 새 화면에도 바로 적용',
      '무게 차이가 안 난다 — 월 1회와 주 1회가 여전히 같은 크기',
      '초록이 이미 앱 기본색이라 "피드백 전용"으로 약하게 읽힌다']),
    (3, '위·아래 규칙', '자리로 가른다',
     '피드백은 <b>항상 최상단 초록 스트립</b>, 한마디는 <b>항상 영상 밑에 붙어서</b>. 자리가 곧 종류다.',
     ['어느 화면을 가도 규칙이 같다 — 헷갈릴 수가 없다',
      '한마디가 무슨 영상 얘긴지 붙어 있어서 바로 보인다',
      '스트립이 모든 화면 상단을 차지한다',
      '피드백이 "읽는 것"이 아니라 "알림"처럼 보인다']),
    (4, '서가 & 타임라인', '정보구조로 가른다',
     '피드백은 <b>백넘버 서가</b>(쌓임), 한마디는 <b>세로 타임라인</b>(흐름). 정규레슨 탭에 서가가 생겼다.',
     ['쌓이는 것 vs 흐르는 것 — 구조 자체가 다르다',
      'No.06 표지가 소장 가치를 만든다',
      '공간을 제일 많이 먹는다',
      '한마디가 영상에서 떨어져 나온다 — 맥락이 약해진다']),
]

rows = ''
for cid, name, tag, desc, pros in CONCEPTS:
    phones = ''.join(
        f'<div class="cell"><div class="plab">{pname}</div>'
        f'<div class="phone">{S[f"c{cid}_{pid}"]}</div></div>'
        for pid, pname in PAGES)
    bullets = ''.join(f'<li class="{"pro" if i < 2 else "con"}">{p}</li>'
                      for i, p in enumerate(pros))
    rows += f'''<section class="row">
  <div class="rhead"><div class="rno">C{cid}</div>
    <div class="rmeta"><h2>{name}</h2><div class="rtag">{tag}</div>
      <p class="rdesc">{desc}</p><ul class="rlist">{bullets}</ul></div></div>
  <div class="rail">{phones}</div>
</section>'''

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
.wrap{{max-width:1700px;margin:0 auto;padding:44px 24px 90px}}
header.top{{max-width:700px;margin-bottom:10px}}
.eyebrow{{font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--cs2);
  font-family:var(--font-num);margin-bottom:12px}}
h1{{font-size:30px;font-weight:400;letter-spacing:-.035em;line-height:1.35;text-wrap:balance}}
h1 b{{font-weight:600}}
.lede{{font-size:14px;color:var(--cs);margin-top:14px;line-height:1.85}}
.lede b{{color:var(--ct);font-weight:600}}
.row{{margin-top:50px;padding-top:34px;border-top:1px solid var(--bd)}}
.row:first-of-type{{border-top:none}}
.rhead{{display:flex;gap:18px;align-items:flex-start;max-width:1000px;margin-bottom:22px}}
.rno{{flex:none;width:46px;height:46px;border-radius:12px;background:var(--acc);color:var(--pg);
  display:flex;align-items:center;justify-content:center;font-family:var(--font-num);
  font-size:15px;font-weight:700}}
.rmeta{{flex:1;min-width:0}}
h2{{font-size:20px;font-weight:600;letter-spacing:-.03em}}
.rtag{{font-size:10.5px;font-weight:600;letter-spacing:.14em;color:var(--cs2);
  font-family:var(--font-num);margin-top:4px}}
.rdesc{{font-size:13px;color:var(--cs);margin-top:10px;line-height:1.8;max-width:620px}}
.rdesc b{{color:var(--ct);font-weight:600}}
.rlist{{list-style:none;margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));
  gap:6px 22px;max-width:840px}}
.rlist li{{position:relative;padding-left:16px;font-size:12px;color:var(--cs);line-height:1.7}}
.rlist li::before{{position:absolute;left:0;top:0;font-family:var(--font-num);font-weight:700;font-size:12px}}
.rlist .pro::before{{content:"+";color:var(--acc)}}
.rlist .con::before{{content:"−";color:var(--br)}}
.rail{{display:flex;gap:22px;overflow-x:auto;padding:4px 2px 16px}}
.cell{{flex:none;width:360px}}
.plab{{font-size:11.5px;font-weight:600;color:var(--cs);padding:0 2px 10px}}
.phone{{display:flex;justify-content:center}}
.asks{{margin-top:56px;max-width:920px;background:var(--panel);border:1px solid var(--bd);
  border-radius:16px;padding:22px 24px}}
.asks h2{{font-size:19px;margin-bottom:8px}}
.asks p{{font-size:13px;color:var(--cs);line-height:1.85}}
.asks p b{{color:var(--ct);font-weight:600}}
@media (max-width:760px){{ .wrap{{padding:28px 14px 60px}} h1{{font-size:24px}}
  .rlist{{grid-template-columns:1fr}} }}
</style>
<div class="wrap">
  <header class="top">
    <div class="eyebrow">NEXT SWING · 피드백 ↔ 한마디 구분 · 컨셉 4안 (2차 — 실제 화면 위에)</div>
    <h1>이번엔 화면을 새로 그리지 않았다. <b>실제 화면에서 그 카드만 갈았다</b></h1>
    <p class="lede">1차 보드는 화면을 새로 그려서 비어 보였다. 이번 16장은 <b>지금 프로토타입 화면 원본</b>에서
      피드백·한마디에 해당하는 부분만 바꾼 것이다. 나머지 카드·달력·통계는 전부 그대로 있다.
      그래서 이대로 채택하면 프로토타입에 그대로 이식된다.</p>
  </header>
  {rows}
  <div class="asks">
    <h2>내 추천 그대로다 — C1 본체 + C4 서가</h2>
    <p><b>C1</b>이 무게 차이를 제일 정직하게 보여준다. 어두운 카드는 앱에서 피드백뿐이라 그 자체로 표식이 된다.
      여기에 <b>C4의 서가를 정규레슨 탭에만</b> 얹으면 "모은다"는 감각까지 생긴다 — 둘은 충돌하지 않는다.
      C2는 표식이 약하고, C3은 스트립이 모든 화면 위를 상시 차지하는 비용이 크다.
      고르면 그대로 프로토타입에 이식한다.</p>
  </div>
</div>'''

out = os.path.join(HERE, 'split-concepts.html')
open(out, 'w', encoding='utf-8-sig').write(html)
print(f'{os.path.getsize(out)/1024:.0f} KB → split-concepts.html')
