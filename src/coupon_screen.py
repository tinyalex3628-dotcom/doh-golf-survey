# -*- coding: utf-8 -*-
"""쿠폰함(cp) — 오프라인 레슨 할인권 + 스윙 스코어 걷어내기.

   ① 스윙 스코어 삭제
      `74 (+6)` 같은 점수는 무엇으로 매기는지 정할 수 없는 숫자였다.
      못 믿을 숫자 하나가 화면 전체의 신뢰를 깎는다. 자리째 없앤다.

   ② 쿠폰함
      '내 쿠폰함 2장'은 눌러도 토스트만 떴다. 오프라인 레슨 할인권을
      등급별로 매달 준다는 방침이 정해졌으니 실물 화면을 만든다.
      쿠폰은 앱을 오프라인 레슨으로 잇는 유일한 통로다.
"""
import json, os, re
import split_concepts as SC

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = 'var(--ns-bg)', 'var(--ns-card)', 'var(--ns-green)'
INK, INK2, INK3 = 'var(--ns-ink)', 'var(--ns-ink2)', 'var(--ns-ink3)'
LINE, SAND, SOFT = 'var(--ns-line)', 'var(--ns-sand)', 'var(--ns-soft)'
BRONZE = 'var(--ns-bronze)'
NUM = 'font-family:var(--font-num)'
FRAME, LEFT = SC.FRAME, SC.LEFT
ic = SC.ic

TICKET = ('<path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.6a2 2 0 0 0 0 3.8v1.6a2 2 0 0 1-2 2H6'
          'a2 2 0 0 1-2-2v-1.6a2 2 0 0 0 0-3.8z"></path><path d="M13 6.5v11"></path>')


def topbar(title):
    return (f'<div style="flex:none;height:52px;background:{BG};display:flex;align-items:center;'
            f'gap:6px;padding:0 12px">'
            f'<span data-cp-back style="width:32px;height:32px;display:flex;align-items:center;'
            f'justify-content:center;color:{INK}">{ic(LEFT, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:16px;font-weight:700;letter-spacing:-.03em;'
            f'color:{INK}">{title}</b><span style="width:32px"></span></div>')


def cap(t, right=''):
    r = (f'<span style="font-size:10.5px;font-weight:500;color:{INK3}">{right}</span>' if right else '')
    return (f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
            f'padding:0 1px;margin-bottom:9px">'
            f'<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;'
            f'color:{INK3}">{t}</span>{r}</div>')


def ticket(title, sub, until, tag, soon=False):
    edge = BRONZE if soon else FOREST
    return (
        f'<div data-cp-ticket style="display:flex;background:{CARD};border:1px solid {LINE};'
        f'border-radius:14px;overflow:hidden">'
        f'<span style="flex:none;width:5px;background:{edge}"></span>'
        f'<span style="flex:1;min-width:0;padding:14px 15px;display:flex;flex-direction:column;gap:4px">'
        f'<span style="display:flex;align-items:center;gap:7px">'
        f'<span style="font-size:9px;font-weight:700;letter-spacing:.14em;color:{edge};{NUM}">{tag}</span></span>'
        f'<span style="font-size:15px;font-weight:700;letter-spacing:-.03em;color:{INK}">{title}</span>'
        f'<span style="font-size:11.5px;font-weight:400;color:{INK2};line-height:1.55">{sub}</span>'
        f'<span style="margin-top:5px;display:flex;align-items:center;gap:6px">'
        f'<span style="font-size:11px;font-weight:600;color:{edge};{NUM}">{until}</span></span>'
        f'</span>'
        f'<span style="flex:none;display:flex;align-items:center;padding:0 14px 0 6px">'
        f'<span data-cp-use style="background:{FOREST};color:#FFFFFF;border-radius:10px;'
        f'padding:10px 13px;font-size:12px;font-weight:600;white-space:nowrap">쓰기</span></span>'
        f'</div>')


def used(rows):
    body = ''.join(
        f'<div style="display:flex;align-items:baseline;gap:10px;padding:9px 0">'
        f'<span style="flex:1;font-size:12px;font-weight:500;color:{INK3};'
        f'text-decoration:line-through">{t}</span>'
        f'<span style="flex:none;font-size:11px;font-weight:500;color:{INK3}">{d}</span></div>'
        for t, d in rows)
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;'
            f'padding:5px 15px 7px">{body}</div>')


def tiers():
    ROWS = [('무료', '없음', False), ('Basic', '없음', False),
            ('Coaching', '매달 1장 · 10% 할인', False), ('Elite', '매달 1장 · 10% 할인', True)]
    body = ''.join(
        f'<div data-cp-tier="{n}" style="display:flex;align-items:baseline;gap:10px;padding:8px 0">'
        f'<span style="flex:none;width:66px;font-size:11.5px;font-weight:{"700" if on else "500"};'
        f'color:{FOREST if on else INK3}">{n}</span>'
        f'<span style="flex:1;font-size:11.5px;font-weight:{"600" if on else "400"};'
        f'color:{INK if on else INK2}">{v}</span></div>' for n, v, on in ROWS)
    return (f'<div style="background:{SAND};border-radius:13px;padding:6px 14px 8px">{body}</div>')


