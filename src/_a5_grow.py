import json
p='screens-v3.json'; d=json.load(open(p)); D={s['id']:s for s in d}

# ── 마이(2e) ────────────────────────────────────────────────────
h = D['2e']['html']

# ① 통계 3칸 밑에 '지난달보다' 한 줄. 활동량만 있고 늘었는지가 없었다.
anchor = '            <div data-dc-tpl="81" style="flex: 0 0 auto; display: flex; flex-direction: column; gap: 10px;">'
assert h.count(anchor) == 1
diff = ('<span data-mo-diff style="display:flex;align-items:center;gap:6px;padding:0 2px;'
        'font-size:11.5px;font-weight:500;color:var(--ns-ink2);line-height:1.5">'
        '<span style="flex:none;color:var(--ns-green);font-weight:700">지난달보다</span>'
        '<span style="flex:1;min-width:0">연습 3일 · 영상 4개 늘었어요</span></span>')

# ② '그래서 내가 늘었나'에 답하는 자리. 지금까지는 리포트를 열어야만 알 수 있었다.
grow = ('<div data-grow style="flex:0 0 auto;display:flex;flex-direction:column;gap:10px">'
        '<span style="font-size:14px;font-weight:600;letter-spacing:-.02em;color:var(--ns-ink)">'
        '프로가 짚어온 것</span>'
        '<div data-grow-card style="background:var(--ns-card);border:1px solid var(--ns-line);'
        'border-radius:12px;padding:13px 14px;display:flex;flex-direction:column;gap:9px">'
        '<div style="display:flex;align-items:baseline;gap:8px">'
        '<span data-grow-t style="flex:1;font-size:12.5px;font-weight:600;color:var(--ns-ink);'
        'line-height:1.5">5개월째 함께 만들고 있어요</span>'
        '<span data-grow-go style="flex:none;font-size:11px;font-weight:700;'
        'color:var(--ns-green)">여정 보기 ›</span></div>'
        '<div data-grow-chips style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">'
        '</div></div></div>')
h = h.replace(anchor, '            ' + diff + '\n            ' + grow + '\n' + anchor)

# ③ 결제일마다 고민하는 사람인데, 다음 결제일이 앱 어디에도 없었다
mp = '프로 한마디 6회</span>\n              </div>\n            </div>'
assert h.count(mp) == 1
h = h.replace(mp, '프로 한마디 6회</span>\n              </div>'
    '<div data-pay-next style="display:flex;align-items:center;gap:8px;margin-top:11px;'
    'padding-top:11px;border-top:1px solid rgba(255,255,255,.16)">'
    '<span style="flex:1;font-size:11px;font-weight:500;color:rgba(255,255,255,.72)">다음 결제일</span>'
    '<span data-pay-when style="font-size:11.5px;font-weight:700;color:#FFFFFF">'
    '8월 25일 · 79,000원</span></div>\n            </div>')
D['2e']['html'] = h
json.dump(d, open(p,'w'), ensure_ascii=False, indent=1)
print('2e ok')
