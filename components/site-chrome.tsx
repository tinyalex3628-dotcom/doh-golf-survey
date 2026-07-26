// ============================================================
// NEXT SWING 홈페이지 공용 요소 — 헤더 · 푸터 · 아이콘
// 랜딩(/)과 골프 사전(/dictionary) 등 브랜드 페이지가 함께 쓴다.
// ============================================================

import Link from "next/link";

export const NAV = [
  { href: "/#flow", label: "진단 과정" },
  { href: "/#tools", label: "분석 도구" },
  { href: "/#coach", label: "프로 소개" },
  { href: "/#lesson", label: "오프라인 레슨" },
  { href: "/#plans", label: "구독 안내" },
  { href: "/dictionary", label: "골프 사전" },
];

export const CHANNELS = [
  { name: "YouTube", url: "https://www.youtube.com/@Hyeong_golf" },
  { name: "Instagram", url: "https://instagram.com/hyeong_golf" },
  { name: "네이버 블로그", url: "https://blog.naver.com/alex3628" },
];

export function Icon({ d, size = 18, sw = 1.7 }: { d: string; size?: number; sw?: number }) {
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

export const IC = {
  chevR: "m9 5 7 7-7 7",
  chevD: "m6 9 6 6 6-6",
  video: "M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM15 11l6-3v8l-6-3",
  compare:
    "M3 6.5A1.5 1.5 0 0 1 4.5 5H10v14H4.5A1.5 1.5 0 0 1 3 17.5zM21 6.5A1.5 1.5 0 0 0 19.5 5H14v14h5.5a1.5 1.5 0 0 0 1.5-1.5z",
  pen: "M12 19h9M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4z",
  mic: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4",
  chat: "M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V7A2.5 2.5 0 0 1 7.5 4.5h10A2.5 2.5 0 0 1 20 7z",
  pin: "M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  upload: "M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
};

export function SiteHeader() {
  return (
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
  );
}

export function SiteFooter() {
  return (
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
                <Link href="/dictionary">골프 사전</Link>
              </li>
              <li>
                <Link href="/coach">담당 코치 소개</Link>
              </li>
              <li>
                <a href="/#plans">구독 안내</a>
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
  );
}
