import { Dated } from '../utils/dateGroup';

/** 스윙 한 개. createdAt = 촬영/저장 시각(ms). */
export type Swing = Dated & {
  id: string;
  side: string; // 정면 / 측면 / 영상(미분류)
  club: string; // 드라이버 / 아이언 … (영상 메타에는 없어 사용자·AI가 채움)
  tag?: string;
  uri?: string; // 실제 영상 경로 (라이브러리에서 로드 시)
};
