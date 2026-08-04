# -*- coding: utf-8 -*-
"""레슨기록 · 프로 한마디 목록 (새 화면 2i).

   코멘트는 스윙에 붙어 있다 — 그래서 떼지 않는다.
   각 줄에 그 스윙 썸네일을 붙여 두면, 목록으로 모아 봐도 맥락이 안 끊긴다.
   같은 데이터를 '스윙 기준'(갤러리 → 스윙 상세)과 '말 기준'(여기)으로 볼 뿐이다.
"""
import json, os
import split_concepts as SC

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = SC.BG, SC.CARD, SC.FOREST
INK, INK2, INK3, INK4 = SC.INK, SC.INK2, SC.INK3, SC.INK4
LINE, SAND, BRONZE, SOFT, BR_SOFT = SC.LINE, SC.SAND, SC.BRONZE, SC.SOFT, SC.BR_SOFT
NUM, ic, thumb, cap = SC.NUM, SC.ic, SC.thumb, SC.cap
BURGER, CHEV, BUBBLE = SC.BURGER, SC.CHEV, SC.BUBBLE
PHOTO = ('<rect x="3.5" y="5" width="17" height="14" rx="2.5"></rect>'
         '<circle cx="9" cy="10" r="1.5"></circle><path d="m5 17 4.5-4.5L13 16l3-2.5 3 3.5"></path>')


def seg(active):
    """레슨기록 상단 세그먼트 — 정규레슨 | 프로 한마디."""
    def pill(label, cnt, on):
        st = (f'background:{FOREST};color:#fff;font-weight:700' if on
              else f'background:transparent;color:{INK2};font-weight:500')
        bs = 'rgba(255,255,255,.2)' if on else '#E4DECE'
        bc = '#fff' if on else INK3
        return (f'<span style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;'
                f'padding:9px 6px;border-radius:8px;font-size:13px;letter-spacing:-.02em;'
                f'white-space:nowrap;{st}">{label}'
                f'<span style="min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:flex;'
                f'align-items:center;justify-content:center;{NUM};font-size:10.5px;font-weight:700;'
                f'background:{bs};color:{bc}">{cnt}</span></span>')
    return (f'<div style="display:flex;background:#F1EDE4;border-radius:10px;padding:3px;gap:2px">'
            f'{pill("정규레슨", 6, active == "정규레슨")}'
            f'{pill("프로 한마디", 24, active == "프로 한마디")}</div>')


def header(seg_html):
    return f'''<div style="flex:none;background:{CARD};border-bottom:1px solid #EFEBE2;padding:6px 16px 13px">
    <div style="display:flex;align-items:center;gap:11px;height:44px">
      <span style="color:{INK}">{ic(BURGER, 20, '1.9')}</span>
      <b style="font-size:19px;font-weight:700;letter-spacing:-.03em;color:{INK}">레슨기록</b></div>
    {seg_html}
  </div>'''


def bottom_nav(active='레슨기록'):
    """하단 5탭 — 스윙분석 → 스윙(갤러리가 첫 화면), 스윙기록 → 레슨기록."""
    items = [('홈', '<path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"></path>'),
             ('연습기록', '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect>'
                       '<path d="M8 3v4M16 3v4M8.5 13l2.5 2.5 4.5-4.5"></path>'),
             ('스윙', '<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
                    '<path d="m16 11 5-3v8l-5-3z"></path>'),
             ('레슨기록', '<rect x="3.5" y="4.5" width="17" height="6" rx="2"></rect>'
                       '<rect x="3.5" y="13.5" width="17" height="6" rx="2"></rect>'),
             ('마이', '<circle cx="12" cy="8.5" r="3.7"></circle><path d="M5 20a7 7 0 0 1 14 0"></path>')]
    cells = ''
    for nm, d in items:
        on = nm == active
        pill = f'background:{SOFT};border-radius:10px;' if on else ''
        # 'flex: 1' 공백 유지 — wireCommon 의 하단 탭 매칭이 이 형태를 본다
        cells += (f'<span style="flex: 1;display:flex;flex-direction:column;align-items:center;gap:5px;'
                  f'color:{FOREST if on else INK4};padding:7px 0 5px;{pill}">{ic(d, 19, "1.7")}'
                  f'<span style="font-size:11px;font-weight:{600 if on else 500}">{nm}</span></span>')
    return (f'<div style="flex:none;height:62px;background:{CARD};border-top:1px solid {LINE};'
            f'display:flex;align-items:flex-start;padding:5px 6px 0">{cells}</div>')


