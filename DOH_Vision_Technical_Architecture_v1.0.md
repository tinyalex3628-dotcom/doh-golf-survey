# DOH Vision Technical Architecture v1.0
**Project C — Vision Engine 내부 계층 설계 (Pipeline Lock)**
*작성일: 2026-07-01 / 상태: TECHNICAL DRAFT (프로 검토 전)*

> 앞 문서(*Vision Engine Architecture v1.0*)는 **바깥 경계**를 잠갔다: 책임 범위와
> DOH와의 JSON 계약. 이 문서는 **안쪽 계층**을 잠근다: 영상이 들어와서 JSON이
> 나오기까지 통과하는 8개 레이어와, 그 사이로 흐르는 **좌표·신뢰도·에러**의 전파 규칙.
>
> **핵심 추가:** `Landmark → Primitive → Feature` 의 **Primitive 계층**. 그리고
> **Event Detection을 독립 모듈**로 분리. 이게 잠기면 VF001이든 VF500이든 그냥 추가만 하면 된다.

---

## 0. 이 문서의 위치

| 문서 | 잠그는 것 |
|---|---|
| DOH Architecture v1.0 | DOH 전체 헌법 (계층/객체/추론 원칙) |
| DOH AI Video Analysis Research v1.0 | 엔진 조사 (뭘 쓸까) |
| DOH Vision Engine Architecture v1.0 | **바깥 경계** — 책임 범위 + JSON 계약 |
| **DOH Vision Technical Architecture v1.0 (이 문서)** | **안쪽 계층** — 8-레이어 파이프라인 + Primitive + 전파 규칙 |
| DOH Vision Feature Spec v1.0 (다음) | VF### 개별 정의 (이 파이프라인 위에 얹음) |

---

## 1. 잠긴 파이프라인 (The Locked Pipeline)

```
[0] Video (mp4, 60~240fps, FO/DTL)
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ [1] Frame Sampler        영상 → 프레임 + 촬영방향/fps 정규화       │
│         │                                                        │
│         ▼                                                        │
│ [2] Pose Adapter         프레임 → DOH 표준 관절 좌표 (engine 흡수) │  ← 교체지점
│         │                                                        │
│         ▼                                                        │
│ [3] Event Detector       프레임+좌표 → P1~P10 프레임 인덱스        │  ← 독립 모듈
│         │   (독립 모듈, 2-pass: coarse RGB → refine pose)          │
│         ▼                                                        │
│ [4] Primitive Engine     좌표 → 기하 원시객체 (Vector/Point/Plane) │  ← ★신규 계층
│         │   (프레임 단위, 의미 없음, 순수 기하, 재사용)             │
│         ▼                                                        │
│ [5] Geometry Engine      Primitive → 스칼라 연산 (각/거리/속도)     │  ← 순수 함수
│         │   (angle_between, rotation, velocity ... 무상태 연산자)  │
│         ▼                                                        │
│ [6] Feature Engine       (Primitive+연산)@Phase → VF### Feature   │  ← DOH 의미 부여
│         │   (기하값에 phase 앵커 + DOH 어휘 + confidence)          │
│         ▼                                                        │
│ [7] JSON Contract        Feature 집합 → doh.vision.v1 출력         │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
   DOH (Project A)
```

**의미 계층의 경계선 (중요):**
- `[1]~[5]` = **의미 없음(semantic-free).** 순수 신호처리·기하. 골프를 모른다.
- `[6]` = **의미 부여(semantic).** 여기서 처음 "X-Factor", "Spine Tilt" 같은 골프 개념 등장.
- `[7]` = **계약.** DOH 어휘로만 나간다.

> 왜 `[3] Event Detector`가 `[4] Primitive` 앞인가:
> Feature는 **"특정 P에서의 값"**이다. P4가 몇 번째 프레임인지 모르면
> "P4에서의 Spine Tilt"를 계산할 수 없다. → 이벤트 검출은 Feature보다 **반드시 앞**.

---

## 2. 레이어 카탈로그 (한눈에)

