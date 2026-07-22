/**
 * DOH Golf — Design Tokens
 * design-reference/flow-prototype/README.md 의 디자인 토큰을 그대로 옮긴 값.
 * 프로토타입(HTML)과 픽셀에 가깝게 재현하기 위한 단일 출처(single source of truth).
 */

export const colors = {
  ink: '#17382A', // 제목 / 진한 CTA 배경 / 브랜드
  deepGreen: '#1B4030', // 강조 카드 그라디언트 시작
  darkestGreen: '#0F2419', // 폰 스크린 딥 배경, 영상 배경
  bezelBlack: '#0B1510', // 폰 베젤 / 노치
  accentGreen: '#2E5C44', // 링크 / 보조 강조 / 진행바
  highlightGreen: '#3A5E4A', // 영상 썸네일 그라디언트
  mint: '#9FD8B4', // "현재" 라벨
  gold: '#B07A2E', // 태그 / 라벨 / 강조
  goldLight: '#EDD9A3', // 다크 배경 위 강조 텍스트 / 칩
  appBg: '#E4E0D6', // 프로토타입 바깥 캔버스
  screenBg: '#F2EFE8', // 앱 화면 배경
  surface: '#FFFFFF', // 카드 표면
  sheetBg: '#F7F4EC', // 바텀시트 / 다크 위 밝은 텍스트

  // 자주 쓰는 투명도 변형
  textPrimary: '#17382A',
  textSecondary: 'rgba(27,38,32,.55)',
  textWeak: 'rgba(27,38,32,.5)',
  textFaint: 'rgba(27,38,32,.45)',
  textDisabled: 'rgba(27,38,32,.35)',
  border: 'rgba(27,38,32,.1)',
  borderSoft: 'rgba(27,38,32,.12)',
  onDark: '#F7F4EC',
  onDarkSecondary: 'rgba(247,244,236,.6)',
  onDarkFaint: 'rgba(247,244,236,.45)',

  disabledBg: 'rgba(27,38,32,.08)',
} as const;

export const gradients = {
  // React Native LinearGradient 대용으로 tint 색만 필요할 때 사용.
  darkCard: [colors.deepGreen, colors.ink] as const, // linear-gradient(160deg,#1B4030,#17382A)
  videoThumb: [colors.highlightGreen, colors.darkestGreen] as const, // 150deg
  progress: [colors.accentGreen, colors.ink] as const, // 90deg
};

export const radius = {
  phone: 44,
  cardLg: 20,
  card: 16,
  chip: 14,
  button: 13,
  pill: 100,
  iconTile: 12,
  iconTileSm: 10,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screenH: 16, // 화면 좌우 패딩
  tabBarClearance: 92, // 하단 탭바 공간
} as const;

export const shadow = {
  card: {
    shadowColor: colors.bezelBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  emphasis: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  toast: {
    shadowColor: colors.bezelBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** Pretendard 웹폰트. 로드 전 폴백은 시스템 폰트. */
export const fontFamily = {
  regular: 'Pretendard',
} as const;

export const font = {
  // px 값을 그대로 사용 (RN은 dp 이지만 프로토타입 비율 유지)
  screenTitle: 22,
  homeGreeting: 23,
  cardTitle: 18,
  emphasisTitle: 21,
  sectionLabel: 11,
  body: 13,
  bodySm: 12,
  caption: 11,
  captionSm: 10.5,
} as const;

export const weight = {
  black: '800' as const,
  bold: '700' as const,
  semibold: '600' as const,
};
