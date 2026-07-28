# DOH Vision Measurement Catalog v1.0 — `M###` (계산식 레벨 명세)
**Project C — 세그먼트/관절별 원자적 측정량(Measurement) 전수 정의**
*작성일: 2026-07-23 / 상태: SPEC DRAFT (프로 검토 전)*
*상위: Coordinate System Spec v1.0 · Primitive Catalog v1.0 · Operator Catalog v1.0 · Feature Spec v1.0(VF###)*
*구현 정합: `pose3d_poc/wham_golf_rotation.py` · `pose3d_poc/wham_golf_metrics.py` (SMPL-24)*

> **이 문서가 하는 일:** VF(Feature)는 "골프 의미"다. M(Measurement)은 그 밑의
> **의미 없는 원자적 운동학 값**이다 — 골반이 몇 도 돌았나, 리드 팔꿈치가 몇 도 굽었나,
> 머리가 스탠스폭 대비 얼마 밀렸나. 개발자는 **M###만 코드로 짜면** 되고,
> VF는 그 M들의 조합이다(예: `VF020 X-Factor = M201 − M101`).
>
> **잠금 불변:** M###은 **엔진 내부 구현 레이어**다. 대외 계약 `doh.vision.v1`은 여전히
> **VF###만** 방출한다(§7). M은 VF 어댑터가 소비하는 재료일 뿐, 계약을 건드리지 않는다.
> 그래서 이 문서는 LOCK된 계약을 깨지 않고 **자유롭게 채워 넣을 수 있다.**

---

## 0. M-code는 어디에 있나 (레이어 지도)

```
Landmark(SMPL-24 관절 24점)
      │  ← NLF/MediaPipe 가 줌
      ▼
Primitive(PR###)          명사: SHOULDER_LINE, HIP_LINE, TORSO_AXIS, HAND_MID …
      │  × Operator(OP###) 동사: angle, tilt, rotation_amount, displacement, normalize …
      ▼
★ Measurement(M###) ★     원자값: "골반 회전 -27.8°", "리드 팔꿈치 168°", "머리 +0.31 stance"
      │  ← 이 문서
      ▼
Feature(VF###)            골프 의미: X-Factor, Chicken Wing, Head Sway  (= M들의 조합/앵커)
      │
      ▼
doh.vision.v1 [LOCK]      대외 계약 (VF만 방출)
      │
      ▼
DOH Node(MOT/OBS/PAT…)    진단 (Project A)
```

- **M ↔ VF 관계:** 대개 `VF = M @ phase` 또는 `VF = f(M_a, M_b)`.
  - `VF015 Shoulder Turn @P4` = **M201**(흉곽회전) 을 P4에서 읽음.
  - `VF020 X-Factor @P4` = **M201 − M101**(흉곽 − 골반).
  - `VF031 Head Sway` = **M301**(머리 lateral) 을 P1→P4 구간으로.
- **왜 M을 따로 두나:** ① 한 M이 여러 VF·여러 phase에 재사용됨(회전은 P2/P3/P4에서 다 씀) ②
  단위테스트가 원자 단위라 쉬움 ③ "무엇이 실제로 측정 가능한가"를 **골프 의미와 분리해** 정직하게 판정.

---

## 1. 정의 스키마 (각 M###이 갖는 필드)

이 문서의 사용자 요청 8필드를 그대로 컬럼화한다.

| 필드 | 의미 |
|---|---|
| `M###` | Measurement ID — append-only(재사용·의미변경 금지) |
| `이름` | 측정 대상(기하/해부 명칭, 골프 진단어 금지) |
| `랜드마크` | 입력 SMPL-24 관절(이름+인덱스). lead/trail은 handedness로 해석 |
| `계산식` | `Operator( Primitive )` 한 줄 (OP###/PR### 어휘) |
| `CS` | 측정 좌표계 (CS4_GROUND / CS5_BODY / CS6_TARGET) |
| `Phase` | 측정 시점 (P1/P4/P7 또는 구간). 여러 phase 재사용 가능 |
| `단위` | `deg / ratio / ratio(stance) / s` … 정규화는 단위에 병기 |
| `Engine` | NLF(3D SMPL-24) / MediaPipe(2D+약z) 지원도 |
| `오차` | 예상 오차(**PoC 실측 전 보수적 seed**, §3.3) |
| `등급` | A(신뢰) / B(조건부·moderate) / C(불가) |

**표준 관절 어휘(SMPL-24, NLF 출력):**
`pelvis0 · l_hip1 r_hip2 · spine1_3 · l_knee4 r_knee5 · spine2_6 · l_ankle7 r_ankle8 · spine3_9 ·
l_foot10 r_foot11 · neck12 · l_collar13 r_collar14 · head15 · l_shoulder16 r_shoulder17 ·
l_elbow18 r_elbow19 · l_wrist20 r_wrist21 · l_hand22 r_hand23`

> (엔진 코드 `SKELETONS['smpl']`는 회전에 4점만 쓰지만, NLF는 24점 전부 준다. spine1/2/3·collar·hand도
> 사용 가능 — 척추 곡선·전완 비틀림 추정에 재료로 열려 있음. §5·§6 참고.)

---

## 2. 축·좌표계 규약 (M-code의 X/Y/Z ↔ 프로젝트 CS)

M-code 이름의 `(X)/(Y)/(Z)`는 **골퍼 기준 해부축**이다. 프로젝트 좌표계로의 매핑을 못박는다.

| M-code 축 | 의미 | CS4_GROUND 축 | FO(정면) | DTL(후면) |
|---|---|---|:--:|:--:|
| **X — Lateral** | 좌우 = 타깃선(비구선) 방향 | ground 타깃축 | ✅ 화면 좌우 | ✕ 화면 깊이 |
| **Y — Vertical/Height** | 상하 = 중력축 | ground z(up) | ✅ | ✅ |
| **Z — Depth** | 앞뒤 = 골퍼 정면-후면(DTL선) | ground 정면축 | ✕ 화면 깊이 | ✅ 화면 좌우 |

**결정 규칙 (Coordinate Spec §3·§7 승계):**
- **회전(azimuth) = CS5_BODY.** 카메라 무관 view-invariant. FO·DTL 둘 다 OK.
- **병진/변위 = CS4_GROUND** + **STANCE_LINE 폭으로 정규화**(OP011) → `ratio(stance)`, 키·거리 불변.
- **틸트(수평 대비 각) = CS4_GROUND**, `up`(세계 수직축) 기준.
- **세그먼트 내부각(팔꿈치/무릎 굽힘) = CS5_BODY.** 3D 상대각이라 view 견고.
- **역할분담:** 회전=BODY, 병진=GROUND, 클럽/볼=TARGET(2차). 한 좌표계로 섞지 않는다.

> **`up`(세계 수직축) 획득:** `estimate_up()` — 발목이 지면에 planted → 점구름 최소분산축 = 수직
> (torso 기울기 무관, 순수 파이썬 Jacobi 고유분해). 품질 낮으면 `depth_unreliable` flag. (metrics.py 구현됨)

---

## 3. 신뢰도 등급 & 오차 규약 (정직성 계약)

### 3.1 등급 정의
| 등급 | 뜻 | 조건 |
|:--:|---|---|
| **A** | 바로 신뢰 | 화면-내 축(해당 뷰) 또는 3D 세그먼트 상대각. NLF로 robust. |
| **B** | 조건부/moderate | ① **깊이축(Z)** — 맞는 뷰(대개 DTL)에서만, `depth_estimated` 상속 ② **미세관절/축회전**(손목·전완·상완/고관절 비틀림·무릎 valgus) — 점-스켈레톤 노이즈 큼 |
| **C** | 측정 불가 | SMPL-24 **body 관절에 해당 지점이 없음**(귀/발끝·뒤꿈치). 값 지어내지 않음 → **null**. |

> **B의 두 실패모드를 구분한다.** "Z-깊이"는 뷰만 맞으면 moderate(DTL ✅)지만, "축회전/미세관절"은
> 뷰와 무관하게 원리적으로 약하다. 뭉뚱그려 "저신뢰"라 하지 않는다.

### 3.2 뷰-게이팅 (metrics.py `_feat` 규칙 그대로)
- 측정 축이 **화면 안** → 신뢰(그대로).
- 뷰 **unknown** → 계산하되 `conf ×0.7` + `off_axis_view`.
- 측정 축이 **깊이방향(뷰 불일치)** → **`value=null`** + `view_mismatch`. (억지 계산 금지)

### 3.3 오차 seed (PoC 실측 전 보수적 값 — 계층별)
c_transform(깊이 리프트 0.85 등, Coordinate Spec §6)에 근거한 **초기 seed**. 런치모니터/수동라벨 대조로 보정 예정.

| 측정 계층 | 오차 seed | 근거/주의 |
|---|---|---|
| 세그먼트 내부각(팔꿈치·무릎 굽힘) | **±3–5°** | 가장 신뢰. 3D 상대각, 좌표변환 최소. |
| 회전(BODY azimuth) | **±5–10° 상대** | ⚠️ **절대 스케일 caveat**: 실측 X-Factor 58–73°가 클래식 ~45°보다 과대 → 스케일 보정 TODO. 상대 곡선·부호는 신뢰. |
| 틸트(수평 대비) | **±3–8°** | `up` 품질 의존. |
| 병진/변위(정규화) | **±0.05–0.10 stance** | 화면-내 축일 때. |
| 깊이(Z) 변위 | **±0.15–0.30 stance** | `depth_estimated`. DTL에서도 추정축. |
| 축회전·미세관절 | **±10–18°** | 점-스켈레톤 한계. structure_inferred 급. |

---

## 4. 측정 카탈로그

> `계산식` 표기: `OP005 tilt(HIP_LINE, up)` = Operator OP005를 Primitive HIP_LINE과 up에 적용.
> `단위`의 `ratio(stance)` = STANCE_LINE 폭으로 정규화. Engine `≈` = 근사(참고), `✕` = 부적합.

### 4.1 Pelvis (M1xx) — 원점 PELVIS_CENTER = mid(l_hip1, r_hip2)

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M101 | Pelvis Rotation(축) | l_hip1,r_hip2 | OP006 rotation_amount(HIP_LINE_TRACK, P1→f, ground) | BODY | P4,P7 | deg | NLF✅ MP✕ | ±5–10° | A |
| M102 | *(예약)* Pelvis A/P Tilt(시상) | l_hip1,r_hip2,spine1_3 | OP005 tilt(HIP_LINE⊥, up) | GROUND | P1,P4 | deg | NLF✅ MP✕ | ±5–8° | *§6 확인* |
| M103 | Pelvis Lateral Tilt(전두) | l_hip1,r_hip2 | OP005 tilt(HIP_LINE, GROUND_NORMAL) | GROUND | P1,P4,P7 | deg | NLF✅ MP≈ | ±3–6° | A |
| M104 | Pelvis Center Lateral(X) | pelvis0(=mid1,2) | OP011( OP007(PELVIS_TRACK,P1→f, 타깃축) , STANCE) | GROUND | P1→P4,P1→P7 | ratio(stance) | NLF✅ MP≈ | ±0.05–0.10 | A |
| M105 | Pelvis Center Depth(Z) | pelvis0 | OP011( OP007(PELVIS_TRACK,P5→P7, 정면축) , STANCE) | GROUND | P5→P7 | ratio(stance) | NLF(depth) MP✕ | ±0.15–0.30 | B |
| M106 | Pelvis Center Height(Y) | pelvis0 | OP011( OP007(PELVIS_TRACK, f, up) , leg_len) | GROUND | P1..P7 series | ratio | NLF✅ MP≈ | ±0.05 | A |

**뷰:** M104(X)=FO 전용, M105(Z)=DTL 전용, M106(Y)=양쪽, M101/M103=회전/틸트라 양쪽.
**구현됨:** M101=`azimuth_series(hp)` (rotation.py) · M104≈`pel_dx`(VF034, metrics.py).

### 4.2 Thorax / Spine (M2xx) — THORAX_CENTER = mid(l_shoulder16, r_shoulder17), 척추 = pelvis0→neck12

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M201 | Thorax Rotation(축) | l_shoulder16,r_shoulder17 | OP006 rotation_amount(SHOULDER_LINE_TRACK, P1→f, ground) | BODY | P4,P7 | deg | NLF✅ MP✕ | ±5–10° | A |
| M202 | Spine Forward Bend(시상) | pelvis0,neck12 | OP005: 90 − angle(TORSO_AXIS, up) | GROUND | P1,P4,P7 | deg | NLF✅ MP✕ | ±5–8° | A |
| M203 | Spine Lateral Side Bend(전두) | pelvis0,neck12 | atan2(TORSO_AXIS·타깃축, TORSO_AXIS·up) | GROUND | P1,P4 | deg | NLF✅ MP≈ | ±4–7° | A |
| M204 | Thorax Center Lateral(X) | l_shoulder16,r_shoulder17 | OP011( OP007(THORAX_TRACK,P1→f,타깃축), STANCE) | GROUND | P1→P4 | ratio(stance) | NLF✅ MP≈ | ±0.05–0.10 | A |
| M205 | Thorax Center Height(Y) | l_shoulder16,r_shoulder17 | OP011( OP007(THORAX_TRACK,f,up), leg_len) | GROUND | series | ratio | NLF✅ MP≈ | ±0.05 | A |
| M206 | Thorax Center Depth(Z) | l_shoulder16,r_shoulder17 | OP011( OP007(THORAX_TRACK,P5→P7,정면축), STANCE) | GROUND | P5→P7 | ratio(stance) | NLF(depth) MP✕ | ±0.15–0.30 | B |

**뷰:** M203/M204(좌우)=FO, M202/M206(전후)=DTL, M201=회전 양쪽, M205=양쪽.
**구현됨:** M201=`azimuth_series(sh)` · M202=`spine_from_ground`(VF002/038/076) · M203=`VF001 lat`.
**개선 여지:** 척추를 `pelvis0→neck12` 대신 **spine1_3·spine2_6·spine3_9** 를 써 곡선(C자/S자)까지 뽑을 수 있음 → VF003/004 재료.

### 4.3 Head (M3xx) — head15

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M301 | Head Lateral(X) | head15 | OP011( OP007(HEAD_TRACK,P1→f,타깃축), STANCE) | GROUND | P1→P4,P1→P7 | ratio(stance) | NLF✅ MP≈ | ±0.05–0.10 | A |
| M302 | Head Vertical(Y) | head15 | OP011( OP007(HEAD_TRACK,P1→f,up), STANCE) | GROUND | P1→P4,P1→P7 | ratio(stance) | NLF✅ MP≈ | ±0.05 | A |
| M303 | Head Depth(Z) | head15 | OP011( OP007(HEAD_TRACK,P1→P7,정면축), STANCE) | GROUND | P1→P7 | ratio(stance) | NLF(depth) MP✕ | ±0.15–0.30 | B |
| M304 | Head Rotation(yaw) | ✕(귀/눈 필요) | — | — | — | deg | ✕ | — | **C** |

**M304 정직 판정:** yaw(고개 돌림)는 **양 귀 또는 눈** 벡터가 있어야 잰다. SMPL-24 **body 관절엔 없음**
→ 측정 불가(null). 필요하면 MediaPipe FaceMesh 또는 NLF face 변형 = 2차 입력.
**구현됨:** M301=`head_dx`(VF031).

### 4.4 Shoulder Girdle (M4xx) — l/r_shoulder16/17, collar13/14, neck12

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M401 | Shoulder Height Diff | l_shoulder16,r_shoulder17 | OP007( (LEAD_SH−TRAIL_SH), up ) ÷ shoulder_width | GROUND | P1,P7 | ratio | NLF✅ MP≈ | ±0.04 | A |
| M402 | Shoulder Line Tilt | l_shoulder16,r_shoulder17 | OP005 tilt(SHOULDER_LINE, GROUND_NORMAL) | GROUND | P1,P4,P7 | deg | NLF✅ MP≈ | ±3–6° | A |
| M403 | Lead Shoulder Elevation | l_shoulder16(lead),collar13/14 | OP007( (LEAD_SH−THORAX_CENTER), up ) ÷ torso_len | BODY | P4 | ratio | NLF✅ MP≈ | ±0.05 | A |
| M404 | Trail Shoulder Elevation | r_shoulder17(trail),collar | OP007( (TRAIL_SH−THORAX_CENTER), up ) ÷ torso_len | BODY | P4 | ratio | NLF✅ MP≈ | ±0.05 | A |

**주의:** M401(높이차 ratio)과 M402(각 deg)는 **같은 정보의 두 표현** — 하나만 계약에 올리고 다른 건 파생.
**뷰:** M401/M402(전두)=FO 우세. M403/M404(수직 shrug)=양쪽.
**VF 갭:** M403/M404는 대응 VF가 아직 없음 → 신규 VF 후보(또는 플레인/자세 Node 보조근거). §7 note.

### 4.5 Arm / Elbow (M5xx) — lead/trail 은 handedness (오른손잡이: lead=left)

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M501 | Lead Elbow Flexion | SH,EL,WR(lead 16/18/20) | 180 − OP001 interior(UPPER_ARM, FOREARM) | BODY | P1,P4,P7 | deg | NLF✅ MP≈ | ±3–5° | A |
| M502 | Trail Elbow Flexion | SH,EL,WR(trail 17/19/21) | 180 − OP001 interior(UPPER_ARM, FOREARM) | BODY | P1,P4,P7 | deg | NLF✅ MP≈ | ±3–5° | A |
| M503 | Trail Humeral Rotation(축) | 17,19,21,r_hand23 | signed_angle(FOREARM about UPPER_ARM axis) | BODY | P4 | deg | NLF≈ MP✕ | ±10–15° | **B** |
| M504 | Lead Arm Plane Angle | l_shoulder16,l_wrist20(lead) | OP005 tilt(LEAD_ARM_CHAIN, GROUND_NORMAL) | GROUND | P4,P5,P6 | deg | NLF✅ MP✕ | ±5–8° | A |
| M505 | Trail Elbow Depth(Z) | r_elbow19(trail) | OP007(TRAIL_EL−THORAX, 정면축) ÷ upper_arm_len | GROUND | P4 | ratio | NLF(depth) MP✕ | ±0.15–0.25 | B |
| M506 | Trail Elbow Height(Y) | r_elbow19,r_shoulder17 | OP007( (TRAIL_EL−TRAIL_SH), up ) ÷ upper_arm_len | BODY | P4 | ratio | NLF✅ MP≈ | ±0.05 | A |
| M507 | Lead Arm–Thorax Gap | l_elbow18,THORAX_CENTER | OP003 distance ÷ shoulder_width | BODY | P4,P7 | ratio | NLF✅ MP≈ | ±0.05–0.08 | A |
| M508 | Trail Arm–Thorax Gap | r_elbow19,THORAX_CENTER | OP003 distance ÷ shoulder_width | BODY | P4 | ratio | NLF✅ MP≈ | ±0.05–0.08 | A |

**M503 재분류(정직):** 사용자 목록 A였으나, **상완 장축 회전(IR/ER)**은 점 위치만으론 복원이 약하다(축회전은
최소신뢰 DOF). r_hand23 로 전완 방향을 얻어 **근사**는 가능하나 moderate → **B**로 내림. structure_inferred 급.
**뷰:** M504/M505(플레인·깊이)=DTL, 나머지 세그먼트각=양쪽.
**구현됨:** M501=`VF011/086/087` · M502=`VF012/027`.

### 4.6 Wrist / Hand (M6xx) — wrist20/21, hand(knuckle)22/23

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M601 | Lead Wrist Flex/Ext | 18,20,22(lead) | OP001 interior(FOREARM, HAND) at wrist | BODY | P4,P6,P7 | deg | NLF≈ MP✕ | ±8–12° | B |
| M602 | Trail Wrist Flex/Ext | 19,21,23(trail) | OP001 interior(FOREARM, HAND) at wrist | BODY | P4,P7 | deg | NLF≈ MP✕ | ±8–12° | B |
| M603 | Lead Wrist Radial/Ulnar(Cock) | 18,20,22 | signed_angle(HAND in forearm plane) | BODY | P4 | deg | NLF≈ MP✕ | ±8–12° | B |
| M604 | Hand Height(Y) | HAND_MID(20,21) | OP011( OP007(HAND_TRACK,f,up), STANCE) | GROUND | P4,series | ratio(stance) | NLF✅ MP≈ | ±0.05 | A |
| M605 | Hand Depth(Z) | HAND_MID(20,21) | OP011( OP007(HAND_TRACK,P4→P6,정면축), STANCE) | GROUND | P4→P6 | ratio(stance) | NLF(depth) MP✕ | ±0.15–0.30 | B |
| M606 | Hand Lateral / vs Ball(X) | HAND_MID(20,21) | OP011( OP007(HAND_TRACK,P1→P7,타깃축), STANCE) | GROUND | P7 | ratio(stance) | NLF✅ MP≈ | ±0.05–0.10 | A |
| M607 | Hand Distance from Body | HAND_MID,THORAX_CENTER | OP003 distance ÷ shoulder_width | BODY | P6,P7 | ratio | NLF≈ MP✕ | ±0.10 | B |
| M608 | Lead Forearm Rotation(pron/sup) | 18,20,22(lead) | signed_angle(HAND about FOREARM axis) | BODY | P6→P8 | deg | NLF≈ MP✕ | ±12–18° | B |

**M601/602/603/608 정직:** 손목·전완은 **작은 관절 + hand22/23 노이즈**로 각도가 흔들린다. 클럽 없이는
"릴리즈/코킹 경향"까지만. 정밀 손목각(VF029)은 원래 **CLUB_VECTOR 필요** → 여기선 pose proxy(저신뢰).
**뷰:** M605(Z)=DTL, M606(X)=FO, 나머지 손목각=양쪽(단 저신뢰).
**구현됨:** M604=`hand_h`(내부 P10 검출에 사용 중, VF로 승격 가능).

### 4.7 Lower Body (M7xx)

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M701 | Lead Hip Flexion | spine1_3,l_hip1,l_knee4 | OP001 interior(SPINE, LEAD_THIGH) at hip | BODY | P1,P7 | deg | NLF✅ MP≈ | ±4–6° | A |
| M702 | Trail Hip Flexion | spine1_3,r_hip2,r_knee5 | OP001 interior(SPINE, TRAIL_THIGH) at hip | BODY | P1,P4,P7 | deg | NLF✅ MP≈ | ±4–6° | A |
| M703 | Lead Hip Rotation(IR/ER 축) | l_hip1,l_knee4,HIP_LINE | signed_angle(THIGH in transverse, vs HIP_LINE) | BODY | P4,P7 | deg | NLF≈ MP✕ | ±10–15° | **B** |
| M704 | Trail Hip Rotation(축) | r_hip2,r_knee5,HIP_LINE | signed_angle(THIGH in transverse, vs HIP_LINE) | BODY | P4 | deg | NLF≈ MP✕ | ±10–15° | **B** |
| M705 | Lead Knee Flexion | l_hip1,l_knee4,l_ankle7 | 180 − OP001 interior(THIGH, SHANK) | BODY | P1,P4,P7 | deg | NLF✅ MP≈ | ±3–5° | A |
| M706 | Trail Knee Flexion | r_hip2,r_knee5,r_ankle8 | 180 − OP001 interior(THIGH, SHANK) | BODY | P1,P4,P6,P7 | deg | NLF✅ MP≈ | ±3–5° | A |
| M707 | Lead Knee Valgus/Varus(X) | l_hip1,l_knee4,l_ankle7 | 무릎의 hip-ankle선 대비 전두면 이탈각 | GROUND | P7 | deg | NLF≈ MP✕ | ±8–15° | B |
| M708 | Trail Knee Valgus/Varus | r_hip2,r_knee5,r_ankle8 | 상동(trail) | GROUND | P4,P7 | deg | NLF≈ MP✕ | ±8–15° | B |
| M709 | Lead Knee Lateral(X) | l_knee4 | OP011( OP007(l_knee track,P1→f,타깃축), STANCE) | GROUND | P4,P7 | ratio(stance) | NLF✅ MP≈ | ±0.05–0.08 | A |
| M710 | Trail Knee Lateral(X) | r_knee5 | OP011( OP007(r_knee track,P1→f,타깃축), STANCE) | GROUND | P4,P7 | ratio(stance) | NLF✅ MP≈ | ±0.05–0.08 | A |
| M711 | Lead Foot Angle(flare) | ✕(발끝+뒤꿈치 필요) | — | — | — | deg | ✕ | — | **C** |
| M712 | Trail Foot Angle | ✕(발끝+뒤꿈치 필요) | — | — | — | deg | ✕ | — | **C** |
| M713 | Trail Foot Roll(pron/sup) | ✕(발 세그먼트 필요) | — | — | — | deg | ✕ | — | **C** |

**M703/M704 재분류(정직):** 고관절 **축회전(IR/ER)**도 대퇴 장축 비틀림이라 점-스켈레톤에선 약함 → **B**.
`THIGH`(hip→knee) azimuth를 골반 대비 근사하나 moderate. structure_inferred(→STR).
**M711/712/713 정직:** SMPL-24 `l_foot10/r_foot11`은 **단일 발-지점**이라 발끝·뒤꿈치 구분 불가 → **발 방향/롤 측정 불가(C)**.
필요하면 발 keypoint(toe+heel) 별도 검출 = 2차.
**M707/708 valgus:** 무릎 내반/외반은 markerless에서 악명높게 불안정 → B(저신뢰), structure 급.
**구현됨:** M705=`VF039/088` · M706=`VF040`.

### 4.8 Balance / CoM (M8xx) — CoM = 세그먼트 질량모델 근사

| M | 이름 | 랜드마크 | 계산식 | CS | Phase | 단위 | Engine | 오차 | 등급 |
|---|---|---|---|---|---|---|---|---|:--:|
| M801 | CoM Lateral(X) | 전관절(질량가중) | OP011( OP007(COM_TRACK,P1→f,타깃축), STANCE) | GROUND | P1→P4,P1→P7 | ratio(stance) | NLF✅ MP≈ | ±0.08–0.12 | A |
| M802 | CoM Vertical(Y) | 전관절(질량가중) | OP011( OP007(COM_TRACK,f,up), leg_len) | GROUND | P1..P7 series | ratio | NLF✅ MP≈ | ±0.08 | A |
| M803 | CoM Depth(Z) | 전관절(질량가중) | OP011( OP007(COM_TRACK,P5→P7,정면축), STANCE) | GROUND | P5→P7 | ratio(stance) | NLF(depth) MP✕ | ±0.15–0.30 | B |

**CoM 정의(정직):** 진짜 CoM은 **세그먼트 질량비율 모델**(Dempster 등)이 필요. MVP는
**주요 관절 가중평균**(골반·흉곽·머리·사지 중점) proxy로 시작 → 그래서 오차가 병진보다 +한 단계.
질량모델은 상수표만 추가하면 정밀화 가능(계산식 불변).
**뷰:** M801(X)=FO, M803(Z)=DTL, M802(Y)=양쪽.

---

## 5. 대표 계산식 (개발자용 worked examples — 실제 엔진 함수 참조)

기존 `wham_golf_rotation.py` / `wham_golf_metrics.py`의 순수-기하 함수(`_interior`, `azimuth_series`,
`estimate_up`)를 그대로 재사용한다. **새 계산 로직 없음.**

**M201 Thorax Rotation** (플래그십 — 브라우저 -19° 벽을 -101.5°로 돌파한 그 값)
```python
up      = estimate_up(J, ...)                 # 세계 수직축(발/지면 PCA)
e1, e2  = plane_basis(up)                      # up⊥ 수평면 기저
sh_az   = azimuth_series(J, r_sh=17, l_sh=16, up, e1, e2)   # 어깨선 azimuth 시계열
M201    = sh_az[f] - sh_az[P1]                 # 어드레스 대비 회전량(deg)
#  VF015 = M201 @P4 ;  VF020 X-Factor = M201 − M101 @P4
```

**M501 Lead Elbow Flexion** (신뢰 최상위 계층 ±3–5°)
```python
interior = _interior(J[f][16], J[f][18], J[f][20])   # ∠(shoulder–elbow–wrist), 180=곧음
M501     = 180.0 - interior                          # 굴곡각(0=곧음)
#  VF011 Lead Arm Straightness @P1 ;  VF087 Lead Arm Bend @P7(chicken-wing proxy)
```

**M801 CoM Lateral** (질량모델 주의)
```python
# MVP proxy: 주요 관절 가중평균 (질량비율은 상수표로 후에 정밀화)
com   = weighted_mean(J[f], weights=SEGMENT_MASS)     # (x,y,z)
u_t   = unit(target_axis_on_ground)                   # 타깃선 단위벡터
width = |stance_line|                                 # 정규화 기준
M801  = dot(com[f] - com[P1], u_t) / width            # + = trail 쪽 이동
#  VF035 Weight Shift ;  VF084 Transfer Completion ;  VF037 Reverse Pivot 재료
```

---

## 6. 번호 갭 / 확인 필요

| 항목 | 상태 | 제안 |
|---|---|---|
| **M102** | 사용자 목록에서 비어있음(101→103) | SMPL 골격상 **골반 시상면 틸트(A/P Tilt)** 자리로 보임 → 채우기 권장(§4.1 예약행). **확인 요청.** |
| **M403/M404 → VF** | 대응 VF 없음 | 신규 VF(어깨 elevation) 신설 or 플레인/자세 Node 보조근거로만. |
| **M604 승격** | 내부 P10 검출에만 사용 중 | Hand Height를 VF028(Hand Depth@P4 대응)·VF059(hand drop)로 정식 방출. |
| 등급 재분류 | M503·M703·M704를 A→**B**로 내림 | 축회전 원리적 약함(정직성). 반대 근거 있으면 되돌림. |

**최종 카운트(이 문서 기준):** 정의된 M = **51개** (+ M102 예약 1). 등급: **A 31 · B 16 · C 4.**
(사용자 초안 "A32/B13/C4=49"는 근사치였고, 이 표가 정본. Z-깊이 일부를 B로, 축회전 3개를 A→B로 이동.)

---

## 7. M → VF → Node 매핑 (계약으로의 연결)

M은 계약에 직접 안 나간다. **VF 어댑터**가 M을 phase에서 읽어 VF로 방출하고, 그 VF가 DOH Node의 근거가 된다.

| M | → VF (대표) | → DOH Node |
|---|---|---|
| M101 Pelvis Rot | VF016/017/018 Hip Turn, VF075 Hip Clear | MOT-007, MOT-018 |
| M201 Thorax Rot | VF013/014/015 Shoulder Turn, VF103 Full Rot | MOT-006, OBS-026 |
| M201−M101 | **VF019/020 X-Factor**, VF047 Sep@P5 | MOT-012 |
| M202 Spine Fwd Bend | VF002 Spine Angle, VF038 Loss of Posture, VF068 Standing Up | OBS-001/009, MOT-019 |
| M203 Spine Side Bend | VF001 Spine Tilt, VF036 Reverse Spine | OBS-002/008, PAT-014 |
| M104/M204/M801 lateral | VF034 Pelvis Sway, VF120 Lateral Drift, VF035/084 Weight Shift | PAT-002/003, MOT-009/022 |
| M105/M206/M803 depth | VF045/067 Early Extension | OBS-011, PAT-004 |
| M301 Head lateral | VF031/032 Head Sway, VF119 Stillness | OBS-004, PAT-002 |
| M302/M303 Head Y/Z | VF033 Vertical Move, VF090 Head Behind Ball, VF109 Head Move | OBS-009/025, MOT-019 |
| M401/M402 Shoulder Tilt | VF008 Shoulder Tilt, VF036 Reverse Spine | MOT-001, OBS-008 |
| M501 Lead Elbow Flex | VF011 Straightness, VF086/087 Chicken Wing, VF101 Follow | MOT-003, OBS-016, PAT-008 |
| M502 Trail Elbow Flex | VF012/027 Trail Arm Flex | MOT-003, OBS-007 |
| M504 Lead Arm Plane | VF025 Arm Plane, VF056/070 Steepening | MOT-010, PAT-005 |
| M505/M506/M508 Trail Elbow | VF026 Trail Elbow Height (Flying) | OBS-007, PAT-009 |
| M604/M605 Hand Y/Z | VF028 Hand Depth, VF059 Shallowing, VF071 Handle Pull-in | MOT-010/016, OBS-007 |
| M608 Forearm Rot | VF097/099 Forearm Rotation | MOT-023, CAU-014 |
| M701/M702 Hip Flex | VF002 자세(hip hinge 재료) | OBS-001, MOT-001 |
| M703/M704 Hip Rot(축) | VF127 Hip IntRot Limit(추정) | STR-001/002 |
| M705 Lead Knee Flex | VF039 Knee Flex Δ, VF088 @Impact | MOT-002/018, OBS-015 |
| M706 Trail Knee Flex | VF040 @P4, VF066 Straighten early | STR-025, OBS-015 |
| M709/M710 Knee lateral | (knee slide 재료) | MOT-002, OBS-015 |
| M802/M803 CoM Y/Z | VF068 Standing Up, VF121 Vertical Drift, VF067 Early Ext | COM-002, PAT-004, OBS-011 |

> 규칙(계약 §3 승계): **단일 M·단일 VF ≠ Node 확정.** Vision은 근거만 공급, Node 발화는 DOH의 복수조합.
> Feature→Node 가중치는 `data/vision_feature_map.csv`(DOH 소유)에서 관리. Vision 출력엔 Node 언급 금지.

---

## 8. 구현 현황 (이미 짜인 것 vs 남은 것)

| 상태 | M-code | 위치 |
|---|---|---|
| ✅ 구현됨 | M101, M201, (X-Factor) | `wham_golf_rotation.py` (azimuth) |
| ✅ 구현됨 | M104, M202, M203, M301, M302, M401/402, M501, M502, M506, M604, M705, M706 | `wham_golf_metrics.py` (VF001/002/008/011/012/022/026/027/031/033/034/038/039/040/076/087/088/123) |
| ✅ 구현됨(깊이·2군) | M105, M605 | `wham_golf_metrics.py` (VF067 tush line / VF059 손깊이변화 / VF028 Hand Depth @P4 heel line) |
| ✅ 구현됨 | M106 | VF121 골반 상승(벨트버클) — 얼리익스텐션 수직성분 |
| ○ 미구현(A, 우선) | M103, M204, M205, M504, M507/508, M606, M701/702, M709/710, M801/802 | 신규 |
| ○ 미구현(B) | M206, M303, M503, M505, M601/602/603, M607, M608, M703/704, M707/708, M803 | 신규(저신뢰 flag 필수) |
| ✕ 불가(C) | M304, M711/712/713 | SMPL-24 body 관절 없음 → null |

**구현 우선순위 (권장):**
1. **A등급 세그먼트각·틸트 먼저** (~~M106/M401/402/M506~~ 완료 · 남은 것 M103/M504/M701/702/M709/710) — 오차 최소, 즉시 신뢰.
2. **A등급 병진·CoM** (~~M302~~ 완료 · 남은 것 M204/205/M606/M801/802) — 정규화 재료(STANCE, leg_len) 정리.
3. **B등급 깊이(Z)** — DTL 뷰-게이팅 + `depth_estimated` 달고 방출.
4. **B등급 축회전/미세관절** — structure_inferred, 낮은 conf. 필요 최소만.
5. **C등급** — 계약에서 생략(미시도). 2차 입력(FaceMesh/발 keypoint) 붙을 때 재개.

---

## 9. 잠금·확장 규칙

| 잠김 (메이저) | 자유 추가 (마이너) |
|---|---|
| M### id·이름·랜드마크·계산식 | 새 M### (append-only) |
| 축 규약(X/Y/Z ↔ CS) §2 | 오차 seed 보정(PoC 실측 후) |
| 등급 정의·뷰-게이팅 §3 | 질량모델 상수표(CoM 정밀화) |
| **M은 내부 레이어 — 계약은 VF만 방출** | spine1/2/3·collar·hand 활용 신규 M |
| null≠0, false precision 금지 | C등급의 2차 입력(FaceMesh/발) |

- M### **append-only**: 재사용/의미변경 금지(과거 추론 추적성 — 계약 §3.4와 동일 원칙).
- **계약 무변경 보장:** M을 아무리 추가·수정해도 `doh.vision.v1`은 안 흔들린다(VF 어댑터만 바뀜).
  → LOCK된 계약을 깨지 않고 이 카탈로그를 자유롭게 채울 수 있다.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (SPEC DRAFT) |
| Measurement 수 | **51** (A 31 · B 16 · C 4) + M102 예약 |
| 상위 | Coordinate/Primitive/Operator/Feature Spec v1.0 |
| 구현 정합 | `pose3d_poc/wham_golf_rotation.py` · `wham_golf_metrics.py` (SMPL-24) |
| 계약 영향 | **없음** (M은 내부 레이어, `doh.vision.v1`은 VF만 방출) |
| 다음 | ① M102 확인 ② A등급 미구현분 코드화 ③ 오차 seed 실측 보정 |
| 상태 | 프로 검토 대기 |

*VF는 "무엇을 의미하는가", M은 "무엇을 실제로 재는가"다.*
*재는 걸 정직하게 나누면, 아이디어는 명세가 되고, 명세는 그대로 코드가 된다.*
*못 재는 것(C)을 null로 남기는 규율이, 재는 것(A)을 신뢰하게 만든다.*
