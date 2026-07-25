"use client";

// ============================================================
// 관리자 — 신청 상세 + 피드백 작성 화면
// 1) 신청자가 보낸 영상/사진/글 확인
// 2) 분석 영상/사진 업로드 + 진단 글 작성
// 3) 저장 → 카카오 알림 보내기 (또는 링크 복사해서 직접 카톡)
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "@/components/icons";

type Chapter = { time: string; label: string };

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [request, setRequest] = useState<any>(null);
  const [sentFiles, setSentFiles] = useState<{ kind: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [diagnosis, setDiagnosis] = useState("");
  const [body, setBody] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fbVideos, setFbVideos] = useState<File[]>([]);
  const [fbPhotos, setFbPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [feedbackLink, setFeedbackLink] = useState("");

  const videoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: r } = await supabase
        .from("requests")
        .select("*, request_files(*), feedbacks(*)")
        .eq("id", id)
        .single();
      setRequest(r);
      if (r?.feedbacks) {
        setDiagnosis(r.feedbacks.diagnosis ?? "");
        setBody(r.feedbacks.body ?? "");
        setChapters(Array.isArray(r.feedbacks.chapters) ? r.feedbacks.chapters : []);
      }
      // 신청자가 보낸 파일을 볼 수 있는 임시 링크 만들기
      if (r?.request_files) {
        const signed = await Promise.all(
          r.request_files.map(async (f: any) => {
            const { data } = await supabase.storage.from("uploads").createSignedUrl(f.path, 3600);
            return { kind: f.kind, url: data?.signedUrl ?? "" };
          })
        );
        setSentFiles(signed.filter((f) => f.url));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveFeedback() {
    setSaving(true);
    setMessage("");
    try {
      // 1) 분석 영상/사진을 feedback 저장소에 업로드
      const uploaded: { kind: "video" | "photo"; path: string }[] = [];
      const all = [
        ...fbVideos.map((f) => ({ kind: "video" as const, file: f })),
        ...fbPhotos.map((f) => ({ kind: "photo" as const, file: f })),
      ];
      for (let i = 0; i < all.length; i++) {
        const { kind, file } = all[i];
        const ext = file.name.split(".").pop() || "bin";
        const path = `${id}/${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage
          .from("feedback")
          .upload(path, file, { contentType: file.type });
        if (error) throw new Error(`업로드 실패: ${error.message}`);
        uploaded.push({ kind, path });
      }

      // 2) 피드백 저장
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          diagnosis,
          body,
          chapters: chapters.filter((c) => c.time && c.label),
          files: uploaded,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setFbVideos([]);
      setFbPhotos([]);
      setFeedbackLink(`${window.location.origin}/f/${json.token}`);
      setMessage("피드백을 저장했어요! 이제 아래에서 알림을 보내주세요.");
    } catch (e: any) {
      setMessage(e.message || "저장에 실패했어요.");
    }
    setSaving(false);
  }

  async function notify() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      const json = await res.json();
      if (json.link) setFeedbackLink(json.link);
      setMessage(json.detail || (json.sent ? "알림톡을 보냈어요!" : "발송하지 못했어요."));
    } catch {
      setMessage("발송 요청에 실패했어요.");
    }
    setSaving(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(feedbackLink);
    setMessage("링크를 복사했어요! 카톡에 붙여넣어 보내주세요.");
  }

  if (loading) return <main className="phone" />;
  if (!request)
    return (
      <main className="phone">
        <div style={{ padding: "80px 24px" }}>
          <h1 className="title">신청을 찾을 수 없어요.</h1>
        </div>
      </main>
    );

  return (
    <main className="phone">
      <div className="page-header">
        <button className="back" onClick={() => router.push("/admin")}>
          <ChevronLeft />
        </button>
        <span className="htitle">{request.receipt_no}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 60px" }}>
        {/* 신청 내용 */}
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">연락처</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{request.phone || "-"}</span>
          </div>
          <hr className="info-divider" />
          <div className="info-row">
            <span className="info-label">고민</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              {request.concerns?.join(", ") || "-"}
            </span>
          </div>
          {request.note && (
            <>
              <hr className="info-divider" />
              <p style={{ fontSize: 14, color: "#4e5968", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {request.note}
              </p>
            </>
          )}
        </div>

        {/* 신청자가 보낸 자료 */}
        <div className="section-label" style={{ margin: "20px 0 10px" }}>
          받은 자료
        </div>
        <div className="sent-grid" style={{ marginBottom: 26 }}>
          {sentFiles.map((f, i) => (
            <div className="sent-item" key={i}>
              {f.kind === "video" ? (
                <video src={f.url} controls playsInline preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt="" />
              )}
            </div>
          ))}
        </div>

        {/* 피드백 작성 */}
        <div className="section-label" style={{ marginBottom: 10 }}>
          한 줄 진단 (알림톡에 표시)
        </div>
        <input
          className="input"
          placeholder="예) 플라잉 엘보 · 체중 이동 지연"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />

        <div className="section-label" style={{ margin: "20px 0 10px" }}>
          상세 피드백 글
        </div>
        <textarea
          className="note-area"
          style={{ height: 180 }}
          placeholder="스윙에 대한 자세한 진단과 연습 방법을 적어주세요."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="section-label" style={{ margin: "20px 0 10px" }}>
          영상 구간 표시 (선택)
        </div>
        {chapters.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              className="input"
              style={{ width: 90, padding: 12 }}
              placeholder="03:12"
              value={c.time}
              onChange={(e) => {
                const next = [...chapters];
                next[i] = { ...next[i], time: e.target.value };
                setChapters(next);
              }}
            />
            <input
              className="input"
              style={{ flex: 1, padding: 12 }}
              placeholder="백스윙 오른팔 각도 (선 그리기)"
              value={c.label}
              onChange={(e) => {
                const next = [...chapters];
                next[i] = { ...next[i], label: e.target.value };
                setChapters(next);
              }}
            />
            <button className="file-del" onClick={() => setChapters(chapters.filter((_, j) => j !== i))}>
              삭제
            </button>
          </div>
        ))}
        <button
          className="guide-link"
          style={{ color: "#3182f6", marginBottom: 20 }}
          onClick={() => setChapters([...chapters, { time: "", label: "" }])}
        >
          + 구간 추가
        </button>

        <input ref={videoRef} type="file" accept="video/*" multiple hidden
          onChange={(e) => { setFbVideos((p) => [...p, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
        <input ref={photoRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { setFbPhotos((p) => [...p, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button className="btn-secondary" onClick={() => videoRef.current?.click()}>
            분석 영상 추가 ({fbVideos.length})
          </button>
          <button className="btn-secondary" onClick={() => photoRef.current?.click()}>
            분석 사진 추가 ({fbPhotos.length})
          </button>
        </div>
        {[...fbVideos, ...fbPhotos].map((f, i) => (
          <div className="file-row" key={i}>
            <span className="file-name">{f.name}</span>
          </div>
        ))}

        <button className="btn-cta" style={{ marginTop: 16 }} onClick={saveFeedback} disabled={saving}>
          {saving ? "저장 중..." : "피드백 저장하기"}
        </button>

        {(request.status === "done" || feedbackLink) && (
          <>
            <button className="btn-primary" style={{ marginTop: 10 }} onClick={notify} disabled={saving}>
              💬 카카오 알림 보내기
            </button>
            {feedbackLink && (
              <button className="btn-secondary" style={{ marginTop: 10 }} onClick={copyLink}>
                피드백 링크 복사하기
              </button>
            )}
          </>
        )}

        {message && (
          <div className="notice-banner" style={{ marginTop: 14 }}>
            <span>ℹ️</span>
            <span style={{ wordBreak: "break-all" }}>
              {message}
              {feedbackLink && (
                <>
                  <br />
                  {feedbackLink}
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
