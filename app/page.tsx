// ============================================================
// 이도형 골프 — 개인 홈페이지 (베이지 톤)
// 혼자 유튜브하고 레슨하는 프로의 담백한 한 페이지.
// 인사 → 하는 일 → 피드백 소개 → 레슨 장소 → 가격 → FAQ → 마무리.
// ============================================================

import Link from "next/link";
import "./home.css";
import { SiteHeader, SiteFooter, CHANNELS, Icon, IC } from "@/components/site-chrome";

const PLACES = [
  { name: "서초 TPZ", type: "실내", addr: "서울 서초구 동산로2길 16, 2~4층" },
  { name: "판교 TPZ", type: "실내", addr: "경기 성남시 분당구 대왕판교로 660 A동 지하1층 127호" },
  { name: "양재 TPZ", type: "실내", addr: "서울 서초구 서초대로 264 서초법조타워 지하1층" },
  { name: "남영골프클럽", type: "실외", addr: "경기 용인시 수지구 고기로 49 남영골프연습장" },
  { name: "숏게임힐스", type: "숏게임", addr: "경기 용인시 처인구 모현읍 곡현로855번길 27" },
];

const PRICES = [
  {
    name: "온라인 스윙 피드백",
    desc: "영상을 보내주시면 화면에 그려가며 음성으로 설명한 분석 영상을 카카오톡으로 보내드려요.",
    cost: "첫 진단 무료",
  },
  {
    name: "정기 코칭",
    desc: "매달 스윙 코멘트와 연습 목표를 받으면서 꾸준히 관리받는 방식이에요.",
    cost: "월 39,000원",
  },
  {
    name: "오프라인 원포인트",
    desc: "서초 · 판교 · 양재 · 용인 연습장에서 직접 만나서 봐드려요. 시간은 채널로 문의해 주세요.",
    cost: "문의",
  },
];

const FAQS = [
  {
    q: "영상은 어떻게 찍어서 보내면 되나요?",
    a: "휴대폰으로 연습장에서 찍은 영상 그대로면 충분해요. 스윙 전체가 화면에 들어오게, 정면(공 뒤쪽)과 측면(타겟 라인)에서 한 개씩 찍어 보내주시면 제일 좋습니다. 한 각도만 보내주셔도 봐드려요.",
  },
  {
    q: "피드백은 언제, 어떻게 받나요?",
    a: "보통 다음 날까지 만들어서 카카오톡으로 링크를 보내드려요. 링크에서 분석 영상과 글을 30일간 볼 수 있습니다.",
  },
  {
    q: "AI가 분석해 주는 건가요?",
    a: "아니요, 제가 직접 봅니다. 영상을 프레임 단위로 돌려보면서 화면에 선을 긋고, 음성으로 설명하면서 녹화한 영상을 보내드려요.",
  },
  {
    q: "프로와 똑같이 스윙해야 하나요?",
    a: "그럴 필요 없어요. 체형과 유연성이 다르면 좋은 스윙도 다릅니다. 본인 몸에 맞는 방향을 찾아드리는 게 제 일이에요.",
  },
];

