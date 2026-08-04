# -*- coding: utf-8 -*-
"""연습기록 재설계를 프로토타입에 씌운다.

   2b — 연습기록 (오늘 → 프로 코멘트 → 정기 피드백 → 달력 → 이번 달)
   2d — 그날 하루 (달력에서 날짜를 누르면 여기로)

   상태 변형은 화면을 나누지 않고 한 템플릿 안에 다 넣어 두고
   런타임이 보여줄 것만 켠다. 카드 두 장이 각자 얼굴을 바꾸는 구조 그대로다.
"""
import json, os
import practice_redesign as R

HERE = os.path.dirname(os.path.abspath(__file__))
BG, CARD, FOREST = R.BG, R.CARD, R.FOREST
INK, INK2, INK3, INK4 = R.INK, R.INK2, R.INK3, R.INK4
LINE, SAND, BRONZE, SOFT = R.LINE, R.SAND, R.BRONZE, R.SOFT
NUM = R.NUM


def variants(attr, items):
    """상태별 카드를 전부 심어두고 첫 번째만 켠 채로 내보낸다."""
    out = ''
    for i, (key, html) in enumerate(items):
        disp = 'block' if i == 0 else 'none'
        out += f'<div data-{attr}="{key}" style="display:{disp}">{html}</div>'
    return out


def scr_2b():
    today = variants('today', [
        ('done', R.today_done()),
        ('video', R.today_video_only()),
        ('empty', R.today_empty()),
    ])
    cm = variants('cm', [
        ('wait', R.comment_block('wait')),
        ('ask', R.comment_block('ask')),
        ('arrived', R.comment_block('arrived')),
        ('none', R.comment_block('none')),
        ('used', R.comment_block('used')),
    ])
    month_chip = (f'<span style="flex:none;font-size:11px;font-weight:600;color:{INK2};'
                  f'background:{CARD};border:1px solid {LINE};border-radius:8px;padding:6px 10px;{NUM}"'
                  f' data-pr-month>7월 · 12일</span>')

    return f'''<div style="{R.FRAME}">
  {R.statusbar()}
  {R.header('연습기록', month_chip)}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:4px 16px 18px;display:flex;flex-direction:column">
    <div style="flex:none">{R.cap('오늘', '7월 22일 수요일')}{today}</div>
    <div style="flex:none;margin-top:20px">{R.cap('프로 코멘트')}{cm}</div>
    <div style="flex:none;margin-top:20px">{R.cap('정기 피드백', '월 1회')}{R.feedback_block()}</div>
    <div style="flex:none;margin-top:20px">
      {R.cap('지난 기록', '날짜를 누르면 그날을 볼 수 있어요')}{R.calendar()}</div>
    <div style="flex:none;margin-top:14px">{R.month_summary()}</div>
  </div>
  {R.bottom_nav()}
</div>'''


def scr_2d():
    """그날 하루. 날짜 문구는 런타임이 달력에서 누른 날로 바꿔 넣는다."""
    def meta(k, v, hook):
        return (f'<span style="flex:1;display:flex;flex-direction:column;gap:3px">'
                f'<span style="font-size:9.5px;font-weight:600;letter-spacing:.1em;color:{INK4};{NUM}">{k}</span>'
                f'<span style="font-size:12.5px;font-weight:600;color:{INK};letter-spacing:-.02em"'
                f' data-d-{hook}>{v}</span></span>')
    return f'''<div style="{R.FRAME}">
  {R.statusbar()}
  {R.back_header('<span data-d-title>7월 15일 (화)</span>',
                 f'<span style="font-size:11px;font-weight:600;color:{INK2}" data-d-edit>수정</span>')}
  <div style="flex:1;overflow-y:auto;background:{BG};padding:6px 16px 18px;display:flex;flex-direction:column">

    <div style="flex:none">{R.cap('영상', '<span data-d-vn>2개</span>')}
      <div style="display:flex;gap:8px" data-d-vids>{R.thumb('0:31', 148, 104)}{R.thumb('0:24', 148, 104)}</div>
    </div>

    <div style="flex:none;margin-top:20px">{R.cap('연습 기록')}
      <div style="background:{CARD};border:1px solid {LINE};border-radius:14px;padding:14px 15px">
        <div style="display:flex;gap:8px">{meta('시간', '60분', 'time')}{meta('느낌', '좋았음', 'feel')}
          {meta('클럽', '7번 아이언', 'club')}</div>
        <div style="margin-top:12px;padding-top:11px;border-top:1px solid #F2ECE2;
                    font-size:12.5px;font-weight:500;color:{INK2};line-height:1.7" data-d-memo>
          “하체부터 시작하니까 확실히 편했어요. 근데 마지막에 다시 팔로 치게 되네요.”</div>
      </div>
    </div>

    <div style="flex:none;margin-top:20px" data-d-cmwrap>
      {R.cap('프로 코멘트', '<span data-d-cmwhen>7월 15일 받음</span>')}
      <div data-d-cm>{R.comment_block('arrived')}</div>
    </div>

    <div style="flex:1;min-height:16px"></div>
    <div style="flex:none;display:flex;align-items:center;gap:8px;padding-top:14px">
      <span data-d-prev style="flex:1;display:flex;align-items:center;gap:6px;background:{CARD};
            border:1px solid {LINE};border-radius:11px;padding:11px;font-size:12px;font-weight:600;color:{INK2}">
        <span style="color:{INK4}">{R.ic(R.LEFT, 13, '2.2')}</span><span data-d-prevlab>7월 14일</span></span>
      <span data-d-next style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:6px;
            background:{CARD};border:1px solid {LINE};border-radius:11px;padding:11px;font-size:12px;
            font-weight:600;color:{INK2}">
        <span data-d-nextlab>7월 16일</span><span style="color:{INK4}">{R.ic(R.RIGHT, 13, '2.2')}</span></span>
    </div>
  </div>
</div>'''