| # | 레이어 | 입력 | 출력 | 의미? | 교체성 | 구현 |
|---|---|---|---|:---:|---|---|
| 1 | Frame Sampler | video | frames + meta | ✕ | 라이브러리 | OpenCV/ffmpeg |
| 2 | Pose Adapter | frame | 표준 관절 좌표 | ✕ | **엔진 교체** | MP/RTMPose/YOLO + 매핑 |
| 3 | Event Detector | frame+좌표 | P1~P10 index | ✕ | **모델 교체** | SwingNet / pose-rule |
| 4 | Primitive Engine | 좌표 | Vector/Point/Plane | ✕ | **DOH 자산** | 순수 기하 |
| 5 | Geometry Engine | Primitive | scalar | ✕ | **DOH 자산** | 무상태 연산자 |
| 6 | Feature Engine | 기하값@Phase | VF### | ✅ | **DOH 자산** | Feature Spec 기반 |
| 7 | JSON Contract | Feature | doh.vision.v1 | ✅ | 스키마 고정 | 직렬화 |

> **교체되는 건 2·3(AI 모델)뿐이다. 4·5·6·7은 DOH의 영구 자산.** Primitive를
> 넣은 이유가 여기서 드러난다 — 재사용 가능한 자산을 AI 모델로부터 격리한다.

---

## 3. [1] Frame Sampler

- **책임:** 원본 영상 → 프레임 시퀀스 + 촬영 메타 확정.
- **출력:** `frames[]`, `fps_effective`(메타 검증), `camera_view`(FO/DTL/SIDE), `handedness`.
- **핵심 판단:** 스마트폰 240fps가 **실측인지 보간인지** 검증 → `fps_interpolated` 경고.
- **샘플링 정책:** 이벤트 검출용 coarse(다운샘플) + Feature 계산용 dense(이벤트 구간)를 분리 출력 가능.
- **의미 없음.** 골프를 모른다.

---

## 4. [2] Pose Adapter (엔진 흡수 계층)

- **책임:** 엔진별 랜드마크 규격 → **DOH 표준 관절 어휘**로 정규화. (앞 문서 §4 확장)
- **표준 관절 어휘 (논리 이름, 좌우는 handedness로 해석):**
  `HEAD, LEAD_SHOULDER, TRAIL_SHOULDER, LEAD_ELBOW, TRAIL_ELBOW, LEAD_WRIST,
   TRAIL_WRIST, LEAD_HIP, TRAIL_HIP, LEAD_KNEE, TRAIL_KNEE, LEAD_ANKLE, TRAIL_ANKLE`
- **각 관절 출력:** `{x, y, z, visibility}` — visibility = 이후 confidence의 뿌리.
- **교체 규약:** 새 엔진 추가 = 매핑 테이블 1개 추가. 상위 레이어(4~7) 불변.
- **의미 없음.** "어깨가 어디"만 안다. "어깨 회전이 부족"은 모른다.

```
MediaPipe(33) ┐
RTMPose(17)   ┼─▶ [Pose Adapter] ─▶ {HEAD, LEAD_SHOULDER, ...} + visibility
YOLO(17)      ┘        (엔진별 index 매핑 + lead/trail 해석)
```

---

## 5. [3] Event Detection Layer (독립 모듈)

**Feature와 완전히 분리된 독립 서브시스템.** 입력만 맞으면 통째로 교체 가능.

### 5.1 왜 독립인가
- Feature 계산의 **선행조건**(P가 어디인지)이지만, Feature와는 다른 문제(시간축 vs 공간축).
- 검출 방식이 여러 가지(RGB 딥러닝 / 포즈 규칙 / 기하 보간)라 **플러그인**으로 둔다.

### 5.2 2-Pass 구조 (권장)
```
Pass A (Coarse)   RGB SwingNet 류 → 앵커 이벤트 P1/P4/P7/P10 + 스윙구간 window
       │            (다운샘플 프레임으로 싸게. 포즈 불필요)
       ▼
Pass B (Refine)   포즈 kinematics로 앵커 정밀화 + 보간 이벤트 채움
                    - P7(Impact): 손(HAND_MID) 최저/최고 속도 지점, 방향전환
                    - P4(Top): 손목 궤적 속도 0 교차
                    - P2/P6/P8: CLUB_VECTOR가 지면과 평행이 되는 프레임 (클럽 있을 때)
                    - P3/P5/P9: LEAD arm 지면 평행 (포즈 기하)
```
- **method 태그:** 각 이벤트가 `swingnet | pose_rule | interpolated` 중 무엇으로 잡혔는지 JSON에 기록 → confidence 차등.
- **부분 검출 허용:** P4/P7만 확실하고 나머지 낮은 confidence여도 그대로 출력(숨기지 않음).

