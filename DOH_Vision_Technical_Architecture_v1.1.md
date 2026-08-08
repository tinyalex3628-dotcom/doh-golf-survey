# DOH Vision Technical Architecture v1.1
**Project C — Vision Engine 내부 계층 설계 (Pipeline Lock)**
*작성일: 2026-07-01 / 상태: TECHNICAL DRAFT (프로 검토 전)*
*v1.0 대비 변경: Coordinate System 계층 신설 · Primitive/Operator 분리 · Event Source 추상화 · Phase=metadata 형식화*

> v1.0은 8-레이어를 잠갔다. v1.1은 그 계층 모델을 **더 정밀하게** 잠근다.
> 네 가지가 바뀐다:
> 1. **Coordinate System** 계층 신설 — 좌표계 없이는 Primitive가 존재할 수 없다.
> 2. **Primitive(명사) ↔ Operator(동사) 분리** — Primitive는 기하 객체, Operator는 적용 함수.
> 3. **Event Source 추상화** — Event Detector 위치를 고정하지 않고 인터페이스로만 정의.
> 4. **Phase = metadata** — Feature = `Operator( Primitive ) @ Phase`. 계산기는 phase에 독립.

---

## 0. 핵심 공식 (v1.1의 한 줄 요약)

```
Feature (VF###)  =  Operator( Primitive[…] )  @  Phase
                        │           │            │
                     동사(OP###)  명사(재사용)  metadata(P1~P10)
                        │
                  ┌─────┴─────┐
              Primitive는 특정 Coordinate System 위에서만 존재한다.
```

같은 계산기(Operator+Primitive)를 여러 Phase에 꽂아 여러 Feature를 만든다.
`Shoulder Turn @P4`, `@P5`, `@P7` = **계산기 1개, Feature 3개.**

---

## 1. 잠긴 파이프라인 v1.1

```
[0] Video (mp4, 60~240fps, FO/DTL)
        │
        ▼
[1] Frame Sampler          영상 → 프레임 + fps/촬영방향/handedness 정규화
        │
        ▼
[2] Pose Adapter           프레임 → 엔진별 관절좌표를 DOH 표준 관절로 흡수      ← 엔진 교체점
        │
        ▼
[3] Coordinate Normalizer  관절좌표를 선언된 좌표계로 리프팅                    ← ★신규
        │                  (IMAGE_NORM / WORLD / GROUND / BODY / TARGET)
        │
        ▼
[4] Primitive Engine       좌표 → 기하 객체(명사): Vector/Point/Plane          ← 좌표계 태그 보유
        │                  (의미 없음, 프레임 단위, 재사용)
        │
        ▼
[5] Operator Layer         OP###(동사): 기하 객체에 적용하는 무상태 함수         ← ★독립 카탈로그
        │                  (angle / signed_angle / distance / projection / velocity …)
        │
        ▼
[6] Feature Engine         Operator(Primitive) @ Phase → VF### (DOH 의미 부여)
        │
        ▼
[7] JSON Contract          doh.vision.v1 출력 → DOH(Project A)

        ┌─────────────────────────────────────────────┐
   [E]  │ Event Source (pluggable)                    │  ← 위치 고정 안 함(추상화)
        │   input = RGB(frames) | Pose(landmarks) | Hybrid │
        │   output = P1~P10 frame index + confidence  │
        │   → Feature Engine[6]에 phase 앵커 공급      │
        └─────────────────────────────────────────────┘
             ▲ frames([1])  ▲ landmarks([3])   (둘 중 필요한 것만 소비)
```

**의미 경계선:** `[1]~[5]` = 의미 없음(순수 신호·기하). `[6]`에서 처음 골프 개념 등장.

---

## 2. 레이어 카탈로그 v1.1

| # | 레이어 | 입력 | 출력 | 의미? | 교체성 | 신규 |
|---|---|---|---|:---:|---|:---:|
| 1 | Frame Sampler | video | frames+meta | ✕ | 라이브러리 | |
| 2 | Pose Adapter | frame | 표준 관절좌표 | ✕ | **엔진 교체** | |
| 3 | **Coordinate Normalizer** | 관절좌표 | 좌표계별 좌표 | ✕ | DOH 자산 | ★ |
| 4 | Primitive Engine | 좌표 | Vector/Point/Plane(명사) | ✕ | DOH 자산 | |
| 5 | **Operator Layer** | Primitive | scalar(동사 적용) | ✕ | DOH 자산 | ★분리 |
| E | **Event Source** | frames/landmarks | P1~P10 index | ✕ | **모델 교체** | ★추상화 |
| 6 | Feature Engine | 기하값@Phase | VF### | ✅ | DOH 자산 | |
| 7 | JSON Contract | Feature | doh.vision.v1 | ✅ | 스키마 고정 | |

