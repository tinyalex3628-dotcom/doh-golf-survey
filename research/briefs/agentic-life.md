# [agentic-life] 에이전틱 AI·개인비서·OS 레벨 통합

> **헤드라인** — 의뢰인이 묘사한 "라운딩 전 개인화 브리핑 + 주유소 + 식당 + 귀가 경로" 시나리오는 2026년 7월 현재 **이미 출시되어 있고, 대부분 공짜다**(삼성 Now Brief, GM 400만 대 차량의 Gemini, Arccos의 Pre-Round Warm-Up, 7월 1일 시작된 Meta 안경 골프 모드) — 그러나 에이전트는 **사람이 4분 안에 끝내는 과제는 거의 100%, 4시간 넘는 과제는 10% 미만** 성공한다. 즉 이 시나리오는 창업 기회가 아니라 플랫폼 기본값이고, 남는 자리는 v1.0 계명5의 **30초짜리 판단 한 건**뿐이다.

> **조사 제약(반드시 읽을 것)** — 이 축의 조사에서 **WebFetch(원문 직접 열람)가 조직 이그레스 정책으로 전면 차단**됐다. 9회 시도 전부 `403 CONNECT rejected`(프록시 로그: `blog.google:443`, `en.wikipedia.org:443`, `www.kakaocorp.com:443` 등, 2026-07-30T03:26Z). 따라서 본 브리프의 사실은 **검색엔진 요약을 통한 2차 확인**이며, 등급은 의도적으로 보수적으로 매겼다. `확인` 등급은 하나도 부여하지 않았다. IR·시행령 별표·개발자 문서 원문 대조가 필요한 항목은 `미해결 질문`에 명시했다.

## 서사 분석

### 1. 시나리오는 기회가 아니라 이미 배포된 기본값이다

의뢰인의 문장을 조각내면 네 개의 기능이다. (a) 캘린더의 라운딩 일정을 읽고 (b) 퍼스널 데이터로 뭔가를 추천하고 (c) 주유소·식당을 경로상에서 찾고 (d) 끝나고 귀가 경로를 최적화한다. 2026년 7월 현재 이 네 조각은 각각 다른 회사가 이미 무료로 배포했다.

(a)+(b)는 삼성 **Now Brief**다. One UI 8.5에서 기기 내 데이터로 "일일 아젠다, 리마인더, 여행 정보, 개인화 추천"을 카드로 띄운다. 온디바이스 **Personal Data Engine**이 사용자 선호를 학습하고 Knox로 앱별 암호화 격리한다. Galaxy S26에 기본 탑재, 요금 없음. (c)는 구글이 자동차에 넣었다. 2026년 4월 30일부터 GM의 Google built-in 탑재 차량 **약 400만 대**(2022년형 이후)에 Gemini가 무상 업그레이드로 내려갔고, 볼보는 2020년형까지 소급해 16개 모델, 폴스타도 포함됐다. 구글이 든 예시 명령어가 하필 이것이다 — *"Find a supermarket on my way home and text Joe that I'm on my way."* 의뢰인 시나리오의 (c)와 (d)를 한 문장에 담은 데모를 구글이 400만 대에 이미 밀어넣었다.

골프 쪽 조각은 더 나쁘다. **Arccos**는 이미 "Pre-Round Warm-Up"을 붙였다 — 현재 집중 영역, 최근 퍼포먼스, 남은 시간(15/30/60분)에 맞춰 개인화된 연습장 세션을 짜준다. 4만 개 이상 코스 매핑, 풍속·경사·기온·습도·고도 보정 야디지. 그리고 2026년 7월 1일, **Meta가 18Birdies와 Arccos를 Meta AI 안경에 통합**했다. "라운드 시작해"라고 말하면 음성으로 야디지·바람·클럽 추천·해저드 경고·스코어 기록이 돌아간다. 안경 연동 시 6개월 구독 무료. 즉 의뢰인이 상상한 "워치든 폰이든 앱이든"의 상위 버전이 안경으로 먼저 왔다.

여기에 AI 캐디 앱이 홍수다. Putty, Scratch AI, ForeSight, Gimmie, Golf.ai, Caddie AI(caddiehq)가 전부 같은 문장을 쓴다 — "당신의 샷 데이터와 실시간 날씨로 클럽과 타깃을 추천." v1.0에서 확정한 패턴이 그대로 재연되고 있다. 골프존이 2021년 AI 스윙분석을 무료 번들로 풀어 코모디티로 만든 것과 똑같이, 2026년의 '라운드 전 개인화 브리핑'은 이미 코모디티다. **의뢰인이 이 시나리오를 제품으로 만들면 v1.0의 3전3패(CoachNow·Hudl Technique·Thriv) 명단에 네 번째로 들어간다.**

### 2. 약속과 실제의 격차 — 18개월, 2,500억원, 그리고 유령 예약

동시에, 이 시나리오의 '자율 실행' 부분은 아직 아무도 못 하고 있다. 애플이 증거다. 2024년 6월 WWDC에서 온스크린 인지·퍼스널 컨텍스트·앱 간 통합 Siri를 데모하고 "1년 내"를 약속했다. iOS 18.4 목표였다. 2025년 3월 7일 공식 연기, 2026년 봄으로 밀렸고, 결국 **2026년 6월 8일 WWDC에서야 'Siri AI'로 공개**됐다. 일반 사용자에게는 iOS 27과 함께 **2026년 9월**에 간다. 데모에서 출시까지 약 27개월이다.

그 대가는 현금으로 청구됐다. 애플은 AI 기능 허위광고 집단소송에 **2억 5,000만 달러(약 3,500억원) 합의**했고, 2026년 7월 24일 법원 승인 보도가 나왔다. 2024년 6월 10일~2025년 3월 29일 사이 iPhone 15 Pro/16을 산 미국 거주자에게 대당 **25달러, 청구가 적으면 최대 95달러**를 지급한다. 애플은 잘못을 인정하지 않았다. 더 결정적인 것은 새 Siri의 두뇌다. 애플은 **연 10억 달러를 구글에 지불하고 커스텀 Gemini 모델로 Siri를 돌린다**(2026년 1월 12일 보도, 6월 8일 WWDC에서 확인). 세계 최대 시가총액 기업이 자기 어시스턴트를 자력으로 못 만들어 경쟁사 모델을 임대했다.

작동 품질도 아직 흔들린다. Safari로 OpenTable의 식당 페이지를 열기만 하면 예약하지 않았는데도 캘린더에 예약 항목이 자동 생성되는 버그가 보고됐다. 캘린더를 읽고 추론하는 층이 얼마나 얕은 토대 위에 있는지 보여주는 사례다. ChatGPT 에이전트 모드도 "캘린더 작업이 가장 일관된 실패 지점 — 타임존, 충돌, 예약에 필요한 판단에서 걸려 넘어진다"는 평가를 받는다. 유료 전용, 세션 기반, 월 한도, 그리고 중요한 행동 전에는 사람에게 물어보고 멈춘다.

숫자는 더 냉정하다. APEX-Agents 벤치마크에서 Gemini 3 Flash·GPT-5.2 같은 최상위 모델도 **1차 시도 과제 완수율 25% 미만**, 8회 시도 후에야 40% 수준이다. Deloitte Tech Trends 2026에 따르면 **에이전트를 프로덕션에 올린 조직은 11%**, 파일럿 38%, 전략 없음 35%다. Cal Newport는 2025년이 '에이전트의 해'가 되지 않은 이유를 정리하며 실패가 성장통이 아니라 구조적이라고 썼고, Gary Marcus는 "clumsy tools on top of clumsy tools"라고 잘랐다.

### 3. 4분의 법칙 — 계명5는 제약이 아니라 유일한 안전지대다

이 축에서 의뢰인 사업에 가장 중요한 발견은 이것이다. **에이전트의 성공률을 결정하는 가장 강한 단일 변수는 과제의 소요 시간이다.** 사람이 4분 안에 끝내는 과제는 에이전트가 거의 100% 성공하고, 4시간 넘는 과제는 10% 미만이다. METR의 2026년 5월 갱신에서 GPT-5급 에이전트의 '50% 신뢰 지평'은 인간 전문가 기준 약 2시간 17분이다. 그리고 단발 정확도 90%가 8회 연속 측정에서는 60%로, 다른 측정에서는 60%가 25%로 무너진다. 다단계 실패가 복리로 붙는다.

