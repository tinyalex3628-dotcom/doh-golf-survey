# DOH 엔진 → 앱 프로토타입 인수인계 (A: 저장소 코드)

> 작성 2026-07-28 · 저장소 `tinyalex3628-dotcom/doh-golf-survey`
> 브랜치 **`claude/doh-vision-handoff-review-j1rim1`** (개발) / **`engine-stable`** (운영 배포선, 같은 내용)
> git으로 실제 확인한 내용만 적음(짐작 없음). 코드 내용은 안 붙임 — 경로만.

## 0. 먼저 알아둘 것 — 이건 "화면 앱"이 아니라 "엔진 + 분석 페이지 1장"

이 저장소가 주는 것은 ① 측정 엔진(파이썬) ② FastAPI 서버 ③ 분석 결과 화면 1페이지(정적 HTML)다.
**프로토타입이 가져갈 것은 화면이 아니라 API와 JSON 계약**이고, 화면은 참고용 원본이 있다.
(주의: `main` 브랜치는 별개 프로젝트(설문 웹앱)라 여기 것과 무관. 반드시 위 브랜치를 볼 것.)

## 1. 이 세션에서 만들거나 고친 파일 (git diff 96950aa..HEAD, 8커밋)

**엔진 (측정·판정 코어)**
- `pose3d_poc/wham_golf_rotation.py` (수정 — P2 이벤트 검출, 회전@P2 방출)
- `pose3d_poc/wham_golf_metrics.py` (수정 — VF008 어깨기울기, VF152~158 P2 몸지표 7개)
- `pose3d_poc/selfcheck_metrics.py` (신규 — 합성 정답 대조 자기검증)

**판정 기준 (앱이 받아갈 데이터)**
- `rules/doh_rules.v1.json` (신규 — **판정 18규칙 22구간의 실행 정본**)
- `tools/build_rules.py` (신규 — 정본→analyzer2 블록 생성기 + CI 동기화 검사)

**서버 (앱이 호출할 것)**
- `server/app.py` (수정 — `GET /v1/rules` 추가)
- `hf_space/app.py` (수정 — 코드 소스를 engine-stable로, rules 파일 fetch)
- `pose3d_poc/pose3d_simple.ipynb` (수정 — 콜랩 백엔드, rules fetch 추가)

**화면 (참고용 원본)**
- `pose_poc/analyzer2.html` (수정 — BUILD v39. 결과 화면의 전부가 이 한 파일)

**지식베이스 (진단 설명의 재료)**
- `kb/kb_causal_graph.json` (수정 — 인과 그래프 289노드·436엣지, 정본)
- `kb/kb_causal_graph.v1.json` (신규 — 동결 백업) · `kb/source/DOH_P1~P7.xlsx` (신규 5개 — 원본 보존)
- `tools/build_kb_graph.py` (신규 — 추출기)

**검증·문서**
- `.github/workflows/engine-check.yml` (신규 — 푸시마다 자동검증 4종)
- `tools/ci_smoke.py` (신규 — 합성 스윙→엔진 통짜 검증)
- `docs/DOH_기준치_설계근거.xlsx` · `docs/DOH_P2_구현표.xlsx` · `docs/DOH_ABCD_작업표.xlsx` · `docs/DOH_뷰별_측정가능표.xlsx` (재생성/신규 — 스크립트는 `tools/build_*.py`)
- `DOH_Vision_Feature_Spec_v1.0.md` §7c · `DOH_Vision_Handoff.md` §5w~5ab (수정)

## 2. "라우트" — 웹앱 라우트는 없음. 통합 지점은 API다

화면 라우트가 있는 앱이 아니다. 정적 페이지 1장 + **API 5개**:

| 메서드·경로 | 역할 |
|---|---|
| `POST /v1/analyze/video` | 영상 제출(view=FO/DTL, hand) → 202 `{job_id}` |
| `GET /v1/jobs/{job_id}` | 폴링 → `{status, result?}` — result가 doh.vision.v1 JSON |
| `GET /v1/rules` | **판정 기준(정본 JSON)** — 앱은 기준을 하드코딩하지 말고 이걸 받아 판정 |
| `GET /v1/capabilities` | 엔진·모델·스키마 버전 |
| `GET /v1/health` | 상태 확인 |

