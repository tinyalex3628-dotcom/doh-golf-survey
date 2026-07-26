// ============================================================
// 이도형 골프 — 홈페이지 공용 요소 (헤더 · 푸터 · 아이콘)
// 랜딩(/)과 골프 사전(/dictionary)이 함께 쓴다.
// ============================================================

import Link from "next/link";

export const NAV = [
  { href: "/#feedback", label: "스윙 피드백" },
  { href: "/#lesson", label: "레슨" },
  { href: "/#price", label: "가격" },
  { href: "/#faq", label: "자주 묻는 질문" },
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
  play: "M8 5.5v13l11-6.5z",
  pen: "M12 19h9M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4z",
  chat: "M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V7A2.5 2.5 0 0 1 7.5 4.5h10A2.5 2.5 0 0 1 20 7z",
  pin: "M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  upload: "M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c.9-3.8 3.9-6 7.5-6s6.6 2.2 7.5 6",
};

export function SiteHeader() {
  return (
    <header className="hp-header">
      <div className="hp-container hp-header-in">
        <Link href="/" className="hp-brand">
          <span className="hp-brand-mark">道</span>
          <span className="hp-brand-word">이도형 골프</span>
        </Link>
        <nav className="hp-nav">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hp-header-cta">
          <a
            className="hp-btn hp-btn-ghost hp-btn-sm"
            href="https://www.youtube.com/@Hyeong_golf"
            target="_blank"
            rel="noreferrer"
          >
            유튜브
          </a>
          <Link href="/request" className="hp-btn hp-btn-primary hp-btn-sm">
            스윙 영상 보내기
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
              <span className="hp-brand-mark">道</span>
              <span className="hp-brand-word">이도형 골프</span>
            </div>
            <p>
              KPGA Class A 전문교습가. 유튜브에 스윙 이야기를 올리고, 영상을 보내주시면
              직접 보고 답장을 드립니다.
            </p>
          </div>
          <div>
            <h4>메뉴</h4>
            <ul>
              <li>
                <Link href="/request">스윙 영상 보내기</Link>
              </li>
              <li>
                <Link href="/swing">셀프 분석 도구</Link>
              </li>
              <li>
                <Link href="/dictionary">골프 사전</Link>
              </li>
              <li>
                <Link href="/coach">소개</Link>
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
                <Link href="/admin">관리자</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="hp-footer-bottom">
          <span>© 2026 이도형 골프</span>
          <span>피드백 링크는 보내드린 날부터 30일간 열람할 수 있어요</span>
        </div>
      </div>
    </footer>
  );
}
