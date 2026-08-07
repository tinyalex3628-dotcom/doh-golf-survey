# -*- coding: utf-8 -*-
"""서로 다른 세 벌 — 색 · 폰트 · 조판을 전부 벌린 3안.

이번 판의 설계 규칙(사용자가 준 Product Designer 프롬프트를 그대로 적용):
  1) 화면마다 행동 하나가 40% 를 차지한다 — 히어로가 화면의 주인.
  2) 간격은 균일하지 않다 — 48 · 12 · 32 · 18 처럼 리듬을 탄다.
  3) 카드 높이를 다 다르게, 일부러 겹치고 삐져나오게.
  4) 기능이 아니라 관계 — 「업로드하세요」가 아니라
     「프로가 회원님의 스윙을 기다리고 있어요」.
  5) 화면 요소의 30~50% 를 삭제 — 각 안의 머리말에 무엇을 지웠는지 적었다.
  6) 그림자는 화면당 최대 하나. 나머지는 플랫.

세 안은 폰트부터 다르다(구글 웹폰트 실제 로드):
  K 새벽 라운드   — Gowun Batang(세리프) · 크림+포레스트+테라코타 · 사색형
  L 미드나이트 드라이브 — Black Han Sans · 잉크블랙+라임 · 스포츠형
  M 선데이 클럽   — Jua(라운드) · 샌드+클레이+스카이 · 말랑 스티커형
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-tri3.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고 스무 번만 천천히.'
CM_S = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
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


def scene(colors, label='', h=140, fill='#22301F', extra=''):
    sky, mid, grass = colors
    return (f'<div class="scene" style="height:{h}px;flex:none;{extra}">'
            f'<i style="background:{sky};height:44%"></i>'
            f'<i style="background:{mid};height:16%"></i>'
            f'<i style="background:{grass};flex:1"></i>{golfer(fill)}'
            + (f'<span class="bd">{label}</span>' if label else '') + '</div>')


def tabbar(on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n)}<b>{n}</b></span>'
                      for n in TABS) + '</div>')


def frame(tab, body, cls=''):
    return (f'<div class="ph {cls}"><div class="ph-top"><span>9:41</span>'
            f'<i class="beta">베타</i><span class="batt"></span></div>'
            f'<div class="ph-body">{body}</div>{tabbar(tab)}</div>')


# ════════════════════════════════════════════════════════════════════
# K. 새벽 라운드 — 크림 · 세리프 · 사색. Gentler Streak 의 공기
#    지운 것: 통계 줄, 상태 스트립, 달력 미리보기, 버튼 2개 중 1개,
#             갤러리의 상태 배지 대부분(한마디 받은 것에만 점 하나)
# ════════════════════════════════════════════════════════════════════
KSC = ('#D9CDBA', '#B7B49A', '#8F9E7E')

k_home = f'''
<div class="k-date">8월 6일 목요일 · 함께한 지 32일</div>
<div class="k-hero">
  <span class="k-av">이</span>
  <div class="k-big">프로가 회원님의<br>스윙을 검토했어요</div>
</div>
<div class="k-quote">“{CM_S}”</div>
<div class="cta">답을 읽어볼게요</div>
<div class="k-foot">읽고 나면, 내일 스윙이 다음 답을 부릅니다</div>'''

k_rec = f'''
<div class="k-date">2026년 8월</div>
<div class="k-cal">
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="dot">4</s><s class="sel dot">5</s><s class="today">6</s><s class="off">7</s><s class="off">8</s>
  </div>
</div>
<div class="k-over">
  <div class="k-ovh">8월 5일, 프로의 말</div>
  <div class="k-ovt">“{CM2}”</div>
  <div class="k-ovm">스윙 2편 · 내 메모 1</div>
</div>
<div class="k-thin">오늘 스윙 1개 올렸어요 — 기록 한 줄 남기기</div>'''

k_gal = f'''
<div class="k-date">스윙 서른일곱 편</div>
<div class="k-coll">
  {scene(KSC, '', 236, '#4A4636', 'width:64%')}
  <div class="k-coll-r">{scene(KSC, '', 112, '#4A4636')}{scene(KSC, '', 112, '#4A4636')}</div>
</div>
<div class="k-cap"><b>8월 6일 · 정면 · 드라이버</b><i>프로가 보는 중</i></div>
<div class="k-cap sm"><b>8월 5일 · 아이언 두 편</b><i class="gotit">● 한마디 받음</i></div>
<div class="k-thin">이달에 열두 편 — 지난달보다 세 편 많아요</div>'''

k_les = f'''
<div class="k-date">8월 5일 수요일 밤</div>
<div class="k-mark">“</div>
<div class="k-letter">{CM}</div>
<div class="k-sign">— 이도형 · 사진 두 장과 함께</div>
<div class="k-shots"><s></s><s></s></div>
<div class="k-thin">이 글이 달린 스윙 보기</div>'''

k_my = f'''
<div class="k-date">골프러버</div>
<div class="k-big lone">이도형 프로와<br>32일째</div>
<div class="k-line">연습 12일 · 스윙 14편 · 한마디 6번</div>
<div class="k-quote sm">“꾸준히 오는 회원이 제일 늘어요.”</div>
<div class="k-thin">아이디 만들기 — 폰을 바꿔도 이어져요</div>
<div class="k-thin dim">알림 · 구독(베타 무료) · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
# L. 미드나이트 드라이브 — 잉크블랙 · 라임 · 대문짝. Nike Run Club 의 공기
#    지운 것: 카드 전부(플랫 블록만), 달력 그리드(주간 숫자 띠로),
#             갤러리 2열(풀폭 1열), 상태 6종(라임 태그 하나만)
# ════════════════════════════════════════════════════════════════════
LSC = ('#20262B', '#2C3A31', '#31463A')

l_home = f'''
<div class="l-tick">32일째 · 오늘 업로드 1/2 · 🔥 5일 연속</div>
<div class="l-huge">프로가<br>기다립니다</div>
<div class="l-sub">어제 답을 남겼어요 — 오늘 스윙이 다음 답을 부릅니다</div>
<div class="cta">스윙 보내기</div>
<div class="l-ghost">어제 받은 답 다시 읽기</div>
<div class="l-num">5<span>일 연속</span></div>'''

l_rec = f'''
<div class="l-wk">
  <span>2</span><span>3</span><span class="has">4</span><span class="sel">5</span>
  <span class="now">6</span><span class="off">7</span><span class="off">8</span>
</div>
<div class="l-dayhuge">8.5</div>
<div class="l-tag">한마디 받음</div>
<div class="l-q">“{CM2}”</div>
<div class="l-row">정면 · 아이언 <em>+ 내 메모</em></div>
<div class="l-row dim">측면 · 아이언 <em>전달됨</em></div>'''

l_gal = f'''
{scene(LSC, '', 218, '#0F1512', 'margin:0 -18px')}
<div class="l-meta"><span class="l-tag">보는 중</span><b>정면 · 드라이버</b><i>8월 6일</i></div>
{scene(LSC, '', 150, '#0F1512', 'margin:26px -18px 0')}
<div class="l-meta"><span class="l-tag on">한마디 1</span><b>정면 · 아이언</b><i>8월 5일</i></div>
<div class="l-foot">오늘 2편 다 올렸어요 · 정면 → 측면 순서</div>'''

l_les = f'''
<div class="l-tick">8월 5일 · 사진 2 · 안 읽음</div>
<div class="l-quote">“톱에서 왼팔이<br>접히는 건<br><em>팔 힘이 아니라</em><br>어깨 회전이<br>덜 돌아서.”</div>
<div class="l-sub">백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고, 스무 번만 천천히 — 이도형</div>
<div class="l-ghost">이 글이 달린 스윙 보기</div>'''

l_my = f'''
<div class="l-tick">골프러버 · 이도형 프로와</div>
<div class="l-num big">32<span>일</span></div>
<div class="l-grid">
  <div><b>12</b><i>연습일</i></div><div><b>14</b><i>스윙</i></div>
  <div><b>6</b><i>한마디</i></div><div><b>9</b><i>최장 연속</i></div>
</div>
<div class="l-ghost">아이디 만들기 — 폰을 바꿔도 이어져요</div>
<div class="l-foot">알림 · 구독(베타 무료) · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
# M. 선데이 클럽 — 샌드 · 클레이 · 라운드. Duolingo 의 온기
#    지운 것: 목록형 설정, 상태 문자(스티커로), 달력 격자선(도장으로),
#             본문 장문(말풍선 한 뭉치로)
# ════════════════════════════════════════════════════════════════════
MSC = ('#BFDCEB', '#C9DBA8', '#94C08B')

m_home = f'''
<div class="m-hi">32일째 만나는 중 👋</div>
<div class="m-hero">
  <div class="m-ball">{scene(MSC, '', 0, '#3E5136')}</div>
  <div class="m-big">프로 답장이<br>도착했어요!</div>
  <span class="m-stick">사진 2장</span>
</div>
<div class="cta">읽으러 가기</div>
<div class="m-soft">오늘 스윙도 올리면, 내일 또 만나요</div>'''

m_rec = f'''
<div class="m-hi">8월, 도장 다섯 개 🔥</div>
<div class="m-stamps">
  <span class="off">일</span><span class="off">월</span><span class="on">4</span>
  <span class="on big">5</span><span class="half">6</span><span></span><span></span>
</div>
<div class="m-card tilt">
  <div class="m-ch">8월 5일의 답장</div>
  <div class="m-ct">“{CM2}”</div>
  <span class="m-stick mini">한마디</span>
</div>
<div class="m-soft">오늘 스윙 1개 — 한 개 더 올릴 수 있어요</div>'''

m_gal = f'''
<div class="m-hi">내 스윙 앨범 📸</div>
<div class="m-pols">
  <div class="m-pol r1">{scene(MSC, '', 118, '#3E5136')}<b>8/6 드라이버</b><span class="m-stick mini">보는 중</span></div>
  <div class="m-pol r2">{scene(MSC, '', 118, '#3E5136')}<b>8/5 아이언</b><span class="m-stick mini gold">답장 옴!</span></div>
  <div class="m-pol r3">{scene(MSC, '', 118, '#3E5136')}<b>8/5 아이언</b></div>
</div>
<div class="m-soft">오늘은 2편 다 올렸어요 — 내일 또!</div>'''

m_les = f'''
<div class="m-hi">이도형 프로 💬</div>
<div class="m-chat">
  <span class="m-cav">이</span>
  <div class="m-bub">{CM}</div>
</div>
<div class="m-shots"><s></s><s></s></div>
<div class="m-chat me"><div class="m-bub me">감사합니다! 내일 스무 번 해볼게요 🙏</div></div>
<div class="m-soft">답장을 읽으면 오늘 한 바퀴 완성</div>'''

m_my = f'''
<div class="m-hi">골프러버 님 🏌️</div>
<div class="m-badge">
  <div class="m-flame">🔥</div>
  <div class="m-bt">5일 연속!</div>
  <div class="m-bs">최고 기록까지 4일</div>
</div>
<div class="m-pills"><span>연습 12일</span><span>스윙 14편</span><span class="gold">한마디 6번</span></div>
<div class="m-soft">아이디 만들기 — 폰 바꿔도 기록이 따라와요</div>
<div class="m-soft dim">알림 · 구독(베타 무료) · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
THEMES = [
    ('kk', 'K. 새벽 라운드', 'Gowun Batang 세리프 · 크림+포레스트 · 사색형',
     '30초만 보는 사람을 위해 화면당 문장 하나만 남겼다. 지운 것 — 통계 줄, 상태 스트립, '
     '달력 미리보기, 버튼 하나. 프로의 말 카드가 달력 위로 올라타고(겹침), 갤러리는 '
     '큰 한 장이 오른쪽으로 삐져나간다. 그림자는 화면당 하나뿐.',
     [('홈', k_home, '행동 하나가 화면의 40%',
       '「프로가 검토했어요」가 히어로. 통계·기록 줄을 전부 지웠다 — 읽을 것과 누를 것 하나씩.'),
      ('연습기록', k_rec, '카드가 달력을 올라탄다',
       '프로의 말이 달력 아래 경계를 깨고 겹친다 — 시선이 격자에서 말로 흐른다. 간격 리듬 44·10·26.'),
      ('스윙', k_gal, '큰 한 장 + 작은 두 장',
       '오늘의 스윙이 크고 오른쪽으로 삐져나간다. 상태 배지는 다 지우고 「한마디 받음」 점 하나만.'),
      ('레슨기록', k_les, '따옴표가 조판의 주인',
       '큰 따옴표 아래 프로의 글만. 사진은 글 끝에 우표만 하게 — 글이 먼저라는 우리 규칙 그대로.'),
      ('마이', k_my, '관계가 표제다',
       '「이도형 프로와 32일째」가 화면의 절반. 설정은 흐린 한 줄로 강등.')]),

    ('ll', 'L. 미드나이트 드라이브', 'Black Han Sans 대문짝 · 잉크블랙+라임 · 스포츠형',
     'Nike Run Club 의 문법 — 카드를 전부 버리고 플랫 블록과 대문짝 활자만. 숫자 「5」가 '
     '화면 밖으로 잘려 나가고, 갤러리는 좌우 여백 없이 풀블리드. 지운 것 — 카드 테두리 전부, '
     '달력 격자(주간 띠로), 상태 6종(라임 태그 하나로).',
     [('홈', l_home, '기다림이 헤드라인',
       '「프로가 기다립니다」 — 업로드 버튼이 아니라 관계가 소리친다. 연속 5가 모서리에서 잘린다.'),
      ('연습기록', l_rec, '날짜가 8.5 크기로',
       '달력 대신 주간 띠 + 고른 날을 대문짝으로. 그날의 답과 스윙 두 줄이 전부.'),
      ('스윙', l_gal, '풀블리드 1열',
       '영상이 폰 좌우 끝까지. 메타는 밑에 한 줄, 태그는 라임 하나 — 훑는 속도가 목적.'),
      ('레슨기록', l_les, '답장이 포스터다',
       '프로의 문장을 행갈이해서 포스터로 세웠다. 핵심 구절만 라임 — 읽는 게 아니라 박힌다.'),
      ('마이', l_my, '숫자의 방, 크기는 제각각',
       '32가 제일 크고 나머지 넷은 계단식 — 모든 숫자가 같은 비중이면 아무것도 안 중요해진다.')]),

    ('mm', 'M. 선데이 클럽', 'Jua 라운드 · 샌드+클레이+스카이 · 스티커형',
     'Duolingo 의 온기 — 도장·스티커·기울어진 폴라로이드. 지운 것 — 목록형 설정, 상태 문자'
     '(스티커로), 달력 격자선(도장판으로), 장문(말풍선 한 뭉치로). 폴라로이드가 ±2° 씩 '
     '기울어 사람 손을 탄 느낌을 만든다.',
     [('홈', m_home, '반가움이 먼저',
       '「32일째 만나는 중 👋」 다음에 도착 알림. 골퍼 원형이 히어로에 겹쳐 붙는다 — 마스코트 자리.'),
      ('연습기록', m_rec, '달력이 아니라 도장판',
       '찍은 날만 클레이 도장. 답장 카드는 -2° 기울어 도장판을 살짝 덮는다.'),
      ('스윙', m_gal, '폴라로이드 앨범',
       '±2° 기울기 + 상태는 스티커(「답장 옴!」). 관리 화면이 아니라 추억 앨범의 문법.'),
      ('레슨기록', m_les, '카톡의 문법 그대로',
       '프로 아바타 + 말풍선, 내 답장까지. 배울 것이 0인 화면.'),
      ('마이', m_my, '불꽃 배지가 주인공',
       '연속 5일이 트로피. 통계는 알약 세 개로, 설정은 흐린 줄로 — 자랑의 방이다.')]),
]

sections = ''
for cls, name, tag, desc, screens in THEMES:
    phones = ''.join(
        f'<div class="col">{frame(tab, b, cls)}<div class="why"><b>{w1}</b>{w2}</div></div>'
        for tab, b, w1, w2 in screens)
    sections += (f'<div class="th"><h2>{name} <em>{tag}</em></h2>'
                 f'<p class="lede">{desc}</p><div class="strip">{phones}</div></div>')

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · 세 벌 — 색·폰트·조판을 벌린 3안</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@400;500;700&family=Jua&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Noto Sans KR',Pretendard,-apple-system,sans-serif;background:#191817;
  color:#EFEBE2;-webkit-font-smoothing:antialiased;padding:38px 28px 90px}}
h1{{font-size:22px;letter-spacing:-.02em}}
h2{{font-size:17px;margin:0 0 6px}}
h2 em{{font-style:normal;font-size:12px;color:#D9B36A;font-weight:600;margin-left:8px}}
.lede{{font-size:12.5px;color:#AFA99D;line-height:1.8;max-width:700px}}
.th{{margin-top:44px;padding-top:26px;border-top:1px solid #34312C}}
.strip{{display:flex;gap:24px;overflow-x:auto;padding:20px 4px 8px;align-items:flex-start}}
.col{{flex:none;width:340px}}
.why{{font-size:11.5px;color:#AFA99D;line-height:1.75;padding:12px 6px 0}}
.why b{{display:block;color:#EFEBE2;font-size:12px;padding-bottom:3px}}
.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:700px;position:relative;box-shadow:0 18px 44px -18px rgba(0,0,0,.7)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700;position:relative;z-index:4}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.8}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px}}
.ph-body{{flex:1;padding:12px 18px 18px;display:flex;flex-direction:column;position:relative;z-index:2}}
.tabs{{display:flex;padding:8px 0 10px;position:relative;z-index:4}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}}
.tb b{{font-size:9px;font-weight:700}}
.scene{{position:relative;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}}
.bd{{position:absolute;left:8px;top:8px;font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px}}
.cta{{border-radius:16px;text-align:center;padding:16px;font-size:15px;font-weight:800}}

/* ══ K. 새벽 라운드 — 크림 세리프 ══ */
.ph.kk{{background:#F4EEE1;color:#2B2A22;font-family:'Gowun Batang',serif}}
.ph.kk .beta{{background:#E5DCC6;color:#6B6142}}
.ph.kk .tabs{{background:#F4EEE1;border-top:1px solid #DFD6C0}}
.ph.kk .tb{{color:#A99F87}} .ph.kk .tb.on{{color:#3E5136}}
.ph.kk .tb b{{font-family:'Noto Sans KR',sans-serif}}
.ph.kk .cta{{background:#3E5136;color:#F4EEE1;margin-top:34px;border-radius:2px;
  font-family:'Gowun Batang',serif;letter-spacing:.06em}}
.k-date{{font-size:11px;letter-spacing:.14em;color:#A3987C;padding:10px 0 46px;
  font-family:'Noto Sans KR',sans-serif;font-weight:700}}
.k-hero{{position:relative;padding-left:2px}}
.k-av{{position:absolute;right:-2px;top:-26px;width:52px;height:52px;border-radius:50%;
  background:#3E5136;color:#F4EEE1;display:flex;align-items:center;justify-content:center;
  font-size:19px;font-weight:700}}
.k-big{{font-size:29px;font-weight:700;line-height:1.55;letter-spacing:-.01em}}
.k-big.lone{{padding:34px 0 22px;font-size:31px}}
.k-quote{{border-top:1px solid #C9BFA6;margin-top:30px;padding:16px 2px 0;
  font-size:14.5px;line-height:2.0;color:#5A5442}}
.k-quote.sm{{font-size:13px;margin-top:24px}}
.k-foot{{font-size:11px;color:#A3987C;text-align:center;padding-top:12px;
  font-family:'Noto Sans KR',sans-serif}}
.k-cal .cal-w,.k-cal .cal-g,{{}}
.cal-w,.cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.cal-w s{{text-decoration:none;font-size:10px;color:#A3987C;padding:4px 0;
  font-family:'Noto Sans KR',sans-serif;font-weight:700}}
.k-cal .cal-g s{{text-decoration:none;font-size:14px;color:#5A5442;height:40px;
  display:flex;align-items:center;justify-content:center;position:relative}}
.k-cal .cal-g s.off{{opacity:.3}}
.k-cal .cal-g s.sel{{background:#2B2A22;color:#F4EEE1;border-radius:50%}}
.k-cal .cal-g s.today{{box-shadow:inset 0 0 0 1px #2B2A22;border-radius:50%}}
.k-cal .cal-g s.dot:after{{content:'';position:absolute;bottom:3px;left:50%;margin-left:-2px;
  width:4px;height:4px;border-radius:50%;background:#B0663F}}
.k-over{{background:#FFFCF4;margin:-14px 6px 0;padding:18px 18px 15px;position:relative;z-index:2;
  box-shadow:0 14px 30px -18px rgba(60,50,20,.45)}}
.k-ovh{{font-size:10.5px;letter-spacing:.12em;color:#B0663F;font-weight:700;
  font-family:'Noto Sans KR',sans-serif;padding-bottom:9px}}
.k-ovt{{font-size:14.5px;line-height:1.95}}
.k-ovm{{font-size:10.5px;color:#A3987C;padding-top:10px;font-family:'Noto Sans KR',sans-serif}}
.k-thin{{border-top:1px solid #DFD6C0;margin-top:26px;padding:13px 2px 0;font-size:12px;
  color:#6B6142;font-family:'Noto Sans KR',sans-serif;font-weight:500}}
.k-thin.dim{{color:#B4AA8E;border-top:0;margin-top:2px}}
.k-coll{{display:flex;gap:8px;margin-right:-30px}}
.k-coll-r{{display:flex;flex-direction:column;gap:8px;flex:1}}
.ph.kk .scene{{border-radius:2px}}
.k-cap{{display:flex;justify-content:space-between;align-items:baseline;padding:14px 2px 0}}
.k-cap.sm{{padding-top:8px}}
.k-cap b{{font-size:13px;font-weight:700}}
.k-cap i{{font-style:normal;font-size:10.5px;color:#A3987C;font-family:'Noto Sans KR',sans-serif}}
.k-cap i.gotit{{color:#3E5136;font-weight:700}}
.k-mark{{font-size:74px;line-height:.6;color:#B0663F;padding:26px 0 6px}}
.k-letter{{font-size:15.5px;line-height:2.15;color:#2B2A22}}
.k-sign{{padding-top:22px;font-size:12.5px;color:#6B6142;text-align:right}}
.k-shots{{display:flex;gap:6px;justify-content:flex-end;padding-top:12px}}
.k-shots s{{width:40px;height:52px;background:linear-gradient(#D9CDBA 44%,#8F9E7E 44%);display:block;border-radius:2px}}
.k-line{{font-size:12px;color:#6B6142;font-family:'Noto Sans KR',sans-serif;
  border-top:1px solid #C9BFA6;padding-top:14px}}

/* ══ L. 미드나이트 드라이브 — 잉크블랙 라임 ══ */
.ph.ll{{background:#101314;color:#F2F4EF;font-family:'IBM Plex Sans KR',sans-serif}}
.ph.ll .beta{{background:#1E2422;color:#C8F135}}
.ph.ll .tabs{{background:#101314;border-top:1px solid #23282A}}
.ph.ll .tb{{color:#5C6663}} .ph.ll .tb.on{{color:#C8F135}}
.ph.ll .cta{{background:#C8F135;color:#101314;margin-top:40px;border-radius:10px;
  font-family:'Black Han Sans',sans-serif;font-weight:400;font-size:17px;letter-spacing:.02em}}
.l-tick{{font-size:10.5px;font-weight:700;color:#8A948F;letter-spacing:.1em;padding:8px 0 48px}}
.l-huge{{font-family:'Black Han Sans',sans-serif;font-size:44px;line-height:1.18;
  letter-spacing:0;color:#F2F4EF}}
.l-sub{{font-size:12.5px;color:#8A948F;line-height:1.8;padding-top:18px;max-width:88%}}
.l-ghost{{text-align:center;font-size:12.5px;font-weight:700;color:#C8F135;padding:16px 0 0}}
.l-num{{position:absolute;right:-26px;bottom:64px;font-family:'Black Han Sans',sans-serif;
  font-size:150px;line-height:1;color:#1D2325;z-index:1}}
.l-num span{{font-size:16px;color:#39423F;margin-left:-64px;display:inline-block}}
.l-num.big{{position:static;font-size:120px;color:#C8F135;padding:6px 0 10px}}
.l-num.big span{{font-size:20px;color:#8A948F;margin-left:6px}}
.l-wk{{display:flex;gap:4px;padding:10px 0 34px}}
.l-wk span{{flex:1;text-align:center;font-family:'Black Han Sans',sans-serif;font-size:17px;
  color:#5C6663;padding:10px 0;border-radius:8px}}
.l-wk .has{{color:#F2F4EF}}
.l-wk .sel{{background:#C8F135;color:#101314}}
.l-wk .now{{box-shadow:inset 0 0 0 1.5px #F2F4EF;color:#F2F4EF}}
.l-wk .off{{opacity:.35}}
.l-dayhuge{{font-family:'Black Han Sans',sans-serif;font-size:88px;line-height:1}}
.l-tag{{display:inline-block;background:#1E2422;color:#C8F135;font-size:11px;font-weight:800;
  border-radius:6px;padding:5px 10px;margin:14px 0 6px}}
.l-tag.on{{background:#C8F135;color:#101314}}
.l-q{{font-size:15px;line-height:1.9;padding:10px 0 30px;color:#D7DCD4}}
.l-row{{display:flex;justify-content:space-between;border-top:1px solid #23282A;
  padding:13px 2px;font-size:13px;font-weight:700}}
.l-row em{{font-style:normal;color:#C8F135;font-size:11.5px}}
.l-row.dim,.l-row.dim em{{color:#5C6663}}
.ph.ll .scene{{border-radius:0}}
.l-meta{{display:flex;align-items:baseline;gap:10px;padding:10px 0 0}}
.l-meta .l-tag{{margin:0}}
.l-meta b{{font-size:14px}}
.l-meta i{{font-style:normal;font-size:11px;color:#5C6663;margin-left:auto}}
.l-foot{{font-size:11px;color:#5C6663;text-align:center;padding-top:30px}}
.l-quote{{font-family:'Black Han Sans',sans-serif;font-size:31px;line-height:1.42;padding-top:6px}}
.l-quote em{{font-style:normal;color:#C8F135}}
.l-grid{{display:grid;grid-template-columns:1fr 1fr;gap:2px;padding-top:24px}}
.l-grid div{{border-top:1px solid #23282A;padding:14px 2px}}
.l-grid b{{font-family:'Black Han Sans',sans-serif;font-size:30px;display:block}}
.l-grid div:nth-child(3) b{{color:#C8F135}}
.l-grid i{{font-style:normal;font-size:10.5px;color:#5C6663;font-weight:700}}

/* ══ M. 선데이 클럽 — 샌드 클레이 라운드 ══ */
.ph.mm{{background:#F7EFDF;color:#41372B;font-family:'Jua',sans-serif}}
.ph.mm .beta{{background:#EADFC8;color:#8A6A3B}}
.ph.mm .tabs{{background:#FFFBF2;border-top:2px solid #EADFC8}}
.ph.mm .tb{{color:#BCA987}} .ph.mm .tb.on{{color:#C96F3B}}
.ph.mm .cta{{background:#C96F3B;color:#FFF8EC;margin-top:30px;border-radius:99px;
  font-family:'Jua',sans-serif;font-weight:400;font-size:17px;
  box-shadow:0 6px 0 #A5552A}}
.m-hi{{font-size:15px;color:#8A6A3B;padding:8px 0 30px}}
.m-hero{{position:relative;background:#FFFBF2;border-radius:26px;padding:30px 22px 26px;
  border:2.5px solid #41372B}}
.m-ball{{position:absolute;right:-12px;top:-30px;width:84px;height:84px;border-radius:50%;
  overflow:hidden;border:2.5px solid #41372B;transform:rotate(4deg)}}
.m-ball .scene{{position:absolute;inset:0;height:auto!important;border-radius:0}}
.m-big{{font-size:29px;line-height:1.4;color:#41372B;max-width:80%}}
.m-stick{{position:absolute;left:18px;bottom:-13px;background:#F2B93B;color:#5C431A;
  font-size:12px;border-radius:99px;padding:6px 13px;transform:rotate(-3deg);
  border:2px solid #41372B}}
.m-stick.mini{{position:static;display:inline-block;font-size:10.5px;padding:4px 10px;
  transform:rotate(-2deg)}}
.m-stick.mini.gold{{background:#C96F3B;color:#FFF8EC}}
.m-soft{{text-align:center;font-size:12.5px;color:#BCA987;padding-top:22px}}
.m-soft.dim{{padding-top:8px;font-size:11.5px}}
.m-stamps{{display:flex;gap:7px;padding-bottom:8px}}
.m-stamps span{{flex:1;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:15px;color:#BCA987;border:2px dashed #DECDA9}}
.m-stamps .on{{background:#94C08B;border:2.5px solid #41372B;color:#2E4027}}
.m-stamps .on.big{{background:#C96F3B;color:#FFF8EC;transform:scale(1.16) rotate(-4deg)}}
.m-stamps .half{{border:2.5px solid #41372B;color:#41372B}}
.m-stamps .off{{border:0;font-size:11px}}
.m-card{{background:#FFFBF2;border:2.5px solid #41372B;border-radius:22px;
  padding:18px 18px 14px;margin-top:26px;position:relative}}
.m-card.tilt{{transform:rotate(-1.6deg);margin-top:18px}}
.m-ch{{font-size:12px;color:#C96F3B;padding-bottom:8px}}
.m-ct{{font-size:15.5px;line-height:1.8}}
.m-card .m-stick.mini{{position:absolute;left:auto;bottom:auto;right:14px;top:-12px}}
.m-pols{{display:flex;flex-direction:column;gap:20px;padding-top:4px}}
.m-pol{{background:#FFFBF2;border:2.5px solid #41372B;border-radius:6px;
  padding:8px 8px 10px;width:82%;position:relative}}
.m-pol b{{display:block;font-size:12.5px;padding-top:8px;font-weight:400}}
.m-pol .m-stick.mini{{position:absolute;left:auto;bottom:auto;right:-14px;top:-10px}}
.m-pol.r1{{transform:rotate(-2deg)}}
.m-pol.r2{{transform:rotate(1.8deg);align-self:flex-end}}
.m-pol.r3{{transform:rotate(-1.2deg)}}
.ph.mm .scene{{border-radius:3px}}
.m-chat{{display:flex;gap:9px;align-items:flex-start}}
.m-chat.me{{justify-content:flex-end;padding-top:16px}}
.m-cav{{flex:none;width:38px;height:38px;border-radius:50%;background:#C96F3B;color:#FFF8EC;
  display:flex;align-items:center;justify-content:center;font-size:15px;
  border:2.5px solid #41372B}}
.m-bub{{background:#FFFBF2;border:2.5px solid #41372B;border-radius:4px 20px 20px 20px;
  padding:13px 15px;font-size:13.5px;line-height:1.85;max-width:85%}}
.m-bub.me{{background:#94C08B;border-radius:20px 4px 20px 20px;font-size:13px}}
.m-shots{{display:flex;gap:8px;padding:12px 0 0 47px}}
.m-shots s{{width:52px;height:66px;border-radius:8px;border:2.5px solid #41372B;display:block;
  background:linear-gradient(#BFDCEB 44%,#94C08B 44%)}}
.m-badge{{background:#FFFBF2;border:2.5px solid #41372B;border-radius:26px;text-align:center;
  padding:26px 0 20px;transform:rotate(-1deg)}}
.m-flame{{font-size:52px;line-height:1}}
.m-bt{{font-size:24px;padding-top:8px}}
.m-bs{{font-size:12px;color:#BCA987;padding-top:4px}}
.m-pills{{display:flex;gap:8px;justify-content:center;padding-top:24px;flex-wrap:wrap}}
.m-pills span{{background:#EADFC8;border-radius:99px;padding:8px 14px;font-size:12.5px;color:#5C431A}}
.m-pills .gold{{background:#F2B93B}}
</style>

<h1>세 벌 — 색 · 폰트 · 조판을 전부 벌렸다</h1>
<p class="lede">규칙: 화면마다 행동 하나가 40%, 간격은 리듬(48·12·32·18), 카드는 겹치고
삐져나오고 기울고, 문구는 기능이 아니라 관계(「프로가 기다립니다」), 화면 요소 30~50% 삭제
(각 안 머리말에 지운 목록), 그림자는 화면당 하나. 폰트도 세 벌이 다 다르다 —
K 세리프(Gowun Batang) · L 대문짝(Black Han Sans) · M 라운드(Jua).</p>
{sections}
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
