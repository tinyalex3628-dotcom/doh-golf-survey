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
