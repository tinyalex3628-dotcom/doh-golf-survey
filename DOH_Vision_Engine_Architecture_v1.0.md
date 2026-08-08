# DOH Vision Engine Architecture v1.0
**Project C — 골프 영상 분석 엔진의 책임 범위와 출력 인터페이스 정의**
*작성일: 2026-07-01 / 상태: ARCHITECTURE DRAFT (프로 검토 전)*

> 이 문서는 "Feature를 몇 개 만들까"를 정하는 문서가 **아니다.**
> **Vision Engine이 어디까지 책임지고, 무엇을 뱉는가(출력 JSON)**를 고정하는 문서다.
> 이 인터페이스가 고정되면 내부 엔진(MediaPipe / RTMPose / YOLO / OpenPose)은
> 언제든 교체 가능하고, DOH는 단 한 줄도 바뀌지 않는다.
> **AI는 좌표를 주는 센서다. DOH의 자산은 그 좌표를 의미로 바꾸는 지식 계층이다.**

---

## 0. 이 문서가 고정하는 것 (Scope of this document)

| 고정한다 (This doc) | 고정하지 않는다 (Later docs) |
|---|---|
| Vision Engine의 **책임 경계** (어디서 끝나는가) | 개별 Feature 150+개 상세 정의 → *Vision Feature Spec v1.0* |
| 처리 **파이프라인 7단계** | 각 Feature의 계산식 → *Geometry Calculator Spec v1.0* |
| **출력 JSON 스키마 v1.0** (DOH와의 계약) | 실제 코드 구현 → *MediaPipe PoC* |
| 엔진 **교체 가능성 원칙** (engine-agnostic) | P Event 검출 모델 학습 → *Event Detection Spec* |
| **Vision Capability Matrix** (엔진별 측정 가능성 프레임) | |
| Feature → Node **연결 규약** (loose coupling) | |

**핵심 원칙 한 문장:** *Vision Engine은 `영상 → JSON`까지만 책임진다. 그 JSON을
DOH가 받아 추론한다. 둘은 JSON 스키마 하나로만 연결되고, 그 외엔 서로를 모른다.*

---

## 1. 프로젝트 분리 (4-Project Separation)

DOH 생태계는 4개의 독립 프로젝트로 분리한다. 각자 독립적으로 발전하고, 서로
**계약(인터페이스)으로만** 연결된다.

```
┌─────────────────────┐   ┌─────────────────────┐
│  Project B          │   │  Project C          │
│  Survey Engine      │   │  Vision Engine  ★이 문서
│  (설문 → Feature)   │   │  (영상 → Feature)   │
└──────────┬──────────┘   └──────────┬──────────┘
           │  Observation JSON        │  Vision JSON
           │  (Feature 수집)          │  (Feature 수집)
           └────────────┬─────────────┘
                        ▼
           ┌─────────────────────────┐
           │  Project A              │
           │  DOH Knowledge Graph    │
           │  (Node/Chain/Archetype  │
           │   추론 엔진)  159 nodes │
           └────────────┬────────────┘
                        │  Diagnosis JSON
                        ▼
           ┌─────────────────────────┐
           │  Project D              │
           │  Coach Report           │
           │  (결과 출력)            │
           └─────────────────────────┘
```

| 프로젝트 | 책임 | 계층 (Architecture v1.0) | 산출 |
|---|---|---|---|
| **A. DOH KG** | Node/Chain/Cluster/Archetype 추론 | Inference | Diagnosis |
| **B. Survey** | 골퍼 체감을 Feature로 수집 | Observation | Observation JSON |
| **C. Vision** ★ | 영상을 Feature로 수집 | Observation | **Vision JSON** |
| **D. Report** | 추론 결과 표현 | Presentation | Report |

> **Project B와 C는 형제다.** 둘 다 Observation 계층을 채운다. 수단만 다를 뿐
> (설문 vs 영상) 산출물은 똑같이 "Feature"다. 그래서 두 JSON은 **동일한 Feature
> 어휘(vocabulary)**를 공유해야 하고, DOH는 둘을 같은 Node에 융합할 수 있다.
> — 이것이 DOH의 결정적 강점: *체감(설문) + 측정(영상)의 교차검증.*

