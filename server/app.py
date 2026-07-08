"""
DOH Vision 서버 (FastAPI) — Stage 0 계약 고정
=============================================
영상 → NLF 3D 복원 → 회전·척추각·지표 → doh.vision.v1 JSON.

**고정 계약 (인프라 교체와 무관):**
  POST /v1/analyze/video   (video, view, hand)  -> 202 {job_id, status}     비동기·무거움
  GET  /v1/jobs/{job_id}                          -> {status, result?, error?}
  GET  /v1/capabilities                           -> 엔진·모델·스키마 버전
  GET  /v1/health
  (하위호환) POST /analyze  -> 동기로 doh.vision.v1 즉시 반환

이 서버는 어디서 돌든(집PC·Colab·Modal·Cloud Run) analyzer2는 DOH_API_BASE 하나만 바꾸면 됨.
비동기 Job 계약이라 Cloudflare 100초 리밋·모바일 백그라운드·확장에도 안전.

실행:  python -m uvicorn app:app --host 0.0.0.0 --port 8000
환경변수: NLF_MODEL, NLF_MAX_SIDE(기본 720), DOH_CORS_ORIGINS(기본 *)
"""
import os, sys, uuid, time, tempfile, traceback, threading, logging
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] doh: %(message)s")
log = logging.getLogger("doh")

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, "pose3d_poc"))   # wham_golf_rotation / _metrics 재사용

import numpy as np
import cv2
import torch
import torchvision            # NLF가 torchvision::nms 를 써서 로드 전 import 필수
import torchvision.ops        # noqa: F401
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse

from wham_golf_rotation import build_v1

MODEL_URL = "https://github.com/isarandi/nlf/releases/download/v0.3.2/nlf_l_multi_0.3.2.torchscript"
MODEL_PATH = os.environ.get("NLF_MODEL", os.path.join(HERE, "nlf_l_multi_0.3.2.torchscript"))
MAX_SIDE = int(os.environ.get("NLF_MAX_SIDE", "720"))
MAX_FRAMES = int(os.environ.get("NLF_MAX_FRAMES", "600"))     # 안전 상한: 긴 영상 균등샘플(정상 스윙엔 영향 없음)
MAX_JOBS = int(os.environ.get("DOH_MAX_JOBS", "50"))          # Job 메모리 상한(오래된 완료건 제거)
MAX_UPLOAD_MB = int(os.environ.get("DOH_MAX_UPLOAD_MB", "200"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
POSE_MODEL = "nlf_l_multi 0.3.2"

app = FastAPI(title="DOH Vision API", version="1.0")
# CORS: analyzer2(다른 오리진)가 브라우저에서 직접 fetch 하도록. 프로덕션에선 도메인 화이트리스트로.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("DOH_CORS_ORIGINS", "*").split(",")],
    allow_methods=["*"], allow_headers=["*"],
)

_model = None
_model_lock = threading.Lock()
JOBS = {}                                   # job_id -> {status, result, error}
_EXEC = ThreadPoolExecutor(max_workers=1)   # GPU 1개 가정 → 순차 처리


def _ensure_model():
    """모델 확보(없으면 다운로드) 후 로드. 최초 1회(스레드 안전)."""
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        if (not os.path.exists(MODEL_PATH)) or os.path.getsize(MODEL_PATH) < 10_000_000:
            import urllib.request
            print(f"[NLF] 모델 다운로드 중… ({MODEL_URL})")
            urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print(f"[NLF] 로드: {MODEL_PATH}  device={DEVICE}")
        _model = torch.jit.load(MODEL_PATH).to(DEVICE).eval()
        print(">>> NLF OK")
    return _model


def video_to_joints(path, max_side=MAX_SIDE):
    """영상 → (T,J,3) SMPL-24 3D 관절 + 효과적 fps.
       프레임을 max_side로 줄여 VRAM 절약. 매우 긴 영상은 MAX_FRAMES로 균등샘플(fps 보정)해 처리시간 제한."""
    model = _ensure_model()
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        cap.release()
        raise ValueError("영상을 열 수 없음(형식 손상/미지원 코덱). mp4·mov 권장.")
    fps = cap.get(cv2.CAP_PROP_FPS) or 60.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    stride = max(1, round(total / MAX_FRAMES)) if (MAX_FRAMES and total > MAX_FRAMES) else 1
    eff_fps = fps / stride
    J = []
    idx = 0
    with torch.inference_mode():
        while True:
            ok, fr = cap.read()
            if not ok:
                break
            if idx % stride == 0:
                h, w = fr.shape[:2]
                sc = max_side / max(h, w)
                if sc < 1.0:
                    fr = cv2.resize(fr, (int(w * sc), int(h * sc)), interpolation=cv2.INTER_AREA)
                rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
                t = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to(DEVICE)  # [1,3,H,W] uint8
                pred = model.detect_smpl_batched(t)
                per = pred["joints3d"][0]
                if per is not None and len(per) > 0:
                    kp = per[0]
                    kp = kp.detach().cpu().numpy() if torch.is_tensor(kp) else np.asarray(kp)
                    J.append(kp)
            idx += 1
    cap.release()
    if idx == 0:
        raise ValueError("프레임을 하나도 못 읽음(빈/손상 영상).")
    return np.asarray(J), round(float(eff_fps), 2)


def analyze_to_inst(path, view, hand, filename):
    """영상파일 → doh.vision.v1 dict. (동기/비동기 공용 코어) 실패 시 예외."""
    J, fps = video_to_joints(path)
    if J.ndim != 3 or J.shape[0] < 5:
        raise ValueError("사람/프레임을 충분히 못 잡음. 전신이 크게 나오는 영상으로.")
    nj = J.shape[1]
    skeleton = "smpl" if nj >= 22 else ("h36m" if nj == 17 else "smpl")
    vid = os.path.splitext(os.path.basename(filename or "swing"))[0]
    inst = build_v1(J, skeleton=skeleton, view=view, hand=hand, fps=fps, video_id=vid)
    inst.setdefault("quality", {}).setdefault("warnings", []).append(
        f"joints={nj} frames={int(J.shape[0])} max_side={MAX_SIDE}")
    return inst


def _evict_jobs():
    """Job 메모리 상한: 완료/에러된 오래된 것부터 제거(진행중은 유지). dict는 생성순."""
    if len(JOBS) <= MAX_JOBS:
        return
    done = [k for k, v in JOBS.items() if v["status"] in ("done", "error")]
    for k in done[:max(0, len(JOBS) - MAX_JOBS)]:
        JOBS.pop(k, None)


def _run_job(job_id, path, view, hand, filename):
    t0 = time.time()
    JOBS[job_id]["status"] = "running"
    log.info("job %s running (view=%s hand=%s file=%s)", job_id, view, hand, filename)
    try:
        inst = analyze_to_inst(path, view, hand, filename)
        JOBS[job_id].update(status="done", result=inst)
        log.info("job %s done in %.1fs (feat=%d ev=%d)", job_id, time.time() - t0,
                 len(inst.get("features", [])), len(inst.get("swing_events", [])))
    except ValueError as e:                    # 사용자 원인(영상 문제) — 조용히 에러 상태로
        JOBS[job_id].update(status="error", error=str(e))
        log.warning("job %s user-error: %s", job_id, e)
    except RuntimeError as e:                   # OOM 등 런타임
        oom = "out of memory" in str(e).lower()
        msg = "GPU 메모리 부족 — NLF_MAX_SIDE를 낮추거나 더 짧은 영상으로." if oom else f"런타임 오류: {e}"
        JOBS[job_id].update(status="error", error=msg)
        log.error("job %s runtime%s: %s", job_id, " OOM" if oom else "", e)
    except Exception as e:
        traceback.print_exc()
        JOBS[job_id].update(status="error", error=f"내부 오류: {e}")
        log.error("job %s exception: %s", job_id, e)
    finally:
        if DEVICE == "cuda":                    # 5연속 분석 시 8GB VRAM 파편화/누적 방지
            try:
                torch.cuda.empty_cache()
            except Exception:
                pass
        try:
            os.unlink(path)
        except Exception:
            pass
        _evict_jobs()


async def _save_upload(file):
    """업로드 파일 검증 후 임시 저장. 빈 파일/초과 시 ValueError."""
    data = await file.read()
    if not data:
        raise ValueError("빈 파일 — 영상이 업로드되지 않았습니다.")
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        raise ValueError(f"파일이 너무 큽니다(>{MAX_UPLOAD_MB}MB). 더 짧거나 작은 영상으로.")
    suffix = os.path.splitext(file.filename or "video.mp4")[1] or ".mp4"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(data)
    tmp.close()
    log.info("upload received: %s (%.1f MB)", file.filename, len(data) / 1e6)
    return tmp.name


# ── v1 계약 ──────────────────────────────────────────────────────────
@app.post("/v1/analyze/video")
async def analyze_video(file: UploadFile = File(...),
                        view: str = Form("unknown"), hand: str = Form("right")):
    """영상 제출 → job_id 반환(202). 무거운 분석은 백그라운드에서. 결과는 /v1/jobs/{id} 폴링."""
    try:
        path = await _save_upload(file)
    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=400)
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {"status": "queued", "result": None, "error": None}
    _EXEC.submit(_run_job, job_id, path, view, hand, file.filename)
    log.info("job %s queued (pending=%d)", job_id, len(JOBS))
    return JSONResponse({"job_id": job_id, "status": "queued"}, status_code=202)