응답 계약: `schema/doh.vision.v1.schema.json` (기계검증용) · `schema/doh.vision.v1.example.json` (실측 예제 — **프로토타입 목데이터로 이거 그대로 쓰면 됨**).

## 3. 화면 흐름 (analyzer2.html 1페이지 안의 섹션 이동)

| 화면(섹션) | 누르는 것 | 가는 곳 |
|---|---|---|
| 앵글 선택 (정면/측면 카드) | [정면 영상 선택]/[측면 영상 선택] | 같은 페이지, 영상 로드됨 |
| 백엔드 연결 바 | [🔌 연결 테스트] | 같은 자리 상태 문구 갱신 |
| 백엔드 연결 바 | [서버로 분석] | 업로드→job 폴링→결과 패널(`#v1panel`)로 스크롤 |
| 결과 패널 | [🎯 3D 결과(JSON) 불러오기] | 파일 선택→결과 패널 렌더 (서버 없이 JSON만으로) |
| 결과 패널 · P구간 칩 | P1~P10 칩 클릭 | 위 영상이 해당 프레임으로 이동 |
| 결과 패널 · 진단 카드 | [근거 보기 (검수)] | 카드 안에서 펼침(측정값·구간·신뢰도 표) |
| 측정 상태판 42타일 | 타일 호버 | 툴팁(판정 근거·함께 측정됨) |

## 4. 진입/복귀 — 기존 앱 없음 (독립 페이지)

- 이 화면은 어떤 앱에도 붙어 있지 않다. raw.githack URL로 여는 독립 페이지.
- **프로토타입 권장 통합**: 화면을 이식하지 말고, `업로드 → POST /v1/analyze/video → 폴링 → JSON → 자기 화면에 렌더`로 새로 그릴 것. 렌더 참고가 필요하면 analyzer2.html의 결과 패널 구조(진단 카드 → 42타일 상태판 → P구간 칩 → 회전/자세 그리드 순서)를 볼 것.
- 동작 데모(합성 스윙 주입본, 참고용): https://claude.ai/code/artifact/d978a9f5-fd4b-4154-ab0c-77a7b3e41f59

## 5. 빈 상태 / 로딩 / 에러 — 전부 `pose_poc/analyzer2.html` 안 (별도 파일 없음)

| 상태 | 화면 표현 (문구는 파일에서 그대로 가져갈 것) |
|---|---|
| 빈 상태 | "— 앵글을 선택하고 영상을 올리세요 —" |
| 서버 분석 로딩 | 업로드→job 폴링 단계별 문구 + 일시실패 자동 재시도 |
| 판정불가 (측정 없음) | 규칙 카드 "판정불가" (회색) + 접힌 목록 |
| 측정불가 (각도 불일치) | 타일 "각도 불일치" / 값 자리 "이 촬영각도에선 측정 불가" |
| 값은 있는데 기준 없음 | 타일 "• 측정됨" (파랑) — 정상/문제 판정 안 함 |
| 근사 측정 | `interpolated_event` 플래그 → 신뢰도 감점 표시 |
| 에러 | 업로드 거부/Job 만료 문구 (v27 하드닝 참조) |

## 6. 앱이 지켜야 할 규칙 3개 (이것만 지키면 엔진이 계속 바뀌어도 안 깨짐)

1. **모르는 `VF###`는 무시** — 엔진은 측정을 계속 추가한다(append-only).
2. **`value: null` = "이 각도에선 측정 불가"로 표시** — 억지로 0 취급 금지.
3. **판정 기준은 `/v1/rules`에서** — 하드코딩 금지. 구간 해석: 변환값 `tv < B0` 정상 / `< B1` 주의 / `< B2` 과다 / 이상 심함 (경계값=나쁜 쪽). 변환 `t`: high=v · low=−v · abs=|v| · low_abs=−|v|. `"INF"`/`"-INF"` 문자열=무한.

배포선: 운영은 `engine-stable` 브랜치만 볼 것. 개발 반영 = CI(engine-check) 초록 확인 후 `git push origin <작업브랜치>:engine-stable`.