v1.0 계명5는 "프로의 1건당 작업시간이 진짜 유닛이코노믹스"였다. 30초 규칙은 사람 쪽 제약으로 쓰였지만, 이 축의 데이터는 그것이 **동시에 기계 쪽 유일한 신뢰 구간**임을 말한다. "사라지려는 회원을 감지해 프로에게 알리고, 프로가 30초 안에 한 번 누른다"는 DOH의 쐐기는 우연히 2026년 에이전트가 실제로 성공하는 유일한 형태다. 반대로 "AI가 회원 상태를 판단해 알아서 연락하고 재등록까지 처리"는 4시간짜리 과제 구간이고, 실패율이 90%인 데다 한국 AI 기본법의 고영향 고지 의무와 오작동 배상 책임까지 얹힌다.

비용도 같은 방향을 가리킨다. 토큰 단가는 급락했다 — 블렌디드 가격이 2025년 1분기 100만 토큰당 18.40달러에서 2026년 1분기 6.07달러로 **67% 하락**했다. 그런데 청구서는 올랐다. Gartner 2026 분석으로 **에이전틱 워크플로는 과제당 토큰을 챗봇 대비 5~30배** 태우고, 과제 하나에 LLM 호출이 10~20회 발생한다. 기업 73%가 원래 AI 예산을 초과했다. 월 5~30만원짜리 B2B SaaS에서 회원 한 명당 다중 에이전트 루프를 돌리면 마진이 사라진다. 1건=30초=호출 1회 설계는 도덕이 아니라 산수다.

### 4. 데이터를 소유한 자는 프로가 아니다 — 그리고 3주 뒤 규제가 바뀐다

시나리오의 각 조각을 누가 쥐고 있는지 나열하면 잔혹하다. 캘린더는 애플·구글. 위치와 경로는 애플·구글·티맵·카카오내비. 결제는 카드망과 카카오페이·토스. 헬스는 HealthKit·Health Connect. 티타임 재고는 골프장과 스마트스코어·카카오골프예약·골프존 티스캐너. 스윙 데이터는 골프존(골핑 커머스 에이전트가 50만 건 이상 스윙 데이터로 장비를 추천한다). 차량은 현대차그룹(Pleos Connect + Gleo AI, 2026년 5월 신형 그랜저부터, 2030년까지 약 2,000만 대 목표). **의뢰인이 이 목록에서 소유한 칸은 0개다.**

그리고 플랫폼 데이터 접근은 언제든 회수된다. 증거가 이번 분기에 있다 — **Fitbit 레거시 Web API가 2026년 9월 종료**된다. 서드파티 연동은 Google Health API로 이관하지 않으면 그냥 끊긴다. Google Fit REST API도 2026년 폐기다. 애플 쪽은 반대 방향의 증거를 줬다. AI 헬스 코치 'Health+'(내부명 Quartz)는 2026년 6월 WWDC 키노트에서 아예 빠졌고, 2026년 2월 초 헬스 부문 리더십 교체 후 통합 서비스 계획 자체가 접혔다. 애플이 하겠다던 것도 안 되고, 구글이 열어줬던 것도 닫힌다. **플랫폼 데이터에 사업을 세우는 것은 남의 처마 밑에 집을 짓는 것이다.**

역설적으로 여기서 방어선이 나온다. 어느 플랫폼도 수집하지 않는 데이터가 하나 있다 — **"이 회원의 스윙이 왜 무너지고 있고 프로가 지난주에 뭐라고 했는지."** DOH 진단시스템의 Observation→Node→Cluster→Archetype 기록이 정확히 그것이다. 골프존은 스윙 영상 50만 건을 갖고도 진단 라벨이 없고, 스마트스코어는 월 100만 이용자의 예약·스코어를 갖고도 이탈 이유가 없고, 카카오는 5,000만 톡을 갖고도 레슨 맥락이 없다. 애플·구글은 캘린더에 "라운딩"이 있다는 사실만 안다. 왜 그 사람이 이번 라운딩을 두려워하는지는 모른다.

여기서 한국 변수가 붙는다. 의뢰인 관점에서 가장 시급한 날짜는 애플이나 구글이 아니라 **2026년 8월 20일**이다. 개인정보보호법 제35조의2 개인정보 전송요구권이 전 분야로 확대 시행된다. 시행령 개정안이 2026년 2월 10일 국무회의를 통과했고, 대상이 2개 분야에서 **의료·통신·에너지를 포함한 10대 분야**로 넓어진다. 오늘로부터 3주 남았다.

이것이 왜 결정적인가. 마이데이터가 전 분야로 가면 골프존이나 스마트스코어가 "회원 데이터를 우리에게 넘겨라"고 요구할 법적 근거가 생길 수 있다. **그런데 확인된 10대 분야 목록에 골프·레슨·스포츠는 보이지 않는다.** 만약 최종 별표에 스포츠·레저가 빠져 있다면, DOH의 관찰 기록은 전송요구권 대상이 아니고 — 즉 **법적 이동성 의무가 없는, 구조적으로 방어 가능한 유일한 자산**이 된다. 이 확인이 이번 조사에서 원문 대조 실패로 남았고, 의뢰인이 8월 20일 전에 반드시 확인해야 하는 단 하나의 항목이다.

두 번째 한국 변수는 AI 기본법이다. **2026년 1월 22일 시행**으로 한국은 고영향 AI에 강제 의무를 부과한 세계 최초 국가가 됐다. 고영향·생성형 AI로 서비스할 때 사전 고지 의무가 있고, 규제 조항 집행은 1년 이상 계도기간이 붙었다. 회원에게 자동 발송되는 AI 메시지는 고지 대상이 될 수 있다. "알림은 AI, 발송 버튼은 사람"이 규제 회피가 아니라 규제 적합 설계인 이유다.

세 번째는 국내 플레이어의 방향이다. 카카오는 카나나를 카카오톡 안으로 넣었다(2026년 4월 21일부터 동의자 순차 적용) 며 "5,000만 이용자의 AI 에이전트"를 선언했고, 2026년 7월 28일 경량 카나나 모델 4종을 오픈소스로 풀었다. 네이버는 2026년 2월 AI 쇼핑 에이전트 베타에 이어 선물 에이전트를 붙이고 AI 브리핑에 광고를 넣기 시작했다. 티맵은 SKT 에이닷 4.0 기반으로 내비를 AI 에이전트로 전환 중이고(발화인식 오류율 6~7%에서 절반 이하로), 2026년 내 음악·뉴스·앱스토어를 조율하는 인카 에이전트로 차량 OS를 지향한다. 토스는 '앱인토스'로 슈퍼앱화하며 경쟁의 본질을 다운로드에서 체류 시간으로 옮겼다.

주목할 점은 **한국에는 EU DMA 같은 어시스턴트 상호운용 강제가 없다**는 것이다. EU에서는 애플이 iOS 26.2부터 Siri 아닌 기본 음성 어시스턴트를 허용하고, 구글은 DMA 6조 7항에 따라 안드로이드 11개 기능을 경쟁 AI에 개방하라는 구속적 결정을 2026년 7월 27일까지 받았다. 한국에는 그 지렛대가 없다. 즉 국내에서 OS 어시스턴트 층은 애플(=Gemini)과 구글이 그냥 가져가고, 카카오·네이버는 앱 안에 갇힐 가능성이 높다. **의뢰인이 붙어야 할 상대는 카카오가 아니라 App Intents와 MCP다.**

### 5. '앱의 종말'은 데이터로 지지되지 않는다

마지막으로, 이 축에서 가장 시끄러운 담론을 기각해야 한다. Nothing CEO Carl Pei는 앱이 끝났다고 말하고, 마이크로소프트는 에이전트가 앱을 대체하길 원하고, 수십 개 블로그가 "2026년은 에이전트가 앱을 대체하는 해"라고 쓴다. 실증 데이터는 다르다.

Sensor Tower State of Mobile 2026: 2025년 전 세계 앱 다운로드 **1,490억 건, 전년 대비 +0.8%**. 인앱 구매는 **1,674억 달러, +10%**. 비게임 앱 지출(856억 달러)이 게임(818억 달러)을 사상 처음 추월했고 비게임은 +21%다. AI 앱 다운로드는 +148%, ChatGPT 체류 시간은 +426%. 즉 **앱은 죽지 않았다. 다운로드 성장이 0%대로 멎었고, 돈이 소수의 앱으로 몰렸다.** 이것은 "앱이 사라진다"가 아니라 "새 앱이 설치될 자리가 없다"는 뜻이고, 의뢰인 입장에서는 후자가 더 무서운 사실이다. 새 골프 앱을 만들어 회원에게 깔게 하는 것은 성장률 +0.8%인 시장에서 자리를 다투는 일이다.

