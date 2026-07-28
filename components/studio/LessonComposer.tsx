"use client";

// ============================================================
// 레슨 작성 — 녹화를 마친 뒤 여는 전용 전체 화면.
// 분석 도구를 전부 걷어내고 글쓰기에만 집중한다.
// 왼쪽에서 쓰면 오른쪽 회원 화면 미리보기가 바로 따라온다.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { CaptionSeg } from "@/lib/subtitle/glossary";
import CaptionEditor from "./CaptionEditor";

export type Homework = { id: string; title: string; why: string };
export type Drill = { id: string; title: string; why: string };

export type LessonDraft = {
  headline: string;
  prevResult: string;
  focus: string;
  tags: string[];
  homeworks: Homework[];
  quote: string;
  nextPreview: string;
  nextUploadOn: string;
  captions: [string, string];        // 비교 이미지 캡션
  subtitles: CaptionSeg[];           // 레슨 영상 자막
};

export type PrevHomework = { title: string; done: number; target: number };

const DEFAULT_DRILLS: Drill[] = [
  { id: "d1", title: "톱에서 3초 멈추기 15회", why: "왼팔이 접히는 순간을 몸이 알아채게 만드는 연습이에요" },
  { id: "d2", title: "거울 앞 톱 자세 사진 찍기", why: "다음 달 비교 자료가 돼요. 각도가 같아야 변화가 보입니다" },
  { id: "d3", title: "하프스윙 30회", why: "큰 동작을 줄여서 궤도만 먼저 몸에 넣습니다" },
  { id: "d4", title: "임팩트백 20회", why: "맞는 순간의 손 위치를 손목이 기억하게 합니다" },
  { id: "d5", title: "눈 감고 빈스윙 20회", why: "시선 대신 축 감각으로 스윙을 마무리합니다" },
];

