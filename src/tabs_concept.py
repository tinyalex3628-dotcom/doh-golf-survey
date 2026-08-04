# -*- coding: utf-8 -*-
"""레슨기록 탭 구조 3안 + 코멘트 탭(새 화면) + 정규레슨 C1·C2 합본."""
import json, os
import split_concepts as SC
import final_parts as F

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = SC.BG, SC.CARD, SC.FOREST
INK, INK2, INK3, INK4 = SC.INK, SC.INK2, SC.INK3, SC.INK4
LINE, SAND, BRONZE, SOFT = SC.LINE, SC.SAND, SC.BRONZE, SC.SOFT
BR_SOFT, NUM = SC.BR_SOFT, SC.NUM
ic, thumb, cap = SC.ic, SC.thumb, SC.cap
BURGER, CHEV, ENVELOPE, BUBBLE = SC.BURGER, SC.CHEV, SC.ENVELOPE, SC.BUBBLE
PHOTO = ('<rect x="3.5" y="5" width="17" height="14" rx="2.5"></rect>'
         '<circle cx="9" cy="10" r="1.5"></circle><path d="m5 17 4.5-4.5L13 16l3-2.5 3 3.5"></path>')


def seg(items, active):
    """세그먼트 탭. 3칸이면 360px 안에서 칸당 ~107px 이라 글자·배지를 조금 줄인다."""
    n = len(items)
    fs = 12.5 if n >= 3 else 13
    cells = ''
    for label, cnt in items:
        on = label == active
        st = (f'background:{FOREST};color:#fff;font-weight:700' if on
              else f'background:transparent;color:{INK2};font-weight:500')
        bs = 'rgba(255,255,255,.2)' if on else '#E4DECE'
        bc = '#fff' if on else INK3
        cells += (f'<span style="flex:1;min-width:0;display:flex;align-items:center;justify-content:center;'
                  f'gap:5px;padding:9px 4px;border-radius:8px;font-size:{fs}px;letter-spacing:-.02em;'
                  f'white-space:nowrap;{st}">{label}'
                  f'<span style="min-width:17px;height:17px;padding:0 5px;border-radius:999px;display:flex;'
                  f'align-items:center;justify-content:center;{NUM};font-size:10px;font-weight:700;'
                  f'background:{bs};color:{bc}">{cnt}</span></span>')
    return (f'<div style="display:flex;background:#F1EDE4;border-radius:10px;padding:3px;gap:2px">'
            f'{cells}</div>')


def head(title, segbar):
    return f'''<div style="flex:none;background:{CARD};border-bottom:1px solid #EFEBE2;padding:6px 16px 13px">
    <div style="display:flex;align-items:center;gap:11px;height:44px">
      <span style="color:{INK}">{ic(BURGER, 20, '1.9')}</span>
      <b style="font-size:19px;font-weight:700;letter-spacing:-.03em;color:{INK}">{title}</b></div>
    {segbar}
  </div>'''


def bottom(active='레슨기록'):
    """하단 탭 — '스윙기록' 자리를 '레슨기록' 으로."""
    items = [('홈', '<path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"></path>'),
             ('연습기록', '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect>'
                       '<path d="M8 3v4M16 3v4M8.5 13l2.5 2.5 4.5-4.5"></path>'),
             ('레슨기록', '<rect x="3.5" y="4.5" width="17" height="6" rx="2"></rect>'
                       '<rect x="3.5" y="13.5" width="17" height="6" rx="2"></rect>'),
             ('스윙분석', '<rect x="3" y="6" width="13" height="12" rx="2.5"></rect>'
                       '<path d="m16 11 5-3v8l-5-3z"></path>'),
             ('마이', '<circle cx="12" cy="8.5" r="3.7"></circle><path d="M5 20a7 7 0 0 1 14 0"></path>')]
    cells = ''
    for nm, d in items:
        on = nm == active
        pill = f'background:{SOFT};border-radius:10px;' if on else ''
        cells += (f'<span style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;'
                  f'color:{FOREST if on else INK4};padding:7px 0 5px;{pill}">{ic(d, 19, "1.7")}'
                  f'<span style="font-size:11px;font-weight:{600 if on else 500}">{nm}</span></span>')
    return (f'<div style="flex:none;height:62px;background:{CARD};border-top:1px solid {LINE};'
            f'display:flex;align-items:flex-start;padding:5px 6px 0">{cells}</div>')


