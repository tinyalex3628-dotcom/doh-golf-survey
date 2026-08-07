# -*- coding: utf-8 -*-
"""선데이 클럽(M)의 유쾌함을 100 → 20~50 으로 낮춘 다섯 단계.

M 이 발명한 것 — 도장판 · 스티커 · 반가움의 문구 · 폴라로이드 — 을 버리지 않고,
단계마다 놀이 장치를 하나씩 얌전하게 만든다. 다섯 안 전부:
  · 관계형 문구(「프로 답장이 도착했어요」)와 실제 앱 사실(하루 2편 · 상태 ·
    이번 달 통계 · 아이디 이어붙이기)은 유지
  · 행동 하나가 화면의 40%, 간격 리듬, 카드 높이 제각각, 그림자 최소

  N 50 — 클럽 다이어리   : 도장판·스티커 유지, 기울기만 ±1°로, 이모지 절반
  O 40 — 소프트 클레이   : 스티커→칩, 볼록 CTA 유지, 도장→채움 원
  P 35 — 페이퍼 스크랩북 : 폴라로이드→흰 마진 사진+테이프 하나, 세리프 헤딩
  Q 30 — 모닝 팬케이크   : 플랫 파스텔, 이모지 0, 온기는 색과 문구로만
  R 20 — 위켄드 멤버십   : 거의 성인 앱 — 클레이 액센트와 도장 점 하나만
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-warm5.html')

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

SC = ('#C3DCE9', '#C6D8A9', '#96BE8D')          # 파스텔 씬
SC2 = ('#CFDDE4', '#C9D4B2', '#9DBB97')          # 더 옅은 씬


def scene(label='', h=140, colors=SC, fill='#3E5136', extra=''):
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
# N. 클럽 다이어리 — 놀이 50. 도장판·스티커 유지, 기울기 ±1°, 외곽선 얇게
# ════════════════════════════════════════════════════════════════════
n_home = f'''
<div class="hi">32일째 만나는 중</div>
<div class="n-hero">
  <div class="n-ball">{scene(h=0)}</div>
  <div class="big">프로 답장이<br>도착했어요</div>
  <span class="n-stick">사진 2장</span>
</div>
<div class="cta">읽으러 가기</div>
<div class="soft">오늘 스윙도 올리면, 내일 또 만나요</div>'''

n_rec = f'''
<div class="hi">8월, 도장 다섯 개</div>
<div class="n-stamps">
  <span class="off">일</span><span class="off">월</span><span class="on">4</span>
  <span class="on now">5</span><span class="half">6</span><span></span><span></span>
</div>
<div class="n-card">
  <div class="ch">8월 5일의 답장</div>
  <div class="ct">“{CM2}”</div>
  <span class="n-stick mini">한마디</span>
</div>
<div class="soft">오늘 스윙 1개 — 한 개 더 올릴 수 있어요</div>'''

n_gal = f'''
<div class="hi">내 스윙 앨범</div>
<div class="n-pols">
  <div class="n-pol r1">{scene(h=112)}<b>8/6 · 정면 · 드라이버</b><span class="n-stick mini">보는 중</span></div>
  <div class="n-pol r2">{scene(h=112)}<b>8/5 · 정면 · 아이언</b><span class="n-stick mini gold">답장 옴</span></div>
</div>
<div class="soft">오늘은 2편 다 올렸어요 — 정면 · 측면 순서</div>'''

n_les = f'''
<div class="hi">이도형 프로</div>
<div class="chat"><span class="cav">이</span><div class="bub">{CM}</div></div>
<div class="shots"><s></s><s></s></div>
<div class="chat me"><div class="bub me">감사합니다, 내일 스무 번 해볼게요</div></div>
<div class="soft">답장을 읽으면 오늘 한 바퀴 완성</div>'''

n_my = f'''
<div class="hi">골프러버 님</div>
<div class="n-badge"><div class="fl">🔥</div><div class="bt">5일 연속</div><div class="bs">최고 기록까지 4일</div></div>
<div class="pills"><span>연습 12일</span><span>스윙 14편</span><span class="gold">한마디 6번</span></div>
<div class="soft">아이디 만들기 — 폰 바꿔도 기록이 따라와요</div>
<div class="soft dim">알림 · 구독(베타 무료) · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
# O. 소프트 클레이 — 놀이 40. 스티커→칩, 볼록 CTA, 도장→채움 원
# ════════════════════════════════════════════════════════════════════
o_home = f'''
<div class="hi">함께한 지 32일</div>
<div class="o-hero">
  <div class="ohh"><span class="cav">이</span><b>이도형 프로</b><i>방금 · 사진 2장</i></div>
  <div class="big">답장이<br>도착했어요</div>
  <div class="oq">“{CM_S}”</div>
</div>
<div class="cta">읽으러 가기</div>
<div class="soft">읽고 나면 오늘 한 바퀴 완성</div>'''

o_rec = f'''
<div class="hi">8월의 기록</div>
<div class="o-week">
  <span>2</span><span>3</span><span class="on">4</span><span class="on sel">5</span>
  <span class="now">6</span><span class="off">7</span><span class="off">8</span>
</div>
<div class="o-card">
  <div class="ch">8월 5일 (수) · 스윙 2 · 한마디 1</div>
  <div class="ct">“{CM2}”</div>
  <div class="orow">{scene(h=48, extra='width:40px;border-radius:10px')}{scene(h=48, extra='width:40px;border-radius:10px')}
  <em>그날 기록 열기</em></div>
</div>
<div class="soft">오늘 1편 — 한 개 더 올릴 수 있어요</div>'''

o_gal = f'''
<div class="hi">스윙 서랍</div>
<div class="o-chips"><span class="on">전체</span><span>정면</span><span>측면</span><span>답장 받음</span></div>
<div class="o-grid">
  <div class="o-cell">{scene(h=136)}<b>8/6 드라이버</b><i class="amber">보는 중</i></div>
  <div class="o-cell">{scene(h=136)}<b>8/5 아이언</b><i class="green">한마디 1</i></div>
  <div class="o-cell">{scene(h=136)}<b>8/5 아이언</b><i>전달됨</i></div>
  <div class="o-cell add">＋<b>스윙 올리기</b></div>
</div>'''

o_les = f'''
<div class="hi">받은 답장</div>
<div class="o-card lift">
  <div class="ohh"><span class="cav">이</span><b>이도형 프로</b><i>8월 5일 오후 9:40</i></div>
  <div class="ct tall">“{CM}”</div>
  <div class="shots"><s></s><s></s></div>
</div>
<div class="soft">이 답이 달린 스윙 보기</div>'''

o_my = f'''
<div class="hi">골프러버 님</div>
<div class="o-hero ctr">
  <div class="onum">32<span>일째</span></div>
  <div class="obs">이도형 프로와 함께</div>
</div>
<div class="pills"><span>연습 12일</span><span>스윙 14편</span><span class="gold">한마디 6번</span></div>
<div class="o-list"><span>아이디 만들기 <i>폰 바꿔도 이어져요</i></span>
<span>구독 · 결제 <i>베타 무료</i></span><span>알림 · 문의</span></div>'''

# ════════════════════════════════════════════════════════════════════
# P. 페이퍼 스크랩북 — 놀이 35. 흰 마진 사진 + 테이프 하나, 세리프 헤딩
# ════════════════════════════════════════════════════════════════════
p_home = f'''
<div class="hi">8월 6일 목요일</div>
<div class="p-big">프로 답장이<br>도착했어요</div>
<div class="p-photo one"><span class="tape"></span>{scene(h=132, colors=SC2)}<b>어제의 스윙 · 정면</b></div>
<div class="p-q">“{CM_S}”</div>
<div class="cta">읽으러 가기</div>'''

p_rec = f'''
<div class="hi">2026년 8월</div>
<div class="p-cal">
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="dot">4</s><s class="sel dot">5</s><s class="today">6</s><s class="off">7</s><s class="off">8</s>
  </div>
</div>
<div class="p-note"><span class="tape"></span>
  <div class="ch">8월 5일의 답장</div>
  <div class="ct">“{CM2}”</div>
  <div class="cm">스윙 2편 · 내 메모 1</div>
</div>
<div class="soft">오늘 1편 올렸어요 — 한 개 더 가능</div>'''

p_gal = f'''
<div class="hi">스윙 스크랩</div>
<div class="p-photos">
  <div class="p-photo">{scene(h=118, colors=SC2)}<b>8/6 · 드라이버 <i class="amber">보는 중</i></b></div>
  <div class="p-photo"><span class="tape"></span>{scene(h=118, colors=SC2)}<b>8/5 · 아이언 <i class="green">한마디</i></b></div>
  <div class="p-photo">{scene(h=118, colors=SC2)}<b>8/5 · 아이언 <i>전달됨</i></b></div>
</div>
<div class="soft">오늘 2편 다 올렸어요</div>'''

p_les = f'''
<div class="hi">8월 5일 수요일 밤</div>
<div class="p-letter"><span class="tape"></span>
  <div class="ct tall">{CM}</div>
  <div class="p-sign">— 이도형, 사진 두 장과 함께</div>
  <div class="shots"><s></s><s></s></div>
</div>
<div class="soft">이 글이 달린 스윙 보기</div>'''

p_my = f'''
<div class="hi">골프러버</div>
<div class="p-big sm">이도형 프로와<br>32일째</div>
<div class="p-line">연습 12일 · 스윙 14편 · 한마디 6번 · 🔥 5일 연속</div>
<div class="p-note"><div class="ct">“꾸준히 오는 회원이 제일 늘어요.”</div></div>
<div class="soft">아이디 만들기 — 폰 바꿔도 이어져요</div>
<div class="soft dim">알림 · 구독(베타 무료) · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
# Q. 모닝 팬케이크 — 놀이 30. 플랫 파스텔, 이모지 0, 온기는 색과 문구
# ════════════════════════════════════════════════════════════════════
q_home = f'''
<div class="hi">좋은 아침이에요, 32일째</div>
<div class="q-block peach">
  <div class="qk">이도형 프로 · 방금</div>
  <div class="big">답장이<br>도착했어요</div>
  <div class="qs">“{CM_S[:26]}…” · 사진 2장</div>
</div>
<div class="cta">읽으러 가기</div>
<div class="q-block mint slim">오늘 스윙 1편 올림 · 한 개 더 가능</div>'''

q_rec = f'''
<div class="hi">8월의 기록</div>
<div class="q-week">
  <span>2</span><span>3</span><span class="on">4</span><span class="sel">5</span>
  <span class="now">6</span><span class="off">7</span><span class="off">8</span>
</div>
<div class="q-block cream">
  <div class="qk">8월 5일 (수)</div>
  <div class="ct">“{CM2}”</div>
</div>
<div class="q-block mint slim">스윙 2편 · 내 메모 1 — 그날 기록 열기</div>'''

q_gal = f'''
<div class="hi">스윙 서랍</div>
<div class="q-grid">
  <div class="q-cell">{scene(h=128, colors=SC2)}<b>8/6 드라이버</b><i class="amber">보는 중</i></div>
  <div class="q-cell">{scene(h=128, colors=SC2)}<b>8/5 아이언</b><i class="green">한마디 1</i></div>
  <div class="q-cell wide peach2">오늘 2편을 다 올렸어요 — 내일 정면부터</div>
</div>'''

q_les = f'''
<div class="hi">받은 답장</div>
<div class="q-block cream tall">
  <div class="qk">이도형 프로 · 8월 5일 오후 9:40 · 사진 2</div>
  <div class="ct tall">“{CM}”</div>
</div>
<div class="q-block mint slim">이 답이 달린 스윙 보기</div>'''

q_my = f'''
<div class="hi">골프러버 님</div>
<div class="q-block peach ctr">
  <div class="qnum">32</div>
  <div class="qk ctr">이도형 프로와 함께한 날</div>
</div>
<div class="q-cols">
  <div class="q-block cream half"><b>12</b><i>연습일</i></div>
  <div class="q-block cream half"><b>6</b><i>한마디</i></div>
</div>
<div class="q-block mint slim">아이디 만들기 — 폰 바꿔도 이어져요</div>
<div class="soft dim">알림 · 구독(베타 무료) · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
# R. 위켄드 멤버십 — 놀이 20. 거의 성인 앱, 클레이 액센트와 도장 점 하나
# ════════════════════════════════════════════════════════════════════
r_home = f'''
<div class="hi">8월 6일 목요일 · 32일째</div>
<div class="r-kick">프로 한마디 · 도착</div>
<div class="big xl">이도형 프로가<br>답을 남겼어요</div>
<div class="r-q">“{CM_S}”<span class="r-meta">방금 · 사진 2장</span></div>
<div class="cta">한마디 확인하기</div>
<div class="r-thin">오늘 스윙 1편 · 한 개 더 올릴 수 있어요</div>'''

r_rec = f'''
<div class="hi">2026년 8월</div>
<div class="r-cal">
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="dot">4</s><s class="sel dot">5</s><s class="today">6</s><s class="off">7</s><s class="off">8</s>
  </div>
</div>
<div class="r-day">
  <div class="ch">8월 5일 (수) <em>스윙 2 · 한마디 1</em></div>
  <div class="ct">“{CM2}”</div>
</div>
<div class="r-thin">오늘 스윙 1개 올렸어요 — 기록 한 줄 남기기</div>'''

r_gal = f'''
<div class="hi">스윙</div>
<div class="r-chips"><span class="on">전체</span><span>정면</span><span>측면</span><span>답장 받음</span></div>
<div class="r-sec">8월 6일 (목) <em>1편</em></div>
<div class="r-grid"><div class="r-cell">{scene(h=150, colors=SC2)}<b>정면 · 드라이버</b><i class="amber">보는 중</i></div>
<div class="r-cell add">＋<b>측면 올리기</b></div></div>
<div class="r-sec">8월 5일 (수) <em>2편</em></div>
<div class="r-grid"><div class="r-cell">{scene(h=150, colors=SC2)}<b>정면 · 아이언</b><i class="green">한마디 1</i></div>
<div class="r-cell">{scene(h=150, colors=SC2)}<b>측면 · 아이언</b><i>전달됨</i></div></div>'''

r_les = f'''
<div class="hi">레슨기록</div>
<div class="r-seg"><span class="off">정기 피드백</span><span class="on">프로 한마디</span></div>
<div class="r-day lift">
  <div class="ohh"><span class="cav">이</span><b>이도형 프로</b><i>8월 5일 오후 9:40 · 사진 2</i></div>
  <div class="ct tall">“{CM}”</div>
  <div class="shots"><s></s><s></s></div>
</div>
<div class="r-thin">내 스윙 영상은 글 끝에 — 글이 먼저</div>'''

r_my = f'''
<div class="hi">골프러버</div>
<div class="big xl">이도형 프로와<br>32일째</div>
<div class="r-stats"><span><b>12</b><i>연습일</i></span><span><b>14</b><i>스윙</i></span>
<span><b>6</b><i>한마디</i></span><span><b>5</b><i>연속</i></span></div>
<div class="r-day"><div class="ct">“꾸준히 오는 회원이 제일 늘어요.”</div></div>
<div class="r-list"><span>아이디 만들기 <i>폰 바꿔도 이어져요</i></span>
<span>구독 · 결제 <i>베타 무료</i></span><span>알림 · 문의</span></div>'''

# ════════════════════════════════════════════════════════════════════
THEMES = [
    ('nn', 'N. 클럽 다이어리', '놀이 50 — 도장·스티커 유지, 기울기와 이모지만 절반',
     'M 의 발명을 다 남겼다. 대신 외곽선을 2.5px→1.5px, 기울기를 ±2°→±1°, 이모지를 절반으로. '
     '스티커도 도장판도 그대로라서 아기자기함은 살아 있지만, 유치원은 벗어난다.',
     [('홈', n_home, '마스코트와 스티커는 남긴다',
       '골퍼 원형이 히어로에 겹치고 「사진 2장」 스티커도 그대로 — 각도만 얌전해졌다.'),
      ('연습기록', n_rec, '도장판 유지, 카드는 똑바로',
       '찍은 날 도장은 그대로, 답장 카드의 기울기만 없앴다 — 장난기는 도장에만.'),
      ('스윙', n_gal, '폴라로이드 유지, 기울기 ±1°',
       '앨범의 문법은 남기고 손맛만 줄였다. 상태 스티커도 그대로.'),
      ('레슨기록', n_les, '말풍선 유지',
       '카톡 문법 그대로 — 외곽선만 얇아져서 덜 만화 같다.'),
      ('마이', n_my, '불꽃 배지 유지',
       '트로피 방은 그대로. 통계 알약과 흐린 설정 줄도 M 과 같다.')]),

    ('oo', 'O. 소프트 클레이', '놀이 40 — 스티커를 칩으로, 볼록 버튼은 유지',
     '외곽선을 버리고 두툼한 라운드 면(클레이)으로 바꿨다. CTA 의 볼록 그림자(6px)만 '
     '남긴 것이 이 안의 장난기 전부다. 스티커는 색 칩으로 강등, 도장은 채움 원으로.',
     [('홈', o_home, '히어로가 카드 한 장으로',
       '프로 머리줄 + 큰 제목 + 인용이 한 클레이 면 안에. 볼록 CTA 가 유일한 놀이.'),
      ('연습기록', o_rec, '주간 채움 원 + 그날 카드',
       '도장 대신 채움 원 일곱 개. 그날 스윙 썸네일 두 개가 카드 안에 들어온다.'),
      ('스윙', o_gal, '격자로 복귀, 칩은 컬러로',
       '폴라로이드를 접고 2열 격자. 상태는 앰버/그린 색 글자 — 실무형에 가까워진다.'),
      ('레슨기록', o_les, '답장 카드 한 장',
       '말풍선 대신 카드. 이 화면의 그림자 하나를 여기에 쓴다(lift).'),
      ('마이', o_my, '32가 클레이 면 위에',
       '숫자 크게 + 알약 통계. 설정은 리스트로 — 절반쯤 어른이 됐다.')]),

    ('pp', 'P. 페이퍼 스크랩북', '놀이 35 — 테이프 한 조각과 흰 마진 사진만',
     '크래프트지 배경에 흰 마진 사진(폴라로이드의 흔적)과 마스킹테이프 한 조각. 헤딩은 '
     '세리프로 올려 어른의 스크랩북이 됐다. 기울기 0, 이모지 0.',
     [('홈', p_home, '사진 한 장이 히어로',
       '어제의 스윙이 흰 마진 사진으로, 테이프 한 조각이 유일한 장난기.'),
      ('연습기록', p_rec, '달력은 지면에 바로',
       '격자를 종이 위에 그대로 얹고, 답장은 테이프 붙인 메모지로.'),
      ('스윙', p_gal, '스크랩 리스트',
       '흰 마진 사진 세 장 세로로. 테이프는 답장 받은 한 장에만 — 강조가 곧 장식.'),
      ('레슨기록', p_les, '편지지 한 장',
       '프로의 글이 메모지 전면에. 「— 이도형」 서명으로 끝난다.'),
      ('마이', p_my, '세리프 표제 + 한 줄 통계',
       '「이도형 프로와 32일째」 세리프. 불꽃은 글자로만(🔥 하나 남김).')]),

    ('qq', 'Q. 모닝 팬케이크', '놀이 30 — 플랫 파스텔, 이모지 0, 온기는 색과 문구',
     '외곽선·그림자·스티커·테이프 전부 0. 피치/민트/크림 세 가지 파스텔 면과 '
     '「좋은 아침이에요」 같은 문구만으로 온기를 낸다. 토스처럼 플랫하지만 색은 따뜻하다.',
     [('홈', q_home, '피치 블록이 히어로',
       '장식 없이 색면 하나가 반가움을 낸다. 아래 민트 한 줄이 오늘의 진행.'),
      ('연습기록', q_rec, '주간 알약 + 크림 카드',
       '요일 알약 일곱 개, 고른 날은 잉크색. 블록 높이가 다 달라 리듬이 생긴다.'),
      ('스윙', q_gal, '격자 + 안내 블록',
       '셀 두 개 다음에 피치 와이드 블록 — 「오늘 2편 다 올렸어요」가 카드 높이를 깬다.'),
      ('레슨기록', q_les, '크림 한 장에 전문',
       '답장 전문이 크림 블록 하나에. 메타는 위 한 줄로 정리.'),
      ('마이', q_my, '숫자도 파스텔 면 위에',
       '32 피치, 통계는 반쪽 크림 두 개 — 면 크기가 곧 우선순위다.')]),

    ('rr', 'R. 위켄드 멤버십', '놀이 20 — 거의 성인 앱, 클레이 한 방울',
     '조판은 실무형(실제 앱 구조와 거의 같다). 남긴 온기는 셋 — 클레이색 액센트, 달력의 '
     '도장 점, 「32일째」라는 관계의 숫자. 지금 앱에 이식하기 가장 쉬운 안.',
     [('홈', r_home, '실제 히어로 문법 + 클레이 CTA',
       'kick→제목→인용→CTA — runtime 의 실제 순서. 색 하나로만 온기를 낸다.'),
      ('연습기록', r_rec, '실제 2b 구조',
       '달력(도장 점)→날짜 요약→접힘 줄 — 지금 앱 순서 그대로, 종이색만 따뜻하게.'),
      ('스윙', r_gal, '실제 갤러리 구조',
       '칩·날짜 머리글·2열 셀·상태색 — 실무 그대로. 「측면 올리기」가 하루 2편 규칙.'),
      ('레슨기록', r_les, '실제 pc1 + 세그먼트',
       '정기 피드백 잠금 세그먼트와 댓글줄 — 온기는 아바타의 클레이색뿐.'),
      ('마이', r_my, '관계 표제 + 4칸 통계',
       '「이도형 프로와 32일째」가 표제, 실제 4칸 통계가 밑에. 어른의 마무리.')]),
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
<title>NEXT SWING · 선데이 클럽 톤다운 5단계 (놀이 50→20)</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
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
  min-height:700px;position:relative;box-shadow:0 18px 44px -18px rgba(0,0,0,.7)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700;position:relative;z-index:4}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.8}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px}}
.ph-body{{flex:1;padding:12px 18px 18px;display:flex;flex-direction:column;position:relative}}
.tabs{{display:flex;padding:8px 0 10px;position:relative;z-index:4}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}}
.tb b{{font-size:9px;font-weight:700}}
.scene{{position:relative;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}}
.bd{{position:absolute;left:8px;top:8px;font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px}}
.cta{{border-radius:99px;text-align:center;padding:15px;font-size:15px;font-weight:800;margin-top:26px}}
.hi{{font-size:14px;padding:8px 0 26px}}
.big{{font-size:27px;line-height:1.42;font-weight:800}}
.big.xl{{font-size:26px}}
.soft{{text-align:center;font-size:12px;padding-top:20px}}
.soft.dim{{padding-top:8px;font-size:11px;opacity:.65}}
.shots{{display:flex;gap:7px;padding:12px 0 0}}
.shots s{{width:46px;height:60px;border-radius:8px;display:block;
  background:linear-gradient(#C3DCE9 44%,#96BE8D 44%)}}
.ch{{font-size:12px;font-weight:700;padding-bottom:8px;display:flex;justify-content:space-between}}
.ch em{{font-style:normal;font-weight:500;opacity:.6;font-size:11px}}
.ct{{font-size:14.5px;line-height:1.85}}
.ct.tall{{line-height:2.0}}
.cm{{font-size:10.5px;opacity:.55;padding-top:8px}}
.cav{{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:14px;font-weight:800}}
.ohh{{display:flex;align-items:center;gap:9px;padding-bottom:12px}}
.ohh b{{font-size:13px;font-weight:800}}
.ohh i{{font-style:normal;font-size:10.5px;opacity:.55;margin-left:auto}}
.amber{{color:#C08A2D!important}} .green{{color:#4C7A52!important}}
.cal-w,.cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.cal-w s{{text-decoration:none;font-size:10px;font-weight:700;opacity:.5;padding:3px 0}}
.cal-g s{{text-decoration:none;font-size:13px;font-weight:600;height:34px;position:relative;
  display:flex;align-items:center;justify-content:center;border-radius:50%}}
.cal-g s.off{{opacity:.3}}
.cal-g s.dot:after{{content:'';position:absolute;bottom:2px;left:50%;margin-left:-2px;
  width:4px;height:4px;border-radius:50%;background:#C96F3B}}
.pills{{display:flex;gap:8px;justify-content:center;padding-top:24px;flex-wrap:wrap}}
.pills span{{border-radius:99px;padding:8px 14px;font-size:12.5px}}
.chat{{display:flex;gap:9px;align-items:flex-start}}
.chat.me{{justify-content:flex-end;padding-top:16px}}
.bub{{border-radius:4px 18px 18px 18px;padding:13px 15px;font-size:13.5px;line-height:1.85;max-width:85%}}
.bub.me{{border-radius:18px 4px 18px 18px;font-size:13px}}

/* ══ N. 클럽 다이어리 (50) ══ */
.ph.nn{{background:#F7EFDF;color:#41372B;font-family:'Jua',sans-serif}}
.ph.nn .beta{{background:#EADFC8;color:#8A6A3B}}
.ph.nn .tabs{{background:#FFFBF2;border-top:1.5px solid #EADFC8}}
.ph.nn .tb{{color:#BCA987}} .ph.nn .tb.on{{color:#C96F3B}}
.ph.nn .cta{{background:#C96F3B;color:#FFF8EC;box-shadow:0 4px 0 #A5552A;font-weight:400}}
.ph.nn .big{{font-weight:400}}
.n-hero{{position:relative;background:#FFFBF2;border-radius:24px;padding:28px 22px 24px;
  border:1.5px solid #41372B}}
.n-ball{{position:absolute;right:-8px;top:-24px;width:74px;height:74px;border-radius:50%;
  overflow:hidden;border:1.5px solid #41372B;transform:rotate(2deg)}}
.n-ball .scene{{position:absolute;inset:0;height:auto!important;border-radius:0}}
.n-stick{{position:absolute;left:18px;bottom:-12px;background:#F2B93B;color:#5C431A;
  font-size:11.5px;border-radius:99px;padding:5px 12px;transform:rotate(-1deg);
  border:1.5px solid #41372B}}
.n-stick.mini{{position:absolute;left:auto;bottom:auto;right:-10px;top:-9px;font-size:10px;
  padding:4px 9px;transform:rotate(-1deg)}}
.n-stick.mini.gold{{background:#C96F3B;color:#FFF8EC}}
.n-stamps{{display:flex;gap:7px;padding-bottom:6px}}
.n-stamps span{{flex:1;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:14px;color:#BCA987;border:1.5px dashed #DECDA9}}
.n-stamps .on{{background:#96BE8D;border:1.5px solid #41372B;color:#2E4027}}
.n-stamps .on.now{{background:#C96F3B;color:#FFF8EC;transform:scale(1.1)}}
.n-stamps .half{{border:1.5px solid #41372B;color:#41372B}}
.n-stamps .off{{border:0;font-size:11px}}
.n-card{{background:#FFFBF2;border:1.5px solid #41372B;border-radius:20px;
  padding:17px 17px 14px;margin-top:22px;position:relative}}
.n-card .ch{{color:#C96F3B}}
.n-card .n-stick.mini{{right:12px;top:-11px}}
.n-pols{{display:flex;flex-direction:column;gap:18px}}
.n-pol{{background:#FFFBF2;border:1.5px solid #41372B;border-radius:6px;padding:7px 7px 9px;
  width:86%;position:relative}}
.n-pol b{{display:block;font-size:12px;padding-top:7px;font-weight:400}}
.n-pol.r1{{transform:rotate(-1deg)}}
.n-pol.r2{{transform:rotate(.8deg);align-self:flex-end}}
.ph.nn .cav{{background:#C96F3B;color:#FFF8EC;border:1.5px solid #41372B}}
.ph.nn .bub{{background:#FFFBF2;border:1.5px solid #41372B}}
.ph.nn .bub.me{{background:#96BE8D}}
.ph.nn .shots{{padding-left:45px}}
.ph.nn .shots s{{border:1.5px solid #41372B}}
.n-badge{{background:#FFFBF2;border:1.5px solid #41372B;border-radius:24px;text-align:center;
  padding:24px 0 18px}}
.n-badge .fl{{font-size:44px;line-height:1}}
.n-badge .bt{{font-size:22px;padding-top:6px}}
.n-badge .bs{{font-size:11.5px;color:#BCA987;padding-top:3px}}
.ph.nn .pills span{{background:#EADFC8;color:#5C431A}}
.ph.nn .pills .gold{{background:#F2B93B}}
.ph.nn .soft{{color:#BCA987}}

/* ══ O. 소프트 클레이 (40) ══ */
.ph.oo{{background:#F5EDE2;color:#3D3529;font-family:'Gowun Dodum',sans-serif}}
.ph.oo .beta{{background:#E9DECB;color:#8A6A3B}}
.ph.oo .tabs{{background:#FBF5EA;border-top:1px solid #E4D8C2}}
.ph.oo .tb{{color:#B7A98D}} .ph.oo .tb.on{{color:#C0653A}}
.ph.oo .cta{{background:#C0653A;color:#FFF6EA;box-shadow:0 6px 0 #97482A}}
.o-hero{{background:#FBF5EA;border-radius:24px;padding:20px 20px 18px}}
.o-hero.ctr{{text-align:center;padding:30px 20px}}
.ph.oo .cav{{background:#E9DECB;color:#8A6A3B}}
.oq{{font-size:13.5px;line-height:1.9;padding-top:12px;color:#6B5F4A}}
.onum{{font-size:56px;font-weight:700;color:#C0653A;line-height:1}}
.onum span{{font-size:16px;color:#8A6A3B;margin-left:4px}}
.obs{{font-size:12.5px;color:#8A6A3B;padding-top:6px}}
.o-week{{display:flex;gap:6px;padding-bottom:20px}}
.o-week span{{flex:1;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-size:13px;color:#B7A98D;background:#EDE2CF}}
.o-week .on{{background:#96BE8D;color:#2E4027;font-weight:700}}
.o-week .sel{{background:#C0653A;color:#FFF6EA}}
.o-week .now{{box-shadow:inset 0 0 0 2px #3D3529;background:#FBF5EA;color:#3D3529;font-weight:700}}
.o-week .off{{opacity:.4}}
.o-card{{background:#FBF5EA;border-radius:22px;padding:18px 18px 15px}}
.o-card.lift{{box-shadow:0 14px 28px -18px rgba(90,60,20,.5)}}
.o-card .ch{{color:#C0653A}}
.orow{{display:flex;gap:8px;align-items:center;padding-top:12px}}
.orow em{{font-style:normal;margin-left:auto;font-size:12px;font-weight:700;color:#C0653A}}
.o-chips{{display:flex;gap:7px;padding-bottom:14px}}
.o-chips span{{font-size:12px;border-radius:99px;padding:8px 13px;background:#EDE2CF;color:#8A6A3B}}
.o-chips .on{{background:#3D3529;color:#FBF5EA}}
.o-grid{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.o-cell{{background:#FBF5EA;border-radius:18px;padding:8px 8px 10px}}
.o-cell b{{display:block;font-size:12px;padding:8px 3px 2px;font-weight:700}}
.o-cell i{{font-style:normal;font-size:10.5px;padding-left:3px;color:#B7A98D}}
.o-cell.add{{display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;color:#C0653A;font-size:22px;min-height:170px}}
.o-cell.add b{{font-size:12px;padding:0}}
.o-list{{background:#FBF5EA;border-radius:20px;overflow:hidden;margin-top:20px}}
.o-list span{{display:flex;justify-content:space-between;padding:15px 17px;font-size:13px;
  font-weight:700;border-bottom:1px solid #EDE2CF}}
.o-list span:last-child{{border-bottom:0}}
.o-list i{{font-style:normal;font-size:11px;color:#B7A98D;font-weight:400}}
.ph.oo .pills span{{background:#EDE2CF;color:#6B5F4A}}
.ph.oo .pills .gold{{background:#E8B54B;color:#5C431A}}
.ph.oo .soft{{color:#B7A98D}}

/* ══ P. 페이퍼 스크랩북 (35) ══ */
.ph.pp{{background:#EFE6D3;color:#3B342A;font-family:'Noto Sans KR',sans-serif}}
.ph.pp .beta{{background:#E2D6BC;color:#7A6B4C}}
.ph.pp .tabs{{background:#EFE6D3;border-top:1px solid #DCCFB2}}
.ph.pp .tb{{color:#AB9D7F}} .ph.pp .tb.on{{color:#3B342A}}
.ph.pp .cta{{background:#3B342A;color:#EFE6D3;border-radius:4px}}
.ph.pp .hi{{font-family:'Gowun Batang',serif;letter-spacing:.05em;font-size:12px;color:#8A7B5C}}
.p-big{{font-family:'Gowun Batang',serif;font-size:28px;font-weight:700;line-height:1.5;padding-bottom:22px}}
.p-big.sm{{font-size:25px;padding-bottom:14px}}
.tape{{position:absolute;left:50%;top:-9px;width:64px;height:18px;margin-left:-32px;
  background:rgba(214,183,106,.55);transform:rotate(-2deg)}}
.p-photo{{background:#FBF6EC;padding:8px 8px 10px;position:relative;
  box-shadow:0 8px 18px -12px rgba(60,45,15,.4)}}
.p-photo.one{{margin:0 6px}}
.p-photo b{{display:flex;justify-content:space-between;font-size:11.5px;padding-top:8px;font-weight:700;color:#6B5F45}}
.p-photo i{{font-style:normal;font-weight:700}}
.p-q{{font-family:'Gowun Batang',serif;font-size:14.5px;line-height:1.95;padding:22px 2px 0}}
.p-cal{{padding-bottom:4px}}
.ph.pp .cal-g s.sel{{background:#3B342A;color:#EFE6D3}}
.ph.pp .cal-g s.today{{box-shadow:inset 0 0 0 1.5px #3B342A}}
.p-note{{background:#FBF6EC;padding:16px 16px 13px;position:relative;margin-top:24px;
  box-shadow:0 8px 18px -12px rgba(60,45,15,.35)}}
.p-note .ch{{color:#B0663F}}
.p-photos{{display:flex;flex-direction:column;gap:16px}}
.p-letter{{background:#FBF6EC;padding:22px 20px 16px;position:relative;
  box-shadow:0 8px 18px -12px rgba(60,45,15,.4)}}
.p-letter .ct{{font-family:'Gowun Batang',serif}}
.p-sign{{font-family:'Gowun Batang',serif;text-align:right;font-size:12.5px;color:#8A7B5C;padding-top:14px}}
.p-line{{font-size:12px;color:#8A7B5C;border-top:1px solid #DCCFB2;border-bottom:1px solid #DCCFB2;
  padding:12px 2px;margin-bottom:20px}}
.ph.pp .soft{{color:#AB9D7F}}
.ph.pp .shots s{{border-radius:2px}}

/* ══ Q. 모닝 팬케이크 (30) ══ */
.ph.qq{{background:#FBF7F0;color:#42403B;font-family:'Noto Sans KR',sans-serif}}
.ph.qq .beta{{background:#F1E8DB;color:#9C8A6A}}
.ph.qq .tabs{{background:#FBF7F0;border-top:1px solid #EEE6D8}}
.ph.qq .tb{{color:#C4BBA9}} .ph.qq .tb.on{{color:#D97B4F}}
.ph.qq .cta{{background:#D97B4F;color:#FFF8F0;border-radius:18px}}
.q-block{{border-radius:20px;padding:20px;margin-bottom:12px}}
.q-block.peach{{background:#F9E3D3}}
.q-block.peach2,.q-cell.wide.peach2{{background:#F9E3D3}}
.q-block.mint{{background:#E2EFE0}}
.q-block.cream{{background:#F4EDDF}}
.q-block.slim{{padding:14px 18px;font-size:12.5px;font-weight:700;color:#5E7A5C}}
.q-block.tall{{padding:22px 20px}}
.q-block.ctr{{text-align:center;padding:28px 20px}}
.qk{{font-size:11.5px;font-weight:700;color:#C06A3E;padding-bottom:8px}}
.qk.ctr{{padding:6px 0 0;color:#9C8A6A}}
.qs{{font-size:11.5px;color:#9C8A6A;padding-top:10px}}
.qnum{{font-size:54px;font-weight:900;color:#D97B4F;line-height:1}}
.q-week{{display:flex;gap:6px;padding-bottom:18px}}
.q-week span{{flex:1;border-radius:14px;padding:11px 0;text-align:center;font-size:13px;
  background:#F4EDDF;color:#C4BBA9}}
.q-week .on{{background:#E2EFE0;color:#4C7A52;font-weight:700}}
.q-week .sel{{background:#42403B;color:#FBF7F0;font-weight:700}}
.q-week .now{{box-shadow:inset 0 0 0 1.5px #42403B;color:#42403B;font-weight:700}}
.q-week .off{{opacity:.45}}
.q-grid{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.q-cell{{background:#F4EDDF;border-radius:18px;padding:8px 8px 10px}}
.q-cell b{{display:block;font-size:12px;font-weight:700;padding:8px 3px 2px}}
.q-cell i{{font-style:normal;font-size:10.5px;padding-left:3px;color:#C4BBA9}}
.q-cell.wide{{grid-column:1/3;display:flex;align-items:center;justify-content:center;
  font-size:12.5px;font-weight:700;color:#A05A34;min-height:64px}}
.q-cols{{display:flex;gap:10px}}
.q-block.half{{flex:1;text-align:center;padding:18px 0}}
.q-block.half b{{font-size:26px;font-weight:900;display:block}}
.q-block.half i{{font-style:normal;font-size:11px;color:#9C8A6A}}
.ph.qq .soft{{color:#C4BBA9}}

/* ══ R. 위켄드 멤버십 (20) ══ */
.ph.rr{{background:#F6F1E8;color:#2C2A24;font-family:'Noto Sans KR',sans-serif}}
.ph.rr .beta{{background:#EAE3D3;color:#6E6448}}
.ph.rr .tabs{{background:#FCF8F1;border-top:1px solid #E5DDCB}}
.ph.rr .tb{{color:#B0A78F}} .ph.rr .tb.on{{color:#B85C33}}
.ph.rr .cta{{background:#2C2A24;color:#F6F1E8;border-radius:14px}}
.r-kick{{font-size:12px;font-weight:800;color:#B85C33;padding-bottom:8px}}
.r-q{{font-size:14px;line-height:1.9;color:#4E4A3E;padding:18px 2px 0}}
.r-meta{{display:block;font-size:11px;color:#A79D83;padding-top:8px}}
.r-thin{{border-top:1px solid #E5DDCB;margin-top:24px;padding:13px 2px 0;font-size:12px;
  color:#6E6448;font-weight:500}}
.r-cal{{background:#FCF8F1;border:1px solid #E5DDCB;border-radius:16px;padding:13px}}
.ph.rr .cal-g s.sel{{background:#2C2A24;color:#F6F1E8}}
.ph.rr .cal-g s.today{{box-shadow:inset 0 0 0 1.5px #2C2A24}}
.r-day{{background:#FCF8F1;border:1px solid #E5DDCB;border-radius:16px;padding:16px;margin-top:14px}}
.r-day.lift{{box-shadow:0 10px 22px -16px rgba(70,50,20,.4)}}
.r-day .ch{{color:#B85C33}}
.r-chips{{display:flex;gap:6px;padding-bottom:12px}}
.r-chips span{{font-size:12px;font-weight:700;border-radius:9px;padding:7px 12px;
  background:#FCF8F1;color:#6E6448;border:1px solid #E5DDCB}}
.r-chips .on{{background:#2C2A24;color:#F6F1E8;border-color:#2C2A24}}
.r-sec{{display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;
  padding:12px 2px 8px}}
.r-sec em{{font-style:normal;font-size:11px;color:#A79D83;font-weight:600}}
.r-grid{{display:grid;grid-template-columns:1fr 1fr;gap:9px}}
.r-cell{{background:#FCF8F1;border:1px solid #E5DDCB;border-radius:14px;padding:7px 7px 9px}}
.r-cell b{{display:block;font-size:11.5px;font-weight:700;padding:7px 3px 2px}}
.r-cell i{{font-style:normal;font-size:10.5px;padding-left:3px;color:#A79D83;font-weight:700}}
.r-cell.add{{display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;border-style:dashed;color:#B85C33;font-size:20px;min-height:150px}}
.r-cell.add b{{font-size:12px;padding:0}}
.r-seg{{display:flex;background:#FCF8F1;border:1px solid #E5DDCB;border-radius:12px;
  padding:4px;margin-bottom:14px}}
.r-seg span{{flex:1;text-align:center;font-size:12.5px;font-weight:800;padding:9px 0;border-radius:9px}}
.r-seg .on{{background:#2C2A24;color:#F6F1E8}}
.r-seg .off{{color:#B0A78F}}
.ph.rr .cav{{background:#F3DBC9;color:#B85C33}}
.r-stats{{display:flex;background:#FCF8F1;border:1px solid #E5DDCB;border-radius:14px;
  padding:13px 0;margin:22px 0 0}}
.r-stats span{{flex:1;text-align:center;border-right:1px solid #E5DDCB}}
.r-stats span:last-child{{border-right:0}}
.r-stats b{{font-size:19px;font-weight:800;display:block;color:#B85C33}}
.r-stats i{{font-style:normal;font-size:10px;color:#A79D83;font-weight:700}}
.r-list{{background:#FCF8F1;border:1px solid #E5DDCB;border-radius:16px;overflow:hidden;margin-top:14px}}
.r-list span{{display:flex;justify-content:space-between;padding:14px 16px;font-size:13px;
  font-weight:600;border-bottom:1px solid #E5DDCB}}
.r-list span:last-child{{border-bottom:0}}
.r-list i{{font-style:normal;font-size:11px;color:#A79D83}}
</style>

<h1>선데이 클럽, 톤다운 다섯 단계 — 놀이 50 → 20</h1>
<p class="lede">M(선데이 클럽)의 발명 — 도장판 · 스티커 · 반가움의 문구 · 폴라로이드 — 을
버리지 않고, 단계마다 하나씩 얌전하게 만들었다. 다섯 안 모두 관계형 문구와 실제 앱 사실
(하루 2편 · 상태색 · 이번 달 통계 · 아이디 이어붙이기)은 유지. 아래로 갈수록 어른이 된다 —
N(50) 도장·스티커 유지 → O(40) 클레이 면 → P(35) 스크랩북 → Q(30) 플랫 파스텔 →
R(20) 거의 성인 앱.</p>
{sections}
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
