# DOH Vision · 3D 회전 (Tier-B, 서버/Colab)

**Project C · Tier-B** — 브라우저(analyzer2, MediaPipe)가 못 재는 **회전 절대각**을
단일 영상에서 SMPL 3D 복원으로 뽑는다.

## 왜 이게 필요한가
브라우저 티어는 MediaPipe world z(단일프레임 깊이)가 약해 **정면 백스윙탑 흉곽이 -19°로 붕괴**한다.
2D 너비 트릭(v18/v19)으로도 이 벽을 못 넘었다 → 원리적 한계. (analyzer2 회전은 v20에서 '근사·참고용'으로 정직화)
해법은 **진짜 3D 복원**: SMPL 바디모델 + 시간축으로 깊이를 복원하는 monocular 3D 모델.

## 핵심 통찰
회전 수식은 브라우저와 **동일**(어깨선/골반선의 수직축 azimuth, 어드레스 대비).
**입력만** MediaPipe z → WHAM SMPL 3D 관절로 교체한다.
`wham_golf_rotation.py`는 합성 데이터로 검증됨: 어깨 90° 회전 → 90° 복원.

## 파일
| 파일 | 하는 일 |
|---|---|
| `wham_golf_rotation.py` | WHAM 결과 pkl → 흉곽/골반 회전량(도) + X-Factor + 그래프. `--check`로 배열 확인 |
| `wham_golf_rotation.ipynb` | Colab: WHAM 설치 → 스윙영상 추론 → 위 스크립트로 회전 추출·검증 |

## 모델 선택 (근거: DOH_Vision_3D_Rotation_Approach_v1.0.md)
- **1순위 WHAM** (2024, CVPR) — 비디오→월드정렬 SMPL, 시간축 융합. 회전 복원에 가장 적합. **공식 Colab 있음.**
- 비교군: **HybrIK**(twist-swing 분해, 회전 강함), **4D-Humans/HMR2.0**.
- 정직한 기대치: SOTA monocular 3D도 골프 정밀 kinematics엔 오차가 있다(선행연구). 그래서 **먼저 프로토타입 검증(Phase 1)** 후 승격.

## 실행 (요약)
1. `wham_golf_rotation.ipynb`를 Colab에서 열고 **런타임 GPU**.
2. WHAM 설치(SMPL 라이선스 등록 필요) → 스윙 mp4 업로드 → 추론.
3. `--check`로 pkl 확인 → P1/P4/P7 프레임 넣고 회전량 확인.
4. **백스윙탑 흉곽이 60~90°면 성공** → Tier-B 파이프라인으로.

## 판정 기준
| 결과 | 다음 |
|---|---|
| 탑 흉곽 60~90° | ✅ WHAM 승격, 서버 파이프라인 설계 |
| 20~30° 이하 | HybrIK/4D-Humans 비교 → 안 되면 2카메라 |

> 참고 출처는 `DOH_Vision_3D_Rotation_Approach_v1.0.md` 하단.
