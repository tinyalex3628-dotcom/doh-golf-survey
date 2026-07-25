import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { makeEta, maskPhone } from "@/lib/helpers";
import { CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DonePage({ params }: { params: { receipt: string } }) {
  const supabase = createClient();
  const { data: request } = await supabase
    .from("requests")
    .select("*, request_files(*)")
    .eq("receipt_no", decodeURIComponent(params.receipt))
    .single();

  const videoCount =
    request?.request_files?.filter((f: any) => f.kind === "video").length ?? 0;
  const photoCount =
    request?.request_files?.filter((f: any) => f.kind === "photo").length ?? 0;

  return (
    <main className="phone">
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 24px 150px" }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 999,
            background: "#e7f0ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <CheckIcon />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#191f28", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: 10 }}>
          신청이 접수됐어요.
        </h1>
        <p style={{ fontSize: 15, color: "#6b7684", lineHeight: 1.55, marginBottom: 30 }}>
          이도형 프로가 영상을 확인한 뒤
          <br />
          <b style={{ color: "#4e5968", fontWeight: 700 }}>카카오톡으로 피드백 링크</b>를 보내드려요.
        </p>

        <div className="info-card">
          <div className="info-row">
            <span className="info-label">접수번호</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#191f28" }}>
              {request?.receipt_no ?? decodeURIComponent(params.receipt)}
            </span>
          </div>
          <hr className="info-divider" />
          <div className="info-row">
            <span className="info-label">보낸 자료</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#4e5968" }}>
              영상 {videoCount}개{photoCount > 0 ? ` · 사진 ${photoCount}장` : ""}
            </span>
          </div>
          <hr className="info-divider" />
          <div className="info-row">
            <span className="info-label">예상 도착</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#3182f6" }}>
              {makeEta(request ? new Date(request.created_at) : new Date())}
            </span>
          </div>
        </div>

        <div className="notice-banner">
          <span>💬</span>
          <span>
            알림톡은 {request?.phone ? maskPhone(request.phone) : "등록하신"} 번호로 발송돼요.
            링크는 30일간 열람할 수 있어요.
          </span>
        </div>
      </div>

      <div className="bottom-bar">
        <a
          href="https://center-pf.kakao.com"
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <button className="btn-cta" style={{ fontSize: 17, marginBottom: 9 }}>
            알림 설정 확인하기
          </button>
        </a>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn-secondary">홈으로</button>
        </Link>
      </div>
    </main>
  );
}
