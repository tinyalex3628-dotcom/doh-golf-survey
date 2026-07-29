/**
 * 앱이 제공하는 프로 스윙 — 영상 + 스윙 구간 + **P1~P10 위치**.
 *
 * 정책 (사용자 확정, 2026-07-29)
 * ------------------------------
 * · **P구간은 프로 스윙만, 운영자가 직접 지정한다.** 아래 `pTimes`에 손으로 적는다.
 * · **회원이 올린 영상은 P구간을 찾지 않는다.** AI 자동검출이 실용 수준이 못 됨
 *   (클럽 없으면 P2/P6/P8 원리적 불가, P3/P5도 실패 시 P4와 뭉개짐 — 실측 확인).
 *   회원 영상은 사용자가 정한 스윙 시작/끝 구간과 진행도 슬라이더만 쓴다.
 *
 * 영상 넣는 법
 * ------------
 * 1) mp4 파일을 `assets/pro/` 에 넣는다 (권장 이름: `<프로>_<뷰>.mp4`, 예 `lee_fo.mp4`)
 * 2) 아래 각 항목의 `video:` 줄 주석을 풀고 파일명을 맞춘다
 * 3) `duration`(영상 전체 길이) · `range`(스윙 시작~끝) · `pTimes`(P1~P10 시각)를 실제 값으로 고친다
 *    — 전부 **영상 시작부터의 초(second)** 단위다.
 * 영상이 없으면 `video: undefined` 그대로 두면 되고, 화면은 실루엣 + "영상 준비 중"으로 뜬다.
 */
import { SwingRange } from '../utils/swingTimeline';

export type ProView = '정면' | '측면';

export type ProClip = {
  key: 'm' | 'f';
  name: string;
  view: ProView;
  /** require('../../assets/pro/xxx.mp4') 또는 원격 URL. 없으면 실루엣 */
  video?: any;
  /** 영상 전체 길이(초) */
  duration: number;
  /** 스윙 시작~끝 (사용자 조작 불가 — locked) */
  range: SwingRange;
  /**
   * 운영자가 직접 지정한 P1~P10 시각(초). 모르는 P는 null로 둔다(화면에서 흐리게 표시).
   * 순서: [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10]
   */
  pTimes: (number | null)[];
};

/** 아직 P를 안 적은 슬롯용 */
const NO_P: (number | null)[] = [null, null, null, null, null, null, null, null, null, null];

export const PRO_CLIPS: Record<'m' | 'f', Record<ProView, ProClip>> = {
  m: {
    정면: {
      key: 'm',
      name: '이도형',
      view: '정면',
      // video: require('../../assets/pro/lee_fo.mp4'),
      duration: 2.4,
      range: { start: 0.3, end: 1.9, locked: true },
      // 예시값 — 실제 영상 넣을 때 프레임 보면서 고칠 것
      pTimes: [0.3, 0.52, 0.74, 1.02, 1.24, 1.38, 1.52, 1.66, 1.78, 1.9],
    },
    측면: {
      key: 'm',
      name: '이도형',
      view: '측면',
      // video: require('../../assets/pro/lee_dtl.mp4'),
      duration: 2.6,
      range: { start: 0.4, end: 2.0, locked: true },
      pTimes: [0.4, 0.62, 0.84, 1.12, 1.34, 1.48, 1.62, 1.76, 1.88, 2.0],
    },
  },
  f: {
    정면: {
      key: 'f',
      name: '김지원',
      view: '정면',
      // video: require('../../assets/pro/kim_fo.mp4'),
      duration: 2.2,
      range: { start: 0.25, end: 1.75, locked: true },
      pTimes: NO_P,
    },
    측면: {
      key: 'f',
      name: '김지원',
      view: '측면',
      // video: require('../../assets/pro/kim_dtl.mp4'),
      duration: 2.3,
      range: { start: 0.3, end: 1.85, locked: true },
      pTimes: NO_P,
    },
  },
};

export const getProClip = (pro: 'm' | 'f' | null, cam: ProView | null): ProClip =>
  PRO_CLIPS[pro ?? 'm'][cam ?? '정면'];
