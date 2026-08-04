# -*- coding: utf-8 -*-
"""약관 · 결제 · 해지 화면(tm) + 등급 표시 표식 박기.

   검수 9번에서 나온 것들:
     · 앱 전체에 '해지'라는 글자가 1:1 문의 화면 한 곳에만 있었다.
       월 79,000원 자동결제인데 끊는 법이 앱에 없으면 결제 버튼을 못 누른다.
     · '약관 및 정책'을 누르면 '준비 중이에요' 토스트만 떴다.
     · 마이·드로어가 등급을 무시하고 늘 Elite 로 보였다.
     · 같은 '이번 달'인데 영상 개수가 화면마다 12 / 18 / 4 였다.

   해지 화면은 붙잡는 화면이 아니라 알려주는 화면으로 짰다.
   '해지해도 받은 리포트는 계속 볼 수 있다'가 이 화면의 핵심이다 —
   내가 쌓은 게 사라지지 않는다는 걸 알아야 결제를 시작한다.
"""
import json, os
import split_concepts as SC

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = 'var(--ns-bg)', 'var(--ns-card)', 'var(--ns-green)'
INK, INK2, INK3 = 'var(--ns-ink)', 'var(--ns-ink2)', 'var(--ns-ink3)'
LINE, SAND, SOFT = 'var(--ns-line)', 'var(--ns-sand)', 'var(--ns-soft)'
NUM = 'font-family:var(--font-num)'
FRAME, LEFT = SC.FRAME, SC.LEFT
ic = SC.ic

CHEV = '<path d="m9 5 7 7-7 7"></path>'


def topbar(title):
    return (f'<div style="flex:none;height:52px;background:{BG};display:flex;align-items:center;'
            f'gap:6px;padding:0 12px">'
            f'<span data-tm-back style="width:32px;height:32px;display:flex;align-items:center;'
            f'justify-content:center;color:{INK}">{ic(LEFT, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:16px;font-weight:700;letter-spacing:-.03em;'
            f'color:{INK}">{title}</b><span style="width:32px"></span></div>')


def cap(t):
    return (f'<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:{INK3};'
            f'padding:0 1px;display:block;margin-bottom:9px">{t}</span>')


def kv(rows):
    body = ''.join(
        f'<div style="display:flex;align-items:baseline;gap:10px;padding:9px 0">'
        f'<span style="flex:none;width:74px;font-size:11.5px;font-weight:500;color:{INK3}">{k}</span>'
        f'<span style="flex:1;font-size:12.5px;font-weight:600;color:{INK};'
        f'line-height:1.5">{v}</span></div>' for k, v in rows)
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;'
            f'padding:5px 15px 7px">{body}</div>')


def facts(rows):
    body = ''.join(
        f'<div style="display:flex;gap:9px;padding:9px 0">'
        f'<span style="flex:none;width:5px;height:5px;border-radius:50%;background:{FOREST};'
        f'margin-top:7px"></span>'
        f'<span style="flex:1;display:flex;flex-direction:column;gap:2px">'
        f'<span style="font-size:12.5px;font-weight:600;color:{INK}">{t}</span>'
        f'<span style="font-size:11.5px;font-weight:400;color:{INK2};line-height:1.6">{d}</span>'
        f'</span></div>' for t, d in rows)
    return (f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;'
            f'padding:6px 15px 8px">{body}</div>')


def doc_row(mark, label):
    return (f'<span data-tm-doc="{mark}" style="display:flex;align-items:center;gap:10px;'
            f'background:{CARD};border:1px solid {LINE};border-radius:12px;padding:14px 14px">'
            f'<span style="flex:1;font-size:12.5px;font-weight:600;color:{INK}">{label}</span>'
            f'<span style="flex:none;color:{INK3}">{ic(CHEV, 12, "2.2")}</span></span>')


def scr_tm():
    return f'''<div style="{FRAME}">
  {SC.statusbar()}
  {topbar('약관 · 결제 · 해지')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:8px 16px 20px;display:flex;flex-direction:column">

    <div style="flex:none">{cap('지금 결제')}
      {kv([('플랜', 'Elite · 월 79,000원'),
           ('다음 결제일', '2026년 8월 25일'),
           ('결제 수단', '토스페이 · 자동결제'),
           ('결제 대행', '포트원 (PortOne)')])}
    </div>

    <div style="flex:none;padding-top:20px">{cap('끊을 때 알아둘 것')}
      {facts([
        ('언제든 해지할 수 있어요', '약정도 위약금도 없어요. 다음 결제일 전에 끊으면 다음 달부터 안 빠져나갑니다.'),
        ('남은 기간은 그대로 써요', '해지해도 이번 달 마지막 날까지는 지금 플랜 그대로예요.'),
        ('받은 리포트는 계속 볼 수 있어요', '지금까지 받은 정기 피드백과 프로 한마디는 해지 후에도 앱에 남아 있어요.'),
        ('7일 안에는 전액 환불', '결제하고 7일 안이고 이번 달 리포트를 아직 안 받았다면 전액 돌려드려요.'),
      ])}
    </div>

    <div style="flex:none;padding-top:20px">{cap('문서')}
      <div style="display:flex;flex-direction:column;gap:8px">
        {doc_row('terms', '이용약관')}
        {doc_row('privacy', '개인정보 처리방침')}
        {doc_row('refund', '환불 규정 전문')}
      </div>
    </div>

    <div style="flex:1;min-height:18px"></div>

    <span data-tm-cancel style="flex:none;border:1px solid {LINE};background:{CARD};
          border-radius:13px;padding:15px;text-align:center;font-size:13.5px;font-weight:600;
          color:{INK2}">구독 해지하기</span>
    <span data-tm-ask style="flex:none;margin-top:9px;padding:11px;text-align:center;
          font-size:11.5px;font-weight:500;color:{INK3}">해지 전에 물어볼 게 있어요</span>
  </div>
</div>'''


