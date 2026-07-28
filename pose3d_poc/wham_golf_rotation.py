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
    "smpl": dict(l_shoulder=16, r_shoulder=17, l_hip=1, r_hip=2, l_wrist=20, r_wrist=21),
    # Human3.6M 17관절 (MMPose human3d, VideoPose3D, MotionBERT 등)
    "h36m": dict(l_shoulder=11, r_shoulder=14, l_hip=4, r_hip=1, l_wrist=13, r_wrist=16),
    # COCO 17관절
    "coco": dict(l_shoulder=5, r_shoulder=6, l_hip=11, r_hip=12, l_wrist=9, r_wrist=10),
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
    (WHAM 월드좌표의 y/z-up 규약에 의존하지 않기 위함)
    ⚠️ 앞굽힘(어드레스 ~40°)만큼 기울어지는 편향 있음 → best_up()이 발목-PCA를 우선 시도."""
    mid_sh = 0.5 * (J[:, sh_l] + J[:, sh_r])
    mid_hp = 0.5 * (J[:, hp_l] + J[:, hp_r])
    up = (mid_sh - mid_hp).mean(axis=0)
    n = np.linalg.norm(up)
    return up / (n + 1e-9)


def best_up(J, jm, skeleton, p_lo=0, p_hi=None):
    """up축 추정 우선순위: ① 발목-PCA(metrics.estimate_up, 합성 오차<0.2°·굽힘 무관)
    ② 몸통평균(폴백). 반환 (up ndarray, method str).
    합성검증(2026-07-24): 굽힘 40°에서 몸통평균 up은 골반턴을 ~5° 왜곡 → 발목-PCA가 정답."""
    T = int(J.shape[0])
    if skeleton == "smpl":
        try:
            from wham_golf_metrics import estimate_up as up_pca, SMPL24
            u, q = up_pca(J, T, SMPL24, p_lo, p_hi if p_hi is not None else T - 1)
            if u is not None and q >= 0.25:
                return np.asarray(u, float), "ankle_pca"
        except Exception:
            pass
    return estimate_up(J, jm["l_shoulder"], jm["r_shoulder"], jm["l_hip"], jm["r_hip"]), "torso_mean"


def smooth_joints(J, med=5, avg=3):
    """시간축 스무딩 — NLF 저자 공식 파이프라인(isarandi/nlf-pipeline)의
    'median-like temporal smoothing'을 이식: 프레임별 지터·스파이크 제거.
    median(윈도 med) → moving average(윈도 avg). 학습 불필요, (T,J,3) 그대로."""
    J = np.asarray(J, float)
    T = J.shape[0]
    if T < med + 2:
        return J
    from numpy.lib.stride_tricks import sliding_window_view
    def _pad(a, w):
        k = w // 2
        return np.concatenate([a[:1].repeat(k, 0), a, a[-1:].repeat(k, 0)], axis=0)
    out = np.median(sliding_window_view(_pad(J, med), med, axis=0), axis=-1)
    out = np.mean(sliding_window_view(_pad(out, avg), avg, axis=0), axis=-1)
    return out


def axial_turn_series(J, jm, up, sh_az_ref=None):
    """회전 분해(합성 GT 검증: X-Factor 오차 5.9°→0.0°, 2026-07-24):
      골반턴 = 힙라인의 수직축(up) azimuth  (골반은 수평 유지라 투영 안전)
      X-Factor = 어깨선을 '그 프레임 몸통축⊥평면'에 투영해 힙라인과 이룬 각(축회전)
                 → 어깨 측면기울임(탑에서 ~25°)이 지면투영을 부풀리던 문제 소거
      어깨턴 = 골반턴 + X-Factor
    반환: (sh_turn_abs, hp_turn_abs, xf_abs) — 절대열(P1 기준화는 호출자가)."""
    T = int(J.shape[0])
    e1, e2 = plane_basis(up)
    hp_az = azimuth_series(J, jm["r_hip"], jm["l_hip"], up, e1, e2)
    # 몸통축: 골반중심→어깨중심 (프레임별)
    mid_sh = 0.5 * (J[:, jm["l_shoulder"]] + J[:, jm["r_shoulder"]])
    mid_hp = 0.5 * (J[:, jm["l_hip"]] + J[:, jm["r_hip"]])
    yp = mid_sh - mid_hp
    yp /= (np.linalg.norm(yp, axis=1, keepdims=True) + 1e-9)
    xp = J[:, jm["l_hip"]] - J[:, jm["r_hip"]]                     # 힙라인(r→l)
    xp = xp - (xp * yp).sum(1, keepdims=True) * yp
    xp /= (np.linalg.norm(xp, axis=1, keepdims=True) + 1e-9)
    zp = np.cross(xp, yp)
    s = J[:, jm["l_shoulder"]] - J[:, jm["r_shoulder"]]            # 어깨선(r→l)
    s = s - (s * yp).sum(1, keepdims=True) * yp                    # 측면기울임 성분 제거
    xf = -np.degrees(np.arctan2((s * zp).sum(1), (s * xp).sum(1))) # +yp 회전 = atan2 음수
    xf = np.degrees(np.unwrap(np.radians(xf)))
    return hp_az + xf, hp_az, xf


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


def auto_events(az):
    """어깨 azimuth 곡선에서 P1(어드레스)/P4(탑)/P7(임팩트) 자동검출.
    규칙: 피니시 방향의 반대쪽 극점=백스윙탑, 탑 이후 첫 0교차=임팩트,
          탑 이전 마지막 평탄구간=어드레스. (프레임 수동입력 없이 영상만으로)"""
    n = len(az)
    b = az - az[0]
    tail = max(5, n // 20)
    end_dir = 1.0 if np.mean(b[-tail:]) >= 0 else -1.0   # 피니시가 어느 방향인가
    p4 = int(np.argmin(b)) if end_dir >= 0 else int(np.argmax(b))  # 백스윙=반대 극점
    amp = abs(b[p4]) or 1.0
    p7 = p4                                              # 임팩트=탑 이후 0교차
    for i in range(p4, n):
        if (end_dir >= 0 and b[i] >= 0) or (end_dir < 0 and b[i] <= 0):
            p7 = i
            break
    p1 = 0                                               # 어드레스=탑 이전 마지막 평탄
    thr = max(3.0, 0.05 * amp)
    for i in range(p4, -1, -1):
        if abs(b[i]) < thr:
            p1 = i
            break
    return p1, p4, p7


#  P구간 라벨 (analyzer2 v21과 동일 어휘)
P_LABELS = {
    "P1": "Address", "P2": "Toe-up", "P3": "Lead Arm Parallel (BS)", "P4": "Top",
    "P5": "Lead Arm Parallel (DS)", "P6": "Shaft Parallel (DS)", "P7": "Impact",
    "P8": "Shaft Parallel (FT)", "P9": "Lead Arm Parallel (FT)", "P10": "Finish",
}
P_ORDER = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]


def detect_p_events(J, jm, up, p1, p4, p7, hand="right"):
    """P1/P4/P7(azimuth 검출) 사이·이후의 중간 이벤트를 3D 기하로 채운다.
       - P3/P5/P9: 리드팔(리드어깨→리드손목)이 지면과 평행(up과 90°)에 가장 가까운 프레임.
       - P10(Finish): 임팩트 이후 손이 다시 최고점에 오르는 프레임.
       - P2/P6/P8(샤프트 평행): 클럽/샤프트 검출이 있어야 함 → pose만으론 불가(None).
       반환: {P#: (frame|None, method)}  method ∈ pose_rule / interpolated / (없으면 제외)"""
    T = int(J.shape[0])
    up = np.asarray(up, float); up = up / (np.linalg.norm(up) + 1e-9)
    lead = "l" if hand == "right" else "r"
    sh_i, wr_i = jm[lead + "_shoulder"], jm[lead + "_wrist"]
    grip = 0.5 * (J[:, jm["l_wrist"]] + J[:, jm["r_wrist"]])       # 양손 중점 (T,3)
    hand_h = grip @ up                                            # up 방향 높이(클수록 위)
    arm = J[:, wr_i] - J[:, sh_i]
    arm_n = arm / (np.linalg.norm(arm, axis=1, keepdims=True) + 1e-9)
    arm_from_up = np.degrees(np.arccos(np.clip(arm_n @ up, -1.0, 1.0)))  # up과의 각(90=수평)

    def arm_parallel(lo, hi):
        if lo is None or hi is None or hi - lo < 2:
            return None
        seg = np.abs(arm_from_up[lo:hi + 1] - 90.0)
        k = int(np.argmin(seg))
        return int(lo + k) if seg[k] < 25.0 else None

    def lerp(a, b, f):
        return int(round(a + (b - a) * f)) if (a is not None and b is not None) else None

    # P10: 임팩트 이후 손 최고점(피니시). 없으면 마지막 프레임.
    p10 = int(p7 + np.argmax(hand_h[p7:])) if (p7 is not None and p7 < T - 1) else T - 1
    p3, p5, p9 = arm_parallel(p1, p4), arm_parallel(p4, p7), arm_parallel(p7, p10)

    # P2 근사(2026-07-28): 정의는 '샤프트 지면 평행'이라 클럽 없이는 정확히 못 잡지만,
    # 그 순간 손은 대략 엉덩이 높이다 → 백스윙에서 손중점 높이가 골반 높이를 처음
    # 넘는 프레임을 프록시로 쓴다. Feature Spec §5 각주가 이미 "P2는 보간 프레임 +
    # interpolated_event" 를 예정해 둠. 어드레스에서 손이 이미 골반 위면(이상 자세/
    # 검출오류) 프록시 불성립 → P1~P3 중간 보간 폴백.
    hip_h = (0.5 * (J[:, jm["l_hip"]] + J[:, jm["r_hip"]])) @ up
    p2 = None
    p3eff = p3 if p3 is not None else lerp(p1, p4, 0.55)
    if p1 is not None and p3eff is not None and hand_h[p1] < hip_h[p1]:
        for t in range(int(p1) + 1, int(p3eff) + 1):
            if hand_h[t] >= hip_h[t]:
                p2 = t; break
    out = {}
    out["P2"] = (p2, "pose_rule") if p2 is not None else (lerp(p1, p3eff, 0.5), "interpolated")
    out["P3"] = (p3, "pose_rule") if p3 is not None else (lerp(p1, p4, 0.55), "interpolated")
    out["P5"] = (p5, "pose_rule") if p5 is not None else (lerp(p4, p7, 0.55), "interpolated")
    out["P9"] = (p9, "pose_rule") if p9 is not None else (lerp(p7, p10, 0.40), "interpolated")
    out["P10"] = (p10, "pose_rule")
    return {k: v for k, v in out.items() if v[0] is not None}


def _build_events(p1, p4, p7, ev_conf, ev_method, p_events):
    """P1/P4/P7(회전곡선 검출) + P2(손높이 프록시)/P3/P5/P9/P10(detect_p_events) 병합.
       P6/P8(샤프트)은 클럽엔진 부재라 계속 생략(정직). P2는 프록시라 conf 낮음. schema 준수."""
    base = {"P1": (int(p1), ev_conf, ev_method),
            "P4": (int(p4), ev_conf, ev_method),
            "P7": (int(p7), ev_conf, ev_method)}
    for p, (fr, m) in (p_events or {}).items():
        base[p] = (int(fr), 0.7 if m == "pose_rule" else 0.5, m)
    return [{"p": p, "name": P_LABELS[p], "frame": base[p][0],
             "confidence": base[p][1], "method": base[p][2]}
            for p in P_ORDER if p in base]


def emit_vision_v1(sh_turn, hp_turn, xfactor, p1, p4, p7, T, skeleton,
                   manual, view="unknown", hand="right", fps=None, video_id=None,
                   p_events=None):
    """rotation 결과 → doh.vision.v1 계약(JSON dict) 어댑터.
    schema/doh.vision.v1.schema.json 을 만족하는 인스턴스를 만든다.
    이 파이프라인이 '실제로 재는' 회전 4개(VF015/018/020/075)만 채우고,
    나머지 Feature/클럽은 다른 엔진의 몫이라 생략(부분출력 허용).
    """
    from datetime import datetime, timezone

    def val(fr, arr):
        fr = max(0, min(T - 1, fr))
        return round(float(arr[fr]), 1)

    # view가 정면/후면이면 회전 신뢰 높음, unknown/side면 강등
    view_ok = view in ("FO", "DTL")
    c = 0.8 if view_ok else 0.65
    ev_method = "manual" if manual else "pose_rule"
    ev_conf = 0.95 if manual else 0.85

    def feat(fid, name, value, phase, op, prims, conf, lms):
        return dict(feature_id=fid, name=name, value=value, unit="deg", phase=phase,
                    coord="BODY", operator=op, primitives=prims, landmarks_used=lms,
                    confidence=round(conf, 2), error_flags=[], source_engine="pose")

    SH = ["LEAD_SHOULDER", "TRAIL_SHOULDER"]
    HP = ["LEAD_HIP", "TRAIL_HIP"]

    # ── A작업(2026-07-25): 회전은 전 프레임 시계열인데 P4만 읽고 있었다.
    # 검출된 다른 P시점(P3/P5/P7/P10)도 방출 → KB 인과그래프의 P3·P5·P7·P10 노드가 살아남.
    # P2/P6/P8은 샤프트 평행이라 클럽검출 필요 → 여전히 미검출(정직하게 생략).
    pev = p_events or {}
    def pf(p):                      # 검출된 P시점 프레임 (없으면 None)
        v = pev.get(p)
        return int(v[0]) if v and v[0] is not None else None
    def itp(p):                     # 보간 이벤트면 flag
        v = pev.get(p)
        return ["interpolated_event"] if (v and v[1] == "interpolated") else []
    phase_feats = []
    def addp(fid, name, fr, arr, phase, op, prims, dc, lms, flags=None):
        if fr is None:
            return
        f = feat(fid, name, val(fr, arr), phase, op, prims, c - dc, lms)
        fl = list(flags or [])
        if fl:
            f["error_flags"] = fl
            f["confidence"] = round(max(0.1, f["confidence"] - 0.1), 2)
        phase_feats.append(f)
    p2, p3, p5, p10 = pf("P2"), pf("P3"), pf("P5"), pf("P10")
    # P2 회전 — Spec §5에 원래 있던 ID(VF013/016). KB 'Body Rotation Dominant (P2)' 판정 재료.
    # P2는 프록시 검출(손높이=엉덩이높이)이라 pose_rule이어도 근사 — dc 크게(신뢰 낮게).
    addp("VF013", "Shoulder Turn @P2", p2, sh_turn, "P2", "OP006", ["SHOULDER_LINE_TRACK"], 0.10, SH + HP, itp("P2"))
    addp("VF016", "Hip Turn @P2", p2, hp_turn, "P2", "OP006", ["HIP_LINE_TRACK"], 0.10, HP, itp("P2"))
    addp("VF014", "Shoulder Turn @P3", p3, sh_turn, "P3", "OP006", ["SHOULDER_LINE_TRACK"], 0.05, SH + HP, itp("P3"))
    addp("VF017", "Hip Turn @P3", p3, hp_turn, "P3", "OP006", ["HIP_LINE_TRACK"], 0.05, HP, itp("P3"))
    addp("VF019", "X-Factor @P3", p3, xfactor, "P3", "OP002",
         ["SHOULDER_LINE", "HIP_LINE", "GROUND_NORMAL"], 0.09, SH + HP, itp("P3"))
    addp("VF047", "Shoulder-Hip Separation @P5", p5, xfactor, "P5", "OP002",
         ["SHOULDER_LINE", "HIP_LINE", "GROUND_NORMAL"], 0.09, SH + HP, itp("P5"))
    # 임팩트 흉곽 회전 — KB의 Thorax Open/Closed (P7) 판정 재료 (골반쪽은 VF075가 이미 담당)
    addp("VF151", "Thorax Turn @P7 (+ = open/target-side)", int(p7), sh_turn, "P7", "OP006",
         ["SHOULDER_LINE_TRACK"], 0.05, SH + HP)
    addp("VF103", "Full Rotation @Finish", p10, sh_turn, "P1->P10", "OP006",
         ["SHOULDER_LINE_TRACK"], 0.08, SH + HP, itp("P10"))
    addp("VF104", "Hip Rotation @Finish", p10, hp_turn, "P1->P10", "OP006",
         ["HIP_LINE_TRACK"], 0.08, HP, itp("P10"))
    return {
        "schema": "doh.vision.v1",
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "video_id": video_id or "swing",
            "handedness": hand,
            "camera_view": view,
            "fps_declared": fps,
            "fps_effective": fps,
            "resolution": None,
            "duration_frames": int(T),
        },
        "engines": {
            "pose": {"name": "nlf", "variant": "nlf_l_multi", "version": "0.3.2"},
            "event": {"name": "pose_rule_auto", "variant": "azimuth_extrema",
                      "version": "wham_golf_rotation.py"},
            "object": None,
        },
        "swing_events": _build_events(p1, p4, p7, ev_conf, ev_method, p_events),
        "features": [
            feat("VF015", "Shoulder Turn @P4", val(p4, sh_turn), "P4", "OP006",
                 ["SHOULDER_LINE_TRACK"], c, SH + HP),
            feat("VF018", "Hip Turn @P4", val(p4, hp_turn), "P4", "OP006",
                 ["HIP_LINE_TRACK"], c, HP),
            feat("VF020", "X-Factor @P4", val(p4, xfactor), "P4", "OP002",
                 ["SHOULDER_LINE", "HIP_LINE", "GROUND_NORMAL"], c - 0.04, SH + HP),
            feat("VF075", "Hip Clear Amount", val(p7, hp_turn), "P1->P7", "OP006",
                 ["HIP_LINE_TRACK"], c - 0.05, HP),
        ] + phase_feats,
        "quality": {
            "overall_confidence": round(c, 2),
            "mean_visibility": None,
            "view_match": view_ok,
            "warnings": ([] if view_ok else ["camera_view unknown/side: rotation confidence reduced"])
                        + ["object_engine_absent: club/ball features unavailable (2nd-stage)"],
        },
    }


