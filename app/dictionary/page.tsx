import type { Metadata } from "next";
import "../home.css";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import DictionaryBrowser from "./DictionaryBrowser";

export const metadata: Metadata = {
  title: "골프 사전 — NEXT SWING",
  description: "스윙 동작부터 구질·미스샷, 장비까지 — 레슨에서 자주 쓰는 골프 용어를 쉽게 풀어드려요.",
};

export default function DictionaryPage() {
  return (
    <div className="hp">
      <SiteHeader />
      <section className="hp-section" style={{ paddingTop: 64 }}>
        <div className="hp-container">
          <div className="hp-section-head">
            <span className="hp-overline">Golf Dictionary</span>
            <h2 className="hp-h2">골프 사전</h2>
            <p className="hp-lead">
              피드백과 레슨에서 자주 나오는 용어들이에요. 프로의 코멘트를 읽다가 모르는
              말이 나오면 여기서 찾아보세요.
            </p>
          </div>
          <DictionaryBrowser />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
