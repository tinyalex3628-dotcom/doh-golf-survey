# -*- coding: utf-8 -*-
"""문의 화면 — 카카오톡 오픈채팅 · 이메일.

   마이(2e) · 드로어(2h) · 오프라인 레슨(19) 의 문의가 전부 여기로 온다.
   주소는 진짜 링크로 걸어두고, 눌리지 않는 환경도 있으니 글자로도 같이 보여준다.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))

BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND, BRONZE = '#E4DED2', '#EFE9DE', '#A67C3D'
KAKAO, KAKAO_INK = '#FEE500', '#191600'
NUM = 'font-family:var(--font-num)'

KAKAO_URL = 'https://open.kakao.com/me/2dohyeongpro'
EMAIL = 'alex3628@naver.com'

FRAME = ('width:360px;height:740px;background:#FFFDF9;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;flex-direction:column')


def statusbar():
    return (f'<div style="flex:none;height:44px;background:{BG};display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 24px;font-size:12px;color:{INK}">'
            f'<span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {INK};border-radius:2px;opacity:.6"></span>'
            f'<span style="width:15px;height:9px;background:{INK};border-radius:2px"></span></span></div>')


def header(title):
    return (f'<div style="flex:none;height:50px;background:{BG};display:flex;align-items:center;padding:0 12px">'
            f'<span style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:{INK}">'
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
            'stroke-linejoin="round" style="width:19px;height:19px"><path d="m15 5-7 7 7 7"></path></svg></span>'
            f'<span style="flex:1;text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em;'
            f'color:{INK}">{title}</span><span style="width:30px"></span></div>')


def cap(t, sub=''):
    s = f'<span style="font-size:10px;font-weight:500;color:{INK4}">{sub}</span>' if sub else ''
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 1px 9px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:{INK3}">{t}</span>{s}</div>')


FAQ = [
    ('정규레슨은 언제 받나요?',
     '한 달에 한 번, 그동안 올리신 영상을 모아서 프로가 PC에서 분석해 보내드립니다. '
     '도착일은 연습기록 달력에 표시돼요.'),
    ('프로 한마디는 몇 번까지 되나요?',
     '플랜에 따라 다릅니다. Basic은 월 3회, Elite는 월 5회예요. '
     '남은 횟수는 홈 화면과 마이에서 확인할 수 있습니다.'),
    ('영상은 어떻게 찍는 게 좋나요?',
     '정면이나 측면 한 각도에서, 스윙 전체가 화면에 들어오게 찍어주세요. '
     '삼각대가 있으면 가장 좋고, 없으면 벽에 기대두셔도 됩니다.'),
    ('결제를 취소하고 싶어요',
     '마이 → 플랜 관리에서 언제든 해지할 수 있습니다. 남은 기간까지는 그대로 이용하실 수 있어요.'),
]


def cs():
    def faq_row(q, a, last):
        bd = '' if last else f'border-bottom:1px solid #F2ECE2'
        return f'''<div data-cs-faq style="{bd}">
      <div data-cs-q style="display:flex;align-items:center;gap:10px;padding:13px 14px">
        <span style="flex:1;font-size:12.5px;font-weight:500;letter-spacing:-.01em;color:{INK}">{q}</span>
        <span data-cs-caret style="flex:none;color:{INK4};transition:transform .18s">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
               stroke-linejoin="round" style="width:12px;height:12px;display:block"><path d="m6 9 6 6 6-6"></path></svg></span>
      </div>
      <div data-cs-a style="display:none;padding:0 14px 14px;font-size:12px;font-weight:400;
           color:{INK2};line-height:1.8;letter-spacing:-.01em">{a}</div>
    </div>'''

    faqs = ''.join(faq_row(q, a, i == len(FAQ) - 1) for i, (q, a) in enumerate(FAQ))

    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('문의')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 20px;display:flex;flex-direction:column">

    <div style="flex:none;padding:4px 1px 18px">
      <div style="font-size:20px;font-weight:400;letter-spacing:-.025em;color:{INK};line-height:1.45">
        무엇을 도와드릴까요?</div>
      <div style="font-size:11.5px;font-weight:500;color:{INK3};line-height:1.7;padding-top:8px">
        평일 오전 10시 ~ 오후 8시 · 보통 하루 안에 답을 드려요</div>
    </div>

    <div style="flex:none">{cap('바로 연결', '가장 빠릅니다')}
      <a data-cs-kakao href="{KAKAO_URL}" target="_blank" rel="noopener noreferrer"
         style="display:flex;align-items:center;gap:12px;background:{KAKAO};border-radius:13px;
                padding:15px 16px;text-decoration:none;box-shadow:0 4px 14px -10px rgba(20,22,24,.6)">
        <span style="flex:none;width:34px;height:34px;border-radius:50%;background:{KAKAO_INK};
                     display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 24 24" fill="{KAKAO}" style="width:18px;height:18px">
            <path d="M12 4C7.3 4 3.5 7 3.5 10.7c0 2.3 1.6 4.4 3.9 5.6l-.9 3.3c-.1.3.2.5.5.4l3.9-2.6c.4 0 .7.1 1.1.1
                     4.7 0 8.5-3 8.5-6.8S16.7 4 12 4z"></path></svg></span>
        <span style="flex:1;display:flex;flex-direction:column;gap:3px">
          <span style="font-size:14px;font-weight:600;letter-spacing:-.02em;color:{KAKAO_INK}">
            카카오톡으로 문의하기</span>
          <span style="font-size:10.5px;font-weight:500;color:rgba(25,22,0,.55);{NUM}">
            open.kakao.com/me/2dohyeongpro</span></span>
        <span style="flex:none;color:rgba(25,22,0,.5)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
               stroke-linejoin="round" style="width:12px;height:12px;display:block"><path d="m9 5 7 7-7 7"></path></svg></span>
      </a>
    </div>

    <div style="flex:none;margin-top:20px">{cap('이메일')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:14px 15px">
        <div style="display:flex;align-items:center;gap:11px">
          <span style="flex:none;width:32px;height:32px;border-radius:9px;background:{SAND};color:{INK2};
                       display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                 stroke-linejoin="round" style="width:16px;height:16px"><rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect>
            <path d="m3.8 7 8.2 6 8.2-6"></path></svg></span>
          <a data-cs-mail href="mailto:{EMAIL}" style="flex:1;min-width:0;display:flex;flex-direction:column;
             gap:3px;text-decoration:none">
            <span style="font-size:13.5px;font-weight:600;letter-spacing:-.01em;color:{INK};{NUM};
                         overflow:hidden;text-overflow:ellipsis">{EMAIL}</span>
            <span style="font-size:10.5px;font-weight:500;color:{INK3}">눌러서 메일 쓰기</span></a>
          <span data-cs-copy style="flex:none;font-size:11px;font-weight:600;color:{INK2};
                border:1px solid {LINE};border-radius:8px;padding:7px 11px">복사</span>
        </div>
        <div style="margin-top:11px;padding-top:11px;border-top:1px solid #F2ECE2;
                    font-size:11px;font-weight:500;color:{INK3};line-height:1.7">
          결제 · 환불처럼 기록이 남아야 하는 문의는 메일이 좋아요.</div>
      </div>
    </div>

    <div style="flex:none;margin-top:20px">{cap('문의 전에 확인', '자주 묻는 질문')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:13px;overflow:hidden">{faqs}</div>
    </div>

    <div style="flex:none;margin-top:20px">{cap('내 정보', '문의할 때 알려주시면 빨라요')}
      <div style="background:{SAND};border-radius:12px;padding:13px 14px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="flex:1;font-size:11.5px;font-weight:500;color:{INK2}">회원</span>
          <span style="font-size:11.5px;font-weight:600;color:{INK};{NUM}">골프러버 · 215일째</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="flex:1;font-size:11.5px;font-weight:500;color:{INK2}">플랜</span>
          <span style="font-size:11.5px;font-weight:600;color:{INK};{NUM}">Coaching</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="flex:1;font-size:11.5px;font-weight:500;color:{INK2}">앱 버전</span>
          <span style="font-size:11.5px;font-weight:600;color:{INK};{NUM}">v2.4.1</span></div>
        <span data-cs-copyinfo style="margin-top:3px;text-align:center;background:{CARD};border:1px solid {LINE};
              border-radius:9px;padding:10px;font-size:11.5px;font-weight:600;color:{INK2}">내 정보 복사</span>
      </div>
    </div>
  </div>
</div>'''


SCREENS = [('cs', '문의 · 카톡 · 이메일', '사전 · 구독', cs())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, group, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'contact_screen.py', 'title': title,
                   'group': group, 'html': html, 'holes': False}
        print(f'  {sid}  {title:20} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('19') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
