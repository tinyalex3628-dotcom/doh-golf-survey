"use client";

// ============================================================
// 스윙분석 엔진 — 회원용(모바일)과 프로용(PC 스튜디오)이 공유하는 핵심 컴포넌트
//
//  · 단독 분석 / 2영상 비교 분석
//  · 영상별 확대·축소·이동(핀치/휠/드래그)으로 인물 크기·센터 맞추기
//  · 영상별 스윙 시작점(IN)/끝점(OUT) 컷 지정 → 두 영상이 같은 구간을
//    같은 시간에 재생하도록 재생속도를 자동 보정(싱크 재생)
//  · 프레임 단위 탐색, 0.1~1 배속, 반복 재생
//  · 드로잉: 직선/화살표/수직·수평 기준선/원/사각형/펜/3점 각도측정(+프로: 텍스트)
//  · 프로 전용: 화면 합성 + 마이크 음성 녹화 → 레슨 영상(webm) 다운로드
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pt,
  Shape,
  ShapeTool,
  ToolId,
  SWING_COLORS,
  formatTime,
  hitTest,
  renderShape,
  renderShapes,
} from "@/lib/swing/draw";

type Variant = "member" | "pro";

type PaneData = {
  url: string | null;
  name: string;
  isLocal: boolean; // ObjectURL 여부 (해제용)
  duration: number;
  inPt: number;
  outPt: number;
  zoom: number;
  panX: number;
  panY: number;
  flip: boolean; // 좌우 반전 (왼손↔오른손 비교용)
};

type HistEntry = { type: "add" | "remove"; pane: number; shape: Shape };

type Gesture =
  | { type: "pan"; pane: number; startX: number; startY: number; panX0: number; panY0: number }
  | { type: "pinch"; pane: number; startDist: number; zoom0: number; panX0: number; panY0: number; midX: number; midY: number }
  | { type: "draw"; pane: number; tool: ShapeTool; pts: Pt[] }
  | { type: "scrub"; pane: number; startX: number; t0: number } // 구간 편집: 영상 문질러 탐색
  | null;

const emptyPane = (): PaneData => ({
  url: null,
  name: "",
  isLocal: false,
  duration: 0,
  inPt: 0,
  outPt: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
  flip: false,
});

const SPEEDS = [0.1, 0.25, 0.5, 0.75, 1];
const MIN_TRIM = 0.05; // IN/OUT 최소 간격(초)

const TOOLS: { id: ToolId; icon: string; label: string; proOnly?: boolean }[] = [
  { id: "pan", icon: "✥", label: "이동·줌" },
  { id: "line", icon: "╱", label: "직선" },
  { id: "arrow", icon: "↗", label: "화살표" },
  { id: "vline", icon: "│", label: "수직선" },
  { id: "hline", icon: "─", label: "수평선" },
  { id: "circle", icon: "○", label: "원" },
  { id: "rect", icon: "▢", label: "사각형" },
  { id: "free", icon: "✎", label: "펜" },
  { id: "angle", icon: "∠", label: "각도" },
  { id: "text", icon: "T", label: "텍스트", proOnly: true },
  { id: "eraser", icon: "⌫", label: "지우개" },
];

let shapeSeq = 1;

