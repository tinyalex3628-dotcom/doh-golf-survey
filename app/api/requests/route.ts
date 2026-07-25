import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeReceiptNo } from "@/lib/helpers";

// 신청서 저장 API
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await req.json();
  const concerns: string[] = Array.isArray(body.concerns) ? body.concerns : [];
  const note: string = typeof body.note === "string" ? body.note : "";
  const phone: string = typeof body.phone === "string" ? body.phone : "";
  const files: { kind: "video" | "photo"; path: string }[] = Array.isArray(body.files)
    ? body.files
    : [];

  if (files.filter((f) => f.kind === "video").length === 0) {
    return NextResponse.json({ error: "스윙 영상을 1개 이상 올려주세요." }, { status: 400 });
  }

  // 오늘 몇 번째 신청인지 세서 접수번호를 만듭니다 (SW-260725-014)
  const admin = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("requests")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());
  const receiptNo = makeReceiptNo((count ?? 0) + 1);

  const { data: request, error: reqErr } = await supabase
    .from("requests")
    .insert({ user_id: user.id, receipt_no: receiptNo, concerns, note, phone })
    .select()
    .single();
  if (reqErr) {
    return NextResponse.json({ error: reqErr.message }, { status: 500 });
  }

  const { error: fileErr } = await supabase.from("request_files").insert(
    files.map((f) => ({ request_id: request.id, kind: f.kind, path: f.path }))
  );
  if (fileErr) {
    return NextResponse.json({ error: fileErr.message }, { status: 500 });
  }

  return NextResponse.json({ receiptNo });
}
