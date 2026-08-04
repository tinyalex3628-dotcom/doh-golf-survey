# -*- coding: utf-8 -*-
"""핸드오프 v3 → 동작 프로토타입 단일 HTML 빌드"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'handoff-v3', 'design_handoff_next_swing')
OUT = os.path.join(HERE, 'nextswing-v3.html')

screens = json.load(open(os.path.join(HERE, 'screens-v3.json'), encoding='utf-8'))
fonts = open(os.path.join(SRC, 'board-fonts.css'), encoding='utf-8').read()
# 연습기록 재설계가 쓰는 글자 중 board-fonts.css 서브셋에 없던 9자를 보강한 패치.
# 같은 family·weight 로 두 번째 @font-face 를 선언하면, 브라우저가 앞 얼굴에 없는
# 글리프만 이 얼굴에서 자동으로 찾아 쓴다 (나눔명조 폴백에도 썼던 방식).
font_patch = open(os.path.join(HERE, 'font-patch.css'), encoding='utf-8').read()
# 베타 안내 문구에 새로 나온 7자 — font_patch_beta.py 가 만든다
font_patch += open(os.path.join(HERE, 'font-patch-beta.css'), encoding='utf-8').read()
# 연습기록 재설계 — 그날 하루(2d) 가 참조하는 날짜별 더미 데이터
practice_data = json.load(open(os.path.join(HERE, 'practice-data.json'), encoding='utf-8'))
# 스윙 보관함 — 진짜 영상 파일을 담는 곳 (IndexedDB). 런타임보다 먼저 실려야 한다
vault = open(os.path.join(HERE, 'vault.js'), encoding='utf-8').read()
# 서버 — supabase 라이브러리 원본 + 우리 연결 코드.
# CDN 을 못 쓰는 자리(아티팩트)가 있어 통째로 싣는다.
sb_lib = open(os.path.join(HERE, 'supabase-umd.js'), encoding='utf-8').read()
sb_app = open(os.path.join(HERE, 'sb.js'), encoding='utf-8').read()
runtime = open(os.path.join(HERE, 'runtime-v3.js'), encoding='utf-8').read()
# 베타 안내 — 입구 한 장 + 상태바에 붙는 「베타」 표식
beta = open(os.path.join(HERE, 'beta-gate.js'), encoding='utf-8').read()
# 스윙분석 엔진 — 원본 3파일을 그대로 번들한 것 (코드 수정 없음, 별칭 경로만 상대경로로)
swing_css = open(os.path.join(HERE, 'swbuild', 'components', 'swing', 'swing.css'), encoding='utf-8').read()
swing_js = open(os.path.join(HERE, 'swbuild', 'swing.bundle.js'), encoding='utf-8').read()
engine_js = open(os.path.join(HERE, 'engine-runtime.js'), encoding='utf-8').read()
# 엔진 계약 — 저장소 engine-stable 브랜치의 정본을 그대로 싣는다
doh = {
    'rules': json.load(open(os.path.join(HERE, 'engine', 'doh_rules.v1.json'), encoding='utf-8'))['rules'],
    'example': json.load(open(os.path.join(HERE, 'engine', 'doh.vision.v1.example.json'), encoding='utf-8')),
}

META = {s['id']: {'title': s['title'], 'group': s['group']} for s in screens}

tpls = ''
for s in screens:
    html = s['html']
    html = re.sub(r'\sdata-dc-tpl="\d+"', '', html)   # 목업 런타임 잔재 제거
    tpls += f'<template data-scr="{s["id"]}">{html}</template>\n'

CSS = """
/* ── 앱 디자인 토큰 ──────────────────────────────────────────────────
   화면 HTML 은 전부 인라인 스타일이라, 지금까지 색을 바꾸려면 수백 군데를
   손으로 찾아야 했다. 자주 쓰는 색만 변수로 뽑았다 — 여기 한 줄만 바꾸면
   52개 화면이 같이 바뀐다.
   (세그먼트 바 #F1EDE4 등 런타임이 문자열로 찾는 색은 일부러 남겨뒀다) */
