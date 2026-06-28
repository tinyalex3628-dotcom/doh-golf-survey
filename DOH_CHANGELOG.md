# DOH CHANGELOG
_최신 항목이 최상단에 위치한다._

---

## 2026-06-28 (N14 세션)

### Added
- N14 Excessive Depth — Node Library 정식 등록 (compensation / kinematic / field_tested)
  - possible_causes: N08(strong/clinical), N10(moderate/clinical)
  - possible_results: N20(moderate/theory)
  - related_nodes: N12/N13(compensation)
  - ball_flight_bias: hook/push/push_draw, confidence:0.50
  - ai_observation: Transition~P6 hand center posterior measurement
  - D026 등록

### Changed
- N14 name_ko: 과도한 인사이드 진입 → 과도한 깊이 (Depth ≠ Inside Path, P01)
- N08 possible_results: N14 strong 추가
- N10 possible_results: N14 moderate 추가
- EDGES: N01→N14 제거, N10→N14 moderate 신규, N14→N12 제거 → related_nodes compensation

### Pending
- N14→N20 evidence_level: theory → clinical (필드 데이터 확보 후)
- N15 Outside Takeaway JSON 미등록 (기존 Pending 유지)

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
