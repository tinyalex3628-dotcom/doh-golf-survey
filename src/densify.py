import re, sys

P = 'nextswing-proto.html'
src = open(P, encoding='utf-8').read()

start = src.index('<template data-scr="2a">')
end = src.rindex('</template>') + len('</template>')
head, body, tail = src[:start], src[start:end], src[end:]

stats = {}
def count(k, n=1): stats[k] = stats.get(k, 0) + n

# ── 1. 구조 교체: 하단 탭바 슬림화 + 활성탭 배경 박스 제거 ──
structural = [
  ('flex:none;height:78px;border-top:1px solid #eceef1;display:flex;padding:11px 4px 20px',
   'flex:none;height:60px;border-top:1px solid #eceef1;display:flex;padding:8px 4px 9px'),
  ('width:40px;height:26px;border-radius:9px;background:#e7f0ff', 'width:40px;height:24px'),
  ('flex:none;height:54px', 'flex:none;height:50px'),
  ('flex:none;height:56px', 'flex:none;height:52px'),
  # 아이콘 칩 축소
  ('width:32px;height:32px', 'width:28px;height:28px'),
  ('width:34px;height:34px', 'width:30px;height:30px'),
  ('width:40px;height:40px', 'width:34px;height:34px'),
  ('width:44px;height:44px', 'width:38px;height:38px'),
  ('width:48px;height:48px', 'width:40px;height:40px'),
]
for old, new in structural:
    n = body.count(old)
    body = body.replace(old, new)
    count('struct:' + old[:34], n)

# ── 2. 폰트 스케일 다운 (12.5px 이하는 유지 — 탭 라벨 11px 배선 보존) ──
FS = {'24':'22','22':'20','21':'19','20':'18','19':'17','18':'16.5','17':'16',
      '16':'15','15':'14','14.5':'13.5','14':'13','13.5':'12.5','13':'12.5'}
def fs(m):
    v = m.group(1)
    if v in FS:
        count('font-size', 1)
        return 'font-size:' + FS[v] + 'px'
    return m.group(0)
body = re.sub(r'font-size:([\d.]+)px', fs, body)

# ── 3. 라운드 축소 (폰 베젤 34px · 원형 50% · 8px 이하 유지) ──
BR = {'999':'9','24':'15','22':'14','20':'13','18':'12','16':'11','14':'10',
      '13':'10','12':'9','11':'8','10':'8','9':'7'}
def br(m):
    v = m.group(1)
    if v in BR:
        count('border-radius', 1)
        return 'border-radius:' + BR[v] + 'px'
    return m.group(0)
body = re.sub(r'border-radius:([\d.]+)px', br, body)

# ── 4. 패딩 타이트닝: 12px 이상 성분은 -2px ──
def pad(m):
    parts = m.group(1).split()
    out, changed = [], False
    for p in parts:
        v = float(p[:-2])
        if v >= 12:
            v -= 2; changed = True
        out.append(('%g' % v) + 'px')
    if changed: count('padding', 1)
    return 'padding:' + ' '.join(out)
body = re.sub(r'padding:((?:[\d.]+px)(?: [\d.]+px){0,3})(?=[;"])', pad, body)

# ── 5. 갭 축소 ──
GAP = {'15':'12','14':'11','13':'10','12':'10'}
def gp(m):
    v = m.group(1)
    if v in GAP:
        count('gap', 1)
        return 'gap:' + GAP[v] + 'px'
    return m.group(0)
body = re.sub(r'gap:(\d+)px', gp, body)

open(P, 'w', encoding='utf-8').write(head + body + tail)
for k in sorted(stats): print(f'{stats[k]:5d}  {k}')
