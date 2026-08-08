# DOH Vision JSON Contract v1.0 — `doh.vision.v1` **[LOCK]**
**Project C(Vision Engine) → Project A(DOH KG) 를 잇는 유일한 계약. 이 문서가 그 계약을 동결한다.**
*작성일: 2026-07-03 / 상태: **LOCKED v1.0** (append-only 진화)*
*기계검증: `schema/doh.vision.v1.schema.json` · 정본예제: `schema/doh.vision.v1.example.json` · 검증기: `schema/validate.py`*
*상위: Vision Engine Architecture v1.0 §5 · Vision Feature Spec v1.0(VF001~150)*

> **한 줄:** Vision Engine은 `영상 → JSON`까지만 책임진다. 그 JSON이 `doh.vision.v1`이다.
> 모델(NLF/MediaPipe/RTMPose/YOLO)이 바뀌어도 이 계약이 같으면 DOH·UI·모바일은 안 바뀐다.
> **계약이 척추다.** 그래서 먼저 잠근다.

---

## 0. 이 문서가 하는 일
Vision Engine Architecture v1.0 §5가 스키마 **초안**을 그렸다(프로 검토 전 DRAFT).
이 문서는 그것을 **① 기계검증 가능한 JSON Schema로 형식화**하고 **② 실측 데이터로 정본 예제를
고정**하고 **③ 불변원칙·버전정책·어휘를 명시적으로 LOCK**한다. 여기서부터 v1.0은 **동결**이며,
변경은 §7 규칙(append-only)으로만 한다.

| 산출물 | 파일 | 역할 |
|---|---|---|
| **스키마(계약 본체)** | `schema/doh.vision.v1.schema.json` | Draft 2020-12. 기계검증의 단일 진실원. |
| **정본 예제** | `schema/doh.vision.v1.example.json` | 실측 정면 스윙(흉곽 -101.5° 등)으로 채운 유효 인스턴스. |
| **검증기** | `schema/validate.py` | jsonschema 있으면 정식, 없으면(오프라인) 내장 인터프리터. 드리프트 0. |
| **어댑터** | `pose3d_poc/wham_golf_rotation.py --json-v1` | 회전 파이프라인 → 계약 인스턴스 방출(계약을 실제로 만족). |

**검증:** `python schema/validate.py`  (self-test) · `python schema/validate.py 파일.json` (임의 인스턴스)

---

## 1. 최상위 구조 (7 블록)
```jsonc
{
  "schema": "doh.vision.v1",        // const. 계약 버전 태그
  "generated_at": "…Z",             // RFC3339 UTC
  "source":  { … },                 // 무엇을·어떤 조건으로 봤나 (재현성)
  "engines": { pose, event, object },// 어떤 모델이 값을 만들었나 (교체 추적)
  "swing_events": [ … ],            // 언제(P1~P10 프레임)
  "pose_track": { … } | null,       // (선택) 원시 관절 트랙
  "features": [ … ],                // ★ DOH가 소비하는 사실값 (VF###)
  "quality": { … }                  // 이 영상 자체의 신뢰도
}
```
`schema · generated_at · source · engines · swing_events · features · quality` = **필수**.
`pose_track` = 선택(대용량이면 `storage:"ref"`로 외부분리).

---

## 2. 필드 레퍼런스

### 2.1 `source` — 캡처 조건
| 필드 | 타입 | 필수 | 값 |
|---|---|:--:|---|
| `video_id` | string | ✅ | 영상 식별자 |
| `handedness` | enum | ✅ | `right`\|`left` — **모든 feature의 lead/trail 해석 기준** |
| `camera_view` | enum | ✅ | `FO`(정면)\|`DTL`(후면)\|`SIDE`\|`unknown` |
| `duration_frames` | int≥1 | ✅ | 총 프레임 |
| `fps_declared`/`fps_effective` | number\|null | | 선언 fps / 메타검증 실제 fps |
| `resolution` | `[w,h]`\|null | | 픽셀 |

### 2.2 `engines` — 값의 출처 (교체 이력)
`pose`·`event`·`object` **세 키 모두 존재**해야 하며 각각 `{name, variant?, version?}` **또는 `null`**.
(그 레이어를 안 돌렸으면 null. 예: 클럽 미검출 → `object: null`.)

### 2.3 `swing_events[]` — 언제
`{ p:"P1".."P10", name?, frame≥0, confidence 0..1, method }`.
`method` ∈ `pose_rule | swingnet | hybrid | interpolated | manual`.
P2/P3/P5/P6/P8/P9는 보간일 수 있음 → `method:"interpolated"`로 구분.

