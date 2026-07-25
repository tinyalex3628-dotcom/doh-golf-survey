import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ============================================================
// 관리자(프로님) 화면 — 들어온 신청 목록
// admins 테이블에 등록된 계정으로 로그인해야 목록이 보여요.
// ============================================================
export default async function AdminPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <main className="phone">
        <div style={{ padding: "80px 24px" }}>
          <h1 className="title">관리자 페이지</h1>
          <p className="subcopy">먼저 홈에서 카카오 로그인을 해주세요.</p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button className="btn-secondary">홈으로</button>
          </Link>
        </div>
      </main>
    );
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!adminRow) {
    return (
      <main className="phone">
        <div style={{ padding: "80px 24px" }}>
          <h1 className="title">접근 권한이 없어요.</h1>
          <p className="subcopy">
            이 계정은 관리자로 등록되어 있지 않아요.
            <br />
            (내 계정 ID: {userData.user.id})
            <br />
            <br />
            Supabase의 admins 테이블에 위 ID를 추가하면 관리자가 됩니다.
          </p>
        </div>
      </main>
    );
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("*, request_files(kind)")
    .order("created_at", { ascending: false });

  return (
    <main className="phone">
      <div style={{ padding: "24px 24px 40px", flex: 1, overflowY: "auto" }}>
        <h1 className="title" style={{ marginBottom: 20 }}>
          신청 목록
        </h1>
        {(requests ?? []).length === 0 && (
          <p className="subcopy">아직 들어온 신청이 없어요.</p>
        )}
        {(requests ?? []).map((r: any) => {
          const v = r.request_files.filter((f: any) => f.kind === "video").length;
          const p = r.request_files.filter((f: any) => f.kind === "photo").length;
          const d = new Date(r.created_at);
          return (
            <Link key={r.id} href={`/admin/${r.id}`} className="admin-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#191f28" }}>{r.receipt_no}</span>
                <span className={`badge ${r.status === "done" ? "done" : "received"}`}>
                  {r.status === "done" ? "피드백 완료" : "접수됨"}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7684" }}>
                영상 {v}개{p > 0 ? ` · 사진 ${p}장` : ""} ·{" "}
                {d.getMonth() + 1}/{d.getDate()} {d.getHours()}:{String(d.getMinutes()).padStart(2, "0")}
              </div>
              {r.concerns?.length > 0 && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8b95a1", marginTop: 4 }}>
                  고민: {r.concerns.join(", ")}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