---

## 2. Vision Engine 책임 범위 (Responsibility Boundary)

가장 중요한 절. **무엇을 하고, 무엇을 하지 않는가.**

### 2.1 IN-SCOPE (Vision Engine이 한다)
- 영상 입력 수신 및 전처리 (프레임 추출, 회전/해상도 보정, 촬영방향 분류)
- 스윙 이벤트 시점 검출 (P1~P10 프레임 인덱스)
- 인체 포즈 추정 (관절 좌표)
- 장비 검출·추적 (클럽헤드/샤프트/공) — *2차 단계*
- 좌표 → 기하 계산 (각도/거리/속도/시퀀스)
- **DOH Feature 어휘로 매핑된 측정값 + confidence 산출**
- 측정 품질/신뢰도/에러요인 기록
- **표준 Vision JSON 출력**

### 2.2 OUT-OF-SCOPE (Vision Engine이 하지 않는다 — DOH의 몫)
- ❌ **원인 추론** ("스웨이 → 슬라이스" 같은 인과) → Inference 계층 (금기 1·2·6)
- ❌ Node 활성화 판단 (어떤 Feature 조합이 Node를 켜는가)
- ❌ Cluster/Archetype/Diagnosis 생성
- ❌ 교정 방향·드릴 제안
- ❌ 회원에게 보여줄 Report 문구 생성

> **경계선:** Vision Engine의 출력은 항상 *"관찰된 사실값"*이다.
> `spine_angle_at_P1 = 38.2°, confidence 0.91` 은 OK.
> `"자세가 나쁨" / "슬라이스 원인"` 은 절대 금지. 그건 DOH가 판단한다.

### 2.3 왜 이 경계가 중요한가
엔진(MediaPipe→RTMPose→미래모델)이 바뀌어도 **출력 JSON 스키마와 Feature 어휘가
같으면 DOH는 무사하다.** 만약 Vision이 원인 추론까지 하면, 엔진 교체 시 DOH의
지식 계층까지 재검증해야 한다. → 분리가 곧 유지보수성이자 경쟁력.

---

## 3. 처리 파이프라인 (7 Stages)

```
[0] 영상 입력 (mp4 / 60~240fps / 정면 or DTL)
        │
        ▼
[1] 전처리 (Preprocess)
    프레임 추출 · 회전/해상도 정규화 · 촬영방향 분류(FO/DTL)
        │
        ▼
[2] 이벤트 검출 (Event Detection)  ── "언제"
    P1(Address)…P7(Impact)…P10(Finish) 프레임 인덱스 + confidence
        │
        ▼
[3] 포즈 추정 (Pose Detection)  ── "몸이 어디"
    프레임별 관절 좌표 (2D + 3D world) + visibility
        │
        ▼
[4] 객체 검출·추적 (Object Detection)  ── "클럽·공이 어디"  [2차]
    클럽헤드/샤프트/공 좌표 + 추적(Kalman/광류)
        │
        ▼
[5] 기하 엔진 (Geometry Engine)  ── 좌표를 각도/거리/속도로
    관절각 · 벡터각 · 회전량 · 궤적 · 속도 · 시퀀스
        │
        ▼
[6] Feature 추출 (Feature Extraction)  ── DOH 어휘로 매핑
    각 측정값 → VF### Feature + phase + confidence + error_flags
        │
        ▼
[7] 출력 (Output)
    표준 Vision JSON  →  DOH(Project A)로 전달
```

### 각 단계의 계약 (입력 → 출력, 교체 가능 엔진)

