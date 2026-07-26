import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이도형 골프 — 스윙 피드백 & 레슨",
  description:
    "KPGA Class A 이도형 프로. 스윙 영상을 보내주시면 직접 보고 그려가며 답장드려요. 레슨은 서초·판교·양재·용인에서 합니다.",
  openGraph: {
    title: "이도형 골프 — 스윙 피드백 & 레슨",
    description:
      "스윙 영상을 보내주시면 직접 보고 답장드려요. 유튜브와 레슨, 온라인 스윙 피드백.",
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
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
