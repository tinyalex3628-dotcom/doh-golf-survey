# [range-tech] 연습장·레인지 테크 (타석이 컴퓨터가 되는 층)

> **헤드라인** — 2026년 1월 PGA쇼에서 Toptracer가 "카메라 1대로 티라인 50m, 타석 스크린 0대, 월 $999"인 Toptracer Go를 내놓으면서 타석당 $200~250 × 타석수로 매겨졌던 레인지 테크 가격구조가 붕괴했고, 같은 달 Topgolf/Toptracer는 Leonard Green에 60%가 11억 달러 밸류로 넘어갔으며(2021년 합병 시 2.6조원급 26억 달러 대비 반토막), 한국에서는 고양CC가 레이더 3대로 108타석 전체를 덮고 유효회원 +700명을 만들어냈다 — 즉 이 층의 승부는 이제 '정확도'가 아니라 '타석 1개를 얼마나 싸게 컴퓨터로 만드느냐'로 옮겨갔다.

> **⚠️ 조사 제약 (정직 고지)** — 이 세션의 조직 egress 정책이 WebFetch/curl의 CONNECT를 전부 403으로 차단했다(9회 시도 전부 실패, thegolfwire.com·toptracer.com·sedaily.com·sec.gov·en.wikipedia.org 포함). 따라서 **원문 직접 대조가 불가능**했고, 아래 사실은 대부분 검색 인덱스가 반환한 기사 본문 스니펫에 근거한다. 그 결과 등급을 보수적으로 매겼다: 기업 공식 보도자료가 3개 이상 매체에서 동일 수치로 재현된 경우에만 `확인`, 단일·소수 매체 스니펫은 `업계보도`, 역산·계산은 `추정`, 스니펫 간 충돌이 있거나 원문 확인이 필요한 것은 `미검증`. 이도형 프로가 최종 보고서에 넣을 숫자 중 `업계보도` 이하 등급은 반드시 원문을 다시 열어 확인해야 한다.

---

## 서사 분석

### 1. 2026년 1월, 가격의 바닥이 빠졌다

이 축에서 2026년에 벌어진 가장 중요한 사건은 신기술이 아니라 **가격구조의 파괴**다. Toptracer Range의 전통적 과금은 "설치비 무료 + 타석당 월 $200~250"이었다(업계보도). 100타석 실외 연습장이면 월 2,000만~3,300만원. 여기에 타석마다 카메라·모니터·배선이 들어가므로 시설 입장에서는 CAPEX를 벤더가 대신 지는 리스 구조였고, 그 대가로 5년급 장기 계약에 묶였다. 이 구조가 이 층의 시장 규모를 결정했다 — 100타석 이상 대형 실외 연습장, 즉 전 세계 몇천 곳.

2026년 1월 PGA쇼(1/21~23, 올랜도)에서 나온 **Toptracer Go는 이 구조를 정면으로 무너뜨렸다.** 월 $999 정액(호주 AUD 1,699+GST), **카메라 1대가 티라인 50m를 커버**, 타석 모니터는 기본 0대(옵션으로 21인치 스크린 최대 9대), 손님은 QR 코드만 스캔해서 자기 폰으로 데이터를 받고, **Wi-Fi 의존 없음·회원가입 없음**. 벤더 스스로 "large bucket $25 기준 하루 2버켓이면 원가 회수"라고 마케팅했다(업계보도). 그리고 결정적인 문구가 하나 더 있다 — "head pro나 골프 디렉터의 재량 지출 범위 안의 가격". 즉 이 제품은 오너 결재라인을 아예 건너뛰도록 설계됐다.

이게 왜 파괴적인가. 20타석짜리 소규모 연습장이 Toptracer Range를 넣으면 월 $4,000~5,000이었다. 이제 $999다. **80% 가격 인하**다(추정). 동시에 '타석수에 비례하던 과금'이 '티라인 길이에 대한 정액'으로 바뀌었다. 타석을 100개 놓든 20개 놓든 50m면 $999. 이건 대형 시설에는 오히려 불리하고 소형 시설에는 압도적으로 유리한 가격 체계다. Toptracer는 자기 상위 제품(Toptracer Range, 1,450개 시설·38개국·2025년 재생 4,500만 시간)을 스스로 카니발라이즈하면서 시장의 밑변을 수만 개 시설로 확장하는 쪽을 골랐다. 시장이 줄어드는 국면에서 벤더가 취할 수 있는 유일한 합리적 선택이다.

### 2. 하드웨어 CAPEX 붕괴의 물리학 — '타석당 센서'에서 '레인지당 센서'로

가격 인하의 원인은 마케팅이 아니라 **센서 커버리지의 물리학**이다. Toptracer 1세대는 타석 단위 카메라였다. Toptracer Go는 카메라 1대 = 50m 티라인. Trackman Range는 더 극단적이다: **레이더 2~3대로 100타석 이상을 실시간 추적**한다(업계보도). 한국 사례가 이걸 가장 선명하게 증명했다 — 경기 고양CC 연습장은 3개 층 108타석 전체를 **레이더 단 3대**로 덮었고, 각 타석 모니터 또는 개인 스마트폰 앱에서 볼 궤적·캐리·볼스피드·런치앵글 등 8개 데이터를 즉시 본다. 국내 최대 규모다.

3대로 108타석이면 **센서 1대당 36타석**이다. 타석당 센서 1대였던 시대와 비교하면 하드웨어 물량이 1/36이다. 이 지점이 이 축 전체의 경제학을 다시 쓴다. 벤더의 BOM(부품원가)이 붕괴하면 벤더는 (a) 가격을 내려 시장 밑변을 먹거나 (b) 마진을 챔킨다. Toptracer Go는 (a)를 택했고, Trackman은 여전히 프리미엄 포지션(상업용 베이 $45,000~90,000 수준의 시뮬레이터 가격대)을 유지하면서 레인지 쪽은 "골퍼에게는 무료, 시설이 지불" 모델로 간다. Inrange는 레이더 기반으로 아예 "필드에 센서, 타석에는 아무것도"라는 구조를 밀고, 설치 기간이 시설 규모에 따라 현장 7~14일이라고 광고한다.

**여기서 발생하는 진짜 결과: 타석 스크린이 코스트 센터에서 옵션으로 강등됐다.** Toptracer Go는 스크린 없이 폰만으로 작동한다. 스크린은 타석당 수십만~수백만원 CAPEX이자 고장·A/S·전기의 원천이었다. 그게 옵션이 되면 연습장 리모델링 비용의 큰 덩어리가 사라진다. 그리고 동시에, 골퍼가 자기 데이터를 **자기 폰에 축적**하기 시작한다 — 시설에 갇혀 있던 데이터가 개인에게 이동한다. 이건 레슨프로에게 양날의 칼이다(아래 '레슨프로 함의').

### 3. 돈은 어디로 흐르는가 — 소프트웨어 마진에서 PE 캐시플로우로

이 층의 자본 흐름은 2025~2026년에 방향이 바뀌었다. **성장주 밸류에이션에서 사모펀드 캐시플로우 자산으로 재분류됐다.**

- Topgolf/Toptracer: Leonard Green & Partners가 60%를 **약 11억 달러 밸류**로 인수, **2026년 1월 1일 발효**, Callaway는 현금 약 8억 달러 수령·40% 잔존, 사명을 Callaway Golf Company로 되돌리고 티커를 MODG→CALY로 변경(2026년 1월 중순). 2021년 합병 당시 Topgolf 밸류가 약 26억 달러였던 것과 비교하면 **약 58% 하락**(추정). 신임 CEO는 Chuck E. Cheese 모회사 CEC Entertainment 출신 David McKillips — 즉 골프 테크 인물이 아니라 **패밀리 엔터테인먼트 유닛 이코노믹스 인물**이다. 그의 계획은 미국 신규 3~5개/년, 2027년부터 최대 7개 지점에 피클볼 코트, 미니골프 20→30개. 이건 성장 스토리가 아니라 **좌석 회전율과 F&B 마진 최적화 플레이북**이다.
- Full Swing: Golf Channel 모회사 Versant가 **$530M 현금**으로 인수 합의(2026년 7월 6일 발표, 2026년 하반기 클로징 예정). 매도자는 Bruin Capital로 2021년 $160M에 사서 **5년 만에 3배**. 여기서 흥미로운 건 인수자가 골프 회사가 아니라 **미디어 회사**라는 점이다. 시뮬레이터·런치모니터·퍼포먼스 데이터를 미디어 자산으로 본다.
- Inrange: Crunchbase 기준 누적 조달 **$1.94M**(투자자 Grow London, Lowercarbon Capital, Octopus Ventures, Voyager; 2017년 설립, 남아공 스텔렌보스 본사). 79개 시설 운영 + 2026년 상반기 20개 시공 중. 조달 규모 대비 시설 수가 이상하게 많으므로 이 숫자는 원문 재확인 필요(`미검증` 취급).

