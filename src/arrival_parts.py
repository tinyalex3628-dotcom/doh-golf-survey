# -*- coding: utf-8 -*-
"""정기 피드백 '도착' 알림 3안 — 앱 켜자마자 확실히 알아채게.

   지금 문제: 상단 초록 띠가 얇아서 그냥 배너로 읽힌다.
   정기 피드백은 Elite가 한 달에 딱 한 번 받는 것이다 — 한 달에 한 번이면
   화면을 잠깐 막아도 된다. 오히려 안 막으면 무슨 일이 있었는지 모르고 지나간다.

   세 안은 '얼마나 막느냐'로 나뉜다.
     A 센터 카드   배경 흐림 + 가운데 카드      — 막지만 홈이 뒤에 비친다
     B 전체 화면   앱을 통째로 덮는 개봉 화면    — 가장 확실, 가장 셈
     C 상단 히어로  안 막고 홈 맨 위를 크게 차지  — 가장 약함, 스크롤로 지나감
"""
BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE, SOFT = '#E4DED2', '#EFE9DE', '#A67C3D', '#F2F8F4'
NUM = 'font-family:var(--font-num)'

ENVELOPE = ('<rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect>'
            '<path d="m3.8 7 8.2 6 8.2-6"></path>')
CHEV = '<path d="m9 5 7 7-7 7"></path>'
ARROW = '<path d="M5 12h13m-5-5 5 5-5 5"></path>'


def ic(d, w=16, sw='1.8', color='currentColor'):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;'
            f'display:block">{d}</svg>')


def ba_pair(w=76, h=54, dark=False):
    """Before / After 미니 쌍 — 리포트 표지의 얼굴."""
    fill = 'rgba(255,255,255,.13)' if dark else SAND
    bd = 'rgba(255,255,255,.22)' if dark else LINE
    on = 'rgba(255,255,255,.5)' if dark else FOREST
    lab = 'rgba(255,255,255,.55)' if dark else INK4
    labon = 'rgba(255,255,255,.9)' if dark else FOREST
    arrow = 'rgba(255,255,255,.4)' if dark else INK4
    def box(border, label, strong):
        return (f'<span style="display:flex;flex-direction:column;gap:4px;align-items:center">'
                f'<span style="width:{w}px;height:{h}px;border-radius:7px;background:{fill};'
                f'border:{border}"></span>'
                f'<span style="font-size:8.5px;font-weight:600;letter-spacing:.1em;'
                f'color:{labon if strong else lab};{NUM}">{label}</span></span>')
    return (f'<span style="display:flex;align-items:center;gap:9px;justify-content:center">'
            f'{box(f"1px solid {bd}", "BEFORE", False)}'
            f'<span style="color:{arrow};margin-bottom:12px">{ic(ARROW, 13, "1.9")}</span>'
            f'{box(f"1.5px solid {on}", "AFTER", True)}</span>')


# ── A안 · 센터 카드 + 배경 흐림 ──────────────────────────────────────
def a_modal():
    return f'''<div style="position:absolute;inset:0;z-index:60;display:flex;align-items:center;
              justify-content:center;padding:0 22px;background:rgba(24,31,26,.46)">
  <div style="width:100%;background:{CARD};border-radius:21px;padding:24px 20px 18px;
              box-shadow:0 26px 60px -18px rgba(20,26,22,.6);display:flex;flex-direction:column;
              align-items:center;gap:0">

    <span style="width:52px;height:52px;border-radius:50%;background:{SOFT};color:{FOREST};
                 display:flex;align-items:center;justify-content:center;position:relative">
      {ic(ENVELOPE, 23, '1.7')}
      <span style="position:absolute;top:1px;right:1px;width:11px;height:11px;border-radius:50%;
                   background:{BRONZE};border:2.5px solid {CARD}"></span></span>

    <span style="margin-top:14px;font-size:9.5px;font-weight:700;letter-spacing:.2em;
                 color:{BRONZE};{NUM}">7월호 리포트 도착</span>

    <span style="margin-top:9px;display:flex;align-items:baseline;gap:8px">
      <span style="font-size:26px;font-weight:700;letter-spacing:-.03em;color:{FOREST};{NUM}">No.06</span>
    </span>
    <span style="margin-top:3px;font-size:16px;font-weight:600;letter-spacing:-.03em;color:{INK};
                 text-align:center;line-height:1.45">톱에서 왼팔 각 잡기</span>

    <span style="margin-top:16px">{ba_pair()}</span>

    <span style="margin-top:16px;width:100%;padding-top:14px;border-top:1px solid #F1EBE1;
                 display:flex;align-items:center;justify-content:center;gap:7px">
      <span style="width:20px;height:20px;border-radius:50%;background:{FOREST};color:#fff;
                   display:flex;align-items:center;justify-content:center;font-size:9px;
                   font-weight:700">이</span>
      <span style="font-size:11px;font-weight:500;color:{INK3}">이도형 프로 · 3주 프로그램 · 숙제 3개</span></span>

    <span style="margin-top:16px;width:100%;background:{FOREST};color:#fff;border-radius:13px;
                 padding:15px;text-align:center;font-size:14.5px;font-weight:600;
                 letter-spacing:-.02em;box-shadow:0 10px 22px -14px rgba(33,64,47,.9)">
      지금 열어보기</span>
    <span style="margin-top:11px;font-size:12px;font-weight:500;color:{INK3}">나중에 볼게요</span>
  </div>
</div>'''


