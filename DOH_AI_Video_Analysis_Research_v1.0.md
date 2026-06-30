# DOH AI 비디오 분석 엔진 연구 v1.0
**골프 스윙 영상 분석 엔진 — 기술 조사 및 아키텍처 설계**
*DOH Architecture v1.0 의 "AI Object / Vision AI (Observation 계층)" 를 채우기 위한 연구 문서*
*작성일: 2026-06-30 / 상태: RESEARCH DRAFT (프로 검토 전)*

> 이 문서는 "어떤 엔진을 쓸지" 를 결정하기 위한 1차 기술 조사다.
> DOH 원칙에 따라 **영상 분석은 Observation 계층**이다. AI는 Feature(관찰값)만
> 생산하고, 원인 추론(Inference)은 기존 Cluster/Archetype 엔진이 담당한다.
> AI가 "원인"을 말하게 만들면 안 된다. (Architecture 금기사항 1·2·6)

---

## 0. 30초 결론 (TL;DR)

| 질문 | 결론 |
|---|---|
| 기반을 오픈 분석툴로? | **맞다.** 자체 포즈 모델 학습은 비효율. 검증된 오픈소스 위에 쌓는 게 정답. |
| MediaPipe면 충분한가? | **MVP는 충분.** 단, MediaPipe는 "몸(33 keypoint)"만 본다. 클럽/샤프트/공은 못 본다. |
| MediaPipe 말고 다른 건? | 있다. **RTMPose**(정확도↑), **YOLO11-Pose**(다인·통합), **MoveNet**(경량). 용도별로 다름. |
| 클럽/샤프트/헤드는? | 포즈 모델로 안 됨. **별도 객체검출(YOLO) + 추적(Kalman/광류)** 파이프라인 필요. |
| P1~P10 자동검출은? | **GolfDB/SwingNet** 계열 이벤트 검출 모델로 8~10 이벤트 시점 자동 검출. |
| 웹앱/앱에서 어떻게? | **2-티어.** ① 브라우저 실시간 미리보기(MediaPipe.js/WASM) ② 서버 정밀분석(Python). |
| 240fps는? | 임팩트 구간만 의미. 일반 분석은 60~120fps로 충분. 240fps는 클럽헤드/페이스용. |

**추천 1차 스택 (MVP):**
`MediaPipe Pose Landmarker(.js, 브라우저)` + `서버 정밀 재분석(RTMPose 또는 MediaPipe Heavy)` + `SwingNet 류 이벤트 검출` → DOH Feature 로 매핑.

**추천 2차 스택 (고도화):**
위 + `YOLO11 클럽/공 검출` + `클럽헤드 궤적 추적` + `(선택) CaddieSet 류 데이터로 볼탄도 상관 학습`.

---

## 1. 전체 파이프라인 (큰 그림)

영상 한 개가 들어와서 DOH Feature 가 나오기까지의 흐름:

```
[회원 업로드 영상 (mp4, 60~240fps)]
            │
            ▼
[1] 전처리 / 정규화
    - 프레임 추출, 해상도/회전 보정
    - 촬영 방향 분류 (정면 DTL / 후면 / 측면)   ← 분석 규칙이 방향마다 다름
            │
            ▼
[2] 스윙 이벤트 검출 (Temporal)      ← "언제" 무슨 일이 일어났나
    SwingNet/GolfDB 계열
    → P1(Address)…P7(Impact)…P10(Finish) 프레임 인덱스
            │
            ▼
[3] 인체 포즈 추정 (Spatial - 몸)    ← "몸"이 어디 있나
    MediaPipe / RTMPose / YOLO-Pose
    → 프레임별 33(또는 17) keypoint (x,y,z,visibility)
            │
            ▼
[4] 장비 검출·추적 (Spatial - 클럽/공)  ← "클럽·공"이 어디 있나
    YOLO11 객체검출 + Kalman/광류 추적
    → 클럽헤드 좌표, 샤프트 라인, 공 위치/궤적
            │
            ▼
[5] 피처 계산 (Geometry/Kinematics)   ← 각도·속도·시퀀스 수치화
    관절각, 척추각, 힙·숄더 회전, 클럽패스,
    템포(백스윙:다운스윙 비), 헤드스피드 추정 등
            │
            ▼
[6] DOH AI Object 매핑                ← Observation 계층 채우기
    각 수치 → video_features / pose_features + confidence
            │
            ▼
[7] (기존 DOH 엔진)  Cluster → Archetype → Report
    ※ 여기서부터는 Inference. AI는 관여하지 않는다.
```

