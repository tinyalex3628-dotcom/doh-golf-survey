"""
DOH Vision · 포즈 파생 지표 (회전 외) → doh.vision.v1 Feature
============================================================
NLF/SMPL-24 3D 관절에서 회전(wham_golf_rotation.py) '외의' 지표를 뽑아
doh.vision.v1 계약의 feature 로 방출한다. Metrics 확장은 계약에 'append'만
하면 되므로(UI/DOH/모바일 불변), 이 파일은 계약 feature dict 리스트를 돌려준다.

정직성 원칙
-----------
여기서 뽑는 건 **월드 수직축이 없어도 robust한 것들**뿐이다:
  · 관절-사이 상대각 (무릎/팔꿈치) — 세그먼트 대 세그먼트, 좌표계 무관
  · 이벤트 프레임 산술 (템포/구간시간) — 순수 프레임
  · 스탠스선 투영 비율 (머리/골반 스웨이) — ankle-ankle 축, 폭으로 정규화
월드 기준 각(척추 틸트/전후굴곡, 어깨플레인, Loss of Posture 등)은 신뢰할
수 있는 '세계 수직축(up)' 보정이 필요하다 → 엔진 검증 단계에서 추가.

뷰-게이팅 (실측 검증 반영, 2026-07-04)
--------------------------------------
지표마다 '사는 축'이 있고, 그 축이 카메라 화면 안에 있으면 신뢰·깊이방향이면
측정 불가다. 예) **스웨이(타깃선 방향 이동)**: 정면(FO)에선 화면 좌우로 보여 잘
잡히지만, 측면(DTL)에선 화면 깊이축이라 3D여도 못 잡는다(실측: 측면 스웨이
0.9~1.1 = 쓰레기). → 뷰가 안 맞으면 **value=null + view_mismatch** 로 정직하게
표시한다(억지 계산 금지). 팔/무릎 세그먼트각은 실측상 측면에서도 정상값이 나와
양쪽 유효로 둔다.

의존성: 표준 라이브러리(math)만. 관절은 J[frame][joint] = (x,y,z) 형태면
numpy든 list든 상관없음.
"""
import math

# SMPL-24 관절 인덱스 (wham_golf_rotation SKELETONS['smpl']와 정합)
SMPL24 = dict(
    pelvis=0, l_hip=1, r_hip=2, l_knee=4, r_knee=5, l_ankle=7, r_ankle=8,
    l_foot=10, r_foot=11, neck=12, head=15, l_shoulder=16, r_shoulder=17,
    l_elbow=18, r_elbow=19, l_wrist=20, r_wrist=21,
)

# 지표가 신뢰되는 카메라 뷰 (측정 축이 화면 안에 있는가)
BOTH = ("FO", "DTL")   # 3D 세그먼트각·회전·시간 — 양쪽 OK (실측 확인)
FRONT = ("FO",)        # 타깃선 방향(스웨이·좌우틸트) — 정면만
SIDE = ("DTL",)        # 시상면(척추 전후굴곡·플레인) — 측면만


# ── 순수 벡터 기하 (3-튜플) ─────────────────────────────────────────────
def _sub(a, b):   return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def _dot(a, b):   return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def _cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2],
                          a[0] * b[1] - a[1] * b[0])
def _norm(a):     return math.sqrt(_dot(a, a))
def _unit(a):
    n = _norm(a)
    return (a[0] / n, a[1] / n, a[2] / n) if n > 1e-9 else (0.0, 0.0, 0.0)


def _angle(u, v):
    """두 벡터 사이 각(도) 0..180."""
    c = _dot(u, v) / ((_norm(u) * _norm(v)) + 1e-9)
    c = max(-1.0, min(1.0, c))
    return math.degrees(math.acos(c))


def _interior(a, vertex, b):
    """vertex 에서 a·b 로 향하는 두 세그먼트 사이 내부각(도). 편(straight)=180."""
    return _angle(_sub(a, vertex), _sub(b, vertex))


def _row(J, fr, idx):
    """J[fr][idx] → float 3-튜플 (numpy row/list 모두 대응)."""
    p = J[fr][idx]
    return (float(p[0]), float(p[1]), float(p[2]))


