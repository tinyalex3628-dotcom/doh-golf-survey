// ============================================================
// NEXT SWING — PC 홈페이지 (랜딩)
// 디자인 핸드오프 32화면(NEXT SWING 모바일 앱)의 톤을
// 데스크톱 웹으로 옮긴 브랜드 홈. 신청(/request)·분석 도구
// (/swing, /studio)·프로 소개·레슨·구독 안내를 한 페이지에 담는다.
// ============================================================

import Link from "next/link";
import "./home.css";

const NAV = [
  { href: "#flow", label: "진단 과정" },
  { href: "#feedback", label: "피드백 미리보기" },
  { href: "#tools", label: "스윙 분석 도구" },
  { href: "#coach", label: "프로 소개" },
  { href: "#lesson", label: "오프라인 레슨" },
  { href: "#plans", label: "구독 안내" },
];

const CHANNELS = [
  { name: "YouTube", url: "https://www.youtube.com/@Hyeong_golf" },
  { name: "Instagram", url: "https://instagram.com/hyeong_golf" },
  { name: "네이버 블로그", url: "https://blog.naver.com/alex3628" },
];

const CAREER: { k: string; v: string }[] = [
  { k: "자격", v: "KPGA 프로 · KPGA Class A 전문교습가" },
  { k: "경력", v: "레슨 경력 11년" },
  { k: "피드백", v: "온라인 스윙 교정 누적 피드백 2,300건" },
  { k: "전문", v: "주니어 · 성인 아마추어 레슨 전문" },
  { k: "레슨", v: "서초 · 판교 · 양재 · 용인 5개 지점 오프라인 레슨" },
];

const LOCATIONS = [
  { name: "서초 TPZ", type: "실내", addr: "서울 서초구 동산로2길 16, 2~4층" },
  { name: "판교 TPZ", type: "실내", addr: "경기 성남시 분당구 대왕판교로 660 A동 지하1층 127호" },
  { name: "양재 TPZ", type: "실내", addr: "서울 서초구 서초대로 264 서초법조타워 지하1층" },
  { name: "남영골프클럽", type: "실외 · 인도어", addr: "경기 용인시 수지구 고기로 49 남영골프연습장" },
  { name: "숏게임힐스", type: "야외 · 숏게임", addr: "경기 용인시 처인구 모현읍 곡현로855번길 27" },
];

const PLANS = [
  {
    name: "Basic",
    price: "19,000",
    desc: "혼자 연습하며 가볍게 관리받고 싶은 분",
    hot: false,
    items: ["AI 분석 · 스윙 갤러리 · 프로 스윙 열람", "월 2회 스윙 코멘트"],
  },
  {
    name: "Coaching",
    price: "39,000",
    desc: "꾸준히 관리받고 싶은 분에게",
    hot: true,
    items: ["월 4회 스윙 코멘트", "매주 연습 목표 제공", "매월 원포인트 레슨 10% 할인권"],
  },
  {
    name: "Elite",
    price: "99,000",
    desc: "제대로 바꾸고 싶은 분을 위한 밀착 관리",
    hot: false,
    items: [
      "매월 회원 맞춤형 영상레슨 제공",
      "월 8회 스윙 코멘트",
      "매월 원포인트 레슨 30% 할인권",
      "가입 즉시 정기권 20% 쿠폰 증정",
    ],
  },
];

