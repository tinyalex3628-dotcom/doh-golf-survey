/**
 * 현재 회원의 구독 등급(플랜) 상태.
 * 실제 앱에서는 계정 정보로 대체되며, 지금은 데모용으로 프로필에서 미리보기 전환 가능.
 */
import React, { createContext, useContext, useState } from 'react';

export type Tier = 'Basic' | 'Coaching' | 'Elite';

export const TIER_ORDER: Tier[] = ['Basic', 'Coaching', 'Elite'];

export const nextTier = (t: Tier): Tier | null => TIER_ORDER[TIER_ORDER.indexOf(t) + 1] ?? null;

type Ctx = { tier: Tier; setTier: (t: Tier) => void };

const SubscriptionContext = createContext<Ctx>({ tier: 'Basic', setTier: () => {} });

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>('Basic');
  return <SubscriptionContext.Provider value={{ tier, setTier }}>{children}</SubscriptionContext.Provider>;
}
