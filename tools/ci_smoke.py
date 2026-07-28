#!/usr/bin/env python3
"""
엔진 통합 스모크 (CI용) — 합성 스윙 → build_v1 → 계약 스키마 검증
================================================================
selfcheck(계산식 단위검증)와 별개로, 콜랩/서버가 실제로 부르는 `build_v1` 경로
전체가 살아있는지 확인한다: 이벤트 검출 → 회전 → metrics → doh.vision.v1 조립.
GPU/NLF 불필요(관절은 합성). 실행: `python3 tools/ci_smoke.py` (numpy 필요).
실패 조건: 스키마 위반 / P순서 붕괴 / 핵심 feature 누락 / 뷰 게이팅 파손.
"""
import sys, os, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "pose3d_poc"))
sys.path.insert(0, os.path.join(ROOT, "schema"))

from selfcheck_metrics import skeleton as address_pose, SMPL24   # noqa: E402
from wham_golf_rotation import build_v1                          # noqa: E402
import validate as contract                                      # noqa: E402


def rot_about(p, c, deg):
    a = math.radians(deg); ca, sa = math.cos(a), math.sin(a)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * ca - y * sa, c[1] + x * sa + y * ca, p[2])


def swing(T=180):
    """어드레스→탑(-100°/-32°)→임팩트(0°)→피니시(+85°/+50°) 합성 스윙."""
    base = address_pose(8.0, T=1)[0]
    c_sh, c_hp = (0.0, 0.10), (0.0, 0.0)
    UPPER = ["neck", "head", "l_shoulder", "r_shoulder", "l_elbow", "r_elbow", "l_wrist", "r_wrist"]
    PELV = ["pelvis", "l_hip", "r_hip"]

    def prof(u, top, fin):
        A, B, C = 0.12, 0.55, 0.72
        if u < A: return 0.0
        if u < B: s = (u - A) / (B - A); return top * (0.5 - 0.5 * math.cos(math.pi * s))
        if u < C: s = (u - B) / (C - B); return top * (0.5 + 0.5 * math.cos(math.pi * s))
        return fin * (0.5 - 0.5 * math.cos(math.pi * (u - C) / (1 - C)))

    out = []
    for t in range(T):
        u = t / (T - 1)
        th, pv = prof(u, -100.0, 85.0), prof(u, -32.0, 50.0)
        w = math.sin(2 * math.pi * t / T)
        p = list(base)
        for k in UPPER: p[SMPL24[k]] = rot_about(base[SMPL24[k]], c_sh, th)
        for k in PELV:  p[SMPL24[k]] = rot_about(base[SMPL24[k]], c_hp, pv)
        lift = 0.55 * max(0.0, -th / 100.0) + (max(0.0, (u - 0.72) / 0.28) ** 1.5) * 0.75
        for k in ("l_wrist", "r_wrist"):
            x, y, z = p[SMPL24[k]]; p[SMPL24[k]] = (x, y, z + lift)
        for k, sgn in (("l_ankle", 1), ("r_ankle", -1)):
            x, y, z = p[SMPL24[k]]; p[SMPL24[k]] = (x + 0.02 * w, y + 0.01 * w * sgn, z)
        out.append(p)
    return out


def main():
    J = swing()
    schema = contract.load(contract.SCHEMA_PATH)
    fails = []
    for view in ("FO", "DTL"):
        d = build_v1(J, skeleton="smpl", view=view, hand="right", fps=60.0, video_id="ci")
        errs, _mode = contract.validate(d, schema)
        if errs: fails.append(f"[{view}] 스키마 위반 {len(errs)}: {errs[:2]}")
        ev = {e["p"]: e["frame"] for e in d.get("swing_events", [])}
        order = [ev[p] for p in ("P1", "P2", "P3", "P4", "P5", "P7", "P9", "P10") if p in ev]
        if order != sorted(order) or "P2" not in ev:
            fails.append(f"[{view}] P순서/P2 이상: {ev}")
        fd = {f["feature_id"]: f for f in d["features"]}
        for vfid in ("VF015", "VF020", "VF008", "VF028", "VF152", "VF157", "VF013"):
            if vfid not in fd: fails.append(f"[{view}] {vfid} 미방출")
        gate = {"FO": ("VF008", "VF028"), "DTL": ("VF028", "VF008")}[view]
        if fd[gate[0]]["value"] is None: fails.append(f"[{view}] {gate[0]} 이(가) null (게이팅 파손)")
        if fd[gate[1]]["value"] is not None: fails.append(f"[{view}] {gate[1]} 이(가) 값 있음 (게이팅 파손)")
        print(f"[{view}] feature {len(d['features'])} · events {list(ev)} · 스키마 {'PASS' if not errs else 'FAIL'}")
    if fails:
        print("\n❌ " + "\n❌ ".join(fails)); sys.exit(1)
    print("✅ 통합 스모크 전부 통과")


if __name__ == "__main__":
    main()
