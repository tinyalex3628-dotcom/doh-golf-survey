# DOH Vision Coordinate System Spec v1.0
**Project C — Vision Engine 좌표계 정의 · 변환 · view-invariance 확정**
*작성일: 2026-07-01 / 상태: SPEC DRAFT (프로 검토 전)*
*상위: DOH Vision Technical Architecture v1.1 §3 ([3] Coordinate Normalizer)*

> Technical Architecture v1.1이 선언했다: **"Primitive는 좌표계 위에서만 존재한다."**
> 이 문서는 그 좌표계들을 **수학적으로 확정**한다. 좌표계가 잠기면 Primitive·Operator·
> Feature가 그 위에 안정적으로 쌓인다. 이 문서의 진짜 목적은 하나:
> **촬영 조건이 달라도 같은 스윙이면 같은 값이 나오게 한다 (view-invariance).**

---

## 0. 왜 이 문서가 먼저인가 (한 장 요약)

```
같은 스윙, 다른 카메라 위치
        │
        ▼
IMAGE 좌표에서 측정  →  값이 다 다름  →  영상 A vs B 비교 불가  ❌ (쓰레기값)
        │
        ▼
BODY / GROUND 좌표로 정렬 후 측정  →  같은 값  →  비교·진단 가능  ✅
```

- **회전·기울기·분리각(Turn, Tilt, X-Factor)** → **BODY 또는 GROUND** 에서만 의미.
- **위치·거리·변위(Sway, Hand Depth)** → **GROUND** (지면·중력 기준) 에서 정규화.
- **클럽 경로·페이스(Path, Face)** → **TARGET** (목표선 기준, 캘리브레이션 필요).
- **디버그·오버레이** → **IMAGE** (사람이 보는 화면).

> 좌표계 선택을 틀리면 뒤의 모든 Feature가 오염된다. 그래서 이게 §1(최상단)이다.

---

## 1. 좌표계 카탈로그 (7종)

| ID | 이름 | 차원 | 원점 | 축 정의 | 획득 |
|---|---|---|---|---|---|
| `CS0_PIXEL` | Image Pixel | 2D | 좌상단 | u→右, v→下 | 무료 (엔진 native) |
| `CS1_NORM` | Image Normalized | 2D | 좌상단 | [0,1]×[0,1] | 무료 (÷해상도) |
| `CS2_WORLD` | Pose World | 3D | 골반중심 근사 | 엔진 정의 (MP world) | 저 (엔진 제공, 근사) |
| `CS3_CAMERA` | Camera | 3D | 카메라 광심 | 광축 z | 고 (intrinsics 필요) |
| `CS4_GROUND` | Ground | 3D | 지면 투영점 | z=중력↑, xy=지면 | 중 (수직·지면 추정) |
| `CS5_BODY` | Body | 3D | PELVIS_CENTER | 신체 정렬 (§3) | 중 (관절로 구성) |
| `CS6_TARGET` | Target | 3D | 볼 위치 | x=목표선 | 고 (캘리브레이션) |

**의존 그래프 (무엇이 무엇에서 파생되는가):**
```
CS0_PIXEL ──÷해상도──▶ CS1_NORM ──2D→3D 리프트*──▶ CS2_WORLD
                                                      │
                                        ┌─────────────┼──────────────┐
                                        ▼             ▼              ▼
                                   CS4_GROUND     CS5_BODY       CS6_TARGET
                                   (중력정렬)     (신체정렬)      (목표선정렬)
                                                                     │
                                                            CS3_CAMERA (intrinsics 시)
* 단일 카메라 리프트는 근사 → 모든 3D 좌표계에 depth_estimated 성격 상속
```

---

## 2. 2D 좌표계 (CS0, CS1) — 무료·정확하지만 view-dependent

### 2.1 CS0_PIXEL
- 정의: 픽셀 `(u, v)`, 원점 좌상단, u→오른쪽, v→아래.
- 용도: **디버그·오버레이·클럽 검출 결과 표시.** 측정용 아님.
- 신뢰: 관측 자체는 정확(엔진 native). 단 해상도 의존.

