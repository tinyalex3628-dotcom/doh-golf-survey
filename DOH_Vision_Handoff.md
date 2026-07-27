# DOH 스윙분석 엔진 — 세션 핸드오프 (이어서 작업용)

> 새 채팅/세션이 이 파일을 읽고 **그대로 이어서** 작업하기 위한 요약.
> 브랜치: `claude/session-context-recovery-il15cg` (origin, PR 미생성) — 최초 작성 브랜치는
> `claude/ai-video-analysis-engine-wlr06k`(PR #7)였으나 이후 세션 복구를 거치며 이 브랜치로
> 이어짐. **§8 링크는 항상 최신 브랜치로 갱신할 것** — 다음 세션 복구 시 브랜치명이 또 바뀜.

---

## 0. 한 줄 요약
골프 스윙 영상에서 **몸통/골반 회전각**을 뽑는데, 브라우저(MediaPipe)로는 깊이(z)가 약해
정면 백스윙탑 어깨회전이 **-19°(엉터리)** 나왔다. → **단일영상 3D 복원(NLF)** 을 Colab에서
돌리니 **-101.5°(실제 스윙값)** 로 복원 성공. 지금은 `Colab NLF → JSON → analyzer2 표시`
파이프라인이 동작한다.

## 1. 확정된 방향 (제품 아키텍처)
- **목표: 1순위 모바일 앱(iOS/Android), 2순위 PC 웹브라우저.**
- 결론: **브라우저/앱 안에서 NLF 직접 실행은 버린다**(모바일 제약). → **서버(FastAPI) 기반**으로,
  모바일·웹이 **같은 API** 호출. `영상 → 서버(MediaPipe+NLF+분석) → JSON → 앱/웹 표시`.
- **엔진은 모듈화**: `Video → Pose(MediaPipe/NLF) → Metrics(회전·척추·스웨이…) → JSON → UI`.
- **JSON 계약(doh.vision.*)이 척추.** 모델을 나중에 더 좋은 걸로 바꿔도 UI·분석은 재사용.
- **서버비**: 실시간 아님(업로드→20~60초 분석→끝)이라 상시 GPU 불필요. 사용량 기반, 유저 늘면 확장.
  desktop(.exe)=서버비0원이지만 목표 아님. 모바일 0원은 NLF 포기+경량모델 트레이드오프.
- **지금 할 일 = 엔진 완성.** 배포방식(서버 vs 경량모델)은 나중에 실제 성능·비용 보고 결정.
  가장 피할 것: 배포구조 미확정이라고 엔진개발 멈추는 것.

## 2. 지금 동작하는 것 (검증 완료)
**Colab(pose3d_simple.ipynb)**: 런타임 GPU → 셀 순서대로 → 영상 업로드 →
`joints.pkl` → `rot.py` → 콘솔 숫자 + `rot.png` 그래프 + `doh_vision.json`(자동 다운로드).
- 실측 결과(사용자 정면영상): 백스윙탑 **흉곽 -101.5° / 골반 -27.8° / X-Factor -73.8°**, 임팩트 ≈0.
- 측면영상도 정상 곡선.

**analyzer2.html (BUILD v21)**: `🎯 3D 회전결과(JSON) 불러오기` 버튼 → `doh_vision.json` 업로드 →
회전카드가 브라우저 근사값 대신 **3D 정밀값**으로 교체(초록 `3D정밀` 배지).

## 3. 파일 지도
| 파일 | 역할 |
|---|---|
| `pose3d_poc/wham_golf_rotation.py` | **핵심 IP.** 3D관절(pkl) → 어깨선/골반선 azimuth로 흉곽/골반 회전 + X-Factor. **P1/P4/P7 자동검출**. `--skeleton smpl/h36m/coco`, `--json`(doh.vision.rotation.v1 출력), `--png`, `--check`. 합성검증 통과. |
| `pose3d_poc/pose3d_simple.ipynb` | **Colab 실행노트북(NLF).** 설치→영상업로드→3D분석→회전/JSON. |
| `pose3d_poc/wham_golf_rotation.ipynb` | WHAM 대안 노트북(보조). |
| `pose3d_poc/README.md`, `집에서_이대로_하세요.md` | 실행/컴맹 가이드. |
| `pose_poc/analyzer2.html` | 브라우저 분석기(MediaPipe). 회전=근사·참고용(v20) + 3D JSON 불러오기(v21). |
| `DOH_Vision_3D_Rotation_Approach_v1.0.md` | 3D 접근·모델선택·로드맵 문서. |

## 4. 핵심 기술 사실 (재현용)
- **NLF** (Neural Localizer Fields, NeurIPS'24, isarandi/nlf). **TorchScript**라 torch버전 안 탐 → 최신 Colab(py3.12/torch2.11/cu128)에서도 동작.
  - 모델: `https://github.com/isarandi/nlf/releases/download/v0.3.2/nlf_l_multi_0.3.2.torchscript` (470MB)
  - 로드: **`import torchvision`(필수, nms 등록)** 후 `torch.jit.load(M).cuda().eval()`
  - 추론: `model.detect_smpl_batched(t)` — t=uint8 CHW `[1,3,H,W]` cuda. 출력 `pred['joints3d']` (SMPL-24, `[img][det][24,3]`).
- **회전 계산**: 어깨선(16-17)/골반선(1-2) 3D 벡터를 추정 수직축(어깨중심-골반중심 평균)⊥평면에 투영한 **azimuth**, 어드레스(P1) 대비. X-Factor=흉곽−골반.
- **자동검출**: P4=피니시 반대쪽 극점, P7=탑이후 0교차, P1=탑이전 평탄.
- **mmpose(OpenMMLab)는 폐기** — py3.12에서 `pkgutil.ImpImporter` 에러로 사망(개발중단). 쓰지 말 것.
- **왜 브라우저가 실패했나**: MediaPipe world z(단일프레임)가 깊이축 회전을 못 봄. 2D 너비트릭(v18/v19)도 벽. 3D 프라이어+시간축(NLF)이 정답.

## 5. JSON 계약 (doh.vision.rotation.v1)
```json
{ "schema":"doh.vision.rotation.v1", "source":"NLF", "skeleton":"smpl", "frames":195,
  "events":{"P1":55,"P4":80,"P7":89},
  "address":{"thorax":0,"pelvis":0,"xfactor":0},
  "top":{"thorax":-101.5,"pelvis":-27.8,"xfactor":-73.8},
  "impact":{"thorax":-10.4,"pelvis":-0.1,"xfactor":-10.2},
  "series":{"thorax":[...],"pelvis":[...],"xfactor":[...]} }
```

## 5b. JSON 계약 `doh.vision.v1` — **LOCKED (2026-07-03)** ✅
전체 지표를 담는 정식 계약을 **잠갔다.** rotation.v1(위 §5)은 analyzer2 레거시 표시용으로 유지.
- **문서:** `DOH_Vision_JSON_Contract_v1.0.md` (불변원칙·버전정책·VF어휘 정합)
- **스키마:** `schema/doh.vision.v1.schema.json` (Draft 2020-12, 기계검증)
- **정본예제:** `schema/doh.vision.v1.example.json` (실측 스윙값)
- **검증기:** `python schema/validate.py` (jsonschema 있으면 정식 / 없으면 내장 인터프리터)
- **어댑터:** `wham_golf_rotation.py --json-v1 out.json --view FO --hand right` → 회전 4개(VF015/018/020/075)를 계약으로 방출.
- 핵심: `feature_id`=DOH어휘(VF###), 모든 feature에 confidence+error_flags 필수, Node 언급 금지, append-only. Metrics 확장은 **이 계약에 추가만** 하면 됨(UI/DOH/모바일 불변).

## 5c. Metrics 확장 1차 — **완료(2026-07-03)** ✅
`pose3d_poc/wham_golf_metrics.py` — NLF 3D관절(SMPL-24)에서 회전 외 지표를 계약에 append.
- **12개 방출:** 팔각(VF011/012/027/087)·무릎각(VF039/040/088)·스웨이(VF031/034)·템포(VF111/113/114).
- **선정 기준(정직):** 월드 수직축 없이도 robust한 것만 — 세그먼트 상대각 / 스탠스선 투영 / 프레임 산술. 순수 파이썬 기하(math만), 합성 관절로 검증(머리스웨이·템포 손검산 일치).
- **다음 배치(수직축 보정 필요):** 척추 틸트/전후굴곡·어깨플레인·Loss of Posture… → 엔진 검증(down)에서 up축 확정 후 추가.
- 어댑터 `--json-v1`이 회전4+metrics12=16 feature를 한 계약으로 방출. `python schema/validate.py`로 검증됨.
- **실측검증(4스윙, 2026-07-04):** 어깨턴 @탑 4개 전부 -95~-100°(정면1+측면3, 뷰 무관 = 강건성 확인). 곡선모양 교과서·임팩트서 골반>흉곽(생체역학 정합). 브라우저 -19° 벽 4연속 돌파 확인.
- **뷰-게이팅 추가:** 스웨이(VF031/034)는 정면 전용 — 측면에선 `null+view_mismatch`(실측: 측면 스웨이 0.9~1.1 쓰레기였음). 팔/무릎각은 양쪽 뷰 정상. X-Factor 절대값(58~73°)이 클래식(~45°)보다 높음 → 스케일 보정 TODO.

## 5d. up축 + 척추각/플레인 — **완료(2026-07-04)** ✅
- **`estimate_up()`**: 발목 planted → 점구름 최소분산축=세계 수직. 순수 파이썬 Jacobi 고유분해(numpy 불필요), 합성지면 검증 오차 <0.2°. 몸통(머리-발) 정합가드로 모호케이스 폴백.
- **척추각 규약: 지면 0°/수직 90°** (`90 − angle(spine,up)`). 어드레스 ~55~65°. 합성 35°숙임 → VF002=55.0° 확인.
- **5개 추가:** VF002(척추각@P1)·VF038(Loss of Posture)·VF076(척추각 유지 P1→P7)·VF022(어깨플레인)=측면전용, VF001(좌우틸트)=정면전용. 계약 총 21 feature, 검증 통과.
- **다음 실측검증:** 측면 영상 재실행 시 척추각 나옴 — 어드레스 55~65°·Loss of Posture 작은지·up quality 확인 필요.

## 5e. 집 PC 서버 + 웹UI — **완료(2026-07-04)** ✅
콜랩 없이 집 PC(RTX 2060 SUPER 8GB)에서 서버 켜고 브라우저로 분석. `server/` 폴더:
- `server/app.py` — FastAPI: NLF 로드 + `POST /analyze`(영상→doh.vision.v1) + 웹UI 서빙. 8GB VRAM 대비 프레임 다운스케일(`NLF_MAX_SIDE`, 기본720).
- `server/index.html` — 업로드/각도·주손 선택/결과카드 웹UI. 뷰별 측정불가는 정직 표시.
- `server/start.bat` + `집PC_설치.md` — 원클릭 설치·실행(비개발자용, 윈도우).
- 엔진 재사용: `wham_golf_rotation.build_v1(J,...)` 신설 — 콜랩과 동일 로직(회전+척추각+지표). 서버는 영상→관절(NLF)만 담당.
- 배포처: **집 PC 확정.** (사양: i5-12400F/16GB/RTX2060S/NVMe.) 밖에서 접속은 나중(터널, 군내망 이슈).
- ⚠️ 미검증: 이 세션엔 GPU/torch 없어 서버 실물 구동 못 함(구문·로직만 확인). 집 PC 첫 구동에서 검증 필요.

## 5f. 배포 방식 확정 — **무료 Colab Gradio UI (2026-07-04)** ✅
사용자 제약: 집 1년 2번(집PC 유지불가), 작업은 사지방(군내망), "창 안 벗어나고 클릭→결과" 원함, 무료 선호.
군내망서 huggingface.co/modal.com 열림(클라우드 가능) but 우선 무료로.
- **결론: 콜랩 GPU(무료·사지방서 됨) 위에 Gradio UI.** `pose3d_simple.ipynb` 전면 개조: "런타임>모두 실행" 1번 → 노트북 안에 업로드+각도/주손+[분석하기]+결과카드 UI 인라인 표시. 셀 안 만짐.
- 엔진은 `build_v1` 재사용(회전+척추각+지표). render()는 계약→HTML 카드(뷰별 측정불가 정직표시). 21카드 렌더 검증.
- `server/`(FastAPI+집PC)는 **나중 클라우드 배포용으로 보존** — 같은 app.py가 HF Spaces 등에 그대로 올라감(월 소액). 지금은 무료 Colab 경로.
- ⚠️ 미검증: 이 세션 GPU 없어 Gradio 실물 구동 못 함(render 로직만 확인). 사용자 콜랩 첫 구동에서 검증.

## 5g. P1~P10 자동검출 + Colab UI를 analyzer2 v21 스타일로 — **완료(2026-07-04)** ✅
브라우저 analyzer2 v21에만 있던 P1~P10 이벤트 + 다크패널 UI를 무료 Colab Gradio 경로로 이식.
- **엔진(`wham_golf_rotation.py`):** `detect_p_events()` 신설 — 기존 azimuth 검출 P1/P4/P7은 그대로 두고,
  그 사이 **P3/P5/P9**(리드팔이 지면과 평행: 리드어깨→리드손목 벡터가 up과 90°에 가장 가까운 프레임)와
  **P10**(임팩트 이후 손 최고점=피니시)를 3D 기하로 채움. 못 잡으면 보간(method=interpolated).
  **P2/P6/P8(샤프트 평행)은 클럽 검출이 있어야 함 → pose만으론 미검출**(정직, 2차 클럽엔진 몫).
  SKELETONS에 손목 인덱스(smpl 20/21) 추가. `_build_events()`가 P순서로 병합해 swing_events로 방출(schema 준수).
  합성 스윙 검증: P1#2·P3#22·P4#45·P5#59·P7#75·P9#95·P10#119 (순서·중간지점 정합), doh.vision.v1 PASS.
- **Colab UI(`pose3d_simple.ipynb` 2칸):** `render()` 전면 재작성 — analyzer2 v21 팔레트(#0f1216/#4ea1ff/#ff7eb6…)·
  섹션구조 이식. ①스윙 P구간(P1~P10 칩, 미검출 흐리게)·②회전 mgrid(백스윙탑 P4 / 임팩트 P7 카드)·
  ③자세·팔·무릎·스웨이·템포 그리드. Gradio 다크 테마. `BR`을 현재 브랜치로 지정(엔진파일 fetch 정합).
- ⚠️ 미검증: 이 세션 GPU 없어 실물 구동은 못 함(render/검출 로직만 합성·격리검증). 사용자 콜랩 첫 구동에서 P3/P5/P9 실측 위치 확인 필요.

## 5h. analyzer2가 doh.vision.v1 전체를 표시 — **완료(2026-07-04)** ✅  ← "analyzer UI + GPU 백엔드" 다리
사용자 방향 확정: **analyzer2의 UI를 프론트로 쓰고, 3D 추론은 나중에 GPU 백엔드에서.** (§1 아키텍처 그대로)
그 다리로, 지금까지 회전(rotation.v1)만 읽던 analyzer2를 **정식 계약 `doh.vision.v1`(21지표 전부)** 소비자로 승격.
- **`pose_poc/analyzer2.html` BUILD v22:** `🎯 3D 결과 불러오기` 버튼이 v1/rotation 둘 다 인식.
  v1이면 결과패널 상단 `#v1panel`에 **통째로** 렌더 — 요약칩·P1~P10 이벤트칩·회전 mgrid(백스윙탑/임팩트)·
  자세·팔·무릎·스웨이·템포. analyzer2 **기존 클래스(.ev/.mgrid/.mcard/.mrow/.badge) 재사용**이라 페이지 룩 일치.
  뷰-게이팅 정직표시(측면=스웨이/좌우틸트 '측정불가', 값 없으면 error_flags 노출).
- 브라우저 MediaPipe 섹션(①~⑤)은 "근사·영상오버레이·수동보정 참고"로 강등 표기(유지).
- 검증: 합성 21지표 v1 JSON을 격리 렌더 → JS에러0·전 지표 정상·스타일 일치(스샷 확인).
- **다음(GPU 생기면):** analyzer2에서 `POST 영상 → GPU서버(NLF) → doh.vision.v1` 자동수신(지금은 파일 불러오기가 그 자리표시자). `server/app.py`가 이미 그 계약을 냄 → 그 서버를 GPU에 올리고 analyzer2가 fetch만 하면 됨.

## 5i. analyzer2 ↔ Colab GPU 백엔드 연결 (한 페이지 UX) — **완료(2026-07-04)** ✅
"analyzer2=프론트, Colab Gradio=무료 GPU 백엔드 API"로 결선. GPU 서버 계약 없이 개발단계 UX 완성.
- **백엔드(`pose3d_simple.ipynb`):** `analyze_fn`이 (HTML, DownloadButton, **doh.vision.v1 dict**) 반환.
  숨은 `gr.JSON` 출력 + `btn.click(..., api_name="analyze")` → 외부에서 `/analyze` API로 계약 수령.
  `demo.launch(share=True)` → 공개 `xxxx.gradio.live` URL 생성. `_analyze_core()`로 UI/API 로직 공유.
- **프론트(`analyzer2.html` BUILD v23):** `☁️ GPU 서버로 3D 정밀분석` 박스 — 백엔드 URL 입력(localStorage 저장)
  + [서버로 분석]. `@gradio/client`(jsdelivr, v1/v0 호환, `handle_file`) 동적 import → `predict("/analyze",[영상,뷰,주손])`
  → `data[2]`(doh.vision.v1) → `renderV1()`. 업로드→분석→결과가 한 페이지에서 끝.
- **교체용이성:** 백엔드 URL이 설정값이라 **Colab → HF Spaces → GPU서버**로 주소만 바꾸면 프론트 무수정.
  핵심은 어느 백엔드든 **doh.vision.v1 계약**을 낸다는 것.
- JSON 파일 불러오기(§5h)는 **비상 폴백**으로 유지(사지방서 gradio.live 터널 막힐 때).
- **검증 완료(2026-07-04):** 사용자 실측 왕복 성공 — analyzer2 v23 → 콜랩 gradio.live → 실제 스윙영상(정면)
  → 3D 결과 한 페이지 표시. **사지방(군내망)에서 gradio.live 터널 안 막힘 확인**(유일 미지수 해소).
  실측값: 어깨@탑 -116.9°/골반 -28.9°(브라우저 -19° 벽 돌파), 팔·무릎·스웨이·템포 정상, 정면이라 척추/플레인 측정불가 게이팅 정상.
- **관찰된 TODO:** ① X-Factor -88°로 과대(클래식 ~45°) = 회전 스케일 보정 필요(기존 TODO 재확인).
  ② 임팩트 직후 잘린 영상에선 P10(피니시)이 임팩트 근처로 당겨질 수 있음 — 영상 길이 의존. 여러 스윙 실측 검증 필요.

## 5j. HF Spaces 백엔드 (진짜 원클릭 · 영구 URL) — **파일 준비 완료(2026-07-04)** ✅
콜랩 한계(매번 켜야 함 + gradio.live 주소 매번 바뀜 + 웹에서 자동실행 불가)를 넘으려 백엔드를 HF Spaces로.
- **`hf_space/`:** `app.py`(NLF + `/analyze` api_name → doh.vision.v1, ZeroGPU `@spaces.GPU`/CPU 자동, spaces→torch 순),
  `requirements.txt`, `README.md`(HF frontmatter), `배포방법.md`(컴맹 10분 가이드). 엔진은 GitHub raw 공유(단일 소스).
- 출력 순서 [HTML, 다운로드, JSON] = analyzer2 `data[2]` 계약과 동일 → **analyzer2는 URL만 이 Space로 바꾸면 무수정.**
- 사용자가 HF Space 만들고 파일 3개 올리면 `https://<id>-<space>.hf.space` 영구주소 생성 → analyzer2에 1회 입력 = 원클릭.
- ⚠️ 미배포/미검증: 사용자 HF 계정 필요. ZeroGPU 가용/CORS는 첫 배포에서 확인(막히면 CORS 한 줄 추가 or CPU).

## 5k. Stage 0 — API 계약 고정(FastAPI 비동기 Job) — **완료(2026-07-04)** ✅
아키텍처 문서(`DOH_Vision_API_Architecture_v1.0.md`)의 Stage 0 구현. **고정하는 건 인프라가 아니라 계약.**
- **`server/app.py` (FastAPI):** 비동기 Job 계약 —
  `POST /v1/analyze/video`→`202 {job_id}`, `GET /v1/jobs/{id}`→`{status,result}`(폴링), `/v1/capabilities`, `/v1/health`.
  CORS(기본 `*`, env `DOH_CORS_ORIGINS`), ThreadPoolExecutor(GPU1개 순차), `analyze_to_inst()` 동기/비동기 공용.
  하위호환 `POST /analyze`(동기) 유지. CF 100초 리밋·모바일 백그라운드 대비.
- **`analyzer2.html` v25:** `@gradio/client` 완전 제거 → **순수 fetch 비동기 폴링**. `DOH_API_BASE` 상수(프로덕션=
  api.dohvision.com) + 개발용 override 입력칸. 백엔드가 Colab/Modal/집PC/전용서버 무엇이든 **주소만** 바꾸면 무수정.
- **`pose3d_simple.ipynb`:** Gradio → **FastAPI 백엔드 러너**로 개조. server/app.py 받아 `uvicorn` 실행 +
  **cloudflared quick tunnel**(trycloudflare.com, 계정불필요) → 공개 URL 출력. Gradio는 폐기(계약이 UI).
- **검증:** 목 FastAPI(torch 없이 계약만) + Chromium에서 **업로드→job_id→폴링→renderV1** 전 과정 PASS(P칩7·회전카드2).
  server/app.py `py_compile` OK, analyzer2 `node --check` OK.
- ⚠️ **미검증:** 실 GPU 왕복(콜랩), **trycloudflare가 사지방서 열리는지**(gradio.live는 됐지만 다른 터널).
  막히면 → 집PC localhost(터널 불필요) 또는 Stage1 Modal. **계약은 인프라 무관하게 고정됨.**
- 집PC 개발루프(터널 불필요): `uvicorn app:app --port 8000` 후 analyzer2 override칸에 `http://localhost:8000`
  (브라우저의 localhost 예외로 https페이지→http localhost fetch 허용).

## 5l. Stage 0 안정화(하드닝) — **진행중(2026-07-04)** 🔨  계약 동결 유지
기능 추가 중단, 버그·안정성 우선. **`/v1/*`·`doh.vision.v1` 계약 무변경.**
- **서버(`server/app.py`):** 구조화 로그(job 수명·소요초), 업로드 검증(빈/초과 `DOH_MAX_UPLOAD_MB` 400),
  영상 열기 실패·0프레임 명시 에러, 긴 영상 안전샘플(`NLF_MAX_FRAMES` 균등, fps보정), **GPU `empty_cache()` (8GB 집PC 5연속 대비)**,
  OOM 전용 메시지, Job 자동정리(`DOH_MAX_JOBS`). 동기 `/analyze`도 400 정합.
- **프론트(`analyzer2` v27):** `fetchT`(AbortController 타임아웃: 업로드 120s·폴링 10s),
  **폴링 일시실패 자동 재시도(3회)** — 터널 흔들림에도 안 죽음. 404(Job 만료)·업로드 거부 메시지 개선. 7단계 라벨.
- **검증(목서버+Chromium):** 빈파일→"③ 업로드 거부됨", 폴링 첫2회 503→재시도→"✅ 7단계 완료" PASS. server compile·analyzer2 node --check OK.
- ⚠️ 실 GPU/사지방 왕복 미검증(이 세션 GPU 없음).

## 5m. Measurement Catalog (M###) — 계산식 레벨 명세 **완료(2026-07-23)** ✅  계약 무변경
"새 Feature 그만 만들고, M101~M803을 하나씩 계산식으로 확정" 요청 반영. 개발자가 그대로 코드로
옮길 수 있는 원자적 측정량 명세서를 신설. **`doh.vision.v1` 계약 무영향**(M은 내부 레이어, VF 어댑터만 소비).
- **문서:** `DOH_Vision_Measurement_Catalog_v1.0.md` — 51개 M-code 전수(+ M102 예약). 각 M마다
  ①입력 랜드마크(SMPL-24 idx) ②계산식(OP###/PR### 어휘) ③좌표계(CS4/CS5) ④Phase ⑤단위·정규화
  ⑥Engine(NLF/MediaPipe) ⑦오차 seed ⑧등급 + →VF→Node 매핑.
- **레이어 정의:** `Landmark → Primitive×Operator → **M(원자값)** → VF(골프의미) → 계약 → Node`.
  예: `VF020 X-Factor = M201 흉곽회전 − M101 골반회전`. M은 재사용·단위테스트·정직판정의 단위.
- **등급(정직):** **A 31**(화면-내축·3D세그먼트각, ±3–8°) · **B 16**(깊이Z=DTL+depth_estimated / 축회전·미세관절 ±10–18°) · **C 4**(M304 yaw·M711/712/713 발 = SMPL-24 body 관절 없음→null).
  - 사용자 초안 A32/B13/C4는 근사치였고 이 표가 정본. **M503(상완축회전)·M703/704(고관절축회전)를 A→B로 하향**(점-스켈레톤 축회전 원리적 약함, 정직성).
- **구현 정합:** M101/M201/M104/M202/M203/M301/M501/M502/M705/M706은 이미 `wham_golf_rotation.py`·`wham_golf_metrics.py`에 구현됨(§8 표로 매핑). 미구현 A등급부터 코드화 권장.
- **확인 요청:** M102(골반 시상면 A/P 틸트) 번호 갭 — 채울지 사용자 확인. M403/404(어깨 elevation)는 대응 VF 신설 필요.
- ⚠️ 문서 산출물(코드 변경 아님). 실측 오차 보정은 GPU 왕복 후.

## 5n. 스윙 문제 판정 + 검수 패널 — **구현(2026-07-24)** ✅ 계약 무변경 · 실영상 검수 대기
"AI 분석 끝나면 스윙 문제를 결과로, 근거는 검수용으로 노출" 요청 구현.
- **`analyzer2.html` v28:** `DOH_RULES` 17규칙(1군15+2군2) + `runDohRules` 클라이언트 규칙엔진.
  결과 패널 최상단에 "스윙 문제 진단" — 감지/정상/판정불가 + [근거 보기](측정값 vs 임계값·conf·flags).
  `DOH_REVIEW_MODE=true` 상수 하나로 검수부 on/off(상업용=false). 계약·서버 무변경(진단은 프론트 계층).
- **`wham_golf_metrics.py`:** 규칙용 측정 8종 append(VF085/091/036/033/026/123/067/059) → 총 29 feature.
  깊이축(볼방향) 신설, flag는 계약 폐집합 준수(depth_unreliable). 엔진 NLF v0.3.2 = 최신 확인(2026-07 릴리즈 조회).
- **규칙 문서:** `DOH_Vision_Problem_Rules_v0.1.md` — 임계값 전부 SEED 명시 + 검수 워크플로.
- **검증:** 합성 결함(스웨이·행잉백·치킨윙) 주입 → schema PASS → FO에서 3종 전부 감지·DTL에서 좌우 판정불가·ott 저신뢰 강등 = 뷰게이팅/저신뢰 로직 정상. analyzer2 node --check OK.
- ⚠️ **미검증:** 실영상(GPU) 왕복. 임계값은 사용자 실측 검수로 보정해야 함(그게 검수모드의 목적).

## 5o. 엔진 v2 — 스무딩·축회전·up축 업그레이드 **완료(2026-07-24)** ✅ 계약 무변경
"측정 잘되는 툴 모조리 끌어와 녹이자" 요청. 조사(nlf-pipeline·GVHMR·SwingNet·ViTg) 후 GPU 없이
증명 가능한 3종을 `build_v1` 내부에 적용 → 콜랩·집PC서버·HF Space 동시 업그레이드.
- **① 시간축 스무딩**(`smooth_joints`, med5+avg3): NLF 저자 파이프라인 레시피. 합성+노이즈 8mm에서
  회전오차 합 10.2→5.4°(47%↓), 지터 2.9배↓.
- **② 축회전 분해**(`axial_turn_series`): X-Factor 과대(58~88°)의 근본 원인=어깨선 지면투영.
  골반턴(수직축)+X-Factor(몸통축⊥평면 축회전) 분해로 교체. GT 합성(굽힘40°): XF 오차 5.9→0.0°.
  굽힘 0°에선 신구 일치(회귀 0). **실영상에서 XF가 클래식 범위로 내려오는지 확인 필요.**
- **③ up축 발목-PCA 우선**(`best_up`, 2패스): 몸통평균 up의 굽힘 편향(골반턴 ~5° 왜곡) 제거.
- 회귀: 스키마 PASS·문제판정 유지·compile OK. 로드맵: `DOH_Vision_Engine_Upgrade_v2.md`
  (1순위 SwingNet 융합 — 계약에 method:"swingnet" 이미 예약 / NLF-ViTg 감시 / GVHMR 평가 / 클럽검출).
- ⚠️ 실영상 미검증. 콜랩 첫 실행에서 X-Factor 스케일·이벤트 정확도 재확인 → 규칙 임계값 보정.

## 5p. 실측 발견 — **NLF v0.3.2는 CPU 실행 불가** (2026-07-24, 사용자 콜랩 실측) ⚠️ 중요
사용자가 콜랩에서 GPU 연결 실패(무료 한도 추정) → CPU로 시도 → 런타임 에러:
`Could not run 'aten::empty_strided' with arguments from the 'CUDA' backend` (분석 단계 ⑤에서 발생).
- **원인 확정:** `server/app.py` 코드는 문제 없음(`.cuda()` 하드코딩 전무 확인 — grep 전수검사, `DEVICE`
  변수로 일관 처리, `torch.jit.load(...).to(DEVICE)`). **모델 파일(`nlf_l_multi_0.3.2.torchscript`) 내부에
  CUDA가 하드코딩된 연산이 있어 `.to("cpu")`로도 못 바꿈** — 서드파티 배포 바이너리라 우리가 못 고침.
  (조사 중 확인한 [nlf issue #33](https://github.com/isarandi/nlf/issues/33)의 "aten::get_autocast_dtype"
  계열과 같은 부류의 CUDA-only 이슈로 보임.)
- **파급:** 예전에 "HF Spaces CPU Basic도 대응"이라 가정했던 것(§5j 등, 당시 미검증 표시)이 **이번 실측으로
  틀렸음이 확인됨.** NLF 쓰는 한 GPU는 선택이 아니라 **필수** — HF Spaces는 ZeroGPU(무료지만 GPU 할당)
  또는 유료 GPU 티어만 유효. 배포 계획에서 "CPU 폴백"은 제외해야 함.
- **당장 처방:** GPU 연결 안 되면 CPU로 우회 시도하지 말 것(항상 이 에러로 죽음) — 시간대 바꿔 재시도
  / 다른 구글계정 / Colab Pro 중 택1로 GPU 확보가 유일한 길.
- **다음 확인:** GPU 연결 성공 시 실제 분석 1회 완주 → X-Factor 스케일 확인이 여전히 최우선 과제(§5o).

## 5q. 첫 실영상 왕복 성공 🎉 + 판정 4단계 구간 개편 **(2026-07-24)** ✅
**Stage 0 실영상 첫 완주:** 사용자 콜랩 GPU→trycloudflare→analyzer2, 7단계 완료. 정면(FO)·299프레임·
종합신뢰 80%. P구간 자동검출 정상(P1#125~P10#194, 클럽계 P2/P6/P8만 미검출=설계대로).
실측값: 어깨턴 −109.4°/골반 −30.3°/XF −79.1°(엔진v2 축회전 후 −88→−79로 개선, 여전히 과대→스케일 태그 유지),
치킨윙 33.1°, 플라잉엘보 0.3, 템포 2.7(정상).
**판정 개편(GPT 협의 검수 반영, analyzer2 v32):** 이분법 컷오프 → **4단계 구간**(정상🟢/주의🟡/과다🟠/심함🔴).
- X-Factor: |값| 기준 30~50 정상/50~60 큼(주의)/60↑ 과대 — 심함 없음(스케일 보정전). 부족(<25)도 주의.
- 치킨윙 [25/32/40], 플라잉엘보 [0.15/0.25/0.40]+단위 명시(상완길이 비율), 템포 [2.2~3.6 정상] 등 20구간 전면 재설계.
- 상단엔 과다·심함만 "문제"로, 주의는 경미 표시 — "조금 넘음=빨간 문제" 겁주기 제거.
- **근거 정본: `DOH_기준치_설계근거.xlsx`** — 20구간 × 근거등급(A=검증DB 없음이 목표/B=업계통용·GPT협의/C=임의 seed)
  + 42개 커버리지(규칙 13·측정만 6·미구현 23). 실측 누적 후 평균±SD로 재설정 예정.
- 검증: 실측값 재현 판정 = 치킨윙·플라잉엘보·XF 과다(3건), 나머지 정상 — GPT 권고 구간과 일치.
- **검수 2차(같은 날, v33):** ① 치킨윙 [25/35/45]로 완화(아마 분포+측정오차 ±3~5° 감안 → 33.1°=주의)
  ② 값을 사람 말로 — dohFmt: "상완의 30%"·"스탠스폭의 12%"·"2.7 : 1" (근거표·타일 공통)
  ③ 명명 원칙: 측정명(어깨 회전각)≠진단명(상체 회전 부족) 분리, 단일지표 근사엔 "경향"(치킨윙·플라잉엘보·오버스윙)
  ④ "측정 여러 개→문제 하나"는 이미 계약 §3.6(DOH Node 복수조합)의 설계 — M505·M403/404 등 채워지면 규칙에 check 추가만.

## 5r. 뷰-게이팅 정정 + 얼리익스텐션 승격 **(2026-07-24, 검수 3차)** ✅
사용자 지적 2건 — 둘 다 타당, 내 분류가 과잉보수였음:
- **① "측면에서 엉덩이 뒤로 떨어지면 측정되지 않나?"** → 맞음. 그게 코칭의 **tush line**이고 우리 VF067이
  그 3D판. **측면에서 '볼쪽' 축은 화면 안(in-plane)** — 깊이축은 타깃선 방향임. Camera View Capability
  문서도 원래 "DTL ✅(앞뒤 병진이 화면 좌우로 보임)"이라 맞게 적혀 있었는데, 규칙 작성 시 "앞뒤=깊이"로
  뭉뚱그려 저신뢰(2군) 강등한 게 오류. → **VF067·VF059 depth_unreliable 제거, conf 상향, 1군 승격.**
- **② "정면에서 벨트버클 상승으로 얼리익스텐션 안 되나?"** → 부분적으로 맞음. **상승(수직)은 정면에서 보임**,
  볼쪽 돌진(깊이)만 불가. → **VF121(골반 상승 P5→P7, M106) 신규 구현** — 얼리익스텐션 규칙에 2번째 check로
  추가(돌진=측면 전용 / 상승=양쪽 뷰). 정면에서도 버클 상승분으로 부분 판정 가능.
- 결과: **정면 판정가능 13→14/17**, 측면 12/17(저신뢰 0). 측정 30 feature 방출.
- 검증: 스키마 PASS(FO/DTL), 정면서 상승 0.13 단독 → "과다" 판정 확인, 렌더 undefined 0.
- 산출물: `DOH_뷰별_측정가능표.xlsx`(진단17×뷰 / 측정42×뷰, 엔진 게이팅과 교차검증).

## 5r. 사용자 KB(P1·P2·P4·P6·P7) 결합 — 인과그래프 확보 **(2026-07-25)** ★ 이번 세션 최대 성과
사용자가 수작업으로 만든 코칭 지식베이스 5개 파일을 엔진에 결합하는 방향 확정.
- **KB 실체:** Feature 128개 · **인과 엣지 285개**(정제 후, High Confidence 64%) · 분기(Branch A/B/C) 99 ·
  동반발생 별점(★★★★★) 179. 각 Feature마다 원인체인·예측체인·메커니즘 문장·검증포인트 보유.
- **역할 분담 확정:** 엔진(눈, 오차 있음) = 측정만 / **KB(머리, 경험) = 판단·인과·설명**.
  경쟁 앱과의 차별점은 측정 정확도가 아니라 KB다(측정은 다들 비슷한 모델을 씀).
- **핵심 발견 — 우리가 거꾸로 하고 있었음:** `Chicken Wing (P7)`은 원인 4개를 받는 **말단 증상**인데
  헤드라인으로 띄우고 있었음. 뿌리 1위는 `Thorax Rotation Insufficient (P4)`(원인 10·결과 0, 우리가 측정 가능).
  → 회원 화면은 증상이 아니라 **근본원인**을 말해야 함.
- **출력 구조 확정(사용자 발안):** **관측(사실) → 추정 원인(가능성) → 확인 방법**.
  KB의 신뢰도 등급이 말투로 매핑: High="대개 ~때문입니다" / Medium="~일 수도" / Pattern Dependent="사람에 따라".
  메커니즘 문장은 KB 원문을 그대로 회원 화면에 사용 가능. **틀려도 신뢰가 안 깨지는 구조.**
- **인과 활성화 현황:** 원인 노드 98개 중 우리가 판정 중 14개(엣지 44) · 측정되나 판정 안 함 50개(엣지 **145 죽어있음**) ·
  측정 불가 34개(그립·압력·손목·클럽).

## 5s. A/B/C/D 작업 분류 + 상용 벤치마크 조사 **(2026-07-25)**
'측정은 되는데 판정 안 하는 50개'를 사유별로 분해 → A/B/C/D. 산출물: `DOH_ABCD_작업표.xlsx`(5시트).
- **A(17노드·51엣지) — 완료 ✅** 커밋 6879451. 회전은 전 프레임 시계열인데 P4만 읽고 있었음.
  P3(VF014/017/019)·P5(VF047)·**P7 흉곽(VF151 신설, Spec §7b 등록)**·P10(VF103/104) 방출. feature 29→37.
  P2/P6/P8은 샤프트 평행이라 클럽검출 필요 → 계속 미검출.
- **B(12노드·32엣지) — 기준 조사 완료.** 트레일 팔꿈치 85~115°(통설 90°max + 엘리트 실측 114°),
  머리 이동 1인치(2.5cm), 어깨턴 90°/골반 45°(교과서), 손 높이=어깨~머리.
  ★ X-Factor@P5는 절대값 아닌 **P4 대비 증감**으로 판정 → 임계값 불필요(스케일 미보정 상태에서도 사용 가능한 유일 회전지표).
- **C(9노드·39엣지) — 설계안.** 우선순위: 어깨높이차(P1,난이도 최하) → 리드팔 플레인 → **Hand Depth(11엣지 최대)** → 골반 틸트.
- **D(12노드·23엣지) — 조사로 4건 해소.** Sportsbox 6DOF 정의와 1:1 대응 확인(아래 §5t).

### ★ 확정 사항 — Hand Depth 기준선 = **heel line** (사용자 확정, 2026-07-25)
`Hand Depth Deep/Shallow`의 기준면을 **뒷꿈치 수직선(heel line)** 으로 확정한다.
- **정의:** 양 발목의 지면 수직면을 기준면으로, 손중점의 볼-반대방향(뒤쪽) 변위 ÷ 스탠스폭.
- **채택 이유:** ① 발은 스윙 중 고정 → 회전 오차가 전파되지 않음(흉곽 상대 방식의 최대 약점 회피)
  ② Sportsbox `Hand Thrust`(어드레스 원점 기준 전후 직선이동)와 정의가 사실상 동일 → 상용 대조검증 가능
  ③ 레슨 현장 관행과 일치(사용자 지적).
- **KB 원문(흉곽 상대)은 폐기가 아니라 보조**: "회전 대비 과한가"를 볼 때 병행 지표로 유지.
- 측정 뷰: **측면(DTL)** — 앞뒤축이 화면 안이라 깊이추정이 아님(정상 측정).
- ⚠️ 미구현 — 다음 세션 C작업 1순위 후보(엣지 11개로 최대).

## 5t. 상용 엔진 벤치마크 (조사, 2026-07-25) — 정직성의 근거
| 엔진 | 정확도 | 비고 |
|---|---|---|
| 마커기반(GEARS·AMM3D·Vicon) | 0.5~1.5mm | 골드 스탠다드 |
| **Sportsbox 3D** | **각도 오차 ~2°** | AMM3D 대조 30스윙. 골프전용 학습 + 클럽/볼 keypoint |
| 마커리스 일반 | 5~20mm · 관절각 2.31°±4.00° | 우리 ±3~5° 추정과 정합 |
| 마커리스 손/손가락 | **8~20°** | 손목 제외 근거(수치 확보) |
| 2D 영상앱 | 회전 측정 원리적 불가 | "선·원·화살표를 그려도 몸통 회전은 못 읽음" |

- ⚠️ **학계 경고(반드시 인지):** Ingwersen et al., *"Evaluating current state of monocular 3D pose models for golf"*
  (NLDL 2023, DTU) — 범용 단일카메라 3D 포즈를 모션캡처와 정량비교 결과 **"운동학 분석에 쓰기엔 오차가 너무 크다"**,
  **"현재 모델을 그대로 고급 골프 분석에 쓸 수 없다"**. 우리가 쓰는 NLF가 바로 그 '범용 모델'.
- **해법도 같은 문헌에:** GolfPose(ICPR 2024) 범용 MixSTE 골프 MPJPE 109.4mm → **골프전용 학습 후 35.6mm**(클럽 포함 32.3mm).
  문제는 '3D 단일카메라'가 아니라 **'범용 모델을 그대로 쓰는 것'**. Sportsbox가 2°를 내는 이유도 골프전용 학습.
- **상용도 정상범위는 비공개**(수치만 주고 해석은 코치 몫). 팔꿈치 논문 데이터도 사실상 없음
  (*"Elbow kinematics have rarely been fully described"* — MDPI Sports 2022).
  → **A등급 근거는 업계 전체에 부재.** 우리 차별점은 '기준이 더 정확하다'가 아니라 **'기준을 공개하고 근거등급을 표시하는 정직성'**.

### 부호 규약 대조 (Sportsbox 기준)
회전(−=타겟반대/닫힘) · 높이(+=위) · 앞뒤(+=볼쪽) · 좌우기울기(+=트레일 낮음) → **우리와 이미 일치 ✅**
**스웨이만 반대** — Sportsbox +=타겟쪽 / 우리 +=트레일쪽. ⚠️ **미결정** — 다음 세션에서 맞출지 결정 필요
(지금 고치면 코드 1줄+기준치 부호, 나중엔 누적 데이터까지 손봐야 함).

## 5u. 다음 세션 이어서 할 일 (2026-07-25 시점)
1. **C작업 — Hand Depth(heel line, 확정됨) 구현** ← 엣지 11개로 효과 최대
   그다음 어깨높이차(P1, 난이도 최하·5엣지) → 리드팔 플레인(5엣지) → 골반 틸트(6엣지, 범용모델 열세 예상)
2. **B작업 — 조사된 기준 구간을 DOH_RULES에 반영.** 단 회전 3종은 **절대 스케일 보정 후**에.
3. **KB 그래프 JSON 고정** — 285엣지+메커니즘 문장+신뢰도를 엔진이 읽을 형태로.
4. **관측/추정/확인 3단 출력 UI** — 회원 화면(모바일 목업 방향) + 근본원인 우선순위 로직.
5. **미결정 2건:** ① 스웨이 부호 통일 여부 ② 핸드퍼스트 측정법
   — 사용자 아이디어: **지면 대비 샤프트각으로 핸드퍼스트를 잰다**(물리적으로 정확).
     클럽 검출이 없으므로 대안은 손목→손(knuckle) 벡터로 샤프트 린 근사(오차 8~20°, 그립 개인차) 또는
     어드레스 대비 손 이동(정확하나 '샤프트각'은 아님). **미확정 — 다음 세션 논의.**

## Stage 0 완료 기준 (사용자 확정 — 이거 다 되면 완료)
**기능(7):** 연결테스트·업로드·Job생성·GPU분석완료·JSON반환·analyzer2 렌더 (7단계 초록).
**안정성:** 같은 영상 **5회 연속** — 실패0·Job누락0·UI오류0.
**환경:** **집PC** + **사지방** 둘 다 확인.
**계약:** Stage0 종료까지 `/v1/*`·doh.vision.v1 **무변경**.
→ 핵심 성공기준: "사용자가 아무 설정 신경 안 쓰고 업로드→분석→결과가 안정 반복." 완료 후 Stage1(Modal PoC) 시작.

## 6. 다음 할 일 (우선순위)
1. ~~JSON 계약 고정~~(§5b) · ~~Metrics 1차~~(§5c) · ~~up축+척추각~~(§5d) · ~~집PC 서버+웹UI~~(§5e) · ~~무료 Colab Gradio UI~~(§5f) · ~~Measurement Catalog M###~~(§5m) → **완료.**
2. **집 PC 첫 구동·검증**: start.bat → localhost:8000 → 측면영상 분석 → 척추각 55~65°·스웨이 null 확인. `/health` cuda:true.
3. **엔진 정밀 보정**: X-Factor 스케일(58~73°→클래식~45°), 여러 스윙 실측 대조. 다운스윙 지표(얼리익스텐션 등) 계약에 append.
   - **M-code 코드화(§5m·§8):** A등급 미구현분(M103/M106/M204/M205/M302/M401·402/M504/M506·507·508/M606/M701·702/M709·710/M801·802)을 metrics.py에 추가 → VF로 방출. M102 갭 확인.
4. **FastAPI 래핑**: `POST 영상 → doh.vision.v1 JSON`. (rot.py/NLF 그대로 감싸기.) — GPU 서버 생기면 배포.
5. **프론트**: 웹(analyzer2 진화 or 신규) + 모바일이 같은 API 호출. 지금 `JSON 불러오기`가 그 자리표시자.
6. **나중**: DOH 진단엔진(Feature→Node→Chain)과 결합. (main 쪽 Feature Dictionary·Node Library + `data/vision_feature_map.csv`.)

## 7. 제약/환경
- 사용자: **사지방(군내망)**, 로컬 GPU 없음. Colab은 구글 클라우드라 동작(모델다운·GPU OK). jsdelivr/raw.githack은 군내망서 열림. **터널류(ngrok 등)는 막힐 수 있음.**
- 개발환경(이 세션): GPU/torch 없음, CDN 프록시 차단 → NLF 실행·브라우저 페이지 통짜 테스트 불가(로직 격리검증으로 대체).
- 사용자는 개발 비전문가지만 Colab 셀 실행·에러 캡처 가능.

## 8. 링크·명령
- Colab: `https://colab.research.google.com/github/tinyalex3628-dotcom/doh-golf-survey/blob/claude/session-context-recovery-il15cg/pose3d_poc/pose3d_simple.ipynb`
- analyzer2: `https://raw.githack.com/tinyalex3628-dotcom/doh-golf-survey/claude/session-context-recovery-il15cg/pose_poc/analyzer2.html`
- 회전 추출: `python rot.py joints.pkl --skeleton smpl --png rot.png --json doh_vision.json` (P구간 자동)
- 계약 방출: `python pose3d_poc/wham_golf_rotation.py joints.pkl --skeleton smpl --json-v1 doh_vision_v1.json --view FO --hand right`
- 계약 검증: `python schema/validate.py doh_vision_v1.json`
