import json
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
# cx 안의 강조색도 프로 한마디 색으로. 초록을 쓰면 옆 화면(fx)과 같아 보인다.
h = D['cx']['html']
old_i = 'background:var(--ns-soft);color:var(--ns-green);'
new_i = 'background:rgba(166,124,61,.10);color:var(--ns-bronze);'
n = h.count(old_i); assert n == 4, n
h = h.replace(old_i, new_i)
# 맨 아래 '구독 플랜 보기' 링크도
old_l = 'font-weight:600;color:var(--ns-green)">구독 플랜 보기 ›'
assert h.count(old_l) == 1
h = h.replace(old_l, 'font-weight:600;color:var(--ns-bronze)">구독 플랜 보기 ›')
D['cx']['html'] = h
# 화면 이름도 앱에서 쓰는 말과 맞춘다 (개발용 범례)
for i, t in (('r1','정기 피드백 결과지'),):
    D[i]['title'] = t
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1); print('ok', n)
