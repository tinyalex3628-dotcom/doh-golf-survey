import json, re
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
n = 0
# 폼 라벨은 값이 우리말인데 이름만 영어였다. 앱 전체가 우리말인데 여기만 튄다.
LAB = {'>CLUB<': '>클럽<', '>TIME<': '>시간<', '>FEEL<': '>느낌<',
       '>PRO COMMENT<': '>프로 한마디<', '>vs ': '>↔ '}
for i in ('2b', 'pc1', 'pc2'):
    h = D[i]['html']
    for a, b in LAB.items():
        c = h.count(a)
        if c: h = h.replace(a, b); n += c
    D[i]['html'] = h
# 'vs' 는 글 한가운데 있어 태그 경계로 못 잡는다
h = D['pc1']['html']
c = h.count('7월 15일 vs 오늘')
if c: h = h.replace('7월 15일 vs 오늘', '7월 15일 ↔ 오늘'); n += c
D['pc1']['html'] = h
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
print('바꾼 곳', n)
