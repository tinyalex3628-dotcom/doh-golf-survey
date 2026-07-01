# DOH Vision Event & Shaft Detection Method v1.0
**Project C — P1~P10 자동검출 + 샤프트 추적 방법론 (조사·학습 정리)**
*작성일: 2026-07-01 / 상태: METHOD DRAFT (프로 검토 전)*
*독립 시스템: 설문/질문 엔진과 분리. Vision 단독으로 완결 구동 목표.*

> 이 문서는 "P1~P10을 어떻게 정확히 자동검출하고, 샤프트를 어떻게 추적해 각도를
> 낼 것인가"를 **문헌 조사 근거로** 확정한다. 코드(`pose_poc/analyzer2.html`)의 설계 근거.

---

## 1. P1~P10 ↔ 학술 이벤트 정의 (근거 확정)

GolfDB(McNally 2019)는 **8 이벤트**를 정의한다. 각 정의의 "검출 신호"를 명시:

| P | 명칭 | GolfDB | **정확한 정의** | 검출 신호 | 필요 |
|---|---|---|---|---|---|
| P1 | Address | A | 셋업 정지 | 시작부 움직임 최소 | 포즈 |
| **P2** | Toe-up | TU | **샤프트가 지면과 평행 (백스윙)** | **샤프트 각도 ≈ 수평** | **샤프트** |
| P3 | Mid-backswing | MB | **팔이 지면과 평행 (백스윙)** | 리드팔 각 ≈ 수평 | 포즈 |
| P4 | Top | T | 클럽 방향전환(백→다운) | **손 높이 최고점** (손목 최저점 대비 torso) | 포즈 |
| P5 | Mid-downswing | MD | **팔이 지면과 평행 (다운)** | 리드팔 각 ≈ 수평 (탑 이후) | 포즈 |
| **P6** | (샤프트 평행 다운) | — | **샤프트가 지면과 평행 (다운)** | **샤프트 각도 ≈ 수평** | **샤프트** |
| P7 | Impact | I | 클럽헤드가 볼에 접촉 | **손 속도 최대 / 어드레스 높이 복귀** | 포즈(+볼) |
| **P8** | Mid-follow-through | MFT | **샤프트가 지면과 평행 (팔로우)** | **샤프트 각도 ≈ 수평** | **샤프트** |
| P9 | (리드팔 평행 팔로우) | — | 팔이 지면과 평행 (팔로우) | 리드팔 각 ≈ 수평 | 포즈 |
| P10 | Finish | F | 피니시 정지 | 끝부 움직임 최소 | 포즈 |

**핵심 결론:**
- **포즈만으로 검출: P1, P3, P4, P5, P7, P9, P10** (7개) — 손 높이·속도·리드팔 각.
- **샤프트가 있어야 검출: P2, P6, P8** (3개) — "샤프트 지면 평행"이 정의 자체.
- → **샤프트 추적을 붙이면 P1~P10 전 구간이 열린다.** (기존 analyzer는 7개, v2는 10개 목표)

---

## 2. 포즈 기반 이벤트 검출 알고리즘 (검증된 규칙)

2024~2025 연구에서 **손목 수직좌표 기반 규칙**이 유효함이 확인됨
(95% 이벤트를 5프레임 이내 검출; 손목/힙 속도 극값 + 어깨회전 임계).

### 2.1 신호 준비
```
handY[t]  = mid(LEAD_WRIST, TRAIL_WRIST).y   (0=위, 1=아래)
handV[t]  = |Δ position| / Δt                 (손 속도)
leadArm[t]= angle(LEAD_WRIST - LEAD_SHOULDER vs 수평)
→ 모두 이동평균 스무딩 (모션블러/포즈노이즈 완화, 문헌 권고)
```

### 2.2 앵커 검출 (순서 중요)
```
P4 Top    = argmin(handY) in [0.1n, 0.85n]        # 손 최고점 (가장 견고한 앵커)
P1 Address= argmax(handY[0..Top])                 # 탑 이전 손 최저(셋업)
P7 Impact = Top 이후, handY가 어드레스 높이로 복귀하는 첫 프레임
            (보조: 그 부근 handV 최대) 
P10 Finish= Impact 이후 팔로우 상승 뒤 안정 구간
```

### 2.3 보간 이벤트 (팔 평행)
```
P3 = [P1..P4] 중 |leadArm| < 12° 첫 프레임   (백스윙 팔 수평)
P5 = [P4..P7] 중 |leadArm| < 12° 첫 프레임   (다운 팔 수평)
P9 = [P7..P10] 중 |leadArm| < 12° 첫 프레임  (팔로우 팔 수평)
```

### 2.4 신뢰도
- 각 이벤트에 `confidence` + `method`(pose_rule) 기록.
- fps 낮거나(≤30) 모션블러 크면 P7 주변 오차↑ → 고fps 권장(120+).

---

## 3. 샤프트 추적 방법 (측면/DTL 전제)

문헌 근거: golftracker(수동 그립 지정 후 추적), **Hough 변환 기반 샤프트 라인 검출**
(움직이는 픽셀 → 선분 검출 → 샤프트 후보 선택), OpenCV HoughLinesP.