| # | 단계 | 입력 | 출력 | 교체 가능 엔진 (engine-agnostic) |
|---|---|---|---|---|
| 1 | 전처리 | 원본 영상 | 정규화 프레임 + 촬영방향 | OpenCV / ffmpeg |
| 2 | 이벤트 검출 | 프레임 시퀀스 | P1~P10 인덱스 | SwingNet / 포즈-규칙 / 하이브리드 |
| 3 | 포즈 추정 | 프레임 | 관절 좌표 | **MediaPipe / RTMPose / YOLO-Pose / MoveNet** |
| 4 | 객체 검출 | 프레임 | 클럽/공 좌표 | YOLO11 / YOLO26 |
| 5 | 기하 엔진 | 좌표 + 이벤트 | 각도/속도/궤적 | *DOH 자체 (엔진 무관, 순수 수학)* |
| 6 | Feature 추출 | 기하값 | VF### Feature | *DOH 자체 (Feature Spec 기반)* |
| 7 | 출력 | Feature 집합 | Vision JSON | *스키마 고정* |

> **핵심:** 3·4단계만 "AI 모델"이고 교체 대상이다. **5·6·7단계는 DOH의 자산**이며
> 엔진과 무관한 순수 로직이다. 여기가 DOH가 지켜야 할 진짜 재산이다.

---

## 4. 좌표계 추상화 (Landmark Abstraction) — 교체 가능성의 열쇠

엔진마다 랜드마크 규격이 다르다. 이것을 **DOH 표준 관절 어휘**로 흡수하는 어댑터를
둔다. 그래야 5단계(기하 엔진) 이후가 엔진을 전혀 몰라도 된다.

| DOH 표준 관절 | MediaPipe (33) | RTMPose/COCO (17) | YOLO-Pose (17) |
|---|---|---|---|
| LEAD_SHOULDER | 11 or 12 | 5 or 6 | 5 or 6 |
| TRAIL_SHOULDER | 12 or 11 | 6 or 5 | 6 or 5 |
| LEAD_ELBOW | 13/14 | 7/8 | 7/8 |
| LEAD_WRIST | 15/16 | 9/10 | 9/10 |
| LEAD_HIP | 23/24 | 11/12 | 11/12 |
| TRAIL_HIP | 24/23 | 12/11 | 12/11 |
| LEAD_KNEE | 25/26 | 13/14 | 13/14 |
| LEAD_ANKLE | 27/28 | 15/16 | 15/16 |
| NOSE/HEAD | 0 | 0 | 0 |

> `lead/trail`은 오른손잡이/왼손잡이에 따라 좌우가 바뀌므로 **논리적 이름**으로
> 추상화한다(왼손 인덱스 하드코딩 금지). 이 어댑터 계층 = **Pose Adapter**.
> 새 엔진 추가 = Pose Adapter 매핑 한 개 추가로 끝. 기하 엔진은 안 건드린다.

```
MediaPipe 출력 ─┐
RTMPose 출력  ──┼─▶ [Pose Adapter] ─▶ DOH 표준 관절 어휘 ─▶ [Geometry Engine]
YOLO 출력     ──┘        (엔진별 매핑)      (엔진 무관)         (엔진 무관)
```

---

## 5. 출력 인터페이스 — Vision JSON Schema v1.0 ★

**이 문서의 심장.** Vision Engine과 DOH를 잇는 유일한 계약.
버전이 붙고, append-only로 진화한다(기존 필드 의미 재사용 금지 — KG 원칙과 동일).

