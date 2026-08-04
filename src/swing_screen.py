# -*- coding: utf-8 -*-
"""스윙분석 엔진(회원용) 호스트 화면 — 실제 엔진이 여기 들어간다.

   엔진 원본: tinyalex3628-dotcom/doh-golf-survey · claude/swing-analysis-engine-r8mneh
   components/swing/SwingAnalyzer.tsx · swing.css · lib/swing/draw.ts

   인수인계서 규칙대로 엔진 코드는 수정하지 않았다.
   바꾼 것은 별칭 경로(@/lib/swing/draw → 상대경로) 딱 하나뿐이고,
   360×740 프레임에 맞추는 일은 바깥 CSS 덮어쓰기로만 했다.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))

SW_BG, SW_TEXT, SW_DIM, SW_LINE = '#0a0a0c', '#e8e8ea', '#85858e', '#26262b'
NUM = 'font-family:var(--font-num)'

FRAME = ('width:360px;height:740px;background:#0a0a0c;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;flex-direction:column')


def sw():
    return f'''<div style="{FRAME}">
  <div style="flex:none;height:44px;background:{SW_BG};display:flex;align-items:center;
              justify-content:space-between;padding:0 24px;font-size:12px;color:{SW_TEXT}">
    <span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">
    <span style="width:15px;height:9px;border:1px solid {SW_TEXT};border-radius:2px;opacity:.6"></span>
    <span style="width:15px;height:9px;background:{SW_TEXT};border-radius:2px"></span></span></div>

  <div style="flex:none;height:46px;background:{SW_BG};border-bottom:1px solid {SW_LINE};
              display:flex;align-items:center;padding:0 10px;z-index:40;position:relative">
    <span style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:{SW_TEXT}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
           stroke-linejoin="round" style="width:19px;height:19px"><path d="m15 5-7 7 7 7"></path></svg></span>
    <span style="flex:1;display:flex;flex-direction:column;gap:1px;padding-left:2px">
      <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:{SW_TEXT}">스윙 분석</span>
      <span style="font-size:9.5px;font-weight:500;color:{SW_DIM};{NUM};letter-spacing:.04em">SWING ENGINE</span>
    </span>
    <span data-sw-pro style="flex:none;display:flex;align-items:center;gap:4px;font-size:11.5px;
          font-weight:600;color:{SW_TEXT};border:1px solid #3a3a41;border-radius:7px;padding:6px 10px">
      프로와 비교
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
           stroke-linejoin="round" style="width:10px;height:10px"><path d="m9 5 7 7-7 7"></path></svg></span>
  </div>

  <div data-sw-host style="flex:1;min-height:0;display:flex;flex-direction:column;background:{SW_BG}"></div>
</div>'''


SCREENS = [('sw', '스윙 분석 · 실제 엔진', '스윙분석 엔진', sw())]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, group, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'swing_screen.py', 'title': title,
                   'group': group, 'html': html, 'holes': False}
        print(f'  {sid}  {title:20} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('e1') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
