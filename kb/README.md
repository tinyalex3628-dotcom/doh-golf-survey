# KB (사용자 코칭 지식베이스) — 엔진 결합용 추출본

원본: 사용자가 수작업으로 만든 `DOH_P1/P2/P4/P6/P7.xlsx` (레슨 현장 경험 기반).
이 폴더는 그 원본에서 **엔진이 읽을 수 있게 추출**한 것이다. 원본이 정본이며, 충돌 시 원본 우선.

## 원본 보존 (`source/`, 2026-07-28)
원본 5개가 **브랜치 4곳에 흩어져** 있던 것을 이 폴더로 모았다 (흩어진 브랜치가 지워지면 정본이 유실되므로):
| 파일 | 가져온 브랜치 |
|---|---|
| `source/DOH_P1.xlsx` (시트16) | `claude/doh-p1-address-dictionary-6reuzf` |
| `source/DOH_P4.xlsx` (시트16) | `claude/p4-file-modifications-j8jpxh` |
| `source/DOH_P6.xlsx` (시트6) | `claude/doh-mechanism-dictionary-qf66w7` |
| `source/DOH_P7.xlsx` (시트11) | `claude/doh-mechanism-dictionary-iyk9pk` |
| **DOH_P2.xlsx — ⚠️ 깃허브 어디에도 없음** | 추출 세션에서 채팅 업로드로만 쓰인 듯. **내용은 그래프에 들어 있으나(P2 엣지 42개) 원본 파일은 미보존 — 사용자가 다시 올려주면 여기 추가할 것.** |

| 파일 | 내용 |
|---|---|
| `kb_causal_graph.json` | 인과 그래프 — **노드 289 · 엣지 436** (High 311 / Medium 47 / Pattern Dependent 77 / Low 1). 각 엣지에 `src`·`tgt`·`conf`·`mech`(메커니즘 문장)·`branch`(A/B/C 분기). `tools/build_kb_graph.py`가 재생성 |
| `kb_causal_graph.v1.json` | 2026-07-25 세션의 원 추출본(285엣지) — **동결.** 병합의 베이스라 지우면 안 됨 |
| `kb_feature_map.json` | KB Feature 128개 × 우리 엔진 측정가능성 판정 (✅66 / ◐10 / ✕52) ⚠️ P6 21개 반영 전 수치 — 갱신 필요 |

## ⚠️ 누락 사고와 복구 (2026-07-28)
v1 추출본(285엣지)에 **파싱 실패로 통째로 빠진 데가 있었다**:
- **P2 — 18개 중 4개 누락** (Pelvic Sway / Spine Angle Loss / Lead Knee Flexion / Lead Knee Collapse — 전부 우리가 측정 가능한 것들)
- **P6 — 21개 전부 누락** (체인 하나당 한 행인 시트 구조를 한 셀 파서가 못 읽음)
→ `tools/build_kb_graph.py` 신설(재현 가능한 추출기)로 복구. **v1 285엣지는 전부 보존**하고
  누락 Feature의 엣지 151개만 추가하는 보수적 병합. 검증: P2 18/18 · P6 21/21 · 노드 오염 0.
교훈: 추출 스크립트를 안 남기면 누락을 검증할 방법이 없다. 이제 수정은 스크립트를 고치고 재실행.

## 쓰는 법
- `mech` 문장은 **회원 화면에 그대로 노출 가능** (KB 원문 = 코칭 언어).
- `conf` → 말투 매핑: High="대개 ~때문입니다" / Medium="~일 수도 있습니다" / Pattern Dependent="사람에 따라 다른데".
- 근본원인 = out-degree − in-degree 가 큰 노드. 1위 `Thorax Rotation Insufficient (P4)` (원인 10 · 결과 0).
- 말단 증상(헤드라인에 쓰면 안 되는 것) = in-degree 가 큰 노드. 예 `Chicken Wing (P7)` (원인 4개가 유발).

## 주의
- 추출은 자동 파싱이라 노이즈 가능 — 원본 셀과 대조 필요.
- P6 파일은 시트 구조가 달라 별도 처리했음.
