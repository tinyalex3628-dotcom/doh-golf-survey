"""
DOH Vision · 3D 회전 추출 (Tier-B 서버/Colab)
=================================================
WHAM(단일 영상 → SMPL 3D 바디 복원)의 출력에서 골프 스윙의
흉곽(thorax)·골반(pelvis) 회전량을 '실제 각도'로 뽑는다.

핵심 아이디어
-------------
회전 계산 수식(어깨선/골반선의 수직축 azimuth)은 브라우저(analyzer2)와
'똑같다'. 달라지는 건 입력이다.
  - 브라우저: MediaPipe world z (단일프레임, 깊이 약함) → 정면 회전 붕괴(-19°)
  - 여기:     WHAM SMPL 3D 관절 (인체 프라이어 + 시간축으로 깊이 복원)
즉 "방법"이 아니라 "3D 품질"을 갈아끼우는 것. 같은 azimuth를 정확한 3D에
먹이면 정면 백스윙탑도 실제(~80~90°)에 근접해야 한다. (Phase 1 = 이 가설 검증)

입력
----
WHAM demo.py 산출물 `wham_output.pkl` (dict). 트랙별로 아래 중 하나 이상:
  - 'joints'      : (T, J, 3) 3D 관절 좌표(월드 또는 카메라). ← 이걸 우선 사용
  - 'verts'       : (T, V, 3) (대안)
  - 'pose'/'poses_body','global_orient','trans' : SMPL 파라미터(대안, FK 필요)
관절 인덱스는 SMPL-24 기준 기본값을 쓰되, --check로 실제 배열을 눈으로 확인 후 조정.

사용
----
  python wham_golf_rotation.py wham_output.pkl \
      --p1 12 --p4 78 --p7 96          # (선택) 어드레스/탑/임팩트 프레임
  python wham_golf_rotation.py wham_output.pkl --check   # 배열 shape만 확인

의존성: numpy, matplotlib(그래프 저장 시)
"""
import sys, os, pickle, argparse
import numpy as np

# --- 스켈레톤별 관절 인덱스 프리셋 ---
# 모델마다 관절 순서가 다르므로 --skeleton 로 선택. 회전엔 어깨/골반 4점만 필요.
SKELETONS = {
    # WHAM 등 SMPL-24
    "smpl": dict(l_shoulder=16, r_shoulder=17, l_hip=1, r_hip=2),
    # Human3.6M 17관절 (MMPose human3d, VideoPose3D, MotionBERT 등)
    "h36m": dict(l_shoulder=11, r_shoulder=14, l_hip=4, r_hip=1),
    # COCO 17관절
    "coco": dict(l_shoulder=5, r_shoulder=6, l_hip=11, r_hip=12),
}
SMPL = SKELETONS["smpl"]  # 하위호환


def load_results(path):
    with open(path, "rb") as f:
        data = pickle.load(f)
    return data


def pick_track(data):
    """WHAM 결과는 보통 {track_id: {...}} 또는 단일 dict. 가장 긴 트랙 선택."""
    if isinstance(data, dict) and any(isinstance(v, dict) for v in data.values()):
        # {track_id: subdict}
        best, blen = None, -1
        for k, v in data.items():
            if not isinstance(v, dict):
                continue
            arr = _first_seq(v)
            n = 0 if arr is None else len(arr)
            if n > blen:
                best, blen = v, n
        if best is not None:
            return best
    return data


def _first_seq(d):
    for key in ("joints", "verts", "pose", "poses_body", "trans", "global_orient"):
        if key in d and d[key] is not None:
            return np.asarray(d[key])
    return None


def get_joints(track):
    """
    (T, J, 3) 3D 관절을 확보한다.
    1순위: track['joints'] 가 이미 (T,J,3)
    2순위: SMPL 파라미터로부터 FK — 여기선 지원 안 함(무겁다). joints를 저장하도록
           WHAM demo에서 --save_joints 또는 결과 dict에 joints 포함 필요.
    """
    for key in ("joints", "joints3d", "kp_3d", "j3d"):
        if key in track and track[key] is not None:
            J = np.asarray(track[key])
            if J.ndim == 3 and J.shape[-1] == 3:
                return J
    raise SystemExit(
        "3D 관절 배열(joints, (T,J,3))을 못 찾음. --check 로 키/shape 확인 후 "
        "get_joints()의 키 목록을 조정하거나, WHAM 결과에 3D 관절을 포함해 저장하세요."
    )


def estimate_up(J, sh_l, sh_r, hp_l, hp_r):
    """월드 up(수직) 축을 데이터에서 추정: 평균 (어깨중심 - 골반중심) 방향.
    (WHAM 월드좌표의 y/z-up 규약에 의존하지 않기 위함)"""
    mid_sh = 0.5 * (J[:, sh_l] + J[:, sh_r])
    mid_hp = 0.5 * (J[:, hp_l] + J[:, hp_r])
    up = (mid_sh - mid_hp).mean(axis=0)
    n = np.linalg.norm(up)
    return up / (n + 1e-9)


def plane_basis(up):
    """up에 수직인 평면의 정규직교 기저 (e1, e2) 생성."""
    ref = np.array([1.0, 0.0, 0.0])
    if abs(np.dot(ref, up)) > 0.9:            # up과 거의 평행하면 다른 축 사용
        ref = np.array([0.0, 0.0, 1.0])
    e1 = ref - np.dot(ref, up) * up
    e1 /= (np.linalg.norm(e1) + 1e-9)
    e2 = np.cross(up, e1)
    return e1, e2


