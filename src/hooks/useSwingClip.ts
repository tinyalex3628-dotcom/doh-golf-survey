/**
 * 스윙 영상 한 개의 재생 상태 — 길이 · 사용자가 정한 구간 · 원본 탐색 위치.
 * 진행도(0~1)를 넣으면 이 영상의 시각(초)을 돌려준다. 화면들이 이걸 나란히 여러 개 쓴다.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  SwingRange,
  SwingEvent,
  fullRange,
  isValidRange,
  pMarkers,
  progressToTime,
  setEnd as setEndUtil,
  setStart as setStartUtil,
} from '../utils/swingTimeline';

export type SwingClip = {
  uri?: string;
  duration: number;
  range: SwingRange;
  /** 구간 지정용 원본 탐색 위치(초) */
  scrubTime: number;
  /** P1~P10 참고 눈금 (엔진 결과 있을 때만) */
  markers: (number | null)[];
  ready: boolean;
  onLoad: (info: { duration: number }) => void;
  setScrub: (t: number) => void;
  markStart: () => void;
  markEnd: () => void;
  reset: () => void;
  /** 진행도(0~1) → 이 영상의 시각(초) */
  timeAt: (progress: number) => number;
};

export function useSwingClip(opts: {
  uri?: string;
  /** 앱 제공 영상(프로)처럼 구간이 정해져 있고 사용자가 못 바꾸는 경우 */
  lockedRange?: SwingRange;
  /** 엔진 doh.vision.v1 결과가 있으면 P눈금 표시용 */
  events?: SwingEvent[];
  fps?: number;
  /** 알려진 길이(프로 영상처럼 메타를 미리 아는 경우) */
  knownDuration?: number;
}): SwingClip {
  const { uri, lockedRange, events, fps, knownDuration } = opts;

  const [duration, setDuration] = useState(knownDuration ?? 0);
  const [range, setRange] = useState<SwingRange>(
    lockedRange ?? fullRange(knownDuration ?? 1),
  );
  const [scrubTime, setScrubTime] = useState(0);
  const [touched, setTouched] = useState(!!lockedRange);

  const onLoad = useCallback(
    (info: { duration: number }) => {
      setDuration(info.duration);
      // 사용자가 아직 구간을 안 정했으면 영상 전체를 기본 구간으로
      if (!lockedRange && !touched) setRange(fullRange(info.duration));
    },
    [lockedRange, touched],
  );

  const markStart = useCallback(() => {
    setRange((r) => setStartUtil(r, scrubTime));
    setTouched(true);
  }, [scrubTime]);

  const markEnd = useCallback(() => {
    setRange((r) => setEndUtil(r, scrubTime, duration || r.end));
    setTouched(true);
  }, [scrubTime, duration]);

  const reset = useCallback(() => {
    if (lockedRange) return;
    setRange(fullRange(duration || 1));
    setTouched(false);
  }, [duration, lockedRange]);

  const markers = useMemo(() => pMarkers(events, fps, range), [events, fps, range]);
  const timeAt = useCallback((p: number) => progressToTime(range, p), [range]);

  return {
    uri,
    duration,
    range,
    scrubTime,
    markers,
    ready: !!uri && duration > 0 && isValidRange(range),
    onLoad,
    setScrub: setScrubTime,
    markStart,
    markEnd,
    reset,
    timeAt,
  };
}
