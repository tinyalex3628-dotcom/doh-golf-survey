# DOH Design Principles v1.0
_설계 과정에서 도출된 시스템 공통 원칙. Node·Cluster·Chain 설계 전반에 적용._

---

## Principle 01 — 상대적 움직임 정의 원칙
**"DOH에서 '과도한 움직임'은 절대값이 아니라, 다른 신체 분절에 대한 상대값으로 정의한다."**

- 적용 사례 (N10): Arm Lift = "팔이 높다" (X) / "몸통 회전에 비해 팔 Elevation이 상대적으로 증가한다" (O)
- 이 원칙은 체형·플레인·투어프로 예외를 절대값 기준 없이 흡수한다.
- 출처: N10 설계 세션 (2026-06-28)

---

## Principle 02 — Tendency ≠ Result 원칙
**"upstream Node가 생성하는 것은 경향성(tendency)이며, downstream Node 확정은 추가 조건이 필요하다."**

- 적용 사례 (N10→N12): N10은 Steep tendency를 생성한다. OTT(N12) 확정은 Transition 복원 실패라는 추가 조건이 필요하다.
- strong Edge는 "결과 확정"이 아니라 "경향성 전달 강도"를 의미한다.
- 이 원칙은 Transition 계열 전체 Node 설계에 적용된다.
- 출처: N10 설계 세션 (2026-06-28)

---

## Principle 03 — Edge Type 분리 원칙
**"possible_causes는 반복적으로 성립하는 인과만 등록한다. 조건부·보상 분기는 related_nodes(compensation)으로 분리한다."**

- `possible_causes` = 해당 Node가 활성화될 때 대체로 성립하는 인과 관계
- `related_nodes: compensation` = 특정 조건에서만 발생하는 보상 전략, 재루팅 분기
- `related_nodes: co_occur` = 인과 없이 동반 관찰되는 패턴
- possible_causes에 이미 등록된 Node를 co_occur에 중복 등록하지 않는다.
- 적용 사례 (N12): N14(Excessive Depth)는 재루팅 조건부 분기 → possible_causes 제거, compensation 등록
- 이 원칙은 N13 이후 모든 Node의 Edge 설계 기준으로 적용된다.
- 출처: N12 설계 세션 (2026-06-28)

---

## Principle 04 — Convergence Observation 원칙
**"복수의 독립적인 upstream Observation이 하나의 공유 downstream Observation으로 수렴할 수 있다."**

- N20(Impact Loss)은 N11·N12·N13·N14 등 서로 다른 경로에서 수렴하는 Convergence Node다
- `possible_results: strong`은 결정론적 인과 선언이 아니라 관찰 기반 downstream 가능성을 표현한다
- cluster_result → cluster_result Edge는 이 원칙 적용 시 허용된다 (단, `observation_type: convergence` 필드로 명시)
- Convergence Node 판별 기준: 3개 이상의 독립 upstream이 수렴 / 방향성 비대칭 / DAG 중복 경로 없음
- 출처: N20 Impact Loss 설계 세션 (2026-06-28)

---

## Principle 05 — Node ID Stability 원칙
**"Node ID는 한 번 할당되면 재배치하거나 재사용하지 않는다."**

### 적용 범위
- 정식 등록 Node, Candidate Node 모두 동일하게 적용한다
- 구현 여부, lifecycle 상태와 무관하다

### 규칙
1. 신규 Node는 항상 다음 사용 가능한 번호를 부여한다. 이미 할당된 번호는 건너뛴다
2. 삭제된 Node는 번호를 반납하지 않는다. `deprecated` 상태로 보존되며 번호는 비활성 예약 상태가 된다
3. Candidate 번호도 예약 식별자다. CANDIDATE 주석으로 번호가 등장한 시점부터 해당 번호는 점유된 것으로 간주한다
4. 번호를 재배치하는 것은 금지한다. HTML·JSON·Git 히스토리 전체에서 연쇄 변경이 발생하므로 얻는 것보다 잃는 것이 크다

### 현재 번호 할당 현황 (2026-06-28 기준)
| 번호 | Node | 상태 |
|------|------|------|
| N01~N15 | 정식 등록 | field_tested |
| N16 | Trail Loading Failure | CANDIDATE |
| N17 | Restricted Thorax Delivery | CANDIDATE |
| N18 | Transition Sequencing Failure | CANDIDATE |
| N19 | Open Intolerance | CANDIDATE |
| N20 | Impact Loss | draft |

- 출처: N20 번호 배정 과정 (2026-06-28), D022·D023 참조