export default function HomePage() {
  return (
    <div className="hp">
      <SiteHeader />

      {/* ===== 인사 ===== */}
      <section className="hp-hi">
        <div className="hp-container hp-hi-grid">
          <div>
            <span className="hp-hi-hello">안녕하세요,</span>
            <h1 className="hp-h1">
              골프 가르치는
              <br />
              <u>이도형</u>입니다
            </h1>
            <p className="hp-hi-copy">
              유튜브에 스윙 이야기를 올리고, 연습장에서 레슨을 합니다. 스윙 영상을
              보내주시면 하나하나 그려가며 직접 보고 답장을 드려요. 거창한 건 없고,
              그게 제가 하는 전부입니다.
            </p>
            <div className="hp-hi-actions">
              <Link href="/request" className="hp-btn hp-btn-primary">
                스윙 영상 보내기 <Icon d={IC.chevR} size={13} sw={2.6} />
              </Link>
              <a
                className="hp-btn hp-btn-ghost"
                href="https://www.youtube.com/@Hyeong_golf"
                target="_blank"
                rel="noreferrer"
              >
                유튜브 보러가기
              </a>
            </div>
            <p className="hp-hi-cred">
              <b>KPGA 프로 · Class A 전문교습가</b> · 레슨 11년 차 · 온라인으로 봐드린
              스윙만 2,300개쯤 됩니다.
            </p>
          </div>
          <div>
            <div className="hp-photo">
              <div className="ph">
                <Icon d={IC.person} size={40} sw={1.4} />
                <span>프로필 사진 자리</span>
              </div>
              <div className="cap">연습장에서 만나요 — 이도형</div>
            </div>
            <a
              className="hp-yt"
              href="https://www.youtube.com/@Hyeong_golf"
              target="_blank"
              rel="noreferrer"
            >
              <span className="ic">
                <Icon d={IC.play} size={18} />
              </span>
              <span>
                <b>유튜브 · Hyeong_golf</b>
                <span>스윙 이야기와 레슨 영상을 올려요</span>
              </span>
              <span className="go">보러가기</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== 하는 일 ===== */}
      <section className="hp-band hp-section" id="about">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">하는 일</span>
            <h2 className="hp-h2">세 가지를 합니다</h2>
          </div>
          <div className="hp-do-grid">
            <div className="hp-do">
              <span className="ic">
                <Icon d={IC.play} size={18} />
              </span>
              <h3>유튜브</h3>
              <p>
                스윙에 대한 생각과 레슨 장면을 영상으로 올려요. 구독하고 보시면 피드백
                내용이 더 잘 이해되실 거예요.
              </p>
              <a
                className="more"
                href="https://www.youtube.com/@Hyeong_golf"
                target="_blank"
                rel="noreferrer"
              >
                채널 보러가기 <Icon d={IC.chevR} size={11} sw={2.6} />
              </a>
            </div>
            <div className="hp-do">
              <span className="ic">
                <Icon d={IC.pen} size={18} />
              </span>
              <h3>온라인 스윙 피드백</h3>
              <p>
                영상을 보내주시면 화면에 선을 그리고 음성으로 설명하면서, 고칠 것과
                유지할 것을 정리해 보내드려요.
              </p>
              <Link className="more" href="/request">
                영상 보내보기 <Icon d={IC.chevR} size={11} sw={2.6} />
              </Link>
            </div>
            <div className="hp-do">
              <span className="ic">
                <Icon d={IC.pin} size={18} />
              </span>
              <h3>레슨</h3>
              <p>
                서초 · 판교 · 양재 · 용인 연습장에서 레슨해요. 온라인으로 먼저 스윙을
                보여주시면 첫 레슨이 훨씬 빨라집니다.
              </p>
              <a className="more" href="#lesson">
                장소 확인하기 <Icon d={IC.chevR} size={11} sw={2.6} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 피드백 소개 ===== */}
      <section className="hp-section" id="feedback">
        <div className="hp-container hp-fb-grid">
          <div>
            <span className="hp-overline">스윙 피드백</span>
            <h2 className="hp-h2">
              영상 보내주시면,
              <br />
              이렇게 답장드려요
            </h2>
            <div className="hp-fb-list">
              <div className="hp-fb-row">
                <span className="no">하나.</span>
                <div>
                  <b>문제를 짚어드려요</b>
                  <span>예) 오른팔이 벌어져요 · 체중 이동이 늦어요 — 원인부터 순서대로.</span>
                </div>
              </div>
              <div className="hp-fb-row">
                <span className="no">둘.</span>
                <div>
                  <b>그려가며 설명한 영상을 드려요</b>
                  <span>화면에 선 긋고 음성으로 설명하면서 녹화한 분석 영상이에요.</span>
                </div>
              </div>
              <div className="hp-fb-row">
                <span className="no">셋.</span>
                <div>
                  <b>연습 방법을 알려드려요</b>
                  <span>예) 타월 드릴 하루 10분 · 8할 스윙 20개 — 다음 영상에서 확인해드려요.</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="hp-note">
              <p>
                “백스윙 팔꿈치가 가장 큰 원인이에요. 타월 드릴부터 잡아보고, 2주 뒤
                영상 주시면 비교해드릴게요.”
              </p>
              <footer>실제로 보내드린 답장 중에서</footer>
            </div>
            <div className="hp-note">
              <p>
                “지난주보다 톱에서 왼팔 각이 훨씬 잘 버텨줘요. 이번 주는 하체 리드
                느낌으로 8할 스윙 20개만 천천히.”
              </p>
              <footer>정기 코칭 회원분께 보낸 코멘트</footer>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 레슨 장소 ===== */}
      <section className="hp-band hp-section" id="lesson">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">레슨</span>
            <h2 className="hp-h2">여기서 레슨해요</h2>
            <p className="hp-lead">
              요일마다 있는 곳이 달라서, 예약은 유튜브나 인스타그램으로 편하게 물어봐
              주세요.
            </p>
          </div>
          <div className="hp-place-list">
            {PLACES.map((p) => (
              <div className="hp-place" key={p.name}>
                <b>{p.name}</b>
                <span className="type">{p.type}</span>
                <span className="addr">{p.addr}</span>
                <a
                  className="map"
                  href={`https://map.naver.com/p/search/${encodeURIComponent(p.addr)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  지도
                </a>
              </div>
            ))}
          </div>
          <p className="hp-place-note">
            처음 오시는 분은 온라인으로 스윙 영상을 먼저 보내주시면, 만나기 전에 미리
            봐두고 시작할 수 있어서 좋아요.
          </p>
        </div>
      </section>

      {/* ===== 가격 ===== */}
      <section className="hp-section" id="price">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">가격</span>
            <h2 className="hp-h2">복잡하지 않아요</h2>
          </div>
          <div className="hp-price">
            {PRICES.map((p) => (
              <div className="hp-price-row" key={p.name}>
                <span className="name">{p.name}</span>
                <span className="desc">{p.desc}</span>
                <span className="cost">{p.cost}</span>
              </div>
            ))}
          </div>
          <p className="hp-plan-note">
            결제 페이지는 준비 중이라, 지금은 스윙 영상을 보내주시면 답장과 함께 안내를
            드리고 있어요. 혼자 분석해보고 싶은 분은{" "}
            <Link href="/swing" style={{ fontWeight: 700, color: "var(--accent)" }}>
              셀프 분석 도구
            </Link>
            도 무료로 쓰실 수 있습니다.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="hp-band hp-section" id="faq">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">자주 묻는 질문</span>
            <h2 className="hp-h2">궁금해하시는 것들</h2>
          </div>
          <div className="hp-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <span className="chev">
                    <Icon d={IC.chevD} size={16} sw={2.2} />
                  </span>
                </summary>
                <div className="a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 마무리 ===== */}
      <section className="hp-final">
        <div className="hp-container">
          <h2>
            오늘 친 스윙,
            <br />
            한번 보내보세요
          </h2>
          <p>
            영상 하나 올리는 데 3분이면 돼요. 잘 치는 영상이 아니어도 괜찮습니다 —
            안 되는 스윙일수록 봐드릴 게 많아요.
          </p>
          <div className="actions">
            <Link href="/request" className="hp-btn hp-btn-primary">
              스윙 영상 보내기 <Icon d={IC.chevR} size={13} sw={2.6} />
            </Link>
          </div>
          <div className="sns">
            {CHANNELS.map((ch) => (
              <a key={ch.name} href={ch.url} target="_blank" rel="noreferrer">
                {ch.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
