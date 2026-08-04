# -*- coding: utf-8 -*-
"""6번 · 없던 상태 화면 두 가지.

   uf  업로드 실패 — 지금까지 앱에 '실패'가 없었다. 안 되면 아무 말도 없거나
       그냥 성공한 척했다. 실패 화면이 할 일은 셋이다.
         ① 무엇이 안 됐는지  (파일 이름까지)
         ② 왜 그런지         (짐작이 아니라 확인 가능한 이유)
         ③ 지금 뭘 하면 되나  (다시 시도 / 나중에 / 도움)

   ge  스윙 갤러리 · 아직 아무것도 없음 — 신규 회원이 처음 보는 화면인데
       지금은 남의 스윙 12개가 차 있다. 빈 화면이 할 일은 '뭘 하면 채워지나'를
       말하는 것이다. 슬픈 일러스트를 넣는 게 아니다.
"""
import json, os
import split_concepts as SC
import lesson_screens as L

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = SC.BG, SC.CARD, SC.FOREST
INK, INK2, INK3 = SC.INK, SC.INK2, SC.INK3
LINE, SAND, SOFT = SC.LINE, SC.SAND, SC.SOFT
NUM, ic, cap = SC.NUM, SC.ic, SC.cap
FRAME, BURGER, LEFT = SC.FRAME, SC.BURGER, SC.LEFT

WARN = ('<path d="M12 4.5 21 19H3z"></path>'
        '<path d="M12 10v4M12 16.6v.1"></path>')
RETRY = ('<path d="M20 12a8 8 0 1 1-2.6-5.9"></path><path d="M20 4v5h-5"></path>')
CAM = ('<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
       '<path d="m16 11 5-3v8l-5-3z"></path>')
PLUS = '<path d="M12 5v14M5 12h14"></path>'


def topbar(title):
    return (f'<div style="flex:none;height:52px;background:{BG};display:flex;align-items:center;'
            f'gap:6px;padding:0 12px">'
            f'<span data-st-back style="width:32px;height:32px;display:flex;align-items:center;'
            f'justify-content:center;color:{INK}">{ic(LEFT, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:17px;font-weight:700;letter-spacing:-.03em;'
            f'color:{INK}">{title}</b><span style="width:32px"></span></div>')


# ── 업로드 실패 ──────────────────────────────────────────────────────
def scr_uf():
    def reason(t, d):
        return (f'<div style="display:flex;gap:9px;padding:9px 0">'
                f'<span style="flex:none;width:4px;height:4px;border-radius:50%;'
                f'background:{INK3};margin-top:7px"></span>'
                f'<span style="flex:1;display:flex;flex-direction:column;gap:2px">'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK}">{t}</span>'
                f'<span style="font-size:11.5px;font-weight:400;color:{INK2};'
                f'line-height:1.6">{d}</span></span></div>')

    reasons = ''.join(reason(*r) for r in [
        ('영상이 너무 길어요', '2분이 넘으면 못 올려요. 스윙 앞뒤만 잘라서 다시 올려주세요.'),
        ('와이파이가 끊겼어요', '올리는 중에 연결이 끊기면 처음부터 다시 올라가요.'),
        ('저장 공간이 찼어요', '휴대폰이 아니라 저희 쪽 문제일 수 있어요. 그땐 아래로 알려주세요.'),
    ])

    return f'''<div style="{FRAME}">
  {SC.statusbar()}
  {topbar('올리기 실패')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:8px 16px 18px;display:flex;flex-direction:column">

    <div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:15px;
                padding:18px 16px 16px;display:flex;flex-direction:column;align-items:center">
      <span style="width:46px;height:46px;border-radius:50%;background:rgba(192,57,43,.10);
                   color:#A6402D;display:flex;align-items:center;justify-content:center">
        {ic(WARN, 22, '1.8')}</span>
      <span style="margin-top:13px;font-size:16px;font-weight:700;letter-spacing:-.025em;
                   color:{INK};text-align:center">영상을 못 올렸어요</span>
      <span style="margin-top:7px;font-size:12px;font-weight:400;color:{INK2};
                   text-align:center;line-height:1.65">
        올리다가 58%에서 멈췄어요.<br>기록은 그대로 있으니 영상만 다시 올리면 돼요.</span>
      <span style="margin-top:13px;background:{SAND};border-radius:9px;padding:8px 12px;
                   font-size:11.5px;font-weight:600;color:{INK2};{NUM}">드라이버_0722.mp4 · 84MB</span>
    </div>

    <div style="flex:none;padding-top:20px">{cap('이럴 때 그래요')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:14px;
                  padding:6px 15px 8px">{reasons}</div>
    </div>

    <div style="flex:1;min-height:16px"></div>

    <span data-uf-retry style="flex:none;background:{FOREST};color:#fff;border-radius:14px;
          padding:16px;text-align:center;font-size:14.5px;font-weight:600;letter-spacing:-.02em;
          display:flex;align-items:center;justify-content:center;gap:8px">
      <span style="color:rgba(255,255,255,.9);display:flex">{ic(RETRY, 15, '2')}</span>
      다시 올리기</span>
    <span data-uf-later style="flex:none;margin-top:9px;padding:13px;text-align:center;
          font-size:12.5px;font-weight:500;color:{INK2}">나중에 할게요</span>
    <span data-uf-help style="flex:none;margin-top:4px;padding:9px;text-align:center;
          font-size:11.5px;font-weight:500;color:{INK3}">계속 안 되면 문의하기</span>
  </div>
</div>'''


