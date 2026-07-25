import { NextResponse } from "next/server";

// 카카오 로그인 시작: 카카오 동의 화면으로 보냅니다.
// Supabase 기본 카카오 로그인은 이메일(account_email)을 강제로 요청해서
// 동의항목이 없는 앱에서 KOE205 오류가 납니다. 그래서 직접 호출합니다.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  // Vercel은 배포마다 임시 주소를 만드는데, 카카오에는 고정 주소만 등록돼 있습니다.
  // 그래서 항상 고정 주소를 사용합니다.
  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const redirectUri = `${base}/auth/kakao/callback`;

  const params = new URLSearchParams({
    client_id: process.env.KAKAO_REST_API_KEY!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "profile_nickname",
  });

  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  );
}