**돈의 방향이 말해주는 것: 이 층에서 소프트웨어 프리미엄은 끝났고, 남은 것은 시설 운영 수익률이다.** 사모펀드는 밸류업 스토리가 아니라 EBITDA를 산다. 그래서 2026년의 신제품들이 전부 '운영 지표'를 향한다 — Toptracer IQ는 스윙분석 도구가 아니라 **예약·결제 연동 + AI가 붙은 비즈니스 인텔리전스 플랫폼**이다. Inrange는 대놓고 "revenue per bay-hour"를 언어로 쓰고, 실습형/엔터형/멀티베이 단체형 3분할 요금제로 타석당 업리프트 1.2배(골프)/2.2배(소셜)/3.0배(멀티베이)를 주장한다. Power Tee는 오토티업으로 볼 처리량 +25% → 연 순이익 $97,600, 5년 $488,000이라는 계산서를 낸다. 전부 **'스윙이 좋아진다'가 아니라 '타석 1개가 시간당 얼마를 버느냐'**다.

### 4. 자동화가 타석 밖으로 번진다 — 볼 회수 로봇과 무인 운영

레인지 테크의 두 번째 전선은 **인건비**다. 2026년 1분기부터 Husqvarna가 유럽 프로 딜러망을 통해 Relox Robotics의 Range Picker를 공급하기 시작했다. 권장소비자가 **€39,500(VAT 별도)**, 중량 140kg, GPS 유도, 배터리 구동, **일 최대 6만 개** 볼 회수, 벤더 주장으로는 해당 업무 인력 시간의 **최대 100% 대체**. 경쟁 제품도 줄줄이 있다 — Echo Robotics RP-1250(24시간 15,000개, 45,000㎡ 커버), KNOXBOTS Pik'r-X(1회 순환 6,000개), Korechi Pik'r/Raek'r, Xeratech Robo Ranger.

한국에서는 이 자동화가 다른 층에서 왔다. **무인 운영 솔루션**이다. 김캐디 자동화 솔루션은 2024년 말 시작해 1년여 만에 제휴점 100개소를 넘었고, 24시 무인 매장의 심야 평균 월매출 500만원, 제휴점 기준 22시~06시 구간 월평균 매출 +269만원·**인건비 -81%**를 제시한다. 서울 여의도 갤러리 골프 아카데미는 낮 유인/23시~06시 무인 전환으로 **매출 15~20% 상승**을 보고했고, 도입 경로는 중기부·소진공 스마트상점 기술보급사업이었다. 2026년 창업 트렌드 조사에서 예비창업자 **32.6%가 '무인' 업종을 성장성 1위**로 꼽았다.

여기서 구조가 드러난다. **무인 연습장에서 레인지 테크가 담당하는 역할은 '재미'가 아니라 '무인 운영의 전제조건'이다.** 사람이 없는 타석에서 손님이 자기가 뭘 하고 있는지 알 수 있는 유일한 방법이 볼트래킹 데이터이고, 결제·입장·타석 개방·데이터 제공이 하나의 앱/키오스크 퍼널로 묶여야 무인이 성립한다. 한국의 무인화는 스크린골프(GDR/QED/SDR 계열)에서 먼저 자리를 잡았지만, Toptracer Go처럼 스크린 CAPEX 없이 폰만으로 데이터를 주는 구조는 **실외·실내 무인 연습장의 원가표에 딱 맞는다**. 3년 뒤 한국 인도어의 표준 스택은 "키오스크(결제·출입) + 출타석 제어 + 폰 기반 볼트래킹 + AI 리포트"가 될 가능성이 높다.

### 5. 한국은 아직 초기 — 53개 대 1,500개

한국에 이 층이 얼마나 들어왔는가에 대한 답은 냉정하다. **Toptracer는 2018년 진입 후 2026년 6월까지 국내 53개 연습장**(워커힐 골프연습장, 한양파인CC, 스프링힐스CC 등)이다. 전 세계 1,450개 중 3.7%(추정). 국내 골프연습장 총수는 1,500여 개로 추산되므로(미검증) **침투율 3~4% 수준**이다. Trackman Range는 국내 공식 출시가 더 최근이고 1호기가 대구 동구 피닉스골프클럽, 최대 사례가 고양CC 108타석이다. 즉 한국의 실외 대형 연습장 상위권만 들어갔고, **인도어(실내) 타석 시장은 사실상 골프존 GDR·카카오VX 티업비전 계열의 스크린 시뮬레이터가 점령**하고 있어 '볼트래킹 레인지 테크'와는 다른 층이다.

가격 비교가 이 분단을 설명한다. 골프존 GDR PLUS(아파트 커뮤니티 전용) 렌탈이 기본형 5년 월 36만원 / 3년 월 45만원, 양손형 5년 월 39만원 / 3년 월 48만원이다. 비전플러스는 중고 기계만 1,300~1,400만원, 타석·스크린·프로젝터·스윙플레이트 풀세트는 3,000만원 이상. 반면 Toptracer Go는 **50m 티라인 전체에 월 약 145만원**(₩1,450/USD 가정 시 추정). 타석 5개짜리 인도어가 GDR을 5대 넣으면 월 180만~240만원인데, 같은 돈으로 Toptracer Go 하나면 티라인 전체가 커버된다 — **단, 스크린골프 콘텐츠(가상 라운드 과금)가 없다.** 한국 인도어의 매출 구조가 '스크린 게임 과금'에 묶여 있는 한 이 층은 쉽게 침투하지 못한다. 그러나 골프존 홀딩스 2025년 실적이 매출 -8.3%, 영업이익 -29.0%, 순이익 -44.9%로 꺾인 지금, **시뮬레이터 CAPEX를 감당 못 하는 소형 인도어부터 '스크린 없는 데이터 타석'으로 이탈할 가능성**이 열렸다. 3년 뒤 이 층의 한국 승부는 실외 100타석이 아니라 **실내 6~10타석 무인 매장에서 갈릴 것**이다.

---

## 핵심 사실