def build_v1(J, skeleton="smpl", view="unknown", hand="right", fps=None, video_id="swing",
             p1=None, p4=None, p7=None, smooth=True):
    """3D 관절(T,J,3) → doh.vision.v1 계약 dict. (서버/재사용용, 출력·파일 없음)
    회전 4 + 포즈지표 + 척추각을 한 계약으로. analyze()의 CLI 경로와 동일 로직.
    v2 업그레이드(2026-07-24): ① 시간축 스무딩(nlf-pipeline식) ② 회전=축회전 분해
    ③ up=발목-PCA 우선 — 전부 build_v1 내부라 콜랩/집PC서버/HF Space 동시 적용."""
    jm = SKELETONS[skeleton]
    J = smooth_joints(np.asarray(J, float)) if smooth else np.asarray(J, float)
    T = int(J.shape[0])
    # 1패스: 몸통평균 up으로 이벤트만 잡는다 (곡선 모양은 up 편향에 둔감)
    up0 = estimate_up(J, jm["l_shoulder"], jm["r_shoulder"], jm["l_hip"], jm["r_hip"])
    e1, e2 = plane_basis(up0)
    sh_az0 = azimuth_series(J, jm["r_shoulder"], jm["l_shoulder"], up0, e1, e2)
    if p1 is not None and p1 == p4 == p7:
        p1 = p4 = p7 = None
    a1, a4, a7 = auto_events(sh_az0)
    manual = (p1 is not None) or (p4 is not None) or (p7 is not None)
    if p1 is None: p1 = a1
    if p4 is None: p4 = a4
    if p7 is None: p7 = a7
    # 2패스: 어드레스~임팩트 구간 발목-PCA로 정밀 up → 축회전 분해 (합성 GT 검증)
    up, up_method = best_up(J, jm, skeleton, p1, p7)
    sh_abs, hp_abs, xf_abs = axial_turn_series(J, jm, up)
    sh_turn = turn_relative(sh_abs, p1)
    hp_turn = turn_relative(hp_abs, p1)
    xfactor = turn_relative(xf_abs, p1)
    pev = detect_p_events(J, jm, up, p1, p4, p7, hand=hand)
    inst = emit_vision_v1(sh_turn, hp_turn, xfactor, p1, p4, p7, T, skeleton,
                          manual, view=view, hand=hand, fps=fps, video_id=video_id,
                          p_events=pev)
    try:
        from wham_golf_metrics import compute_metrics
        inst["features"].extend(
            compute_metrics(J, p1, p4, p7, T, fps=fps, hand=hand, view=view, skeleton=skeleton))
    except Exception as e:
        inst.setdefault("quality", {}).setdefault("warnings", []).append(f"metrics_skipped: {e}")
    return inst


