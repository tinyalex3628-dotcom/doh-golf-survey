# -*- coding: utf-8 -*-
"""못 쓰는 등급이 '이게 뭔지' 알아보는 화면 두 장.

   지금까지 잠긴 덩어리를 누르면 곧장 가격표(17)로 갔다.
   뭔지도 모르는데 가격부터 들이미는 순서다. 사는 사람 입장에선
   "이게 뭐길래 79,000원인데?"가 먼저다.

   그래서 사이에 설명을 한 장 넣는다.
     fx  정기 피드백이 어떻게 오는지 (Elite)
     cx  프로 한마디가 어떻게 오는지 (Basic 이상)
   두 화면 모두 끝에 '실제 예시 보기'와 '구독 플랜 보기'를 둔다.
   궁금 → 실물 → 가격 순서다.
"""
import json, os
import split_concepts as SC

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = 'var(--ns-bg)', 'var(--ns-card)', 'var(--ns-green)'
INK, INK2, INK3 = 'var(--ns-ink)', 'var(--ns-ink2)', 'var(--ns-ink3)'
LINE, SAND, SOFT = 'var(--ns-line)', 'var(--ns-sand)', 'var(--ns-soft)'
BRONZE = 'var(--ns-bronze)'
NUM = 'font-family:var(--font-num)'
FRAME, LEFT = SC.FRAME, SC.LEFT
ic = SC.ic

ENVELOPE = ('<rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect>'
            '<path d="m3.8 7 8.2 6 8.2-6"></path>')
BUBBLE = ('<path d="M4 5.5h16v11H9.5L5.5 20v-3.5H4z"></path>')


def topbar(title):
    return (f'<div style="flex:none;height:52px;background:{BG};display:flex;align-items:center;'
            f'gap:6px;padding:0 12px">'
            f'<span data-ex-back style="width:32px;height:32px;display:flex;align-items:center;'
            f'justify-content:center;color:{INK}">{ic(LEFT, 20, "1.9")}</span>'
            f'<b style="flex:1;font-size:16px;font-weight:700;letter-spacing:-.03em;'
            f'color:{INK}">{title}</b><span style="width:32px"></span></div>')


def cap(t):
    return (f'<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:{INK3};'
            f'padding:0 1px;display:block;margin-bottom:9px">{t}</span>')


def hero(icon, eyebrow, title, lede):
    return (f'<div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:16px;'
            f'padding:20px 17px 18px;display:flex;flex-direction:column;align-items:center">'
            f'<span style="width:48px;height:48px;border-radius:14px;background:{SOFT};'
            f'color:{FOREST};display:flex;align-items:center;justify-content:center">'
            f'{ic(icon, 22, "1.6")}</span>'
            f'<span style="margin-top:12px;font-size:9px;font-weight:700;letter-spacing:.18em;'
            f'color:{BRONZE};{NUM};text-align:center">{eyebrow}</span>'
            f'<span style="margin-top:9px;font-size:17px;font-weight:700;letter-spacing:-.03em;'
            f'color:{INK};text-align:center;line-height:1.45">{title}</span>'
            f'<span style="margin-top:9px;font-size:12px;font-weight:400;color:{INK2};'
            f'text-align:center;line-height:1.7">{lede}</span></div>')


def steps(rows):
    def row(n, t, d):
        return (f'<div style="display:flex;gap:11px;padding:10px 0">'
                f'<span style="flex:none;width:22px;height:22px;border-radius:50%;background:{SOFT};'
                f'color:{FOREST};display:flex;align-items:center;justify-content:center;'
                f'font-size:10.5px;font-weight:700;{NUM}">{n}</span>'
                f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK}">{t}</span>'
                f'<span style="font-size:11.5px;font-weight:400;color:{INK2};'
                f'line-height:1.6">{d}</span></span></div>')
    body = ''.join(row(str(i + 1), *r) for i, r in enumerate(rows))
    return (f'<div style="flex:none;padding-top:20px">{cap("어떻게 받나요")}'
            f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;'
            f'padding:6px 15px 8px">{body}</div></div>')


def bullets(title, rows):
    def row(t, d):
        return (f'<div style="display:flex;gap:9px;padding:9px 0">'
                f'<span style="flex:none;width:5px;height:5px;border-radius:50%;'
                f'background:{FOREST};margin-top:7px"></span>'
                f'<span style="flex:1;display:flex;flex-direction:column;gap:2px">'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK}">{t}</span>'
                f'<span style="font-size:11.5px;font-weight:400;color:{INK2};'
                f'line-height:1.6">{d}</span></span></div>')
    body = ''.join(row(*r) for r in rows)
    return (f'<div style="flex:none;padding-top:20px">{cap(title)}'
            f'<div style="background:{CARD};border:1px solid {LINE};border-radius:14px;'
            f'padding:6px 15px 8px">{body}</div></div>')