# ── 세계 수직축(up) 추정 — 발/지면에서 (torso 무관) ──────────────────────
def _jacobi_eig3(A):
    """3x3 대칭행렬 A의 고유값/고유벡터 (순수 파이썬 Jacobi). numpy 불필요.
    반환: (evals[3], evecs[3]) — evecs[k]가 evals[k]에 대응하는 열벡터."""
    a = [row[:] for row in A]
    v = [[1.0 if i == j else 0.0 for j in range(3)] for i in range(3)]
    for _ in range(60):
        off = abs(a[0][1]) + abs(a[0][2]) + abs(a[1][2])
        if off < 1e-14:
            break
        for p in range(3):
            for q in range(p + 1, 3):
                if abs(a[p][q]) < 1e-20:
                    continue
                theta = (a[q][q] - a[p][p]) / (2 * a[p][q])
                t = (1.0 if theta >= 0 else -1.0) / (abs(theta) + math.sqrt(theta * theta + 1))
                c = 1.0 / math.sqrt(t * t + 1); s = t * c
                app, aqq, apq = a[p][p], a[q][q], a[p][q]
                a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq
                a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq
                a[p][q] = a[q][p] = 0.0
                for i in range(3):
                    if i != p and i != q:
                        aip, aiq = a[i][p], a[i][q]
                        a[i][p] = a[p][i] = c * aip - s * aiq
                        a[i][q] = a[q][i] = s * aip + c * aiq
                for i in range(3):
                    vip, viq = v[i][p], v[i][q]
                    v[i][p] = c * vip - s * viq
                    v[i][q] = s * vip + c * viq
    evals = [a[i][i] for i in range(3)]
    evecs = [[v[i][k] for i in range(3)] for k in range(3)]
    return evals, evecs


def estimate_up(J, T, ix, p_lo, p_hi):
    """발/지면(발목+발)에서 세계 수직축을 추정한다.
    원리: 발목은 지면 높이에 planted → 수평으로만 퍼지고(스탠스폭·체중이동) 수직
          분산은 작다 → 점구름의 '최소 분산 축' = up. torso 기울기와 무관.
    (발끝/발은 발목보다 앞·아래라 발 자체 대각구조가 PCA를 기울여서 제외 — 합성검증.)
    범위는 어드레스~임팩트(p_lo..p_hi)로 제한(팔로우 힐업 배제).
    반환: (up_unit or None, quality 0..1)  quality=고유값 분리도(지면이 뚜렷한가)."""
    lo, hi = max(0, min(T - 1, p_lo)), max(0, min(T - 1, p_hi))
    if hi <= lo:
        lo, hi = 0, T - 1
    pts, heads = [], []
    for fr in range(lo, hi + 1):
        for k in ("l_ankle", "r_ankle"):
            p = _row(J, fr, ix[k])
            if p != (0.0, 0.0, 0.0):
                pts.append(p)
        heads.append(_row(J, fr, ix["head"]))
    if len(pts) < 6:
        return None, 0.0
    n = len(pts)
    mx = sum(p[0] for p in pts) / n; my = sum(p[1] for p in pts) / n; mz = sum(p[2] for p in pts) / n
    cov = [[0.0] * 3 for _ in range(3)]
    for p in pts:
        d = (p[0] - mx, p[1] - my, p[2] - mz)
        for i in range(3):
            for j in range(3):
                cov[i][j] += d[i] * d[j]
    evals, evecs = _jacobi_eig3(cov)
    order = sorted(range(3), key=lambda k: evals[k])   # 오름차순(최소=지면법선)
    up = _unit(evecs[order[0]])
    # 몸통 대략 수직(머리-발) — 부호 결정 + 정합 가드용 (앞숙임에 조금 기울지만 절대 수평 아님)
    hm = (sum(h[0] for h in heads) / len(heads),
          sum(h[1] for h in heads) / len(heads),
          sum(h[2] for h in heads) / len(heads))
    body_up = _unit(_sub(hm, (mx, my, mz)))
    if _dot(up, body_up) < 0:
        up = (-up[0], -up[1], -up[2])
    e0, e1 = evals[order[0]], evals[order[1]]
    sep = max(0.0, min(1.0, 1.0 - (e0 / (e1 + 1e-12))))   # 지면축 분리도
    align = _dot(up, body_up)                              # 몸통 수직과 정합
    if align < 0.82:            # PCA up이 몸통 수직과 크게 어긋남 → 지면 모호(체중이동 부족 등)
        return body_up, 0.3 * sep    # 절대 수평은 아닌 몸통방향으로 폴백 + 낮은 품질
    return up, sep * align


