// ============================================================
// 프로용 스윙분석 스튜디오 — PC에서 쓰는 작업 도구
// 관리자 화면에서 회원 영상을 ?src= 로 넘겨받아 바로 열 수 있고,
// 드로잉/비교/싱크 과정을 마이크 음성과 함께 녹화해
// 미디어 레슨 영상(webm)으로 다운로드한다.
// ============================================================

import SwingAnalyzer from "@/components/swing/SwingAnalyzer";
import "@/components/swing/swing.css";

export const metadata = {
  title: "스윙분석 스튜디오 — NEXT 골프",
};

export default function StudioPage({
  searchParams,
}: {
  searchParams?: { src?: string; src2?: string };
}) {
  return (
    <SwingAnalyzer
      variant="pro"
      initialUrls={[searchParams?.src ?? null, searchParams?.src2 ?? null]}
    />
  );
}
