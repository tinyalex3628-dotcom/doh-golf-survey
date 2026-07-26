"use client";

import { createBrowserClient } from "@supabase/ssr";

// 브라우저(휴대폰 화면)에서 쓰는 Supabase 연결
// 빌드(프리렌더) 단계에는 환경변수가 없을 수 있어, 그때만 자리표시자를
// 사용해 빌드가 멈추지 않게 한다. 실제 브라우저에서는 항상 진짜 값이 쓰인다.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, key);
}
