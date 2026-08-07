# -*- coding: utf-8 -*-
"""스튜디오 샌드(S) 확정 마감 × 실제 기능 전부 — 내용을 꽉 채운 검증판.

프로토타입이 아니라 「이 옷에 우리 살림을 다 넣으면 어떻게 보이는가」 확인용.
문안·상태·규칙은 전부 runtime-v3.js / opening.js 의 실제 값이다:

  · 여는 화면(오늘의 한 장) — 요일 슬로건 · 카드/갈래는 opening.js 원문
  · 홈 히어로 여섯 상태 — 첫스윙 전 / 도착 / 확인 중 / 오늘(요청 유도) /
    오늘 몫 소진(하루 1회) / 며칠 비움 — homeHero() 의 실제 카피
  · 최근 프로 한마디 카드(2줄 미리보기 · 사진 배지 · 계속 읽기)
  · 연습기록 — 답장 배너 → 달력(상태 점) → 오늘 접힘 카드 → 날짜 요약 패널
  · 스윙 — 칩(가진 것만) · 날짜 머리글 · 3:4 셀 · 상태 6종 색(swState 그대로)
    · 하루 2편(정면·측면) 규칙
  · 업로드 시트 — 「무엇으로 치셨어요?」 클럽 5종 · 각도 · 나중에 고를게요
  · 레슨기록 — 세그먼트(정기 피드백 베타 잠금) · pc1 댓글줄 스레드 ·
    우측 사진 스트립 · 「내 스윙 영상」 맨 뒤
  · 마이 — 이번 달 4칸 · 아이디 이어붙이기 · 구독 베타 무료
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'ux-sand-full.html')

CM = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 백스윙 절반에서 왼쪽 어깨로 턱을 밀어낸다고 생각하고 스무 번만 천천히.'
CM_S = '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요.'
CM2 = '하체는 확실히 좋아졌어요. 이번 주는 어깨 하나만 봅시다.'
NOTE = '톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.'
CLUBS = ['드라이버', '우드 · 유틸', '아이언', '웨지', '퍼터']

# swState() 의 실제 색
ST = {'err': '#C0392B', 'busy': '#BB8A2E', 'sent': '#9AA79E', 'done': '#4C7A52'}

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

GOLFER = ('<svg viewBox="0 0 60 80" style="position:absolute;left:50%;bottom:8%;width:30%;'
          'transform:translateX(-54%)"><g fill="#3E5136">'
          '<circle cx="34" cy="12" r="6"/>'
          '<path d="M30 18c-6 2-9 8-10 16l-3 22 6 20h5l-3-19 5-14 8 13 2 20h5l-1-22-6-16'
          'c3-6 2-14-1-18-2-2-4-3-7-2z"/>'
          '<path d="m28 26-16 20 2 2 17-16z"/></g>'
          '<rect x="10" y="45" width="3" height="3" rx="1.5" fill="#fff"/></svg>')


def scene(h=140, extra=''):
    return (f'<div class="scene" style="height:{h}px;flex:none;{extra}">'
            f'<i style="background:#C3DCE9;height:44%"></i>'
            f'<i style="background:#C6D8A9;height:16%"></i>'
            f'<i style="background:#96BE8D;flex:1"></i>{GOLFER}</div>')


def st(kind, text):
    return (f'<span class="st"><i style="background:{ST[kind]}"></i>'
            f'<b style="color:{ST[kind]}">{text}</b></span>')


def tabbar(on):
    return ('<div class="tabs">'
            + ''.join(f'<span class="tb{" on" if n == on else ""}">{icon(n)}<b>{n}</b></span>'
                      for n in TABS) + '</div>')


def frame(tab, body, notabs=False):
    return (f'<div class="ph"><div class="ph-top"><span>9:41</span>'
            f'<i class="beta">베타</i><span class="batt"></span></div>'
            f'<div class="ph-body">{body}</div>' + ('' if notabs else tabbar(tab)) + '</div>')


def hero(kick, title, body='', cta='', small=False):
    """homeHero() 의 heroHTML(kick, title, body, cta, small) 그대로."""
    return (f'<div class="hero"><div class="hk">{kick}</div>'
            f'<div class="big">{title}</div>'
            + (f'<div class="hb">{body}</div>' if body else '')
            + (f'<div class="cta{" sm" if small else ""}">{cta}</div>' if cta else '')
            + '</div>')


CMCARD = f'''
<div class="card cmc">
  <div class="cch"><span class="cav">이</span>
  <span class="ccw"><b>새 프로 한마디</b><i>방금 · 8월 5일 스윙</i></span>
  <span class="pbdg">사진 2</span></div>
  <div class="cct">“{CM_S} 백스윙 절반에서 왼쪽 어깨로…”</div>
  <div class="ccm">계속 읽기</div>
</div>'''

RECLINE = ('<div class="rec"><span>오늘 기록하기</span>'
           '<em>최근 기록 · 8월 5일 · 연속 5일</em></div>')


def home_of(h):
    return h + CMCARD + RECLINE


# ── 섹션 1 · 여는 화면 (오늘의 한 장) ────────────────────────────────
opening = f'''
<div class="op">
  <div class="op-ns">NS</div>
  <div class="op-name">NEXT SWING</div>
  <div class="op-slo">스윙 하나에 한마디 하나</div>
  <div class="op-card">
    <div class="op-k">오늘의 한 장</div>
    <div class="op-t">이도형 프로가<br>한마디를 남겼어요</div>
    <div class="op-s">아직 안 읽으셨어요</div>
  </div>
  <div class="op-skip">눌러서 건너뛰기</div>
</div>'''

# ── 섹션 2 · 홈 히어로 여섯 상태 (homeHero 실제 카피) ────────────────
HEROES = [
    ('첫스윙 전', hero('시작하기', '첫 스윙을<br>올려보세요', '', '스윙 올리기')
     + '<div class="soft">올리면 이도형 프로가 직접 봅니다</div>',
     '계정을 만들고 아직 한 편도 없는 사람. 남의 기록 대신 오늘 할 하나만.'),
    ('한마디 도착', home_of(hero('프로 한마디 · 도착', '이도형 프로가<br>한마디를 남겼어요', '', '한마디 확인하기')),
     '안 읽은 답이 있으면 무조건 이 화면 — 알리는 일만 하고 글은 카드에 넘긴다.'),
    ('확인 중', home_of(hero('프로 한마디 · 확인 중', '이도형 프로가<br>스윙을 보고 있어요',
                             '2시간 전 요청했어요 · 보통 하루 안에 도착해요', '올린 스윙 보기')),
     '기다림도 상태다 — 근거는 서버의 want_comment 라 폰을 바꿔도 남는다.'),
    ('오늘 올림', home_of(hero('오늘', '오늘 스윙,<br>프로에게 보여줄까요?', '', '프로 한마디 요청하기')),
     '「1개 올렸어요」는 읽고 나면 할 일이 없다 — 제목이 다음 걸음을 말한다.'),
    ('오늘 몫 소진', home_of(hero('오늘', '오늘 스윙,<br>프로에게 보냈어요', '', '오늘 몫은 다 썼어요 · 내일 다시', True)),
     '하루 1회 규칙. 버튼이 작아지고, 눌러도 「내일 다시」 안내만 뜬다.'),
    ('며칠 비움', home_of(hero('마지막 스윙 · 2일 전', '오늘도 스윙<br>올려볼까요?', '', '오늘 스윙 올리기')),
     '며칠 됐는지는 작은 머리말로 — 나무라는 첫 화면은 다시 열기 싫어진다.'),
]

# ── 섹션 3 · 메인 5탭 풀 콘텐츠 ──────────────────────────────────────
rec_full = f'''
<div class="bnr">프로에게 답장이 왔어요 <em>확인하기 ›</em></div>
<div class="card cal">
  <div class="cal-h">‹ &nbsp;2026년 8월&nbsp; ›</div>
  <div class="cal-w"><s>일</s><s>월</s><s>화</s><s>수</s><s>목</s><s>금</s><s>토</s></div>
  <div class="cal-g">
    <s></s><s></s><s></s><s></s><s></s><s></s><s>1</s>
    <s>2</s><s>3</s><s class="d-ans">4</s><s class="sel d-ans">5</s><s class="today d-wait">6</s><s class="off">7</s><s class="off">8</s>
  </div>
  <div class="cal-l"><i style="background:{ST['done']}"></i>답장 받음
    <i style="background:{ST['busy']}"></i>보는 중 <i style="background:{ST['sent']}"></i>보내기만</div>
</div>
<div class="fold">오늘 스윙 1개 올렸어요 <em>기록 남기기 +</em></div>
<div class="card day">
  <div class="ch row">8월 5일 (수) <em>스윙 2 · 한마디 1</em></div>
  <div class="dsw">{scene(52, 'width:40px')}{scene(52, 'width:40px')}
    <span class="dst">{st('done', '한마디 1')}{st('sent', '전달됨')}</span></div>
  <div class="ct">“{CM2}”</div>
  <div class="dnote">내 메모 — “{NOTE}”</div>
</div>'''

gal_full = f'''
<div class="chips"><span class="on">전체</span><span>정면</span><span>측면</span>
<span>드라이버</span><span>아이언</span><span>한마디 받음</span></div>
<div class="sec">2026. 8. 6 (목) <em>2개</em></div>
<div class="grid">
  <div class="gc">{scene(0)}<span class="gv">정면 · 드라이버</span><span class="gst">{st('busy', '보는 중')}</span></div>
  <div class="gc">{scene(0)}<span class="gv">측면 · 드라이버</span><span class="gst">{st('sent', '전달됨')}</span></div>
</div>
<div class="sec">2026. 8. 5 (수) <em>4개</em></div>
<div class="grid">
  <div class="gc">{scene(0)}<span class="gv">정면 · 아이언</span><span class="gst">{st('done', '한마디 1')}</span></div>
  <div class="gc">{scene(0)}<span class="gv">측면 · 아이언</span><span class="gst">{st('busy', '보내는 중 62%')}</span></div>
  <div class="gc">{scene(0)}<span class="gv">정면 · 웨지</span><span class="gst">{st('busy', '대기 중')}</span></div>
  <div class="gc">{scene(0)}<span class="gv">측면 · 퍼터</span><span class="gst">{st('err', '재전송 필요')}</span></div>
</div>
<div class="soft">오늘 2편을 다 올렸어요 — 두 편은 정면 · 측면 순서로 들어갑니다</div>'''

sheet = f'''
<div class="dimback">{scene(150, 'opacity:.35')}</div>
<div class="grow"></div>
<div class="sheetbox">
  <div class="sh-t">무엇으로 치셨어요?</div>
  <div class="chips wrap">{''.join(f'<span class="{"on" if c == "아이언" else ""}">{c}</span>' for c in CLUBS)}</div>
  <div class="sh-s">어느 쪽에서 찍었어요?</div>
  <div class="chips"><span class="on">정면</span><span>측면</span></div>
  <div class="cta">올리기</div>
  <div class="sh-skip">나중에 고를게요</div>
</div>'''


def crow(when, nphoto, body, first=False):
    shots = (f'<span class="rs">{"".join("<s></s>" for _ in range(nphoto))}</span>' if nphoto else '')
    return (f'<div class="crow{"" if first else " nx"}">'
            f'<span class="crh"><span class="cav">이</span>'
            f'<span class="ccw"><b>이도형 프로</b><i>{when}</i></span>{shots}</span>'
            f'<span class="cbody">{body}</span></div>')


les_full = f'''
<div class="seg"><span class="off">정기 피드백</span><span class="on">프로 한마디</span></div>
<div class="segn">정기 피드백은 베타 이후에 열립니다 · 월 1회</div>
<div class="dl">8월 5일 (수) 스윙에 달린 한마디</div>
<div class="card pad">
{crow('8월 5일 오후 9:40 · 사진 2', 2, f'“{CM}”', True)}
{crow('8월 6일 오전 8:12', 0, '“어제 말한 어깨, 오늘 영상에선 확실히 좋아졌어요.”')}
</div>
<div class="myv">{scene(76, 'width:118px')}<em>내 스윙 영상 — 글이 먼저, 영상은 맨 뒤</em></div>'''

my_full = f'''
<div class="hi"><span class="cav">골</span>골프러버 님 <i>이도형 프로와 32일째</i></div>
<div class="card st4w"><div class="ch">이번 달</div>
<div class="st4"><span><b>12</b><i>연습일</i></span><span><b>14</b><i>영상</i></span>
<span><b>6</b><i>한마디</i></span><span><b>9</b><i>최장 연속</i></span></div></div>
<div class="idc"><b>아이디 만들기</b><i>폰을 바꿔도 스윙과 한마디가 그대로 이어져요</i></div>
<div class="card quote">“꾸준히 오는 회원이 제일 늘어요. 이번 달도 잘 부탁합니다.”</div>
<div class="list"><span>알림 설정</span><span>구독 · 결제 <i>베타 무료</i></span>
<span>약관 · 개인정보</span><span>문의하기</span></div>'''

SEC2 = ''.join(
    f'<div class="col">{frame("홈", b)}<div class="why"><b>{t}</b>{w}</div></div>'
    for t, b, w in HEROES)

SEC3 = ''.join(
    f'<div class="col">{frame(tab, b, notabs)}<div class="why"><b>{t}</b>{w}</div></div>'
    for tab, b, notabs, t, w in [
        ('연습기록', rec_full, False, '배너 → 달력 → 접힘 → 요약',
         '실제 2b 순서 그대로. 달력 점 색 = 상태색, 5일 요약엔 스윙(위)·한마디(아래)·내 메모까지.'),
        ('스윙', gal_full, False, '상태 6종이 전부 보인다',
         '보는 중·전달됨·한마디·보내는 중 62%·대기 중·재전송 필요 — swState() 색을 샌드 위에 얹었다.'),
        ('스윙', sheet, False, '업로드 시트 — 묻는 건 둘뿐',
         'clubSheet() 원문: 클럽 5종 + 각도. 「나중에 고를게요」로 건너뛸 수 있다.'),
        ('레슨기록', les_full, False, 'pc1 댓글줄 스레드',
         '세그먼트(정기 피드백 잠금) 아래 같은 스윙의 답 두 줄이 시간순으로. 사진은 머리줄 오른쪽, 내 영상은 맨 뒤.'),
        ('마이', my_full, False, '4칸 통계 + 이어붙이기',
         '연습일·영상·한마디·최장 연속. 아이디 카드가 구독보다 위 — 기록을 잃지 않는 게 먼저다.'),
    ])

html = f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · 스튜디오 샌드 — 실기능 풀 콘텐츠 검증판</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;500;700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Noto Sans KR',sans-serif;background:#1B1916;color:#EFEBE2;
  -webkit-font-smoothing:antialiased;padding:38px 28px 90px}}
h1{{font-size:22px;letter-spacing:-.02em}}
h2{{font-size:16px;margin:0 0 6px}}
h2 em{{font-style:normal;font-size:12px;color:#D9A05B;font-weight:600;margin-left:8px}}
.lede{{font-size:12.5px;color:#B3AB9D;line-height:1.8;max-width:700px}}
.th{{margin-top:44px;padding-top:26px;border-top:1px solid #37332C}}
.strip{{display:flex;gap:24px;overflow-x:auto;padding:20px 4px 8px;align-items:flex-start}}
.col{{flex:none;width:340px}}
.why{{font-size:11.5px;color:#B3AB9D;line-height:1.75;padding:12px 6px 0}}
.why b{{display:block;color:#EFEBE2;font-size:12px;padding-bottom:3px}}

.ph{{width:340px;border-radius:30px;overflow:hidden;display:flex;flex-direction:column;
  min-height:700px;position:relative;box-shadow:0 18px 44px -18px rgba(0,0,0,.7);
  background:#F6EFE1;color:#3E362A;font-family:'Gowun Dodum',sans-serif}}
.ph-top{{display:flex;align-items:center;justify-content:space-between;padding:11px 18px 4px;
  font-size:11px;font-weight:700}}
.ph-top .batt{{width:16px;height:9px;border-radius:2px;background:currentColor;opacity:.8}}
.beta{{font-style:normal;font-size:9.5px;font-weight:800;border-radius:99px;padding:2px 9px;
  background:#EDE3CE;color:#6E6248}}
.ph-body{{flex:1;padding:12px 18px 18px;display:flex;flex-direction:column;position:relative}}
.tabs{{display:flex;padding:8px 0 10px;background:#FDF8EE;border-top:1px solid #E6DAC2}}
.tb{{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:#AC9F82}}
.tb b{{font-size:9px;font-weight:700}}
.tb.on{{color:#C0653A}}
.scene{{position:relative;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}}
.grow{{flex:1}}
.soft{{text-align:center;font-size:12px;color:#AC9F82;padding-top:18px;line-height:1.7}}
.st{{display:inline-flex;align-items:center;gap:5px}}
.st i{{width:6px;height:6px;border-radius:50%;display:inline-block}}
.st b{{font-size:10.5px;font-weight:800;font-family:'Noto Sans KR',sans-serif}}

.hero{{position:relative;background:#FDF8EE;border-radius:20px;padding:24px 22px 20px;
  border:1px solid #E6DAC2}}
.hk{{font-size:11.5px;font-weight:800;color:#C0653A;padding-bottom:8px;
  font-family:'Noto Sans KR',sans-serif}}
.big{{font-size:26px;line-height:1.5}}
.hb{{font-size:11.5px;color:#6E6248;line-height:1.7;padding-top:10px;
  font-family:'Noto Sans KR',sans-serif}}
.cta{{background:#C0653A;color:#FFF6EC;border-radius:99px;text-align:center;
  padding:14px;font-size:14.5px;margin-top:18px}}
.cta.sm{{padding:10px;font-size:12px;background:#EDE3CE;color:#6E6248;width:82%;margin:16px auto 0}}

.card{{background:#FDF8EE;border:1px solid #E6DAC2;border-radius:20px;padding:17px 17px 14px;
  margin-top:14px}}
.card.pad{{padding:16px}}
.cch,.crh{{display:flex;align-items:flex-start;gap:9px}}
.cav{{flex:none;width:30px;height:30px;border-radius:50%;background:#F3DFCC;color:#C0653A;
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;
  font-family:'Noto Sans KR',sans-serif}}
.ccw{{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}}
.ccw b{{font-size:12.5px;font-family:'Noto Sans KR',sans-serif;font-weight:700}}
.ccw i{{font-style:normal;font-size:10.5px;color:#AC9F82;font-family:'Noto Sans KR',sans-serif}}
.pbdg{{flex:none;font-size:10px;font-weight:700;color:#6E6248;background:#EDE3CE;
  border-radius:6px;padding:3px 7px;font-family:'Noto Sans KR',sans-serif}}
.cct{{font-size:13.5px;line-height:1.8;padding-top:10px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}}
.ccm{{font-size:12px;font-weight:800;color:#C0653A;text-align:right;padding-top:8px;
  font-family:'Noto Sans KR',sans-serif}}
.rec{{display:flex;justify-content:space-between;align-items:center;background:#FDF8EE;
  border:1px solid #E6DAC2;border-radius:14px;padding:12px 15px;margin-top:12px}}
.rec span{{font-size:12.5px;font-weight:700;font-family:'Noto Sans KR',sans-serif}}
.rec em{{font-style:normal;font-size:10.5px;color:#AC9F82;font-family:'Noto Sans KR',sans-serif}}

.bnr{{background:#E8EFE4;color:#3F5C42;border-radius:13px;padding:12px 15px;font-size:12.5px;
  font-weight:800;display:flex;justify-content:space-between;
  font-family:'Noto Sans KR',sans-serif}}
.bnr em{{font-style:normal}}
.fold{{display:flex;justify-content:space-between;background:#FDF8EE;border:1px solid #E6DAC2;
  border-radius:13px;padding:12px 15px;font-size:12px;color:#6E6248;margin-top:12px;
  font-family:'Noto Sans KR',sans-serif;font-weight:600}}
.fold em{{font-style:normal;font-weight:800;color:#C0653A}}
.cal-h{{text-align:center;font-size:13px;font-weight:700;padding-bottom:10px}}
.cal-w,.cal-g{{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;
  font-family:'Noto Sans KR',sans-serif}}
.cal-w s{{text-decoration:none;font-size:10px;font-weight:700;color:#AC9F82;padding:3px 0}}
.cal-g s{{text-decoration:none;font-size:12.5px;font-weight:600;color:#6E6248;height:31px;
  display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}}
.cal-g s.off{{opacity:.35}}
.cal-g s.sel{{background:#3E362A;color:#F6EFE1;font-weight:800}}
.cal-g s.today{{box-shadow:inset 0 0 0 1.5px #3E362A;font-weight:800}}
.cal-g s.d-ans:after,.cal-g s.d-wait:after{{content:'';position:absolute;bottom:0;left:50%;
  margin-left:-2.5px;width:5px;height:5px;border-radius:50%}}
.cal-g s.d-ans:after{{background:{ST['done']}}}
.cal-g s.d-wait:after{{background:{ST['busy']}}}
.cal-l{{display:flex;justify-content:center;gap:5px;align-items:center;font-size:10px;
  color:#AC9F82;padding-top:9px;font-family:'Noto Sans KR',sans-serif}}
.cal-l i{{display:inline-block;width:6px;height:6px;border-radius:50%;margin:0 2px 0 7px}}
.ch{{font-size:11.5px;font-weight:800;color:#C0653A;padding-bottom:9px;
  font-family:'Noto Sans KR',sans-serif}}
.ch.row{{display:flex;justify-content:space-between;color:#3E362A}}
.ch.row em{{font-style:normal;font-size:10.5px;color:#AC9F82;font-weight:600}}
.ct{{font-size:14px;line-height:1.85}}
.dsw{{display:flex;gap:7px;align-items:center;padding-bottom:10px}}
.dst{{margin-left:auto;display:flex;flex-direction:column;gap:5px;align-items:flex-end}}
.dnote{{font-size:11.5px;color:#6E6248;line-height:1.7;border-top:1px dashed #E6DAC2;
  margin-top:10px;padding-top:9px;font-family:'Noto Sans KR',sans-serif}}

.chips{{display:flex;gap:6px;overflow:hidden;padding-bottom:12px}}
.chips.wrap{{flex-wrap:wrap;overflow:visible}}
.chips span{{flex:none;font-size:12px;font-weight:600;border-radius:99px;padding:8px 13px;
  background:#FDF8EE;color:#6E6248;border:1px solid #E6DAC2;
  font-family:'Noto Sans KR',sans-serif}}
.chips .on{{background:#C0653A;color:#FFF6EC;border-color:#C0653A}}
.sec{{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;
  font-weight:700;padding:8px 2px 8px;font-family:'Noto Sans KR',sans-serif}}
.sec em{{font-style:normal;font-size:11px;color:#AC9F82;font-weight:600}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding-bottom:6px}}
.gc{{position:relative;aspect-ratio:3/4;border-radius:14px;overflow:hidden;
  border:1px solid #E6DAC2}}
.gc .scene{{position:absolute;inset:0;height:auto!important;border-radius:0}}
.gv{{position:absolute;left:8px;top:8px;background:rgba(62,54,42,.62);color:#FFF6EC;
  font-size:9.5px;font-weight:800;border-radius:5px;padding:3px 7px;z-index:2;
  font-family:'Noto Sans KR',sans-serif}}
.gst{{position:absolute;left:8px;bottom:8px;background:rgba(253,248,238,.92);
  border-radius:7px;padding:4px 8px;z-index:2}}

.dimback{{position:absolute;inset:0;background:#E9DFC9}}
.dimback .scene{{position:absolute;inset:0;height:auto!important;border-radius:0}}
.sheetbox{{position:relative;z-index:2;background:#FDF8EE;border-radius:22px 22px 0 0;
  margin:0 -18px -18px;padding:20px 20px 16px;box-shadow:0 -14px 30px -18px rgba(60,45,15,.4)}}
.sh-t{{font-size:15.5px;font-weight:700;padding-bottom:10px}}
.sh-s{{font-size:12px;font-weight:700;color:#AC9F82;padding:4px 0 8px;
  font-family:'Noto Sans KR',sans-serif}}
.sh-skip{{text-align:center;font-size:12.5px;color:#AC9F82;padding-top:12px;
  font-family:'Noto Sans KR',sans-serif}}

.seg{{display:flex;background:#FDF8EE;border:1px solid #E6DAC2;border-radius:14px;padding:4px}}
.seg span{{flex:1;text-align:center;font-size:12.5px;font-weight:800;padding:9px 0;
  border-radius:11px;font-family:'Noto Sans KR',sans-serif}}
.seg .on{{background:#C0653A;color:#FFF6EC}}
.seg .off{{color:#AC9F82}}
.segn{{font-size:10.5px;color:#AC9F82;text-align:center;padding:8px 0 4px;
  font-family:'Noto Sans KR',sans-serif}}
.dl{{font-size:11px;font-weight:800;color:#AC9F82;text-align:center;padding:8px 0 2px;
  font-family:'Noto Sans KR',sans-serif}}
.crow{{display:flex;flex-direction:column;gap:7px}}
.crow.nx{{margin-top:14px;padding-top:14px;border-top:1px solid #E6DAC2}}
.rs{{display:flex;gap:4px}}
.rs s{{width:30px;height:40px;border-radius:6px;display:block;
  background:linear-gradient(#C3DCE9 44%,#96BE8D 44%)}}
.cbody{{display:block;padding-left:39px;font-size:13px;line-height:1.9}}
.myv{{display:flex;gap:10px;align-items:center;margin-top:16px}}
.myv em{{font-style:normal;font-size:11px;color:#AC9F82;line-height:1.7;
  font-family:'Noto Sans KR',sans-serif}}

.hi{{display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:700;
  color:#6E6248;padding:8px 0 18px}}
.hi i{{font-style:normal;font-size:11px;color:#C0653A;margin-left:auto;
  font-family:'Noto Sans KR',sans-serif;font-weight:700}}
.st4w .ch{{color:#AC9F82}}
.st4{{display:flex}}
.st4 span{{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  border-right:1px solid #E6DAC2}}
.st4 span:last-child{{border-right:0}}
.st4 b{{font-size:19px;color:#3E362A}}
.st4 i{{font-style:normal;font-size:9.5px;font-weight:700;color:#AC9F82;
  font-family:'Noto Sans KR',sans-serif}}
.idc{{background:#F3DFCC;border-radius:16px;padding:14px 16px;margin-top:12px}}
.idc b{{display:block;font-size:13px;color:#8F4826;padding-bottom:3px;
  font-family:'Noto Sans KR',sans-serif;font-weight:800}}
.idc i{{font-style:normal;font-size:11px;color:#6E6248;line-height:1.6;
  font-family:'Noto Sans KR',sans-serif}}
.card.quote{{font-size:13px;line-height:1.85;color:#6E6248}}
.list{{background:#FDF8EE;border:1px solid #E6DAC2;border-radius:18px;overflow:hidden;margin-top:12px}}
.list span{{display:flex;justify-content:space-between;padding:14px 16px;font-size:13px;
  border-bottom:1px solid #EDE3CE;font-family:'Noto Sans KR',sans-serif;font-weight:600}}
.list span:last-child{{border-bottom:0}}
.list i{{font-style:normal;font-size:11px;color:#AC9F82}}

.op{{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;gap:0}}
.op-ns{{width:58px;height:58px;border-radius:50%;background:#3E362A;color:#F6EFE1;
  display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;
  font-family:'Noto Sans KR',sans-serif;letter-spacing:.04em}}
.op-name{{font-size:14px;letter-spacing:.34em;padding:16px 0 6px;color:#3E362A;
  font-family:'Noto Sans KR',sans-serif;font-weight:700}}
.op-slo{{font-size:12px;color:#AC9F82;padding-bottom:40px}}
.op-card{{background:#FDF8EE;border:1px solid #E6DAC2;border-radius:20px;
  padding:24px 26px;width:86%}}
.op-k{{font-size:10.5px;font-weight:800;color:#C0653A;letter-spacing:.14em;padding-bottom:12px;
  font-family:'Noto Sans KR',sans-serif}}
.op-t{{font-size:21px;line-height:1.55}}
.op-s{{font-size:12px;color:#AC9F82;padding-top:10px}}
.op-skip{{font-size:11px;color:#AC9F82;padding-top:34px;font-family:'Noto Sans KR',sans-serif}}
</style>

<h1>스튜디오 샌드 — 실기능 풀 콘텐츠 검증판</h1>
<p class="lede">S 마감에 우리 살림을 전부 넣었다. 문안·상태·규칙은 모두 runtime-v3.js /
opening.js 의 실제 값 — 여는 화면(오늘의 한 장 · 요일 슬로건), 홈 히어로 여섯 상태와
하루 1회 카피, 상태 6종 색, 하루 2편 규칙, 클럽 업로드 시트, pc1 댓글줄 스레드,
정기 피드백 베타 잠금, 이번 달 4칸, 아이디 이어붙이기까지.</p>

<div class="th"><h2>여는 화면 <em>오늘의 한 장 — 세션에 한 번, 2.2초 뒤 스스로 닫힘</em></h2>
<div class="strip"><div class="col">{frame('', opening, True)}
<div class="why"><b>머리는 고정, 가운데 한 장만 바뀐다</b>슬로건은 요일마다(목요일 =
「스윙 하나에 한마디 하나」), 카드는 opening.js 의 갈래 아홉에서 데이터로 고른다 —
안 읽은 한마디가 있으면 이 카드가 뜬다.</div></div></div></div>

<div class="th"><h2>홈 <em>히어로 여섯 상태 — homeHero() 의 실제 카피</em></h2>
<div class="strip">{SEC2}</div></div>

<div class="th"><h2>나머지 4탭 + 업로드 시트 <em>실제 구조 그대로</em></h2>
<div class="strip">{SEC3}</div></div>
</html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'{os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