**중요한 분리:** [2]는 "시간축"(언제), [3][4]는 "공간축"(어디). 둘은 별개 모델이고,
P1~P10 자동검출은 [2]의 문제다. 포즈 모델([3])이 P1~P10을 알려주지 않는다.

---

## 2. 포즈 추정 도구 비교 (인체 관절)

회원의 "몸"을 keypoint 로 바꾸는 핵심 엔진. 골프 진단의 80%는 여기서 시작한다.

| 도구 | keypoint | 강점 | 약점 | 웹/모바일 | DOH 적합도 |
|---|---|---|---|---|---|
| **MediaPipe Pose Landmarker** | 33 (+3D world) | 설치 쉬움, **브라우저/모바일 실시간**, 3D 월드좌표 제공, 무료 | 단일인 전제, 빠른 모션·옆모습서 흔들림, 정확도 중상 | ✅ JS/WASM, Android, iOS | ⭐⭐⭐⭐⭐ (MVP 1순위) |
| **RTMPose** (MMPose) | 17~133 | **정확도·속도 균형 최상**, Snapdragon 865서 70+FPS@72.2AP, 전신/손/발 | 파이프라인 무거움, 주로 Python/서버 | △ 서버 권장 | ⭐⭐⭐⭐ (서버 정밀분석) |
| **YOLO11-Pose** (Ultralytics) | 17 | **다인 강함**, 검출+포즈 통합, 클럽검출과 같은 프레임워크로 묶기 좋음 | keypoint 수 적음(17), 3D 약함 | △ 서버/엣지 | ⭐⭐⭐⭐ (장비검출과 통합 시) |
| **MoveNet** (TF) | 17 | 초경량, 엣지/모바일 최적 | 단일인, 정밀도 보통 | ✅ TF.js | ⭐⭐⭐ (저사양 대안) |
| **OpenPose** | 25/135 | 역사적 표준, 다인 | 무겁고 느림, 라이선스(상업 제약) | ✗ | ⭐⭐ (비추천) |

**벤치마크 메모 (조사된 수치):**
- 골프 영상에서 **MediaPipe Pose 평균 정확도(mean OKS 0.636) > YOLO-Pose(0.604)** — 단, YOLO가 분산이 더 낮아(예측 일관성↑) 안정적.
- **RTMPose-s: COCO 72.2 AP @ 70+FPS(모바일)** — 정확도/속도 균형에서 MediaPipe·MoveNet 상회.

**DOH 결론:**
1. **브라우저 실시간 미리보기 = MediaPipe.js** (즉시 피드백, 서버 비용 0)
2. **서버 정밀 재분석 = RTMPose 또는 MediaPipe Heavy** (Report용 정확도 확보)
3. → 같은 영상을 "빠른 1패스(클라)" + "정밀 2패스(서버)" 로 이중 처리하는 전략.

---

## 3. 골프 특화 오픈소스 / 데이터셋

범용 포즈 위에 "골프 도메인 지식"을 얹은 자산들. 바닥부터 만들 필요 없다.

### 3.1 이벤트 검출 (P1~P10의 핵심)
- **GolfDB + SwingNet** (McNally 외, 라이선스 확인 필요)
  - 1,400개 라벨링 스윙 영상 DB. 이벤트 프레임/바운딩박스/클럽종류/촬영방향 라벨.
  - **SwingNet** = MobileNetV2 + 양방향 LSTM. RGB 시퀀스 → 이벤트 확률 시퀀스.
  - 성능: 8개 이벤트 평균 **76.1%** 정확, 8개 중 6개는 **91.8%**.
  - GitHub: `wmcnally/golfdb` — DOH P1~P10 검출의 **출발 베이스라인**으로 강력 추천.

