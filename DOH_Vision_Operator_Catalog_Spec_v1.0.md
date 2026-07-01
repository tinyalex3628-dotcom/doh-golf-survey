# DOH Vision Operator Catalog Spec v1.0
**Project C — 기하 연산자(동사) 전수 정의**
*작성일: 2026-07-01 / 상태: SPEC DRAFT (프로 검토 전)*
*상위: Vision Technical Architecture v1.1 §7 · Primitive Catalog v1.0 · Coordinate System Spec v1.0*

> Operator = **무상태 순수 함수(동사).** Primitive를 받아 스칼라/벡터를 반환한다.
> 골프·phase·엔진을 모른다. 이 무지가 100% 재사용의 원천이다.
> **규칙:** ① 무상태 ② 동일 좌표계 Primitive끼리만 ③ 유효 좌표계 명시 ④ append-only.

---

## 0. Operator 정의 스키마

| 필드 | 의미 |
|---|---|
| `id` | OP### (append-only) |
| `name` | 함수명 |
| `signature` | 입력 → 출력 |
| `formula` | 수식 정의 |
| `valid_coord` | 적용 가능 좌표계 (CS ID) |
| `unit` | 반환 단위 |
| `confidence` | 입력 confidence로부터의 산출 |
| `used_by` | 대표 Feature |

**Confidence 기본:** `c(op result) = ∏ c(입력 primitive)` (독립 곱, monotonic 비증가).

---

## 1. 각도 연산자 (Angle)

### OP001 `angle(v1, v2)`
- formula: `acos( (v1·v2) / (|v1||v2|) )` → [0,180]°
- valid_coord: 임의(단, v1·v2 동일계) · unit: deg
- used_by: Lead Knee Angle, Trail Arm Flexion, Elbow angle

### OP002 `signed_angle(v1, v2, ref_normal)`
- formula: `atan2( (v1×v2)·n̂, v1·v2 )` → 부호 있는 [-180,180]°
- valid_coord: CS5_BODY / CS4_GROUND (n̂ = GROUND_NORMAL/BODY z) · unit: deg
- used_by: **X-Factor**, Clubface-Path 상대각, 회전방향 구분

### OP005 `tilt(v, ref)`
- formula: `angle(v, ref)` where ref ∈ {VERTICAL, GROUND_NORMAL}
- valid_coord: CS4_GROUND / CS5_BODY · unit: deg
- used_by: Spine Tilt, Spine Angle(전후), Shoulder Tilt, Pelvis Tilt

---

## 2. 회전·투영 연산자 (Rotation / Projection)

### OP004 `projection(v, plane)`
- formula: `v - (v·n̂)n̂` (평면 법선 n̂으로 성분 제거)
- valid_coord: 임의 · unit: vector
- used_by: Turn 계산 전 지면 투영, Plane 이탈

### OP006 `rotation_amount(track, f_from, f_to, plane)`
- formula: 두 프레임에서 벡터를 plane에 투영 후 `signed_angle(v(f_from), v(f_to), n̂)`
- valid_coord: CS5_BODY / CS4_GROUND · unit: deg
- confidence: `min(c@f_from, c@f_to)`
- used_by: **Shoulder Turn, Hip Turn** (SHOULDER/HIP_LINE_TRACK 소비)

### OP012 `relative_rotation(trackA, trackB, f)`
- formula: `rotation_amount(A) - rotation_amount(B)` at frame f
- valid_coord: CS5_BODY · unit: deg
- used_by: X-Factor(대안 정의: ShoulderTurn − HipTurn)

---

## 3. 거리·변위 연산자 (Distance / Displacement)

### OP003 `distance(p1, p2)`
- formula: `|p1 - p2|` · valid_coord: 임의(동일계) · unit: len
- used_by: Hand-to-ball, joint spacing

### OP007 `displacement(track, f_from, f_to, axis)`
- formula: `(p(f_to) - p(f_from)) · axiŝ` (지정 축 성분)
- valid_coord: CS4_GROUND · unit: len
- used_by: Head Sway(lateral), Early Extension(z/toward-ball), Weight Shift

### OP013 `path_extent(track, f_from, f_to, axis)`
- formula: `max - min of (p·axiŝ)` over [f_from,f_to]
- valid_coord: CS4_GROUND · unit: len
- used_by: Head Move total, Sway peak

---

## 4. 속도 연산자 (Velocity / Temporal)

