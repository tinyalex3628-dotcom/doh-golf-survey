# DOH Vision PoC — MediaPipe Pose → 분석

**Project C · Tier-A 브라우저 클라이언트 · 설문 엔진과 독립 구동**
서버 없이 브라우저에서 온디바이스 실행.

## 파일 3개 (단계별)
| 파일 | 하는 일 | 근거 문서 |
|---|---|---|
| `index.html` | 영상 → 33관절 → DOH 표준관절 → **CSV** (좌표추출만) | Technical Arch [1][2] |
| `analyzer.html` | + 지표 시계열 + **P1/P3/P4/P5/P7/P10 자동검출** + 구간별 Δ° | Feature Spec |
| `analyzer2.html` | **+ 샤프트 추적(OpenCV Hough) → P2/P6/P8까지 = P1~P10 전구간** + 구간별 샤프트각 | Event & Shaft Detection Method v1.0 |

> **analyzer2.html 가 최신·최강.** 스윙 올리면 P1~P10 자동검출 + 샤프트각 + 구간별 부위 변화.
> 샤프트각은 **DTL(측면) 영상에서만** 신뢰(P2/P6/P8 = 샤프트 지면평행 정의).

---

## (index.html) 영상 → 33 관절 → DOH 표준관절 → CSV

## 무엇을 하나
- `@mediapipe/tasks-vision`(WASM)로 업로드 영상의 프레임별 **33 keypoint** 추출
- 스켈레톤 실시간 오버레이 + 평균 visibility/추정 fps 표시
- **Pose Adapter**(Technical Arch §4)로 33 → DOH 표준관절(LEAD/TRAIL_*) 매핑
- 두 종 CSV 내보내기:
  - `doh_pose_landmarks.csv` — 33 관절 raw (2D normalized + z)
  - `doh_standard_joints.csv` — DOH 표준관절 (2D + world 3D + handedness/view)

## 책임 경계 (딱 여기까지)
이 PoC는 **좌표 추출**만 한다. 파이프라인 [1]Frame Sampler ~ [2]Pose Adapter 단계.
- ❌ 좌표계 정렬(BODY/GROUND) — Coordinate System Spec 단계
- ❌ Primitive/Operator/Feature 계산 — 각 Spec 단계
- ❌ Node/추론 — DOH(Project A)
> 즉 이 산출 CSV가 이후 Primitive Engine의 **입력**이 된다.

## 실행
브라우저 ES module + 외부 CDN(jsdelivr, google storage)을 쓰므로 로컬 파일 직접 열기(file://)로는
CORS/모듈 로딩이 막힐 수 있다. 간단한 정적 서버로 띄운다:

```bash
cd pose_poc
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

1. "영상 선택" → 골프 스윙 mp4 업로드
2. handedness(RH/LH) + view(DTL/FO) 지정  ← lead/trail 해석 기준
3. "분석 시작" → 스켈레톤 오버레이 + 프레임 카운트
4. "DOH 관절 CSV" 내보내기

## 알려진 한계 (정직하게)
- 브라우저 캡처 fps는 재생 성능에 좌우됨 → **정밀 분석은 서버 티어**(원본 프레임 디코딩)에서.
- MediaPipe world 3D는 단일 카메라 **근사**(Coordinate Spec §8, `depth_estimated`).
- 클럽/공은 안 잡힘(포즈 전용) — 객체검출은 2차 단계.
- 빠른 다운스윙/임팩트 구간 모션블러 시 visibility 하락 가능.

## 다음 단계
`doh_standard_joints.csv` → Coordinate Normalizer(BODY/GROUND 정렬) → Primitive Engine
→ Operator → Feature(VF###) → `doh.vision.v1` JSON → DOH.

## 모델 교체
`index.html`의 `modelAssetPath`를 `pose_landmarker_lite`(경량) 또는 `_heavy`(정밀)로 교체 가능.
서버 정밀 티어는 RTMPose로 교체해도 Pose Adapter 매핑만 추가하면 CSV 스키마 동일.
