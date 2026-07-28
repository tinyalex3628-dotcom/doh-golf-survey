"use client";

// ============================================================
// 스튜디오 데모 — Supabase 없이 화면과 동작을 확인하는 용도.
// 가짜 대기열/회원 기록을 넣어 두었고, 영상은 직접 열어서 씁니다.
// 실제 운영 화면은 /studio 입니다.
// ============================================================

import StudioWorkbench from "@/components/studio/StudioWorkbench";
import "@/components/studio/studio.css";

const QUEUE = [
  { id: "q1", at: "08:40", name: "이수연", roundNo: 12, videoCount: 2, status: "done" as const, note: "아이언 정면 2건 · 발송 21:04" },
  { id: "q2", at: "09:05", name: "최영호", roundNo: 3, videoCount: 1, status: "done" as const, note: "드라이버 후면 1건" },
  { id: "q3", at: "09:22", name: "정하늘", roundNo: 8, videoCount: 3, status: "done" as const, note: "웨지 3건" },
  { id: "q4", at: "10:14", name: "김민수", roundNo: 6, videoCount: 2, status: "working" as const, note: "드라이버 정면 2건" },
  { id: "q5", at: "11:02", name: "박지훈", roundNo: 9, videoCount: 2, status: "received" as const },
  { id: "q6", at: "13:30", name: "강태우", roundNo: 2, videoCount: 1, status: "received" as const },
  { id: "q7", at: "15:47", name: "윤서진", roundNo: 5, videoCount: 2, status: "received" as const, note: "첫 접수" },
  { id: "q8", at: "18:20", name: "오세훈", roundNo: 11, videoCount: 3, status: "received" as const },
];

const MEMBER = {
  name: "김민수",
  roundNo: 6,
  totalRounds: 12,
  since: "01.18",
  videos: [],
  past: [
    { id: "p1", date: "06.29", roundNo: 5, headline: "하체가 자리 잡으니 왼팔이 길어졌어요", videoUrl: null },
    { id: "p2", date: "05.31", roundNo: 4, headline: "톱에서 오른팔 각도가 무너집니다", videoUrl: null },
    { id: "p3", date: "04.27", roundNo: 3, headline: "임팩트 직후 머리가 먼저 열립니다", videoUrl: null },
    { id: "p4", date: "03.30", roundNo: 2, headline: "셋업에서 체중이 오른발에 치우침", videoUrl: null },
  ],
  prevComment:
    "톱에서 오른팔 각도만 지켜주면 방향은 저절로 잡힙니다. 급하게 내리지 말고 하체부터 여세요.",
  prevCommentAt: "06.29",
  prevHomeworks: [
    { title: "톱에서 3초 멈추기 15회", done: 11, target: 15 },
    { title: "거울 앞 톱 자세 사진 찍기", done: 3, target: 3 },
  ],
  questions: [
    { at: "07.27", body: "드라이버만 잡으면 자꾸 오른쪽으로 밀려요. 셋업이 문제일까요? 아이언은 괜찮습니다." },
  ],
};

const REFS = [
  { id: "r1", name: "교습용 기본형", club: "드라이버", view: "정면", handed: "right" as const, note: "템포 3:1", videoUrl: null },
  { id: "r2", name: "교습용 기본형", club: "드라이버", view: "후면", handed: "right" as const, note: "플레인 참고", videoUrl: null },
  { id: "r3", name: "하체 리드 시범", club: "아이언", view: "정면", handed: "right" as const, videoUrl: null },
  { id: "r4", name: "왼손 시범 스윙", club: "아이언", view: "정면", handed: "left" as const, note: "좌우 자동 반전", videoUrl: null },
  { id: "r5", name: "피니시 균형 시범", club: "웨지", view: "정면", handed: "right" as const, videoUrl: null },
];

export default function StudioDemoPage() {
  return (
    <StudioWorkbench
      queue={QUEUE}
      member={MEMBER}
      refSwings={REFS}
      onPickMember={() => {}}
      onSaveLesson={async (draft, mode) => {
        // 데모에서는 저장하지 않고 콘솔로만 확인합니다
        // eslint-disable-next-line no-console
        console.log("[demo] save", mode, draft);
        await new Promise((r) => setTimeout(r, 400));
      }}
    />
  );
}
