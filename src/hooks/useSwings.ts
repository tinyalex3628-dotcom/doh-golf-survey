/**
 * 스윙 목록을 촬영 날짜 기준으로 그룹핑해 제공.
 * - 실제 폰: 갤러리(미디어 라이브러리)의 촬영일로 채워짐.
 * - 웹 미리보기/권한 없음: 샘플 데이터로 대체 (source === 'sample').
 */
import { useEffect, useState } from 'react';
import { Grouped, groupByDate } from '../utils/dateGroup';
import { Swing } from '../types/swing';
import { loadSwingsFromLibrary } from '../services/swingLibrary';

const DAY = 86_400_000;
const now = Date.now();

// 미리보기용 샘플 (촬영일을 상대적으로 구성해 항상 자연스럽게 보이도록)
const SAMPLE: Swing[] = [
  { id: 's1', createdAt: now, side: '정면', club: '드라이버', tag: '골반 회전' },
  { id: 's2', createdAt: now - 2 * 3600_000, side: '측면', club: '드라이버', tag: '템포 좋음' },
  { id: 's3', createdAt: now - 1 * DAY, side: '정면', club: '아이언', tag: '숙제 완료' },
  { id: 's4', createdAt: now - 34 * DAY, side: '정면', club: '아이언', tag: '지난달' },
  { id: 's5', createdAt: now - 36 * DAY, side: '측면', club: '드라이버', tag: '피니시' },
];

export type SwingSource = 'sample' | 'library';

export function useSwings(): { groups: Grouped<Swing>[]; source: SwingSource } {
  const [groups, setGroups] = useState<Grouped<Swing>[]>(() => groupByDate(SAMPLE));
  const [source, setSource] = useState<SwingSource>('sample');

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await loadSwingsFromLibrary();
      if (alive && res.ok && res.swings.length) {
        setGroups(groupByDate(res.swings));
        setSource('library');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { groups, source };
}
