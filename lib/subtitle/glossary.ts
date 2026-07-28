// ============================================================
// 골프 용어 사전 — 자막(음성 인식) 정확도를 끌어올리는 두 겹 장치
//
//  1) 힌트(프롬프트): 인식 전에 "이런 단어가 나오는 대화"라고 귀띔.
//     Whisper 는 프롬프트의 마지막 224토큰만 기억하므로,
//     아래 목록은 "덜 중요한 것 → 자주 틀리는 것" 순서로 배열한다.
//     (잘리면 앞쪽=이미 잘 알아듣는 흔한 용어부터 버려진다)
//  2) 교정 사전: 인식이 끝난 텍스트를 치환으로 고친다. 한도 없음.
//     프로가 자막을 검수하며 승인한 교정이 여기에 계속 쌓인다(DB).
// ============================================================

export type CaptionSeg = { start: number; end: number; text: string };

export type GlossaryTerm = { term: string; category: string };

// ---------- 힌트 용어 (덜 중요 → 자주 틀림 순) ----------
export const GOLF_TERMS: GlossaryTerm[] = [
  // 클럽·장비 — 흔해서 원래도 잘 알아듣는 편
  { term: "드라이버", category: "클럽·장비" },
  { term: "우드", category: "클럽·장비" },
  { term: "유틸리티", category: "클럽·장비" },
  { term: "아이언", category: "클럽·장비" },
  { term: "웨지", category: "클럽·장비" },
  { term: "퍼터", category: "클럽·장비" },
  { term: "샤프트", category: "클럽·장비" },
  { term: "페이스", category: "클럽·장비" },
  { term: "로프트", category: "클럽·장비" },
  { term: "라이각", category: "클럽·장비" },

  // 구질·미스샷
  { term: "슬라이스", category: "구질·미스샷" },
  { term: "훅", category: "구질·미스샷" },
  { term: "페이드", category: "구질·미스샷" },
  { term: "드로우", category: "구질·미스샷" },
  { term: "푸시", category: "구질·미스샷" },
  { term: "풀", category: "구질·미스샷" },
  { term: "생크", category: "구질·미스샷" },
  { term: "탑볼", category: "구질·미스샷" },
  { term: "뒤땅", category: "구질·미스샷" },
  { term: "캐리", category: "구질·미스샷" },

  // 셋업
  { term: "어드레스", category: "셋업" },
  { term: "그립", category: "셋업" },
  { term: "스탠스", category: "셋업" },
  { term: "얼라인먼트", category: "셋업" },
  { term: "에이밍", category: "셋업" },
  { term: "볼 포지션", category: "셋업" },
  { term: "포스처", category: "셋업" },
  { term: "프리샷 루틴", category: "셋업" },

  // 스윙 단계
  { term: "테이크백", category: "스윙 단계" },
  { term: "백스윙", category: "스윙 단계" },
  { term: "톱", category: "스윙 단계" },
  { term: "트랜지션", category: "스윙 단계" },
  { term: "다운스윙", category: "스윙 단계" },
  { term: "임팩트", category: "스윙 단계" },
  { term: "릴리스", category: "스윙 단계" },
  { term: "팔로스루", category: "스윙 단계" },
  { term: "피니시", category: "스윙 단계" },
  { term: "하프스윙", category: "스윙 단계" },
  { term: "빈스윙", category: "스윙 단계" },

  // 몸·동작
  { term: "체중 이동", category: "몸·동작" },
  { term: "하체 리드", category: "몸·동작" },
  { term: "지면 반력", category: "몸·동작" },
  { term: "로테이션", category: "몸·동작" },
  { term: "척추각", category: "몸·동작" },
  { term: "전경각", category: "몸·동작" },
  { term: "손목 각도", category: "몸·동작" },
  { term: "코킹", category: "몸·동작" },
  { term: "힌지", category: "몸·동작" },
  { term: "래깅", category: "몸·동작" },
  { term: "템포", category: "몸·동작" },
  { term: "리듬", category: "몸·동작" },

  // 궤도·데이터
  { term: "스윙 플레인", category: "궤도·데이터" },
  { term: "클럽 패스", category: "궤도·데이터" },
  { term: "페이스 앵글", category: "궤도·데이터" },
  { term: "어택 앵글", category: "궤도·데이터" },
  { term: "다운블로", category: "궤도·데이터" },
  { term: "어퍼블로", category: "궤도·데이터" },
  { term: "인투인", category: "궤도·데이터" },
  { term: "인아웃", category: "궤도·데이터" },
  { term: "아웃인", category: "궤도·데이터" },
  { term: "스매시 팩터", category: "궤도·데이터" },

  // 흔한 오류 명칭 — 제일 자주 틀리게 받아적히는 구간이라 맨 뒤(=우선 보존)
  { term: "스웨이", category: "스윙 오류" },
  { term: "슬라이드", category: "스윙 오류" },
  { term: "행잉백", category: "스윙 오류" },
  { term: "헤드업", category: "스윙 오류" },
  { term: "치킨윙", category: "스윙 오류" },
  { term: "플라잉 엘보", category: "스윙 오류" },
  { term: "오버더톱", category: "스윙 오류" },
  { term: "캐스팅", category: "스윙 오류" },
  { term: "셸로잉", category: "스윙 오류" },
  { term: "얼리 익스텐션", category: "스윙 오류" },
];