대신 실제로 일어난 구조 변화는 다른 곳이다. WWDC 2026에서 애플은 **SiriKit을 공식 폐기 예고**하고 App Intents를 새 Siri 연동의 유일한 경로로 만들었다(2~3년 이관 기간). 새 Siri는 여러 앱을 가로질러 다단계 행동을 조합하는데, **App Intents를 게시한 앱은 그 조합의 부품이 되고 게시하지 않은 앱은 조합에서 그냥 탈락한다.** 앱이 죽는 게 아니라 앱의 UI가 부차화되고 앱의 '기능 선언'이 본질이 된다. 같은 논리가 MCP에서 진행됐다. 2025년 12월 Anthropic이 MCP를 리눅스재단 산하 Agentic AI Foundation에 기부하고 AWS·구글·마이크로소프트·Cloudflare·Bloomberg가 플래티넘으로 들어가면서, 서드파티가 에이전트에 접근하는 방식이 벤더 중립 표준으로 굳었다. OpenAI·구글·마이크로소프트·Salesforce가 13개월 안에 지원을 출하했다.

단, 여기에도 냉정한 단서가 붙는다. **구글 캘린더 공식 MCP 서버는 아직 GA가 아니라 Developer Preview**이고 노출 도구는 8개다. MCP 생태계의 최대 리스크는 도구 포이즈닝 — 도구 메타데이터에 악성 지시를 심는 간접 프롬프트 인젝션 — 이고 OWASP가 별도 항목으로 다루고 있다. 그리고 결제 층은 이미 한 번 무너졌다. **OpenAI는 2026년 3월 5일 Instant Checkout을 종료**했다. 전환이 안 났고, Shopify 가맹점 약 12곳만 실제로 붙었으며, 판매세 징수·부정거래 방지·다품목 카트·프로모션 코드가 없었다. 소비자는 ChatGPT로 비교하고 결제는 판매자 사이트에서 했다. AP2는 2026년 4월 28일 FIDO Alliance로 넘어갔고, 구글/Shopify의 UCP는 2026년 6월 17일부터 에이전트 프로필 셀프서브를 열었다. 표준은 정리되는 중이지만 **에이전트가 실제로 돈을 옮긴 사례는 아직 실패한 쪽이 더 크다.**

## 핵심 사실