> 교체되는 건 **2(Pose 엔진) · E(Event 모델)** 뿐. 3·4·5·6·7은 DOH 영구 자산.

---

## 3. [3] Coordinate System 계층 ★ (신규 · 가장 근본)

**Primitive가 존재하려면 좌표계가 먼저 있어야 한다.** "Shoulder Vector"는 그 자체로
의미가 없고, **어느 좌표계에서 잰 벡터인지**에 따라 값이 완전히 달라진다.

### 3.1 핵심 문제: view-invariance
> Shoulder Turn을 **IMAGE 픽셀 좌표**에서 재면, 카메라 각도·거리·렌즈에 따라 값이
> 달라지는 **쓰레기값**이다. 영상 A와 B를 비교할 수 없다.
> → 회전량은 **GROUND 또는 BODY 좌표계**에서 재야 view-invariant 하다.
> **Coordinate System 계층의 목적 = 값을 촬영조건과 무관하게 만드는 것.**

### 3.2 좌표계 카탈로그
| 좌표계 | 정의 | 원점 | 용도 | 획득 난이도 |
|---|---|---|---|---|
| `IMAGE_PIXEL` | 픽셀 (u,v) | 좌상단 | 엔진 native, 디버그 | 무료 |
| `IMAGE_NORM` | [0,1] 정규화 | 좌상단 | 해상도 독립 2D | 무료 (MediaPipe 2D) |
| `WORLD_3D` | 근사 미터 3D | ~골반중심 | 3D 각도(근사) | 저 (MP world landmark) |
| `CAMERA` | 카메라 중심 3D | 카메라 | 정밀 3D | 고 (intrinsics 필요) |
| `GROUND` | 지면기준, z=중력 | 지면 | **회전량 투영(Turn)** | 중 (지면·수직 추정) |
| `BODY` | 신체기준 | PELVIS_CENTER | **view-invariant 회전** | 중 (축 정의) |
| `TARGET` | 목표선 기준 | 볼 | **Path/Face** | 고 (캘리브레이션) |

**BODY 좌표계 정의(예):** 원점 = PELVIS_CENTER, x축 = HIP_LINE 방향,
y축 = TORSO_AXIS(척추), z = x×y(정면 방향). → 이 프레임에서 어깨회전을 재면
카메라가 어디 있든 동일한 X-Factor가 나온다.

### 3.3 변환 규칙 (Transform + 신뢰도 손실)
```
IMAGE_PIXEL ─(÷해상도)→ IMAGE_NORM ─(2D→3D 리프트*)→ WORLD_3D ─(정렬)→ BODY / GROUND
                                          │
                        *단일 카메라 리프트는 근사 → confidence 페널티 + flag `depth_estimated`
```
- 모든 변환은 **명시적 함수**. 각 변환은 confidence 손실/flag를 남긴다(§9·10).
- **단일 카메라 한계 정직하게:** 2D→3D는 추정이다. WORLD/CAMERA/TARGET 의존
  Feature는 `depth_estimated` flag 필수. 절대 3D를 확정값처럼 다루지 않는다.

### 3.4 Primitive의 좌표계 선언 (강제)
모든 Primitive는 **자신이 사는 좌표계를 반드시 선언**한다. 예:
`SHOULDER_LINE @ BODY`, `HEAD_POINT @ GROUND`, `CLUB_VECTOR @ TARGET`.
Operator는 **동일 좌표계의 Primitive끼리만** 적용 가능(다르면 변환 먼저).

---

## 4. [2] Pose Adapter (엔진 흡수)

- 엔진별 랜드마크 → DOH 표준 관절 어휘(논리 이름, handedness로 좌우 해석).
- 표준 관절: `HEAD, LEAD/TRAIL_SHOULDER, _ELBOW, _WRIST, _HIP, _KNEE, _ANKLE`.
- 각 관절 = `{coord(native), visibility}`. visibility = confidence의 뿌리.
- 새 엔진 = 매핑 1개 추가. 상위 불변. (v1.0 §4와 동일, 좌표는 [3]에서 정규화)