SCREENS = [
    ('2b', '연습기록 — 오늘 중심', '', scr_2b()),
    ('2d', '그날 하루', '', scr_2d()),
]


# ── 그날 하루(2d) 가 쓸 날짜별 데이터 ─────────────────────────────────
# 7월 1일 = 화요일. lead=2(달력 첫 줄 빈 칸 2개)와 같은 산식으로 요일을 구한다.
WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']


def weekday_of(d):
    return WEEKDAY[(2 + (d - 1)) % 7]


# 22일(오늘)은 2b가 담당하므로 제외. 15일은 practice_redesign.scr_day() 예시와 내용을 맞춘다.
DAY_CONTENT = {
    1:  {'time': '40분', 'feel': '보통', 'club': '드라이버', 'videos': ['0:22'],
         'memo': '오랜만에 다시 잡아서 그런지 감이 없었어요.', 'comment': None},
    3:  {'time': '35분', 'feel': '안 됐음', 'club': '아이언', 'videos': ['0:19'],
         'memo': '뒤땅이 계속 나서 답답했어요.', 'comment': None},
    6:  {'time': '50분', 'feel': '좋았음', 'club': '드라이버', 'videos': ['0:26'],
         'memo': '방향은 괜찮은데 거리가 안 나가요.', 'comment': None},
    8:  {'time': '55분', 'feel': '보통', 'club': '7번 아이언', 'videos': ['0:21'],
         'memo': '그립부터 다시 봐달라고 했어요.', 'comment': '그립 잡을 때 왼손 엄지 위치부터 다시 볼게요'},
    10: {'time': '30분', 'feel': '보통', 'club': '웨지', 'videos': ['0:18'],
         'memo': '짧은 어프로치만 집중해서 쳤어요.', 'comment': None},
    13: {'time': '45분', 'feel': '좋았음', 'club': '드라이버', 'videos': ['0:25'],
         'memo': '어제보다 몸이 가벼웠어요.', 'comment': None},
    15: {'time': '60분', 'feel': '좋았음', 'club': '7번 아이언', 'videos': ['0:31', '0:24'],
         'memo': '하체부터 시작하니까 확실히 편했어요. 근데 마지막에 다시 팔로 치게 되네요.',
         'comment': '톱에서 왼팔이 접히는 건 팔 힘이 아니라 어깨 회전이 덜 돌아서 그래요. 영상 0:07 보시면…'},
    17: {'time': '40분', 'feel': '보통', 'club': '드라이버', 'videos': ['0:23'],
         'memo': '바람이 있어서 평소보다 낮게 맞았어요.', 'comment': None},
    20: {'time': '45분', 'feel': '좋았음', 'club': '아이언', 'videos': ['0:20'],
         'memo': '스코어 연습장에서 라운드 흉내내며 쳤어요.', 'comment': None},
}


def build_practice_data():
    days = {}
    for d, c in DAY_CONTENT.items():
        days[str(d)] = {
            'label': f'7월 {d}일 ({weekday_of(d)})',
            'time': c['time'], 'feel': c['feel'], 'club': c['club'],
            'videos': c['videos'], 'memo': c['memo'],
            'comment': ({'preview': c['comment'], 'when': f'7월 {d}일 받음'} if c['comment'] else None),
        }
    order = sorted(DAY_CONTENT)
    return {'today': R.TODAY, 'feedbackDay': R.FEEDBACK, 'order': order, 'days': days}


if __name__ == '__main__':
    path = os.path.join(HERE, 'screens-v3.json')
    screens = json.load(open(path, encoding='utf-8'))
    by = {s['id']: s for s in screens}
    for sid, title, group, html in SCREENS:
        by[sid] = {'id': sid, 'file': 'practice_screens.py', 'title': title,
                   'group': group, 'html': html, 'holes': False}
        print(f'  {sid}  {title:20} {len(html) / 1024:.1f} KB')
    ORDER = [s['id'] for s in screens]
    for sid, *_ in SCREENS:
        if sid not in ORDER:
            ORDER.insert(ORDER.index('2b') + 1, sid)
    json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f'\n총 {len(ORDER)}개 화면')

    data_path = os.path.join(HERE, 'practice-data.json')
    json.dump(build_practice_data(), open(data_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'practice-data.json ({len(DAY_CONTENT)}일치)')
