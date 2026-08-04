import json, re
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
# 검수 6번에서 r1 만 고쳤다. 결과지 나머지 장이 아직 '6월 레슨'이라 부르고 있었다.
REP = [
    ('No.06 · 6월 레슨', 'No.06 · 정기 피드백'),
    ('No.06 · 6월 레슨 · 6월 27일', 'No.06 · 정기 피드백 · 6월 27일'),
    ('NEXT · 7월 레슨', 'NEXT · 7월 정기 피드백'),
    ('6월 레슨은 여기까지.', '6월 피드백은 여기까지.'),
    ('7월 레슨 영상에서 답해드릴게요', '7월 피드백 영상에서 답해드릴게요'),
]
n = 0
for i in ('r1','r2','r3','r4','r6','r8'):
    h = D[i]['html']
    for a, b in REP:
        if a in h: n += h.count(a); h = h.replace(a, b)
    D[i]['html'] = h
left = [s['id'] for s in d if re.search(r'\d+월 레슨', re.sub(r'<[^>]+>','',s['html']))]
assert not left, left
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
print('바꾼 곳', n)
