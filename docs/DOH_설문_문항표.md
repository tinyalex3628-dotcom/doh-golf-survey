# DOH 설문 문항표 (프로토타입 이식용)

정본: `rules/doh_survey.v1.json` · 갱신 2026-08-01 · **이 파일은 `tools/build_survey_doc.py`가 생성한다. 직접 고치지 말 것.**

- **묻는 시점**: 분석 **전** — 분석 결과를 본 뒤에 물으면 답이 판정에 오염된다(회원이 진단에 맞춰 답한다). 업로드·처리 대기시간을 설문으로 채우면 시간도 안 버린다.
- **문항 수**: 6개 + 안전게이트 1개
- **철칙**: 엔진이 카메라로 측정하는 것은 절대 묻지 않는다. 설문은 '보이지 않는 원인'만 담당한다.
- **답 신뢰도 기준**: 회원이 실제로 관찰·확인할 수 있는 것만 묻는다. 느낌(압력 이동 타이밍 등)은 묻지 않고 그 결과(미스샷)로 역추론한다.

앱은 선택지의 **한글 라벨이 아니라 `값`(영문 ID)을 저장·전송**한다. 라벨은 문구 다듬으면 바뀌지만 값은 안 바뀐다.

## 한눈에 보기

| # | 문항 | 형식 | 메우는 구멍 | 도달 엣지 |
|---|---|---|---|---|
| 1 | 드라이버로 친 최근 10발 중 가장 흔한 공의 휘어짐은? | 단일선택 | 클럽페이스 (엔진이 클럽을 못 봐서 원리적으로 측정 불가) | 직접 36 · 체인 75 |
| 2 | 미스가 날 때 가장 자주 나오는 형태는? | 복수선택 (최대 2) | 압력 이동 (지면반력 — 매트/센서 없이는 측정 불가). 느낌 대신 결과로 역추론한다. | 직접 49 · 체인 156 |
| 3 | 어드레스 자세에서 고개를 숙여 왼손 등을 보세요. 손가락 관절(너클)이 몇 개 보이나요? | 단일선택 | 그립 (P1 근본원인 — 카메라로는 손 안쪽이 안 보인다) | 직접 18 · 체인 73 |
| 4 | 아래 동작을 직접 해보고, 잘 안 되는 것을 모두 골라주세요. | 복수선택 | 가동범위 (근본원인 — 엔진이 '못 돈다'는 건 봐도 '왜 못 도는지'는 못 본다) | 직접 15 · 체인 120 |
| 5 | 요즘 스윙할 때 의식하고 있는 말이 있나요? 최근 레슨에서 들은 것도 좋습니다. | 복수선택 | 의도·큐·습관 (다른 방법으로는 절대 알 수 없다 — 회원 머릿속에만 있다) | 직접 7 · 체인 67 |
| 6 | 어드레스로 서서 발바닥을 느껴보세요. 체중이 어디에 실려 있나요? | 단일선택 | P1 발 압력 (근본원인 1위 — 스윙 중 압력은 못 느껴도 정지 상태는 느낄 수 있다) | 직접 24 · 체인 35 |
| G | 스윙할 때 아프거나 불편한 곳이 있나요? | 복수선택 | (비채점) 안전게이트 | — |

## 문항별 선택지

### Q1. 드라이버로 친 최근 10발 중 가장 흔한 공의 휘어짐은?

`Q1_BALL_FLIGHT` · 단일선택

> 화면 안내문: 방향보다 '휘어지는 쪽'을 골라주세요.

| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |
|---|---|---|---|
| `SLICE` | 오른쪽으로 휘어 나간다 (슬라이스) | `Club Face Open (P7)`<br>`Club Face Open (P7) (임팩트 시 클럽페이스 오픈)`<br>`Club Face Open (P6)`<br>`Clubface Open Excessive (P4)`<br>`Clubface Open Excessive (P2)` | 0.8 |
| `HOOK` | 왼쪽으로 감긴다 (훅) | `Club Face Closed (P7)`<br>`Club Face Closed (P7) (임팩트 시 클럽페이스 클로즈)`<br>`Club Face Closed (P6)`<br>`Clubface Closed Excessive (P4)`<br>`Clubface Closed Excessive (P2)` | 0.8 |
| `STRAIGHT` | 거의 곧게 간다 | — (중립) | 0 |
| `MIXED` | 그때그때 다르다 | `Club Face Open (P7)`<br>`Club Face Open (P7) (임팩트 시 클럽페이스 오픈)`<br>`Club Face Closed (P7)`<br>`Club Face Closed (P7) (임팩트 시 클럽페이스 클로즈)` | 0.3 |
| `UNKNOWN` | 잘 모르겠다 | — (건너뜀) | 0 |

### Q2. 미스가 날 때 가장 자주 나오는 형태는?

