"""
DOH Vision — 골프 스윙 3D 분석 (Hugging Face Spaces 백엔드)
==========================================================
analyzer2.html(프론트)이 이 Space의 **/analyze API**를 호출해 `doh.vision.v1`을 받는다.
- 계약(doh.vision.v1)은 콜랩/집PC 서버와 동일 → 프론트는 URL만 이 Space로 바꾸면 끝.
- 주소가 영구 고정(xxx.hf.space)이라 매번 켤 필요 없음 = analyzer2에서 진짜 원클릭.
- ZeroGPU(무료 GPU) / CPU 어느 하드웨어든 동작(코드 동일).

엔진 로직(회전+척추각+지표+P1~P10)은 GitHub raw에서 가져와 콜랩과 단일 소스 공유.
"""
import os, json, urllib.request

# ── ZeroGPU 데코레이터: spaces는 torch보다 먼저 import (HF 권장). 없으면(CPU Space) no-op ──
try:
    import spaces
    gpu = spaces.GPU(duration=120)
except Exception:
    def gpu(f):
        return f

import numpy as np, cv2, torch, torchvision, torchvision.ops  # noqa: F401 (nms 등록)
import gradio as gr

# ── 엔진 파일(단일 소스): GitHub raw에서 가져옴 ──
BR = "claude/session-context-recovery-qrdpov"
BASE = f"https://raw.githubusercontent.com/tinyalex3628-dotcom/doh-golf-survey/{BR}/pose3d_poc"
for _f in ("wham_golf_rotation.py", "wham_golf_metrics.py"):
    if not os.path.exists(_f):
        urllib.request.urlretrieve(f"{BASE}/{_f}", _f)
from wham_golf_rotation import build_v1  # noqa: E402

# ── NLF 모델(TorchScript → torch버전 무관). 시작 시 CPU 로드, 추론 시 가용 디바이스로 이동 ──
NLF_URL = "https://github.com/isarandi/nlf/releases/download/v0.3.2/nlf_l_multi_0.3.2.torchscript"
NLF_M = "nlf_l_multi_0.3.2.torchscript"
if (not os.path.exists(NLF_M)) or os.path.getsize(NLF_M) < 10_000_000:
    print("NLF 모델 다운로드(470MB)…")
    urllib.request.urlretrieve(NLF_URL, NLF_M)
model = torch.jit.load(NLF_M).eval()
print(">>> NLF 로드 완료")


def video_to_joints(path, dev, max_side=720):
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
            if sc < 1:
                fr = cv2.resize(fr, (int(w * sc), int(h * sc)), interpolation=cv2.INTER_AREA)
            rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
            t = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to(dev)
            pred = model.detect_smpl_batched(t)
            per = pred["joints3d"][0]
            if per is None or len(per) == 0:
                continue
            kp = per[0]
            kp = kp.detach().cpu().numpy() if torch.is_tensor(kp) else np.asarray(kp)
            J.append(kp)
    cap.release()
    return np.asarray(J), round(float(fps), 2)


@gpu
def _analyze_core(video, view, hand):
    """영상 → doh.vision.v1 dict. GPU 구간(@gpu). ZeroGPU면 이 안에서 cuda 할당됨."""
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(dev)
    J, fps = video_to_joints(video, dev)
    if J.ndim != 3 or J.shape[0] < 5:
        return None
    return build_v1(J, skeleton="smpl", view=view, hand=hand, fps=fps, video_id="swing")


def analyze_fn(video, view, hand):
    """Gradio 콜백 = /analyze API. 출력 [요약HTML, 다운로드, doh.vision.v1(JSON)].
       analyzer2는 3번째(JSON, data[2])만 받아 renderV1로 그림."""
    hide = gr.DownloadButton(visible=False)
    if not video:
        return "<p style='color:#8b97a5'>영상을 올려주세요.</p>", hide, None
    inst = _analyze_core(video, view, hand)
    if inst is None:
        return "<p style='color:#ff7eb6'>사람/프레임을 충분히 못 잡았어요. 전신이 크게 나오는 영상으로.</p>", hide, None
    path = os.path.abspath("doh_vision_v1.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(inst, f, ensure_ascii=False, indent=2)
    n_feat = len(inst.get("features", []))
    n_ev = len(inst.get("swing_events", []))
    summ = (f"<div style='font-family:sans-serif;color:#e8edf2'>✅ 분석 완료 · "
            f"feature {n_feat}개 · P구간 {n_ev}개.<br>"
            f"<b style='color:#4ea1ff'>이 Space URL을 analyzer2의 ☁️ GPU 백엔드 칸에 넣으면</b> "
            f"P1~P10·회전·자세·팔·무릎·스웨이·템포가 예쁘게 표시됩니다.</div>")
    return summ, gr.DownloadButton(value=path, visible=True), inst


with gr.Blocks(title="DOH Vision — Golf Swing 3D") as demo:
    gr.Markdown("## 🏌️ DOH Vision — 골프 스윙 3D 분석 백엔드\n"
                "영상 올리고 **[분석하기]** → `doh.vision.v1`. "
                "이 Space는 **analyzer2.html의 백엔드**로도 쓰입니다 (URL만 넣으면 원클릭).")
    with gr.Row():
        vid = gr.Video(label="스윙 영상 (mp4/mov)", sources=["upload"])
        with gr.Column():
            view = gr.Radio(["FO", "DTL"], value="FO", label="촬영 각도 (FO=정면 / DTL=측면)")
            hand = gr.Radio(["right", "left"], value="right", label="주손")
            btn = gr.Button("분석하기", variant="primary", size="lg")
    out = gr.HTML()
    dl = gr.DownloadButton("⬇ 결과 JSON 내려받기 (doh.vision.v1)", variant="secondary", visible=False)
    api_out = gr.JSON(visible=False)   # analyzer2가 /analyze API로 받아가는 계약
    btn.click(analyze_fn, [vid, view, hand], [out, dl, api_out], api_name="analyze")

demo.launch()
