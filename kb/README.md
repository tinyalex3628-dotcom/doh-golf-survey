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
| `source/DOH_P2.xlsx` (시트18) | 깃허브 어디에도 없어 유실될 뻔했고, **사용자가 채팅으로 다시 올려줘 복원**(2026-07-28) |

| 파일 | 내용 |
|---|---|
| `kb_causal_graph.json` | 인과 그래프 — **노드 669 · 엣지 875** (High 386 / Medium 145 / Pattern Dependent 330 / Low 14). 각 엣지에 `src`·`tgt`·`ph`(P구간)·`owner`(그 체인을 소유한 Feature)·`kind`(cause/predict)·`conf`·`mech`(메커니즘 문장)·`branch`(A/B/C 분기). `tools/build_kb_graph.py`가 재생성 |
| `kb_causal_graph.v1.json` | 2026-07-25 세션의 원 추출본(285엣지) — **동결.** 병합의 베이스라 지우면 안 됨 |
| `kb_feature_map.json` | KB Feature 128개 × 우리 엔진 측정가능성 판정 (✅66 / ◐10 / ✕52) ⚠️ P6 21개 반영 전 수치 — 갱신 필요 |

P구간별 엣지: P1 101 · P2 136 · P4 307 · P6 170 · P7 161.
owner(체인을 가진 Feature) 수: P1 13 · P2 18 · P4 28 · P6 21 · P7 14 = **94개**.

> `(src,tgt)`가 같은데 `owner`가 다른 엣지가 22쌍 있다. 오류가 아니라 원본의 교차기재다
> (A의 "predict" 목록과 B의 "cause" 목록에 같은 관계가 양쪽에서 적혀 있는 경우, 또는 서로 다른
> Feature의 체인이 같은 구간을 지나는 경우). owner별 조회에는 둘 다 필요하므로 남겨둔다.
> **회원 화면에 근거 문장을 나열할 때는 `(src,tgt)` 기준으로 중복 제거할 것** (고유 853쌍).

## ⚠️ 누락 사고와 복구 (2026-07-28 → 2026-07-29 완결)
v1 추출본(285엣지)에 **파싱 실패로 통째로 빠진 데가 있었다**:
- **P2 — 18개 중 4개 누락** (Pelvic Sway / Spine Angle Loss / Lead Knee Flexion / Lead Knee Collapse — 전부 우리가 측정 가능한 것들)
- **P6 — 21개 전부 누락** (체인 하나당 한 행인 시트 구조를 한 셀 파서가 못 읽음)
→ `tools/build_kb_graph.py` 신설(재현 가능한 추출기)로 복구.

**1차 병합(436엣지)은 아직도 절반이 빠져 있었다.** 병합 정책이 "v1에 owner가 없는 Feature의
엣지만 추가"라서, 이미 owner가 있는 Feature의 *체인 뒷부분*이 통째로 잘려 있었던 것이다.
원본 전체 추출은 855엣지인데 그래프엔 436 — **437개(51%) 미반영**. 품질 검사 결과 그 437개 중
파서 노이즈 의심은 2개뿐, 435개가 실제 데이터였다.

→ 2차 병합에서 정책을 **"원본에 있는데 v1에 없는 `(src,tgt)` 쌍은 전부 추가"**로 바꿔 재실행.
결과 **669노드 / 875엣지**. 검증: v1 285엣지 전부 보존 · P2 18/18 · P6 21/21 ·
노드 오염 0(길이이상 0, 문장이 노드로 새어든 것 0) · 의도/큐 노드 1→17개 복구.

교훈 둘: (1) 추출 스크립트를 안 남기면 누락을 검증할 방법이 없다. (2) **"복구했다"고 적어놓고
갯수를 원본과 대조 안 하면 절반이 빠진 채로 복구 완료로 남는다.** 수정은 스크립트를 고쳐 재실행.

## 쓰는 법
- `mech` 문장은 **회원 화면에 그대로 노출 가능** (KB 원문 = 코칭 언어).
- `conf` → 말투 매핑: High="대개 ~때문입니다" / Medium="~일 수도 있습니다" / Pattern Dependent="사람에 따라 다른데".
- 근본원인 = out-degree − in-degree 가 큰 노드 (875엣지·고유쌍 기준):
  `Foot Pressure Anterior Excessive (P1)` 10/1 · `Late Wrist Cock (P2)` 10/1 ·
  `Thorax Rotation Insufficient (P4)` 13/5 · `Weak Grip Match (P1)` 9/2 · `Pelvis Open (P7)` 11/5.
- 말단 증상(헤드라인에 쓰면 안 되는 것) = in-degree 가 큰 노드:
  `Club Face Open (P7)` 14 · `Steep Club Delivery (P5~P6)` 11 · `Chicken Wing (P7)` 11 ·
  `Early Extension (P6~P7)` 9 · `Arm Stuck (팔 끼임)` 9.
- **근본원인 상위 5개 중 3개(발 압력·손목 코킹·그립)는 카메라로 안 보인다.** 설문이 필요한 이유가 이것.

## 주의
- 추출은 자동 파싱이라 노이즈 가능 — 원본 셀과 대조 필요.
- P6 파일은 시트 구조가 달라 별도 처리했음.