```jsonc
{
  "schema": "doh.vision.v1",              // 계약 버전
  "generated_at": "2026-07-01T09:00:00Z",

  // ── 1) 무엇을 어떤 엔진으로 봤는가 (재현성/교체추적) ──
  "source": {
    "video_id": "swing_0001",
    "handedness": "right",                // right | left  (lead/trail 해석 기준)
    "camera_view": "DTL",                 // FO(정면) | DTL(후면) | SIDE | unknown
    "fps_declared": 240,
    "fps_effective": 240,                 // 메타 검증된 실제 fps
    "resolution": [1080, 1920],
    "duration_frames": 1920
  },
  "engines": {                            // 어떤 모델이 값을 만들었나 (교체 이력)
    "pose": { "name": "mediapipe_pose_landmarker", "variant": "heavy", "version": "0.10.x" },
    "event": { "name": "swingnet", "version": "golfdb-baseline" },
    "object": null                        // 아직 클럽/공 미탐지면 null
  },

  // ── 2) 언제 무슨 일이 있었나 (P1~P10) ──
  "swing_events": [
    { "p": "P1",  "name": "Address",  "frame": 120, "confidence": 0.97, "method": "pose_rule" },
    { "p": "P4",  "name": "Top",      "frame": 372, "confidence": 0.88, "method": "swingnet" },
    { "p": "P7",  "name": "Impact",   "frame": 501, "confidence": 0.83, "method": "swingnet" },
    { "p": "P10", "name": "Finish",   "frame": 640, "confidence": 0.95, "method": "pose_rule" }
    // P2/P3/P5/P6/P8/P9 는 기하 보간(interpolated)일 수 있음 → method로 구분
  ],

  // ── 3) 원시 좌표 (선택; 대용량이면 참조로 분리 저장) ──
  "pose_track": {
    "landmark_space": "doh_standard",     // Pose Adapter로 정규화된 표준 어휘
    "coordinate": "normalized+world",     // 2D normalized + 3D world
    "storage": "inline",                  // inline | ref
    "ref": null,                          // storage=ref 이면 CSV/parquet 경로
    "frames": [ /* [{joint, x, y, z, visibility}, ...] */ ]
  },

  // ── 4) DOH Feature (★ DOH가 실제로 소비하는 것) ──
  "features": [
    {
      "feature_id": "VF001",              // DOH Vision Feature 어휘 (엔진 무관!)
      "name": "Address Spine Angle",
      "value": 38.2,
      "unit": "deg",
      "phase": "P1",
      "landmarks_used": ["LEAD_SHOULDER","TRAIL_SHOULDER","LEAD_HIP","TRAIL_HIP"],
      "confidence": 0.91,                 // 값 자체의 신뢰도
      "error_flags": [],                  // ["low_visibility","motion_blur","off_axis_view"]
      "source_engine": "pose"
    },
    {
      "feature_id": "VF014",
      "name": "Head Lateral Sway (Backswing)",
      "value": 6.4,
      "unit": "cm_normalized",
      "phase": "P1->P4",
      "landmarks_used": ["NOSE","LEAD_ANKLE","TRAIL_ANKLE"],
      "confidence": 0.78,
      "error_flags": ["off_axis_view"],
      "source_engine": "pose"
    },
    {
      "feature_id": "VF031",
      "name": "Hip-Shoulder Separation (X-Factor) at Top",
      "value": 41.0,
      "unit": "deg",
      "phase": "P4",
      "landmarks_used": ["LEAD_SHOULDER","TRAIL_SHOULDER","LEAD_HIP","TRAIL_HIP"],
      "confidence": 0.72,
      "error_flags": [],
      "source_engine": "pose"
    }
  ],

  // ── 5) 이 영상 자체의 신뢰도 (DOH가 confidence 가중에 사용) ──
  "quality": {
    "overall_confidence": 0.84,
    "mean_visibility": 0.88,
    "view_match": true,                   // 분석에 적합한 촬영방향인가
    "warnings": ["fps_may_be_interpolated"]
  }
}
```

### 5.1 스키마 설계 규칙 (불변 원칙)
1. **`feature_id`는 DOH 어휘다. MediaPipe 인덱스가 아니다.** 엔진이 바뀌어도
   `VF001`의 의미(Address Spine Angle)는 불변. → engine-independent.
2. **모든 feature는 `confidence`와 `error_flags`를 반드시 가진다.** 관찰의 품질을
   숨기지 않는다(Architecture Confidence 원칙).
3. **Vision은 Node를 언급하지 않는다.** `related_nodes`는 이 JSON에 없다.
   Feature→Node 매핑은 DOH의 소유(§7). Vision은 Node를 몰라야 교체 안전하다.
4. **append-only:** v1.1에서 필드 추가는 OK, 기존 `feature_id` 의미 변경은 금지
   (KG의 append-only 원칙과 동일 — 과거 추론 추적성 보존).
5. **부분 출력 허용:** 클럽 미탐지면 `object` 엔진 null, 해당 feature 생략.
   DOH는 "없는 것"과 "0인 것"을 구분한다.

