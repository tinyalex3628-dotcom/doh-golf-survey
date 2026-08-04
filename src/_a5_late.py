import json
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
def one(h, a, b):
    assert h.count(a) == 1, a[:60]
    return h.replace(a, b)

# ① 늦어지면 어떻게 되는지 — 기다리는 사람이 제일 궁금한 것이다
h = D['pc2']['html']
h = one(h, '<span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">보통 하루 안에 도착해요</span></span>',
           '<span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">보통 하루 안에 도착해요</span>'
           '<span style="font-size:11px;font-weight:500;color:var(--ns-ink3);line-height:1.5">'
           '하루가 지나면 알림으로 알려드리고, 횟수는 돌려드려요.</span></span>')
D['pc2']['html'] = h

# ② 안 쓴 횟수가 넘어가는지 — 월말에 제일 억울해지는 자리다
h = D['2i']['html']
h = one(h, '<span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">2회 받음 · 4회 남음</span>',
           '<span style="font-size:11px;font-weight:500;color:var(--ns-ink3)">2회 받음 · 4회 남음</span>'
           '<span data-cm-carry style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);'
           'line-height:1.5">남은 횟수는 이번 달까지예요</span>')
D['2i']['html'] = h

# ③ 정기 피드백이 늦어질 때도 같은 약속을 한다
h = D['2f']['html']
h = one(h, '          7월 27일 (월) 도착 예정</span></span>',
           '          7월 27일 (월) 도착 예정</span>'
           '<span style="font-size:10.5px;font-weight:500;color:var(--ns-ink3)">'
           '늦어지면 미리 알려드려요</span></span>')
D['2f']['html'] = h
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
print('ok')