# ── B안 · 전체 화면 개봉 ─────────────────────────────────────────────
def b_fullscreen():
    return f'''<div style="position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;
              background:radial-gradient(125% 78% at 50% 12%,#2F4A3A 0%,#1A241E 58%,#141A16 100%)">

  <div style="flex:none;height:44px;display:flex;align-items:center;justify-content:space-between;
              padding:0 24px;font-size:12px;color:rgba(255,255,255,.86)">
    <span style="{NUM}">9:41</span>
    <span style="display:flex;gap:4px;align-items:center">
      <span style="width:15px;height:9px;border:1px solid rgba(255,255,255,.62);border-radius:2px"></span>
      <span style="width:15px;height:9px;background:rgba(255,255,255,.86);border-radius:2px"></span></span></div>

  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
              padding:0 26px;gap:0">

    <span style="position:relative;width:96px;height:96px;border-radius:50%;
                 background:rgba(255,255,255,.07);display:flex;align-items:center;
                 justify-content:center;color:#EDEAE3">
      <span style="position:absolute;inset:-16px;border-radius:50%;
                   background:rgba(255,255,255,.045)"></span>
      {ic(ENVELOPE, 42, '1.35')}
      <span style="position:absolute;top:8px;right:8px;width:15px;height:15px;border-radius:50%;
                   background:{BRONZE};border:3px solid #1E2A22"></span></span>

    <span style="margin-top:30px;font-size:9.5px;font-weight:700;letter-spacing:.24em;
                 color:rgba(214,177,120,.95);{NUM}">MONTHLY FEEDBACK · 7월호</span>

    <span style="margin-top:14px;font-size:23px;font-weight:600;letter-spacing:-.035em;color:#fff;
                 text-align:center;line-height:1.4">정기 피드백이<br>도착했어요</span>

    <span style="margin-top:20px;padding:13px 18px;border-radius:13px;
                 background:rgba(255,255,255,.08);display:flex;flex-direction:column;
                 align-items:center;gap:9px">
      <span style="display:flex;align-items:baseline;gap:9px">
        <span style="font-size:17px;font-weight:700;color:{BRONZE};{NUM}">No.06</span>
        <span style="font-size:13.5px;font-weight:500;color:rgba(255,255,255,.92);
                     letter-spacing:-.02em">톱에서 왼팔 각 잡기</span></span>
      {ba_pair(66, 46, dark=True)}
    </span>

    <span style="margin-top:16px;font-size:11.5px;font-weight:500;color:rgba(255,255,255,.5);
                 text-align:center;line-height:1.7">
      이도형 프로가 이번 달 영상 12개를 보고<br>3주 프로그램을 만들었어요</span>
  </div>

  <div style="flex:none;padding:0 26px 30px;display:flex;flex-direction:column;gap:13px">
    <span style="background:#F6F3EC;color:{INK};border-radius:14px;padding:16px;text-align:center;
                 font-size:15px;font-weight:600;letter-spacing:-.02em;display:flex;
                 align-items:center;justify-content:center;gap:7px">
      리포트 열기 <span style="color:{INK2}">{ic(CHEV, 13, '2.4')}</span></span>
    <span style="text-align:center;font-size:12.5px;font-weight:500;
                 color:rgba(255,255,255,.45)">나중에 볼게요</span>
  </div>
</div>'''