@app.get("/v1/jobs/{job_id}")
def get_job(job_id: str):
    j = JOBS.get(job_id)
    if not j:
        return JSONResponse({"error": "job not found"}, status_code=404)
    out = {"job_id": job_id, "status": j["status"]}
    if j["status"] == "done":
        out["result"] = j["result"]
    elif j["status"] == "error":
        out["error"] = j["error"]
    return JSONResponse(out)


@app.get("/v1/capabilities")
def capabilities():
    """이 백엔드가 뭘 할 수 있나(런타임 discovery). 클라이언트는 이걸 보고 기능을 켬."""
    return {
        "api_version": "v1",
        "engines": ["vision"],
        "endpoints": ["POST /v1/analyze/video", "GET /v1/jobs/{id}"],
        "models": {"pose": POSE_MODEL},
        "schemas": ["doh.vision.v1"],
        "device": DEVICE, "cuda": torch.cuda.is_available(), "max_side": MAX_SIDE,
    }


@app.get("/v1/health")
def health_v1():
    return {"status": "ok", "device": DEVICE, "cuda": torch.cuda.is_available(),
            "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
            "max_side": MAX_SIDE, "model_loaded": _model is not None,
            "jobs": len(JOBS)}


# ── 하위호환(동기) ───────────────────────────────────────────────────
@app.get("/health")
def health():
    return health_v1()


@app.post("/analyze")
async def analyze(file: UploadFile = File(...),
                  view: str = Form("unknown"), hand: str = Form("right")):
    """동기: 영상 → doh.vision.v1 즉시 반환(레거시/짧은 영상용)."""
    try:
        path = await _save_upload(file)
    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=400)
    try:
        return JSONResponse(analyze_to_inst(path, view, hand, file.filename))
    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=422)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        try:
            os.unlink(path)
        except Exception:
            pass


@app.get("/", response_class=HTMLResponse)
def index():
    with open(os.path.join(HERE, "index.html"), "r", encoding="utf-8") as f:
        return f.read()
