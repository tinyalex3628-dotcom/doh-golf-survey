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
    head=15, l_shoulder=16, r_shoulder=17, l_elbow=18, r_elbow=19,
    l_wrist=20, r_wrist=21,
)

# 지표가 신뢰되는 카메라 뷰 (측정 축이 화면 안에 있는가)
BOTH = ("FO", "DTL")   # 3D 세그먼트각·회전·시간 — 양쪽 OK (실측 확인)
FRONT = ("FO",)        # 타깃선 방향(스웨이) — 정면만
# DTL = ("DTL",)       # (예정) 깊이축 지표: 샤프트린·핸드뎁스 등 — 측면만


# ── 순수 벡터 기하 (3-튜플) ─────────────────────────────────────────────
def _sub(a, b):   return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def _dot(a, b):   return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
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

    return feats