### 2.2 CS1_NORM
- 정의: `x = u / W`, `y = v / H` → `[0,1]`. 해상도 독립.
- 변환: `CS0 → CS1` 손실 없음 (`c_transform = 1.0`).
- 용도: 2D 각도·거리 중 **view-invariance가 불필요한 것** (예: 화면상 자세 체크, 촬영가이드).
- **한계(중요):** 2D는 **깊이가 없다.** 카메라가 정면(FO)이냐 후면(DTL)이냐에 따라
  같은 회전이 전혀 다른 2D 투영으로 보인다. → **회전량을 CS1에서 재면 안 된다.**

> **판단 규칙:** "화면에서 이렇게 보인다"는 CS1. "실제로 몇 도 돌았다"는 CS4/CS5.

---

## 3. CS5_BODY — view-invariance의 핵심 ★

카메라가 어디 있든, **골퍼의 몸 자체를 기준**으로 삼으면 회전·분리각이 동일하게 나온다.

### 3.1 BODY 좌표축 구성 (관절로부터)
```
원점 O   = PELVIS_CENTER = mid(LEAD_HIP, TRAIL_HIP)

x축 (좌우) = HIP_LINE 방향 = normalize(LEAD_HIP - TRAIL_HIP)
y축 (상하) = 척추 방향   = normalize(THORAX_CENTER - PELVIS_CENTER)   // ≈ TORSO_AXIS
           단, y를 x에 직교화(Gram-Schmidt): y ← normalize(y - (y·x)x)
z축 (전후) = x × y  (정면 바깥 방향)
```
- 이 3축은 **정규직교(orthonormal) 프레임**. 회전행렬 `R_body = [x | y | z]`.
- 임의 벡터 v를 BODY로: `v_body = R_bodyᵀ · (v_world - O)`.

### 3.2 왜 이게 view-invariant인가
- 어깨선(SHOULDER_LINE)을 BODY 프레임에서 재면, 카메라 위치와 무관하게
  **골반 대비 어깨의 상대 회전**만 남는다 → 이게 X-Factor의 정의 자체.
- 즉 **X-Factor, Shoulder Turn, Hip Turn, Spine Tilt는 CS5_BODY의 시민.**

### 3.3 BODY 좌표계의 한계
- 관절(hip/shoulder) 자체가 흔들리면 축도 흔들림 → confidence는 관절 visibility 상속.
- **골반이 회전의 기준이므로**, 골반 자체가 병진(슬라이드)한 양은 BODY로는 안 보인다
  → **병진(Sway/Slide)은 CS4_GROUND에서 측정**(역할 분담).

> **역할 분담 원칙:** 회전=BODY, 병진=GROUND. 둘을 한 좌표계로 재려 하지 않는다.

---

## 4. CS4_GROUND — 병진·기울기의 기준

### 4.1 정의
```
z축 = 중력 반대(위).  추정: VERTICAL(영상 y 역방향) 또는 IMU/수평선 보정.
xy평면 = 지면.  추정: 양 발목(LEAD/TRAIL_ANKLE) + 무게중심 투영.
원점 = 스탠스 중앙의 지면 투영점.
```
- 용도: **Head Sway, Weight Shift, Hand Depth(수직성분), Turn 투영면(GROUND_NORMAL).**
- Turn 계산 시 SHOULDER_LINE/HIP_LINE을 **지면에 투영(projection)** 후 회전량 측정.

### 4.2 정규화 (스케일 불변)
- 거리값은 **STANCE_LINE 길이로 정규화**(예: `sway = displacement / stance_width`).
- → 카메라 거리·골퍼 키에 무관한 무차원 값. `unit: "stance_ratio"`.

### 4.3 한계
- 중력축(z) 추정 오차 = 카메라 기울임(tilt) 오차. 삼각대 수평 안 맞으면 flag `tilted_camera`.
- 단일 카메라에서 지면 평면 추정은 근사 → `ground_estimated` flag.

---

## 5. CS2_WORLD / CS3_CAMERA / CS6_TARGET — 3D 계열 (근사·캘리브레이션)

### 5.1 CS2_WORLD (Pose World)
- 엔진(MediaPipe world landmarks 등)이 주는 **근사 3D**. 원점 ~ 골반중심.
- **정직한 한계:** 단일 카메라 3D는 **추정**이다. 깊이(z)는 학습된 사전분포에 의존.
  → 모든 CS2 파생 값에 `depth_estimated` flag + `c_transform ≤ 0.9`.
- 용도: BODY/GROUND 축을 구성하는 **재료**. 최종 Feature를 CS2 raw로 내보내지 않음(BODY/GROUND로 정렬 후).