const FAQS = [
  {
    q: "프로와 똑같이 스윙해야 하나요?",
    a: "모든 골퍼가 프로와 같은 스윙을 해야 하는 것은 아닙니다. 체형, 유연성, 운동능력, 신체 조건에 따라 최적의 스윙은 달라질 수 있어요. 그래서 설문과 영상으로 회원님의 몸에 맞는 방향을 먼저 찾고, 그 기준으로 피드백을 드립니다.",
  },
  {
    q: "AI가 분석하는 건가요?",
    a: "아니요. 보조 도구로 AI 분석을 제공하긴 하지만, 진단의 중심은 이도형 프로가 영상을 직접 보고 화면에 필기하며 음성으로 설명하는 피드백입니다. 궁금한 점은 사람이 답합니다.",
  },
  {
    q: "피드백은 언제, 어떻게 받나요?",
    a: "신청하면 프로가 영상을 확인한 뒤 보통 다음 날까지 피드백을 완성합니다. 완성되면 카카오톡으로 전용 링크를 보내드리고, 링크에서 분석 영상·진단 글·사진을 30일간 열람할 수 있어요.",
  },
  {
    q: "영상은 어떻게 찍어야 하나요?",
    a: "정면과 측면, 두 각도를 함께 올리면 골반·어깨 회전까지 정확하게 볼 수 있어요. 스윙 전체가 프레임에 들어오게, 정면은 공 뒤쪽에서, 측면은 타겟 라인에서 촬영해 주세요. 한 각도만 올려도 분석은 가능합니다.",
  },
  {
    q: "스윙 분석 도구는 무료인가요?",
    a: "네. 브라우저에서 바로 열리는 분석 도구는 회원가입 없이 무료로 쓸 수 있어요. 내 영상에 선을 긋고, 프레임 단위로 움직여 보고, 두 영상을 나란히 비교할 수 있습니다.",
  },
];

/* ---------- 작은 SVG 아이콘 ---------- */
function Icon({ d, size = 18, sw = 1.7 }: { d: string; size?: number; sw?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size }}
    >
      <path d={d} />
    </svg>
  );
}

const IC = {
  chevR: "m9 5 7 7-7 7",
  chevD: "m6 9 6 6 6-6",
  video: "M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM15 11l6-3v8l-6-3",
  compare: "M3 6.5A1.5 1.5 0 0 1 4.5 5H10v14H4.5A1.5 1.5 0 0 1 3 17.5zM21 6.5A1.5 1.5 0 0 0 19.5 5H14v14h5.5a1.5 1.5 0 0 0 1.5-1.5z",
  pen: "M12 19h9M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4z",
  mic: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4",
  chat: "M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V7A2.5 2.5 0 0 1 7.5 4.5h10A2.5 2.5 0 0 1 20 7z",
  pin: "M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  upload: "M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3",
};

