# DOH Vision Engine v2 업그레이드 — 조사·채택·로드맵
**"AI 별로네" 소리 안 듣기 위한 정확도 총력전. 단일 카메라 한계 안에서 짜낼 수 있는 것 전부.**
*작성일: 2026-07-24 / 적용: `pose3d_poc/wham_golf_rotation.py` (build_v1 내부 → 콜랩·집PC·HF Space 동시 적용)*

## 1. 이번에 적용한 것 (GPU 없이 증명 완료) ✅

### ① 시간축 스무딩 — NLF 저자 공식 레시피 이식
- **출처:** [isarandi/nlf-pipeline](https://github.com/isarandi/nlf-pipeline) — NLF 저자가 비디오용으로 직접 만든
  파이프라인의 핵심이 "median-like temporal smoothing". 우리는 median(5)+평균(3)으로 이식(`smooth_joints`).
- **증명(합성+NLF급 노이즈 8mm+스파이크 2%):** 회전 3종 절대오차 합 **10.2°→5.4° (47%↓)**,
  프레임간 지터 **10.4→3.6mm (2.9배↓)**, P4/P7 검출 동등 이상.
- 비용: 노이즈 0의 인공 삼각피크에서 ~2° 피크 감쇠(실제 스윙은 탑에서 속도가 0이라 영향 미미).

### ② 회전 = 축회전 분해 (X-Factor 과대의 근본 수정)
- **문제:** 기존은 어깨선을 지면에 투영한 azimuth 차 → 탑에서 어깨가 가파르게 기울면(측면기울임 ~25°+)
  투영이 부풀어 X-Factor 58~88° 같은 과대값. (실측에서 계속 관찰되던 그 버그.)
- **수정:** 생체역학 표준(K-VEST 계열)대로 분해 —
  골반턴=수직축 azimuth(골반은 수평 유지라 안전) / **X-Factor=그 프레임 몸통축⊥평면에서 어깨선↔힙라인 축회전** /
  어깨턴=골반턴+X-Factor. (`axial_turn_series`)
- **증명(GT 아는 합성: 굽힘40°+측면기울임25°+비틀림−67°):** X-Factor 오차 **5.9°→0.0°**, 어깨턴 11.0°→5.1°.
  안전판: 굽힘 0° 세계에서 신구 방식 차이 0.00°(회귀 없음).
- 실영상 기대: X-Factor가 클래식 범위(~40~55°)로 내려올 것. **임계값(seed) 재보정은 실측 후.**

### ③ up축 = 발목-PCA 우선 (`best_up`)
- 기존 rotation.py는 몸통평균 up(굽힘 40°만큼 기울어짐) → 골반턴 ~5° 왜곡(합성 확인).
- metrics.py의 발목-PCA up(합성 오차 <0.2°)을 회전 계산에도 공유. 품질 낮으면 몸통평균 폴백.
- 2패스 구조: 몸통평균으로 이벤트 먼저 → 어드레스~임팩트 구간으로 발목-PCA 재추정 → 최종 회전.

**회귀:** 계약 스키마 PASS(FO/DTL) · 문제판정 동일(스웨이·행잉백·치킨윙 감지 유지) · py_compile OK.
**계약 무변경** — 전부 엔진 내부. 같은 VF, 더 정확한 값.

## 2. 다음 카드 (GPU/실측 단계에서 — 우선순위순)

| # | 무엇 | 왜 | 근거 | 난이도 |
|---|---|---|---|---|
| 1 | **SwingNet 이벤트 융합** | P구간을 휴리스틱→학습망으로. 1400개 골프영상 학습, 8이벤트. **계약이 이미 `method:"swingnet"/"hybrid"` 예약** — 스키마 무변경 | [GolfDB/SwingNet](https://arxiv.org/abs/1903.06528) 76.1% (±1프레임 91.8%/6이벤트) | 중 (MobileNetV2, CPU 가능) |
| 2 | **NLF-ViTg 교체** | 저자가 v0.3.2 릴리즈노트에 예고한 DINOv2 백본 후속. 나오면 파일 교체만(TorchScript) | [nlf releases](https://github.com/isarandi/nlf/releases) 감시 | 하 (URL 교체) |
| 3 | **GVHMR 병행 평가** | 비디오 시간축 프라이어 + **중력방향 직접 추정**(up축 문제 원천 해결). WHAM 대비 월드오차 28%↓, 1430프레임 0.28초 | [GVHMR](https://github.com/zju3dv/GVHMR) (SIGGRAPH Asia 24, TPAMI 26) | 중상 (파이프라인 별도) |
| 4 | **클럽/샤프트 검출** | P2/P6/P8 + 샤프트각/플레인 — 우리가 못 재는 마지막 큰 덩어리. club_model/ 준비돼 있음 | 기존 계획(2차) | 상 |
| 5 | NLF 불확실도 → confidence | NLF가 불확실도 내면 feature confidence를 실측 기반으로 | 출력 키 미확인 — 콜랩에서 `--check`로 확인 필요 | 하 |

## 3. 정직한 한계 (바꿔도 안 되는 것)
- **Z-깊이:** 단일 카메라 물리 한계. GVHMR로도 "추정"일 뿐. → 뷰-게이팅 유지가 정답.
- **축 비틀림(손목/전완):** 업계도 센서(HackMotion)로 우회. 영상 단독 불가 유지.
- **절대 스케일:** 축회전 수정으로 크게 개선 예상되나, **실영상 대조 전까지 임계값은 seed.**

## 4. 검증 명령 (재현)
```
python3 scratchpad/proof_axial.py     # 축회전 GT 증명 (오차 5.9→0.0)
python3 scratchpad/gen_synth.py out.json FO && python3 schema/validate.py out.json
```
