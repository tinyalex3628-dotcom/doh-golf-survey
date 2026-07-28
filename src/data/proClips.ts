/**
 * 앱이 제공하는 프로 스윙 영상.
 * 구간(start/end)은 앱이 미리 잡아둔 값이고 `locked: true` 라 사용자가 못 바꾼다.
 *
 * uri: 실제 파일이 붙기 전까지는 undefined → 화면은 실루엣 플레이스홀더로 뜬다.
 *      실제 영상을 넣을 땐 require('...mp4') 또는 CDN URL을 넣으면 그대로 재생된다.
 */
import { SwingRange } from '../utils/swingTimeline';

export type ProClip = {
  key: 'm' | 'f';
  name: string;
  view: '정면' | '측면';
  uri?: string;
  duration: number;
  range: SwingRange;
};

export const PRO_CLIPS: Record<'m' | 'f', Record<'정면' | '측면', ProClip>> = {
  m: {
    정면: { key: 'm', name: '이도형', view: '정면', duration: 2.4, range: { start: 0.3, end: 1.9, locked: true } },
    측면: { key: 'm', name: '이도형', view: '측면', duration: 2.6, range: { start: 0.4, end: 2.0, locked: true } },
  },
  f: {
    정면: { key: 'f', name: '김지원', view: '정면', duration: 2.2, range: { start: 0.25, end: 1.75, locked: true } },
    측면: { key: 'f', name: '김지원', view: '측면', duration: 2.3, range: { start: 0.3, end: 1.85, locked: true } },
  },
};

export const getProClip = (pro: 'm' | 'f' | null, cam: '정면' | '측면' | null): ProClip =>
  PRO_CLIPS[pro ?? 'm'][cam ?? '정면'];
