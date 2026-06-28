# DOH Decision Log
_설계 과정에서 내린 주요 결정 기록. 번호 순 정렬, 최신 항목이 말미에 추가된다._

---

## D019
**Date**: 2026-06-28
**Subject**: `family: impact` 등록 확인 — Schema 수정 불필요
**Decision**: Impact Loss Node 설계 시 `family: impact` 신규 등록 검토. 확인 결과 DOH_Node_Schema.md에 이미 등록됨. Schema 수정 없이 그대로 사용.
**Result**: Schema 수정 작업 불필요 확정. Node Library에 family: impact 첫 사용 Node = Impact Loss.

---

## D020
**Date**: 2026-06-28
**Subject**: N13 명칭 변경 — Early Release → Flip Release
**Decision**: Early Release는 타이밍 개념(원인 해석 내포). Flip Release는 관찰되는 현상. D002 원칙 부합. LOCK.
**Result**: DOH_Node_Library.json N13 name 변경. Feature Dictionary, Survey 참조 동기화.

---

## D021
**Date**: 2026-06-28
**Subject**: P04 Convergence Observation 원칙 제정
**Decision**: 여러 Node에서 수렴하는 최종 현상은 Result of Result가 아니라 Shared Downstream Observation이다. Layer 신설 없음. _design_note로 표현.
**Result**: DOH_Design_Principles.md P04 등록. 수렴형 Node 이후 설계 기준.

---

## D022
**Date**: 2026-06-28
**Subject**: P05 — Node ID Stability 원칙 제정
**Decision**: Node ID는 한 번 공개되거나 구현되면 재배치하지 않는다. 신규 Node는 항상 다음 빈 번호를 사용한다. 삭제되더라도 deprecated로 남기며 번호를 재사용하지 않는다.
**Trigger**: N15 Outside Takeaway가 이미 구현된 상태에서 Impact Loss 번호 배정 시 충돌 이슈 발생.
**Result**: DOH Design Principles P05 등록.

---

## D023
**Date**: 2026-06-28
**Subject**: P05 Reservation Rule — Candidate 번호도 예약 식별자로 간주
**Decision**: CANDIDATE 상태의 Node도 한 번 번호가 할당되면 예약된 식별자다. 구현 여부와 무관하게 번호를 재배치하거나 빼앗지 않는다.
**Reasoning**:
  (1) Candidate도 Feature Dictionary / TestRunner / 설계 문서에서 번호와 함께 관리되는 설계 자산
  (2) 규칙에 예외를 허용하면 P05 자체의 의미가 약화됨
  (3) Node ID는 의미보다 안정성이 우선 — 건너뛰어도 절대 불변 체계가 장기적으로 강함
**Trigger**: N18 슬롯이 Transition Sequencing Failure CANDIDATE로 점유된 상태에서 Impact Loss 배정 시도.
**Result**: Impact Loss = N20 확정. N16~N19 Candidate 슬롯 보존.

---

## D024
**Date**: 2026-06-28
**Subject**: N11→N20 Edge 방식 확정 — possible_results: strong (P04 적용)
**Decision**: N11(Early Extension) → N20(Impact Loss) Edge는 possible_results: strong으로 등록. co_occur가 아닌 이유: 방향성 비대칭 (N11 활성 시 N20 높은 빈도 관찰, 역방향 성립 안 함). cluster_result→cluster_result Edge는 P04(Convergence Observation) 원칙 적용 시 허용.
**Result**: N11 possible_results에 N20 strong 등록. N20 observation_type: convergence 명시.

---

## D025
**Date**: 2026-06-28
**Subject**: N20 family — impact (kinematic 아님)
**Decision**: Impact Loss는 회전 현상이 아니라 임팩트 구간의 접촉 품질 관찰 현상. family: impact 유지.
**Result**: N20 JSON family 필드 = "impact".

---

## D027
**Date**: 2026-06-28
**Subject**: Chain 독립 계층 격상 결정
**Decision**: Chain은 Feature → Node → Cluster → Archetype 계층 내에 종속되지 않고, 독립 계층으로 격상한다.
**계층 구조 확정**: Feature → Node → Chain → Cluster → Archetype
**Reasoning**: Chain은 Cluster의 소유물이 아니라 Cluster의 Evidence다. Chain이 복수의 Cluster에 걸쳐 나타날 수 있으며, 설명력(Explanatory Power) 자체가 독립적 분석 단위다.
**Result**: DOH 시스템 계층 구조 공식 확정. Chain 설계 시 독립 계층 원칙 적용.

---

## D028
**Date**: 2026-06-28
**Subject**: Chain 철학 4개 LOCK
**Decision**: Chain 설계 원칙 4개 확정.
  1. Chain은 root_cause 노드에서 시작한다 — 보상 노드나 결과 노드에서 시작하는 Chain은 허용하지 않는다
  2. Node 2개 이상 — 단일 Node는 Chain이 아니다
  3. 원인→결과 설명 흐름 — Chain은 인과 방향성을 갖는다. 역방향 서술 금지
  4. Chain은 Cluster의 Evidence (소유 아님) — 하나의 Chain이 복수 Cluster에 걸쳐 작동할 수 있다
**Result**: Chain 설계 기준 LOCK. 이후 Chain 등록 시 4개 원칙 검증 필수.

---

## D026
**Date**: 2026-06-28
**Subject**: N14 Excessive Depth LOCK
**Decision**:
- Korean Name: '과도한 깊이' — '인사이드 진입' 제거. Depth ≠ Inside Path (D002, P01)
- N01→N14 Edge 제거 — N01은 상위 Hub이며 N01→N08→N14 경로가 이미 존재. 직접 Edge는 중복 경로 생성
- N10→N14 possible_causes moderate 신규 등록 — Arm Lift → Depth 보상 반복 패턴 확인
- N14→N12 possible Edge 제거 → related_nodes compensation으로 이동 (P03 적용)
- N14→N20: moderate + theory 유지 — N14 신규 확정 Node, clinical 승격은 필드 데이터 확보 후 검토
- related_nodes: N12/N13 compensation 등록 — 조건부 보상 분기. 반복 인과 아님
**Result**: N14 DOH_Node_Library.json 정식 등록. DOH_Feature_Dictionary.html 동기화. N08/N10 possible_results N14 연결 완료.
