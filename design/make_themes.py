# -*- coding: utf-8 -*-
"""UI 시안판 — 베타에 실제로 있는 5개 화면을 세 가지 디자인 언어로.

주제는 열 개 중 이 앱 사용자층(앱에 익숙하지 않은 20~60대 한국인)에 맞는
셋만 골랐다 — 토스형 · 가민/골프샷형 · 카카오/네이버형.
지금 앱이 이미 무인양품+에디토리얼 계열이라 그 둘은 견줄 의미가 없다.

데이터는 전부 베타에 실제로 있는 것이다. 스윙 스코어 · AI 분석 · 3단 위계
리포트는 베타에 없으므로 그리지 않는다 — 정기 피드백은 잠금 카드로만.
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ui-themes.html')

# ── 실제 데이터 ──────────────────────────────────────────────────────
CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
CM2 = '한 번 더 보니 하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'
NOTE = '톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.'

# ── 주제 정의 ────────────────────────────────────────────────────────
# key, 이름, 설명, CSS 변수, 맞는 사용자
THEMES = [
    ('toss', '⑤ 토스형',
     '화이트 + 블루 하나 · 여백을 극단적으로 넓게 · 한 화면에 한 가지',
     {'bg': '#FFFFFF', 'card': '#F4F6F8', 'line': '#EAEDF0', 'ink': '#191F28',
      'sub': '#4E5968', 'dim': '#8B95A1', 'ac': '#3182F6', 'ac2': '#E8F1FE',
      'ok': '#12B76A', 'warn': '#F0A100', 'r': '18px', 'rs': '12px',
      'nav': '#FFFFFF', 'navline': '#F0F2F4'},
     '앱이 낯선 사람에게 제일 편하다 — 화면마다 할 일이 하나뿐이라 헤맬 곳이 없다.'),
    ('garmin', '⑦ 가민 · 골프샷형',
     '딥그린 + 화이트 · 수치 계기판 · 스포츠 유틸리티',
     {'bg': '#F3F5F2', 'card': '#FFFFFF', 'line': '#DFE5DD', 'ink': '#13251B',
      'sub': '#41544A', 'dim': '#7C8B81', 'ac': '#0B5C38', 'ac2': '#E3EFE7',
      'ok': '#0B8A4B', 'warn': '#C98A12', 'r': '10px', 'rs': '7px',
      'nav': '#0E2A1D', 'navline': '#0E2A1D'},
     '숫자로 관리하는 맛을 아는 사람 — 골프 워치 쓰는 40~50대가 바로 알아본다.'),
    ('kakao', '⑨ 카카오 · 네이버형',
     '밝은 회색 바탕 + 화이트 카드 · 친근하고 둥근 느낌',
     {'bg': '#F5F6F8', 'card': '#FFFFFF', 'line': '#EDEFF2', 'ink': '#1A1C20',
      'sub': '#52565E', 'dim': '#9198A3', 'ac': '#06A755', 'ac2': '#E9F7EF',
      'ok': '#06A755', 'warn': '#E8A21A', 'r': '20px', 'rs': '14px',
      'nav': '#FFFFFF', 'navline': '#EDEFF2'},
     '국민 메신저 · 포털에 익숙한 사람 — 40~60대가 배우지 않고도 쓴다.'),
]

TABS = ['홈', '연습기록', '스윙', '레슨기록', '마이']
ICONS = {  # 단순 스트로크 아이콘 — 이모지 금지
    '홈': '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    '연습기록': '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    '스윙': '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    '레슨기록': '<path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    '마이': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
}


def icon(name, sz=19):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" '
            f'style="width:{sz}px;height:{sz}px;display:block">{ICONS[name]}</svg>')


def tabbar(t, on):
    cells = ''
    for name in TABS:
        act = name == on
        cells += (f'<span class="tb{" on" if act else ""}">{icon(name)}'
                  f'<b>{name}</b></span>')
    return f'<div class="tabs">{cells}</div>'


def frame(t, title, on_tab, body, note=''):
    return (f'<div class="ph t-{t}">'
            f'<div class="ph-top"><span>9:41</span><i class="beta">베타</i><span class="batt"></span></div>'
            f'<div class="ph-head">{title}</div>'
            f'<div class="ph-body">{body}</div>'
            f'{tabbar(t, on_tab)}'
            f'</div>'
            + (f'<div class="ph-note">{note}</div>' if note else ''))


# ── 화면 부품 (주제 공통 마크업 · 스타일은 테마 CSS 가 가른다) ──────
def chip(txt, on=False):
    return f'<span class="chip{" on" if on else ""}">{txt}</span>'


def dot(color):
    return f'<i class="st" style="background:{color}"></i>'


def swing_cell(view, club, state, color, dark=True):
    return (f'<div class="cell{"" if dark else " lite"}">'
            f'<span class="bd">{view}</span>'
            + (f'<span class="bd b2">{club}</span>' if club else '')
            + f'<span class="cs">{dot(color)}{state}</span></div>')


def screens(t, v):
    """다섯 화면의 본문 — 마크업은 같고 테마 CSS 로 갈린다."""
    ok, warn, ac = v['ok'], v['warn'], v['ac']

    home = f'''
<div class="kick">프로 한마디 · 도착</div>
<div class="h1">이도형 프로가<br>한마디를 남겼어요</div>
<div class="quote">“{CM}”</div>
<div class="cta">한마디 확인하기</div>
<div class="row">
  <span class="row-t">8월 프로 한마디</span><span class="row-n">3회 남음</span>
</div>
<div class="bar"><i style="width:40%"></i></div>
<div class="mini">지금까지 이도형 프로가 <b>2번</b> 봐줬어요</div>
<div class="sec">받은 프로 한마디 <em>2회</em></div>
<div class="card">
  <div class="meta"><b class="new">NEW</b> 방금 · 8월 5일 스윙</div>
  <div class="who">이도형 프로</div>
  <div class="body3">{CM2}</div>
  <div class="wall"><span class="bd">정면</span></div>
  <div class="more">프로 코멘트 2개 모두 보기</div>
</div>'''

    practice = f'''
<div class="cal">
  <div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="has">4</s><s class="sel">5</s><s class="today">6</s><s class="off">7</s><s class="off">8</s>
    <s class="off">9</s><s class="off">10</s><s class="off">11</s><s class="off">12</s><s class="off">13</s><s class="off">14</s><s class="off">15</s>
  </div>
  <div class="cal-l">{dot(ok)}스윙 &nbsp;{dot('#B08830')}한마디 &nbsp;{dot('#39506B')}피드백일</div>
</div>
<div class="sec">8월 5일 (수)</div>
<div class="dayrow"><span class="thumb"></span><span class="thumb l2"></span>
  <span class="day-t">올린 스윙 2개</span></div>
<div class="card slim">
  <div class="meta"><b class="tag">프로 한마디</b> 사진 1</div>
  <div class="body2">{CM}</div>
  <div class="more">자세히</div>
</div>
<div class="donebar">{dot(ok)} 오늘 스윙 1개 올렸어요 <em>측면 올리기 +</em></div>'''

    gallery = f'''
<div class="chips">{chip('전체', True)}{chip('정면')}{chip('측면')}{chip('드라이버')}{chip('아이언')}{chip('한마디 받음')}</div>
<div class="sec">2026. 8. 6 (목) <em>2개</em></div>
<div class="grid">
  {swing_cell('정면', '드라이버', '한마디 1', ok)}
  {swing_cell('측면', '드라이버', '보는 중', warn)}
</div>
<div class="sec">2026. 8. 4 (화) <em>1개</em></div>
<div class="grid">
  {swing_cell('정면', '아이언', '전달됨', '#9AA79E')}
  <div class="cell add">+<b>스윙 올리기</b></div>
</div>'''

    lesson = f'''
<div class="sec">받은 프로 한마디 <em>2회</em></div>
<div class="card slim">
  <div class="meta">방금 · 측면 스윙 <b class="new">NEW</b></div>
  <div class="body2">{CM2}</div>
</div>
<div class="card slim dim2">
  <div class="meta">8월 5일 · 정면 스윙 · 사진 2</div>
  <div class="body2">{CM}</div>
</div>
<div class="sec">한마디 상세</div>
<div class="card">
  <div class="meta">8월 5일 (수) · 연습 오후 7:24</div>
  <div class="mynote">내가 남긴 기록<b>“{NOTE}”</b></div>
  <div class="thread">
    <div class="th-h"><span class="av">이</span>
      <span><b>이도형 프로</b><i>8월 5일 오후 9:40 · 답장까지 2시간</i></span>
      <span class="shots"><s></s><s></s></span></div>
    <div class="th-b">{CM}</div>
  </div>
  <div class="vlab">내 스윙 영상</div>
  <div class="video"><span class="bd">정면</span><span class="play"></span></div>
</div>
<div class="lock">정기 피드백 · 베타 이후 <span>한 달치를 모아 리포트로 만들어드려요</span></div>'''

    my = f'''
<div class="me"><span class="av big">골</span>
  <span><b>골프러버</b><i>beta.nextswing.app</i></span></div>
<div class="plan"><b>Coaching</b><span>베타 기간 무료 이용 중</span><em>구독 안내</em></div>
<div class="stats">
  <span><b>3</b><i>연습일</i></span><span><b>9</b><i>영상</i></span>
  <span><b>2</b><i>한마디</i></span><span><b>3</b><i>연속</i></span>
</div>
<div class="list">
  <span>계정 · 아이디 관리</span>
  <span>알림 설정</span>
  <span>구독 · 결제 <i>베타 무료</i></span>
  <span>약관 · 개인정보</span>
  <span>문의하기</span>
</div>'''

    return [('홈', '홈', home), ('연습기록', '연습기록', practice),
            ('스윙 갤러리', '스윙', gallery), ('레슨기록', '레슨기록', lesson),
            ('마이', '마이', my)]


# ── 테마 CSS ─────────────────────────────────────────────────────────
def theme_css(t, v):
    r, rs = v['r'], v['rs']
    garmin = t == 'garmin'
    toss = t == 'toss'
    return f'''
.t-{t}{{background:{v['bg']};color:{v['ink']}}}
.t-{t} .ph-top{{color:{v['ink']}}}
.t-{t} .beta{{background:{v['ac2']};color:{v['ac']}}}
.t-{t} .ph-head{{font-size:{'22px' if toss else '17px'};font-weight:800;
  padding:{'18px 22px 4px' if toss else '12px 18px 4px'};letter-spacing:-.03em;
  {'color:#fff;background:' + v['nav'] + ';padding:14px 18px 12px;margin-bottom:2px' if garmin else ''}}}
.t-{t} .ph-body{{padding:{'10px 22px 20px' if toss else '10px 16px 18px'}}}
.t-{t} .kick{{font-size:12px;font-weight:700;color:{v['ac']};padding:6px 0 8px;
  {'text-transform:uppercase;letter-spacing:.08em' if garmin else ''}}}
.t-{t} .h1{{font-size:{'26px' if toss else '22px'};font-weight:800;line-height:1.32;
  letter-spacing:-.035em;padding-bottom:12px}}
.t-{t} .quote{{font-size:14px;line-height:1.7;color:{v['sub']};padding-bottom:16px}}
.t-{t} .cta{{background:{v['ac']};color:#fff;border-radius:{r};text-align:center;
  padding:{'16px' if toss else '13px'};font-size:15px;font-weight:700;margin-bottom:22px}}
.t-{t} .row{{display:flex;justify-content:space-between;align-items:baseline;padding:2px 0 8px}}
.t-{t} .row-t{{font-size:13px;font-weight:700}}
.t-{t} .row-n{{font-size:12px;font-weight:700;color:{v['ac']}}}
.t-{t} .bar{{height:{'8px' if toss else '6px'};border-radius:99px;background:{v['card']};
  overflow:hidden;margin-bottom:8px;{'border:1px solid ' + v['line'] if garmin else ''}}}
.t-{t} .bar i{{display:block;height:100%;background:{v['ac']};border-radius:99px}}
.t-{t} .mini{{font-size:12px;color:{v['dim']};padding-bottom:20px}}
.t-{t} .mini b{{color:{v['ink']}}}
.t-{t} .sec{{display:flex;justify-content:space-between;align-items:baseline;
  font-size:{'13px' if not garmin else '12px'};font-weight:800;color:{v['sub']};
  padding:14px 2px 8px;{'text-transform:uppercase;letter-spacing:.07em' if garmin else ''}}}
.t-{t} .sec em{{font-style:normal;font-size:11px;font-weight:600;color:{v['dim']}}}
.t-{t} .card{{background:{v['card']};border-radius:{r};padding:15px;margin-bottom:10px;
  {'border:1px solid ' + v['line'] if garmin else ''}
  {'box-shadow:0 1px 4px rgba(26,28,32,.05)' if t == 'kakao' else ''}}}
.t-{t} .card.slim{{padding:13px 15px}}
.t-{t} .card.dim2{{opacity:.78}}
.t-{t} .meta{{display:flex;gap:7px;align-items:center;font-size:11.5px;font-weight:600;
  color:{v['dim']};padding-bottom:7px}}
.t-{t} .new{{background:{v['ac']};color:#fff;font-size:9px;font-weight:800;
  border-radius:5px;padding:2px 6px;letter-spacing:.06em}}
.t-{t} .tag{{background:{v['ac2']};color:{v['ac']};font-size:10px;font-weight:800;
  border-radius:5px;padding:2px 7px}}
.t-{t} .who{{font-size:13.5px;font-weight:800;padding-bottom:5px}}
.t-{t} .body2,.t-{t} .body3{{font-size:13.5px;line-height:1.68;color:{v['ink']};
  display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}}
.t-{t} .body2{{-webkit-line-clamp:2}} .t-{t} .body3{{-webkit-line-clamp:3}}
.t-{t} .wall{{position:relative;height:150px;border-radius:{rs};margin-top:10px;
  background:{'#10241A' if garmin else '#232A26'}}}
.t-{t} .bd{{position:absolute;left:9px;top:9px;background:rgba(0,0,0,.5);color:#fff;
  font-size:10px;font-weight:700;border-radius:6px;padding:3px 8px}}
.t-{t} .bd.b2{{top:34px;opacity:.85;font-weight:600}}
.t-{t} .more{{font-size:12.5px;font-weight:700;color:{v['ac']};padding-top:11px;
  border-top:1px solid {v['line']};margin-top:11px}}
.t-{t} .cal{{background:{v['card']};border-radius:{r};padding:13px 13px 11px;
  {'border:1px solid ' + v['line'] if garmin else ''}
  {'box-shadow:0 1px 4px rgba(26,28,32,.05)' if t == 'kakao' else ''}}}
.t-{t} .cal-h{{text-align:center;font-size:13px;font-weight:800;padding-bottom:10px}}
.t-{t} .cal-w,.t-{t} .cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.t-{t} .cal-w s{{text-decoration:none;font-size:10px;font-weight:700;color:{v['dim']};padding:3px 0}}
.t-{t} .cal-g s{{text-decoration:none;font-size:12px;font-weight:600;color:{v['sub']};
  height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%}}
.t-{t} .cal-g s.off{{color:{v['dim']};opacity:.45}}
.t-{t} .cal-g s.sel{{background:{v['ink']};color:#fff;font-weight:800}}
.t-{t} .cal-g s.today{{box-shadow:inset 0 0 0 1.5px {v['ink']};font-weight:800}}
.t-{t} .cal-g s.has{{position:relative}}
.t-{t} .cal-g s.has:after{{content:'';position:absolute;bottom:1px;left:50%;margin-left:-2px;
  width:4px;height:4px;border-radius:50%;background:{v['ok']}}}
.t-{t} .cal-l{{display:flex;justify-content:center;gap:4px;align-items:center;
  font-size:10px;color:{v['dim']};padding-top:9px}}
.t-{t} .st{{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:3px}}
.t-{t} .dayrow{{display:flex;align-items:center;gap:8px;padding:2px 2px 10px}}
.t-{t} .thumb{{width:34px;height:46px;border-radius:8px;background:#28302B}}
.t-{t} .thumb.l2{{background:#3A4640}}
.t-{t} .day-t{{font-size:12.5px;font-weight:700;color:{v['sub']}}}
.t-{t} .donebar{{display:flex;align-items:center;gap:7px;background:{v['card']};
  border-radius:{rs};padding:12px 14px;font-size:12.5px;font-weight:600;margin-top:4px;
  {'border:1px solid ' + v['line'] if garmin else ''}}}
.t-{t} .donebar em{{font-style:normal;margin-left:auto;font-weight:800;color:{v['ac']};font-size:12px}}
.t-{t} .chips{{display:flex;gap:6px;overflow:hidden;padding-bottom:4px}}
.t-{t} .chip{{flex:none;font-size:12px;font-weight:700;border-radius:{'99px' if t != 'garmin' else '7px'};
  padding:8px 13px;background:{v['card']};color:{v['sub']};
  {'border:1px solid ' + v['line'] if garmin else ''}}}
.t-{t} .chip.on{{background:{v['ac']};color:#fff}}
.t-{t} .grid{{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding-bottom:6px}}
.t-{t} .cell{{position:relative;aspect-ratio:3/4;border-radius:{rs};
  background:{'#10241A' if garmin else '#232A26'}}}
.t-{t} .cell.lite{{background:#39443E}}
.t-{t} .cell.add{{background:{v['card']};display:flex;flex-direction:column;gap:4px;
  align-items:center;justify-content:center;color:{v['ac']};font-size:26px;font-weight:300;
  {'border:1.5px dashed ' + v['line'] if not garmin else 'border:1.5px dashed #B9C7BC'}}}
.t-{t} .cell.add b{{font-size:12px;font-weight:700}}
.t-{t} .cs{{position:absolute;left:9px;bottom:8px;display:flex;align-items:center;
  color:#fff;font-size:10.5px;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,.5)}}
.t-{t} .mynote{{font-size:11px;font-weight:700;color:{v['dim']};padding:4px 0 12px}}
.t-{t} .mynote b{{display:block;font-size:13px;font-weight:500;color:{v['ink']};
  line-height:1.65;padding-top:6px}}
.t-{t} .thread{{border-top:1px solid {v['line']};padding-top:12px}}
.t-{t} .th-h{{display:flex;gap:9px;align-items:flex-start;padding-bottom:7px}}
.t-{t} .th-h b{{display:block;font-size:12.5px;font-weight:800}}
.t-{t} .th-h i{{font-style:normal;font-size:10.5px;color:{v['dim']}}}
.t-{t} .av{{flex:none;width:30px;height:30px;border-radius:50%;background:{v['ac2']};
  color:{v['ac']};display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800}}
.t-{t} .av.big{{width:44px;height:44px;font-size:16px}}
.t-{t} .shots{{margin-left:auto;display:flex;gap:5px}}
.t-{t} .shots s{{width:30px;height:40px;border-radius:6px;background:#28302B;display:block}}
.t-{t} .th-b{{font-size:13.5px;line-height:1.7;padding-left:39px}}
.t-{t} .vlab{{font-size:10.5px;font-weight:800;letter-spacing:.1em;color:{v['dim']};
  padding:14px 0 7px}}
.t-{t} .video{{position:relative;height:170px;border-radius:{rs};background:#171D1A}}
.t-{t} .play{{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;
  border-radius:50%;background:rgba(255,255,255,.22)}}
.t-{t} .play:after{{content:'';position:absolute;left:16px;top:12px;
  border-left:12px solid #fff;border-top:8px solid transparent;border-bottom:8px solid transparent}}
.t-{t} .lock{{background:{v['card']};border-radius:{rs};padding:13px 15px;font-size:12.5px;
  font-weight:800;color:{v['sub']};margin-top:4px;
  {'border:1px solid ' + v['line'] if garmin else ''}}}
.t-{t} .lock span{{display:block;font-size:11.5px;font-weight:500;color:{v['dim']};padding-top:3px}}
.t-{t} .me{{display:flex;gap:12px;align-items:center;padding:8px 2px 16px}}
.t-{t} .me b{{display:block;font-size:17px;font-weight:800}}
.t-{t} .me i{{font-style:normal;font-size:11.5px;color:{v['dim']}}}
.t-{t} .plan{{background:{'linear-gradient(0deg,' + v['ac'] + ',' + v['ac'] + ')' if garmin else v['ac']};
  color:#fff;border-radius:{r};padding:16px;margin-bottom:12px;position:relative}}
.t-{t} .plan b{{font-size:16px;font-weight:800;display:block}}
.t-{t} .plan span{{font-size:11.5px;opacity:.85}}
.t-{t} .plan em{{font-style:normal;position:absolute;right:14px;top:50%;transform:translateY(-50%);
  font-size:11px;font-weight:700;background:rgba(255,255,255,.18);border-radius:8px;padding:6px 10px}}
.t-{t} .stats{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-bottom:14px}}
.t-{t} .stats span{{background:{v['card']};border-radius:{rs};text-align:center;padding:12px 0;
  {'border:1px solid ' + v['line'] if garmin else ''}}}
.t-{t} .stats b{{display:block;font-size:{'20px' if garmin else '18px'};font-weight:800;
  font-variant-numeric:tabular-nums}}
.t-{t} .stats i{{font-style:normal;font-size:10.5px;color:{v['dim']}}}
.t-{t} .list{{background:{v['card']};border-radius:{r};overflow:hidden;
  {'border:1px solid ' + v['line'] if garmin else ''}}}
.t-{t} .list span{{display:flex;justify-content:space-between;padding:15px 16px;font-size:13.5px;
  font-weight:600;border-bottom:1px solid {v['line']}}}
.t-{t} .list span:last-child{{border-bottom:0}}
.t-{t} .list i{{font-style:normal;font-size:11.5px;color:{v['dim']}}}
.t-{t} .tabs{{display:flex;background:{v['nav']};border-top:1px solid {v['navline']};
  padding:7px 0 9px}}
.t-{t} .tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  color:{'rgba(255,255,255,.55)' if garmin else v['dim']}}}
.t-{t} .tb b{{font-size:9.5px;font-weight:600}}
.t-{t} .tb.on{{color:{'#fff' if garmin else v['ac']}}}
'''


# ── 조립 ─────────────────────────────────────────────────────────────
rows = ''
css_all = ''
for key, name, desc, v, fit in THEMES:
    css_all += theme_css(key, v)
    phones = ''
    for title, tab, body in screens(key, v):
        phones += f'<div class="col">{frame(key, title, tab, body)}<div class="cap">{title}</div></div>'
    rows += f'''
<section>
  <header><h2>{name}</h2><p>{desc}</p></header>
  <div class="strip">{phones}</div>
  <p class="fit">→ {fit}</p>
</section>'''

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · UI 시안 3벌</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Pretendard,-apple-system,'Malgun Gothic',sans-serif;background:#EDEAE3;
  color:#1D2420;-webkit-font-smoothing:antialiased;padding:34px 26px 80px}}
h1{{font-size:21px;letter-spacing:-.02em}}
.lede{{font-size:12.5px;color:#6E6858;line-height:1.8;margin:8px 0 6px;max-width:640px}}
section{{margin-top:44px}}
section header h2{{font-size:16px;letter-spacing:-.02em}}
section header p{{font-size:12px;color:#6E6858;margin-top:4px}}
.strip{{display:flex;gap:22px;overflow-x:auto;padding:18px 4px 6px;align-items:flex-start}}
.col{{flex:none}}
.cap{{text-align:center;font-size:11px;color:#8A8375;padding-top:9px}}
.fit{{font-size:12.5px;color:#41544A;font-weight:600;margin-top:10px}}
.ph{{width:340px;border-radius:30px;overflow:hidden;border:1px solid #D8D2C6;
  box-shadow:0 16px 38px -22px rgba(38,40,42,.45);display:flex;flex-direction:column;min-height:700px}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 5px;
  font-size:11px;font-weight:700}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.85}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px}}
.ph-body{{flex:1}}
{css_all}
</style>
<h1>NEXT SWING · UI 시안 3벌</h1>
<p class="lede">베타에 실제로 있는 다섯 화면(홈 · 연습기록 · 스윙 · 레슨기록 · 마이)을,
데이터도 실제 것 그대로 세 가지 디자인 언어로 입혔다.
스윙 스코어 · AI 분석 · 3단 위계 리포트는 베타에 없으므로 그리지 않았다 —
정기 피드백은 잠금 카드로만 보인다. 열 가지 주제 중 이 앱 사용자층
(앱에 익숙하지 않은 20~60대)에 맞는 셋을 골랐다. 나머지가 궁금하면 번호로 말해달라.</p>
{rows}
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
