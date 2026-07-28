"use client";

// ============================================================
// 자막 지원 비디오 — 피드백 열람 페이지에서 사용.
// 자막이 있으면 [자막] 버튼이 뜨고, 누르면 켜고 끌 수 있다.
// 자막 데이터(segments)를 WebVTT 로 바꿔 <track> 으로 붙인다.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { CaptionSeg, segmentsToVTT } from "@/lib/subtitle/glossary";

export default function CaptionVideo({
  src,
  captions,
}: {
  src: string;
  captions: CaptionSeg[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [vttUrl, setVttUrl] = useState<string | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!captions?.length) return;
    const blob = new Blob([segmentsToVTT(captions)], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    setVttUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [captions]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const track = v.textTracks?.[0];
    if (track) track.mode = on ? "showing" : "hidden";
  }, [on, vttUrl]);

  const hasCC = captions?.length > 0 && vttUrl;

  return (
    <div style={{ position: "relative" }}>
      <video ref={videoRef} src={src} controls playsInline preload="metadata" crossOrigin="anonymous">
        {hasCC && <track kind="subtitles" src={vttUrl!} srcLang="ko" label="한국어 자막" />}
      </video>
      {captions?.length > 0 && (
        <button
          onClick={() => setOn((o) => !o)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: on ? "#fff" : "rgba(0,0,0,0.55)",
            color: on ? "#191f28" : "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {on ? "자막 끄기" : "자막 켜기"}
        </button>
      )}
    </div>
  );
}