function plusMonth(weeks = 4): string {
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateLabel(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${w})`;
}

export default function LessonComposer({
  memberName,
  roundNo,
  recSec,
  recUrl,
  prevHomeworks,
  drills = DEFAULT_DRILLS,
  captureShots,
  saving,
  transcribing,
  onCapture,
  onTranscribe,
  onAddCorrection,
  onBack,
  onSave,
}: {
  memberName: string;
  roundNo: number;
  recSec: number;
  recUrl: string | null;
  prevHomeworks: PrevHomework[];
  drills?: Drill[];
  captureShots: [string | null, string | null];
  saving?: boolean;
  transcribing?: boolean;
  onCapture?: (which: 0 | 1) => void;
  onTranscribe?: () => Promise<CaptionSeg[] | null>;
  onAddCorrection?: (wrong: string, correct: string) => void;
  onBack: () => void;
  onSave: (draft: LessonDraft, mode: "draft" | "send") => void;
}) {
  const [d, setD] = useState<LessonDraft>({
    headline: "",
    prevResult: "",
    focus: "",
    tags: [],
    homeworks: [],
    quote: "",
    nextPreview: "",
    nextUploadOn: plusMonth(),
    captions: ["", ""],
    subtitles: [],
  });
  const [tagInput, setTagInput] = useState("");

  async function runTranscribe() {
    const segs = await onTranscribe?.();
    if (segs) setD((p) => ({ ...p, subtitles: segs }));
  }

  const set = <K extends keyof LessonDraft>(k: K, v: LessonDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  // 다음 회차 예고는 이번 숙제에서 초안을 만들어 둔다 (프로는 손보기만)
  useEffect(() => {
    if (d.nextPreview.trim()) return;
    if (d.homeworks.length === 0) return;
    const first = d.homeworks[0].title;
    set(
      "nextPreview",
      `한 달 만에 다 잡히는 건 아니에요. ${first}를 꾸준히 하시면 다음 달엔 그다음 단계까지 같이 볼 수 있습니다.`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.homeworks.length]);

  const required = useMemo(
    () => [d.headline.trim(), d.prevResult.trim() || (prevHomeworks.length === 0 ? "-" : ""), d.focus.trim(), d.tags.length ? "y" : "", d.homeworks.length ? "y" : ""],
    [d, prevHomeworks.length]
  );
  const filled = required.filter(Boolean).length;
  const canSend = d.headline.trim() && d.focus.trim() && d.homeworks.length > 0;

  function addDrill(dr: Drill) {
    if (d.homeworks.length >= 3) return;
    if (d.homeworks.some((h) => h.title === dr.title)) return;
    set("homeworks", [...d.homeworks, { id: `${dr.id}-${d.homeworks.length}`, title: dr.title, why: dr.why }]);
  }
  function addCustom() {
    const t = window.prompt("숙제 내용 (예: 톱에서 3초 멈추기 15회)");
    if (!t?.trim()) return;
    const w = window.prompt("이 숙제를 하는 이유 — 회원에게 그대로 보입니다") || "";
    set("homeworks", [...d.homeworks, { id: `c${Date.now()}`, title: t.trim(), why: w.trim() }]);
  }
  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (!t || d.tags.includes(t) || d.tags.length >= 4) return;
    set("tags", [...d.tags, t]);
    setTagInput("");
  }

  const recLabel = `${String(Math.floor(recSec / 60)).padStart(2, "0")}:${String(recSec % 60).padStart(2, "0")}`;

  return (
    <div className="lc">
      {/* ===== 상단 ===== */}
      <header className="lc-top">
        <button className="lc-back" onClick={onBack}>← 분석 화면으로</button>
        <div className="lc-who">
          <b>{memberName}</b>
          <span className="dim">No.{String(roundNo).padStart(2, "0")} · {roundNo}회차</span>
        </div>
        {recUrl ? (
          <span className="lc-rec-ok">● 녹화 완료 {recLabel}</span>
        ) : (
          <span className="lc-rec-none">녹화본 없음 — 글만 발송됩니다</span>
        )}
        <div className="lc-spacer" />
        <span className="lc-step">분석 · 녹화 · <b>레슨 작성</b> · 발송</span>
      </header>

      <div className="lc-body">
        {/* ===== 왼쪽: 본문 ===== */}
        <section className="lc-col lc-col-main">
          <div className="lc-colhead">
            <h2>레슨 카드 작성</h2>
            <span className="dim">여기 쓴 글이 회원 페이지에 그대로 실립니다</span>
          </div>

          <label className="lc-f">
            <span className="lc-lab">헤드라인 <em>회원이 가장 먼저 읽는 한 줄</em>
              <b className="lc-count">{d.headline.length} / 40</b></span>
            <input
              className="lc-input lc-headline"
              maxLength={40}
              placeholder="예) 하체가 버텨주니, 왼팔이 길어졌습니다"
              value={d.headline}
              onChange={(e) => set("headline", e.target.value)}
            />
          </label>

          <div className="lc-f">
            <span className="lc-lab">지난달 결과 <em>지난 회차 숙제가 자동으로 불러와집니다</em></span>
            {prevHomeworks.length > 0 ? (
              <div className="lc-prev">
                {prevHomeworks.map((h, i) => (
                  <div className="lc-prev-row" key={i}>
                    <span className="lc-auto">자동</span>
                    <span className="lc-prev-t">{h.title}</span>
                    <span className="lc-prev-n">{h.done} / {h.target} 이행</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lc-prev empty">첫 회차라 지난 숙제가 없습니다. 이 블록은 회원 페이지에 나오지 않습니다.</div>
            )}
            <textarea
              className="lc-area"
              rows={3}
              placeholder="예) 톱에서 3초 멈추기, 15회 중 12회를 해내셨습니다. 영상에서도 톱 지점이 확실히 자리를 잡았어요."
              value={d.prevResult}
              onChange={(e) => set("prevResult", e.target.value)}
              disabled={prevHomeworks.length === 0}
            />
          </div>

          <label className="lc-f lc-f-grow">
            <span className="lc-lab">이번 달 고칠 것 <em>한 달 동안 딱 하나만</em>
              <b className="lc-count">{d.focus.length}자</b></span>
            <textarea
              className="lc-area lc-area-grow"
              placeholder={"이번 영상에서 가장 눈에 띈 것과, 그게 왜 문제인지, 그래서 한 달 동안 뭘 할지를 적으세요.\n길게 써도 됩니다 — 회원 페이지 본문으로 그대로 들어갑니다."}
              value={d.focus}
              onChange={(e) => set("focus", e.target.value)}
            />
            <span className="lc-hint">3~5문장 권장 · 회원 페이지 본문으로 표시</span>
          </label>

          <label className="lc-f">
            <span className="lc-lab">인용구 <em className="opt">선택</em> <em>비워두면 회원 페이지에 표시되지 않습니다</em></span>
            <input
              className="lc-input"
              placeholder="한 달 뒤에도 기억에 남을 문장이 있다면 적어주세요"
              value={d.quote}
              onChange={(e) => set("quote", e.target.value)}
            />
          </label>
        </section>

        {/* ===== 가운데: 구성 요소 ===== */}
        <section className="lc-col lc-col-side">
          <div className="lc-colhead">
            <h2>구성 요소</h2>
            <span className="dim">태그 · 숙제 · 이미지 · 예고</span>
          </div>

          <div className="lc-f">
            <span className="lc-lab">태그 <em>회차 비교와 검색에 쓰입니다</em></span>
            <div className="lc-chips">
              {d.tags.map((t) => (
                <span className="lc-chip on" key={t}>
                  #{t}
                  <button onClick={() => set("tags", d.tags.filter((x) => x !== t))}>×</button>
                </span>
              ))}
              {d.tags.length < 4 && (
                <span className="lc-chip-add">
                  <input
                    value={tagInput}
                    placeholder="+ 추가"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    onBlur={addTag}
                  />
                </span>
              )}
            </div>
          </div>

          <div className="lc-f">
            <span className="lc-lab">숙제 <em>프리셋을 누르면 아래에 쌓입니다</em>
              <b className="lc-count">{d.homeworks.length} / 3</b></span>
            <div className="lc-chips">
              {drills.map((dr) => (
                <button
                  key={dr.id}
                  className="lc-chip"
                  disabled={d.homeworks.length >= 3 || d.homeworks.some((h) => h.title === dr.title)}
                  onClick={() => addDrill(dr)}
                  title={dr.why}
                >
                  {dr.title}
                </button>
              ))}
              <button className="lc-chip dashed" onClick={addCustom} disabled={d.homeworks.length >= 3}>
                + 직접 추가
              </button>
            </div>
            <div className="lc-hw">
              {d.homeworks.map((h, i) => (
                <div className="lc-hw-card" key={h.id}>
                  <span className="lc-hw-no">{i + 1}</span>
                  <div className="lc-hw-body">
                    <div className="lc-hw-t">{h.title}</div>
                    <div className="lc-hw-w"><em>WHY</em> {h.why || "이유를 적으면 회원이 훨씬 잘 합니다"}</div>
                  </div>
                  <button
                    className="lc-hw-x"
                    onClick={() => set("homeworks", d.homeworks.filter((x) => x.id !== h.id))}
                  >×</button>
                </div>
              ))}
              {d.homeworks.length === 0 && <div className="lc-empty">숙제를 하나 이상 넣어야 발송할 수 있습니다</div>}
            </div>
          </div>

          <div className="lc-f">
            <span className="lc-lab">비교 이미지 <em>분석 화면에서 캡처한 프레임</em>
              <b className="lc-count">{captureShots.filter(Boolean).length} / 2</b></span>
            <div className="lc-caps">
              {[0, 1].map((k) => (
                <div className="lc-cap" key={k}>
                  <button className="lc-cap-btn" onClick={() => onCapture?.(k as 0 | 1)}>
                    {k === 0 ? "지난 프레임 캡처" : "이번 프레임 캡처"}
                  </button>
                  <div className="lc-cap-img">
                    {captureShots[k] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={captureShots[k] as string} alt={k === 0 ? "지난 프레임" : "이번 프레임"} />
                    ) : (
                      <span className="dim">비어 있음</span>
                    )}
                  </div>
                  <input
                    className="lc-input sm"
                    placeholder="캡션을 적어주세요"
                    value={d.captions[k]}
                    onChange={(e) => {
                      const c = [...d.captions] as [string, string];
                      c[k] = e.target.value;
                      set("captions", c);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lc-f">
            <CaptionEditor
              segments={d.subtitles}
              transcribing={transcribing}
              canTranscribe={!!recUrl && !!onTranscribe}
              onTranscribe={runTranscribe}
              onChange={(segs) => set("subtitles", segs)}
              onAddCorrection={onAddCorrection}
            />
          </div>

          <div className="lc-f">
            <span className="lc-lab">다음 회차 예고 <em>고쳐 써도 됩니다</em>
              {d.nextPreview && <b className="lc-auto-tag">자동 초안</b>}</span>
            <textarea
              className="lc-area"
              rows={3}
              placeholder="숙제를 하나 넣으면 초안이 자동으로 채워집니다"
              value={d.nextPreview}
              onChange={(e) => set("nextPreview", e.target.value)}
            />
            <div className="lc-next-date">
              <span className="dim">다음 업로드 예정일</span>
              <input
                type="date"
                className="lc-input sm"
                value={d.nextUploadOn}
                onChange={(e) => set("nextUploadOn", e.target.value)}
              />
              <span className="dim">4주 뒤 · 자동 계산</span>
            </div>
          </div>
        </section>

        {/* ===== 오른쪽: 회원 화면 미리보기 ===== */}
        <section className="lc-col lc-col-prev">
          <div className="lc-colhead">
            <h2>회원 페이지 미리보기</h2>
            <span className="lc-live">● 실시간</span>
          </div>
          <div className="lc-phone">
            <div className="lc-phone-in">
              <div className="lc-p-top">
                <span>SWING STUDIO</span>
                <span className="dim">No.{String(roundNo).padStart(2, "0")}</span>
              </div>
              <div className="lc-p-date">{dateLabel(new Date().toISOString())} · {roundNo}회차 레슨</div>
              <h3 className="lc-p-head">{d.headline || "헤드라인이 여기에 표시됩니다"}</h3>
              <div className="lc-p-by">{memberName} 님 · 담당 프로</div>

              {prevHomeworks.length > 0 && d.prevResult && (
                <div className="lc-p-block">
                  <span className="lc-p-tag">지난달 이어서</span>
                  <p>{d.prevResult}</p>
                </div>
              )}
              {d.focus && (
                <div className="lc-p-block">
                  <span className="lc-p-tag">이번 달 고칠 것</span>
                  <p>{d.focus}</p>
                </div>
              )}

              <div className="lc-p-video">
                <span className="lc-p-play">▶</span>
                <span className="lc-p-vlabel">
                  레슨 영상 · 음성 해설{d.subtitles.length > 0 && <em className="lc-p-cc"> CC 자막</em>}
                </span>
                <span className="lc-p-vtime">{recUrl ? recLabel : "--:--"}</span>
              </div>

              {d.quote && <div className="lc-p-quote">“{d.quote}”</div>}

              {captureShots.some(Boolean) && (
                <div className="lc-p-compare">
                  {[0, 1].map((k) => (
                    <div key={k}>
                      <div className="lc-p-cimg">
                        {captureShots[k] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={captureShots[k] as string} alt="" />
                        )}
                      </div>
                      <span>{d.captions[k]}</span>
                    </div>
                  ))}
                </div>
              )}

              {d.homeworks.length > 0 && (
                <div className="lc-p-hw">
                  <div className="lc-p-hw-h">이번 달 숙제 <span className="dim">0 / {d.homeworks.length}</span></div>
                  {d.homeworks.map((h) => (
                    <div className="lc-p-hw-row" key={h.id}>
                      <span className="lc-p-box" />
                      <div>
                        <div className="lc-p-hw-t">{h.title}</div>
                        {h.why && <div className="lc-p-hw-w">{h.why}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {d.nextPreview && (
                <div className="lc-p-next">
                  <span className="lc-p-tag">다음 회차</span>
                  <p>{d.nextPreview}</p>
                  <span className="dim">{dateLabel(d.nextUploadOn)}쯤 스윙 올려주세요</span>
                </div>
              )}
            </div>
          </div>
          <p className="lc-prev-note">작성하는 즉시 반영됩니다 · 발송 전까지 회원에게 보이지 않습니다</p>
        </section>
      </div>

      {/* ===== 하단 액션 ===== */}
      <footer className="lc-foot">
        <div className="lc-foot-info">
          <b>{memberName} · {roundNo}회차 레슨 카드</b>
          <span className="dim">
            {recUrl ? `영상 ${recLabel}` : "영상 없음"}
            {d.subtitles.length > 0 ? ` · 자막 ${d.subtitles.length}구간` : ""} · 캡처 {captureShots.filter(Boolean).length}장 ·
            숙제 {d.homeworks.length}건 · 필수 {filled} / 5 작성
          </span>
        </div>
        <button className="lc-btn ghost" onClick={() => onSave(d, "draft")} disabled={saving}>
          임시저장
        </button>
        <button className="lc-btn primary" onClick={() => onSave(d, "send")} disabled={!canSend || saving}>
          {saving ? "발송 중…" : "저장하고 발송"}
        </button>
        <span className="lc-foot-hint">영상 업로드 · 회원 페이지 생성 · 카카오톡 발송까지 한 번에</span>
      </footer>
    </div>
  );
}
