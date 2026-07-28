"use client";

// ============================================================
// 스윙분석 스튜디오 (PC) — 3단 워크벤치
//
//   [작업 대기열]  [영상 스테이지]  [도구 레일]  [회원 기록 패널]
//        접이식         가장 크게        그리기        커닝페이퍼
//
// 기본은 단독 분석. 오른쪽 패널에서 과거 스윙을 누르면 비교 화면으로 바뀐다.
// 싱크는 버튼 하나 — "지금 두 프레임을 같은 순간으로" 만드는 게 전부다.
// 레슨 작성은 녹화를 마친 뒤 별도 전체 화면에서 한다.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SWING_COLORS, ToolId, formatTime } from "@/lib/swing/draw";
import { formatRelative } from "@/lib/swing/sync";
import { useAnalyzer } from "./useAnalyzer";
import LessonComposer, { LessonDraft, PrevHomework, Drill } from "./LessonComposer";
import { CaptionSeg } from "@/lib/subtitle/glossary";

export type QueueItem = {
  id: string;
  at: string;            // "10:14"
  name: string;
  roundNo: number;
  videoCount: number;
  status: "received" | "working" | "done";
  note?: string;
};

export type PastRound = {
  id: string;
  date: string;          // "06.29"
  roundNo: number;
  headline: string;
  videoUrl: string | null;
  thumbUrl?: string | null;
};

export type ReferenceSwing = {
  id: string;
  name: string;          // "로리 매킬로이"
  club: string;          // "드라이버"
  view: string;          // "정면" / "후면"
  handed: "right" | "left";
  note?: string;
  videoUrl: string | null;
  thumbUrl?: string | null;
};

export type MemberContext = {
  name: string;
  roundNo: number;
  totalRounds: number;
  since?: string;
  videos: { url: string; label: string }[];
  past: PastRound[];
  prevComment?: string;
  prevCommentAt?: string;
  prevHomeworks: PrevHomework[];
  questions: { at: string; body: string }[];
};

const TOOLS: { id: ToolId; icon: string; label: string }[] = [
  { id: "pan", icon: "✥", label: "이동" },
  { id: "line", icon: "╱", label: "실선" },
  { id: "dline", icon: "┄", label: "점선" },
  { id: "arrow", icon: "↗", label: "화살표" },
  { id: "vline", icon: "│", label: "수직" },
  { id: "hline", icon: "─", label: "수평" },
  { id: "circle", icon: "○", label: "원" },
  { id: "rect", icon: "▢", label: "사각" },
  { id: "free", icon: "✎", label: "펜" },
  { id: "angle", icon: "∠", label: "각도" },
  { id: "text", icon: "T", label: "텍스트" },
  { id: "eraser", icon: "⌫", label: "지움" },
];

const SPEEDS = [0.1, 0.25, 0.5, 0.75, 1];