---

## 5. [E] Event Source (추상화 — 위치 고정 안 함) ★

**Event Detector는 파이프라인의 고정된 한 칸이 아니라, 플러그인 서비스다.**
입력이 뭐냐에 따라 Pose 앞/뒤 어디서든 돌 수 있으므로 **위치가 아니라 계약으로 정의**한다.

### 5.1 인터페이스 계약
```
EventSource:
  input_type : "RGB" | "POSE" | "HYBRID"      // 무엇을 먹는가
  input      : frames([1])  and/or  landmarks([3])
  output     : [ {p:"P4", frame:372, confidence:0.88, method:"swingnet"}, … ]
```

### 5.2 구현 종류 (교체 가능)
| input_type | 방식 | 데이터 의존 | 파이프라인상 위치 |
|---|---|---|---|
| RGB | SwingNet(MobileNet+BiLSTM) | frames만 | Pose **앞**에서 가능 |
| POSE | kinematics 규칙(손속도 0교차, 방향전환) | landmarks | Pose **뒤** |
| HYBRID | RGB 앵커 → Pose 정밀화·보간 (권장) | 둘 다 | 2-pass |

- **HYBRID 권장:** RGB로 P1/P4/P7/P10 앵커 → Pose 기하로 정밀화 + P2/P3/P5/P6/P8/P9 보간.
- `method` 태그(`swingnet|pose_rule|interpolated`)로 이벤트별 confidence 차등.
- **핵심:** 어느 구현이든 **출력 계약(P index+conf)만 같으면** Feature Engine은 신경 안 씀.
  → SwingNet을 미래 모델로 갈아끼워도 [4~7] 불변.

---

## 6. [4] Primitive Engine — 명사 (재사용 기하 객체)

**의미 없는 순수 기하 객체.** 좌표계 태그를 달고 있으며, 여러 Feature가 공유한다.

### 6.1 Primitive 카탈로그 v1.0 (요약 — 전수는 *Primitive Catalog Spec*)
**점:** `PELVIS_CENTER, THORAX_CENTER, HAND_MID, HEAD_POINT`
**벡터:** `SHOULDER_LINE, HIP_LINE, TORSO_AXIS, LEAD/TRAIL_UPPER_ARM, _FOREARM,
LEAD_THIGH, LEAD_SHANK, STANCE_LINE, CLUB_VECTOR*`
**참조:** `VERTICAL, GROUND_NORMAL, TARGET_LINE`
(*CLUB_VECTOR = 객체검출 필요)

### 6.2 Primitive 규칙
1. 골프 용어 금지(순수 기하 명명). 2. 좌표계 **필수 선언**(§3.4).
3. 구성 landmark의 confidence/flags **상속**(§9·10). 4. append-only.
5. 프레임 단위 계산(phase 모름 — phase는 Feature가 부여).

### 6.3 재사용 예 (Primitive 계층의 존재 이유)
```
SHOULDER_LINE @BODY ─┬─▶ (Operator에 의해) Shoulder Turn
                     ├─▶ X-Factor
                     └─▶ Shoulder Tilt
HIP_LINE @BODY ──────┴─▶ (X-Factor에 재사용)
```
Primitive 없으면 이 벡터를 Feature마다 재계산·재검증. 있으면 **1곳 계산·1곳 검증·캐싱**.

---

## 7. [5] Operator Layer — 동사 (독립 카탈로그) ★

Primitive에 적용하는 **무상태 함수**. OP###로 카탈로그화한다. 골프·phase·엔진 모름.

### 7.1 Operator 카탈로그 v1.0
| OP | 이름 | 시그니처 | 반환 | 유효 좌표계 |
|---|---|---|---|---|
| OP001 | `angle` | (v1, v2) | deg | 임의(동일계) |
| OP002 | `signed_angle` | (v1, v2, ref_normal) | deg | GROUND/BODY |
| OP003 | `distance` | (p1, p2) | len | 임의(동일계) |
| OP004 | `projection` | (v, plane) | vector | 임의 |
| OP005 | `tilt` | (v, ref=VERTICAL/GROUND) | deg | WORLD/GROUND |
| OP006 | `rotation_amount` | (v, f_from, f_to) | deg | GROUND/BODY |
| OP007 | `displacement` | (p, f_from, f_to, axis) | len | GROUND/BODY |
| OP008 | `angular_velocity` | (v 시계열, dt) | deg/s | GROUND/BODY |
| OP009 | `velocity` | (p 시계열, dt) | len/s | 임의 |
| OP010 | `ratio` | (a, b) | 무차원 | — |
| OP011 | `normalize` | (value, ref_len) | 무차원 | — |