### 5.3 P1~P10 ↔ GolfDB 8-event 매핑
(앞 Research 문서 §4.1 참조. 앵커 4개는 모델, 나머지는 기하 보간이 현실적.)

---

## 6. [4] Primitive Layer ★ (신규 핵심 계층)

**Landmark와 Feature 사이의 잃어버린 고리.** 재사용 가능한 기하 원시객체.
**의미 없음** — 순수 기하. "Shoulder Vector"는 골프 개념이 아니라 두 점을 잇는 벡터일 뿐.

### 6.1 왜 필요한가
X-Factor, Shoulder Turn, Spine Tilt는 전부 **SHOULDER_LINE / HIP_LINE / TORSO_AXIS**를
쓴다. Primitive 없이 Feature마다 좌표에서 벡터를 재계산하면 **계산식이 N번 중복**된다.
Primitive를 한 번 만들어 여러 Feature가 공유 → 중복 제거 + 검증 1곳 + 캐싱.

```
LEAD_SHOULDER, TRAIL_SHOULDER ─▶ SHOULDER_LINE (primitive) ─┬─▶ Shoulder Turn (VF)
                                                            ├─▶ X-Factor (VF)
LEAD_HIP, TRAIL_HIP ──────────▶ HIP_LINE (primitive) ───────┴─▶ (재사용)
```

### 6.2 Primitive 카탈로그 v1.0 (프레임 단위)

**파생 점 (Derived Points)**
| Primitive | 정의 | 용도 예 |
|---|---|---|
| PELVIS_CENTER | mid(LEAD_HIP, TRAIL_HIP) | 골반 중심, TORSO_AXIS 하단 |
| THORAX_CENTER | mid(LEAD_SHOULDER, TRAIL_SHOULDER) | 흉곽 중심, TORSO_AXIS 상단 |
| HAND_MID | mid(LEAD_WRIST, TRAIL_WRIST) | 그립 근사, 손 속도/궤적 |
| HEAD_POINT | HEAD | 스웨이/헤드무브 |

**벡터 (Vectors / Segments)**
| Primitive | 정의 (from → to) | 재사용 Feature 예 |
|---|---|---|
| SHOULDER_LINE | TRAIL_SHOULDER → LEAD_SHOULDER | Shoulder Turn, X-Factor, Shoulder Tilt |
| HIP_LINE | TRAIL_HIP → LEAD_HIP | Hip Turn, X-Factor, Pelvis Tilt |
| TORSO_AXIS | PELVIS_CENTER → THORAX_CENTER | Spine Tilt, Spine Angle, Reverse Spine |
| LEAD_UPPER_ARM | LEAD_SHOULDER → LEAD_ELBOW | Arm plane, Chicken Wing |
| LEAD_FOREARM | LEAD_ELBOW → LEAD_WRIST | Lead Arm Angle, Release |
| TRAIL_UPPER_ARM | TRAIL_SHOULDER → TRAIL_ELBOW | Flying Elbow |
| TRAIL_FOREARM | TRAIL_ELBOW → TRAIL_WRIST | Trail Arm Flexion |
| LEAD_THIGH | LEAD_HIP → LEAD_KNEE | Lead Knee Angle |
| LEAD_SHANK | LEAD_KNEE → LEAD_ANKLE | Lead Knee Angle, Early Extension |
| STANCE_LINE | TRAIL_ANKLE → LEAD_ANKLE | 스웨이 정규화 기준폭 |
| CLUB_VECTOR | HAND_MID → CLUBHEAD | Shaft Lean, Club Path *(객체검출 필요)* |

**참조계 (Reference Frames)**
| Primitive | 정의 | 용도 |
|---|---|---|
| VERTICAL | 영상 y축 (중력 근사) | Tilt 기준 |
| GROUND_NORMAL | 지면 수직 | 회전량 투영면 |
| TARGET_LINE | 촬영방향 기반 목표선 | Path, Face 기준 (FO/DTL별) |

> **Primitive 규칙:** ① 골프 용어 금지(순수 기하 명명). ② 프레임 단위로 계산.
> ③ 자신을 구성한 landmark의 confidence/flags를 **상속**(§10·11). ④ append-only.

---

## 7. [5] Geometry Engine (무상태 연산자 라이브러리)

Primitive에 적용하는 **순수 함수**. 상태 없음, 골프 모름, 재사용 100%.

