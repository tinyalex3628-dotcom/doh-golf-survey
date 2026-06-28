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
