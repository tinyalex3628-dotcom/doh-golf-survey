"use client";

// ============================================================
// 관리자 — 신청 상세 + 피드백 작성 (PC 기준 2단 레이아웃)
// 왼쪽: 회원이 보낸 영상을 크게 보면서
// 오른쪽: 피드백을 작성해서 저장 → 알림 발송
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Chapter = { time: string; label: string };
type Asset = { kind: string; url: string; name: string };

const SPEEDS = [0.25, 0.5, 1];

// 자주 쓰는 진단 문구 (클릭하면 진단 칸에 들어감)
const QUICK_DIAGNOSIS = [
  "플라잉 엘보",
  "체중 이동 지연",
  "얼리 익스텐션",
  "오버 더 톱",
  "스웨이",
  "헤드업",
  "그립 과도한 스트롱",
  "백스윙 과다",
];

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [request, setRequest] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [diagnosis, setDiagnosis] = useState("");
  const [body, setBody] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [fbVideos, setFbVideos] = useState<File[]>([]);
  const [fbPhotos, setFbPhotos] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"ok" | "err" | "">("");
  const [feedbackLink, setFeedbackLink] = useState("");

  const playerRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const videos = useMemo(() => assets.filter((a) => a.kind === "video"), [assets]);
  const photos = useMemo(() => assets.filter((a) => a.kind === "photo"), [assets]);
  const activeVideo = videos[activeIdx];

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
      if (r?.request_files) {
        const signed = await Promise.all(
          r.request_files.map(async (f: any) => {
            const { data } = await supabase.storage.from("uploads").createSignedUrl(f.path, 3600);
            return {
              kind: f.kind,
              url: data?.signedUrl ?? "",
              name: f.path.split("/").pop() ?? "",
            };
          })
        );
        setAssets(signed.filter((f) => f.url));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 재생 속도 적용 (스윙은 느리게 봐야 보이니까)
  useEffect(() => {
    if (playerRef.current) playerRef.current.playbackRate = speed;
  }, [speed, activeIdx]);

  function say(text: string, kind: "ok" | "err" = "ok") {
    setMessage(text);
    setMessageKind(kind);
  }

  // 현재 영상 재생 위치를 03:12 형식으로 가져와서 구간 추가
  function addChapterAtCurrentTime() {
    const t = playerRef.current?.currentTime ?? 0;
    const mm = String(Math.floor(t / 60)).padStart(2, "0");
    const ss = String(Math.floor(t % 60)).padStart(2, "0");
    setChapters((prev) => [...prev, { time: `${mm}:${ss}`, label: "" }]);
  }

  function addFiles(files: FileList | File[] | null) {
    if (!files) return;
    const arr = Array.from(files);
    setFbVideos((p) => [...p, ...arr.filter((f) => f.type.startsWith("video/"))]);
    setFbPhotos((p) => [...p, ...arr.filter((f) => f.type.startsWith("image/"))]);
  }

  async function saveFeedback() {
    setSaving(true);
    setMessage("");
    try {
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
      setRequest((r: any) => ({ ...r, status: "done" }));
      say("피드백을 저장했어요. 이제 알림을 보내면 됩니다.");
    } catch (e: any) {
      say(e.message || "저장에 실패했어요.", "err");
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
      say(json.detail || (json.sent ? "알림톡을 보냈어요." : "발송하지 못했어요."), json.sent ? "ok" : "err");
    } catch {
      say("발송 요청에 실패했어요.", "err");
    }
    setSaving(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(feedbackLink);
    say("링크를 복사했어요. 카톡에 붙여넣어 보내주세요.");
  }

  if (loading) return <main className="desk" />;
  if (!request)
    return (
      <main className="desk">
        <h1 className="desk-title">신청을 찾을 수 없어요.</h1>
      </main>
    );

  const created = new Date(request.created_at);

  return (
    <main className="desk">
      <div className="desk-header">
        <div>
          <Link href="/admin" className="cell-muted" style={{ textDecoration: "none" }}>
            ← 신청 목록
          </Link>
          <h1 className="desk-title" style={{ marginTop: 6 }}>
            {request.receipt_no}
          </h1>
          <p className="desk-sub">
            {created.getFullYear()}. {created.getMonth() + 1}. {created.getDate()}{" "}
            {String(created.getHours()).padStart(2, "0")}:
            {String(created.getMinutes()).padStart(2, "0")} 신청 · 영상 {videos.length}개
            {photos.length > 0 ? ` · 사진 ${photos.length}장` : ""}
          </p>
        </div>
        <span className={`badge ${request.status === "done" ? "done" : "received"}`}>
          {request.status === "done" ? "피드백 완료" : "작업 대기"}
        </span>
      </div>

      <div className="detail-grid">
        {/* ===== 왼쪽: 회원이 보낸 자료 ===== */}
        <div>
          <div className="panel">
            <div className="panel-title">회원이 보낸 영상</div>

            {videos.length > 1 && (
              <div className="player-tabs">
                {videos.map((_, i) => (
                  <button
                    key={i}
                    className={`player-tab ${activeIdx === i ? "on" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    영상 {i + 1}
                  </button>
                ))}
              </div>
            )}

            {activeVideo ? (
              <>
                <video
                  ref={playerRef}
                  key={activeVideo.url}
                  src={activeVideo.url}
                  className="big-player"
                  controls
                  playsInline
                  preload="metadata"
                />
                <div className="speed-row">
                  <span className="cell-muted" style={{ marginRight: 2 }}>
                    재생 속도
                  </span>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      className={`speed-btn ${speed === s ? "on" : ""}`}
                      onClick={() => setSpeed(s)}
                    >
                      {s}배속
                    </button>
                  ))}
                  <button className="speed-btn" onClick={addChapterAtCurrentTime}>
                    ⏱ 지금 시점을 구간으로 추가
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-box">영상이 없어요.</div>
            )}
          </div>

          {photos.length > 0 && (
            <div className="panel">
              <div className="panel-title">회원이 보낸 사진</div>
              <div className="asset-grid">
                {photos.map((p, i) => (
                  <button className="asset-item" key={i} onClick={() => setLightbox(p.url)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`사진 ${i + 1}`} />
                  </button>
                ))}
              </div>
              <p className="field-hint">사진을 누르면 크게 볼 수 있어요.</p>
            </div>
          )}

          <div className="panel">
            <div className="panel-title">신청 내용</div>
            <div className="kv-grid">
              <span className="kv-key">연락처</span>
              <span className="kv-val">{request.phone || "-"}</span>

              <span className="kv-key">고민</span>
              <span className="kv-val">
                {request.concerns?.length > 0 ? (
                  request.concerns.map((c: string) => (
                    <span className="concern-tag" key={c}>
                      {c}
                    </span>
                  ))
                ) : (
                  "-"
                )}
              </span>

              <span className="kv-key">남긴 말</span>
              <span className="kv-val">{request.note || "-"}</span>
            </div>
          </div>
        </div>

        {/* ===== 오른쪽: 피드백 작성 ===== */}
        <div className="panel-sticky">
          <div className="panel">
            <div className="panel-title">피드백 작성</div>

            <div className="form-block">
              <label className="field-label">한 줄 진단</label>
              <input
                className="desk-input"
                placeholder="예) 플라잉 엘보 · 체중 이동 지연"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <div className="snippet-row">
                {QUICK_DIAGNOSIS.map((q) => (
                  <button
                    key={q}
                    className="snippet-btn"
                    onClick={() =>
                      setDiagnosis((d) => (d ? `${d} · ${q}` : q))
                    }
                  >
                    + {q}
                  </button>
                ))}
              </div>
              <p className="field-hint">카카오 알림톡에 그대로 들어가는 문구예요.</p>
            </div>

            <div className="form-block">
              <label className="field-label">상세 피드백 글</label>
              <textarea
                className="desk-textarea"
                placeholder={
                  "회원님께 전할 진단과 연습 방법을 적어주세요.\n\n예)\n1. 백스윙에서 오른팔이 몸에서 떨어집니다.\n2. 임팩트 때 체중이 왼발로 넘어가지 않습니다.\n\n이번 주 연습:\n- 타월 드릴 10분\n- 스텝 드릴 20회"
                }
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <p className="field-hint">{body.length}자 · 줄바꿈 그대로 보입니다.</p>
            </div>

            <div className="form-block">
              <label className="field-label">영상 구간 표시 (선택)</label>
              {chapters.map((c, i) => (
                <div className="chapter-edit" key={i}>
                  <input
                    className="desk-input"
                    style={{ width: 96, flexShrink: 0 }}
                    placeholder="03:12"
                    value={c.time}
                    onChange={(e) => {
                      const next = [...chapters];
                      next[i] = { ...next[i], time: e.target.value };
                      setChapters(next);
                    }}
                  />
                  <input
                    className="desk-input"
                    placeholder="백스윙 오른팔 각도 (선 그리기)"
                    value={c.label}
                    onChange={(e) => {
                      const next = [...chapters];
                      next[i] = { ...next[i], label: e.target.value };
                      setChapters(next);
                    }}
                  />
                  <button
                    className="file-del"
                    onClick={() => setChapters(chapters.filter((_, j) => j !== i))}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                className="snippet-btn"
                style={{ marginTop: 4 }}
                onClick={() => setChapters([...chapters, { time: "", label: "" }])}
              >
                + 구간 추가
              </button>
              <p className="field-hint">
                왼쪽 영상에서 <b>⏱ 지금 시점을 구간으로 추가</b>를 누르면 시간이 자동으로 들어가요.
              </p>
            </div>

            <div className="form-block">
              <label className="field-label">분석 영상 · 사진 첨부</label>
              <input
                ref={fileRef}
                type="file"
                accept="video/*,image/*"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div
                className={`dropzone ${dragOver ? "drag" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <div className="dropzone-main">파일을 여기로 끌어다 놓으세요</div>
                <div className="dropzone-sub">
                  클릭해서 선택할 수도 있어요 · 화면 녹화 영상, 캡처 사진 모두 가능
                </div>
              </div>
              {[...fbVideos, ...fbPhotos].map((f, i) => (
                <div className="upload-item" key={i}>
                  <span>{f.type.startsWith("video/") ? "🎬" : "🖼"}</span>
                  <span className="grow">{f.name}</span>
                  <span className="cell-muted">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button
                    className="file-del"
                    onClick={() => {
                      if (f.type.startsWith("video/"))
                        setFbVideos((p) => p.filter((x) => x !== f));
                      else setFbPhotos((p) => p.filter((x) => x !== f));
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div className="action-bar">
              <button className="btn-desk-primary" onClick={saveFeedback} disabled={saving}>
                {saving ? "저장 중..." : "피드백 저장하기"}
              </button>
              {(request.status === "done" || feedbackLink) && (
                <>
                  <button className="btn-kakao-send" onClick={notify} disabled={saving}>
                    💬 카카오 알림 보내기
                  </button>
                  {feedbackLink && (
                    <button className="btn-desk-ghost" onClick={copyLink}>
                      링크 복사
                    </button>
                  )}
                </>
              )}
            </div>

            {message && (
              <p className={`save-note ${messageKind}`} style={{ marginTop: 12 }}>
                {message}
              </p>
            )}

            {feedbackLink && (
              <div className="link-box">
                회원이 보게 될 주소
                <br />
                <a href={feedbackLink} target="_blank" rel="noreferrer" style={{ color: "#3182f6" }}>
                  {feedbackLink}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="확대 보기" />
        </div>
      )}
    </main>
  );
}
