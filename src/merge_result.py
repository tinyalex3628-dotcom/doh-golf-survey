# -*- coding: utf-8 -*-
"""새로 받은 결과지 9화면을 프로토타입 화면 목록에 병합한다.
   - 09 AI 분석 결과지 → 기존 07 교체
   - 01~08 프로 피드백 결과지 → 기존 2f-1 교체 (+ 상태 변형은 별도 화면으로도 등록)"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
UP = '/root/.claude/uploads/d3216ad2-682b-54dc-9e94-3ee7aa248ea5'

# 파일 → (화면ID, 제목, 그룹)
NEW = [
    ('99ad9841-01resultdefault.html',        'r1', '프로 피드백 결과지',       '정규레슨 결과지'),
    ('2f86fc8e-02resultjourneyopen.html',    'r2', '결과지 · 여정 펼침',       '정규레슨 결과지'),
    ('4dac4b0d-03resulthomeworkchecked.html','r3', '결과지 · 숙제 완료',       '정규레슨 결과지'),
    ('737879b9-04resultfirstlesson.html',    'r4', '결과지 · 첫 레슨',         '정규레슨 결과지'),
    ('9d0998c4-05resultloading.html',        'r5', '결과지 · 불러오는 중',     '정규레슨 결과지'),
    ('1803aada-06resulterrorexpired.html',   'r6', '결과지 · 링크 만료',       '정규레슨 결과지'),
    ('25f15809-07photocomparefullscreen.html','r7','사진 비교 크게 보기',      '정규레슨 결과지'),
    ('6f9e1005-08questionsubmitted.html',    'r8', '결과지 · 질문 남긴 뒤',    '정규레슨 결과지'),
    ('f54ea96b-09aianalysis.html',           '07', 'AI 분석 결과',            '허브 · AI 설문'),
]

def frame(path):
    """폰 프레임 div 만 잘라낸다 (중첩 div 를 세어 정확히 닫는 지점을 찾는다)."""
    s = open(path, encoding='utf-8').read()
    m = re.search(r'<div style="width:360px;height:720px;', s)
    assert m, path
    i = m.start()
    depth, j = 0, i
    for tag in re.finditer(r'<(/?)div\b', s[i:]):
        depth += -1 if tag.group(1) else 1
        if depth == 0:
            j = i + tag.end()
            j = s.index('>', j) + 1
            break
    html = s[i:j]
    # 프레임 높이를 기존 화면(740)에 맞춘다 — 전환할 때 프레임이 튀지 않도록
    html = html.replace('width:360px;height:720px;', 'width:360px;height:740px;', 1)
    return html

screens = json.load(open(os.path.join(HERE, 'screens-v3.json'), encoding='utf-8'))
by = {s['id']: s for s in screens}

for fn, sid, title, group in NEW:
    by[sid] = {'id': sid, 'file': fn, 'title': title, 'group': group,
               'html': frame(os.path.join(UP, fn)), 'holes': False}
    print(f'  {sid:4} {title:22} {len(by[sid]["html"])/1024:5.1f} KB')

# 2f-1 (구 정규레슨 상세) 는 r1 로 대체 — 역할이 정확히 같다
removed = by.pop('2f-1', None)
print(f'\n교체: 2f-1 (구 정규레슨 상세) → r1' if removed else '')
print(f'교체: 07 (구 AI 결과) → 새 AI 분석 결과지')

ORDER = ['2a','2b','2c','2g','2f','2h','2e','01','02','03','04','05','06','07',
         'r1','r2','r3','r4','r5','r6','r7','r8',
         '08','09','10','11','12','13','14','15','16','17','18','19','22','23','24','6c','6d']
out = [by[i] for i in ORDER if i in by]
missing = [i for i in by if i not in ORDER]
assert not missing, missing
json.dump(out, open(os.path.join(HERE, 'screens-v3.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'\n최종 {len(out)}개 화면')
