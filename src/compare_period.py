# -*- coding: utf-8 -*-
"""8번 · 기간별 스윙 비교.

   "얼마나 좋아졌나"를 점수로 말해주는 화면이 아니다.
   한 달 전 / 두 달 전 / 석 달 전 스윙을 가장 최근 스윙 옆에 놓아주고,
   달라진 걸 회원이 직접 보게 하는 것뿐이다.

   자동으로 같은 구간을 찾아 맞춰주는 건 지금 기술로 잘 안 된다.
   안 되는 걸 되는 척하면 첫 화면에서 신뢰를 잃는다. 그래서 팝업에
   "재생 위치는 직접 맞춰주세요"를 그대로 적었다.

   구성
     banner()  스윙 탭 분석 도구 줄 아래 한 줄 배너 — 이 기능의 유일한 입구
     modal()   기간 고르는 팝업 (화면 cg) — 흐린 스윙 탭 위에 뜬다
   목적지는 새 화면이 아니라 이미 있는 11 멀티스크린 비교다.
"""
CARD, FOREST, LINE, SOFT = 'var(--ns-card)', 'var(--ns-green)', 'var(--ns-line)', 'var(--ns-soft)'
INK, INK2, INK3 = 'var(--ns-ink)', 'var(--ns-ink2)', 'var(--ns-ink3)'
SAND, IVORY = 'var(--ns-sand)', 'var(--ns-ivory)'
NUM = "font-family:var(--font-num)"

# 데모 계정의 스윙 기록. r2 여정(3월~6월)과 갤러리(6월~7월)에 맞춰 잡았다.
LATEST = ('7월 22일', '7/22')
PERIODS = [                       # (개월, 제목, 날짜, 짧은 날짜, 그때 주제)
    ('1', '1개월 전', '6월 28일', '6/28', '톱에서 왼팔 각'),
    ('2', '2개월 전', '5월 24일', '5/24', '하체 리드'),
    ('3', '3개월 전', '4월 19일', '4/19', '아이언 뒤땅'),
]

# 화면 둘로 쪼갠 모양. 도구 줄의 '프로와 비교' 타일과 같은 아이콘을 쓰면
# 두 기능이 같은 것으로 읽혀서, 배너는 '되감기' 쪽으로 따로 잡았다.
CMP = ('<rect x="3" y="5" width="18" height="14" rx="2.5"></rect>'
       '<path d="M12 5v14"></path>')
BACKTIME = ('<path d="M3.6 12a8.4 8.4 0 1 0 2.5-6"></path>'
            '<path d="M3 4.5v5h5"></path><path d="M12 8.2v4.1l3 1.8"></path>')
CHEV = '<path d="m9 5 7 7-7 7"></path>'
INFO = '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 7.8v.1"></path>'


def ic(d, w=16, sw='1.8'):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" style="width:{w}px;height:{w}px;'
            f'display:block">{d}</svg>')


# ── 스윙 탭 배너 ────────────────────────────────────────────────────
def banner():
    """도구 타일 3칸 아래 한 줄. 타일을 4칸으로 쪼개면 설명 글자가 죽는다.
       그리고 이건 도구 하나가 아니라 이 앱이 파는 것 자체라 한 줄을 다 준다."""
    return (
        f'<span data-swcmp style="display:flex;align-items:center;gap:12px;background:{CARD};'
        f'border:1px solid {LINE};border-radius:13px;padding:13px 14px;margin-top:8px">'
        f'<span style="flex:none;width:34px;height:34px;border-radius:10px;background:{SOFT};'
        f'color:{FOREST};display:flex;align-items:center;justify-content:center">{ic(BACKTIME, 17)}</span>'
        f'<span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">'
        f'<span style="font-size:12.5px;font-weight:700;color:{INK};letter-spacing:-.02em">'
        f'그때와 지금 나란히 보기</span>'
        f'<span style="font-size:10.5px;font-weight:500;color:{INK3}">'
        f'한 달 전 스윙과 오늘 스윙을 한 화면에</span></span>'
        f'<span style="flex:none;color:{INK3}">{ic(CHEV, 12, "2.2")}</span></span>')