def scr_cp():
    return f'''<div style="{FRAME}">
  {SC.statusbar()}
  {topbar('쿠폰함')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:8px 16px 20px;display:flex;flex-direction:column">

    <div data-cp-live style="flex:none">{cap('쓸 수 있는 쿠폰', '2장')}
      <div style="display:flex;flex-direction:column;gap:9px">
        {ticket('오프라인 레슨 10% 할인', '이도형 프로 · 1회 레슨 · 지점 5곳', '8월 31일까지', '8월 쿠폰')}
        {ticket('오프라인 레슨 10% 할인', '이도형 프로 · 1회 레슨 · 지점 5곳', '8월 15일까지 · 곧 만료', '7월 쿠폰', soon=True)}
      </div>
    </div>

    <div data-cp-none style="display:none;flex:none;background:{CARD};border:1px solid {LINE};
                border-radius:15px;padding:24px 18px;flex-direction:column;align-items:center">
      <span style="width:46px;height:46px;border-radius:13px;background:{SOFT};color:{FOREST};
                   display:flex;align-items:center;justify-content:center">{ic(TICKET, 22, '1.6')}</span>
      <span style="margin-top:13px;font-size:15px;font-weight:700;letter-spacing:-.025em;
                   color:{INK}">아직 받은 쿠폰이 없어요</span>
      <span data-cp-none-t style="margin-top:7px;font-size:12px;font-weight:400;color:{INK2};
                   text-align:center;line-height:1.65">
        Coaching 플랜부터 매달 오프라인 레슨<br>할인권을 한 장씩 드려요.</span>
      <span data-cp-plan style="margin-top:15px;width:100%;background:{FOREST};color:#FFFFFF;
            border-radius:12px;padding:14px;text-align:center;font-size:13.5px;font-weight:600">
        구독 플랜 보기</span>
    </div>

    <div style="flex:none;padding-top:22px">{cap('다 쓴 쿠폰')}
      {used([('오프라인 레슨 10% 할인', '7월 12일 사용'),
             ('오프라인 레슨 10% 할인', '6월 30일 만료')])}
    </div>

    <div style="flex:none;padding-top:22px">{cap('등급별로 드리는 쿠폰')}
      {tiers()}
      <span style="display:block;margin-top:10px;font-size:11px;font-weight:400;color:{INK3};
                   line-height:1.6">매달 1일에 자동으로 들어와요. 그 달 안에 안 쓰면 다음 달 15일까지만
        더 쓸 수 있고, 그 뒤엔 사라져요.</span>
    </div>

    <div style="flex:1;min-height:18px"></div>

    <span data-cp-book style="flex:none;border:1px solid {LINE};background:{CARD};border-radius:13px;
          padding:15px;text-align:center;font-size:13.5px;font-weight:600;color:{INK2}">
      오프라인 레슨 지점 보기</span>
  </div>
</div>'''


# ── 스윙 스코어 걷어내기 ─────────────────────────────────────────────
def strip_score(by):
    """`74 (+6)` 는 무엇으로 매기는 점수인지 정할 수 없는 숫자였다.
       못 믿을 숫자 하나가 화면 전체의 신뢰를 깎으므로 자리째 없앤다."""
    log = []

    # ① 리포트 카드 3칸 중 첫 칸(74 +6 스윙 스코어) + 뒤따르는 구분선
    h = by['2f']['html']
    m = re.search(r'<span data-dc-tpl="66".*?스윙 스코어</span>\s*</span>\s*'
                  r'<span data-dc-tpl="71"[^>]*></span>\s*', h, re.S)
    assert m, '2f 스코어 칸'
    h = h[:m.start()] + h[m.end():]
    log.append('  2f  스윙 스코어 칸 제거 (3칸 → 2칸)')

    # ② 지난 레슨 목록의 +5 / +4 / +7
    h, n = re.subn(r'<span data-dc-tpl="92"[^>]*>\s*<span class="sc-interp">\+\d+</span>\s*</span>\s*',
                   '', h)
    assert n == 3, f'지난 레슨 점수 {n}건'
    log.append(f'  2f  지난 레슨 점수 {n}개 제거')
    by['2f']['html'] = h

    # ③ 알림함 문구
    h = by['nt']['html']
    old = '7월 22일 드라이버 · 스윙스코어 74점'
    assert h.count(old) == 1
    by['nt']['html'] = h.replace(old, '7월 22일 드라이버 · 먼저 고칠 것 1가지')
    log.append('  nt  알림 문구에서 스코어 제거')

    # ④ 쿠폰 개수 배지 — 등급을 따라야 한다
    for sid in ('2e', '2h'):
        h = by[sid]['html']
        i = h.find('쿠폰함')
        seg = h[i:i + 700]
        assert seg.count('>2장<') == 1, f'{sid} 쿠폰 배지'
        by[sid]['html'] = h[:i] + seg.replace('>2장<', ' data-pl-coupons>2장<', 1) + h[i + 700:]
        log.append(f'  {sid}  쿠폰 개수 표식')
    return log


SCREENS = [('cp', '쿠폰함 · 오프라인 레슨 할인권', '사전 · 구독', scr_cp())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for line in strip_score(by):
        print(line)
    for sid, title, grp, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'coupon_screen.py', 'title': title,
                   'group': grp, 'html': html, 'holes': False}
        print(f'  {sid}  {title:26} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('19'), sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
