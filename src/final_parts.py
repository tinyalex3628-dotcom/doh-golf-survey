# -*- coding: utf-8 -*-
"""최종안 부품 — C1(형태) + C4(타임라인·서가) + '도착했을 때만' 상단 스트립.

   고른 것을 합치면서 한 가지를 고쳤다.
   1차에서 'NEXT ISSUE' 검은 카드가 뜬금없었던 이유는 위치가 아니라 무게다.
   아직 안 온 예고를 도착한 리포트와 똑같은 검정으로 그렸다.

   그래서 규칙을 하나로 잡는다 — **어두운 카드는 '도착한 리포트'에만.**
     도착      상단 초록 스트립(알림) + 본문에 어두운 리포트 카드
     대기      스트립 없음 + 밝은 예고 카드 (초록 얇게)
     한마디    말풍선 · 영상 옆 / 홈 중단엔 최근 타임라인
"""
import json, os
import split_concepts as SC

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = SC.BG, SC.CARD, SC.FOREST
INK, INK2, INK3, INK4 = SC.INK, SC.INK2, SC.INK3, SC.INK4
LINE, SAND, BRONZE, SOFT = SC.LINE, SC.SAND, SC.BRONZE, SC.SOFT
NUM = SC.NUM
ic, ENVELOPE, CHEV = SC.ic, SC.ENVELOPE, SC.CHEV


def arrival_strip():
    """도착했을 때만 뜬다. 안 왔으면 자리 자체가 없다 —
       C3의 '스트립이 늘 화면을 먹는다'는 단점이 여기서 사라진다."""
    return f'''<div style="flex:none;background:{FOREST};color:#fff;padding:11px 16px 12px;
              display:flex;align-items:center;gap:11px">
    <span style="flex:none;width:28px;height:28px;border-radius:9px;background:rgba(255,255,255,.16);
                 display:flex;align-items:center;justify-content:center">{ic(ENVELOPE, 14, '1.8')}</span>
    <span style="flex:1;display:flex;flex-direction:column;gap:2px">
      <span style="font-size:9.5px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.62);{NUM}">
        정기 피드백 · 7월호</span>
      <span style="font-size:13px;font-weight:600;letter-spacing:-.02em">No.06 리포트가 도착했어요</span></span>
    <span style="flex:none;font-size:11.5px;font-weight:600;background:rgba(255,255,255,.17);
                 border-radius:8px;padding:6px 11px">열기</span>
  </div>'''


def fb_upcoming_light():
    """예고 카드 — 밝게. 아직 안 온 것에 검정을 쓰지 않는다.
       초록 아이콘·진행바로 '피드백 계열'이라는 것만 알린다."""
    return f'''<div style="background:{CARD};border:1px solid {LINE};border-radius:13px;padding:13px 14px">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="flex:none;width:28px;height:28px;border-radius:9px;background:{SOFT};color:{FOREST};
                   display:flex;align-items:center;justify-content:center">{ic(ENVELOPE, 14, '1.8')}</span>
      <span style="flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-size:9.5px;font-weight:700;letter-spacing:.13em;color:{FOREST};{NUM}">
          다음 리포트 · 8월호</span>
        <span style="font-size:13.5px;font-weight:600;letter-spacing:-.025em;color:{INK}">
          7월 27일 (월) 도착 예정</span></span>
      <span style="flex:none;font-size:12.5px;font-weight:700;color:{FOREST};background:{SOFT};
                   border-radius:7px;padding:6px 10px;{NUM};letter-spacing:-.03em">D-5</span>
    </div>
    <div style="height:4px;border-radius:99px;background:{SAND};margin-top:11px;overflow:hidden">
      <span style="display:block;height:100%;width:72%;background:{FOREST};border-radius:99px"></span></div>
    <div style="font-size:10.5px;font-weight:500;color:{INK3};padding-top:8px">
      이번 달 영상 <b style="font-weight:600;color:{INK2};{NUM}">12개</b> 모였어요</div>
  </div>'''


def fb_report_dark():
    """도착한 리포트만 어두운 카드. 앱에서 이 톤은 여기뿐이라 그 자체가 표식이다."""
    return SC.c1_fb_arrived(compact=True)


PARTS = {
    'f_strip': arrival_strip(),
    'f_up': fb_upcoming_light(),
    'f_report': fb_report_dark(),
    'f_cm': SC.c1_cm(SC.CM_TEXT, '6시간 전'),
    'f_tl': SC.c4_timeline([('6시간 전', SC.CM_TEXT, True), ('7월 15일', SC.CM_TEXT2, False)]),
    'f_badge_done': SC.c1_cm_badge('done'),
    'f_badge_wait': SC.c1_cm_badge('wait'),
    'f_shelf': SC.c4_shelf(4),
    'cap_tl': SC.cap('최근 프로 한마디', '이번 달 2회'),
    'cap_fb': SC.cap('정기 피드백', '월 1회'),
    'cap_shelf': SC.cap('지난 리포트', '6권'),
    # 비교용 — 지금(검은 예고) vs 고친 것(밝은 예고)
    'old_next_issue': SC.c4_fb_upcoming(),
}

if __name__ == '__main__':
    json.dump(PARTS, open(os.path.join(HERE, 'final-parts.json'), 'w', encoding='utf-8'),
              ensure_ascii=False)
    print('최종안 부품', len(PARTS), '개')
