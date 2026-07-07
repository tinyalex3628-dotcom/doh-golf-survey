# DOH Standard Dictionary v0.1

**DOH의 표준 언어(Standard Language)를 고정하는 Dictionary 세트다.**
이 문서 세트의 목적은 P6 문서를 예쁘게 수정하는 것이 아니라, Knowledge Graph와 AI 추론 엔진이 재사용할 **재사용 가능한 표준 표현**을 구축하는 것이다.

> 같은 의미는 항상 같은 문장, 같은 단어, 같은 Mechanism, 같은 Feature 이름으로 표현한다.

---

## 왜 Dictionary인가

DOH는 일반 문서가 아니라 AI 추론 엔진(Knowledge Graph)의 기반이 되는 Knowledge Base다.
같은 의미를 서로 다른 문장으로 표현하면 사람은 이해하지만 AI는 **서로 다른 지식**으로 인식한다.

```
"The Pelvis Opens Early"
"The Pelvis Opens Before Arm Delivery"
"Early Pelvis Rotation"
"Pelvis Rotates Too Soon"
        │  ← 사람은 같은 의미, AI는 4개의 다른 개념
        ▼
DOH Standard  →  M-ROT-01  "The Pelvis Opens Before Arm Delivery." (팔 전달 전에 골반이 먼저 열린다.)
```

이런 중복 표현은 Knowledge Graph · Chain · Strong Co-occurrence · Inference Engine · Vector Search의 품질을 모두 떨어뜨린다. Dictionary는 이를 단일 표준 표현으로 통일한다.

---

## 3개의 Dictionary

| Dictionary | 파일 | 역할 | 계층 |
|---|---|---|---|
| **Feature Dictionary** | `DOH_Feature_Dictionary_v0.1.json` | Feature 이름 · 한글명 · 정의 · Object/Attribute | Observation |
| **Observation Dictionary** | `DOH_Observation_Dictionary_v0.1.json` | Feature를 '관찰된 사실'로 진술하는 표준 문장 | Observation |
| **Mechanism Dictionary** ⭐ | `DOH_Mechanism_Dictionary_v0.1.json` | Cause와 Result를 연결하는 표준 문장 (가장 중요) | Inference link |

### 세 Dictionary가 맞물리는 방식

```
Feature Dictionary        Observation Dictionary          Mechanism Dictionary
─────────────────         ──────────────────────          ─────────────────────
pelvis_open_early    ──▶  OBS-PEL-OPEN-EARLY         ──▶  원인/결과 체인에서
"Pelvis Open Early"       "The Pelvis Is Open              M-ROT-01, M-ARM-03 …
(골반 조기 오픈)            Earlier Than Normal."           로 연결
   │                          (관찰 사실)                      (인과 링크)
   └─ object: Pelvis
      attribute: Early
```

- **Feature** = 무엇을 관찰하는가 (명사적 정체성)
- **Observation** = 그 Feature가 사실로 어떻게 진술되는가 (관찰 문장)
- **Mechanism** = 그 Feature가 다른 Feature와 어떻게 인과로 연결되는가 (링크 문장)

Feature/Chain은 Mechanism을 **문장 텍스트가 아니라 ID(M-ROT-01)로 참조**한다. 문장을 바꿔도 ID는 고정되므로 Graph가 깨지지 않는다.

---

## Naming Rule (Feature)

`DOH Observation Feature Naming Rule v1.0` — 전체 규칙은 Feature Dictionary의 `naming_rule` 참조.

- 모든 Feature = **`[Object] + [Attribute]`**
- Object는 해부학적/명확한 객체명만 사용 (`Upper Body` 등 모호 용어 폐기)
- Attribute는 고정된 축(Magnitude/Timing/Location/Rotation/Motion/Position/Angle/ClubFace/Shaft/Release/Relationship)의 표준 단어만 반복 사용
- P6 Feature는 **상대값(Relative Position)** — "이 시점의 다운스윙 진행 정도에서 정상이라면 어디에 있어야 하는가" 기준

---

## 워크드 예시 — P6 체인을 표준 언어로 재작성

원문(P6 문서, High Hands):

```
Arm Depth Excessive (P4)
 ↓ 손이 몸통보다 뒤에서 다운스윙을 시작한다.
 ↓ 급격한 흉곽 회전으로 팔이 하강할 시간이 부족해진다.
High Hands (P6)
```

