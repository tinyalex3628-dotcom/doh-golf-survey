import { createAdminClient } from "@/lib/supabase/admin";
import { expireDateLabel, isExpired } from "@/lib/helpers";

export const dynamic = "force-dynamic";

// ============================================================
// 피드백 열람 페이지 — 카톡으로 받은 링크를 누르면 여기로 옵니다.
// 로그인 없이, 링크(토큰)만 알면 30일간 볼 수 있어요.
// ============================================================
export default async function FeedbackViewPage({ params }: { params: { token: string } }) {
  const admin = createAdminClient();

  const { data: feedback } = await admin
    .from("feedbacks")
    .select("*, feedback_files(*), requests(*, request_files(*))")
    .eq("token", params.token)
    .single();

  if (!feedback) {
    return (
      <main className="phone">
        <div style={{ padding: "80px 24px" }}>
          <h1 className="title">링크를 찾을 수 없어요.</h1>
          <p className="subcopy">주소가 정확한지 확인해주세요.</p>
        </div>
      </main>
    );
  }

  if (isExpired(feedback.created_at)) {
    return (
      <main className="phone">
        <div style={{ padding: "80px 24px" }}>
          <h1 className="title">열람 기한이 지났어요.</h1>
          <p className="subcopy">피드백 링크는 30일간 열람할 수 있어요.</p>
        </div>
      </main>
    );
  }

  const request = feedback.requests;

  // 파일들을 볼 수 있는 임시 링크(서명 URL, 1시간짜리)를 만들어요.
  async function sign(bucket: string, path: string) {
    const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  }

  const fbVideos = await Promise.all(
    (feedback.feedback_files ?? [])
      .filter((f: any) => f.kind === "video")
      .map(async (f: any) => await sign("feedback", f.path))
  );
  const fbPhotos = await Promise.all(
    (feedback.feedback_files ?? [])
      .filter((f: any) => f.kind === "photo")
      .map(async (f: any) => await sign("feedback", f.path))
  );
  const sentFiles = await Promise.all(
    (request?.request_files ?? []).map(async (f: any) => ({
      kind: f.kind,
      url: await sign("uploads", f.path),
    }))
  );

  const created = new Date(feedback.created_at);
  const videoCount = (request?.request_files ?? []).filter((f: any) => f.kind === "video").length;
  const photoCount = (request?.request_files ?? []).filter((f: any) => f.kind === "photo").length;
  const chapters: { time: string; label: string }[] = Array.isArray(feedback.chapters)
    ? feedback.chapters
    : [];

  return (
    <main className="phone">
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 150px" }}>
        <div className="overline" style={{ marginBottom: 6 }}>
          NEXT CERTIFIED COACH · 이도형 프로
        </div>
        <h1 className="title" style={{ marginBottom: 4 }}>
          {created.getMonth() + 1}월 {created.getDate()}일 스윙 피드백
        </h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8b95a1", marginBottom: 20 }}>
          영상 {videoCount}개 · 사진 {photoCount}장
          {feedback.diagnosis ? ` · ${feedback.diagnosis}` : ""}
        </p>

        {/* 분석 영상 */}
        {fbVideos.filter(Boolean).map((url, i) => (
          <div className="fb-video-card" key={i}>
            <video src={url!} controls playsInline preload="metadata" />
            <div className="fb-video-caption">
              <div style={{ fontSize: 15, fontWeight: 800, color: "#191f28" }}>
                스윙 분석 영상 {fbVideos.length > 1 ? i + 1 : "(음성 해설)"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#8b95a1", marginTop: 3 }}>
                회원님 영상에 선을 그려 설명했어요
              </div>
            </div>
          </div>
        ))}

        {/* 챕터 (타임스탬프) */}
        {chapters.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {chapters.map((c, i) => (
              <div className="chapter-row" key={i}>
                <span className="chapter-time">{c.time}</span>
                <span className="chapter-label">{c.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* 분석 사진 */}
        {fbPhotos.filter(Boolean).length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: 10 }}>
              분석 사진
            </div>
            <div className="sent-grid" style={{ marginBottom: 20 }}>
              {fbPhotos.filter(Boolean).map((url, i) => (
                <div className="sent-item" key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url!} alt={`분석 사진 ${i + 1}`} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 프로 진단 글 */}
        {feedback.body && (
          <div className="info-card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#191f28", marginBottom: 8 }}>
              프로 진단
            </div>
            <p style={{ fontSize: 14.5, fontWeight: 500, color: "#4e5968", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {feedback.body}
            </p>
          </div>
        )}

        {/* 내가 보낸 자료 */}
        <div className="section-label" style={{ marginBottom: 10 }}>
          내가 보낸 자료
        </div>
        <div className="sent-grid">
          {sentFiles
            .filter((f) => f.url)
            .map((f, i) => (
              <div className="sent-item" key={i}>
                {f.kind === "video" ? (
                  <video src={f.url!} controls playsInline preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url!} alt={`보낸 자료 ${i + 1}`} />
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="bottom-bar">
        <a href="/" style={{ textDecoration: "none" }}>
          <button className="btn-cta">2주 뒤 영상 다시 보내기</button>
        </a>
        <p className="caption" style={{ textAlign: "center", marginTop: 10 }}>
          링크 열람 기한 {expireDateLabel(feedback.created_at)}
        </p>
      </div>
    </main>
  );
}
