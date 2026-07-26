"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@/components/icons";

const CAREER = [
  "KPGA 프로 / KPGA Class A 전문교습가",
  "레슨 경력 11년",
  "온라인 스윙 교정 누적 피드백 2,300건",
  "주니어·성인 아마추어 레슨 전문",
];

const CHANNELS = [
  { name: "Instagram", url: "https://instagram.com/hyeong_golf", emoji: "📷", bg: "#fdeef4" },
  { name: "YouTube", url: "https://www.youtube.com/@Hyeong_golf", emoji: "▶️", bg: "#ffeceb" },
  { name: "Blog", url: "https://blog.naver.com/alex3628", emoji: "✍️", bg: "#e9f7ec" },
];

export default function CoachPage() {
  const router = useRouter();

  return (
    <main className="phone">
      <div className="page-header">
        <button className="back" onClick={() => router.back()}>
          <ChevronLeft />
        </button>
        <span className="htitle">담당 코치</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 40px" }}>
        {/* 프로필 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 999,
              background: "#f2f4f6",
              border: "1.5px solid #e5e8eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#b0b8c1",
              flexShrink: 0,
            }}
          >
            프로필 사진
          </div>
          <div>
            <div className="overline">NEXT CERTIFIED COACH</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#191f28", letterSpacing: "-0.02em", margin: "4px 0" }}>
              이도형 프로
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7684" }}>
              KPGA 프로 · Class A 전문교습가
            </div>
          </div>
        </div>

        {/* 경력 */}
        <div style={{ fontSize: 13, fontWeight: 800, color: "#8b95a1", letterSpacing: "0.04em", marginBottom: 10 }}>
          경력
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
          {CAREER.map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--blue)", flexShrink: 0 }} />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: "#4e5968", lineHeight: 1.45 }}>{c}</span>
            </div>
          ))}
        </div>

        {/* 채널 */}
        <div style={{ fontSize: 13, fontWeight: 800, color: "#8b95a1", letterSpacing: "0.04em", marginBottom: 10 }}>
          채널
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CHANNELS.map((ch) => (
            <a key={ch.name} className="link-row" href={ch.url} target="_blank" rel="noreferrer">
              <span className="link-tile" style={{ background: ch.bg }}>
                {ch.emoji}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="link-name" style={{ display: "block" }}>
                  {ch.name}
                </span>
                <span className="link-url" style={{ display: "block" }}>
                  {ch.url}
                </span>
              </span>
              <ChevronRight size={16} />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
