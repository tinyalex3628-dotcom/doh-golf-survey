# -*- coding: utf-8 -*-
"""프로 코멘트 화면 3종 — 도착 / 대기 / 첨부사진 크게보기.

  프로 코멘트 = 회원이 그날 올린 연습 영상에, 담당 프로가 남기는 코멘트.
  정규레슨(6c·6d·r1~r8)과는 다른 물건이다. 자주 · 가볍게 오간다.

  설계에서 지킨 것 3가지
   ① 코멘트가 길어도 무너지지 않아야 한다 → 본문은 문단 흐름, 고정 높이 없음.
      길이가 늘면 스크롤만 길어지고 레이아웃은 그대로다.
   ② 긴 코멘트를 훑을 수 있어야 한다 → 프로가 짚은 시점(0:07 · 0:14)을
      영상 아래 인덱스 칩 + 본문 인라인 칩 양쪽에 두고, 누르면 영상이 그 지점으로 간다.
   ③ 사진은 딱 1장 → 본문 문단 사이에 인라인으로 놓고, 누르면 pc3 전체화면.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))

BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE = '#E4DED2', '#EFE9DE', '#A67C3D'
NUM = 'font-family:var(--font-num)'

FRAME = ('width:360px;height:740px;background:#FFFDF9;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;flex-direction:column')

VID_LEN = 27          # 0:27
MARKS = [('0:07', '톱', 7), ('0:14', '임팩트 직전', 14)]


def statusbar(bg=BG, fg=INK):
    return (f'<div style="flex:none;height:44px;background:{bg};display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 24px;font-size:12px;color:{fg}">'
            f'<span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {fg};border-radius:2px;opacity:.6"></span>'
            f'<span style="width:15px;height:9px;background:{fg};border-radius:2px"></span></span></div>')


def header(title, right='', bg=BG, fg=INK):
    return (f'<div style="flex:none;height:50px;background:{bg};display:flex;align-items:center;padding:0 12px">'
            f'<span style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:{fg}">'
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
            'stroke-linejoin="round" style="width:19px;height:19px"><path d="m15 5-7 7 7 7"></path></svg></span>'
            f'<span style="flex:1;text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:{fg}">{title}</span>'
            f'<span style="min-width:30px;display:flex;justify-content:flex-end;align-items:center;'
            f'padding-right:6px;white-space:nowrap">{right}</span></div>')


def cap(t, sub=''):
    s = f'<span style="font-size:10px;font-weight:500;color:{INK4}">{sub}</span>' if sub else ''
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 1px 9px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:{INK3}">{t}</span>{s}</div>')


# ── 공통 부품 ────────────────────────────────────────────────────────
def player():
    """그날의 연습 영상. 스크럽 위 호박색 눈금 = 프로가 짚은 지점."""
    ticks = ''.join(
        f'<span data-pc-tick="{sec}" style="position:absolute;left:{sec / VID_LEN * 100:.1f}%;top:-3px;'
        f'width:2px;height:9px;background:{BRONZE};border-radius:1px"></span>'
        for _, _, sec in MARKS)
    return f'''<div data-pc-video style="flex:none;position:relative;height:186px;border-radius:14px;
              overflow:hidden;background:linear-gradient(150deg,#3A3B33,#1D2420)">
    <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none">
      <span style="width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.94);
                   display:flex;align-items:center;justify-content:center;color:{INK}">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:17px;height:17px">
          <path d="M8 5.5v13l11-6.5z"></path></svg></span></span>
    <span style="position:absolute;top:11px;left:11px;display:flex;gap:5px">
      <span style="background:rgba(0,0,0,.5);color:#fff;font-size:10px;font-weight:600;
                   border-radius:6px;padding:4px 8px;letter-spacing:-.01em">드라이버</span>
      <span style="background:rgba(0,0,0,.5);color:rgba(255,255,255,.78);font-size:10px;font-weight:500;
                   border-radius:6px;padding:4px 8px;{NUM}">정면</span></span>
    <span style="position:absolute;top:11px;right:11px;background:rgba(0,0,0,.5);color:#fff;
                 font-size:10px;font-weight:600;border-radius:6px;padding:4px 8px;{NUM}"
          data-pc-time>0:00 / 0:27</span>
    <span style="position:absolute;left:12px;right:12px;bottom:13px">
      <span style="position:relative;display:block;height:3px;border-radius:99px;background:rgba(255,255,255,.24)">
        <span data-pc-fill style="position:absolute;left:0;top:0;bottom:0;width:0%;
              background:#fff;border-radius:99px;transition:width .28s"></span>{ticks}
      </span></span>
  </div>'''


def marks_row():
    chips = ''.join(
        f'<span data-pc-jump="{sec}" style="flex:none;display:flex;align-items:baseline;gap:6px;'
        f'background:{CARD};border:1px solid {LINE};border-radius:9px;padding:7px 11px">'
        f'<span style="font-size:11.5px;font-weight:700;color:{BRONZE};{NUM};letter-spacing:-.02em">{ts}</span>'
        f'<span style="font-size:11px;font-weight:500;color:{INK2}">{lab}</span></span>'
        for ts, lab, sec in MARKS)
    return (f'<div style="flex:none;margin-top:16px">{cap("프로가 짚은 지점", "눌러서 이동")}'
            f'<div style="display:flex;gap:7px">{chips}</div></div>')


def my_record():
    """코멘트는 회원이 남긴 기록에 대한 답이다 — 무엇에 대한 답인지 같이 보여준다."""
    def item(k, v):
        return (f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.1em;color:{INK4};{NUM}">{k}</span>'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">{v}</span></span>')
    return f'''<div style="flex:none;margin-top:18px">{cap('내가 남긴 기록')}
    <div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:13px 14px">
      <div style="display:flex;gap:8px">{item('CLUB', '드라이버')}{item('TIME', '45분')}{item('FEEL', '보통')}</div>
      <div style="margin-top:11px;padding-top:11px;border-top:1px solid #F2ECE2;
                  font-size:12px;font-weight:500;color:{INK2};line-height:1.7">
        “톱에서 왼팔이 자꾸 접히는 느낌이 있어요. 힘을 빼면 클럽이 안 올라가고요.”</div>
    </div>
  </div>'''


def para(text):
    """본문 한 문단. [[0:07]] 은 누르면 영상이 이동하는 칩이 된다."""
    out, rest = '', text
    while '[[' in rest:
        pre, rest = rest.split('[[', 1)
        ts, rest = rest.split(']]', 1)
        sec = int(ts.split(':')[0]) * 60 + int(ts.split(':')[1])
        out += pre
        out += (f'<span data-pc-jump="{sec}" style="display:inline-flex;align-items:center;'
                f'background:rgba(166,124,61,.12);color:{BRONZE};border-radius:5px;padding:1px 5px;'
                f'font-size:11.5px;font-weight:700;{NUM};letter-spacing:-.02em;'
                f'vertical-align:baseline">{ts}</span>')
    out += rest
    return (f'<div data-pc-para style="font-size:13.5px;font-weight:400;color:{INK2};line-height:1.85;'
            f'letter-spacing:-.01em;padding-bottom:13px">{out}</div>')


def photo_svg():
    """프로가 선을 그어 보낸 사진 1장.
       어깨(136,82) → 팔꿈치 → 손 세 점으로 왼팔을 긋고, 지난주(노랑)와 오늘(흰색)을 겹쳐 놨다.
       두 손끝을 잇는 호가 곧 프로가 말하는 '15도 펴졌다'는 그 차이다."""
    return '''<svg viewBox="0 0 296 190" preserveAspectRatio="xMidYMid meet"
       style="position:absolute;inset:0;width:100%;height:100%">
    <g stroke="rgba(255,255,255,.05)" stroke-width="1">
      <path d="M74 0v190M148 0v190M222 0v190M0 63.3h296M0 126.6h296"></path></g>
    <g fill="rgba(255,255,255,.14)">
      <circle cx="152" cy="46" r="13.5"></circle>
      <path d="M136 64h32l6 56h-44z"></path>
      <path d="M141 120h16l2 54h-13z"></path>
      <path d="M161 120h15l-1 54h-12z"></path>
    </g>
    <!-- 지난주 · 팔꿈치가 더 접혀 있다 -->
    <g fill="none" stroke="#E8C56A" stroke-width="2.2" stroke-linecap="round"
       stroke-linejoin="round" stroke-dasharray="5.5 4">
      <path d="M136 82 101 62l7 -30"></path></g>
    <circle cx="101" cy="62" r="3" fill="#E8C56A"></circle>
    <!-- 오늘 · 같은 팔이 더 펴졌다 -->
    <g fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M136 82 90 53l-2 -32"></path></g>
    <circle cx="90" cy="53" r="3.2" fill="#FFFFFF"></circle>
    <circle cx="136" cy="82" r="3.2" fill="rgba(255,255,255,.75)"></circle>
    <path d="M109 32A26 26 0 0 0 88 21" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.3"></path>
    <text x="98" y="13" text-anchor="middle" fill="rgba(255,255,255,.85)" font-size="11"
          font-family="Pretendard,sans-serif" font-weight="600">15°</text>
    <text x="14" y="176" fill="rgba(255,255,255,.5)" font-size="9.5"
          font-family="Pretendard,sans-serif" font-weight="500">P4 · TOP</text>
  </svg>'''


def photo_block():
    return f'''<div data-pc-photo style="position:relative;height:190px;border-radius:11px;overflow:hidden;
              background:linear-gradient(160deg,#33342D,#191A17);margin:2px 0 14px">
    {photo_svg()}
    <span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.46);color:rgba(255,255,255,.9);
                 font-size:9.5px;font-weight:600;border-radius:5px;padding:3px 7px;{NUM}">사진 1 / 1</span>
    <span style="position:absolute;left:0;right:0;bottom:0;padding:20px 11px 9px;display:flex;
                 align-items:flex-end;justify-content:space-between;gap:8px;
                 background:linear-gradient(to top,rgba(0,0,0,.62),transparent)">
      <span style="font-size:10.5px;font-weight:500;color:rgba(255,255,255,.88);line-height:1.5">
        톱에서 왼팔 · <span style="color:#E8C56A">7월 15일</span> vs <span style="color:#fff">오늘</span></span>
      <span style="flex:none;font-size:10.5px;font-weight:600;color:#fff;border:1px solid rgba(255,255,255,.42);
                   border-radius:6px;padding:3px 8px">크게 보기</span></span>
  </div>'''


def callout():
    return f'''<div style="background:{SAND};border-radius:11px;padding:12px 13px;margin:2px 0 14px">
    <div style="display:flex;align-items:center;gap:7px;padding-bottom:6px">
      <span style="width:15px;height:15px;border-radius:50%;background:{FOREST};color:#fff;flex:none;
                   display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
             stroke-linejoin="round" style="width:8px;height:8px"><path d="m4 12.5 5 5L20 6"></path></svg></span>
      <span style="font-size:11.5px;font-weight:600;letter-spacing:-.01em;color:{FOREST}">다음 연습 때 이거 하나만</span>
    </div>
    <div style="font-size:13px;font-weight:400;color:{INK};line-height:1.8;letter-spacing:-.01em">
      백스윙 올릴 때 <b style="font-weight:600">왼쪽 어깨로 턱을 밀어낸다</b>고 생각하고 스윙해보세요.
      팔은 신경 쓰지 마시고요. 천천히 20번 하고 나서 평소 속도로 치시면 됩니다.</div>
  </div>'''


BODY = [
    '영상 [[0:07]] 보시면 백스윙 절반쯤에서 왼쪽 어깨가 턱 아래까지 안 들어오고 멈춰요. '
    '거기서 클럽을 더 올리려니까 팔꿈치가 접히는 겁니다. 팔은 결과고 원인은 어깨예요. '
    '남기신 메모대로 “힘을 빼면 클럽이 안 올라간다”고 느끼시는 것도 같은 이유입니다.',

    '[[0:14]] 임팩트 직전에 오른쪽 어깨가 앞으로 나오는 것도 여기서 이어집니다. '
    '백스윙에서 못 감은 만큼 다운스윙에서 몸이 먼저 나가버려요. 요즘 슬라이스가 자주 나는 것도 '
    '팔 문제가 아니라 이 순서 때문입니다.',

    '지난주 영상이랑 같이 놓고 봤는데, 톱 위치 자체는 확실히 높아졌어요. '
    '방향은 맞게 가고 있으니 조급해하지 마세요.',
]
BODY_AFTER = [
    '사진에서 노란 선이 지난주, 흰 선이 오늘입니다. 팔꿈치 각도가 15도쯤 펴졌죠. '
    '눈으로는 잘 안 보여도 이 정도 속도면 2주 안에 잡힙니다.',
]
BODY_TAIL = [
    '드라이버 말고 7번 아이언으로 먼저 해보세요. 클럽이 짧아야 어깨가 도는 게 느껴집니다. '
    '그리고 다음에 영상 올리실 때 정면으로 한 번만 찍어주시면 어깨 각도를 정확히 볼 수 있어요.',
]


def pro_head(sub):
    return f'''<div style="display:flex;align-items:center;gap:10px;padding-bottom:12px">
    <span style="flex:none;width:34px;height:34px;border-radius:50%;background:{FOREST};color:#fff;
                 display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600">이</span>
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:{INK}">이도형 프로</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK4};{NUM}">{sub}</span></span>
    <span style="flex:none;color:{INK4}">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px">
        <circle cx="12" cy="5" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle>
        <circle cx="12" cy="19" r="1.7"></circle></svg></span>
  </div>'''


# ─────────────────────────────── PC1 · 프로 코멘트 도착
def pc1():
    lead = (f'<div style="font-size:16px;font-weight:500;letter-spacing:-.025em;color:{INK};'
            f'line-height:1.6;padding-bottom:13px">'
            f'톱에서 왼팔이 접히는 건 팔 힘이 아니라<br />어깨 회전이 덜 돌아서 그래요.</div>')
    body = ''.join(para(p) for p in BODY) + photo_block() \
        + ''.join(para(p) for p in BODY_AFTER) + callout() \
        + ''.join(para(p) for p in BODY_TAIL)

    react = f'''<div style="flex:none;margin-top:14px;display:flex;gap:7px">
    <span data-pc-react style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
          background:{CARD};border:1px solid {LINE};border-radius:11px;padding:11px;
          font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK2}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
           stroke-linejoin="round" style="width:14px;height:14px">
        <path d="M7 10v10H4V10zM7 10l4.5-7A2 2 0 0 1 15 4.6L14 10h4.6a2 2 0 0 1 1.9 2.6l-1.8 6A2 2 0 0 1 16.8 20H7"></path>
      </svg>도움이 됐어요</span>
    <span data-pc-save style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
          background:{CARD};border:1px solid {LINE};border-radius:11px;padding:11px;
          font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:{INK2}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
           stroke-linejoin="round" style="width:14px;height:14px"><path d="M6 4h12v16l-6-4.5L6 20z"></path></svg>
      코멘트 저장</span>
  </div>'''

    def past(date, txt, photo):
        pc = (f'<span style="flex:none;font-size:9.5px;font-weight:600;color:{INK4};{NUM}">사진 1</span>'
              if photo else '')
        return f'''<div data-pc-past style="display:flex;align-items:center;gap:10px;padding:11px 13px;
              border-top:1px solid #F2ECE2">
      <span style="flex:none;width:38px;font-size:10.5px;font-weight:600;color:{INK3};{NUM}">{date}</span>
      <span style="flex:1;min-width:0;font-size:12px;font-weight:500;color:{INK2};letter-spacing:-.01em;
                   overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{txt}</span>{pc}
      <span style="flex:none;color:{INK4}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
             stroke-linejoin="round" style="width:11px;height:11px"><path d="m9 5 7 7-7 7"></path></svg></span>
    </div>'''

    past_rows = (past('7/15', '톱이 낮습니다. 어깨가 안 돌아가서 팔로만 올리고 계세요', True)
                 + past('7/08', '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요', False)
                 + past('7/01', '어드레스는 좋아요. 이대로 유지하시면 됩니다', False))

    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('프로 코멘트', f'<span style="font-size:10px;font-weight:600;color:{FOREST};'
                        f'background:rgba(33,64,47,.10);border-radius:6px;padding:4px 7px;{NUM}">3 / 5회</span>')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">

    <div style="flex:none;display:flex;align-items:baseline;justify-content:space-between;padding:2px 1px 11px">
      <span style="font-size:15px;font-weight:500;letter-spacing:-.025em;color:{INK}">7월 22일 (수)</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK4};{NUM}">연습 오후 7:24</span>
    </div>

    {player()}
    {marks_row()}
    {my_record()}

    <div style="flex:none;margin-top:20px">{cap('PRO COMMENT')}
      <div data-pc-body style="background:{CARD};border:1px solid {LINE};border-radius:14px;
                  padding:14px 15px 4px;box-shadow:0 4px 14px -12px rgba(20,22,24,.5)">
        {pro_head('7월 22일 오후 9:40 · 답장까지 2시간')}
        {lead}
        {body}
      </div>
    </div>

    <div style="flex:none" data-pc-thread></div>
    {react}

    <div style="flex:none;margin-top:20px">{cap('지난 코멘트', '전체 12개')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:0 0 1px">
        <div style="height:1px"></div>{past_rows}
      </div>
    </div>
  </div>

  <div style="flex:none;background:{CARD};border-top:1px solid {LINE};padding:9px 12px 11px;
              display:flex;align-items:center;gap:8px">
    <span data-pc-clip style="flex:none;width:34px;height:34px;border-radius:10px;background:{SAND};
          color:{INK2};display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
           stroke-linejoin="round" style="width:16px;height:16px">
        <rect x="3.5" y="5" width="17" height="14" rx="2.5"></rect>
        <circle cx="9" cy="10.5" r="1.6"></circle><path d="m5 17 4.5-4.5L13 16l3-2.5 3 3.5"></path></svg></span>
    <span data-pc-input style="flex:1;height:34px;border-radius:10px;background:{BG};border:1px solid {LINE};
          display:flex;align-items:center;padding:0 12px;font-size:12.5px;font-weight:500;color:{INK4}">
      프로에게 답글 남기기</span>
    <span data-pc-send style="flex:none;width:34px;height:34px;border-radius:10px;background:{FOREST};
          color:#fff;display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
           stroke-linejoin="round" style="width:15px;height:15px"><path d="M4.5 12h14M12.5 6l6 6-6 6"></path></svg></span>
  </div>
</div>'''


# ─────────────────────────────── PC2 · 코멘트 대기
def pc2():
    def step(t, sub, done):
        dot = (f'<span style="flex:none;width:16px;height:16px;border-radius:50%;background:{FOREST};color:#fff;'
               'display:flex;align-items:center;justify-content:center">'
               '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" '
               'stroke-linejoin="round" style="width:8px;height:8px"><path d="m4 12.5 5 5L20 6"></path></svg></span>'
               if done else
               f'<span style="flex:none;width:16px;height:16px;border-radius:50%;border:1.6px dashed #CFC8B8"></span>')
        return (f'<div style="display:flex;align-items:center;gap:10px;padding:9px 0">{dot}'
                f'<span style="flex:1;font-size:12.5px;font-weight:{600 if done else 500};'
                f'letter-spacing:-.02em;color:{INK if done else INK3}">{t}</span>'
                f'<span style="font-size:10.5px;font-weight:500;color:{INK4};{NUM}">{sub}</span></div>')

    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('프로 코멘트', f'<span style="font-size:10px;font-weight:600;color:{INK3};'
                        f'background:{SAND};border-radius:6px;padding:4px 7px;{NUM}">대기 중</span>')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">

    <div style="flex:none;display:flex;align-items:baseline;justify-content:space-between;padding:2px 1px 11px">
      <span style="font-size:15px;font-weight:500;letter-spacing:-.025em;color:{INK}">7월 26일 (일)</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK4};{NUM}">연습 오후 6:02</span>
    </div>

    {player()}
    {my_record()}

    <div style="flex:none;margin-top:20px">{cap('진행 상황')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:15px 15px 8px">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:11px">
          <span style="flex:none;width:34px;height:34px;border-radius:50%;background:{SAND};color:{INK2};
                       display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                 stroke-linejoin="round" style="width:17px;height:17px"><circle cx="12" cy="12" r="8.5"></circle>
            <path d="M12 7.5v5l3 2"></path></svg></span>
          <span style="flex:1;display:flex;flex-direction:column;gap:3px">
            <span style="font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">
              이도형 프로가 확인하고 있어요</span>
            <span style="font-size:11px;font-weight:500;color:{INK3}">보통 하루 안에 도착해요</span></span>
        </div>
        <div style="border-top:1px solid #F2ECE2;padding-top:3px">
          {step('영상 업로드', '오후 6:02', True)}
          {step('코멘트 요청', '오후 6:03', True)}
          {step('프로 확인 중', '—', False)}
          {step('코멘트 도착', '—', False)}
        </div>
      </div>
    </div>

    <div style="flex:none;margin-top:16px;background:{CARD};border:1px solid {LINE};border-radius:12px;
                padding:12px 14px;display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:12px;font-weight:500;color:{INK2}">이번 달 코멘트</span>
      <span style="font-size:13px;font-weight:600;color:{INK};{NUM};letter-spacing:-.03em">3
        <span style="font-size:11px;font-weight:500;color:{INK4}"> / 5회</span></span>
    </div>

    <div style="flex:1;min-height:14px"></div>
    <div style="flex:none;padding-top:14px">
      <span data-pc-notify style="display:block;background:{FOREST};color:#fff;border-radius:12px;padding:15px;
            text-align:center;font-size:14px;font-weight:600;letter-spacing:-.02em">도착하면 알림 받기</span>
      <span data-pc-cancel style="display:block;text-align:center;padding:13px 0 2px;font-size:11.5px;
            font-weight:500;color:{INK3};text-decoration:underline;text-underline-offset:3px">
        요청 취소하기 · 횟수는 돌려받아요</span>
    </div>
  </div>
</div>'''


# ─────────────────────────────── PC3 · 첨부 사진 크게 보기
def pc3():
    def legend(color, t, dash):
        d = 'border-top:2px dashed ' + color if dash else 'border-top:2px solid ' + color
        return (f'<span style="display:flex;align-items:center;gap:7px">'
                f'<span style="width:18px;{d}"></span>'
                f'<span style="font-size:11px;font-weight:500;color:rgba(255,255,255,.72)">{t}</span></span>')

    return f'''<div style="{FRAME};background:#161714">
  {statusbar('#161714', '#EDEAE3')}
  <div style="flex:none;height:50px;display:flex;align-items:center;padding:0 14px">
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:#EDEAE3">톱에서 왼팔</span>
      <span style="font-size:10.5px;font-weight:500;color:rgba(255,255,255,.45);{NUM}">
        이도형 프로 · 7월 22일</span></span>
    <span style="flex:none;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);
                 display:flex;align-items:center;justify-content:center;color:#EDEAE3">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
           style="width:12px;height:12px"><path d="M1.5 1.5 10.5 10.5M10.5 1.5 1.5 10.5"></path></svg></span>
  </div>

  <div style="flex:1;display:flex;flex-direction:column;padding:8px 12px 6px;min-height:0">
    <div style="flex:1;min-height:200px;position:relative;width:100%;border-radius:14px;
                overflow:hidden;background:linear-gradient(160deg,#33342D,#191A17)">
      {photo_svg()}
    </div>
    <div style="flex:none;display:flex;gap:16px;padding:18px 4px 0">
      {legend('#E8C56A', '7월 15일', True)}{legend('#FFFFFF', '오늘 · 7월 22일', False)}
    </div>
    <div style="flex:none;font-size:12.5px;font-weight:400;color:rgba(255,255,255,.66);line-height:1.85;
                letter-spacing:-.01em;padding:13px 4px 0">
      팔꿈치 각도가 15도쯤 펴졌습니다. 눈으로는 잘 안 보여도 2주 안에 잡히는 속도예요.</div>
    <div style="flex:none;margin:18px 4px 0;padding-top:15px;border-top:1px solid rgba(255,255,255,.1);
                display:flex;align-items:center;gap:9px">
      <span style="flex:none;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.14);
                   color:#EDEAE3;display:flex;align-items:center;justify-content:center;
                   font-size:11px;font-weight:600">이</span>
      <span style="flex:1;font-size:11.5px;font-weight:500;color:rgba(255,255,255,.6);line-height:1.6">
        7월 22일 코멘트에 첨부된 사진입니다</span>
    </div>
  </div>

  <div style="flex:none;padding:14px 16px 20px;display:flex;gap:8px">
    <span data-pc-save2 style="flex:1;text-align:center;border:1px solid rgba(255,255,255,.22);
          border-radius:12px;padding:14px;font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:#EDEAE3">
      이미지 저장</span>
    <span data-pc-orig style="flex:1;text-align:center;background:rgba(255,255,255,.13);
          border-radius:12px;padding:14px;font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:#EDEAE3">
      원본 영상 보기</span>
  </div>
</div>'''


SCREENS = [
    ('pc1', '프로 코멘트 · 도착',   '프로 코멘트', pc1()),
    ('pc2', '프로 코멘트 · 대기',   '프로 코멘트', pc2()),
    ('pc3', '첨부 사진 크게 보기', '프로 코멘트', pc3()),
]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, group, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'comment_screens.py', 'title': title,
                   'group': group, 'html': html, 'holes': False}
        print(f'  {sid}  {title:18} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    anchor = ORDER.index('2g')
    for i, (sid, *_) in enumerate(SCREENS):
        if sid not in ORDER:
            ORDER.insert(anchor + 1 + i, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
