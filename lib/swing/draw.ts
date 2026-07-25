// ============================================================
// 스윙분석 드로잉 엔진 — 도형 타입 정의 + 캔버스 렌더링 + 히트테스트
// 좌표는 모두 화면(페인) 기준 0~1 정규화 좌표로 저장해서
// 창 크기가 바뀌거나 녹화 캔버스로 옮겨 그려도 위치가 유지된다.
// ============================================================

export type Pt = { x: number; y: number };

export type ShapeTool =
  | "line" // 직선
  | "arrow" // 화살표
  | "vline" // 수직 기준선 (플럼 라인)
  | "hline" // 수평 기준선
  | "rect" // 사각형 (스윙 플레인 박스)
  | "circle" // 원/타원 (머리 위치 등)
  | "free" // 자유 곡선
  | "angle" // 3점 각도 측정
  | "text"; // 텍스트 (프로용)

export type ToolId = ShapeTool | "pan" | "eraser";

export type Shape = {
  id: number;
  tool: ShapeTool;
  color: string;
  width: number;
  points: Pt[];
  text?: string;
};

export const SWING_COLORS = ["#ff3b30", "#34c759", "#ffcc00", "#3182f6", "#ffffff"];

export function angleDegrees(a: Pt, vertex: Pt, c: Pt): number {
  const v1 = { x: a.x - vertex.x, y: a.y - vertex.y };
  const v2 = { x: c.x - vertex.x, y: c.y - vertex.y };
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return 0;
  const cos = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number) {
  const size = Math.max(13, w * 0.026);
  ctx.font = `700 ${size}px Pretendard, -apple-system, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.4;
  ctx.fillStyle = "rgba(17,20,24,0.82)";
  const bx = x - tw / 2 - pad;
  const by = y - size / 2 - pad;
  const bw = tw + pad * 2;
  const bh = size + pad * 2;
  const r = bh / 3;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + size * 0.05);
}

function drawArrowHead(ctx: CanvasRenderingContext2D, from: Pt, to: Pt, size: number) {
  const ang = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - size * Math.cos(ang - Math.PI / 6), to.y - size * Math.sin(ang - Math.PI / 6));
  ctx.lineTo(to.x - size * Math.cos(ang + Math.PI / 6), to.y - size * Math.sin(ang + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

/** 도형 하나를 캔버스에 그린다. w/h 는 페인(그리기 영역)의 픽셀 크기. */
export function renderShape(ctx: CanvasRenderingContext2D, s: Shape, w: number, h: number) {
  const px = (p: Pt) => ({ x: p.x * w, y: p.y * h });
  const pts = s.points.map(px);
  if (pts.length === 0) return;

  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);

  switch (s.tool) {
    case "line": {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
      break;
    }
    case "arrow": {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
      drawArrowHead(ctx, pts[0], pts[1], Math.max(10, s.width * 3.5));
      break;
    }
    case "vline": {
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, 0);
      ctx.lineTo(pts[0].x, h);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case "hline": {
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, pts[0].y);
      ctx.lineTo(w, pts[0].y);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case "rect": {
      if (pts.length < 2) return;
      ctx.strokeRect(
        Math.min(pts[0].x, pts[1].x),
        Math.min(pts[0].y, pts[1].y),
        Math.abs(pts[1].x - pts[0].x),
        Math.abs(pts[1].y - pts[0].y)
      );
      break;
    }
    case "circle": {
      if (pts.length < 2) return;
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        Math.max(1, Math.abs(pts[1].x - pts[0].x) / 2),
        Math.max(1, Math.abs(pts[1].y - pts[0].y) / 2),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      break;
    }
    case "free": {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      break;
    }
    case "angle": {
      // points: [끝점A, 꼭짓점, 끝점C] — 찍는 순서대로
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(3, s.width * 1.2), 0, Math.PI * 2);
        ctx.fill();
      }
      if (pts.length === 3) {
        const deg = angleDegrees(s.points[0], s.points[1], s.points[2]);
        const v = pts[1];
        const a1 = Math.atan2(pts[0].y - v.y, pts[0].x - v.x);
        const a2 = Math.atan2(pts[2].y - v.y, pts[2].x - v.x);
        const r = Math.min(Math.hypot(pts[0].x - v.x, pts[0].y - v.y), Math.hypot(pts[2].x - v.x, pts[2].y - v.y)) * 0.4;
        let diff = a2 - a1;
        while (diff <= -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        ctx.beginPath();
        ctx.arc(v.x, v.y, Math.max(12, r), a1, a1 + diff, diff < 0);
        ctx.stroke();
        drawLabel(ctx, `${deg.toFixed(1)}°`, v.x, v.y - Math.max(24, r) - 14, w);
      }
      break;
    }
    case "text": {
      if (!s.text) return;
      const size = Math.max(15, w * 0.03);
      ctx.font = `800 ${size}px Pretendard, -apple-system, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.lineWidth = size * 0.22;
      ctx.strokeStyle = "rgba(17,20,24,0.85)";
      ctx.strokeText(s.text, pts[0].x, pts[0].y);
      ctx.fillText(s.text, pts[0].x, pts[0].y);
      break;
    }
  }
}

export function renderShapes(ctx: CanvasRenderingContext2D, shapes: Shape[], w: number, h: number) {
  for (const s of shapes) renderShape(ctx, s, w, h);
}

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** 지우개용 — 점 p(정규화 좌표)가 도형 근처인지 판정 */
export function hitTest(s: Shape, p: Pt, threshold = 0.025): boolean {
  const pts = s.points;
  if (pts.length === 0) return false;
  switch (s.tool) {
    case "vline":
      return Math.abs(p.x - pts[0].x) < threshold;
    case "hline":
      return Math.abs(p.y - pts[0].y) < threshold;
    case "text":
      return Math.hypot(p.x - pts[0].x, p.y - pts[0].y) < threshold * 4;
    case "circle": {
      if (pts.length < 2) return false;
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const rx = Math.abs(pts[1].x - pts[0].x) / 2 || 0.001;
      const ry = Math.abs(pts[1].y - pts[0].y) / 2 || 0.001;
      const norm = Math.hypot((p.x - cx) / rx, (p.y - cy) / ry);
      return Math.abs(norm - 1) < threshold / Math.min(rx, ry);
    }
    case "rect": {
      if (pts.length < 2) return false;
      const x1 = Math.min(pts[0].x, pts[1].x);
      const x2 = Math.max(pts[0].x, pts[1].x);
      const y1 = Math.min(pts[0].y, pts[1].y);
      const y2 = Math.max(pts[0].y, pts[1].y);
      const corners = [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 },
      ];
      for (let i = 0; i < 4; i++) {
        if (distToSegment(p, corners[i], corners[(i + 1) % 4]) < threshold) return true;
      }
      return false;
    }
    default: {
      for (let i = 0; i < pts.length - 1; i++) {
        if (distToSegment(p, pts[i], pts[i + 1]) < threshold) return true;
      }
      return pts.length === 1 && Math.hypot(p.x - pts[0].x, p.y - pts[0].y) < threshold;
    }
  }
}

export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}