### 3.2 스윙-볼탄도 상관 데이터셋 (2025 최신)
- **CaddieSet** (CVPRW 2025, `damilab/CaddieSet`)
  - 단일 스윙 영상을 **8 스윙 페이즈로 분할** + 관절정보 추출.
  - 도메인 전문가 기반 **15개 핵심 스윙 지표** 정의.
  - 8명/924샷, 카메라 런치모니터로 Distance·Carry·DirectionAngle·SpinAxis·BallSpeed 등 **볼 정보 페어링**.
  - DOH 의미: "스윙 자세 → 볼 결과" 상관을 정량 학습한 사례. **Feature 정의·검증의 레퍼런스**.

### 3.3 참고 구현 (GitHub, MIT/교육용 다수 — 구조 참고용)
- `wmcnally/golfdb` — SwingNet 베이스라인 (이벤트 검출)
- `ryanboscobanze/GolfPosePro` — MediaPipe + 손목궤적 + 페이즈 분할 + 슬로모 디버그 영상
- `HeleenaRobert/golf-swing-analysis` — MediaPipe Pose로 관절각·축 오버레이
- `mamoonik/golf-swing` — 6단계 스윙 자세교정
- Roboflow `golf-club-tracking` — **클럽헤드 추적용 공개 데이터셋(YOLOv5~v11 지원)**

> ⚠️ **라이선스 주의:** 상업 서비스(DOH 회원 대상)에 넣기 전 각 repo/데이터셋
> 라이선스를 반드시 확인. GolfDB·CaddieSet은 연구용 조건이 붙을 수 있음.
> 모델 가중치는 직접 학습하거나 상업 가능 라이선스로 대체.

---

## 4. P1~P10 자동 검출 방법

골프 P-System(자세 체크포인트)을 영상에서 자동으로 잡는 방법.

### 4.1 P-System ↔ GolfDB 8-event 매핑
GolfDB/SwingNet 은 8 이벤트를 검출한다. 이를 10단계 P-System에 매핑:

| P | 명칭 | GolfDB 8-event | 검출 난이도 |
|---|---|---|---|
| P1 | Address (어드레스) | Address | 쉬움 (정지) |
| P2 | 샤프트 지면 평행 (테이크어웨이) | Toe-up | 중 |
| P3 | 리드암 지면 평행 | (Mid-backswing) | 중 |
| P4 | 백스윙 탑 | Top | 중 (정지점) |
| P5 | 리드암 지면 평행 (다운) | (Mid-downswing) | 어려움 (빠름) |
| P6 | 샤프트 지면 평행 (다운) | — | 어려움 |
| **P7** | **임팩트** | Impact | **가장 중요/가장 빠름** |
| P8 | 샤프트 지면 평행 (팔로우) | Mid-follow-through | 어려움 |
| P9 | 리드암 지면 평행 (팔로우) | — | 중 |
| P10 | 피니시 | Finish | 쉬움 (정지) |

> GolfDB는 8개, P-System은 10개. P3/P5/P6/P8/P9 일부는 **샤프트 각도/관절각의
> 기하 조건**으로 보간 검출이 가능하다(예: "샤프트가 지면과 평행한 첫 프레임").
> 즉 [2]모델로 앵커 이벤트(Address/Top/Impact/Finish)를 잡고, [4]장비추적으로
> 나머지 P를 기하적으로 채우는 **하이브리드**가 현실적.

### 4.2 검출 접근법 3가지
1. **딥러닝 시퀀스 모델 (권장 메인):** SwingNet 류. RGB 시퀀스 → 이벤트 확률.
2. **포즈 시계열 + 규칙:** keypoint 각속도/방향전환점으로 Top/Impact 검출(손목 최저점, 속도 0교차 등). 모델 없이도 Address/Top/Finish는 잡힘.
3. **장비 기반:** 샤프트 각도가 0°/평행이 되는 프레임 → P2/P6/P8 등. [4] 추적 결과 활용.

**DOH 권장:** 1번(앵커) + 2·3번(보간)을 합친 하이브리드. confidence를 P별로 따로 기록.

