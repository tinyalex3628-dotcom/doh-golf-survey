"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, ChevronRight, VideoIcon, ImageIcon } from "@/components/icons";

const CONCERN_CHIPS = [
  "방향성",
  "비거리",
  "슬라이스",
  "훅",
  "뒤땅",
  "탑핑",
  "생크",
  "아이언",
  "드라이버",
];

export default function RequestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const [videos, setVideos] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPromptVisible, setPhotoPromptVisible] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [guideSheetOpen, setGuideSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(Boolean(data.user));
      setCheckingAuth(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loginWithKakao() {
    // 카카오 앱에는 "닉네임"만 동의 항목으로 등록돼 있어서,
    // 이메일/프로필사진까지 요청하면 카카오가 KOE205 에러로 거부합니다.
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "profile_nickname",
      },
    });
  }

  function addVideos(files: FileList | null) {
    if (!files) return;
    const next = [...videos, ...Array.from(files)].slice(0, 3);
    setVideos(next);
    if (next.length > 0) setPhotoPromptVisible(true);
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 2));
  }

  function toggleConcern(c: string) {
    setSelectedConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function submit() {
    if (videos.length === 0) {
      setError("스윙 영상을 1개 이상 올려주세요");
      return;
    }
    if (phone.replace(/[^0-9]/g, "").length < 10) {
      setError("피드백 알림을 받을 휴대폰 번호를 입력해주세요");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("로그인이 필요해요.");

      // 1) 영상/사진을 저장소에 업로드 (내 전용 폴더에)
      const uploaded: { kind: "video" | "photo"; path: string }[] = [];
      const allFiles: { kind: "video" | "photo"; file: File }[] = [
        ...videos.map((f) => ({ kind: "video" as const, file: f })),
        ...photos.map((f) => ({ kind: "photo" as const, file: f })),
      ];
      for (let i = 0; i < allFiles.length; i++) {
        const { kind, file } = allFiles[i];
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("uploads")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw new Error(`업로드 실패: ${upErr.message}`);
        uploaded.push({ kind, path });
      }

      // 2) 신청서 저장
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concerns: selectedConcerns,
          note,
          phone,
          files: uploaded,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "신청에 실패했어요.");

      // 3) 접수 완료 화면으로 (뒤로가기로 폼에 못 돌아오게 replace)
      router.replace(`/done/${json.receiptNo}`);
    } catch (e: any) {
      setError(e.message || "문제가 생겼어요. 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return <main className="phone" />;
  }

  // ---------- 로그인 전 화면 ----------
  if (!loggedIn) {
    return (
      <main className="phone">
        <div className="scroll-body" style={{ paddingTop: 80 }}>
          <h1 className="title">
            안녕하세요! 👋
            <br />
            NEXT 골프입니다.
          </h1>
          <p className="subcopy">
            AI가 아니라
            <br />
            프로가 직접 피드백합니다.
          </p>
          <div className="coach-card" style={{ cursor: "default" }}>
            <div className="coach-badge">
              <ShieldCheck />
            </div>
            <div className="coach-card-text">
              <span className="overline">NEXT CERTIFIED</span>
              <span className="coach-card-name">
                KPGA 프로
                <br />
                KPGA Class A 전문교습가
              </span>
            </div>
          </div>
        </div>
        <div className="bottom-bar">
          <button className="btn-kakao" onClick={loginWithKakao}>
            💬 카카오로 시작하기
          </button>
          <div className="benefits">
            <span>✓ 프로가 직접 확인</span>
            <span>✓ 맞춤 피드백 제공</span>
            <span>✓ 카카오톡으로 알림</span>
          </div>
        </div>
      </main>
    );
  }

  // ---------- 신청 화면 ----------
  return (
    <main className="phone">
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: "33%" }} />
        </div>
      </div>

      <div className="scroll-body">
        <h1 className="title">
          안녕하세요! 👋
          <br />
          스윙 영상을 올려주세요.
        </h1>
        <p className="subcopy">
          AI가 아니라
          <br />
          프로가 직접 피드백합니다.
        </p>

        <button className="coach-card" onClick={() => router.push("/coach")}>
          <div className="coach-badge">
            <ShieldCheck />
          </div>
          <div className="coach-card-text">
            <span className="overline">NEXT CERTIFIED</span>
            <span className="coach-card-name">
              KPGA 프로
              <br />
              KPGA Class A 전문교습가
            </span>
          </div>
          <ChevronRight />
        </button>

        <div className="section-row">
          <span className="section-label">스윙 영상</span>
          <button className="guide-link" onClick={() => setGuideSheetOpen(true)}>
            <span className="guide-badge">?</span> 촬영 가이드
          </button>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={(e) => {
            addVideos(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          className="btn-primary"
          style={{ marginBottom: videos.length > 0 ? 10 : 26 }}
          disabled={videos.length >= 3}
          onClick={() => videoInputRef.current?.click()}
        >
          <VideoIcon />
          영상 업로드{" "}
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,.75)" }}>
            ({videos.length}/3)
          </span>
        </button>

        {videos.map((f, i) => (
          <div className="file-row" key={`v${i}`}>
            <VideoIcon color="#8b95a1" size={18} />
            <span className="file-name">{f.name}</span>
            <button
              className="file-del"
              onClick={() => setVideos(videos.filter((_, j) => j !== i))}
            >
              삭제
            </button>
          </div>
        ))}
        {photos.map((f, i) => (
          <div className="file-row" key={`p${i}`}>
            <ImageIcon size={18} />
            <span className="file-name">{f.name}</span>
            <button
              className="file-del"
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
            >
              삭제
            </button>
          </div>
        ))}

        {photoPromptVisible && photos.length < 2 && (
          <button
            className="guide-link"
            style={{ marginBottom: 26, color: "#3182f6" }}
            onClick={() => photoInputRef.current?.click()}
          >
            + 사진도 추가하시겠어요? (최대 2장)
          </button>
        )}
        {videos.length > 0 && !(photoPromptVisible && photos.length < 2) && (
          <div style={{ marginBottom: 26 }} />
        )}

        <div className="section-label" style={{ marginBottom: 10 }}>
          어떤 점이 가장 고민이세요?
        </div>
        <div className="chips">
          {CONCERN_CHIPS.map((c) => (
            <button
              key={c}
              className={`chip ${selectedConcerns.includes(c) ? "on" : ""}`}
              onClick={() => toggleConcern(c)}
            >
              {selectedConcerns.includes(c) ? "✓ " : ""}
              {c}
            </button>
          ))}
        </div>

        <textarea
          className="note-area"
          placeholder={
            "자유롭게 적어주세요 :) 예) 슬라이스가 심해요. 드라이버 비거리가 안 나고, 아이언은 뒤땅이 자주 납니다."
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="caption">자세히 적어주시면 피드백이 더 정확해져요</p>

        <div className="section-label" style={{ margin: "26px 0 10px" }}>
          피드백 알림 받을 번호
        </div>
        <input
          className="input"
          type="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="caption">피드백이 완성되면 이 번호의 카카오톡으로 링크를 보내드려요</p>

        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="bottom-bar">
        <button className="btn-cta" onClick={submit} disabled={submitting}>
          {submitting ? "업로드 중..." : "스윙 분석 요청하기"}
        </button>
        <div className="benefits">
          <span>✓ 프로가 직접 확인</span>
          <span>✓ 맞춤 피드백 제공</span>
          <span>✓ 카카오톡으로 알림</span>
        </div>
      </div>

      {guideSheetOpen && (
        <div className="sheet-overlay" onClick={() => setGuideSheetOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="section-label" style={{ fontSize: 17 }}>
              촬영 가이드
            </div>
            <p className="caption" style={{ marginTop: 6 }}>
              정면과 측면에서, 몸 전체와 클럽이 다 보이게 찍어주세요.
            </p>
            <div className="guide-thumbs">
              <div className="guide-thumb" style={{ background: "#e7f0ff", color: "#3182f6" }}>
                <span style={{ fontSize: 22 }}>🏌️</span> 정면 예시
              </div>
              <div className="guide-thumb" style={{ background: "#c9dfff", color: "#3182f6" }}>
                <span style={{ fontSize: 22 }}>🏌️</span> 측면 예시
              </div>
              <div className="guide-thumb" style={{ background: "#fff1f0", color: "#f04452", border: "1.5px solid #ffd4d1" }}>
                <span style={{ fontSize: 22 }}>✕</span> 잘못된 예시
              </div>
            </div>
            <button className="btn-secondary" style={{ marginTop: 20 }} onClick={() => setGuideSheetOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
