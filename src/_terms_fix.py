import json, re
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
P_KO = {'P1':'어드레스','P2':'테이크백','P3':'왼팔 수평','P4':'톱','P5':'다운 시작',
        'P6':'클럽 수평','P7':'임팩트','P8':'릴리즈'}
n = 0
# ① 11 멀티스크린 비교 — 8구간 라벨이 P1~P8 이었다
h = D['11']['html']
for k, v in P_KO.items():
    a = 'border-radius: 7px;">%s</span>' % k
    assert h.count(a) == 1, k
    h = h.replace(a, 'border-radius: 7px;">%s</span>' % v); n += 1
# 여덟 칸에 우리말이 들어가면 12px 로는 넘친다
h = h.replace('text-align: center; font-size: 12px; font-weight: 400; color: rgba(231, 240, 255, 0.5); padding: 6px 0px; border-radius: 7px;',
              'text-align: center; font-size: 9.5px; font-weight: 500; letter-spacing:-.03em; color: rgba(231, 240, 255, 0.5); padding: 6px 1px; border-radius: 7px;')
h = h.replace('text-align: center; font-size: 12px; font-weight: 400; color: var(--ns-white); background: var(--ns-green); padding: 6px 0px; border-radius: 7px;',
              'text-align: center; font-size: 9.5px; font-weight: 700; letter-spacing:-.03em; color: var(--ns-white); background: var(--ns-green); padding: 6px 1px; border-radius: 7px;')
D['11']['html'] = h

# ② 12 — 'P1–P10 자세를 하나씩 학습'
h = D['12']['html']
a = '>P1–P10 자세를 하나씩 학습<'
assert h.count(a) == 1
D['12']['html'] = h.replace(a, '>어드레스부터 피니시까지 한 구간씩<'); n += 1

# ③ pc1 · pc3 사진 위 라벨 'P4 · TOP'
for i in ('pc1', 'pc3'):
    h = D[i]['html']
    assert h.count('P4 · TOP') == 1, i
    D[i]['html'] = h.replace('P4 · TOP', '톱'); n += 1

left = []
for s in d:
    t = re.sub(r'<[^>]+>', ' ', s['html'])
    if re.search(r'(^|[^A-Za-z])P(10|[1-9])([^0-9A-Za-z]|$)', t): left.append(s['id'])
print('바꾼 곳', n, '· 남은 P코드 화면:', left)
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