| 연산자 | 시그니처 | 반환 |
|---|---|---|
| `angle_between(v1, v2)` | 두 벡터 | 사잇각(deg) |
| `signed_angle(v1, v2, ref_normal)` | 두 벡터 + 기준법선 | 부호 있는 각 |
| `tilt(v, ref)` | 벡터 + 참조(VERTICAL/GROUND) | 기울기각 |
| `project(v, plane)` | 벡터 + 평면 | 투영 벡터 |
| `rotation_amount(v, f_from, f_to)` | 벡터 + 두 프레임 | 회전량(deg) |
| `displacement(point, f_from, f_to, axis)` | 점 + 프레임 + 축 | 변위 |
| `velocity(x, dt)` | 스칼라/점 시계열 | 시간미분 (속도) |
| `magnitude(v)` | 벡터 | 크기 |
| `ratio(a, b)` | 두 스칼라 | 비율 (예: 템포) |
| `normalize(value, ref_len)` | 값 + 기준길이 | 정규화값 (예: 스웨이/STANCE_LINE) |

> 연산자는 **엔진·골프·phase를 모른다.** 그냥 벡터를 받아 숫자를 낸다.
> 이 무지(無知)가 재사용성의 원천이다.

---

## 8. [6] Feature Engine (의미가 태어나는 곳)

**Feature = Primitive(들) + Geometry 연산자 + Phase 앵커 + DOH 의미.**
여기서 처음으로 골프 개념이 등장한다.

### 8.1 Feature 정의 형식 (Feature Spec이 채울 틀)
```
VF### = operator( primitive(s) ) @ phase(s)   → DOH 의미/어휘
```

### 8.2 예시 (재사용이 드러나는 지점)
| VF | 정의 (조합) | Primitive 재사용 |
|---|---|---|
| Spine Tilt @P1 | `tilt(TORSO_AXIS, VERTICAL) @P1` | TORSO_AXIS |
| Shoulder Turn @P4 | `rotation_amount(project(SHOULDER_LINE, GROUND), P1→P4)` | SHOULDER_LINE |
| Hip Turn @P4 | `rotation_amount(project(HIP_LINE, GROUND), P1→P4)` | HIP_LINE |
| **X-Factor @P4** | `signed_angle(SHOULDER_LINE, HIP_LINE, GROUND_NORMAL) @P4` | **SHOULDER_LINE + HIP_LINE 재사용** |
| Head Sway P1→P4 | `normalize(displacement(HEAD_POINT, P1→P4, lateral), STANCE_LINE)` | HEAD_POINT, STANCE_LINE |
| Lead Knee Angle @P7 | `angle_between(LEAD_THIGH, LEAD_SHANK) @P7` | LEAD_THIGH, LEAD_SHANK |
| Hand Speed ~P7 | `velocity(HAND_MID, dt) around P7` | HAND_MID |
| Shaft Lean @P7 | `signed_angle(CLUB_VECTOR, VERTICAL) @P7` *(클럽 필요)* | CLUB_VECTOR |

> **관찰:** SHOULDER_LINE 하나가 Shoulder Turn·X-Factor·Shoulder Tilt 3개 Feature에
> 재사용된다. Primitive 계층이 없으면 이 벡터를 3번 재계산·3번 검증해야 했다.

### 8.3 Feature Engine의 산출
각 Feature = `{ feature_id, value, unit, phase, primitives_used, landmarks_used,
confidence, error_flags, source_engine }` → 이것이 JSON `features[]` 항목.

---

## 9. [7] JSON Contract (v1.0 확장 — Provenance 노출)

앞 문서의 `doh.vision.v1` 스키마를 유지하되, **레이어 추적성(provenance)** 을 위해
`features[]`에 `primitives_used` 추가, 그리고 선택적 `primitives` 블록을 둔다.

```jsonc
{
  "schema": "doh.vision.v1",
  // source / engines / swing_events / pose_track  … (앞 문서와 동일)

  "primitives": {                     // 선택(디버그/검증용). 기본 생략 가능
    "storage": "ref",                 // 대용량이면 참조
    "catalog_version": "primitive.v1"
  },

  "features": [
    {
      "feature_id": "VF031",
      "name": "Hip-Shoulder Separation (X-Factor) at Top",
      "value": 41.0, "unit": "deg", "phase": "P4",
      "primitives_used": ["SHOULDER_LINE", "HIP_LINE", "GROUND_NORMAL"],   // ★ provenance
      "landmarks_used": ["LEAD_SHOULDER","TRAIL_SHOULDER","LEAD_HIP","TRAIL_HIP"],
      "operator": "signed_angle",     // ★ 어떤 연산자로 나왔나
      "confidence": 0.72,
      "error_flags": [],
      "source_engine": "pose"
    }
  ],
  "quality": { "overall_confidence": 0.84, "view_match": true, "warnings": [] }
}
```

