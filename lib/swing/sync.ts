// ============================================================
// 두 영상 싱크 — "지금 두 프레임을 같은 순간으로 취급하라"
//
//  · 영상마다 싱크 지점(sync, 초) 하나만 가진다. 기본값은 0.
//  · 프로가 A를 임팩트에 맞추고 B를 임팩트에 맞춘 뒤 버튼을 한 번 누르면
//    각 영상의 현재 시각이 그대로 싱크 지점이 된다. 그게 전부다.
//  · 재생은 두 영상 모두 같은 배속으로 흐르므로 스윙 템포 차이가 그대로 보인다.
//    (구간 길이를 억지로 맞추면 템포 차이가 사라져서 오히려 교육적으로 손해다)
// ============================================================

export type SyncPane = {
  /** 영상 길이(초). 0이면 아직 로드 전 */
  duration: number;
  /** 싱크 지점(초). 지정 전에는 0 */
  sync: number;
};

export type CommonRange = {
  /** 싱크 지점 기준 뒤로 갈 수 있는 최대(초) */
  before: number;
  /** 싱크 지점 기준 앞으로 갈 수 있는 최대(초) */
  after: number;
  /** 공통 타임라인 전체 길이(초) */
  total: number;
};

const MIN_TOTAL = 0.05;

/**
 * 여러 영상이 동시에 유효한 공통 타임라인 범위를 구한다.
 * 싱크 지점을 원점(0)으로 두고, 뒤로 before초 / 앞으로 after초 만큼이 공통 구간이다.
 * 가장 짧은 쪽에 맞춰지므로 어느 영상도 범위를 벗어나지 않는다.
 */
export function commonRange(panes: SyncPane[]): CommonRange {
  const live = panes.filter((p) => p.duration > 0);
  if (live.length === 0) return { before: 0, after: MIN_TOTAL, total: MIN_TOTAL };

  let before = Infinity;
  let after = Infinity;
  for (const p of live) {
    const s = Math.min(Math.max(0, p.sync), p.duration);
    before = Math.min(before, s);
    after = Math.min(after, p.duration - s);
  }
  const total = Math.max(MIN_TOTAL, before + after);
  return { before, after, total };
}

/** 공통 타임라인 진행률(0~1)을 해당 영상의 실제 재생 시각(초)으로 변환 */
export function timeAt(pane: SyncPane, progress: number, range: CommonRange): number {
  const p = Math.min(1, Math.max(0, progress));
  const s = Math.min(Math.max(0, pane.sync), pane.duration || 0);
  const t = s - range.before + p * range.total;
  return Math.min(pane.duration || t, Math.max(0, t));
}

/** 영상의 실제 재생 시각(초)을 공통 타임라인 진행률(0~1)로 변환 */
export function progressAt(pane: SyncPane, time: number, range: CommonRange): number {
  const s = Math.min(Math.max(0, pane.sync), pane.duration || 0);
  const p = (time - s + range.before) / range.total;
  return Math.min(1, Math.max(0, p));
}

/** 싱크 지점을 원점(0)으로 하는 상대 시각. 화면에 "임팩트 -0.42초"처럼 표시할 때 쓴다 */
export function relativeAt(progress: number, range: CommonRange): number {
  return -range.before + Math.min(1, Math.max(0, progress)) * range.total;
}

/** 싱크가 실제로 의미 있게 걸려 있는지 (둘 다 0이면 그냥 처음부터 재생하는 상태) */
export function isSynced(panes: SyncPane[]): boolean {
  return panes.some((p) => p.duration > 0 && p.sync > 0);
}

/** 부호가 붙은 상대 시각 표기: -0.42s / +1.08s */
export function formatRelative(sec: number): string {
  const sign = sec < 0 ? "−" : "+";
  return `${sign}${Math.abs(sec).toFixed(2)}s`;
}