| # | 주장 | 근거(숫자·날짜·주체 포함) | 등급 | 출처 |
|---|---|---|---|---|
| 1 | Toptracer가 월 $999 정액의 신제품 Toptracer Go를 출시, 카메라 1대로 티라인 50m 커버 | 2026 PGA쇼(2026-01, 올랜도) 출시. 손님은 QR 스캔 후 개인 폰에서 거리·볼스피드·런치앵글 확인. Wi-Fi 의존 없음, 계정 가입 없음. 옵션으로 21인치 타석 스크린 최대 9대 연결 | `확인` | thegolfwire.com/toptracer-go-range-technology, golfincmagazine.com, turfmatters.co.uk, golfdom.com, golfbusinesstechnology.com (5개 매체 동일 수치) |
| 2 | Toptracer Go 호주 가격은 월 AUD 1,699 + GST | Australian Golf Digest. "large bucket $25 기준 하루 2버켓이면 원가 회수" 라는 벤더 계산 병기 | `업계보도` | australiangolfdigest.com.au/toptracer-go-lowers-the-barrier-to-premium-range-technology |
| 3 | 기존 Toptracer Range 과금은 설치비 무료 + 타석당 월 약 $200~225 | 별도 보고에서는 "초기 설치 $25,000 + 프라이빗 클럽 연 $15,000 라이선스" 또는 "퍼블릭 코스 타석당 월 $250" 구조도 제시됨. Topgolf가 장비를 리스하는 방식으로 수익화 | `업계보도` | yourniceshot.com/blogs/news/toptracer-real-cost-and-impact-for-golf-operators-and-pga-pros, golf.com/news/how-and-why-topgolf-may-be-coming-to-a-driving-range-near-you |
| 4 | Toptracer Go는 기존 Toptracer Range 대비 소형 시설 기준 약 80% 가격 인하 효과 | 20타석 × $200~250 = 월 $4,000~5,000 → Toptracer Go 월 $999. 타석수 비례 과금이 티라인 길이 정액 과금으로 전환 | `추정` | #1, #3의 역산 |
| 5 | Toptracer 설치 규모: 38개국 1,450개 이상 시설, 2025년 재생 4,500만 시간 | 2026년 기준 벤더 발표 수치. PGA of America(약 28,000 프로)의 'Official Range Technology' | `업계보도` | thegolfwire.com/toptracer-154th-open, en.sedaily.com/sports/2026/06/04, toptracer.com |
| 6 | 2026 PGA쇼에서 Toptracer IQ(AI 내장 비즈니스 인텔리전스 플랫폼) 동시 출시 | 예약·결제 시스템과 연동, 운영자에게 고객행동 가시성 제공. Toptracer 사장 겸 GM은 Scott Blevins. 가격 비공개 | `업계보도` | thegolfwire.com/toptracer-iq-and-toptracer-go-lead-line-of-products-at-pga-show |
| 7 | Leonard Green & Partners가 Topgolf + Toptracer 지분 60%를 약 $1.1B 밸류로 인수, 2026-01-01 발효 | Callaway는 순현금 약 $800M 수령(발표 시점 추정 $770M), 40% 잔존. 사명 Callaway Golf Company 환원(2026-01-15경), 티커 MODG→CALY(2026-01-16경) | `확인` | prnewswire.com "Topgolf Callaway Brands Completes Sale of Majority Stake…", ir.callawaygolf.com, pehub.com, ropesgray.com |
| 8 | 2021년 합병 시 Topgolf 밸류 약 $2.6B → 2026년 매각 밸류 $1.1B, 약 58% 하락 | Dallas Innovates가 "$2.6B 합병 4년 후 분리"로 보도. 밸류 하락률은 $1.1B/$2.6B 역산 | `추정` | dallasinnovates.com/topgolf-callaway-brands-to-separate-four-years-after-2-6b-merger |
| 9 | Topgolf 신임 CEO는 CEC Entertainment(Chuck E. Cheese) 출신 David McKillips | 2026-05-19 리더십 발표. 미국 신규 매장 연 3~5개, 2027년부터 최대 7개 지점 피클볼 코트 추가, 미니골프 약 20→30개 확대 | `업계보도` | press.topgolf.com/2026-05-19, dmagazine.com/business-economy/2026/06/topgolf-ceo-david-mckillips-plan, frontofficesports.com |
| 10 | Topgolf 매장 수 2026년 5월 기준 100개 이상, 총 520만 sq ft | 대부분 교외 입지 | `업계보도` | frontofficesports.com/topgolf-ceo-dishes-on-private-equity-owners-layoffs-and-expansion |
| 11 | Topgolf 동일매장매출(SVS) 2024 Q4 -8% → 2025 Q3 +1% 전환 | 2024 Q4 매출 $439.0M(전년 동일 수준), 신규 2개(전년 동기 9개). 2025 Q3: 1~2베이 소비자 부문(연매출의 80%) 트래픽 high-teens 증가, 해당 부문 SVS +2.4%. 반등 동인은 Sunday Funday / 월~목 반값 골프 등 가격 인센티브 | `업계보도` | ir.callawaygolf.com Q3 2025 릴리스, sec.gov 8-K FY2025, investing.com 어닝콜 트랜스크립트 |
| 12 | Trackman Range는 고성능 레이더 2~3대로 100타석 이상을 실시간 추적 | 트랙맨코리아 국내 공식 출시. 1호 설치는 대구 동구 피닉스골프클럽. 골퍼는 타석 모니터 또는 개인 스마트폰 앱에서 8개 데이터 확인 | `업계보도` | golfdigest.co.kr/news/articleView.html?idxno=45745, golfmagazinekorea.com, newsian.co.kr |
| 13 | 고양CC 연습장은 3개 층 108타석 전체를 레이더 3대로 커버(국내 최대), 설치 후 유효회원 전년 대비 +700명 | 시설 관계자: "유효 회원(1회권 이용자 제외) 700명 증가, 감소세가 반등해 코로나19 수준 회복". 센서 1대당 36타석 | `업계보도` | dailian.co.kr/news/view/1621637, sedaily.com/article/20020323, sedaily.com/article/20066312 |
| 14 | Toptracer 한국 설치는 2018년 진입 후 2026년 6월 기준 53개 연습장 | 워커힐 골프연습장, 한양파인CC, 스프링힐스CC 등. 전 세계 1,450개 대비 약 3.7% | `업계보도` | en.sedaily.com/sports/2026/06/04/topgolfs-toptracer-tops-53-korean-driving-ranges-in-market, sedaily.com/article/20051978 |
| 15 | Toptracer 설치 후 방문객 30~50% 증가라는 벤더/업계 주장 | Australian Golf Digest 2026 기사 내 서술. 과거 데이터: Toptracer 타석이 일반 타석 대비 매출 +205%(Galante's), Chris Cote's 2020년 매출 +275%, "Toptracer 타석이 비Toptracer 타석 매출을 거의 2배" | `업계보도` | australiangolfdigest.com.au, toptracer.com/case-studies/chris-cotes, si.com/golf/news/feature-2018-01-25-toptracer-helps-driving-ranges-see-future |
| 16 | Inrange는 79개 시설 운영 + 2026년 상반기 20개 시공 중, Inrange World Tour 시즌3은 17개국 85개 베뉴에서 5/1 개막 | 레이더 기반, 필드에 센서 배치. 설치 시 현장 엔지니어 7~14일 상주(시설 규모별) | `업계보도` | golfbusinessreview.com/p/inrange-world-tour-season-3-driving-range-business, firstcallgolf.com 2025-11-17, inrangegolf.com |
| 17 | Inrange 타석 업리프트 주장: 골프 1.2배 / 소셜 2.2배 / 멀티베이 3.0배 | 애리조나 파트너 1곳은 Inrange로 전환 후 연환산 매출 +45%, 일부 베뉴는 매출 +500% 이상, 여러 시설이 연간 기업행사 매출 $250,000 초과. Inrange+ Teams는 이벤트당 300명 이상 참가 가능 | `업계보도` | golfbusinessreview.com/p/inrange-revenue-per-bay, inrangegolf.com/software-suite/multi-bay |
| 18 | Inrange 누적 조달액 $1.94M (2017년 설립, 남아공 스텔렌보스) | 투자자 Grow London, Lowercarbon Capital, Octopus Ventures, Voyager. 조달 규모 대비 79개 시설 설치는 정합성이 낮아 원문 재확인 필요 | `미검증` | crunchbase.com/organization/inrange-4b2b, pitchbook.com/profiles/company/520838-65 |
| 19 | Versant(Golf Channel 모회사)가 Full Swing을 $530M 현금으로 인수 합의, 2026-07-06 발표, 2026년 하반기 클로징 예정 | 매도자 Bruin Capital은 2021년 $160M에 인수 → 5년 만에 약 3배. 시뮬레이션·런치모니터·버추얼 그린·통합 소프트웨어·퍼포먼스 데이터 자산 | `확인` | cnbc.com/2026/07/06/versant-to-buy-golf-simulator-company-full-swing, sportico.com, thewrap.com, frontofficesports.com, sportspro.com (5개 매체 동일 수치) |
| 20 | Relox Robotics Range Picker(자율 볼회수 로봇) 권장가 €39,500 ex-VAT, 일 최대 6만 개 회수, 중량 140kg | Husqvarna–Relox 파트너십으로 2026년 1분기부터 유럽 전문 딜러망 통해 첫 인도. 해당 업무 인력 시간 최대 100% 대체 주장. Range Servant도 유통 | `업계보도` | golfbusinessnews.com/news/greenkeeping/husqvarna-partners-with-relox-robotics…, reloxrobotics.com/range-picker, rangeservant.com/product/robot-picker |
| 21 | 경쟁 볼회수 로봇 스펙: Echo Robotics RP-1250 = 24시간 15,000개·45,000㎡, KNOXBOTS Pik'r-X = 1회 순환 6,000개 | Korechi(Pik'r/Raek'r), Xeratech Robo Ranger도 동일 카테고리 | `업계보도` | echorobotics.com/en/rp-1250-professional-robotic-lawnmower, knoxbots.com/pik-r-x, korechi.golf, roboranger.golf |
| 22 | Power Tee(오토 티업)는 무초기투자 옵션 제공, 매출 15~45% 증가 주장 | 10대 설치 + 100볼당 $2 인상 시 연 순이익 +$16,600, 볼 처리량 +25% 시 연 $97,600·5년 누적 $488,000. 연매출 $100K 레인지가 $125~140K로. 2026-04 Midway Sports & Entertainment 전 타석 설치 | `업계보도` | powertee.com/driving-range, par2pro.com/blogs/news/increase-driving-range-revenue, firstcallgolf.com 2026-04-20 |
| 23 | 골프존 GDR PLUS 렌탈 가격: 기본형 5년 월 36만원 / 3년 월 45만원, 양손형 5년 월 39만원 / 3년 월 48만원 | 아파트 커뮤니티 전용 상품. 계약기간 중 무상 A/S + 연 1회 정기점검. 비전플러스는 중고 기계 1,300~1,400만원, 타석·스크린·프로젝터·스윙플레이트 풀세트 3,000만원 이상 | `업계보도` | businesspost.co.kr/BP?command=article_view&num=437400, goodkyung.com/news/articleView.html?idxno=286101, kimcaddie.com/post/dr_price |
| 24 | 골프존홀딩스 2025년 연결: 매출 -8.3%, 영업이익 -29.0%, 당기순이익 -44.9% | 2025년 매출 비중: 골프 시뮬레이터 76.8%, 광고제휴 2.6%, 직영 9.1%, 기타 11.5%. 해외 매장 약 900개(일본 400, 중국 230, 미국 140, 베트남 40, 기타 80) | `업계보도` | comp.fnguide.com/SVO2/asp/SVD_Main.asp?gicode=A121440, comp.wisereport.co.kr/company/c1010001.aspx?cmp_cd=121440 |
| 25 | 골프존 GDR 센서는 초당 2,000프레임 듀얼 카메라, 타석 바닥 설치형, 볼마커 없이 스핀 직접 측정 | 좁은 타석·낮은 천장 환경 대응 설계. 렌탈 서비스 형태 운영 | `업계보도` | company.golfzon.com/M/GFZ/StartUp/Training_4.aspx, biz.heraldcorp.com/article/58244 |
| 26 | 골프존은 2025-05 AWS 서밋 서울에서 Amazon Bedrock 기반 '나만의 AI 골프 코치'(음성 실시간 피드백) 공개, 2026 PGA쇼에서 'City Golf' 신모델 공개 | 미국에서 GDR 아카데미 기반 Golfzon Social 4곳·Golfzon Range 2곳 운영. 골프존아메리카 2025년 매출 약 441억원(2020년 대비 7배) — 단위는 원문 재확인 필요 | `미검증` | hankyung.com/article/2025052774371, infostockdaily.co.kr/news/articleView.html?idxno=184696 |
| 27 | 한국 무인 운영 솔루션 김캐디는 2024년 말 진입 후 1년여 만에 제휴점 100개소 돌파 | 24시 무인 매장 심야 평균 월매출 500만원. 제휴점 기준 22시~06시 월평균 매출 +269만원, 인건비 -81%. 일부 점주는 월 1,500~2,000만원 인건비 절감 주장 | `업계보도` | kimcaddie.com/post/2025-screengolf-auto-solution, auto.kimcaddie.com, geconomy.co.kr/mobile/article.html?no=314141 |
| 28 | 서울 여의도 갤러리 골프 아카데미는 키오스크 + 출타석 제어시스템으로 낮 유인/23시~06시 무인 전환, 매출 15~20% 상승 | 휴대폰 번호 끝자리 입력으로 자동 입출입·타석 개방. 중기부·소진공 '2023 스마트상점 기술보급사업'으로 도입 | `업계보도` | smedaily.co.kr/news/articleView.html?idxno=280066 |
| 29 | 2026 창업 트렌드 조사에서 예비창업자 32.6%가 '무인' 업종을 성장성 1위로 선택 | 인건비 상승·구인난이 배경. 무인 스크린골프는 2025년 4월 기준 전국 10개소 이상으로 추정 | `업계보도` | hankyung.com/article/202601137663i |
| 30 | 미국 오프코스 골프 인구가 사상 최대, 코스 미이용 순수 오프코스만 1,900만 명 | NGF 2026 발표: 코스 플레이 2,910만 + 오프코스 전용 1,900만 = 총 4,810만. 오프코스 전용 중 여성 비중 43%, 오프코스만 경험한 청년층 700만 명 이상. 2026년 4% 이상 성장 시 사상 첫 5,000만 돌파 | `업계보도` | ngf.org/short-game/golfs-growth-era-the-road-to-50-million-golfers, thegolfwire.com/ngf-state-of-industry-2026 |
| 31 | 볼트래킹 도입 레인지는 통상 볼당 20~30% 높은 가격을 받는다 | 체류시간 증가 → F&B 지출 증가라는 논리. 상업용 시뮬레이터 투자 회수 기간은 통상 12~24개월 | `업계보도` | trugolf.com/blogs/news/the-demand-for-driving-range-tech-is-already-here, golfsimmasters.com/blogs/news/golf-simulator-roi-what-s-the-real-payback-period |
| 32 | Toptracer는 R&A 공식 트래킹 파트너로 2026년 7월 제154회 디오픈(Royal Birkdale)에서 역대 최대 팬 액티베이션 실행 | 사상 최초로 팬이 선수 연습 세션을 추적. 연습 라운드 중 각 티박스에 Toptracer Go QR — 볼스피드·캐리·런치앵글·랜딩앵글·높이·스핀·커브 제공. R&A Swing Zone에 Toptracer 시뮬레이터 10대, 15분 무료 레슨 | `업계보도` | thegolfwire.com/toptracer-154th-open, golfmagic.com/tour/open-championship/toptracer-announces-largest-fan-activation-ever-154th-open |
| 33 | Toptracer Coach(코치용 웹 플랫폼)는 2023-05 출시, 2023년 가을 Monitor 제품 전체 사용자로 확대 | 해결 과제로 (a) 학생이 수행하기 쉬운 벤치마크 평가 (b) 레슨 사이 연습 과제 배정 및 책임 추적을 명시. PGA of America 인증 프로들과 공동 개발. 2025~2026 가격/존속 상태는 확인 실패 | `업계보도` | thegolfwire.com/toptracer-coach, golfretailing.com/features/toptracer-coach-revolutionising-golf-tuition-with-data-driven-insights |
| 34 | Bushnell Golf은 Foresight Sports를 보유, 영국 PGA와 2028년까지 3년 파트너십, Launch Pro Circle B Edition $2,499 + 연 $199 Silver 플랜 | 라운드용 레인지파인더와 실내 시뮬레이터 데이터를 LINK로 연결(슬로프 보정 거리 전송). 유통은 Optimum Golf Technologies(OGT) | `업계보도` | pga.info/discover/latest/news/pga-partners-bushnell-golf…, playbetter.com/blogs/golf-simulator-reviews/bushnell-launch-pro-circle-b-edition-review |
| 35 | Uneekor 상업용 가격대: EYE MINI LITE $2,749, EYE XO2 $11,000, AI Studio 번들 $5,999부터 | AI Studio 번들에 Swing Optix 고속카메라 + AI Trainer 1년 + Ultimate Package 3개월 체험 포함. EYE XR이 QED를 대체 | `업계보도` | uneekor.com/blogs/blog/introducing-the-uneekor-studio-package, onthegreen.golf/uneekor, aceindoorgolf.com/blogs/news/new-uneekor-subscription-model-pricing |
| 36 | 국내 골프연습장 폐업: 서울에서만 전년 52곳 폐업, 2025년 1분기에 10곳 | '폐업이 창업의 5배'라는 자주 인용되는 수치는 2020년 데이터(최근 10년 평균은 창업이 폐업의 1.5배였음)이므로 2025년 사실로 전용하면 안 됨 | `업계보도` | khan.co.kr/article/202106061045001, koreatimes.com/article/1554476 |
| 37 | 글로벌 드라이빙레인지·패밀리펀센터 시장 규모 2025년 $1.16B → 2026년 $1.23B → 2035년 $2.18B, CAGR 6.14% | 민간 리서치 추계이며 산정 범위 불명 | `미검증` | businessresearchinsights.com/market-reports/golf-driving-ranges-and-family-fun-centers-market-125460 |
| 38 | Zen Golf가 2026 PGA쇼(1/21~23)에서 Trackman iO 연동 데모 — 화면상 라이에 맞춰 스윙 스테이지 표면이 실시간 자동 이동 | 타석 자체가 지형을 재현하는 방향. Trackman iO가 상위 센서로 기능 | `업계보도` | zen.golf/zen-golf-launches-integrated-trackman-solution-pgashow26, thegolfwire.com/zen-golf-launches-integrated-trackman-solution-at-pga-show-2026 |

---

## 플레이어 맵

| 플레이어 | 무엇을 하는가 | AI 적용 지점 | 2026 상태 | 가격 |
|---|---|---|---|---|
| **Toptracer** (Topgolf 산하) | 카메라 기반 볼트래킹 레인지 테크. 38개국 1,450+ 시설, 2025년 4,500만 시간 재생. PGA of America 공식 레인지 테크 | Toptracer IQ에 AI 내장(운영 BI: 고객행동·예약·결제 분석). 스윙 코칭 AI가 아니라 **운영 AI**로 이동 | 2026-01-01자로 Leonard Green이 모회사 지분 60% 보유. Toptracer 사장/GM Scott Blevins. 2026 PGA쇼에서 Go + IQ 2종 출시. R&A 공식 트래킹 파트너 | Toptracer Range 타석당 월 $200~250(설치 무료·장비 리스). **Toptracer Go 월 $999**(호주 AUD 1,699+GST). 대안 구조: 설치 $25,000 + 프라이빗 연 $15,000 |
| **Trackman** (덴마크, 비상장) | 레이더 기반. 레인지는 **레이더 2~3대로 100타석+** 커버. 골퍼에게는 앱 무료, 시설이 지불 | AI Motion Technology — 수동 라인 드로잉 없이 스윙 자동 피드백. Virtual Golf/게임(Closest to the Pin, Bullseye, Capture the Flag) | 국내 공식 출시 완료(1호 대구 피닉스GC, 최대 고양CC 108타석). Zen Golf와 iO 연동해 움직이는 스윙 스테이지 데모 | 상업용 베이 $45,000~90,000 규모, TPS 소프트웨어 연 약 $1,100(3년 약 $4,000). 레인지 시설 과금은 비공개 |
| **Inrange** (2017 설립, 남아공 스텔렌보스 / 영국 영업) | 레이더 기반, 필드에 센서. 79개 시설 + 2026 상반기 20개 시공. World Tour 시즌3 17개국 85+ 베뉴 | 고객 세그먼트(연습/엔터/단체) 자동 분리와 요금 최적화. '타석당 시간 매출' 최대화 소프트웨어 | 미국 확장 중(Chelsea Piers, Clermont National, Montauk Downs, Dobson Ranch 등). 누적 조달 $1.94M(미검증) | 시설별 커스텀. 업리프트 주장 1.2×(골프)/2.2×(소셜)/3.0×(멀티베이). 설치 현장 7~14일 |
| **Topgolf** (Leonard Green 60% / Callaway 40%) | 100+ 매장, 520만 sq ft의 타석 엔터테인먼트 부동산 사업 | 자체 매장 전 타석 Toptracer. 가격·트래픽 최적화(가격 인센티브 프로그램) | 2026-01-01 PE 인수 발효, $1.1B 밸류. CEO David McKillips(CEC 출신). 미국 신규 3~5개/년, 2027년 피클볼 최대 7개 지점 | 매장 베이 시간당 소비자가. 예: Toptracer Range 시설 베이당 시간 $30(주간)~$50(야간) |
| **Golfzon** (한국, 코스닥) | 스크린 시뮬레이터 + GDR 연습 전용 시뮬레이터. 국내 인도어 사실상 표준. 해외 약 900개 매장 | Amazon Bedrock 기반 '나만의 AI 골프 코치'(음성 실시간 피드백). GDR 센서는 2,000fps 듀얼 카메라, 볼마커 없이 스핀 측정 | 홀딩스 2025 매출 -8.3%·영업이익 -29.0%·순이익 -44.9%. 2026 PGA쇼 'City Golf' 공개. 미국에 Golfzon Social 4 + Golfzon Range 2 | GDR PLUS 렌탈 월 36만~48만원(계약연한·모델별). 비전플러스 풀세트 3,000만원+ |
| **카카오VX** | 티업비전2/티업비전/지스윙 — 국내 스크린골프 점유율 2위. 골프연습장 프랜차이즈 라인 보유 | VX(가상경험)+AI 결합 서비스 계획 발표 | 골프존과 특허 분쟁 이력, 매각 거론. 레인지 테크(볼트래킹) 층에서는 존재감 확인 실패 | 확인 실패 |
| **Full Swing → Versant** | 시뮬레이터·런치모니터·버추얼 그린·퍼포먼스 데이터. Tiger Woods 2015년부터 후원 | 데이터 기반 연습/훈련 플랫폼. 야구 등 타 종목 확장 | **2026-07-06 Versant(Golf Channel 모회사)가 $530M 현금 인수 합의**, 2026 하반기 클로징. Bruin Capital이 2021년 $160M에 인수해 3배 회수 | 인수가 $530M. 제품 가격 비공개(상업용 프리미엄) |
| **Bushnell Golf / Foresight Sports** | 레인지파인더 + 런치모니터 + 실내 시뮬레이터. 영국 PGA와 2028년까지 파트너십 | LINK — 실내 시뮬레이터 데이터를 코스 레인지파인더로 전송(슬로프 보정 거리) | Circle B Edition 라인업 확장. 유통은 OGT | Launch Pro Circle B $2,499 + 연 $199 Silver 플랜 |
| **Uneekor** | 천장/오버헤드형 런치모니터 + Swing Optix 카메라. 상업 스튜디오·인도어용 | AI Trainer(번들 1년 포함), AI Studio 패키지 | EYE XR이 QED 대체. 서브스크립션 모델 재편 | EYE MINI LITE $2,749, EYE XO2 $11,000, AI Studio 번들 $5,999부터 |
| **Power Tee** | 자동 티업 시스템. 노동 대체 + 볼 처리량 증대 | 처리량·가동률 데이터 기반 ROI 모델 제시 | 2026-04 Midway Sports & Entertainment 전 타석 설치 등 확산 | 자격 시설은 **무초기투자** 설치 옵션. 매출 15~45% 증가 주장 |
| **Relox Robotics / Husqvarna** | 자율 볼회수 로봇 Range Picker. GPS 유도, 배터리, 140kg | 자율주행·구역 학습, 트래픽/시간대 적응 경로 | Husqvarna 파트너십으로 **2026 Q1부터 유럽 프로 딜러망 공급 개시**. Range Servant도 유통 | **€39,500 ex-VAT**. 일 최대 6만 개 회수, 인력 시간 최대 100% 대체 주장 |
| **김캐디 (한국)** | 무인 운영 솔루션(키오스크·출입·타석 제어·예약결제). 레인지 테크가 아니라 **레인지 무인화 레이어** | 예약/이용 데이터 기반 시간대 가격·가동 최적화 | 2024년 말 진입 → 1년여 만에 제휴점 100개소 돌파 | 심야 무인 월매출 +269만~500만원, 인건비 -81% 주장 |
| **Echo Robotics / KNOXBOTS / Korechi / Xeratech** | 볼회수 로봇 경쟁군 | 자율주행·센서 융합 | RP-1250(24h 15,000개/45,000㎡), Pik'r-X(1회 6,000개) 등 상용화 | 가격 대부분 비공개 |

---

## 돈의 흐름

**① 시설 → 벤더(월 정액 구독).** 이 층의 1차 현금흐름은 연습장 오너의 월 구독료다. 과거 구조는 "설치 무료 + 타석당 월 $200~250"으로, 벤더가 CAPEX를 지고 5년급 계약으로 회수했다. 2026년 Toptracer Go는 이걸 "티라인 50m당 월 $999 정액"으로 바꿨다. 벤더 입장의 유닛 이코노믹스가 완전히 달라진다 — 하드웨어 물량이 1/N로 줄었으므로 ARPU를 낮춰도 마진이 유지되고, 대신 **계정 수를 수천에서 수만으로 늘려야** 총매출이 방어된다. 한국 환산으로는 월 약 145만원(추정)이며, 이는 골프존 GDR 4~5타석 렌탈료와 거의 같다. 즉 **같은 예산으로 '4타석 스크린'과 '50m 티라인 데이터' 중 하나를 고르는 문제**가 국내 인도어 오너 앞에 놓였다.

**② 골퍼 → 시설(볼값 프리미엄 + 체류시간).** 벤더가 시설에 파는 논리는 "볼당 20~30% 인상 가능", "방문 30~50% 증가", 과거 사례로 "Toptracer 타석이 일반 타석 대비 매출 +205%"다. 한국에서 실증된 형태는 매출이 아니라 **회원 리텐션**이었다 — 고양CC 108타석 유효회원 +700명, 감소세 반등. 골프 인구가 줄어드는 시장에서 레인지 테크는 신규 획득 도구가 아니라 **이탈 방어 도구**로 값이 매겨진다.

**③ 시설 → 자동화 벤더(인건비 대체).** 두 번째 지출선이 열렸다. Relox Range Picker €39,500(약 6,300만원, 추정)은 볼 회수 인력을 대체하고, Power Tee는 무초기투자로 들어와 볼 처리량 +25% → 연 $97,600 순이익 증분을 약속하며, 한국에서는 김캐디형 무인 솔루션이 심야 인건비를 81% 줄인다. **이 지출은 매출 증대가 아니라 원가 절감이 근거이므로 경기가 나빠질수록 더 팔린다.** 레인지 테크(매출형)와 자동화(원가형)의 예산 경쟁에서 2026년 한국 시장은 원가형에 먼저 지불하고 있다.

**④ 벤더 → 사모펀드·미디어(엑싯).** 최상단 자본 흐름은 명확히 PE와 미디어로 갔다. Leonard Green이 Topgolf+Toptracer 60%를 $1.1B에 인수(Callaway 순현금 약 $800M 회수, 2021년 $2.6B 밸류 대비 약 -58%), Versant가 Full Swing을 $530M에 인수(Bruin Capital 5년 3배). 반면 Inrange의 공개 조달액은 $1.94M(미검증)에 불과하다. **읽어야 할 신호: 이 층에서 벤처 밸류에이션은 더 이상 붙지 않고, 값이 매겨지는 것은 (a) 설치 기반의 반복 현금흐름 (b) 미디어 자산으로서의 콘텐츠·데이터다.** 앞선 조사에서 확인된 '코치-회원 영상 SaaS 3전3패'와 정확히 같은 결론이 하드웨어 층에서도 반복된다 — 소프트웨어 레이어 단독으로는 값이 안 나오고, 물리 설치 기반이나 미디어 권리에 붙어야 값이 난다.

---

## 2026 신호

- **Toptracer Go 출시(2026-01 PGA쇼): 월 $999, 카메라 1대 = 티라인 50m, 타석 스크린 0대, 회원가입 없는 QR→폰 퍼널.** "head pro 재량 지출 범위"라는 표현이 공식 마케팅에 등장 — 결재라인 우회를 명시적으로 설계했다. 소형 시설 기준 약 80% 가격 인하(추정).
- **Toptracer IQ 동시 출시: AI가 붙은 건 스윙이 아니라 운영이다.** 예약·결제 연동 + 고객행동 가시성 + BI. 2026년 이 층의 AI는 "스윙 교정"에서 "타석당 시간 매출 최적화"로 전선을 옮겼다.
- **2026-01-01 Leonard Green이 Topgolf+Toptracer 60% 인수($1.1B 밸류), Callaway는 CALY로 사명·티커 환원.** 2021년 $2.6B 대비 -58%. 신임 CEO는 Chuck E. Cheese 계열 출신 — 골프 테크가 아니라 패밀리 엔터 유닛 이코노믹스 경영진으로 교체됐다.
- **2026-07-06 Versant(Golf Channel 모회사)가 Full Swing $530M 현금 인수 합의.** 골프 하드웨어를 미디어 회사가 산 첫 대형 사례. Bruin Capital은 $160M→$530M로 5년 3배.
- **볼 회수 자동화가 2026 Q1 유통망에 올라탔다: Husqvarna가 Relox Range Picker(€39,500, 일 6만 개)를 유럽 프로 딜러망으로 공급 개시.** 레인지 인건비 항목이 리스/딜러 금융 상품으로 전환되기 시작.
- **한국: 트랙맨 레인지 국내 공식 출시 + 고양CC 108타석/레이더 3대, 유효회원 +700명. Toptracer 국내 53개소(2026-06).** 침투율은 여전히 3~4% 수준(추정)이지만 '대형 실외 연습장의 생존 투자'로 자리를 잡았다.
- **한국 무인화가 100개 제휴점을 넘겼다(김캐디, 2024년 말 진입 → 1년여).** 심야 무인 월매출 +269만~500만원, 인건비 -81%. 2026 창업 트렌드에서 예비창업자 32.6%가 '무인'을 성장성 1위로 꼽음.
- **미국 오프코스 인구 사상 최대: 코스 미이용 순수 오프코스만 1,900만 명(총 4,810만).** 오프코스 전용 중 여성 43%, 오프코스만 경험한 청년층 700만+. 레인지가 '연습장'이 아니라 **입구(entry venue)**로 재정의되는 통계적 근거.
- **제154회 디오픈(2026-07, Royal Birkdale): 팬이 사상 최초로 선수 연습 세션 데이터를 추적. 티박스 QR로 볼스피드·스핀·커브까지.** 레인지 데이터가 방송 콘텐츠가 되는 루프가 완성 — 시설의 데이터 화면이 '전문가용 계기판'에서 '미디어 경험'으로 재포지셔닝된다.
- **Zen Golf × Trackman iO: 화면 라이에 맞춰 타석 표면이 실시간으로 움직이는 데모(2026 PGA쇼).** 타석의 다음 경쟁축은 데이터가 아니라 **지형 재현(물리 액추에이터)**일 수 있다는 신호.

---

## 무너지는 것

- **'타석당 과금'이라는 가격 체계 자체.** Toptracer Go는 티라인 길이 정액($999/50m)으로, Trackman Range는 레이더 2~3대/100타석+로 갔다. 근거: 고양CC는 레이더 3대로 108타석 = 센서 1대당 36타석. 센서가 타석 수에서 분리되면 타석 수 기준 청구는 정당성을 잃는다.
- **타석 모니터·스크린 CAPEX.** Toptracer Go의 기본 구성은 스크린 0대이고, 21인치 스크린은 최대 9대까지 '옵션'이다. 근거: 손님 폰이 디스플레이를 대체하며, 벤더가 "Wi-Fi 의존 없음·계정 가입 없음"을 세일즈 포인트로 내세운다. 타석 스크린은 CAPEX·A/S·전기의 원천이었고, 그게 옵션화되면 인도어 리모델링 견적의 큰 항목이 사라진다.
- **레인지 볼 회수·티업 인력.** 근거: Relox Range Picker가 일 최대 6만 개를 무인 회수하며 벤더는 해당 업무 인력 시간 최대 100% 대체를 주장하고, 2026 Q1부터 Husqvarna 딜러망으로 유통된다. Power Tee는 무초기투자로 티업 인력을 대체한다. 한국에서는 김캐디형 솔루션이 심야 인건비를 81% 줄였다.
- **'데이터를 보여주는 것'만으로 성립했던 프리미엄.** 근거: 2018~2020년에는 Toptracer 타석이 일반 타석 대비 +205%, +275% 매출을 냈지만, 2026년 벤더 마케팅의 주장은 "방문 30~50% 증가"로 내려왔고 한국에서 실증된 성과는 매출 폭증이 아니라 유효회원 +700명(이탈 방어)이다. 데이터 제공은 차별화에서 **위생 요인(hygiene factor)**으로 강등됐다.
- **연습장 오너가 벤더와 5년 계약으로 묶이는 구조.** 근거: $999/월은 head pro 재량 지출 범위로 설계됐고 스크린 CAPEX가 없다 → 스위칭 코스트가 낮아진다. 실제로 애리조나의 한 시설이 기존 테크에서 Inrange로 **전환**해 연환산 매출 +45%를 보고했다는 보도가 있다. 벤더 락인이 약해지면 시설의 협상력이 올라가고 벤더 ARPU는 더 내려간다.
- **시설이 골퍼 데이터를 독점하던 구조.** 근거: Toptracer Go·Trackman Range 모두 데이터의 종착지가 개인 스마트폰이다. 연습 기록이 시설 서버가 아니라 골퍼 계정에 쌓이면, 시설을 바꿔도 데이터가 따라간다 → 시설의 데이터 기반 리텐션 레버가 약해진다.

---

## 버티는 것

- **티라인의 물리적 길이와 그 위에 놓인 땅.** 근거(부동산·물리): Toptracer Go의 과금 단위 자체가 "티라인 50m"다. 소프트웨어 가격이 0에 수렴해도 200야드 이상 볼이 날아갈 공간, 방호망, 조명, 주차장은 복제 불가능하고 지대(地代)로 값이 매겨진다. Topgolf가 100개 매장에 520만 sq ft를 보유한 것이 바로 이 자산이고, PE가 산 것도 소프트웨어가 아니라 이 부동산 현금흐름이다.
- **센서가 측정할 수 없는 것 — 신체 접촉과 물리적 교정.** 근거(신체): 레인지 테크가 출력하는 것은 볼 데이터(볼스피드·런치앵글·스핀·커브)이고, Toptracer Go는 **볼 출발 이후의 궤적만** 잡는다. 그립 압력, 체중 이동의 촉감, 어깨 가동범위 제약, 통증 회피 패턴은 카메라 1대/50m로는 측정 대상이 아니다. Toptracer Coach가 스스로 정의한 해결 과제도 '측정'이 아니라 "학생이 수행하기 쉬운 벤치마크"와 "레슨 사이 과제 배정·책임 추적"이었다 — 즉 벤더도 사람이 하는 부분을 남겨뒀다.
- **시설의 안전·인허가·책임 구조.** 근거(법·자본): 한국 골프연습장업은 「체육시설의 설치·이용에 관한 법률」상 신고 체육시설업으로, 시설 기준과 안전관리 의무가 사업자에게 있다. 무인화가 진행되어도 안전 사고·시설 하자의 책임 주체는 사람인 사업자이고, 이 책임은 소프트웨어로 이관되지 않는다. 그래서 완전 무인은 심야 시간대 부분 무인(예: 23시~06시)으로 수렴한다.
- **볼과 잔디의 소모 — 물리적 재고 관리.** 근거(물리): 로봇이 볼을 회수해도 볼은 마모되고, 매트는 닳고, 필드는 다져진다. Relox가 자기 강점으로 "가벼운 중량(140kg)이 레인지 마모를 줄인다"를 내세우는 것 자체가 물리 손상이 상수라는 증거다. 이건 자본지출 주기(CAPEX cycle)로 남는다.
- **단체·기업 행사라는 인간 조직 수요.** 근거(인간관계·시간): Inrange는 여러 시설이 연간 기업행사 매출 $250,000를 초과했고 Inrange+ Teams는 이벤트당 300명 이상을 수용한다고 밝힌다. Topgolf 매출의 80%가 1~2베이 소비자 부문이라는 것은 역으로 20%가 단체라는 뜻이고, 이 20%가 시설의 마진을 만든다. 회사 워크숍, 접대, 동호회 — AI가 스윙을 봐준다고 없어지지 않는 수요다.
- **평일 낮·심야의 빈 타석이라는 시간 제약.** 근거(시간): 무인화 데이터가 그대로 증언한다 — 22시~06시 월평균 증분 매출이 269만~500만원이다. 즉 물리 타석은 하루 24시간 × 타석 수라는 절대 상한을 갖고, AI는 이 상한을 늘리지 못한다. 늘릴 수 있는 것은 가동률뿐이며, 그래서 2026년의 AI는 전부 가동률(revenue per bay-hour)로 향한다.

---

## 레슨프로 함의

1. **자기 홈 연습장의 센서 스펙과 데이터 접근 권한을 이번 주에 문서화하라.** 확인할 항목: (a) 볼트래킹 벤더와 모델명(Toptracer Range / Toptracer Go / Trackman Range / GDR / 없음) (b) 센서 개수 대 타석 수 (c) 데이터가 타석 모니터에만 남는지, 손님 폰 앱 계정에 남는지 (d) 코치가 학생 데이터를 열람할 수 있는 권한이 있는지(Toptracer Coach 같은 코치 콘솔 존재 여부). DOH가 Observation을 수집하는 첫 관문이 이 스펙이다. 스펙을 모르면 DOH의 입력 파이프라인 설계 자체가 불가능하다.
2. **월 $999(약 145만원)를 '내 레슨 사업의 도구 예산'으로 계산해두라.** Toptracer Go는 오너 결재 없이 head pro 재량으로 도입되도록 설계된 가격이다. 즉 **레슨프로 개인 또는 프로 몇 명이 공동으로 티라인 50m에 데이터 층을 깔 수 있는 시대**가 열렸다. 구체 행동: 자기 연습장 티라인 실측 길이를 재고, 50m 단위로 몇 대가 필요한지 계산하고, Toptracer 한국 유통 채널(EagleTry/나노테크 등으로 보이나 역할은 `미검증`)에 견적을 요청해 실제 원화 가격과 계약 조건(계약 기간, 해지 조항, 데이터 소유권)을 받아라. 견적서 1장이 이 축에 대한 어떤 리포트보다 값지다.
3. **볼 데이터가 상품이 아니라 무료 위생 요인이 됐다는 전제로 가격표를 다시 짜라.** 손님이 QR만 스캔하면 캐리·볼스피드·런치앵글·스핀·커브를 공짜로 본다. 따라서 "데이터를 읽어주는 레슨"은 3년 안에 값이 안 붙는다. 값이 붙는 것은 센서가 못 잡는 것 — 신체 가동범위 진단, 통증 회피 패턴, 그립·체중이동의 촉감 교정, 그리고 **볼 데이터의 해석과 처방 순서(Node→Cluster→Archetype)**다. DOH의 판매 단위를 '스윙 영상 피드백'에서 '진단서 + 처방 시퀀스'로 옮기는 근거가 이것이다.
4. **연습 과제 배정과 이행 추적을 유료 상품으로 명시적으로 분리해 팔아라.** Toptracer Coach가 스스로 정의한 두 과제가 "수행하기 쉬운 벤치마크 평가"와 "레슨 사이 연습 배정 + 책임 추적"이다. 즉 글로벌 1위 벤더도 이 부분을 소프트웨어로 완전히 대체하지 못하고 코치에게 남겼다. 구체 행동: 레슨 1회권 판매를 줄이고, "벤치마크 측정 → 4주 처방 → 재측정" 패키지로 묶어 재측정 시점을 캘린더에 강제로 박아라. 레인지 테크가 측정을 공짜로 해주므로 **재측정 원가가 0에 수렴하고 패키지 마진이 올라간다** — 이건 이 축의 변화가 레슨프로에게 주는 유일한 순수 이득이다.
5. **무인 시간대를 자기 영업 시간으로 편입하라.** 한국 데이터가 이미 나왔다: 22시~06시 무인 구간 월평균 매출 +269만~500만원, 인건비 -81%. 이 시간대에는 사람이 없으므로 **비대면 처방과 원격 리뷰만이 유일한 코칭 공급 형태**다. 구체 행동: 심야 무인 이용객을 대상으로 "무인 시간대 연습 → 다음날 오전 처방 리포트 발송" 상품을 만들고, 연습장 오너에게 심야 매출의 일정 비율(rev-share)을 제안하라. 오너는 심야 객단가를 올리고 프로는 시간을 팔지 않고 매출을 얻는다.
6. **실외 대형이 아니라 '무인 인도어 6~10타석'을 다음 3년의 주 무대로 가정하라.** 근거: 국내 Toptracer 침투는 53개소(전체 연습장 대비 3~4% 추정)로 실외 대형 상위권에 한정됐고, 골프존홀딩스 2025 실적(매출 -8.3%, 영업이익 -29.0%)은 스크린 CAPEX를 감당하는 인도어 모델이 한계에 왔음을 시사하며, Toptracer Go는 스크린 없는 저가 데이터 타석을 가능케 했다. 구체 행동: 소형 인도어 오너 3~5명에게 "스크린 대신 데이터 타석 + 무인 + DOH 리포트" 조합의 사업계획서를 들고 접근하라. 이 조합의 첫 표준 스택 설계자가 되는 것이 개인 코치로서 확보 가능한 가장 큰 포지션이다.
7. **AI가 붙는 곳이 스윙이 아니라 운영이라는 사실을 영업 무기로 쓰라.** Toptracer IQ는 스윙 코칭 AI가 아니라 예약·결제·고객행동 BI다. 즉 벤더는 오너에게 '가동률'을 팔고 있다. 레슨프로가 오너에게 팔아야 할 것도 같은 언어여야 한다 — "제 레슨 프로그램이 유효회원 이탈을 몇 명 막고, 평일 낮 타석 가동률을 몇 %p 올립니다". 고양CC의 유효회원 +700명이 그 언어의 벤치마크다.

---

## 미해결 질문

1. **Toptracer Go의 정확도와 커버리지 한계가 실제로 어디까지인가.** 카메라 1대로 50m 티라인을 커버할 때 티라인 양 끝단 타석의 추적 정확도, 저탄도 샷·짧은 웨지 샷의 검출률, 야간·우천·역광 조건의 성능이 공개 자료에 없다. 원문(toptracer.com/go 및 기술 스펙 시트) 확인 필요 — 이 세션에서는 egress 차단으로 실패. 만약 웨지 거리 정확도가 낮다면 '레슨 도구'로서의 가치는 제한되고 '엔터테인먼트 도구'로만 성립한다.
2. **Toptracer Go가 상위 제품 Toptracer Range를 얼마나 카니발라이즈하는가, 그리고 기존 5년 계약 시설은 어떻게 되는가.** 타석당 $200~250을 내고 있던 100타석 시설이 $999로 갈아탈 수 있는가(계약 조항), 아니면 Go는 신규·소형에만 판매되는가. 이 답에 따라 Toptracer의 매출이 확장인지 잠식인지 갈리고, 시설 오너의 재계약 협상 카드가 결정된다.
3. **Leonard Green 체제에서 Toptracer가 독립 사업으로 성장 투자를 받는가, 아니면 Topgolf 매장 지원 부서로 축소되는가.** 신임 CEO가 CEC Entertainment(Chuck E. Cheese) 출신이고 발표된 성장 계획이 피클볼·미니골프라는 점은 **Toptracer B2B가 우선순위에서 밀릴 위험**을 시사한다. PE 보유 5~7년 후 Toptracer가 별도 매각될 가능성(그리고 그 인수자가 Trackman인지 미디어 회사인지)이 이 층의 3년 뒤 구도를 좌우한다.
4. **QR→폰 퍼널의 실제 채택률이 몇 %인가.** 이 조사에서 확인 실패했다. Toptracer가 공개한 것은 "2025년 4,500만 시간 재생"(시설 전체 합계)뿐이고, **타석에 앉은 손님 중 몇 %가 실제로 QR을 스캔하고 앱을 여는지**에 대한 수치는 어느 벤더도 공개하지 않았다. 이 숫자가 30% 미만이면 '폰 기반 데이터 타석'의 사업 논리가 흔들리고, 타석 스크린이 다시 필수가 된다. 오너·프로가 직접 측정 가능한 지표(1일 QR 스캔 수 ÷ 1일 타석 이용 수)이므로 국내 시설 몇 곳에서 실측하는 것이 가장 빠른 검증 경로다.
5. **한국 실내 소형 연습장(6~10타석)에 스크린 없는 볼트래킹이 경제적으로 성립하는가.** 국내 인도어 매출은 스크린 게임 과금에 크게 의존하는데, 데이터만 있고 가상 라운드가 없는 타석에 한국 소비자가 지불할 의사가 있는지에 대한 데이터가 없다. 골프존 GDR PLUS 월 36만~48만원/타석 대비 Toptracer Go 월 약 145만원/50m의 실제 손익분기 타석수 계산이 필요하다.
6. **Inrange의 실제 자본 규모와 지속가능성.** 공개 조달액 $1.94M(Crunchbase)과 79개 시설 + 20개 시공이라는 규모가 정합하지 않는다. 비공개 라운드·부채·시설 선불금 구조 중 무엇으로 자금을 대는지 불명이며, 만약 자본이 얇다면 이 축에서 네 번째 실패 사례(앞선 CoachNow·Hudl Technique·Thriv 패턴)가 될 수 있다. 시설이 5년 계약을 맺기 전 반드시 확인해야 하는 항목이다.
7. **볼 회수 로봇의 실제 TCO와 한국 적용 가능성.** €39,500(약 6,300만원 추정)의 회수 기간은 대체되는 인건비에 달렸다. 한국 연습장의 볼 회수는 이미 자동 순환 시스템(실내)이나 소수 인력(실외)으로 운영되는 경우가 많아 유럽식 ROI가 그대로 적용될지 불확실하다. 국내 실외 연습장의 볼 회수 인건비 실측치가 필요하다.

---

## 출처

1. https://thegolfwire.com/toptracer-go-range-technology/ — Toptracer Go 출시 보도자료(월 $999, 카메라 1대 50m, QR→폰)
2. https://golfincmagazine.com/top-news/toptracer-go-launches-as-999-monthly-service-for-course-operators/ — Toptracer Go $999/월, 코스 운영자 대상 서비스로 규정
3. https://turfmatters.co.uk/toptracer-go-launches-at-999-month/ — Toptracer Go 가격 및 옵션 21인치 스크린 최대 9대
4. https://www.australiangolfdigest.com.au/toptracer-go-lowers-the-barrier-to-premium-range-technology/ — 호주 가격 AUD 1,699+GST, "하루 2버켓 회수" 계산, 설치 후 방문 30~50% 증가 주장
5. https://www.golfdom.com/toptracer-launches-toptracer-go-to-make-range-technology-and-data-accessible/ — Toptracer Go 출시(2026 PGA쇼)
6. https://thegolfwire.com/toptracer-iq-and-toptracer-go-lead-line-of-products-at-pga-show — Toptracer IQ(AI 내장 BI 플랫폼), Scott Blevins 사장/GM
7. https://www.yourniceshot.com/blogs/news/toptracer-real-cost-and-impact-for-golf-operators-and-pga-pros — Toptracer 타석당 월 $200~225, 대안 구조 $25,000 설치 + 연 $15,000 라이선스
8. https://golf.com/news/how-and-why-topgolf-may-be-coming-to-a-driving-range-near-you/ — 설치 무료 + 장비 리스 수익모델, 타석당 월 $225
9. https://www.prnewswire.com/news-releases/topgolf-callaway-brands-completes-sale-of-majority-stake-of-topgolf-to-leonard-green--partners-302652215.html — Topgolf+Toptracer 60% 매각 완료, $1.1B 밸류, 2026-01-01 발효, CALY 티커 변경
10. https://www.pehub.com/leonard-green-completes-buyout-of-topgolf-callaway-brands-topgolf-and-toptracer-biz-for-800m/ — 순현금 약 $800M
11. https://dallasinnovates.com/topgolf-callaway-brands-to-separate-four-years-after-2-6b-merger/ — 2021년 합병 $2.6B 대비 비교 기준
12. https://www.dmagazine.com/business-economy/2026/06/topgolf-ceo-david-mckillips-plan/ — 신임 CEO David McKillips(CEC Entertainment 출신), 매출 하락·감원·확장 계획
13. https://frontofficesports.com/topgolf-ceo-dishes-on-private-equity-owners-layoffs-and-expansion/ — 100+ 매장, 520만 sq ft, 신규 3~5개/년, 2027년 피클볼 최대 7개 지점, 미니골프 20→30
14. https://ir.callawaygolf.com/news-releases/news-release-details/topgolf-callaway-brands-announces-third-quarter-2025-results — Topgolf 2025 Q3 SVS +1%, 1~2베이 소비자 부문 연매출 80%
15. https://www.cnbc.com/2026/07/06/versant-to-buy-golf-simulator-company-full-swing.html — Versant의 Full Swing $530M 현금 인수(2026-07-06)
16. https://www.sportico.com/business/media/2026/versant-acquire-full-swing-golf-tech-bruin-1234937981/ — Bruin Capital 2021년 $160M 인수 → 5년 3배
17. https://en.sedaily.com/sports/2026/06/04/topgolfs-toptracer-tops-53-korean-driving-ranges-in-market — Toptracer 한국 53개 연습장(2018년 진입), 전 세계 1,450개·38개국
18. https://www.sedaily.com/article/20066312 — "무작정 골프샷 때리기는 가라, 스마트 연습이 뜬다": 고양CC 유효회원 +700명, 볼트래킹 확산
19. https://www.dailian.co.kr/news/view/1621637/ — 트랙맨 코리아 고양CC 108타석 전 타석 설치, 레이더 3대로 108타석 커버
20. https://golfdigest.co.kr/news/articleView.html?idxno=45745 — 트랙맨 레인지 국내 첫 공식 출시, 레이더 2~3대로 100타석+, 1호 대구 피닉스골프클럽
21. https://www.golfbusinessreview.com/p/inrange-revenue-per-bay — Inrange 타석 업리프트 1.2×/2.2×/3.0×, 애리조나 +45%, 일부 +500%, 기업행사 $250,000+
22. https://www.golfbusinessreview.com/p/inrange-world-tour-season-3-driving-range-business — Inrange World Tour 시즌3, 17개국 85+ 베뉴, 5/1 개막
23. https://www.firstcallgolf.com/industry-news/release/2025-11-17/inrange-strengthens-u-s-presence-with-four-new-partner-venues — Inrange 79개 시설 + 2026 상반기 20개 시공
24. https://www.crunchbase.com/organization/inrange-4b2b — Inrange 누적 조달 $1.94M, 투자자 목록(미검증, 재확인 필요)
25. https://golfbusinessnews.com/news/greenkeeping/husqvarna-partners-with-relox-robotics-to-expand-autonomous-golf-range-solutions/ — Husqvarna–Relox 파트너십, 2026 Q1 첫 인도
26. https://reloxrobotics.com/range-picker/ — Range Picker €39,500 ex-VAT, 일 6만 개, 140kg, 인력 시간 최대 100% 대체
27. https://www.echorobotics.com/en/rp-1250-professional-robotic-lawnmower.html — RP-1250: 24시간 15,000개, 45,000㎡
28. https://www.knoxbots.com/pik-r-x — Pik'r-X: 1회 순환 6,000개
29. https://powertee.com/driving-range/ — Power Tee 무초기투자 설치, 매출 15~45% 증가 주장
30. https://www.par2pro.com/blogs/news/increase-driving-range-revenue — Power Tee ROI 계산(연 +$16,600 → $97,600, 5년 $488,000)
31. https://www.businesspost.co.kr/BP?command=article_view&num=437400 — 골프존 GDR PLUS 렌탈 월 36만/45만/39만/48만원
32. https://kimcaddie.com/post/dr_price — 비전플러스 중고 1,300~1,400만원, 타석 풀세트 3,000만원+, 국내 연습장 약 1,500개
33. https://comp.fnguide.com/SVO2/asp/SVD_Main.asp?gicode=A121440 — 골프존홀딩스 2025 매출 -8.3%, 영업이익 -29.0%, 순이익 -44.9%
34. https://company.golfzon.com/M/GFZ/StartUp/Training_4.aspx — GDR 센서 2,000fps 듀얼 카메라, 타석 바닥 설치, 렌탈 모델
35. https://www.hankyung.com/article/2025052774371 — 골프존 AWS Bedrock 기반 AI 골프 코치(음성 실시간 피드백), 2025-05 AWS 서밋 서울
36. https://kimcaddie.com/post/2025-screengolf-auto-solution — 김캐디 무인 솔루션: 제휴점 100개소, 심야 월 500만원, 22~06시 +269만원, 인건비 -81%
37. https://www.smedaily.co.kr/news/articleView.html?idxno=280066 — 여의도 갤러리 골프 아카데미: 키오스크+출타석 제어, 매출 15~20% 상승, 스마트상점 기술보급사업
38. https://www.hankyung.com/article/202601137663i — 2026 창업 키워드 '무인', 예비창업자 32.6%가 성장성 1위
39. https://www.ngf.org/short-game/golfs-growth-era-the-road-to-50-million-golfers/ — NGF 2026: 오프코스 전용 1,900만, 총 4,810만, 여성 43%
40. https://thegolfwire.com/toptracer-154th-open — 제154회 디오픈 Toptracer 역대 최대 팬 액티베이션, 티박스 QR, Swing Zone 시뮬레이터 10대
41. https://thegolfwire.com/toptracer-coach — Toptracer Coach 출시(2023-05), 벤치마크 평가 + 레슨 사이 과제 배정 문제 정의
42. https://zen.golf/zen-golf-launches-integrated-trackman-solution-pgashow26/ — Zen Golf × Trackman iO, 화면 라이 연동 이동식 스윙 스테이지(2026 PGA쇼)
43. https://www.playbetter.com/blogs/golf-simulator-reviews/bushnell-launch-pro-circle-b-edition-review — Bushnell Launch Pro Circle B $2,499 + 연 $199 Silver
44. https://uneekor.com/blogs/blog/introducing-the-uneekor-studio-package:-one-system.-no-limits. — Uneekor AI Studio 번들 $5,999부터, AI Trainer 1년 포함
45. https://trugolf.com/blogs/news/the-demand-for-driving-range-tech-is-already-here — 레인지 테크 도입 시설의 볼당 20~30% 프리미엄, 체류시간 증가
46. https://www.golfpass.com/travel-advisor/articles/golf-driving-range-technology-wars-trackman-toptracer-inrange — Trackman(레이더) vs Toptracer(카메라) vs Inrange 구조 비교
47. https://www.mcst.go.kr/kor/s_policy/dept/deptView.jsp?pSeq=2115&pDataCD=0417000000&pType= — 문화체육관광부 '2025 전국 등록·신고 체육시설업 현황(2024년 말 기준)' 원자료(골프연습장업 개소 수 확인용, 이번 조사에서 수치 추출 실패)
48. https://www.khan.co.kr/article/202106061045001 — '폐업이 창업의 5배'는 2020년 데이터임을 확인하는 원 보도(연도 오용 방지용)
