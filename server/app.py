"""
DOH Vision 서버 (집 PC / GPU)
=============================
영상 업로드 → NLF 3D 복원 → 회전·척추각·지표 → doh.vision.v1 JSON.
같은 서버가 이쁜 웹UI(index.html)도 서빙 → 브라우저에서 localhost 열고 업로드만.

실행:  python -m uvicorn app:app --host 127.0.0.1 --port 8000
       (또는 start.bat 더블클릭)  →  브라우저에서 http://localhost:8000

환경변수(선택):
  NLF_MODEL     모델 경로 (기본: 이 폴더의 nlf_l_multi_0.3.2.torchscript, 없으면 자동 다운로드)
  NLF_MAX_SIDE  프레임 최대 한 변 픽셀 (기본 720; 8GB VRAM 안전. 크면 정밀↑·메모리↑)
"""
import os, sys, tempfile, traceback

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, "pose3d_poc"))   # wham_golf_rotation / _metrics 재사용

import numpy as np
import cv2
import torch
import torchvision            # NLF가 torchvision::nms 를 써서 로드 전 import 필수
import torchvision.ops        # noqa: F401
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, HTMLResponse

from wham_golf_rotation import build_v1

MODEL_URL = "https://github.com/isarandi/nlf/releases/download/v0.3.2/nlf_l_multi_0.3.2.torchscript"
MODEL_PATH = os.environ.get("NLF_MODEL", os.path.join(HERE, "nlf_l_multi_0.3.2.torchscript"))
MAX_SIDE = int(os.environ.get("NLF_MAX_SIDE", "720"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="DOH Vision")
_model = None


def _ensure_model():
    """모델 파일 확보(없으면 다운로드) 후 로드. 최초 1회."""
    global _model
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
    """영상 → (T,J,3) SMPL-24 3D 관절 + fps. 프레임을 max_side로 줄여 VRAM 절약."""
    model = _ensure_model()
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 60.0
    J = []
    with torch.inference_mode():
        while True:
            ok, fr = cap.read()
            if not ok:
                break
            h, w = fr.shape[:2]
            sc = max_side / max(h, w)
            if sc < 1.0:
                fr = cv2.resize(fr, (int(w * sc), int(h * sc)), interpolation=cv2.INTER_AREA)
            rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
            t = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to(DEVICE)  # [1,3,H,W] uint8
            pred = model.detect_smpl_batched(t)
            per = pred["joints3d"][0]
            if per is None or len(per) == 0:
                continue
            kp = per[0]
            kp = kp.detach().cpu().numpy() if torch.is_tensor(kp) else np.asarray(kp)
            J.append(kp)
    cap.release()
    return np.asarray(J), round(float(fps), 2)


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE, "cuda": torch.cuda.is_available(),
            "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
            "max_side": MAX_SIDE, "model_loaded": _model is not None}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...),
                  view: str = Form("unknown"), hand: str = Form("right")):
    """영상 → doh.vision.v1 JSON."""
    suffix = os.path.splitext(file.filename or "video.mp4")[1] or ".mp4"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(await file.read())
        tmp.close()
        J, fps = video_to_joints(tmp.name)
        if J.ndim != 3 or J.shape[0] < 5:
            return JSONResponse({"error": "사람/프레임을 충분히 못 잡음. 영상 확인."}, status_code=422)
        nj = J.shape[1]
        skeleton = "smpl" if nj >= 22 else ("h36m" if nj == 17 else "smpl")
        vid = os.path.splitext(os.path.basename(file.filename or "swing"))[0]
        inst = build_v1(J, skeleton=skeleton, view=view, hand=hand, fps=fps, video_id=vid)
        inst.setdefault("quality", {}).setdefault("warnings", []).append(
            f"joints={nj} frames={int(J.shape[0])} max_side={MAX_SIDE}")
        return JSONResponse(inst)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


@app.get("/", response_class=HTMLResponse)
def index():
    with open(os.path.join(HERE, "index.html"), "r", encoding="utf-8") as f:
        return f.read()