### 2.4 `features[]` — ★ 계약의 심장
> **Feature = Operator( Primitive[…] ) @ Phase [Coord].** `feature_id`는 **DOH 어휘(VF###)**이지
> 엔진 랜드마크 인덱스가 아니다. (Feature Spec v1.0)

| 필드 | 타입 | 필수 | 값 |
|---|---|:--:|---|
| `feature_id` | `^VF[0-9]{3}$` | ✅ | VF001~VF150 (append-only) |
| `value` | number\|bool\|**null** | ✅ | 측정값. **null = 시도했으나 측정불가**(부분출력). *생략 = 미시도.* |
| `unit` | enum | ✅ | `deg ratio cm_normalized s frame deg/s norm order flag` |
| `phase` | pattern | ✅ | `P4` \| `P1->P4` \| `P1_vs_P4` \| `post-P7` \| `global` |
| `confidence` | 0..1 | ✅ | **이 값의 신뢰도. 절대 숨기지 않는다.** |
| `error_flags` | enum[] | ✅ | 아래 폐집합. 없으면 `[]` |
| `name` | string | | 골프 의미 |
| `coord` | enum | | `BODY GROUND TARGET none` (Coordinate Spec v1.0) |
| `operator` | `^OP[0-9]{3}$`\|null | | provenance |
| `primitives` | string[] | | 입력 Primitive |
| `landmarks_used` | string[] | | 사용 표준관절 |
| `source_engine` | enum | | `pose event object derived` |

**`error_flags` 폐집합(v1):**
`low_visibility · motion_blur · off_axis_view · view_mismatch · occlusion · out_of_frame ·
depth_unreliable · ground_unreliable · interpolated_event · structure_inferred ·
club_not_detected · ball_not_detected`
(새 flag는 §7에 따라 v1.x 범프 필요.)

### 2.5 `quality` — 영상 전체 신뢰도
`{ overall_confidence 0..1(필수), view_match bool(필수), mean_visibility 0..1|null, warnings string[] }`.
DOH는 이를 confidence 가중에 사용.

---

## 3. 불변 원칙 (계약을 계약으로 만드는 것)
Engine Architecture §5.1·§10에서 승계, 여기서 **강제(스키마로 검증됨)**:

1. **`feature_id`는 DOH 어휘다. 엔진 인덱스가 아니다.** 엔진이 바뀌어도 `VF020`의 의미(X-Factor @P4)는 불변.
2. **모든 feature는 `confidence`와 `error_flags`를 반드시 가진다.** 관찰 품질을 숨기지 않는다. *(required로 강제)*
3. **Vision은 Node를 언급하지 않는다.** `related_nodes` 같은 필드는 이 계약에 **없다**(`additionalProperties:false`로 침입 차단). Feature→Node 매핑은 DOH 소유(`vision_feature_map.csv`).
4. **append-only.** v1.x에서 필드/enum값 **추가**는 OK. 기존 `feature_id`·필드 **의미 변경/재사용은 금지**(과거 추론 추적성).
5. **부분 출력 허용, 그러나 '없음'과 '0'을 구분.** 미측정 feature는 **생략**, 시도했으나 실패는 **`value:null`**. `object` 미탐지면 `engines.object:null` + 클럽 feature 생략/누락.
6. **단일 Feature ≠ Node 확정.** Vision은 근거(evidence)만 공급. Node 발화는 DOH의 복수조합.
7. **원인/진단/드릴/Report 문구 금지.** Vision 출력은 항상 "관찰된 사실값". `spine_angle=38.2°, conf 0.91`은 OK, `"자세 나쁨"/"슬라이스 원인"`은 절대 금지.

---

## 4. VF 어휘 정합 — 주의 (중요)
Engine Architecture v1.0 §5의 **예시 JSON**은 Feature Spec **작성 이전** DRAFT라 임시 VF ID를 썼다
(예: 그 예시의 `VF014=Head Sway`, `VF031=X-Factor`). **정본은 Feature Spec v1.0**이며 이 계약은 그것을 따른다:

| 의미 | **정본(Feature Spec v1.0)** | Engine Arch §5 예시(폐기) |
|---|---|---|
| Shoulder Turn @P4 | **VF015** | — |
| Hip Turn @P4 | **VF018** | — |
| X-Factor @P4 | **VF020** | VF031(예시, 무시) |
| Head Sway P1→P4 | **VF031** | VF014(예시, 무시) |
| Spine Tilt @P1 | **VF001** | VF001(일치) |

> 규칙 4(append-only)에 따라 **VF ID의 의미는 Feature Spec v1.0으로 확정**. Engine Arch §5 예시의 ID는
> 스키마 형식 설명용 placeholder였고 계약 어휘가 아니다.

---

## 5. rotation.v1 과 v1 의 관계
현재 두 출력이 공존한다 — 혼동 금지:

| 출력 | 스키마 | 용도 | 생성 |
|---|---|---|---|
| **`doh.vision.rotation.v1`** | (경량, 회전 전용) | **analyzer2.html 레거시** 3D 회전카드 표시 | `--json` |
| **`doh.vision.v1`** ★ | 본 계약 | **모바일/웹/DOH 공용 정식 계약** | `--json-v1` |

- rotation.v1은 analyzer2가 이미 읽는 표시용 서브셋. 유지(하위호환).
- **v1이 정식 계약.** 어댑터가 회전 4개(`VF015 어깨턴 / VF018 힙턴 / VF020 X-Factor @P4 / VF075 힙클리어 P1→P7`) + **포즈 파생 12개**를 계약 feature로 방출.
- **Metrics 확장(`pose3d_poc/wham_golf_metrics.py`)** — 회전 외 지표를 **같은 계약에 append**:

  | 분류 | VF | 계산 근거(월드 수직축 불필요, robust) |
  |---|---|---|
  | 팔각 | VF011/012/027/087 | 어깨-팔꿈치-손목 **세그먼트 상대각** |
  | 무릎각 | VF039/040/088 | 엉덩이-무릎-발목 상대각 |
  | 스웨이 | VF031(머리)/034(골반) | 스탠스선(발목-발목) 투영 / 폭 정규화 |
  | 템포 | VF111/113/114 | 이벤트 프레임 산술 |
  | **척추/플레인** | VF002/038/076/022/001 | **세계 수직축(up) 기준 각** — 아래 up 추정기 |

- **세계 수직축(up) 추정 (`estimate_up`):** 발목이 지면에 planted → 점구름 최소분산축 = 수직(torso 기울기 무관). 순수 파이썬 Jacobi 고유분해, 합성지면 검증 오차 <0.2°. 몸통(머리-발) 정합 가드로 모호(체중이동 부족) 케이스 폴백+감점.
- **척추각 규약: 지면(수평) = 0°, 수직 = 90°.** `척추각 = 90 − angle(spine, up)`. 어드레스 자세 ~55~65°.
- **뷰-게이팅(실측 반영):** 지표마다 '사는 축'이 있고 그 축이 카메라 화면 안이면 신뢰·깊이축이면 불가.
  - **스웨이·좌우틸트(VF031/034/001) = 정면(FO) 전용** (타깃선/좌우 = DTL의 깊이축).
  - **척추 전후각·플레인(VF002/038/076/022) = 측면(DTL) 전용** (시상면 = FO의 깊이축; 실측 확인).
  - 팔·무릎 세그먼트각·회전·템포 = **양쪽 OK**(3D).
  - 뷰 안 맞으면 **`value:null` + `["view_mismatch"]`**, unknown이면 계산+`off_axis_view` 감점.
- **아직 안 뽑는 것(정직):** 다운스윙 세부(얼리익스텐션 VF067·스탠딩업 VF068), 클럽/볼 계열(객체검출 2차). 전부 이 계약에 **append만** 하면 UI/DOH/모바일 불변.

**어댑터 사용(회전+metrics 한 번에):**
```
python wham_golf_rotation.py joints.pkl --skeleton smpl \
    --json-v1 doh_vision_v1.json --view FO --hand right --fps 60
```

---

## 6. 검증 (재현)
```
$ python schema/validate.py                 # self-test: schema + 정본예제
  ✓ doh.vision.v1.example.json  [builtin]
  RESULT: PASS
$ python schema/validate.py my_instance.json # 임의 인스턴스 검사 (exit 0/1)
```
- `jsonschema` 설치 환경(서버/CI) → Draft 2020-12 정식 검증.
- 미설치(사지방/오프라인) → 스키마 파일을 읽어 해석하는 **내장 인터프리터**(하드코딩 규칙 없음 → 두 모드 불일치 불가).
- 위반은 경로와 함께 보고: 예) `/features/0/confidence: 1.4 > maximum 1`.

