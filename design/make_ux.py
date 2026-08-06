# -*- coding: utf-8 -*-
"""UX 설계판 — 「레슨은 대화다」.

화면을 먼저 그리지 않았다. 이 서비스가 파는 것은 딱 하나 —
「이도형 프로가 내 스윙을 직접 보고 답한다」. 그 한 바퀴(찍는다 → 보낸다 →
프로가 본다 → 답이 온다)가 앱의 척추다. 다섯 화면은 전부 이 척추 하나를
다른 각도에서 보는 것이고, 그래서 같은 부품(레슨 레일 · 프로의 말 규칙)을
공유한다 — 화면이 따로 놀 수 없는 구조다.
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-proposal.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고 스무 번만 천천히.'
CM_S = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
CM2 = '하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'
NOTE = '톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.'

# 팔레트 — 남의 것이 아니라 우리 것. 아이보리 바탕, 회원=딥그린, 프로=브론즈.
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
    """레슨 레일 — 앱 전체가 공유하는 척추. stage: 0~3 진행, 4 = 다 끝남."""
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
            f'<span class="bd">{label}</span></div>')


def pro(text, when='', big=False):
    """프로의 말 — 앱 어디서든 같은 얼굴. 브론즈 세리프, 왼쪽 금줄."""
    return (f'<div class="pro{" big" if big else ""}">'
            + (f'<div class="pro-w">이도형 프로 · {when}</div>' if when else '')
            + f'<div class="pro-t">{text}</div></div>')


def me(text):
    """내 말 — 초록, 오른쪽. 대화의 반대편."""
    return f'<div class="meq">{text}</div>'


def tabbar(on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n)}<b>{n}</b></span>'
                      for n in TABS) + '</div>')


def frame(title, tab, body):
    return (f'<div class="ph"><div class="ph-top"><span>9:41</span>'
            f'<i class="beta">베타</i><span class="batt"></span></div>'
            f'<div class="ph-head">{title}</div>'
            f'<div class="ph-body">{body}</div>{tabbar(tab)}</div>')


# ── 다섯 화면 ────────────────────────────────────────────────────────
home = f'''
{rail(3)}
<div class="kick">답장이 왔습니다</div>
{pro(f'“{CM_S}”', '방금 · 8월 5일 스윙에 대한 답', big=True)}
<div class="cta">답장 읽기</div>
<div class="rhythm">읽고 나면 오늘 한 바퀴는 끝 — 내일 스윙으로 다음 답장을 부르세요</div>'''

cal = f'''
<div class="cal">
  <div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="d-ans">4</s><s class="sel d-ans">5</s><s class="today d-wait">6</s><s class="off">7</s><s class="off">8</s>
    <s class="off">9</s><s class="off">10</s><s class="off">11</s><s class="off">12</s><s class="off">13</s><s class="off">14</s><s class="off">15</s>
  </div>
  <div class="cal-l"><i class="lg" style="background:{V['bronze']}"></i>답장 받음
    <i class="lg" style="background:{V['warn']}"></i>보는 중
    <i class="lg" style="background:#9AA79E"></i>보내기만</div>
</div>
<div class="day">
  <div class="day-h">8월 5일 (수) {rail(4, True)}</div>
  {pro(f'“{CM2}”', '오후 9:40')}
  <div class="day-sw">{scene('정면', 56)}{scene('측면', 56)}<span class="day-open">그날 대화 열기 →</span></div>
</div>
<div class="donebar">오늘 스윙 1개 보냈어요 <em>측면 올리기 +</em></div>'''

swings = f'''
<div class="chips"><span class="chip on">전체</span><span class="chip">정면</span>
<span class="chip">측면</span><span class="chip">드라이버</span><span class="chip">답장 받음</span></div>
<div class="sec">8월 6일 (목)</div>
<div class="grid">
  <div class="cellw">{scene('정면 · 드라이버', 168)}{rail(2, True)}</div>
  <div class="cellw">{scene('측면 · 드라이버', 168)}{rail(2, True)}</div>
</div>
<div class="sec">8월 5일 (수)</div>
<div class="grid">
  <div class="cellw">{scene('정면 · 아이언', 168)}{rail(4, True)}</div>
  <div class="cellw add">+<b>스윙 보내기</b></div>
</div>'''

talk = f'''
<div class="dvd">8월 4일 (화)</div>
{me('정면 스윙 1개 보냈어요')}
{pro(f'“{CM2}”', '오후 8:10')}
<div class="dvd">8월 5일 (수)</div>
<div class="me-sw">{scene('정면', 64)}{me(f'“{NOTE}”')}</div>
{pro(f'“{CM}”', '오후 9:40 · 사진 2장')}
<div class="shots"><s></s><s></s></div>
<div class="dvd">오늘</div>
{me('측면 스윙 보냈어요 · 프로가 보는 중')}
{rail(2, True)}'''

my = f'''
<div class="me-h"><span class="av">골</span><span><b>골프러버</b><i>이도형 프로와 32일째</i></span></div>
<div class="pact">
  <div class="pact-t">8월의 약속 — 한마디 5회</div>
  <div class="pact-s"><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i></div>
  <div class="pact-b">2회 받았고, 1회는 지금 프로가 보는 중이에요</div>
</div>
{pro('“꾸준히 오는 회원이 제일 늘어요. 이번 달도 잘 부탁합니다.”')}
<div class="list"><span>계정 · 아이디 관리</span><span>알림 설정</span>
<span>구독 · 결제 <i>베타 무료</i></span><span>약관 · 개인정보</span><span>문의하기</span></div>'''

SCREENS = [
    ('오늘', '오늘', home,
     '들어오면 상태 하나 · 행동 하나',
     '레일이 「지금 한 바퀴가 어디까지 왔나」를 먼저 말한다. 그 아래는 지금 상태에서 '
     '할 일 딱 하나 — 답이 왔으면 읽기, 안 찍었으면 찍기, 보는 중이면 기다리기. '
     '통계 카드를 전부 뺐다. 첫 화면에서 숫자를 읽게 하는 건 행동을 미루게 하는 것이다.'),
    ('달력', '달력', cal,
     '날짜의 색 = 그날 대화가 어디까지 갔나',
     '날짜 점이 레일의 색을 그대로 쓴다 — 브론즈(답 받음) · 앰버(보는 중) · 회색(보내기만). '
     '달력을 훑는 것만으로 한 달의 대화 밀도가 보인다. 날짜를 고르면 그날의 레일과 '
     '프로의 말이 바로 밑에 온다. 업로드는 맨 밑 한 줄 — 이 화면의 일이 아니다.'),
    ('스윙', '스윙', swings,
     '썸네일마다 미니 레일 — 글자 상태 대신',
     '「전달됨 · 보는 중」 같은 글자를 셀마다 읽게 하지 않는다. 홈에서 배운 레일이 '
     '셀 밑에 작게 반복된다 — 한 번 배우면 앱 전체에서 통한다. 필터 칩도 '
     '「답장 받음」이 제일 앞 — 이 서랍에서 제일 자주 찾는 것이다.'),
    ('대화', '대화', talk,
     '이 앱의 본체 — 프로와 나의 대화 원문',
     '리포트 목록이 아니라 시간순 대화다. 내 스윙·메모는 오른쪽 초록, 프로의 답은 '
     '왼쪽 브론즈 세리프 — 카카오톡을 아는 사람이면 설명 없이 읽는다. 감동은 여기서 '
     '난다: 내가 어제 물은 것 바로 밑에 프로의 글이 편지처럼 온다.'),
    ('마이', '마이', my,
     '설정이 아니라 프로와의 약속',
     '맨 위가 「이도형 프로와 32일째」다. 이번 달 5회 약속이 레일과 같은 문법의 '
     '칸 5개로 서고, 프로의 당부 한 줄이 브론즈로 온다. 구독 관리 화면조차 '
     '관계의 화면이다 — 해지를 고민하는 순간에도 프로가 보인다.'),
]

phones = ''.join(
    f'<div class="col">{frame(t, tab, b)}<div class="why"><b>{w1}</b>{w2}</div></div>'
    for t, tab, b, w1, w2 in SCREENS)

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · UX 설계 — 레슨은 대화다</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Pretendard,-apple-system,'Malgun Gothic',sans-serif;background:#211F1A;
  color:#EFEBE2;-webkit-font-smoothing:antialiased;padding:38px 28px 90px}}
h1{{font-size:22px;letter-spacing:-.02em}}
h2{{font-size:15px;margin:34px 0 10px;color:#D8CFBB}}
.lede{{font-size:13px;color:#B5AD9C;line-height:1.85;margin-top:10px;max-width:660px}}
.flow{{display:flex;gap:0;align-items:stretch;flex-wrap:wrap;margin:14px 0 4px}}
.fl{{background:#2B2822;border:1px solid #3A362D;border-radius:12px;padding:12px 14px;
  width:190px;margin-right:26px;position:relative}}
.fl:after{{content:'→';position:absolute;right:-21px;top:50%;transform:translateY(-50%);
  color:#8C8574;font-size:14px}}
.fl:last-child:after{{content:''}}
.fl b{{display:block;font-size:12.5px;color:#EFEBE2;padding-bottom:4px}}
.fl i{{font-style:normal;font-size:11px;color:#B5AD9C;line-height:1.6;display:block}}
.fl.gold{{border-color:#8A6428}} .fl.gold b{{color:#D9B36A}}
.diff{{margin-top:10px;max-width:680px}}
.diff li{{font-size:12.5px;color:#CFC7B4;line-height:1.9;margin-left:18px}}
.strip{{display:flex;gap:24px;overflow-x:auto;padding:20px 4px 8px;align-items:flex-start}}
.col{{flex:none;width:340px}}
.why{{font-size:11.5px;color:#B5AD9C;line-height:1.75;padding:12px 6px 0}}
.why b{{display:block;color:#EFEBE2;font-size:12px;padding-bottom:3px}}
.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:700px;background:{V['bg']};color:{V['ink']};
  box-shadow:0 18px 44px -20px rgba(0,0,0,.65)}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.85}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px;
  background:{V['soft']};color:{V['green']}}}
.ph-head{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:19px;font-weight:600;
  letter-spacing:.01em;padding:12px 20px 2px}}
.ph-body{{flex:1;padding:12px 18px 18px}}

/* ── 레슨 레일 — 앱의 척추. 다섯 화면이 같은 부품을 쓴다 ── */
.rail{{display:flex;align-items:center;padding:6px 0 16px}}
.rail.sm{{padding:7px 2px 0}}
.rl-s{{display:flex;flex-direction:column;align-items:center;gap:4px;flex:none}}
.rl-s i{{width:11px;height:11px;border-radius:50%;border:2px solid #C9C1AE;background:transparent;display:block}}
.rail.sm .rl-s i{{width:7px;height:7px;border-width:1.5px}}
.rl-s.done i{{background:{V['green']};border-color:{V['green']}}}
.rl-s.now i{{background:{V['bronze']};border-color:{V['bronze']};
  box-shadow:0 0 0 3px {V['bsoft']}}}
.rl-s b{{font-size:9px;font-weight:700;color:{V['dim']}}}
.rl-s.done b,.rl-s.now b{{color:{V['ink']}}}
.rl-b{{flex:1;height:2px;background:#D9D2C0;margin:0 3px 14px}}
.rail.sm .rl-b{{margin-bottom:0}}
.rl-b.on{{background:{V['green']}}}

/* 프로의 말 — 브론즈 세리프 + 왼쪽 금줄. 어디서든 같은 얼굴 */
.pro{{border-left:3px solid {V['bronze']};background:{V['bsoft']};border-radius:4px 14px 14px 4px;
  padding:12px 14px;margin:8px 0}}
.pro-w{{font-size:10.5px;font-weight:700;color:{V['bronze']};padding-bottom:6px}}
.pro-t{{font-family:Hahmlet,'Nanum Myeongjo',serif;font-size:14px;line-height:1.85;color:#3B3220}}
.pro.big .pro-t{{font-size:16.5px;line-height:1.95}}
.meq{{align-self:flex-end;background:{V['soft']};color:{V['green']};border-radius:14px 14px 4px 14px;
  padding:10px 13px;font-size:12.5px;font-weight:600;line-height:1.65;max-width:82%;
  margin:8px 0 8px auto}}
.kick{{font-size:12px;font-weight:800;color:{V['bronze']};padding:2px 0 4px}}
.cta{{background:{V['green']};color:#fff;border-radius:14px;text-align:center;
  padding:15px;font-size:15px;font-weight:800;margin:14px 0 12px}}
.rhythm{{font-size:11.5px;color:{V['dim']};line-height:1.7;text-align:center}}

.cal{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;padding:13px 13px 11px}}
.cal-h{{text-align:center;font-size:13px;font-weight:800;padding-bottom:10px}}
.cal-w,.cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}}
.cal-w s{{text-decoration:none;font-size:10px;font-weight:700;color:{V['dim']};padding:3px 0}}
.cal-g s{{text-decoration:none;font-size:12.5px;font-weight:600;color:{V['sub']};height:31px;
  display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}}
.cal-g s.off{{opacity:.35}}
.cal-g s.sel{{background:{V['ink']};color:#fff;font-weight:800}}
.cal-g s.today{{box-shadow:inset 0 0 0 1.5px {V['ink']};font-weight:800}}
.cal-g s.d-ans:after,.cal-g s.d-wait:after,.cal-g s.d-sent:after{{content:'';position:absolute;
  bottom:0;left:50%;margin-left:-2.5px;width:5px;height:5px;border-radius:50%}}
.cal-g s.d-ans:after{{background:{V['bronze']}}}
.cal-g s.d-wait:after{{background:{V['warn']}}}
.cal-g s.d-sent:after{{background:#9AA79E}}
.cal-l{{display:flex;justify-content:center;gap:6px;align-items:center;font-size:10px;
  color:{V['dim']};padding-top:9px}}
.lg{{display:inline-block;width:6px;height:6px;border-radius:50%;margin:0 2px 0 6px}}
.day{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;
  padding:13px 14px;margin-top:12px}}
.day-h{{display:flex;justify-content:space-between;align-items:center;font-size:13px;
  font-weight:800;padding-bottom:4px}}
.day-h .rail{{padding:0;width:96px}}
.day-sw{{display:flex;gap:8px;align-items:center;padding-top:8px}}
.day-sw .scene{{width:44px}}
.day-open{{margin-left:auto;font-size:12px;font-weight:800;color:{V['green']}}}
.donebar{{display:flex;background:{V['card']};border:1px solid {V['line']};border-radius:12px;
  padding:12px 14px;font-size:12.5px;font-weight:600;margin-top:12px}}
.donebar em{{font-style:normal;margin-left:auto;font-weight:800;color:{V['green']};font-size:12px}}

.chips{{display:flex;gap:6px;overflow:hidden;padding-bottom:4px}}
.chip{{flex:none;font-size:12px;font-weight:700;border-radius:99px;padding:8px 13px;
  background:{V['card']};color:{V['sub']};border:1px solid {V['line']}}}
.chip.on{{background:{V['green']};color:#fff;border-color:{V['green']}}}
.sec{{font-size:12.5px;font-weight:800;color:{V['sub']};padding:14px 2px 8px}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.cellw{{display:flex;flex-direction:column}}
.cellw.add{{min-height:168px;border:2px dashed {V['line']};border-radius:14px;background:{V['card']};
  display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;
  color:{V['green']};font-size:24px;font-weight:300}}
.cellw.add b{{font-size:12px;font-weight:800}}
.scene{{position:relative;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}}
.bd{{position:absolute;left:8px;top:8px;background:rgba(20,24,18,.55);color:#fff;
  font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px}}

.dvd{{text-align:center;font-size:10.5px;font-weight:800;color:{V['dim']};
  letter-spacing:.08em;padding:12px 0 4px}}
.me-sw{{display:flex;gap:8px;justify-content:flex-end;align-items:flex-start}}
.me-sw .scene{{width:48px}}
.me-sw .meq{{margin-left:0}}
.shots{{display:flex;gap:6px;padding:2px 0 4px 14px}}
.shots s{{width:44px;height:58px;border-radius:8px;display:block;
  background:linear-gradient(#CBDFEC 44%,#6FA477 44%)}}

.me-h{{display:flex;gap:12px;align-items:center;padding:6px 2px 14px}}
.av{{flex:none;width:46px;height:46px;border-radius:50%;background:{V['soft']};
  color:{V['green']};display:flex;align-items:center;justify-content:center;
  font-size:16px;font-weight:800}}
.me-h b{{display:block;font-size:17px;font-weight:800}}
.me-h i{{font-style:normal;font-size:11.5px;color:{V['bronze']};font-weight:700}}
.pact{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;padding:15px;margin-bottom:6px}}
.pact-t{{font-size:13px;font-weight:800;padding-bottom:10px}}
.pact-s{{display:flex;gap:7px;padding-bottom:9px}}
.pact-s i{{flex:1;height:9px;border-radius:99px;background:#E4DCC9}}
.pact-s i.on{{background:{V['green']}}}
.pact-s i.now{{background:{V['bronze']}}}
.pact-b{{font-size:11.5px;color:{V['dim']}}}
.list{{background:{V['card']};border:1px solid {V['line']};border-radius:16px;overflow:hidden;margin-top:12px}}
.list span{{display:flex;justify-content:space-between;padding:15px 16px;font-size:13.5px;
  font-weight:600;border-bottom:1px solid {V['line']}}}
.list span:last-child{{border-bottom:0}}
.list i{{font-style:normal;font-size:11.5px;color:{V['dim']}}}

.tabs{{display:flex;background:{V['nav']};border-top:1px solid {V['line']};padding:8px 0 10px}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:{V['dim']}}}
.tb b{{font-size:9.5px;font-weight:700}}
.tb.on{{color:{V['green']}}}
</style>

<h1>레슨은 대화다 — UX 설계판</h1>
<p class="lede">이 서비스가 파는 것은 하나다. <b>이도형 프로가 내 스윙을 직접 보고 답한다.</b>
그 한 바퀴(찍기 → 보내기 → 프로 확인 → 답장)가 앱의 척추고, 다섯 화면은 전부 이 척추
하나를 다른 각도에서 본다 — 오늘(지금 어디까지 왔나) · 달력(한 달의 대화) ·
스윙(대화의 증거) · 대화(원문) · 마이(프로와의 약속). 같은 부품 두 개가 전 화면에
반복된다: <b>레슨 레일</b>(4단계 진행), 그리고 <b>프로의 말 규칙</b>(브론즈 세리프 ·
왼쪽 금줄 — 프로가 쓴 글은 앱 어디서든 같은 얼굴이다). 탭 이름도 기능이 아니라
대화의 말로 바꿨다 — 연습기록→달력, 레슨기록→대화.</p>

<h2>사용자 흐름 — 하루 한 바퀴</h2>
<div class="flow">
  <div class="fl"><b>① 들어온다</b><i>레일이 먼저 답한다 — 지금 어디까지 왔나.
    답이 있으면 무조건 답부터.</i></div>
  <div class="fl"><b>② 행동 하나</b><i>상태마다 버튼은 하나다. 찍기 / 보내기 /
    기다리기 / 읽기. 고민 없음.</i></div>
  <div class="fl gold"><b>③ 감동</b><i>「대화」에서 내 질문 바로 밑에 프로의 글이
    편지처럼 온다. 여기가 이 앱의 값어치다.</i></div>
  <div class="fl"><b>④ 다시 온다</b><i>답을 읽으면 「내일 스윙으로 다음 답장을
    부르세요」 — 하루 1회 리듬이 재방문 그 자체다.</i></div>
</div>

<h2>이전 안(v2)보다 무엇이 좋아졌나</h2>
<ul class="diff">
  <li><b>척추가 생겼다.</b> v2는 화면마다 카드 배치였다. 이번엔 레일 하나가 다섯 화면을
    꿰어서, 어느 탭을 열어도 같은 서비스라는 것이 몸으로 읽힌다.</li>
  <li><b>프로가 어디에나 있다.</b> 이 앱의 차별점은 색이 아니라 사람이다. 프로의 말이
    전 화면에서 같은 브론즈 세리프로 나온다 — 마이페이지에서까지.</li>
  <li><b>화면마다 핵심이 하나다.</b> 오늘=행동, 달력=밀도, 스윙=증거, 대화=원문,
    마이=약속. v2처럼 통계 카드로 채우지 않는다.</li>
  <li><b>남의 템플릿이 아니다.</b> 아이보리+딥그린+브론즈 세리프는 이미 우리 앱의
    DNA다. 그걸 지우지 않고 끝까지 밀었다.</li>
</ul>

<h2>다섯 화면 — 밑의 글이 「왜 이 배치인가」다</h2>
<div class="strip">{phones}</div>
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
