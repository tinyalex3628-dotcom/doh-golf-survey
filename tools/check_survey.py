#!/usr/bin/env python3
"""설문 문항이 KB 인과그래프에 실제로 물려 있는지 검사한다.

설문의 존재 이유는 하나다 — 카메라로 안 보이는 원인을 회원 입으로 받는 것.
그러니 모든 선택지는 (1) KB에 실존하는 노드를 가리켜야 하고, (2) 그 노드에서
실제로 뻗어나가는 엣지가 있어야 한다. 둘 중 하나라도 어긋나면 그 문항은
답을 받아도 추론에 쓸 데가 없는 죽은 문항이다.

    python3 tools/check_survey.py          # 검사
    python3 tools/check_survey.py -v       # 문항별 도달 엣지까지 출력

실패하면 exit 1 — CI에서 그대로 쓴다.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRAPH = os.path.join(ROOT, "kb", "kb_causal_graph.json")
SURVEY = os.path.join(ROOT, "rules", "doh_survey.v1.json")

# 엔진이 카메라로 이미 측정하는 주제 — 설문이 여기 손대면 안 된다
MEASURED = ["스웨이", "얼리", "익스텐션", "척추각", "회전량", "무릎 각",
            "머리 움직임", "템포", "어깨 높이"]


def main() -> int:
    verbose = "-v" in sys.argv
    g = json.load(open(GRAPH, encoding="utf-8"))
    s = json.load(open(SURVEY, encoding="utf-8"))

    edges = g["edges"]
    out = {}
    for e in edges:
        out.setdefault(e["src"].strip(), []).append(e)
    known = set(out) | {e["tgt"].strip() for e in edges}

    bad_node, dead_option, measured_hit, stale = [], [], [], []
    reach_total = set()

    for q in s["questions"]:
        qreach = set()
        for o in q["options"]:
            acts = o.get("activates", [])
            if not acts:
                continue                      # 중립/모름 선택지는 정상
            hit = 0
            for n in acts:
                if n not in known:
                    bad_node.append((q["id"], o["label"], n))
                    continue
                es = out.get(n, [])
                hit += len(es)
                for e in es:
                    qreach.add((e["src"].strip(), e["tgt"].strip()))
            if hit == 0:
                dead_option.append((q["id"], o["label"]))
        for word in MEASURED:
            if word in q["title"]:
                measured_hit.append((q["id"], word))
        reach_total |= qreach
        if q.get("reach_direct") != len(qreach):
            stale.append((q["id"], q.get("reach_direct"), len(qreach)))
        if verbose:
            print(f"{q['id']:22s} 직접 {len(qreach):3d} · 체인포함 {q.get('reach_chain','?'):>3}")

    uniq = {(e["src"].strip(), e["tgt"].strip()) for e in edges}
    print(f"\n문항 {len(s['questions'])}개 → KB 고유 엣지 {len(uniq)}개 중 "
          f"{len(reach_total)}개({len(reach_total)*100//len(uniq)}%)에 직접 도달")

    ok = True
    if bad_node:
        ok = False
        print(f"\n✗ KB에 없는 노드를 가리키는 선택지 {len(bad_node)}개:")
        for q, lab, n in bad_node:
            print(f"    {q} · {lab[:30]} → '{n}'")
    if dead_option:
        ok = False
        print(f"\n✗ 가리키는 노드에서 나가는 엣지가 없는 선택지 {len(dead_option)}개:")
        for q, lab in dead_option:
            print(f"    {q} · {lab[:40]}")
    if stale:
        ok = False
        print(f"\n✗ reach_direct 값이 실측과 다른 문항 {len(stale)}개 (그래프가 바뀌었으면 갱신할 것):")
        for q, w, real in stale:
            print(f"    {q} — 기록 {w} / 실측 {real}")
    if measured_hit:
        ok = False
        print(f"\n✗ 엔진이 이미 측정하는 주제를 묻는 문항 {len(measured_hit)}개:")
        for q, w in measured_hit:
            print(f"    {q} — '{w}'")

    print("\nOK — 모든 선택지가 KB에 살아 있는 노드에 물려 있다." if ok
          else "\nFAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