| # | 주장 | 근거 | 등급 | 출처 |
|---|---|---|---|---|
| 1 | 애플 개인화 Siri는 2024-06 WWDC 데모 → 2025-03-07 공식 연기 → 2026-06-08 WWDC 공개 → iOS 27(2026-09) 일반 출시. 데모~출시 약 27개월 | CNBC·MacRumors·AppleInsider 다중 보도 일치 | `업계보도` | cnbc.com/2025/03/07, macrumors.com/2025/06/12 |
| 2 | 애플, AI 허위광고 집단소송에 2억 5,000만 달러 합의. 2026-07-24 법원 승인 보도 | MacRumors·classaction.org·topclassactions 다중 일치 | `업계보도` | macrumors.com/2026/07/24 |
| 3 | 합의금 지급 조건: 2024-06-10~2025-03-29 iPhone 15 Pro/16 구매 미국 거주자, 대당 25달러(청구 적으면 최대 95달러) | classaction.org·Fortune | `업계보도` | classaction.org, fortune.com/2026/05/08 |
| 4 | 애플이 구글에 **연 10억 달러**를 지불하고 커스텀 Gemini로 Siri를 구동. 2026-01-12 보도, 2026-06-08 WWDC 확인 | CNBC 2026-01-12 + WWDC 후속 보도 | `업계보도` | cnbc.com/2026/01/12 |
| 5 | 커스텀 Gemini 모델 규모 1.2조 파라미터 | 2차 블로그 단일 계열 출처만 확인, 원문 대조 실패 | `미검증` | tech-insider.org (사실 취급 금지) |
| 6 | WWDC 2026에서 SiriKit 공식 폐기 예고, App Intents가 새 Siri 연동 유일 경로(2~3년 이관). 미채택 앱은 다단계 조합에서 탈락 | TechTimes·SoftwareSeni·개발자 해설 다중 일치 | `업계보도` | techtimes.com/articles/318005 |
| 7 | 삼성 Now Brief(One UI 8.5)가 일일 아젠다·리마인더·여행 정보·개인화 추천을 기기 내 데이터로 제공. Personal Data Engine + Knox 격리 | 삼성 뉴스룸 보도자료 + 다중 매체 | `업계보도` | news.samsung.com/global/galaxy-unpacked-2026-highlights |
| 8 | Gemini Intelligence 2026-05-12 발표, **최초 출하는 Galaxy Z Fold 8/Flip 8**(Unpacked 2026-07-22). S26·Pixel 10은 여름 후속, Wear OS·Android Auto·XR은 2026 후반 | 9to5Google·Sammy Fans·다중 | `업계보도` | 9to5google.com/2026/05/12 |
| 9 | Gemini Intelligence는 12GB RAM + Gemini Nano v3 필요, Pixel 9·Galaxy S25·Z Fold 7 배제 | SEO 성향 단일 블로그, 구글 공식 문서 대조 실패 | `미검증` | giganectar.com (사실 취급 금지) |
| 10 | **Gemini가 GM의 Google built-in 차량 약 400만 대(2022년형+)에 2026-04-30부터 무상 배포**. 볼보 16개 모델(2020년형 소급)·폴스타 포함 | tech-insider·TheWeeklyDriver·electriccarsreport·TechRadar 다중 | `업계보도` | tech-insider.org/gemini-in-cars-gm-4-million-vehicles-april-2026 |
| 11 | 구글 공식 예시 명령어가 "귀가 경로상 마트 찾고 Joe에게 문자" — 의뢰인 시나리오 (c)+(d)와 동일 형태 | 구글 공식 블로그 인용(검색 요약 경유, 원문 403) | `업계보도` | blog.google/products/android/gemini-for-cars |
| 12 | **CarPlay Ultra는 2026년 중반까지도 애스턴마틴 전용**(DBX707·DB12·Vantage·Vanquish, 미국·캐나다). 현대·기아·제네시스는 2026 하반기 약속 | T3·BGR·MacRumors·9to5Mac 다중 일치 | `업계보도` | 9to5mac.com/2026/05/04, bgr.com/2091835 |
| 13 | 현대차그룹 Pleos Connect + LLM 기반 Gleo AI, 2026-04-30 공개, 2026-05 신형 그랜저 최초 적용, **2030년까지 약 2,000만 대 목표** | 현대차그룹 보도자료 + 전자매체 다중 | `업계보도` | hyundaimotorgroup.com/ko/story/pleos-connect |
| 14 | Alexa+ 2026-02 미국 전면 개방, **Prime 회원(2억+) 무료·비회원 월 19.99달러**. 에이전틱 과제는 배달·식당예약·차량호출 수준 | GeekWire·Consumer Reports·Amazon 뉴스룸 | `업계보도` | geekwire.com/2026/amazon-rolls-out-alexa |
| 15 | **OpenAI, 2026-03-05 Instant Checkout 종료**. Shopify 가맹점 약 12곳만 실제 연동, 판매세·부정거래·다품목 카트·프로모션 미지원, 전환 실패 | Forbes·TechBuzz·marketing4ecommerce·webinterpret 다중 | `업계보도` | forbes.com/sites/jasongoldberg/2026/03/10 |
| 16 | AP2는 2025-09-16 구글 발표(60+ 파트너) → **2026-04-28 FIDO Alliance 기부**. UCP는 2026-06-17부터 에이전트 프로필 셀프서브 | digitalapplied·wetheflywheel·appliedtechnologyindex | `업계보도` | digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026 |
| 17 | MCP는 2025-12 Anthropic이 리눅스재단 산하 Agentic AI Foundation에 기부. AWS·구글·MS·Cloudflare·Bloomberg 플래티넘. OpenAI·구글·MS·Salesforce가 13개월 내 지원 출하 | 다중 2차 출처 일치 | `업계보도` | toloka.ai/blog/the-future-of-mcp-enterprise-adoption |
| 18 | MCP 지표: 공개 서버 9,400+, SDK 월 다운로드 9,700만(2026-03), Fortune 500 중 28% MCP 서버 구현 | 전부 SEO 성향 블로그 계열, 1차 통계 원문 대조 실패 | `미검증` | digitalapplied.com/blog/mcp-adoption-statistics-2026 (사실 취급 금지) |
| 19 | **구글 캘린더 공식 MCP 서버는 GA 아님 — Developer Preview**, 도구 8개(list/get/create/update/delete/respond/suggest_time/list_calendars), OAuth 2.0 사용자별만 | Scalekit 기술 비교 + 구글 개발자 문서 요약 | `업계보도` | scalekit.com/blog/google-calendar-mcp-vs-api |
| 20 | MCP 최대 실전 리스크는 도구 포이즈닝(도구 메타데이터 내 간접 프롬프트 인젝션). OWASP 별도 항목, MCPTox 벤치마크로 만연 확인 | OWASP + arXiv 다중 논문 | `업계보도` | owasp.org/www-community/attacks/MCP_Tool_Poisoning |
| 21 | **에이전트 성공률의 최강 예측 변수는 과제 소요시간 — 사람 4분 미만 과제 ≈100%, 4시간 초과 <10%.** METR 2026-05: GPT-5급 50% 신뢰 지평 약 2시간 17분 | sqmagazine·decodethefuture 등 다중 벤치마크 종합 | `업계보도` | sqmagazine.co.uk/ai-agent-autonomy-statistics |
| 22 | APEX-Agents: Gemini 3 Flash·GPT-5.2도 **1차 시도 완수율 25% 미만**, 8회 시도 후 약 40% | reworked.co 정리 인용 | `업계보도` | reworked.co/digital-workplace/2025-was-supposed-to-be-the-year-of-the-agent |
| 23 | Deloitte Tech Trends 2026: **에이전트 프로덕션 운영 조직 11%**, 파일럿 38%, 전략 없음 35% | Deloitte 보고서 인용(2차) | `업계보도` | reworked.co (동일 기사 인용) |
| 24 | 단발 정확도 90%가 8회 연속에서 60%로, 다른 측정에서 60%→25%로 하락. 랩-실전 격차 37% | 단일 계열 2차 출처 | `미검증` | digitalapplied.com/blog/ai-agent-task-completion-rates-2026 |
| 25 | **에이전틱 워크플로는 과제당 토큰을 챗봇 대비 5~30배 소비**(Gartner 2026), 과제 1건에 LLM 호출 10~20회 | Spheron·Gartner 인용 다중 | `업계보도` | spheron.network/blog/agentic-ai-inference-cost-2026 |
| 26 | 블렌디드 토큰가 100만 토큰당 18.40달러(2025 Q1) → 6.07달러(2026 Q1), **-67%**. 그런데 기업 73%가 AI 예산 초과 | pdpspectra·augusto·valueaddvc 다중 | `업계보도` | pdpspectra.com/blog/ai-token-pricing-economics-2026 |
| 27 | Sensor Tower State of Mobile 2026: 2025년 앱 다운로드 **1,490억 건 +0.8%**, IAP 1,674억 달러 +10%, 비게임 856억 > 게임 818억(사상 첫 역전), AI 앱 다운로드 +148%, ChatGPT 체류시간 +426% | Sensor Tower 원보고서 + 9to5Mac 요약 | `업계보도` | 9to5mac.com/2026/01/21/sensor-towers-state-of-mobile-2026 |
| 28 | **애플 Health+(내부명 Quartz) AI 헬스코치는 2026-06 WWDC 키노트에서 누락**, 2026-02 초 헬스 부문 리더십 교체 후 통합 서비스 계획 철회. 기능은 Health 앱에 쪼개 배포 | idropnews·PYMNTS·Sahha 다중 일치 | `업계보도` | pymnts.com/apple/2026/apple-scales-back-ai-health-coach-plans |
| 29 | **Fitbit 레거시 Web API 2026-09 종료** — 서드파티 연동은 Google Health API로 재인증 안 하면 동기화 중단. Google Fit REST API도 2026 폐기 | 구글 헬스 커뮤니티 공지 + Thryve 개발자 안내 | `업계보도` | support.google.com/googlehealth/thread/437070658 |
| 30 | **한국 마이데이터 전 분야 시행 2026-08-20**(개인정보보호법 §35-2 전송요구권). 시행령 개정 2026-02-10 국무회의 통과, 2개→10대 분야(의료·통신·에너지 포함) | 한국데이터경제신문·전자신문·KISA 공모 공고 | `업계보도` | dataeconomy.co.kr/news/articleView.html?idxno=35419 |
| 31 | 10대 분야 확정 별표에 골프·레슨·스포츠 포함 여부 | 시행령 별표 원문 대조 실패(WebFetch 차단) | `미검증` | — (8/20 전 필수 확인 항목) |
| 32 | **한국 AI 기본법 2026-01-22 시행** — 고영향 AI 강제 의무 세계 최초. 고영향·생성형 AI 서비스 시 사전 고지 의무, 규제조항 1년+ 계도기간 | 신&김·Law.asia·KB·헬프미 다중 | `업계보도` | shinkim.com/kor/media/newsletter/3114 |
| 33 | EU DMA: 애플은 iOS 26.2부터 EU에서 Siri 아닌 기본 어시스턴트 허용. 구글은 6조7항으로 안드로이드 11개 기능을 경쟁 AI에 개방, 구속적 결정 기한 2026-07-27. **한국에는 동등 규정 없음** | Business Standard·TNW·TechTimes 다중 | `업계보도` | business-standard.com/technology/tech-news/...126072000734 |
| 34 | **2026-07-01 Meta AI 안경에 18Birdies·Arccos 골프 통합 출시.** 음성으로 라운드 시작·야디지·바람·클럽 추천·해저드 경고·스코어 기록. 미국·캐나다 영어만, 펌웨어 126+, 18Birdies 또는 Arccos 구독 필요(6개월 무료) | Meta 공식 블로그/헬프 + 18Birdies 공지 + UploadVR·AndroidCentral | `업계보도` | 18birdies.com/clubhouse/company-news/18birdies-meta-ai-glasses |
| 35 | **Arccos는 이미 개인화 Pre-Round Warm-Up 보유** — 집중 영역·최근 퍼포먼스·가용 시간(15/30/60분) 기반 연습 세션 생성. 4만+ 코스, 풍속·경사·기온·습도·고도 보정 | Arccos 공식 블로그 + 리뷰 다중 | `업계보도` | arccosgolf.com/blogs/community/arccos-just-dropped-its-biggest-app-update-ever |
| 36 | AI 캐디 앱 최소 6종 동시 경쟁(Putty·Scratch AI·ForeSight·Gimmie·Golf.ai·Caddie AI) — 전부 "샷 이력 + 실시간 날씨 → 클럽·타깃 추천" 동일 문구 | App Store·Google Play·리뷰 매체 다중 | `업계보도` | destination-golf.com/best-ai-golf-apps |
| 37 | Meta·EssilorLuxottica 2025년 스마트글래스 **700만 대 판매(2024 대비 3배)**, Meta가 전 세계 출하량 76.1%, 2026년 시장 1,340만 대 전망, Meta 하반기 목표 1,000만 대 | CNBC 2026-02-11 + UploadVR·RoadtoVR | `업계보도` | cnbc.com/2026/02/11/ray-ban-maker-essilorluxottica-triples-sales |
| 38 | Reserve with Google 기반 티타임 에이전트 예약 — 가용성 감시 → GolfNow/Lightspeed로 예약 확정 → Google Universal Cart 결제. **다만 동적 티타임 가격과 RwG가 요구하는 정적 API 피드가 구조적으로 불일치** | 골프 산업 전문 매체 단일 계열 | `미검증` | golfcoursetechnologyreviews.org/blog/google-i-o-2026-ai-agents-booking-tee-times |
| 39 | 스마트스코어 **월 100만 이용자**, B2C(예약·스코어·커뮤니티)+B2B(관제·ERP)+B2B2C 단일 플랫폼. 취향별 개인 맞춤 조인(정숙·초보환영·음주선호·내기모드·여자끼리·부부·커플) | 일간스포츠 SMSA 인터뷰 + 지피코리아 | `업계보도` | isplus.com/article/view/isp202606040070 |
| 40 | 골프존커머스 '골핑'에 메가존클라우드가 멀티 에이전트 AI 쇼핑 에이전트 구축, **스윙 데이터 50만 건+** 기반 장비 추천 | 벤처스퀘어 | `업계보도` | venturesquare.net/1088298 |
| 41 | 카카오 카나나: 2026-04-21부터 동의자 대상 카카오톡 내 순차 제공, "5,000만 이용자 AI 에이전트" 선언, 2026-07-28 경량 카나나 4종 오픈소스 공개 | 카카오 공식 뉴스룸 + 테크M·와우테일 | `업계보도` | kakaocorp.com/page/detail/11850, wowtale.net/2026/07/28/262076 |
| 42 | 티맵: SKT 에이닷 4.0 기반 내비→AI 에이전트 전환, **발화인식 오류율 6~7%에서 절반 이하**로 감소, 2026년 내 인카 AI 에이전트(음악·뉴스·앱스토어 조율)로 차량 OS 지향 | 한국경제·이데일리 | `업계보도` | hankyung.com/article/202509182046g |
| 43 | Siri/OpenTable 유령 예약 버그 — Safari로 OpenTable 식당 페이지를 열면 예약 없이 캘린더에 예약 항목 자동 생성 | heise online | `업계보도` | heise.de/en/news/Overzealous-Siri-...-10194693.html |
| 44 | ChatGPT 에이전트 모드는 유료 전용·세션 기반·월 한도·감독형이며 **"캘린더 작업이 가장 일관된 실패 지점"**(타임존·충돌·판단) | usecarly 기술 리뷰 + OpenAI 헬프센터 | `업계보도` | usecarly.com/blog/chatgpt-agent-mode |
| 45 | watchOS 27 퍼블릭 베타 2026-07-13, 손목에 Siri AI 탑재. 다만 **배터리 때문에 온디바이스가 아니라 Private Cloud Compute로 처리**. Wear OS 6는 Gemini가 Assistant 대체 | 9to5Mac·Wareable·DigitalTrends | `업계보도` | 9to5mac.com/2026/07/13/watchos-27-public-beta |
| 46 | 김캐디 200만 골퍼·전국 6,000여 스크린골프장 비교예약 주장 vs 2019 설립 후 누적 다운로드 70만 보도 — **수치 상충** | App Store 소개문 vs 더퍼스트미디어 보도 | `미검증` | apps.apple.com/kr/app/김캐디, thefirstmedia.net/119749 |

