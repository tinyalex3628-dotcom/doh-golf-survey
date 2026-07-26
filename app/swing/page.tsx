// ============================================================
// 회원용 스윙분석 — 모바일 화면에서 직접 분석하는 도구
// 갤러리에서 영상을 불러와 선을 긋고, 프로 영상과 나란히 비교한다.
// ============================================================

import SwingAnalyzer from "@/components/swing/SwingAnalyzer";
import "@/components/swing/swing.css";

export const metadata = {
  title: "스윙분석 — NEXT SWING",
  description: "내 스윙 영상에 직접 선을 긋고, 두 영상을 나란히 비교 분석해보세요.",
};

export default function SwingPage() {
  return <SwingAnalyzer variant="member" />;
}