# ── 코멘트 탭 본문 — 이번 제안의 진짜 새 화면 ──────────────────────────
CM_ROWS = [
    ('7월 22일 (수)', '오늘', '드라이버',
     '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 영상 0:07 보시면…', True, True),
    ('7월 15일 (화)', '7일 전', '7번 아이언',
     '하체부터 시작하는 건 좋아졌어요. 근데 마지막에 다시 팔로 치게 되는 게 보입니다.', True, False),
    ('7월 8일 (화)', '2주 전', '7번 아이언',
     '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요. 지금은 조금 길게 잡고 계세요.', False, False),
]


def cm_row(date, ago, club, text, photo, new):
    badge = (f'<span style="font-size:9px;font-weight:700;letter-spacing:.06em;color:{FOREST};'
             f'background:rgba(33,64,47,.12);border-radius:4px;padding:2px 5px">NEW</span>' if new else '')
    # f-string 안에 역슬래시를 못 넣으니 아이콘을 먼저 만들어 둔다
    photo_ic = ic(PHOTO, 10, '2')
    ph = (f'<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;'
          f'color:{INK4};{NUM}">{photo_ic}사진 1</span>') if photo else ''
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:12px 13px;
              display:flex;gap:11px;margin-bottom:8px">
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


def comment_tab(segbar):
    quota = f'''<div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:13px;
              padding:13px 14px;display:flex;align-items:center;gap:11px;margin-bottom:18px">
    <span style="flex:none;width:30px;height:30px;border-radius:9px;background:{BR_SOFT};color:{BRONZE};
                 display:flex;align-items:center;justify-content:center">{ic(BUBBLE, 15, '1.8')}</span>
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em">이번 달 프로 한마디</span>
      <span style="font-size:10.5px;font-weight:500;color:{INK3}">2회 받음 · 3회 남음</span></span>
    <span style="flex:none;display:flex;gap:3px">
      {''.join(f'<span style="width:14px;height:4px;border-radius:99px;background:{BRONZE if i < 2 else SAND}"></span>' for i in range(5))}
    </span></div>'''
    rows = ''.join(cm_row(*r) for r in CM_ROWS)
    older = f'''<div style="flex:none;margin-top:14px">{cap('6월', '5회')}
    <div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:13px 14px;
                display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:12px;font-weight:500;color:{INK2}">6월에 받은 한마디 5개</span>
      <span style="color:{INK4}">{ic(CHEV, 12, '2.4')}</span></div></div>'''
    return f'''<div style="{SC.FRAME}">
  {SC.statusbar()}
  {head('레슨기록', segbar)}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:14px 16px 18px;display:flex;flex-direction:column">
    {quota}
    <div style="flex:none">{cap('7월', '3회')}{rows}</div>
    {older}
  </div>
  {bottom()}
</div>'''


SEG_A = [('정규레슨', 6), ('코멘트', 24), ('스윙기록', 12)]
SEG_B = [('스윙기록', 12), ('코멘트', 24), ('정규레슨', 6)]
SEG_C = [('정규레슨', 6), ('프로 한마디', 24)]

if __name__ == '__main__':
    out = {
        'segA_on_cm': seg(SEG_A, '코멘트'),
        'segA_on_fb': seg(SEG_A, '정규레슨'),
        'segA_on_sw': seg(SEG_A, '스윙기록'),
        'segB_on_sw': seg(SEG_B, '스윙기록'),
        'segC_on_fb': seg(SEG_C, '정규레슨'),
        'segC_on_cm': seg(SEG_C, '프로 한마디'),
        'cm_tab_A': comment_tab(seg(SEG_A, '코멘트')),
        'cm_tab_C': comment_tab(seg(SEG_C, '프로 한마디')),
        'bottom': bottom(),
    }
    json.dump(out, open(os.path.join(HERE, 'tabs-parts.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('탭 부품', len(out), '개')