export default function HomePage() {
  return (
    <div className="hp">
      {/* ===== 헤더 ===== */}
      <header className="hp-header">
        <div className="hp-container hp-header-in">
          <Link href="/" className="hp-brand">
            <span className="hp-brand-mark">NS</span>
            <span className="hp-brand-word">NEXT SWING</span>
          </Link>
          <nav className="hp-nav">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hp-header-cta">
            <Link href="/swing" className="hp-btn hp-btn-ghost hp-btn-sm">
              분석 도구
            </Link>
            <Link href="/request" className="hp-btn hp-btn-primary hp-btn-sm">
              스윙 진단 신청
            </Link>
          </div>
        </div>
      </header>

      {/* ===== 히어로 ===== */}
      <section className="hp-hero">
        <div className="hp-container hp-hero-grid">
          <div>
            <span className="hp-hero-kicker">
              <span className="dot">PRO</span>
              KPGA Class A · 이도형 프로가 직접 봅니다
            </span>
            <h1 className="hp-h1">
              AI가 아니라,
              <br />
              <em>프로가 직접 보는</em>
              <br />
              스윙 진단
            </h1>
            <p className="hp-hero-copy">
              스윙 영상을 올리면 이도형 프로가 화면에 선을 그리고 음성으로 설명하는
              분석 레슨 영상을 만들어 카카오톡으로 보내드려요. 연습장에서 혼자
              고민하던 스윙, 이제 전문가의 눈으로 확인하세요.
            </p>
            <div className="hp-hero-actions">
              <Link href="/request" className="hp-btn hp-btn-primary">
                스윙 진단 신청하기 <Icon d={IC.chevR} size={13} sw={2.6} />
              </Link>
              <a href="#tools" className="hp-btn hp-btn-ghost">
                분석 도구 둘러보기
              </a>
            </div>
            <div className="hp-hero-stats">
              <div className="hp-stat">
                <b>11년</b>
                <span>레슨 경력</span>
              </div>
              <div className="hp-stat">
                <b>2,300건</b>
                <span>누적 온라인 피드백</span>
              </div>
              <div className="hp-stat">
                <b>5곳</b>
                <span>오프라인 레슨 지점</span>
              </div>
              <div className="hp-stat">
                <b>Class A</b>
                <span>KPGA 전문교습가</span>
              </div>
            </div>
          </div>

          {/* 피드백 목업 */}
          <div className="hp-hero-visual">
            <div className="hp-mock">
              <div className="hp-mock-head">
                <div>
                  <div className="t1">SWING ANALYSIS · 화면 필기 + 음성</div>
                  <div className="t2">이도형 프로의 스윙 분석 레슨</div>
                </div>
                <span className="hp-mock-badge">12:24</span>
              </div>
              <div className="hp-mock-video">
                <svg className="lines" viewBox="0 0 400 250" preserveAspectRatio="none">
                  <line x1="118" y1="228" x2="252" y2="22" stroke="#ffe9a8" strokeWidth="2" />
                  <line x1="118" y1="228" x2="322" y2="120" stroke="#8fd3a8" strokeWidth="2" strokeDasharray="7 6" />
                  <path d="M164 158 A 82 82 0 0 1 236 178" stroke="#ffe9a8" strokeWidth="1.6" fill="none" />
                  <circle cx="118" cy="228" r="4" fill="#ffe9a8" />
                </svg>
                <span className="hp-mock-tag">P4 · 임팩트</span>
                <span className="hp-mock-angle">32°</span>
                <span className="hp-mock-play">
                  <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 15, height: 15 }}>
                    <path d="M9.5 7.4v9.2l7.5-4.6z" />
                  </svg>
                </span>
                <span className="hp-mock-time">0:02 / 0:06</span>
              </div>
              <div className="hp-mock-chapters">
                {[
                  ["00:00", "전체 스윙 흐름 리뷰"],
                  ["03:12", "백스윙 오른팔 각도"],
                  ["06:40", "체중 이동 타이밍"],
                  ["11:20", "2주 연습 루틴 안내"],
                ].map(([ts, label]) => (
                  <div className="hp-mock-chapter" key={ts}>
                    <span className="ts">{ts}</span>
                    <span className="label">{label}</span>
                    <span style={{ marginLeft: "auto", color: "#bdb6a6", display: "flex" }}>
                      <Icon d={IC.chevR} size={12} sw={2.2} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hp-float-note">
              <span className="ic">
                <Icon d={IC.chat} size={16} />
              </span>
              <span>
                <b>카카오톡으로 피드백 도착</b>
                <span>전용 링크에서 30일간 열람할 수 있어요</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 진단 과정 ===== */}
      <section className="hp-band hp-section" id="flow">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">How it works</span>
            <h2 className="hp-h2">진단은 이렇게 진행돼요</h2>
            <p className="hp-lead">
              복잡한 준비 없이, 연습장에서 찍은 영상 그대로 시작할 수 있습니다.
            </p>
          </div>
          <div className="hp-steps">
            <div className="hp-step">
              <span className="num">1</span>
              <h3>스윙 영상 올리고 신청</h3>
              <p>
                카카오로 로그인하고 영상(최대 3개)과 사진을 올려주세요. 방향성·비거리·슬라이스
                같은 고민을 선택하면 피드백이 더 정확해져요.
              </p>
              <span className="meta">
                <Icon d={IC.upload} size={14} /> 정면 · 측면을 함께 올리면 더 좋아요
              </span>
            </div>
            <div className="hp-step">
              <span className="num">2</span>
              <h3>프로가 직접 분석</h3>
              <p>
                이도형 프로가 영상을 프레임 단위로 확인하고, 화면에 선을 그리며 음성으로
                설명하는 분석 레슨 영상을 만듭니다.
              </p>
              <span className="meta">
                <Icon d={IC.pen} size={14} /> 화면 필기 + 음성 해설
              </span>
            </div>
            <div className="hp-step">
              <span className="num">3</span>
              <h3>카카오톡으로 피드백 도착</h3>
              <p>
                분석 영상·한 줄 진단·상세 글·구간별 설명이 담긴 전용 링크가 카카오톡으로
                도착해요. 링크는 30일간 열람할 수 있습니다.
              </p>
              <span className="meta">
                <Icon d={IC.chat} size={14} /> 보통 다음 날까지 도착
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 피드백 미리보기 ===== */}
      <section className="hp-section" id="feedback">
        <div className="hp-container hp-feedback-grid">
          <div>
            <span className="hp-overline">Pro Feedback</span>
            <h2 className="hp-h2">
              한 번의 피드백에
              <br />
              이만큼 담깁니다
            </h2>
            <p className="hp-lead">
              막연한 칭찬이나 한 줄 답변이 아니라, 지금 스윙에서 고칠 것과 유지할 것을
              구간별로 짚어드려요. 아래는 실제 피드백 구성 예시입니다.
            </p>
            <div className="hp-checklist">
              <div className="hp-check">
                <span className="no">01</span>
                <span>
                  <b>이번에 짚어준 문제 정리</b>
                  <span>예) 플라잉 엘보(오른팔 벌어짐) · 체중 이동 지연 · 임팩트 시 상체 열림</span>
                </span>
              </div>
              <div className="hp-check">
                <span className="no">02</span>
                <span>
                  <b>구간별 설명이 달린 분석 영상</b>
                  <span>필요한 구간으로 바로 이동하며 몇 번이고 다시 볼 수 있어요</span>
                </span>
              </div>
              <div className="hp-check">
                <span className="no">03</span>
                <span>
                  <b>이번 달 연습 루틴 처방</b>
                  <span>예) 타월 드릴 하루 10분 · 8할 스윙 20개 반복 · 2주 뒤 재촬영</span>
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="hp-quote">
              <p>
                “백스윙 팔꿈치가 가장 큰 원인이에요. 타월 드릴부터 잡아보고, 상체 정렬은
                영상에서 구간별로 확인해 주세요. 2주 뒤 영상 주시면 비교해드릴게요.”
              </p>
              <footer>실제 피드백 코멘트 중 — 이도형 프로</footer>
            </div>
            <div className="hp-quote" style={{ background: "#fffdf9", color: "#1d2420", border: "1px solid #e4ded2", boxShadow: "none" }}>
              <p style={{ color: "#3d4540" }}>
                “지난주보다 톱에서 왼팔 각이 훨씬 잘 버텨줘요. 이번 주는 하체 리드부터
                시작한다는 느낌으로, 8할 스윙으로 20개만 천천히 반복해 보세요.”
              </p>
              <footer style={{ color: "#8a8375" }}>정기 코칭 회원 코멘트 중 — 이도형 프로</footer>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 스윙 분석 도구 ===== */}
      <section className="hp-band hp-section" id="tools">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">Swing Analysis Tools</span>
            <h2 className="hp-h2">
              브라우저에서 바로 쓰는
              <br />
              스윙 분석 도구
            </h2>
            <p className="hp-lead">
              설치도 회원가입도 필요 없어요. 내 영상을 불러와 선을 긋고, 프레임 단위로
              돌려 보고, 두 영상을 나란히 비교할 수 있습니다.
            </p>
          </div>
          <div className="hp-tools-grid">
            <div className="hp-tool">
              <span className="ic">
                <Icon d={IC.video} />
              </span>
              <h3>단독 분석</h3>
              <p>영상을 프레임 단위로 움직이며 실선·점선·원·각도를 그려 자세를 확인해요.</p>
              <div className="hp-pchips">
                {["P1", "P2", "P4", "P7"].map((p) => (
                  <span className="hp-pchip" key={p}>
                    {p}
                  </span>
                ))}
                <span className="hp-pchip">…</span>
              </div>
            </div>
            <div className="hp-tool">
              <span className="ic">
                <Icon d={IC.compare} />
              </span>
              <h3>내 스윙끼리 비교</h3>
              <p>지난달 스윙과 오늘 스윙을 나란히 놓고 프레임을 동기화해 변화를 확인해요.</p>
            </div>
            <div className="hp-tool">
              <span className="ic">
                <Icon d={IC.pen} />
              </span>
              <h3>프로와 비교</h3>
              <p>프로 스윙 영상과 내 스윙을 같은 구간(P1–P10)으로 맞춰 차이를 배워요.</p>
            </div>
            <div className="hp-tool">
              <span className="ic">
                <Icon d={IC.mic} />
              </span>
              <h3>레슨 스튜디오 (PC)</h3>
              <p>화면 필기와 음성을 함께 녹화해 레슨 영상으로 저장하는 프로용 작업 공간이에요.</p>
            </div>
          </div>
          <div className="hp-tools-cta">
            <div className="t">
              <b>지금 브라우저에서 바로 열어보세요</b>
              <span>영상 파일 하나만 있으면 됩니다. 모바일은 분석 도구, PC는 스튜디오가 잘 맞아요.</span>
            </div>
            <div className="b">
              <Link href="/swing" className="hp-btn hp-btn-light">
                스윙 분석 도구 열기
              </Link>
              <Link href="/studio" className="hp-btn hp-btn-outline-light">
                PC 스튜디오 열기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 프로 소개 ===== */}
      <section className="hp-section" id="coach">
        <div className="hp-container hp-coach-grid">
          <div className="hp-coach-card">
            <div className="hp-coach-photo">
              <span className="avatar">李</span>
              <span>KPGA PROFESSIONAL</span>
            </div>
            <div className="hp-coach-name">
              <b>이도형 프로</b>
              <span>KPGA PRO · Class A 전문교습가</span>
            </div>
            <div className="hp-sns-row">
              {CHANNELS.map((ch) => (
                <a key={ch.name} className="hp-sns" href={ch.url} target="_blank" rel="noreferrer">
                  {ch.name} <Icon d={IC.chevR} size={11} sw={2.4} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <span className="hp-overline">Coach</span>
            <h2 className="hp-h2">
              당신의 스윙을 봐줄
              <br />
              단 한 사람
            </h2>
            <p className="hp-lead">
              NEXT SWING의 모든 피드백은 이도형 프로가 처음부터 끝까지 직접 봅니다.
              담당이 계속 바뀌는 레슨과 달리, 지난 스윙의 변화까지 기억하는 코칭을
              받을 수 있어요.
            </p>
            <div className="hp-career">
              {CAREER.map((c) => (
                <div className="hp-career-row" key={c.k}>
                  <span className="k">{c.k}</span>
                  <span className="v">{c.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 오프라인 레슨 ===== */}
      <section className="hp-band hp-section" id="lesson">
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">Offline Lesson</span>
            <h2 className="hp-h2">오프라인 레슨은 5개 지점에서</h2>
            <p className="hp-lead">
              온라인 피드백으로 시작하고, 필요하면 가까운 지점에서 이도형 프로에게 직접
              원포인트 레슨을 받아보세요.
            </p>
          </div>
          <div className="hp-loc-grid">
            {LOCATIONS.map((l) => (
              <div className="hp-loc" key={l.name}>
                <div className="top">
                  <b>{l.name}</b>
                  <span className="type">{l.type}</span>
                </div>
                <p>{l.addr}</p>
                <a
                  className="map"
                  href={`https://map.naver.com/p/search/${encodeURIComponent(l.addr)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon d={IC.pin} size={13} /> 지도에서 보기
                </a>
              </div>
            ))}
            <div className="hp-loc" style={{ background: "#21402f", border: "none", color: "#fff", justifyContent: "center" }}>
              <b style={{ fontSize: 17, lineHeight: 1.5 }}>
                레슨 예약은
                <br />
                채널로 문의해 주세요
              </b>
              <p style={{ color: "rgba(255,255,255,.65)" }}>
                유튜브 · 인스타그램 DM 또는 블로그로 편하게 연락 주시면 가능한 시간을
                안내해 드려요.
              </p>
              <a
                className="map"
                style={{ color: "#cfe3d5" }}
                href="https://instagram.com/hyeong_golf"
                target="_blank"
                rel="noreferrer"
              >
                예약 문의하기 <Icon d={IC.chevR} size={12} sw={2.4} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 구독 안내 ===== */}
      <section className="hp-section" id="plans">
        <div className="hp-container">
          <div className="hp-section-head" style={{ textAlign: "center", margin: "0 auto 44px" }}>
            <span className="hp-overline">Membership</span>
            <h2 className="hp-h2">꾸준히 관리받고 싶다면, 구독</h2>
            <p className="hp-lead">
              1회 진단으로 시작해 보고, 마음에 들면 매달 코멘트와 연습 목표를 받아보세요.
            </p>
          </div>
          <div className="hp-plans">
            {PLANS.map((p) => (
              <div className={`hp-plan ${p.hot ? "hot" : ""}`} key={p.name}>
                {p.hot && <span className="flag">가장 많이 선택</span>}
                <span className="name">{p.name}</span>
                <div className="price">
                  <b>{p.price}원</b>
                  <span>/ 월</span>
                </div>
                <span className="desc">{p.desc}</span>
                <ul>
                  {p.items.map((it) => (
                    <li key={it}>
                      <Icon d={IC.check} size={14} sw={2.6} />
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="cta">
                  <Link
                    href="/request"
                    className={`hp-btn ${p.hot ? "hp-btn-primary" : "hp-btn-ghost"}`}
                    style={{ width: "100%" }}
                  >
                    진단부터 시작하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="hp-plan-note">
            구독 결제는 준비 중이에요. 지금은 스윙 진단을 신청하시면 피드백과 함께 가입
            안내를 보내드립니다.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="hp-band hp-section" id="faq">
        <div className="hp-container">
          <div className="hp-section-head" style={{ textAlign: "center", margin: "0 auto 40px" }}>
            <span className="hp-overline">FAQ</span>
            <h2 className="hp-h2">자주 묻는 질문</h2>
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

      {/* ===== 마지막 CTA ===== */}
      <section className="hp-final">
        <div className="hp-container">
          <h2>
            오늘 친 스윙,
            <br />
            프로에게 보여주세요
          </h2>
          <p>
            영상 하나 올리는 데 3분이면 충분해요. 혼자 유튜브를 뒤지며 고민하는 것보다,
            내 스윙을 직접 본 프로의 한마디가 빠릅니다.
          </p>
          <div className="actions">
            <Link href="/request" className="hp-btn hp-btn-light">
              스윙 진단 신청하기 <Icon d={IC.chevR} size={13} sw={2.6} />
            </Link>
            <Link href="/swing" className="hp-btn hp-btn-outline-light">
              먼저 분석 도구 써보기
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 푸터 ===== */}
      <footer className="hp-footer">
        <div className="hp-container">
          <div className="hp-footer-grid">
            <div className="about">
              <div className="hp-brand">
                <span className="hp-brand-mark">NS</span>
                <span className="hp-brand-word">NEXT SWING</span>
              </div>
              <p>
                KPGA Class A 이도형 프로의 온라인 스윙 진단과 코칭. 화면 필기와 음성으로
                설명하는 분석 레슨 영상을 카카오톡으로 받아보세요.
              </p>
            </div>
            <div>
              <h4>서비스</h4>
              <ul>
                <li>
                  <Link href="/request">스윙 진단 신청</Link>
                </li>
                <li>
                  <Link href="/swing">스윙 분석 도구</Link>
                </li>
                <li>
                  <Link href="/studio">레슨 스튜디오 (PC)</Link>
                </li>
                <li>
                  <Link href="/coach">담당 코치 소개</Link>
                </li>
                <li>
                  <a href="#plans">구독 안내</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>채널</h4>
              <ul>
                {CHANNELS.map((ch) => (
                  <li key={ch.name}>
                    <a href={ch.url} target="_blank" rel="noreferrer">
                      {ch.name}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/admin">관리자 (프로 전용)</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2026 NEXT SWING · 이도형 프로</span>
            <span>피드백 링크는 발송일로부터 30일간 열람할 수 있어요</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
