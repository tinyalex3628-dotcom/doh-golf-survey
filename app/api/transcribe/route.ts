import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt, applyCorrections } from "@/lib/subtitle/glossary";

export const runtime = "nodejs";
export const maxDuration = 120;

// ============================================================
// 녹화 음성 → 자막 (Whisper)
// 골프 용어 힌트를 프롬프트로 넣고, 결과 텍스트에 교정 사전을 적용한다.
// 관리자(프로) 계정만 호출할 수 있다 — API 비용 보호.
// ============================================================
export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY 가 설정되지 않았습니다. Vercel 환경변수에 추가해주세요." },
      { status: 503 }
    );
  }

  // 관리자 확인
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "관리자만 사용할 수 있습니다." }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "오디오 파일이 없습니다." }, { status: 400 });
  }
  if (file.size > 80 * 1024 * 1024) {
    return NextResponse.json({ error: "파일이 너무 큽니다 (80MB 제한)." }, { status: 413 });
  }
  let extra: [string, string][] = [];
  try {
    const raw = form.get("corrections");
    if (typeof raw === "string") extra = JSON.parse(raw);
  } catch { /* 교정 사전이 깨져 있으면 기본만 사용 */ }

  const out = new FormData();
  out.append("file", file, "lesson.webm");
  out.append("model", "whisper-1");
  out.append("language", "ko");
  out.append("response_format", "verbose_json");
  out.append("temperature", "0");
  out.append("prompt", buildPrompt());

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: out,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `음성 인식에 실패했습니다 (${res.status}).`, detail: detail.slice(0, 300) },
      { status: 502 }
    );
  }

  const data = await res.json();
  const segments = (Array.isArray(data.segments) ? data.segments : [])
    .map((s: any) => ({
      start: Math.max(0, Number(s.start) || 0),
      end: Math.max(0, Number(s.end) || 0),
      text: applyCorrections(String(s.text ?? "").trim(), extra),
    }))
    .filter((s: any) => s.text);

  return NextResponse.json({ segments });
}