---

## 6. Vision Capability Matrix (엔진별 측정 가능성)

"이 Feature, 지금 측정 가능한가?"를 한눈에. **어떤 엔진 조합이 필요한지**를 고정.
(대표 샘플 — 전체는 *Vision Feature Spec v1.0*에서 확장)

| Feature (예) | MediaPipe | RTMPose | YOLO-Pose | Club 검출 필요 | Ball 검출 필요 | 연결 Node(예) |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Spine Angle (P1) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-001/002, MOT-001 |
| Weight Distribution (P1) | △ | △ | △ | ✕ | ✕ | MOT-002, OBS-003 |
| Shoulder Turn (P4) | ✅ | ✅ | ✅ | ✕ | ✕ | MOT-006, OBS-026 |
| Hip Turn (P4) | ✅ | ✅ | ✅ | ✕ | ✕ | MOT-007 |
| X-Factor (P4) | ✅ | ✅ | ✅ | ✕ | ✕ | MOT-012 |
| Head Sway (P1→P4) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-004, PAT-002 |
| Loss of Posture (P1 vs P4/P7) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-009, PAT-012 |
| Early Extension (P5→P7) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-011, PAT-004 |
| Lead Knee Angle (P7) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-015, MOT-018 |
| Chicken Wing (P7→P8) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-016, PAT-008 |
| Hand Depth (P4) | ✅ | ✅ | ✅ | ✕ | ✕ | OBS-007, MOT-010 |
| Hand Speed (proxy) | ✅ | ✅ | ✅ | ✕ | ✕ | MOT-014, CAU-013 |
| **Shaft Lean (P7)** | ✕ | ✕ | ✕ | **✅** | ✕ | OBS-017/019, MOT-020 |
| **Club Path (in/out)** | ✕ | ✕ | △ | **✅** | ✕ | OBS-013/014/027 |
| **Clubface Angle (P7)** | ✕ | ✕ | ✕ | **✅** | ✕ | OBS-020/021, MOT-021 |
| **Club Head Speed** | ✕ | ✕ | △ | **✅** | ✕ | CAU-013 |
| **Ball Launch/Spin** | ✕ | ✕ | ✕ | ✕ | **✅** | BF-001~013, CON-* |

✅ 신뢰도 높음 · △ 근사/조건부 · ✕ 불가

**전략적 결론:**
- **포즈만으로 즉시 측정 가능한 Feature가 압도적으로 많다** (OBS/MOT/PAT 대부분).
  → MVP는 클럽 없이도 **강력한 진단 커버리지** 확보 가능.
- **클럽/페이스/볼탄도 계열(BF/CON, 임팩트 클럽 지표)은 별도 모델(YOLO+추적)이
  선행조건.** → 2차 단계로 명확히 분리. Capability Matrix가 이 선을 못박는다.

---

## 7. Feature → Node 연결 규약 (Loose Coupling)

**Vision은 Feature까지. Node 매핑은 DOH가 소유한다.** 연결은 단방향·느슨하게.

```
[Project C: Vision]                       [Project A: DOH KG]
  features[].feature_id  ───(매핑 테이블)──▶  node_id 활성화 규칙
  (VF001, VF014, ...)                         (OBS-009, MOT-012, ...)
        │                                             │
     Vision은 여기까지만 안다              DOH가 소유하는 매핑 (feature_map)
```

- 매핑 테이블(`VF### → node_id + weight + 조건`)은 **DOH 자산**이다. 이미 존재하는
  `feature_map.csv`(설문 Feature→Node)와 **같은 구조**로 Vision Feature를 추가한다.
  → 설문과 영상이 *같은 Node*에 꽂힌다. (예: OBS-009 Loss of Posture 를
  설문 체감 + 영상 측정 둘 다로 근거 확보 → confidence↑)
- **단일 Feature = 단일 Node 진단 금지.** DOH 원칙(복수 Observation)에 따라 Node
  활성화는 여러 Feature의 조합. Vision은 근거(evidence)를 공급할 뿐.