`Q2_MISS` · 복수선택 · 최대 2개

> 화면 안내문: 아이언 기준으로 골라주세요. 두 개까지 고를 수 있습니다.

| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |
|---|---|---|---|
| `FAT` | 뒤땅 (공 앞 지면을 먼저 친다) | `Casting (캐스팅)`<br>`Lead Pressure Insufficient (리드측 압력 부족)`<br>`Incomplete Pressure Transfer (압력 이동 미완성)`<br>`Late Pressure Shift (압력 이동 지연)` | 0.7 |
| `THIN` | 탑볼 (공 윗부분을 친다) | `Early Pressure Shift (조기 압력 이동)`<br>`Lead Pressure Excessive (리드측 압력 과다)` | 0.6 |
| `SHANK` | 생크 (클럽 목에 맞아 오른쪽으로 튄다) | `Hands Too Far From Body (손이 몸에서 멀어짐)`<br>`Hand Distance Far From Body (P7)`<br>`Spin-out (스핀아웃)` | 0.8 |
| `WEAK` | 힘이 안 실린다 / 거리가 안 난다 | `Pelvis Rotation Insufficient (골반 회전 부족)`<br>`Late Pressure Shift (압력 이동 지연)`<br>`Insufficient Trail Side Pressure During Backswing (백스윙 트레일측 압력 부족)` | 0.5 |
| `NONE` | 특별한 미스 패턴은 없다 | — (중립) | 0 |

### Q3. 어드레스 자세에서 고개를 숙여 왼손 등을 보세요. 손가락 관절(너클)이 몇 개 보이나요?

`Q3_GRIP` · 단일선택

> 화면 안내문: 오른손잡이 기준. 왼손잡이면 오른손 등을 보세요.

| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |
|---|---|---|---|
| `KNUCKLE_0_1` | 0~1개 (손등이 거의 안 보인다) | `Weak Grip Match (P1)` | 0.85 |
| `KNUCKLE_2` | 2개 | — (중립) | 0 |
| `KNUCKLE_3PLUS` | 3개 이상 (손등이 많이 보인다) | `Strong Grip Match (P1)`<br>`Strong Trail Grip`<br>`Strong Trail Grip (Grip Ref)` | 0.85 |
| `UNKNOWN` | 지금 확인이 어렵다 | — (건너뜀) | 0 |

**설계 메모** — '그립이 스트롱인가요?'라고 물으면 회원은 모른다. 너클 개수는 지금 눈으로 셀 수 있다.

### Q4. 아래 동작을 직접 해보고, 잘 안 되는 것을 모두 골라주세요.

`Q4_MOBILITY` · 복수선택

> 화면 안내문: 느낌이 아니라 실제로 해보고 고르는 문항입니다. 통증이 있으면 멈추세요.

| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |
|---|---|---|---|
| `TRAIL_HIP` | 의자에 앉아 무릎을 붙이고 오른발을 바깥으로 벌릴 때, 오른쪽 골반이 뻣뻣하다 | `Limited Trail Hip Internal Rotation`<br>`Limited Trail Hip Internal Rotation (Mobility Ref)`<br>`Trail Hip Internal Rotation Restriction (Mobility Ref)`<br>`Limited Tibial External Rotation` | 0.8 |
| `THORAX` | 팔짱 끼고 앉아 상체만 오른쪽으로 돌릴 때, 45도도 안 돌아간다 | `Limited Thoracic Rotation`<br>`Limited Thoracic Extension`<br>`Limited Thoracic Mobility Compensation`<br>`Limited Pelvis Rotation (P4)` | 0.8 |
| `ANKLE` | 벽 앞에 서서 발을 붙인 채 무릎을 벽에 대기 어렵다 (발목) | `Limited Trail Ankle Mobility / Stability` | 0.75 |
| `SHOULDER` | 만세하듯 두 팔을 귀 옆까지 올리기가 어렵다 | `Limited Trail Arm Flexibility (Mobility Ref)`<br>`Limited Thoracic Extension` | 0.7 |
| `NONE` | 네 개 다 무리 없이 된다 | — (중립) | 0 |

**왜 필요한가** — 가동범위가 원인이면 스윙 교정이 아니라 몸 준비가 처방이다. 처방 자체가 바뀐다.

### Q5. 요즘 스윙할 때 의식하고 있는 말이 있나요? 최근 레슨에서 들은 것도 좋습니다.

`Q5_CUE` · 복수선택

> 화면 안내문: 해당되는 것을 모두 골라주세요.

| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |
|---|---|---|---|
| `HEAD_BACK` | "머리를 뒤에 두고 쳐라" | `'Keep The Head Back' Image (머리를 뒤에 남기려는 이미지)` | 0.9 |
| `HIP_BACK_CHEST_UP` | "엉덩이 빼고 가슴 세워라" | `[Movement Intent / Habit] '엉덩이 빼고 가슴 세워라' 셋업 이미지` | 0.9 |
| `TRAIL_ARM_TIGHT` | "트레일 팔(오른팔)을 몸에 붙여라" | `[Movement Intent / Habit] '트레일 팔을 몸에 붙여라' 셋업 이미지` | 0.9 |
| `LOWER_BODY_FIX` | "하체 고정하고 상체만 돌려라" | `[Movement Intent / Habit] 하체를 고정하려는 셋업 습관`<br>`X-Factor Increase Strategy (Intentional)` | 0.9 |
| `HIT_DOWN` | "눌러 쳐라 / 뒤땅 내지 마라" | `[Movement Intent] '뒤땅 방지·눌러치기' 이미지` | 0.9 |
| `CLOSE_FACE` | "슬라이스 안 나게 페이스 닫아라" | `[Movement Intent] '페이스를 열어 두려는' 또는 슬라이스 방지 오해` | 0.9 |
| `NONE` | 특별히 의식하는 말은 없다 | — (중립) | 0 |

**왜 필요한가** — 동작이 '고장'이 아니라 '지시를 따른 결과'인 경우가 있다. 이걸 모르면 회원이 일부러 하는 걸 결함으로 지적하게 된다.

### Q6. 어드레스로 서서 발바닥을 느껴보세요. 체중이 어디에 실려 있나요?

`Q6_ADDRESS_PRESSURE` · 단일선택

> 화면 안내문: 스윙 중이 아니라 '서 있는 지금' 기준입니다.

| 값 | 선택지 (화면 문구) | 활성화되는 KB 원인 | 가중치 |
|---|---|---|---|
| `TOE` | 앞꿈치 쪽 (발가락) | `Foot Pressure Anterior Excessive (P1)` | 0.75 |
| `CENTER` | 발 한가운데 | — (중립) | 0 |
| `HEEL` | 뒤꿈치 쪽 | `Foot Pressure Posterior Excessive (P1)` | 0.75 |
| `LEAD_PRELOAD` | 왼발(타깃 쪽)에 미리 많이 실려 있다 | `[Setup / Habit] 리드측 선(先)하중 셋업 습관`<br>`Lead Pressure Excessive (P1)` | 0.8 |

**설계 메모** — 스윙 중 압력 이동 타이밍은 묻지 않는다(회원이 답할 수 없다). 정적 셋업 압력만 묻고, 동적인 부분은 Q2 미스샷으로 받는다.

### G. 스윙할 때 아프거나 불편한 곳이 있나요?

`G_PAIN` · 복수선택 · **채점하지 않는다**

| 값 | 선택지 |
|---|---|
| `BACK` | 허리 |
| `NECK_SHOULDER` | 목/어깨 |
| `ELBOW_WRIST` | 팔꿈치/손목 |
| `KNEE` | 무릎 |
| `HIP` | 고관절 |
| `NONE` | 없다 |

**용도** — 판정에 쓰지 않는다. 가동범위·강도 처방을 막는 안전장치일 뿐이다.

**동작** — '없다' 외의 답이 있으면 Q4 기반 가동범위 처방을 출력하지 않고 '전문가 확인 권장'으로 대체한다.

## 기존 설문에서 빼는 것

기존 DOH_Survey_Final(1).html은 엔진이 이미 측정하는 것을 물었다. 예산 낭비이자, 느낌과 측정이 어긋나면 충돌한다.

| 빼는 주제 |
|---|
| 스웨이 |
| 얼리 익스텐션 |
| 척추각 |
| 골반/흉곽 회전량 |
| 무릎 각도 |
| 머리 움직임 |
| 템포 |

엔진 측정 항목과 겹치는 KB 노드 **52개**. 이 7개 주제는 설문에서 전부 뺀다. 엔진이 숫자로 답한다.

## 응답 저장 형식 (앱 → 서버)

```json
{
  "schema": "doh.survey.answers.v1",
  "answers": {
    "Q1_BALL_FLIGHT": "SLICE",
    "Q2_MISS": [
      "FAT"
    ],
    "Q3_GRIP": "KNUCKLE_0_1",
    "Q4_MOBILITY": [
      "TRAIL_HIP"
    ],
    "Q5_CUE": [
      "HEAD_BACK"
    ],
    "Q6_ADDRESS_PRESSURE": "TOE"
  },
  "G_PAIN": [
    "NONE"
  ]
}
```

- 단일선택은 문자열, 복수선택은 배열.
- 회원이 답을 안 하면 그 키를 **아예 빼서** 보낸다 (빈 문자열 금지).
- 추론기는 선택지의 `activates` 노드를 그래프 탐색 **시드**로 넣고 `w`를 초기 확신도로 쓴다.

