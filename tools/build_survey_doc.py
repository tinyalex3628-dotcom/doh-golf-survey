#!/usr/bin/env python3
"""설문 정본(rules/doh_survey.v1.json) → 프로토타입용 문항표 마크다운.

표를 손으로 쓰면 정본과 어긋난다. 정본만 고치고 이 스크립트를 돌린다.

    python3 tools/build_survey_doc.py           # docs/DOH_설문_문항표.md 갱신
    python3 tools/build_survey_doc.py --check   # 어긋나면 exit 1 (CI용)
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SURVEY = os.path.join(ROOT, "rules", "doh_survey.v1.json")
DOC = os.path.join(ROOT, "docs", "DOH_설문_문항표.md")

TYPE_KO = {"single": "단일선택", "multi": "복수선택"}


def render() -> str:
    s = json.load(open(SURVEY, encoding="utf-8"))
    L = []
    a = L.append

    a("# DOH 설문 문항표 (프로토타입 이식용)")
    a("")
    a(f"정본: `rules/doh_survey.v1.json` · 갱신 {s['updated']} · "
      "**이 파일은 `tools/build_survey_doc.py`가 생성한다. 직접 고치지 말 것.**")
    a("")
    a(f"- **묻는 시점**: 분석 **{'전' if s['policy']['when']=='before_analysis' else '후'}** "
      f"— {s['policy']['why_before']}")
    a(f"- **문항 수**: {s['policy']['count']}개 + 안전게이트 {s['policy']['plus_gate']}개")
    a(f"- **철칙**: {s['policy']['rule']}")
    a(f"- **답 신뢰도 기준**: {s['policy']['answer_reliability_filter']}")
    a("")
    a("앱은 선택지의 **한글 라벨이 아니라 `값`(영문 ID)을 저장·전송**한다. "
      "라벨은 문구 다듬으면 바뀌지만 값은 안 바뀐다.")
    a("")

    a("## 한눈에 보기")
    a("")
    a("| # | 문항 | 형식 | 메우는 구멍 | 도달 엣지 |")
    a("|---|---|---|---|---|")
    for q in s["questions"]:
        t = TYPE_KO[q["type"]] + (f" (최대 {q['max']})" if q.get("max") else "")
        a(f"| {q['order']} | {q['title']} | {t} | {q['covers']} "
          f"| 직접 {q['reach_direct']} · 체인 {q['reach_chain']} |")
    a(f"| G | {s['gate']['title']} | {TYPE_KO[s['gate']['type']]} "
      f"| (비채점) 안전게이트 | — |")
    a("")

    a("## 문항별 선택지")
    a("")
    for q in s["questions"]:
        a(f"### Q{q['order']}. {q['title']}")
        a("")
        a(f"`{q['id']}` · {TYPE_KO[q['type']]}"
          + (f" · 최대 {q['max']}개" if q.get("max") else ""))
        if q.get("hint"):
            a("")
            a(f"> 화면 안내문: {q['hint']}")
        a("")
        a("| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |")
        a("|---|---|---|---|")
        for o in q["options"]:
            acts = o.get("activates", [])
            if acts:
                cell = "<br>".join(f"`{n}`" for n in acts)
            elif o.get("skip"):
                cell = "— (건너뜀)"
            else:
                cell = "— (중립)"
            a(f"| `{o['id']}` | {o['label']} | {cell} | {o['w']} |")
        a("")
        for k, head in (("note", "설계 메모"), ("why_matters", "왜 필요한가")):
            if q.get(k):
                a(f"**{head}** — {q[k]}")
                a("")

    g = s["gate"]
    a(f"### G. {g['title']}")
    a("")
    a(f"`{g['id']}` · {TYPE_KO[g['type']]} · **채점하지 않는다**")
    a("")
    a("| 값 | 선택지 |")
    a("|---|---|")
    for o in g["options"]:
        a(f"| `{o['id']}` | {o['label']} |")
    a("")
    a(f"**용도** — {g['purpose']}")
    a("")
    a(f"**동작** — {g['effect']}")
    a("")

    r = s["removed_from_old_survey"]
    a("## 기존 설문에서 빼는 것")
    a("")
    a(r["why"])
    a("")
    a("| 빼는 주제 |")
    a("|---|")
    for t in r["topics"]:
        a(f"| {t} |")
    a("")
    a(f"엔진 측정 항목과 겹치는 KB 노드 **{r['overlapping_kb_nodes']}개**. {r['rule']}")
    a("")

    a("## 응답 저장 형식 (앱 → 서버)")
    a("")
    a("```json")
    a(json.dumps({
        "schema": "doh.survey.answers.v1",
        "answers": {
            q["id"]: (q["options"][0]["id"] if q["type"] == "single"
                      else [q["options"][0]["id"]])
            for q in s["questions"]
        },
        s["gate"]["id"]: ["NONE"],
    }, ensure_ascii=False, indent=2))
    a("```")
    a("")
    a("- 단일선택은 문자열, 복수선택은 배열.")
    a("- 회원이 답을 안 하면 그 키를 **아예 빼서** 보낸다 (빈 문자열 금지).")
    a("- 추론기는 선택지의 `activates` 노드를 그래프 탐색 **시드**로 넣고 "
      "`w`를 초기 확신도로 쓴다.")
    a("")
    return "\n".join(L) + "\n"


def main() -> int:
    new = render()
    if "--check" in sys.argv:
        old = open(DOC, encoding="utf-8").read() if os.path.exists(DOC) else ""
        if old != new:
            print("FAIL — 문항표가 정본과 어긋남. "
                  "`python3 tools/build_survey_doc.py` 실행할 것.")
            return 1
        print("OK — 문항표가 정본과 일치.")
        return 0
    os.makedirs(os.path.dirname(DOC), exist_ok=True)
    open(DOC, "w", encoding="utf-8").write(new)
    print(f"생성 완료: {os.path.relpath(DOC, ROOT)} ({len(new.splitlines())}줄)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
