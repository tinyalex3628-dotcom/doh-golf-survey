import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 서비스 키(관리자 열쇠)로 접속하는 연결.
// 보안 규칙을 통과할 수 있어서, 토큰 링크로 피드백을 보여줄 때만 서버에서 사용합니다.
// 이 키는 절대 브라우저로 내보내면 안 돼요!
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
