"use client";

// ============================================================
// 스윙분석 스튜디오 (PC) — 데이터 연결
// 오늘 들어온 신청을 대기열로 불러오고, 회원을 고르면 그 사람의
// 과거 회차·지난 피드백·숙제·질문을 함께 가져온다.
// 레슨을 저장하면 녹화본 업로드 → 피드백 저장 → 알림 발송까지 이어진다.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StudioWorkbench, { QueueItem, MemberContext } from "@/components/studio/StudioWorkbench";
import { LessonDraft, Drill, PrevHomework } from "@/components/studio/LessonComposer";
import "@/components/studio/studio.css";

const HOUR = 3600;

function hhmm(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function mmdd(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function StudioPage() {
  const supabase = createClient();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [member, setMember] = useState<MemberContext | null>(null);
  const [drills, setDrills] = useState<Drill[] | undefined>(undefined);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ---------- 대기열 ----------
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("id, receipt_no, status, created_at, user_id, request_files(id, kind)")
        .order("created_at", { ascending: true })
        .limit(60);
      if (error) { setError("대기열을 불러오지 못했습니다. 관리자 권한을 확인해주세요."); return; }

      const rows = (data ?? []) as any[];
      // 회원 표시 이름: 접수번호 뒤 4자리로 대체 (auth 사용자 이름은 클라이언트에서 못 읽음)
      const items: QueueItem[] = rows.map((r) => {
        const videos = (r.request_files ?? []).filter((f: any) => f.kind === "video").length;
        return {
          id: r.id,
          at: hhmm(r.created_at),
          name: r.receipt_no,
          roundNo: 0,
          videoCount: videos,
          status: r.status === "done" ? "done" : "received",
          note: `영상 ${videos}건`,
        };
      });
      setQueue(items);
      const firstOpen = items.find((i) => i.status !== "done");
      if (firstOpen) setCurrentId(firstOpen.id);
    })();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: ds } = await supabase
        .from("drills")
        .select("id, title, why")
        .eq("owner", data.user.id)
        .order("uses", { ascending: false });
      if (ds?.length) setDrills(ds as Drill[]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- 선택된 회원의 맥락 ----------
  const loadMember = useCallback(async (requestId: string) => {
    const { data: cur } = await supabase
      .from("requests")
      .select("id, receipt_no, user_id, created_at, request_files(kind, path)")
      .eq("id", requestId)
      .single();
    if (!cur) return;

    const sign = async (path: string) => {
      const { data } = await supabase.storage.from("uploads").createSignedUrl(path, HOUR);
      return data?.signedUrl ?? "";
    };

    const videos = await Promise.all(
      ((cur as any).request_files ?? [])
        .filter((f: any) => f.kind === "video")
        .map(async (f: any, i: number) => ({
          url: await sign(f.path),
          label: `오늘 ${mmdd((cur as any).created_at)} · 영상 ${i + 1}`,
        }))
    );

    // 같은 회원의 지난 회차들
    const { data: hist } = await supabase
      .from("requests")
      .select("id, created_at, request_files(kind, path), feedbacks(headline, diagnosis, homeworks, created_at)")
      .eq("user_id", (cur as any).user_id)
      .neq("id", requestId)
      .order("created_at", { ascending: false })
      .limit(8);

    const rows = (hist ?? []) as any[];
    const total = rows.length + 1;
    const past = await Promise.all(
      rows.map(async (r, i) => {
        const v = (r.request_files ?? []).find((f: any) => f.kind === "video");
        const fb = Array.isArray(r.feedbacks) ? r.feedbacks[0] : r.feedbacks;
        return {
          id: r.id,
          date: mmdd(r.created_at),
          roundNo: total - 1 - i,
          headline: fb?.headline || fb?.diagnosis || "",
          videoUrl: v ? await sign(v.path) : null,
          thumbUrl: null,
        };
      })
    );

    // 바로 직전 회차의 피드백 / 숙제 / 질문
    const prev = rows[0];
    const prevFb = prev ? (Array.isArray(prev.feedbacks) ? prev.feedbacks[0] : prev.feedbacks) : null;
    let prevHomeworks: PrevHomework[] = [];
    let questions: { at: string; body: string }[] = [];

    if (prevFb) {
      const hw = Array.isArray(prevFb.homeworks) ? prevFb.homeworks : [];
      const { data: fbRow } = await supabase
        .from("feedbacks")
        .select("id")
        .eq("request_id", prev.id)
        .maybeSingle();
      let checks: any[] = [];
      if (fbRow?.id) {
        const { data: ck } = await supabase
          .from("homework_checks")
          .select("homework_id, done, progress")
          .eq("feedback_id", fbRow.id);
        checks = ck ?? [];
        const { data: qs } = await supabase
          .from("questions")
          .select("body, created_at")
          .eq("feedback_id", fbRow.id)
          .is("answered_at", null)
          .order("created_at", { ascending: false });
        questions = (qs ?? []).map((q: any) => ({ at: mmdd(q.created_at), body: q.body }));
      }
      prevHomeworks = hw.map((h: any) => {
        const c = checks.find((x) => x.homework_id === h.id);
        const target = Number(h.target) || 1;
        return { title: h.title, done: c ? (c.done ? target : Number(c.progress) || 0) : 0, target };
      });
    }

    setMember({
      name: (cur as any).receipt_no,
      roundNo: total,
      totalRounds: total,
      since: rows.length ? mmdd(rows[rows.length - 1].created_at) : undefined,
      videos: videos.filter((v) => v.url),
      past: past.filter((p) => p.videoUrl || p.headline),
      prevComment: prevFb?.headline || prevFb?.diagnosis || undefined,
      prevCommentAt: prev ? mmdd(prev.created_at) : undefined,
      prevHomeworks,
      questions,
    });

    setQueue((q) => q.map((it) => (it.id === requestId ? { ...it, status: "working" } : it)));
  }, [supabase]);

  useEffect(() => { if (currentId) loadMember(currentId); }, [currentId, loadMember]);

  // ---------- 저장 & 발송 ----------
  const saveLesson = useCallback(
    async (
      draft: LessonDraft,
      mode: "draft" | "send",
      extras: { recording: Blob | null; shots: [string | null, string | null] }
    ) => {
      if (!currentId) throw new Error("no request");

      const { data: fb, error: fbErr } = await supabase
        .from("feedbacks")
        .upsert(
          {
            request_id: currentId,
            headline: draft.headline,
            prev_result: draft.prevResult,
            focus: draft.focus,
            tags: draft.tags,
            quote: draft.quote,
            next_preview: draft.nextPreview,
            next_upload_on: draft.nextUploadOn || null,
            round_no: member?.roundNo ?? null,
            homeworks: draft.homeworks.map((h, i) => ({ id: h.id || `hw${i}`, title: h.title, why: h.why, target: 1 })),
            diagnosis: draft.headline,
            body: draft.focus,
          },
          { onConflict: "request_id" }
        )
        .select("id, token")
        .single();
      if (fbErr || !fb) throw fbErr ?? new Error("save failed");

      // 녹화본 + 캡처 이미지 업로드
      const uploads: { kind: "video" | "photo"; path: string }[] = [];
      if (extras.recording) {
        const path = `${currentId}/lesson-${Date.now()}.webm`;
        const { error } = await supabase.storage.from("feedback").upload(path, extras.recording, {
          contentType: extras.recording.type || "video/webm",
          upsert: true,
        });
        if (!error) uploads.push({ kind: "video", path });
      }
      for (let i = 0; i < extras.shots.length; i++) {
        const shot = extras.shots[i];
        if (!shot) continue;
        const blob = await (await fetch(shot)).blob();
        const path = `${currentId}/compare-${i}-${Date.now()}.jpg`;
        const { error } = await supabase.storage.from("feedback").upload(path, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });
        if (!error) uploads.push({ kind: "photo", path });
      }
      if (uploads.length) {
        await supabase.from("feedback_files").insert(uploads.map((u) => ({ feedback_id: fb.id, ...u })));
      }

      if (mode === "send") {
        await supabase.from("requests").update({ status: "done" }).eq("id", currentId);
        setQueue((q) => q.map((it) => (it.id === currentId ? { ...it, status: "done" } : it)));
        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: currentId, token: (fb as any).token, diagnosis: draft.headline }),
          });
        } catch { /* 알림 실패해도 저장은 유지 */ }
        const next = queue.find((it) => it.status !== "done" && it.id !== currentId);
        if (next) setCurrentId(next.id);
      }
    },
    [currentId, member?.roundNo, queue, supabase]
  );

  return (
    <>
      {error && <div className="sx-toast" style={{ top: 14, bottom: "auto" }}>{error}</div>}
      <StudioWorkbench
        queue={queue}
        member={member}
        drills={drills}
        onPickMember={setCurrentId}
        onSaveLesson={saveLesson}
      />
    </>
  );
}
