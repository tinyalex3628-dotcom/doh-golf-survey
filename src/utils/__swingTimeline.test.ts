import { fullRange, isValidRange, progressToTime, timeToProgress, setStart, setEnd, pMarkers, rangeDuration, fmtTime }
  from './swingTimeline';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL:', m); } else console.log('  ok:', m); };

// 내 영상 5초짜리, 스윙은 1.2~3.0초 구간
let mine = setEnd(setStart(fullRange(5), 1.2), 3.0, 5);
// 프로 영상 2.4초짜리, 앱이 미리 0.3~1.5로 잡아둠(잠금)
const pro = { start: 0.3, end: 1.5, locked: true };

ok(isValidRange(mine) && isValidRange(pro), '두 구간 다 유효');
ok(Math.abs(rangeDuration(mine) - 1.8) < 1e-9 && Math.abs(rangeDuration(pro) - 1.2) < 1e-9, '구간 길이 다름(1.8s vs 1.2s)');

// 같은 진행도 → 각자 자기 구간의 같은 비율 지점
for (const p of [0, 0.25, 0.5, 0.75, 1]) {
  const tm = progressToTime(mine, p), tp = progressToTime(pro, p);
  const em = 1.2 + 1.8 * p, ep = 0.3 + 1.2 * p;
  ok(Math.abs(tm - em) < 1e-9 && Math.abs(tp - ep) < 1e-9, `진행도 ${p}: 나=${tm.toFixed(3)}s 프로=${tp.toFixed(3)}s`);
}
ok(Math.abs(progressToTime(mine,0)-1.2)<1e-9 && Math.abs(progressToTime(pro,0)-0.3)<1e-9, '진행도 0 = 각자 스윙 시작');
ok(Math.abs(progressToTime(mine,1)-3.0)<1e-9 && Math.abs(progressToTime(pro,1)-1.5)<1e-9, '진행도 1 = 각자 스윙 끝');

// 왕복
for (const p of [0, 0.33, 0.87, 1]) {
  ok(Math.abs(timeToProgress(mine, progressToTime(mine, p)) - p) < 1e-9, `왕복 ${p}`);
}
// 구간 밖 클램프
ok(timeToProgress(mine, 0) === 0 && timeToProgress(mine, 4.9) === 1, '구간 밖은 0/1로 클램프');

// 프로 영상은 잠금 — 수정 시도해도 안 바뀜
const proTry = setEnd(setStart(pro, 0.9), 2.0, 2.4);
ok(proTry.start === 0.3 && proTry.end === 1.5, '프로 영상(locked)은 구간 수정 무시');

// 사용자가 구간 다시 지정
mine = setStart(mine, 1.5);
ok(Math.abs(mine.start - 1.5) < 1e-9, '시작 재지정 반영');
mine = setStart(mine, 9);   // 끝을 넘겨서 지정 시도
ok(mine.start < mine.end, '시작이 끝을 못 넘음');
mine = setEnd(mine, 0, 5);  // 시작보다 앞으로 지정 시도
ok(mine.end > mine.start, '끝이 시작보다 앞설 수 없음');

// P눈금 — 프로 스윙만. 운영자가 초 단위로 직접 지정한 값을 구간 내 위치로 환산.
const proRange = { start: 1.2, end: 3.0 };
// [P1..P10] 중 P1/P4/P7만 적고 나머지는 null, P9는 구간 밖(4.0s)으로 둔다
const proP = [1.2, null, null, 2.0, null, null, 2.7, null, 4.0, null];
const marks = pMarkers(proP, proRange);
ok(marks[0] !== null && marks[3] !== null && marks[6] !== null, '지정한 P1/P4/P7 눈금 계산됨');
ok(marks[1] === null && marks[5] === null, '안 적은 P2/P6은 null (억지 보간 안 함)');
ok(marks[8] === null, '구간 밖 P9(4.0s)는 제외');
ok((marks[3] as number) > 0 && (marks[3] as number) < 1, `P4 눈금이 구간 안 (${(marks[3] as number).toFixed(3)})`);
ok(Math.abs((marks[0] as number) - 0) < 1e-9, 'P1(구간 시작)은 진행도 0');
ok(Math.abs((marks[6] as number) - (2.7-1.2)/1.8) < 1e-9, 'P7 위치가 구간 비율과 일치');
// 회원 영상: pTimes 자체가 없다 → P칩이 하나도 안 켜짐 (AI 검출 미사용, 의도된 동작)
ok(pMarkers(undefined, {start:0,end:1}).every(v => v === null), '회원 영상은 P눈금 전혀 없음');
ok(pMarkers([], {start:0,end:1}).every(v => v === null), '빈 pTimes도 안전');
// 그래도 싱크는 정상 — P가 없어도 진행도 매핑은 동작해야 한다
const memberRange = { start: 0.5, end: 2.5 };
ok(Math.abs(progressToTime(memberRange, 0.5) - 1.5) < 1e-9, 'P 없어도 진행도 싱크는 정상 동작');

ok(fmtTime(75.34) === '1:15.3' && fmtTime(3.5) === '0:03.5', `시각 표기 ${fmtTime(75.34)} / ${fmtTime(3.5)}`);
console.log(fail ? `\n❌ 실패 ${fail}` : '\n✅ 전부 통과');
process.exit(fail ? 1 : 0);