# ── 기간 고르는 팝업 ────────────────────────────────────────────────
def _period(mon, label, date, short, topic, on):
    bg = FOREST if on else CARD
    bd = FOREST if on else LINE
    c1 = '#FFFFFF' if on else INK
    c2 = 'rgba(255,255,255,.66)' if on else INK3
    return (f'<span data-cg-p="{mon}" data-on="{"1" if on else ""}" '
            f'style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;'
            f'gap:3px;background:{bg};border:1.4px solid {bd};border-radius:11px;padding:11px 4px 10px">'
            f'<span style="font-size:11.5px;font-weight:700;color:{c1};letter-spacing:-.02em;'
            f'white-space:nowrap">{label}</span>'
            f'<span style="font-size:10px;font-weight:500;color:{c2};{NUM};white-space:nowrap">'
            f'{date}</span></span>')


def modal():
    picks = ''.join(_period(*p, on=(p[0] == '1')) for p in PERIODS)
    return f'''<div data-cg style="position:absolute;inset:0;z-index:60;display:flex;
              align-items:center;justify-content:center;padding:0 24px;
              background:rgba(18,24,20,.5)">
  <div style="width:100%;background:{CARD};border-radius:21px;padding:24px 20px 18px;
              display:flex;flex-direction:column;align-items:center;
              box-shadow:0 28px 60px -20px rgba(12,18,14,.7)">

    <span style="width:50px;height:50px;border-radius:14px;background:{SOFT};color:{FOREST};
                 display:flex;align-items:center;justify-content:center">{ic(CMP, 23, '1.6')}</span>

    <span style="margin-top:14px;font-size:17px;font-weight:700;letter-spacing:-.03em;
                 color:{INK};text-align:center">그때와 지금, 나란히</span>
    <span style="margin-top:7px;font-size:12px;font-weight:400;color:{INK2};text-align:center;
                 line-height:1.65">두 스윙을 한 화면에 놓아드릴게요.<br>
      뭐가 달라졌는지는 직접 보시는 게 제일 정확해요.</span>

    <span style="margin-top:18px;width:100%;display:flex;flex-direction:column;gap:8px">
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:{INK3};
                   padding:0 2px">언제와 비교할까요</span>
      <span style="display:flex;gap:7px">{picks}</span>
    </span>

    <span style="margin-top:13px;width:100%;background:{SAND};border-radius:11px;padding:11px 13px;
                 display:flex;align-items:center;justify-content:center;gap:8px">
      <span data-cg-old style="font-size:11.5px;font-weight:600;color:{INK2};{NUM}">6월 28일</span>
      <span style="font-size:12px;color:{INK3}">↔</span>
      <span style="font-size:11.5px;font-weight:700;color:{FOREST};{NUM}">{LATEST[0]}</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK3}">· 가장 최근</span>
    </span>

    <span style="margin-top:11px;width:100%;display:flex;gap:7px;align-items:flex-start;
                 padding:0 2px">
      <span style="flex:none;color:{INK3};margin-top:1px">{ic(INFO, 13, '1.8')}</span>
      <span style="flex:1;font-size:10.5px;font-weight:400;color:{INK3};line-height:1.6">
        두 영상은 같은 시간축으로 같이 움직여요. 다만 같은 스윙 구간까지
        자동으로 찾아주진 못해서, 시작 지점만 직접 맞춰주세요.</span></span>

    <span data-cg-go style="margin-top:17px;width:100%;background:{FOREST};color:#FFFFFF;
                 border-radius:13px;padding:15px;text-align:center;font-size:14.5px;
                 font-weight:600;letter-spacing:-.02em">나란히 보기</span>
    <span data-cg-no style="margin-top:8px;padding:12px 16px;font-size:12.5px;font-weight:500;
                 color:{INK3}">다음에 볼게요</span>
  </div>
</div>'''
