#!/usr/bin/env python3
"""
DOH Vision — 골프 클럽/공 검출 모델 학습 + ONNX export (옵션 2)
근거: DOH_Vision_Club_Detection_Plan_v1.0.md

목표: YOLO11n 으로 clubhead(+ball) 검출 모델을 학습하고,
      브라우저(onnxruntime-web)용 ONNX로 내보낸다.

사용 흐름 (Colab 또는 GPU 머신):
  pip install -r requirements.txt
  # 1) 데이터셋 준비: Roboflow에서 다운로드하거나 로컬 data.yaml 지정
  python train_export.py --data data.yaml --epochs 100 --imgsz 640
  # 결과: runs/detect/doh_club/weights/best.onnx  → 호스팅 후 club_detect.html에 URL 입력

Roboflow 데이터셋(조사 확정, 상업 라이선스 확인 필요):
  - club-head-tracking/golf-club-tracking  (6,750장)
  - jonathan-tidbury-kt5x7/golf-club-head   (clubhead, ball)
  - pronisi/golf-club-detection-1hgid       (8,577장)
DOH 표준 클래스: ["clubhead", "ball"]  (여러 데이터셋을 이 클래스로 리매핑 권장)
"""
import argparse
import os


def download_roboflow(api_key, workspace, project, version, fmt="yolov11"):
    """Roboflow에서 데이터셋 다운로드 → data.yaml 경로 반환."""
    from roboflow import Roboflow
    rf = Roboflow(api_key=api_key)
    ds = rf.workspace(workspace).project(project).version(version).download(fmt)
    return os.path.join(ds.location, "data.yaml")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data.yaml",
                    help="YOLO data.yaml 경로 (로컬). Roboflow 옵션 미사용 시 필수")
    ap.add_argument("--model", default="yolo11n.pt", help="베이스 가중치 (yolo11n/yolov8n)")
    ap.add_argument("--epochs", type=int, default=100)
    ap.add_argument("--imgsz", type=int, default=640)
    ap.add_argument("--batch", type=int, default=16)
    ap.add_argument("--name", default="doh_club")
    ap.add_argument("--opset", type=int, default=12, help="onnxruntime-web 호환 opset")
    # Roboflow 자동 다운로드 (선택)
    ap.add_argument("--rf-key", default=os.environ.get("ROBOFLOW_API_KEY"))
    ap.add_argument("--rf-workspace")
    ap.add_argument("--rf-project")
    ap.add_argument("--rf-version", type=int)
    args = ap.parse_args()

    data = args.data
    if args.rf_key and args.rf_workspace and args.rf_project and args.rf_version:
        print("[DOH] Roboflow 데이터셋 다운로드 중...")
        data = download_roboflow(args.rf_key, args.rf_workspace,
                                 args.rf_project, args.rf_version)
        print(f"[DOH] data.yaml = {data}")

    from ultralytics import YOLO
    model = YOLO(args.model)

    print(f"[DOH] 학습 시작: {args.model}  data={data}  epochs={args.epochs}")
    model.train(
        data=data, epochs=args.epochs, imgsz=args.imgsz, batch=args.batch,
        name=args.name, patience=20, close_mosaic=10,
        # 임팩트 모션블러 대응: 블러/밝기 증강 강화
        augment=True, hsv_v=0.5, degrees=5.0, translate=0.1, scale=0.5,
    )

    print("[DOH] ONNX export (onnxruntime-web 용: simplify, dynamic=False, nms=False)")
    onnx_path = model.export(
        format="onnx", opset=args.opset, imgsz=args.imgsz,
        simplify=True, dynamic=False, nms=False,
    )
    print(f"[DOH] 완료 → {onnx_path}")
    print("[DOH] 이 파일을 호스팅한 뒤 club_detect.html '모델 URL'에 입력하세요.")
    print("[DOH] 클래스 순서(names)를 club_detect.html '클래스' 입력과 일치시키세요.")


if __name__ == "__main__":
    main()