---

## 5. 클럽 · 샤프트 · 클럽헤드 추적

**핵심 사실: MediaPipe/RTMPose 같은 인체 포즈 모델은 클럽을 전혀 못 본다.**
클럽은 "인체 keypoint"가 아니라 별도 객체이므로 **독립 파이프라인**이 필요하다.

### 5.1 클럽헤드 / 공 검출
- **방법:** YOLO 계열 객체검출(YOLO11/YOLO26)로 클럽헤드·공을 프레임마다 탐지.
- **자산:** Roboflow `golf-club-tracking` 공개 데이터셋(YOLOv5~v11). 공은 CNN+Kalman 추적 연구 다수.
- **공 추적 사례:** Ultralytics YOLO로 공 검출 후 프레임별 위치 → 비행/낙하/속도·발사각·스핀 추정.

### 5.2 샤프트(라인) 인식
- 클럽헤드는 점, 샤프트는 **선분**. 접근:
  - (a) 클럽헤드 + 손(그립, 포즈의 wrist keypoint) 두 점을 잇는 선으로 근사 → 가장 싸고 견고.
  - (b) **선분 검출**(Hough/LSD) 또는 세그멘테이션으로 샤프트 픽셀 직접 추출 → 정밀하나 흔들림/모션블러에 약함.
  - (c) 키포인트 회귀: "그립–헤드" 2점을 회귀하는 소형 모델 학습.
- **DOH 권장:** (a) 그립(wrist)–헤드 선 근사로 시작. 샤프트 각도(샤프트 plane, 평행 시점)는 이 선으로 충분히 계산 가능.

### 5.3 추적(Tracking) — 검출만으로 부족한 이유
- 빠른 다운스윙(특히 임팩트 전후)에서 클럽헤드는 **모션블러로 사라지거나 늘어진다**.
- 대응: **Kalman 필터 / 광류(optical flow)** 로 검출 누락 프레임을 보간. 240fps가 여기서 효과.
- 클럽헤드 궤적 → **클럽 패스(in-to-out/out-to-in), 어택앵글, 헤드스피드(픽셀→실거리 캘리브레이션 필요)** 산출.

> ⚠️ 헤드스피드·실거리 추정은 **카메라 캘리브레이션(픽셀↔미터)**, 촬영거리/렌즈
> 왜곡에 매우 민감. MVP에서는 절대값보다 **상대 지표/시퀀스/각도**에 집중 권장.

---

## 6. 240fps / 고프레임 영상 처리

### 6.1 프레임레이트별 용도 (조사 기준)
| fps | 용도 | 비고 |
|---|---|---|
| 30 | 부적합 | 임팩트 1~2프레임에 압축, 분석 불가 |
| 60 | 자세/페이즈 분석 최소선 | Address~Finish 흐름 OK |
| **120** | **권장 기본** | 스윙 전반·다운스윙 무난 |
| **240** | **임팩트·클럽페이스** | 헤드/페이스 블러 최소, 클럽추적 정밀 |
| 480~960 | 임팩트 극정밀 | 충돌순간 전용, 데이터 큼 |

- 충격(임팩트) 디테일은 본래 **500+fps**가 이상적이나, 스마트폰 현실선은 240fps.
- 스마트폰 240fps는 보통 1080p, 일부는 720p로 떨어지거나 보간(가짜 프레임)일 수 있음 → **메타데이터로 실제 fps 검증** 필요.

### 6.2 처리상 고려
- 240fps 8초 = 1,920 프레임. 전부 포즈추정하면 무겁다 → **이벤트 구간만 고밀도, 나머지는 다운샘플**.
- 클라이언트 실시간(MediaPipe.js)은 보통 24~30fps 처리 → **240fps 정밀분석은 서버로**.
- 저장/업로드: 원본 240fps는 용량 큼. **업로드 시 구간 트리밍 + 서버 디코딩**.

**DOH 권장:** 회원 업로드는 120fps 기본 권장, 임팩트 정밀 옵션만 240fps.
대부분의 DOH Feature(척추각·회전·템포·P시퀀스)는 120fps로 충분.

---