### OP008 `angular_velocity(track, f, dt)`
- formula: `d/dt signed_angle` (중앙차분) · valid_coord: CS5_BODY/CS4_GROUND · unit: deg/s
- confidence: 저 fps/보간 시 `fps_interpolated` flag로 하락
- used_by: Hip rotation speed(MOT-014)

### OP009 `velocity(track, f, dt)`
- formula: `|p(f+1) - p(f-1)| / (2dt)` · valid_coord: 임의 · unit: len/s (정규화 권장)
- used_by: **Hand Speed(proxy)**, Clubhead speed(2차)

### OP014 `zero_crossing(track_scalar)`
- formula: 스칼라 시계열의 부호전환/극값 프레임 반환 → 이벤트 검출 보조
- valid_coord: — · unit: frame_index
- used_by: **Event Source(pose_rule)** — Top(속도0), Impact(방향전환)

---

## 5. 비율·정규화 연산자 (Ratio / Normalize)

### OP010 `ratio(a, b)`
- formula: `a / b` · unit: 무차원
- used_by: **Tempo**(backswing_time / downswing_time), X-Factor stretch

### OP011 `normalize(value, ref_len)`
- formula: `value / ref_len` · unit: 무차원(예: stance_ratio)
- used_by: Sway/Depth 를 STANCE_LINE으로 정규화 → view/스케일 불변

### OP015 `clamp_confidence(value, threshold)`
- formula: confidence < threshold 이면 flag `low_confidence` 부여(값은 유지)
- used_by: 모든 Feature 후처리(품질 게이트)

---

## 6. Operator × 좌표계 유효성 매트릭스

| OP | 이름 | CS1 | CS4_GROUND | CS5_BODY | CS6_TARGET |
|---|---|:--:|:--:|:--:|:--:|
| OP001 | angle | △ | ✅ | ✅ | ✅ |
| OP002 | signed_angle | ✕ | ✅ | ✅ | ✅ |
| OP003 | distance | △ | ✅ | ✅ | ✅ |
| OP004 | projection | ✕ | ✅ | ✅ | ✅ |
| OP005 | tilt | ✕ | ✅ | ✅ | △ |
| OP006 | rotation_amount | ✕ | ✅ | ✅ | ✅ |
| OP007 | displacement | ✕ | ✅ | △ | ✅ |
| OP008 | angular_velocity | ✕ | ✅ | ✅ | ✅ |
| OP009 | velocity | △ | ✅ | ✅ | ✅ |
| OP010 | ratio | ✅ | ✅ | ✅ | ✅ |
| OP011 | normalize | ✅ | ✅ | ✅ | ✅ |

△ = 가능하나 view-dependent(측정용 비권장) · ✕ = 부적합(깊이/방향 손실)

> **핵심:** signed_angle·rotation·displacement 같은 **핵심 측정 연산자는 CS1(2D)에서
> 부적합.** 반드시 GROUND/BODY로 정렬 후 적용. (Coordinate System Spec §7 view-invariance)

---

## 7. Feature 정의로의 연결 (다음 문서 미리보기)

Operator가 잠겼으므로 이제 Feature는 한 줄:
```
VF031 X-Factor = OP002( PR010 SHOULDER_LINE, PR011 HIP_LINE, PR031 GROUND_NORMAL ) @ P4  [CS5_BODY]
VF010 Shoulder Turn = OP006( PR041 SHOULDER_LINE_TRACK, P1, P4, PR032 ) @ P4  [CS5_BODY]
VF014 Head Sway = OP011( OP007(PR043,P1,P4,target_axis), PR021 STANCE_LINE ) @ P1→P4  [CS4_GROUND]
VF020 Tempo = OP010( t(P1→P4), t(P4→P7) )  [—]
```

---

## 8. 잠금·확장

| 잠김 (메이저) | 자유 추가 (마이너) |
|---|---|
| OP### id·수식·유효좌표계 | 새 Operator OP### |
| confidence=∏ 입력 | — |
| 핵심연산자 CS1 부적합 규칙 | valid_coord 세분화 |

- OP### append-only. 무상태·순수함수 계약 불변 → 단위테스트로 100% 검증 가능.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (SPEC DRAFT) |
| Operator 수 | 15 (angle 3 · rot/proj 3 · dist 3 · vel 3 · ratio 3) |
| 상위 | Technical Architecture v1.1 §7, Primitive/Coordinate Spec |
| 다음 산출물 | Vision Feature Spec v1.0 |
| 상태 | 프로 검토 대기 |

*동사가 준비됐다. 명사(Primitive) × 동사(Operator) × 시점(Phase) = 문장(Feature).*
