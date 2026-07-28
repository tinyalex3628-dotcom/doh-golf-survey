#!/usr/bin/env python3
"""
DOH Vision · metrics 자기검증 (합성 스켈레톤 vs 기하 정답)
=========================================================
NLF도 GPU도 영상도 없이 `wham_golf_metrics.py` 의 계산식이 **기하학적으로 맞는지**
확인한다. 실측 스윙으로는 '정답'을 모르니 계산식 검증이 불가능하다 → 정답을 아는
합성 자세를 만들어 넣고 되나오는 값을 대조한다.

실행: `python3 pose3d_poc/selfcheck_metrics.py`  (의존성 없음, 표준 라이브러리만)
종료코드 0 = 전부 통과, 1 = 하나라도 실패.

현재 커버: VF008(어깨 기울기 @P1).
  ※ VF028(Hand Depth)·VF067 등은 아직 미수록 — 추가할 땐 아래 패턴 그대로.
"""
import sys, math, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wham_golf_metrics import compute_metrics, SMPL24

FAIL = []

# 좌표계: x = 타깃선(좌우), y = 볼 방향(앞뒤), z = 위(up)
SHW = 0.40      # 어깨너비
STW = 0.50      # 스탠스폭


def skeleton(tilt_deg, T=40, up_err_deg=0.0, up_axis="x"):
    """리드 어깨가 트레일보다 tilt_deg 만큼 '위'인 어드레스 자세를 만든다.
    오른손잡이(hand=right) → lead=l_*, trail=r_*.
    l_shoulder를 +x, r_shoulder를 -x 에 두고 z를 어깨너비*sin(tilt) 만큼 벌린다.
    발목은 프레임마다 지면(z=0) 위에서 조금씩 흔들린다 — 정지 스켈레톤이면
    지면 점구름이 1차원으로 퇴화해 up축 PCA가 성립하지 않기 때문(실제 스윙엔
    체중이동이 있으므로 이쪽이 현실적).
    up_err_deg/up_axis: 지면 증거(발목·발)만 기울여 estimate_up 이 '틀린 up'을
    돌려주게 만든다 — up축 추정오차가 이 지표에 얼마나 전파되는지 보기 위함."""
    dz = SHW * math.sin(math.radians(tilt_deg))
    dx = SHW * math.cos(math.radians(tilt_deg))
    frames = []
    for t in range(T):
        w = math.sin(2 * math.pi * t / T)          # 체중이동(좌우) + 미세 전후
        p = [(0.0, 0.0, 0.0)] * 24
        p[SMPL24["l_ankle"]] = (+STW / 2 + 0.02 * w, 0.010 * w, 0.0)
        p[SMPL24["r_ankle"]] = (-STW / 2 + 0.02 * w, -0.010 * w, 0.0)
        p[SMPL24["l_foot"]] = (+STW / 2, 0.10, 0.0)
        p[SMPL24["r_foot"]] = (-STW / 2, 0.10, 0.0)
        p[SMPL24["pelvis"]] = (0.0, 0.0, 0.95)
        p[SMPL24["l_hip"]] = (+0.10, 0.0, 0.95)
        p[SMPL24["r_hip"]] = (-0.10, 0.0, 0.95)
        p[SMPL24["l_knee"]] = (+0.12, 0.05, 0.50)
        p[SMPL24["r_knee"]] = (-0.12, 0.05, 0.50)
        p[SMPL24["neck"]] = (0.0, 0.10, 1.40)
        p[SMPL24["head"]] = (0.0, 0.12, 1.55)
        p[SMPL24["l_shoulder"]] = (+dx / 2, 0.10, 1.35 + dz / 2)
        p[SMPL24["r_shoulder"]] = (-dx / 2, 0.10, 1.35 - dz / 2)
        p[SMPL24["l_elbow"]] = (+0.18, 0.22, 1.10)
        p[SMPL24["r_elbow"]] = (-0.18, 0.22, 1.10)
        # 손은 어드레스에서 골반(0.95)보다 아래 — 실제 자세. P2 프록시(손높이가
        # 골반높이를 넘는 프레임)가 성립하려면 이게 맞다 (전엔 0.95로 같아서 무의미했음).
        p[SMPL24["l_wrist"]] = (+0.05, 0.35, 0.80)
        p[SMPL24["r_wrist"]] = (-0.05, 0.35, 0.80)
        if up_err_deg:
            # 지면 증거(발목·발)만 기울인다 → estimate_up 이 '틀린 up'을 돌려주게 만든다.
            # 몸 전체를 돌리면 강체회전이라 아무것도 안 변함(불변) — 오차 주입이 안 됨.
            a = math.radians(up_err_deg)
            ca, sa = math.cos(a), math.sin(a)
            if up_axis == "x":     # 시상면 기울기(앞숙임 오추정) — up이 y-z 평면서 기움
                rot = lambda q: (q[0], ca * q[1] - sa * q[2], sa * q[1] + ca * q[2])
            else:                  # 전두면 롤 — up이 x-z 평면서 기움 (어깨선과 같은 평면)
                rot = lambda q: (ca * q[0] + sa * q[2], q[1], -sa * q[0] + ca * q[2])
            for k in ("l_ankle", "r_ankle", "l_foot", "r_foot"):
                p[SMPL24[k]] = rot(p[SMPL24[k]])
        frames.append(p)
    return frames


