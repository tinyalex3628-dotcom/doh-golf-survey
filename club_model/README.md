# DOH Club Detection Model (옵션 2)

YOLO11n으로 **클럽헤드/공**을 검출하는 모델을 학습하고, 브라우저용 **ONNX**로 내보내는 파이프라인.
결과 `best.onnx`를 호스팅해 `pose_poc/club_detect.html`에 URL로 꽂으면 브라우저에서 자동 검출됩니다.

## 왜 필요한가
옵션 1(Hough+수동 클릭)은 회원이 클릭해야 하고 3점만 잽니다. 이 모델이 있으면
**클럽헤드를 매 프레임 자동 추적** → 샤프트각(전 구간)·클럽패스·페이스·헤드스피드·P2/P6/P8이 열립니다.

## 실행 (Colab 또는 GPU 머신)
```bash
pip install -r requirements.txt

# 방법 A) 로컬 data.yaml
python train_export.py --data data.yaml --epochs 100 --imgsz 640

# 방법 B) Roboflow 자동 다운로드
export ROBOFLOW_API_KEY=xxxx
python train_export.py \
  --rf-workspace club-head-tracking --rf-project golf-club-tracking --rf-version 2 \
  --epochs 100 --imgsz 640
```
결과: `runs/detect/doh_club/weights/best.onnx`

## 데이터셋 (조사 확정 · 라이선스 확인 필수)
| 데이터셋 | 규모 | Roboflow 경로 |
|---|---|---|
| golf-club-tracking | 6,750장 | club-head-tracking/golf-club-tracking |
| golf-club-head (club+ball) | 300~ | jonathan-tidbury-kt5x7/golf-club-head |
| golf-club-detection | 8,577장 | pronisi/golf-club-detection-1hgid |
| golf-ball-detection | 185~ | appleroot-zk4px/golf-ball-detection-w0ixa |

- **DOH 표준 클래스: `["clubhead","ball"]`** — 여러 데이터셋을 이 순서로 통합/리매핑 권장.
- 학습 후 `data.yaml`의 `names` 순서를 **club_detect.html '클래스' 입력과 반드시 일치**.

## export 옵션 (브라우저 호환)
`train_export.py`가 `format=onnx, opset=12, simplify=True, dynamic=False, nms=False`로 내보냅니다.
(NMS는 브라우저 JS에서 수행 → club_detect.html에 구현됨)

## 다음
1. `best.onnx` 호스팅 (CDN 또는 자체 서버, CORS 허용)
2. `club_detect.html` 열고 모델 URL + 클래스 입력 → 측면 영상으로 검증
3. 수동 라벨(analyzer2 '직접 그리기') 대비 오차 확인
4. OK면 analyzer2의 Hough를 이 검출로 교체(v3)