export default function StudioWorkbench({
  queue = [],
  member,
  drills,
  refSwings = [],
  onPickMember,
  onSaveLesson,
  onUploadReference,
  onTranscribe,
  onAddCorrection,
}: {
  queue?: QueueItem[];
  member?: MemberContext | null;
  drills?: Drill[];
  refSwings?: ReferenceSwing[];
  onPickMember?: (id: string) => void;
  onSaveLesson?: (
    draft: LessonDraft,
    mode: "draft" | "send",
    extras: { recording: Blob | null; shots: [string | null, string | null] }
  ) => Promise<void> | void;
  onUploadReference?: (file: File) => Promise<void> | void;
  onTranscribe?: (audio: Blob) => Promise<CaptionSeg[] | null>;
  onAddCorrection?: (wrong: string, correct: string) => void;
}) {
  const A = useAnalyzer();
  const [queueOpen, setQueueOpen] = useState(true);
  const [composing, setComposing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [shots, setShots] = useState<[string | null, string | null]>([null, null]);
  const [activePast, setActivePast] = useState<string | null>(null);
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [cxTab, setCxTab] = useState<"past" | "pro">("past");
  const [refClub, setRefClub] = useState<string>("전체");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const refUploadRef = useRef<HTMLInputElement>(null);
  const fileTarget = useRef<number | null>(null);   // 파일 선택이 어느 화면으로 갈지
  const toastTimer = useRef<any>(null);

  const say = useCallback((m: string) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  // 회원이 바뀌면 A 화면에 이번 영상을 올린다
  useEffect(() => {
    if (member?.videos?.[0]) {
      A.setPaneSource(0, member.videos[0].url, member.videos[0].label);
    } else {
      A.setPaneSource(0, null);
    }
    A.setPaneSource(1, null);
    setActivePast(null);
    setShots([null, null]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.name, member?.roundNo]);

  // 마이크 레벨 미터는 화면을 열 때 바로 켜둔다 (무음 녹화 사고 방지)
  useEffect(() => {
    A.rec.startMonitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || composing) return;
      if (e.code === "Space") { e.preventDefault(); A.togglePlay(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); A.stepFrame(1, e.shiftKey ? 10 : 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); A.stepFrame(-1, e.shiftKey ? 10 : 1); }
      else if (e.key === "s" || e.key === "S") { if (A.compare) A.markSyncNow(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) A.redo(); else A.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [A, composing]);

  const paneIdx = A.compare ? [0, 1] : [0];
  const done = queue.filter((q) => q.status === "done").length;
  const recording = A.rec.state === "rec";
  const canCompose = !!A.rec.url;

  function openPast(p: PastRound) {
    if (!p.videoUrl) { say("이 회차에는 영상이 없습니다"); return; }
    A.setPaneSource(1, p.videoUrl, `지난 ${p.date} · No.${String(p.roundNo).padStart(2, "0")}`);
    setActivePast(p.id);
    setActiveRef(null);
    say(`${p.date} 회차를 B 화면에 올렸습니다`);
  }

  function openReference(r: ReferenceSwing) {
    if (!r.videoUrl) { say("이 스윙에는 영상 파일이 없습니다"); return; }
    A.setPaneSource(1, r.videoUrl, `${r.name} · ${r.club} ${r.view}`);
    setActiveRef(r.id);
    setActivePast(null);
    // 왼손잡이 스윙과 비교할 땐 좌우를 뒤집어야 자세가 겹쳐 보인다
    if (r.handed === "left") {
      requestAnimationFrame(() => A.toggleFlip(1));
      say(`${r.name} · 왼손 스윙이라 좌우를 뒤집었습니다`);
    } else {
      say(`${r.name} 스윙을 B 화면에 올렸습니다`);
    }
  }

  function closeCompare() {
    A.setPaneSource(1, null);
    setActivePast(null);
    setActiveRef(null);
  }

  /** 이 화면의 영상을 파일에서 열거나 교체한다 */
  function pickFileFor(i: number) {
    fileTarget.current = i;
    fileRef.current?.click();
  }

  function closePane(i: number) {
    if (i === 1) { closeCompare(); return; }
    // A를 닫으면 B가 있던 영상을 A로 끌어올린다 (빈 A + 채워진 B 상태 방지)
    if (A.panes[1].url) {
      A.setPaneSource(0, A.panes[1].url, A.panes[1].label);
      A.setPaneSource(1, null);
      setActivePast(null); setActiveRef(null);
    } else {
      A.setPaneSource(0, null);
    }
  }

  const refClubs = useMemo(
    () => ["전체", ...Array.from(new Set(refSwings.map((r) => r.club)))],
    [refSwings]
  );
  const refList = useMemo(
    () => (refClub === "전체" ? refSwings : refSwings.filter((r) => r.club === refClub)),
    [refSwings, refClub]
  );

  function capture(which: 0 | 1) {
    const idx = which === 0 ? (A.compare ? 1 : 0) : 0;
    const url = A.capturePane(idx);
    if (!url) { say("캡처할 영상이 없습니다"); return; }
    setShots((s) => { const n = [...s] as [string | null, string | null]; n[which] = url; return n; });
    say(which === 0 ? "지난 프레임을 캡처했습니다" : "이번 프레임을 캡처했습니다");
  }

  async function saveLesson(draft: LessonDraft, mode: "draft" | "send") {
    setSaving(true);
    try {
      await onSaveLesson?.(draft, mode, { recording: A.rec.blob, shots });
      say(mode === "send" ? "발송했습니다" : "임시저장했습니다");
      if (mode === "send") setComposing(false);
    } catch {
      say("저장에 실패했습니다. 잠시 후 다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  }

  // ---------- 레슨 작성 화면 ----------
  if (composing && member) {
    return (
      <>
      <LessonComposer
        memberName={member.name}
        roundNo={member.roundNo}
        recSec={A.rec.sec}
        recUrl={A.rec.url}
        prevHomeworks={member.prevHomeworks}
        drills={drills}
        captureShots={shots}
        saving={saving}
        transcribing={transcribing}
        onCapture={capture}
        onTranscribe={
          onTranscribe
            ? async () => {
                if (!A.rec.blob) { say("녹화본이 없습니다"); return null; }
                setTranscribing(true);
                try {
                  return await onTranscribe(A.rec.blob);
                } catch {
                  say("음성 인식에 실패했습니다. 잠시 후 다시 시도해주세요");
                  return null;
                } finally {
                  setTranscribing(false);
                }
              }
            : undefined
        }
        onAddCorrection={onAddCorrection}
        onBack={() => setComposing(false)}
        onSave={saveLesson}
      />
      {toast && <div className="sx-toast">{toast}</div>}
      </>
    );
  }

  // ---------- 분석 화면 ----------
  return (
    <div className="sx">
      {/* ===== 상단 ===== */}
      <header className="sx-top">
        <div className="sx-brand"><span className="sx-logo">SS</span>SWING STUDIO</div>
        <span className="sx-vr" />
        <div className="sx-prog">
          <span className="dim">오늘 진행</span>
          <b>{done}<em>/</em>{queue.length}</b>
          <span className="sx-bar"><i style={{ width: `${queue.length ? (done / queue.length) * 100 : 0}%` }} /></span>
        </div>
        <div className="sx-flex" />
        {recording ? (
          <span className="sx-recflag on"><i /> 화면 + 음성 녹화 중 <b>{formatTime(A.rec.sec)}</b></span>
        ) : A.rec.url ? (
          <span className="sx-recflag ok">● 녹화 완료 {formatTime(A.rec.sec)}</span>
        ) : (
          <span className="sx-recflag"><i /> 녹화 대기</span>
        )}
        <span className="sx-vr" />
        <div className="sx-member">
          {member ? (<>현재 <b>{member.name}</b> <span className="dim">No.{String(member.roundNo).padStart(2, "0")}</span></>)
                  : <span className="dim">회원을 선택하세요</span>}
        </div>
      </header>

      <div className="sx-main">
        {/* ===== 1. 작업 대기열 ===== */}
        <aside className={`sx-queue ${queueOpen ? "" : "closed"}`}>
          {queueOpen ? (
            <>
              <div className="sx-qhead">
                <span className="sx-qtitle">오늘 작업 대기열</span>
                <button className="sx-qtoggle" onClick={() => setQueueOpen(false)} title="접기">«</button>
              </div>
              <div className="sx-qmeter"><i style={{ width: `${queue.length ? (done / queue.length) * 100 : 0}%` }} /></div>
              <div className="sx-qsum">
                <span>완료 {done}</span>
                <span>대기 {queue.filter((q) => q.status !== "done").length}</span>
                <span className="sx-qtot">{queue.length}건</span>
              </div>
              <div className="sx-qlist">
                {queue.length === 0 && <div className="sx-empty">오늘 들어온 신청이 없습니다</div>}
                {queue.map((q) => (
                  <button
                    key={q.id}
                    className={`sx-qi ${q.status} ${member && q.name === member.name && q.roundNo === member.roundNo ? "live" : ""}`}
                    onClick={() => onPickMember?.(q.id)}
                  >
                    <span className="sx-qrow1">
                      <span className="sx-qt">{q.at}</span>
                      <span className={`sx-st ${q.status}`}>
                        {q.status === "done" ? "완료" : q.status === "working" ? "작업중" : "대기"}
                      </span>
                    </span>
                    <span className="sx-qrow2">
                      <b>{q.name}</b><span className="dim">No.{String(q.roundNo).padStart(2, "0")}</span>
                    </span>
                    <span className="sx-qrow3">{q.note || `영상 ${q.videoCount}건`}</span>
                  </button>
                ))}
              </div>
              <div className="sx-qfoot">
                <button className="sx-btn wide" onClick={() => pickFileFor(0)}>파일에서 영상 열기</button>
                <span className="sx-qhint">접으면 얇은 띠만 남습니다</span>
              </div>
            </>
          ) : (
            <button className="sx-qopen" onClick={() => setQueueOpen(true)} title="대기열 펼치기">
              <span className="sx-qopen-ico">»</span>
              <span className="sx-qopen-txt">작업 대기열</span>
              <span className="sx-qopen-n">{done}/{queue.length}</span>
            </button>
          )}
        </aside>

        {/* ===== 2. 영상 스테이지 ===== */}
        <section className="sx-stagewrap">
          <div className="sx-sbar">
            <div className="sx-seg">
              <button className={A.compare ? "" : "on"} onClick={closeCompare}>단독</button>
              <button className={A.compare ? "on" : ""} disabled={!A.compare}>비교 2분할</button>
            </div>
            {A.compare && <button className="sx-tb" onClick={closeCompare}>비교 해제 ×</button>}
            <span className="sx-vr2" />
            <button className={`sx-tb ${A.loop ? "on" : ""}`} onClick={() => A.setLoop(!A.loop)}>구간 반복</button>
            <button className="sx-tb" onClick={() => A.setFps(A.fps === 30 ? 60 : 30)}>{A.fps}fps</button>
            <div className="sx-flex" />
            {A.compare && (
              A.synced ? (
                <span className="sx-syncok">
                  싱크됨 · 임팩트 기준 <b>{formatRelative(A.relTime)}</b>
                  <button onClick={A.clearSync}>해제</button>
                </span>
              ) : (
                <span className="sx-synchint">두 영상을 같은 순간에 맞춘 뒤 아래 <b>싱크</b>를 누르세요</span>
              )
            )}
          </div>

          <div
            className="sx-stage"
            ref={A.stageRef}
            onPointerMove={A.onStageMove}
          >
            {paneIdx.map((i) => {
              const pd = A.panes[i];
              return (
                <div
                  key={i}
                  className={`sx-pane ${A.compare && A.activePane === i ? "active" : ""}`}
                  ref={A.paneRef(i)}
                  {...A.paneHandlers(i)}
                >
                  {pd.url ? (
                    <>
                      <video
                        ref={A.videoRef(i)}
                        key={pd.url}
                        src={pd.url}
                        crossOrigin="anonymous"
                        playsInline
                        muted={!A.sound}
                        preload="auto"
                        onLoadedMetadata={() => A.onMeta(i)}
                        onSeeked={() => A.onSeeked(i)}
                        style={{
                          transform: `translate(${pd.panX}px, ${pd.panY}px) scale(${pd.flip ? -pd.zoom : pd.zoom}, ${pd.zoom})`,
                        }}
                      />
                      <canvas className="sx-canvas" ref={A.canvasRef(i)} />
                      <div className="sx-pbadge">
                        <span className="sx-tag">{i === 0 ? "A" : "B"}</span>
                        <span className="sx-plabel">{pd.label}</span>
                      </div>
                      <div className="sx-pctl">
                        <span className="sx-zoom">{Math.round(pd.zoom * 100)}%</span>
                        <button className="sx-mini" onClick={() => A.zoomBy(i, 1 / 1.2)}>−</button>
                        <button className="sx-mini" onClick={() => A.zoomBy(i, 1.2)}>＋</button>
                        <button className={`sx-mini ${pd.flip ? "on" : ""}`} onClick={() => A.toggleFlip(i)} title="좌우 반전">⇋</button>
                        <button className="sx-mini" onClick={() => A.resetView(i)} title="확대·위치 초기화">⟲</button>
                        <button className="sx-mini" onClick={() => pickFileFor(i)} title="다른 영상 파일로 교체">교체</button>
                        <button className="sx-mini" onClick={() => closePane(i)} title="이 영상 닫기">✕</button>
                      </div>
                      <div className="sx-pfoot">
                        <span className="sx-ptime">{formatTime(A.currentTimeOf(i))}</span>
                        {A.compare && (
                          <span className="sx-nudge">
                            <button className="sx-mini" onClick={() => A.nudgePane(i, -1)}>−1f</button>
                            <button className="sx-mini" onClick={() => A.nudgePane(i, 1)}>+1f</button>
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <button className="sx-vempty" onClick={() => pickFileFor(i)}>
                      <span className="sx-vempty-i">＋</span>
                      <span>{i === 0 ? "분석할 영상을 여세요" : "비교할 영상을 여세요"}</span>
                      <span className="dim">
                        {i === 0 ? "왼쪽 대기열에서 회원을 고르거나 파일을 엽니다"
                                 : "오른쪽에서 과거 스윙·프로 스윙을 눌러도 됩니다"}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
            {!A.compare && A.panes[0].url && member?.past?.length ? (
              <div className="sx-hint">오른쪽 <b>과거 스윙</b>을 누르면 비교 화면으로 바뀝니다</div>
            ) : null}
          </div>

          {/* 하단 컨트롤 */}
          <div className="sx-ctl">
            <input
              className="sx-scrub"
              type="range"
              min={0}
              max={1000}
              style={{ ["--p" as string]: `${A.progress * 100}%` } as React.CSSProperties}
              value={Math.round(A.progress * 1000)}
              onPointerDown={() => A.playing && A.pause()}
              onChange={(e) => A.seek(Number(e.target.value) / 1000)}
              disabled={!A.panes[0].url}
            />
            <div className="sx-ctlrow">
              <button className="sx-cbtn" onClick={() => A.stepFrame(-1)} title="1프레임 뒤로 (←)">◀|</button>
              <button className="sx-play" onClick={A.togglePlay}>{A.playing ? "❚❚" : "▶"}</button>
              <button className="sx-cbtn" onClick={() => A.stepFrame(1)} title="1프레임 앞으로 (→)">|▶</button>

              <span className="sx-time">
                {formatTime(A.currentTimeOf(0))}
                <em>/ 구간 {formatTime(A.range.total)}</em>
              </span>

              {/* 싱크 — 버튼 하나로 끝난다 */}
              {A.compare && (
                <button className={`sx-sync ${A.synced ? "on" : ""}`} onClick={A.markSyncNow} title="단축키 S">
                  {A.synced ? "싱크 다시 맞추기" : "지금 두 프레임 싱크"}
                </button>
              )}

              <span className="sx-vr2" />
              <span className="dim sm">배속</span>
              {SPEEDS.map((s) => (
                <button key={s} className={`sx-sp ${A.speed === s ? "on" : ""}`} onClick={() => A.setSpeed(s)}>{s}x</button>
              ))}

              <div className="sx-flex" />

              <span className="dim sm">MIC</span>
              <select
                className="sx-mic"
                value={A.rec.deviceId}
                onChange={(e) => A.rec.selectDevice(e.target.value)}
              >
                {A.rec.devices.length === 0 && <option value="">마이크 없음</option>}
                {A.rec.devices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>{d.label || `입력 장치 ${i + 1}`}</option>
                ))}
              </select>
              <span className="sx-level" title="목소리가 들어오면 막대가 움직입니다">
                {Array.from({ length: 12 }).map((_, i) => (
                  <i key={i} className={A.rec.level * 12 > i ? (i > 9 ? "hot" : "on") : ""} />
                ))}
              </span>

              {recording ? (
                <button className="sx-rec on" onClick={A.rec.stop}>■ 녹화 정지 {formatTime(A.rec.sec)}</button>
              ) : (
                <button className="sx-rec" onClick={A.rec.start} disabled={!A.panes[0].url}>● REC</button>
              )}
              {A.rec.url && !recording && (
                <button className="sx-tb" onClick={A.rec.discard} title="녹화본 버리고 다시 찍기">다시 찍기</button>
              )}
            </div>
          </div>
        </section>

        {/* ===== 3. 도구 레일 (스테이지와 회원 패널 사이) ===== */}
        <aside className="sx-rail">
          <span className="sx-rlab">도구</span>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`sx-tool ${A.tool === t.id ? "on" : ""}`}
              onClick={() => A.setTool(t.id)}
              title={t.label}
            >
              <span className="sx-ti">{t.icon}</span>
              <span className="sx-tl">{t.label}</span>
            </button>
          ))}
          <button
            className={`sx-tool sx-lock ${A.oneShot ? "" : "on"}`}
            onClick={() => A.setOneShot(!A.oneShot)}
            title={A.oneShot
              ? "지금은 하나 그리면 이동으로 돌아갑니다 — 누르면 도구를 고정합니다"
              : "지금은 도구가 고정돼 계속 그립니다 — 누르면 한 번씩만 그립니다"}
          >
            <span className="sx-ti">{A.oneShot ? "①" : "∞"}</span>
            <span className="sx-tl">{A.oneShot ? "한번" : "연속"}</span>
          </button>
          <span className="sx-rdiv" />
          <button className="sx-tool" onClick={A.undo} disabled={!A.canUndo} title="되돌리기 (Ctrl+Z)">
            <span className="sx-ti">↶</span><span className="sx-tl">되돌</span>
          </button>
          <button className="sx-tool" onClick={A.redo} disabled={!A.canRedo} title="다시 실행">
            <span className="sx-ti">↷</span><span className="sx-tl">다시</span>
          </button>
          <button className="sx-tool" onClick={A.clearAll} title="모두 지우기">
            <span className="sx-ti">⌧</span><span className="sx-tl">전체</span>
          </button>
          <span className="sx-rdiv" />
          <span className="sx-rlab">색상</span>
          <div className="sx-colors">
            {SWING_COLORS.map((c) => (
              <button
                key={c}
                className={`sx-color ${A.color === c ? "on" : ""}`}
                style={{ background: c }}
                onClick={() => A.setColor(c)}
              />
            ))}
          </div>
          <span className="sx-rlab">굵기</span>
          <div className="sx-widths">
            {[2.5, 4, 7].map((w) => (
              <button key={w} className={`sx-w ${A.strokeW === w ? "on" : ""}`} onClick={() => A.setStrokeW(w)}>
                <i style={{ height: w }} />
              </button>
            ))}
          </div>
        </aside>

        {/* ===== 4. 회원 기록 패널 (커닝페이퍼) ===== */}
        <aside className="sx-ctx">
          <div className="sx-cxhead">
            <div>
              <b>{member?.name ?? "회원 미선택"}</b>
              {member && <span className="dim"> No.{String(member.roundNo).padStart(2, "0")}</span>}
            </div>
            {member && (
              <span className="dim sm">
                누적 {member.totalRounds}회{member.since ? ` · ${member.since}부터` : ""}
              </span>
            )}
          </div>

          <div className={`sx-cxnote ${recording ? "rec" : ""}`}>
            {recording ? "● 녹화 중 · 이 패널은 영상에 찍히지 않습니다" : "이 패널은 녹화 화면에 포함되지 않습니다"}
          </div>

          <div className="sx-cxtabs">
            <button className={cxTab === "past" ? "on" : ""} onClick={() => setCxTab("past")}>
              회원 기록{member?.past.length ? ` ${member.past.length}` : ""}
            </button>
            <button className={cxTab === "pro" ? "on" : ""} onClick={() => setCxTab("pro")}>
              프로 스윙{refSwings.length ? ` ${refSwings.length}` : ""}
            </button>
          </div>

          <div className="sx-cxbody">
            {/* ===== 프로 스윙 라이브러리 ===== */}
            {cxTab === "pro" && (
              <div className="sx-sec">
                <div className="sx-sech">
                  <span>프로 스윙 라이브러리</span>
                  <span className="dim sm">누르면 B 화면에서 비교</span>
                </div>
                {refClubs.length > 1 && (
                  <div className="sx-filter">
                    {refClubs.map((c) => (
                      <button key={c} className={refClub === c ? "on" : ""} onClick={() => setRefClub(c)}>{c}</button>
                    ))}
                  </div>
                )}
                {refList.length === 0 && (
                  <div className="sx-empty sm">
                    저장된 프로 스윙이 없습니다.<br />
                    아래에서 영상을 추가하면 언제든 꺼내 쓸 수 있습니다.
                  </div>
                )}
                {refList.map((r) => (
                  <button
                    key={r.id}
                    className={`sx-past ${activeRef === r.id ? "on" : ""}`}
                    onClick={() => openReference(r)}
                  >
                    <span className="sx-pthumb">
                      {r.thumbUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={r.thumbUrl} alt="" />
                        : <i />}
                    </span>
                    <span className="sx-ptxt">
                      <span className="sx-pdate">
                        {r.name}
                        {r.handed === "left" && <em className="sx-lefty">왼손</em>}
                      </span>
                      <span className="sx-phead">{r.club} · {r.view}{r.note ? ` · ${r.note}` : ""}</span>
                    </span>
                    <span className="sx-popen">{activeRef === r.id ? "B 비교 중" : "B로 열기 →"}</span>
                  </button>
                ))}
                {onUploadReference && (
                  <button className="sx-btn wide sx-refadd" onClick={() => refUploadRef.current?.click()}>
                    + 프로 스윙 추가
                  </button>
                )}
                <p className="sx-qnote">
                  직접 촬영한 시범 스윙이나 이용 허락을 받은 영상을 쓰세요.
                </p>
              </div>
            )}

            {/* ===== 회원 기록 ===== */}
            {cxTab === "past" && !member && (
              <div className="sx-empty">왼쪽에서 회원을 선택하면 지난 기록이 여기에 표시됩니다</div>
            )}

            {cxTab === "past" && member && (
              <>
                <div className="sx-sec">
                  <div className="sx-sech">
                    <span>과거 스윙</span>
                    <span className="dim sm">누르면 B 화면에서 비교</span>
                  </div>
                  {member.past.length === 0 && <div className="sx-empty sm">첫 회차입니다 — 지난 기록이 없습니다</div>}
                  {member.past.map((p) => (
                    <button
                      key={p.id}
                      className={`sx-past ${activePast === p.id ? "on" : ""}`}
                      onClick={() => openPast(p)}
                    >
                      <span className="sx-pthumb">
                        {p.thumbUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.thumbUrl} alt="" />
                          : <i />}
                      </span>
                      <span className="sx-ptxt">
                        <span className="sx-pdate">{p.date} <em>No.{String(p.roundNo).padStart(2, "0")}</em></span>
                        <span className="sx-phead">{p.headline || "진단 기록 없음"}</span>
                      </span>
                      <span className="sx-popen">{activePast === p.id ? "B 비교 중" : "B로 열기 →"}</span>
                    </button>
                  ))}
                </div>

                {member.prevComment && (
                  <div className="sx-sec">
                    <div className="sx-sech">
                      <span>지난 회차 피드백</span>
                      <span className="dim sm">{member.prevCommentAt}</span>
                    </div>
                    <blockquote className="sx-quote">“{member.prevComment}”</blockquote>
                  </div>
                )}

                {member.prevHomeworks.length > 0 && (
                  <div className="sx-sec">
                    <div className="sx-sech">
                      <span>지난 회차 숙제</span>
                      <span className="dim sm">
                        이행률 {Math.round(
                          (member.prevHomeworks.reduce((a, h) => a + (h.target ? h.done / h.target : 0), 0) /
                            member.prevHomeworks.length) * 100
                        )}%
                      </span>
                    </div>
                    {member.prevHomeworks.map((h, i) => (
                      <div className={`sx-hw ${h.done >= h.target ? "ok" : ""}`} key={i}>
                        <span className="sx-hwbox">{h.done >= h.target ? "✓" : ""}</span>
                        <span className="sx-hwt">{h.title}</span>
                        <span className="sx-hwn">{h.done} / {h.target}</span>
                      </div>
                    ))}
                  </div>
                )}

                {member.questions.length > 0 && (
                  <div className="sx-sec">
                    <div className="sx-sech">
                      <span>회원이 남긴 질문</span>
                      <span className="dim sm">{member.questions.length}건 · 미답변</span>
                    </div>
                    {member.questions.map((q, i) => (
                      <div className="sx-q" key={i}>
                        <span className="sx-qat">{q.at}</span>
                        <p>“{q.body}”</p>
                      </div>
                    ))}
                    <p className="sx-qnote">이번 녹화에서 직접 답해주세요</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="sx-cxfoot">
            <button
              className="sx-lesson"
              disabled={!canCompose || !member}
              onClick={() => setComposing(true)}
            >
              레슨 작성
              <span className="sx-lesson-st">{canCompose ? "열기 →" : "녹화 후"}</span>
            </button>
            <span className="sx-cxhint">
              {!member
                ? "왼쪽 대기열에서 회원을 골라야 레슨을 보낼 수 있습니다"
                : canCompose
                  ? "요약과 숙제를 쓰는 전용 화면이 열립니다"
                  : "녹화를 마치면 활성화됩니다"}
            </span>
          </div>
        </aside>
      </div>

      {toast && <div className="sx-toast">{toast}</div>}

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const i = fileTarget.current ?? (A.panes[0].url ? 1 : 0);
            A.loadFile(i, f);
            if (i === 1) { setActivePast(null); setActiveRef(null); }
            say(`${i === 0 ? "A" : "B"} 화면에 ${f.name} 을(를) 열었습니다`);
          }
          fileTarget.current = null;
          e.target.value = "";
        }}
      />
      <input
        ref={refUploadRef}
        type="file"
        accept="video/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try {
            await onUploadReference?.(f);
            say("프로 스윙 라이브러리에 추가했습니다");
          } catch {
            say("추가하지 못했습니다");
          }
        }}
      />
    </div>
  );
}