# ── 좌우 → lead/trail (오른손잡이: lead=타깃쪽=왼쪽) ──────────────────────
def _sides(hand):
    if hand == "left":
        return ("r", "l")   # 왼손잡이: lead=오른쪽
    return ("l", "r")       # 오른손잡이: lead=왼쪽


def _feat(fid, name, value, unit, phase, coord, op, prims, lms, conf, flags, views, view):
    """뷰-게이팅 적용 후 계약 feature dict 생성.
    view가 유효뷰면 그대로 · unknown이면 감점+off_axis_view · 불일치면 null+view_mismatch."""
    flags = list(flags)
    if view in views:
        pass                                    # 측정 축이 화면 안 — 신뢰
    elif view == "unknown":
        conf *= 0.7
        flags.append("off_axis_view")           # 뷰 모름 — 계산은 하되 감점
    else:
        value = None                            # 측정 축이 깊이방향 — 불가
        conf = 0.0
        flags.append("view_mismatch")
    return dict(feature_id=fid, name=name,
                value=(None if value is None else round(float(value), 1)),
                unit=unit, phase=phase, coord=coord, operator=op,
                primitives=prims, landmarks_used=lms,
                confidence=round(conf, 2), error_flags=flags,
                source_engine="pose")


def compute_metrics(J, p1, p4, p7, T, fps=None, hand="right", view="unknown", skeleton="smpl"):
    """포즈 파생 지표를 doh.vision.v1 feature dict 리스트로 반환.
    현재 SMPL-24만 지원(회전 파이프라인과 동일 좌표). 다른 스켈레톤은 인덱스
    매핑 추가 필요 → 그 전엔 빈 리스트(계약엔 회전 feature만).
    """
    if skeleton != "smpl":
        return []
    ix = SMPL24
    lead, trail = _sides(hand)
    cbase = 0.75
    feats = []

    def J_(fr, key):
        return _row(J, max(0, min(T - 1, fr)), ix[key])

    def add(fid, name, value, unit, phase, coord, op, prims, lms, conf, flags, views):
        feats.append(_feat(fid, name, value, unit, phase, coord, op, prims, lms,
                           conf, flags, views, view))

    # 논리 이름(lead/trail)으로 인덱스 키
    L_SH, T_SH = f"{lead}_shoulder", f"{trail}_shoulder"
    L_EL, T_EL = f"{lead}_elbow", f"{trail}_elbow"
    L_WR, T_WR = f"{lead}_wrist", f"{trail}_wrist"
    L_HIP, T_HIP = f"{lead}_hip", f"{trail}_hip"
    L_KN, T_KN = f"{lead}_knee", f"{trail}_knee"
    L_AN, T_AN = f"{lead}_ankle", f"{trail}_ankle"

    # ── 1) 팔각 (세그먼트 상대각, 3D → 양쪽 뷰 OK) ──
    add("VF011", "Lead Arm Straightness @P1 (interior, 180=straight)",
        _interior(J_(p1, L_SH), J_(p1, L_EL), J_(p1, L_WR)), "deg", "P1", "BODY",
        "OP001", ["LEAD_UPPER_ARM", "LEAD_FOREARM"], ["LEAD_SHOULDER", "LEAD_ELBOW", "LEAD_WRIST"],
        cbase, [], BOTH)
    add("VF012", "Trail Arm Flex @P1 (180-interior)",
        180.0 - _interior(J_(p1, T_SH), J_(p1, T_EL), J_(p1, T_WR)), "deg", "P1", "BODY",
        "OP001", ["TRAIL_UPPER_ARM", "TRAIL_FOREARM"], ["TRAIL_SHOULDER", "TRAIL_ELBOW", "TRAIL_WRIST"],
        cbase, [], BOTH)
    add("VF027", "Trail Elbow Angle @P4 (interior)",
        _interior(J_(p4, T_SH), J_(p4, T_EL), J_(p4, T_WR)), "deg", "P4", "BODY",
        "OP001", ["TRAIL_UPPER_ARM", "TRAIL_FOREARM"], ["TRAIL_SHOULDER", "TRAIL_ELBOW", "TRAIL_WRIST"],
        cbase, [], BOTH)
    add("VF087", "Lead Arm Bend @P7 (180-interior, chicken-wing proxy)",
        180.0 - _interior(J_(p7, L_SH), J_(p7, L_EL), J_(p7, L_WR)), "deg", "P7", "BODY",
        "OP001", ["LEAD_UPPER_ARM", "LEAD_FOREARM"], ["LEAD_SHOULDER", "LEAD_ELBOW", "LEAD_WRIST"],
        cbase, [], BOTH)

    # ── 2) 무릎각 (세그먼트 상대각, 3D → 양쪽 뷰 OK) ──
    def flex(fr, hip, kn, an):   # 굴곡: 0=곧음
        return 180.0 - _interior(J_(fr, hip), J_(fr, kn), J_(fr, an))
    add("VF039", "Lead Knee Flex Δ (P4-P1)",
        flex(p4, L_HIP, L_KN, L_AN) - flex(p1, L_HIP, L_KN, L_AN), "deg", "P1_vs_P4", "BODY",
        "OP001", ["LEAD_THIGH", "LEAD_SHANK"], ["LEAD_HIP", "LEAD_KNEE", "LEAD_ANKLE"],
        cbase, [], BOTH)
    add("VF040", "Trail Knee Flex @P4",
        flex(p4, T_HIP, T_KN, T_AN), "deg", "P4", "BODY",
        "OP001", ["TRAIL_THIGH", "TRAIL_SHANK"], ["TRAIL_HIP", "TRAIL_KNEE", "TRAIL_ANKLE"],
        cbase, [], BOTH)
    add("VF088", "Lead Knee Angle @P7 (interior)",
        _interior(J_(p7, L_HIP), J_(p7, L_KN), J_(p7, L_AN)), "deg", "P7", "BODY",
        "OP001", ["LEAD_THIGH", "LEAD_SHANK"], ["LEAD_HIP", "LEAD_KNEE", "LEAD_ANKLE"],
        cbase, [], BOTH)

    # ── 3) 스웨이 (타깃선 방향 = 정면 전용; 측면은 null+view_mismatch) ──
    stance_u = _unit(_sub(J_(p1, T_AN), J_(p1, L_AN)))       # lead→trail 단위벡터
    width = _norm(_sub(J_(p1, T_AN), J_(p1, L_AN))) + 1e-9
    head_dx = _dot(_sub(J_(p4, "head"), J_(p1, "head")), stance_u) / width
    add("VF031", "Head Sway lateral P1→P4 (stance-normalized, + = trail)",
        head_dx, "ratio", "P1->P4", "GROUND",
        "OP011", ["HEAD_POINT_TRACK", "STANCE_LINE"], ["NOSE", "LEAD_ANKLE", "TRAIL_ANKLE"],
        cbase - 0.05, [], FRONT)
    pel_dx = _dot(_sub(J_(p4, "pelvis"), J_(p1, "pelvis")), stance_u) / width
    add("VF034", "Pelvis Sway lateral P1→P4 (stance-normalized, + = trail)",
        pel_dx, "ratio", "P1->P4", "GROUND",
        "OP007", ["PELVIS_TRACK"], ["LEAD_ANKLE", "TRAIL_ANKLE"],
        cbase - 0.05, [], FRONT)
    # VF085 행잉백: 임팩트에서 골반이 아직 트레일쪽(+)에 남아있나 (P1 대비)
    add("VF085", "Pelvis lateral @P7 vs P1 (stance-normalized, + = trail = hanging back)",
        _dot(_sub(J_(p7, "pelvis"), J_(p1, "pelvis")), stance_u) / width,
        "ratio", "P1->P7", "GROUND",
        "OP007", ["PELVIS_TRACK"], ["LEAD_ANKLE", "TRAIL_ANKLE"],
        cbase - 0.05, [], FRONT)
    # VF091 힙 슬라이드(다운스윙): P4→P7 골반 좌우 이동 (− = 리드쪽)
    add("VF091", "Pelvis lateral P4→P7 (stance-normalized, - = toward lead)",
        _dot(_sub(J_(p7, "pelvis"), J_(p4, "pelvis")), stance_u) / width,
        "ratio", "P4->P7", "GROUND",
        "OP007", ["PELVIS_TRACK"], ["LEAD_ANKLE", "TRAIL_ANKLE"],
        cbase - 0.05, [], FRONT)

    # ── 4) 템포/구간 (이벤트 프레임 산술, 뷰 무관 → 양쪽 OK) ──
    bs_frames = max(0, p4 - p1)
    ds_frames = max(0, p7 - p4)
    ctempo = 0.9
    if fps and fps > 0:
        add("VF113", "Backswing Duration", bs_frames / fps, "s", "P1->P4", "none",
            "OP003", ["frame(P1->P4)"], [], ctempo, [], BOTH)
        add("VF114", "Downswing Duration", ds_frames / fps, "s", "P4->P7", "none",
            "OP003", ["frame(P4->P7)"], [], ctempo, [], BOTH)
    tempo = (bs_frames / ds_frames) if ds_frames > 0 else None
    add("VF111", "Tempo Ratio (backswing:downswing frames)",
        tempo, "ratio", "global", "none",
        "OP010", ["t(P1->P4)/t(P4->P7)"], [], ctempo,
        [] if ds_frames > 0 else ["interpolated_event"], BOTH)

    # ── 5) 척추각 / 플레인 (지면 0° 기준, 세계 수직축 필요 → 측면 전용) ──
    up, upq = estimate_up(J, T, ix, p1, p7)
    if up is not None:
        cpos = round(0.6 * max(0.15, upq), 2)               # up 품질에 비례
        upflags = [] if upq >= 0.5 else ["depth_unreliable"]

        def mid(fr, a, b):
            pa, pb = J_(fr, a), J_(fr, b)
            return tuple((pa[i] + pb[i]) / 2 for i in range(3))

        def spine_from_ground(fr):
            """척추(골반→목) 축의 지면(수평) 대비 각. 눕힘=0°, 수직=90°."""
            spine = _sub(J_(fr, "neck"), J_(fr, "pelvis"))
            return 90.0 - _angle(spine, up)

        # VF002 Spine Angle @P1 (지면 기준, 어드레스 자세각 ~55~65° 기대)
        add("VF002", "Spine Angle @P1 (from ground, 0=flat/90=upright)",
            spine_from_ground(p1), "deg", "P1", "GROUND",
            "OP005", ["TORSO_AXIS", "GROUND"], ["PELVIS", "NECK"], cpos, upflags, SIDE)
        # VF038 Loss of Posture (어드레스→탑 척추각 변화, 0에 가까울수록 유지)
        add("VF038", "Loss of Posture (spine angle Δ, P4-P1)",
            spine_from_ground(p4) - spine_from_ground(p1), "deg", "P1_vs_P4", "GROUND",
            "OP005", ["TORSO_AXIS", "GROUND"], ["PELVIS", "NECK"], cpos, upflags, SIDE)
        # VF076 Spine Angle Maintenance (어드레스→임팩트 변화)
        add("VF076", "Spine Angle Maintenance (Δ, P7-P1)",
            spine_from_ground(p7) - spine_from_ground(p1), "deg", "P1_vs_P7", "GROUND",
            "OP005", ["TORSO_AXIS", "GROUND"], ["PELVIS", "NECK"], cpos, upflags, SIDE)
        # VF022 Shoulder Plane Angle @P4 (어깨선의 지면 대비 기울기)
        sl = _sub(J_(p4, L_SH), J_(p4, T_SH))
        add("VF022", "Shoulder Plane Angle @P4 (tilt from ground)",
            abs(90.0 - _angle(sl, up)), "deg", "P4", "GROUND",
            "OP005", ["SHOULDER_LINE", "GROUND_NORMAL"], ["LEAD_SHOULDER", "TRAIL_SHOULDER"],
            cpos, upflags, SIDE)
        # VF001 Spine Tilt 좌우 @P1 (프론트 전용) — 스탠스선 성분
        stance_h = _sub(J_(p1, T_AN), J_(p1, L_AN))
        t_axis = _unit(_sub(stance_h, tuple(up[i] * _dot(stance_h, up) for i in range(3))))
        sp1 = _unit(_sub(J_(p1, "neck"), J_(p1, "pelvis")))
        lat = math.degrees(math.atan2(_dot(sp1, t_axis), _dot(sp1, up)))
        add("VF001", "Spine Tilt lateral @P1 (from vertical, +=trail lean)",
            lat, "deg", "P1", "GROUND",
            "OP005", ["TORSO_AXIS", "VERTICAL"], ["PELVIS", "NECK"], cpos, upflags, FRONT)

        # ── 6) 문제판정 규칙용 추가 측정 (2026-07-24, append-only) ──
        # VF036 리버스 스파인: 탑(P4)에서 척추 좌우기울기 (− = 리드/타깃쪽 역기울기)
        sp4 = _unit(_sub(J_(p4, "neck"), J_(p4, "pelvis")))
        add("VF036", "Spine Tilt lateral @P4 (+=trail lean, - = reverse spine)",
            math.degrees(math.atan2(_dot(sp4, t_axis), _dot(sp4, up))), "deg", "P4", "GROUND",
            "OP005", ["TORSO_AXIS", "VERTICAL"], ["PELVIS", "NECK"], cpos, upflags, FRONT)
        # VF033 머리 상하 이동 P1→P4 (− = 낮아짐/딥, 스탠스폭 정규화)
        add("VF033", "Head vertical move P1→P4 (stance-normalized, - = dip)",
            _dot(_sub(J_(p4, "head"), J_(p1, "head")), up) / width, "ratio", "P1->P4", "GROUND",
            "OP007", ["HEAD_POINT_TRACK"], ["NOSE"], cpos, upflags, BOTH)
        # VF026 플라잉 엘보: 탑에서 트레일 팔꿈치가 어깨보다 위(+)인 정도 (상완길이 정규화)
        ua_len = _norm(_sub(J_(p4, T_EL), J_(p4, T_SH))) + 1e-9
        add("VF026", "Trail elbow height above shoulder @P4 (/upper-arm len, + = flying)",
            _dot(_sub(J_(p4, T_EL), J_(p4, T_SH)), up) / ua_len, "ratio", "P4", "BODY",
            "OP007", ["TRAIL_UPPER_ARM"], ["TRAIL_SHOULDER", "TRAIL_ELBOW"], cpos, upflags, BOTH)
        # VF123 오버스윙 프록시: 탑에서 리드팔(어깨→손목)이 수직축과 이룬 각 (작을수록 팔이 높음)
        add("VF123", "Lead arm angle from vertical @P4 (deg, smaller = arm higher)",
            _angle(_sub(J_(p4, L_WR), J_(p4, L_SH)), up), "deg", "P4", "BODY",
            "OP001", ["LEAD_ARM_CHAIN", "VERTICAL"], ["LEAD_SHOULDER", "LEAD_WRIST"],
            cpos - 0.1, upflags, BOTH)

        # 깊이축(볼 방향): up⊥·스탠스축⊥. 부호는 어드레스에서 손이 몸 앞(볼쪽)이라는 사실로 고정
        d_axis = _unit(_cross(up, t_axis))
        hand1 = tuple((J_(p1, L_WR)[i] + J_(p1, T_WR)[i]) / 2 for i in range(3))
        if _dot(_sub(hand1, J_(p1, "pelvis")), d_axis) < 0:
            d_axis = (-d_axis[0], -d_axis[1], -d_axis[2])
        # 검수 3차(2026-07-24): 측면(DTL)에서 '볼쪽' 축은 화면 안(in-plane) — tush line의
        # 3D판이라 깊이축이 아님(깊이축=타깃선). 저신뢰 강등은 과잉보수였음 → 승격.
        # 남는 주의점은 P5/P6 보간뿐 → interpolated_event만 유지.
        dflags = sorted(set(upflags) | {"interpolated_event"})
        cdep = round(max(0.2, 0.62 * max(0.3, upq)), 2)
        # VF067 얼리 익스텐션: 다운스윙 후반 골반이 볼쪽(+)으로 나온 양 (P5는 P4·P7 중점 보간)
        p5i = (int(p4) + int(p7)) // 2
        add("VF067", "Pelvis toward ball P5→P7 (stance-normalized, + = early extension)",
            _dot(_sub(J_(p7, "pelvis"), J_(p5i, "pelvis")), d_axis) / width,
            "ratio", "P5->P7", "GROUND",
            "OP007", ["PELVIS_TRACK"], ["LEAD_HIP", "TRAIL_HIP"], cdep, dflags, SIDE)
        # VF059 손 깊이 P4→P6 (+ = 볼쪽으로 던져짐 = OTT 경향, − = 몸쪽 = 샬로잉)
        p6i = int(p4) + 2 * (int(p7) - int(p4)) // 3
        hand4 = tuple((J_(p4, L_WR)[i] + J_(p4, T_WR)[i]) / 2 for i in range(3))
        hand6 = tuple((J_(p6i, L_WR)[i] + J_(p6i, T_WR)[i]) / 2 for i in range(3))
        add("VF059", "Hand depth change P4→P6 (stance-normalized, + = toward ball/OTT)",
            _dot(_sub(hand6, hand4), d_axis) / width, "ratio", "P4->P6", "GROUND",
            "OP007", ["HAND_MID_TRACK"], ["LEAD_WRIST", "TRAIL_WRIST"], cdep, dflags, SIDE)
        # ── VF028 Hand Depth @P4 — **heel line 기준** (사용자 확정 2026-07-25) ──
        # 기준면: 어드레스(P1) 양 발목을 지나는 지면 수직면 = 뒷꿈치 수직선의 3D판.
        # 손중점이 그 면에서 볼쪽(+) / 몸 뒤쪽(−)으로 얼마나 떨어졌나 ÷ 스탠스폭.
        #   음수(뒤) = Hand Depth Deep  /  양수(볼쪽) = Hand Depth Shallow   ← KB 판정 재료
        # heel line을 택한 이유(핸드오프 §5s): ① 발은 스윙 중 고정 → 회전 오차가 전파되지 않음
        #   (KB 원문의 '흉곽 상대' 방식은 회전각 오차가 그대로 실림) ② Sportsbox 'Hand Thrust'와
        #   같은 축·같은 부호(+=볼쪽)라 상용 대조검증 가능 ③ 레슨 현장 관행 일치.
        # KB의 흉곽상대 정의는 폐기가 아니라 보조 — '회전 대비 과한가'는 별도 지표로 후속.
        # 플래그: P4는 직접 검출 이벤트라 interpolated_event 없음(VF067/059와 다름).
        heel_mid = tuple((J_(p1, L_AN)[i] + J_(p1, T_AN)[i]) / 2 for i in range(3))
        add("VF028", "Hand Depth @P4 vs heel line (stance-normalized, + = toward ball/shallow, - = behind/deep)",
            _dot(_sub(hand4, heel_mid), d_axis) / width, "ratio", "P4", "GROUND",
            "OP007", ["HAND_MID_TRACK", "STANCE_LINE"],
            ["LEAD_WRIST", "TRAIL_WRIST", "LEAD_ANKLE", "TRAIL_ANKLE"],
            cdep, list(upflags), SIDE)
        # VF121 골반 상승 P5→P7 (M106) — "벨트버클이 위로 뜬다" = 얼리익스텐션의 수직 성분.
        # 수직축은 두 뷰 모두 화면 안 → 정면에서도 유효(정면은 볼쪽 돌진을 못 보므로 이걸로 부분 포착).
        add("VF121", "Pelvis lift P5→P7 (leg-normalized, + = standing up / belt buckle rises)",
            _dot(_sub(J_(p7, "pelvis"), J_(p5i, "pelvis")), up)
            / (_norm(_sub(J_(p1, "pelvis"), J_(p1, L_AN))) + 1e-9),
            "ratio", "P5->P7", "GROUND",
            "OP007", ["PELVIS_TRACK"], ["LEAD_HIP", "TRAIL_HIP"], cpos, upflags, BOTH)

    return feats
