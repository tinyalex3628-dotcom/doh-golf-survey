# 앱 UI 프로토타입 ↔ 비전 엔진 연결 — 새 세션 인수인계

> 작성 2026-07-28. 이 저장소엔 **서로 다른 두 프로젝트가 브랜치로 나뉘어** 있다.
> 아래는 git으로 실제 확인한 내용만 적음(짐작 없음) — 새 세션은 시작 전에 반드시
> 두 브랜치를 각각 `git ls-tree -r --name-only origin/<branch>`로 직접 확인할 것.

## 0. 두 프로젝트

| | 브랜치 | 뭔가 |
|---|---|---|
| **앱 UI** | `claude/claude-design-layout-coding-dbscri` | Expo/React Native 앱. 화면·내비게이션·슬라이더 다 있음. **영상재생·AI는 플레이스홀더** |
| **비전 엔진** | `claude/doh-vision-handoff-review-j1rim1` (개발) / `engine-stable` (운영) | 영상→3D 관절(AI)→측정→판정. FastAPI 서버 + 판정 JSON |

**이 작업은 앱 UI 브랜치에서, 비전 엔진 브랜치의 API·계약을 갖다 쓰는 일이다.**
두 브랜치를 같은 로컬에 동시에 놓고 볼 필요는 없음 — 엔진 쪽은 API 계약(아래 §2)만 보면 됨.

## 1. 앱 UI 쪽 실태 — 파일별로 확인한 것

**화면 (`src/screens/`):**
- `SingleScreen.tsx` — 단독 분석
- `MultiScreen.tsx` — 과거 스윙과 비교 (좌우 분할, 공통 슬라이더)
- `ProCompareScreen.tsx` / `ProSoloScreen.tsx` — 프로 비교/단독
- `UploadScreen.tsx` — 업로드. **지금은 토글만 하고 `single`로 이동** — 실제 파일 업로드도, API 호출도 없음
- `GalleryScreen.tsx` — 내 스윙 목록. `useSwings()` 훅이 채움

**공통 컴포넌트:**
- `src/components/PositionControls.tsx` — P1~P10 탭 + 0~100 슬라이더. **양방향 변환이 지금은 가짜 선형식**:
  ```ts
  frameToP = (frame) => Math.round((frame/100) * 9)   // P1~P10을 균등 간격으로 가정
  pToFrame = (i) => Math.round((i/9) * 100)
  ```
  실제 스윙은 균등하지 않다 — 백스윙:다운스윙 템포비가 통상 2.2~3.6:1(엔진 `rules/doh_rules.v1.json`의 `tempo` 규칙 참조). P4(탑)가 슬라이더 중간에 안 옴.
- `src/components/SwingStage.tsx` — 영상이 뜨는 자리. **주석 원문: "실제 영상/AI는 준비 중 → 플레이스홀더"**. 지금은 실루엣 도형 + SVG 각도선.
- `src/state/comparison.tsx` — 프로 비교 플로우 상태(pro/cam 선택)만. 영상·분석결과 상태 없음.

**데이터 모델 (`src/types/swing.ts`):**
```ts
type Swing = { id, side, club, tag?, uri?, createdAt }
// side: '정면'|'측면'|'영상(미분류)'  ← 엔진의 FO/DTL과 1:1 대응 가능
// uri: 기기 미디어 라이브러리 경로 (expo-media-library)
```

**확인된 공백 (짐작이 아니라 grep으로 확인함):**
- `package.json`에 **`expo-av`/`expo-video`/`react-native-video` 없음** — 영상 재생 컴포넌트 자체가 아직 없다.
- 저장소 전체에서 **`fetch(`/`axios` 사용 0건** — API를 부르는 코드가 한 줄도 없다. 전부 로컬 상태·목데이터(`useSwings`의 `SAMPLE`).

## 2. 엔진 쪽 — 앱이 가져다 쓸 계약 (읽기만 하면 됨)