# ── C안 · 홈 상단 히어로 (막지 않음) ─────────────────────────────────
def c_hero():
    return f'''<div style="flex:none;margin:0 0 16px;background:{FOREST};border-radius:16px;
              padding:16px 16px 15px;position:relative;overflow:hidden;
              box-shadow:0 14px 30px -20px rgba(33,64,47,.95)">
  <span style="position:absolute;right:-34px;top:-34px;width:118px;height:118px;border-radius:50%;
               background:rgba(255,255,255,.045)"></span>

  <div style="display:flex;align-items:center;gap:7px">
    <span style="position:relative;display:flex;width:7px;height:7px">
      <span style="position:absolute;inset:-3px;border-radius:50%;
                   background:rgba(214,177,120,.3)"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:{BRONZE}"></span></span>
    <span style="font-size:9.5px;font-weight:700;letter-spacing:.19em;color:rgba(214,177,120,.95);
                 {NUM}">방금 도착 · 7월호</span>
  </div>

  <div style="margin-top:11px;display:flex;align-items:center;gap:13px">
    <span style="flex:none;width:46px;height:46px;border-radius:13px;
                 background:rgba(255,255,255,.11);color:#fff;display:flex;align-items:center;
                 justify-content:center;position:relative">{ic(ENVELOPE, 21, '1.7')}
      <span style="position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;
                   background:{BRONZE};border:2.5px solid {FOREST}"></span></span>
    <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
      <span style="display:flex;align-items:baseline;gap:7px">
        <span style="font-size:15px;font-weight:700;color:{BRONZE};{NUM}">No.06</span>
        <span style="font-size:15px;font-weight:600;letter-spacing:-.03em;color:#fff">
          톱에서 왼팔 각 잡기</span></span>
      <span style="font-size:11px;font-weight:500;color:rgba(255,255,255,.55)">
        이도형 프로 · 3주 프로그램 · 숙제 3개</span></span>
  </div>

  <div style="margin-top:14px;display:flex;align-items:center;gap:11px">
    <span style="flex:none">{ba_pair(58, 40, dark=True)}</span>
    <span style="flex:1;background:#F6F3EC;color:{INK};border-radius:11px;padding:12px 10px;
                 text-align:center;font-size:13px;font-weight:600;letter-spacing:-.02em;
                 display:flex;align-items:center;justify-content:center;gap:5px;
                 margin-bottom:12px">지금 열어보기
      <span style="color:{INK2}">{ic(CHEV, 11, '2.5')}</span></span>
  </div>
</div>'''


# ── 확정안 · 어두운 카드를 흐린 홈 위에 얹는다 ───────────────────────
#   B안의 "특별한 것이 왔다"는 무게는 살리되, 전체 화면은 과했다.
#   뒤에 홈이 비치면 '어디에 있는지'를 잃지 않으면서도 시선은 카드에 붙는다.
def modal_dark():
    return f'''<div data-ar style="position:absolute;inset:0;z-index:60;display:flex;
              align-items:center;justify-content:center;padding:0 24px;
              background:rgba(18,24,20,.55)">
  <div style="width:100%;border-radius:22px;padding:26px 22px 20px;display:flex;
              flex-direction:column;align-items:center;overflow:hidden;position:relative;
              background:radial-gradient(120% 70% at 50% 0%,#31503D 0%,#1E2A22 62%,#18211B 100%);
              box-shadow:0 30px 64px -20px rgba(10,16,12,.75)">

    <span style="position:relative;width:66px;height:66px;border-radius:50%;
                 background:rgba(255,255,255,.08);display:flex;align-items:center;
                 justify-content:center;color:#EDEAE3">
      <span style="position:absolute;inset:-11px;border-radius:50%;
                   background:rgba(255,255,255,.045)"></span>
      {ic(ENVELOPE, 29, '1.5')}
      <span style="position:absolute;top:4px;right:4px;width:12px;height:12px;border-radius:50%;
                   background:{BRONZE};border:2.5px solid #23312A"></span></span>

    <span style="margin-top:17px;font-size:9px;font-weight:700;letter-spacing:.22em;
                 color:rgba(214,177,120,.95);{NUM}">MONTHLY FEEDBACK · 7월호</span>

    <span style="margin-top:10px;font-size:19px;font-weight:600;letter-spacing:-.035em;color:#fff;
                 text-align:center;line-height:1.4">정기 피드백이 도착했어요</span>

    <span style="margin-top:15px;width:100%;padding:12px 14px;border-radius:12px;
                 background:rgba(255,255,255,.075);display:flex;flex-direction:column;
                 align-items:center;gap:9px">
      <span style="display:flex;align-items:baseline;gap:8px">
        <span style="font-size:15px;font-weight:700;color:{BRONZE};{NUM}">No.06</span>
        <span style="font-size:13px;font-weight:500;color:rgba(255,255,255,.92);
                     letter-spacing:-.02em">톱에서 왼팔 각 잡기</span></span>
      {ba_pair(62, 42, dark=True)}
    </span>

    <span style="margin-top:13px;font-size:11px;font-weight:500;color:rgba(255,255,255,.5);
                 text-align:center;line-height:1.65">
      이도형 프로가 이번 달 영상 12개를 보고<br>3주 프로그램을 만들었어요</span>

    <span data-ar-open style="margin-top:17px;width:100%;background:#F6F3EC;color:{INK};
                 border-radius:13px;padding:15px;text-align:center;font-size:14.5px;
                 font-weight:600;letter-spacing:-.02em;display:flex;align-items:center;
                 justify-content:center;gap:6px">리포트 열기
      <span style="color:{INK2}">{ic(CHEV, 12, '2.4')}</span></span>
    <span data-ar-later style="margin-top:12px;font-size:12.5px;font-weight:500;
                 color:rgba(255,255,255,.48)">나중에 볼게요</span>
  </div>
</div>'''
