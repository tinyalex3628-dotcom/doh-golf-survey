# DOH Vision Feature Spec v1.0
**Project C — 영상 측정 Feature 전수 정의 (VF###)**
*작성일: 2026-07-01 / 상태: SPEC DRAFT (프로 검토 전)*
*상위: Technical Architecture v1.1 · Coordinate/Primitive/Operator Spec v1.0*
*연결 자산: golf_knowledge_graph v1.0.0 (159 nodes)*

> **Feature = `Operator( Primitive[…] ) @ Phase` [Coord].**
> 이 문서는 그 조합들을 전수 나열한다. 각 VF는 기존 카탈로그(PR###/OP###)만 조합하므로
> **새 계산 로직이 없다** — 순수하게 "조합 + 의미 + Node 연결"이다.
> Vision은 여기까지(사실값). Node 활성화·추론은 DOH(Project A)의 몫.

---

## 0. 필드 정의 & 공통 규칙

| 필드 | 의미 |
|---|---|
| `VF###` | Feature ID (append-only) |
| `name` | 골프 의미 (semantic) |
| `OP` | Operator (OP###) |
| `Prim` | 입력 Primitive (PR###) |
| `@P` | Phase 앵커 (P1~P10 또는 구간) |
| `CS` | 측정 좌표계 |
| `unit` | 단위 |
| `view` | 신뢰 촬영방향 (F=FO정면 / D=DTL후면) |
| `err` | 주요 error factor |
| `→Node` | 근거로 연결되는 DOH Node |

**공통 규칙**
- confidence 전파: Technical Arch §9 (곱/min, monotonic). 각 VF는 `c_view`를 Coordinate Spec §7에서 가져옴.
- `club` 표시 = CLUB_VECTOR/CLUBHEAD 필요(객체검출 2차). MVP 미측정 → null 허용.
- **단일 Feature ≠ Node 확정.** DOH가 복수 Feature 조합으로 Node 발화(Arch 금기 4).
- P-System: P1 Address / P2 샤프트평행(테이크어웨이) / P3 리드암평행 / P4 Top / P5 리드암평행(다운) / P6 샤프트평행(다운) / P7 Impact / P8 샤프트평행(팔로우) / P9 리드암평행(팔로우) / P10 Finish.

---

## 1. Address (P1) — 셋업 정적 측정 [12]

| VF | name | OP | Prim | @P | CS | unit | view | err | →Node |
|---|---|---|---|---|---|---|---|---|---|
| VF001 | Spine Tilt (좌우) | OP005 | TORSO_AXIS,VERTICAL | P1 | BODY | deg | F | vis | OBS-002, MOT-001 |
| VF002 | Spine Angle (전후 굴곡) | OP005 | TORSO_AXIS,GROUND_NORMAL | P1 | GROUND | deg | D | depth | OBS-001/002, MOT-001 |
| VF003 | Upper Back Round (C) | OP001 | TORSO_AXIS,LEAD_UPPER_ARM | P1 | BODY | deg | D | vis | OBS-001, PAT-011 |
| VF004 | Lower Back Arch (S) | OP005 | HIP_LINE,TORSO_AXIS | P1 | BODY | deg | D | depth | OBS-002, PAT-010 |
| VF005 | Weight Bias (heel/toe) | OP007 | HEAD_TO_STANCE | P1 | GROUND | ratio | D | ground | OBS-003, MOT-002 |
| VF006 | Weight Bias (lead/trail) | OP011 | PELVIS_CENTER,STANCE_LINE | P1 | GROUND | ratio | F | vis | MOT-002 |
| VF007 | Stance Width | OP003 | STANCE_LINE | P1 | GROUND | ratio | F | ground | MOT-004 |
| VF008 | Shoulder Tilt @Address | OP005 | SHOULDER_LINE,GROUND_NORMAL | P1 | GROUND | deg | F | vis | MOT-001 |
| VF009 | Hip Tilt @Address | OP005 | HIP_LINE,GROUND_NORMAL | P1 | GROUND | deg | F | vis | MOT-002 |
| VF010 | Head Position over Ball | OP007 | HEAD_TO_STANCE | P1 | GROUND | ratio | D | depth | MOT-004 |
| VF011 | Lead Arm Straightness | OP001 | LEAD_UPPER_ARM,LEAD_FOREARM | P1 | BODY | deg | F | vis | MOT-003 |
| VF012 | Trail Arm Flex @Address | OP001 | TRAIL_UPPER_ARM,TRAIL_FOREARM | P1 | BODY | deg | D | vis | MOT-003 |

---

## 2. Backswing (P2~P4) — 회전·플레인·안정성 [28]

### 2.1 회전량 (Turn) — 각 phase 재사용
| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF013 | Shoulder Turn @P2 | OP006 | SHOULDER_LINE_TRACK | P2 | BODY | deg | F/D | MOT-006 |
| VF014 | Shoulder Turn @P3 | OP006 | SHOULDER_LINE_TRACK | P3 | BODY | deg | F/D | MOT-006 |
| VF015 | Shoulder Turn @P4 | OP006 | SHOULDER_LINE_TRACK | P4 | BODY | deg | F/D | MOT-006, OBS-026 |
| VF016 | Hip Turn @P2 | OP006 | HIP_LINE_TRACK | P2 | BODY | deg | F/D | MOT-007 |
| VF017 | Hip Turn @P3 | OP006 | HIP_LINE_TRACK | P3 | BODY | deg | F/D | MOT-007 |
| VF018 | Hip Turn @P4 | OP006 | HIP_LINE_TRACK | P4 | BODY | deg | F/D | MOT-007 |
| VF019 | X-Factor @P3 | OP002 | SHOULDER_LINE,HIP_LINE,GROUND_NORMAL | P3 | BODY | deg | F/D | MOT-012 |
| VF020 | X-Factor @P4 | OP002 | SHOULDER_LINE,HIP_LINE,GROUND_NORMAL | P4 | BODY | deg | F/D | MOT-012 |
| VF021 | Backswing Length (arm) | OP001 | LEAD_ARM_CHAIN,VERTICAL | P4 | BODY | deg | D | OBS-026, MOT-006 |

### 2.2 플레인 & 팔 (Plane / Arm)
| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF022 | Shoulder Plane Angle | OP005 | SHOULDER_LINE,GROUND_NORMAL | P4 | GROUND | deg | D | OBS-005/006 |
| VF023 | Flat Shoulder Plane flag | OP005 | SHOULDER_LINE,GROUND_NORMAL | P4 | GROUND | deg | D | OBS-005 |
| VF024 | Steep Shoulder Plane flag | OP005 | SHOULDER_LINE,GROUND_NORMAL | P4 | GROUND | deg | D | OBS-006 |
| VF025 | Arm Swing Plane | OP005 | LEAD_ARM_CHAIN,GROUND_NORMAL | P4 | GROUND | deg | D | MOT-010 |
| VF026 | Trail Elbow Height (Flying) | OP007 | TRAIL_UPPER_ARM | P4 | BODY | ratio | D | OBS-007, PAT-009 |
| VF027 | Trail Elbow Angle | OP001 | TRAIL_UPPER_ARM,TRAIL_FOREARM | P4 | BODY | deg | D | OBS-007 |
| VF028 | Hand Depth @P4 | OP007 | HAND_MID_TRACK | P4 | BODY | ratio | D | MOT-010, OBS-007 |
| VF029 | Wrist Hinge Angle | OP001 | LEAD_FOREARM,CLUB_VECTOR | P4 | BODY | deg | D | MOT-008 club |
| VF030 | Takeaway Path Deviation | OP007 | HAND_MID_TRACK | P2 | GROUND | ratio | D | MOT-005 |

### 2.3 안정성/스웨이 (Stability / Sway)
| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF031 | Head Sway (lateral) P1→P4 | OP011 | HEAD_POINT_TRACK,STANCE_LINE | P1→P4 | GROUND | ratio | F | OBS-004, PAT-002 |
| VF032 | Head Sway Peak | OP013 | HEAD_POINT_TRACK | P1→P4 | GROUND | ratio | F | OBS-004, PAT-002 |
| VF033 | Head Vertical Move | OP007 | HEAD_POINT_TRACK | P1→P4 | GROUND | ratio | D | OBS-009, PAT-012 |
| VF034 | Pelvis Sway (trail) | OP007 | PELVIS_TRACK | P1→P4 | GROUND | ratio | F | PAT-002, MOT-009 |
| VF035 | Weight Shift to Trail | OP007 | PELVIS_TRACK | P1→P4 | GROUND | ratio | F | MOT-009 |
| VF036 | Reverse Spine @Top | OP005 | TORSO_AXIS,VERTICAL | P4 | GROUND | deg | D | OBS-008, PAT-014 |
| VF037 | Reverse Pivot (weight) | OP007 | PELVIS_TRACK | P1→P4 | GROUND | ratio | F | PAT-001 |
| VF038 | Loss of Posture (spine Δ) | OP005 | TORSO_AXIS,GROUND_NORMAL | P1 vs P4 | GROUND | deg | D | OBS-009, PAT-012 |
| VF039 | Lead Knee Flex Δ | OP001 | LEAD_THIGH,LEAD_SHANK | P1 vs P4 | BODY | deg | F | MOT-002 |
| VF040 | Trail Knee Flex @P4 | OP001 | TRAIL_THIGH,TRAIL_SHANK | P4 | BODY | deg | F | STR-025 |

*(P2/P3/P5/P6/P8/P9는 Event Source 보간 프레임 — confidence에 interpolated_event 반영)*

---

## 3. Transition (P4→P5) — 시퀀스·슬라이드·초기이동 [16]

| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF041 | Lower Body Init (hip先) | OP014 | HIP_LINE_TRACK,SHOULDER_LINE_TRACK | P4→P5 | BODY | frame | F/D | MOT-013, CAU-001 |
| VF042 | Upper Body Init flag (OTT) | OP014 | SHOULDER_LINE_TRACK | P4→P5 | BODY | frame | D | OBS-012, PAT-005 |
| VF043 | Pressure Shift Init timing | OP014 | PELVIS_TRACK | P4→P5 | GROUND | frame | F | MOT-011 |
| VF044 | Hip Slide (lateral) | OP007 | PELVIS_TRACK | P4→P5 | GROUND | ratio | F | OBS-010, PAT-003 |
| VF045 | Hips toward Ball (Early Ext) | OP007 | PELVIS_TRACK | P5→P7 | GROUND | ratio | D | OBS-011, PAT-004 |
| VF046 | X-Factor Stretch | OP010 | (XF@P5)/(XF@P4) | P4→P5 | BODY | ratio | F/D | MOT-012 |
| VF047 | Shoulder-Hip Sep @P5 | OP002 | SHOULDER_LINE,HIP_LINE,GROUND_NORMAL | P5 | BODY | deg | F/D | MOT-012 |
| VF048 | Sequence Gap (kinematic) | OP014 | HIP/SHOULDER/HAND tracks | P4→P6 | BODY | frame | F/D | CAU-001/002 |
| VF049 | Slide vs Rotate ratio | OP010 | slide/rotation | P4→P5 | GROUND | ratio | F | COM-009, PAT-003 |
| VF050 | Trail Hip Clear timing | OP014 | HIP_LINE_TRACK | P4→P6 | BODY | frame | F | MOT-013 |
| VF051 | Pelvis Rotation Speed early | OP008 | HIP_LINE_TRACK | P5 | BODY | deg/s | F/D | MOT-014 |
| VF052 | Lead Hip Depth (goes back) | OP007 | PELVIS_TRACK | P4→P6 | GROUND | ratio | D | OBS-011, PAT-004 |
| VF053 | Head Move in Transition | OP007 | HEAD_POINT_TRACK | P4→P5 | GROUND | ratio | F | OBS-025 |
| VF054 | Lower Body Stall flag | OP008 | HIP_LINE_TRACK | P5→P7 | BODY | deg/s | F/D | CAU-002 |
| VF055 | Casting onset (early release) | OP001 | LEAD_FOREARM,CLUB_VECTOR | P5 | BODY | deg | D | OBS-018, PAT-006 club |
| VF056 | Re-route Steepness | OP005 | LEAD_ARM_CHAIN,GROUND_NORMAL | P4→P5 | GROUND | deg | D | COM-005, PAT-005 |

---

## 4. Downswing (P5→P6) — 경로·샬로잉·랙 [18]

| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF057 | Club Path (in/out) | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P6→P7 | TARGET | deg | D | OBS-013/014/027 club |
| VF058 | Over-the-Top flag | OP002 | HAND_MID_TRACK,SHOULDER_LINE | P5→P6 | BODY | deg | D | OBS-013, PAT-005 |
| VF059 | Shallowing (hand drop) | OP007 | HAND_MID_TRACK | P4→P6 | BODY | ratio | D | MOT-016 |
| VF060 | Stuck / Too Shallow | OP002 | HAND_MID_TRACK,TARGET_LINE | P6 | TARGET | deg | D | OBS-014 |
| VF061 | In-to-Out excess | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P6→P7 | TARGET | deg | D | OBS-027 club |
| VF062 | Wrist Lag Angle (retention) | OP001 | LEAD_FOREARM,CLUB_VECTOR | P6 | BODY | deg | D | MOT-017 club |
| VF063 | Casting (lag loss) | OP001 | LEAD_FOREARM,CLUB_VECTOR | P5 vs P6 | BODY | deg | D | OBS-018, PAT-006 club |
| VF064 | Shoulder Plane thru Down | OP005 | SHOULDER_LINE,GROUND_NORMAL | P5→P7 | GROUND | deg | D | MOT-015 |
| VF065 | Hip Rotation Speed | OP008 | HIP_LINE_TRACK | P6 | BODY | deg/s | F/D | MOT-014 |
| VF066 | Trail Knee Straighten early | OP001 | TRAIL_THIGH,TRAIL_SHANK | P5→P6 | BODY | deg | F | OBS-015, COM-011 |
| VF067 | Early Extension (pelvis→ball) | OP007 | PELVIS_TRACK | P5→P7 | GROUND | ratio | D | OBS-011, PAT-004 |
| VF068 | Standing Up (spine Δ down) | OP005 | TORSO_AXIS,GROUND_NORMAL | P5 vs P7 | GROUND | deg | D | COM-002, OBS-009 |
| VF069 | Hand Speed (proxy) | OP009 | HAND_MID_TRACK | P6→P7 | GROUND | norm | F/D | MOT-014, CAU-013 |
| VF070 | Steepening Plane (avoid fat) | OP005 | LEAD_ARM_CHAIN,GROUND_NORMAL | P5→P6 | GROUND | deg | D | COM-001 |
| VF071 | Handle Pull-in (shank avoid) | OP007 | HAND_MID_TRACK | P6 | GROUND | ratio | D | COM-008 |
| VF072 | Arm Swing Excess (hip stall) | OP009 | HAND_MID_TRACK vs HIP speed | P5→P7 | BODY | ratio | F/D | COM-004 |
| VF073 | Downswing Tempo segment | OP010 | t(P4→P7) | P4→P7 | — | ratio | F/D | CAU-012 |
| VF074 | Attack Angle (club) | OP005 | CLUBHEAD_TRACK,GROUND_NORMAL | P6→P7 | TARGET | deg | D | CON-001/002 club |

---

## 5. Impact (P7) — 임팩트 정렬·페이스·접촉 [24]

| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF075 | Hip Clear Amount | OP006 | HIP_LINE_TRACK | P1→P7 | BODY | deg | F/D | MOT-018 |
| VF076 | Spine Angle Maintenance | OP005 | TORSO_AXIS,GROUND_NORMAL | P1 vs P7 | GROUND | deg | D | MOT-019, OBS-009 |
| VF077 | Hands vs Ball (shaft lean) | OP002 | CLUB_VECTOR,VERTICAL | P7 | TARGET | deg | D | MOT-020, OBS-019 club |
| VF078 | Forward Shaft Lean | OP002 | CLUB_VECTOR,VERTICAL | P7 | TARGET | deg | D | OBS-017/019 club |
| VF079 | Flip/Scoop (neg lean) | OP002 | CLUB_VECTOR,VERTICAL | P7 | TARGET | deg | D | OBS-017, PAT-007 club |
| VF080 | Clubface Angle | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P7 | TARGET | deg | D | MOT-021 club |
| VF081 | Open Face flag | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P7 | TARGET | deg | D | OBS-020 club |
| VF082 | Closed Face flag | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P7 | TARGET | deg | D | OBS-021 club |
| VF083 | Face-to-Path | OP002 | face,path | P7 | TARGET | deg | D | BF-001/002 club |
| VF084 | Weight Transfer Completion | OP007 | PELVIS_TRACK | P1→P7 | GROUND | ratio | F | MOT-022 |
| VF085 | Hanging Back (trail weight) | OP007 | PELVIS_TRACK | P7 | GROUND | ratio | F | OBS-022, PAT-013 |
| VF086 | Chicken Wing (lead elbow) | OP001 | LEAD_UPPER_ARM,LEAD_FOREARM | P7→P8 | BODY | deg | F/D | OBS-016, PAT-008 |
| VF087 | Lead Arm Bend @Impact | OP001 | LEAD_UPPER_ARM,LEAD_FOREARM | P7 | BODY | deg | F/D | OBS-016 |
| VF088 | Lead Knee Angle @Impact | OP001 | LEAD_THIGH,LEAD_SHANK | P7 | BODY | deg | F | MOT-018, OBS-015 |
| VF089 | Trail Heel Lift timing | OP007 | TRAIL_ANKLE track | P7 | GROUND | ratio | F | MOT-022 |
| VF090 | Head Behind Ball | OP007 | HEAD_TO_STANCE | P7 | GROUND | ratio | D | MOT-019 |
| VF091 | Hip Slide @Impact | OP007 | PELVIS_TRACK | P5→P7 | GROUND | ratio | F | OBS-010, PAT-003 |
| VF092 | Casting residual @Impact | OP001 | LEAD_FOREARM,CLUB_VECTOR | P7 | BODY | deg | D | OBS-018 club |
| VF093 | Hands Trail Clubhead | OP002 | CLUB_VECTOR,VERTICAL | P7 | TARGET | deg | D | OBS-019 club |
| VF094 | Low Point (fat/thin proxy) | OP014 | HAND_MID_TRACK | P7 | GROUND | frame | D | CON-001/002 |
| VF095 | Hosel Proximity (shank) | OP003 | CLUBHEAD_POINT,BALL_POINT | P7 | TARGET | ratio | D | CON-003 club |
| VF096 | Contact Location proxy | OP003 | CLUBHEAD_POINT,BALL_POINT | P7 | TARGET | ratio | D | CON-004/005 club |
| VF097 | Forearm Rotation thru | OP008 | LEAD_FOREARM | P6→P8 | BODY | deg/s | D | MOT-023, CAU-014 |
| VF098 | Clubhead Speed (proxy) | OP009 | CLUBHEAD_TRACK | P6→P7 | TARGET | norm | D | CAU-013 club |

---

## 6. Release & Finish (P8~P10) — 방출·균형·완성 [12]

| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF099 | Forearm Rotation (release) | OP008 | LEAD_FOREARM | P7→P8 | BODY | deg/s | D | MOT-023 |
| VF100 | Wrist Release timing | OP001 | LEAD_FOREARM,CLUB_VECTOR | P7→P8 | BODY | deg | D | MOT-024 club |
| VF101 | Chicken Wing Follow | OP001 | LEAD_UPPER_ARM,LEAD_FOREARM | P8 | BODY | deg | F/D | OBS-016, PAT-008 |
| VF102 | Lead Arm Fold | OP001 | LEAD_UPPER_ARM,LEAD_FOREARM | P9 | BODY | deg | D | MOT-024 |
| VF103 | Full Rotation @Finish | OP006 | SHOULDER_LINE_TRACK | P1→P10 | BODY | deg | F/D | MOT-026, OBS-024 |
| VF104 | Incomplete Rotation flag | OP006 | HIP_LINE_TRACK | P1→P10 | BODY | deg | F/D | OBS-024 |
| VF105 | Balance Hold @Finish | OP009 | PELVIS_TRACK | P10 | GROUND | norm | F | MOT-025, OBS-023 |
| VF106 | Fall toward Trail | OP007 | PELVIS_TRACK | P8→P10 | GROUND | ratio | F | OBS-023, FEEL-004 |
| VF107 | Fall toward Lead | OP007 | PELVIS_TRACK | P8→P10 | GROUND | ratio | F | FEEL-003 |
| VF108 | Weight Fwd @Finish | OP007 | PELVIS_TRACK | P10 | GROUND | ratio | F | MOT-022, MOT-025 |
| VF109 | Head Move total swing | OP013 | HEAD_POINT_TRACK | P1→P10 | GROUND | ratio | F/D | OBS-025 |
| VF110 | Finish Spine Angle | OP005 | TORSO_AXIS,VERTICAL | P10 | GROUND | deg | D | MOT-026 |

---

## 7. Global / Tempo / Derived — 전체 스윙 파생 [15]

| VF | name | OP | Prim | @P | CS | unit | view | →Node |
|---|---|---|---|---|---|---|---|---|
| VF111 | Tempo Ratio (BS:DS) | OP010 | t(P1→P4)/t(P4→P7) | 全 | — | ratio | F/D | CAU-012 |
| VF112 | Total Swing Time | OP003 | frame(P1..P10) | 全 | — | s | F/D | CAU-012 |
| VF113 | Backswing Duration | OP003 | frame(P1→P4) | P1→P4 | — | s | F/D | CAU-012 |
| VF114 | Downswing Duration | OP003 | frame(P4→P7) | P4→P7 | — | s | F/D | CAU-013 |
| VF115 | Peak Hand Speed frame | OP014 | HAND_MID_TRACK | 全 | GROUND | frame | F/D | MOT-014 |
| VF116 | Peak Hip Speed frame | OP014 | HIP_LINE_TRACK | 全 | BODY | frame | F/D | MOT-014 |
| VF117 | Kinematic Sequence Order | OP014 | hip/torso/arm/hand peaks | 全 | BODY | order | F/D | CAU-001/002 |
| VF118 | Sequence Efficiency | OP010 | peak gaps | 全 | BODY | ratio | F/D | CAU-001 |
| VF119 | Head Stillness Index | OP013 | HEAD_POINT_TRACK | P1→P7 | GROUND | ratio | F/D | OBS-025 |
| VF120 | Lateral Center Drift | OP013 | PELVIS_TRACK | 全 | GROUND | ratio | F | PAT-002/003 |
| VF121 | Vertical Center Drift | OP013 | PELVIS_TRACK | 全 | GROUND | ratio | D | PAT-004, OBS-011 |
| VF122 | Swing Plane Consistency | OP005 | LEAD_ARM_CHAIN var | 全 | GROUND | deg | D | MOT-010/015 |
| VF123 | Overswing flag | OP001 | LEAD_ARM_CHAIN,VERTICAL | P4 | BODY | deg | D | CAU-013, OBS-026(rev) |
| VF124 | Restricted Backswing flag | OP006 | SHOULDER_LINE_TRACK | P4 | BODY | deg | F/D | OBS-026, COM-012 |
| VF125 | Tempo Consistency (multi) | OP010 | across swings | 全 | — | ratio | F/D | CAU-012 |

---

## 8. Structure-inferred (약신뢰, 참고용) — 구조 추정 [10]

> ⚠️ STR-* Node는 원래 **신체검사(가동성/근력) 영역**이라 단일 스윙 영상으로 직접
> 측정 불가. 아래는 스윙 중 간접 **추정치**이며 confidence를 낮게, `structure_inferred`
> flag를 달아 출력. DOH는 이를 **약한 근거**로만 사용.

| VF | name | OP | Prim | @P | CS | view | →Node(추정) |
|---|---|---|---|---|---|---|---|
| VF126 | Thoracic Rot Limit (추정) | OP006 | SHOULDER_LINE_TRACK | P4 | BODY | F/D | STR-005 |
| VF127 | Hip Int Rot Limit (추정) | OP006 | HIP_LINE_TRACK | P4 | BODY | F/D | STR-001/002 |
| VF128 | Ankle Dorsiflex (추정) | OP001 | LEAD_SHANK,GROUND | P7 | BODY | F | STR-007 |
| VF129 | Balance Deficiency (추정) | OP009 | PELVIS_TRACK | P10 | GROUND | F | STR-013/014 |
| VF130 | Core Anti-Rot (추정) | OP013 | drift | 全 | GROUND | F | STR-015 |
| VF131 | Pelvic Tilt Control (추정) | OP005 | HIP_LINE var | 全 | GROUND | D | STR-016 |
| VF132 | Scapular Stability (추정) | OP007 | TRAIL_UPPER_ARM | P4 | BODY | D | STR-017 |
| VF133 | Shoulder ExtRot (추정) | OP001 | TRAIL_UPPER_ARM,FOREARM | P4 | BODY | D | STR-008 |
| VF134 | Lead Side Bracing (추정) | OP001 | LEAD_THIGH,SHANK | P7 | BODY | F | STR-026 |
| VF135 | Trail Knee Control (추정) | OP001 | TRAIL_THIGH,SHANK | P4→P7 | BODY | F | STR-025 |

---

## 9. Club / Ball (2차 단계, 객체검출 필요) — [15]

> 전부 `club`/`ball` 표시. MVP에서 CLUB_VECTOR/CLUBHEAD/BALL 미검출 시 **null**.
> BF-*/CON-* Node의 유일한 직접 근거원.

| VF | name | OP | Prim | @P | CS | →Node |
|---|---|---|---|---|---|---|
| VF136 | Club Path angle | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P7 | TARGET | OBS-013/014/027 |
| VF137 | Clubface angle abs | OP002 | CLUBHEAD_TRACK,TARGET_LINE | P7 | TARGET | OBS-020/021 |
| VF138 | Face-to-Path | OP002 | face,path | P7 | TARGET | BF-001~006 |
| VF139 | Dynamic Loft (lean) | OP002 | CLUB_VECTOR,VERTICAL | P7 | TARGET | CON-001/002 |
| VF140 | Attack Angle | OP005 | CLUBHEAD_TRACK,GROUND | P6→P7 | TARGET | CON-001/006 |
| VF141 | Clubhead Speed | OP009 | CLUBHEAD_TRACK | P6→P7 | TARGET | CAU-013 |
| VF142 | Shaft Plane @P4 | OP005 | CLUB_VECTOR,GROUND | P4 | TARGET | OBS-005/006 |
| VF143 | Shaft Parallel detect P2 | OP005 | CLUB_VECTOR,GROUND | P2 | TARGET | (event 보조) |
| VF144 | Shaft Parallel detect P6 | OP005 | CLUB_VECTOR,GROUND | P6 | TARGET | (event 보조) |
| VF145 | Ball Launch Direction | OP002 | BALL track,TARGET_LINE | post-P7 | TARGET | BF-003/004 |
| VF146 | Ball Launch Angle | OP005 | BALL track,GROUND | post-P7 | TARGET | BF-011/013 |
| VF147 | Ball Curvature (spin proxy) | OP002 | BALL track | post-P7 | TARGET | BF-001/002/008 |
| VF148 | Ball Speed (proxy) | OP009 | BALL track | post-P7 | TARGET | CON-007 |
| VF149 | Smash proxy (ball/head) | OP010 | ball/head speed | P7 | TARGET | CON-007 |
| VF150 | Strike Location (face) | OP003 | CLUBHEAD,BALL | P7 | TARGET | CON-004/005/003 |

---

## 10. Feature → Node 매핑 파일 (feature_map 확장)

DOH의 `feature_map.csv`(설문 Feature→Node) **동일 구조**로 Vision Feature를 추가한다:

```
vision_feature_map.csv
feature_id, node_id, weight, phase, confidence_source, note
VF020, MOT-012, 0.8, P4, vision_pose, "X-Factor at top"
VF031, OBS-004, 0.7, P1-P4, vision_pose, "lateral head sway"
VF031, PAT-002, 0.6, P1-P4, vision_pose, "sway pattern evidence"
VF078, OBS-019, 0.7, P7, vision_club, "forward shaft lean (needs club)"
...
```
- **설문 + 영상이 같은 node_id로 수렴** → DOH가 교차검증(confidence↑).
- 단일 VF는 근거(evidence). Node 확정은 DOH의 복수조합 규칙(Arch 금기 4).

---

## 11. 커버리지 요약

| 카테고리 | VF 수 | 클럽 필요 | MVP 측정 |
|---|---|---|---|
| Address P1 | 12 | 0 | ✅ 전부 |
| Backswing | 28 | 2 | ✅ 대부분 |
| Transition | 16 | 1 | ✅ 대부분 |
| Downswing | 18 | 5 | ◐ 포즈분 OK |
| Impact | 24 | 10 | ◐ 포즈분 OK |
| Release/Finish | 12 | 1 | ✅ 대부분 |
| Global/Tempo | 15 | 0 | ✅ 전부 |
| Structure-inferred | 10 | 0 | △ 약신뢰 |
| Club/Ball | 15 | 15 | ✕ 2차 |
| **합계** | **150** | **34** | **~110 MVP 측정 가능** |

> **결론:** 150 VF 중 **약 110개가 포즈만으로 MVP 측정 가능**(클럽 불필요).
> DOH의 MOT/OBS/PAT Node 대부분을 영상만으로 근거 공급 가능. 클럽 34개(BF/CON/임팩트
> 클럽)는 2차 객체검출 단계로 명확히 분리됨.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (SPEC DRAFT) |
| Feature 수 | 150 (VF001~VF150) |
| MVP 측정가능(포즈만) | ~110 |
| 상위 | Technical Arch v1.1 · Primitive/Operator/Coordinate Spec |
| 연결 | golf_knowledge_graph 159 nodes / vision_feature_map.csv |
| 다음 산출물 | MediaPipe PoC (영상→표준관절→CSV) |
| 상태 | 프로 검토 대기 |

*150개 Feature가 전부 기존 Primitive×Operator×Phase 조합이다. 새 계산 로직은 없다.*
*Vision은 사실을 공급한다. 의미의 판단은 DOH가 한다.*
