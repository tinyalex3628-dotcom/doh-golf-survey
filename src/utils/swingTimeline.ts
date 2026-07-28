/**
 * 스윙 구간(Range) — 두 영상을 나란히 볼 때 싱크를 맞추는 기준.
 *
 * 설계 결정 (사용자 확정)
 * ----------------------
 * **싱크는 사용자가 직접 맞춘다.** 각 영상에서 "스윙 시작"과 "스윙 끝"을 사용자가 찍고,
 * 그 사이를 0~1 진행도로 정규화한다. 두 영상이 같은 진행도 = 같은 스윙 국면.
 *
 * 자동 정렬(엔진이 검출한 P시점 기준)을 쓰지 않는 이유:
 *  - P2/P6/P8은 샤프트 평행이라 클럽 검출 없이는 원리적으로 못 잡는다(P2는 근사 프록시).
 *  - P3/P5도 리드팔 평행 검출이 실패하면 P4와 같은 프레임으로 뭉개진다(실측 확인됨).
 *  → 검출이 흔들리면 싱크가 통째로 어긋난다. 사용자가 찍은 두 점은 절대 안 흔들린다.
 *
 * P시점은 **참고용 눈금**으로만 표시한다(있으면 표시, 없으면 안 표시). 싱크의 근거가 아니다.
 *
 * 프로 영상은 `locked: true` — 앱이 미리 구간을 잡아둔 것이라 사용자가 못 바꾼다.
 */

/** 엔진 doh.vision.v1 의 swing_events 한 줄 (참고 눈금용, 선택) */
export type SwingEvent = { p: string; frame: number; method?: string };

/** 영상 한 개의 스윙 구간 */
export type SwingRange = {
  /** 스윙 시작 시각(초) */
  start: number;
  /** 스윙 끝 시각(초) */
  end: number;
  /** true면 사용자가 못 바꿈 (앱이 제공하는 프로 영상) */
  locked?: boolean;
};

export const P_LABELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];

/** 영상 전체를 스윙 구간으로 (구간 지정 전 기본값) */
export const fullRange = (duration: number): SwingRange => ({ start: 0, end: Math.max(0.01, duration) });

/** 구간이 유효한가 (끝이 시작보다 뒤인가) */
export const isValidRange = (r: SwingRange) => r.end - r.start > 0.05;

/** 진행도(0~1) → 이 영상의 시각(초) */
export function progressToTime(r: SwingRange, progress: number): number {
  const p = Math.max(0, Math.min(1, progress));
  return r.start + (r.end - r.start) * p;
}

/** 이 영상의 시각(초) → 진행도(0~1) */
export function timeToProgress(r: SwingRange, time: number): number {
  const span = r.end - r.start;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, (time - r.start) / span));
}

/** 구간 시작을 지금 시각으로 (끝을 넘지 않게) */
export function setStart(r: SwingRange, time: number): SwingRange {
  if (r.locked) return r;
  return { ...r, start: Math.max(0, Math.min(time, r.end - 0.05)) };
}

/** 구간 끝을 지금 시각으로 (시작보다 앞서지 않게) */
export function setEnd(r: SwingRange, time: number, duration: number): SwingRange {
  if (r.locked) return r;
  return { ...r, end: Math.min(duration, Math.max(time, r.start + 0.05)) };
}

/**
 * 엔진 P시점을 **참고 눈금**으로 변환 — 구간 안에서의 위치(0~1).
 * 구간 밖이거나 검출 안 된 P는 null. 싱크에는 쓰지 않는다.
 */
export function pMarkers(
  events: SwingEvent[] | undefined,
  fps: number | undefined,
  r: SwingRange,
): (number | null)[] {
  const out: (number | null)[] = Array(10).fill(null);
  if (!events?.length || !fps || fps <= 0) return out;
  for (const e of events) {
    const i = P_LABELS.indexOf(e.p);
    if (i < 0 || !Number.isFinite(e.frame)) continue;
    const t = e.frame / fps;
    if (t < r.start || t > r.end) continue;
    out[i] = timeToProgress(r, t);
  }
  return out;
}

/** 구간 길이(초) */
export const rangeDuration = (r: SwingRange) => Math.max(0, r.end - r.start);

/** 사람이 읽는 시각 표기 0:00.0 */
export function fmtTime(t: number): string {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
}