### 3.1 왜 DTL(측면)에서만 의미있나
- 샤프트 각도(Vertical Swing Plane)는 **비구선 뒤(DTL)에서 촬영**해야 스윙 플레인이 보인다.
- 정면(FO)에서는 샤프트가 카메라를 향해/멀어져 투영이 왜곡 → 각도 신뢰 불가.
- 드라이버 스윙플레인 참고값 ≈ 45~50°(임팩트). → 이 범위 상식 체크로 이상치 필터.

### 3.2 프레임별 샤프트 검출 파이프라인
```
1) 그립점 = mid(LEAD_WRIST, TRAIL_WRIST)  (포즈에서, 무료·안정)
2) ROI = 그립 중심, 한 변 ≈ 어깨폭×3 박스 (샤프트가 있을 범위)
3) 전처리: grayscale → (선택)프레임차 모션마스크 → Canny 엣지
4) HoughLinesP → 후보 선분들
5) 필터: 한 끝점이 그립 근처(반경 r) & 길이 상위 & 직전 프레임 샤프트와 각도 연속
6) 샤프트 벡터 = 그립 → 먼 끝점.  각도 = atan2 vs 수직
7) 실패 프레임: 직전값 보간 + flag shaft_lost (특히 임팩트 모션블러)
```

### 3.3 샤프트 기반 이벤트 (P2/P6/P8)
```
샤프트 각도 shaftV[t] (0°=수직, 90°=수평) 계산 후:
P2 = [P1..P4] 중 shaftV ≈ 90°(수평) 첫 프레임   (백스윙 toe-up)
P6 = [P4..P7] 중 shaftV ≈ 90° 첫 프레임          (다운 샤프트 평행)
P8 = [P7..P10] 중 shaftV ≈ 90° 첫 프레임         (팔로우)
```
→ 이로써 **P1~P10 전 10구간** 자동 마킹 가능(DTL 영상 기준).

### 3.4 한계 (정직하게)
- **모션블러:** 다운스윙~임팩트 구간 샤프트는 흐려져 Hough 실패 잦음 → 240fps 권장, 보간.
- **배경 잡선:** 문틀/벽선이 오검출 → 모션마스크 + 그립근접 필터로 완화, 완벽하진 않음.
- **정밀도:** Hough 각도는 ±수도 오차. 절대 스윙플레인 정밀값 아님 → 상대·경향 우선.
- **정면(FO):** 샤프트 각도 신뢰 불가 → FO에서는 P2/P6/P8 생략, 포즈 7개만.
- **정밀 궤적/클럽헤드:** 진짜 클럽헤드 점 추적은 YOLO 학습 모델이 더 안정(2차).

---

## 4. 정확도 로드맵 (지금 → 나중)

| 단계 | 방법 | P검출 | 샤프트 | 정밀도 |
|---|---|---|---|---|
| **지금(v1)** | 포즈 규칙 | P1/3/4/5/7/9/10 (7) | ✕ | 중 |
| **v2(이번)** | 포즈규칙 + Hough 샤프트 | **P1~P10 (10)** | ○ 근사 | 중 |
| v3 | + 좌표계 정렬(BODY/GROUND) | 10 | ○ | 중상 |
| v4(서버) | **SwingNet 학습**(GolfDB) + YOLO 클럽 | 10 정밀 | ◎ | 상 |

- **SwingNet(딥러닝)** 은 서버 Python 학습이 필요(브라우저 불가). GolfDB 1,400영상 기반
  76.1% 8-이벤트 정확. 최고 정밀은 이 경로.
- **브라우저 규칙+Hough(v2)** 는 학습 없이 즉시 동작하는 실용 버전. 오차 감수, 경향 파악용.
- 두 경로 모두 **동일 출력(P index + 샤프트각)** 을 내면 상호 교체 가능(Technical Arch 계약).

---

## 5. 출처
- [GolfDB: A Video Database for Golf Swing Sequencing (CVPRW 2019)](https://openaccess.thecvf.com/content_CVPRW_2019/papers/CVSports/McNally_GolfDB_A_Video_Database_for_Golf_Swing_Sequencing_CVPRW_2019_paper.pdf)
- [Eight events in a golf swing sequence (figure)](https://www.researchgate.net/figure/Eight-events-in-a-golf-swing-sequence-Top-face-on-view-Bottom-down-the-line-view-The_fig1_333984159)
- [Dynamic Golf Swing Analysis Framework (Sensors 2025)](https://www.mdpi.com/1424-8220/25/22/7073)
- [Extracting proficiency differences via single-video markerless motion analysis (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10684732/)
- [golftracker (PyPI) — grip/heel/toe tracking](https://pypi.org/project/golftracker/0.0.7/)
- [OpenCV Hough Line Transform](https://docs.opencv.org/3.4/d9/db0/tutorial_hough_lines.html)
- [Shaft angle as predictor of horizontal delivery plane (J. Sports Sci 2024)](https://www.tandfonline.com/doi/full/10.1080/14763141.2024.2315253)
- [What is Swing Plane — Trackman](https://www.trackman.com/blog/golf/what-is-swing-plane)

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (METHOD DRAFT) |
| 구현 대상 | pose_poc/analyzer2.html (v2) |
| 독립성 | 설문 엔진과 분리, Vision 단독 구동 |
| 상태 | 프로 검토 대기 |

*P2·P6·P8은 정의상 "샤프트 지면 평행"이다. 샤프트를 추적하는 순간 P1~P10이 완성된다.*
