# DOH Vision — API & 백엔드 아키텍처 설계 v1.0

> 목적: 인프라(Colab/Modal/RunPod/전용GPU)를 언제든 갈아끼워도 **클라이언트(analyzer2·모바일)는
> 수정 0**이 되도록, **계약(contract)** 을 뼈대로 고정한다. "어디에 올릴지"보다 "계약을 어떻게
> 고정할지"가 핵심.

---

## ⛔ 계약 동결 선언 (2026-07-04, Stage 0 이후)

**클라이언트 계약은 안정적으로 유지하는 것이 최우선 원칙이다.** 내부 구현(Colab/Modal/Cloud Run/
Cloudflare/GPU종류)은 얼마든지 바뀌어도 되지만, analyzer2·모바일이 의존하는 **아래 계약은 함부로 바꾸지 않는다.**

- **동결 대상:** `POST /v1/analyze/video`, `GET /v1/jobs/{id}`, `GET /v1/capabilities`, `GET /v1/health`,
  그리고 응답 스키마 `doh.vision.v1`.
- **허용되는 변경(비파괴):** 스키마에 필드 **추가**(append-only), 새 엔드포인트 **추가**(`/v1/diagnose` 등),
  새 `error_flags`/`warnings` 값 추가. → 기존 클라이언트 안 깨짐.
- **금지되는 변경(파괴):** 기존 필드 삭제/개명/의미변경, 기존 엔드포인트 경로·요청형식·응답형식 변경,
  이벤트/feature id 재정의. → 필요하면 **`/v2`** 로 새로 낸다(구 `/v1`은 유지).
- 검증 게이트: 계약을 건드리는 PR은 `schema/validate.py`(doh.vision.v1) 통과 + analyzer2 renderV1 호환 확인 필수.

## 0. 설계 원칙 (5개)

1. **Contract-first.** 고정하는 건 인프라가 아니라 ① 요청 API(`POST /v1/analyze/*`)와
   ② 응답 스키마(`doh.vision.v1`). 이 둘이 안정적이면 뒤는 전부 교체 가능.
2. **두 개의 버전 축을 분리한다.**
   - **API 버전** = URL 경로(`/v1`, `/v2`). 엔드포인트 모양의 파괴적 변경에만 올림.
   - **데이터/스키마 버전** = JSON `schema` 필드(`doh.vision.v1`, `doh.diagnosis.v1`…). **append-only**로
     독립 진화(우리는 이미 이 원칙: 지표 추가는 계약에 추가만, UI/모바일 불변).
   → 지표 12개→50개 늘려도 API는 `/v1` 그대로.
3. **단일 엣지 오리진.** 클라이언트는 `https://api.dohvision.com` **하나만** 안다. 백엔드 교체는
   엣지(Cloudflare 리버스 프록시)에서 끝낸다. → CORS 문제 소멸, 백엔드 은닉, SSL·인증·레이트리밋 엣지처리.
   **GitHub를 서비스 디스커버리로 쓰지 않는다**(코드 저장소지 주소 저장소가 아님). `/config` 조회도 불필요.
4. **무거운 컴퓨트는 비동기(Job) 계약.** 영상 분석은 20~60초(CPU면 수 분). 동기 HTTP는
   프록시·모바일·터널에서 타임아웃으로 깨진다. **특히 Cloudflare 무료 프록시는 100초 하드리밋** →
   동기로 긴 분석을 프록시 뒤에 두면 무조건 터진다. 그래서 **제출→job_id→폴링** 을 v1부터 계약에 넣는다.
5. **무상태 컴퓨트 / 유상태 데이터 분리.** Vision·Inference·Report 엔진은 무상태 함수(수평확장·인프라교체 자유).
   유저/스윙이력 DB는 별도 서비스·별도 스케일. 처음부터 섞지 않는다.

---

## 1. 프런트도어 (클라이언트가 보는 것)

```
analyzer2 / 모바일  ──►  https://api.dohvision.com/v1/...
                              │  (Cloudflare: DNS·SSL·프록시·엣지인증)
                              ▼
                   현재 백엔드로 라우팅 (교체 지점)
        Stage0 Colab(cloudflared 터널)  ·  Stage1 Modal  ·  Stage2 Cloud Run/전용GPU
```