def versus():
    """프로 한마디와 정기 피드백은 계속 헷갈리는 두 가지다. 옆에 놓고 한 번에 끝낸다."""
    def col(name, rows, on):
        bg = SOFT if on else SAND
        bd = '#DCE7DE' if on else LINE
        c = FOREST if on else INK2
        items = ''.join(f'<span style="font-size:11px;font-weight:500;color:{INK2};'
                        f'line-height:1.6">{r}</span>' for r in rows)
        return (f'<span style="flex:1;min-width:0;background:{bg};border:1px solid {bd};'
                f'border-radius:12px;padding:12px 11px;display:flex;flex-direction:column;gap:6px">'
                f'<span style="font-size:11.5px;font-weight:700;letter-spacing:-.02em;'
                f'color:{c}">{name}</span>{items}</span>')
    return (f'<div style="flex:none;padding-top:20px">{cap("정기 피드백과 뭐가 다른가요")}'
            f'<div style="display:flex;gap:8px">'
            + col('프로 한마디', ['스윙 1개만', '글과 사진으로', '보통 하루 안', '월 2~6회'], True)
            + col('정기 피드백', ['한 달치 전부', '영상 리포트', '매달 27일쯤', '월 1회 · Elite'], False)
            + '</div></div>')


def footer(example_label):
    return (f'<div style="flex:none;padding-top:22px;display:flex;flex-direction:column">'
            f'<span data-ex-demo style="background:{FOREST};color:#FFFFFF;border-radius:14px;'
            f'padding:16px;text-align:center;font-size:14.5px;font-weight:600;'
            f'letter-spacing:-.02em">{example_label}</span>'
            f'<span data-ex-plan style="margin-top:10px;padding:13px;text-align:center;'
            f'font-size:12.5px;font-weight:600;color:{FOREST}">구독 플랜 보기 ›</span></div>')


def wrap(title, body):
    return f'''<div style="{FRAME}">
  {SC.statusbar()}
  {topbar(title)}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 20px;
              display:flex;flex-direction:column">{body}</div>
</div>'''


# ── 정기 피드백 ─────────────────────────────────────────────────────
def scr_fx():
    return wrap('정기 피드백이란',
        hero(ENVELOPE, 'ELITE 플랜 · 월 1회',
             '한 달치 스윙을 모아<br>프로가 리포트를 만들어요',
             '그날 하나만 보는 게 아니라, 한 달 사이에 무엇이<br>'
             '달라졌는지를 봅니다. 그래서 한 달에 한 번이에요.')
        + steps([
            ('한 달 동안 스윙을 올려요',
             '편할 때 편한 각도로 올리면 돼요. 보통 한 달에 10~15개가 모입니다.'),
            ('프로가 한 달치를 몰아서 봐요',
             '이도형 프로가 직접 봅니다. AI가 자동으로 뽑아주는 게 아니에요.'),
            ('매달 27일쯤 도착해요',
             '앱 알림과 카카오 알림톡으로 알려드려요. 링크는 30일간 열려 있어요.'),
        ])
        + bullets('리포트에 뭐가 들어있나요', [
            ('이번 달 고칠 것 한 가지', '한 번에 여러 개를 잡지 않아요. 순서대로 하나씩 갑니다.'),
            ('프로 영상 4~12분', '회원님 스윙 위에 선을 그리면서 음성으로 설명해요.'),
            ('BEFORE / AFTER 사진', '지난달과 같은 각도로 나란히 놓아드려요.'),
            ('이번 달 숙제 2~3개', '무슨 연습인지가 아니라 왜 하는 연습인지까지 적어요.'),
            ('질문 남기기', '이해 안 된 걸 남기면 다음 달 영상에서 프로가 직접 답해요.'),
        ])
        + footer('실제 리포트 예시 보기'))


# ── 프로 한마디 ─────────────────────────────────────────────────────
def scr_cx():
    return wrap('프로 한마디란',
        hero(BUBBLE, 'BASIC 2회 · COACHING 5회 · ELITE 6회',
             '올린 스윙 하나에<br>프로가 바로 한두 마디',
             '리포트를 한 달 기다릴 필요 없어요. 오늘 올린 스윙에<br>'
             '대해 짧게, 빨리 답이 옵니다.')
        + steps([
            ('스윙을 올리면서 체크해요',
             "'오늘 기록하기' 화면에서 프로 한마디를 한 번 누르면 돼요."),
            ('프로가 그 스윙만 봐요',
             '한 달치를 모아 보는 게 아니라, 방금 올린 그 하나를 봅니다.'),
            ('보통 하루 안에 도착해요',
             '글로 오고, 필요하면 스윙 사진에 직접 표시해서 같이 보내드려요.'),
        ])
        + versus()
        + footer('실제 한마디 예시 보기'))


SCREENS = [('fx', '정기 피드백이란', '구독 안내', scr_fx()),
           ('cx', '프로 한마디란', '구독 안내', scr_cx())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, grp, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'explain_screens.py', 'title': title,
                   'group': grp, 'html': html, 'holes': False}
        print(f'  {sid}  {title:16} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('17'), sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