## 7. DOH 아키텍처 통합 (Observation 계층)

### 7.1 절대 원칙 재확인
- 영상 AI는 **Observation 수단**일 뿐(Architecture §2 표). Node 구조는 안 바뀐다.
- AI 출력은 **Feature(사실값)** 이다. 원인/교정은 절대 출력하지 않는다(금기 1·2).
- AI Object는 Node를 **서비스**할 뿐, Node 코어 필드를 수정하지 않는다(금기 7).

### 7.2 AI Object 필드 매핑 (Architecture §6)
기존 AI Object 스키마에 영상 분석 산출물을 그대로 흘려넣는다:

| AI Object 필드 | 영상 엔진이 채우는 내용 (예) |
|---|---|
| `video_features` | P1~P10 프레임 인덱스, 템포비, 클럽패스 방향, 샤프트 평행 시점, 헤드궤적 |
| `pose_features` | 척추각, 힙 회전, 숄더 회전, 리드암 각, 무릎각, 머리 변위(스웨이) |
| `confidence_rules` | 포즈 visibility 평균, 이벤트 검출 확률, 촬영방향 적합도, 모션블러 정도 |
| `future_sensor_mapping` | 압력판/IMU와 교차검증할 동일 시점 매핑 키 (P7 등) |
| `coach_notes` | 코치가 AI 수치를 보고 남기는 관찰 메모 (여전히 Observation) |

### 7.3 Feature → Node 활성화 (기존 엔진이 담당)
- AI가 만든 video/pose feature가 Node의 `feature_links`/`activation_rules`(Inference Object)에 연결.
- 예: "P4(탑)에서 척추각 과신전 + P7 머리 변위 큼" 같은 **복수 관찰 조합**이 모여야 Cluster가 발화(금기 4: 단일 Node로 진단 금지).
- **설문 Observation + 영상 Observation 융합**: 같은 Node를 설문(체감)과 영상(측정) 둘 다로 관찰 → confidence 상승. 이게 DOH의 강점.

> 핵심: 영상 AI를 붙여도 **Inference 구조(Node/Cluster/Archetype)는 그대로**.
> AI는 Observation 입력 채널을 하나 더 늘릴 뿐이다.

---

## 8. 웹앱 / 앱 배포 아키텍처

"내 웹앱이나 앱에서 어떻게 쓰나" — 2-티어 권장.

### 8.1 티어 A — 클라이언트 실시간 (즉시 피드백)
- **MediaPipe Tasks Vision (`@mediapipe/tasks-vision`, WASM)**
  - 브라우저에서 `FilesetResolver.forVisionTasks()` → WASM 런타임 다운로드 → **서버 없이 온디바이스** 포즈 추정.
  - 33 keypoint(2D normalized + 3D world) 출력. 카메라 스트림/업로드 영상 모두 처리.
  - 모바일 앱: MediaPipe Android/iOS SDK 또는 RN/Flutter 래퍼.
- **용도:** 촬영 가이드(정렬/방향 OK?), 실시간 스켈레톤 오버레이, 즉석 거친 피드백.
- **장점:** 서버비 0, 프라이버시(영상 미전송 옵션), 지연 없음.
- **한계:** 클럽/공 못 봄, 240fps 정밀 불가, 기기 성능 편차.

### 8.2 티어 B — 서버 정밀 분석 (Report 생성)
- **Python 백엔드:** RTMPose(MMPose) 또는 MediaPipe Heavy + YOLO11(클럽/공) + SwingNet(이벤트).
- 업로드 영상 → 큐(비동기 작업) → 전체 파이프라인(§1) → DOH Feature JSON → 엔진.
- **용도:** P1~P10 정밀 검출, 클럽추적, 정식 Report용 확정 수치.
- **장점:** 무거운 모델/240fps/GPU 활용, 일관된 정확도.
- **한계:** 영상 업로드(용량/시간), 서버 비용, 비동기 UX 설계 필요.

