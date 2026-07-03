# DOH Vision · 단일 영상 3D 회전 복원 접근 v1.0

> **결정:** 브라우저 2D로는 회전 절대각을 못 잰다(원리적 한계, v18/v19에서 확인).
> **단일 영상 → SMPL 3D 바디 복원**으로 흉곽/골반 회전을 실제 각도로 복원한다.
> 목표 기간 1개월, 프로토타입 검증 → 파이프라인 승격.

---

## 0. 문제 재정의 (왜 브라우저가 실패했나)
- 정면(FO) 스윙에서 몸통 회전은 **카메라 깊이(z) 방향**으로 일어난다.
- MediaPipe world landmarks의 z는 **단일프레임 근사**라 깊이 회전을 못 살린다 → 백스윙탑 흉곽 **-19°**.
- 2D 너비 축소(acos) 방식(v18/v19)도 실제 영상에선 MediaPipe가 어깨를 '그럴듯하게' 벌려 찍어 폭이 충분히 안 줄어듦 → 벽.
- **결론:** "방법(수식)"이 아니라 **입력 3D 품질**이 문제. 3D를 제대로 복원하면 같은 수식으로 회전이 나온다.

## 1. 접근 (2-Tier 유지)
| Tier | 실행 | 회전 | 상태 |
|---|---|---|---|
| **A (브라우저)** | analyzer2.html · MediaPipe | 근사·참고용(v20에서 정직화) | 유지 |
| **B (서버/Colab)** | monocular 3D(SMPL) 모델 | **실제 각도** | 이번 신규 |

Tier-B가 회전·정밀 kinematics 담당. Tier-A는 즉시성/상대지표(스웨이·템포·무릎·샤프트) 담당.

## 2. 모델 선택
근거: monocular 3D HPE 서베이(2025) + 골프 특화 평가 논문(아래 출처).

| 모델 | 특징 | 회전 적합 | 실행성 |
|---|---|---|---|
| **WHAM** (2024) ★1순위 | 비디오→월드정렬 SMPL, 시간축·발접촉·카메라 융합, in-the-wild SOTA | 높음(글로벌+관절 회전) | **공식 Colab** |
| **HybrIK** | twist-swing 분해로 관절 회전 직접 추정 | 높음(회전 특화) | 중 |
| **4D-Humans / HMR2.0** | 강건한 image→SMPL, 트래킹 | 중~높 | 데모 있음 |
| MediaPipe world(현행) | 경량 | 낮음(깊이 약함) | 브라우저 |

**전략:** WHAM 먼저 검증 → 부족하면 HybrIK/4D-Humans 비교. 최후에 2카메라.

### 회전 추출 수식 (SMPL → 각도)
- SMPL-24: pelvis=0, spine1=3, spine2=6, spine3=9, L/R_hip=1/2, L/R_shoulder=16/17.
- **골반 회전** = 골반선(hip L−R) 3D 벡터를 수직축⟂평면에 투영한 azimuth, 어드레스(P1) 대비.
- **흉곽 회전** = 어깨선(shoulder L−R) 동일 방식. (또는 spine3 글로벌 회전의 yaw)
- **X-Factor** = 흉곽 − 골반.
- 수직축은 데이터에서 추정(평균 어깨중심−골반중심)해 좌표 규약 비의존.
- 구현·검증: `pose3d_poc/wham_golf_rotation.py` (합성 90°→90° 복원 확인).

## 3. 정직한 기대치 (리스크)
- 선행연구: **현행 monocular 3D도 골프 정밀 kinematics엔 오차가 크다**(out-of-the-box 부적합)는 평가 존재.
  그래서 **Phase 1에서 실제 영상으로 반드시 검증**하고 숫자를 실측/브라우저와 3자 대조한다.
- WHAM은 그중 최상급 → 회전 '크기/패턴'은 쓸만할 가능성이 높다. 절대각 ±오차는 캘리브레이션으로 보정.
- 최종 안전망: 안 되면 정면+측면 2카메라 삼각측량(가장 정확, 촬영방식 변경).

## 4. 1개월 로드맵
- **주차 1 — 검증(가장 중요):** WHAM Colab로 형 스윙(정면/측면) 추론 → `wham_golf_rotation.py`로 회전 추출.
  판정: 백스윙탑 흉곽 60~90°? X-Factor 사람스러운가? 실측/브라우저와 대조.
- **주차 2 — 모델 비교/보정:** WHAM vs HybrIK vs 4D-Humans 동일영상 대조. 최적 1개 선정 + 오차 캘리브레이션(스케일/오프셋).
- **주차 3 — 파이프라인:** 영상 업로드 → (RTMPose 2D+)3D 모델 → 회전/척추/시퀀스 Feature → `doh.vision.v1` JSON. P구간 검출은 기존 로직 연동.
- **주차 4 — 통합/배포:** Tier-B를 서버(또는 배치 Colab/API)로. Tier-A(analyzer2)에 "정밀 회전은 Tier-B" 링크/병기. 문서·검증표 정리.

## 5. 판정 기준
| Phase 1 결과 | 결정 |
|---|---|
| 탑 흉곽 60~90°, 패턴 정상 | ✅ WHAM 승격 → 주차 2~4 진행 |
| 40~60°, 부호/패턴은 맞음 | 🟡 캘리브레이션으로 보정 시도 |
| 30° 이하 or 패턴 붕괴 | 🔴 HybrIK/4D-Humans → 안 되면 2카메라 |

## 6. 산출물
- `pose3d_poc/wham_golf_rotation.py` — SMPL→회전 추출(검증됨)
- `pose3d_poc/wham_golf_rotation.ipynb` — Colab 실행 노트북
- `pose3d_poc/README.md` — 실행 가이드
- (기존) `analyzer2.html` v20 — 브라우저 회전 정직화

## 출처
- Monocular 3D HPE 서베이(2025): https://www.mdpi.com/1424-8220/25/8/2409
- WHAM (CVPR 2024): https://github.com/yohanshin/WHAM · 공식 Colab: https://colab.research.google.com/drive/1ysUtGSwidTQIdBQRhq0hj63KbseFujkn
- 골프 monocular 3D 평가: https://www.scirp.org/journal/paperinformation?paperid=148105 · https://www.researchgate.net/publication/367366882
- GolfPose(IEEE): https://ieeexplore.ieee.org/document/9859415 · GolfDB: https://arxiv.org/pdf/1903.06528
- SMPL: https://smpl.is.tue.mpg.de