### 5.2 CS3_CAMERA
- 카메라 intrinsics(초점거리·주점)로 정의되는 정밀 3D.
- **MVP 범위 밖.** intrinsics 캘리브레이션이 필요 → v1.0에서는 미사용(null).

### 5.3 CS6_TARGET (Path / Face 전용)
- 원점=볼, x축=목표선, z=중력. **클럽 경로·페이스각의 유일한 올바른 기준.**
- 요구: 촬영방향(DTL) + 목표선 캘리브레이션(볼·타겟 지정 또는 자동 추정).
- **의존:** 클럽 객체검출(CLUB_VECTOR) + 캘리브레이션. → **2차 단계.** v1.0에서는 정의만, 값은 club 단계에서.

---

## 6. 좌표계 변환 표 (Transform + Confidence Loss)

각 변환은 **명시적 함수**이며 confidence 손실 계수 `c_transform`와 flag를 남긴다.

| From → To | 함수 | c_transform | flag |
|---|---|---|---|
| CS0 → CS1 | ÷ 해상도 | 1.00 | — |
| CS1 → CS2 | 2D→3D 리프트 (엔진 world) | 0.85 | `depth_estimated` |
| CS2 → CS4 | 중력·지면 정렬 | 0.90 | `ground_estimated` |
| CS2 → CS5 | 신체축 정렬 (§3.1) | 0.92 | — (관절 visibility에 의존) |
| CS2 → CS6 | 목표선 정렬 | 0.75 | `target_calibration` |
| CS2 → CS3 | intrinsics 역투영 | N/A(v1.0) | `requires_calibration` |

> 계수는 **초기 보수적 seed**다. PoC에서 실측(런치모니터/수동라벨 대조) 후 보정한다.
> 원칙: **불확실하면 낮게.** 과신(confidence 부풀리기)은 DOH 추론을 오염시킨다.

### 6.1 변환 체이닝 시 confidence
```
c_total = ∏ c_transform (경로상 모든 변환)
예) CS1 → CS2 → CS5 :  c = 0.85 × 0.92 = 0.782
flags = 경로상 모든 flag의 합집합
```

---

## 7. 촬영방향별 좌표계 신뢰도 (View × CS Matrix) ★

**같은 좌표계라도 촬영방향(FO 정면 / DTL 후면-비구선)에 따라 신뢰도가 다르다.**
Feature Spec은 각 VF가 "어느 view에서 신뢰 가능한지"를 이 표에서 가져온다.

| 측정 대상 | 권장 좌표계 | FO (정면) | DTL (후면) | 비고 |
|---|---|:---:|:---:|---|
| Shoulder/Hip Turn | CS5_BODY | ✅ | ✅ | 회전은 BODY서 view 견고 |
| X-Factor | CS5_BODY | ✅ | ✅ | 상동 |
| Spine Tilt (좌우) | CS5_BODY | ✅ | △ | 좌우기울기는 FO 우세 |
| Spine Angle (전후) | CS4_GROUND | △ | ✅ | 전후굴곡은 DTL 우세 |
| Head Sway (좌우) | CS4_GROUND | ✅ | △ | 타겟방향 병진 = FO 우세 |
| Early Extension (골반→볼) | CS4_GROUND | △ | ✅ | 전후 병진 = DTL 우세 |
| Lead Knee Angle | CS5_BODY | ✅ | ✅ | 관절각은 view 견고 |
| Hand Depth | CS4/CS5 | △ | ✅ | 깊이 = DTL 우세 |
| Club Path / Face | CS6_TARGET | ✕ | ✅ | Path/Face는 DTL 전용 |
| Ball Launch/Spin | CS6_TARGET | △ | ✅ | 볼 추적, 2차 |

✅ 신뢰↑ · △ 조건부/저하 · ✕ 부적합

**설계 결론:**
- **회전(Turn/X-Factor)은 FO·DTL 둘 다 OK** → 단일 뷰로도 커버.
- **전후 성분(Spine Angle, Early Extension, Hand Depth, Path/Face)은 DTL 우세.**
- **좌우 성분(Sway, 좌우 Tilt)은 FO 우세.**
- → **2뷰(FO+DTL) 촬영이 이상적**이나, MVP는 DTL 단일뷰로 최대 커버(전후·회전 확보).
- 이 표가 `c_view`(Technical Arch §9의 confidence 항)의 출처다.

