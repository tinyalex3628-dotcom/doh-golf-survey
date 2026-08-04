# -*- coding: utf-8 -*-
"""DOH 스윙분석 엔진 화면 3종 생성 — 업로드 / 분석중 / 결과.
   결과 화면은 비어 있는 껍데기이고, 실제 내용은 런타임이 엔진 JSON+규칙으로 그린다."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))

BG, CARD, FOREST = '#F3EFE8', '#FFFDF9', '#21402F'
INK, INK2, INK3, INK4 = '#1D2420', '#4A4638', '#6E6858', '#6E6858'
LINE, SAND = '#E4DED2', '#EFE9DE'
SOFT = '#F2F8F4'
NUM = 'font-family:var(--font-num)'

FRAME = ('width:360px;height:740px;background:#FFFDF9;border:1px solid #DDD6C8;border-radius:34px;'
         'box-shadow:0 18px 44px -26px rgba(38,40,42,.4);overflow:hidden;display:flex;flex-direction:column')

def statusbar():
    return (f'<div style="flex:none;height:44px;background:{BG};display:flex;align-items:center;'
            f'justify-content:space-between;padding:0 24px;font-size:12px;color:{INK}">'
            f'<span style="{NUM}">9:41</span><span style="display:flex;gap:4px;align-items:center">'
            f'<span style="width:15px;height:9px;border:1px solid {INK};border-radius:2px;opacity:.6"></span>'
            f'<span style="width:15px;height:9px;background:{INK};border-radius:2px"></span></span></div>')

def header(title, right=''):
    return (f'<div style="flex:none;height:50px;background:{BG};display:flex;align-items:center;padding:0 12px">'
            f'<span style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:{INK}">'
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
            'stroke-linejoin="round" style="width:19px;height:19px"><path d="m15 5-7 7 7 7"></path></svg></span>'
            f'<span style="flex:1;text-align:center;font-size:13.5px;font-weight:600;letter-spacing:-.02em;color:{INK}">{title}</span>'
            f'<span style="min-width:30px;display:flex;justify-content:flex-end;'
            f'padding-right:6px;white-space:nowrap">{right}</span></div>')

def cap(t, sub=''):
    s = f'<span style="font-size:10px;font-weight:500;color:{INK4}">{sub}</span>' if sub else ''
    return ('<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 1px 9px">'
            f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.18em;color:{INK3}">{t}</span>{s}</div>')


# ─────────────────────────────── E1 · 업로드
def e1():
    def seg(label, sub, on):
        st = (f'background:{FOREST};color:#fff;border:1px solid {FOREST}' if on
              else f'background:{CARD};color:{INK};border:1px solid {LINE}')
        subc = 'rgba(255,255,255,.6)' if on else INK4
        return (f'<span style="flex:1;{st};border-radius:11px;padding:13px 10px;text-align:center">'
                f'<span style="display:block;font-size:13px;font-weight:600;letter-spacing:-.02em">{label}</span>'
                f'<span style="display:block;font-size:10px;font-weight:500;color:{subc};margin-top:3px;{NUM}">{sub}</span></span>')

    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('스윙 분석 엔진')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none">
      <div style="font-size:20px;font-weight:400;letter-spacing:-.025em;color:{INK};line-height:1.45;padding:6px 0 6px">
        촬영 각도를 고르고<br />스윙 영상을 올려주세요</div>
      <div style="font-size:11.5px;font-weight:500;color:{INK3};line-height:1.7;padding-bottom:18px">
        각도에 따라 측정할 수 있는 항목이 달라집니다.</div>
    </div>

    <div style="flex:none">{cap('CAMERA VIEW', '한 각도만')}
      <div style="display:flex;gap:8px">{seg('정면', 'FO', True)}{seg('측면', 'DTL', False)}</div>
    </div>

    <div style="flex:none;margin-top:20px">{cap('SWING VIDEO')}
      <div style="border:1.5px dashed #CFC8B8;background:{CARD};border-radius:13px;padding:26px 16px;
                  display:flex;flex-direction:column;align-items:center;gap:9px">
        <span style="width:40px;height:40px;border-radius:50%;background:{SAND};color:{FOREST};
                     display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
               stroke-linejoin="round" style="width:20px;height:20px"><path d="M12 16V5"></path>
          <path d="m7.5 9.5 4.5-4.5 4.5 4.5"></path><path d="M4.5 15v3A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"></path></svg></span>
        <span style="font-size:13px;font-weight:600;letter-spacing:-.02em;color:{INK}">영상 추가하기</span>
        <span style="font-size:10.5px;font-weight:500;color:{INK3}" data-e1-empty>— 앵글을 선택하고 영상을 올리세요 —</span>
      </div>
    </div>

    <div style="flex:none;margin-top:20px">{cap('ENGINE')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:12px;padding:4px 14px" data-e1-caps></div>
    </div>

    <div style="flex:1"></div>
    <div style="flex:none;padding-top:16px">
      <span style="display:block;background:{SAND};color:{INK4};border-radius:12px;padding:15px;
                   text-align:center;font-size:14px;font-weight:600;letter-spacing:-.02em" data-e1-cta>서버로 분석</span>
    </div>
  </div>
</div>'''


# ─────────────────────────────── E2 · 분석 중
def e2():
    """분석 중.

       고친 것 — 기다리는 사람에게 필요한 건 세 가지다.
         ① 얼마나 남았나   %  + 남은 시간
         ② 지금 뭐 하고 있나  단계 이름을 사람 말로 (POST /v1/analyze/video 가 아니라)
         ③ 나가도 되나      닫아도 끝나면 알려준다는 약속 + 실제로 나가는 버튼
       job ID 같은 내부 값은 뺐다. 회원이 알아야 할 이유가 없다.
    """
    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('분석 중')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none;padding:10px 0 18px">
      <div style="font-size:20px;font-weight:400;letter-spacing:-.025em;color:{INK};line-height:1.45">
        스윙을 분석하고 있어요</div>
      <div style="font-size:12px;font-weight:500;color:{INK2};padding-top:9px" data-e2-eta>
        약 40초 남았어요</div>
    </div>

    <div style="flex:none;display:flex;align-items:baseline;justify-content:space-between;padding-bottom:7px">
      <span style="font-size:10px;font-weight:600;letter-spacing:.16em;color:{INK3}">진행률</span>
      <span style="font-size:13px;font-weight:700;color:{FOREST};{NUM}" data-e2-pct>0%</span>
    </div>
    <div style="flex:none;height:6px;background:{SAND};border-radius:99px;overflow:hidden">
      <span style="display:block;height:100%;width:0%;background:{FOREST};transition:width .4s" data-e2-bar></span>
    </div>

    <div style="flex:none;padding-top:20px;display:flex;flex-direction:column;gap:2px" data-e2-steps></div>
    <div style="flex:1;min-height:14px"></div>

    <div style="flex:none;background:{CARD};border:1px solid {LINE};border-radius:14px;padding:15px 15px 13px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="width:28px;height:28px;border-radius:9px;background:{SOFT};color:{FOREST};flex:none;
                     display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
               stroke-linejoin="round" style="width:15px;height:15px">
            <path d="M18 10a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"></path>
            <path d="M10.5 19.5a2 2 0 0 0 3 0"></path></svg></span>
        <span style="flex:1;display:flex;flex-direction:column;gap:3px">
          <span style="font-size:12.5px;font-weight:700;color:{INK};letter-spacing:-.02em">
            닫고 나가도 괜찮아요</span>
          <span style="font-size:11px;font-weight:400;color:{INK2};line-height:1.6">
            분석은 계속 돌아가고, 끝나면 알림으로 알려드려요</span></span>
      </div>
      <span data-e2-bg style="display:block;margin-top:12px;border:1px solid {LINE};border-radius:11px;
            padding:12px;text-align:center;font-size:12.5px;font-weight:600;color:{INK}">
        닫고 다른 거 볼게요</span>
    </div>
  </div>
</div>'''


# ─────────────────────────────── E3 · 결과 (내용은 런타임이 채운다)
def e3():
    return f'''<div style="{FRAME}">
  {statusbar()}
  {header('분석 결과', f'<span style="font-size:10px;font-weight:600;color:{FOREST};'
                       f'background:rgba(33,64,47,.10);border-radius:6px;padding:4px 7px;'
                       f'white-space:nowrap;{NUM}" data-e3-conf>—</span>')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 20px" data-e3-body></div>
</div>'''


SCREENS = [
    ('e1', '엔진 · 영상 올리기', '스윙분석 엔진', e1()),
    ('e2', '엔진 · 분석 중',     '스윙분석 엔진', e2()),
    ('e3', '엔진 · 분석 결과',   '스윙분석 엔진', e3()),
]

if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, group, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'engine_screens.py', 'title': title,
                   'group': group, 'html': html, 'holes': False}
        print(f'  {sid}  {title:18} {len(html)/1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('07') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')
