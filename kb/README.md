# KB (사용자 코칭 지식베이스) — 엔진 결합용 추출본

원본: 사용자가 수작업으로 만든 `DOH_P1/P2/P4/P6/P7.xlsx` (레슨 현장 경험 기반).
이 폴더는 그 원본에서 **엔진이 읽을 수 있게 추출**한 것이다. 원본이 정본이며, 충돌 시 원본 우선.

| 파일 | 내용 |
|---|---|
| `kb_causal_graph.json` | 인과 그래프 — 노드 209 · 엣지 285 (High 182 / Medium 38 / Pattern Dependent 64 / Low 1). 각 엣지에 `src`·`tgt`·`conf`·`mech`(메커니즘 문장)·`branch`(A/B/C 분기) |
| `kb_feature_map.json` | KB Feature 128개 × 우리 엔진 측정가능성 판정 (✅66 / ◐10 / ✕52) |

## 쓰는 법
- `mech` 문장은 **회원 화면에 그대로 노출 가능** (KB 원문 = 코칭 언어).
- `conf` → 말투 매핑: High="대개 ~때문입니다" / Medium="~일 수도 있습니다" / Pattern Dependent="사람에 따라 다른데".
- 근본원인 = out-degree − in-degree 가 큰 노드. 1위 `Thorax Rotation Insufficient (P4)` (원인 10 · 결과 0).
- 말단 증상(헤드라인에 쓰면 안 되는 것) = in-degree 가 큰 노드. 예 `Chicken Wing (P7)` (원인 4개가 유발).

## 주의
- 추출은 자동 파싱이라 노이즈 가능 — 원본 셀과 대조 필요.
- P6 파일은 시트 구조가 달라 별도 처리했음.