### 7.2 규칙
- Operator는 **동일 좌표계 Primitive끼리만** 적용(§3.4). 유효 좌표계를 카탈로그에 명시.
- 무상태·순수함수 → 100% 재사용·단위테스트 용이.
- append-only(OP### 의미 변경 금지).

---

## 8. [6] Feature Engine — 의미 (Primitive + Operator + Phase)

**Feature = `Operator( Primitive[…] ) @ Phase`.** Phase는 Feature 정의의 일부(metadata)이지,
Primitive/Operator에는 없다. → 같은 계산기가 여러 phase에 재사용된다.

### 8.1 Feature 정의 형식 (Feature Spec이 채울 틀)
```
VF### :
  operator   : OP002 (signed_angle)
  primitives : [ SHOULDER_LINE@BODY, HIP_LINE@BODY, GROUND_NORMAL ]
  phase      : P4                 // 단일 앵커 또는 구간(P1→P4)
  coord      : BODY
  semantic   : "X-Factor"         // 여기서 처음 골프 의미 등장
  → value + unit + confidence + flags
```

### 8.2 예시 (계산기 재사용이 드러남)
| VF | operator | primitives | phase | 재사용 |
|---|---|---|---|---|
| Spine Tilt | OP005 tilt | TORSO_AXIS | @P1 | — |
| Shoulder Turn | OP006 rotation | SHOULDER_LINE@BODY | @P4 | 계산기 공유 ↓ |
| Shoulder Turn | OP006 rotation | SHOULDER_LINE@BODY | **@P7** | **동일 계산기, phase만 다름** |
| Hip Turn | OP006 rotation | HIP_LINE@BODY | @P4 | — |
| **X-Factor** | OP002 signed_angle | SHOULDER_LINE + HIP_LINE | @P4 | **두 Primitive 재사용** |
| Head Sway | OP007 displacement + OP011 | HEAD_POINT, STANCE_LINE | P1→P4 | — |
| Lead Knee Angle | OP001 angle | LEAD_THIGH, LEAD_SHANK | @P7 | — |
| Shaft Lean | OP002 signed_angle | CLUB_VECTOR, VERTICAL | @P7 | 클럽 필요 |

> Shoulder Turn@P4 와 @P7 은 **operator·primitive·coord가 동일**, phase만 다르다.
> Feature Engine은 "계산기 인스턴스화 + phase 프레임에서 평가"만 하면 된다.

### 8.3 산출 → JSON `features[]`
`{ feature_id, semantic name, value, unit, phase, coord, operator, primitives_used,
landmarks_used, confidence, error_flags, source_engine }`

---

## 9. Confidence Propagation (유지 · 좌표변환 손실 추가)

**신뢰도는 아래로 흐르며 절대 증가하지 않는다(monotonic).** 곱/최솟값 전파.

```
c(landmark)  = visibility
c(coord)     = c(landmark) × c_transform      ← ★신규: 좌표변환 손실
                 c_transform = 1.0 (IMAGE_NORM) … <1.0 (2D→3D 리프트)
c(primitive) = min( c(구성 좌표들) )
c(event)     = detector 확률 (method별 차등)
c(feature)   = ∏ c(primitives) × c(event) × c_view
overall      = 영상 집계
```
- 2D→3D·TARGET 변환은 `c_transform < 1` + `depth_estimated` flag → 3D 의존 Feature 정직하게 감점.
- Vision은 확신을 **정직히 전달만**, 임계 판단은 DOH(Arch 원칙 4).

---

## 10. Error Propagation (유지)

**Soft(값 내되 감점, flag union) vs Hard(value:null). null ≠ 0.**

- Soft flags: `low_visibility, motion_blur, off_axis_view, interpolated_event,
  fps_interpolated, depth_estimated`. 상류→하류 **합집합** 전파.
- Hard failures: `no_pose, missing_critical_landmark, event_not_found,
  club_not_detected` → 해당 Feature `value:null`.
- **null(관찰 불가) ≠ 0(관찰됨, 값이 0).** Vision은 없는 걸 지어내지 않는다.
- 부분 성공: 클럽 미검출이어도 포즈 Feature는 정상 출력.

---

## 11. End-to-End 예제 (X-Factor @P4)

```
[2] Pose @f372: LEAD_SH vis .95 / TRAIL_SH .90 / LEAD_HIP .88 / TRAIL_HIP .80
[3] Coordinate: BODY 정렬, 2D→3D 리프트 c_transform=0.9, flag depth_estimated
[E] Event(HYBRID): P4=f372, method=swingnet, c_event=0.88
[4] Primitive @BODY:
      SHOULDER_LINE c=min(.95,.90)×0.9=0.81
      HIP_LINE      c=min(.88,.80)×0.9=0.72
[5] Operator OP002 signed_angle(SHOULDER_LINE, HIP_LINE, GROUND_NORMAL)=41.0°
[6] Feature VF031 X-Factor@P4:
      c = (0.81×0.72) × 0.88 × 0.95(view) ≈ 0.49
      flags = ["depth_estimated"]
[7] JSON: { feature_id:VF031, value:41.0, unit:deg, phase:P4, coord:BODY,
            operator:OP002, primitives_used:[SHOULDER_LINE,HIP_LINE,GROUND_NORMAL],
            confidence:0.49, error_flags:["depth_estimated"] }
→ DOH: MOT-012 근거, conf 0.49 가중. 단독 Node 확정 금지.
```
> v1.0 예제(0.60)보다 낮아진 건 **3D 리프트 손실을 정직하게 반영**했기 때문. 이게 옳다.

---

## 12. 잠금·확장 규칙

| 잠김 (메이저 버전) | 자유 추가 (마이너) |
|---|---|
| 레이어 순서·계약 | 새 Coordinate System |
| `Feature=Operator(Primitive)@Phase` 형식 | 새 Primitive |
| Confidence 전파식(곱/min) | 새 Operator OP### |
| null≠0, soft/hard 구분 | 새 Feature VF### |
| Event Source 인터페이스 계약 | 새 Pose/Event 엔진(어댑터) |

- **VF001~VF500 추가 = 마이너.** 파이프라인 불변. ← 이 문서의 목적.
- 모든 카탈로그(좌표계/Primitive/Operator/Feature) append-only(id 재사용·의미변경 금지).

---

## 13. 로드맵 v1.1 (순서 갱신)

```
Coordinate System Spec  ──▶  Primitive Catalog  ──▶  Operator Catalog
        ↓                                                   │
        └──────────────▶  Vision Feature Spec  ◀────────────┘
                                   │   (VF = Operator(Primitive)@Phase)
                                   ▼
                            MediaPipe PoC
```

| 순위 | 산출물 | 유형 | 상태 |
|---|---|---|---|
| 0 / 0.5 | Engine Architecture / Technical Architecture v1.1 | 문서 | ✅ |
| 1 | **Coordinate System Spec v1.0** (좌표계·변환·view-invariance) | 문서 | ▶ 다음 |
| 2 | Primitive Catalog Spec v1.0 (명사 전수 + 좌표계 선언) | 문서 | 대기 |
| 3 | Operator Catalog Spec v1.0 (OP### 수식 + 유효 좌표계) | 문서 | 대기 |
| 4 | Vision Feature Spec v1.0 (VF### = Op(Prim)@Phase + Node) | 문서 | 대기 |
| 5 | MediaPipe PoC (영상→표준관절→좌표계→CSV) | 코드 | 대기 |
| 6 | Event Source 구현(HYBRID 2-pass) | 코드 | 나중 |

> **왜 Coordinate System이 최상단인가:** Primitive는 좌표계 위에서만 존재하고(§3.4),
> Operator는 좌표계 호환성으로 유효성이 갈린다(§7.2). 좌표계가 안 잠기면
> 그 위 전부가 흔들린다. → view-invariance는 여기서 결정된다.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.1 (TECHNICAL DRAFT) — v1.0 대체 |
| 작성일 | 2026-07-01 |
| v1.0→v1.1 | Coordinate System 신설 · Primitive/Operator 분리 · Event Source 추상화 · Phase=metadata |
| 상위 | DOH Vision Engine Architecture v1.0 |
| 다음 산출물 | Coordinate System Spec v1.0 |
| 상태 | 프로 검토 대기 |

*좌표계가 사실을 정의한다. Primitive는 명사, Operator는 동사, Phase는 시점, Feature는 문장.*
*이 문법이 잠기면, 어떤 골프 개념(VF)이든 한 줄로 쓸 수 있다.*
