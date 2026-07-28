"use client";

// ============================================================
// 스윙분석 엔진 훅 — 영상 재생·싱크, 드로잉, 확대·이동, 녹화를 한 곳에서 관리한다.
// 화면 배치는 StudioWorkbench 가 맡고, 이 훅은 동작만 책임진다.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pt,
  Shape,
  ShapeTool,
  ToolId,
  hitTest,
  renderShape,
  renderShapes,
} from "@/lib/swing/draw";
import { commonRange, timeAt, relativeAt, isSynced } from "@/lib/swing/sync";

export type Pane = {
  url: string | null;
  label: string;      // "오늘 07.28 · 드라이버 정면"
  isLocal: boolean;   // ObjectURL 이면 정리 대상
  duration: number;
  sync: number;       // 싱크 지점(초)
  zoom: number;
  panX: number;
  panY: number;
  flip: boolean;
};

type HistEntry = { type: "add" | "remove"; pane: number; shape: Shape };

type Gesture =
  | { type: "pan"; pane: number; x0: number; y0: number; px: number; py: number }
  | { type: "pinch"; pane: number; d0: number; z0: number; px: number; py: number; mx: number; my: number }
  | { type: "draw"; pane: number; tool: ShapeTool; pts: Pt[] }
  | null;

const emptyPane = (): Pane => ({
  url: null, label: "", isLocal: false, duration: 0,
  sync: 0, zoom: 1, panX: 0, panY: 0, flip: false,
});

let shapeSeq = 1;

