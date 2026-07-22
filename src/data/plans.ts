export type Plan = { name: string; price: string; desc: string; on: boolean };

export const PLANS: Plan[] = [
  { name: 'Basic', price: '무료', desc: 'AI 분석 · 갤러리 · 프로 스윙 열람', on: false },
  { name: 'Coaching', price: '월 39,000원', desc: '프로 피드백 월 2회 · 2주 목표 관리', on: true },
  { name: 'Elite', price: '월 99,000원', desc: '무제한 피드백 · 1:1 영상 코칭 · 맞춤 드릴', on: false },
];