### 8.3 권장 흐름 (회원 경험)
```
회원이 앱에서 촬영
   │
   ├─(티어 A) 실시간 스켈레톤 + "방향 좋아요/다시 찍기" 가이드   ← 즉시
   │
   ▼ 업로드
(티어 B) 서버 정밀 분석 (수초~분, 비동기)
   │
   ▼
DOH Feature 생성 → 기존 엔진(Cluster/Archetype)
   │
   ▼
Report (설문 결과 + 영상 측정 융합)  ← 회원/코치에게 표시
```

### 8.4 기술 선택 요약
| 레이어 | 1순위 | 이유 |
|---|---|---|
| 브라우저 실시간 | MediaPipe.js / WASM | 서버리스, 검증됨, 3D 제공 |
| 모바일 앱 | MediaPipe SDK (Android/iOS) | 동일 모델, 네이티브 성능 |
| 서버 포즈 | RTMPose (또는 MP Heavy) | 정확도/속도 균형 최상 |
| 서버 장비검출 | YOLO11 | 클럽/공, 통합 프레임워크 |
| 이벤트 검출 | SwingNet 류 | 골프 특화 베이스라인 존재 |
| 추적 | Kalman + 광류 | 모션블러 보간 |

---

## 9. 단계별 로드맵 (실행 제안)

| 단계 | 목표 | 산출물 | 핵심 리스크 |
|---|---|---|---|
| **P0 검증** | MediaPipe.js로 스윙 영상 1개 keypoint 추출되는지 PoC | 브라우저 데모, 스켈레톤 오버레이 | 옆모습/빠른모션 흔들림 |
| **P1 이벤트** | GolfDB/SwingNet으로 P1·P4·P7·P10 앵커 검출 | 4개 핵심 P 프레임 자동 마킹 | 라이선스, 도메인 일반화 |
| **P2 피처** | 포즈+이벤트로 척추각·회전·템포 등 N개 Feature 산출 | DOH AI Object JSON 스키마 채움 | 캘리브레이션, 노이즈 |
| **P3 융합** | 설문 Observation + 영상 Observation → 동일 Node 교차검증 | confidence 상승 Report | Feature↔Node 매핑 설계 |
| **P4 장비** | YOLO 클럽/공 검출 + 헤드궤적 → 클럽패스/샤프트각 | 클럽 기반 Feature 추가 | 모션블러, 실거리 환산 |
| **P5 고도화** | 240fps 임팩트, 헤드스피드, (선택) 볼탄도 상관 | 정밀 임팩트 분석 | 비용, 정밀도 한계 |

**가장 빠른 가치:** P0→P1→P2 만 해도 "설문 + 영상 측정" 융합 Report가 나온다.
클럽추적(P4)은 어렵고 비싸므로 **인체 포즈 기반 Feature를 먼저 완성**하는 게 ROI 최고.

---

## 10. 한계 · 리스크 (정직하게)

| 항목 | 리스크 | 완화 |
|---|---|---|
| 단일 카메라 2D | 깊이/회전 정보 손실, 3D 추정은 근사 | 촬영방향 표준화(DTL+정면 2뷰), 3D world 보조 |
| 촬영 환경 편차 | 조명/배경/거리/흔들림으로 정확도 출렁 | 촬영 가이드(티어 A), 품질 confidence 기록 |
| 빠른 모션 | 다운스윙·임팩트서 포즈/클럽 흔들림 | 고fps + 추적 보간, 앵커+보간 하이브리드 |
| 실거리 환산 | 헤드스피드/거리 절대값 부정확 | 절대값 자제, 상대/각도/시퀀스 우선 |
| 라이선스 | 연구용 데이터셋 상업 사용 제약 | 라이선스 검토, 자체 데이터/상업 모델 대체 |
| 계층 침범 위험 | AI가 "원인"을 말하려는 유혹 | **금기 1·2·6 강제**: AI는 Feature만 |
| 프라이버시 | 회원 신체 영상 업로드 | 온디바이스 옵션, 보관/동의 정책 |

---

## 11. 다음 액션 (제안)

