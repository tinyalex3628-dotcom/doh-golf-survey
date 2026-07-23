/**
 * 브랜드 아이덴티티 — 단일 출처.
 * 브랜드명이 아직 미확정이므로 이곳만 바꾸면 앱 전체(및 향후 웹/유튜브/아카데미)에 반영된다.
 */
export const BRAND = {
  /** 정식 명칭 */
  name: 'DOH',
  /** 상단바 등에 노출되는 워드마크 (영문, serif) */
  wordmark: 'DOH',
  /** 아바타/파비콘용 모노그램 */
  monogram: 'D',
  /** 영문 태그라인 (라벨/커버) */
  tagline: 'PRIVATE GOLF COACHING',
  /** 한글 소개 문구 */
  descriptionKo: '늘 곁에서 함께 성장하는 전담 골프 코치',
  /** 대표 코치 (콘텐츠에서 사용, 교체 가능) */
  coachName: '이도형',
  coachTitle: '헤드 코치',
} as const;
