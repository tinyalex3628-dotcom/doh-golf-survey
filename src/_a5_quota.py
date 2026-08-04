import json
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}
def one(h, a, b):
    assert h.count(a) == 1, a[:70]
    return h.replace(a, b)

RULES = [
    ('요청하면 그때 한 번 차감돼요', '누를 때 한 번 빠집니다. 답이 오면 그걸로 끝이에요.'),
    ('안 쓴 횟수는 다음 달로 안 넘어가요', '이번 달 안 쓰면 사라져요. 이월은 없습니다.'),
    ('48시간 안에 답이 없으면 돌려드려요', '프로가 늦은 거니까 횟수를 되돌려 드려요.'),
    ('돌려받기 전에 달이 바뀌었다면 2회를 더 드려요',
     '되돌려 받은 횟수가 달을 넘겨 사라졌다면, 다음 달에 2회를 얹어 드립니다.'),
]
rows = ''.join(
    '<div style="display:flex;gap:9px;padding:9px 0' + ('' if i == 0 else ';border-top:1px solid #F2ECE2') + '">'
    '<span style="flex:none;width:5px;height:5px;border-radius:50%;background:var(--ns-bronze);'
    'margin-top:6px"></span>'
    '<span style="flex:1;display:flex;flex-direction:column;gap:2px">'
    '<span style="font-size:12px;font-weight:600;color:var(--ns-ink);line-height:1.5">' + t + '</span>'
    '<span style="font-size:11px;font-weight:400;color:var(--ns-ink2);line-height:1.6">' + s + '</span>'
    '</span></div>'
    for i, (t, s) in enumerate(RULES))
block = ('<div style="flex:none;padding-top:20px">'
         '<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--ns-ink3);'
         'padding:0 1px;display:block;margin-bottom:9px">횟수는 이렇게 셉니다</span>'
         '<div data-cm-rules style="background:var(--ns-card);border:1px solid var(--ns-line);'
         'border-radius:12px;padding:3px 14px 5px">' + rows + '</div></div>')

h = D['cx']['html']
anchor = '<div style="flex:none;padding-top:20px"><span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--ns-ink3);padding:0 1px;display:block;margin-bottom:9px">정기 피드백과 뭐가 다른가요'
assert h.count(anchor) == 1
D['cx']['html'] = h.replace(anchor, block + anchor)

# 쓰는 자리에는 한 줄씩만. 자세한 건 설명 화면으로 보낸다.
h = D['2i']['html']
D['2i']['html'] = one(h, '<span data-cm-carry style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);'
                        'line-height:1.5">남은 횟수는 이번 달까지예요</span>',
                        '<span data-cm-carry style="font-size:10.5px;font-weight:500;color:var(--ns-ink3);'
                        'line-height:1.5">안 쓰면 사라져요 · 이월 안 됨 <span data-cm-rule-go '
                        'style="font-weight:700;color:var(--ns-bronze)">횟수 규칙 ›</span></span>')

h = D['pc2']['html']
D['pc2']['html'] = one(h, '하루가 지나면 알림으로 알려드리고, 횟수는 돌려드려요.',
                          '48시간 안에 답이 없으면 횟수를 돌려드려요.')
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
print('ok')