## 플레이어 맵

| 플레이어 | 무엇을 | AI 적용 지점 | 2026 상태 | 가격 |
|---|---|---|---|---|
| Apple (Siri AI) | 폰·워치·차 통합 어시스턴트 | 퍼스널 컨텍스트 + 온스크린 인지 + App Intents 다단계 조합. **두뇌는 임대한 커스텀 Gemini** | 2026-06-08 공개, iOS 27/watchOS 27과 함께 2026-09 일반 출시. 27개월 지연 + 2.5억 달러 합의 | OS 번들 무료 (애플은 구글에 연 10억 달러 지불) |
| Google (Gemini Intelligence) | 안드로이드 OS 레벨 에이전트 | 크로스앱 과제 자동화, Personal Intelligence 자동완성, 생성 위젯 | 2026-05-12 발표, **최초 출하 Galaxy Z Fold 8/Flip 8(2026-07-22)**. S26·Pixel 10 여름, Wear OS·Auto·XR 후반 | OS 번들 무료 (고사양 기기 한정) |
| Samsung (Now Brief + Bixby) | 온디바이스 개인화 브리핑 | **일일 아젠다·여행 정보·개인화 추천 = 의뢰인 시나리오 (a)(b)**. Personal Data Engine + Knox 격리 | S26 출하 중. Bixby는 다단계 자율 과제 수행 주장 | 기기 번들 무료 |
| Amazon (Alexa+) | 가정용 에이전트 | 배달 주문·식당 예약·차량 호출 | 2026-02 미국 전면 개방. Consumer Reports "앱이 발목을 잡는다" | **Prime(2억+) 무료 / 비회원 월 19.99달러** |
| OpenAI (ChatGPT 에이전트) | 범용 컴퓨터 사용 에이전트 | Operator 통합, Tasks 스케줄, Deep Research | 유료·세션 기반·월 한도·감독형. **캘린더가 최대 약점**. Instant Checkout은 2026-03-05 종료 | 유료 플랜 전용 |
| 현대차그룹 (Pleos + Gleo AI) | 차량 인포테인먼트 OS | LLM 기반 음성 차량 제어, 방언·불완전 문장 이해, 대화 맥락 유지 | 2026-04-30 공개, 2026-05 신형 그랜저 최초. **2030년까지 약 2,000만 대 목표** | 차량 번들 |
| Apple CarPlay Ultra | 차량 전체 화면 장악 | Siri가 차량 계기까지 제어 | **2026년 중반까지 애스턴마틴 4개 모델 전용**(미·캐). 현대·기아·제네시스 2026 하반기 약속 | 차량 번들 (사실상 초고가차 한정) |
| 티맵 / SKT 에이닷 | 내비 → 모빌리티 에이전트 | 에이닷 4.0, 발화 오류율 6~7%→절반 이하, 여행 코스 대화형 추천 | 2026년 내 인카 AI 에이전트(음악·뉴스·앱스토어 조율), 차량 OS 지향 | 앱 무료 (통신 번들) |
| 카카오 (카나나) | 메신저 내장 에이전트 | 대화 맥락 파악 → 선물하기·예약·결제 연결 | 2026-04-21부터 카톡 내 동의자 순차 적용. "5,000만 이용자" 선언. 경량 모델 4종 오픈소스(2026-07-28) | 무료 (커머스 수수료 수익화) |
| 네이버 | 검색 → 에이전틱 커머스 | AI 쇼핑 에이전트(2026-02 베타), 선물 에이전트, AI 브리핑 광고 | 하반기 AI 수익화 집중 | 무료 (광고·수수료) |
| Meta (AI 안경 + 18Birdies/Arccos) | **온코스 핸즈프리 골프 에이전트** | 음성으로 라운드 시작·야디지·바람·클럽 추천·해저드 경고·스코어 기록 | **2026-07-01 출시**. 미·캐 영어만, 펌웨어 126+. 2025년 안경 700만 대 판매, 점유율 76.1% | 안경 별매 + **18Birdies/Arccos 구독 필요(6개월 무료)** |
| Arccos | 샷 데이터 + AI 캐디 | **Pre-Round Warm-Up(집중영역·최근성과·가용시간 기반 연습 세션)**, 4만+ 코스, 5개 환경변수 보정 야디지 | 2026 최대 업데이트 출하. Meta 안경 연동 | 구독 (센서 하드웨어 별매) |
| 스마트스코어 | 골퍼 여정 + 골프장 운영 | 취향별 개인 맞춤 조인(정숙·초보환영·내기모드 등) | **월 100만 이용자**. B2C+B2B(관제·ERP)+B2B2C 단일 플랫폼 | 골프장 SaaS + 예약 수수료 |
| 골프존 (티스캐너 / 골핑) | 예약 + 커머스 | 골핑에 멀티 에이전트 AI 쇼핑, **스윙 50만 건+ 기반 장비 추천** | 티스캐너 370여 골프장. 커머스 에이전트 구축 완료 | 수수료 + 커머스 마진 |
| AI 캐디 앱 군집 | 클럽·전략 추천 | 샷 이력 + 실시간 날씨 → 클럽/타깃 | Putty·Scratch AI·ForeSight·Gimmie·Golf.ai·Caddie AI 최소 6종 동일 기능 경쟁 | 월 구독 소액 / 프리미엄 |

## 돈의 흐름

돈은 세 방향으로 흐르고, 셋 다 의뢰인을 지나가지 않는다.

**첫째, OS 어시스턴트는 비용 센터이고 그 비용을 플랫폼이 낸다.** 애플은 Siri AI를 팔지 않는다. 대신 **구글에 연 10억 달러를 지불한다.** 구글은 GM 400만 대에 Gemini를 무상으로 넣었다. 삼성은 Now Brief를 기기 값에 녹였다. 아마존만 값을 붙였는데 그마저 Prime 2억 회원에게는 0원, 비회원 월 19.99달러다. 즉 "라운딩 전 브리핑"의 원가는 이미 플랫폼이 흡수했고, 소비자 지불의사는 0으로 눌렸다. 이 층에서 과금하려는 시도는 v1.0에서 확정한 골프존 2021년 AI 스윙분석 무료 번들과 같은 벽을 만난다.

