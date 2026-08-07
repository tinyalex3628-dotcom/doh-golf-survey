# -*- coding: utf-8 -*-
"""N(클럽 다이어리)의 뼈대는 그대로, 장난기만 뺀 세 마감.

사용자가 좋다고 한 것은 N 의 **명료함** — 화면마다 블록 서너 개, 한 줄 인사 →
히어로 카드 → 행동 하나 → 흐린 안내. 그 골격과 블록 순서를 한 글자도 안 바꾸고,
장난 장치(마스코트 원형 · 기울어진 스티커 · 점선 도장 · 만화 외곽선 · 이모지)만
걷어낸 세 가지 마감을 만든다. 마크업은 셋이 완전히 같다 — 다른 것은 옷뿐이다.

  S 스튜디오 샌드 — N 의 색을 유지, 외곽선→면, 스티커→코너 라벨, Gowun Dodum
  T 그린 멤버스   — 우리 DNA(아이보리+딥그린+골드), Noto 700, 흰 마진 사진 유지
  U 차콜 클럽     — 웜그레이+차콜+오렌지 한 방울, 도장→사각 칸, 가장 미니멀
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-calm3.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고 스무 번만 천천히.'
CM2 = '하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'

TABS = ['홈', '연습기록', '스윙', '레슨기록', '마이']
ICONS = {
    '홈': '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
    '연습기록': '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    '스윙': '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    '레슨기록': '<path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    '마이': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
}


def icon(name, sz=18):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round" '
            f'style="width:{sz}px;height:{sz}px;display:block">{ICONS[name]}</svg>')


def golfer(fill):
    return ('<svg viewBox="0 0 60 80" style="position:absolute;left:50%;bottom:8%;width:30%;'
            f'transform:translateX(-54%)"><g fill="{fill}">'
            '<circle cx="34" cy="12" r="6"/>'
            '<path d="M30 18c-6 2-9 8-10 16l-3 22 6 20h5l-3-19 5-14 8 13 2 20h5l-1-22-6-16'
            'c3-6 2-14-1-18-2-2-4-3-7-2z"/>'
            '<path d="m28 26-16 20 2 2 17-16z"/></g>'
            '<rect x="10" y="45" width="3" height="3" rx="1.5" fill="#fff"/></svg>')


def scene(h=140, extra=''):
    """씬 색은 CSS 변수로 — 테마마다 톤이 갈린다."""
    return (f'<div class="scene" style="height:{h}px;flex:none;{extra}">'
            f'<i class="sky"></i><i class="mid"></i><i class="grass"></i>'
            + golfer('var(--fig)') + '</div>')


def tabbar(on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n)}<b>{n}</b></span>'
                      for n in TABS) + '</div>')


def frame(tab, body, cls=''):
    return (f'<div class="ph {cls}"><div class="ph-top"><span>9:41</span>'
            f'<i class="beta">베타</i><span class="batt"></span></div>'
            f'<div class="ph-body">{body}</div>{tabbar(tab)}</div>')


# ── N 의 골격 그대로 — 다섯 화면, 마크업은 세 테마 공통 ──────────────
home = f'''
<div class="hi"><span class="cav">이</span>32일째 만나는 중</div>
<div class="hero">
  <div class="lbl">사진 2장</div>
  <div class="big">프로 답장이<br>도착했어요</div>
  <div class="hq">“{CM2}”</div>
</div>
<div class="cta">읽으러 가기</div>
<div class="soft">오늘 스윙도 올리면, 내일 또 만나요</div>'''

rec = f'''
<div class="hi">8월, 다섯 번 채웠어요</div>
<div class="stamps">
  <span class="off">일</span><span class="off">월</span><span class="on">4</span>
  <span class="on now">5</span><span class="half">6</span><span></span><span></span>
</div>
<div class="card">
  <div class="ch">8월 5일의 답장</div>
  <div class="ct">“{CM2}”</div>
  <div class="cm">스윙 2편 · 내 메모 1 <em>그날 기록 열기</em></div>
</div>
<div class="soft">오늘 스윙 1개 — 한 개 더 올릴 수 있어요</div>'''

gal = f'''
<div class="hi">내 스윙</div>
<div class="pols">
  <div class="pol">{scene(118)}<div class="pm"><b>8/6 · 정면 · 드라이버</b><i class="amber">보는 중</i></div></div>
  <div class="pol">{scene(118)}<div class="pm"><b>8/5 · 정면 · 아이언</b><i class="green">답장 받음</i></div></div>
</div>
<div class="soft">오늘은 2편 다 올렸어요 — 정면 · 측면 순서</div>'''

les = f'''
<div class="hi">이도형 프로</div>
<div class="chat"><span class="cav">이</span><div class="bub">{CM}</div></div>
<div class="shots"><s></s><s></s></div>
<div class="chat me"><div class="bub me">감사합니다, 내일 스무 번 해볼게요</div></div>
<div class="soft">답장을 읽으면 오늘 한 바퀴 완성</div>'''

my = f'''
<div class="hi">골프러버 님</div>
<div class="badge">
  <div class="bn">5일 연속</div>
  <div class="bs">최고 기록까지 4일</div>
</div>
<div class="pills"><span>연습 12일</span><span>스윙 14편</span><span class="pt">한마디 6번</span></div>
<div class="soft">아이디 만들기 — 폰 바꿔도 기록이 따라와요</div>
<div class="soft dim">알림 · 구독(베타 무료) · 문의</div>'''

SCREENS = [('홈', home), ('연습기록', rec), ('스윙', gal), ('레슨기록', les), ('마이', my)]

THEMES = [
    ('ss', 'S. 스튜디오 샌드', '색은 N 그대로 — 외곽선을 면으로, 스티커를 라벨로',
     '샌드+클레이는 유지. 만화 외곽선을 전부 지우고 면과 헤어라인으로, 기울어진 스티커는 '
     '히어로 코너의 각진 라벨로, 마스코트 원형은 인사줄의 작은 아바타로. 폰트는 Jua→'
     'Gowun Dodum — 둥근 기운만 남긴 고딕. 도장은 채움 원(점선 제거).',
     [('명료한 골격 그대로', '인사 한 줄 → 히어로 → 행동 하나 → 흐린 안내. N 의 블록 순서를 한 줄도 안 바꿨다.'),
      ('도장은 남고 점선이 갔다', '찍은 날 채움 원 — 빈 날은 그냥 흐린 원. 장난기는 색이 아니라 점선에 있었다.'),
      ('앨범은 흰 마진만 유지', '기울기 0, 외곽선 0. 사진의 흰 마진이 앨범의 기억을 지킨다.'),
      ('말풍선 → 면 대화', '외곽선 없는 면 두 개. 구조는 카톡, 인상은 차분.'),
      ('불꽃 없이 숫자만', '「5일 연속」이 글자로 선다 — 이모지가 하던 일을 굵기가 한다.')]),

    ('tt', 'T. 그린 멤버스', '우리 DNA 로 회귀 — 아이보리+딥그린+골드 한 줄',
     '같은 골격에 지금 앱의 팔레트(아이보리 · 딥그린 · 브론즈)를 입혔다. 헤딩은 Noto 700, '
     '프로와 닿는 곳(라벨 · 답장 머리 · 알약 하나)에만 골드. 지금 앱과 가장 잘 이어지는 마감.',
     [('딥그린 CTA 하나가 중심', '색이 많으면 아무 색도 안 중요하다 — 진한 것은 버튼과 골드 라벨뿐.'),
      ('도장도 딥그린', '채운 날 초록, 오늘은 테두리 — 달력 문법이 앱 본편과 같아진다.'),
      ('상태는 색 글자만', '앰버=보는 중, 그린=답장 받음. 본편 swState 의 색 언어 그대로.'),
      ('프로의 말에 골드 머리', '답장 머리줄만 브론즈 — 본편의 「프로의 말 규칙」과 이어진다.'),
      ('통계 알약도 본편 색', '골드 알약은 한마디 하나뿐 — 관계의 숫자만 반짝인다.')]),

    ('uu', 'U. 차콜 클럽', '웜그레이+차콜 — 가장 어른, 오렌지 한 방울',
     '온기를 색 하나(오렌지)로 줄인 미니멀 마감. 도장은 사각 칸(잔디의 문법), 사진은 '
     '라운드 4px, 헤딩은 차콜 900. 셋 중 가장 조용하고, 골프웨어 브랜드의 인상.',
     [('무채색 위 오렌지 하나', '히어로 라벨과 CTA 만 오렌지 — 눌러야 할 곳이 저절로 보인다.'),
      ('도장 → 잔디 칸', '원 대신 사각 칸. 깃허브 잔디의 문법이라 설명이 필요 없다.'),
      ('사진은 각지게', '라운드를 4px 로 줄이면 같은 사진이 장난감에서 기록물이 된다.'),
      ('대화도 무채색', '내 말만 옅은 오렌지 — 프로의 말은 차콜 글자가 무게를 낸다.'),
      ('숫자가 제일 굵다', '「5일 연속」 900 굵기 — 장식 없이 굵기와 크기로만 세운 트로피.')]),
]

sections = ''
for cls, name, tag, desc, whys in THEMES:
    phones = ''.join(
        f'<div class="col">{frame(tab, b, cls)}<div class="why"><b>{w1}</b>{w2}</div></div>'
        for (tab, b), (w1, w2) in zip(SCREENS, whys))
    sections += (f'<div class="th"><h2>{name} <em>{tag}</em></h2>'
                 f'<p class="lede">{desc}</p><div class="strip">{phones}</div></div>')

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · N 골격, 장난기 뺀 세 마감</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Noto Sans KR',Pretendard,-apple-system,sans-serif;background:#1B1916;
  color:#EFEBE2;-webkit-font-smoothing:antialiased;padding:38px 28px 90px}}
h1{{font-size:22px;letter-spacing:-.02em}}
h2{{font-size:17px;margin:0 0 6px}}
h2 em{{font-style:normal;font-size:12px;color:#D9A05B;font-weight:600;margin-left:8px}}
.lede{{font-size:12.5px;color:#B3AB9D;line-height:1.8;max-width:700px}}
.th{{margin-top:44px;padding-top:26px;border-top:1px solid #37332C}}
.strip{{display:flex;gap:24px;overflow-x:auto;padding:20px 4px 8px;align-items:flex-start}}
.col{{flex:none;width:340px}}
.why{{font-size:11.5px;color:#B3AB9D;line-height:1.75;padding:12px 6px 0}}
.why b{{display:block;color:#EFEBE2;font-size:12px;padding-bottom:3px}}
.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:700px;position:relative;box-shadow:0 18px 44px -18px rgba(0,0,0,.7);
  background:var(--bg);color:var(--ink)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.8}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px;
  background:var(--card2);color:var(--sub)}}
.ph-body{{flex:1;padding:12px 18px 18px;display:flex;flex-direction:column}}
.tabs{{display:flex;padding:8px 0 10px;background:var(--card);border-top:1px solid var(--line)}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--dim)}}
.tb b{{font-size:9px;font-weight:700}}
.tb.on{{color:var(--acc)}}

.scene{{position:relative;border-radius:var(--r-img);overflow:hidden;display:flex;flex-direction:column}}
.scene .sky{{background:var(--sky);height:44%}}
.scene .mid{{background:var(--midc);height:16%}}
.scene .grass{{background:var(--grassc);flex:1}}

.hi{{display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:700;
  color:var(--sub);padding:8px 0 26px}}
.cav{{flex:none;width:30px;height:30px;border-radius:50%;background:var(--accsoft);
  color:var(--acc);display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800}}
.hero{{position:relative;background:var(--card);border-radius:var(--r-card);
  padding:26px 22px 22px;border:1px solid var(--line)}}
.lbl{{position:absolute;right:0;top:0;background:var(--acc);color:var(--onacc);
  font-size:10.5px;font-weight:800;padding:6px 12px;
  border-radius:0 var(--r-card) 0 12px}}
.big{{font-size:26px;line-height:1.45;font-weight:800;letter-spacing:-.01em}}
.hq{{font-size:13px;line-height:1.85;color:var(--sub);padding-top:14px}}
.cta{{background:var(--acc);color:var(--onacc);border-radius:var(--r-cta);text-align:center;
  padding:15px;font-size:15px;font-weight:800;margin-top:24px}}
.soft{{text-align:center;font-size:12px;color:var(--dim);padding-top:20px}}
.soft.dim{{padding-top:8px;font-size:11px;opacity:.75}}

.stamps{{display:flex;gap:7px;padding-bottom:6px}}
.stamps span{{flex:1;aspect-ratio:1;border-radius:var(--r-stamp);display:flex;align-items:center;
  justify-content:center;font-size:13.5px;font-weight:700;color:var(--dim);background:var(--card2)}}
.stamps .on{{background:var(--stamp);color:var(--onstamp)}}
.stamps .on.now{{background:var(--acc);color:var(--onacc)}}
.stamps .half{{background:var(--card);box-shadow:inset 0 0 0 1.5px var(--ink);color:var(--ink)}}
.stamps .off{{background:none;font-size:10.5px}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:var(--r-card);
  padding:18px 18px 14px;margin-top:22px}}
.ch{{font-size:11.5px;font-weight:800;color:var(--acc);padding-bottom:9px}}
.ct{{font-size:14.5px;line-height:1.85}}
.cm{{display:flex;justify-content:space-between;font-size:10.5px;color:var(--dim);padding-top:11px}}
.cm em{{font-style:normal;font-weight:800;color:var(--acc)}}

.pols{{display:flex;flex-direction:column;gap:16px}}
.pol{{background:var(--card);border:1px solid var(--line);border-radius:var(--r-card);
  padding:7px 7px 0}}
.pm{{display:flex;justify-content:space-between;align-items:baseline;padding:9px 4px 11px}}
.pm b{{font-size:12px;font-weight:700}}
.pm i{{font-style:normal;font-size:10.5px;font-weight:800;color:var(--dim)}}
.amber{{color:var(--amber)!important}} .green{{color:var(--ok)!important}}

.chat{{display:flex;gap:9px;align-items:flex-start}}
.chat.me{{justify-content:flex-end;padding-top:16px}}
.bub{{background:var(--card);border:1px solid var(--line);border-radius:4px 16px 16px 16px;
  padding:13px 15px;font-size:13px;line-height:1.9;max-width:85%}}
.bub.me{{background:var(--accsoft);border-color:transparent;color:var(--accdark);
  border-radius:16px 4px 16px 16px;font-size:12.5px;font-weight:500}}
.shots{{display:flex;gap:7px;padding:12px 0 0 39px}}
.shots s{{width:46px;height:60px;border-radius:var(--r-img);display:block;
  background:linear-gradient(var(--sky) 44%,var(--grassc) 44%)}}

.badge{{background:var(--card);border:1px solid var(--line);border-radius:var(--r-card);
  text-align:center;padding:30px 0 24px}}
.bn{{font-size:27px;font-weight:900;letter-spacing:-.01em}}
.bs{{font-size:11.5px;color:var(--dim);padding-top:5px}}
.pills{{display:flex;gap:8px;justify-content:center;padding-top:22px;flex-wrap:wrap}}
.pills span{{border-radius:99px;padding:8px 14px;font-size:12.5px;font-weight:600;
  background:var(--card2);color:var(--sub)}}
.pills .pt{{background:var(--accsoft);color:var(--accdark);font-weight:800}}

/* ══ S. 스튜디오 샌드 — N 의 색, 어른의 면 ══ */
.ph.ss{{--bg:#F6EFE1;--card:#FDF8EE;--card2:#EDE3CE;--line:#E6DAC2;
  --ink:#3E362A;--sub:#6E6248;--dim:#AC9F82;
  --acc:#C0653A;--onacc:#FFF6EC;--accsoft:#F3DFCC;--accdark:#8F4826;
  --stamp:#96BE8D;--onstamp:#2E4027;--amber:#BB8A2E;--ok:#4C7A52;
  --sky:#C3DCE9;--midc:#C6D8A9;--grassc:#96BE8D;--fig:#3E5136;
  --r-card:20px;--r-cta:99px;--r-img:10px;--r-stamp:50%;
  font-family:'Gowun Dodum',sans-serif}}
.ph.ss .big{{font-weight:400;font-size:27px}}
.ph.ss .bn{{font-weight:400;font-size:28px}}

/* ══ T. 그린 멤버스 — 아이보리+딥그린+골드 ══ */
.ph.tt{{--bg:#F5F1E9;--card:#FFFDF8;--card2:#ECE6D8;--line:#E3DCCD;
  --ink:#1D2420;--sub:#4A503F;--dim:#9A947F;
  --acc:#21402F;--onacc:#F5F1E9;--accsoft:#EAF0EA;--accdark:#21402F;
  --stamp:#21402F;--onstamp:#F5F1E9;--amber:#C08A2D;--ok:#4C7A52;
  --sky:#CBDFEC;--midc:#A9C9A4;--grassc:#6FA477;--fig:#22301F;
  --r-card:16px;--r-cta:14px;--r-img:8px;--r-stamp:50%;
  font-family:'Noto Sans KR',sans-serif}}
.ph.tt .lbl{{background:#8A6428;color:#F4ECDD}}
.ph.tt .ch{{color:#8A6428}}
.ph.tt .cm em{{color:#21402F}}
.ph.tt .pills .pt{{background:#F4ECDD;color:#8A6428}}
.ph.tt .beta{{background:#EAF0EA;color:#21402F}}

/* ══ U. 차콜 클럽 — 웜그레이+차콜, 오렌지 한 방울 ══ */
.ph.uu{{--bg:#F2F0EC;--card:#FBFAF7;--card2:#E7E4DD;--line:#E1DED6;
  --ink:#28251F;--sub:#57534A;--dim:#A29D92;
  --acc:#D96C34;--onacc:#FFF7F0;--accsoft:#F6E3D6;--accdark:#A54A1D;
  --stamp:#3A372F;--onstamp:#F2F0EC;--amber:#B08A3E;--ok:#5C7A52;
  --sky:#D3DBDE;--midc:#C2CCB4;--grassc:#9AAE94;--fig:#43483C;
  --r-card:14px;--r-cta:12px;--r-img:4px;--r-stamp:7px;
  font-family:'Noto Sans KR',sans-serif}}
.ph.uu .big{{font-weight:900}}
.ph.uu .bn{{font-weight:900;font-size:29px}}
.ph.uu .hi{{font-weight:800}}
.ph.uu .cta{{font-weight:900}}
</style>

<h1>N 의 골격, 장난기만 뺀 세 마감</h1>
<p class="lede">좋다고 한 명료함 — 화면마다 블록 서너 개, 인사 한 줄 → 히어로 → 행동 하나 →
흐린 안내 — 는 세 안이 <b>마크업까지 동일</b>하다. 걷어낸 것: 마스코트 원형, 기울어진
스티커(→코너 라벨), 점선 도장(→채움 원/칸), 만화 외곽선(→헤어라인), 이모지 전부.
갈린 것은 옷 — S 샌드+클레이(N 의 색), T 아이보리+딥그린(우리 DNA), U 웜그레이+차콜.</p>
{sections}
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