> `primitives_used` + `operator`를 노출하면, 값이 이상할 때 **어느 레이어에서
> 틀어졌는지 역추적**할 수 있다. DOH는 무시해도 되고(계약상 선택 필드), 디버깅엔 필수.

---

## 10. Confidence Propagation (신뢰도 전파)

**신뢰도는 아래로 흐르며 절대 증가하지 않는다(monotonic non-increasing).**
하류에서 확신이 커지는 일은 없다. 곱셈/최솟값으로 전파.

```
c(landmark)  = visibility ∈ [0,1]                         (Pose Adapter 산출)
        │
        ▼
c(primitive) = min( c(구성 landmark들) )                   (약한 고리 = 병목)
        │
        ▼
c(event)     = detector 확률 (method별: swingnet/pose_rule/interpolated 차등)
        │
        ▼
c(feature)   = c_geom × c_event × c_view
                 c_geom  = ∏ c(primitives_used)            (독립 곱)
                 c_event = min( c(사용된 phase 앵커) )
                 c_view  = 이 Feature의 촬영방향 적합도 [0,1]
        │
        ▼
overall_confidence = 영상 전체 집계 (mean_visibility, view_match 반영)
```

- **설계 이유:** `c(feature) ≤ 모든 입력` 이 곱셈으로 보장됨. 관찰 품질을 과장하지 않는다(Architecture Confidence 원칙).
- **DOH 활용:** DOH는 `c(feature)`를 Node 활성화 가중치로 사용. 임계값 미만은 Report에서 강조 안 함(Arch 원칙 4). **Vision은 확신을 정직하게 전달만 하고, 판단은 DOH.**
- `c_view` 예: X-Factor는 DTL에서 신뢰↑ / 정면(FO)에서 신뢰↓. Feature Spec에서 방향별 계수 정의.

---

## 11. Error Propagation (에러 전파)

에러는 **연성(soft)** 과 **경성(hard)** 을 구분한다. 둘의 처리가 다르다.

### 11.1 Soft (값은 내되 신뢰도 깎음) — `error_flags`
| flag | 발생 | 효과 |
|---|---|---|
| `low_visibility` | landmark visibility 낮음 | c 하락, flag 상속 |
| `motion_blur` | 다운스윙 고속 구간 | c 하락 |
| `off_axis_view` | 분석에 덜 적합한 촬영방향 | c_view 하락 |
| `interpolated_event` | 이벤트가 보간으로 채워짐 | c_event 하락 |
| `fps_interpolated` | 스마트폰 가짜 프레임 의심 | 속도계열 c 하락 |

→ **전파 규칙:** flag는 상류→하류로 **합집합(union)** 된다.
`primitive.flags = ⋃ landmark.flags`, `feature.flags = ⋃ primitives.flags ∪ event.flags`.

### 11.2 Hard (값 자체가 없음) — `value: null` + `failure`
| failure | 발생 | 처리 |
|---|---|---|
| `no_pose` | 프레임에 포즈 없음 | 해당 프레임 Feature null |
| `missing_critical_landmark` | 필수 관절 미검출 | 그 Feature null |
| `event_not_found` | 앵커 이벤트 검출 실패 | 그 phase의 Feature 전부 null |
| `club_not_detected` | 클럽 미검출 | 클럽 의존 Feature만 null (나머지 정상) |

→ **원칙:** "**없음(null)**"과 "**0**"을 절대 혼동하지 않는다. DOH는 null=관찰 불가,
0=관찰됐고 값이 0 으로 구분해 추론한다. Vision은 없는 걸 지어내지 않는다.

### 11.3 부분 성공 (Partial Success)
클럽 미검출이어도 포즈 기반 Feature 수십 개는 정상 출력. → **한 레이어 실패가
전체를 무너뜨리지 않는다.** JSON은 성공한 Feature + null Feature를 함께 담아 전달.

---

## 12. End-to-End 예제 (X-Factor @P4, 신뢰도 계산까지)

