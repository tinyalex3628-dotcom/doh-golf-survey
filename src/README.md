# NEXT SWING · 베타 소스

`docs/index.html`(회원 앱)과 `docs/admin.html`(관리자 콘솔)은 **빌드 산출물**이다.
직접 고치지 말고 여기서 고친 뒤 다시 빌드해서 덮어쓴다.

## 빌드

```bash
cd src
python3 build_v3.py      # 회원 앱   → src/nextswing-v3.html
python3 build_admin.py   # 관리자    → src/nextswing-admin.html

cp nextswing-v3.html    ../docs/index.html
cp nextswing-admin.html ../docs/admin.html
```

두 HTML은 폰트·CSS·JS·55개 화면을 통째로 담은 단일 파일이다. 외부 요청이 없다
(Supabase 만 예외). Vercel 은 `docs/` 를 그대로 서빙한다 — 빌드 명령은 `echo static`.

> `vercel.json` 에 주석 키(`"//"`)를 넣으면 **배포가 깨진다**. JSON 스키마 검사에
> 걸린다. 실제로 한 번 깨졌다.

## 파일

| 파일 | 하는 일 |
|---|---|
| `build_v3.py` | 회원 앱 조립. `screens-v3.json` + CSS + 런타임 → 단일 HTML |
| `build_admin.py` | 관리자 콘솔 조립 |
| `runtime-v3.js` | 회원 앱 런타임(~2700줄). 화면 배선·상태·서버 연동 전부 |
| `admin-inbox.js` | 관리자 「도착함」 — 영상 작업대(확대·선 긋기·캡처)와 답장 |
| `admin-crm.js` | 회원 명부 — 서버 데이터에서 상태(새싹·활성·복귀·침묵·휴면)를 계산해 그린다 |
| `admin-runtime.js` | 관리자 나머지 화면(아직 설계도) |
| `sb.js` | 서버 층. 회원 앱과 관리자가 **같은 파일**을 쓴다 |
| `vault.js` | 기기 보관함(IndexedDB). 영상은 여기 먼저 들어가고 그다음 서버로 |
| `beta-gate.js` | 첫 진입 베타 안내 두 장 + 상시 「베타」 표식 |
| `screens-v3.json` | 55개 화면 HTML (파이썬 생성기들이 만든 것) |
| `font_patch_beta.py` | 한글 글리프 부분집합. 새 한글 문구를 많이 넣었으면 다시 돌린다 |
| `swbuild/`, `engine/` | **스윙 분석 엔진 정본 — 절대 수정 금지** (아래) |

### 엔진은 건드리지 않는다

`swbuild/swing.bundle.js`, `swbuild/components/swing/swing.css`,
`engine/doh_rules.v1.json`, `engine/doh.vision.v1.example.json` 은 **다른 저장소가
정본**이다. 여기 있는 건 복사본이라 고쳐도 되돌아온다.
`engine-runtime.js` 는 이 프로토타입이 직접 쓴 감싸개라서 고쳐도 된다.

## 설계 원칙 두 가지

**① 화면은 아무것도 기억하지 않는다.**
55개 화면 HTML 에는 설계 때 넣은 예시 인물의 기록이 곳곳에 박혀 있다.
사실의 전부는 상태(`S`)와 보관함과 서버다. `applyMyFacts()` 가 매 렌더마다
그 사실을 화면에 찍는다. 화면마다 지우러 다니면 반드시 하나를 빠뜨린다.

홈 첫 화면(히어로)은 **프로 한마디 한 바퀴가 지금 어디까지 왔는지**를 그린다 —
`homeHero()` 한 곳에서 네 갈래로 갈린다: 아직 안 올림 → 오늘 올림(요청 유도)
→ 답을 기다리는 중 → 한마디 도착. 「기다리는 중」의 근거는 서버의
`swings.want_comment` 라서 새로고침해도 폰을 바꿔도 남는다.
홈의 숫자(연습일 · 영상 · 연속)는 `myStats()` 가 올린 날짜에서 직접 센다.

`render()` 의 층 순서 — 앞 층이 만든 것을 뒤 층이 지울 수 있다:

```
공통 배선 → 화면 배선 → 등급 표시(applyFresh 포함) → 내 사실 → 잠금 → 터치 영역 → 범례
```

각 층은 try/catch 로 감싸져 있다. 한 층이 터져도 다음 층은 돈다 —
특히 `applyLock` 은 무슨 일이 있어도 돌아야 한다(배선 버그가 곧 등급 구멍이다).

**② 기기 먼저(local-first).**
영상은 IndexedDB 에 먼저 들어가고 그다음 서버로 간다. 타석은 지하가 많고
데이터가 자주 끊긴다. 전송이 실패해도 찍은 건 남아 있어야 하고 나중에 다시 간다.

