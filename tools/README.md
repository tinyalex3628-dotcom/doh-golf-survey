# 표 생성 스크립트 (docs/*.xlsx 재생성용)

엑셀은 손으로 만든 게 아니라 이 스크립트가 만든다. **수치를 고칠 땐 스크립트를 고치고 다시 실행**할 것
(엑셀만 고치면 다음 재생성 때 덮어써짐).

| 스크립트 | 산출물 | 내용 |
|---|---|---|
| `build_thresholds.py` | `docs/DOH_기준치_설계근거.xlsx` | 판정 20구간 × 근거등급(A/B/C) + 42개 커버리지 |
| `build_views.py` | `docs/DOH_뷰별_측정가능표.xlsx` | 진단 17 × 정면/측면 + 측정 42 × 정면/측면 |
| `build_abcd2.py` | `docs/DOH_ABCD_작업표.xlsx` | 0.상용벤치마크 / A.완료 / B.기준조사 / C.측정설계 / D.정의확인 |

실행: `python3 tools/build_thresholds.py` (openpyxl 필요). 출력 경로가 scratchpad로 되어 있으면 `docs/`로 바꿀 것.

## 정본 관계
- **판정 구간의 실행 정본은 `pose_poc/analyzer2.html`의 `DOH_RULES`** — 엔진이 실제로 쓰는 값.
- 엑셀은 그 구간의 **근거·출처·등급을 기록하는 문서**. 둘이 어긋나면 DOH_RULES가 실제 동작, 엑셀이 의도.
- 값을 바꿀 땐 양쪽 다 고칠 것.
