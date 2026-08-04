import json
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
h = D['17']['html']
# 요금표에 '프로 한마디 월 2회' 라고만 적혀 있고 그게 뭔지는 어디에도 없었다.
# 카드 묶음 바로 밑에 두 설명 화면으로 가는 길을 놓는다.
anchor = '</div><div data-dc-tpl="42"'
i = h.find('data-plan-card="elite"')
j = h.find('</div>', h.find('맞춤 영상 피드백', i))
assert i > 0 and j > i, (i, j)
chip = ('font-size:11px;font-weight:700;padding:9px 11px;border:1px solid var(--ns-line);'
        'border-radius:9px;background:var(--ns-card);white-space:nowrap')
links = ('<div style="display:flex;gap:7px;padding-top:2px">'
         '<span data-plan-what="fb" style="' + chip + ';color:var(--ns-green)">정기 피드백이란 ›</span>'
         '<span data-plan-what="cm" style="' + chip + ';color:var(--ns-bronze)">프로 한마디란 ›</span>'
         '</div>')
h = h[:j+6] + links + h[j+6:]
D['17']['html'] = h
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1); print('ok')
