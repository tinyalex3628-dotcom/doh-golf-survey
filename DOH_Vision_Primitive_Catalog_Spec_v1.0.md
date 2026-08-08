# DOH Vision Primitive Catalog Spec v1.0
**Project C — 기하 원시객체(명사) 전수 정의**
*작성일: 2026-07-01 / 상태: SPEC DRAFT (프로 검토 전)*
*상위: Vision Technical Architecture v1.1 §6 · Coordinate System Spec v1.0*

> Primitive = **의미 없는 기하 객체(명사).** Landmark로부터 구성되고, 좌표계 위에
> 존재하며, 여러 Feature가 공유한다. 이 문서가 잠기면 Feature는
> `Operator( Primitive ) @ Phase` 한 줄로 정의된다.
> **규칙:** ① 골프 용어 금지 ② 좌표계 필수 선언 ③ confidence/flags 상속 ④ append-only.

---

## 0. Primitive 정의 스키마

각 Primitive는 아래 필드로 정의된다.

| 필드 | 의미 |
|---|---|
| `id` | Primitive ID (PR###) — append-only |
| `name` | 기하 명칭 (골프 용어 금지) |
| `type` | POINT / VECTOR / SCALAR_REF / PLANE / FRAME |
| `construct` | 구성 landmark/primitive + 계산식 |
| `coord` | 존재 좌표계 (CS ID) |
| `frame_wise` | 프레임 단위 계산 여부 (Y: phase 무관) |
| `confidence` | 상속 규칙 |
| `consumed_by` | 이 Primitive를 쓰는 대표 Feature |

**표준 관절 어휘(입력):** `HEAD, LEAD/TRAIL_SHOULDER, _ELBOW, _WRIST, _HIP, _KNEE, _ANKLE`
**Confidence 상속 기본:** `c(primitive) = min(구성요소 confidence) × c_transform(좌표변환)`

---

## 1. 파생 점 (POINT)

| id | name | construct | coord | confidence | consumed_by |
|---|---|---|---|---|---|
| PR001 | PELVIS_CENTER | mid(LEAD_HIP, TRAIL_HIP) | CS5_BODY(원점) | min(2 hip) | BODY축, Sway |
| PR002 | THORAX_CENTER | mid(LEAD_SHOULDER, TRAIL_SHOULDER) | CS5_BODY | min(2 sh) | TORSO_AXIS |
| PR003 | HAND_MID | mid(LEAD_WRIST, TRAIL_WRIST) | CS4_GROUND | min(2 wr) | Hand Speed/Depth |
| PR004 | HEAD_POINT | HEAD | CS4_GROUND | c(HEAD) | Sway, Head Move |
| PR005 | LEAD_HAND | LEAD_WRIST | CS4_GROUND | c(LEAD_WRIST) | 그립 근사 |
| PR006 | STANCE_MID | mid(LEAD_ANKLE, TRAIL_ANKLE) | CS4_GROUND(원점) | min(2 ank) | 정규화 기준 |
| PR007 | CLUBHEAD_POINT* | 객체검출 clubhead | CS6_TARGET | c(detect) | Club Path |
| PR008 | BALL_POINT* | 객체검출 ball | CS6_TARGET | c(detect) | Launch |

(* = 객체검출 필요, 2차 단계)

---

## 2. 벡터 (VECTOR / SEGMENT)

| id | name | construct (from→to) | coord | confidence | consumed_by |
|---|---|---|---|---|---|
| PR010 | SHOULDER_LINE | TRAIL_SHOULDER → LEAD_SHOULDER | CS5_BODY | min(2 sh)×c_tf | Shoulder Turn, X-Factor, Sh Tilt |
| PR011 | HIP_LINE | TRAIL_HIP → LEAD_HIP | CS5_BODY | min(2 hip)×c_tf | Hip Turn, X-Factor, Pelvis Tilt |
| PR012 | TORSO_AXIS | PELVIS_CENTER → THORAX_CENTER | CS5_BODY | min(PR001,PR002) | Spine Tilt/Angle, Reverse Spine |
| PR013 | LEAD_UPPER_ARM | LEAD_SHOULDER → LEAD_ELBOW | CS5_BODY | min(sh,el) | Arm plane, Chicken Wing |
| PR014 | LEAD_FOREARM | LEAD_ELBOW → LEAD_WRIST | CS5_BODY | min(el,wr) | Lead Arm Angle, Release |
| PR015 | TRAIL_UPPER_ARM | TRAIL_SHOULDER → TRAIL_ELBOW | CS5_BODY | min(sh,el) | Flying Elbow |
| PR016 | TRAIL_FOREARM | TRAIL_ELBOW → TRAIL_WRIST | CS5_BODY | min(el,wr) | Trail Arm Flexion |
| PR017 | LEAD_THIGH | LEAD_HIP → LEAD_KNEE | CS5_BODY | min(hip,kn) | Lead Knee Angle |
| PR018 | LEAD_SHANK | LEAD_KNEE → LEAD_ANKLE | CS5_BODY | min(kn,ank) | Lead Knee Angle, Early Ext |
| PR019 | TRAIL_THIGH | TRAIL_HIP → TRAIL_KNEE | CS5_BODY | min(hip,kn) | Trail Knee, Early Ext |
| PR020 | TRAIL_SHANK | TRAIL_KNEE → TRAIL_ANKLE | CS5_BODY | min(kn,ank) | Trail Knee straighten |
| PR021 | STANCE_LINE | TRAIL_ANKLE → LEAD_ANKLE | CS4_GROUND | min(2 ank) | 정규화 기준폭 |
| PR022 | LEAD_ARM_CHAIN | LEAD_SHOULDER → LEAD_WRIST | CS5_BODY | min(sh,wr) | Lead arm straightness |
| PR023 | HEAD_TO_STANCE | STANCE_MID → HEAD_POINT | CS4_GROUND | min(PR006,PR004) | Head over ball, Sway |
| PR024 | CLUB_VECTOR* | HAND_MID → CLUBHEAD_POINT | CS6_TARGET | min(PR003,PR007) | Shaft Lean, Club Path |

---

## 3. 참조계 (SCALAR_REF / PLANE / FRAME)

| id | name | construct | coord | 용도 |
|---|---|---|---|---|
| PR030 | VERTICAL | 중력축(영상 y 역 / IMU 보정) | CS4_GROUND | Tilt 기준 |
| PR031 | GROUND_NORMAL | 지면 수직 (=z of GROUND) | CS4_GROUND | Turn 투영면 법선 |
| PR032 | GROUND_PLANE | 지면 (xy of GROUND) | CS4_GROUND | 회전 투영 |
| PR033 | TARGET_LINE* | 볼→타겟 (캘리브레이션) | CS6_TARGET | Path/Face 기준 |
| PR034 | BODY_FRAME | (x=HIP_LINE, y=TORSO_AXIS⊥, z=x×y) | CS5_BODY | 신체정렬 회전행렬 R_body |
| PR035 | SWING_PLANE* | 어깨+손 근사평면 | CS5_BODY | Plane 이탈 측정 |

---

## 4. 시간 파생 Primitive (Temporal) — 속도·궤적의 재료

Feature가 phase에서 평가하지만, 속도류는 **프레임 시계열**이 필요하다.
아래는 "시계열 형태의 Primitive"로, Operator(velocity/rotation)가 소비한다.

| id | name | construct | coord | consumed_by |
|---|---|---|---|---|
| PR040 | HAND_MID_TRACK | HAND_MID 의 프레임 시계열 | CS4_GROUND | Hand Speed |
| PR041 | SHOULDER_LINE_TRACK | SHOULDER_LINE 시계열 | CS5_BODY | Shoulder Turn(회전량) |
| PR042 | HIP_LINE_TRACK | HIP_LINE 시계열 | CS5_BODY | Hip Turn |
| PR043 | HEAD_POINT_TRACK | HEAD_POINT 시계열 | CS4_GROUND | Sway 궤적, Head Move max |
| PR044 | CLUBHEAD_TRACK* | CLUBHEAD_POINT 시계열 | CS6_TARGET | Club Path, Head Speed |
| PR045 | PELVIS_TRACK | PELVIS_CENTER 시계열 | CS4_GROUND | Early Ext(골반→볼 병진) |

---

## 5. Confidence / Flag 상속 규칙 (재확인)

```
c(POINT/VECTOR) = min( 구성 landmark visibility ) × c_transform(coord)
c(TRACK)        = min( 구간 내 프레임별 c ) ─ 저visibility 프레임 있으면 하락
flags(primitive) = ⋃ 구성요소 flags  ∪  좌표변환 flags(depth_estimated 등)
```
- **CS5_BODY / CS4_GROUND** 파생은 `depth_estimated`(2D→3D) 상속.
- **CS6_TARGET**(클럽/볼) 파생은 `target_calibration` 상속.
- landmark 하나라도 hard fail(미검출)이면 그 Primitive는 `null`(§Error, null≠0).

---

## 6. 커버리지 확인 (Node 관점)

이 카탈로그로 **포즈 기반 Node 대부분을 커버**한다:

| DOH Node 그룹 | 필요 Primitive | 클럽 필요? |
|---|---|---|
| MOT-001~026 (동작) | PR010~020, PR040~043 | 일부만(임팩트 클럽) |
| OBS-001~027 (관찰) | PR004,010~020,023,043 | Face/Path만 |
| PAT-001~014 (패턴) | 위 조합 | 일부 |
| STR-* (구조) | ✕ 영상만으로 대부분 불가 | — |
| BF-*/CON-* (결과) | PR007,008,024,044 | **✅ 필수** |

> **결론:** PR024·PR007·PR008(클럽/볼) 없이도 **MOT/OBS/PAT의 대부분**을 커버.
> → MVP는 포즈 Primitive(PR001~023, 040~043)만으로 강력. 클럽 Primitive는 2차.

---

## 7. 잠금·확장

| 잠김 (메이저) | 자유 추가 (마이너) |
|---|---|
| PR### id·구성·좌표계 | 새 Primitive PR### |
| confidence 상속식(min×c_tf) | TRACK 구간 정책 |
| null≠0 | — |

- PR### append-only(id 재사용/의미변경 금지).
- 클럽/볼 Primitive(PR007/008/024/044)는 정의만 확정, **값 생성은 객체검출 단계**.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (SPEC DRAFT) |
| Primitive 수 | 45 (POINT 8 · VECTOR 15 · REF 6 · TRACK 6 + 예약) |
| 상위 | Technical Architecture v1.1 §6, Coordinate System Spec v1.0 |
| 다음 산출물 | Operator Catalog Spec v1.0 |
| 상태 | 프로 검토 대기 |

*명사가 준비됐다. 이제 동사(Operator)를 정의하면 문장(Feature)을 쓸 수 있다.*