```
[2] Pose Adapter @frame 372(P4):
    LEAD_SHOULDER  vis 0.95    TRAIL_SHOULDER vis 0.90
    LEAD_HIP       vis 0.88    TRAIL_HIP      vis 0.80

[3] Event Detector: P4 = frame 372, method=swingnet, c_event=0.88

[4] Primitive Engine @frame372:
    SHOULDER_LINE = TRAIL_SHOULDER→LEAD_SHOULDER
        c = min(0.90, 0.95) = 0.90
    HIP_LINE = TRAIL_HIP→LEAD_HIP
        c = min(0.80, 0.88) = 0.80
    GROUND_NORMAL = 참조 (c=1.0)

[5] Geometry Engine:
    signed_angle(SHOULDER_LINE, HIP_LINE, GROUND_NORMAL) = 41.0°

[6] Feature Engine:
    VF031 X-Factor @P4 = 41.0°
    c_geom  = 0.90 × 0.80 × 1.0 = 0.72
    c_event = 0.88
    c_view  = 0.95 (DTL 적합)
    c(feature) = 0.72 × 0.88 × 0.95 ≈ 0.60
    error_flags = []   (모든 landmark visibility 양호)

[7] JSON:
    { "feature_id":"VF031", "value":41.0, "unit":"deg", "phase":"P4",
      "primitives_used":["SHOULDER_LINE","HIP_LINE","GROUND_NORMAL"],
      "operator":"signed_angle", "confidence":0.60, "error_flags":[] }

→ DOH: MOT-012(X-Factor) 근거로 사용, confidence 0.60 가중.
       단독으로 Node 확정 금지 — 다른 Feature와 조합해야 Cluster 발화.
```

---

## 13. 잠금·확장 규칙 (Lock & Extension)

이 파이프라인이 **잠겼다**는 의미:

| 잠긴 것 (변경 = 메이저 버전) | 자유롭게 추가 (마이너) |
|---|---|
| 8-레이어 순서 | 새 Primitive (카탈로그 append) |
| 레이어 간 계약(입출력 형태) | 새 Geometry 연산자 |
| Confidence 전파식(곱/min) | 새 Feature VF### |
| Error soft/hard 구분 | 새 Pose/Event 엔진(어댑터 추가) |
| null≠0 원칙 | 새 error_flag 종류 |

- **VF001~VF500 추가 = 마이너.** 파이프라인 안 건드림. ← 이게 이 문서의 목적.
- Primitive/연산자/Feature 모두 **append-only**(id 재사용·의미변경 금지, KG 원칙 동일).
- 엔진 교체 = Pose Adapter/Event Detector 어댑터 교체. 4·5·6·7 불변.

---

## 14. 로드맵 (갱신)

| 순위 | 산출물 | 유형 | 상태 |
|---|---|---|---|
| 0 | Vision Engine Architecture v1.0 (경계+JSON) | 문서 | ✅ |
| **0.5** | **Vision Technical Architecture v1.0 (이 문서, 파이프라인 잠금)** | 문서 | ✅ 초안 |
| 1 | **Primitive Catalog Spec v1.0** (Primitive 전수 정의) | 문서 | ▶ 다음 |
| 2 | **Vision Feature Spec v1.0** (VF### = Primitive+연산@Phase + Node) | 문서 | 대기 |
| 3 | Geometry Operator Spec (연산자 수식) | 문서 | 대기 |
| 4 | MediaPipe PoC (영상→표준관절→CSV) | 코드 | 대기 |
| 5 | Event Detection 구현 (2-pass) | 코드 | 나중 |

> **왜 Primitive Catalog가 Feature Spec보다 앞인가:** Feature는 Primitive의 조합으로
> 정의된다(§8). Primitive 어휘가 고정돼야 Feature를 `operator(primitive)@phase`
> 형식으로 깔끔하게 쓸 수 있다. Primitive 없이 Feature부터 쓰면 §6.1의 중복 지옥으로 회귀.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (TECHNICAL DRAFT) |
| 작성일 | 2026-07-01 |
| 상위 | DOH Vision Engine Architecture v1.0 |
| 신규 계층 | Primitive Layer, 독립 Event Detection, Confidence/Error Propagation |
| 다음 산출물 | Primitive Catalog Spec v1.0 → Vision Feature Spec v1.0 |
| 상태 | 프로 검토 대기 |

*Landmark는 좌표다. Primitive는 기하다. Feature는 의미다. Node는 추론이다.*
*각 계층은 자기 일만 한다. 이 분리가 잠기면, 위에 무엇을 쌓아도 무너지지 않는다.*
