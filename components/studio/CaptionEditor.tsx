"use client";

// ============================================================
// 자막 검수 — 음성 인식 결과를 구간별로 보고 바로 고친다.
// 고친 단어는 "다음부터 자동 교정" 제안으로 떠서, 승인하면
// 개인 교정 사전에 쌓인다 (쓸수록 검수할 게 줄어드는 구조).
// ============================================================

import { useRef, useState } from "react";
import { CaptionSeg } from "@/lib/subtitle/glossary";

function clock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 단어 수가 같을 때만 바뀐 단어 쌍을 뽑는다 (안전한 경우만 제안) */
function diffWords(before: string, after: string): [string, string][] {
  const a = before.trim().split(/\s+/);
  const b = after.trim().split(/\s+/);
  if (a.length !== b.length) return [];
  const out: [string, string][] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i] && a[i].length > 1 && b[i].length > 1) out.push([a[i], b[i]]);
  }
  return out.slice(0, 3);
}

export default function CaptionEditor({
  segments,
  transcribing,
  canTranscribe,
  onTranscribe,
  onChange,
  onAddCorrection,
}: {
  segments: CaptionSeg[];
  transcribing?: boolean;
  canTranscribe: boolean;
  onTranscribe?: () => void;
  onChange: (segs: CaptionSeg[]) => void;
  onAddCorrection?: (wrong: string, correct: string) => void;
}) {
  const [suggests, setSuggests] = useState<[string, string][]>([]);
  const originals = useRef<Map<number, string>>(new Map());

  function edit(i: number, text: string) {
    const next = segments.map((s, k) => (k === i ? { ...s, text } : s));
    onChange(next);
  }

  function focusSeg(i: number) {
    if (!originals.current.has(i)) originals.current.set(i, segments[i].text);
  }

  function blurSeg(i: number) {
    const before = originals.current.get(i);
    if (before == null) return;
    const pairs = diffWords(before, segments[i].text);
    if (pairs.length) {
      setSuggests((prev) => {
        const seen = new Set(prev.map((p) => p[0]));
        return [...prev, ...pairs.filter((p) => !seen.has(p[0]))].slice(-6);
      });
    }
    originals.current.set(i, segments[i].text);
  }

  function approve(pair: [string, string]) {
    onAddCorrection?.(pair[0], pair[1]);
    setSuggests((prev) => prev.filter((p) => p[0] !== pair[0]));
  }

  return (
    <div className="cap">
      <div className="lc-lab" style={{ marginBottom: 6 }}>
        자막 <em className="opt">선택</em>
        <em>회원이 영상에서 자막 버튼을 누르면 보입니다</em>
        {segments.length > 0 && <b className="lc-count">{segments.length}구간</b>}
      </div>

      {segments.length === 0 ? (
        <div className="cap-start">
          <button className="lc-chip" onClick={onTranscribe} disabled={!canTranscribe || transcribing}>
            {transcribing ? "음성 인식 중… 몇십 초 걸립니다" : "녹화 음성으로 자막 만들기"}
          </button>
          <span className="lc-hint">
            {canTranscribe
              ? "골프 용어 사전이 적용된 인식 결과가 아래에 뜨고, 훑어보며 바로 고칠 수 있습니다"
              : "녹화본이 있어야 자막을 만들 수 있습니다"}
          </span>
        </div>
      ) : (
        <>
          <div className="cap-list">
            {segments.map((s, i) => (
              <div className="cap-row" key={i}>
                <span className="cap-t">{clock(s.start)}</span>
                <input
                  className="cap-in"
                  value={s.text}
                  onFocus={() => focusSeg(i)}
                  onBlur={() => blurSeg(i)}
                  onChange={(e) => edit(i, e.target.value)}
                />
                <button className="cap-x" title="이 구간 삭제"
                  onClick={() => onChange(segments.filter((_, k) => k !== i))}>×</button>
              </div>
            ))}
          </div>

          {suggests.length > 0 && onAddCorrection && (
            <div className="cap-suggest">
              <span className="lc-hint">방금 고친 단어 — 다음부터 자동으로 교정할까요?</span>
              <div className="lc-chips">
                {suggests.map((p) => (
                  <button key={p[0]} className="lc-chip" onClick={() => approve(p)}>
                    {p[0]} → {p[1]} <b>승인</b>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="cap-foot">
            <button className="lc-chip" onClick={onTranscribe} disabled={!canTranscribe || transcribing}>
              {transcribing ? "인식 중…" : "다시 인식"}
            </button>
            <button className="lc-chip dashed" onClick={() => onChange([])}>자막 없이 보내기</button>
          </div>
        </>
      )}
    </div>
  );
}