표준 언어로 재작성:

```
Feature   arm_depth_excessive (P4)
  │
  ├─ M-ARM-07  "The Hands Start Downswing From Behind The Thorax."
  ├─ M-ROT-03  "The Thorax Rotates Rapidly During Transition."
  ├─ M-ARM-08  "Rapid Thorax Rotation Reduces Available Arm Drop Time."
  ▼
Feature   high_hands (P6)   →  Observation: OBS-HIGH-HANDS
                               "The Hands Are Higher Than Normal Relative To Body Rotation."
```

같은 인과 링크(예: 급격한 흉곽 회전)가 다른 Feature 체인에서도 등장하면 **M-ROT-03 하나만 재사용**한다 — 새 문장을 만들지 않는다.

---

## 재사용 원칙 (작업 규칙)

1. 새 Feature/체인을 쓸 때 **먼저 기존 Dictionary에서 같은 의미의 표현을 찾는다.**
2. 있으면 그 ID를 재사용한다. 없을 때만 새 표준 표현을 추가한다.
3. 새로 추가한 표준 표현은 이후 문서 전체에서 반복 사용한다.
4. 비표준 동의 표현(`replaces` 목록)은 더 이상 사용하지 않는다.

---

## DOH Dictionary Added (v0.1 신규 표준 용어)

이번 작업에서 새로 고정하거나 표준화한 항목:

### 명명 표준화 (rename)
| From | To | 이유 |
|---|---|---|
| Upper Body Open Early | **Thorax Open Early** | 해부학 객체명 통일, `Upper Body` 폐기 |
| Excessive Spine Extension | **Spine Extension Excessive** | `[Object]+[Attribute]` 어순 통일 |
| Upper Body Dominance | **Body Rotation Dominant** | `Upper Body` 폐기 |

### Mechanism Dictionary (49 entries, 7 categories, M-ID 부여)
- **ROT** (11) 회전 · **PRS** (6) 압력 · **ARM** (10) 팔 전달 · **CLB** (7) 클럽 전달 · **SPC** (5) 공간 · **LOD** (4) 하중 · **CMP** (6) 보상
- 사용자 v0.1 Mechanism 7-카테고리 시드 + 시트 M001~M007 + P6 전 체인의 인과 링크를 **단일 표준 문장으로 dedup**하여 통합.
- 각 Mechanism은 `replaces`(폐기할 동의 표현)와 `used_in`(사용 Feature)을 보유.

### Observation Dictionary (15 canonical statements)
- P6 상세 Feature 15개에 대해 `Than Normal` 상대 진술 표준 문장 고정.
- 사용자 제시 Observation Language 예시(Grip Handle/Shaft) 형식 채택.

### Feature Dictionary (15 features + controlled vocabulary)
- P6 상세 Feature 15개 + 참조 Feature 어휘 고정.
- 시트의 `[Object]+[Attribute]` Naming Rule과 Modifier/Attribute Dictionary를 정본으로 수록.

---

## 파일

```
DOH_Standard_Dictionary/
├── README.md                              (이 문서)
├── DOH_Feature_Dictionary_v0.1.json       Feature 이름·정의·Naming Rule
├── DOH_Observation_Dictionary_v0.1.json   관찰 표준 문장
└── DOH_Mechanism_Dictionary_v0.1.json  ⭐  인과 연결 표준 문장 (CORE)
```

## 상태 및 다음 단계

- **상태**: v0.1 DRAFT — 프로 검토 후 표준 확정(lock).
- **범위**: 이번 v0.1은 P6 회전(Pelvis/Thorax)·압력·팔/공간/클럽 계열을 정본화. `referenced_features`로 표시된 결과 Feature(Steep Shaft, Club Face Open, Flip Release 등)는 이름만 고정하고 상세 entry는 다음 단계에서 승격.
- **다음 단계**:
  1. `referenced_features`를 상세 Feature/Observation entry로 승격 (동일 형식 재사용).
  2. P6 문서 전체를 M-ID 기반으로 재작성.
  3. P4 Initial Condition → Transition Mechanism → P6 Observation 교차구간 체인 구조화.
  4. Mechanism ID를 Node Library(`DOH_Node_Library_v1.json`)의 possible_causes/possible_results 근거로 연결.