**둘째, 실제 매출은 어시스턴트 위가 아니라 그 아래 재고와 구독에서 난다.** Meta는 안경을 팔고(2025년 700만 대), 골프 기능은 **18Birdies나 Arccos 구독을 요구한다**(6개월 무료 뒤 유료). Arccos는 센서 하드웨어 + 구독이다. 스마트스코어는 골프장 SaaS와 예약 수수료로, 골프존은 커머스 마진으로 번다. 패턴이 v1.0과 정확히 일치한다 — Toptracer Range(시설 매출 2배, 월 999달러)와 Operation 36(커리큘럼+자격증)이 살아남은 이유는 어시스턴트를 판 게 아니라 **재고와 자격을 팔았기** 때문이다.

**셋째, 에이전트 결제 층은 아직 돈을 못 옮긴다.** OpenAI는 Instant Checkout에 Shopify·Etsy·Walmart·Target을 붙이고도 **2026년 3월 5일 접었다.** 실제 연동 가맹점 약 12곳, 전환 실패, 판매세·부정거래·다품목 카트 미지원. 소비자는 AI에서 비교하고 결제는 판매자 사이트에서 했다. 표준은 AP2(FIDO 이관)·UCP·ACP로 정리 중이지만 2026년 7월 현재 검증된 것은 "발견은 AI, 결제는 사이트"다.

**그리고 비용 구조가 함정이다.** 토큰 단가는 -67%(18.40→6.07달러/100만)인데 기업 73%가 예산을 초과했다. 이유는 에이전틱 워크플로가 **과제당 토큰을 5~30배** 태우고 호출을 10~20회 발생시키기 때문이다. 월 5~30만원 가격표에서 회원 수백 명에게 다중 루프 에이전트를 돌리면 마진이 음수가 된다. **계명5의 30초 규칙은 프로의 시간 문제이자 동시에 원가 문제다.**

## 2026 신호

- **2026-07-01, Meta AI 안경에 18Birdies·Arccos 골프 모드 출시.** 음성으로 라운드 시작·야디지·바람·클럽 추천·해저드 경고·스코어 기록. 미국·캐나다 영어 한정, 18Birdies/Arccos 구독 필수(6개월 무료). 의뢰인 시나리오의 온코스 절반이 안경으로 먼저 출하됐다.
- **2026-04-30, Gemini가 GM Google built-in 차량 약 400만 대에 무상 배포.** 볼보 16개 모델(2020년형 소급)·폴스타 포함. 공식 예시 명령어가 "귀가 경로상 마트 찾고 문자 보내" — 의뢰인 시나리오와 동형.
- **2026-03-05, OpenAI Instant Checkout 종료.** 가맹점 약 12곳, 전환 실패. 에이전트 결제 층의 첫 대형 후퇴이며 "발견은 AI, 결제는 사이트"가 2026년의 실증 결론.
- **2026-07-24, 애플 2.5억 달러 AI 허위광고 합의 승인 보도.** 대당 25~95달러. 에이전틱 약속과 출하의 격차가 처음으로 현금 청구서가 됐다.
- **2026-02 초, 애플 Health+ (Quartz) AI 헬스코치 계획 철회.** WWDC 2026 키노트에서 누락, 기능을 Health 앱에 쪼개 배포. OS 레벨 헬스 에이전트는 애플조차 접었다.
- **2026-09, Fitbit 레거시 Web API 종료.** 서드파티 헬스 데이터 파이프가 재인증 없이는 끊긴다. 플랫폼 데이터 접근이 회수 가능하다는 이번 분기의 실물 증거.
- **2026-08-20, 한국 마이데이터 전 분야 시행**(개인정보보호법 §35-2, 시행령 2026-02-10 통과, 2→10대 분야). 오늘로부터 3주. 의뢰인에게 이 축에서 가장 시급한 날짜.
- **2026-06-08 WWDC, SiriKit 폐기 예고 · App Intents 단일화.** App Intents를 게시하지 않은 앱은 새 Siri의 다단계 조합에서 탈락한다. "앱이 죽는다"가 아니라 "선언하지 않은 앱이 안 보이게 된다".
- **2026-07-22, Gemini Intelligence 최초 출하가 Pixel이 아니라 Galaxy Z Fold 8/Flip 8.** 구글이 자기 하드웨어보다 삼성에 먼저 내줬다 — 안드로이드 에이전트 층의 주도권이 단말 제조사로 기운 신호.

## 무너지는 것

- **개별 골프 앱의 '조회형' UI(GPS 야디지·날씨·스코어 입력).** 근거: 2026-07-01 Meta 안경이 같은 정보를 음성·핸즈프리로 주고, 삼성 Now Brief가 카드로 밀어준다. 화면을 열어 조회하는 행위 자체가 대체된다.
- **'라운드 전 개인화 브리핑'을 유료 기능으로 파는 모델.** 근거: Arccos가 Pre-Round Warm-Up으로 이미 구독에 번들, 삼성 Now Brief가 무료, Meta는 6개월 무료 제공. 지불의사가 0으로 눌렸다.
- **AI 클럽·전략 추천의 차별성.** 근거: Putty·Scratch AI·ForeSight·Gimmie·Golf.ai·Caddie AI·Arccos·18Birdies가 동시에 "샷 이력 + 실시간 날씨 → 클럽 추천"을 판다. 골프존 2021 무료 번들이 스윙분석을 코모디티화한 경로의 재연.
- **SiriKit 기반 앱 연동, 그리고 App Intents/MCP를 게시하지 않은 모든 앱.** 근거: WWDC 2026 SiriKit 폐기 예고. 미게시 앱은 다단계 조합에서 탈락 = 어시스턴트 세계에서 존재하지 않게 된다.
- **인앱(인챗) 에이전트 결제.** 근거: OpenAI Instant Checkout 2026-03-05 종료, 실연동 가맹점 약 12곳, 판매세·부정거래·다품목 카트 미지원.
- **서드파티 헬스 데이터 파이프에 의존한 제품.** 근거: Fitbit 레거시 Web API 2026-09 종료, Google Fit REST API 2026 폐기, 애플 Health+ 계획 철회. 세 방향 모두 축소.
- **신규 앱 설치로 유입을 만드는 전략.** 근거: 2025년 전 세계 앱 다운로드 성장 **+0.8%**. 설치 여력이 사실상 소진됐다.

## 버티는 것

