import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXT SWING — 프로가 직접 보는 스윙 진단",
  description:
    "KPGA Class A 이도형 프로가 화면 필기와 음성으로 직접 분석하는 스윙 진단. 영상을 올리면 카카오톡으로 피드백 링크를 보내드려요.",
  openGraph: {
    title: "NEXT SWING — 프로가 직접 보는 스윙 진단",
    description:
      "AI가 아니라 프로가 직접 피드백합니다. 스윙 영상 업로드부터 분석 도구, 오프라인 레슨까지.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
