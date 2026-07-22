/**
 * 앱의 모든 화면(route) 정의. 프로토타입 소스의 this.PAGES 를 옮긴 것.
 * tab 값은 하단 탭바 활성 상태를 결정한다.
 */

export type TabKey = 'home' | 'analysis' | 'dict' | 'profile';

export type RouteName =
  | 'home'
  | 'homework'
  | 'hub1'
  | 'aiSurvey'
  | 'upload'
  | 'gallery'
  | 'single'
  | 'multi'
  | 'hub2'
  | 'proSelect'
  | 'camera'
  | 'proSolo'
  | 'proCompare'
  | 'feedback'
  | 'dict'
  | 'profile'
  | 'subscription'
  | 'subBenefits'
  | 'subOffline'
  | 'subPro'
  | 'subFeedback'
  | 'membership';

export type PageMeta = {
  name: string; // 상단바 제목
  tab: TabKey;
};

export const PAGES: Record<RouteName, PageMeta> = {
  home: { name: 'Home', tab: 'home' },
  homework: { name: '이번 주 목표 숙제', tab: 'home' },
  hub1: { name: '스윙 분석', tab: 'analysis' },
  aiSurvey: { name: 'AI 스윙분석 + 설문', tab: 'analysis' },
  upload: { name: '스윙 업로드', tab: 'analysis' },
  gallery: { name: '내 스윙 갤러리', tab: 'analysis' },
  single: { name: '단독 분석', tab: 'analysis' },
  multi: { name: '멀티스크린 비교', tab: 'analysis' },
  hub2: { name: '프로와 비교하기', tab: 'analysis' },
  proSelect: { name: '프로 선택', tab: 'analysis' },
  camera: { name: '카메라 선택', tab: 'analysis' },
  proSolo: { name: '프로 단독 분석', tab: 'analysis' },
  proCompare: { name: '프로와 내 스윙 비교', tab: 'analysis' },
  feedback: { name: '프로에게 문의', tab: 'analysis' },
  dict: { name: '골프 사전', tab: 'dict' },
  profile: { name: '프로필', tab: 'profile' },
  subscription: { name: '구독별 안내사항', tab: 'profile' },
  subBenefits: { name: '구독별 혜택 안내', tab: 'profile' },
  subOffline: { name: '오프라인 레슨 정보', tab: 'profile' },
  subPro: { name: '이도형 프로는?', tab: 'profile' },
  subFeedback: { name: '피드백 과정 영상', tab: 'profile' },
  membership: { name: 'Membership', tab: 'profile' },
};

/** 각 탭의 루트 화면 */
export const TAB_ROOT: Record<TabKey, RouteName> = {
  home: 'home',
  analysis: 'hub1',
  dict: 'dict',
  profile: 'profile',
};

/** React Navigation 파라미터 목록 (전 화면 파라미터 없음) */
export type RootStackParamList = Record<RouteName, undefined>;
