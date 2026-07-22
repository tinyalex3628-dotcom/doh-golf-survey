/**
 * 프로 비교 플로우 공유 상태 (프로토타입의 state.pro / state.cam).
 * proSelect → camera → proSolo → proCompare 로 이어지며 선택이 유지된다.
 */
import React, { createContext, useContext, useState } from 'react';

export type ProKey = 'm' | 'f' | null;
export type CamKey = '정면' | '측면' | null;

export const PRO_NAMES: Record<'m' | 'f', string> = { m: '이도형', f: '김지원' };

type Ctx = {
  pro: ProKey;
  setPro: (p: ProKey) => void;
  cam: CamKey;
  setCam: (c: CamKey) => void;
};

const ComparisonContext = createContext<Ctx>({ pro: null, setPro: () => {}, cam: null, setCam: () => {} });

export function useComparison() {
  return useContext(ComparisonContext);
}

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [pro, setPro] = useState<ProKey>(null);
  const [cam, setCam] = useState<CamKey>(null);
  return <ComparisonContext.Provider value={{ pro, setPro, cam, setCam }}>{children}</ComparisonContext.Provider>;
}
