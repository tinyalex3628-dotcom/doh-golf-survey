# -*- coding: utf-8 -*-
"""UI 시안판 v2 — 채도 높은 세 벌.

1차(토스·가민·카카오)는 「칙칙하다」로 반려됐다. 원인은 둘 —
회색 위주 팔레트, 그리고 영상 자리가 전부 시커먼 빈 상자였던 것.

이번엔 열 주제 중 색이 살아 있는 셋 — 나이키 런클럽형 · 스트라바형 ·
애플 피트니스형. 영상 자리는 하늘·필드·골퍼 실루엣이 있는 장면으로 그린다.
데이터는 전부 베타에 실제로 있는 것.
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ui-themes.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
CM2 = '한 번 더 보니 하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'
NOTE = '톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.'

# ── 주제 ────────────────────────────────────────────────────────────
THEMES = [
    ('nike', '① 나이키 런클럽형',
     '블랙/화이트 + 원색 하나 · 굵은 산세 · 큰 숫자가 화면을 끌고 간다',
     {'bg': '#FFFFFF', 'card': '#F6F6F6', 'line': '#E8E8E8', 'ink': '#111111',
      'sub': '#4B4B4B', 'dim': '#9A9A9A', 'ac': '#FF3B1F', 'ac2': '#FFE9E4',
      'ok': '#111111', 'warn': '#FF9F0A', 'r': '14px', 'rs': '10px',
      'nav': '#111111', 'dark': False},
     '숫자 하나로 동기부여되는 사람 — 러닝 앱 감성 그대로, 2030에게 강하다.'),
    ('strava', '② 스트라바형',
     '화이트 + 오렌지 한 색 · 데이터 리스트 중심 · 정보 밀도 높게',
     {'bg': '#FFFFFF', 'card': '#FFFFFF', 'line': '#E9E4DE', 'ink': '#242428',
      'sub': '#494950', 'dim': '#8E8E95', 'ac': '#FC5200', 'ac2': '#FFEDE3',
      'ok': '#2AA84A', 'warn': '#F5A200', 'r': '12px', 'rs': '9px',
      'nav': '#FFFFFF', 'dark': False},
     '기록을 쌓고 견주는 재미로 쓰는 사람 — 운동 로그 앱에 익숙한 30~50대.'),
    ('apple', '③ 애플 피트니스형',
     '다크 배경 + 링 컬러 3색 · 원형 프로그레스 · 카드 최소화',
     {'bg': '#000000', 'card': '#1C1C1E', 'line': '#2C2C2E', 'ink': '#FFFFFF',
      'sub': '#D1D1D6', 'dim': '#8E8E93', 'ac': '#FA114F', 'ac2': '#2C0F17',
      'ok': '#30D158', 'warn': '#FFD60A', 'r': '16px', 'rs': '12px',
      'nav': '#0B0B0C', 'dark': True},
     '아이폰 · 애플워치 쓰는 사람 — 링 채우는 손맛을 이미 안다.'),
]

TABS = ['홈', '연습기록', '스윙', '레슨기록', '마이']
ICONS = {
    '홈': '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    '연습기록': '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    '스윙': '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    '레슨기록': '<path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    '마이': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
}

# 골퍼 실루엣 — 어드레스 자세. 영상 정지 장면을 흉내 낸다.
GOLFER = ('<svg viewBox="0 0 60 80" style="position:absolute;left:50%;bottom:8%;width:34%;'
          'transform:translateX(-54%)"><g fill="#1E2B22">'
          '<circle cx="34" cy="12" r="6"/>'
          '<path d="M30 18c-6 2-9 8-10 16l-3 22 6 20h5l-3-19 5-14 8 13 2 20h5l-1-22-6-16'
          'c3-6 2-14-1-18-2-2-4-3-7-2z"/>'
          '<path d="m28 26-16 20 2 2 17-16z"/></g>'
          '<rect x="10" y="45" width="3" height="3" rx="1.5" fill="#fff"/></svg>')


def scene(label, badge2='', h=150, night=False):
    """영상 정지 장면 — 하늘 · 먼 산 · 필드 · 골퍼. 시커먼 상자 금지."""
    sky, hill, grass = (('#274A66', '#1E3D33', '#245239') if night
                        else ('#BFE0F2', '#8FC49B', '#4E9C5F'))
    return (f'<div class="scene" style="height:{h}px;flex:none">'
            f'<i style="background:{sky};height:46%"></i>'
            f'<i style="background:{hill};height:16%"></i>'
            f'<i style="background:{grass};flex:1"></i>'
            f'{GOLFER}'
            f'<span class="bd">{label}</span>'
            + (f'<span class="bd b2">{badge2}</span>' if badge2 else '')
            + '</div>')


def icon(name, sz=19):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round" '
            f'style="width:{sz}px;height:{sz}px;display:block">{ICONS[name]}</svg>')


def tabbar(t, on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n)}<b>{n}</b></span>'
                      for n in TABS)
            + '</div>')


def frame(t, title, on_tab, body):
    return (f'<div class="ph t-{t}">'
            f'<div class="ph-top"><span>9:41</span><i class="beta">베타</i><span class="batt"></span></div>'
            f'<div class="ph-head">{title}</div>'
            f'<div class="ph-body">{body}</div>'
            f'{tabbar(t, on_tab)}</div>')


def ring(pct, color, size=52, label=''):
    """원형 프로그레스 — conic-gradient 는 단색 진행이라 금지 목록에 안 걸린다."""
    return (f'<span class="ring" style="width:{size}px;height:{size}px;'
            f'background:conic-gradient({color} {pct}%, rgba(127,127,127,.18) 0)">'
            f'<b>{label}</b></span>')


def screens(t, v):
    ok, warn, ac = v['ok'], v['warn'], v['ac']
    night = v['dark']
    nike, strava, apple = t == 'nike', t == 'strava', t == 'apple'

    # 홈 — 큰 숫자(나이키) / 데이터 요약(스트라바) / 링(애플)
    if nike:
        hero = ('<div class="bignum"><b>3</b><i>일 연속 연습</i></div>'
                '<div class="kick">프로 한마디 · 도착</div>'
                f'<div class="quote">“{CM}”</div>'
                '<div class="cta">한마디 확인하기</div>')
    elif apple:
        hero = ('<div class="rings">'
                + ring(60, '#FA114F', 64, '3/5') + ring(45, '#30D158', 64, '9')
                + ring(75, '#0A84FF', 64, '2')
                + '</div><div class="ringlab"><s>한마디 3/5회</s><s>영상 9개</s><s>연속 3일</s></div>'
                '<div class="kick">프로 한마디 · 도착</div>'
                f'<div class="quote">“{CM}”</div>'
                '<div class="cta">한마디 확인하기</div>')
    else:
        hero = ('<div class="kick">프로 한마디 · 도착</div>'
                '<div class="h1">이도형 프로가<br>한마디를 남겼어요</div>'
                f'<div class="quote">“{CM}”</div>'
                '<div class="cta">한마디 확인하기</div>'
                '<div class="dl"><span><b>3</b><i>연속</i></span><span><b>9</b><i>영상</i></span>'
                '<span><b>2</b><i>한마디</i></span><span><b>3/5</b><i>이번 달</i></span></div>')

    home = hero + f'''
<div class="sec">받은 프로 한마디 <em>2회</em></div>
<div class="card">
  <div class="meta"><b class="new">NEW</b> 방금 · 8월 5일 스윙</div>
  <div class="who">이도형 프로</div>
  <div class="body3">{CM2}</div>
  {scene('정면', h=140, night=night)}
  <div class="more">프로 코멘트 2개 모두 보기 →</div>
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
</div>
<div class="sec">8월 5일 (수) <em>스윙 2 · 한마디 1</em></div>
<div class="dayrow">{scene('정면', h=64, night=night)}{scene('측면', h=64, night=night)}</div>
<div class="card slim">
  <div class="meta"><b class="tag">프로 한마디</b> 사진 1</div>
  <div class="body2">{CM}</div>
  <div class="more">자세히 →</div>
</div>
<div class="donebar"><i class="st" style="background:{ok}"></i> 오늘 스윙 1개 올렸어요 <em>측면 올리기 +</em></div>'''

    gallery = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">드라이버</span><span class="chip">아이언</span>
<span class="chip">한마디 받음</span></div>
<div class="sec">2026. 8. 6 (목) <em>2개</em></div>
<div class="grid">
  <div class="cellw">{scene('정면', '드라이버', 176, night)}
    <div class="cs"><i class="st" style="background:{ac}"></i>한마디 1</div></div>
  <div class="cellw">{scene('측면', '드라이버', 176, night)}
    <div class="cs"><i class="st" style="background:{warn}"></i>보는 중</div></div>
</div>
<div class="sec">2026. 8. 4 (화) <em>1개</em></div>
<div class="grid">
  <div class="cellw">{scene('정면', '아이언', 176, night)}
    <div class="cs"><i class="st" style="background:#9AA79E"></i>전달됨</div></div>
  <div class="cellw add">+<b>스윙 올리기</b></div>
</div>'''

    lesson = f'''
<div class="sec">받은 프로 한마디 <em>2회</em></div>
<div class="card slim"><div class="meta">방금 · 측면 스윙 <b class="new">NEW</b></div>
  <div class="body2">{CM2}</div></div>
<div class="card slim dim2"><div class="meta">8월 5일 · 정면 · 사진 2</div>
  <div class="body2">{CM}</div></div>
<div class="sec">한마디 상세</div>
<div class="card">
  <div class="meta">8월 5일 (수) · 연습 오후 7:24</div>
  <div class="mynote">내가 남긴 기록<b>“{NOTE}”</b></div>
  <div class="thread">
    <div class="th-h"><span class="av">이</span>
      <span><b>이도형 프로</b><i>8월 5일 오후 9:40 · 답장까지 2시간</i></span></div>
    <div class="th-b">{CM}</div>
  </div>
  {scene('정면', h=150, night=night)}
</div>
<div class="lock">정기 피드백 · 베타 이후<span>한 달치를 모아 리포트로 만들어드려요</span></div>'''

    my = f'''
<div class="me"><span class="av big">골</span>
  <span><b>골프러버</b><i>beta.nextswing.app</i></span></div>
<div class="plan"><b>Coaching</b><span>베타 기간 무료 이용 중</span><em>구독 안내</em></div>
<div class="dl"><span><b>3</b><i>연습일</i></span><span><b>9</b><i>영상</i></span>
<span><b>2</b><i>한마디</i></span><span><b>3</b><i>연속</i></span></div>
<div class="list"><span>계정 · 아이디 관리</span><span>알림 설정</span>
<span>구독 · 결제 <i>베타 무료</i></span><span>약관 · 개인정보</span><span>문의하기</span></div>'''

    return [('홈', '홈', home), ('연습기록', '연습기록', practice),
            ('스윙 갤러리', '스윙', gallery), ('레슨기록', '레슨기록', lesson),
            ('마이', '마이', my)]


def theme_css(t, v):
    r, rs = v['r'], v['rs']
    dark = v['dark']
    nike = t == 'nike'
    navink = '#fff' if (dark or nike) else v['dim']
    return f'''
.t-{t}{{background:{v['bg']};color:{v['ink']}}}
.t-{t} .ph-top{{color:{v['ink']}}}
.t-{t} .beta{{background:{v['ac']};color:#fff}}
.t-{t} .ph-head{{font-size:{'24px' if nike else '19px'};font-weight:900;
  padding:14px 20px 2px;letter-spacing:-.04em;
  {'text-transform:uppercase;font-style:italic' if nike else ''}}}
.t-{t} .ph-body{{padding:10px 18px 18px}}
.t-{t} .bignum{{padding:4px 0 6px}}
.t-{t} .bignum b{{font-size:92px;font-weight:900;letter-spacing:-.06em;line-height:.95;
  font-style:italic}}
.t-{t} .bignum i{{font-style:normal;display:block;font-size:14px;font-weight:800;
  color:{v['sub']};padding-top:2px}}
.t-{t} .rings{{display:flex;gap:14px;padding:6px 0 8px}}
.t-{t} .ring{{border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}}
.t-{t} .ring b{{width:70%;height:70%;border-radius:50%;background:{v['bg']};
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}}
.t-{t} .ringlab{{display:flex;gap:14px;padding-bottom:12px}}
.t-{t} .ringlab s{{text-decoration:none;width:64px;text-align:center;font-size:9.5px;
  color:{v['dim']};font-weight:600}}
.t-{t} .kick{{font-size:12px;font-weight:800;color:{v['ac']};padding:8px 0 6px;
  letter-spacing:{'0.02em' if nike else '0'}}}
.t-{t} .h1{{font-size:23px;font-weight:900;line-height:1.3;letter-spacing:-.035em;padding-bottom:10px}}
.t-{t} .quote{{font-size:14px;line-height:1.7;color:{v['sub']};padding-bottom:14px;font-weight:500}}
.t-{t} .cta{{background:{v['ac']};color:#fff;border-radius:{'99px' if nike else r};
  text-align:center;padding:15px;font-size:15px;font-weight:800;margin-bottom:18px}}
.t-{t} .dl{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-bottom:6px}}
.t-{t} .dl span{{background:{v['card']};border-radius:{rs};text-align:center;padding:11px 0;
  border:1px solid {v['line']}}}
.t-{t} .dl b{{display:block;font-size:21px;font-weight:900;letter-spacing:-.03em;
  font-variant-numeric:tabular-nums;{'font-style:italic' if nike else ''}}}
.t-{t} .dl i{{font-style:normal;font-size:10px;color:{v['dim']};font-weight:700}}
.t-{t} .sec{{display:flex;justify-content:space-between;align-items:baseline;
  font-size:13px;font-weight:900;color:{v['ink']};padding:16px 2px 8px;letter-spacing:-.02em}}
.t-{t} .sec em{{font-style:normal;font-size:11px;font-weight:700;color:{v['ac']}}}
.t-{t} .card{{background:{v['card']};border-radius:{r};padding:15px;margin-bottom:10px;
  border:1px solid {v['line']}}}
.t-{t} .card.slim{{padding:13px 15px}} .t-{t} .card.dim2{{opacity:.72}}
.t-{t} .meta{{display:flex;gap:7px;align-items:center;font-size:11.5px;font-weight:700;
  color:{v['dim']};padding-bottom:6px}}
.t-{t} .new{{background:{v['ac']};color:#fff;font-size:9px;font-weight:900;
  border-radius:4px;padding:2px 6px;letter-spacing:.06em}}
.t-{t} .tag{{background:{v['ac2']};color:{v['ac']};font-size:10px;font-weight:900;
  border-radius:4px;padding:2px 7px}}
.t-{t} .who{{font-size:14px;font-weight:900;padding-bottom:4px}}
.t-{t} .body2,.t-{t} .body3{{font-size:13.5px;line-height:1.66;font-weight:500;
  display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}}
.t-{t} .body2{{-webkit-line-clamp:2}} .t-{t} .body3{{-webkit-line-clamp:3;padding-bottom:9px}}
.t-{t} .scene{{position:relative;border-radius:{rs};overflow:hidden;display:flex;
  flex-direction:column}}
.t-{t} .scene i{{display:block}}
.t-{t} .bd{{position:absolute;left:8px;top:8px;background:rgba(12,16,13,.6);color:#fff;
  font-size:10px;font-weight:800;border-radius:5px;padding:3px 8px}}
.t-{t} .bd.b2{{top:32px;font-weight:600;opacity:.92}}
.t-{t} .more{{font-size:12.5px;font-weight:800;color:{v['ac']};padding-top:11px;
  border-top:1px solid {v['line']};margin-top:11px}}
.t-{t} .cal{{background:{v['card']};border-radius:{r};padding:13px 13px 11px;
  border:1px solid {v['line']}}}
.t-{t} .cal-h{{text-align:center;font-size:13px;font-weight:900;padding-bottom:10px}}
.t-{t} .cal-w,.t-{t} .cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.t-{t} .cal-w s{{text-decoration:none;font-size:10px;font-weight:800;color:{v['dim']};padding:3px 0}}
.t-{t} .cal-g s{{text-decoration:none;font-size:12.5px;font-weight:700;color:{v['sub']};
  height:31px;display:flex;align-items:center;justify-content:center;border-radius:50%}}
.t-{t} .cal-g s.off{{opacity:.35}}
.t-{t} .cal-g s.sel{{background:{v['ac']};color:#fff;font-weight:900}}
.t-{t} .cal-g s.today{{box-shadow:inset 0 0 0 2px {v['ac']};font-weight:900}}
.t-{t} .cal-g s.has{{position:relative}}
.t-{t} .cal-g s.has:after{{content:'';position:absolute;bottom:1px;left:50%;margin-left:-2px;
  width:4px;height:4px;border-radius:50%;background:{v['ac']}}}
.t-{t} .st{{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px}}
.t-{t} .dayrow{{display:flex;gap:8px;padding:0 0 10px}}
.t-{t} .dayrow .scene{{width:74px;flex:none}}
.t-{t} .donebar{{display:flex;align-items:center;background:{v['card']};border:1px solid {v['line']};
  border-radius:{rs};padding:12px 14px;font-size:12.5px;font-weight:700;margin-top:4px}}
.t-{t} .donebar em{{font-style:normal;margin-left:auto;font-weight:900;color:{v['ac']};font-size:12px}}
.t-{t} .chips{{display:flex;gap:6px;overflow:hidden;padding-bottom:2px}}
.t-{t} .chip{{flex:none;font-size:12px;font-weight:800;border-radius:99px;padding:8px 13px;
  background:{v['card']};color:{v['sub']};border:1px solid {v['line']}}}
.t-{t} .chip.on{{background:{v['ac']};color:#fff;border-color:{v['ac']}}}
.t-{t} .grid{{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding-bottom:4px}}
.t-{t} .cellw{{position:relative;display:flex;flex-direction:column}}
.t-{t} .cellw .scene{{height:176px}}
.t-{t} .cs{{position:absolute;left:8px;bottom:8px;display:flex;align-items:center;color:#fff;
  font-size:10.5px;font-weight:900;text-shadow:0 1px 3px rgba(0,0,0,.55)}}
.t-{t} .cellw.add{{height:176px;border:2px dashed {v['line']};border-radius:{rs};
  display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;
  color:{v['ac']};font-size:26px;font-weight:300;background:{v['card']}}}
.t-{t} .cellw.add b{{font-size:12px;font-weight:800}}
.t-{t} .mynote{{font-size:11px;font-weight:800;color:{v['dim']};padding:4px 0 12px}}
.t-{t} .mynote b{{display:block;font-size:13px;font-weight:500;color:{v['ink']};
  line-height:1.65;padding-top:6px}}
.t-{t} .thread{{border-top:1px solid {v['line']};padding:12px 0}}
.t-{t} .th-h{{display:flex;gap:9px;align-items:center;padding-bottom:7px}}
.t-{t} .th-h b{{display:block;font-size:12.5px;font-weight:900}}
.t-{t} .th-h i{{font-style:normal;font-size:10.5px;color:{v['dim']}}}
.t-{t} .av{{flex:none;width:30px;height:30px;border-radius:50%;background:{v['ac']};
  color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900}}
.t-{t} .av.big{{width:46px;height:46px;font-size:16px}}
.t-{t} .th-b{{font-size:13.5px;line-height:1.7;padding-left:39px;padding-bottom:4px;font-weight:500}}
.t-{t} .lock{{background:{v['card']};border:1px solid {v['line']};border-radius:{rs};
  padding:13px 15px;font-size:12.5px;font-weight:900;color:{v['sub']};margin-top:2px}}
.t-{t} .lock span{{display:block;font-size:11.5px;font-weight:500;color:{v['dim']};padding-top:3px}}
.t-{t} .me{{display:flex;gap:12px;align-items:center;padding:8px 2px 14px}}
.t-{t} .me b{{display:block;font-size:18px;font-weight:900}}
.t-{t} .me i{{font-style:normal;font-size:11.5px;color:{v['dim']}}}
.t-{t} .plan{{background:{v['ac']};color:#fff;border-radius:{r};padding:16px;
  margin-bottom:12px;position:relative}}
.t-{t} .plan b{{font-size:17px;font-weight:900;display:block}}
.t-{t} .plan span{{font-size:11.5px;opacity:.9}}
.t-{t} .plan em{{font-style:normal;position:absolute;right:14px;top:50%;transform:translateY(-50%);
  font-size:11px;font-weight:800;background:rgba(255,255,255,.2);border-radius:8px;padding:6px 10px}}
.t-{t} .list{{background:{v['card']};border:1px solid {v['line']};border-radius:{r};
  overflow:hidden;margin-top:12px}}
.t-{t} .list span{{display:flex;justify-content:space-between;padding:15px 16px;
  font-size:13.5px;font-weight:700;border-bottom:1px solid {v['line']}}}
.t-{t} .list span:last-child{{border-bottom:0}}
.t-{t} .list i{{font-style:normal;font-size:11.5px;color:{v['dim']}}}
.t-{t} .tabs{{display:flex;background:{v['nav']};padding:8px 0 10px;
  border-top:1px solid {v['line'] if not (dark or nike) else 'transparent'}}}
.t-{t} .tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  color:{'rgba(255,255,255,.45)' if (dark or nike) else navink}}}
.t-{t} .tb b{{font-size:9.5px;font-weight:700}}
.t-{t} .tb.on{{color:{'#fff' if nike else v['ac']}}}
'''


rows, css_all = '', ''
for key, name, desc, v, fit in THEMES:
    css_all += theme_css(key, v)
    phones = ''.join(
        f'<div class="col">{frame(key, title, tab, body)}<div class="cap">{title}</div></div>'
        for title, tab, body in screens(key, v))
    rows += (f'<section><header><h2>{name}</h2><p>{desc}</p></header>'
             f'<div class="strip">{phones}</div><p class="fit">→ {fit}</p></section>')

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · UI 시안 v2</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Pretendard,-apple-system,'Malgun Gothic',sans-serif;background:#17181A;
  color:#F2F2F2;-webkit-font-smoothing:antialiased;padding:34px 26px 80px}}
h1{{font-size:21px;letter-spacing:-.02em}}
.lede{{font-size:12.5px;color:#A5A5AA;line-height:1.8;margin:8px 0 6px;max-width:640px}}
section{{margin-top:46px}}
section header h2{{font-size:16px;letter-spacing:-.02em}}
section header p{{font-size:12px;color:#A5A5AA;margin-top:4px}}
.strip{{display:flex;gap:22px;overflow-x:auto;padding:18px 4px 6px;align-items:flex-start}}
.col{{flex:none}}
.cap{{text-align:center;font-size:11px;color:#7C7C82;padding-top:9px}}
.fit{{font-size:12.5px;color:#D9D9DE;font-weight:600;margin-top:10px}}
.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:700px;box-shadow:0 18px 44px -20px rgba(0,0,0,.6)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:800}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.85}}
.beta{{font-style:normal;font-size:9.5px;font-weight:900;border-radius:99px;padding:2px 9px}}
.ph-body{{flex:1}}
{css_all}
</style>
<h1>NEXT SWING · UI 시안 v2 — 색이 살아 있는 세 벌</h1>
<p class="lede">1차(토스·가민·카카오)는 칙칙하다는 판정. 이번엔 열 주제 중 색이 제일 살아 있는
셋이다 — 나이키 런클럽형 · 스트라바형 · 애플 피트니스형. 영상 자리도 시커먼 상자 대신
연습장 장면으로 그렸다. 화면 다섯 개와 데이터는 전부 베타에 실제로 있는 것.</p>
{rows}
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
