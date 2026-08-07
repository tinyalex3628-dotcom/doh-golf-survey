# -*- coding: utf-8 -*-
"""NEXT SWING 관리자 콘솔 → 단일 HTML"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'handoff-v3', 'design_handoff_next_swing')
OUT = os.path.join(HERE, 'nextswing-admin.html')

fonts = open(os.path.join(SRC, 'board-fonts.css'), encoding='utf-8').read()
patch = open(os.path.join(HERE, 'font-patch.css'), encoding='utf-8').read()
data = open(os.path.join(HERE, 'admin-data.js'), encoding='utf-8').read()
rt = open(os.path.join(HERE, 'admin-runtime.js'), encoding='utf-8').read()
# 서버 — 회원 앱과 같은 연결 코드를 그대로 쓴다
sb_lib = open(os.path.join(HERE, 'supabase-umd.js'), encoding='utf-8').read()
sb_app = open(os.path.join(HERE, 'sb.js'), encoding='utf-8').read()
inbox = open(os.path.join(HERE, 'admin-inbox.js'), encoding='utf-8').read()
# 회원 명부 — 서버 데이터에서 상태(새싹·활성·침묵…)를 계산해 그린다
crm = open(os.path.join(HERE, 'admin-crm.js'), encoding='utf-8').read()
# 월간 요약 — 숫자와 반복 주제는 기계가, 마지막 한 줄은 프로가
rev = open(os.path.join(HERE, 'admin-review.js'), encoding='utf-8').read()

CSS = """
/* 회원 앱과 같은 토큰을 쓴다. 프로가 보는 화면과 회원이 보는 화면의 색이
   달라지면, 프로가 '회원에게 뭐가 어떻게 보이는지'를 머릿속으로 못 그린다. */
:root{
  --ns-ink:#1D2420; --ns-ink2:#4A4638; --ns-ink3:#686253;
  --ns-green:#21402F; --ns-green2:#1D4534; --ns-bronze:#7D5D2E; --ns-danger:#C0392B;
  --ns-bg:#F3EFE8; --ns-card:#FFFDF9; --ns-sand:#EFE9DE; --ns-line:#E4DED2;
  --ns-soft:#F2F8F4; --ns-white:#FFFFFF;
  --font-num:'Pretendard',-apple-system,sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#E9E5DD;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;
  color:var(--ns-ink);-webkit-font-smoothing:antialiased}
button,textarea{font-family:inherit}

.top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:12px;
  padding:11px 18px;background:#1F2A22;color:#EDEDE8}
.top b{font-size:13px;font-weight:700;letter-spacing:.04em}
.top .sub{font-size:11px;font-weight:400;color:rgba(237,237,232,.62)}
.vtab{font-size:12px;font-weight:600;color:rgba(237,237,232,.62);background:transparent;
  border:1px solid rgba(237,237,232,.24);border-radius:8px;padding:6px 13px;cursor:pointer}
.vtab.on{color:#1F2A22;background:#EDEDE8;border-color:#EDEDE8}
html.demo .top{display:none}

/* flex + justify-content:center 로 감싸면, 안쪽 3단이 max-content 로 부풀어
   왼쪽이 화면 밖으로 잘려 나간다. 가운데 정렬은 margin 으로 한다. */
.wrap{padding:14px}
html.pcmode,html.pcmode body{height:100%;overflow:hidden}
html.pcmode .wrap{padding:0}
/* PC — 창을 통째로 쓴다. 프로가 하루에 열 명씩 답하는 작업대라,
   가운데 좁은 상자에 가둬 놓으면 지난 한마디가 계속 잘려서 매번 눌러 봐야 한다. */
.pcbox{width:100%;min-width:0;height:calc(100vh - 47px);min-height:560px;
  background:var(--ns-bg);overflow:hidden}
html.demo .pcbox{height:100vh}
/* 모바일 — 회원 앱 프로토타입과 같은 크기 */
.mobox{width:390px;margin:14px auto;height:760px;background:var(--ns-bg);border:1px solid #DDD6C8;
  border-radius:30px;overflow:hidden;box-shadow:0 18px 44px -26px rgba(38,40,42,.4)}
/* 진짜 폰에서 열면 이 틀 자체가 화면보다 넓어 가로로 밀린다.
   폰에서는 액자를 걷고 화면을 통째로 쓴다. */
@media (max-width:430px){
  .wrap{padding:0}
  .mobox{width:100%;margin:0;height:100vh;height:100dvh;border:0;border-radius:0;box-shadow:none}
}

#toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,14px);z-index:80;
  background:#1F2A22;color:#EDEDE8;font-size:12.5px;font-weight:500;border-radius:11px;
  padding:12px 18px;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s}
#toast.show{opacity:1;transform:translate(-50%,0)}

.vbtn{flex:none;padding:8px 12px;border-radius:9px;border:1px solid var(--ns-line);
  background:var(--ns-card);font-size:11.5px;font-weight:700;color:var(--ns-ink2);
  cursor:pointer;user-select:none}
.vbtn:active{opacity:.7}
.vbtn-on{background:var(--ns-green);border-color:var(--ns-green);color:#fff}
input[type=range]{height:26px}

textarea::placeholder{color:#A9A392}
::-webkit-scrollbar{width:9px;height:9px}
::-webkit-scrollbar-thumb{background:#D5CEC0;border-radius:9px;border:2px solid transparent;
  background-clip:content-box}
"""

html = f"""<script>
if (/[?&]demo(=|&|$)/.test(location.search)) document.documentElement.classList.add('demo');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>NEXT SWING · 관리자 콘솔 (베타)</title>
<style>
{fonts}
{patch}
{CSS}
</style>

<div class="top">
  <b>NEXT SWING</b><span class="sub">관리자 · 이도형 프로</span>
  <span style="flex:1"></span>
  <button class="vtab on" data-v="pc">PC</button>
  <button class="vtab" data-v="mo">모바일</button>
</div>
<div class="wrap"><div id="frame"></div></div>
<div id="over"></div>
<div id="toast"></div>

<script>
{sb_lib}
</script>
<script>
{sb_app}
</script>
<script>
{data}
</script>
<script>
{inbox}
</script>
<script>
{crm}
</script>
<script>
{rev}
</script>
<script>
{rt}
</script>"""

open(OUT, 'w', encoding='utf-8').write(html)
print(f'관리자 콘솔 · {os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
