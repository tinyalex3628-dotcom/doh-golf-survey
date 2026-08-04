import json, re
p = 'screens-v3.json'
d = json.load(open(p))
D = {s['id']: s for s in d}
n = 0
# r4 — 목록 라벨도 r1 과 같은 말로
h = D['r4']['html']
h2 = h.replace('LESSON 01 · 프로 피드백', 'LESSON 01 · 정기 피드백')
assert h2 != h; D['r4']['html'] = h2; n += 1
# 17 — '프로 피드백' 은 이제 정기 피드백 하나를 가리키는 말이라, 총칭으로 쓰면 또 헷갈린다
h = D['17']['html']
h2 = h.replace('구독 플랜과 프로 피드백이 궁금하다면 여기서 시작해요.',
               '구독 플랜과 프로가 봐주는 방식이 궁금하다면 여기서 시작해요.')
assert h2 != h; D['17']['html'] = h2; n += 1
json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
print('patched', n)
