import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버에서 로그인한 사용자를 확인할 때 쓰는 연결
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 호출되면 쿠키를 못 쓰는데, 무시해도 괜찮아요.
          }
        },
      },
    }
  );
}
