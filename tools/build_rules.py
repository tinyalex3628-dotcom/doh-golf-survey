#!/usr/bin/env python3
"""
판정 규칙 정본(rules/doh_rules.v1.json) → analyzer2.html DOH_RULES 블록 생성기
==========================================================================
왜 (2026-07-28, 앱 운영 준비)
-----------------------------
판정 기준의 실행 정본이 `analyzer2.html` 안 자바스크립트에 박혀 있었다.
웹페이지일 땐 푸시 한 번이면 되지만, **앱이 되면 기준 하나 고칠 때마다 앱
업데이트**가 필요해진다 → 정본을 데이터(`rules/doh_rules.v1.json`)로 분리.
  · 앱/서버: `GET /v1/rules` 로 이 JSON을 받아 판정 → 기준 수정 = 서버 파일 교체.
  · analyzer2(웹): 오프라인(사지방)에서도 열려야 하므로 fetch 대신 **이 스크립트가
    JSON을 HTML 마커 사이에 다시 구워 넣는다** — 한 정본, 기계적 동기화.

사용
----
  python3 tools/build_rules.py          # JSON → analyzer2 블록 재생성(수정 시)
  python3 tools/build_rules.py --check  # 둘이 일치하는지 검사만 (CI용, 불일치=exit 1)

규칙 수정 절차: rules/doh_rules.v1.json 고침 → 이 스크립트 실행 → 커밋.
(analyzer2 쪽 블록을 직접 고치면 --check 가 CI에서 잡는다.)
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULES = os.path.join(ROOT, "rules", "doh_rules.v1.json")
HTML = os.path.join(ROOT, "pose_poc", "analyzer2.html")
MARK_A = "// <<DOH_RULES_GENERATED — tools/build_rules.py가 rules/doh_rules.v1.json에서 생성. 직접 수정 금지>>"
MARK_B = "// <<END DOH_RULES_GENERATED>>"


def js_num(x):
    if x == "INF":
        return "INF"
    if x == "-INF":
        return "-INF"
    return repr(x) if isinstance(x, float) else str(x)


def gen_block(doc):
    lines = ["const DOH_RULES=["]
    for r in doc["rules"]:
        head = f' {{id:{json.dumps(r["id"])},nm:{json.dumps(r["nm"], ensure_ascii=False)},tier:{r["tier"]},'
        if r.get("scale"):
            head += "scale:true,"
        lines.append(head)
        chk = []
        for c in r["checks"]:
            s = (f'{{vf:{json.dumps(c["vf"])},lab:{json.dumps(c["lab"], ensure_ascii=False)},'
                 f't:{json.dumps(c["t"])},B:[{",".join(js_num(b) for b in c["B"])}]')
            if c.get("side"):
                s += f',side:{json.dumps(c["side"], ensure_ascii=False)}'
            chk.append(s + "}")
        lines.append("  checks:[" + (",\n          ".join(chk)) + "],")
        lines.append(f'  why:{json.dumps(r["why"], ensure_ascii=False)}}},')
    lines.append("];")
    return "\n".join(lines)


def main():
    check = "--check" in sys.argv
    doc = json.load(open(RULES, encoding="utf-8"))
    html = open(HTML, encoding="utf-8").read()
    if MARK_A not in html or MARK_B not in html:
        print("❌ analyzer2.html에 생성 마커가 없음 — 최초 이식이 안 된 상태"); sys.exit(1)
    a = html.index(MARK_A) + len(MARK_A)
    b = html.index(MARK_B)
    new = "\n" + gen_block(doc) + "\n"
    if check:
        if html[a:b] == new:
            print(f"✅ 동기화 일치 — 규칙 {len(doc['rules'])}개"); return
        print("❌ rules JSON과 analyzer2 블록 불일치 — tools/build_rules.py 실행 필요"); sys.exit(1)
    open(HTML, "w", encoding="utf-8").write(html[:a] + new + html[b:])
    print(f"✅ analyzer2 DOH_RULES 재생성 — 규칙 {len(doc['rules'])}개")


if __name__ == "__main__":
    main()
