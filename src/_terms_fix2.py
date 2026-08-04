import json, re
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
n = 0
def rep(i, a, b, cnt=1):
    global n
    h = D[i]['html']
    assert h.count(a) == cnt, (i, a[:40], h.count(a))
    D[i]['html'] = h.replace(a, b); n += cnt

# ① 11 구간 라벨 — 내가 넣은 '테이크백 · 릴리즈'도 100타에겐 낯설다
rep('11', '>테이크백<', '>백스윙 시작<')
rep('11', '>릴리즈<', '>공 지난 뒤<')

# ② ar — 화면 제목은 '정기 피드백'인데 위 라벨만 영어였다
rep('ar', 'MONTHLY FEEDBACK · 7월호', '정기 피드백 · 7월호')

# ③ 숙제 설명 앞의 WHY — e3 는 이미 '왜 하나요'로 쓴다
for i in ('r1', 'r3', 'r4'):
    h = D[i]['html']
    c = h.count('>WHY<')
    if c: rep(i, '>WHY<', '>왜 하나요<', c)

json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
print('바꾼 곳', n)
