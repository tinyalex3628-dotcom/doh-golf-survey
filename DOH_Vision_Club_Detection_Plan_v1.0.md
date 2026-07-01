# DOH Vision Club Detection Plan v1.0
**Project C — 학습 모델 기반 클럽/공 검출 (옵션 2) 설계·계획**
*작성일: 2026-07-01 / 상태: PLAN DRAFT (코딩 시작)*
*근거: AI Video Analysis Research · Event & Shaft Detection Method*

> 옵션 1(Hough+수동)의 한계를 넘어, **학습된 YOLO로 클럽헤드·공을 매 프레임 자동
> 검출**한다. 이게 되면 샤프트각(전 구간)·클럽패스·페이스·헤드스피드·P2/P6/P8이 열린다.
> 브라우저에서 **onnxruntime-web**으로 서버 없이 돌린다(Tier-A) → 무거우면 서버(Tier-B).

---

## 1. 목표 & 산출물

| 목표 | 내용 |
|---|---|
| 클럽헤드 검출 | 프레임별 clubhead 박스 → 궤적/속도/패스 |
| 공 검출 | ball 박스 → 발사방향/스핀 proxy |
| 샤프트 자동 | 그립(포즈 wrist) → 클럽헤드 = 샤프트선 → 각도(전 구간) |
| 배포 | ONNX → onnxruntime-web(브라우저) / 서버 fallback |

**이번에 만드는 것 (코딩 시작):**
1. `club_model/train_export.py` — 데이터셋 학습 + ONNX export 파이프라인
2. `pose_poc/club_detect.html` — 브라우저 YOLO 추론 엔진(모델 URL 꽂으면 동작)
3. 본 계획서

---

## 2. 데이터셋 (조사 확정)

| 데이터셋 | 규모 | 클래스 | 링크 |
|---|---|---|---|
| **golf-club-tracking** | 6,750장 | clubhead 등 (YOLOv11 ready) | Roboflow `club-head-tracking/golf-club-tracking` |
| golf-club-head | 300~ | club head, ball | Roboflow `jonathan-tidbury-kt5x7/golf-club-head` |
| golf-club-detection (Pronisi) | 8,577장 | golf-club | Roboflow `pronisi/golf-club-detection-1hgid` |
| golf-ball-detection | 185~ | golf_ball | Roboflow `appleroot-zk4px/golf-ball-detection-w0ixa` |

**권장 클래스 정의(DOH 표준):** `["clubhead","ball"]` (+선택 `grip`)
→ 여러 데이터셋을 이 클래스로 통합/리매핑해 학습. 라이선스 상업사용 여부 확인 필수.

---

## 3. 모델 선택

| 후보 | 파라미터 | 브라우저 적합 | 비고 |
|---|---|---|---|
| **YOLO11n** | 2.6M | ✅ 최적 | 속도/크기 균형, WebGPU/WASM |
| YOLOv8n | 3.2M | ✅ | 성숙한 생태계 |
| YOLO11s | 9.4M | △ | 정확도↑, 서버 권장 |

**결정: YOLO11n (imgsz 640)** — 브라우저 실시간 목표. 정밀 필요 시 서버에서 11s.

---

## 4. 파이프라인

```
[학습] Roboflow 데이터셋 → YOLO11n 학습(Ultralytics) → best.pt
        → ONNX export(opset12, simplify) → best.onnx  (모델 호스팅)
                                   │
[추론-브라우저] club_detect.html
   video 프레임 → letterbox 640 → onnxruntime-web(YOLO11n)
   → decode[1,4+nc,8400] → NMS → clubhead/ball 박스
   → 그립(MediaPipe wrist) + clubhead = 샤프트선 → 각도
                                   │
[통합] analyzer2 의 Hough 자리를 이 검출로 교체(동일 인터페이스)
```

**교체 안전:** 출력이 "clubhead 좌표/샤프트각"으로 동일하므로, Hough→YOLO 교체 시
analyzer2의 상위 로직(이벤트·구간·표)은 그대로 (Technical Arch 계약 준수).

---

## 5. 브라우저 추론 명세 (club_detect.html)

- **런타임:** onnxruntime-web (WASM 기본, WebGPU 가능 시 우선). `ort.env.wasm.wasmPaths` CDN 지정.
- **전처리:** letterbox 640×640(회색 114 패딩), RGB, /255, CHW, `[1,3,640,640]`.
- **출력 디코드:** `[1, 4+nc, 8400]` 채널메이저 → box(cx,cy,w,h in 640) + class score.
- **후처리:** conf 임계 → 클래스별 **NMS(IoU 0.45)** → 원본좌표 역매핑(scale/pad).
- **샤프트:** grip(wrist mid, 포즈) → clubhead center → `angle vs 수직`.
- **fallback:** 모델 URL 없거나 로드 실패 → 포즈 그립만 표시 + 안내(1번 수동으로).

---

## 6. 정확도 목표 & 검증

| 지표 | 목표(초기) |
|---|---|
| clubhead mAP@50 | ≥ 0.7 (느린 구간), 임팩트 블러 구간 별도 평가 |
| 샤프트각 오차 | 수동 라벨 대비 ±3° (P1/P3/P5), 임팩트 근처는 더 큼 |
| 브라우저 속도 | ≥ 15 fps(WASM) / ≥ 30 fps(WebGPU) @ 640 |

- **검증:** 수동 라벨(1번 직접그리기 값)과 대조. 블러 구간은 240fps 촬영으로 완화.
- **한계 인정:** 임팩트 순간 클럽헤드는 여전히 어려움 → confidence 낮게, 보간.

---

## 7. 리스크

| 리스크 | 완화 |
|---|---|
| 데이터셋 라이선스(상업) | 사용 전 확인, 자체 라벨 보강 |
| 임팩트 모션블러 | 블러 증강 학습, 고fps, 추적(Kalman) 병행 |
| 브라우저 성능 편차 | WebGPU 우선/WASM fallback, 서버 Tier-B 옵션 |
| 모델 호스팅 | ONNX(~10MB) CDN/자체 호스팅 |

---

## 8. 다음 단계

1. Roboflow에서 데이터셋 다운로드(API key) → 클래스 통합.
2. `train_export.py` 실행(Colab/GPU) → `best.onnx` 생성.
3. `best.onnx` 호스팅 → `club_detect.html` 모델 URL에 입력 → 검증.
4. 정확도 OK → analyzer2의 Hough를 YOLO 검출로 교체(v3).

---

## 문서 정보
| 항목 | 내용 |
|---|---|
| 버전 | v1.0 (PLAN DRAFT) |
| 산출물 | club_model/train_export.py · pose_poc/club_detect.html |
| 상태 | 코딩 시작 |

*학습 모델은 "회원이 올리면 알아서"를 위한 필수 조각이다. 수동 보정(1번)은 그 전까지의 다리다.*
