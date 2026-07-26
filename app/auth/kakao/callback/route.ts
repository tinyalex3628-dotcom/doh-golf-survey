import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 카카오 동의 화면에서 돌아오면 여기로 옵니다.
// 카카오 회원번호로 Supabase 계정을 만들거나 찾아서 로그인시킵니다.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 시작 때와 똑같은 고정 주소를 써야 카카오가 승인해줍니다.
  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (!code) {
    return NextResponse.redirect(`${base}/request?login_error=no_code`);
  }

  try {
    // 1) 카카오에서 받은 code를 access token으로 교환
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_API_KEY!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        redirect_uri: `${base}/auth/kakao/callback`,
        code,
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      return NextResponse.redirect(`${base}/request?login_error=token`);
    }

    // 2) 카카오 사용자 정보 조회 (회원번호 + 닉네임)
    const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const me = await meRes.json();
    if (!me.id) {
      return NextResponse.redirect(`${base}/request?login_error=profile`);
    }

    const kakaoId = String(me.id);
    const nickname = me.kakao_account?.profile?.nickname ?? "";
    // 카카오는 이메일을 안 주므로, 회원번호로 내부용 식별 주소를 만듭니다.
    const email = `kakao_${kakaoId}@users.nextswing.app`;

    // 3) Supabase 계정 만들기 (이미 있으면 그냥 넘어감)
    const admin = createAdminClient();
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { provider: "kakao", kakao_id: kakaoId, nickname },
    });

    // 4) 로그인용 일회성 토큰 발급
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      return NextResponse.redirect(`${base}/request?login_error=link`);
    }

    // 5) 그 토큰으로 실제 로그인 (쿠키에 세션 저장)
    const supabase = createClient();
    const { error: otpErr } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
    if (otpErr) {
      return NextResponse.redirect(`${base}/request?login_error=session`);
    }

    return NextResponse.redirect(`${base}/request`);
  } catch {
    return NextResponse.redirect(`${base}/request?login_error=unknown`);
  }
}
