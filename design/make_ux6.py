# -*- coding: utf-8 -*-
"""레이아웃 탐색 6안 — 같은 철학(레슨은 대화다), 다른 뼈대 여섯.

「레슨은 대화다」 설계판(make_ux.py)이 정한 것 — 레슨 레일 · 프로의 말 규칙 ·
우리 팔레트 — 은 그대로 두고, **화면을 어떻게 접는가**만 여섯 방향으로 벌린다.
주제당 5화면, 총 30장.
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-layouts.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고 스무 번만 천천히.'
CM_S = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
CM2 = '하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'
NOTE = '톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.'

V = {'bg': '#F5F1E9', 'card': '#FFFDF8', 'line': '#E3DCCD', 'ink': '#1D2420',
     'sub': '#4A503F', 'dim': '#8C8574', 'green': '#21402F', 'soft': '#EAF0EA',
     'bronze': '#8A6428', 'bsoft': '#F4ECDD', 'warn': '#C98A12', 'nav': '#FFFDF8'}

TABS = ['오늘', '달력', '스윙', '대화', '마이']
ICONS = {
    '오늘': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    '달력': '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    '스윙': '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    '대화': '<path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    '마이': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
}
GOLFER = ('<svg viewBox="0 0 60 80" style="position:absolute;left:50%;bottom:8%;width:32%;'
          'transform:translateX(-54%)"><g fill="#22301F">'
          '<circle cx="34" cy="12" r="6"/>'
          '<path d="M30 18c-6 2-9 8-10 16l-3 22 6 20h5l-3-19 5-14 8 13 2 20h5l-1-22-6-16'
          'c3-6 2-14-1-18-2-2-4-3-7-2z"/>'
          '<path d="m28 26-16 20 2 2 17-16z"/></g>'
          '<rect x="10" y="45" width="3" height="3" rx="1.5" fill="#fff"/></svg>')

STEPS = ['찍기', '보내기', '프로 확인', '답장']


def icon(name, sz=19):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round" '
            f'style="width:{sz}px;height:{sz}px;display:block">{ICONS[name]}</svg>')


def rail(stage, small=False):
    cells = ''
    for i, name in enumerate(STEPS):
        cls = 'done' if i < stage else ('now' if i == stage else '')
        cells += (f'<span class="rl-s {cls}"><i></i>'
                  + ('' if small else f'<b>{name}</b>') + '</span>')
        if i < 3:
            cells += f'<span class="rl-b{" on" if i < stage else ""}"></span>'
    return f'<div class="rail{" sm" if small else ""}">{cells}</div>'


def scene(label, h=140):
    return (f'<div class="scene" style="height:{h}px;flex:none">'
            f'<i style="background:#CBDFEC;height:44%"></i>'
            f'<i style="background:#A9C9A4;height:16%"></i>'
            f'<i style="background:#6FA477;flex:1"></i>{GOLFER}'
            + (f'<span class="bd">{label}</span>' if label else '') + '</div>')


def pro(text, when='', big=False):
    return (f'<div class="pro{" big" if big else ""}">'
            + (f'<div class="pro-w">이도형 프로 · {when}</div>' if when else '')
            + f'<div class="pro-t">{text}</div></div>')


def me(text):
    return f'<div class="meq">{text}</div>'


def tabbar(on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n)}<b>{n}</b></span>'
                      for n in TABS) + '</div>')


def frame(title, tab, body, cls=''):
    return (f'<div class="ph {cls}"><div class="ph-top"><span>9:41</span>'
            f'<i class="beta">베타</i><span class="batt"></span></div>'
            + (f'<div class="ph-head">{title}</div>' if title else '')
            + f'<div class="ph-body">{body}</div>{tabbar(tab)}</div>')


# ════════════════════════════════════════════════════════════════════
# A. 메신저 — 앱 전체가 하나의 대화방이다
# ════════════════════════════════════════════════════════════════════
a_home = f'''
<div class="pin">{rail(3, True)}<b>오늘 한 바퀴 — 답장 도착</b></div>
<div class="dvd">오늘</div>
{me('측면 스윙 보냈어요')}
<div class="me-sw">{scene('측면', 64)}{me(f'“{NOTE}”')}</div>
{pro(f'“{CM_S}”', '방금')}
<div class="grow"></div>
<div class="cmp"><span class="cam">{icon('스윙', 18)}</span><i>메모를 남겨보세요…</i><b>전송</b></div>'''

a_cal = f'''
<div class="cal">
  <div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="d-ans">4</s><s class="sel d-ans">5</s><s class="today d-wait">6</s><s class="off">7</s><s class="off">8</s>
  </div>
</div>
<div class="dvd">8월 5일 (수) 의 대화</div>
<div class="me-sw">{scene('정면', 56)}{me(f'“{NOTE}”')}</div>
{pro(f'“{CM2}”', '오후 9:40')}
<div class="more">그날 대화로 이동 →</div>'''

a_swings = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">답장 받음</span></div>
<div class="sec">8월 6일</div>
<div class="g3">{scene('측면', 92)}{scene('정면', 92)}</div>
<div class="sec">8월 5일</div>
<div class="g3">{scene('정면', 92)}{scene('측면', 92)}{scene('정면', 92)}</div>
<div class="sec">8월 4일</div>
<div class="g3">{scene('정면', 92)}</div>'''

a_talk = f'''
<div class="srch">🔍 대화 검색 — “어깨”</div>
<div class="dvd">8월 4일 (화)</div>
{me('정면 스윙 1개 보냈어요')}
{pro(f'“{CM2}”', '오후 8:10')}
<div class="dvd">8월 5일 (수)</div>
<div class="me-sw">{scene('정면', 64)}{me(f'“{NOTE}”')}</div>
{pro(f'“{CM}”', '오후 9:40 · 사진 2장')}'''

a_my = f'''
<div class="ctc"><span class="av big">골</span><b>골프러버</b><i>이도형 프로와 32일째 대화 중</i></div>
<div class="act3"><span>{icon('대화', 17)}<b>대화</b></span><span>{icon('스윙', 17)}<b>사진첩</b></span>
<span>{icon('달력', 17)}<b>약속</b></span></div>
{pro('“꾸준히 오는 회원이 제일 늘어요. 이번 달도 잘 부탁합니다.”')}
<div class="list"><span>계정 · 아이디 관리</span><span>알림 설정</span>
<span>구독 · 결제 <i>베타 무료</i></span><span>문의하기</span></div>'''

# ════════════════════════════════════════════════════════════════════
# B. 풀스크린 한 장 — 화면마다 문장 하나, 큰 활자
# ════════════════════════════════════════════════════════════════════
b_home = f'''
<div class="grow"></div>
<div class="big-k">오늘 한 바퀴 · 마지막 단계</div>
<div class="big-t">답장이<br>왔습니다</div>
{pro(f'“{CM_S}”', big=True)}
<div class="cta">답장 읽기</div>
<div class="dots"><i class="on"></i><i></i><i></i></div>
<div class="grow"></div>'''

b_cal = f'''
<div class="ag"><span><b>8월 6일 (목)</b><i>측면 스윙 · 프로가 보는 중</i></span>{rail(2, True)}</div>
<div class="ag on"><span><b>8월 5일 (수)</b><i>“{CM2}”</i></span>{rail(4, True)}</div>
<div class="ag"><span><b>8월 4일 (화)</b><i>정면 스윙 · 답장 받음</i></span>{rail(4, True)}</div>
<div class="ag off"><span><b>8월 3일 (월)</b><i>기록 없음</i></span></div>
<div class="ag off"><span><b>8월 2일 (일)</b><i>기록 없음</i></span></div>'''

b_swings = f'''
{scene('8월 5일 · 정면 · 아이언', 330)}
{rail(4)}
<div class="car"><span>‹</span><div class="dots"><i></i><i class="on"></i><i></i><i></i></div><span>›</span></div>
<div class="rhythm">좌우로 넘기며 스윙을 한 장씩 — 비교는 두 장을 겹쳐서</div>'''

b_talk = f'''
<div class="ltr">
  <div class="ltr-d">8월 5일 수요일 밤</div>
  <div class="ltr-t">골프러버 님,<br><br>{CM}<br><br>다음 스윙에서 봅시다.</div>
  <div class="ltr-s">— 이도형</div>
</div>
<div class="dots"><i></i><i class="on"></i><i></i></div>'''

b_my = f'''
<div class="grow"></div>
<div class="huge">32</div>
<div class="huge-s">이도형 프로와 함께한 날</div>
<div class="pact">
  <div class="pact-t">8월의 약속 — 한마디 5회</div>
  <div class="pact-s"><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i></div>
</div>
<div class="grow"></div>
<div class="mini-l">계정 · 알림 · 구독 · 문의</div>'''

# ════════════════════════════════════════════════════════════════════
# C. 피드 — 하루하루가 카드로 쌓이는 스트림
# ════════════════════════════════════════════════════════════════════
def fc(head, when, body):
    return (f'<div class="fc"><div class="fc-h"><span class="av sm">{head[0]}</span>'
            f'<b>{head}</b><i>{when}</i></div>{body}</div>')

c_home = (
    fc('이도형 프로', '방금',
       pro(f'“{CM_S}”') + '<div class="cta sm">답장 읽기</div>')
    + fc('내 스윙', '오늘 오후 6:20', scene('측면 · 드라이버', 120) + rail(2, True))
    + fc('이도형 프로', '어제', pro(f'“{CM2}”')))

c_cal = f'''
<div class="wk"><s>일<b>2</b></s><s>월<b>3</b></s><s class="has">화<b>4</b></s>
<s class="has sel">수<b>5</b></s><s class="now">목<b>6</b></s><s>금<b>7</b></s><s>토<b>8</b></s></div>
{fc('내 스윙', '8월 5일 오후 6:02', scene('정면 · 아이언', 110) + rail(4, True))}
{fc('이도형 프로', '8월 5일 오후 9:40', pro(f'“{CM2}”'))}'''

c_swings = f'''
{fc('측면 · 드라이버', '8월 6일', scene('측면', 190) + rail(2, True))}
{fc('정면 · 드라이버', '8월 6일', scene('정면', 190) + rail(2, True))}'''

c_talk = f'''
<div class="sec">프로의 말 모아보기</div>
{fc('이도형 프로', '8월 5일', pro(f'“{CM}”'))}
{fc('이도형 프로', '8월 4일', pro(f'“{CM2}”'))}'''

c_my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
<div class="bar7">
  <div class="sec" style="padding-top:0">이번 주 스윙</div>
  <div class="b7"><i style="height:30%"></i><i style="height:55%"></i><i style="height:0"></i>
  <i style="height:80%" class="on"></i><i style="height:45%" class="on"></i>
  <i style="height:0"></i><i style="height:0"></i></div>
  <div class="b7-l"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
</div>
{fc('이도형 프로', '이번 달', pro('“꾸준히 오는 회원이 제일 늘어요.”'))}'''

# ════════════════════════════════════════════════════════════════════
# D. 대시보드 — 위젯 모듈, 정보 밀도를 올린 안
# ════════════════════════════════════════════════════════════════════
def wg(title, body, half=False):
    return (f'<div class="wg{" hf" if half else ""}">'
            + (f'<div class="wg-t">{title}</div>' if title else '') + body + '</div>')

d_home = (
    wg('오늘 한 바퀴', rail(3))
    + wg('', pro(f'“{CM_S}”', '방금') + '<div class="cta sm">답장 읽기</div>')
    + '<div class="wrow">'
    + wg('8월', '<div class="mini-cal"><s></s><s></s><s>4</s><s class="on">5</s>'
               '<s class="nw">6</s><s></s><s></s></div>', True)
    + wg('오늘 스윙', scene('측면', 64) + '<div class="wg-n">1 / 2개</div>', True)
    + '</div>'
    + wg('', '<div class="pact-s"><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i></div>'
             '<div class="pact-b">8월의 한마디 — 2회 받음 · 1회 보는 중</div>'))

d_cal = (
    '<div class="cal"><div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>'
    '<div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>'
    '<div class="cal-g"><s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>'
    '<s>2</s><s>3</s><s class="d-ans">4</s><s class="sel d-ans">5</s>'
    '<s class="today d-wait">6</s><s class="off">7</s><s class="off">8</s></div></div>'
    + '<div class="wrow">'
    + wg('이번 달 답장', '<div class="wg-big">3<i>회</i></div>', True)
    + wg('연속 연습', '<div class="wg-big">5<i>일</i></div>', True)
    + '</div>'
    + wg('8월 5일 (수)', pro(f'“{CM2}”', '오후 9:40')))

d_swings = (
    '<div class="stx"><span><b>12</b><i>전체</i></span><span><b>7</b><i>정면</i></span>'
    '<span><b>5</b><i>측면</i></span><span><b>8</b><i>답장</i></span></div>'
    + '<div class="grid">'
    + f'<div class="cellw">{scene("정면 · 드라이버", 150)}{rail(2, True)}</div>'
    + f'<div class="cellw">{scene("측면 · 드라이버", 150)}{rail(2, True)}</div>'
    + f'<div class="cellw">{scene("정면 · 아이언", 150)}{rail(4, True)}</div>'
    + '<div class="cellw add">+<b>스윙 보내기</b></div></div>')

d_talk = (
    wg('받은 답장', ''.join(
        f'<div class="row"><span><b>{d}</b><i>{t}</i></span><em>›</em></div>'
        for d, t in [('8월 5일', CM_S), ('8월 4일', CM2),
                     ('8월 1일', '어드레스에서 오른 어깨가 높아요. 거울 보고 열 번.')])))

d_my = (
    '<div class="me-h"><span class="av">골</span><span><b>골프러버</b>'
    '<i>이도형 프로와 32일째</i></span></div>'
    + '<div class="wrow">'
    + wg('연습일', '<div class="wg-big">18<i>일</i></div>', True)
    + wg('받은 한마디', '<div class="wg-big">9<i>개</i></div>', True)
    + '</div>'
    + wg('8월의 약속',
         '<div class="pact-s"><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i></div>')
    + '<div class="list"><span>계정 · 아이디 관리</span><span>알림 설정</span>'
      '<span>구독 · 결제 <i>베타 무료</i></span></div>')

# ════════════════════════════════════════════════════════════════════
# E. 달력이 홈 — 습관이 먼저, 잔디가 자산
# ════════════════════════════════════════════════════════════════════
e_home = f'''
<div class="strk">🔥 5일 연속 연습 중</div>
<div class="cal">
  <div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="d-ans">4</s><s class="d-ans">5</s><s class="today sel d-wait">6</s><s class="off">7</s><s class="off">8</s>
    <s class="off">9</s><s class="off">10</s><s class="off">11</s><s class="off">12</s><s class="off">13</s><s class="off">14</s><s class="off">15</s>
  </div>
</div>
<div class="today-b">{rail(2, True)}<span>오늘 — 측면 스윙 보냄 · 프로가 보는 중</span></div>
<div class="cta">오늘 한 칸 더 채우기 — 정면 올리기</div>'''

e_cal = f'''
<div class="sec" style="padding-top:2px">한 달의 잔디 — 진할수록 대화가 깊었던 날</div>
<div class="hm">{''.join(f'<i class="l{v}"></i>' for v in
    [0,0,0,0,0,0,1, 1,0,2,3,2,0,0, 0,1,0,2,0,0,0, 0,0,3,3,2,0,0, 0,0,0,0,0,0,0])}</div>
<div class="cal-l"><i class="lg" style="background:#E4DCC9"></i>없음
  <i class="lg" style="background:#A9C9A4"></i>스윙만
  <i class="lg" style="background:{V['green']}"></i>+메모
  <i class="lg" style="background:{V['bronze']}"></i>답장까지</div>
{pro(f'“{CM2}”', '이 달 가장 깊었던 날 · 8월 5일')}'''

e_swings = f'''
<div class="tl">
  <div class="tl-r"><span class="tl-d"><b>6</b><i>목</i></span>
    <div class="tl-c">{scene('측면 · 드라이버', 96)}{rail(2, True)}</div></div>
  <div class="tl-r"><span class="tl-d on"><b>5</b><i>수</i></span>
    <div class="tl-c">{scene('정면 · 아이언', 96)}{rail(4, True)}</div></div>
  <div class="tl-r"><span class="tl-d"><b>4</b><i>화</i></span>
    <div class="tl-c">{scene('정면 · 드라이버', 96)}{rail(4, True)}</div></div>
</div>'''

e_talk = f'''
<div class="dvd stick">8월 5일 (수) — 5일 연속의 셋째 날</div>
<div class="me-sw">{scene('정면', 64)}{me(f'“{NOTE}”')}</div>
{pro(f'“{CM}”', '오후 9:40')}
<div class="dvd stick">8월 4일 (화)</div>
{me('정면 스윙 1개 보냈어요')}
{pro(f'“{CM2}”', '오후 8:10')}'''

e_my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
<div class="wg"><div class="wg-t">올해의 잔디</div>
<div class="hm yr">{''.join(f'<i class="l{v}"></i>' for v in
    [0,0,1,0,0,2,0,1,0,0,3,2,0,0,1,0,2,0,0,0,1,3,0,2,0,0,1,0,
     2,0,0,1,0,0,2,3,0,1,0,0,2,0,1,0,3,2,0,0,1,0,0,2,0,1,0,0])}</div></div>
<div class="strk">🔥 최장 연속 9일 · 지금 5일째</div>
<div class="list"><span>계정 · 아이디 관리</span><span>알림 설정</span>
<span>구독 · 결제 <i>베타 무료</i></span></div>'''

# ════════════════════════════════════════════════════════════════════
# F. 영상이 주인공 — 풀블리드 + 하단 시트 (다크)
# ════════════════════════════════════════════════════════════════════
f_home = f'''
<div class="vid">{scene('8월 5일 · 정면 · 아이언', 300)}<div class="vgrad"></div></div>
<div class="sheet">
  <div class="hdl"></div>
  <div class="kick">답장이 왔습니다</div>
  {pro(f'“{CM_S}”', '방금')}
  <div class="cta">답장 읽기</div>
</div>'''

f_cal = f'''
<div class="vid dim">{scene('', 180)}<div class="vgrad"></div></div>
<div class="sheet tall">
  <div class="hdl"></div>
  <div class="cal dark">
    <div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
    <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
    <div class="cal-g"><s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="d-ans">4</s><s class="sel d-ans">5</s><s class="today d-wait">6</s><s class="off">7</s><s class="off">8</s></div>
  </div>
  <div class="vh">날짜를 고르면 뒤의 영상이 그날 스윙으로 바뀝니다</div>
  {pro(f'“{CM2}”', '8월 5일')}
</div>'''

f_swings = f'''
<div class="vid">{scene('측면 · 드라이버', 430)}<div class="vgrad"></div></div>
<div class="side">
  <span>{icon('대화', 18)}<b>답장</b></span>
  <span>♡<b>보관</b></span>
  <span>⇅<b>비교</b></span>
</div>
<div class="vfoot">{rail(2, True)}<span>8월 6일 · 프로가 보는 중 · 위로 넘겨 이전 스윙</span></div>'''

f_talk = f'''
<div class="vid dim">{scene('', 220)}<div class="vgrad"></div></div>
<div class="sheet tall">
  <div class="hdl"></div>
  <div class="me-sw">{scene('정면', 52)}{me(f'“{NOTE}”')}</div>
  {pro(f'“{CM}”', '오후 9:40')}
  <div class="vh">답장을 누르면 해당 구간에서 영상이 멈춥니다</div>
</div>'''

f_my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
<div class="pact dark2">
  <div class="pact-t">8월의 약속 — 한마디 5회</div>
  <div class="pact-s"><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i></div>
</div>
{pro('“꾸준히 오는 회원이 제일 늘어요.”')}
<div class="list"><span>계정 · 아이디 관리</span><span>알림 설정</span>
<span>구독 · 결제 <i>베타 무료</i></span><span>문의하기</span></div>'''

# ════════════════════════════════════════════════════════════════════
THEMES = [
    ('la', 'A. 메신저', '앱 전체가 이도형 프로와의 대화방이다',
     '홈부터 컴포저(입력줄)가 있다 — 카카오톡의 문법을 그대로 빌려서 배울 것이 없다. '
     '스윙 서랍은 채팅방의 「사진첩」, 마이는 「상대 프로필」. 대화라는 철학을 가장 직역한 안.',
     [('오늘', '오늘', a_home, '홈에 컴포저 — 보내는 문턱이 0',
       '레일은 상단 핀으로. 오늘의 대화가 곧 홈이고, 맨 밑에 입력줄이 상시 대기한다.'),
      ('달력', '달력', a_cal, '달력도 대화의 색인',
       '날짜를 고르면 그날 대화 발췌가 바로 밑에. 「그날 대화로 이동」 한 줄로 원문에 간다.'),
      ('스윙', '스윙', a_swings, '채팅방의 사진첩',
       '3열 서랍 — 훑는 화면이라 레일도 뺐다. 눌러야 상세. 메신저 문법 그대로.'),
      ('대화', '대화', a_talk, '검색이 맨 위',
       '「어깨」로 찾으면 프로가 어깨 얘기한 날이 다 나온다 — 대화가 자산이 된다.'),
      ('마이', '마이', a_my, '상대 프로필 페이지',
       '내 설정보다 프로와의 관계가 먼저. 대화·사진첩·약속 세 버튼이 상단에.')]),

    ('lb', 'B. 풀스크린 한 장', '화면마다 문장 하나 — 큰 활자, 여백으로 말한다',
     '한 화면에 정보 하나만. 오늘은 선언 한 줄, 달력은 그리드 대신 아젠다, 스윙은 한 장씩 '
     '캐러셀, 답장은 편지 한 통. 정보량을 버리고 무게를 얻는 안 — 프리미엄 레슨의 인상.',
     [('오늘', '오늘', b_home, '선언 한 줄 + 버튼 하나',
       '숫자도 카드도 없다. 「답장이 왔습니다」가 화면의 전부 — 놓칠 수가 없다.'),
      ('달력', '달력', b_cal, '그리드를 버린 아젠다',
       '한 달 격자 대신 날짜가 큰 행으로 선다. 각 행 오른쪽에 그날의 레일 — 훑으면 리듬이 보인다.'),
      ('스윙', '스윙', b_swings, '한 번에 한 장',
       '격자 대신 캐러셀. 스윙 하나를 크게 보고 좌우로 넘긴다 — 영상이 원래 큰 화면용이다.'),
      ('대화', '대화', b_talk, '답장은 편지다',
       '말풍선을 버리고 종이 한 장. 「골프러버 님,」으로 시작해 「— 이도형」으로 끝난다.'),
      ('마이', '마이', b_my, '숫자 하나가 관계다',
       '32가 화면의 절반. 설정은 맨 밑 한 줄로 접었다 — 이 페이지는 자부심용이다.')]),

    ('lc', 'C. 피드', '하루하루가 카드로 쌓인다 — 스트라바의 문법',
     '모든 것이 같은 카드 틀(아바타·이름·시각)로 흐른다. 프로의 답장도, 내 스윙도 피드의 '
     '한 장. 위에서 아래로 시간이 흐르고, 탭은 피드의 필터일 뿐이다.',
     [('오늘', '오늘', c_home, '최신이 맨 위 — 피드의 법칙',
       '답장 도착이 첫 카드로 온다. 카드 틀이 같아서 어떤 소식이든 읽는 법이 하나다.'),
      ('달력', '달력', c_cal, '주간 스트립 + 그날의 피드',
       '월 격자 대신 이번 주 일곱 칸. 날짜를 고르면 그날 카드만 남는다 — 달력이 필터다.'),
      ('스윙', '스윙', c_swings, '1열 크게 — 미디어 피드',
       '스윙은 2열로 쪼개지 않고 한 장씩 크게. 각 카드 밑에 레일 — 인스타가 아니라 레슨이다.'),
      ('대화', '대화', c_talk, '프로의 말만 모아보기',
       '피드에서 프로 카드만 거른 뷰. 답장 아카이브가 이 앱의 소장품이라는 관점.'),
      ('마이', '마이', c_my, '내 활동도 피드의 요약',
       '주간 막대 그래프 + 이 달 프로의 당부 카드. 프로필도 피드의 문법으로 쓴다.')]),

    ('ld', 'D. 대시보드', '위젯 모듈 — 한눈에 전부, 정보 밀도를 올린 안',
     '홈이 위젯판이다: 레일·답장·미니달력·오늘 스윙·약속이 한 화면에. 자주 쓰는 사람용 — '
     '들어와서 스크롤 없이 상태 전부를 3초에 읽는다. A~C와 정반대 방향의 실험.',
     [('오늘', '오늘', d_home, '3초 대시보드',
       '위젯 다섯이 접힘 없이 한 화면에. 각 위젯이 해당 탭으로 가는 문이기도 하다.'),
      ('달력', '달력', d_cal, '달력 + 숫자 위젯',
       '달력 밑에 「이번 달 답장 3회 · 연속 5일」 — 숫자를 원하는 사용자를 위한 안.'),
      ('스윙', '스윙', d_swings, '통계 스트립이 머리에',
       '전체·정면·측면·답장 카운트가 위에 서고 격자가 밑에 — 서랍에 계기판을 얹었다.'),
      ('대화', '대화', d_talk, '답장은 리스트 행으로',
       '원문 대신 목록 — 날짜·한 줄 요약·화살표. 훑고 골라 들어가는 데이터 관점.'),
      ('마이', '마이', d_my, '내 숫자의 방',
       '연습일 18 · 한마디 9가 위젯으로. 관계보다 기록 관리에 무게를 둔 변형.')]),

    ('le', 'E. 달력이 홈', '습관이 먼저다 — 잔디를 기르는 앱',
     '첫 화면이 달력이다. 오늘 할 일은 달력 밑 한 줄 + 버튼 하나. 잔디(진하기=대화 깊이)가 '
     '자산이 되어 「끊기기 싫다」는 힘으로 재방문을 만든다. 듀오링고·깃허브의 문법.',
     [('오늘', '오늘', e_home, '달력이 곧 홈',
       '연속 5일 배지가 맨 위. 오늘 줄엔 레일과 상태, 버튼은 「한 칸 더 채우기」 — 습관의 언어다.'),
      ('달력', '달력', e_cal, '잔디 뷰 — 진하기가 대화 깊이',
       '스윙만=연두, 메모까지=초록, 답장까지=브론즈. 한 달을 색으로 요약하고 가장 깊었던 날을 집어준다.'),
      ('스윙', '스윙', e_swings, '날짜 레일 타임라인',
       '왼쪽에 날짜 축, 오른쪽에 스윙. 서랍이 아니라 일지 — 달력 중심 세계관의 스윙 화면.'),
      ('대화', '대화', e_talk, '날짜 머리가 붙박이',
       '스크롤해도 날짜 띠가 위에 붙는다. 「5일 연속의 셋째 날」 — 대화에도 습관의 문맥을 단다.'),
      ('마이', '마이', e_my, '올해의 잔디가 상장',
       '연간 히트맵 + 최장 연속 기록. 이 안에서 마이페이지는 트로피 방이다.')]),

    ('lf', 'F. 영상이 주인공', '풀블리드 영상 + 하단 시트 — 다크',
     '내 스윙 영상이 배경 전체를 차지하고, 글은 밑에서 올라오는 시트에 담긴다. 답장을 '
     '누르면 영상이 해당 구간에 멈춘다 — 프로의 말과 내 몸이 같은 화면에서 만난다.',
     [('오늘', '오늘', f_home, '영상 위로 답장이 올라온다',
       '오늘의 스윙이 화면 전체. 시트를 올리면 프로의 답 — 말과 영상이 한 몸이다.'),
      ('달력', '달력', f_cal, '날짜를 고르면 배경이 바뀐다',
       '시트 속 달력에서 5일을 누르면 뒤의 영상이 그날 스윙으로 — 달력이 리모컨이다.'),
      ('스윙', '스윙', f_swings, '릴스 문법 — 위로 넘긴다',
       '세로 풀스크린, 오른쪽에 답장·보관·비교. 영상 앱이라는 정체성을 끝까지 민 안.'),
      ('대화', '대화', f_talk, '답장이 영상을 조종한다',
       '답장을 누르면 그 구간에서 멈춤 — 「어깨」를 읽는 순간 내 어깨가 보인다.'),
      ('마이', '마이', f_my, '다크에서도 규칙은 같다',
       '프로의 말은 여기서도 브론즈 세리프. 팔레트가 뒤집혀도 얼굴은 유지된다.')]),
]

sections = ''
for cls, name, tag, desc, screens in THEMES:
    phones = ''.join(
        f'<div class="col">{frame(t, tab, b, cls)}<div class="why"><b>{w1}</b>{w2}</div></div>'
        for t, tab, b, w1, w2 in screens)
    sections += (f'<div class="th"><h2>{name} <em>{tag}</em></h2>'
                 f'<p class="lede">{desc}</p><div class="strip">{phones}</div></div>')

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · 레이아웃 탐색 6안 × 5화면</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Pretendard,-apple-system,'Malgun Gothic',sans-serif;background:#211F1A;
  color:#EFEBE2;-webkit-font-smoothing:antialiased;padding:38px 28px 90px}}
h1{{font-size:22px;letter-spacing:-.02em}}
h2{{font-size:17px;margin:0 0 6px;color:#EFEBE2}}
h2 em{{font-style:normal;font-size:12.5px;color:#D9B36A;font-weight:600;margin-left:8px}}
.lede{{font-size:12.5px;color:#B5AD9C;line-height:1.8;max-width:680px}}
.th{{margin-top:44px;padding-top:26px;border-top:1px solid #3A362D}}
.strip{{display:flex;gap:24px;overflow-x:auto;padding:20px 4px 8px;align-items:flex-start}}
.col{{flex:none;width:340px}}
.why{{font-size:11.5px;color:#B5AD9C;line-height:1.75;padding:12px 6px 0}}
.why b{{display:block;color:#EFEBE2;font-size:12px;padding-bottom:3px}}
.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:700px;background:{V['bg']};color:{V['ink']};position:relative;
  box-shadow:0 18px 44px -20px rgba(0,0,0,.65)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700;position:relative;z-index:3}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.85}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px;
  background:{V['soft']};color:{V['green']}}}
.ph-head{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:19px;font-weight:600;
  letter-spacing:.01em;padding:12px 20px 2px;position:relative;z-index:3}}
.ph-body{{flex:1;padding:12px 18px 18px;display:flex;flex-direction:column;position:relative;z-index:2}}
.grow{{flex:1}}

.rail{{display:flex;align-items:center;padding:6px 0 16px}}
.rail.sm{{padding:7px 2px 0}}
.rl-s{{display:flex;flex-direction:column;align-items:center;gap:4px;flex:none}}
.rl-s i{{width:11px;height:11px;border-radius:50%;border:2px solid #C9C1AE;background:transparent;display:block}}
.rail.sm .rl-s i{{width:7px;height:7px;border-width:1.5px}}
.rl-s.done i{{background:{V['green']};border-color:{V['green']}}}
.rl-s.now i{{background:{V['bronze']};border-color:{V['bronze']};box-shadow:0 0 0 3px {V['bsoft']}}}
.rl-s b{{font-size:9px;font-weight:700;color:{V['dim']}}}
.rl-s.done b,.rl-s.now b{{color:{V['ink']}}}
.rl-b{{flex:1;height:2px;background:#D9D2C0;margin:0 3px 14px}}
.rail.sm .rl-b{{margin-bottom:0}}
.rl-b.on{{background:{V['green']}}}

.pro{{border-left:3px solid {V['bronze']};background:{V['bsoft']};border-radius:4px 14px 14px 4px;
  padding:12px 14px;margin:8px 0}}
.pro-w{{font-size:10.5px;font-weight:700;color:{V['bronze']};padding-bottom:6px}}
.pro-t{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:13.5px;line-height:1.85;color:#3B3220}}
.pro.big .pro-t{{font-size:16px;line-height:1.95}}
.meq{{align-self:flex-end;background:{V['soft']};color:{V['green']};border-radius:14px 14px 4px 14px;
  padding:10px 13px;font-size:12.5px;font-weight:600;line-height:1.65;max-width:82%;
  margin:8px 0 8px auto}}
.kick{{font-size:12px;font-weight:800;color:{V['bronze']};padding:2px 0 4px}}
.cta{{background:{V['green']};color:#fff;border-radius:14px;text-align:center;
  padding:15px;font-size:15px;font-weight:800;margin:14px 0 12px}}
.cta.sm{{padding:11px;font-size:13px;margin:8px 0 2px}}
.rhythm{{font-size:11.5px;color:{V['dim']};line-height:1.7;text-align:center}}
.dvd{{text-align:center;font-size:10.5px;font-weight:800;color:{V['dim']};
  letter-spacing:.08em;padding:12px 0 4px}}
.me-sw{{display:flex;gap:8px;justify-content:flex-end;align-items:flex-start}}
.me-sw .scene{{width:48px}}
.me-sw .meq{{margin-left:0}}
.scene{{position:relative;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}}
.bd{{position:absolute;left:8px;top:8px;background:rgba(20,24,18,.55);color:#fff;
  font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px}}
.sec{{font-size:12.5px;font-weight:800;color:{V['sub']};padding:14px 2px 8px}}
.chips{{display:flex;gap:6px;overflow:hidden;padding-bottom:4px}}
.chip{{flex:none;font-size:12px;font-weight:700;border-radius:99px;padding:8px 13px;
  background:{V['card']};color:{V['sub']};border:1px solid {V['line']}}}
.chip.on{{background:{V['green']};color:#fff;border-color:{V['green']}}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.cellw{{display:flex;flex-direction:column}}
.cellw.add{{min-height:150px;border:2px dashed {V['line']};border-radius:14px;background:{V['card']};
  display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;
  color:{V['green']};font-size:24px;font-weight:300}}
.cellw.add b{{font-size:12px;font-weight:800}}
.cal{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;padding:13px 13px 11px}}
.cal-h{{text-align:center;font-size:13px;font-weight:800;padding-bottom:10px}}
.cal-w,.cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.cal-w s{{text-decoration:none;font-size:10px;font-weight:700;color:{V['dim']};padding:3px 0}}
.cal-g s{{text-decoration:none;font-size:12.5px;font-weight:600;color:{V['sub']};height:31px;
  display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}}
.cal-g s.off{{opacity:.35}}
.cal-g s.sel{{background:{V['ink']};color:#fff;font-weight:800}}
.cal-g s.today{{box-shadow:inset 0 0 0 1.5px {V['ink']};font-weight:800}}
.cal-g s.d-ans:after,.cal-g s.d-wait:after{{content:'';position:absolute;
  bottom:0;left:50%;margin-left:-2.5px;width:5px;height:5px;border-radius:50%}}
.cal-g s.d-ans:after{{background:{V['bronze']}}}
.cal-g s.d-wait:after{{background:{V['warn']}}}
.cal-l{{display:flex;justify-content:center;gap:6px;align-items:center;font-size:10px;
  color:{V['dim']};padding-top:9px;flex-wrap:wrap}}
.lg{{display:inline-block;width:6px;height:6px;border-radius:50%;margin:0 2px 0 6px}}
.me-h{{display:flex;gap:12px;align-items:center;padding:6px 2px 14px}}
.av{{flex:none;width:46px;height:46px;border-radius:50%;background:{V['soft']};
  color:{V['green']};display:flex;align-items:center;justify-content:center;
  font-size:16px;font-weight:800}}
.av.sm{{width:30px;height:30px;font-size:12px}}
.av.big{{width:72px;height:72px;font-size:24px}}
.me-h b{{display:block;font-size:17px;font-weight:800}}
.me-h i{{font-style:normal;font-size:11.5px;color:{V['bronze']};font-weight:700}}
.pact{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;padding:15px;margin-bottom:6px}}
.pact-t{{font-size:13px;font-weight:800;padding-bottom:10px}}
.pact-s{{display:flex;gap:7px;padding-bottom:6px}}
.pact-s i{{flex:1;height:9px;border-radius:99px;background:#E4DCC9}}
.pact-s i.on{{background:{V['green']}}}
.pact-s i.now{{background:{V['bronze']}}}
.pact-b{{font-size:11.5px;color:{V['dim']}}}
.list{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;overflow:hidden;margin-top:12px}}
.list span{{display:flex;justify-content:space-between;padding:15px 16px;font-size:13.5px;
  font-weight:600;border-bottom:1px solid {V['line']}}}
.list span:last-child{{border-bottom:0}}
.list i{{font-style:normal;font-size:11.5px;color:{V['dim']}}}
.tabs{{display:flex;background:{V['nav']};border-top:1px solid {V['line']};
  padding:8px 0 10px;position:relative;z-index:3}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:{V['dim']}}}
.tb b{{font-size:9.5px;font-weight:700}}
.tb.on{{color:{V['green']}}}

/* ── A. 메신저 ── */
.pin{{display:flex;align-items:center;gap:10px;background:{V['card']};border:1px solid {V['line']};
  border-radius:12px;padding:8px 12px}}
.pin .rail{{padding:0;width:90px}}
.pin b{{font-size:11.5px;font-weight:800;color:{V['sub']}}}
.cmp{{display:flex;align-items:center;gap:9px;background:{V['card']};border:1px solid {V['line']};
  border-radius:99px;padding:8px 8px 8px 10px;margin-top:10px}}
.cmp .cam{{flex:none;width:34px;height:34px;border-radius:50%;background:{V['soft']};
  color:{V['green']};display:flex;align-items:center;justify-content:center}}
.cmp i{{flex:1;font-style:normal;font-size:12.5px;color:{V['dim']}}}
.cmp b{{flex:none;background:{V['green']};color:#fff;font-size:12px;font-weight:800;
  border-radius:99px;padding:9px 15px}}
.more{{font-size:12px;font-weight:800;color:{V['green']};text-align:right;padding-top:4px}}
.g3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}}
.srch{{background:{V['card']};border:1px solid {V['line']};border-radius:12px;
  padding:11px 14px;font-size:12.5px;color:{V['dim']};font-weight:600}}
.ctc{{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 0 14px;text-align:center}}
.ctc b{{font-size:18px;font-weight:800}}
.ctc i{{font-style:normal;font-size:12px;color:{V['bronze']};font-weight:700}}
.act3{{display:flex;gap:8px;padding-bottom:8px}}
.act3 span{{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;
  background:{V['card']};border:1px solid {V['line']};border-radius:14px;padding:12px 0;
  color:{V['green']}}}
.act3 b{{font-size:11px;font-weight:800;color:{V['sub']}}}

/* ── B. 풀스크린 ── */
.big-k{{font-size:11.5px;font-weight:800;color:{V['bronze']};letter-spacing:.14em;text-align:center}}
.big-t{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:40px;font-weight:700;line-height:1.3;
  text-align:center;padding:10px 0 14px;letter-spacing:-.01em}}
.dots{{display:flex;gap:6px;justify-content:center;padding:10px 0}}
.dots i{{width:6px;height:6px;border-radius:50%;background:#D9D2C0}}
.dots i.on{{background:{V['ink']};width:16px;border-radius:99px}}
.ag{{display:flex;justify-content:space-between;align-items:center;gap:10px;
  background:{V['card']};border:1px solid {V['line']};border-radius:16px;
  padding:16px;margin-bottom:10px}}
.ag b{{display:block;font-family:Hahmlet,serif;font-size:16px;font-weight:700;padding-bottom:4px}}
.ag i{{font-style:normal;font-size:11.5px;color:{V['sub']};line-height:1.6;display:block;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px}}
.ag.on{{border-color:{V['bronze']};background:{V['bsoft']}}}
.ag.off{{opacity:.45}}
.ag .rail{{padding:0;width:80px;flex:none}}
.car{{display:flex;align-items:center;justify-content:center;gap:18px;padding-top:6px}}
.car>span{{font-size:20px;color:{V['dim']}}}
.ltr{{background:{V['card']};border:1px solid {V['line']};border-radius:6px;padding:26px 22px;
  box-shadow:0 10px 24px -16px rgba(0,0,0,.3);margin:8px 0 14px}}
.ltr-d{{font-size:10.5px;font-weight:700;color:{V['bronze']};letter-spacing:.1em;padding-bottom:14px}}
.ltr-t{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:14px;line-height:2.05;color:#3B3220}}
.ltr-s{{font-family:Hahmlet,serif;font-size:14px;text-align:right;padding-top:16px;color:{V['bronze']}}}
.huge{{font-family:Hahmlet,serif;font-size:96px;font-weight:700;text-align:center;line-height:1;
  color:{V['green']}}}
.huge-s{{text-align:center;font-size:13px;font-weight:700;color:{V['bronze']};padding:8px 0 22px}}
.mini-l{{text-align:center;font-size:11.5px;color:{V['dim']};padding-top:12px}}

/* ── C. 피드 ── */
.fc{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;
  padding:12px 14px;margin-bottom:12px}}
.fc-h{{display:flex;align-items:center;gap:9px;padding-bottom:8px}}
.fc-h b{{font-size:12.5px;font-weight:800}}
.fc-h i{{font-style:normal;font-size:10.5px;color:{V['dim']};margin-left:auto}}
.fc .pro{{margin:2px 0}}
.wk{{display:flex;gap:5px;padding-bottom:12px}}
.wk s{{text-decoration:none;flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
  font-size:10px;font-weight:700;color:{V['dim']};background:{V['card']};
  border:1px solid {V['line']};border-radius:12px;padding:8px 0}}
.wk s b{{font-size:13px;color:{V['sub']}}}
.wk s.has b{{color:{V['bronze']}}}
.wk s.sel{{background:{V['ink']};border-color:{V['ink']}}}
.wk s.sel b,.wk s.sel{{color:#fff}}
.wk s.now{{box-shadow:inset 0 0 0 1.5px {V['ink']}}}
.bar7{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;
  padding:13px 14px;margin-bottom:12px}}
.b7{{display:flex;gap:7px;align-items:flex-end;height:64px}}
.b7 i{{flex:1;border-radius:5px 5px 2px 2px;background:#D9D2C0;min-height:3px}}
.b7 i.on{{background:{V['green']}}}
.b7-l{{display:flex;gap:7px;padding-top:5px}}
.b7-l s{{text-decoration:none;flex:1;text-align:center;font-size:9.5px;color:{V['dim']};font-weight:700}}

/* ── D. 대시보드 ── */
.wg{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;
  padding:13px 14px;margin-bottom:10px}}
.wg-t{{font-size:11px;font-weight:800;color:{V['dim']};letter-spacing:.06em;padding-bottom:8px}}
.wg .rail{{padding:2px 0 4px}}
.wg .pro{{margin:0 0 4px}}
.wrow{{display:flex;gap:10px}}
.wrow .wg{{flex:1}}
.wg-big{{font-family:Hahmlet,serif;font-size:30px;font-weight:700;color:{V['green']}}}
.wg-big i{{font-style:normal;font-size:13px;color:{V['dim']};margin-left:3px}}
.wg-n{{font-size:11px;font-weight:800;color:{V['sub']};padding-top:6px}}
.mini-cal{{display:flex;gap:4px}}
.mini-cal s{{text-decoration:none;flex:1;height:26px;border-radius:8px;background:{V['bg']};
  display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:{V['sub']}}}
.mini-cal s.on{{background:{V['green']};color:#fff}}
.mini-cal s.nw{{box-shadow:inset 0 0 0 1.5px {V['ink']}}}
.stx{{display:flex;background:{V['card']};border:1px solid {V['line']};border-radius:14px;
  padding:11px 0;margin-bottom:10px}}
.stx span{{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  border-right:1px solid {V['line']}}}
.stx span:last-child{{border-right:0}}
.stx b{{font-family:Hahmlet,serif;font-size:17px;color:{V['green']}}}
.stx i{{font-style:normal;font-size:10px;font-weight:700;color:{V['dim']}}}
.row{{display:flex;justify-content:space-between;align-items:center;gap:8px;
  padding:11px 2px;border-bottom:1px solid {V['line']}}}
.row:last-child{{border-bottom:0}}
.row b{{display:block;font-size:12px;font-weight:800;padding-bottom:3px}}
.row i{{font-style:normal;font-size:11.5px;color:{V['sub']};display:block;max-width:230px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.row em{{font-style:normal;color:{V['dim']}}}

/* ── E. 달력이 홈 ── */
.strk{{align-self:flex-start;background:{V['bsoft']};color:{V['bronze']};font-size:12px;
  font-weight:800;border-radius:99px;padding:7px 13px;margin-bottom:10px}}
.today-b{{display:flex;align-items:center;gap:10px;background:{V['card']};
  border:1px solid {V['line']};border-radius:14px;padding:11px 13px;margin-top:12px}}
.today-b .rail{{padding:0;width:86px;flex:none}}
.today-b span{{font-size:11.5px;font-weight:700;color:{V['sub']};line-height:1.5}}
.hm{{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;background:{V['card']};
  border:1px solid {V['line']};border-radius:16px;padding:13px}}
.hm i{{aspect-ratio:1;border-radius:6px;background:#E4DCC9}}
.hm i.l1{{background:#A9C9A4}} .hm i.l2{{background:{V['green']}}} .hm i.l3{{background:{V['bronze']}}}
.hm.yr{{grid-template-columns:repeat(14,1fr);gap:3px;padding:4px 0 0;background:none;border:0}}
.hm.yr i{{border-radius:3px}}
.tl-r{{display:flex;gap:12px;padding-bottom:14px}}
.tl-d{{flex:none;width:38px;display:flex;flex-direction:column;align-items:center;gap:1px;
  padding-top:4px}}
.tl-d b{{font-family:Hahmlet,serif;font-size:19px;font-weight:700;color:{V['sub']}}}
.tl-d i{{font-style:normal;font-size:10px;font-weight:700;color:{V['dim']}}}
.tl-d.on b{{color:{V['bronze']}}}
.tl-c{{flex:1;display:flex;flex-direction:column}}
.dvd.stick{{background:{V['bg']};border-radius:99px;border:1px solid {V['line']};
  padding:7px 0;margin:8px 0 4px}}

/* ── F. 영상 주인공 (다크) ── */
.ph.lf{{background:#14181A;color:#EDEFEA}}
.ph.lf .beta{{background:#223028;color:#9CC7A8}}
.ph.lf .ph-head{{color:#EDEFEA}}
.vid{{margin:-60px -18px 0;position:relative;z-index:0}}
.vid .scene{{border-radius:0}}
.vid.dim .scene{{opacity:.45}}
.vgrad{{position:absolute;inset:0;background:linear-gradient(rgba(20,24,26,.55),transparent 30%,
  transparent 55%,rgba(20,24,26,.9))}}
.sheet{{position:relative;z-index:2;background:#1C2220;border-radius:22px 22px 0 0;
  margin:-26px -18px -18px;padding:10px 18px 18px;flex:1}}
.sheet.tall{{margin-top:-40px}}
.hdl{{width:40px;height:4px;border-radius:99px;background:#3A423E;margin:2px auto 12px}}
.ph.lf .kick{{color:#D9B36A}}
.ph.lf .pro{{background:#26221A;border-left-color:#D9B36A}}
.ph.lf .pro-w{{color:#D9B36A}}
.ph.lf .pro-t{{color:#E8DFC9}}
.ph.lf .cta{{background:#2E5C41}}
.ph.lf .meq{{background:#22302A;color:#B8D6C2}}
.ph.lf .tabs{{background:#14181A;border-top-color:#252B28}}
.ph.lf .tb.on{{color:#9CC7A8}}
.ph.lf .cal.dark{{background:#232927;border-color:#313834}}
.ph.lf .cal-g s{{color:#B9BFB6}}
.ph.lf .cal-g s.sel{{background:#EDEFEA;color:#14181A}}
.ph.lf .cal-g s.today{{box-shadow:inset 0 0 0 1.5px #EDEFEA}}
.vh{{font-size:11px;color:#7E877F;line-height:1.7;padding:6px 2px}}
.side{{position:absolute;right:14px;top:300px;z-index:2;display:flex;flex-direction:column;
  gap:16px;align-items:center}}
.side span{{display:flex;flex-direction:column;align-items:center;gap:3px;color:#EDEFEA;
  font-size:16px}}
.side b{{font-size:9.5px;font-weight:700}}
.vfoot{{position:relative;z-index:2;margin-top:auto;padding-top:8px}}
.vfoot .rail{{padding:0 0 6px}}
.ph.lf .rl-s i{{border-color:#4A524D}}
.ph.lf .rl-b{{background:#39413C}}
.ph.lf .rl-s.done i,.ph.lf .rl-b.on{{background:#6FA477;border-color:#6FA477}}
.vfoot span{{font-size:10.5px;color:#AEB6AD}}
.ph.lf .list{{background:#1C2220;border-color:#2B322E}}
.ph.lf .list span{{border-color:#2B322E;color:#D9DED7}}
.ph.lf .pact.dark2{{background:#1C2220;border-color:#2B322E}}
.ph.lf .pact-s i{{background:#2E3531}}
.ph.lf .pact-s i.on{{background:#6FA477}}
.ph.lf .pact-s i.now{{background:#D9B36A}}
.ph.lf .me-h b{{color:#EDEFEA}}
.ph.lf .av{{background:#22302A;color:#9CC7A8}}
</style>

<h1>레이아웃 탐색 — 6안 × 5화면</h1>
<p class="lede">철학(레슨은 대화다)과 부품(레슨 레일 · 프로의 말 규칙 · 우리 팔레트)은
전 안이 공유한다. 벌린 것은 <b>뼈대</b> 하나 — 같은 서비스를 여섯 가지로 접었다.
A 메신저 · B 풀스크린 한 장 · C 피드 · D 대시보드 · E 달력이 홈 · F 영상이 주인공.</p>
{sections}
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
