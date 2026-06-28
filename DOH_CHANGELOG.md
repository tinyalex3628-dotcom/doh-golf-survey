# DOH CHANGELOG
_최신 항목이 최상단에 위치한다._

---

## 2026-06-28 (N20 세션)

### Added
- N20 Impact Loss — Node Library 신규 등록 (cluster_result / impact / lifecycle: draft)
  - observation_type: convergence (P04) — N11·N12·N13·N14 복수 upstream 수렴
  - Feature Dictionary NODES 객체 등록 + EDGES 4개 추가
- D022 ~ D025 — DOH_Decision_Log.md 등록
- P05 Node ID Stability 원칙 — DOH_Design_Principles.md 등록 (D022·D023)
- P04 Convergence Observation 원칙 — DOH_Design_Principles.md 갱신 (D021 → 확장)

### Changed
- N11 possible_results: N20 strong 추가 (P04 Convergence, D024)
- N12 possible_results: N20 strong 추가 (P04 Convergence) — HTML/JSON 동기화
- N13 possible_results: N20 strong 추가 (P04 Convergence)
- DOH_Node_Library_v1.json updated timestamp → 2026-06-28T17:00:00

### Pending
- N14 Excessive Depth — Node Library 미등록 (다음 세션)
- N20 N14 Edge: evidence_level theory → clinical (N14 설계 완료 후 갱신)
- N15 Outside Takeaway — JSON 미등록 (N10.possible_causes N15 참조 감사 미해결)

---

## 2026-06-28 (N13/N16 세션)

### Added
- N13 Flip Release — Node Library 신규 등록 (cluster_result / release)
- Impact Loss — Node Library 신규 등록 (cluster_result / impact) ⚠️ 번호 미확정 (N15=Outside Takeaway 충돌로 N16 후보)
- P04 Convergence Observation 원칙 — DOH_Design_Principles.md 등록 → D021
- DOH_Decision_Log.md 신규 생성 (D019~D021)
- DOH_CHANGELOG.md 신규 생성

### Changed
- N13 명칭: Early Release → Flip Release → D020
  - Feature Dictionary, Survey 참조 동기화
- N11 possible_results: Impact Loss strong 추가 (Impact Loss 번호 확정 후 등록)
- N12 possible_results: Impact Loss strong 추가 (동일)
- DOH_Design_Principles.md P04 추가

### Pending
- ⚠️ Impact Loss 노드 번호 확정 필요 (N15 충돌 — HTML N15 = Outside Takeaway)
- N14 Excessive Depth — Node Library 미등록 (다음 세션)