# ── 다른 화면에 표식 박기 ────────────────────────────────────────────
def mark(by):
    log = []

    def sub(sid, old, new, why):
        h = by[sid]['html']
        assert h.count(old) == 1, f'{sid} {why} — {h.count(old)}건'
        by[sid]['html'] = h.replace(old, new)
        log.append(f'  {sid}  {why}')

    # 마이 — 플랜 이름 · 혜택칩 통 · 이번 달 한마디 횟수 · 함께한 날수
    sub('2e', 'line-height: 1.45;">Elite</span>',
        'line-height: 1.45;" data-pl-name>Elite</span>', '플랜 이름')
    sub('2e', '<div data-dc-tpl="44" style="display: flex; gap: 8px;">',
        '<div data-pl-perks data-dc-tpl="44" style="display: flex; gap: 8px;">', '혜택칩 통')
    sub('2e', '>4회</span><span data-dc-tpl="74" style="font-size:12px; color: var(--ns-ink3);">영상 업로드<',
        ' data-pl-vids>12개</span><span data-dc-tpl="74" style="font-size:12px; color: var(--ns-ink3);">영상 업로드<',
        '이번 달 영상 4회 → 12개')
    sub('2e', '>215일째</b>', ' data-pl-days>500일째</b>', '215일째 → 500일째 (드로어와 맞춤)')

    # 드로어 — 플랜 이름
    sub('2h', 'color: var(--ns-ink);">Elite</span></span>',
        'color: var(--ns-ink);" data-pl-name>Elite</span></span>', '플랜 이름')

    # 레슨기록 — '받은 레슨 6' 배지
    sub('2f', 'font-family: var(--font-num);">6</span>',
        'font-family: var(--font-num);" data-fb-count>6</span>', '받은 레슨 배지')

    # 연습기록 — 하단 통계의 영상 18개 → 12개 (홈·레슨기록과 같은 축)
    sub('2b', '-.04em">18<span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">개</span>',
        '-.04em">12<span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">개</span>',
        '이번 달 영상 18 → 12')

    # 결제 전 안내 — 해지 조건을 결제 누르기 전에 보여준다
    sub('22', '<span data-dc-tpl="37" style="flex: 1 1 0%; font-size:12px; color: var(--ns-ink2);">결제 대행</span><span data-dc-tpl="38" style="font-size:12px; font-weight: 600; color: var(--ns-ink);">포트원 · 토스페이먼츠</span></div>',
        '<span data-dc-tpl="37" style="flex: 1 1 0%; font-size:12px; color: var(--ns-ink2);">결제 대행</span><span data-dc-tpl="38" style="font-size:12px; font-weight: 600; color: var(--ns-ink);">포트원 · 토스페이먼츠</span></div>'
        '<div style="display:flex;align-items:baseline"><span style="flex:1;font-size:12px;color:var(--ns-ink2)">해지</span>'
        '<span data-pay-cancel style="font-size:12px;font-weight:600;color:var(--ns-green)">언제든 · 남은 기간은 그대로 ›</span></div>',
        '해지 조건 한 줄')

    # AI 결과 — '이 드릴'이 화면에 없었다. 오늘 할 동작을 하나 적는다
    sub('07', '<div style="font-size:14px;font-weight:600;line-height:1.62;margin-top:4px;">어깨보다 하체가 먼저 리드되도록 연습해보세요.</div>',
        '<div style="font-size:14px;font-weight:600;line-height:1.62;margin-top:4px;">어깨보다 하체가 먼저 리드되도록 연습해보세요.</div>'
        '<div style="margin-top:9px;background:#EFEFEB;border-radius:9px;padding:10px 12px;'
        'display:flex;flex-direction:column;gap:3px">'
        '<div style="font-size:11px;font-weight:800;letter-spacing:.06em;color:#666666">오늘 할 것</div>'
        '<div style="font-size:13px;font-weight:700;color:#1A1A1A">발 모으고 스윙 20회</div>'
        '<div style="font-size:11.5px;font-weight:400;color:#666666;line-height:1.55">'
        '발을 붙이고 치면 상체로 먼저 못 칩니다. 하체가 먼저 움직이는 감각을 잡는 가장 빠른 연습이에요.</div></div>',
        '오늘 할 드릴 한 개')

    # 마이 — 약관 행 이름을 찾기 쉽게
    sub('2e', '>약관 및 정책</span>', '>약관 · 결제 · 해지</span>', '약관 행 이름')
    return log


SCREENS = [('tm', '약관 · 결제 · 해지', '사전 · 구독', scr_tm())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for line in mark(by):
        print(line)
    for sid, title, grp, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'terms_screen.py', 'title': title,
                   'group': grp, 'html': html, 'holes': False}
        print(f'  {sid}  {title:16} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('cs') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