export function useAnalyzer() {
  const [panes, setPanes] = useState<[Pane, Pane]>(() => [emptyPane(), emptyPane()]);
  const [shapes, setShapes] = useState<[Shape[], Shape[]]>([[], []]);
  const [history, setHistory] = useState<HistEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistEntry[]>([]);

  const [tool, setTool] = useState<ToolId>("pan");
  const [color, setColor] = useState("#ffd60a");
  const [strokeW, setStrokeW] = useState(4);
  // 하나 그리면 이동으로 돌아간다. 확대한 화면을 끌어 옮기려다 선이 그어지는 걸 막는다.
  // 여러 개를 연달아 그릴 때는 '연속'을 켜서 도구를 고정할 수 있다.
  const [oneShot, setOneShot] = useState(true);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0.25);
  const [loop, setLoop] = useState(true);
  const [fps, setFps] = useState(60);
  const [sound, setSound] = useState(false);

  const [activePane, setActivePane] = useState(0);
  const [pendingAngle, setPendingAngle] = useState<{ pane: number; pts: Pt[] } | null>(null);
  const [preview, setPreview] = useState<{ pane: number; shape: Shape } | null>(null);
  const [sizeTick, setSizeTick] = useState(0);
  const [, forceTick] = useState(0);

  // 녹화
  const [recState, setRecState] = useState<"idle" | "rec">("idle");
  const [recSec, setRecSec] = useState(0);
  const [recBlob, setRecBlob] = useState<Blob | null>(null);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [level, setLevel] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const paneEls = useRef<(HTMLDivElement | null)[]>([null, null]);
  const videoEls = useRef<(HTMLVideoElement | null)[]>([null, null]);
  const canvasEls = useRef<(HTMLCanvasElement | null)[]>([null, null]);

  const panesRef = useRef(panes);
  const shapesRef = useRef(shapes);
  const loopRef = useRef(loop);
  const progressRef = useRef(progress);
  const playingRef = useRef(playing);
  const gestureRef = useRef<Gesture>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const cursorRef = useRef({ x: 0, y: 0, inside: false });
  const seekQ = useRef([
    { seeking: false, target: null as number | null },
    { seeking: false, target: null as number | null },
  ]);
  const monitorRef = useRef<{ ctx: AudioContext | null; stream: MediaStream | null; raf: number }>({
    ctx: null, stream: null, raf: 0,
  });
  const recRef = useRef<{ rec: MediaRecorder | null; raf: number; timer: any; audio: MediaStream | null }>({
    rec: null, raf: 0, timer: null, audio: null,
  });

  useEffect(() => { panesRef.current = panes; }, [panes]);
  useEffect(() => { shapesRef.current = shapes; }, [shapes]);
  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  const oneShotRef = useRef(oneShot);
  useEffect(() => { oneShotRef.current = oneShot; }, [oneShot]);

  const uiTickPending = useRef(false);
  const uiTick = useCallback(() => {
    if (uiTickPending.current) return;
    uiTickPending.current = true;
    requestAnimationFrame(() => { uiTickPending.current = false; forceTick((t) => t + 1); });
  }, []);

  const compare = !!(panes[0].url && panes[1].url);
  const range = useMemo(() => commonRange(panes), [panes]);
  const synced = isSynced(panes);
  const relTime = relativeAt(progress, range);

  function patch(i: number, p: Partial<Pane>) {
    setPanes((prev) => {
      const next = [...prev] as [Pane, Pane];
      next[i] = { ...next[i], ...p };
      return next;
    });
  }

  // ---------- 시킹 큐 (모바일/저사양에서 프레임이 손가락을 따라오게) ----------
  const issueSeek = useCallback((i: number) => {
    const v = videoEls.current[i];
    const q = seekQ.current[i];
    if (!v || q.target == null) { q.seeking = false; return; }
    const t = q.target; q.target = null; q.seeking = true;
    v.currentTime = t;
  }, []);

  const requestSeek = useCallback((i: number, t: number) => {
    const v = videoEls.current[i];
    const pd = panesRef.current[i];
    if (!v || !pd.url) return;
    const q = seekQ.current[i];
    q.target = Math.min(pd.duration || t, Math.max(0, t));
    if (!q.seeking) issueSeek(i);
  }, [issueSeek]);

  const onSeeked = useCallback((i: number) => {
    const q = seekQ.current[i];
    if (q.target != null) issueSeek(i); else q.seeking = false;
    uiTick();
  }, [issueSeek, uiTick]);

  // ---------- 영상 로드 ----------
  const setPaneSource = useCallback((i: number, url: string | null, label = "", isLocal = false) => {
    const old = panesRef.current[i];
    if (old.isLocal && old.url) URL.revokeObjectURL(old.url);
    setPanes((prev) => {
      const next = [...prev] as [Pane, Pane];
      next[i] = { ...emptyPane(), url, label, isLocal };
      return next;
    });
    setShapes((prev) => {
      const next = [...prev] as [Shape[], Shape[]];
      next[i] = [];
      return next;
    });
    setHistory((h) => h.filter((e) => e.pane !== i));
    setRedoStack([]);
    setProgress(0);
  }, []);

  const loadFile = useCallback((i: number, file: File) => {
    setPaneSource(i, URL.createObjectURL(file), file.name, true);
  }, [setPaneSource]);

  function onMeta(i: number) {
    const v = videoEls.current[i];
    if (!v) return;
    if (isFinite(v.duration)) {
      patch(i, { duration: v.duration });
    } else {
      // 일부 webm 은 duration 을 Infinity 로 보고한다 → 끝으로 시킹해 실제 길이를 알아냄
      const done = () => {
        v.removeEventListener("seeked", done);
        const d = isFinite(v.duration) ? v.duration : v.currentTime;
        v.currentTime = 0;
        patch(i, { duration: d });
      };
      v.addEventListener("seeked", done);
      v.currentTime = 1e7;
    }
  }

  // SSR 로 먼저 그려진 경우 onLoadedMetadata 를 놓칠 수 있어 직접 확인
  useEffect(() => {
    for (const i of [0, 1]) {
      const v = videoEls.current[i];
      if (v && panes[i].url && !panes[i].duration && v.readyState >= 1) onMeta(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panes[0].url, panes[1].url, sizeTick]);

  // ---------- 재생 ----------
  const seek = useCallback((p: number) => {
    setProgress(p);
    const r = commonRange(panesRef.current);
    for (const i of [0, 1]) {
      const pd = panesRef.current[i];
      if (!pd.url || !pd.duration) continue;
      requestSeek(i, timeAt(pd, p, r));
    }
  }, [requestSeek]);

  const pause = useCallback(() => {
    for (const v of videoEls.current) v?.pause();
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    const r = commonRange(panesRef.current);
    let p = progressRef.current;
    if (p >= 0.999) p = 0;
    for (const i of [0, 1]) {
      const v = videoEls.current[i];
      const pd = panesRef.current[i];
      if (!v || !pd.url || !pd.duration) continue;
      v.playbackRate = speed;          // 두 영상 모두 같은 배속 → 템포 차이가 그대로 보인다
      v.currentTime = timeAt(pd, p, r);
      v.play().catch(() => {});
    }
    setProgress(p);
    setPlaying(true);
  }, [speed]);

  const togglePlay = useCallback(() => {
    if (playingRef.current) pause(); else play();
  }, [pause, play]);

  // 재생 중 진행률 추적 + 구간 끝 처리
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = 0;
    const tick = (ts: number) => {
      const ps = panesRef.current;
      const r = commonRange(ps);
      const mi = ps[0].url && ps[0].duration ? 0 : 1;
      const v = videoEls.current[mi];
      const pd = ps[mi];
      if (v && pd.url && pd.duration) {
        const start = timeAt(pd, 0, r);
        const p = (v.currentTime - start) / r.total;
        if (p >= 1 || v.ended) {
          if (loopRef.current) {
            for (const i of [0, 1]) {
              const vv = videoEls.current[i];
              const pp = ps[i];
              if (!vv || !pp.url || !pp.duration) continue;
              vv.currentTime = timeAt(pp, 0, r);
            }
            setProgress(0);
          } else {
            pause(); setProgress(1); return;
          }
        } else if (ts - last > 33) {
          last = ts;
          setProgress(Math.min(1, Math.max(0, p)));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, pause]);

  useEffect(() => {
    if (!playing) return;
    for (const v of videoEls.current) if (v) v.playbackRate = speed;
  }, [speed, playing]);

  const stepFrame = useCallback((dir: 1 | -1, n = 1) => {
    if (playingRef.current) pause();
    const r = commonRange(panesRef.current);
    const dp = ((1 / fps) * n) / r.total;
    seek(Math.min(1, Math.max(0, progressRef.current + dir * dp)));
  }, [fps, pause, seek]);

  /** 이 영상만 프레임 단위로 움직인다 (싱크 지점 찾을 때) */
  const nudgePane = useCallback((i: number, dir: 1 | -1, n = 1) => {
    if (playingRef.current) pause();
    const v = videoEls.current[i];
    const pd = panesRef.current[i];
    if (!v || !pd.url) return;
    const base = seekQ.current[i].target ?? v.currentTime;
    requestSeek(i, base + (dir * n) / fps);
    uiTick();
  }, [fps, pause, requestSeek, uiTick]);

  /**
   * 싱크 확정 — 지금 두 화면에 보이는 프레임을 "같은 순간"으로 취급한다.
   * 프로가 A를 임팩트에, B를 임팩트에 맞춰둔 뒤 버튼 한 번만 누르면 끝난다.
   */
  const markSyncNow = useCallback(() => {
    if (playingRef.current) pause();
    setPanes((prev) => {
      const next = [...prev] as [Pane, Pane];
      for (const i of [0, 1]) {
        const v = videoEls.current[i];
        if (v && next[i].url && next[i].duration) next[i] = { ...next[i], sync: v.currentTime };
      }
      return next;
    });
    setProgress((p) => p); // 진행률은 그대로 두고 범위만 재계산되게
    requestAnimationFrame(() => {
      const r = commonRange(panesRef.current);
      const rel = 0; // 싱크 직후에는 싱크 지점(원점)에 서 있는 게 자연스럽다
      const p = (rel + r.before) / r.total;
      setProgress(p);
      for (const i of [0, 1]) {
        const pd = panesRef.current[i];
        if (pd.url && pd.duration) requestSeek(i, timeAt(pd, p, r));
      }
    });
  }, [pause, requestSeek]);

  const clearSync = useCallback(() => {
    setPanes((prev) => {
      const next = [...prev] as [Pane, Pane];
      next[0] = { ...next[0], sync: 0 };
      next[1] = { ...next[1], sync: 0 };
      return next;
    });
    setProgress(0);
    requestAnimationFrame(() => seek(0));
  }, [seek]);

  // ---------- 확대 / 이동 / 반전 ----------
  const zoomBy = useCallback((i: number, f: number) => {
    const pd = panesRef.current[i];
    patch(i, { zoom: Math.min(8, Math.max(0.4, pd.zoom * f)) });
  }, []);
  const resetView = useCallback((i: number) => patch(i, { zoom: 1, panX: 0, panY: 0 }), []);
  const toggleFlip = useCallback((i: number) => patch(i, { flip: !panesRef.current[i].flip }), []);

  // ---------- 드로잉 ----------
  function paneNorm(i: number, cx: number, cy: number): Pt {
    const el = paneEls.current[i];
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height };
  }

  function commitShape(pane: number, s: Shape) {
    setShapes((prev) => {
      const next = [...prev] as [Shape[], Shape[]];
      next[pane] = [...next[pane], s];
      return next;
    });
    setHistory((h) => [...h, { type: "add", pane, shape: s }]);
    setRedoStack([]);
    if (oneShotRef.current) setTool("pan");   // 하나 그렸으면 다시 이동 모드로
  }

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const e = h[h.length - 1];
      setShapes((prev) => {
        const next = [...prev] as [Shape[], Shape[]];
        next[e.pane] = e.type === "add"
          ? next[e.pane].filter((s) => s.id !== e.shape.id)
          : [...next[e.pane], e.shape];
        return next;
      });
      setRedoStack((r) => [...r, e]);
      return h.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const e = r[r.length - 1];
      setShapes((prev) => {
        const next = [...prev] as [Shape[], Shape[]];
        next[e.pane] = e.type === "add"
          ? [...next[e.pane], e.shape]
          : next[e.pane].filter((s) => s.id !== e.shape.id);
        return next;
      });
      setHistory((h) => [...h, e]);
      return r.slice(0, -1);
    });
  }, []);

  const clearAll = useCallback(() => {
    setShapes([[], []]); setHistory([]); setRedoStack([]);
    setPendingAngle(null); setPreview(null);
  }, []);

  function paneHandlers(i: number) {
    return {
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        if (!panesRef.current[i].url) return;
        if ((e.target as HTMLElement).closest("button")) return;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        setActivePane(i);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const p = paneNorm(i, e.clientX, e.clientY);
        const pd = panesRef.current[i];

        // 두 손가락은 어떤 도구에서든 확대·이동
        if (pointers.current.size >= 2) {
          const pts = Array.from(pointers.current.values());
          gestureRef.current = {
            type: "pinch", pane: i,
            d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
            z0: pd.zoom, px: pd.panX, py: pd.panY,
            mx: (pts[0].x + pts[1].x) / 2, my: (pts[0].y + pts[1].y) / 2,
          };
          setPreview(null);
          return;
        }
        if (tool === "pan") {
          gestureRef.current = { type: "pan", pane: i, x0: e.clientX, y0: e.clientY, px: pd.panX, py: pd.panY };
          return;
        }
        if (tool === "eraser") {
          const list = shapesRef.current[i];
          for (let k = list.length - 1; k >= 0; k--) {
            if (hitTest(list[k], p)) {
              const shape = list[k];
              setShapes((prev) => {
                const next = [...prev] as [Shape[], Shape[]];
                next[i] = next[i].filter((s) => s.id !== shape.id);
                return next;
              });
              setHistory((h) => [...h, { type: "remove", pane: i, shape }]);
              setRedoStack([]);
              break;
            }
          }
          return;
        }
        if (tool === "angle") {
          const cur = pendingAngle && pendingAngle.pane === i ? pendingAngle.pts : [];
          const pts = [...cur, p];
          if (pts.length >= 3) {
            commitShape(i, { id: shapeSeq++, tool: "angle", color, width: strokeW, points: pts });
            setPendingAngle(null); setPreview(null);
          } else setPendingAngle({ pane: i, pts });
          return;
        }
        if (tool === "text") {
          const t = window.prompt("표시할 텍스트");
          if (t?.trim()) commitShape(i, { id: shapeSeq++, tool: "text", color, width: strokeW, points: [p], text: t.trim() });
          return;
        }
        gestureRef.current = { type: "draw", pane: i, tool: tool as ShapeTool, pts: [p] };
      },

      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const g = gestureRef.current;
        const p = paneNorm(i, e.clientX, e.clientY);
        if (tool === "angle" && pendingAngle?.pane === i && !g) {
          setPreview({ pane: i, shape: { id: 0, tool: "angle", color, width: strokeW, points: [...pendingAngle.pts, p] } });
          return;
        }
        if (!g) return;
        if (g.type === "pan") {
          patch(g.pane, { panX: g.px + (e.clientX - g.x0), panY: g.py + (e.clientY - g.y0) });
        } else if (g.type === "pinch") {
          const pts = Array.from(pointers.current.values());
          if (pts.length < 2) return;
          const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
          patch(g.pane, {
            zoom: Math.min(8, Math.max(0.4, g.z0 * (d / Math.max(1, g.d0)))),
            panX: g.px + (mx - g.mx), panY: g.py + (my - g.my),
          });
        } else if (g.type === "draw") {
          if (g.tool === "free") g.pts.push(p); else g.pts = [g.pts[0], p];
          setPreview({ pane: g.pane, shape: { id: 0, tool: g.tool, color, width: strokeW, points: [...g.pts] } });
        }
      },

      onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
        pointers.current.delete(e.pointerId);
        const g = gestureRef.current;
        if (g?.type === "draw") {
          const pts = g.pts;
          const moved = pts.length > 1 &&
            Math.hypot(pts[pts.length - 1].x - pts[0].x, pts[pts.length - 1].y - pts[0].y) > 0.004;
          if (g.tool === "vline" || g.tool === "hline" || moved || (g.tool === "free" && pts.length > 2)) {
            const fin = g.tool === "vline" || g.tool === "hline" ? [pts[pts.length - 1]] : pts;
            commitShape(g.pane, { id: shapeSeq++, tool: g.tool, color, width: strokeW, points: fin });
          }
          setPreview(null);
        }
        if (pointers.current.size === 0) gestureRef.current = null;
      },

      onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size === 0) gestureRef.current = null;
        setPreview(null);
      },

      onWheel: (e: React.WheelEvent) => {
        if (!panesRef.current[i].url) return;
        zoomBy(i, e.deltaY < 0 ? 1.08 : 0.93);
      },

      onDoubleClick: () => resetView(i),
    };
  }

  // ---------- 캔버스 렌더 ----------
  useEffect(() => {
    for (const i of [0, 1]) {
      const c = canvasEls.current[i], host = paneEls.current[i];
      if (!c || !host) continue;
      const dpr = window.devicePixelRatio || 1;
      const w = host.clientWidth, h = host.clientHeight;
      if (c.width !== w * dpr || c.height !== h * dpr) { c.width = w * dpr; c.height = h * dpr; }
      const ctx = c.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      renderShapes(ctx, shapes[i], w, h);
      if (preview?.pane === i) renderShape(ctx, preview.shape, w, h);
      else if (pendingAngle?.pane === i) {
        renderShape(ctx, { id: 0, tool: "angle", color, width: strokeW, points: pendingAngle.pts }, w, h);
      }
    }
  }, [shapes, preview, pendingAngle, sizeTick, color, strokeW, compare]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setSizeTick((t) => t + 1));
    ro.observe(el);
    for (const p of paneEls.current) if (p) ro.observe(p);
    return () => ro.disconnect();
  }, [compare]);

  useEffect(() => { setPendingAngle(null); setPreview(null); }, [tool]);

  // ---------- 마이크 목록 + 레벨 미터 ----------
  const startMonitor = useCallback(async (id?: string) => {
    stopMonitor();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: id ? { deviceId: { exact: id }, echoCancellation: true, noiseSuppression: true }
                  : { echoCancellation: true, noiseSuppression: true },
      });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const loopFn = () => {
        an.getByteTimeDomainData(buf);
        let peak = 0;
        for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128) / 128);
        setLevel((prev) => Math.max(peak, prev * 0.82));   // 살짝 감쇠시켜 자연스럽게
        monitorRef.current.raf = requestAnimationFrame(loopFn);
      };
      monitorRef.current = { ctx, stream, raf: requestAnimationFrame(loopFn) };
      const list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput");
      setDevices(list);
      if (!id && list[0]) setDeviceId(list[0].deviceId);
    } catch {
      setDevices([]); setLevel(0);
    }
  }, []);

  function stopMonitor() {
    const m = monitorRef.current;
    cancelAnimationFrame(m.raf);
    m.stream?.getTracks().forEach((t) => t.stop());
    m.ctx?.close().catch(() => {});
    monitorRef.current = { ctx: null, stream: null, raf: 0 };
    setLevel(0);
  }

  const selectDevice = useCallback((id: string) => {
    setDeviceId(id);
    startMonitor(id);
  }, [startMonitor]);

  // ---------- 녹화 ----------
  const startRec = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const scale = Math.min(2, Math.max(1, 1600 / rect.width));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let audio: MediaStream | null = null;
    try {
      audio = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true }
                        : { echoCancellation: true, noiseSuppression: true },
      });
    } catch { /* 마이크 없이 무음 녹화 */ }

    const stream = canvas.captureStream(30);
    audio?.getAudioTracks().forEach((t) => stream.addTrack(t));
    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) || "";
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8_000_000 } : undefined);
    } catch {
      audio?.getTracks().forEach((t) => t.stop());
      return;
    }
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime || "video/webm" });
      setRecBlob(blob);
      setRecUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
      audio?.getTracks().forEach((t) => t.stop());
    };

    const compose = () => {
      const sr = stage.getBoundingClientRect();
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const i of [0, 1]) {
        const host = paneEls.current[i];
        const pd = panesRef.current[i];
        if (!host || !pd.url || !host.offsetParent) continue;
        const hr = host.getBoundingClientRect();
        const rx = (hr.left - sr.left) * scale, ry = (hr.top - sr.top) * scale;
        const rw = hr.width * scale, rh = hr.height * scale;
        ctx.save();
        ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
        const v = videoEls.current[i];
        if (v && v.videoWidth > 0) {
          const s0 = Math.min(rw / v.videoWidth, rh / v.videoHeight);
          const dw = v.videoWidth * s0 * pd.zoom, dh = v.videoHeight * s0 * pd.zoom;
          const cx = rx + rw / 2 + pd.panX * scale, cy = ry + rh / 2 + pd.panY * scale;
          ctx.save();
          ctx.translate(cx, cy);
          if (pd.flip) ctx.scale(-1, 1);
          try { ctx.drawImage(v, -dw / 2, -dh / 2, dw, dh); } catch {}
          ctx.restore();
        }
        ctx.translate(rx, ry);
        renderShapes(ctx, shapesRef.current[i], rw, rh);
        ctx.restore();
      }
      const cur = cursorRef.current;
      if (cur.inside) {
        const cx = cur.x * canvas.width, cy = cur.y * canvas.height;
        ctx.beginPath(); ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff453a"; ctx.lineWidth = 3 * scale; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 3 * scale, 0, Math.PI * 2);
        ctx.fillStyle = "#ff453a"; ctx.fill();
      }
      recRef.current.raf = requestAnimationFrame(compose);
    };

    recRef.current = { rec, raf: requestAnimationFrame(compose), timer: null, audio };
    rec.start(1000);
    setRecSec(0);
    recRef.current.timer = setInterval(() => setRecSec((s) => s + 1), 1000);
    setRecState("rec");
  }, [deviceId]);

  const stopRec = useCallback(() => {
    const r = recRef.current;
    cancelAnimationFrame(r.raf);
    clearInterval(r.timer);
    r.rec?.stop();
    setRecState("idle");
  }, []);

  const discardRec = useCallback(() => {
    setRecBlob(null);
    setRecUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
    setRecSec(0);
  }, []);

  /** 지금 이 영상에 보이는 화면(선 포함)을 이미지로 뽑는다 — 레슨 카드의 비교 이미지용 */
  const capturePane = useCallback((i: number): string | null => {
    const v = videoEls.current[i];
    const host = paneEls.current[i];
    if (!v || !host || !v.videoWidth) return null;
    const pd = panesRef.current[i];
    const w = 720;
    const h = Math.round((host.clientHeight / Math.max(1, host.clientWidth)) * w);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    const s0 = Math.min(w / v.videoWidth, h / v.videoHeight);
    const sc = w / Math.max(1, host.clientWidth);
    const dw = v.videoWidth * s0 * pd.zoom, dh = v.videoHeight * s0 * pd.zoom;
    ctx.save();
    ctx.translate(w / 2 + pd.panX * sc, h / 2 + pd.panY * sc);
    if (pd.flip) ctx.scale(-1, 1);
    try { ctx.drawImage(v, -dw / 2, -dh / 2, dw, dh); } catch { return null; }
    ctx.restore();
    renderShapes(ctx, shapesRef.current[i], w, h);
    try { return c.toDataURL("image/jpeg", 0.85); } catch { return null; }
  }, []);

  const onStageMove = useCallback((e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    cursorRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, inside: true };
  }, []);

  // ---------- 정리 ----------
  useEffect(() => () => {
    cancelAnimationFrame(recRef.current.raf);
    clearInterval(recRef.current.timer);
    recRef.current.audio?.getTracks().forEach((t) => t.stop());
    stopMonitor();
    for (const pd of panesRef.current) if (pd.isLocal && pd.url) URL.revokeObjectURL(pd.url);
  }, []);

  const currentTimeOf = (i: number) => videoEls.current[i]?.currentTime ?? 0;

  return {
    // 상태
    panes, compare, range, synced, relTime, shapes, activePane,
    tool, setTool, color, setColor, strokeW, setStrokeW, oneShot, setOneShot,
    playing, progress, speed, setSpeed, loop, setLoop, fps, setFps, sound, setSound,
    canUndo: history.length > 0, canRedo: redoStack.length > 0,
    // ref 연결
    stageRef,
    paneRef: (i: number) => (el: HTMLDivElement | null) => { paneEls.current[i] = el; },
    videoRef: (i: number) => (el: HTMLVideoElement | null) => { videoEls.current[i] = el; },
    canvasRef: (i: number) => (el: HTMLCanvasElement | null) => { canvasEls.current[i] = el; },
    // 동작
    setPaneSource, loadFile, onMeta, onSeeked, onStageMove,
    seek, togglePlay, pause, stepFrame, nudgePane,
    markSyncNow, clearSync, currentTimeOf, capturePane,
    zoomBy, resetView, toggleFlip, paneHandlers,
    undo, redo, clearAll,
    // 녹화
    rec: {
      state: recState, sec: recSec, blob: recBlob, url: recUrl,
      devices, deviceId, selectDevice, level,
      start: startRec, stop: stopRec, discard: discardRec, startMonitor,
    },
  };
}