export default function SwingAnalyzer({
  variant,
  initialUrls,
}: {
  variant: Variant;
  initialUrls?: (string | null)[];
}) {
  const isPro = variant === "pro";

  // ---------- 상태 ----------
  const [mode, setMode] = useState<"single" | "compare">(
    initialUrls && initialUrls[1] ? "compare" : "single"
  );
  const [panes, setPanes] = useState<[PaneData, PaneData]>(() => {
    const a = emptyPane();
    const b = emptyPane();
    if (initialUrls?.[0]) { a.url = initialUrls[0]; a.name = "영상 A"; }
    if (initialUrls?.[1]) { b.url = initialUrls[1]; b.name = "영상 B"; }
    return [a, b];
  });
  const [shapes, setShapes] = useState<[Shape[], Shape[]]>([[], []]);
  const [history, setHistory] = useState<HistEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistEntry[]>([]);

  const [tool, setTool] = useState<ToolId>("pan");
  const [color, setColor] = useState(SWING_COLORS[0]);
  const [strokeW, setStrokeW] = useState(4);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 마스터 타임라인 0~1
  const [speed, setSpeed] = useState(0.5);
  const [loop, setLoop] = useState(true);
  const [fps, setFps] = useState(30);
  const [sound, setSound] = useState(false);

  const [activePane, setActivePane] = useState(0);
  const [pendingAngle, setPendingAngle] = useState<{ pane: number; pts: Pt[] } | null>(null);
  const [preview, setPreview] = useState<{ pane: number; shape: Shape } | null>(null);
  const [trimOpen, setTrimOpen] = useState(true);
  const [railOpen, setRailOpen] = useState(true);
  const [sizeTick, setSizeTick] = useState(0);
  const [toast, setToast] = useState("");

  // 모바일 구간 편집 모드: 편집 중인 페인 번호 (null = 닫힘)
  const [editorPane, setEditorPane] = useState<number | null>(null);
  // 모바일 세로/가로 감지 (비교 모드는 가로 전용)
  const [isPortrait, setIsPortrait] = useState(false);

  // 녹화 (프로 전용)
  const [recState, setRecState] = useState<"idle" | "rec">("idle");
  const [recSec, setRecSec] = useState(0);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [recModal, setRecModal] = useState(false);

  // ---------- ref ----------
  const stageRef = useRef<HTMLDivElement>(null);
  const paneEls = useRef<(HTMLDivElement | null)[]>([null, null]);
  const videoEls = useRef<(HTMLVideoElement | null)[]>([null, null]);
  const canvasEls = useRef<(HTMLCanvasElement | null)[]>([null, null]);
  const fileEls = useRef<(HTMLInputElement | null)[]>([null, null]);

  const panesRef = useRef(panes);
  const shapesRef = useRef(shapes);
  const loopRef = useRef(loop);
  const progressRef = useRef(progress);
  const gestureRef = useRef<Gesture>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const cursorRef = useRef({ x: 0, y: 0, inside: false });
  const recRef = useRef<{ recorder: MediaRecorder | null; raf: number; timer: any; audio: MediaStream | null }>({
    recorder: null,
    raf: 0,
    timer: null,
    audio: null,
  });
  const toastTimer = useRef<any>(null);
  const editDragRef = useRef<"in" | "out" | "seek" | null>(null);

  // 시킹처럼 state를 안 거치는 변화를 화면에 반영하기 위한 가벼운 틱 (rAF 스로틀)
  const [, forceTick] = useState(0);
  const tickPending = useRef(false);
  const uiTick = useCallback(() => {
    if (tickPending.current) return;
    tickPending.current = true;
    requestAnimationFrame(() => {
      tickPending.current = false;
      forceTick((t) => t + 1);
    });
  }, []);

  useEffect(() => { panesRef.current = panes; }, [panes]);
  useEffect(() => { shapesRef.current = shapes; }, [shapes]);
  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  const paneIndices = mode === "compare" ? [0, 1] : [0];
  const masterIdx = panes[0].url ? 0 : 1;

  useEffect(() => {
    if (isPro || typeof window === "undefined") return;
    const mq = window.matchMedia("(orientation: portrait)");
    const upd = () => setIsPortrait(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, [isPro]);

  const trimDur = useCallback((p: PaneData) => Math.max(MIN_TRIM, p.outPt - p.inPt), []);
  const masterDur = trimDur(panes[masterIdx]);

  function say(msg: string) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  function setPane(i: number, patch: Partial<PaneData>) {
    setPanes((prev) => {
      const next = [...prev] as [PaneData, PaneData];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  // ---------- 영상 불러오기 ----------
  function loadFile(i: number, file: File) {
    const old = panesRef.current[i];
    if (old.isLocal && old.url) URL.revokeObjectURL(old.url);
    const url = URL.createObjectURL(file);
    setPane(i, { ...emptyPane(), url, name: file.name, isLocal: true });
    setShapes((prev) => {
      const next = [...prev] as [Shape[], Shape[]];
      next[i] = [];
      return next;
    });
    setHistory((h) => h.filter((e) => e.pane !== i));
    setRedoStack([]);
    setProgress(0);
    if (i === 1) setMode("compare");
  }

  function loadUrlPrompt(i: number) {
    const u = window.prompt("영상 주소(URL)를 붙여넣으세요");
    if (!u) return;
    const old = panesRef.current[i];
    if (old.isLocal && old.url) URL.revokeObjectURL(old.url);
    setPane(i, { ...emptyPane(), url: u, name: `영상 ${i === 0 ? "A" : "B"}` });
    if (i === 1) setMode("compare");
  }

  function onMeta(i: number) {
    const v = videoEls.current[i];
    if (!v) return;
    if (isFinite(v.duration)) {
      // 같은 영상이 다시 마운트된 경우엔 사용자가 지정한 구간을 유지
      const keep = Math.abs(panesRef.current[i].duration - v.duration) < 0.01;
      setPane(i, keep ? { duration: v.duration } : { duration: v.duration, inPt: 0, outPt: v.duration });
    } else {
      // 일부 webm(녹화 파일 등)은 duration이 Infinity로 보고됨 →
      // 끝으로 강제 시킹해서 실제 길이를 알아내는 표준 워크어라운드
      const onSeeked = () => {
        v.removeEventListener("seeked", onSeeked);
        const d = isFinite(v.duration) ? v.duration : v.currentTime;
        v.currentTime = 0;
        setPane(i, { duration: d, inPt: 0, outPt: d });
      };
      v.addEventListener("seeked", onSeeked);
      v.currentTime = 1e7;
    }
  }

  // SSR로 미리 렌더된 영상(URL 프리로드)은 하이드레이션 전에 metadata가
  // 로드되어 onLoadedMetadata 이벤트를 놓칠 수 있다 → 직접 확인
  useEffect(() => {
    for (const i of [0, 1]) {
      const v = videoEls.current[i];
      if (v && panes[i].url && !panes[i].duration && v.readyState >= 1) onMeta(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panes[0].url, panes[1].url, sizeTick]);

  // ---------- 재생/싱크 엔진 ----------
  const seekAll = useCallback((p: number) => {
    setProgress(p);
    for (const i of [0, 1]) {
      const v = videoEls.current[i];
      const pd = panesRef.current[i];
      if (!v || !pd.url || !pd.duration) continue;
      const d = Math.max(MIN_TRIM, pd.outPt - pd.inPt);
      v.currentTime = pd.inPt + p * d;
    }
  }, []);

  const pauseAll = useCallback(() => {
    for (const v of videoEls.current) v?.pause();
    setPlaying(false);
    // 정지 시점 기준으로 슬레이브 영상 위치를 다시 정렬
    seekAll(Math.min(1, Math.max(0, progressRef.current)));
  }, [seekAll]);

  const playAll = useCallback(() => {
    const mi = panesRef.current[0].url ? 0 : 1;
    const mPd = panesRef.current[mi];
    if (!mPd.url || !mPd.duration) return;
    const mDur = Math.max(MIN_TRIM, mPd.outPt - mPd.inPt);
    let p = progressRef.current;
    if (p >= 0.999) p = 0;
    for (const i of [0, 1]) {
      const v = videoEls.current[i];
      const pd = panesRef.current[i];
      if (!v || !pd.url || !pd.duration) continue;
      const d = Math.max(MIN_TRIM, pd.outPt - pd.inPt);
      // 트리밍 구간 길이가 달라도 같은 벽시계 시간에 끝나도록 배속 보정
      v.playbackRate = Math.min(4, Math.max(0.0625, speed * (d / mDur)));
      v.currentTime = pd.inPt + p * d;
      v.play().catch(() => {});
    }
    setProgress(p);
    setPlaying(true);
  }, [speed]);

  // 재생 중 마스터 영상을 따라 타임라인 갱신 + 구간 끝 처리
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let lastTs = 0;
    const tick = (ts: number) => {
      const mi = panesRef.current[0].url ? 0 : 1;
      const v = videoEls.current[mi];
      const pd = panesRef.current[mi];
      if (v && pd.url && pd.duration) {
        const d = Math.max(MIN_TRIM, pd.outPt - pd.inPt);
        const p = (v.currentTime - pd.inPt) / d;
        if (p >= 1 || v.ended) {
          if (loopRef.current) {
            for (const i of [0, 1]) {
              const vv = videoEls.current[i];
              const pp = panesRef.current[i];
              if (!vv || !pp.url) continue;
              vv.currentTime = pp.inPt;
            }
            setProgress(0);
          } else {
            pauseAll();
            setProgress(1);
            return;
          }
        } else if (ts - lastTs > 33) {
          lastTs = ts;
          setProgress(Math.min(1, Math.max(0, p)));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, pauseAll]);

  // 배속 변경 즉시 반영
  useEffect(() => {
    if (!playing) return;
    const mi = panesRef.current[0].url ? 0 : 1;
    const mDur = Math.max(MIN_TRIM, panesRef.current[mi].outPt - panesRef.current[mi].inPt);
    for (const i of [0, 1]) {
      const v = videoEls.current[i];
      const pd = panesRef.current[i];
      if (!v || !pd.url) continue;
      const d = Math.max(MIN_TRIM, pd.outPt - pd.inPt);
      v.playbackRate = Math.min(4, Math.max(0.0625, speed * (d / mDur)));
    }
  }, [speed, playing]);

  function togglePlay() {
    if (playing) pauseAll();
    else playAll();
  }

  function stepFrame(dir: 1 | -1, frames = 1) {
    if (playing) pauseAll();
    const dp = ((1 / fps) * frames) / masterDur;
    seekAll(Math.min(1, Math.max(0, progressRef.current + dir * dp)));
  }

  // 특정 영상만 1프레임 이동 (시작점을 정밀하게 맞출 때 사용)
  function nudgePane(i: number, dir: 1 | -1) {
    if (playing) pauseAll();
    const v = videoEls.current[i];
    const pd = panesRef.current[i];
    if (!v || !pd.url) return;
    v.currentTime = Math.min(pd.duration, Math.max(0, v.currentTime + dir / fps));
    uiTick();
  }

  function markIn(i: number) {
    const v = videoEls.current[i];
    const pd = panesRef.current[i];
    if (!v || !pd.url) return;
    setPane(i, { inPt: Math.min(v.currentTime, pd.outPt - MIN_TRIM) });
    say(`영상 ${i === 0 ? "A" : "B"} 시작점 지정 완료`);
  }

  function markOut(i: number) {
    const v = videoEls.current[i];
    const pd = panesRef.current[i];
    if (!v || !pd.url) return;
    setPane(i, { outPt: Math.max(v.currentTime, pd.inPt + MIN_TRIM) });
    say(`영상 ${i === 0 ? "A" : "B"} 끝점 지정 완료`);
  }

  function resetTrim(i: number) {
    const pd = panesRef.current[i];
    setPane(i, { inPt: 0, outPt: pd.duration });
  }

  // ---------- 확대/이동 ----------
  function zoomBy(i: number, factor: number) {
    const pd = panesRef.current[i];
    setPane(i, { zoom: Math.min(8, Math.max(0.4, pd.zoom * factor)) });
  }

  function resetView(i: number) {
    setPane(i, { zoom: 1, panX: 0, panY: 0 });
  }

  function toggleFlip(i: number) {
    setPane(i, { flip: !panesRef.current[i].flip });
  }

  // ---------- 드로잉 ----------
  function paneNorm(i: number, clientX: number, clientY: number): Pt {
    const el = paneEls.current[i];
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  }

  function commitShape(pane: number, shape: Shape) {
    setShapes((prev) => {
      const next = [...prev] as [Shape[], Shape[]];
      next[pane] = [...next[pane], shape];
      return next;
    });
    setHistory((h) => [...h, { type: "add", pane, shape }]);
    setRedoStack([]);
  }

  function eraseAt(pane: number, p: Pt) {
    const list = shapesRef.current[pane];
    for (let i = list.length - 1; i >= 0; i--) {
      if (hitTest(list[i], p)) {
        const shape = list[i];
        setShapes((prev) => {
          const next = [...prev] as [Shape[], Shape[]];
          next[pane] = next[pane].filter((s) => s.id !== shape.id);
          return next;
        });
        setHistory((h) => [...h, { type: "remove", pane, shape }]);
        setRedoStack([]);
        return;
      }
    }
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const e = h[h.length - 1];
      setShapes((prev) => {
        const next = [...prev] as [Shape[], Shape[]];
        next[e.pane] =
          e.type === "add"
            ? next[e.pane].filter((s) => s.id !== e.shape.id)
            : [...next[e.pane], e.shape];
        return next;
      });
      setRedoStack((r) => [...r, e]);
      return h.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const e = r[r.length - 1];
      setShapes((prev) => {
        const next = [...prev] as [Shape[], Shape[]];
        next[e.pane] =
          e.type === "add"
            ? [...next[e.pane], e.shape]
            : next[e.pane].filter((s) => s.id !== e.shape.id);
        return next;
      });
      setHistory((h) => [...h, e]);
      return r.slice(0, -1);
    });
  }

  function clearAll() {
    setShapes([[], []]);
    setHistory([]);
    setRedoStack([]);
    setPendingAngle(null);
    setPreview(null);
  }

  // ---------- 포인터 이벤트 (드로잉 + 팬/줌 제스처) ----------
  function onPaneDown(i: number, e: React.PointerEvent<HTMLDivElement>) {
    if (!panesRef.current[i].url) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setActivePane(i);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = paneNorm(i, e.clientX, e.clientY);
    const pd = panesRef.current[i];

    // 구간 편집 모드: 영상을 좌우로 문지르면 프레임 탐색
    if (!isPro && editorPane !== null) {
      const v = videoEls.current[i];
      if (!v) return;
      if (playing) pauseAll();
      gestureRef.current = { type: "scrub", pane: i, startX: e.clientX, t0: v.currentTime };
      return;
    }

    if (tool === "pan") {
      const pts = Array.from(pointersRef.current.values());
      if (pts.length >= 2) {
        gestureRef.current = {
          type: "pinch",
          pane: i,
          startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          zoom0: pd.zoom,
          panX0: pd.panX,
          panY0: pd.panY,
          midX: (pts[0].x + pts[1].x) / 2,
          midY: (pts[0].y + pts[1].y) / 2,
        };
      } else {
        gestureRef.current = { type: "pan", pane: i, startX: e.clientX, startY: e.clientY, panX0: pd.panX, panY0: pd.panY };
      }
      return;
    }
    if (tool === "eraser") {
      eraseAt(i, p);
      return;
    }
    if (tool === "angle") {
      const cur = pendingAngle && pendingAngle.pane === i ? pendingAngle.pts : [];
      const pts = [...cur, p];
      if (pts.length >= 3) {
        commitShape(i, { id: shapeSeq++, tool: "angle", color, width: strokeW, points: pts });
        setPendingAngle(null);
        setPreview(null);
      } else {
        setPendingAngle({ pane: i, pts });
        say(pts.length === 1 ? "각도: 꼭짓점을 탭하세요 (2/3)" : "각도: 마지막 점을 탭하세요 (3/3)");
      }
      return;
    }
    if (tool === "text") {
      const t = window.prompt("표시할 텍스트를 입력하세요");
      if (t && t.trim()) commitShape(i, { id: shapeSeq++, tool: "text", color, width: strokeW, points: [p], text: t.trim() });
      return;
    }
    // 드래그형 도구
    gestureRef.current = { type: "draw", pane: i, tool: tool as ShapeTool, pts: [p] };
  }

  function onPaneMove(i: number, e: React.PointerEvent<HTMLDivElement>) {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    const g = gestureRef.current;
    const p = paneNorm(i, e.clientX, e.clientY);

    // 각도 도구 미리보기 (탭 전 호버)
    if (tool === "angle" && pendingAngle && pendingAngle.pane === i && !g) {
      setPreview({
        pane: i,
        shape: { id: 0, tool: "angle", color, width: strokeW, points: [...pendingAngle.pts, p] },
      });
      return;
    }
    if (!g) return;

    if (g.type === "scrub") {
      const v = videoEls.current[g.pane];
      const pd = panesRef.current[g.pane];
      if (!v || !pd.duration) return;
      const w = paneEls.current[g.pane]?.getBoundingClientRect().width || 300;
      // 화면 전체 폭 스와이프 = 영상 길이의 절반 → 정밀한 프레임 탐색
      const t = g.t0 + ((e.clientX - g.startX) / w) * pd.duration * 0.5;
      v.currentTime = Math.min(pd.duration, Math.max(0, t));
      uiTick();
      return;
    }
    if (g.type === "pan") {
      setPane(g.pane, { panX: g.panX0 + (e.clientX - g.startX), panY: g.panY0 + (e.clientY - g.startY) });
      return;
    }
    if (g.type === "pinch") {
      const pts = Array.from(pointersRef.current.values());
      if (pts.length < 2) return;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      setPane(g.pane, {
        zoom: Math.min(8, Math.max(0.4, g.zoom0 * (dist / Math.max(1, g.startDist)))),
        panX: g.panX0 + (midX - g.midX),
        panY: g.panY0 + (midY - g.midY),
      });
      return;
    }
    if (g.type === "draw") {
      if (g.tool === "free") g.pts.push(p);
      else g.pts = [g.pts[0], p];
      setPreview({ pane: g.pane, shape: { id: 0, tool: g.tool, color, width: strokeW, points: [...g.pts] } });
    }
  }

  function onPaneUp(i: number, e: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(e.pointerId);
    const g = gestureRef.current;
    if (g && g.type === "draw") {
      const pts = g.pts;
      const moved =
        pts.length > 1 &&
        Math.hypot(pts[pts.length - 1].x - pts[0].x, pts[pts.length - 1].y - pts[0].y) > 0.004;
      if (g.tool === "vline" || g.tool === "hline" || moved || (g.tool === "free" && pts.length > 2)) {
        const finalPts = g.tool === "vline" || g.tool === "hline" ? [pts[pts.length - 1]] : pts;
        commitShape(g.pane, { id: shapeSeq++, tool: g.tool, color, width: strokeW, points: finalPts });
      }
      setPreview(null);
    }
    if (pointersRef.current.size === 0) gestureRef.current = null;
  }

  function onPaneWheel(i: number, e: React.WheelEvent) {
    if (!panesRef.current[i].url) return;
    zoomBy(i, e.deltaY < 0 ? 1.08 : 0.93);
  }

  // 커서 위치 추적 (녹화 영상에 빨간 포인터로 합성)
  function onStageMove(e: React.PointerEvent) {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    cursorRef.current = {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
      inside: true,
    };
  }

  // ---------- 캔버스 그리기 ----------
  useEffect(() => {
    for (const i of [0, 1]) {
      const c = canvasEls.current[i];
      const host = paneEls.current[i];
      if (!c || !host) continue;
      const dpr = window.devicePixelRatio || 1;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (c.width !== w * dpr || c.height !== h * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      const ctx = c.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      renderShapes(ctx, shapes[i], w, h);
      if (preview && preview.pane === i) renderShape(ctx, preview.shape, w, h);
      else if (pendingAngle && pendingAngle.pane === i) {
        renderShape(ctx, { id: 0, tool: "angle", color, width: strokeW, points: pendingAngle.pts }, w, h);
      }
    }
  }, [shapes, preview, pendingAngle, mode, sizeTick, color, strokeW]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setSizeTick((t) => t + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---------- 녹화 (프로 전용) ----------
  async function startRecording() {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const scale = Math.min(2, Math.max(1, 1280 / rect.width));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let audio: MediaStream | null = null;
    try {
      audio = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      say("마이크 권한이 없어 무음으로 녹화합니다");
    }

    const stream = canvas.captureStream(30);
    if (audio) audio.getAudioTracks().forEach((t) => stream.addTrack(t));
    const mime =
      ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find(
        (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)
      ) || "";
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : undefined);
    } catch {
      say("이 브라우저는 녹화를 지원하지 않아요. 크롬/엣지를 사용해 주세요.");
      audio?.getTracks().forEach((t) => t.stop());
      return;
    }
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mime || "video/webm" });
      setRecUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
      setRecModal(true);
      audio?.getTracks().forEach((t) => t.stop());
    };

    const compose = () => {
      const stageRect = stage.getBoundingClientRect();
      ctx.fillStyle = "#0b0e12";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const visible = panesRef.current[1].url && paneEls.current[1]?.offsetParent ? [0, 1] : [0];
      for (const i of visible) {
        const host = paneEls.current[i];
        const pd = panesRef.current[i];
        if (!host || !pd.url) continue;
        const hr = host.getBoundingClientRect();
        const rx = (hr.left - stageRect.left) * scale;
        const ry = (hr.top - stageRect.top) * scale;
        const rw = hr.width * scale;
        const rh = hr.height * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();
        const v = videoEls.current[i];
        if (v && v.videoWidth > 0) {
          // 화면과 동일한 contain-fit + 사용자의 줌/이동/반전 변환을 재현
          const s0 = Math.min(rw / v.videoWidth, rh / v.videoHeight);
          const dw = v.videoWidth * s0 * pd.zoom;
          const dh = v.videoHeight * s0 * pd.zoom;
          const cx = rx + rw / 2 + pd.panX * scale;
          const cy = ry + rh / 2 + pd.panY * scale;
          ctx.save();
          ctx.translate(cx, cy);
          if (pd.flip) ctx.scale(-1, 1);
          try {
            ctx.drawImage(v, -dw / 2, -dh / 2, dw, dh);
          } catch {
            // CORS 미허용 영상은 프레임 합성이 막힐 수 있음
          }
          ctx.restore();
        }
        ctx.translate(rx, ry);
        renderShapes(ctx, shapesRef.current[i], rw, rh);
        ctx.restore();
        if (visible.length > 1 && i === 0) {
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx + rw, ry);
          ctx.lineTo(rx + rw, ry + rh);
          ctx.stroke();
        }
      }
      // 커서 포인터
      const cur = cursorRef.current;
      if (cur.inside) {
        const cx = cur.x * canvas.width;
        const cy = cur.y * canvas.height;
        ctx.beginPath();
        ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff3b30";
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 3 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "#ff3b30";
        ctx.fill();
      }
      recRef.current.raf = requestAnimationFrame(compose);
    };

    recRef.current = { recorder, raf: requestAnimationFrame(compose), timer: null, audio };
    recorder.start(1000);
    setRecSec(0);
    recRef.current.timer = setInterval(() => setRecSec((s) => s + 1), 1000);
    setRecState("rec");
  }

  function stopRecording() {
    const r = recRef.current;
    cancelAnimationFrame(r.raf);
    clearInterval(r.timer);
    r.recorder?.stop();
    setRecState("idle");
  }

  useEffect(() => {
    return () => {
      // 언마운트 정리
      cancelAnimationFrame(recRef.current.raf);
      clearInterval(recRef.current.timer);
      recRef.current.audio?.getTracks().forEach((t) => t.stop());
      for (const pd of panesRef.current) {
        if (pd.isLocal && pd.url) URL.revokeObjectURL(pd.url);
      }
    };
  }, []);

  // ---------- 키보드 단축키 (프로 전용) ----------
  useEffect(() => {
    if (!isPro) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepFrame(1, e.shiftKey ? 10 : 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepFrame(-1, e.shiftKey ? 10 : 1);
      } else if (e.key === "i" || e.key === "I") {
        markIn(activePane);
      } else if (e.key === "o" || e.key === "O") {
        markOut(activePane);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, playing, activePane, fps, masterDur]);

  // 도구 바꾸면 진행 중이던 각도 입력은 취소
  useEffect(() => {
    setPendingAngle(null);
    setPreview(null);
  }, [tool]);

  const masterVideo = videoEls.current[masterIdx];
  const masterTime = masterVideo ? masterVideo.currentTime : 0;
  const anyLoaded = panes[0].url || panes[1].url;

  const visibleTools = TOOLS.filter((t) => isPro || !t.proOnly);

  // ---------- 트림(싱크) 컨트롤 한 벌 ----------
  function TrimRow({ i }: { i: number }) {
    const pd = panes[i];
    const v = videoEls.current[i];
    if (!pd.url) return null;
    const cur = v?.currentTime ?? 0;
    return (
      <div className="sw-trim-row">
        <span className={`sw-trim-tag ${activePane === i ? "on" : ""}`}>{i === 0 ? "A" : "B"}</span>
        <div className="sw-trim-bar">
          <div
            className="sw-trim-range"
            style={{
              left: `${(pd.inPt / Math.max(0.01, pd.duration)) * 100}%`,
              width: `${((pd.outPt - pd.inPt) / Math.max(0.01, pd.duration)) * 100}%`,
            }}
          />
          <div
            className="sw-trim-cursor"
            style={{ left: `${(cur / Math.max(0.01, pd.duration)) * 100}%` }}
          />
        </div>
        <span className="sw-trim-time">{formatTime(cur)}</span>
        <button className="sw-mini-btn" onClick={() => nudgePane(i, -1)} title="이 영상만 1프레임 뒤로">
          -1f
        </button>
        <button className="sw-mini-btn" onClick={() => nudgePane(i, 1)} title="이 영상만 1프레임 앞으로">
          +1f
        </button>
        <button className="sw-mini-btn accent" onClick={() => markIn(i)}>
          ⇤ 시작점
        </button>
        <button className="sw-mini-btn accent" onClick={() => markOut(i)}>
          끝점 ⇥
        </button>
        <button className="sw-mini-btn" onClick={() => resetTrim(i)}>
          초기화
        </button>
      </div>
    );
  }

  // ---------- 모바일 구간 편집: 드래그 핸들 트랙 ----------
  function EditTrack({ i }: { i: number }) {
    const pd = panes[i];
    const v = videoEls.current[i];
    const dur = Math.max(0.01, pd.duration);
    const cur = v?.currentTime ?? 0;

    function timeAt(clientX: number, el: HTMLElement) {
      const r = el.getBoundingClientRect();
      return Math.min(dur, Math.max(0, ((clientX - r.left) / r.width) * dur));
    }
    function apply(t: number, target: "in" | "out" | "seek") {
      const cpd = panesRef.current[i];
      const vv = videoEls.current[i];
      if (target === "in") {
        const nt = Math.min(t, cpd.outPt - MIN_TRIM);
        setPane(i, { inPt: nt });
        if (vv) vv.currentTime = nt; // 핸들을 끌면 그 프레임이 바로 보인다
      } else if (target === "out") {
        const nt = Math.max(t, cpd.inPt + MIN_TRIM);
        setPane(i, { outPt: nt });
        if (vv) vv.currentTime = nt;
      } else if (vv) {
        vv.currentTime = t;
      }
      uiTick();
    }
    return (
      <div
        className="sw-edit-track"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          const t = timeAt(e.clientX, e.currentTarget);
          const nearIn = Math.abs(t - pd.inPt) / dur < 0.07;
          const nearOut = Math.abs(t - pd.outPt) / dur < 0.07;
          editDragRef.current =
            nearIn && nearOut
              ? t < (pd.inPt + pd.outPt) / 2
                ? "in"
                : "out"
              : nearIn
                ? "in"
                : nearOut
                  ? "out"
                  : "seek";
          apply(t, editDragRef.current);
        }}
        onPointerMove={(e) => {
          if (editDragRef.current) apply(timeAt(e.clientX, e.currentTarget), editDragRef.current);
        }}
        onPointerUp={() => (editDragRef.current = null)}
        onPointerCancel={() => (editDragRef.current = null)}
      >
        <div className="sw-edit-dim" style={{ left: 0, width: `${(pd.inPt / dur) * 100}%` }} />
        <div className="sw-edit-dim" style={{ left: `${(pd.outPt / dur) * 100}%`, right: 0 }} />
        <div
          className="sw-edit-range"
          style={{ left: `${(pd.inPt / dur) * 100}%`, width: `${((pd.outPt - pd.inPt) / dur) * 100}%` }}
        />
        <div className="sw-edit-cursor" style={{ left: `${(cur / dur) * 100}%` }} />
        <div className="sw-edit-handle in" style={{ left: `${(pd.inPt / dur) * 100}%` }}>
          <span>시작</span>
        </div>
        <div className="sw-edit-handle out" style={{ left: `${(pd.outPt / dur) * 100}%` }}>
          <span>끝</span>
        </div>
      </div>
    );
  }

  const editorOpen = !isPro && editorPane !== null;

  return (
    <div className={`sw-root ${isPro ? "sw-pro" : "sw-member"}`}>
      {/* ===== 상단 바 ===== */}
      {!editorOpen && (
      <header className="sw-header">
        <div className="sw-header-left">
          {isPro && <span className="sw-logo">SWING STUDIO</span>}
          <div className="sw-mode-toggle">
            <button className={mode === "single" ? "on" : ""} onClick={() => setMode("single")}>
              단독
            </button>
            <button className={mode === "compare" ? "on" : ""} onClick={() => setMode("compare")}>
              비교
            </button>
          </div>
        </div>
        <div className="sw-header-right">
          <button className="sw-load-btn" onClick={() => fileEls.current[0]?.click()}>
            영상 A
          </button>
          {mode === "compare" && (
            <button className="sw-load-btn" onClick={() => fileEls.current[1]?.click()}>
              영상 B
            </button>
          )}
          {isPro && (
            <button className="sw-load-btn" onClick={() => loadUrlPrompt(mode === "compare" && panes[0].url ? 1 : 0)}>
              URL
            </button>
          )}
          <button className={`sw-load-btn ${sound ? "on" : ""}`} onClick={() => setSound((s) => !s)} title="영상 소리 켜기/끄기">
            소리
          </button>
          {isPro && (
            <>
              <button
                className="sw-load-btn"
                onClick={() => setFps((f) => (f === 30 ? 60 : 30))}
                title="프레임 단위 이동 기준"
              >
                {fps}fps
              </button>
              {recState === "idle" ? (
                <button className="sw-rec-btn" onClick={startRecording} disabled={!anyLoaded}>
                  ● REC
                </button>
              ) : (
                <button className="sw-rec-btn recording" onClick={stopRecording}>
                  ■ {formatTime(recSec)}
                </button>
              )}
              {recUrl && recState === "idle" && (
                <button className="sw-load-btn on" onClick={() => setRecModal(true)}>
                  녹화본
                </button>
              )}
            </>
          )}
        </div>
      </header>
      )}

      <div className="sw-main">
        {/* ===== 도구 레일 ===== */}
        {!isPro && !railOpen && !editorOpen && (
          <button className="sw-rail-fab" onClick={() => setRailOpen(true)} title="도구 열기">
            ✎
          </button>
        )}
        <aside className="sw-toolrail" style={!isPro && (!railOpen || editorOpen) ? { display: "none" } : undefined}>
          {!isPro && (
            <button className="sw-tool" onClick={() => setRailOpen(false)} title="도구 접기">
              <span className="sw-tool-icon">✕</span>
            </button>
          )}
          {visibleTools.map((t) => (
            <button
              key={t.id}
              className={`sw-tool ${tool === t.id ? "on" : ""}`}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <span className="sw-tool-icon">{t.icon}</span>
              {isPro && <span className="sw-tool-label">{t.label}</span>}
            </button>
          ))}
          <div className="sw-rail-div" />
          <button className="sw-tool" onClick={undo} disabled={history.length === 0} title="되돌리기">
            <span className="sw-tool-icon">↶</span>
            {isPro && <span className="sw-tool-label">되돌리기</span>}
          </button>
          <button className="sw-tool" onClick={redo} disabled={redoStack.length === 0} title="다시 실행">
            <span className="sw-tool-icon">↷</span>
            {isPro && <span className="sw-tool-label">다시</span>}
          </button>
          <button className="sw-tool" onClick={clearAll} title="모두 지우기">
            <span className="sw-tool-icon">⌧</span>
            {isPro && <span className="sw-tool-label">전체삭제</span>}
          </button>
          <div className="sw-rail-div" />
          <div className="sw-colors">
            {SWING_COLORS.map((c) => (
              <button
                key={c}
                className={`sw-color ${color === c ? "on" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="sw-widths">
            {[2.5, 4, 7].map((w) => (
              <button
                key={w}
                className={`sw-width ${strokeW === w ? "on" : ""}`}
                onClick={() => setStrokeW(w)}
              >
                <span style={{ height: w, width: 18, background: "currentColor", borderRadius: 4, display: "block" }} />
              </button>
            ))}
          </div>
        </aside>

        {/* ===== 스테이지 (영상 + 드로잉) ===== */}
        <div className="sw-stage" ref={stageRef} onPointerMove={onStageMove} onPointerLeave={() => (cursorRef.current.inside = false)}>
          {paneIndices.map((i) => {
            const pd = panes[i];
            const hiddenPane = editorOpen && editorPane !== i;
            return (
              <div
                key={i}
                className={`sw-pane ${mode === "compare" && activePane === i && !editorOpen ? "active" : ""}`}
                style={hiddenPane ? { display: "none" } : undefined}
                ref={(el) => { paneEls.current[i] = el; }}
                onPointerDown={(e) => onPaneDown(i, e)}
                onPointerMove={(e) => onPaneMove(i, e)}
                onPointerUp={(e) => onPaneUp(i, e)}
                onPointerCancel={(e) => onPaneUp(i, e)}
                onWheel={(e) => onPaneWheel(i, e)}
                onDoubleClick={() => resetView(i)}
              >
                {pd.url ? (
                  <>
                    <video
                      ref={(el) => { videoEls.current[i] = el; }}
                      key={pd.url}
                      src={pd.url}
                      crossOrigin="anonymous"
                      playsInline
                      muted={!sound}
                      preload="auto"
                      onLoadedMetadata={() => onMeta(i)}
                      style={{
                        transform: `translate(${pd.panX}px, ${pd.panY}px) scale(${pd.flip ? -pd.zoom : pd.zoom}, ${pd.zoom})`,
                      }}
                    />
                    <canvas className="sw-canvas" ref={(el) => { canvasEls.current[i] = el; }} />
                    <div className="sw-pane-badges">
                      {mode === "compare" && <span className="sw-pane-tag">{i === 0 ? "A" : "B"}</span>}
                      <span className="sw-pane-zoom">{Math.round(pd.zoom * 100)}%</span>
                      <button className="sw-mini-btn" onClick={() => zoomBy(i, 1.2)}>＋</button>
                      <button className="sw-mini-btn" onClick={() => zoomBy(i, 1 / 1.2)}>－</button>
                      <button
                        className={`sw-mini-btn ${pd.flip ? "on" : ""}`}
                        onClick={() => toggleFlip(i)}
                        title="좌우 반전 (왼손↔오른손 비교)"
                      >
                        ⇋
                      </button>
                      <button className="sw-mini-btn" onClick={() => resetView(i)}>⟲</button>
                    </div>
                  </>
                ) : (
                  <button className="sw-empty" onClick={() => fileEls.current[i]?.click()}>
                    <span className="sw-empty-icon">＋</span>
                    <span>영상 {mode === "compare" ? (i === 0 ? "A" : "B") + " " : ""}불러오기</span>
                    <span className="sw-empty-sub">탭해서 갤러리/파일에서 선택</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 모바일: 구간 편집 패널 ===== */}
      {editorOpen && editorPane !== null && (
        <div className="sw-editor">
          <div className="sw-editor-top">
            <span className="sw-editor-title">스윙 구간 맞추기</span>
            {mode === "compare" && panes[0].url && panes[1].url && (
              <div className="sw-mode-toggle">
                <button className={editorPane === 0 ? "on" : ""} onClick={() => setEditorPane(0)}>
                  영상 A
                </button>
                <button className={editorPane === 1 ? "on" : ""} onClick={() => setEditorPane(1)}>
                  영상 B
                </button>
              </div>
            )}
            <button
              className="sw-editor-done"
              onClick={() => {
                setEditorPane(null);
                seekAll(0);
              }}
            >
              완료
            </button>
          </div>
          <p className="sw-editor-hint">
            영상을 좌우로 문지르면 프레임 단위로 움직여요. 아래 핸들을 끌어 스윙 시작·끝을 지정하세요.
          </p>
          <EditTrack i={editorPane} />
          <div className="sw-editor-times">
            <span>시작 {formatTime(panes[editorPane].inPt)}</span>
            <span className="cur">{formatTime(videoEls.current[editorPane]?.currentTime ?? 0)}</span>
            <span>끝 {formatTime(panes[editorPane].outPt)}</span>
          </div>
          <div className="sw-editor-actions">
            <button className="sw-ctrl-btn" onClick={() => nudgePane(editorPane, -1)}>
              ◀ 1프레임
            </button>
            <button className="sw-ctrl-btn" onClick={() => nudgePane(editorPane, 1)}>
              1프레임 ▶
            </button>
            <button className="sw-ctrl-btn mark" onClick={() => markIn(editorPane)}>
              여기서 시작
            </button>
            <button className="sw-ctrl-btn mark" onClick={() => markOut(editorPane)}>
              여기서 끝
            </button>
          </div>
        </div>
      )}

      {/* ===== 모바일: 비교는 가로 전용 ===== */}
      {!isPro && mode === "compare" && isPortrait && !editorOpen && (
        <div className="sw-rotate">
          <span className="sw-rotate-icon">⟳</span>
          <b>가로 화면으로 돌려주세요</b>
          <span>2영상 비교는 가로 모드에서 사용할 수 있습니다</span>
          <button onClick={() => setMode("single")}>단독 분석으로 전환</button>
        </div>
      )}

      {/* ===== 하단 컨트롤 ===== */}
      {!editorOpen && (
      <footer className="sw-footer">
        {toast && <div className="sw-toast">{toast}</div>}
        {tool === "angle" && !pendingAngle && (
          <div className="sw-toast dim">각도 측정: 점 3개를 순서대로 탭 (끝점 → 꼭짓점 → 끝점)</div>
        )}

        <div className="sw-scrub-row">
          <input
            className="sw-scrubber"
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onPointerDown={() => playing && pauseAll()}
            onChange={(e) => seekAll(Number(e.target.value) / 1000)}
            disabled={!anyLoaded}
          />
        </div>

        <div className="sw-ctrl-row">
          <div className="sw-ctrl-group">
            <button className="sw-ctrl-btn" onClick={() => stepFrame(-1)} disabled={!anyLoaded} title="1프레임 뒤로">
              ◀|
            </button>
            <button className="sw-play-btn" onClick={togglePlay} disabled={!anyLoaded}>
              {playing ? "❚❚" : "▶"}
            </button>
            <button className="sw-ctrl-btn" onClick={() => stepFrame(1)} disabled={!anyLoaded} title="1프레임 앞으로">
              |▶
            </button>
            <button
              className={`sw-ctrl-btn ${loop ? "on" : ""}`}
              onClick={() => setLoop((l) => !l)}
              title="구간 반복"
            >
              반복
            </button>
            <span className="sw-time">
              {formatTime(masterTime)} <em>/ 구간 {formatTime(masterDur)}</em>
            </span>
          </div>
          <div className="sw-ctrl-group">
            {isPro ? (
              SPEEDS.map((s) => (
                <button key={s} className={`sw-speed ${speed === s ? "on" : ""}`} onClick={() => setSpeed(s)}>
                  {s}x
                </button>
              ))
            ) : (
              // 모바일: 배속 순환 버튼 하나로 컨트롤 최소화
              <button
                className="sw-ctrl-btn"
                onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
                title="재생 속도"
              >
                {speed}x
              </button>
            )}
            {isPro ? (
              <button
                className={`sw-ctrl-btn ${trimOpen ? "on" : ""}`}
                onClick={() => setTrimOpen((o) => !o)}
                disabled={!anyLoaded}
                title="스윙 구간(IN/OUT)·싱크 패널"
              >
                구간·싱크
              </button>
            ) : (
              <button
                className="sw-sync-open"
                onClick={() => {
                  if (playing) pauseAll();
                  setEditorPane(panes[activePane].url ? activePane : masterIdx);
                }}
                disabled={!anyLoaded}
              >
                구간·싱크
              </button>
            )}
          </div>
        </div>

        {/* 프로: 트림 컨트롤 (접이식) */}
        {isPro && anyLoaded && trimOpen && (
          <div className="sw-trim-panel">
            <TrimRow i={0} />
            {mode === "compare" && <TrimRow i={1} />}
            <p className="sw-trim-hint">
              영상별 −1f/+1f로 프레임을 찾아 시작점·끝점을 지정하면 두 영상의 스윙 구간이 같은 타이밍으로 재생됩니다.
              Space 재생 · ←/→ 프레임 · I/O 시작·끝점 · Ctrl+Z 되돌리기
            </p>
          </div>
        )}
      </footer>
      )}

      {/* ===== 프로: 녹화 결과 모달 ===== */}
      {isPro && recModal && recUrl && (
        <div className="sw-sheet-overlay" onClick={() => setRecModal(false)}>
          <div className="sw-rec-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sw-sheet-title">레슨 영상 녹화 완료</div>
            <video src={recUrl} controls playsInline />
            <div className="sw-rec-actions">
              <a className="sw-rec-download" href={recUrl} download={`swing-lesson-${new Date().toISOString().slice(0, 10)}.webm`}>
                영상 다운로드
              </a>
              <button className="sw-sheet-close" onClick={() => setRecModal(false)}>
                닫기
              </button>
            </div>
            <p className="sw-sheet-sub">
              다운로드한 파일을 관리자 화면의 피드백 영상으로 업로드하면 회원에게 그대로 전달돼요.
            </p>
          </div>
        </div>
      )}

      {/* 숨은 파일 입력 */}
      {[0, 1].map((i) => (
        <input
          key={i}
          ref={(el) => { fileEls.current[i] = el; }}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(i, f);
            e.target.value = "";
          }}
        />
      ))}
    </div>
  );
}