---

## 8. 단일 카메라 3D 한계선 (정직성 원칙)

Vision Engine이 넘지 않는 선을 명문화한다.

| 할 수 있다 (single cam) | 할 수 없다 (정직하게 null/저신뢰) |
|---|---|
| 2D 각도·자세 (CS1) | 정밀 절대 3D 좌표 (CS3, intrinsics 없음) |
| 회전량 (CS5_BODY, 근사 3D) | 정밀 헤드스피드 절대값(m/s) — 캘리브레이션 없이 |
| 상대 거리 (STANCE 정규화) | 정밀 절대 거리(cm) |
| view-invariant 상대 지표 | 볼 스핀축 정밀값 (런치모니터 영역) |
| Path/Face **경향** (DTL+클럽) | Path/Face **정밀 각도** (캘리브레이션 필요) |

- **원칙:** 절대 물리량(속도·거리 m 단위)은 **캘리브레이션 전까지 상대/정규화 값으로.**
- 3D 의존 값은 항상 `depth_estimated` flag를 달고 나간다. DOH가 가중을 낮출 수 있게.
- **거짓 정밀(false precision) 금지.** 0.1도 단위로 뱉되 confidence가 그 정밀을 부정할 수 있어야 한다.

---

## 9. 출력 반영 (JSON Contract 확장)

`features[]` 각 항목에 `coord` 필드(이미 Technical Arch §8.3에 있음)를 채우고,
좌표변환 이력이 flag로 드러난다.

```jsonc
{
  "feature_id": "VF031",
  "semantic": "X-Factor",
  "value": 41.0, "unit": "deg",
  "phase": "P4",
  "coord": "CS5_BODY",                    // ★ 어느 좌표계에서 쟀나
  "coord_path": ["CS1_NORM","CS2_WORLD","CS5_BODY"],  // 변환 경로(디버그)
  "confidence": 0.49,
  "error_flags": ["depth_estimated"]      // 좌표변환 손실이 flag로
}
```

- `coord`가 있으면 DOH·디버거가 "이 값이 어느 기준인지"를 안다.
- `coord_path`는 선택(디버그용). 값이 이상할 때 어느 변환에서 틀어졌는지 역추적.

---

## 10. 잠금·확장 규칙

| 잠김 (메이저) | 자유 추가 (마이너) |
|---|---|
| 7 좌표계 ID·정의 | c_transform 계수 보정(PoC 실측 후) |
| BODY 축 구성 방식(§3.1) | View×CS 신뢰도 표 세분화 |
| 회전=BODY / 병진=GROUND 역할분담 | 새 flag 종류 |
| null≠0, false precision 금지 | CS3/CS6 활성화(캘리브레이션 붙을 때) |

- 좌표계 ID/의미 **append-only**. `CS5_BODY`의 정의는 불변.
- c_transform 계수는 **데이터로 보정**(현재는 보수적 seed).

---

## 11. 다음 산출물로의 연결

이 문서가 잠기면 **Primitive Catalog Spec**은 각 Primitive에 `coord` 한 칸만 채우면 된다:

```
SHOULDER_LINE : from(TRAIL_SHOULDER, LEAD_SHOULDER), coord=CS5_BODY
HEAD_POINT    : from(HEAD),          coord=CS4_GROUND
CLUB_VECTOR   : from(HAND_MID, CLUBHEAD), coord=CS6_TARGET   // 2차
```
그리고 **Operator Catalog**는 각 OP의 "유효 좌표계"를 이 문서의 좌표계 ID로 참조한다.

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (SPEC DRAFT) |
| 작성일 | 2026-07-01 |
| 상위 | DOH Vision Technical Architecture v1.1 §3 |
| 로드맵 위치 | 1순위 (Primitive·Operator·Feature의 기반) |
| 다음 산출물 | Primitive Catalog Spec v1.0 |
| 미해결(2차) | CS3_CAMERA / CS6_TARGET 캘리브레이션, c_transform 실측 보정 |
| 상태 | 프로 검토 대기 |

*좌표계는 "무엇을 사실로 인정할지"를 정한다.*
*회전은 몸에서(BODY), 병진은 땅에서(GROUND), 클럽은 목표선에서(TARGET) 잰다.*
*카메라가 아니라 골퍼를 기준으로 재는 순간, 값은 영상을 넘어 비교 가능해진다.*