def analyze(path, p1=None, p4=None, p7=None, save_png=None, check=False, skeleton="smpl",
            save_json=None, save_json_v1=None, view="unknown", hand="right", fps=None, video_id=None):
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

    J = smooth_joints(np.asarray(get_joints(track), float))   # nlf-pipeline식 지터 제거
    T = J.shape[0]
    print(f"프레임 {T} · 관절 {J.shape[1]} · skeleton={skeleton} · 시간축 스무딩 적용(med5+avg3)")

    # 1패스: 몸통평균 up으로 이벤트 검출
    up0 = estimate_up(J, jm["l_shoulder"], jm["r_shoulder"], jm["l_hip"], jm["r_hip"])
    e1, e2 = plane_basis(up0)
    sh_az = azimuth_series(J, jm["r_shoulder"], jm["l_shoulder"], up0, e1, e2)  # 이벤트용

    # P구간 자동검출 (수동으로 준 값은 그대로 존중)
    if p1 is not None and p1 == p4 == p7:   # 0/0/0 같은 placeholder → 자동으로
        p1 = p4 = p7 = None
    a1, a4, a7 = auto_events(sh_az)
    manual = (p1 is not None) or (p4 is not None) or (p7 is not None)
    if p1 is None: p1 = a1
    if p4 is None: p4 = a4
    if p7 is None: p7 = a7
    print(f"이벤트 P1/P4/P7 = {p1}/{p4}/{p7}" + ("  (일부 수동지정)" if manual else "  (자동검출)"))

    # 2패스: 발목-PCA up + 축회전 분해 (X-Factor 지면투영 과대 소거 — 합성 GT 검증)
    up, up_method = best_up(J, jm, skeleton, p1, p7)
    print(f"추정 up축: [{up[0]:+.2f} {up[1]:+.2f} {up[2]:+.2f}]  (방법: {up_method})")
    sh_abs, hp_abs, xf_abs = axial_turn_series(J, jm, up)
    sh_turn = turn_relative(sh_abs, p1)
    hp_turn = turn_relative(hp_abs, p1)
    xfactor = turn_relative(xf_abs, p1)

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

    # analyzer2가 읽을 표준 JSON 계약 (doh.vision.rotation.v1)
    if save_json:
        import json as _json
        def _v(fr):
            fr = max(0, min(T - 1, fr))
            return dict(thorax=round(float(sh_turn[fr]), 1),
                        pelvis=round(float(hp_turn[fr]), 1),
                        xfactor=round(float(xfactor[fr]), 1))
        out = dict(
            schema="doh.vision.rotation.v1", source="NLF", skeleton=skeleton, frames=int(T),
            events=dict(P1=int(p1), P4=int(p4), P7=int(p7)),
            address=_v(p1), top=_v(p4), impact=_v(p7),
            series=dict(
                thorax=[round(float(x), 1) for x in sh_turn],
                pelvis=[round(float(x), 1) for x in hp_turn],
                xfactor=[round(float(x), 1) for x in xfactor]),
        )
        _json.dump(out, open(save_json, "w"), ensure_ascii=False)
        print("JSON 저장(analyzer2용):", save_json)

    # doh.vision.v1 계약 출력 (모바일/웹 공용 API·DOH 소비용)
    if save_json_v1:
        import json as _json
        vid = video_id or os.path.splitext(os.path.basename(path))[0]
        pev = detect_p_events(J, jm, up, p1, p4, p7, hand=hand)
        inst = emit_vision_v1(sh_turn, hp_turn, xfactor, p1, p4, p7, T, skeleton,
                              manual, view=view, hand=hand, fps=fps, video_id=vid,
                              p_events=pev)
        # 회전 외 포즈 파생 지표(무릎/팔/스웨이/템포)를 같은 계약에 append
        try:
            from wham_golf_metrics import compute_metrics
            more = compute_metrics(J, p1, p4, p7, T, fps=fps, hand=hand, view=view, skeleton=skeleton)
            inst["features"].extend(more)
            print(f"metrics 추가: +{len(more)} feature (총 {len(inst['features'])})")
        except Exception as e:
            print("metrics 확장 생략:", e)
        _json.dump(inst, open(save_json_v1, "w"), ensure_ascii=False, indent=2)
        print("JSON 저장(doh.vision.v1 계약):", save_json_v1)

    if save_png:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            fig, ax = plt.subplots(figsize=(10, 4))
            ax.plot(sh_turn, label="Thorax (shoulders)")
            ax.plot(hp_turn, label="Pelvis (hips)")
            ax.plot(xfactor, "--", label="X-Factor")
            for fr, nm, c in [(p1, "P1", "gray"), (p4, "P4", "red"), (p7, "P7", "green")]:
                if fr is not None:
                    ax.axvline(fr, color=c, alpha=.5, lw=1)
                    ax.text(fr, ax.get_ylim()[1], nm, color=c, fontsize=8, va="top")
            ax.axhline(0, color="k", lw=.5)
            ax.set_xlabel("frame"); ax.set_ylabel("rotation (deg)")
            ax.legend(); ax.set_title("DOH 3D rotation (NLF, address-relative)")
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
    ap.add_argument("--json", default=None, help="analyzer2용 회전 JSON 저장 경로(doh.vision.rotation.v1)")
    ap.add_argument("--json-v1", dest="json_v1", default=None,
                    help="doh.vision.v1 계약 JSON 저장 경로 (모바일/웹/DOH 공용)")
    ap.add_argument("--view", default="unknown", choices=["FO", "DTL", "SIDE", "unknown"],
                    help="촬영방향: FO(정면)/DTL(후면)/SIDE/unknown")
    ap.add_argument("--hand", default="right", choices=["right", "left"], help="주손(lead/trail 해석)")
    ap.add_argument("--fps", type=float, default=None, help="영상 fps (계약 source에 기록)")
    ap.add_argument("--video-id", dest="video_id", default=None, help="계약 source.video_id")
    ap.add_argument("--skeleton", default="smpl", choices=list(SKELETONS),
                    help="관절 순서: smpl(WHAM) / h36m(MMPose·MotionBERT) / coco")
    ap.add_argument("--check", action="store_true", help="배열 키/shape만 출력")
    a = ap.parse_args()
    analyze(a.pkl, a.p1, a.p4, a.p7, a.png, a.check, a.skeleton, a.json,
            save_json_v1=a.json_v1, view=a.view, hand=a.hand, fps=a.fps, video_id=a.video_id)


if __name__ == "__main__":
    main()
