# 표 생성 스크립트 (docs/*.xlsx 재생성용)

엑셀은 손으로 만든 게 아니라 이 스크립트가 만든다. **수치를 고칠 땐 스크립트를 고치고 다시 실행**할 것
(엑셀만 고치면 다음 재생성 때 덮어써짐).

| 스크립트 | 산출물 | 내용 |
|---|---|---|
| `build_thresholds.py` | `docs/DOH_기준치_설계근거.xlsx` | 판정 20구간 × 근거등급(A/B/C) + 42개 커버리지 |
| `build_views.py` | `docs/DOH_뷰별_측정가능표.xlsx` | 진단 17 × 정면/측면 + 측정 42 × 정면/측면 |
| `build_abcd2.py` | `docs/DOH_ABCD_작업표.xlsx` | 0.상용벤치마크 / A.완료 / B.기준조사 / C.측정설계 / D.정의확인 |

실행: `python3 tools/build_thresholds.py` (openpyxl 필요). 출력 경로가 scratchpad로 되어 있으면 `docs/`로 바꿀 것.

## 정본 관계 (2026-07-28 개편 — 앱 운영 대비)
- **판정 구간의 실행 정본은 `rules/doh_rules.v1.json`** ← 앱/서버가 `GET /v1/rules`로 받아가는 데이터.
- `analyzer2.html`의 `DOH_RULES` 블록은 `build_rules.py`가 그 JSON에서 **생성**한다(직접 수정 금지 —
  마커 사이 블록, CI의 `--check`가 어긋나면 실패시킴).
- 엑셀(기준치_설계근거)은 구간의 **근거·출처·등급 문서**.
- **기준 수정 절차: rules JSON 고침 → `python3 tools/build_rules.py` → `build_thresholds.py` → 커밋.**

| 추가 스크립트 | 역할 |
|---|---|
| `build_rules.py` | rules JSON → analyzer2 블록 생성 / `--check`=동기화 검사(CI) |
| `build_kb_graph.py` | kb/source/*.xlsx → kb_causal_graph.json (v1 보존+패치 병합) |
| `build_p2map.py` | docs/DOH_P2_구현표.xlsx |
| `ci_smoke.py` | 합성 스윙 → build_v1 → 스키마·P순서·게이팅 검증 (CI) |