ROWS = [
    ('7월 22일 (수)', '오늘', '드라이버', 22,
     '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 영상 0:07 보시면…', True, True),
    ('7월 15일 (화)', '7일 전', '7번 아이언', 15,
     '하체부터 시작하는 건 좋아졌어요. 근데 마지막에 다시 팔로 치게 되는 게 보입니다.', True, False),
    ('7월 8일 (화)', '2주 전', '7번 아이언', 8,
     '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요. 지금은 조금 길게 잡고 계세요.', False, False),
]


def row(date, ago, club, day, text, photo, new):
    badge = (f'<span style="font-size:9px;font-weight:700;letter-spacing:.06em;color:{FOREST};'
             f'background:rgba(33,64,47,.12);border-radius:4px;padding:2px 5px">NEW</span>' if new else '')
    photo_ic = ic(PHOTO, 10, '2')
    ph = (f'<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;'
          f'color:{INK4};{NUM}">{photo_ic}사진 1</span>') if photo else ''
    return f'''<div data-cmrow="{day}" style="background:{CARD};border:1px solid {LINE};border-radius:13px;
              padding:12px 13px;display:flex;gap:11px;margin-bottom:8px">
    {thumb('0:27', 54, 54, 9)}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px;font-weight:600;color:{INK};letter-spacing:-.02em">{date}</span>
        {badge}<span style="flex:1"></span>
        <span style="font-size:10px;font-weight:500;color:{INK4};{NUM}">{ago}</span></div>
      <div style="font-size:12px;font-weight:500;color:{INK2};line-height:1.65;
                  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
        {text}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:10px;font-weight:600;color:{BRONZE};background:{BR_SOFT};
                     border-radius:5px;padding:2px 6px">{club}</span>{ph}</div>
    </div>
  </div>'''


def scr_2i():
    quota = f'''<div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:13px;
              padding:13px 14px;display:flex;align-items:center;gap:11px;margin-bottom:18px" data-cm-quota>
    <span style="flex:none;width:30px;height:30px;border-radius:9px;background:{BR_SOFT};color:{BRONZE};
                 display:flex;align-items:center;justify-content:center">{ic(BUBBLE, 15, '1.8')}</span>
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">이번 달 프로 한마디</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK3}">2회 받음 · 3회 남음</span></span>
    <span style="flex:none;display:flex;gap:3px">''' + ''.join(
        f'<span style="width:14px;height:4px;border-radius:99px;'
        f'background:{BRONZE if i < 2 else SAND}"></span>' for i in range(5)) + '</span></div>'

    rows = ''.join(row(*r) for r in ROWS)
    older = f'''<div style="flex:none;margin-top:14px">{cap('6월', '5회')}
    <div data-cm-older style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:13px 14px;
                display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:12px;font-weight:500;color:{INK2}">6월에 받은 한마디 5개</span>
      <span style="color:{INK4}">{ic(CHEV, 12, '2.4')}</span></div></div>'''

    return f'''<div style="{SC.FRAME}">
  {SC.statusbar()}
  {header(seg('프로 한마디'))}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:14px 16px 18px;display:flex;flex-direction:column">
    {quota}
    <div style="flex:none">{cap('7월', '3회')}{rows}</div>
    {older}
  </div>
  {bottom_nav()}
</div>'''


SCREENS = [('2i', '레슨기록 — 프로 한마디', '', scr_2i())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, group, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'lesson_screens.py', 'title': title,
                   'group': group, 'html': html, 'holes': False}
        print(f'  {sid}  {title:22} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('2f') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')

    # 하단 탭 교체용으로 런타임·수술 스크립트가 갖다 쓴다
    json.dump({'nav_' + k: bottom_nav(k) for k in ['홈', '연습기록', '스윙', '레슨기록', '마이']},
              open(os.path.join(HERE, 'nav-parts.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('nav-parts.json (5탭 × 5상태)')