1. **PoC 결정:** P0(MediaPipe.js 브라우저 데모)부터 즉시 착수 — 코스트 거의 0.
2. **샘플 영상 확보:** 회원 스윙 5~10개(정면/DTL, 60·120·240fps 섞어) → 모델별 정확도 실측.
3. **라이선스 검토:** GolfDB·CaddieSet·Roboflow 데이터셋 상업 가능 여부 확인.
4. **Feature 목록 1차 정의:** 영상에서 뽑을 pose/video feature를 DOH Feature Dictionary와 매핑(어떤 Node와 연결?).
5. **AI Object JSON 스키마 확정:** §7.2 표를 실제 스키마(v1.x)로 고정.

> 이 문서가 검토·승인되면, 다음 산출물은
> **"DOH Vision Feature Spec v1.0"** (영상에서 뽑을 Feature 정의 + Node 매핑) 이다.

---

## 12. 출처 (조사 근거)

**포즈 추정 / MediaPipe**
- [Pose landmark detection guide for Web — Google AI Edge](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
- [@mediapipe/tasks-vision — npm](https://www.npmjs.com/package/@mediapipe/tasks-vision)
- [Advanced Golf Swing Analysis Using MediaPipe and ML — Springer (2026)](https://link.springer.com/chapter/10.1007/978-981-96-6291-3_24)
- [On the Utility of Pose Estimation Models for Golf Swing Understanding — SCIRP](https://www.scirp.org/journal/paperinformation?paperid=148105)
- [RTMPose: Real-Time Multi-Person Pose Estimation — OpenReview](https://openreview.net/pdf?id=STxmh1ZLOI)
- [RTMPose — OpenMMLab (Medium)](https://openmmlab.medium.com/rtmpose-the-all-in-one-real-time-pose-estimation-solution-for-application-and-research-6404f17cd52f)
- [YOLOv7 Pose vs MediaPipe — LearnOpenCV](https://learnopencv.com/yolov7-pose-vs-mediapipe-in-human-pose-estimation/)
- [Best Pose Estimation Models & How to Deploy — Roboflow](https://blog.roboflow.com/best-pose-estimation-models/)

**골프 이벤트 검출 / 데이터셋**
- [GolfDB: A Video Database for Golf Swing Sequencing — arXiv 1903.06528](https://arxiv.org/abs/1903.06528)
- [GolfDB / SwingNet — GitHub wmcnally/golfdb](https://github.com/wmcnally/golfdb)
- [CaddieSet — arXiv 2508.20491 (CVPRW 2025)](https://arxiv.org/abs/2508.20491)
- [CaddieSet — GitHub damilab/CaddieSet](https://github.com/damilab/CaddieSet)

**클럽 / 공 추적**
- [Tracking golf balls using Ultralytics YOLO — Ultralytics](https://www.ultralytics.com/blog/tracking-golf-balls-using-ultralytics-yolo-models)
- [golf-club-tracking dataset — Roboflow Universe](https://universe.roboflow.com/club-head-tracking/golf-club-tracking/dataset/2)
- [Efficient Golf Ball Detection and Tracking (CNN + Kalman) — arXiv 2012.09393](https://ar5iv.labs.arxiv.org/html/2012.09393)

**오픈소스 구현 참고**
- [GolfPosePro — GitHub ryanboscobanze](https://github.com/ryanboscobanze/GolfPosePro)
- [golf-swing-analysis — GitHub HeleenaRobert](https://github.com/HeleenaRobert/golf-swing-analysis)

**프레임레이트 / 영상**
- [Why Frame Rates Matter — CoachNow](https://coachnow.com/blog/why-frame-rates-matter)
- [Speed Calculator for Video Analysis — TopEndSports](https://www.topendsports.com/biomechanics/video-analysis-speed.htm)

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (RESEARCH DRAFT) |
| 작성일 | 2026-06-30 |
| 상위 문서 | DOH Architecture v1.0 (§2 Vision AI, §6 AI Object) |
| 다음 산출물 | DOH Vision Feature Spec v1.0 (영상 Feature 정의 + Node 매핑) |
| 상태 | 프로 검토 대기 |

*영상 AI는 Observation 채널을 하나 더 여는 일이다. Inference 구조(Node/Cluster/Archetype)는 변하지 않는다. 이 원칙이 깨지면 DOH가 아니다.*
