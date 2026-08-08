# DOH 스윙분석 엔진 — 세션 핸드오프 (이어서 작업용)

> 새 채팅/세션이 이 파일을 읽고 **그대로 이어서** 작업하기 위한 요약.
> 브랜치: `claude/ai-video-analysis-engine-wlr06k` · PR **#7**(open, base=main).

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

## 6. 다음 할 일 (우선순위)
1. ~~JSON 계약 고정~~(§5b) · ~~Metrics 1차~~(§5c) · ~~up축+척추각~~(§5d) · ~~집PC 서버+웹UI~~(§5e) · ~~무료 Colab Gradio UI~~(§5f) → **완료.**
2. **집 PC 첫 구동·검증**: start.bat → localhost:8000 → 측면영상 분석 → 척추각 55~65°·스웨이 null 확인. `/health` cuda:true.
3. **엔진 정밀 보정**: X-Factor 스케일(58~73°→클래식~45°), 여러 스윙 실측 대조. 다운스윙 지표(얼리익스텐션 등) 계약에 append.
4. **FastAPI 래핑**: `POST 영상 → doh.vision.v1 JSON`. (rot.py/NLF 그대로 감싸기.) — GPU 서버 생기면 배포.
5. **프론트**: 웹(analyzer2 진화 or 신규) + 모바일이 같은 API 호출. 지금 `JSON 불러오기`가 그 자리표시자.
6. **나중**: DOH 진단엔진(Feature→Node→Chain)과 결합. (main 쪽 Feature Dictionary·Node Library + `data/vision_feature_map.csv`.)

## 7. 제약/환경
- 사용자: **사지방(군내망)**, 로컬 GPU 없음. Colab은 구글 클라우드라 동작(모델다운·GPU OK). jsdelivr/raw.githack은 군내망서 열림. **터널류(ngrok 등)는 막힐 수 있음.**
- 개발환경(이 세션): GPU/torch 없음, CDN 프록시 차단 → NLF 실행·브라우저 페이지 통짜 테스트 불가(로직 격리검증으로 대체).
- 사용자는 개발 비전문가지만 Colab 셀 실행·에러 캡처 가능.

## 8. 링크·명령
- Colab: `https://colab.research.google.com/github/tinyalex3628-dotcom/doh-golf-survey/blob/claude/ai-video-analysis-engine-wlr06k/pose3d_poc/pose3d_simple.ipynb`
- analyzer2: `https://raw.githack.com/tinyalex3628-dotcom/doh-golf-survey/claude/ai-video-analysis-engine-wlr06k/pose_poc/analyzer2.html`
- 회전 추출: `python rot.py joints.pkl --skeleton smpl --png rot.png --json doh_vision.json` (P구간 자동)
- 계약 방출: `python pose3d_poc/wham_golf_rotation.py joints.pkl --skeleton smpl --json-v1 doh_vision_v1.json --view FO --hand right`
- 계약 검증: `python schema/validate.py doh_vision_v1.json`
