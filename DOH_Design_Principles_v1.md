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
