# DOH Vision Engine (Project C) — 문서 인덱스

골프 영상을 DOH Feature로 바꾸는 엔진의 전체 설계 묶음.
**핵심 원칙: Vision은 좌표를 재는 센서다. 의미의 판단(추론)은 DOH가 한다.**

```
Video ─▶ [Vision Engine: Project C] ─▶ doh.vision.v1 JSON ─▶ [DOH KG: Project A] ─▶ Report
             │ 이 저장소가 다루는 범위                          │ 159 nodes 추론
             └ 사실값(Feature)만 생산                           └ 원인/진단 생성
```

## 읽는 순서

| # | 문서 | 무엇을 잠그나 | 상태 |
|---|---|---|---|
| — | `DOH_AI_Video_Analysis_Research_v1.0.md` | 엔진 조사(MediaPipe/RTMPose/YOLO/SwingNet/데이터셋) | ✅ |
| 0 | `DOH_Vision_Engine_Architecture_v1.0.md` | 바깥 경계: 책임 범위 + JSON 계약 + 4-프로젝트 분리 | ✅ |
| 0.5 | `DOH_Vision_Technical_Architecture_v1.1.md` | 안쪽 8-레이어 파이프라인 + 신뢰도/에러 전파 | ✅ |
| 1 | `DOH_Vision_Coordinate_System_Spec_v1.0.md` | 좌표계 7종 + view-invariance(회전=BODY/병진=GROUND) | ✅ |
| 2 | `DOH_Vision_Primitive_Catalog_Spec_v1.0.md` | 기하 객체(명사) 45개 | ✅ |
| 3 | `DOH_Vision_Operator_Catalog_Spec_v1.0.md` | 기하 연산자(동사) 15개 | ✅ |
| 4 | `DOH_Vision_Feature_Spec_v1.0.md` | Feature(문장) 150개 + Node 매핑 | ✅ |
| 5 | `pose_poc/` | MediaPipe 브라우저 PoC (영상→관절→CSV) | ✅ |
| — | `data/vision_feature_map.csv` | VF→Node 매핑 데이터(설문 feature_map과 동일구조) | ✅ |

## 핵심 공식

```
Feature (VF###) = Operator( Primitive[…] ) @ Phase   [Coordinate System]
                     동사(OP###)  명사(PR###)  metadata(P1~P10)   좌표계(CS)
```
같은 계산기를 여러 phase에 꽂아 여러 Feature를 만든다 → 계산식 중복 0.

## 파이프라인 (Technical Architecture v1.1)

```
Video → Frame Sampler → Pose Adapter → [Event Source] → Coordinate Normalizer
      → Primitive Engine → Operator Layer → Feature Engine → doh.vision.v1 JSON
```
- 교체되는 건 **Pose 엔진 · Event 모델**뿐. 좌표계/Primitive/Operator/Feature는 DOH 영구 자산.
- Pose를 MediaPipe→RTMPose→미래모델로 갈아끼워도 JSON 계약과 Feature 어휘는 불변.

## 지금 가능한 것 / 아직 아닌 것

| 가능 (MVP, 포즈만) | 2차 (객체검출 필요) |
|---|---|
| VF ~110개: 회전/스웨이/자세/시퀀스/템포/관절각 | VF 34개: 클럽패스/페이스/샤프트린/볼탄도 |
| MOT/OBS/PAT Node 대부분 근거 공급 | BF-*/CON-* Node |
| 설문+영상 교차검증(같은 Node 수렴) | 헤드스피드·거리 절대값(캘리브레이션) |

## 정직성 원칙 (반복 강조)
- **null ≠ 0**: 관찰 불가와 값이 0은 다르다. 없는 걸 지어내지 않는다.
- **confidence 비증가**: 하류에서 확신이 커지지 않는다(곱/min).
- **false precision 금지**: 단일 카메라 3D는 근사. `depth_estimated` flag를 달고 나간다.
- **계층 비침범**: Vision은 원인/진단을 말하지 않는다. Feature(사실)까지만.

## 다음 단계 (구현)
1. `pose_poc` 출력 CSV로 Coordinate Normalizer(BODY/GROUND 정렬) 구현
2. Primitive Engine → Operator → Feature Engine 파이프라인 코드
3. Event Source(HYBRID: SwingNet 앵커 + pose-rule 보간)
4. 서버 정밀 티어(RTMPose) + `doh.vision.v1` 직렬화
5. `vision_feature_map.csv`로 DOH KG 연결, 설문+영상 융합 Report
6. (2차) YOLO 클럽/공 검출 → CS6_TARGET → BF/CON Feature

---
*작성일 2026-07-01 · 상태 DRAFT(프로 검토 전) · 상위: DOH Architecture v1.0*