- **4분 미만·단일 판단 과제.** 구조적 이유: 에이전트 성공률은 과제 소요시간에 반비례한다 — 사람 4분 미만 ≈100%, 4시간 초과 <10%, METR 50% 신뢰 지평 약 2시간 17분. 다단계 실패가 복리로 붙기 때문에(90% 단발 → 8회 연속 60%) 짧고 단일한 과제만 신뢰 구간에 남는다. **DOH의 30초 규칙은 규율이 아니라 유일하게 작동하는 구간이다.**
- **실물 재고를 독점한 접점(티타임·타석·프로의 시간).** 구조적 이유: 에이전트는 재고를 생성할 수 없고 중개만 한다. Reserve with Google에서 동적 티타임 가격과 정적 API 피드가 구조적으로 불일치한다는 사실이 증거다. 재고 주인이 피드를 안 주면 에이전트는 아무것도 못 판다. 어시스턴트가 늘어날수록 재고 보유자의 협상력이 올라간다.
- **책임 소재가 사람에게 남는 판단.** 구조적 이유: 한국 AI 기본법(2026-01-22 시행)이 고영향·생성형 AI에 사전 고지 의무를 부과하고, 오예약 사례(Siri/OpenTable 유령 예약)가 자율 실행의 배상 리스크를 실증했다. "회원에게 무엇을 말할지"의 최종 판단은 규제·책임 구조상 사람 쪽에 고정된다. 알림은 자동화되고 결정은 자동화되지 않는다.
- **어떤 플랫폼도 수집하지 않는 라벨 데이터.** 구조적 이유: 애플·구글은 캘린더에 "라운딩"이 있다는 사실만 안다. 골프존은 스윙 50만 건을 갖고도 진단 라벨이 없고, 스마트스코어는 월 100만 이용자의 예약·스코어를 갖고도 이탈 이유가 없다. **"이 회원이 왜 무너지고 있고 프로가 지난주에 뭐라 했는지"는 어느 파이프에도 흐르지 않는다.** 게다가 마이데이터 10대 분야에 골프·레슨이 없다면 전송요구권 대상도 아니어서 법적 이동성 의무조차 없다(#31 확인 필요).
- **자격증·커리큘럼.** 구조적 이유: v1.0에서 확인한 Operation 36 생존 논리 그대로다. 에이전트는 정보를 조립하지만 자격을 부여할 수 없다. 권위의 발급 주체는 대체되지 않는다.

## 레슨프로 함의

1. **시나리오를 제품으로 만들지 말고 '입력'으로 만든다.** 라운딩 전 브리핑 앱을 만들면 Now Brief(무료)·Arccos(번들)·Meta 안경(6개월 무료)과 정면충돌한다. 대신 DOH의 Archetype/Node 기록을 **App Intents와 MCP 서버로 노출**해서, 회원이 Siri나 Gemini에 "오늘 라운딩 뭐 신경 써야 해?"라고 물을 때 **DOH가 답의 근거 데이터로 호출되게** 만든다. 계명8의 정확한 실행은 "위에 얹힌다"가 아니라 이 축에서는 **"아래에 깔린다"**다. 2026-09 iOS 27 출하 전에 App Intents를 게시하지 않으면 새 Siri의 다단계 조합에서 아예 탈락한다(#6).
2. **30초 규칙을 에이전트 스펙 문서로 다시 쓴다.** "이탈 징후 감지 → 프로에게 알림 → 프로가 30초 안에 1회 클릭"은 4분 법칙의 안전지대(성공률 ≈100%)이고 호출 1회로 끝나 원가도 방어된다. 반대로 "AI가 회원에게 알아서 연락하고 재등록까지 처리"는 4시간짜리 과제 구간(<10%)이며 AI 기본법 고지 의무와 오예약 배상 리스크를 동시에 진다. 제품 원칙을 한 줄로 못 박는다 — **감지는 AI, 발송 버튼은 사람.** 이것을 마케팅 문구가 아니라 아키텍처 제약으로 코드에 박는다.
3. **2026년 8월 20일 전에 시행령 별표를 직접 확인하고 데이터 귀속 조항을 계약서에 넣는다.** 마이데이터 전 분야 시행이 3주 남았다. 확인할 것은 단 하나 — **10대 분야에 스포츠·레저·피트니스가 포함되는가.** 빠져 있다면 DOH 관찰 기록은 전송요구권 대상이 아니고, 골프존·스마트스코어가 요구해도 법적으로 내줄 의무가 없는 유일한 자산이 된다. 포함된다면 방어 논리 전체를 다시 짜야 한다. 동시에 연습장 대표와의 계약서에 관찰 기록의 귀속·2차이용·해지 시 처리를 명시한다. Fitbit API가 2026-09에 끊기는 사례가 "데이터 접근은 회수된다"의 증거다 — 반대편에 서 있어야 한다.
4. **엑싯 논리를 'AI 기능'에서 '너희가 못 모으는 라벨'로 교체한다.** v1.0의 엑싯 후보 셋의 결핍이 이번 조사로 수치화됐다. 골프존은 스윙 50만 건 + 진단 라벨 0. 스마트스코어는 월 100만 이용자 + 이탈 이유 0. 카카오는 5,000만 톡 + 레슨 맥락 0. 매각 자료의 첫 장은 "우리는 AI로 브리핑한다"가 아니라 **"우리는 당신들이 구조적으로 수집할 수 없는 이탈 사유 라벨을 N건 보유한다"**여야 한다. 라벨 건수를 KPI로 세고 매월 기록한다.
5. **원가 방어선을 숫자로 고정한다.** 에이전트는 과제당 토큰 5~30배, 호출 10~20회다. 월 5~30만원 가격표에서 회원 1인당 허용 호출 수와 토큰 상한을 처음부터 정하고 초과 시 사람에게 넘긴다. 계명5는 프로의 시간이자 동시에 추론 원가다. 토큰가가 -67% 내렸는데도 기업 73%가 예산을 초과한 이유가 정확히 이 설계 부재다.
6. **Meta 안경·Arccos·스마트스코어를 경쟁자가 아니라 유통 채널로 취급한다.** Meta 골프 모드는 18Birdies나 Arccos 구독을 요구하고 미국·캐나다 영어에 한정된다 — 한국에는 빈칸이 있다. 다만 그 빈칸을 '한국형 브리핑 앱'으로 채우려 들면 3번째 실패가 된다. 채울 것은 브리핑이 아니라 **그 브리핑들이 참조할 진단 기록**이다.

## 미해결 질문

1. **2026-08-20 시행 마이데이터 '10대 분야' 확정 별표에 스포츠·레저·피트니스가 포함되는가?** 포함되면 DOH 관찰 기록에 전송요구권이 걸리고 4번·3번 함의의 방어 논리가 무너진다. 개정 시행령 별표 원문 대조 실패(WebFetch 403 차단). **의뢰인이 3주 안에 직접 확인해야 하는 최우선 항목이며, 그때까지 이 사안은 `미검증`으로 취급해야 한다.**
2. **국내 앱의 App Intents / Android App Actions 실제 채택 상황은?** 우버·AllTrails·Threads·Temu·아마존·유튜브 등 해외 앱 사례만 확인됐다. 카카오T·티맵·스마트스코어·카카오골프예약이 App Intents를 게시했는지, 게시 계획이 있는지에 대한 공개 데이터를 찾지 못했다. 이것이 확인되지 않으면 "회원이 Siri에 물으면 DOH가 호출된다"는 1번 함의의 전제가 성립하는지 알 수 없다.
3. **Now Brief와 Gemini Intelligence가 2026-07-30 현재 한국어·한국 데이터로 실제 작동하는가?** Meta 골프 기능이 미국·캐나다 영어 한정인 것은 확인됐다. 그러나 Now Brief가 국내 캘린더·티맵·국내 주유·국내 식당 데이터를 물고 실동작하는지, 아니면 영어권·미국 데이터 한정인지 확인 실패. 만약 한국에서 반쯤만 작동한다면 의뢰인에게 12~24개월의 시간 창이 있고, 완전 작동한다면 창이 없다. **이 답이 전략의 시급성을 결정한다.**
4. **에이전트가 예약을 대행할 때 노쇼·오예약의 책임은 누구에게 가는가?** Siri/OpenTable 유령 예약 버그로 오작동은 실증됐으나, 국내 판례나 AI 기본법 하위 가이드라인에서 에이전트 매개 예약의 책임 배분을 다룬 자료를 찾지 못했다. 연습장·골프장 예약을 자동화하려는 순간 이 공백이 사업 리스크가 된다.
5. **한국에 EU DMA 같은 어시스턴트 상호운용 강제가 도입될 가능성이 있는가?** EU에서는 애플이 iOS 26.2부터 대체 어시스턴트를 허용하고 구글이 안드로이드 11개 기능을 개방하도록 강제됐다. 한국에는 동등 규정이 없어, 국내 OS 어시스턴트 층은 애플(=Gemini)과 구글이 그대로 가져갈 수 있다. 방통위·공정위의 관련 검토 여부 확인 실패. 도입되면 카카오·네이버가 어시스턴트 층에 올라오고 의뢰인의 파트너 후보가 바뀐다.
6. **Meta 골프 모드의 한국 출시 시점과 파트너는?** "추가 국가 곧 지원"만 확인됐다. 한국 출시 시 파트너가 18Birdies/Arccos인지 스마트스코어·골프존인지가 의뢰인의 유통 경로를 결정한다.

## 출처

- https://www.cnbc.com/2025/03/07/apple-delays-siri-ai-improvements-to-2026.html — 애플의 개인화 Siri 공식 연기 발표(2025-03-07), 지연 서사의 기점
- https://www.macrumors.com/2025/06/12/apple-intelligence-siri-spring-2026/ — 연기된 Siri 기능이 iOS 26.4(2026 봄) 목표로 재설정됐다는 보도
- https://www.macrumors.com/2026/07/24/apple-to-pay-owners-of-these-iphone-models/ — 애플 AI 허위광고 집단소송 2.5억 달러 합의 법원 승인 및 지급 대상
- https://www.classaction.org/news/250m-iphone-16-settlement-resolves-apple-lawsuit-over-allegedly-misrepresented-ai-features — 합의 조건 상세(대당 25달러, 최대 95달러, 적격 구매기간)
- https://www.cnbc.com/2026/01/12/apple-google-ai-siri-gemini.html — 애플이 구글 Gemini를 Siri 두뇌로 채택(연 10억 달러 규모 보도)
- https://www.techtimes.com/articles/318005/20260608/wwdc-2026-app-intents-replaces-sirikit-gemini-siri-migration-clock-starts.htm — WWDC 2026 SiriKit 폐기 예고와 App Intents 단일화, 미채택 앱 탈락 구조
- https://news.samsung.com/global/galaxy-unpacked-2026-highlights-from-galaxy-unpacked-the-beginning-of-truly-agentic-ai — 삼성 Now Brief·Personal Data Engine·Bixby 자율 과제 수행(의뢰인 시나리오와 동형)
- https://9to5google.com/2026/05/12/gemini-intelligence-announcement/ — Gemini Intelligence 발표 내용과 Pixel·삼성 출하 계획
- https://tech-insider.org/gemini-in-cars-gm-4-million-vehicles-april-2026/ — Gemini가 GM 약 400만 대에 2026-04-30 무상 배포된 규모와 조건
- https://9to5mac.com/2026/05/04/carplay-ultra-automakers/ — CarPlay Ultra의 애스턴마틴 독점 지속과 브랜드별 확대 약속 현황
- https://www.hyundaimotorgroup.com/ko/story/pleos-connect-next-generation-infotainment-system — 현대차그룹 Pleos Connect·Gleo AI 사양과 2030년 2,000만 대 목표
- https://www.geekwire.com/2026/amazon-rolls-out-alexa-to-all-u-s-customers-making-its-ai-assistant-free-for-prime-members/ — Alexa+ 미국 전면 개방, Prime 무료·비회원 월 19.99달러 가격 구조
- https://www.forbes.com/sites/jasongoldberg/2026/03/10/why-openais-checkout-retreat-spells-trouble-for-its-commerce-strategy/ — OpenAI Instant Checkout 종료의 원인 분석(전환 실패, 가맹점 12곳)
- https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide — UCP·ACP·AP2 3층 구조와 AP2의 FIDO 이관(2026-04-28), UCP 셀프서브(2026-06-17)
- https://toloka.ai/blog/the-future-of-mcp-enterprise-adoption/ — MCP의 리눅스재단 AAIF 기부와 주요 벤더 지원 출하 타임라인
- https://www.scalekit.com/blog/google-calendar-mcp-vs-api — 구글 캘린더 공식 MCP 서버가 GA 아닌 Developer Preview이며 도구 8개뿐임
- https://owasp.org/www-community/attacks/MCP_Tool_Poisoning — MCP 도구 포이즈닝 공격 구조, 에이전트 서드파티 접근의 최대 실전 리스크
- https://sqmagazine.co.uk/ai-agent-autonomy-statistics/ — 에이전트 성공률의 4분/4시간 법칙과 METR 50% 신뢰 지평(2026-05)
- https://www.reworked.co/digital-workplace/2025-was-supposed-to-be-the-year-of-the-agent-it-never-arrived/ — APEX-Agents 1차 완수율 25% 미만, Deloitte 프로덕션 11% 등 냉정한 실측
- https://calnewport.com/why-didnt-ai-join-the-workforce-in-2025/ — 에이전트 실패가 성장통이 아니라 구조적이라는 Cal Newport의 분석
- https://www.spheron.network/blog/agentic-ai-inference-cost-2026/ — 에이전틱 워크플로의 과제당 토큰 5~30배, 호출 10~20회(Gartner 2026 인용)
- https://pdpspectra.com/blog/ai-token-pricing-economics-2026/ — 토큰가 -67%인데 기업 73%가 예산 초과하는 Jevons 역설 구조
- https://9to5mac.com/2026/01/21/sensor-towers-state-of-mobile-2026-tiktok-dominates-ai-apps-surge-games-lose-ground — 앱 다운로드 1,490억 건 +0.8%, IAP 1,674억 달러, AI 앱 +148% ('앱의 종말' 반증)
- https://www.pymnts.com/apple/2026/apple-scales-back-ai-health-coach-plans — 애플 Health+ AI 헬스코치 계획 축소·철회(2026-02 리더십 교체 후)
- https://support.google.com/googlehealth/thread/437070658/introducing-the-next-phase-of-the-fitbit-web-api — Fitbit 레거시 Web API 2026-09 종료와 Google Health API 이관 요구
- https://www.dataeconomy.co.kr/news/articleView.html?idxno=35419 — 마이데이터 2→10대 분야 확대와 2026-08-20 전 분야 시행 일정
- https://www.etnews.com/20251125000405 — 마이데이터 전 분야 확대에 대한 개인정보 기본권 관점의 비판적 논의
- https://www.shinkim.com/kor/media/newsletter/3114 — 한국 AI 기본법 2026-01-22 시행과 고영향 AI 의무·계도기간
- https://www.business-standard.com/technology/tech-news/how-eu-s-dma-puts-apple-and-google-on-different-paths-for-smartphone-ai-126072000734_1.html — EU DMA가 애플·구글에 부과한 어시스턴트 개방 의무와 2026-07-27 기한
- https://18birdies.com/clubhouse/company-news/18birdies-meta-ai-glasses — 2026-07-01 Meta AI 안경 골프 통합의 기능·지역·구독 조건(1차 발표)
- https://www.meta.com/help/ai-glasses/1003277785741347/ — Meta AI 안경 골프 기능 공식 사용 조건(펌웨어 126+, 미·캐 영어, 구독 필요)
- https://www.arccosgolf.com/blogs/community/arccos-just-dropped-its-biggest-app-update-ever-heres-whats-new — Arccos Pre-Round Warm-Up 등 개인화 라운드 전 브리핑 기능 출하
- https://www.cnbc.com/2026/02/11/ray-ban-maker-essilorluxottica-triples-sales-of-meta-ai-glasses.html — 2025년 Meta 스마트글래스 700만 대 판매(3배 성장) 확인
- https://www.golfcoursetechnologyreviews.org/blog/google-i-o-2026-ai-agents-booking-tee-times — 구글 에이전트의 티타임 예약 경로와 동적가격/정적피드 구조적 불일치
- https://isplus.com/article/view/isp202606040070 — 스마트스코어 월 100만 이용자와 B2C+B2B+B2B2C 단일 플랫폼 전략(CSO 인터뷰)
- https://www.venturesquare.net/1088298 — 골프존커머스 골핑의 멀티 에이전트 AI와 스윙 데이터 50만 건 기반 추천
- https://www.kakaocorp.com/page/detail/11850 — 카카오 카나나 업데이트 공식 발표(AI 에이전트 기능 범위)
- https://www.techm.kr/news/articleView.html?idxno=151613 — 카카오의 "5,000만 이용자 AI 에이전트" 선언과 AI 대중화 전략
- https://zdnet.co.kr/view/?no=20260508164810 — 네이버·카카오의 2026 하반기 AI 수익화 전환(AI 브리핑 광고, 커머스 생태계 외부 확장)
- https://www.hankyung.com/article/202509182046g — 티맵의 내비→AI 에이전트 전환과 에이닷 기반 발화인식 오류율 개선
- https://www.heise.de/en/news/Overzealous-Siri-supposed-table-reservations-irritate-Apple-users-10194693.html — Siri/OpenTable 유령 예약 버그, 캘린더 추론 층의 취약성 실증
- https://www.usecarly.com/blog/chatgpt-agent-mode/ — ChatGPT 에이전트 모드의 제약과 "캘린더가 가장 일관된 실패 지점" 평가
- https://9to5mac.com/2026/07/13/watchos-27-public-beta/ — watchOS 27 퍼블릭 베타의 손목 Siri AI와 Private Cloud Compute 처리 구조
- https://destination-golf.com/best-ai-golf-apps/ — AI 캐디 앱 군집(Putty·Scratch AI·ForeSight·Golf.ai 등)의 기능 동질화 확인
- https://www.consumerreports.org/electronics/digital-assistants/amazon-alexa-plus-ai-assistant-review-a1667486499/ — Alexa+ 실사용 평가와 "앱이 발목을 잡는다"는 한계 지적
