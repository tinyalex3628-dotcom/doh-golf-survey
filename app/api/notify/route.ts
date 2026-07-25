import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAlimtalk, isAlimtalkConfigured } from "@/lib/notify";
import { expireDateLabel } from "@/lib/helpers";

// 카카오 알림톡 발송 API (관리자 전용)
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!adminRow) {
    return NextResponse.json({ error: "관리자만 쓸 수 있어요." }, { status: 403 });
  }

  const { requestId } = await req.json();

  const { data: request } = await supabase
    .from("requests")
    .select("*, feedbacks(*)")
    .eq("id", requestId)
    .single();
  const feedback = request?.feedbacks;
  if (!request || !feedback) {
    return NextResponse.json({ error: "피드백을 먼저 저장해주세요." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const link = `${origin}/f/${feedback.token}`;

  if (!isAlimtalkConfigured()) {
    return NextResponse.json({
      sent: false,
      link,
      detail:
        "알림톡 설정이 아직 없어요. 아래 링크를 복사해서 신청자에게 카톡으로 직접 보내주세요.",
    });
  }

  const result = await sendAlimtalk({
    phone: request.phone,
    receiptNo: request.receipt_no,
    diagnosis: feedback.diagnosis,
    link,
    expireDate: expireDateLabel(feedback.created_at),
  });

  return NextResponse.json({ sent: result.ok, link, detail: result.detail });
}