| 뭐 | 어디서 | 비고 |
|---|---|---|
| 영상 제출 | `POST /v1/analyze/video` (view, hand) | 202 `{job_id}` |
| 결과 폴링 | `GET /v1/jobs/{job_id}` | `{status, result?}` — result가 아래 JSON |
| 판정 기준 | `GET /v1/rules` | 하드코딩 금지, 항상 이걸로 |
| 결과 JSON 스키마 | `schema/doh.vision.v1.schema.json` | 기계검증 |
| 결과 JSON 예제(목데이터용) | `schema/doh.vision.v1.example.json` | UI 개발 중엔 이걸 그대로 써도 됨 |
| P구간 실제 프레임 | 결과의 `swing_events: [{p:"P4", frame:98, method:"pose_rule"}, ...]` | **이게 진짜 P1~P10 위치** — PositionControls의 가짜 변환식을 대체할 재료 |

## 3. 연결 작업 — 정확히 뭘 해야 하나

### ① 영상 재생 라이브러리 선택·설치
없는 걸 확인했으니 새로 넣어야 함(`expo-video` 권장 — Expo 공식, `expo-av`는 구세대).
`SwingStage.tsx`의 실루엣 자리를 실제 영상 컴포넌트로 교체.

### ② 업로드→분석 API 연결
`UploadScreen.tsx`가 지금 토글만 하는 자리에 `POST /v1/analyze/video` 호출 + `GET /v1/jobs/{id}` 폴링 추가.
결과(doh.vision.v1)를 `Swing`에 붙일 필드가 필요 — 예: `Swing.analysis?: object` 추가.

### ③ PositionControls를 진짜 P구간에 연결 — 여기가 핵심이자 함정
지금 코드는 P1~P10이 균등 간격이라고 가정한다. 실제로는:
- **한 영상 안에서도** 안 균등(위 템포비).
- **두 영상을 비교할 때**(MultiScreen/ProCompareScreen) 각 영상은 **프레임 수·길이가 다르다** — "같은 프레임 번호"로 동기화하면 안 되고, **"같은 P시점"**으로 동기화해야 한다(내 백스윙 탑 ↔ 프로 백스윙 탑).

→ 올바른 설계: 슬라이더는 여전히 "스윙 진행도"(연속값, 0~9 구간)를 들고 있되, **각 영상마다 자기 `swing_events`로 그 진행도를 자기 프레임으로 변환**한다(구간 내 선형보간). 즉 `frameToP`/`pToFrame`을 전역 1개가 아니라 **영상별로 하나씩**(입력: 그 영상의 `swing_events`) 두고, MultiScreen/ProCompareScreen은 슬라이더 값 하나를 두 영상 각각의 변환함수에 넣어 각자의 실제 프레임을 얻는다.

### ④ 판정·기준 표시
결과 화면(아직 없다면 신설)에서 `/v1/rules`를 받아 `doh.vision.v1`의 `features`와 대조해 정상/주의/과다/심함 표시.
참고 구현(로직만, 그대로 베끼지 말고 구조 참고): `pose_poc/analyzer2.html`의 `dohCheck`/`runDohRules`.

### ⑤ 뷰(FO/DTL) 대응
`Swing.side`('정면'/'측면')를 엔진의 `view`('FO'/'DTL')로 매핑. 이미 값이 호환되니 매핑 테이블 하나면 됨.

## 4. 앱이 지켜야 할 규칙 3개 (엔진이 계속 바뀌어도 안 깨지려면)

1. **모르는 `feature_id`(VF###)는 무시** — 엔진이 측정을 계속 추가한다.
2. **`value: null` = "이 각도에선 측정 불가"로 표시** — 0 취급 금지.
3. **판정 기준은 하드코딩 금지, `/v1/rules`에서 받을 것.**

## 5. 시작 전 새 세션이 먼저 할 것

1. 어느 브랜치에서 작업할지 확인(위 앱 UI 브랜치가 기본 대상일 것).
2. `git log`/`git status`로 위 §1 파일들이 여전히 이 상태인지 재확인(시간이 지나 바뀌었을 수 있음 — 이 문서를 맹신하지 말 것).
3. `schema/doh.vision.v1.example.json`을 목데이터로 로드해 §3 순서(①→⑤)대로 하나씩 연결.
