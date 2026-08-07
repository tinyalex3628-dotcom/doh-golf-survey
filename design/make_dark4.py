# -*- coding: utf-8 -*-
"""다크 집중형 4안 — F(영상이 주인공)의 공기를 이어받되,
   이번에는 **우리 앱이 실제로 제공하는 것을 전부** 싣는다.

   실제 반영한 것들(runtime-v3.js 에서 그대로 가져온 사실):
   - 하단 5탭: 홈 · 연습기록 · 스윙 · 레슨기록 · 마이
   - 홈 히어로 4상태 + 하루 1회 제한 카피(「오늘 몫은 다 썼어요 · 내일 다시」)
   - 최근 프로 한마디 카드(2줄 미리보기 · 사진 배지 · 계속 읽기)
   - 오늘 기록하기 줄(최근 기록 · 🔥 연속)
   - 연습기록: 달력 상태 점 + 날짜 요약 패널(스윙 위·한마디 아래) + 답장 배너
     + 오늘 올렸으면 접힘 카드
   - 스윙(갤러리): 필터 칩(가진 것만) · 날짜 머리글 · 3:4 셀 · 각도/클럽 배지
     · 상태 6종 색(재전송 #C0392B · 보내는 중% / 대기 / 보는 중 #E8C07A
       · 전달됨 #B9C7BC · 한마디 N #8FBFA3) · 하루 2편(정면·측면) 제한
   - 업로드 시트: 「무엇으로 치셨어요?」 클럽 5종 + 「어느 쪽에서 찍었어요?」
     + 올리기 / 나중에 고를게요
   - 레슨기록: 세그먼트(정기 피드백 | 프로 한마디) · 베타 잠금 문구
     · pc1 댓글줄(아바타 「이」 · 날짜시각 · 우측 사진 스트립 · 들여쓴 본문)
     · 맨 뒤 「내 스윙 영상」
   - 마이: 이번 달 4칸(연습일·영상·한마디·최장 연속) · 아이디 이어붙이기
     · 구독 베타 무료
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-dark4.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고 스무 번만 천천히.'
CM_S = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
CM2 = '하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'
NOTE = '톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.'
CLUBS = ['드라이버', '우드 · 유틸', '아이언', '웨지', '퍼터']

# 다크 팔레트 — F안의 공기. 딥그린 잉크에 브론즈/골드 한 줄.
D = {'bg': '#12161A', 'card': '#1B211F', 'card2': '#20272400', 'line': '#2A322E',
     'ink': '#E9ECE6', 'sub': '#ADB6AC', 'dim': '#77807A', 'green': '#6FA477',
     'deep': '#2E5C41', 'gold': '#D9B36A', 'gsoft': '#2A2418', 'soft': '#22302A'}

# 상태색 — runtime-v3.js swState() 의 실제 값
ST = {'err': '#C0392B', 'busy': '#E8C07A', 'sent': '#B9C7BC', 'done': '#8FBFA3'}

TABS = ['홈', '연습기록', '스윙', '레슨기록', '마이']
ICONS = {
    '홈': '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
    '연습기록': '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    '스윙': '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    '레슨기록': '<path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    '마이': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
}
GOLFER = ('<svg viewBox="0 0 60 80" style="position:absolute;left:50%;bottom:8%;width:30%;'
          'transform:translateX(-54%)"><g fill="#16211A">'
          '<circle cx="34" cy="12" r="6"/>'
          '<path d="M30 18c-6 2-9 8-10 16l-3 22 6 20h5l-3-19 5-14 8 13 2 20h5l-1-22-6-16'
          'c3-6 2-14-1-18-2-2-4-3-7-2z"/>'
          '<path d="m28 26-16 20 2 2 17-16z"/></g>'
          '<rect x="10" y="45" width="3" height="3" rx="1.5" fill="#fff"/></svg>')


def icon(name, sz=19):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round" '
            f'style="width:{sz}px;height:{sz}px;display:block">{ICONS[name]}</svg>')


def scene(label='', h=140, night=False):
    sky = '#39434B' if night else '#7A8B94'
    return (f'<div class="scene" style="height:{h}px;flex:none">'
            f'<i style="background:{sky};height:44%"></i>'
            f'<i style="background:#55705B;height:16%"></i>'
            f'<i style="background:#3E5A47;flex:1"></i>{GOLFER}'
            + (f'<span class="bd">{label}</span>' if label else '') + '</div>')


def st(kind, text):
    """스윙 상태 배지 — 색이 글자보다 빨리 읽힌다 (swState 그대로)."""
    return (f'<span class="st"><i style="background:{ST[kind]}"></i>'
            f'<b style="color:{ST[kind]}">{text}</b></span>')


def pro(text, when='', big=False):
    return (f'<div class="pro{" big" if big else ""}">'
            + (f'<div class="pro-w">이도형 프로 · {when}</div>' if when else '')
            + f'<div class="pro-t">{text}</div></div>')


def tabbar(on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n, 18)}<b>{n}</b></span>'
                      for n in TABS) + '</div>')


def frame(title, tab, body, cls=''):
    return (f'<div class="ph {cls}"><div class="ph-top"><span>9:41</span>'
            f'<i class="beta">베타</i><span class="batt"></span></div>'
            + (f'<div class="ph-head">{title}</div>' if title else '')
            + f'<div class="ph-body">{body}</div>{tabbar(tab)}</div>')


def pc1row(when, n_photo, body, first=False):
    """pc1 의 댓글줄 — 아바타 「이」 · 이름/시각 · 우측 사진 스트립 · 들여쓴 본문."""
    shots = (f'<span class="rs">{"".join("<s></s>" for _ in range(n_photo))}</span>'
             if n_photo else '')
    return (f'<div class="crow{"" if first else " nx"}">'
            f'<span class="crh"><span class="cav">이</span>'
            f'<span class="cwho"><b>이도형 프로</b><i>{when}</i></span>{shots}</span>'
            f'<span class="cbody">{body}</span></div>')


def calgrid(extra=''):
    return f'''<div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="d-ans">4</s><s class="sel d-ans">5</s><s class="today d-wait">6</s><s class="off">7</s><s class="off">8</s>
    {extra}
  </div>'''


def daypanel():
    """연습기록의 날짜 요약 패널 — 스윙이 위, 한마디가 아래 (실제 순서)."""
    return f'''<div class="day">
  <div class="day-h">8월 5일 (수) <em>스윙 2 · 한마디 1</em></div>
  <div class="day-sw">{scene('정면', 58)}{scene('측면', 58)}
    <span class="day-m">{st('done', '한마디 1')}{st('sent', '전달됨')}</span></div>
  {pro(f'“{CM2}”', '오후 9:40')}
  <div class="day-note">내 메모 — “{NOTE}”</div>
</div>'''


def galcells():
    """갤러리 셀 — 3:4, 좌상 각도+클럽, 하단 상태. 상태 6종을 다 보여준다."""
    cells = [
        ('정면 · 드라이버', 'busy', '보는 중'),
        ('측면 · 드라이버', 'sent', '전달됨'),
        ('정면 · 아이언', 'done', '한마디 1'),
        ('측면 · 아이언', 'busy', '보내는 중 62%'),
        ('정면 · 웨지', 'busy', '대기 중'),
        ('측면 · 퍼터', 'err', '재전송 필요'),
    ]
    return [(f'<div class="gc">{scene("", 0)}'
             f'<span class="gv">{v}</span><span class="gst">{st(k, t)}</span></div>')
            for v, k, t in cells]


def sheet_body():
    """업로드 시트 — clubSheet() 의 실제 문안 그대로."""
    return (f'<div class="sh-t">무엇으로 치셨어요?</div>'
            f'<div class="sh-c">' + ''.join(
                f'<span class="chip{" on" if c == "아이언" else ""}">{c}</span>' for c in CLUBS)
            + '</div>'
            f'<div class="sh-s">어느 쪽에서 찍었어요?</div>'
            f'<div class="sh-c"><span class="chip on">정면</span><span class="chip">측면</span></div>'
            f'<div class="cta">올리기</div>'
            f'<div class="sh-skip">나중에 고를게요</div>')


STAT4 = ('<div class="st4">'
         '<span><b>12</b><i>연습일</i></span><span><b>14</b><i>영상</i></span>'
         '<span><b>6</b><i>한마디</i></span><span><b>9</b><i>최장 연속</i></span></div>')

SEG = ('<div class="seg"><span class="off">정기 피드백</span><span class="on">프로 한마디</span></div>'
       '<div class="seg-n">정기 피드백은 베타 이후에 열립니다 · 월 1회</div>')

CMCARD = (f'<div class="cmc"><div class="cmc-h"><span class="cav">이</span>'
          f'<span class="cwho"><b>새 프로 한마디</b><i>방금 · 8월 5일 스윙</i></span>'
          f'<span class="pbdg">사진 2</span></div>'
          f'<div class="cmc-t">“{CM_S} 백스윙 절반에서…”</div>'
          f'<div class="cmc-more">계속 읽기</div></div>')

RECLINE = ('<div class="rec"><span>오늘 기록하기</span>'
           '<em>최근 기록 · 8월 5일 · 🔥 5일 연속</em></div>')

BANNER = '<div class="bnr">프로에게 답장이 왔어요 <em>확인하기 ›</em></div>'
FOLD = '<div class="fold">오늘 스윙 1개 올렸어요 <em>기록 남기기 +</em></div>'

# ════════════════════════════════════════════════════════════════════
# G. 시네마 시트 — F 직계. 영상이 배경, 정보는 전부 시트에
# ════════════════════════════════════════════════════════════════════
g_home = f'''
<div class="vid">{scene('8월 5일 · 정면 · 아이언', 280)}<div class="vgrad"></div></div>
<div class="sheet">
  <div class="hdl"></div>
  <div class="kick">프로 한마디 · 도착</div>
  <div class="h-t">이도형 프로가<br>한마디를 남겼어요</div>
  {pro(f'“{CM_S}”', '방금 · 사진 2장')}
  <div class="cta">한마디 확인하기</div>
  {RECLINE}
</div>'''

g_rec = f'''
<div class="vid dim">{scene('', 150)}<div class="vgrad"></div></div>
<div class="sheet tall">
  <div class="hdl"></div>
  {BANNER}
  <div class="cal">{calgrid()}</div>
  {daypanel()}
</div>'''

g_gal = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">드라이버</span><span class="chip">아이언</span>
<span class="chip">한마디 받음</span></div>
<div class="sec">2026. 8. 6 (목) <em>2개</em></div>
<div class="grid">{''.join(galcells()[:2])}</div>
<div class="sec">2026. 8. 5 (수) <em>2개</em></div>
<div class="grid">{''.join(galcells()[2:4])}</div>
<div class="lim">오늘 2편을 다 올렸어요 — 두 편은 정면 · 측면 순서로 들어갑니다</div>'''

g_les = f'''
{SEG}
<div class="dl">8월 5일 (수) 스윙에 달린 한마디</div>
{pc1row('8월 5일 오후 9:40 · 사진 2', 2, f'“{CM}”', True)}
{pc1row('8월 6일 오전 8:12', 0, '“어제 말한 어깨, 오늘 영상에선 확실히 좋아졌어요.”')}
<div class="myv">{scene('내 스윙 영상 · 정면', 84)}<em>맨 뒤 — 글이 먼저, 영상은 나중</em></div>'''

g_my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
<div class="wg"><div class="wg-t">이번 달</div>{STAT4}</div>
<div class="idc"><b>아이디 만들기</b><i>폰을 바꿔도 스윙과 한마디가 그대로 이어져요</i></div>
<div class="list"><span>알림 설정</span><span>구독 · 결제 <i>베타 무료</i></span>
<span>약관 · 개인정보</span><span>문의하기</span></div>'''

# ════════════════════════════════════════════════════════════════════
# H. 딥그린 카드 — 지금 앱 구조를 그대로 다크로 번역 (이식 최단거리)
# ════════════════════════════════════════════════════════════════════
h_home = f'''
<div class="hero">
  <div class="kick">프로 한마디 · 확인 중</div>
  <div class="h-t">이도형 프로가<br>스윙을 보고 있어요</div>
  <div class="h-b">2시간 전 요청했어요 · 보통 하루 안에 도착해요</div>
  <div class="cta ghost">올린 스윙 보기</div>
</div>
{CMCARD}
{RECLINE}'''

h_rec = f'''
{BANNER}
<div class="cal card">{calgrid()}</div>
{FOLD}
{daypanel()}'''

h_gal = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">아이언</span><span class="chip">한마디 받음</span></div>
<div class="sec">2026. 8. 6 (목) <em>2개</em></div>
<div class="grid">{''.join(galcells()[:2])}</div>
<div class="sec">2026. 8. 5 (수) <em>4개</em></div>
<div class="grid">{''.join(galcells()[2:])}</div>'''

h_les = f'''
{SEG}
<div class="dl">8월 5일 (수)</div>
<div class="card pad">
{pc1row('오후 9:40 · 사진 2', 2, f'“{CM}”', True)}
{pc1row('8월 6일 오전 8:12', 0, '“어제 말한 어깨, 오늘 영상에선 확실히 좋아졌어요.”')}
</div>
<div class="myv">{scene('내 스윙 영상', 76)}<em>답이 달린 그 스윙</em></div>'''

h_my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
{STAT4}
{pro('“꾸준히 오는 회원이 제일 늘어요. 이번 달도 잘 부탁합니다.”')}
<div class="idc"><b>아이디 만들기</b><i>폰을 바꿔도 스윙과 한마디가 그대로 이어져요</i></div>
<div class="list"><span>알림 설정</span><span>구독 · 결제 <i>베타 무료</i></span><span>문의하기</span></div>'''

# ════════════════════════════════════════════════════════════════════
# I. 미드나잇 저널 — 날짜 세리프 머리, 한마디를 일지처럼
# ════════════════════════════════════════════════════════════════════
i_home = f'''
<div class="jd">8월 6일 목요일</div>
<div class="jrule"></div>
<div class="kick">오늘</div>
<div class="h-t serif">오늘 스윙,<br>프로에게 보냈어요</div>
<div class="cta small">오늘 몫은 다 썼어요 · 내일 다시</div>
<div class="h-b ctr">프로 한마디는 하루 한 번이에요 · 내일 다시 요청할 수 있어요</div>
<div class="jrule"></div>
{CMCARD}
{RECLINE}'''

i_rec = f'''
<div class="jd">2026년 8월</div>
<div class="jrule"></div>
<div class="cal bare">{calgrid()}</div>
{daypanel()}
{FOLD}'''

i_gal = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">아이언</span><span class="chip">한마디 받음</span></div>
<div class="jd sm">8월 6일 목요일 <em>2개</em></div><div class="jrule"></div>
<div class="grid">{''.join(galcells()[:2])}</div>
<div class="jd sm">8월 5일 수요일 <em>2개</em></div><div class="jrule"></div>
<div class="grid">{''.join(galcells()[2:4])}</div>'''

i_les = f'''
{SEG}
<div class="jd">8월 5일 수요일 밤</div>
<div class="jrule"></div>
{pc1row('오후 9:40 · 사진 2', 2, f'“{CM}”', True)}
{pc1row('8월 6일 오전 8:12', 0, '“어제 말한 어깨, 오늘 영상에선 확실히 좋아졌어요.”')}
<div class="myv">{scene('내 스윙 영상', 76)}<em>이 글이 달린 스윙</em></div>'''

i_my = f'''
<div class="jd">골프러버 <em>이도형 프로와 32일째</em></div>
<div class="jrule"></div>
{STAT4}
{pro('“꾸준히 오는 회원이 제일 늘어요. 이번 달도 잘 부탁합니다.”')}
<div class="idc"><b>아이디 만들기</b><i>폰을 바꿔도 스윙과 한마디가 그대로 이어져요</i></div>
<div class="list"><span>알림 설정</span><span>구독 · 결제 <i>베타 무료</i></span></div>'''

# ════════════════════════════════════════════════════════════════════
# J. 코치 콘솔 — 상태 스트립 + 행(row) 문법, 숫자와 상태가 먼저
# ════════════════════════════════════════════════════════════════════
j_home = f'''
<div class="stx"><span>{st('busy', '보는 중 1')}</span><span>{st('sent', '전달됨 1')}</span>
<span>{st('done', '한마디 6')}</span><span><b class="up">1/2</b><i>오늘 업로드</i></span></div>
<div class="hero slim">
  <div class="kick">프로 한마디 · 확인 중</div>
  <div class="h-t">이도형 프로가<br>스윙을 보고 있어요</div>
  <div class="h-b">2시간 전 요청 · 보통 하루 안에 도착</div>
</div>
{CMCARD}
{RECLINE}'''

j_rec = f'''
<div class="cal card">{calgrid()}</div>
<div class="rowl">
  <div class="row"><span class="rd">8.6</span><span class="ri"><b>측면 · 드라이버</b><i>{st('busy', '보는 중')}</i></span><em>›</em></div>
  <div class="row on"><span class="rd">8.5</span><span class="ri"><b>정면 · 아이언 + 메모</b><i>{st('done', '한마디 1')}</i></span><em>›</em></div>
  <div class="row"><span class="rd">8.4</span><span class="ri"><b>정면 · 드라이버</b><i>{st('done', '한마디 1')}</i></span><em>›</em></div>
</div>
{pro(f'“{CM2}”', '8월 5일 오후 9:40')}'''

j_gal = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">한마디 받음</span></div>
<div class="rowl">
  <div class="rowg">{scene('', 54)}<span class="ri"><b>정면 · 드라이버</b><i>8월 6일</i></span>{st('busy', '보는 중')}</div>
  <div class="rowg">{scene('', 54)}<span class="ri"><b>측면 · 드라이버</b><i>8월 6일</i></span>{st('sent', '전달됨')}</div>
  <div class="rowg">{scene('', 54)}<span class="ri"><b>정면 · 아이언</b><i>8월 5일</i></span>{st('done', '한마디 1')}</div>
  <div class="rowg">{scene('', 54)}<span class="ri"><b>측면 · 아이언</b><i>8월 5일</i></span>{st('busy', '보내는 중 62%')}</div>
  <div class="rowg">{scene('', 54)}<span class="ri"><b>측면 · 퍼터</b><i>8월 3일</i></span>{st('err', '재전송 필요')}</div>
</div>
<div class="lim">하루 2편 — 두 편은 정면 · 측면 순서로 들어갑니다</div>'''

j_les = f'''
{SEG}
<div class="rowl">
  <div class="row on"><span class="rd">8.5</span><span class="ri"><b>“{CM_S[:22]}…”</b><i>사진 2 · 안 읽음</i></span><em>›</em></div>
  <div class="row"><span class="rd">8.4</span><span class="ri"><b>“{CM2}”</b><i>읽음</i></span><em>›</em></div>
  <div class="row"><span class="rd">8.1</span><span class="ri"><b>“어드레스에서 오른 어깨가 높아요…”</b><i>읽음</i></span><em>›</em></div>
</div>
{pc1row('8월 5일 오후 9:40 · 사진 2', 2, f'“{CM}”', True)}'''

j_my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
{STAT4}
<div class="rowl">
  <div class="row"><span class="ri"><b>아이디 만들기</b><i>폰을 바꿔도 기록이 이어져요</i></span><em>›</em></div>
  <div class="row"><span class="ri"><b>구독 · 결제</b><i>베타 무료</i></span><em>›</em></div>
  <div class="row"><span class="ri"><b>알림 설정</b></span><em>›</em></div>
  <div class="row"><span class="ri"><b>문의하기</b></span><em>›</em></div>
</div>'''

# ════════════════════════════════════════════════════════════════════
THEMES = [
    ('thG', 'G. 시네마 시트', 'F 직계 — 영상이 배경, 정보 전부를 시트에',
     '홈 배경이 오늘의 스윙이고 글은 시트로 올라온다. 히어로 상태·한마디 카드·기록 줄, '
     '연습기록의 달력+요약 패널+답장 배너, 갤러리 상태 6색까지 — F의 공기에 실제 정보 전부.',
     [('', '홈', g_home, '히어로 상태가 시트 첫 줄',
       'kick(프로 한마디 · 도착)→제목→프로의 말→CTA — 실제 홈 히어로 문법 그대로, 배경만 영상.'),
      ('연습기록', '연습기록', g_rec, '배너→달력→요약 패널 실제 순서',
       '답장 배너가 맨 위, 달력의 상태 점(브론즈=답 받음·앰버=보는 중), 5일을 고르면 스윙 위·한마디 아래.'),
      ('스윙', '스윙', g_gal, '상태 6종이 다 보인다',
       '보는 중·전달됨·한마디 N·보내는 중 62%·대기 중·재전송 필요 — swState() 색 그대로. 밑줄엔 하루 2편 규칙.'),
      ('레슨기록', '레슨기록', g_les, 'pc1 댓글줄 원형',
       '세그먼트(정기 피드백은 베타 잠금) 아래, 아바타 「이」·시각·우측 사진 스트립·들여쓴 본문. 내 스윙 영상은 맨 뒤.'),
      ('마이', '마이', g_my, '이번 달 4칸 + 이어붙이기',
       '연습일·영상·한마디·최장 연속 — 실제 마이 통계. 아이디 만들기 카드가 구독보다 위다.')]),

    ('thH', 'H. 딥그린 카드', '지금 앱 구조 1:1 다크 번역 — 이식 최단거리',
     '화면 구조·순서를 지금 앱에서 하나도 안 바꿨다. 카드가 아이보리에서 딥그린으로 바뀌었을 뿐. '
     '이 안을 고르면 CSS 변수 교체만으로 오늘 적용할 수 있다.',
     [('홈', '홈', h_home, '히어로 상태 ②(확인 중)',
       '「스윙을 보고 있어요 · 2시간 전 요청 · 보통 하루 안에」 — 기다림도 상태로 만든 실제 카피.'),
      ('연습기록', '연습기록', h_rec, '접힘 카드까지 그대로',
       '오늘 올렸으면 오늘 카드는 한 줄로 접힌다(실제 47px 규칙). 배너·달력·요약 순서도 지금 앱과 동일.'),
      ('스윙', '스윙', h_gal, '날짜 머리글 + 3:4 셀',
       '2026. 8. 6 (목) · 2개 — 실제 머리글 서식. 셀 좌상단 각도·클럽, 하단 상태색.'),
      ('레슨기록', '레슨기록', h_les, '스레드가 한 카드 안에',
       '같은 스윙에 달린 답 두 줄이 한 카드에서 시간순으로 이어진다 — applyPc1 의 스레드 규칙.'),
      ('마이', '마이', h_my, '통계→당부→계정 순',
       '숫자 다음에 프로의 당부가 온다 — 마이에서도 관계가 설정보다 위.')]),

    ('thI', 'I. 미드나잇 저널', '날짜가 머리 — 한마디를 레슨 일지로 조판',
     '모든 화면이 세리프 날짜 머리와 가는 금줄로 시작한다. 화면이 아니라 일지의 페이지 — '
     '하루 1회 제한·연속 기록 같은 「하루」의 규칙과 가장 잘 어울리는 조판.',
     [('', '홈', i_home, '히어로 상태 ④-2(오늘 몫 소진)',
       '「오늘 몫은 다 썼어요 · 내일 다시」 — 하루 1회 제한의 실제 카피. 버튼이 작아지고 안내가 붙는다.'),
      ('연습기록', '연습기록', i_rec, '달력이 지면 위에 바로',
       '카드 상자를 벗기고 금줄 밑에 달력을 그대로 얹었다 — 일지의 월간 페이지.'),
      ('스윙', '스윙', i_gal, '날짜 머리글이 세리프로',
       '「8월 6일 목요일 · 2개」 — 갤러리 날짜 묶음 규칙을 일지 머리로 바꿔 조판.'),
      ('레슨기록', '레슨기록', i_les, '한마디가 일지의 본문',
       '「8월 5일 수요일 밤」 아래 프로의 글 — 댓글줄 구조는 그대로, 공기만 편지다.'),
      ('마이', '마이', i_my, '이름이 표제',
       '「골프러버 — 이도형 프로와 32일째」가 페이지 표제로. 4칸 통계가 밑에 선다.')]),

    ('thJ', 'J. 코치 콘솔', '상태 스트립 + 행 문법 — 숫자와 상태가 먼저',
     '맨 위에 상태 스트립(보는 중·전달됨·한마디·오늘 업로드 1/2)이 상주한다. 갤러리와 레슨기록은 '
     '격자 대신 행(row) — 훑고 골라 들어가는 관리자형. 자주 쓰는 사람의 최단 동선.',
     [('', '홈', j_home, '상태 스트립이 첫 줄',
       '내 스윙 전부가 지금 어느 상태인지 + 오늘 업로드 1/2 — 하루 2편 제한이 숫자로 상주한다.'),
      ('연습기록', '연습기록', j_rec, '달력 밑은 행 리스트',
       '날짜·각도·클럽·상태가 한 행에. 메모 붙은 날은 「+ 메모」 — 프로가 같이 보는 그 메모다.'),
      ('스윙', '스윙', j_gal, '갤러리도 행으로',
       '썸네일 작게, 메타와 상태가 크게. 재전송 필요(빨강)가 훑기만 해도 걸린다.'),
      ('레슨기록', '레슨기록', j_les, '받은 한마디 목록 + 원문',
       '안 읽음이 맨 위(실제 정렬). 행을 고르면 밑에 pc1 댓글줄 원문이 펼쳐진다.'),
      ('마이', '마이', j_my, '설정도 같은 행 문법',
       '앱 전체가 행 하나로 통일 — 배우는 비용이 화면당 0이 된다.')]),
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
<title>NEXT SWING · 다크 집중 4안 — 실기능 전부 반영</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Pretendard,-apple-system,'Malgun Gothic',sans-serif;background:#0D1013;
  color:#EFEBE2;-webkit-font-smoothing:antialiased;padding:38px 28px 90px}}
h1{{font-size:22px;letter-spacing:-.02em}}
h2{{font-size:17px;margin:0 0 6px}}
h2 em{{font-style:normal;font-size:12.5px;color:#D9B36A;font-weight:600;margin-left:8px}}
.lede{{font-size:12.5px;color:#A8B0A6;line-height:1.8;max-width:700px}}
.th{{margin-top:44px;padding-top:26px;border-top:1px solid #262C29}}
.strip{{display:flex;gap:24px;overflow-x:auto;padding:20px 4px 8px;align-items:flex-start}}
.col{{flex:none;width:340px}}
.why{{font-size:11.5px;color:#A8B0A6;line-height:1.75;padding:12px 6px 0}}
.why b{{display:block;color:#EFEBE2;font-size:12px;padding-bottom:3px}}

.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:704px;background:{D['bg']};color:{D['ink']};position:relative;
  box-shadow:0 18px 44px -18px rgba(0,0,0,.8)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700;position:relative;z-index:3}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.85}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px;
  background:{D['soft']};color:{D['green']}}}
.ph-head{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:19px;font-weight:600;
  padding:12px 20px 2px;position:relative;z-index:3}}
.ph-body{{flex:1;padding:12px 18px 18px;display:flex;flex-direction:column;position:relative;z-index:2}}
.tabs{{display:flex;background:#0F1316;border-top:1px solid {D['line']};
  padding:8px 0 10px;position:relative;z-index:3}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:{D['dim']}}}
.tb b{{font-size:9px;font-weight:700}}
.tb.on{{color:{D['green']}}}

.scene{{position:relative;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}}
.bd{{position:absolute;left:8px;top:8px;background:rgba(10,14,12,.6);color:#fff;
  font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px}}
.st{{display:inline-flex;align-items:center;gap:5px}}
.st i{{width:7px;height:7px;border-radius:50%;display:inline-block}}
.st b{{font-size:10.5px;font-weight:800}}

.kick{{font-size:12px;font-weight:800;color:{D['gold']};padding:2px 0 6px}}
.h-t{{font-family:Hahmlet,serif;font-size:23px;font-weight:600;line-height:1.42;padding-bottom:8px}}
.h-t.serif{{font-size:25px}}
.h-b{{font-size:11.5px;color:{D['sub']};line-height:1.7;padding-bottom:4px}}
.h-b.ctr{{text-align:center;color:{D['dim']}}}
.cta{{background:{D['deep']};color:#fff;border-radius:14px;text-align:center;
  padding:14px;font-size:14.5px;font-weight:800;margin:10px 0 8px}}
.cta.ghost{{background:transparent;border:1px solid {D['line']};color:{D['ink']}}}
.cta.small{{padding:10px;font-size:12.5px;background:#252C28;color:{D['sub']};margin:8px auto;
  width:78%;border-radius:99px}}
.hero{{background:{D['card']};border:1px solid {D['line']};border-radius:18px;padding:16px;margin-bottom:12px}}
.hero.slim{{padding:14px 16px 10px}}
.pro{{border-left:3px solid {D['gold']};background:{D['gsoft']};border-radius:4px 14px 14px 4px;
  padding:12px 14px;margin:8px 0}}
.pro-w{{font-size:10.5px;font-weight:700;color:{D['gold']};padding-bottom:6px}}
.pro-t{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:13.5px;line-height:1.85;color:#EADFC6}}
.pro.big .pro-t{{font-size:15px;line-height:1.9}}

.cmc{{background:{D['card']};border:1px solid {D['line']};border-radius:16px;padding:13px 14px;margin:10px 0}}
.cmc-h{{display:flex;align-items:center;gap:9px;padding-bottom:8px}}
.cav{{flex:none;width:30px;height:30px;border-radius:50%;background:{D['gsoft']};
  color:{D['gold']};display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800}}
.cwho{{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}}
.cwho b{{font-size:12.5px;font-weight:800}}
.cwho i{{font-style:normal;font-size:10.5px;color:{D['dim']}}}
.pbdg{{flex:none;font-size:10px;font-weight:700;color:{D['sub']};background:#252C28;
  border-radius:6px;padding:3px 7px}}
.cmc-t{{font-family:Hahmlet,serif;font-size:13px;line-height:1.8;color:{D['ink']};
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
.cmc-more{{font-size:12px;font-weight:800;color:{D['green']};padding-top:8px;text-align:right}}
.rec{{display:flex;justify-content:space-between;align-items:center;background:{D['card']};
  border:1px solid {D['line']};border-radius:13px;padding:12px 14px;margin-top:4px}}
.rec span{{font-size:12.5px;font-weight:800}}
.rec em{{font-style:normal;font-size:10.5px;color:{D['dim']}}}
.bnr{{background:{D['soft']};color:{D['green']};border-radius:12px;padding:11px 14px;
  font-size:12.5px;font-weight:800;display:flex;justify-content:space-between;margin-bottom:10px}}
.bnr em{{font-style:normal}}
.fold{{display:flex;justify-content:space-between;background:{D['card']};border:1px solid {D['line']};
  border-radius:12px;padding:12px 14px;font-size:12px;font-weight:700;color:{D['sub']};margin:10px 0}}
.fold em{{font-style:normal;font-weight:800;color:{D['green']}}}

.cal{{padding:13px 13px 11px}}
.cal.card,.cal.dark{{background:{D['card']};border:1px solid {D['line']};border-radius:16px}}
.cal.bare{{padding:6px 0 0}}
.cal.bare .cal-h{{display:none}}
.cal-h{{text-align:center;font-size:13px;font-weight:800;padding-bottom:10px}}
.cal-w,.cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.cal-w s{{text-decoration:none;font-size:10px;font-weight:700;color:{D['dim']};padding:3px 0}}
.cal-g s{{text-decoration:none;font-size:12.5px;font-weight:600;color:{D['sub']};height:30px;
  display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}}
.cal-g s.off{{opacity:.35}}
.cal-g s.sel{{background:{D['ink']};color:#12161A;font-weight:800}}
.cal-g s.today{{box-shadow:inset 0 0 0 1.5px {D['ink']};font-weight:800}}
.cal-g s.d-ans:after,.cal-g s.d-wait:after{{content:'';position:absolute;bottom:0;left:50%;
  margin-left:-2.5px;width:5px;height:5px;border-radius:50%}}
.cal-g s.d-ans:after{{background:{D['gold']}}}
.cal-g s.d-wait:after{{background:{ST['busy']}}}
.day{{background:{D['card']};border:1px solid {D['line']};border-radius:16px;padding:13px 14px;margin-top:12px}}
.day-h{{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;
  font-weight:800;padding-bottom:8px}}
.day-h em{{font-style:normal;font-size:10.5px;color:{D['dim']}}}
.day-sw{{display:flex;gap:8px;align-items:center;padding-bottom:4px}}
.day-sw .scene{{width:44px}}
.day-m{{margin-left:auto;display:flex;flex-direction:column;gap:5px;align-items:flex-end}}
.day-note{{font-size:11.5px;color:{D['sub']};line-height:1.7;padding-top:6px;
  border-top:1px dashed {D['line']};margin-top:8px}}

.chips{{display:flex;gap:6px;overflow:hidden;padding-bottom:10px}}
.chip{{flex:none;font-size:12px;font-weight:700;border-radius:9px;padding:7px 12px;
  background:{D['card']};color:{D['sub']};border:1px solid {D['line']}}}
.chip.on{{background:{D['deep']};color:#fff;border-color:{D['deep']}}}
.sec{{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;
  font-weight:800;padding:10px 2px 8px;border-top:1px solid {D['line']};margin-top:6px}}
.sec:first-of-type{{border-top:0;margin-top:0}}
.sec em{{font-style:normal;font-size:11px;color:{D['dim']};font-weight:600}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:9px}}
.gc{{position:relative;aspect-ratio:3/4;border-radius:12px;overflow:hidden;
  border:1px solid {D['line']};display:flex;flex-direction:column}}
.gc .scene{{position:absolute;inset:0;height:auto!important;border-radius:0}}
.gv{{position:absolute;left:8px;top:8px;background:rgba(10,14,12,.6);color:#fff;
  font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px;z-index:2}}
.gst{{position:absolute;left:8px;bottom:8px;background:rgba(10,14,12,.72);
  border-radius:7px;padding:4px 8px;z-index:2}}
.lim{{font-size:11px;color:{D['dim']};text-align:center;padding-top:12px;line-height:1.7}}

.seg{{display:flex;background:{D['card']};border:1px solid {D['line']};border-radius:12px;
  padding:4px;margin-bottom:6px}}
.seg span{{flex:1;text-align:center;font-size:12.5px;font-weight:800;padding:9px 0;border-radius:9px}}
.seg .on{{background:{D['deep']};color:#fff}}
.seg .off{{color:{D['dim']}}}
.seg-n{{font-size:10.5px;color:{D['dim']};text-align:center;padding-bottom:10px}}
.dl{{font-size:11px;font-weight:800;color:{D['dim']};letter-spacing:.06em;
  text-align:center;padding:8px 0 10px}}
.crow{{display:flex;flex-direction:column;gap:7px}}
.crow.nx{{margin-top:14px;padding-top:14px;border-top:1px solid {D['line']}}}
.crh{{display:flex;align-items:flex-start;gap:9px}}
.rs{{display:flex;gap:4px}}
.rs s{{width:30px;height:40px;border-radius:6px;display:block;
  background:linear-gradient(#39434B 44%,#3E5A47 44%)}}
.cbody{{display:block;padding-left:39px;font-size:13px;line-height:1.85;color:{D['ink']}}}
.card.pad{{background:{D['card']};border:1px solid {D['line']};border-radius:16px;padding:14px}}
.myv{{display:flex;gap:10px;align-items:center;margin-top:14px}}
.myv .scene{{width:112px}}
.myv em{{font-style:normal;font-size:11px;color:{D['dim']};line-height:1.7}}

.me-h{{display:flex;gap:12px;align-items:center;padding:6px 2px 14px}}
.av{{flex:none;width:46px;height:46px;border-radius:50%;background:{D['soft']};
  color:{D['green']};display:flex;align-items:center;justify-content:center;
  font-size:16px;font-weight:800}}
.me-h b{{display:block;font-size:17px;font-weight:800}}
.me-h i{{font-style:normal;font-size:11.5px;color:{D['gold']};font-weight:700}}
.st4{{display:flex;background:{D['card']};border:1px solid {D['line']};border-radius:14px;
  padding:12px 0;margin-bottom:10px}}
.st4 span{{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  border-right:1px solid {D['line']}}}
.st4 span:last-child{{border-right:0}}
.st4 b{{font-family:Hahmlet,serif;font-size:17px;color:{D['green']}}}
.st4 i{{font-style:normal;font-size:9.5px;font-weight:700;color:{D['dim']}}}
.idc{{background:{D['soft']};border-radius:14px;padding:13px 15px;margin-bottom:10px}}
.idc b{{display:block;font-size:13px;font-weight:800;color:{D['green']};padding-bottom:3px}}
.idc i{{font-style:normal;font-size:11px;color:{D['sub']};line-height:1.6}}
.list{{background:{D['card']};border:1px solid {D['line']};border-radius:16px;overflow:hidden}}
.list span{{display:flex;justify-content:space-between;padding:14px 16px;font-size:13px;
  font-weight:600;border-bottom:1px solid {D['line']}}}
.list span:last-child{{border-bottom:0}}
.list i{{font-style:normal;font-size:11px;color:{D['dim']}}}
.wg{{background:{D['card']};border:1px solid {D['line']};border-radius:16px;padding:13px 14px;margin-bottom:10px}}
.wg-t{{font-size:11px;font-weight:800;color:{D['dim']};padding-bottom:8px}}
.wg .st4{{border:0;padding:0;margin:0;background:none}}

/* G. 시네마 시트 */
.vid{{margin:-58px -18px 0;position:relative;z-index:0}}
.vid .scene{{border-radius:0}}
.vid.dim .scene{{opacity:.4}}
.vgrad{{position:absolute;inset:0;background:linear-gradient(rgba(13,16,19,.5),transparent 30%,
  transparent 52%,rgba(13,16,19,.95))}}
.sheet{{position:relative;z-index:2;background:#181E1C;border-radius:22px 22px 0 0;
  margin:-28px -18px -18px;padding:10px 18px 18px;flex:1}}
.sheet.tall{{margin-top:-44px}}
.hdl{{width:40px;height:4px;border-radius:99px;background:#343C38;margin:2px auto 12px}}

/* I. 저널 */
.jd{{font-family:Hahmlet,serif;font-size:17px;font-weight:600;display:flex;
  justify-content:space-between;align-items:baseline;padding-top:2px}}
.jd.sm{{font-size:14px;padding-top:10px}}
.jd em{{font-style:normal;font-size:10.5px;color:{D['dim']};font-family:Pretendard,sans-serif}}
.jrule{{height:1px;background:linear-gradient(90deg,{D['gold']},transparent 70%);
  margin:8px 0 12px;opacity:.55}}

/* J. 콘솔 */
.stx{{display:flex;background:{D['card']};border:1px solid {D['line']};border-radius:14px;
  padding:11px 0;margin-bottom:10px}}
.stx>span{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  border-right:1px solid {D['line']}}}
.stx>span:last-child{{border-right:0}}
.stx .up{{font-family:Hahmlet,serif;font-size:15px;color:{D['ink']}}}
.stx i{{font-style:normal;font-size:9px;font-weight:700;color:{D['dim']}}}
.rowl{{background:{D['card']};border:1px solid {D['line']};border-radius:16px;
  overflow:hidden;margin-bottom:10px}}
.row,.rowg{{display:flex;align-items:center;gap:11px;padding:11px 13px;
  border-bottom:1px solid {D['line']}}}
.row:last-child,.rowg:last-child{{border-bottom:0}}
.row.on{{background:#20272400;background:#212824}}
.rd{{flex:none;font-family:Hahmlet,serif;font-size:14px;font-weight:700;color:{D['gold']};width:30px}}
.ri{{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}}
.ri b{{font-size:12.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.ri i{{font-style:normal;font-size:10.5px;color:{D['dim']}}}
.row em{{font-style:normal;color:{D['dim']}}}
.rowg .scene{{width:40px;flex:none}}

/* 업로드 시트 (오버레이 예시) */
.sh-t{{font-size:15px;font-weight:800;padding-bottom:4px}}
.sh-s{{font-size:12px;font-weight:700;color:{D['dim']};padding-top:6px}}
.sh-c{{display:flex;flex-wrap:wrap;gap:7px;padding-top:7px}}
.sh-skip{{text-align:center;font-size:12.5px;color:{D['dim']};padding-top:4px}}
</style>

<h1>다크 집중 4안 — 실기능 전부 반영</h1>
<p class="lede">F(영상이 주인공)의 공기를 이어받아, 이번엔 <b>앱이 실제로 제공하는 것 전부</b>를
실었다 — 실제 5탭(홈·연습기록·스윙·레슨기록·마이), 홈 히어로 4상태와 하루 1회 제한 카피,
스윙 상태 6종 색, 하루 2편(정면·측면) 규칙, 클럽 5종 업로드 시트, 답장 배너와 날짜 요약 패널,
pc1 댓글줄과 「내 스윙 영상은 맨 뒤」, 정기 피드백 베타 잠금, 이번 달 4칸 통계, 아이디
이어붙이기까지. 화면 속 문안은 전부 runtime-v3.js 의 실제 카피다.</p>
{sections}

<div class="th"><h2>부록 <em>업로드 시트 — clubSheet() 원문</em></h2>
<p class="lede">어느 안을 골라도 업로드 시트는 같다 — 묻는 것은 둘뿐(클럽 · 각도).
「두 편은 정면 · 측면 순서로 들어갑니다」가 하루 2편 규칙의 안내다.</p>
<div class="strip"><div class="col"><div class="ph thH" style="min-height:420px">
<div class="ph-top"><span>9:41</span><i class="beta">베타</i><span class="batt"></span></div>
<div class="ph-body" style="justify-content:flex-end">
<div class="sheet" style="margin-top:0;flex:none">{sheet_body()}</div>
</div></div></div></div></div>
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