- Vision이 Node를 모르므로, Node 구조가 바뀌어도 Vision은 안 바뀐다(그 반대도 성립).

---

## 8. 배포 아키텍처 (Client/Server 분리)

책임 범위(§2)를 물리적으로 나누면:

| 티어 | 무엇 | 파이프라인 단계 | 엔진 |
|---|---|---|---|
| **Client (실시간)** | 촬영 가이드·미리보기 | 1·3 (거친 포즈) | MediaPipe.js / WASM, 모바일 SDK |
| **Server (정밀)** | 정식 Vision JSON 생성 | 1~7 전체 | RTMPose/MP-Heavy + YOLO + SwingNet |

- Client는 "잘 찍혔나"만 판단(view_match, visibility). **Feature 확정은 Server.**
- 같은 `schema: doh.vision.v1`를 두 티어가 공유. Client는 부분(features 일부)만 채움.
- Server가 최종 Vision JSON을 확정해 DOH로 전달.

---

## 9. 로드맵 (문서·구현 순서)

사용자 확정 우선순위 반영:

| 순위 | 산출물 | 유형 | 상태 |
|---|---|---|---|
| 0 | **Vision Engine Architecture v1.0** (이 문서) | 문서 | ✅ 초안 |
| 1 | **Vision Feature Spec v1.0** (VF### 150+, 계산식/랜드마크/Node) | 문서 | ▶ 다음 |
| 2 | **Vision Capability Matrix (전체 확장)** | 문서 | §6 프레임 확립 |
| 3 | **Geometry Calculator Spec** (랜드마크 → Feature 수식) | 문서 | 대기 |
| 4 | **MediaPipe PoC** (영상 → 33 관절 → CSV) | 코드 | 대기 (2~3일) |
| 5 | **P Event Detection** (P1~P10 자동) | 코드 | 나중 |
| 6 | **Feature → Node 연결** (feature_map 확장) | 데이터 | 나중 |

> **왜 이 순서인가:** 스키마(0)와 Feature 정의(1)가 고정되면, 그 아래(계산기·PoC·
> 이벤트검출)는 전부 "이 계약을 만족시키는 구현"으로 병렬화된다. 엔진이 바뀌어도
> 0·1·2·3(DOH 자산)은 불변. 코드(4·5)만 갈아끼운다.

---

## 10. 설계 금기 (Vision Engine 전용)

| # | 금기 | 이유 |
|---|---|---|
| 1 | Vision이 **원인/진단**을 출력한다 | Observation↔Inference 계층 혼합 (Arch 금기 6) |
| 2 | Feature에 **Node 이름**을 박아 넣는다 | 교체 시 결합도 폭발. 매핑은 DOH 소유 |
| 3 | 엔진별 **랜드마크 인덱스**를 기하 엔진에 하드코딩 | 엔진 교체 불가능해짐 (§4 어댑터로 흡수) |
| 4 | `confidence`/`error_flags` 없이 값만 출력 | 관찰 품질 은폐 (Confidence 원칙 위반) |
| 5 | `feature_id` 의미를 **재사용/변경** | append-only 위반, 과거 추론 추적 불가 |
| 6 | 단일 Feature로 Node를 **확정** | 복수 Observation 원칙 위반 |
| 7 | Client(실시간)가 확정 Feature를 **단독 생성** | 정밀도 미보장. 확정은 Server |

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (ARCHITECTURE DRAFT) |
| 작성일 | 2026-07-01 |
| 상위 문서 | DOH Architecture v1.0 (§2 Vision AI, §6 AI Object) |
| 참조 자산 | golf_knowledge_graph v1.0.0 (159 nodes / feature_map.csv) |
| 선행 문서 | DOH AI Video Analysis Research v1.0 (엔진 조사) |
| 다음 산출물 | DOH Vision Feature Spec v1.0 (VF### 정의 + Node 매핑) |
| 상태 | 프로 검토 대기 |

*Vision Engine은 센서다. 센서는 사실을 잰다. 의미는 DOH가 만든다.*
*이 경계를 지키는 한, 어떤 AI 모델이 와도 DOH의 자산은 늙지 않는다.*