/** Whisper 프롬프트. 마지막 224토큰만 유효하므로 자주 틀리는 용어가 끝에 온다. */
export function buildPrompt(): string {
  return `골프 스윙 레슨 음성 해설입니다. 등장하는 용어: ${GOLF_TERMS.map((t) => t.term).join(", ")}.`;
}

// ---------- 기본 교정 사전 (인식 후 치환, 한도 없음) ----------
// [잘못 받아적힌 형태, 올바른 표기]
export const DEFAULT_CORRECTIONS: [string, string][] = [
  ["얼리익스텐션", "얼리 익스텐션"],
  ["얼리 익스텐숀", "얼리 익스텐션"],
  ["익스텐숀", "익스텐션"],
  ["오버 더 톱", "오버더톱"],
  ["오버 더 탑", "오버더톱"],
  ["오버더탑", "오버더톱"],
  ["샬로잉", "셸로잉"],
  ["셀로잉", "셸로잉"],
  ["쉘로잉", "셸로잉"],
  ["콕킹", "코킹"],
  ["텍백", "테이크백"],
  ["테익백", "테이크백"],
  ["테이크 백", "테이크백"],
  ["백 스윙", "백스윙"],
  ["다운 스윙", "다운스윙"],
  ["팔로우스루", "팔로스루"],
  ["팔로우 스루", "팔로스루"],
  ["팔로 스루", "팔로스루"],
  ["항잉백", "행잉백"],
  ["행잉 백", "행잉백"],
  ["치킨 윙", "치킨윙"],
  ["플라잉엘보", "플라잉 엘보"],
  ["플라잉 엘보우", "플라잉 엘보"],
  ["다운 블로", "다운블로"],
  ["다운블로우", "다운블로"],
  ["어퍼 블로", "어퍼블로"],
  ["어퍼블로우", "어퍼블로"],
  ["스매쉬 팩터", "스매시 팩터"],
  ["스매시팩터", "스매시 팩터"],
  ["라이 각", "라이각"],
  ["뒷땅", "뒤땅"],
  ["헤드 업", "헤드업"],
  ["스윙플레인", "스윙 플레인"],
  ["스윙 플랜", "스윙 플레인"],
  ["클럽패스", "클럽 패스"],
  ["페이스앵글", "페이스 앵글"],
  ["어택앵글", "어택 앵글"],
  ["어드레쓰", "어드레스"],
  ["임백트", "임팩트"],
  ["피니쉬", "피니시"],
  ["릴리즈", "릴리스"],
  ["하프 스윙", "하프스윙"],
  ["빈 스윙", "빈스윙"],
  ["체중이동", "체중 이동"],
  ["하체리드", "하체 리드"],
];

/** 긴 패턴부터 치환해서 부분 겹침 오작동을 막는다 */
export function applyCorrections(text: string, extra: [string, string][] = []): string {
  const rules = [...DEFAULT_CORRECTIONS, ...extra].sort((a, b) => b[0].length - a[0].length);
  let out = text;
  for (const [wrong, correct] of rules) {
    if (wrong && wrong !== correct) out = out.split(wrong).join(correct);
  }
  return out;
}

// ---------- WebVTT 변환 ----------
function ts(sec: number): string {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = (s % 60).toFixed(3).padStart(6, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${rest}`;
}

export function segmentsToVTT(segs: CaptionSeg[]): string {
  const body = segs
    .filter((s) => s.text.trim())
    .map((s, i) => `${i + 1}\n${ts(s.start)} --> ${ts(Math.max(s.end, s.start + 0.3))}\n${s.text.trim()}`)
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}
