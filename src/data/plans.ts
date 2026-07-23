export type Plan = { name: string; price: string; desc: string; on: boolean };

export const PLANS: Plan[] = [
  { name: 'Basic', price: '무료', desc: '사진+글 피드백 · AI 분석 · 갤러리', on: false },
  { name: 'Coaching', price: '월 39,000원', desc: '선 그리기+음성 영상 피드백 · 월 2회 · 2주 목표 관리', on: true },
  { name: 'Elite', price: '월 99,000원', desc: '맞춤 2~3분 영상 피드백 · 무제한 · 1:1 코칭', on: false },
];

/** 플랜별 피드백 형식 (등급 차등) */
export type FeedbackFormat = { emoji: string; plan: string; title: string; desc: string };

export const FEEDBACK_FORMATS: FeedbackFormat[] = [
  { emoji: '📷', plan: 'Basic', title: '사진 + 글 피드백', desc: '스윙 사진에 코멘트를 달아 글로 설명해요.' },
  {
    emoji: '🎥',
    plan: 'Coaching',
    title: '선 그리기 + 음성 영상',
    desc: '내 스윙 영상 위에 선을 그리고 음성으로 짚어줘요.',
  },
  { emoji: '🎬', plan: 'Elite', title: '맞춤 2~3분 영상', desc: '회원만을 위해 촬영한 전용 레슨 영상을 받아요.' },
];