- 클라이언트 코드에는 **`DOH_API_BASE` 상수 하나**만 존재. 프로덕션=`https://api.dohvision.com`.
  개발 중(도메인 전) 로컬/콜랩 테스트용 **override 입력칸**만 허용(그게 유일한 "config").
- 도메인 생기는 순간 이 상수 고정 → 이후 영원히 무수정. (server.json/`/config` 엔드포인트 안 만듦.)
- 런타임 discovery가 필요하면 **`GET /v1/capabilities`** ("이 백엔드가 가진 엔진·모델·스키마 버전")로 해결.
  클라이언트는 이걸 보고 기능을 켜고 끔("어디냐"가 아니라 "뭘 하냐").

---

## 2. API 표면 (v1) — 장기 확장 대비 리소스 설계

엔진 계층별로 네임스페이스를 나눈다. 지금은 Vision만 구현, 나머지는 **경로만 예약**해두면 나중에
모듈이 분리돼도 클라이언트 변경 없이 라우팅만 바뀐다.

```
BASE = https://api.dohvision.com

# ── Vision Engine : 영상/이미지 → 원시 3D 측정(doh.vision.v1) ──
POST /v1/analyze/video      # video + {view,hand,fps?}  → 202 {job_id}         (비동기·무거움)
POST /v1/analyze/image      # image + {view,hand}        → 200 doh.vision.v1    (동기·가벼움: 단일프레임 자세)
GET  /v1/jobs/{job_id}      #                            → {status, result?, error?}
                            #   status: queued|running|done|error, result=doh.vision.v1

# ── Inference / Diagnosis Engine : 측정 → DOH 진단(Feature→Node→Chain) ──
POST /v1/diagnose           # doh.vision.v1 | {job_id}   → doh.diagnosis.v1   (결함·노드·체인·우선순위)

# ── Report / Coach Engine : 진단 → 사람이 읽는 결과 ──
POST /v1/report             # diagnosis(+vision)         → doh.report.v1       (구조화 리포트/렌더토큰)
POST /v1/coach              # diagnosis                  → 코칭텍스트·드릴(LLM) (느리면 비동기)

# ── Mobility (별도 도메인: 신체가동성 스크리닝) ──
POST /v1/mobility/analyze   # (스윙과 다른 캡처)          → doh.mobility.v1

# ── Identity / Data (Stage 2+, 유상태) ──
POST /v1/sessions           # 익명 세션(무가입 시작)
GET  /v1/users/{id}/swings  # 이력
POST /v1/swings             # 스윙+분석+진단+리포트 묶어 저장

# ── Meta ──
GET  /v1/health
GET  /v1/capabilities       # {engines:[...], models:{pose:"nlf 0.3.2",...}, schemas:["doh.vision.v1",...]}
```

**설계 노트**
- **비디오 vs 이미지 분리**: 영상=시간축(P1~P10·템포·회전), 이미지=단일프레임(자세 스냅샷)로 파이프라인·출력이
  본질적으로 달라 엔드포인트를 나눈다. (GPT의 `/analyze/video`·`/analyze/image` 채택.)
- **`/feature`는 별도 HTTP로 안 뺀다**: 지표는 이미 `doh.vision.v1` 안에 있음(append-only). 파생계산이
  필요하면 그건 Inference(`/diagnose`)의 몫.
- **비동기 우선(영상)**: `POST /analyze/video → 202 {job_id}` → `GET /jobs/{id}` 폴링(또는 후일 SSE/웹훅).
  모바일 백그라운드·푸시·재시도·CF 100초 리밋을 한 번에 해결. Stage0에선 job을 인메모리로 처리해도 계약은 동일.

---

## 3. 모듈 분리 로드맵 (언제 쪼개나)

```
[지금]  한 FastAPI 프로세스 = Vision 만.
[베타]  Vision(GPU) 과 Inference/Report(CPU·LLM) 를 분리 배포 — 각자 스케일/하드웨어.
        게이트웨이(CF 또는 API GW)가 /v1/analyze/*→Vision, /v1/diagnose→Inference … 라우팅.
        URL 택소노미(§2)를 이렇게 짜뒀으니 분리는 '라우팅 변경'이지 '클라이언트 변경'이 아님.
[정식]  + Identity/Data(유상태 DB) 별도 서비스. 작업 큐(Redis/Cloud Tasks)로 job 정식화.
        Vision 은 GPU 오토스케일, Report/Coach 는 CPU, DB 는 관리형.
```

