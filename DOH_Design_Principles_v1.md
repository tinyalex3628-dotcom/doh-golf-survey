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
**"여러 Node에서 공통적으로 관찰되는 최종 현상은 Result of Result가 아니라 Shared Downstream Observation이다."**

- Layer는 변경하지 않는다. `cluster_result` 유지.
- `_design_note`에 `observation_type: convergence`와 `identity_note`를 명시하여 역할을 구분한다.
- Schema 수정 없이 메타 정보로만 표현한다. (D012 준수)
- 적용 사례 (N15/N16): N11/N12/N13/N14 → 수렴형 Impact Loss Node는 인과 종단이 아니라 공통 관찰 수렴점이다.
- 이 원칙은 수렴형 Node 설계 기준으로 적용된다.
- 출처: N15 설계 세션 (2026-06-28)