# ── 갤러리 · 아직 비어 있음 ──────────────────────────────────────────
def scr_ge():
    def step(n, t, d):
        return (f'<div style="display:flex;gap:11px;padding:10px 0">'
                f'<span style="flex:none;width:22px;height:22px;border-radius:50%;background:{SOFT};'
                f'color:{FOREST};display:flex;align-items:center;justify-content:center;'
                f'font-size:10.5px;font-weight:700;{NUM}">{n}</span>'
                f'<span style="flex:1;display:flex;flex-direction:column;gap:2px">'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK}">{t}</span>'
                f'<span style="font-size:11.5px;font-weight:400;color:{INK2};'
                f'line-height:1.6">{d}</span></span></div>')

    steps = ''.join(step(*s) for s in [
        ('1', '스윙을 한 번 찍어요', '정면이든 측면이든 한 각도만 있으면 돼요.'),
        ('2', '여기에 올려요', '올린 영상은 날짜별로 쌓여요.'),
        ('3', '나중에 나란히 봐요', '한 달 전 스윙과 오늘 스윙을 붙여서 볼 수 있어요.'),
    ])

    return f'''<div style="{FRAME}">
  {SC.statusbar()}
  <div style="flex:none;background:{BG};display:flex;align-items:center;gap:11px;height:54px;padding:0 16px">
    <span style="color:{INK}">{ic(BURGER, 20, '1.9')}</span>
    <b style="flex:1;text-align:center;font-size:15px;font-weight:700;letter-spacing:-.03em;
              color:{INK};margin-right:31px">스윙 갤러리</b></div>

  <div style="flex:1;overflow-y:auto;background:{BG};padding:10px 16px 18px;display:flex;flex-direction:column">

    <div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:16px;
                padding:26px 18px 22px;display:flex;flex-direction:column;align-items:center">
      <span style="width:52px;height:52px;border-radius:15px;background:{SOFT};color:{FOREST};
                   display:flex;align-items:center;justify-content:center">{ic(CAM, 24, '1.6')}</span>
      <span style="margin-top:14px;font-size:16px;font-weight:700;letter-spacing:-.025em;
                   color:{INK}">아직 올린 스윙이 없어요</span>
      <span style="margin-top:7px;font-size:12px;font-weight:400;color:{INK2};
                   text-align:center;line-height:1.7">
        첫 영상을 올리면 여기에 쌓여요.<br>많이 쌓일수록 프로가 더 정확하게 봐줍니다.</span>
      <span data-ge-upload style="margin-top:17px;width:100%;background:{FOREST};color:#fff;
            border-radius:13px;padding:15px;text-align:center;font-size:14px;font-weight:600;
            letter-spacing:-.02em;display:flex;align-items:center;justify-content:center;gap:7px">
        <span style="color:rgba(255,255,255,.9);display:flex">{ic(PLUS, 15, '2.4')}</span>
        첫 스윙 올리기</span>
    </div>

    <div style="flex:none;padding-top:22px">{cap('어떻게 쓰나요')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:14px;
                  padding:8px 15px 10px">{steps}</div>
    </div>

    <div style="flex:none;margin-top:16px;background:{SAND};border-radius:12px;padding:13px 14px;
                display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:11.5px;font-weight:400;color:{INK2};line-height:1.6">
        찍는 게 어렵다면 촬영 방법부터 볼까요?</span>
      <span data-ge-guide style="flex:none;font-size:11.5px;font-weight:700;color:{FOREST}">
        촬영 가이드 ›</span>
    </div>
  </div>
  {L.bottom_nav('스윙')}
</div>'''


SCREENS = [('uf', '업로드 실패', '상태', scr_uf()),
           ('ge', '스윙 갤러리 · 비어 있음', '상태', scr_ge())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, grp, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'state_screens.py', 'title': title,
                   'group': grp, 'html': html, 'holes': False}
        print(f'  {sid}  {title:24} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('e2') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