계약(각 계층의 `doh.*.v(n)` JSON)이 계층 간 인터페이스다. 엔진을 재작성해도 계약만 지키면 상류 무영향.

---

## 4. 인프라 단계 (계약 위에 갈아끼우는 것)

| 단계 | 백엔드(교체 대상) | 프런트도어 | 비용 | 속도 | 클라이언트 변경 |
|---|---|---|---|---|---|
| **Stage 0 개발** | Colab GPU + FastAPI | 없음(직접) 또는 CF quick tunnel | 무료 | 빠름 20~60초 | `DOH_API_BASE`=override |
| **Stage 1 베타** | **Modal**(서버리스 GPU) + FastAPI | Cloudflare + `api.dohvision.com` | 무료크레딧 | 콜드스타트+빠름 | **무변경** |
| **Stage 2 정식** | Modal/CloudRun/전용GPU 오토스케일 | CF + 도메인 + 엣지인증/큐 | 사용량 | 빠름 | **무변경** |

- **Cloudflare는 버리지 않는다**(GPT ② 채택): Stage1부터 `api.dohvision.com`의 영구 앞단(DNS/SSL/프록시).
  뒤를 Colab 터널→Modal→RunPod로 바꿔도 CF 설정만 손봄. 도메인은 연 ~$1–10.
- **Modal은 "좋아 보임"이 아니라 PoC로 검증**(GPT ③): 아래 §5 체크리스트로 먼저 확인 후 채택.

---

## 5. Modal PoC 체크리스트 (베타 확정 전 필수 검증)

같은 `server/app.py`(FastAPI)를 Modal에 올려 **실측**으로 확인:
- [ ] **GPU 종류/가용**: T4/A10G/L4 중 무엇이 붙나, NLF 추론 실제 지연(프레임수×?ms).
- [ ] **콜드스타트**: 컨테이너 부팅 + 470MB 모델 로드 시간. 메모리 스냅샷(`@enter`/snapshot)으로 단축되나.
- [ ] **메모리**: NLF+torch+torchvision+영상 디코드가 할당 RAM/VRAM 안에 드나(OOM 없나).
- [ ] **업로드 제한**: 요청 바디 크기 한도. 큰 영상은 Volume/pre-signed URL로 우회해야 하나.
- [ ] **타임아웃**: 함수 최대 실행시간 vs 비동기 job 처리로 회피.
- [ ] **동시성/스케일투제로**: 유휴 시 0으로 내려가나, 요청 시 몇 초 만에 뜨나, 동시요청 처리.
- [ ] **네트워크(사지방)**: Modal 엔드포인트가 군내망에서 열리나(안 되면 CF 앞단으로 우회).

통과하면 Stage 1 확정. 막히면 RunPod 서버리스/Cloud Run GPU를 같은 방식으로 비교.

---

## 6. 지금 당장의 작업(Stage 0) — 계약을 고정하는 최소 변경

1. **`server/app.py`**: CORS 추가(analyzer2가 브라우저에서 직접 fetch). 라우트를 `/v1/analyze/video`로
   정리(기존 `/analyze` 유지+alias). `/v1/health`·`/v1/capabilities` 추가.
2. **analyzer2**: `@gradio/client` → **순수 `fetch(DOH_API_BASE + "/v1/analyze/video", FormData)`**.
   `DOH_API_BASE` 상수 + 개발용 override 입력칸. (server.json/‌config 안 씀.)
3. **Colab 셀**: Gradio 말고 `uvicorn server.app:app` 실행 + (선택)CF quick tunnel. Gradio는 테스트 UI로만.
4. → 베타에서 **같은 app.py를 Modal에** 올리고 CF가 `api.dohvision.com`을 그리로. analyzer2 무수정.

핵심 재확인: **고정하는 건 `/v1/analyze/*` + `doh.vision.v1`.** 이게 안정적이면 Colab이든 Modal이든
Cloud Run이든 뒤 인프라는 언제든 교체 가능 — 그게 장기 유지보수가 가장 쉬운 구조다.
