# -*- coding: utf-8 -*-
"""AI 설문 화면(05) 본문 재구성 — 새 질문지를 받기 위해.

   기존 화면은 '선택지 4개 · 단일선택 · 설명줄 없음'으로 굳어 있었다.
   새 질문지는 선택지가 4~7개고, 복수선택이 넷이고, 세 문항(Q3·Q4·Q6)은
   회원이 몸을 움직여봐야 답할 수 있다. 글자만 갈아끼울 수가 없다.

   그래서 껍데기(상태바·상단바·진행바·이전/다음)는 그대로 두고
   본문만 빈 자리로 만들어 런타임이 채우게 한다. 질문지 내용은
   runtime-v3.js 의 SURVEY 한 곳에만 있다 — 문구를 고칠 자리도 한 곳뿐이다.

   자리 표식
     data-sv-n     1 / 7
     data-sv-time  약 4분
     data-sv-bar   진행바
     data-sv-do    '직접 해보세요' 안내 (필요한 문항에서만 보임)
     data-sv-q     질문
     data-sv-hint  하나만 / 최대 2개 / 해당되는 것 모두
     data-sv-opts  선택지가 들어갈 빈 통
     data-sv-note  비채점 안내 (G 문항)
     data-sv-body  스크롤 통 (문항을 넘길 때 맨 위로 되돌린다)
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
HAND = ('<path d="M9 11.5V5.2a1.6 1.6 0 0 1 3.2 0v5.1"></path>'
        '<path d="M12.2 10.3V4.4a1.6 1.6 0 0 1 3.2 0v6.4"></path>'
        '<path d="M15.4 10.8V6.6a1.6 1.6 0 0 1 3.2 0v7.6c0 3.4-2.4 5.8-5.8 5.8'
        '-2.2 0-3.6-.9-4.7-2.6l-2.5-4a1.6 1.6 0 0 1 2.6-1.8l1.6 2"></path>')


def body():
    return '''<div data-sv-body data-dc-tpl="25" style="flex: 1 1 0%; overflow-y: auto; background: var(--ns-bg); padding: 16px 20px 6px; display: flex; flex-direction: column;">
            <span data-sv-do style="display:none;align-items:center;gap:9px;background:var(--ns-soft);border:1px solid #DCE7DE;border-radius:11px;padding:11px 13px;margin-bottom:14px">
              <span style="flex:none;color:var(--ns-green);display:flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;display:block">''' + HAND + '''</svg></span>
              <span data-sv-do-t style="flex:1;font-size:11.5px;font-weight:600;color:var(--ns-green);line-height:1.5"></span>
            </span>
            <span data-sv-q style="font-size: 21px; font-weight: 400; letter-spacing: -0.03em; color: var(--ns-ink); line-height: 1.4;"></span>
            <span data-sv-hint style="margin-top:8px;font-size:11.5px;font-weight:500;color:var(--ns-ink3)"></span>
            <div data-sv-opts style="margin-top:16px;display: flex; flex-direction: column; gap: 9px;"></div>
            <span data-sv-note style="display:none;margin-top:14px;font-size:11px;font-weight:400;color:var(--ns-ink3);line-height:1.6"></span>
            <span style="flex:1;min-height:8px"></span>
          </div>'''


if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}

    h = by['05']['html']
    # 본문 한 덩어리(tpl 25)만 통째로 교체한다
    a = h.index('<div data-dc-tpl="25"')
    b = h.index('<div data-dc-tpl="39"')
    h = h[:a] + body() + '\n          ' + h[b:]
    # 카운터·시간·진행바에 표식을 박는다
    reps = [('>1 / 8<', ' data-sv-n>1 / 7<'),
            ('>약 3분<', ' data-sv-time>약 4분<'),
            ('width: 12.5%; height: 100%;', 'width: 14.3%; height: 100%;')]
    for old, new in reps:
        assert h.count(old) == 1, old
        h = h.replace(old, new)
    h = h.replace('style="display: block; width: 14.3%',
                  'data-sv-bar style="display: block; width: 14.3%')
    by['05']['html'] = h
    by['05']['file'] = 'survey_screen.py'
    print(f'  05 본문 교체 · {len(h)/1024:.1f} KB')

    # 안내 화면(04)도 문항 수·소요 시간·설명을 새 질문지에 맞춘다
    g = by['04']['html']
    swaps = [
        ('간단한 설문 (8문항)', '간단한 설문 (7문항)'),
        ('경력 · 목표 · 연습 스타일 확인', '공 방향 · 미스 · 몸 상태 확인'),
        ('약 3분이면 완료돼요', '약 4분이면 완료돼요'),
        ('골프 경력, 목표, 연습 습관을 함께 고려해',
         '공이 어디로 휘는지, 몸이 어디까지 돌아가는지를 같이 보고'),
        ('회원님에게 맞는 스윙 분석 결과를 제공합니다.',
         '회원님 스윙의 원인을 찾습니다.'),
    ]
    for old, new in swaps:
        if g.count(old) == 1:
            g = g.replace(old, new); print(f'  04 «{old[:20]}…» 교체')
        else:
            print(f'  04 [건너뜀 {g.count(old)}건] {old[:24]}')
    by['04']['html'] = g

    json.dump([by[s['id']] for s in screens], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(screens)}개 화면')
