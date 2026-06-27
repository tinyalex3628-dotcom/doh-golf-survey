# DOH Architecture v1.0
**DOH Golf Diagnostic System — 최상위 설계 문서**
*이 문서는 DOH 시스템 전체가 따라야 하는 설계 헌법이다.*
*모든 Node, Feature, Cluster, Survey, AI 모듈은 이 문서의 원칙을 따른다.*

---

## 1. DOH 철학

DOH는 골퍼의 경험을 수집하고, 추론을 통해 스윙 오류의 원인을 도출하는 시스템이다.

핵심 명제:

> **관찰(Observation)은 사실이다. 추론(Inference)은 해석이다. 둘은 절대 섞이지 않는다.**

DOH는 골퍼가 직접 경험하고 보고하는 현상에서 출발한다.
진단은 단일 관찰이 아니라 복수 관찰의 조합으로부터 시작된다.
DOH의 목적은 원인을 발견하고, 코치와 골퍼가 함께 교정 방향을 결정하도록 돕는 것이다.

---

## 2. 역할 계층 (Role Layer)

DOH는 4개의 역할 계층으로 구성된다.
각 계층은 역할이 다르며, 계층 간 경계를 침범하지 않는다.

```
Reality
│
│  골퍼, 스윙, 신체, 결과 — 측정 이전의 실제 현실
│
↓

Observation
│
│  Feature, Node, Video, Sensor
│  현실을 수집·관찰한 결과
│  사실(Fact)만 포함한다. 해석하지 않는다.
│
↓

Inference
│
│  Cluster, Chain, Archetype
│  복수의 Observation을 조합하여 원인을 추론한다.
│  가설이 허용되지만 근거를 명시해야 한다.
│
↓

Presentation
│
│  Report, Coach View, User Feedback
│  추론 결과를 목적에 맞는 형태로 표현한다.
│  새로운 추론을 생성하지 않는다.
```

### 관찰 수단의 확장 원칙

관찰 수단은 계속 늘어나지만, 모두 Observation 계층을 채울 뿐이다.

| 수단 | 계층 |
|---|---|
| 설문 (Survey) | Observation |
| 영상 AI (Vision AI) | Observation |
| 압력판 (Pressure Mat) | Observation |
| IMU 센서 | Observation |
| MediaPipe Pose | Observation |
| 코치 직접 관찰 | Observation |

> Observation 수단이 늘어나도 Inference 계층의 구조는 변하지 않는다.
> Node는 그대로다.

---

## 3. 객체 계층 (Object Layer)

DOH의 핵심 데이터 객체는 5개다.
각 객체는 하나의 역할 계층에 속하며, 역할을 벗어나지 않는다.

```
Feature       → Observation 계층
Node          → Observation 계층
Cluster       → Inference 계층
Archetype     → Inference 계층
Report        → Presentation 계층
```

### 객체 정의

**Feature**
골퍼의 스윙에서 관찰 가능한 단일 사실값.
설문, 영상, 센서 등으로 직접 수집된다.
해석 없이 수치 또는 범주값으로 존재한다.

**Node**
반복적으로 경험되는 하나의 스윙 현상.
복수의 Feature가 함께 나타날 때 인식되는 패턴이다.
Node 자체는 원인을 설명하지 않는다. 현상을 기술할 뿐이다.

**Cluster**
복수의 Node를 조합하여 원인 가설을 형성하는 단위.
Inference가 시작되는 최초 계층이다.
단일 Node는 Cluster를 형성할 수 없다.

**Archetype**
복수의 Cluster를 조합하여 도출되는 스윙 유형.
골퍼의 전체적인 오류 패턴을 대표하는 상위 개념이다.

**Report**
Archetype과 Cluster의 결과를 골퍼와 코치에게 전달하는 표현 객체.
새로운 추론을 생성하지 않는다.

---

## 4. 추론 원칙 (Inference Principles)

### 원칙 1 — 복수 Observation 원칙
Inference는 독립된 관찰 하나만으로 확정되지 않는다.
DOH의 원인 추론은 여러 Observation(Feature, Node 등)의 조합을 기반으로 수행한다.
단일 Node는 추론의 근거(Evidence)이지, 최종 진단(Diagnosis)이 아니다.

### 원칙 2 — 계층 비침범 원칙
Observation은 Inference를 포함하지 않는다.
Feature는 원인을 설명하지 않는다.
Node는 교정 방향을 제시하지 않는다.
추론은 반드시 Cluster 이상에서 시작된다.

### 원칙 3 — 근거 명시 원칙
Cluster가 활성화될 때는 어떤 Node가 근거인지 반드시 기록된다.
Archetype이 도출될 때는 어떤 Cluster가 근거인지 반드시 기록된다.
근거 없는 추론은 DOH 엔진에서 허용되지 않는다.

### 원칙 4 — Confidence 원칙
모든 Inference 객체(Cluster, Archetype)는 Confidence 값을 가진다.
Confidence는 활성화된 근거의 수와 quality에 따라 산출된다.
Confidence가 임계값 미만인 추론은 Report에서 강조 표시하지 않는다.

---

## 5. 데이터 흐름

```
[골퍼 / 스윙 / 신체]
        │
        ▼
[Observation 수집]
 Survey / Video / Sensor
        │
        ▼
[Feature]
 단일 사실값
        │
        ▼
[Node]
 반복 경험 현상 패턴
        │
        ▼
[Cluster]        ← Inference 시작
 Node 복수 조합 → 원인 가설
        │
        ▼
[Archetype]
 Cluster 복수 조합 → 스윙 유형
        │
        ▼
[Report / Coach View / User Feedback]
 Presentation 계층
```