읽기는 합쳐 읽는다 — 갤러리 거울(`__SWINGS`)에는 보관함과 서버(`NS.mine()`)를
합쳐 담는다. 폰을 바꾸면 보관함이 비어 있어도 서버 것이 보인다. 같은 스윙이
양쪽에 있으면 `remoteId` 로 겹침을 걸러 기기 것이 이긴다(원본과 썸네일이 거기
있다). 서버에만 있는 스윙은 서명 링크로 재생하고, 지우면 서버에서도 지운다.

## 시험

```bash
cd src && python3 build_v3.py && python3 build_admin.py
node test/_arrive.mjs         # 프로 한마디가 회원에게 닿는가 (7단계)
node test/_xshot.mjs          # 관리자 영상 캡처 — 다른 출처 / 확대 / 선
node test/_beta_overlap.mjs   # 55개 화면 전수 — JS 오류·「베타」표식 겹침
node test/_gallery_remote.mjs # 폰을 바꿔도 갤러리가 서버에서 보이는가
node test/_home_hero.mjs      # 홈 첫 화면이 한마디 한 바퀴를 따라가는가
node test/_shots.mjs          # 프로가 붙인 사진 — 글이 먼저 · 스크롤 없이 · 눌러서 크게
node test/_opening.mjs        # 여는 화면 — 「얼마 만에 왔나」가 카드를 가르는가
node test/_seen.mjs           # 봤어요 도장 — CRM 이 찍고 회원이 보는 한 바퀴
node test/_crm_roster.mjs     # 회원 명부 — 상태 자동 분류 · 먼저 연락할 사람
node test/_practice.mjs       # 연습기록 — 달력이 스크롤 없이 보이는가
node test/_gallery.mjs        # 갤러리 — 날짜 묶음 · 필터 칩 · 클럽이 끝까지 가는가
```

> **테스트는 서버를 흉내 낸다.** 이 실행 환경의 프록시가 `*.supabase.co` 를
> 막는다(403). 그래서 각 테스트는 빌드된 HTML 에서 `sb.js` 부분만 잘라내고
> 가짜 `NS` 를 끼워 넣는다. `sb.js` 는 최상위 `const NS` 라서 `window.NS` 를
> 덮어써도 안 바뀐다 — HTML 을 잘라 끼우는 것이 유일한 방법이다.
>
> 영상 테스트는 **반드시 다른 출처**(별도 포트 HTTP 서버)로 해야 한다.
> `blob:` 로 하면 같은 출처라 캔버스 오염 버그가 안 잡힌다. 실제로 못 잡았다.

## 여는 화면 · 오늘의 한 장

앱을 열면 제일 먼저 나온다(`opening.js`). 머리(NS · NEXT SWING · 슬로건)는
고정이고 **가운데 한 장만 매번 바뀐다.** 슬로건은 요일마다 갈아 끼운다.

설계 원본은 `design/opening-screen.html`(아티팩트를 저장소에 넣은 것),
카드 스물둘과 갈래 아홉의 전문은 `design/README.md` 에 있다.

붙일 때 정한 것 —

- **세션에 한 번만** 뜬다(`sessionStorage: ns-open-seen`). 탭을 오갈 때마다
  뜨면 그건 관문이지 여는 화면이 아니다. 눌러서 건너뛸 수 있고 2.2초 뒤 스스로 닫힌다.
- **데이터를 기다렸다 고른다.** 스윙·한마디가 와 있어야 카드가 제대로 갈린다.
  `__BOOTREADY` 를 최대 1.2초까지 기다리고, 늦으면 그냥 응원 카드로 연다.
- **못 세는 숫자는 0으로 둔다.** `fbIn`(정기 피드백)·`pct`(상위 %)는 베타에
  없는 값이라 0이고, 그래서 그 카드는 후보에서 아예 빠진다. 없는 숫자로
  그럴듯한 카드를 만들면 그 순간부터 앱을 못 믿는다.
- **기억은 서버에 둔다.** `profiles.open_mem` 에 마지막 방문일과 최근에 보여준
  카드·갈래를 적는다. 기기에만 두면 폰을 바꿀 때 리셋돼서, 스무 날 만에 온
  사람이 「처음 온 사람」이 된다. 기기(localStorage)에도 같이 적어 서버가
  죽어도 버틴다.
- 어느 카드가 왜 뽑혔는지는 `window.__OPENPICK` 에 남는다(시험이 읽는다).

## 서버 (Supabase)

접근 규칙(RLS)이 보호한다 — 자기 것만 보이고, 프로만 전부 본다.
`sb_publishable_...` 키는 브라우저에 들어가는 게 정상이다.
**`service_role` / `sb_secret_` 키는 절대 클라이언트 코드에 넣지 않는다.**

스키마는 `../supabase/schema.sql` 참고.
