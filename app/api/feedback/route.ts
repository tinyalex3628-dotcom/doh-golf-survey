import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 프로(관리자)가 피드백을 저장하는 API
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // 관리자인지 확인
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!adminRow) {
    return NextResponse.json({ error: "관리자만 쓸 수 있어요." }, { status: 403 });
  }

  const body = await req.json();
  const requestId: string = body.requestId;
  const diagnosis: string = body.diagnosis ?? "";
  const feedbackBody: string = body.body ?? "";
  const chapters: { time: string; label: string }[] = Array.isArray(body.chapters)
    ? body.chapters
    : [];
  const files: { kind: "video" | "photo"; path: string }[] = Array.isArray(body.files)
    ? body.files
    : [];

  // 이미 피드백이 있으면 수정, 없으면 새로 만들기
  const { data: feedback, error: fbErr } = await supabase
    .from("feedbacks")
    .upsert(
      { request_id: requestId, diagnosis, body: feedbackBody, chapters },
      { onConflict: "request_id" }
    )
    .select()
    .single();
  if (fbErr) {
    return NextResponse.json({ error: fbErr.message }, { status: 500 });
  }

  if (files.length > 0) {
    const { error: fileErr } = await supabase.from("feedback_files").insert(
      files.map((f) => ({ feedback_id: feedback.id, kind: f.kind, path: f.path }))
    );
    if (fileErr) {
      return NextResponse.json({ error: fileErr.message }, { status: 500 });
    }
  }

  // 신청 상태를 "피드백 완료"로 변경
  await supabase.from("requests").update({ status: "done" }).eq("id", requestId);

  return NextResponse.json({ token: feedback.token });
}
