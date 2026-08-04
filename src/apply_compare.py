# -*- coding: utf-8 -*-
"""8번 적용 + 10번 정리.

   8번  스윙 탭에 '그때와 지금 나란히 보기' 배너 → 팝업(cg) → 11 멀티스크린 비교
   10번 아무 데서도 못 가는 화면 정리
"""
import json, os, sys
import compare_period as CP

HERE = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(HERE, 'screens-v3.json')
S = json.load(open(path, encoding='utf-8'))
by = {s['id']: s for s in S}

# ── ① 스윙 탭(09)에 배너 한 줄 ──────────────────────────────────────
h9 = by['09']['html']
ANCHOR = '나란히 놓고 보기</span></span></span></div></div>'
assert h9.count(ANCHOR) == 1, '09 도구 줄 끝을 못 찾음'
h9 = h9.replace(ANCHOR, '나란히 놓고 보기</span></span></span></div>' + CP.banner() + '</div>')
by['09']['html'] = h9
print('① 09 배너 삽입')

# ── ② cg — 흐린 스윙 탭 위에 뜨는 기간 고르기 팝업 ──────────────────
o = h9.index('>') + 1
head, inner = h9[:o], h9[o:h9.rindex('</div>')]
assert 'position: relative' not in head
head = head.replace('display: flex;', 'position: relative; display: flex;', 1)
cg = (head
      + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;filter:blur(3.5px)">'
      + inner + '</div>' + CP.modal() + '</div>')
by['cg'] = {'id': 'cg', 'file': 'compare_period.py', 'title': '기간 비교 · 언제와 비교할까요',
            'group': '영상 분석', 'html': cg, 'holes': False}
print(f'② cg 생성 ({len(cg)/1024:.1f} KB)')

# ── ③ 11 멀티스크린 비교 — 날짜 자리에 표식을 박는다 ────────────────
h11 = by['11']['html']
assert h11.count('>비교 도구<') == 1
h11 = h11.replace('>비교 도구<', '>기간 비교<')   # 이제 여기로 오는 길은 기간 비교 하나뿐이다
REP = [('>6월 28일 ↔ 7월 22일 · 정면<', 'data-cmp-sub', '11 부제'),
       ('>과거 6/28<', 'data-cmp-old', '11 과거 라벨'),
       ('>현재 7/22<', 'data-cmp-new', '11 현재 라벨')]
for txt, attr, name in REP:
    assert h11.count(txt) == 1, name + ' 못 찾음'
    h11 = h11.replace(txt, ' ' + attr + txt)
by['11']['html'] = h11
print('③ 11 날짜 표식 3개')

# ── ④ 안 쓰는 화면 정리 ─────────────────────────────────────────────
#   지우는 기준은 하나다 — '앱 안에 이미 같은 일을 하는 화면이 있다'.
#   갈 길이 없을 뿐 하는 일이 따로 있는 화면(uf·ge·r3·r4·r6)은 안 지우고 길을 냈다.
DROP = {
    '10': '단독 분석 — 실제 엔진 화면(sw)이 같은 일을 진짜 영상으로 한다',
    '15': '프로 + 내 스윙 비교 — 12 허브가 이미 sw 비교 모드로 보낸다',
    '6c': '피드백 도착 탭 전환형 — 6d로 확정된 시안의 탈락안',
    'np': '푸시 문구 시안 — 앱 화면이 아니라 문구 보드(03-알림설계.md에 남음)',
}
ORDER = [s['id'] for s in S]
for d, why in DROP.items():
    assert d in by, d
    del by[d]; ORDER.remove(d)
    print(f'④ 삭제 {d} — {why}')

ORDER.insert(ORDER.index('11') + 1, 'cg')
json.dump([by[i] for i in ORDER], open(path, 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'\n총 {len(ORDER)}개 화면')
