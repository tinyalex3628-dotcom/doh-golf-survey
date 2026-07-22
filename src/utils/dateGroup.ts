/**
 * 촬영 날짜 기반 그룹핑 유틸 (순수 함수 · 플랫폼 무관).
 * 폰 갤러리의 creationTime(촬영/저장 시각, ms)을 받아 이번 주 / 월별로 묶는다.
 */

export type Dated = { createdAt: number };

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** 개별 항목의 짧은 날짜 라벨: 오늘 / 어제 / M/D */
export function formatDayLabel(ts: number, now: number = Date.now()): string {
  const d = new Date(ts);
  const diffDays = Math.round((startOfDay(new Date(now)) - startOfDay(d)) / DAY_MS);
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 항목이 속할 버킷(그룹) 계산 */
function bucketOf(ts: number, now: number): { key: string; date: string; short: string } {
  const d = new Date(ts);
  const n = new Date(now);
  const diffDays = Math.round((startOfDay(n) - startOfDay(d)) / DAY_MS);

  // 최근 7일 이내 → 이번 주
  if (diffDays >= 0 && diffDays < 7) {
    return { key: 'week', date: `${d.getMonth() + 1}월 · 이번 주`, short: '이번 주' };
  }
  // 그 외 → 월별 (다른 연도면 연도 표기)
  const sameYear = d.getFullYear() === n.getFullYear();
  const label = sameYear ? `${d.getMonth() + 1}월` : `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  const ym = d.getFullYear() * 100 + (d.getMonth() + 1);
  return { key: `m${ym}`, date: label, short: label };
}

export type Grouped<T> = { date: string; short: string; items: T[] };

/** 촬영일 기준으로 최신순 그룹핑. 그룹·항목 모두 최신이 위. */
export function groupByDate<T extends Dated>(items: T[], now: number = Date.now()): Grouped<T>[] {
  const map = new Map<string, { date: string; short: string; items: T[]; maxTs: number }>();
  for (const it of items) {
    const b = bucketOf(it.createdAt, now);
    const g = map.get(b.key) ?? { date: b.date, short: b.short, items: [], maxTs: 0 };
    g.items.push(it);
    g.maxTs = Math.max(g.maxTs, it.createdAt);
    map.set(b.key, g);
  }
  const groups = [...map.values()].sort((a, b) => b.maxTs - a.maxTs);
  groups.forEach((g) => g.items.sort((a, b) => b.createdAt - a.createdAt));
  return groups.map(({ date, short, items }) => ({ date, short, items }));
}
