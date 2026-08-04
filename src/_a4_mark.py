import json, re
p = 'screens-v3.json'; d = json.load(open(p)); D = {s['id']: s for s in d}
def sub1(h, old, new, tag=''):
    assert h.count(old) == 1, (tag, h.count(old), old[:70])
    return h.replace(old, new)

# ── 17 ──────────────────────────────────────────────────────────
h = D['17']['html']
h = sub1(h, '<div style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px; border: 1px dashed var(--ns-line); background: transparent; border-radius: 12px;">',
            '<div data-plan-card="free" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px; border: 1px dashed var(--ns-line); background: transparent; border-radius: 12px;">', '17free')
h = sub1(h, '<div data-dc-tpl="27" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px;',
            '<div data-plan-card="basic" data-dc-tpl="27" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px;', '17basic')
h = sub1(h, '<div data-dc-tpl="32" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px;',
            '<div data-plan-card="coaching" data-dc-tpl="32" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px;', '17coach')
h = sub1(h, '<div data-dc-tpl="38" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px;',
            '<div data-plan-card="elite" data-dc-tpl="38" style="display: flex; flex-direction: column; gap: 5px; padding: 13px 14px;', '17elite')
h = sub1(h, '<span data-dc-tpl="35" style="margin-left: 7px;',
            '<span data-plan-now data-dc-tpl="35" style="margin-left: 7px;', '17badge')
h = sub1(h, '>플랜 가입 · 문의하기<', ' data-plan-cta>플랜 가입 · 문의하기<'.replace('>플', '>플'), '17cta') \
    if False else h
h = sub1(h, '<span data-dc-tpl="67" style="display: block; background: var(--ns-green);',
            '<span data-plan-cta data-dc-tpl="67" style="display: block; background: var(--ns-green);', '17cta')
D['17']['html'] = h

# ── 18 ──────────────────────────────────────────────────────────
h = D['18']['html']
h = sub1(h, '<div style="border: 1px dashed var(--ns-line); border-radius: 11px; padding: 16px;',
            '<div data-plan-card="free" style="border: 1px dashed var(--ns-line); border-radius: 11px; padding: 16px;', '18free')
for tpl, k in (('24', 'basic'), ('31', 'coaching'), ('42', 'elite')):
    h = sub1(h, '<div data-dc-tpl="%s" style="border:' % tpl,
                '<div data-plan-card="%s" data-dc-tpl="%s" style="border:' % (k, tpl), '18' + k)
h = sub1(h, '<span data-dc-tpl="22" style="font-size: 13px; color: var(--ns-ink2); line-height: 1.55;">지금은 Elite를 쓰고 있어요.</span>',
            '<span data-plan-line data-dc-tpl="22" style="font-size: 13px; color: var(--ns-ink2); line-height: 1.55;">지금은 Elite를 쓰고 있어요.</span>', '18line')
h = sub1(h, '<span data-dc-tpl="35" style="font-size: 12px;',
            '<span data-plan-now data-dc-tpl="35" style="font-size: 12px;', '18badge')
h = sub1(h, '<span data-dc-tpl="52" style="display: block; background: var(--ns-green);',
            '<span data-plan-cta data-dc-tpl="52" style="display: block; background: var(--ns-green);', '18cta')
D['18']['html'] = h

# ── 22 · 23 · 24 — 고른 플랜을 따라간다 ─────────────────────────
h = D['22']['html']
h = sub1(h, '<span data-dc-tpl="32" style="font-size:12px; font-weight: 600; color: var(--ns-ink);">Elite · 월 79,000원</span>',
            '<span data-buy-np data-dc-tpl="32" style="font-size:12px; font-weight: 600; color: var(--ns-ink);">Elite · 월 79,000원</span>', '22np')
# 환불 한 줄 — 결제 직전이 제일 망설이는 자리다
h = sub1(h, '<div style="display:flex;align-items:baseline"><span style="flex:1;font-size:12px;color:var(--ns-ink2)">해지</span>',
            '<div style="display:flex;align-items:baseline"><span style="flex:1;font-size:12px;color:var(--ns-ink2)">환불</span>'
            '<span style="font-size:12px;font-weight:600;color:var(--ns-ink)">7일 안 · 리포트 안 받았으면 전액</span></div>'
            '<div style="display:flex;align-items:baseline"><span style="flex:1;font-size:12px;color:var(--ns-ink2)">해지</span>', '22refund')
D['22']['html'] = h

h = D['23']['html']
h = sub1(h, '<span data-dc-tpl="34" style="flex: 1 1 0%; font-size:12px; color: var(--ns-ink2);">Elite</span>',
            '<span data-buy-name data-dc-tpl="34" style="flex: 1 1 0%; font-size:12px; color: var(--ns-ink2);">Elite</span>', '23name')
h = sub1(h, '<span data-dc-tpl="35" style="font-size:12px; color: var(--ns-ink2);">월 79,000원</span>',
            '<span data-buy-price data-dc-tpl="35" style="font-size:12px; color: var(--ns-ink2);">월 79,000원</span>', '23price')
h = sub1(h, '<span data-dc-tpl="39" style="font-size:16px; font-weight: 600; letter-spacing: -0.02em; color: var(--ns-ink);">79,000원</span>',
            '<span data-buy-total data-dc-tpl="39" style="font-size:16px; font-weight: 600; letter-spacing: -0.02em; color: var(--ns-ink);">79,000원</span>', '23total')
i = h.find('79,000원 결제하기')
j = h.rfind('<span', 0, i)
h = h[:j] + '<span data-buy-btn' + h[j + 5:]
D['23']['html'] = h

h = D['24']['html']
h = sub1(h, '<span data-dc-tpl="18" style="font-size: 19px;',
            '<span data-buy-done data-dc-tpl="18" style="font-size: 19px;', '24done')
h = sub1(h, '<span data-dc-tpl="25" style="font-size:12px; font-weight: 600; color: var(--ns-ink);">79,000원</span>',
            '<span data-buy-total data-dc-tpl="25" style="font-size:12px; font-weight: 600; color: var(--ns-ink);">79,000원</span>', '24total')
D['24']['html'] = h

# ── tm — 무료 회원에겐 해지할 결제가 없다 ───────────────────────
h = D['tm']['html']
h = sub1(h, '<span style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--ns-ink3);padding:0 1px;display:block;margin-bottom:9px">지금 결제</span>',
            '<span data-tm-paylabel style="font-size:9.5px;font-weight:700;letter-spacing:.16em;color:var(--ns-ink3);padding:0 1px;display:block;margin-bottom:9px">지금 결제</span>', 'tmlabel')
h = sub1(h, '<span style="flex:1;font-size:12.5px;font-weight:600;color:var(--ns-ink);line-height:1.5">Elite · 월 79,000원</span>',
            '<span data-buy-np style="flex:1;font-size:12.5px;font-weight:600;color:var(--ns-ink);line-height:1.5">Elite · 월 79,000원</span>', 'tmnp')
h = sub1(h, '<div style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:14px;padding:5px 15px 7px"><div style="display:flex;align-items:baseline;gap:10px;padding:9px 0"><span style="flex:none;width:74px;font-size:11.5px;font-weight:500;color:var(--ns-ink3)">플랜</span>',
            '<div data-tm-pay style="background:var(--ns-card);border:1px solid var(--ns-line);border-radius:14px;padding:5px 15px 7px"><div style="display:flex;align-items:baseline;gap:10px;padding:9px 0"><span style="flex:none;width:74px;font-size:11.5px;font-weight:500;color:var(--ns-ink3)">플랜</span>', 'tmpay')
D['tm']['html'] = h

json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
print('마커 완료')
