/**
 * Design Tokens — "Private Golf Club" 브랜드 시스템
 * Augusta National에서 영감받은 딥 포레스트 그린 + 샴페인 골드 + 아이보리.
 * 원칙: 전체의 ~90%는 Green 계열, ~10%만 Gold Accent(강조·VIP·진행률·프리미엄).
 *
 * 이 파일이 앱·웹·유튜브·오프라인 아카데미까지 확장되는 단일 컬러/타이포 출처.
 */
import { Platform } from 'react-native';

export const colors = {
  // ── Green (Primary, ~90%) ── 살아있는 포레스트 그린
  ink: '#184D3A', // Living Forest — 제목/브랜드/진한 CTA 배경/본문
  deepGreen: '#1E5C46', // 그라디언트 상단
  heroTop: '#22684E', // 히어로 카드 그라디언트 상단(살짝 밝게)
  heroBottom: '#123A2C', // 히어로 카드 그라디언트 하단(깊게 → 대비)
  darkestGreen: '#0F2E24', // 딥 배경 / 영상 배경
  bezelBlack: '#0A1712', // 그림자용 최심 그린블랙
  accentGreen: '#2E6A4F', // 링크 / 보조 강조
  highlightGreen: '#3F7A5E', // 영상 썸네일 그라디언트
  mint: '#9FD8B4', // "현재" 라벨

  // ── Champagne Gold (Accent, ~10%) ── 권위 요소에 집중
  gold: '#BFA05C', // 샴페인 골드 — 진행률/PRO/VIP/버튼 강조
  goldDeep: '#9E823F', // 밝은 배경 위 골드 텍스트(가독)
  goldLight: '#E7D6A8', // 다크 배경 위 옅은 샴페인 텍스트/칩

  // ── Ivory / near-White (Background) ── 탁한 베이지 제거
  appBg: '#ECEBE4', // 캔버스 배경
  screenBg: '#F8F8F4', // 앱 화면 배경 (거의 흰 아이보리)
  surface: '#FFFFFF', // 카드 표면 (순백 → 대비로 카드가 산다)
  sheetBg: '#F4F4EF', // 바텀시트

  // ── 텍스트/보더 (그린 틴트 뉴트럴) ──
  textPrimary: '#14342A',
  textSecondary: 'rgba(20,52,42,.62)',
  textWeak: 'rgba(20,52,42,.50)',
  textFaint: 'rgba(20,52,42,.42)',
  textDisabled: 'rgba(20,52,42,.32)',
  border: 'rgba(20,52,42,.10)',
  borderSoft: 'rgba(20,52,42,.14)',
  onDark: '#F5F1E8', // 딥그린 위 아이보리 텍스트
  onDarkSecondary: 'rgba(245,241,232,.66)',
  onDarkFaint: 'rgba(245,241,232,.45)',

  disabledBg: 'rgba(20,52,42,.07)',
} as const;

export const gradients = {
  darkCard: [colors.deepGreen, colors.ink] as const,
  videoThumb: [colors.highlightGreen, colors.darkestGreen] as const,
  progress: [colors.accentGreen, colors.ink] as const,
};

export const radius = {
  phone: 44,
  cardLg: 20,
  card: 18,
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
  screenH: 18, // 화면 좌우 패딩 (여백↑)
  tabBarClearance: 94,
} as const;

// 부드럽고 은은한 그림자 (프리미엄 · 과하지 않게)
export const shadow = {
  card: {
    shadowColor: colors.bezelBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  emphasis: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 8,
  },
  toast: {
    shadowColor: colors.bezelBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** 타이포그래피 — 우아한 헤리티지 감성.
 *  serif: 브랜드 워드마크·영문 라벨 (헤리티지). 한글 UI는 clean sans(Pretendard/시스템).
 */
export const fontFamily = {
  regular: 'Pretendard',
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, "Times New Roman", serif',
  }) as string,
} as const;

export const font = {
  display: 26, // 히어로 제목
  homeGreeting: 24,
  screenTitle: 22,
  cardTitle: 18,
  emphasisTitle: 20,
  sectionLabel: 11,
  body: 13,
  bodySm: 12,
  caption: 11,
  captionSm: 10.5,
} as const;

// 계층을 위해 대비를 크게: display(800) ↔ body(400).
export const weight = {
  heavy: '800' as const, // 히어로/디스플레이
  black: '800' as const, // 큰 제목 (대비 강화)
  bold: '700' as const, // 제목
  semibold: '600' as const, // 서브 제목
  medium: '500' as const, // 강조 본문
  regular: '400' as const, // 본문/설명
};

/** 영문 라벨 트래킹 (프리미엄 느낌의 넓은 자간) */
export const tracking = {
  label: 1.5,
  wordmark: 3,
} as const;