:root{
  --ns-ink:#1D2420;      /* 제목            */
  --ns-ink2:#4A4638;     /* 본문            */
  --ns-ink3:#686253;     /* 보조 · 흐림      */
  --ns-ink-g:#16281E;    /* 글래스 제목      */
  --ns-sub-g:#5F6A5F;    /* 글래스 보조      */
  --ns-green:#21402F;    /* 브랜드 · CTA     */
  --ns-green2:#1D4534;   /* 글래스 브랜드    */
  --ns-bronze:#7D5D2E;   /* 프로 한마디      */
  --ns-danger:#C0392B;   /* 알림 뱃지        */
  --ns-bg:#F3EFE8;       /* 페이지          */
  --ns-ivory:#F5F3EC;    /* 글래스 페이지    */
  --ns-card:#FFFDF9;     /* 카드            */
  --ns-sand:#EFE9DE;     /* 보조 면          */
  --ns-line:#E4DED2;     /* 선              */
  --ns-soft:#F2F8F4;     /* 초록 틴트        */
  --ns-white:#FFFFFF;
}
:root{ --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2; --panel:#FFFDF9;
  --font-base:Hahmlet,serif; --font-num:Pretendard,-apple-system,sans-serif; }
@media (prefers-color-scheme: dark){ :root{ --pg:#1A1B18; --ct:#EDEAE3; --cs:#A39C8C; --cs2:#8A8375; --bd:#33342D; --panel:#23241F; } }
:root[data-theme="dark"]{ --pg:#1A1B18; --ct:#EDEAE3; --cs:#A39C8C; --cs2:#8A8375; --bd:#33342D; --panel:#23241F; }
:root[data-theme="light"]{ --pg:#EDEAE3; --ct:#1D2420; --cs:#6E6858; --cs2:#8A8375; --bd:#E4DED2; --panel:#FFFDF9; }
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-base);background:var(--pg);color:var(--ct);-webkit-font-smoothing:antialiased}
.wrap{display:flex;gap:34px;align-items:flex-start;justify-content:center;padding:36px 22px 60px;min-height:100vh}
@media (max-width:820px){ .wrap{flex-direction:column;align-items:center;padding:18px 12px} }
.legend{width:266px;flex:none;position:sticky;top:26px}
@media (max-width:820px){ .legend{position:static;width:100%;max-width:380px} }
.legend h1{font-size:19px;font-weight:400;letter-spacing:.14em;font-family:Hahmlet,serif}
.legend .desc{font-size:12px;color:var(--cs);margin-top:8px;line-height:1.75}
.legend .label{font-size:9.5px;font-weight:600;letter-spacing:.2em;color:var(--cs2);margin-top:18px;
  font-family:var(--font-num)}
.cur-card{margin-top:7px;padding:13px 14px;background:#21402F;border-radius:11px;color:#fff}
.cur-card .nm{font-size:13px;font-weight:600;letter-spacing:-.01em}
.cur-card .pp{font-size:10.5px;color:rgba(255,255,255,.66);margin-top:4px;letter-spacing:.08em}
.plan{padding:5px 9px;border-radius:8px;font-size:10.5px;font-weight:600;cursor:pointer;font-family:inherit;border:1px solid var(--ln);background:#fff;color:var(--cs2)}
.plan.on{background:#A67C3D;color:#fff;border-color:#A67C3D}
.sec-label{font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--cs2);margin:14px 0 6px;
  font-family:var(--font-num)}
.jumps{display:flex;flex-wrap:wrap;gap:4px}
.jump{padding:5px 9px;border-radius:8px;font-size:10.5px;font-weight:500;cursor:pointer;font-family:inherit;
  background:var(--panel);color:var(--cs);border:1px solid var(--bd);letter-spacing:-.01em}
.jump.on{background:#21402F;color:#fff;border-color:#21402F}
.stagebox{position:relative;flex:none}
#stage>div{margin:0 auto}

/* ── 3번 · 누르는 경험 ──────────────────────────────────────────────
   ① 눌림 반응 — 지금까지 눌러도 아무 표시가 없어서 두 번 누르게 됐다.
   ② 손가락 크기 — 세로 44px 이 안 되는 것은 ::after 로 누를 면적만 넓힌다.
      진짜 요소 크기는 그대로라 레이아웃이 하나도 안 밀린다. */
#stage [data-tapped]{transition:opacity .16s ease}
#stage [data-tapped]:active{opacity:.62;transition:none}
#stage [data-hit]::after{content:'';position:absolute;left:0;right:0;
  top:50%;transform:translateY(-50%);height:var(--hit-h,44px)}
#stage [data-hit][data-hit-w]::after{left:50%;right:auto;width:var(--hit-w,44px);
  transform:translate(-50%,-50%)}

/* 데모 모드 (?demo=1) — 사용자 테스트용. 개발자 패널(화면 점프 · 등급 전환기)을 지우고
   폰 화면만 남긴다. 같은 파일 안의 querystring 분기라 URL 링크가 두 개로 안 늘어난다. */
html.demo .legend{display:none}
html.demo .wrap{padding:26px 16px}
/* 진짜 폰에서 열면 — 액자를 걷고 화면을 통째로 쓴다.
   화면 틀(360×740)은 각 화면 HTML 안에 박혀 있어서 여기서 덮어쓴다. */
@media (max-width:440px){
  html.demo .wrap{padding:0}
  html.demo #stage{width:100%}
  html.demo #stage>div{width:100vw !important;height:100dvh !important;height:100vh;
    border:0 !important;border-radius:0 !important;box-shadow:none !important;margin:0 !important}
  html.demo #toastbox{bottom:104px}
}
html.demo body{background:#EDEAE3}
#toastbox{position:absolute;left:50%;bottom:92px;transform:translateX(-50%) translateY(6px);z-index:80;
  background:#1D2420;color:#fff;padding:10px 18px;border-radius:10px;font-size:12.5px;
  font-family:var(--font-num);font-weight:500;white-space:nowrap;
  box-shadow:0 10px 26px rgba(29,36,32,.34);pointer-events:none;opacity:0;transition:.18s}
#toastbox.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast-act{margin-left:16px;padding:2px 2px;background:none;border:none;cursor:pointer;
  font-family:var(--font-num);font-size:12.5px;font-weight:700;color:#8FBFA3;letter-spacing:-.01em}

/* 스윙분석 엔진 끼워넣기 — 엔진은 화면 전체(100dvh)를 전제로 만들어졌다.
   360×740 프레임 안에 앉히려고 높이 기준과 fixed 오버레이의 기준점만 프레임으로 돌린다.
   엔진 파일은 손대지 않고 바깥에서 덮어쓰기만 한다. */
.ns-swhost{flex:1;min-height:0;position:relative;overflow:hidden}
.ns-swhost .sw-root{height:100%;position:relative}
.ns-swhost .sw-sheet-overlay{position:absolute}

/* ── 베타 안내 ──────────────────────────────────────────────────────
   링크를 받고 처음 들어온 사람에게 「이건 시험판이다」를 먼저 말해준다.
   입구는 세션마다 한 번, 표식은 앱을 도는 내내. */
#bgate{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;
  background:rgba(20,24,22,.66);padding:22px 16px;opacity:0;transition:opacity .22s ease}
#bgate.on{opacity:1}
/* display:flex 가 브라우저 기본 [hidden]{display:none} 을 이긴다 —
   이 한 줄이 없으면 안내를 닫은 뒤에도 투명한 막이 앱 전체를 덮고 있다. */
#bgate[hidden]{display:none}
.bgate-card{width:100%;max-width:360px;max-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:var(--ns-card);border-radius:20px;padding:30px 26px 24px;
  box-shadow:0 26px 60px -22px rgba(20,24,22,.6);
  transform:translateY(10px);transition:transform .26s cubic-bezier(.2,.7,.3,1)}
#bgate.on .bgate-card{transform:none}
.bgate-head{padding-bottom:15px;border-bottom:1px solid var(--ns-line)}
.bgate-mark{font-family:Hahmlet,serif;font-size:17px;font-weight:500;letter-spacing:.19em;
  color:var(--ns-green)}
.bgate-ko{font-family:Hahmlet,serif;font-size:12px;color:var(--ns-ink3);margin-top:5px;
  letter-spacing:.06em}
.bgate-tag{display:inline-block;margin-top:12px;padding:3.5px 10px;border-radius:999px;
  font-family:Pretendard,-apple-system,sans-serif;font-size:10px;font-weight:600;letter-spacing:.09em;
  color:#7D5D2E;background:rgba(125,93,46,.10);border:1px solid rgba(125,93,46,.3)}
/* 베타에 열려 있는 한 칸 — 고를 게 하나뿐이니 카드 하나로 세운다 */
.bgate-plan{margin-top:20px;padding:15px 15px 14px;border-radius:14px;
  background:var(--ns-soft);border:1px solid #DCE7DE}
.bgate-pt{font-family:Pretendard,-apple-system,sans-serif;font-size:12.5px;font-weight:500;
  letter-spacing:-.01em;color:var(--ns-green)}
.bgate-pt b{font-weight:700}
.bgate-ul-p{margin-top:9px}
.bgate-ul-p li{color:var(--ns-ink2)}
.bgate-ul-p li b{font-weight:700;color:var(--ns-ink)}
.bgate-ul-x li b{font-weight:700;color:var(--ns-ink2)}
.bgate-sect{margin-top:19px}
.bgate-st{font-family:Pretendard,-apple-system,sans-serif;font-size:11px;font-weight:600;
  letter-spacing:.02em;color:var(--ns-green)}
.bgate-st-x{color:var(--ns-ink3)}
.bgate-ul{list-style:none;margin-top:8px}
.bgate-ul li{position:relative;padding-left:13px;font-family:Pretendard,-apple-system,sans-serif;
  font-size:12.5px;line-height:1.65;color:var(--ns-ink2);letter-spacing:-.01em}
.bgate-ul li+li{margin-top:5px}
.bgate-ul li::before{content:'';position:absolute;left:1px;top:9px;width:4px;height:4px;
  border-radius:50%;background:var(--ns-green)}
.bgate-ul-x li::before{background:none;left:0;top:8px;width:6px;height:1.5px;border-radius:0;
  background:var(--ns-ink3);opacity:.55}
.bgate-ask{margin-top:20px;padding-top:16px;border-top:1px solid var(--ns-line);
  font-family:Hahmlet,serif;font-size:12.5px;line-height:1.75;color:var(--ns-ink3)}
.bgate-btn{width:100%;margin-top:20px;min-height:50px;border:0;border-radius:13px;cursor:pointer;
  background:var(--ns-green);color:#fff;font-family:Pretendard,-apple-system,sans-serif;
  font-size:14.5px;font-weight:600;letter-spacing:-.01em;transition:opacity .15s}
.bgate-btn:active{opacity:.78}
.bgate-foot{margin-top:13px;text-align:center;font-family:Hahmlet,serif;font-size:11px;
  color:var(--ns-ink3);letter-spacing:.05em}

/* 둘째 장 · 구독 안내 — 정식으로 열 때 어떻게 나뉘는지 */
.bgate-nav{display:flex;align-items:center;gap:10px;padding-bottom:14px;
  border-bottom:1px solid var(--ns-line)}
.bgate-back{flex:none;padding:5px 9px 5px 6px;border:1px solid var(--ns-line);border-radius:8px;
  background:var(--ns-card);cursor:pointer;font-family:Pretendard,-apple-system,sans-serif;
  font-size:11.5px;font-weight:600;color:var(--ns-ink2)}
.bgate-back:active{opacity:.7}
.bgate-h2{font-family:Hahmlet,serif;font-size:15px;font-weight:500;color:var(--ns-ink);
  letter-spacing:.02em}
.bgate-plans{display:flex;flex-direction:column;gap:9px;margin-top:16px}
.bplan{padding:13px 14px;border-radius:13px;border:1px solid var(--ns-line);
  background:var(--ns-card);opacity:.62}
.bplan.on{opacity:1;border:1.5px solid var(--ns-green);background:var(--ns-soft)}
.bplan-top{display:flex;align-items:baseline;gap:7px}
.bplan-nm{font-family:Hahmlet,serif;font-size:14px;font-weight:500;color:var(--ns-ink);
  letter-spacing:.01em}
.bplan-tag{flex:none;padding:2.5px 7px;border-radius:6px;background:var(--ns-green);color:#fff;
  font-family:Pretendard,-apple-system,sans-serif;font-size:9.5px;font-weight:700;
  letter-spacing:-.01em;translate:0 -1px}
.bplan-ul{list-style:none;margin-top:8px;display:flex;flex-direction:column;gap:4px}
.bplan-ul li{position:relative;padding-left:11px;font-family:Pretendard,-apple-system,sans-serif;
  font-size:11.5px;line-height:1.55;color:var(--ns-ink2);letter-spacing:-.01em}
.bplan-ul li::before{content:'·';position:absolute;left:2px;top:-.5px;color:var(--ns-ink3)}
.bgate-ask b{font-weight:500;color:var(--ns-ink2)}
/* 둘째 장은 카드가 넉넉해서 세로로 채운다 — 가운데 정렬은 첫 장에만 쓴다 */
@media (max-width:440px){ .bgate-card.bgate-card-2{justify-content:flex-start} }
@media (max-width:440px){
  #bgate{padding:0}
  /* 세로로 긴 폰에서 아래가 텅 비지 않게, 글 뭉치째 가운데로 앉힌다 */
  .bgate-card{max-width:none;height:100%;border-radius:0;padding:34px 24px 30px;
    display:flex;flex-direction:column;justify-content:center}
  .bgate-head,.bgate-lead,.bgate-sect,.bgate-ask,.bgate-btn,.bgate-foot{flex:none}
}
/* 가입 · 로그인 시트 */
#join{position:fixed;inset:0;z-index:220;display:flex;align-items:center;justify-content:center;
  background:rgba(20,24,22,.6);padding:20px 16px}
.join-card{width:100%;max-width:340px;background:var(--ns-card);border-radius:18px;
  padding:22px 20px 18px;box-shadow:0 26px 60px -22px rgba(20,24,22,.55);
  display:flex;flex-direction:column;gap:8px;max-height:92vh;overflow-y:auto}
.join-top{display:flex;align-items:center;justify-content:space-between;padding-bottom:4px}
.join-t{font-family:Hahmlet,serif;font-size:16px;font-weight:600;color:var(--ns-ink);
  letter-spacing:-.01em}
.join-x{border:1px solid var(--ns-line);background:var(--ns-card);border-radius:8px;
  padding:6px 11px;cursor:pointer;font-family:Pretendard,-apple-system,sans-serif;
  font-size:11.5px;font-weight:600;color:var(--ns-ink2)}
.join-p{font-family:Pretendard,-apple-system,sans-serif;font-size:12px;line-height:1.65;
  color:var(--ns-ink3);padding-bottom:2px}
.join-l{font-family:Pretendard,-apple-system,sans-serif;font-size:11.5px;font-weight:700;
  color:var(--ns-ink2);margin-top:6px}
.join-l span{font-weight:500;color:var(--ns-ink3)}
.join-i{width:100%;min-height:44px;padding:0 13px;border:1px solid var(--ns-line);
  border-radius:10px;background:#FBFAF6;font-family:Pretendard,-apple-system,sans-serif;
  font-size:14px;color:var(--ns-ink);outline:none}
.join-i:focus{border-color:var(--ns-green)}
.join-n{font-family:Pretendard,-apple-system,sans-serif;font-size:10.5px;line-height:1.6;
  color:var(--ns-ink3);margin-top:4px}
.join-btn{width:100%;min-height:48px;margin-top:10px;border:0;border-radius:12px;cursor:pointer;
  background:var(--ns-green);color:#fff;font-family:Pretendard,-apple-system,sans-serif;
  font-size:14px;font-weight:700}
.join-btn:active{opacity:.8}
.join-alt{border:0;background:none;cursor:pointer;padding:8px 0 2px;
  font-family:Pretendard,-apple-system,sans-serif;font-size:12px;font-weight:600;
  color:var(--ns-green)}

/* 프로 한마디 도착 — 서버에 진짜로 온 것만 뜬다.
   아래에서 올라오는 시트다. 위에서 덮는 창은 「닫아야 하는 일」로 읽히고,
   이건 닫을 일이 아니라 읽을 일이다. */
#cmnew{position:fixed;inset:0;z-index:230;display:flex;align-items:flex-end;justify-content:center;
  background:rgba(20,24,22,0);transition:background .2s}
#cmnew.on{background:rgba(20,24,22,.6)}
.cmn-card{width:100%;max-width:390px;background:var(--ns-card);border-radius:20px 20px 0 0;
  padding:20px 20px 18px;display:flex;flex-direction:column;gap:10px;max-height:88vh;
  overflow-y:auto;box-shadow:0 -20px 54px -22px rgba(20,24,22,.55);
  transform:translateY(100%);transition:transform .24s cubic-bezier(.2,.8,.3,1)}
#cmnew.on .cmn-card{transform:none}
.cmn-tag{align-self:flex-start;font-family:Pretendard,-apple-system,sans-serif;font-size:9.5px;
  font-weight:700;letter-spacing:.12em;color:#fff;background:var(--ns-bronze);
  border-radius:6px;padding:3px 8px}
.cmn-t{font-family:Hahmlet,serif;font-size:17px;font-weight:600;color:var(--ns-ink);
  letter-spacing:-.025em;padding-bottom:2px}
.cmn-one{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:14px;
  border:1px solid var(--ns-line);background:#FBFAF6}
.cmn-meta{font-family:Pretendard,-apple-system,sans-serif;font-size:11px;font-weight:600;
  color:var(--ns-ink3)}
.cmn-body{font-family:Pretendard,-apple-system,sans-serif;font-size:13.5px;line-height:1.8;
  color:var(--ns-ink);white-space:pre-wrap;word-break:break-word}
/* 스윙 캡처는 세로로 길다. 폭에 맞추면 한 장이 화면을 다 먹어서
   두 장째와 「확인」 버튼이 저 아래로 밀린다 — 높이로 맞춘다. */
.cmn-img{max-width:100%;max-height:42vh;width:auto;margin:0 auto;border-radius:11px;
  display:block;border:1px solid var(--ns-line)}
/* 버튼은 늘 손닿는 곳에 — 사진이 길어도 스크롤을 끝까지 내리게 하지 않는다 */
.cmn-foot{position:sticky;bottom:0;margin:2px -20px -18px;padding:11px 20px 16px;
  background:var(--ns-card);border-top:1px solid var(--ns-line);
  display:flex;flex-direction:column;gap:2px}
.cmn-btn{width:100%;min-height:48px;border:0;border-radius:12px;cursor:pointer;
  background:var(--ns-green);color:#fff;font-family:Pretendard,-apple-system,sans-serif;
  font-size:14px;font-weight:700}
.cmn-btn:active{opacity:.8}
.cmn-alt{border:0;background:none;cursor:pointer;padding:7px 0 0;
  font-family:Pretendard,-apple-system,sans-serif;font-size:12px;font-weight:600;
  color:var(--ns-green)}

/* 올린 스윙 보기 — 진짜 영상을 여는 창 */
#swplay{position:fixed;inset:0;z-index:210;display:flex;align-items:center;justify-content:center;
  background:rgba(12,15,14,.86);padding:18px}
.swp-card{width:100%;max-width:380px;display:flex;flex-direction:column;gap:10px}
.swp-top{display:flex;align-items:center;gap:10px}
.swp-nm{flex:1;font-family:Pretendard,-apple-system,sans-serif;font-size:13px;font-weight:600;
  color:#F3EFE8;letter-spacing:-.01em}
.swp-x,.swp-del{flex:none;padding:7px 12px;border-radius:9px;cursor:pointer;
  font-family:Pretendard,-apple-system,sans-serif;font-size:12px;font-weight:600;
  background:rgba(255,255,255,.14);color:#F3EFE8;border:1px solid rgba(255,255,255,.22)}
.swp-x:active,.swp-del:active{opacity:.7}
.swp-del{background:transparent;color:#E6A79B;border-color:rgba(230,167,155,.4)}
.swp-v{width:100%;max-height:66vh;border-radius:14px;background:#000;display:block}
.swp-foot{display:flex;align-items:center;justify-content:space-between}
.swp-day{display:grid;grid-template-columns:1fr 1fr;gap:9px;max-height:66vh;overflow-y:auto}
.swp-cell{position:relative;display:block;aspect-ratio:3/4;border-radius:12px;overflow:hidden;
  background:#1D2420;border:1px solid rgba(255,255,255,.16);cursor:pointer}
.swp-cell img{width:100%;height:100%;object-fit:cover;display:block}
.swp-tag{position:absolute;left:7px;top:7px;padding:3px 7px;border-radius:6px;
  background:rgba(20,24,22,.66);color:#fff;
  font-family:Pretendard,-apple-system,sans-serif;font-size:10px;font-weight:600}
.swp-sz{font-family:Pretendard,-apple-system,sans-serif;font-size:11.5px;color:rgba(243,239,232,.62)}

/* 표식 — 55개 화면이 전부 같은 상태바(높이 42px)를 쓰고 가운데가 비어 있다.
   거기 앉히면 어느 화면을 열어도 겹치지 않는다. */
.bmark{position:absolute;left:50%;top:11px;transform:translateX(-50%);z-index:70;
  padding:3px 9px;border-radius:999px;cursor:pointer;
  font-family:Pretendard,-apple-system,sans-serif;font-size:9.5px;font-weight:600;
  letter-spacing:.1em;line-height:1.35;color:#7D5D2E;
  background:rgba(255,253,249,.88);border:1px solid rgba(125,93,46,.34)}
.bmark:active{opacity:.7}
"""

html = f"""<script>
/* 이 파일은 이제 베타 링크로 그대로 나간다 — 화면 점프 · 등급 전환기가 보이는 쪽이
   예외다. ?dev=1 을 붙였을 때만 개발자 패널을 켠다. */
if (!/[?&]dev(=|&|$)/.test(location.search)) document.documentElement.classList.add('demo');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#F3EFE8">
<title>NEXT SWING (베타)</title>
<style>
{fonts}
{font_patch}
{CSS}
</style>
<style>
/* ── 스윙분석 엔진 원본 스타일 (components/swing/swing.css · 무수정) ── */
{swing_css}
</style>
<div class="wrap">
  <aside class="legend">
    <h1>NEXT SWING</h1>
    <div class="desc">클로드 디자인 핸드오프에 정규레슨 결과지 · 프로 코멘트 · 스윙분석 엔진을 얹은
      45화면 동작 프로토타입입니다. 버튼 · 탭 · 달력 · 칩을 누르면 실제 앱처럼 이동하고 상태가 바뀝니다.</div>
    <div class="label">현재 화면</div>
    <div class="cur-card"><div class="nm" id="lg-name"></div><div class="pp" id="lg-purpose"></div></div>
    <div class="label" style="margin-top:16px">회원 등급으로 보기</div>
    <div class="jumps" id="lg-plan"></div>
    <div id="lg-jumps"></div>
  </aside>
  <div class="stagebox">
    <div id="stage"></div>
    <div id="toastbox"></div>
  </div>
</div>
{tpls}<script>
window.__META = {json.dumps(META, ensure_ascii=False)};
/* GET /v1/rules · doh.vision.v1 응답 — 서버 대신 정본 JSON 을 그대로 실었다 */
window.__DOH = {json.dumps(doh, ensure_ascii=False)};
window.__PRACTICE = {json.dumps(practice_data, ensure_ascii=False)};
</script>
<script>
/* 스윙분석 엔진 번들 — React + SwingAnalyzer.tsx + draw.ts */
{swing_js}
</script>
<script>
{engine_js}
</script>
<script>
{sb_lib}
</script>
<script>
{sb_app}
</script>
<script>
{vault}
</script>
<script>
{runtime}
</script>
<script>
/* 런타임이 첫 화면을 그린 뒤에 얹는다 — 표식이 붙을 프레임이 있어야 한다 */
{beta}
</script>"""

open(OUT, 'w', encoding='utf-8').write(html)
print(f'화면 {len(screens)}개 · {os.path.getsize(OUT)/1024:.0f} KB → {os.path.basename(OUT)}')