def vf(feats, fid):
    for f in feats:
        if f["feature_id"] == fid:
            return f
    return None


def ok(cond, label):
    if not cond:
        FAIL.append(label)
    return "OK" if cond else "FAIL"


print("=== VF008 어깨 기울기 @P1 — 기하 정답 대조 (정면 FO, 오른손잡이) ===")
print("  + = 리드 어깨가 높다 = 트레일 어깨가 낮다 (오른손잡이의 정상 방향)")
print(f"{'정답(°)':>8} {'측정(°)':>8} {'오차':>7}   판정")
worst = 0.0
for truth in (15.0, 10.0, 6.0, 3.0, 0.0, -5.0):
    J = skeleton(truth)
    feats = compute_metrics(J, 0, 20, 35, len(J), fps=30, hand="right",
                            view="FO", skeleton="smpl")
    f = vf(feats, "VF008")
    err = abs(f["value"] - truth)
    worst = max(worst, err)
    print(f"{truth:8.1f} {f['value']:8.1f} {err:7.2f}   "
          f"{ok(err <= 0.3, f'VF008 정답대조 {truth}°')}")
print(f"최대오차 {worst:.2f}°")

# 좌우 대칭성: 왼손잡이는 lead=r_* 이므로 같은 스켈레톤에서 부호가 뒤집혀야 한다
J = skeleton(10.0)
fr = vf(compute_metrics(J, 0, 20, 35, len(J), fps=30, hand="right", view="FO",
                        skeleton="smpl"), "VF008")
fl = vf(compute_metrics(J, 0, 20, 35, len(J), fps=30, hand="left", view="FO",
                        skeleton="smpl"), "VF008")
print(f"\n좌우 대칭: 오른손 {fr['value']:+.1f}° / 왼손 {fl['value']:+.1f}° "
      f"→ {ok(abs(fr['value'] + fl['value']) < 0.2, 'VF008 좌우 대칭')}")

# 뷰 게이팅: 측면(DTL)에선 어깨너비(분모)가 깊이축이라 각도 신뢰불가 → null
fd = vf(compute_metrics(J, 0, 20, 35, len(J), fps=30, hand="right", view="DTL",
                        skeleton="smpl"), "VF008")
print(f"측면(DTL) 게이팅: value={fd['value']} flags={fd['error_flags']} conf={fd['confidence']} "
      f"→ {ok(fd['value'] is None and 'view_mismatch' in fd['error_flags'], 'VF008 뷰 게이팅')}")

# up축 추정오차 전파 — 이 지표의 지배적 오차원. 기준치 여유폭의 근거가 된다.
print("\n=== up축 추정오차 전파 (정답 10.0°) — 지면 증거만 기울여 up을 틀리게 만듦 ===")
prop = {}
for axis, nm in (("x", "시상면(앞숙임 오추정)"), ("y", "전두면 롤(어깨선과 같은 평면)")):
    print(f"  [{nm}]")
    for ue in (0.0, 2.0, 5.0, 10.0):
        f = vf(compute_metrics(skeleton(10.0, up_err_deg=ue, up_axis=axis), 0, 20, 35, 40,
                               fps=30, hand="right", view="FO", skeleton="smpl"), "VF008")
        prop[(axis, ue)] = f["value"] - 10.0
        print(f"    up 오차 {ue:4.1f}° → 측정 {f['value']:6.2f}° "
              f"(편차 {f['value']-10.0:+.2f}°, conf {f['confidence']})")
print(f"  → 시상면 오차는 거의 전파 안 됨({ok(abs(prop[('x', 10.0)]) < 1.0, 'up 시상면 둔감')}), "
      f"전두면 롤은 1:1 전파({ok(abs(prop[('y', 5.0)] - 5.0) < 0.5, 'up 전두면 1:1')}).")
print("    ⇒ 기준치 여유폭은 '전두면 up 롤 오차'가 결정한다. 판정 하한 5°는 그 여유.")

# feature 총개수
n = len(compute_metrics(J, 0, 20, 35, len(J), fps=30, hand="right", view="FO",
                        skeleton="smpl"))
print(f"\nmetrics feature 수: {n}")

if FAIL:
    print(f"\n❌ 실패 {len(FAIL)}건: " + " / ".join(FAIL))
    sys.exit(1)
print("\n✅ 전부 통과")