### 위성 객체 흐름

각 Node는 3개의 위성 객체를 가진다.
위성 객체는 Node를 서비스하지만, Node 자체를 변경하지 않는다.

```
Node
 │
 ├─ Survey Object     → 설문 수집 전용
 ├─ Inference Object  → 엔진 추론 로직 전용
 └─ AI Object         → 영상·센서 연결 전용
```

---

## 6. 객체 분리 원칙

### 왜 분리하는가

Node 안에 Survey, Inference, AI 로직을 모두 넣으면:
- Node가 변할 때 Survey도 깨진다
- Survey가 바뀔 때 Inference 로직도 영향을 받는다
- AI 연결이 추가될 때 Node 구조를 수정해야 한다

**Node는 불변 코어다. 주변 객체들이 Node를 서비스한다.**

### Node Object (불변 코어)
Node 자신의 정의만 포함한다.

| 필드 | 설명 |
|---|---|
| id | 고유 식별자 |
| name | 현상 이름 |
| layer | 역할 계층 위치 |
| description | 현상 설명 |
| experience_statement | 골퍼 체감 문장 (Level 1용) |
| validation_status | Lifecycle 상태 |
| data_source | 실측 / 추정 / 이론 |
| version | 버전 |

### Survey Object (설문 전용)
Node를 수집하기 위한 설문 로직만 포함한다.

| 필드 | 설명 |
|---|---|
| survey_anchor | Node와 연결된 핵심 질문 방향 |
| question_templates | 실제 질문 문장 |
| difficulty | 난이도 (Level 1 / Level 2) |
| follow_questions | 후속 질문 |
| level | 설문 대상 수준 |

### Inference Object (엔진 전용)
추론 로직만 포함한다.

| 필드 | 설명 |
|---|---|
| feature_links | 연결된 Feature 목록 |
| activation_rules | 활성화 조건 |
| related_nodes | 연관 Node |
| possible_causes | 이 Node의 원인 후보 |
| possible_results | 이 Node로 인한 결과 후보 |
| cluster_candidates | 연결 가능한 Cluster |
| archetype_candidates | 연결 가능한 Archetype |
| ball_flight_bias | 볼 탄도 편향 |
| confidence | 추론 신뢰도 |

### AI Object (영상·센서 전용)
향후 AI 연결 로직만 포함한다.

| 필드 | 설명 |
|---|---|
| video_features | 영상에서 감지할 특징 |
| pose_features | 자세 분석 포인트 |
| confidence_rules | AI 신뢰도 규칙 |
| future_sensor_mapping | 압력판, IMU 연결 계획 |
| coach_notes | 코치 직접 관찰 메모 |

---

## 7. Lifecycle

모든 Node는 생명주기를 가진다.
DOH는 Living Project이며, Node는 실제 레슨 데이터에 의해 검증된다.

```
draft
  │  초안 상태. 아직 현장 검증 없음.
  ▼
candidate
  │  현장 관찰에서 패턴이 포착됨. 검증 시작.
  ▼
field_tested
  │  실제 레슨 데이터 10+ 케이스 확인됨.
  ▼
validated
  │  통계적으로 의미 있는 패턴 확인됨.
  ▼
locked
  │  구조 변경 불가. DOH 코어 Node.
  ▼
deprecated
     더 정확한 Node로 대체됨. 비활성화.
```

### Lifecycle 운영 원칙
- `draft` 상태의 Node는 Report에 노출하지 않는다.
- `locked` 상태의 Node는 id, name, layer를 변경할 수 없다.
- `deprecated` Node는 삭제하지 않고 보존한다. (이력 추적)
- Node가 `validated` → `locked`로 이동하려면 프로의 명시적 승인이 필요하다.

---

## 8. 설계 금기사항

이 항목들은 DOH의 구조적 일관성을 유지하기 위한 절대 원칙이다.
구현 편의를 위해 예외를 만들지 않는다.

| # | 금기사항 |
|---|---|
| 1 | **Feature는 원인을 설명하지 않는다.** Feature는 관찰값이지 진단이 아니다. |
| 2 | **Node는 원인을 설명하지 않는다.** Node는 현상 패턴이지 원인 분석이 아니다. |
| 3 | **Survey는 Node를 정의하지 않는다.** 질문은 Node를 수집하기 위한 수단이다. |
| 4 | **Cluster는 단일 Node로 완성되지 않는다.** Inference는 복수 Observation 조합으로 시작된다. |
| 5 | **Report는 새로운 추론을 생성하지 않는다.** Report는 Inference 결과를 표현할 뿐이다. |
| 6 | **Observation과 Inference를 같은 객체에 담지 않는다.** 계층 혼합은 유지보수 불가 상태를 만든다. |
| 7 | **Node의 불변 코어 필드를 위성 객체에서 수정하지 않는다.** Survey / Inference / AI Object는 Node를 서비스하지, 정의하지 않는다. |
| 8 | **`locked` 상태의 Node는 id, name, layer를 변경하지 않는다.** 변경이 필요하면 새 Node를 생성하고 기존 Node를 deprecated 처리한다. |

---

## 문서 정보

| 항목 | 내용 |
|---|---|
| 버전 | v1.0 |
| 작성일 | 2026-06-27 |
| 상태 | DRAFT — 프로 최종 확인 후 LOCKED |
| 다음 단계 | DOH Node Knowledge Object Schema v1.0 설계 |

---

*이 문서가 LOCKED되면 이후 모든 DOH 설계 결정은 이 문서를 기준으로 판단한다.*