---

## 7. 버전 정책 (append-only)
| 변경 | 허용? | 방법 |
|---|:--:|---|
| 새 feature_id(VF###) 사용 | ✅ | Feature Spec에 정의 후 그대로 방출 |
| 새 선택 필드 추가 | ✅ | v1.x, `additionalProperties`는 해당 버전 스키마에서 확장 |
| enum 값 추가(unit/error_flags 등) | ✅ | v1.x 스키마에 추가 |
| 기존 feature_id/필드 **의미 변경** | ❌ | 금지(규칙 4). 새 ID/필드를 만든다 |
| 필수 필드 제거·의미 재사용 | ❌ | 금지 → 그건 v2 |
| 최상위 `schema` 태그 | 🔒 | v1 동안 `doh.vision.v1` 고정 |

인스턴스는 자신이 선언한 버전의 스키마로 검증한다. v1.1 인스턴스는 v1.1 스키마로.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | **v1.0 (LOCKED)** |
| 작성일 | 2026-07-03 |
| 계약 태그 | `doh.vision.v1` |
| 기계검증 | `schema/doh.vision.v1.schema.json` (Draft 2020-12) |
| 정본 예제 | `schema/doh.vision.v1.example.json` (실측 스윙) |
| 검증기 | `schema/validate.py` (jsonschema / 내장 이중화) |
| 어댑터 | `pose3d_poc/wham_golf_rotation.py --json-v1` |
| 상위 | Vision Engine Architecture v1.0 §5 · Vision Feature Spec v1.0 |
| 다음 | Metrics 확장(척추·스웨이·머리·무릎…)을 **이 계약에 append** |

*계약은 척추다. 모델은 갈아끼우는 근육이다. 근육이 바뀌어도 척추는 안 흔들린다.*