def azimuth_series(J, a, b, up, e1, e2):
    """관절 a→b 벡터를 수평면(⟂up)에 투영한 azimuth(도), 연속 unwrap."""
    v = J[:, b] - J[:, a]                      # (T,3)
    x = v @ e1
    y = v @ e2
    ang = np.degrees(np.arctan2(y, x))         # (T,)
    ang = np.degrees(np.unwrap(np.radians(ang)))
    return ang


def turn_relative(ang, ref_frame):
    """어드레스(ref_frame) 기준 상대 회전량. ref 없으면 첫 프레임."""
    r = ang[ref_frame] if (ref_frame is not None and 0 <= ref_frame < len(ang)) else ang[0]
    return ang - r


def analyze(path, p1=None, p4=None, p7=None, save_png=None, check=False, skeleton="smpl"):
    jm = SKELETONS[skeleton]
    data = load_results(path)
    track = pick_track(data)

    if check:
        print("== track keys / shapes ==")
        for k, v in track.items():
            try:
                a = np.asarray(v)
                print(f"  {k:16s} shape={a.shape} dtype={a.dtype}")
            except Exception:
                print(f"  {k:16s} (non-array: {type(v).__name__})")
        print(f"\nskeleton={skeleton} 인덱스:", jm)
        print("joints가 (T,J,3)인지, J가 프리셋 최대인덱스보다 큰지 확인.")
        return

    J = get_joints(track)
    T = J.shape[0]
    print(f"프레임 {T} · 관절 {J.shape[1]} · skeleton={skeleton}")

    up = estimate_up(J, jm["l_shoulder"], jm["r_shoulder"], jm["l_hip"], jm["r_hip"])
    e1, e2 = plane_basis(up)
    print(f"추정 up축: [{up[0]:+.2f} {up[1]:+.2f} {up[2]:+.2f}]")

    sh_az = azimuth_series(J, jm["r_shoulder"], jm["l_shoulder"], up, e1, e2)  # 흉곽
    hp_az = azimuth_series(J, jm["r_hip"], jm["l_hip"], up, e1, e2)            # 골반

    sh_turn = turn_relative(sh_az, p1)
    hp_turn = turn_relative(hp_az, p1)
    xfactor = sh_turn - hp_turn

    def at(fr, name, arr):
        if fr is None:
            return
        fr = max(0, min(T - 1, fr))
        print(f"  {name:10s}(f{fr:>4d}):  흉곽 {sh_turn[fr]:+6.1f}°   "
              f"골반 {hp_turn[fr]:+6.1f}°   X-Factor {xfactor[fr]:+6.1f}°")

    print("\n== 어드레스(P1) 대비 회전량 ==")
    at(p1, "P1 어드레스", None)
    at(p4, "P4 탑", None)
    at(p7, "P7 임팩트", None)
    if p4 is not None:
        top = max(0, min(T - 1, p4))
        print(f"\n검증 포인트: 백스윙탑 흉곽 = {abs(sh_turn[top]):.0f}° "
              f"(기대 ~80~90°. MediaPipe 브라우저판은 여기서 -19° 나왔음)")

    if save_png:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            fig, ax = plt.subplots(figsize=(10, 4))
            ax.plot(sh_turn, label="흉곽(thorax)")
            ax.plot(hp_turn, label="골반(pelvis)")
            ax.plot(xfactor, "--", label="X-Factor")
            for fr, nm, c in [(p1, "P1", "gray"), (p4, "P4", "red"), (p7, "P7", "green")]:
                if fr is not None:
                    ax.axvline(fr, color=c, alpha=.5, lw=1)
                    ax.text(fr, ax.get_ylim()[1], nm, color=c, fontsize=8, va="top")
            ax.axhline(0, color="k", lw=.5)
            ax.set_xlabel("frame"); ax.set_ylabel("rotation (deg)")
            ax.legend(); ax.set_title("DOH · WHAM 3D rotation (address-relative)")
            fig.tight_layout(); fig.savefig(save_png, dpi=120)
            print(f"\n그래프 저장: {save_png}")
        except Exception as e:
            print("그래프 저장 실패:", e)

    return dict(sh_turn=sh_turn, hp_turn=hp_turn, xfactor=xfactor, up=up)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pkl", help="WHAM demo 결과 .pkl 경로")
    ap.add_argument("--p1", type=int, default=None, help="어드레스 프레임")
    ap.add_argument("--p4", type=int, default=None, help="백스윙탑 프레임")
    ap.add_argument("--p7", type=int, default=None, help="임팩트 프레임")
    ap.add_argument("--png", default=None, help="그래프 저장 경로(png)")
    ap.add_argument("--skeleton", default="smpl", choices=list(SKELETONS),
                    help="관절 순서: smpl(WHAM) / h36m(MMPose·MotionBERT) / coco")
    ap.add_argument("--check", action="store_true", help="배열 키/shape만 출력")
    a = ap.parse_args()
    analyze(a.pkl, a.p1, a.p4, a.p7, a.png, a.check, a.skeleton)


if __name__ == "__main__":
    main()
