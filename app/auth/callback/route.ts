import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 카카오 로그인이 끝나면 카카오가 이 주소로 돌려보내줍니다.
// 여기서 로그인 정보를 쿠키에 저장하고 홈으로 이동시켜요.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?login_error=1`);
}
