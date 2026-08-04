import json
p = 'screens-v3.json'
d = json.load(open(p)); D = {s['id']: s for s in d}

CELL = ('<span style="font-size:11px;font-weight:500;color:var(--ns-ink2);'
        'line-height:1.6">{}</span>')

def card(title, rows, tone):
    if tone == 'cm':
        box = 'background:rgba(166,124,61,.10);border:1px solid rgba(166,124,61,.28)'
        col = 'var(--ns-bronze)'
    elif tone == 'fb':
        box = 'background:var(--ns-soft);border:1px solid #DCE7DE'
        col = 'var(--ns-green)'
    else:
        box = 'background:var(--ns-sand);border:1px solid var(--ns-line)'
        col = 'var(--ns-ink2)'
    return ('<span style="flex:1;min-width:0;' + box + ';border-radius:12px;padding:12px 11px;'
            'display:flex;flex-direction:column;gap:6px">'
            '<span style="font-size:11.5px;font-weight:700;letter-spacing:-.02em;'
            'color:' + col + '">' + title + '</span>'
            + ''.join(CELL.format(r) for r in rows) + '</span>')

CM_ROWS = ['스윙 1개만', '글과 사진으로', '보통 하루 안', '월 2~6회']
FB_ROWS = ['한 달치 전부', '영상 리포트', '매달 27일쯤', '월 1회 · Elite']

def table(label, left, right):
    return ('<div style="flex:none;padding-top:20px">'
            '<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;'
            'color:var(--ns-ink3);padding:0 1px;display:block;margin-bottom:9px">' + label + '</span>'
            '<div style="display:flex;gap:8px">' + left + right + '</div></div>')

# ① cx — 색 규칙을 따른다. 여기 주인공은 프로 한마디니까 청동이다.
h = D['cx']['html']
old = h[h.find('<div style="flex:none;padding-top:20px"><span style="font-size:9.5px;font-weight:700;'
               'letter-spacing:.16em;color:var(--ns-ink3);padding:0 1px;display:block;'
               'margin-bottom:9px">정기 피드백과 뭐가 다른가요'):]
old = old[:old.find('<div style="flex:none;padding-top:22px')]
assert old, 'cx 비교표 못 찾음'
new = table('정기 피드백과 뭐가 다른가요',
            card('프로 한마디', CM_ROWS, 'cm'), card('정기 피드백', FB_ROWS, 'mute'))
D['cx']['html'] = h.replace(old, new)

# ② fx — 반대쪽에도 같은 표를 놓는다. 한쪽에만 있으면 잠금 띠로 fx 에 온 사람은 못 본다.
h = D['fx']['html']
anchor = '<div style="flex:none;padding-top:22px'
i = h.rfind(anchor)
assert i > 0, 'fx 버튼 블록 못 찾음'
D['fx']['html'] = h[:i] + table('프로 한마디와 뭐가 다른가요',
                                card('정기 피드백', FB_ROWS, 'fb'),
                                card('프로 한마디', CM_ROWS, 'mute')) + h[i:]

json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
print('ok')
